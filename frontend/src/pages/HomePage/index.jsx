import React, { useEffect, useRef, useState, useCallback } from 'react';
import PhilosophyHero from './PhilosophyHero/PhilosophyHero';
import HistoryHero from './HistoryHero/HistoryHero';
import LsiHero from './LsiHero/LsiHero';
import TechHero from './TechHero/TechHero';
import WritingsHero from './WritingsHero/WritingsHero';
import styles from './HomePage.module.css';
import { AbyssCard, StarfieldCard, TypewriterCard, MirrorCard, ArchiveCard } from './OverscrollCard/OverscrollCard';

const CARDS = [AbyssCard, StarfieldCard, TypewriterCard, MirrorCard, ArchiveCard];

const SECTION_THEMES = [
  'light',  // PhilosophyHero
  'dark',   // HistoryHero
  'light',  // LsiHero
  'dark',   // TechHero
  'light',  // WritingsHero
];

const HomePage = () => {
  const squareRef = useRef();
  const containerRef = useRef();
  const [isMobile, setIsMobile] = useState(false);
  const [EndCard, setEndCard] = useState(() => CARDS[Math.floor(Math.random() * CARDS.length)]);

  const touchStartY = useRef(null);
  const isOnEndCard = useRef(false);

  useEffect(() => {
    document.body.setAttribute('data-navbar-theme', SECTION_THEMES[0]);
    return () => document.body.removeAttribute('data-navbar-theme');
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const index = Math.round(container.scrollTop / container.clientHeight);
      const theme = SECTION_THEMES[index] ?? SECTION_THEMES[SECTION_THEMES.length - 1];
      document.body.setAttribute('data-navbar-theme', theme);
    };

    container.addEventListener('scroll', handleScroll, { passive: true });
    return () => container.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const checkMobile = () =>
      setIsMobile(window.innerWidth <= 768 || 'ontouchstart' in window);
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

  const snapBackToWritings = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;
    container.style.scrollSnapType = 'none';
    container.scrollTo({
      top: container.clientHeight * 4.5,
      behavior: 'smooth',
    });
    setTimeout(() => {
      container.style.scrollSnapType = 'y mandatory';
      isOnEndCard.current = false;
    }, 600);
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const onLast = container.scrollTop >= container.clientHeight * 4.5;
      if (onLast && !isOnEndCard.current) {
        isOnEndCard.current = true;
        setEndCard(() => CARDS[Math.floor(Math.random() * CARDS.length)]);
      }
    };

    let wheelTimer = null;
    const handleWheel = () => {
      if (!isOnEndCard.current) return;
      clearTimeout(wheelTimer);
      wheelTimer = setTimeout(() => snapBackToWritings(), 180);
    };

    const handleTouchStart = (e) => {
      touchStartY.current = e.touches[0].clientY;
    };

    const handleTouchEnd = () => {
      if (isOnEndCard.current) snapBackToWritings();
    };

    container.addEventListener('scroll', handleScroll, { passive: true });
    container.addEventListener('wheel', handleWheel, { passive: true });
    container.addEventListener('touchstart', handleTouchStart, { passive: true });
    container.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      container.removeEventListener('scroll', handleScroll);
      container.removeEventListener('wheel', handleWheel);
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchend', handleTouchEnd);
      clearTimeout(wheelTimer);
    };
  }, [snapBackToWritings]);

  return (
    <div
      ref={containerRef}
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

      <div className={styles.pageSectionEnd}>
        <EndCard />
      </div>
    </div>
  );
};

export default HomePage;