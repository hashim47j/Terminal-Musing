// src/pages/WritingsPage/WritingPage.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './WritingPage.module.css';
import writingHero from '../../assets/writing-hero.png';

const WritingPage = () => {
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const API_BASE = import.meta.env.VITE_API_BASE_URL;

        const resPoems = await fetch(`${API_BASE}/api/blogs?category=poems`);
        const poems = resPoems.ok ? await resPoems.json() : [];

        const resShortStories = await fetch(`${API_BASE}/api/blogs?category=short stories`);
        const shortStories = resShortStories.ok ? await resShortStories.json() : [];

        const combined = [...poems, ...shortStories];
        combined.sort((a, b) => new Date(b.date) - new Date(a.date));

        setPosts(combined);
      } catch (err) {
        console.error('❌ Error fetching writing blogs:', err);
        setError('Failed to load writing posts.');
      } finally {
        setLoading(false);
      }
    };

    fetchBlogs();
  }, []);

  if (loading) {
    return (
      <div className={styles.writingsPageContainer} style={{ padding: '2rem', textAlign: 'center' }}>
        Loading writing posts...
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.writingsPageContainer} style={{ padding: '2rem', textAlign: 'center', color: 'red' }}>
        {error}
      </div>
    );
  }

  return (
    <div className={styles.writingsPageContainer}>
      <div
        data-navbar-bg-detect
        style={{ position: 'absolute', top: 0, height: '80px', width: '100%' }}
      />

      {/* Hero Section */}
      <section className={styles.headerSection}>
        <img
          src={writingHero}
          alt="Writing Hero"
          className={styles.heroImage}
          style={{
            '--hero-x': '0px',
            '--hero-y': '0px',
          }}
        />
      </section>

      {/* Wrap this section in mainContentWrapper for consistent width */}
      <div className={styles.mainContentWrapper}>
        <section className={styles.postsSection}>
          <h2 className={styles.postsHeading}>Writing Posts</h2>
          <div className={styles.blogGrid}>
            {posts.length === 0 ? (
              <p style={{ textAlign: 'center', color: '#666' }}>No writing posts available.</p>
            ) : (
              posts.map((post) => (
                <div
                  key={post.id}
                  className={styles.blogCard}
                  onClick={() => navigate(`/blogs/writings/${post.id}`)}
                  style={{ cursor: 'pointer' }}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      navigate(`/writings/${post.id}`);
                    }
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
    </div>
  );
};

export default WritingPage;
