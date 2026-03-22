import React, { useEffect, useRef, useState } from 'react';
import PhilosophyHero from './PhilosophyHero/PhilosophyHero';
import HistoryHero from './HistoryHero/HistoryHero';
import LsiHero from './LsiHero/LsiHero';
import TechHero from './TechHero/TechHero';
import WritingsHero from './WritingsHero/WritingsHero';
import OverscrollCard from './OverscrollCard/OverscrollCard'; // ✅ ADD
import styles from './HomePage.module.css';

const HomePage = () => {
  const squareRef = useRef();
  const containerRef = useRef(); // ✅ ADD
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768 || 'ontouchstart' in window);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleMouseMove = (e) => {
    if (isMobile) return;
    const square = squareRef.current;
    if (square) {
      square.style.transform = `translate(${e.clientX - 75}px, ${e.clientY - 75}px)`;
    }
  };

  return (
    <div
      ref={containerRef} // ✅ ADD
      className={styles.fullPageContainer}
      onMouseMove={handleMouseMove}
      data-navbar-no-shadow
    >
      {!isMobile && <div ref={squareRef} className={styles.cursorSquare} />}

      <div className={styles.pageSection}><PhilosophyHero /></div>
      <div className={styles.pageSection}><HistoryHero /></div>
      <div className={styles.pageSection}><LsiHero /></div>
      <div className={styles.pageSection}><TechHero /></div>
      <div className={styles.pageSection}><WritingsHero /></div>

      {/* ✅ ADD — passes the scroll container ref */}
      <OverscrollCard scrollContainerRef={containerRef} />
    </div>
  );
};

export default HomePage;
