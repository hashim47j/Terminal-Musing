import React, { useEffect, useRef, useState, useCallback } from 'react';
import PhilosophyHero from './PhilosophyHero/PhilosophyHero';
import HistoryHero from './HistoryHero/HistoryHero';
import LsiHero from './LsiHero/LsiHero';
import TechHero from './TechHero/TechHero';
import WritingsHero from './WritingsHero/WritingsHero';
import styles from './HomePage.module.css';

// ── End cards (paste your 5 card components here or import them) ──
import { AbyssCard, StarfieldCard, TypewriterCard, MirrorCard, ArchiveCard } from './OverscrollCard/OverscrollCard';

const CARDS = [AbyssCard, StarfieldCard, TypewriterCard, MirrorCard, ArchiveCard];

const HomePage = () => {
  const squareRef = useRef();
  const containerRef = useRef();
  const lastSectionRef = useRef();
  const [isMobile, setIsMobile] = useState(false);
  const [peelProgress, setPeelProgress] = useState(0); // 0–1
  const [EndCard] = useState(() => CARDS[Math.floor(Math.random() * CARDS.length)]);
  const touchStartY = useRef(null);
  const springRef = useRef(null);

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

  // Spring back to 0
  const springBack = useCallback(() => {
    if (springRef.current) cancelAnimationFrame(springRef.current);
    const animate = () => {
      setPeelProgress(prev => {
        if (prev <= 0.005) return 0;
        springRef.current = requestAnimationFrame(animate);
        return prev * 0.80;
      });
    };
    springRef.current = requestAnimationFrame(animate);
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const isAtBottom = () =>
      container.scrollHeight - container.scrollTop - container.clientHeight < 2;

    let wheelTimer = null;

    const handleWheel = (e) => {
      if (!isAtBottom() || e.deltaY <= 0) {
        if (peelProgress > 0) springBack();
        return;
      }
      e.preventDefault();
      clearTimeout(wheelTimer);
      setPeelProgress(prev => Math.min(prev + e.deltaY / 400, 1));
      wheelTimer = setTimeout(() => springBack(), 120);
    };

    const handleTouchStart = (e) => {
      touchStartY.current = e.touches[0].clientY;
    };

    const handleTouchMove = (e) => {
      if (!isAtBottom()) return;
      const dy = touchStartY.current - e.touches[0].clientY;
      if (dy <= 0) { springBack(); return; }
      e.preventDefault();
      setPeelProgress(prev => Math.min(prev + dy / 280, 1));
      touchStartY.current = e.touches[0].clientY;
    };

    const handleTouchEnd = () => springBack();

    container.addEventListener('wheel', handleWheel, { passive: false });
    container.addEventListener('touchstart', handleTouchStart, { passive: true });
    container.addEventListener('touchmove', handleTouchMove, { passive: false });
    container.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      container.removeEventListener('wheel', handleWheel);
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('touchend', handleTouchEnd);
      clearTimeout(wheelTimer);
      if (springRef.current) cancelAnimationFrame(springRef.current);
    };
  }, [peelProgress, springBack]);

  // Last page lifts up by up to 50vh
  const peelY = peelProgress * 50; // vh units

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

      {/* ── End card sits here, behind the last page ── */}
      <div className={styles.endCardBehind}>
        <EndCard />
        <p className={styles.peelHint} style={{ opacity: Math.min(peelProgress * 4, 1) }}>
          Release to return ↓
        </p>
      </div>

      {/* ── Last page peels up ── */}
      <div
        ref={lastSectionRef}
        className={styles.pageSectionLast}
        style={{
          transform: `translateY(-${peelY}vh)`,
          transition: peelProgress === 0 ? 'transform 0.5s cubic-bezier(0.22, 1, 0.36, 1)' : 'none',
          boxShadow: peelProgress > 0.01
            ? `0 ${peelProgress * 30}px ${peelProgress * 60}px rgba(0,0,0,0.5)`
            : 'none',
        }}
      >
        <WritingsHero />
      </div>
    </div>
  );
};

export default HomePage;
