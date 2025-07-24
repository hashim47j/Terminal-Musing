// Terminal-Musing/src/pages/LsconcernPage/LsConcernPage.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './LsconcernPage.module.css';
import socialHero from '../../assets/social-hero.png'; // overlay image
import socialBackground from '../../assets/social-bg.jpg'; // new background

const LsConcernPage = () => {
  const navigate = useNavigate();

  const posts = [
    {
      id: 'free-speech',
      title: 'Freedom of Expression in Modern Democracies',
      subheading: 'A look at rights, censorship, and digital platforms.',
      coverImage: '/uploads/legal-speech.jpg',
      date: '2023-08-15'
    },
    {
      id: 'digital-privacy',
      title: 'The Digital Privacy Dilemma',
      subheading: 'Where do our rights end and surveillance begin?',
      coverImage: '/uploads/legal-privacy.jpg',
      date: '2024-02-01'
    }
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
        <img src={socialHero} alt="liberté toujours" className={styles.heroImage} />
      </section>

      {/* Posts */}
      <section className={styles.postsSection}>
        <h2 className={styles.postsHeading}>Legal & Social Posts</h2>
        <div className={styles.blogGrid}>
          {posts.map((post) => (
            <div
              key={post.id}
              className={styles.blogCard}
              onClick={() => navigate(`/blogs/legal-social/${post.id}`)}
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

export default LsConcernPage;
