import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './LsconcernPage.module.css';
import socialHero from '../../assets/social-hero.png';

const LsConcernPage = () => {
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchBothCategories = async () => {
      try {
        const API_BASE = import.meta.env.VITE_API_BASE_URL;

        // Fetch legal category blogs
        const resLegal = await fetch(`${API_BASE}/api/blogs?category=legal`);
        const legalBlogs = resLegal.ok ? await resLegal.json() : [];

        // Fetch social issues category blogs
        const resSocial = await fetch(`${API_BASE}/api/blogs?category=social issues`);
        const socialBlogs = resSocial.ok ? await resSocial.json() : [];

        // Combine lists
        const combined = [...legalBlogs, ...socialBlogs];

        // Sort descending by date (newest first)
        combined.sort((a, b) => new Date(b.date) - new Date(a.date));

        setPosts(combined);
      } catch (err) {
        console.error('❌ Error fetching blogs:', err);
        setError('Failed to load Legal & Social posts.');
      } finally {
        setLoading(false);
      }
    };

    fetchBothCategories();
  }, []);

  if (loading) {
    return (
      <div className={styles.pageContainer} style={{ padding: '2rem', textAlign: 'center' }}>
        Loading posts...
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.pageContainer} style={{ padding: '2rem', textAlign: 'center', color: 'red' }}>
        {error}
      </div>
    );
  }

  return (
    <div className={styles.pageContainer}>
      <div
        data-navbar-bg-detect
        style={{ position: 'absolute', top: 0, height: '80px', width: '100%' }}
      />

      <section className={styles.headerSection}>
        <img src={socialHero} alt="liberté toujours" className={styles.heroImage} />
      </section>

      <section className={styles.postsSection}>
        <h2 className={styles.postsHeading}>Legal & Social Posts</h2>
        <div className={styles.blogGrid}>
          {posts.length === 0 ? (
            <p style={{ textAlign: 'center', color: '#666' }}>No posts available.</p>
          ) : (
            posts.map((post) => (
              <div
                key={post.id}
                className={styles.blogCard}
                onClick={() => navigate(`/blogs/legal-social/${post.id}`)}
                style={{ cursor: 'pointer' }}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    navigate(`/blogs/legal-social/${post.id}`);
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
  );
};

export default LsConcernPage;
