// /home/hash/Documents/Terminal-Musing/frontend/src/pages/TechPage/TechPage.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './TechPage.module.css';
import techHero from '../../assets/techhero.png';
import techBg from '../../assets/techbg.png';

const TechPage = () => {
  const navigate = useNavigate();

  const posts = [
    {
      id: 'ai-bias',
      title: 'The Invisible Hand of AI Bias',
      subheading: 'How machine learning models inherit human flaws.',
      coverImage: '/uploads/tech-ai-bias.jpg',
      date: '2024-01-11'
    },
    {
      id: 'open-hardware',
      title: 'The Open Hardware Revolution',
      subheading: 'Can transparent tech change the world?',
      coverImage: '/uploads/tech-open-hardware.jpg',
      date: '2024-04-02'
    }
    // Add more tech posts here as needed
  ];

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
          {posts.map((post) => (
            <div
              key={post.id}
              className={styles.blogCard}
              onClick={() => navigate(`/blogs/tech/${post.id}`)}
              style={{ cursor: 'pointer' }}
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
          ))}
        </div>
      </section>
    </div>
  );
};

export default TechPage;
