import React, { useEffect, useRef, useState } from 'react';
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
export const AbyssCard = () => {
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
export const StarfieldCard = () => {
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
        <p className={styles.starfieldText}>There are no more pages.</p>
        <p className={styles.starfieldSubtext}>
          Only the void — and what you write next.
        </p>
      </div>
    </div>
  );
};

// ── Card 3: Typewriter ──
export const TypewriterCard = () => {
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
export const MirrorCard = () => (
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
export const ArchiveCard = () => {
  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
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
