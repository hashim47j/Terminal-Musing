// Terminal-Musing/src/pages/WritingsPage/WritingPage.jsx

import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './WritingPage.module.css';
import writingHero from '../../assets/writing-hero.png'; // Add your hero image here

const WritingPage = () => {
  const navigate = useNavigate();

  // Dummy writing posts for now
  const posts = [
    {
      id: 'existential-notes',
      title: 'Existential Notes',
      subheading: 'Reflecting on the absurd and the beauty of being.',
      coverImage: '/uploads/existential-writing.jpg',
      date: '2025-07-10'
    },
    {
      id: 'letters-to-a-stranger',
      title: 'Letters to a Stranger',
      subheading: 'Fragments of thoughts left unsent.',
      coverImage: '/uploads/letters-writing.jpg',
      date: '2025-06-30'
    }
  ];

  return (
    <div className={styles.writingPageContainer}>
      <div
        data-navbar-bg-detect
        style={{ position: 'absolute', top: 0, height: '80px', width: '100%' }}
      />

      <section className={styles.headerSection}>
        <img
          src={writingHero}
          alt="Writing Hero"
          className={styles.heroImage}
        />
      </section>

      <section className={styles.postsSection}>
        <h2 className={styles.postsHeading}>Writing Posts</h2>
        <div className={styles.blogGrid}>
          {posts.map((post) => (
            <div
              key={post.id}
              className={styles.blogCard}
              onClick={() => navigate(`/writings/${post.id}`)}
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

export default WritingPage;
