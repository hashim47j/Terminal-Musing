import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './TechPage.module.css';
import techHero from '../../assets/techhero.png';

const TechPage = () => {
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      setError('');
      
      try {
        // ✅ Updated to use 'tech' category (matches VALID_CATEGORIES in API)
        const res = await fetch('/api/blogs/tech');
        if (!res.ok) throw new Error(`Failed to fetch blogs (status: ${res.status})`);
        
        const data = await res.json();
        
        // ✅ CRITICAL: Ensure data is always an array before operations
        console.log('🔍 Tech API Response:', data);
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
        console.error('❌ Error fetching tech blogs:', err);
        setError(`Failed to load tech posts: ${err.message}`);
        setPosts([]); // ✅ Ensure posts is always an array on error
      } finally {
        setLoading(false);
      }
    };
    
    fetchPosts();
  }, []);

  // ✅ Enhanced navigation to use unified route
  const handlePostClick = (post) => {
    navigate(`/blog/tech/${post.id}`); // ✅ Updated to unified route format
  };

  const handleKeyDown = (e, post) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handlePostClick(post);
    }
  };

  return (
    <div className={styles.pageContainer}>
      {/* navbar background detector */}
      <div data-navbar-bg-detect style={{ position: 'absolute', top: 0, height: 80, width: '100%' }} />

      {/* Hero */}
      <section className={styles.headerSection}>
        <img src={techHero} alt="Tech Hero" className={styles.heroImage} />
      </section>

      {/* Posts */}
      <section className={styles.postsSection}>
        <div className={styles.postsHeader}>
          <h2 className={styles.postsHeading}>Tech Insights</h2>
          <p className={styles.postsCount}>
            {loading ? 'Loading...' : `${posts.length} post${posts.length !== 1 ? 's' : ''} available`}
          </p>
        </div>
        
        <div className={styles.blogGrid}>
          {loading ? (
            <div className={styles.loadingState}>
              <div className={styles.spinner}></div>
              <p>Loading tech posts...</p>
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
              <h3>No Tech Posts Available</h3>
              <p>Check back soon for new technology insights and tutorials.</p>
            </div>
          ) : (
            // ✅ Safe mapping with array check
            posts.map((post) => (
              <article
                key={post.id}
                className={styles.blogCard}
                role="button"
                tabIndex={0}
                style={{ cursor: 'pointer' }}
                onClick={() => handlePostClick(post)}
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
                  <div className={styles.coverImage} style={{ backgroundColor: '#e4e8eb' }}>
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
                    <span className={styles.categoryBadge}>Technology</span>
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

export default TechPage;
