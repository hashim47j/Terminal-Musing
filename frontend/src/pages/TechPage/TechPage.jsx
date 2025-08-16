import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './TechPage.module.css';
import techHero from '../../assets/techhero.png';


const TechPage = () => {
  const navigate = useNavigate();
  const [posts, setPosts]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');


  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const cat = encodeURIComponent('android & linux');
        const res = await fetch(`/api/blogs?category=${cat}`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
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
        <h2 className={styles.postsHeading}>Tech Insights</h2>
        <div className={styles.blogGrid}>
          {loading ? (
            <p style={{ textAlign: 'center', color: '#666' }}>Loading tech posts...</p>
          ) : error ? (
            <p style={{ textAlign: 'center', color: 'red' }}>{error}</p>
          ) : posts.length === 0 ? (
            <p style={{ textAlign: 'center', color: '#666' }}>No tech posts available.</p>
          ) : (
            posts.map((post) => (
              <div
                key={post.id}
                className={styles.blogCard}
                role="button"
                tabIndex={0}
                style={{ cursor: 'pointer' }}
                onClick={() => navigate(`/blogs/tech/${post.id}`)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') navigate(`/blogs/tech/${post.id}`);
                }}
              >
                {post.coverImage ? (
                  <img src={post.coverImage} alt={post.title} className={styles.coverImage} />
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


export default TechPage;
