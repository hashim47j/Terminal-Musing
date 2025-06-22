import React, { useRef, useEffect, useState } from 'react';
import PhilosophyHero from './PhilosophyHero/PhilosophyHero';
import HistoryHero from './HistoryHero/HistoryHero';
import styles from './HomePage.module.css';

const HomePage = () => {
  const [scrollY, setScrollY] = useState(0);
  const containerRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      const y = window.scrollY;
      setScrollY(y);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const fadeValue = (1 - Math.min(scrollY / window.innerHeight, 1)).toFixed(2);

  return (
    <div ref={containerRef} className={styles.fullPageContainer}>
      <div
        className={styles.pageSection}
        style={{ opacity: fadeValue, transition: 'opacity 0.5s ease-out' }}
      >
        <PhilosophyHero />
      </div>
      <div
        className={styles.pageSection}
        style={{ opacity: 1 - fadeValue, transition: 'opacity 0.5s ease-in' }}
      >
        <HistoryHero />
      </div>
    </div>
  );
};

export default HomePage;
