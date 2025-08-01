import React, { useEffect, useRef } from 'react';
import PhilosophyHero from './PhilosophyHero/PhilosophyHero';
import HistoryHero from './HistoryHero/HistoryHero';
import LsiHero from './LsiHero/LsiHero';
import TechHero from './TechHero/TechHero';
import WritingsHero from './WritingsHero/WritingsHero';
import styles from './HomePage.module.css';

const HomePage = () => {
  const squareRef = useRef();

  const handleMouseMove = (e) => {
    const square = squareRef.current;
    if (square) {
      const x = e.clientX;
      const y = e.clientY;
      square.style.transform = `translate(${x - 75}px, ${y - 75}px)`; // center the 150px square
    }
  };

  return (
    <div
      className={styles.fullPageContainer}
      onMouseMove={handleMouseMove}
    >
      {/* Glowing cursor-following square */}
      <div ref={squareRef} className={styles.cursorSquare} />

      <div className={styles.pageSection}>
        <PhilosophyHero />
      </div>
      <div className={styles.pageSection}>
        <HistoryHero />
      </div>
      <div className={styles.pageSection}>
        <LsiHero />
      </div>
      <div className={styles.pageSection}>
        <TechHero />
      </div>
      <div className={styles.pageSection}>
        <WritingsHero />
      </div>
      
    </div>
  );
};

export default HomePage;