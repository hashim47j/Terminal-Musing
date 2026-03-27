import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useInView } from 'react-intersection-observer';
import PhilosophyHero from './PhilosophyHero/PhilosophyHero';
import HistoryHero from './HistoryHero/HistoryHero';
import LsiHero from './LsiHero/LsiHero';
import TechHero from './TechHero/TechHero';
import WritingsHero from './WritingsHero/WritingsHero';
import styles from './HomePage.module.css';
import { AbyssCard, StarfieldCard, TypewriterCard, MirrorCard, ArchiveCard } from './OverscrollCard/OverscrollCard';

const CARDS = [AbyssCard, StarfieldCard, TypewriterCard, MirrorCard, ArchiveCard];

const SECTIONS = [
  { Component: PhilosophyHero, light: false },  // ← adjust true/false per your actual bg
  { Component: HistoryHero,    light: false },
  { Component: LsiHero,        light: false },
  { Component: TechHero,       light: false },
  { Component: WritingsHero,   light: false },
];

// Each section watches itself — when it occupies the top of the scroll container, it sets the theme
const SectionWithSentinel = ({ Component, light, scrollRoot }) => {
  const { ref, inView } = useInView({
    root: scrollRoot,           // ✅ inner snap container, not viewport
    threshold: 0,
    rootMargin: '0px 0px -90% 0px', // trigger when top 10% of root is covered
  });

  useEffect(() => {
    if (inView) {
      document.body.setAttribute('data-navbar-theme', light ? 'light' : 'dark');
    }
  }, [inView, light]);

  return (
    <div className={styles.pageSection} style={{ position: 'relative' }}>
      <div ref={ref} style={{ position: 'absolute', top: 0, left: 0, height: '1px', width: '100%' }} />
      <Component />
    </div>
  );
};

const HomePage = () => {
  const squareRef = useRef();
  const containerRef = useRef();
  const [isMobile, setIsMobile] = useState(false);
  const [EndCard, setEndCard] = useState(() => CARDS[Math.floor(Math.random() * CARDS.length)]);
  const [scrollRoot, setScrollRoot] = useState(null); // ✅ state so children re-render with root

  const touchStartY = useRef(null);
  const isOnEndCard = useRef(false);

  // ✅ Set scrollRoot once container mounts
  useEffect(() => {
    if (containerRef.current) {
      setScrollRoot(containerRef.current);
    }
  }, []);

  // Set dark as default, clean up on unmount
  useEffect(() => {
    document.body.setAttribute('data-navbar-theme', 'dark');
    return () => document.body.removeAttribute('data-navbar-theme');
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

      {/* Only render sections once scrollRoot is known so useInView gets correct root */}
      {scrollRoot && SECTIONS.map(({ Component, light }, i) => (
        <SectionWithSentinel
          key={i}
          Component={Component}
          light={light}
          scrollRoot={scrollRoot}  // ✅ pass inner container as root
        />
      ))}

      <div className={styles.pageSectionEnd}>
        <EndCard />
      </div>
    </div>
  );
};

export default HomePage;