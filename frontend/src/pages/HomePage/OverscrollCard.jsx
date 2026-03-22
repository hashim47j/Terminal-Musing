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
    } else if (deleting && charIndex === 0) {
      setDeleting(false);
      setTextIndex(i => (i + 1) % texts.length);
    }

    setDisplayed(current.slice(0, charIndex));
    return () => clearTimeout(timeout);
  }, [charIndex, deleting, textIndex, texts, speed, pause]);

  return displayed;
};

// ── Card 1: The Abyss ──
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
  const stars = Array.from({ length: 80 }, (_, i) => ({
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
        <div
          key={s.id}
          className={styles.star}
          style={{
            left: `${s.x}%`,
            top: `${s.y}%`,
            width: `${s.size}px`,
            height: `${s.size}px`,
            animationDuration: `${s.duration}s`,
            animationDelay: `${s.delay}s`,
          }}
        />
      ))}
      <div className={styles.starfieldGlass}>
        <p className={styles.starfieldText}>
          There are no more pages.
        </p>
        <p className={styles.starfieldSubtext}>
          Only the void — and what you write next.
        </p>
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
        {text}
        <span className={styles.cursor}>|</span>
      </div>
    </div>
  );
};

// ── Card 4: Inverted Mirror ──
const MirrorCard = () => (
  <div className={styles.mirrorCard}>
    <div className={styles.mirrorInner}>
      <div className={styles.mirrorTitle}>
        <span className={styles.mirrorTerminal}>Terminal</span>
        <span className={styles.mirrorMusing}> Musing</span>
      </div>
      <p className={styles.mirrorSub}>∞ You've come full circle.</p>
      <div className={styles.mirrorLine} />
      <p className={styles.mirrorQuote}>
        "The beginning is always today."
      </p>
    </div>
  </div>
);

// ── Card 5: Archive / Newspaper ──
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
        <div className={styles.archiveLine} />
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

// ── Main OverscrollCard ──
const OverscrollCard = ({ scrollContainerRef }) => {
  const [revealed, setRevealed] = useState(0); // 0–1 progress
  const [CardComponent, setCardComponent] = useState(() => CARDS[0]);
  const [isVisible, setIsVisible] = useState(false);
  const touchStartY = useRef(null);
  const lastScrollTop = useRef(0);
  const animFrameRef = useRef(null);
  const holdingRef = useRef(false);

  // Pick a random card once per visit to bottom
  const pickRandomCard = useCallback(() => {
    const idx = Math.floor(Math.random() * CARDS.length);
    setCardComponent(() => CARDS[idx]);
  }, []);

  useEffect(() => {
    const container = scrollContainerRef?.current;
    if (!container) return;

    const isAtBottom = () => {
      return container.scrollHeight - container.scrollTop - container.clientHeight < 2;
    };

    // ── Desktop: wheel overscroll ──
    const handleWheel = (e) => {
      if (!isAtBottom()) {
        if (revealed > 0) setRevealed(0);
        return;
      }
      if (e.deltaY <= 0) {
        // scrolling back up — snap back
        setRevealed(0);
        holdingRef.current = false;
        return;
      }

      e.preventDefault();
      holdingRef.current = true;

      setRevealed(prev => {
        const next = Math.min(prev + e.deltaY / 300, 1);
        if (next >= 0.05 && !isVisible) {
          setIsVisible(true);
          pickRandomCard();
        }
        return next;
      });
    };

    // Release on wheel end — snap back after short delay
    let wheelEndTimer = null;
    const handleWheelEnd = () => {
      clearTimeout(wheelEndTimer);
      wheelEndTimer = setTimeout(() => {
        if (holdingRef.current) {
          holdingRef.current = false;
          setRevealed(0);
          setTimeout(() => setIsVisible(false), 500);
        }
      }, 150);
    };

    // ── Mobile: touch overscroll ──
    const handleTouchStart = (e) => {
      touchStartY.current = e.touches[0].clientY;
    };

    const handleTouchMove = (e) => {
      if (!isAtBottom()) return;
      const deltaY = touchStartY.current - e.touches[0].clientY;
      if (deltaY <= 0) return;

      e.preventDefault();
      setRevealed(prev => {
        const next = Math.min(prev + deltaY / 250, 1);
        if (next >= 0.05 && !isVisible) {
          setIsVisible(true);
          pickRandomCard();
        }
        return next;
      });
      touchStartY.current = e.touches[0].clientY;
    };

    const handleTouchEnd = () => {
      // Snap back on finger lift
      setRevealed(0);
      setTimeout(() => setIsVisible(false), 500);
    };

    container.addEventListener('wheel', handleWheel, { passive: false });
    container.addEventListener('wheel', handleWheelEnd, { passive: true });
    container.addEventListener('touchstart', handleTouchStart, { passive: true });
    container.addEventListener('touchmove', handleTouchMove, { passive: false });
    container.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      container.removeEventListener('wheel', handleWheel);
      container.removeEventListener('wheel', handleWheelEnd);
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('touchend', handleTouchEnd);
      clearTimeout(wheelEndTimer);
    };
  }, [scrollContainerRef, revealed, isVisible, pickRandomCard]);

  if (!isVisible) return null;

  return (
    <div
      className={styles.overscrollWrapper}
      style={{
        opacity: Math.min(revealed * 2, 1),
        transform: `translateY(${(1 - revealed) * 60}px)`,
        transition: revealed === 0
          ? 'opacity 0.4s ease, transform 0.4s ease'
          : 'none',
      }}
    >
      <CardComponent />
      <p className={styles.releaseHint}>↑ Release to return</p>
    </div>
  );
};

export default OverscrollCard;
