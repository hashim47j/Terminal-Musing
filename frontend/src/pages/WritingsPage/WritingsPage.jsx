// src/pages/WritingsPage/WritingPage.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './WritingPage.module.css';
import writingHero from '../../assets/writing-hero.png';


const WritingPage = () => {
  const navigate = useNavigate();
  const [posts, setPosts]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');


  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        // poems
        const resPoems = await fetch('/api/blogs?category=poems');
        const poems    = resPoems.ok ? await resPoems.json() : [];


        // short stories  (URL-encoded space)
        const resSS = await fetch('/api/blogs?category=' + encodeURIComponent('short stories'));
        const shorts = resSS.ok ? await resSS.json() : [];


        const combined = [...poems, ...shorts]
          .filter(Array.isArray(poems) ? () => true : () => false); // ensure arrays


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


  return (
    <div className={styles.writingsPageContainer}>
      {/* navbar background detector */}
      <div data-navbar-bg-detect style={{ position: 'absolute', top: 0, height: 80, width: '100%' }} />


      {/* Hero */}
      <section className={styles.headerSection}>
        <img src={writingHero} alt="Writing Hero" className={styles.heroImage} />
      </section>


      {/* Posts */}
      <div className={styles.mainContentWrapper}>
        <section className={styles.postsSection}>
          <h2 className={styles.postsHeading}>Writing Posts</h2>


          <div className={styles.blogGrid}>
            {loading ? (
              <p style={{ textAlign: 'center', color: '#666' }}>Loading writing posts...</p>
            ) : error ? (
              <p style={{ textAlign: 'center', color: 'red' }}>{error}</p>
            ) : posts.length === 0 ? (
              <p style={{ textAlign: 'center', color: '#666' }}>No writing posts available.</p>
            ) : (
              posts.map((post) => (
                <div
                  key={post.id}
                  className={styles.blogCard}
                  role="button"
                  tabIndex={0}
                  style={{ cursor: 'pointer' }}
                  onClick={() => navigate(`/blogs/writings/${post.id}`)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') navigate(`/blogs/writings/${post.id}`);
                  }}
                >
                  {post.coverImage ? (
                    <img src={post.coverImage} alt={post.title} className={styles.coverImage} />
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
