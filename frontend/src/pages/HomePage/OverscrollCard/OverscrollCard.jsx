import React, { useEffect, useRef, useState, useCallback } from 'react';
import styles from './OverscrollCard.module.css';

// ── Typewriter hook ──
const useTypewriter = (texts, speed = 50, pause = 2000) => {
  const [displayed, setDisplayed] = useState('');
  const [textIndex, setTextIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const current = texts[textIndex];
    let timeout;
    if (!deleting && charIndex < current.length) {
      timeout = setTimeout(() => setCharIndex(i => i + 1), speed);
    } else if (!deleting && charIndex === current.length) {
      timeout = setTimeout(() => setDeleting(true), pause);
    } else if (deleting && charIndex > 0) {
      timeout = setTimeout(() => setCharIndex(i => i - 1), speed / 2);
    } else {
      setDeleting(false);
      setTextIndex(i => (i + 1) % texts.length);
    }
    setDisplayed(current.slice(0, charIndex));
    return () => clearTimeout(timeout);
  }, [charIndex, deleting, textIndex, texts, speed, pause]);

  return displayed;
};

// ── Card 1: Abyss ──
const AbyssCard = () => {
  const letters = "Terminal Musing".split('');
  return (
    <div className={styles.abyssCard}>
      <div className={styles.abyssLetters}>
        {letters.map((l, i) => (
          <span
            key={i}
            className={styles.abyssLetter}
            style={{ animationDelay: `${i * 0.08}s` }}
          >
            {l === ' ' ? '\u00A0' : l}
          </span>
        ))}
      </div>
      <p className={styles.abyssSubtext}>You've reached the edge of thought.</p>
    </div>
  );
};

// ── Card 2: Starfield ──
const StarfieldCard = () => {
  const stars = Array.from({ length: 60 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 2.5 + 0.5,
    duration: Math.random() * 4 + 2,
    delay: Math.random() * 3,
  }));
  return (
    <div className={styles.starfieldCard}>
      {stars.map(s => (
        <div key={s.id} className={styles.star} style={{
          left: `${s.x}%`, top: `${s.y}%`,
          width: `${s.size}px`, height: `${s.size}px`,
          animationDuration: `${s.duration}s`,
          animationDelay: `${s.delay}s`,
        }} />
      ))}
      <div className={styles.starfieldGlass}>
        <p className={styles.starfieldText}>There are no more pages.</p>
        <p className={styles.starfieldSubtext}>Only the void — and what you write next.</p>
      </div>
    </div>
  );
};

// ── Card 3: Typewriter ──
const TypewriterCard = () => {
  const quotes = [
    "The end of one thought is the beginning of another.",
    "To think is to voyage.",
    "Every scroll is a step. You've reached the floor.",
    "What lies beyond the last word?",
  ];
  const text = useTypewriter(quotes, 45, 2200);
  return (
    <div className={styles.typewriterCard}>
      <div className={styles.typewriterText}>
        {text}<span className={styles.cursor}>|</span>
      </div>
    </div>
  );
};

// ── Card 4: Mirror ──
const MirrorCard = () => (
  <div className={styles.mirrorCard}>
    <div className={styles.mirrorInner}>
      <div className={styles.mirrorTitle}>
        <span className={styles.mirrorTerminal}>Terminal</span>
        <span className={styles.mirrorMusing}> Musing</span>
      </div>
      <p className={styles.mirrorSub}>∞ You've come full circle.</p>
      <div className={styles.mirrorLine} />
      <p className={styles.mirrorQuote}>"The beginning is always today."</p>
    </div>
  </div>
);

