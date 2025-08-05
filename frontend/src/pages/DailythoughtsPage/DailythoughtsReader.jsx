import React, { useEffect, useState } from 'react';
import './DailythoughtsReader.css';
import { useNavigate } from 'react-router-dom';

const DailythoughtsReader = () => {
  const [thoughts, setThoughts]   = useState([]);
  const [activeAuthor, setActive] = useState(null);
  const [tooltipPos, setPos]      = useState({ x: 0, y: 0 });
  const [loading, setLoading]     = useState(true);
  const [likingId, setLikingId]   = useState(null);
  const [popupId, setPopupId]     = useState(null);
  const navigate = useNavigate();

  const listUrl  = '/api/dailythoughts/process';      // ← remove /approved
  const likesUrl = '/api/dailythoughts/likes';        // ← remove /getlikes

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [tRes, lRes] = await Promise.all([fetch(listUrl), fetch(likesUrl)]);
        const tData = tRes.ok ? await tRes.json() : [];
        const lData = lRes.ok ? await lRes.json() : [];

        // defensive
        const thoughtsArr = Array.isArray(tData) ? tData : [];
        const likesArr    = Array.isArray(lData) ? lData : [];

        const stored = JSON.parse(localStorage.getItem('likedThoughts') || '[]');

        const merged = thoughtsArr.map((th) => {
          const likeObj = likesArr.find((l) => l.id === th.id);
          return {
            ...th,
            likes: likeObj ? likeObj.count : 0,
            liked: stored.includes(th.id),
          };
        });

        setThoughts(merged);
      } catch (err) {
        console.error('❌ Error fetching thoughts and likes:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAll();

    const closeAuthor = () => setActive(null);
    document.addEventListener('click', closeAuthor);
    return () => document.removeEventListener('click', closeAuthor);
  }, []);

  /* ---------------- LIKE HANDLER ---------------- */
  const likeEndpoint = (id) => `/api/dailythoughts/likes/${id}`;

  const toggleLike = async (id) => {
    if (!id || likingId === id) return;

    const stored = JSON.parse(localStorage.getItem('likedThoughts') || '[]');
    if (stored.includes(id)) {
      setPopupId(id);
      setTimeout(() => setPopupId(null), 5_000);
      return;
    }

    setLikingId(id);
    try {
      const res = await fetch(likeEndpoint(id), { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'error');

      stored.push(id);
      localStorage.setItem('likedThoughts', JSON.stringify(stored));

      setThoughts((prev) =>
        prev.map((t) => (t.id === id ? { ...t, likes: data.count, liked: true } : t))
      );
    } catch (err) {
      console.error('❌ Failed to toggle like:', err);
    } finally {
      setTimeout(() => setLikingId(null), 800);
    }
  };

  /* ---------------- RENDER HELPERS ---------------- */
  const groupByDate = () => {
    const today = new Date();
    const yesterday = new Date(today); yesterday.setDate(today.getDate() - 1);

    const map = {};
    [...thoughts]
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .forEach((th) => {
        const d = new Date(th.date);
        let label = d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
        if (d.toDateString() === today.toDateString()) label = 'Today';
        else if (d.toDateString() === yesterday.toDateString()) label = 'Yesterday';

        (map[label] = map[label] || []).push(th);
      });
    return map;
  };

  const fontSizeClass = (text = '') => {
    const wc = text.trim().split(/\s+/).length;
    if (wc < 15) return 'font-large';
    if (wc < 60) return 'font-medium';
    return 'font-small';
  };

  const handleAuthorClick = (e, author) => {
    e.stopPropagation();
    const rect = e.target.getBoundingClientRect();
    const popupW = 220, popupH = 80;

    let x = rect.left + rect.width / 2 - popupW / 2;
    x = Math.max(10, Math.min(x, window.innerWidth - popupW - 10));
    const y = rect.top + window.scrollY - popupH - 10;

    setPos({ x, y }); setActive(author);
  };

  /* ---------------- UI ---------------- */
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
                  {group.map((th) => (
                    <div className="timeline-item" key={th.id}>
                      <div className="timeline-dot" />
                      <div className="timeline-content">
                        <div className="thought-meta-wrapper">
                          <button
                            className="thought-meta-link"
                            onClick={(e) =>
                              handleAuthorClick(e, { name: th.name, email: th.email })
                            }
                          >
                            {th.name}
                          </button>
                          <span className="thought-meta-date">
                            {label === 'Today' || label === 'Yesterday'
                              ? new Date(th.date).toLocaleDateString('en-US', { weekday: 'long' })
                              : new Date(th.date).toLocaleDateString('en-US', {
                                  month: 'short',
                                  day: 'numeric',
                                  year: 'numeric',
                                })}
                          </span>
                        </div>

                        <p className={`thought-text ${fontSizeClass(th.content || th.text)}`}>
                          {(th.content || th.text || '').trim() || '[No thought text]'}
                        </p>

                        <div className="thought-attribution-like">
                          <span className="thought-attribution">{th.attribution || ''}</span>
                          <div className="like-container">
                            <button
                              className={`like-button ${th.liked ? 'liked' : ''}`}
                              onClick={() => toggleLike(th.id)}
                              disabled={likingId === th.id}
                            >
                              <svg
                                className="heart-icon"
                                viewBox="0 0 24 24"
                                fill={th.liked ? 'crimson' : 'none'}
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              >
                                <path d="M20.8 4.6c-1.8-1.8-4.7-1.8-6.5 0l-.8.8-.8-.8c-1.8-1.8-4.7-1.8-6.5 0s-1.8 4.7 0 6.5l7.3 7.3 7.3-7.3c1.8-1.8 1.8-4.7 0-6.5z" />
                              </svg>
                            </button>
                            <span className="like-count">{th.likes}</span>
                            {popupId === th.id && (
                              <div className="like-popup-message">
                                You can't love some-thing/one more than once and forget about trying
                                to unlove them
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
