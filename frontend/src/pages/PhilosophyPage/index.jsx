import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './PhilosophyPage.module.css';
import kantLight from '../../assets/kant-sapere-aude.png';
import kantDark from '../../assets/kant-sapere-aude-dark.png';
import { useDarkMode } from '../../context/DarkModeContext';

const PhilosophyPage = () => {
  const { darkMode } = useDarkMode();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const navbarBgRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        // Navbar detection logic can be handled here or globally
      },
      {
        root: null,
        threshold: 0.6,
      }
    );

    if (navbarBgRef.current) observer.observe(navbarBgRef.current);

    return () => {
      if (navbarBgRef.current) observer.unobserve(navbarBgRef.current);
    };
  }, []);

  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      setError('');
      
      try {
        const res = await fetch('/api/blogs/philosophy'); // ✅ Updated to match new API structure
        if (!res.ok) throw new Error(`Failed to fetch blogs (status: ${res.status})`);
        
        const data = await res.json();
        
        // ✅ CRITICAL: Ensure data is always an array before operations
        console.log('🔍 Philosophy API Response:', data);
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

        // ✅ Safe sorting and filtering
        const sorted = postsArray
          .filter(post => post && post.id && post.title) // Remove invalid posts
          .sort((a, b) => {
            const dateA = new Date(a.date || 0);
            const dateB = new Date(b.date || 0);
            return dateB - dateA; // Newest first
          });
          
        setPosts(sorted);
        
      } catch (err) {
        console.error('❌ Error fetching philosophy blogs:', err);
        setError(`Failed to load philosophy posts: ${err.message}`);
        setPosts([]); // ✅ Ensure posts is always an array on error
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  // ✅ Enhanced navigation to use unified route
  const handlePostClick = (post) => {
    navigate(`/blog/philosophy/${post.id}`); // ✅ Updated to unified route format
  };

  const handleKeyDown = (e, post) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handlePostClick(post);
    }
  };

  return (
    <div className={`${styles.philosophyPageContainer} ${darkMode ? styles.darkMode : ''}`}>
      {/* Navbar background detection */}
      <div
        ref={navbarBgRef}
        data-navbar-bg-detect
        style={{
          position: 'absolute',
          top: 0,
          height: '80px',
          width: '100%',
        }}
      />

      <section className={styles.headerSection}>
        <img
          src={darkMode ? kantDark : kantLight}
          alt="Immanuel Kant and Sapere Aude"
          className={styles.kantSapereAudeImage}
          style={{
            left: 'var(--kant-x, 0px)',
            top: 'var(--kant-y, 0px)',
            position: 'relative',
            maxWidth: '100%',
          }}
        />
      </section>

      <section className={styles.postsSection}>
        <div className={styles.postsHeader}>
          <h2 className={styles.postsHeading}>Philosophy Posts</h2>
          <p className={styles.postsCount}>
            {loading ? 'Loading...' : `${posts.length} post${posts.length !== 1 ? 's' : ''} available`}
          </p>
        </div>
        
        <div className={styles.postsGrid}>
          {loading ? (
            <div className={styles.loadingState}>
              <div className={styles.spinner}></div>
              <p>Loading philosophy posts...</p>
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
              <h3>No Philosophy Posts Available</h3>
              <p>Check back soon for new philosophical insights and discussions.</p>
            </div>
          ) : (
            // ✅ Safe mapping with array check
            posts.map((post) => (
              <article
                key={post.id}
                className={styles.postCard}
                onClick={() => handlePostClick(post)}
                onKeyDown={(e) => handleKeyDown(e, post)}
                style={{ cursor: 'pointer' }}
                role="button"
                tabIndex={0}
                aria-label={`Read article: ${post.title}`}
              >
                {post.coverImage ? (
                  <img 
                    src={post.coverImage} 
                    alt={`Cover for ${post.title}`} 
                    className={styles.postImage}
                    loading="lazy"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextElementSibling.style.display = 'block';
                    }}
                  />
                ) : (
                  <div className={styles.postImage} style={{ backgroundColor: '#ccc' }}>
                    <span className={styles.noImageText}>No Image</span>
                  </div>
                )}
                
                <div className={styles.postContent}>
                  <h3 className={styles.postTitle}>{post.title}</h3>
                  {post.subheading && (
                    <p className={styles.postDescription}>{post.subheading}</p>
                  )}
                  <div className={styles.postMeta}>
                    <span className={styles.postTime}>
                      {new Date(post.date).toLocaleDateString('en-US', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </span>
                    <span className={styles.categoryBadge}>Philosophy</span>
                  </div>
                </div>
              </article>
            ))
          )}
        </div>
      </section>
    </div>
  );
};

export default PhilosophyPage;
