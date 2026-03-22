import React, { useEffect, useRef, useState, useCallback } from 'react';
import PhilosophyHero from './PhilosophyHero/PhilosophyHero';
import HistoryHero from './HistoryHero/HistoryHero';
import LsiHero from './LsiHero/LsiHero';
import TechHero from './TechHero/TechHero';
import WritingsHero from './WritingsHero/WritingsHero';
import styles from './HomePage.module.css';
import { AbyssCard, StarfieldCard, TypewriterCard, MirrorCard, ArchiveCard } from './OverscrollCard/OverscrollCard';

const CARDS = [AbyssCard, StarfieldCard, TypewriterCard, MirrorCard, ArchiveCard];

const HomePage = () => {
  const squareRef = useRef();
  const containerRef = useRef();
  const [isMobile, setIsMobile] = useState(false);
  const [EndCard] = useState(() => CARDS[Math.floor(Math.random() * CARDS.length)]);
  const touchStartY = useRef(null);
  const isOnEndCard = useRef(false);

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

  // Snap back to WritingsHero (5th page = index 4, so scrollTop = 4 * 100vh)
  const snapBackToWritings = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;
    container.style.scrollSnapType = 'none';
    container.scrollTo({
      top: container.clientHeight * 4.5, // 4 * 100vh = WritingsHero
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

    // Detect when user scrolls onto the end card page
    const handleScroll = () => {
      const onLast = container.scrollTop >= container.clientHeight * 4.9;
      if (onLast && !isOnEndCard.current) {
        isOnEndCard.current = true;
      }
    };

    // ── Desktop: snap back on wheel release ──
    let wheelTimer = null;
    const handleWheel = () => {
      if (!isOnEndCard.current) return;
      clearTimeout(wheelTimer);
      wheelTimer = setTimeout(() => {
        snapBackToWritings();
      }, 180); // snap back shortly after wheel stops
    };

    // ── Mobile: snap back on finger lift ──
    const handleTouchStart = (e) => {
      touchStartY.current = e.touches[0].clientY;
    };

    const handleTouchEnd = () => {
      if (isOnEndCard.current) {
        snapBackToWritings();
      }
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

      {/* 6th page — visible while scrolling, springs back on release */}
      <div className={styles.pageSectionEnd}>
        <EndCard />
      </div>

    </div>
  );
};

export default HomePage;
