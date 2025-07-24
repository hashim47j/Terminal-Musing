import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './PhilosophyPage.module.css';
import kantLight from '../../assets/kant-sapere-aude.png';
import kantDark from '../../assets/kant-sapere-aude-dark.png';
import { useDarkMode } from '../../context/DarkModeContext';

const PhilosophyPage = () => {
  const { darkMode } = useDarkMode();
  const [posts, setPosts] = useState([]);
  const navigate = useNavigate();

  const navbarBgRef = useRef(null);

  // Optional: force IntersectionObserver to mount early for navbar
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        // If needed, extra logic can go here for detection
        // But the Navbar already observes this element globally
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
      try {
        const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/blogs?category=philosophy`);
        const data = await res.json();
        setPosts(data);
      } catch (err) {
        console.error('❌ Error fetching blog previews:', err);
      }
    };

    fetchPosts();
  }, []);

  return (
    <div className={`${styles.philosophyPageContainer} ${darkMode ? styles.darkMode : ''}`}>
      {/* ⬇️ This div allows the navbar to detect background brightness */}
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
        <div className={styles.kantSapereAudeImageWrapper}>
          <img
            src={darkMode ? kantDark : kantLight}
            alt="Immanuel Kant and Sapere Aude"
            className={styles.kantSapereAudeImage}
          />
        </div>
      </section>

      <section className={styles.postsSection}>
        <h2 className={styles.postsHeading}>Posts</h2>
        <div className={styles.postsGrid}>
          {posts.map((post) => (
            <div
              key={post.id}
              className={styles.postCard}
              onClick={() => navigate(`/blogs/philosophy/${post.id}`)}
              style={{ cursor: 'pointer' }}
            >
              {post.coverImage ? (
                <img
                  src={post.coverImage}
                  alt={post.title}
                  className={styles.postImage}
                />
              ) : (
                <div className={styles.postImage} style={{ backgroundColor: '#ccc' }} />
              )}
              <div className={styles.postContent}>
                <h3 className={styles.postTitle}>{post.title}</h3>
                <p className={styles.postDescription}>{post.subheading}</p>
                <span className={styles.postTime}>
                  {new Date(post.date).toLocaleDateString('en-US', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default PhilosophyPage;
