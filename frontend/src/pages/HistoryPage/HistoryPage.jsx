// Terminal-Musing/src/pages/HistoryPage/HistoryPage.jsx

import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './HistoryPage.module.css';
import historyLight from '../../assets/history-hero.png';

const HistoryPage = () => {
  const navigate = useNavigate();

  // Dummy posts for development
  const posts = [
    {
      id: 'world-war-ii',
      title: 'The Impact of World War II',
      subheading: 'How the global conflict reshaped the 20th century.',
      coverImage: '/uploads/history-ww2.jpg',
      date: '1945-09-02'
    },
    {
      id: 'french-revolution',
      title: 'The French Revolution',
      subheading: 'Liberty, equality, and the reign of terror.',
      coverImage: '/uploads/history-french-revolution.jpg',
      date: '1789-07-14'
    }
  ];

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
          {posts.map((post) => (
            <div
              key={post.id}
              className={styles.blogCard}
              onClick={() => navigate(`/blogs/history/${post.id}`)}
              style={{ cursor: 'pointer' }}
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

export default HistoryPage;
