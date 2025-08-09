import React, { useEffect, useRef, useState } from 'react';
import PhilosophyHero from './PhilosophyHero/PhilosophyHero';
import HistoryHero from './HistoryHero/HistoryHero';
import LsiHero from './LsiHero/LsiHero';
import TechHero from './TechHero/TechHero';
import WritingsHero from './WritingsHero/WritingsHero';
import styles from './HomePage.module.css';

const HomePage = () => {
  const squareRef = useRef();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Check if device is mobile/touch
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768 || 'ontouchstart' in window);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleMouseMove = (e) => {
    if (isMobile) return; // Don't track mouse on mobile
    
    const square = squareRef.current;
    if (square) {
      const x = e.clientX;
      const y = e.clientY;
      square.style.transform = `translate(${x - 75}px, ${y - 75}px)`;
    }
  };

  return (
    <div
      className={styles.fullPageContainer}
      onMouseMove={handleMouseMove}
      data-navbar-no-shadow // ADD: This single line is all you need
    >
      {/* Conditionally render cursor square only on desktop */}
      {!isMobile && (
        <div ref={squareRef} className={styles.cursorSquare} />
      )}

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
