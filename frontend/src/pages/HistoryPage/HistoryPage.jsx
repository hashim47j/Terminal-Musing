import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './HistoryPage.module.css';
import historyLight from '../../assets/history-hero.png';
import Footer from '../../components/Footer/Footer';

const HistoryPage = () => {
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showFooter, setShowFooter] = useState(false);
  const [hoveredPostId, setHoveredPostId] = useState(null);
  
  // ✅ State for current logged-in author/admin
  const [currentAuthor, setCurrentAuthor] = useState('Terminal Musing');

  // ✅ Function to count words in content
  const getWordCount = (content) => {
    if (!content || !Array.isArray(content)) return 0;
    
    const textContent = content
      .filter(block => block.type === 'paragraph' && block.text)
      .map(block => block.text)
      .join(' ');
    
    return textContent.trim().split(/\s+/).filter(word => word.length > 0).length;
  };

  // ✅ Fetch current logged-in user/author info
  useEffect(() => {
    const fetchCurrentAuthor = async () => {
      try {
        const endpoints = [
          '/api/user/me',
          '/api/admin/profile', 
          '/api/auth/user',
          '/api/current-user'
        ];
        
        for (const endpoint of endpoints) {
          try {
            const res = await fetch(endpoint);
            if (res.ok) {
              const userData = await res.json();
              const authorName = userData.name || 
                               userData.username || 
                               userData.displayName || 
                               userData.fullName ||
                               'Terminal Musing';
              setCurrentAuthor(authorName);
              console.log(`✅ Fetched author: ${authorName}`);
              return;
            }
          } catch (err) {
            continue;
          }
        }
        
        const storedUser = localStorage.getItem('currentUser');
        if (storedUser) {
          const user = JSON.parse(storedUser);
          setCurrentAuthor(user.name || user.username || 'Terminal Musing');
        }
        
      } catch (err) {
        console.warn('⚠️ Failed to fetch current author, using default:', err);
        setCurrentAuthor('Terminal Musing');
      }
    };

    fetchCurrentAuthor();
  }, []);

  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      setError('');
      
      try {
        const res = await fetch('/api/blogs/history');
        if (!res.ok) throw new Error(`Failed to fetch blogs (status: ${res.status})`);
        
        const data = await res.json();
        
        let postsArray = [];
        if (Array.isArray(data)) {
          postsArray = data;
        } else if (data && Array.isArray(data.blogs)) {
          postsArray = data.blogs;
        } else {
          console.warn('⚠️ API returned unexpected format:', typeof data);
          postsArray = [];
        }

        const sorted = postsArray
          .filter(post => post && post.id && post.title)
          .sort((a, b) => {
            const dateA = new Date(a.date || 0);
            const dateB = new Date(b.date || 0);
            return dateB - dateA;
          });
          
        setPosts(sorted);
        
      } catch (err) {
        console.error('❌ Error fetching history blogs:', err);
        setError(`Failed to load history posts: ${err.message}`);
        setPosts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  useEffect(() => {
    const handleMouseMove = (e) => {
      const blogContainer = document.querySelector(`.${styles.blogGridContainer}`);
      if (blogContainer) {
        const rect = blogContainer.getBoundingClientRect();
        const isOutsidePosts = e.clientY < rect.top - 100 || e.clientY > rect.bottom + 100;
        setShowFooter(isOutsidePosts);
      }
    };

    document.addEventListener('mousemove', handleMouseMove);
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  const handlePostClick = (post) => {
    navigate(`/blog/history/${post.id}`);
  };

  const handleKeyDown = (e, post) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handlePostClick(post);
    }
  };

  const getExcerpt = (post) => {
    if (!post.content || !Array.isArray(post.content)) return "";
    
    const textBlocks = post.content
      .filter(block => block.type === 'paragraph' && block.text)
      .slice(0, 2)
      .map(block => block.text.trim())
      .join(' ');
    
    if (textBlocks && textBlocks.length > 150) {
      return textBlocks.substring(0, 150) + '...';
    }
    return textBlocks || post.subheading || "";
  };

  return (
    <div className={styles.historyPageContainer}>
      <div
        data-navbar-bg-detect
        style={{ position: 'absolute', top: 0, height: '80px', width: '100%' }}
      />

      {/* Fixed Hero Section */}
      <section className={styles.headerSection}>
        <img
          src={historyLight}
          alt="Historical Illustration"
          className={styles.heroImage}
        />
      </section>

      {/* Fixed Posts Heading */}
      <div className={styles.postsHeadingSection}>
        <h2 className={styles.postsHeading}>History Posts</h2>
      </div>

      {/* Scrollable Posts Section */}
      <section className={styles.postsSection}>
        <div className={styles.blogGridContainer}>
          <div className={styles.blogGrid}>
            {loading ? (
              <div className={styles.loadingState}>
                <div className={styles.spinner}></div>
                <p>Loading history posts...</p>
              </div>
            ) : error ? (
              <div className={styles.errorState}>
                <h3>Oops! Something went wrong</h3>
                <p style={{ color: 'red' }}>{error}</p>
                <button 
                  onClick={() => window.location.reload()} 
                  className={styles.retryBtn}
                >
                  Try Again
                </button>
              </div>
            ) : !Array.isArray(posts) || posts.length === 0 ? (
              <div className={styles.emptyState}>
                <h3>No History Posts Available</h3>
                <p>Check back soon for new historical insights and articles.</p>
              </div>
            ) : (
              posts.map((post) => (
                <article
                  key={post.id}
                  className={styles.blogCard}
                  onClick={() => handlePostClick(post)}
                  onMouseEnter={() => setHoveredPostId(post.id)}
                  onMouseLeave={() => setHoveredPostId(null)}
                  role="button"
                  tabIndex={0}
                  style={{ cursor: 'pointer' }}
                  onKeyDown={(e) => handleKeyDown(e, post)}
                  aria-label={`Read article: ${post.title}`}
                >
                  {/* Cover Image with expand animation */}
                  {post.coverImage ? (
                    <img 
                      src={post.coverImage} 
                      alt={`Cover for ${post.title}`} 
                      className={`${styles.coverImage} ${hoveredPostId === post.id ? styles.expanded : ''}`}
                      loading="lazy"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextElementSibling.style.display = 'block';
                      }}
                    />
                  ) : (
                    <div className={`${styles.coverImage} ${hoveredPostId === post.id ? styles.expanded : ''}`} style={{ backgroundColor: '#ccc' }}>
                      <span className={styles.noImageText}>No Image</span>
                    </div>
                  )}
              
                  {/* ✅ UPDATED: Text content - removed subheading, added fixed bottom layout */}
                  <div className={`${styles.blogContent} ${hoveredPostId === post.id ? styles.hiddenContent : ''}`}>
                    <h3 className={styles.blogTitle}>{post.title}</h3>
                    
                    {/* ✅ NEW: Fixed bottom content with line and meta info */}
                    <div className={styles.cardBottomFixed}>
                      <div className={styles.cardSeparatorLine}></div>
                      <div className={styles.cardMetaRow}>
                        <span className={styles.cardAuthor}>
                          by {post.author || currentAuthor}
                        </span>
                        <span className={styles.cardDate}>
                          {new Date(post.date).toLocaleDateString('en-US', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </span>
                        <span className={styles.cardWordCount}>
                          {getWordCount(post.content)} words
                        </span>
                      </div>
                    </div>
                  </div>
              
                  {/* Hover overlay with bottom positioning */}
                  {hoveredPostId === post.id && (
                    <div className={styles.hoverOverlay}>
                      <div className={styles.subheadingContainer}>
                        <p className={styles.hoverSubheading}>
                          {post.subheading || post.title}
                        </p>
                      </div>

                      <div className={styles.bottomFixed}>
                        <div className={styles.leftContent}>
                          <div className={styles.separatorLine}></div>
                          <div className={styles.authorDateContainer}>
                            <span className={styles.authorName}>
                              {post.author || currentAuthor}
                            </span>
                            <span className={styles.postDate}>
                              {new Date(post.date).toLocaleDateString('en-US', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric',
                              })}
                            </span>
                          </div>
                        </div>

                        <div className={styles.rightContent}>
                          <button 
                            className={styles.shareIcon}
                            onClick={(e) => {
                              e.stopPropagation();
                              if (navigator.share) {
                                navigator.share({
                                  title: post.title,
                                  text: post.subheading,
                                  url: `/blog/history/${post.id}`
                                });
                              } else {
                                navigator.clipboard.writeText(`${window.location.origin}/blog/history/${post.id}`);
                                alert('Link copied to clipboard!');
                              }
                            }}
                          >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.50-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92s2.92-1.31 2.92-2.92c0-1.61-1.31-2.92-2.92-2.92z"/>
                            </svg>
                          </button>

                          <button 
                            className={styles.readBtn}
                            onClick={(e) => {
                              e.stopPropagation();
                              handlePostClick(post);
                            }}
                          >
                            Read
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </article>
              ))
            )}
          </div>
        </div>
      </section>

      {/* Gray Strip at Bottom */}
      <div className={styles.grayStrip}></div>

      {/* Footer */}
      {showFooter && (
        <div className={styles.footerContainer}>
          <Footer />
        </div>
      )}
    </div>
  );
};

export default HistoryPage;
