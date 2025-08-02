// src/pages/HistoryPage/HistoryPage.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './HistoryPage.module.css';
import historyLight from '../../assets/history-hero.png';

const HistoryPage = () => {
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/blogs?category=history`);
        if (!res.ok) throw new Error(`Failed to fetch blogs (status: ${res.status})`);
        const data = await res.json();

        // Sort descending by date so newest posts appear first
        const sortedData = data.sort((a, b) => new Date(b.date) - new Date(a.date));
        setPosts(sortedData);
      } catch (err) {
        console.error('❌ Error fetching history blogs:', err);
        setError('Failed to load history posts.');
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  if (loading) {
    return (
      <div className={styles.historyPageContainer} style={{ padding: '2rem', textAlign: 'center' }}>
        Loading posts...
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.historyPageContainer} style={{ padding: '2rem', textAlign: 'center', color: 'red' }}>
        {error}
      </div>
    );
  }

  return (
    <div className={styles.historyPageContainer}>
      {/* Background detector for dynamic navbar text color */}
      <div
        data-navbar-bg-detect
        style={{ position: 'absolute', top: 0, height: '80px', width: '100%' }}
      />

      <section className={styles.headerSection}>
        <img
          src={historyLight}
          alt="Historical Illustration"
          className={styles.heroImage}
        />
      </section>

      <section className={styles.postsSection}>
        <h2 className={styles.postsHeading}>History Posts</h2>
        <div className={styles.blogGrid}>
          {posts.length === 0 ? (
            <p style={{ textAlign: 'center', color: '#666' }}>No history posts available.</p>
          ) : (
            posts.map((post) => (
              <div
                key={post.id}
                className={styles.blogCard}
                onClick={() => navigate(`/blogs/history/${post.id}`)}
                style={{ cursor: 'pointer' }}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') navigate(`/blogs/history/${post.id}`);
                }}
              >
                {post.coverImage ? (
                  <img
                    src={post.coverImage}
                    alt={post.title}
                    className={styles.coverImage}
                  />
                ) : (
                  <div className={styles.coverImage} style={{ backgroundColor: '#ccc' }} />
                )}
                <div className={styles.blogContent}>
                  <h3 className={styles.blogTitle}>{post.title}</h3>
                  <p className={styles.blogSubheading}>{post.subheading}</p>
                  <span className={styles.blogTime}>
                    {new Date(post.date).toLocaleDateString('en-US', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
};

export default HistoryPage;
