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
  const lastSectionRef = useRef();
  const [isMobile, setIsMobile] = useState(false);
  const [peelProgress, setPeelProgress] = useState(0);
  const [EndCard] = useState(() => CARDS[Math.floor(Math.random() * CARDS.length)]);
  const touchStartY = useRef(null);
  const springRef = useRef(null);
  const isPeeling = useRef(false);

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

  const springBack = useCallback(() => {
    isPeeling.current = false;
    if (springRef.current) cancelAnimationFrame(springRef.current);
    const animate = () => {
      setPeelProgress(prev => {
        if (prev <= 0.005) return 0;
        springRef.current = requestAnimationFrame(animate);
        return prev * 0.78;
      });
    };
    springRef.current = requestAnimationFrame(animate);
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // ✅ Check if the lastPageWrapper is snapped into view
    const isAtBottom = () =>
      container.scrollHeight - container.scrollTop - container.clientHeight < 10;

    let wheelTimer = null;

    const handleWheel = (e) => {
      if (!isAtBottom()) return;
      if (e.deltaY > 0) {
        e.preventDefault();
        isPeeling.current = true;
        container.style.scrollSnapType = 'none';
        clearTimeout(wheelTimer);
        setPeelProgress(prev => Math.min(prev + e.deltaY / 350, 1));
        wheelTimer = setTimeout(() => {
          springBack();
          setTimeout(() => {
            container.style.scrollSnapType = 'y mandatory';
          }, 600);
        }, 120);
      }
    };

    const handleTouchStart = (e) => {
      touchStartY.current = e.touches[0].clientY;
    };

    const handleTouchMove = (e) => {
      if (!isAtBottom()) return;
      const dy = touchStartY.current - e.touches[0].clientY;
      if (dy <= 0) {
        if (isPeeling.current) springBack();
        return;
      }
      e.preventDefault();
      isPeeling.current = true;
      container.style.scrollSnapType = 'none';
      setPeelProgress(prev => Math.min(prev + dy / 260, 1));
      touchStartY.current = e.touches[0].clientY;
    };

    const handleTouchEnd = () => {
      if (isPeeling.current) {
        springBack();
        setTimeout(() => {
          container.style.scrollSnapType = 'y mandatory';
        }, 600);
      }
    };

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
  }, [springBack]);

  const peelY = peelProgress * 52;

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

      {/* ✅ Single wrapper — snap point, contains end card + last page */}
      <div className={styles.lastPageWrapper}>

        {/* End card behind — visible when last page peels up */}
        <div className={styles.endCardBehind}>
          <EndCard />
          <p
            className={styles.peelHint}
            style={{ opacity: Math.min(peelProgress * 3, 1) }}
          >
            Release to return ↓
          </p>
        </div>

        {/* Last page on top — peels upward on overscroll */}
        <div
  ref={lastSectionRef}
  className={styles.pageSectionLast}
  style={{
    transform: `translateY(-${peelY}vh)`,
    transition: peelProgress === 0
      ? 'transform 0.55s cubic-bezier(0.22, 1, 0.36, 1)'
      : 'none',
    boxShadow: peelProgress > 0.01
      ? `0 ${peelProgress * 24}px ${peelProgress * 48}px rgba(0,0,0,0.55)`
      : 'none',
    // ✅ This is the only change — ensures last page fully covers end card
    isolation: 'isolate',
    backgroundColor: '#000', // ← match whatever WritingsHero background is
  }}
>
  <WritingsHero />
</div>


      </div>
    </div>
  );
};

export default HomePage;
