import React, { useEffect, useState } from 'react';
import './DailythoughtsReader.css';
import { useNavigate } from 'react-router-dom';

const DailythoughtsReader = () => {
  const [thoughts, setThoughts] = useState([]);
  const [activeAuthor, setActiveAuthor] = useState(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
  const [loading, setLoading] = useState(true);
  const [likingId, setLikingId] = useState(null);
  const [popupThoughtId, setPopupThoughtId] = useState(null); // Stores the ID of the thought for which the "already liked" popup should be shown
  const navigate = useNavigate();

  const API_BASE = import.meta.env.VITE_API_BASE_URL || '';

  useEffect(() => {
    const fetchThoughtsAndLikes = async () => {
      try {
        const [thoughtsRes, likesRes] = await Promise.all([
          fetch(`${API_BASE}/api/thoughts/approved`),
          fetch(`${API_BASE}/api/thoughts/likes`)
        ]);

        const approvedThoughts = await thoughtsRes.json();
        const likesData = await likesRes.json();

        const storedLikes = JSON.parse(localStorage.getItem('likedThoughts') || '[]');

        const enrichedThoughts = approvedThoughts.map(thought => {
          const likeObj = likesData.find(like => like.id === thought.id);
          return {
            ...thought,
            likes: likeObj ? likeObj.count : 0,
            liked: storedLikes.includes(thought.id)
          };
        });

        setThoughts(enrichedThoughts);
        setLoading(false);
      } catch (error) {
        console.error("❌ Error fetching thoughts and likes:", error);
        setLoading(false);
      }
    };

    fetchThoughtsAndLikes();

    const handleClickOutside = () => setActiveAuthor(null);
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const toggleLike = async (id) => {
    if (!id || likingId === id) return;

    const likedArray = JSON.parse(localStorage.getItem('likedThoughts') || '[]');
    if (likedArray.includes(id)) {
      // Show popup for this specific thought ID
      setPopupThoughtId(id);
      // Hide the popup after 5 seconds (MODIFIED DURATION)
      setTimeout(() => setPopupThoughtId(null), 5000);
      return;
    }

    setLikingId(id);

    try {
      const res = await fetch(`${API_BASE}/api/thoughts/like/${id}`, {
        method: 'POST'
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || '❌ Failed to like');

      likedArray.push(id);
      localStorage.setItem('likedThoughts', JSON.stringify(likedArray));

      setThoughts(prev =>
        prev.map(thought =>
          thought.id === id
            ? { ...thought, likes: data.count, liked: true }
            : thought
        )
      );
    } catch (error) {
      console.error('❌ Failed to toggle like:', error);
    } finally {
      setTimeout(() => setLikingId(null), 800);
    }
  };

  const groupByDate = () => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    const map = {};
    const sortedThoughts = [...thoughts].sort((a, b) => new Date(b.date) - new Date(a.date));

    sortedThoughts.forEach(thought => {
      const thoughtDate = new Date(thought.date);
      let label;

      if (thoughtDate.toDateString() === today.toDateString()) {
        label = 'Today';
      } else if (thoughtDate.toDateString() === yesterday.toDateString()) {
        label = 'Yesterday';
      } else {
        label = thoughtDate.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });
      }

      if (!map[label]) map[label] = [];
      map[label].push(thought);
    });

    return map;
  };

  const getFontSizeClass = (text) => {
    if (typeof text !== 'string') return 'font-small';
    const wordCount = text.trim().split(/\s+/).length;
    if (wordCount < 15) return 'font-large';
    if (wordCount < 60) return 'font-medium';
    return 'font-small';
  };

  const handleAuthorClick = (e, author) => {
    e.stopPropagation();
    const rect = e.target.getBoundingClientRect();
    const popupHeight = 80;
    const popupWidth = 220;

    let x = rect.left + rect.width / 2 - popupWidth / 2;
    x = Math.max(10, x);
    x = Math.min(x, window.innerWidth - popupWidth - 10);
    const y = rect.top + window.scrollY - popupHeight - 10;

    setTooltipPos({ x, y });
    setActiveAuthor(author);
  };

  return (
    <div className="daily-thoughts-wrapper">
      <div className="thoughts-scroll-area">
        <div className="thoughts-column">
          <div className="timeline-container">
            {loading ? (
              <p className="loading-message">Loading thoughts...</p>
            ) : (
              Object.entries(groupByDate()).map(([label, group]) => (
                <div key={label} className="timeline-label-group">
                  <h2 className="timeline-label">{label}</h2>
                  {group.map(thought => (
                    <div className="timeline-item" key={thought.id}>
                      <div className="timeline-dot"></div>
                      <div className="timeline-content">
                        <div className="thought-meta-wrapper">
                          <button
                            className="thought-meta-link"
                            onClick={(e) => handleAuthorClick(e, {
                              name: thought.name,
                              email: thought.email
                            })}
                          >
                            {thought.name}
                          </button>
                          <span className="thought-meta-date">
                            {label === 'Today' || label === 'Yesterday'
                              ? new Date(thought.date).toLocaleDateString('en-US', { weekday: 'long' })
                              : new Date(thought.date).toLocaleDateString('en-US', {
                                  month: 'short',
                                  day: 'numeric',
                                  year: 'numeric'
                                })}
                          </span>
                        </div>
                        <p className={`thought-text ${getFontSizeClass(thought.content || thought.text)}`}>
                          {(thought.content || thought.text || '').trim() || '[No thought text]'}
                        </p>
                        <div className="thought-attribution-like">
                          <span className="thought-attribution">{thought.attribution || ''}</span>
                          <div className="like-container">
                            <button
                              className={`like-button ${thought.liked ? 'liked' : ''}`}
                              onClick={() => toggleLike(thought.id)}
                              disabled={likingId === thought.id}
                            >
                              <svg
                                className="heart-icon"
                                viewBox="0 0 24 24"
                                fill={thought.liked ? 'crimson' : 'none'}
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              >
                                <path d="M20.8 4.6c-1.8-1.8-4.7-1.8-6.5 0l-.8.8-.8-.8c-1.8-1.8-4.7-1.8-6.5 0s-1.8 4.7 0 6.5l7.3 7.3 7.3-7.3c1.8-1.8 1.8-4.7 0-6.5z" />
                              </svg>
                            </button>
                            <span className="like-count">{thought.likes}</span>
                            {/* Render the popup message only if this thought's ID matches popupThoughtId */}
                            {popupThoughtId === thought.id && (
                              <div className="like-popup-message">
                                You can't love some-thing/one more than once and forget about trying to unlove them
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ))
            )}
          </div>
        </div>

        <div className="submission-panel blur-panel">
          <p className="submission-invite">
            If you have something relevant in your mind, it can be posted here in the daily thoughts section.
          </p>
          <button className="submit-button" onClick={() => navigate('/dailythoughts/submit')}>
            LET'S GO
          </button>
        </div>
      </div>

      {activeAuthor && (
        <div
          className="author-popup"
          style={{ top: tooltipPos.y, left: tooltipPos.x }}
          onClick={(e) => e.stopPropagation()}
        >
          <strong className="author-name">{activeAuthor.name}</strong>
          <p className="author-contact">{activeAuthor.email}</p>
        </div>
      )}
    </div>
  );
};

export default DailythoughtsReader;