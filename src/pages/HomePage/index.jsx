// Terminal-Musing/src/pages/HomePage/index.jsx
import React from 'react';
import PhilosophyHero from './PhilosophyHero/PhilosophyHero';
import HistoryHero from './HistoryHero/HistoryHero';
import styles from './HomePage.module.css'; // Ensure this import is present

const HomePage = () => {
  return (
    <div className={styles.fullPageContainer}>
      <PhilosophyHero />
      <HistoryHero />
      {/* Add any other full-page sections here */}
    </div>
  );
};

export default HomePage;