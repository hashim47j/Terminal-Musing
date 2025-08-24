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
      try {
        const res = await fetch('/api/blogs?category=history');
        if (!res.ok) throw new Error(`Failed to fetch blogs (status: ${res.status})`);
        const data = await res.json();

        const list = Array.isArray(data) ? data : [];
        const sorted = list.sort((a, b) => new Date(b.date) - new Date(a.date));
        setPosts(sorted);
      } catch (err) {
        console.error('❌ Error fetching history blogs:', err);
        setError('Failed to load history posts.');
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
        <h2 className={styles.postsHeading}>Posts</h2>
      </div>

      {/* Scrollable Posts Section */}
      <section className={styles.postsSection}>
        <div className={styles.blogGridContainer}>
          <div className={styles.blogGrid}>
            {loading ? (
              <p style={{ textAlign: 'center', color: '#666' }}>Loading posts...</p>
            ) : error ? (
              <p style={{ textAlign: 'center', color: 'red' }}>{error}</p>
            ) : posts.length === 0 ? (
              <p style={{ textAlign: 'center', color: '#666' }}>No history posts available.</p>
            ) : (
              posts.map((post) => (
                <div
                  key={post.id}
                  className={styles.blogCard}
                  onClick={() => navigate(`/blogs/history/${post.id}`)}
                  role="button"
                  tabIndex={0}
                  style={{ cursor: 'pointer' }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') navigate(`/blogs/history/${post.id}`);
                  }}
                >
                  {post.coverImage ? (
                    <img src={post.coverImage} alt={post.title} className={styles.coverImage} />
                  ) : (
                    <div className={styles.coverImage} style={{ backgroundColor: '#ccc' }} />
                  )}
              
                  <div className={styles.blogContent}>
                    <div className={styles.blogMetaRow}>
                      <span className={styles.blogMeta}>
                        On {new Date(post.date).toLocaleDateString('en-US', {
                          day: 'numeric',
                          month: 'short'
                        })}
                      </span>
                      <h3 className={styles.blogTitle}>{post.title}</h3>
                      <p className={styles.blogSubheading}>{post.subheading}</p>
                    </div>
                    
                    <div className={styles.blogTimeRow}>
                      <span className={styles.blogTime}>6hr ago</span>
                      <div className={styles.blogUnderline}></div>
                    </div>
                  </div>
                </div>
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
