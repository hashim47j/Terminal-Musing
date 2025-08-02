// src/pages/TechPage/TechPage.jsx
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
      try {
        const API_BASE = import.meta.env.VITE_API_BASE_URL;
        const categoryName = 'android & linux';
        const encodedCategory = encodeURIComponent(categoryName);
  
        const res = await fetch(`${API_BASE}/api/blogs?category=${encodedCategory}`);
        if (!res.ok) throw new Error(`Failed to fetch blogs (status: ${res.status})`);
  
        const data = await res.json();
        data.sort((a, b) => new Date(b.date) - new Date(a.date));
        setPosts(data);
      } catch (err) {
        console.error('❌ Error fetching tech blogs:', err);
        setError('Failed to load tech posts.');
      } finally {
        setLoading(false);
      }
    };
  
    fetchPosts();
  }, []);
  

  if (loading) {
    return (
      <div className={styles.pageContainer} style={{ padding: '2rem', textAlign: 'center' }}>
        Loading tech posts...
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
      {/* Navbar background detection */}
      <div
        data-navbar-bg-detect
        style={{ position: 'absolute', top: 0, height: '80px', width: '100%' }}
      />

      {/* Hero Section with background */}
      <section className={styles.headerSection}>
        <img src={techHero} alt="Tech Hero Visual" className={styles.heroImage} />
      </section>

      {/* Posts */}
      <section className={styles.postsSection}>
        <h2 className={styles.postsHeading}>Tech Insights</h2>
        <div className={styles.blogGrid}>
          {posts.length === 0 ? (
            <p style={{ textAlign: 'center', color: '#666' }}>No tech posts available.</p>
          ) : (
            posts.map((post) => (
              <div
                key={post.id}
                className={styles.blogCard}
                onClick={() => navigate(`/blogs/tech/${post.id}`)}
                style={{ cursor: 'pointer' }}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') navigate(`/blogs/tech/${post.id}`);
                }}
              >
                {post.coverImage ? (
                  <img
                    src={post.coverImage}
                    alt={post.title}
                    className={styles.coverImage}
                  />
                ) : (
                  <div className={styles.coverImage} style={{ backgroundColor: '#e4e8eb' }} />
                )}
                <div className={styles.blogContent}>
                  <h3 className={styles.blogTitle}>{post.title}</h3>
                  <p className={styles.blogSubheading}>{post.subheading}</p>
                  <span className={styles.blogTime}>
                    {new Date(post.date).toLocaleDateString('en-US', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric'
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

export default TechPage;
