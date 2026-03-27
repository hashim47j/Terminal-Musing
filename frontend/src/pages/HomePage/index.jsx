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
  const wheelTimer = useRef(null);
  const lastWheelDelta = useRef(0);

  useEffect(() => {
    document.body.setAttribute('data-navbar-theme', SECTION_THEMES[0]);
    return () => document.body.removeAttribute('data-navbar-theme');
  }, []);

  // ── Theme on scroll ──
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
      top: container.clientHeight * 4,
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

    // ── Detect landing on end card ──
    const handleScroll = () => {
      const onLast = container.scrollTop >= container.clientHeight * 4.5;
      if (onLast && !isOnEndCard.current) {
        isOnEndCard.current = true;
        setEndCard(() => CARDS[Math.floor(Math.random() * CARDS.length)]);
      }
    };

    // ── Mouse wheel: wait until wheel fully stops ──
    // Uses longer debounce + checks delta is shrinking (wheel decelerating)
    const handleWheel = (e) => {
      if (!isOnEndCard.current) return;
      lastWheelDelta.current = Math.abs(e.deltaY);
      clearTimeout(wheelTimer.current);
      wheelTimer.current = setTimeout(() => {
        // Only snap back if wheel has fully stopped (delta near zero)
        snapBackToWritings();
      }, 400); // longer debounce for touchpad inertia
    };

    // ── Touchscreen: track swipe direction ──
    const handleTouchStart = (e) => {
      touchStartY.current = e.touches[0].clientY;
    };

    const handleTouchEnd = (e) => {
      if (!isOnEndCard.current) return;
      const deltaY = touchStartY.current - e.changedTouches[0].clientY;
      // Only snap back if swipe was upward (back toward content)
      // or finger just lifted with no significant movement
      if (deltaY < 20) {
        snapBackToWritings();
      }
    };

    // ── Touchpad: use pointerup as "finger lifted" signal ──
    const handlePointerUp = () => {
      if (!isOnEndCard.current) return;
      clearTimeout(wheelTimer.current);
      // Small delay so inertia scroll finishes first
      wheelTimer.current = setTimeout(() => {
        snapBackToWritings();
      }, 350);
    };

    container.addEventListener('scroll', handleScroll, { passive: true });
    container.addEventListener('wheel', handleWheel, { passive: true });
    container.addEventListener('touchstart', handleTouchStart, { passive: true });
    container.addEventListener('touchend', handleTouchEnd, { passive: true });
    container.addEventListener('pointerup', handlePointerUp);

    return () => {
      container.removeEventListener('scroll', handleScroll);
      container.removeEventListener('wheel', handleWheel);
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchend', handleTouchEnd);
      container.removeEventListener('pointerup', handlePointerUp);
      clearTimeout(wheelTimer.current);
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