// ── Card 5: Archive ──
const ArchiveCard = () => {
  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });
  return (
    <div className={styles.archiveCard}>
      <div className={styles.archivePaper}>
        <div className={styles.archiveHeader}>
          <div className={styles.archiveLine} />
          <p className={styles.archiveEdition}>TERMINAL MUSING</p>
          <div className={styles.archiveLine} />
        </div>
        <p className={styles.archiveDate}>{today}</p>
        <div className={styles.archiveRule} />
        <p className={styles.archiveHeadline}>END OF EDITION</p>
        <div className={styles.archiveRule} />
        <p className={styles.archiveBody}>
          All thoughts have been accounted for.<br />
          The press has gone quiet for the night.
        </p>
        <div className={styles.waxSeal}>✦</div>
      </div>
    </div>
  );
};

const CARDS = [AbyssCard, StarfieldCard, TypewriterCard, MirrorCard, ArchiveCard];

// ── Max peek height as fraction of viewport ──
const MAX_PEEK = 0.52; // 52% of screen height

const OverscrollCard = ({ scrollContainerRef }) => {
  const [progress, setProgress] = useState(0); // 0 = hidden, 1 = full peek
  const [CardComponent, setCardComponent] = useState(() => CARDS[0]);
  const [active, setActive] = useState(false);
  const touchStartY = useRef(null);
  const pickedRef = useRef(false);
  const springRef = useRef(null);

  const pickCard = useCallback(() => {
    if (!pickedRef.current) {
      pickedRef.current = true;
      setCardComponent(() => CARDS[Math.floor(Math.random() * CARDS.length)]);
    }
  }, []);

  // Animate progress back to 0 smoothly
  const springBack = useCallback(() => {
    if (springRef.current) cancelAnimationFrame(springRef.current);
    const animate = () => {
      setProgress(prev => {
        if (prev <= 0.01) {
          pickedRef.current = false;
          setActive(false);
          return 0;
        }
        springRef.current = requestAnimationFrame(animate);
        return prev * 0.82; // spring decay
      });
    };
    springRef.current = requestAnimationFrame(animate);
  }, []);

  useEffect(() => {
    const container = scrollContainerRef?.current;
    if (!container) return;

    const isAtBottom = () =>
      container.scrollHeight - container.scrollTop - container.clientHeight < 2;

    // ── Desktop wheel ──
    let wheelTimer = null;

    const handleWheel = (e) => {
      if (!isAtBottom() || e.deltaY <= 0) {
        if (active) springBack();
        return;
      }
      e.preventDefault();

      setActive(true);
      pickCard();

      setProgress(prev => Math.min(prev + e.deltaY / 400, 1));

      // Spring back when wheel stops
      clearTimeout(wheelTimer);
      wheelTimer = setTimeout(() => springBack(), 120);
    };

    // ── Mobile touch ──
    const handleTouchStart = (e) => {
      touchStartY.current = e.touches[0].clientY;
    };

    const handleTouchMove = (e) => {
      if (!isAtBottom()) return;
      const dy = touchStartY.current - e.touches[0].clientY;
      if (dy <= 0) {
        if (active) springBack();
        return;
      }
      e.preventDefault();
      setActive(true);
      pickCard();
      setProgress(prev => Math.min(prev + dy / 300, 1));
      touchStartY.current = e.touches[0].clientY;
    };

    const handleTouchEnd = () => {
      springBack();
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
  }, [scrollContainerRef, active, pickCard, springBack]);

  if (!active && progress === 0) return null;

  // Drawer height in vh — peaks at MAX_PEEK * 100vh
  const drawerHeight = progress * MAX_PEEK * 100;

  return (
    <div
      className={styles.drawer}
      style={{ height: `${drawerHeight}vh` }}
    >
      {/* Pull indicator at top of drawer */}
      <div className={styles.drawerHandle}>
        <div className={styles.handleBar} />
        <span
          className={styles.handleHint}
          style={{ opacity: Math.min(progress * 3, 1) }}
        >
          ↑ Keep scrolling to peek · Release to close
        </span>
      </div>

      {/* Card content — always rendered at full size, drawer clips it */}
      <div className={styles.drawerContent}>
        <CardComponent />
      </div>
    </div>
  );
};

export default OverscrollCard;
