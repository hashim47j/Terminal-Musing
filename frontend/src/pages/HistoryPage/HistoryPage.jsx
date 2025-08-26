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

  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      setError('');
      
      try {
        const res = await fetch('/api/blogs/history'); // ✅ Updated to match new API structure
        if (!res.ok) throw new Error(`Failed to fetch blogs (status: ${res.status})`);
        
        const data = await res.json();
        
        // ✅ CRITICAL: Ensure data is always an array before operations
        console.log('🔍 History API Response:', data);
        console.log('🔍 Is Array:', Array.isArray(data));
        
        let postsArray = [];
        if (Array.isArray(data)) {
          postsArray = data;
        } else if (data && Array.isArray(data.blogs)) {
          // Handle if API returns {blogs: [...]}
          postsArray = data.blogs;
        } else {
          console.warn('⚠️ API returned unexpected format:', typeof data);
          postsArray = [];
        }

        // ✅ Safe sorting with validation
        const sorted = postsArray
          .filter(post => post && post.id && post.title) // Remove invalid posts
          .sort((a, b) => {
            const dateA = new Date(a.date || 0);
            const dateB = new Date(b.date || 0);
            return dateB - dateA; // Newest first
          });
          
        setPosts(sorted);
        
      } catch (err) {
        console.error('❌ Error fetching history blogs:', err);
        setError(`Failed to load history posts: ${err.message}`);
        setPosts([]); // ✅ Ensure posts is always an array on error
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

  // ✅ Enhanced navigation to use unified route
  const handlePostClick = (post) => {
    navigate(`/blog/history/${post.id}`); // ✅ Updated to unified route format
  };

  const handleKeyDown = (e, post) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handlePostClick(post);
    }
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
              // ✅ Safe mapping with array check
              posts.map((post) => (
                <article
                  key={post.id}
                  className={styles.blogCard}
                  onClick={() => handlePostClick(post)}
                  role="button"
                  tabIndex={0}
                  style={{ cursor: 'pointer' }}
                  onKeyDown={(e) => handleKeyDown(e, post)}
                  aria-label={`Read article: ${post.title}`}
                >
                  {post.coverImage ? (
                    <img 
                      src={post.coverImage} 
                      alt={`Cover for ${post.title}`} 
                      className={styles.coverImage}
                      loading="lazy"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextElementSibling.style.display = 'block';
                      }}
                    />
                  ) : (
                    <div className={styles.coverImage} style={{ backgroundColor: '#ccc' }}>
                      <span className={styles.noImageText}>No Image</span>
                    </div>
                  )}

                  <div className={styles.blogContent}>
                    <h3 className={styles.blogTitle}>{post.title}</h3>
                    {post.subheading && (
                      <p className={styles.blogSubheading}>{post.subheading}</p>
                    )}
                    <div className={styles.blogMeta}>
                      <span className={styles.blogTime}>
                        {new Date(post.date).toLocaleDateString('en-US', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </span>
                      <span className={styles.categoryBadge}>History</span>
                    </div>
                  </div>
                </article>
              ))
            )}
          </div>
        </div>
      </section>

      {/* Gray Strip at Bottom */}
      <div className={styles.grayStrip}></div>

      {/* Your Original Footer Component */}
      {showFooter && (
        <div className={styles.footerContainer}>
          <Footer />
        </div>
      )}
    </div>
  );
};

export default HistoryPage;
