import React from 'react';
import PhilosophyHero from './PhilosophyHero/PhilosophyHero';
import HistoryHero from './HistoryHero/HistoryHero';
import styles from './HomePage.module.css';

const HomePage = () => {
  return (
    <div className={styles.fullPageContainer}>
      <div className={styles.pageSection}>
        <PhilosophyHero />
      </div>
      <div className={styles.pageSection}>
        <HistoryHero />
      </div>
    </div>
  );
};

export default HomePage;
