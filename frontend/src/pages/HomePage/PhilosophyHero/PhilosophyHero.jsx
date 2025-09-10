// Terminal-Musing/src/pages/HomePage/PhilosophyHero/PhilosophyHero.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import styles from './PhilosophyHero.module.css';
import sisyphusSketch from '../../../assets/sisyphus-sketch.jpg';

const PhilosophyHero = () => {
  return (
    <section className={styles.philosophyHero}>
      {/* --- SENSOR ADDED --- */}
      {/* This div tells the Navbar that this section has a light background. */}
      <div data-navbar-bg-detect></div>

      <div className={styles.contentWrapper}>
        <h1 className={styles.mainHeading}>With a thought it all began</h1>
        <p className={styles.description}>
          Philosophy challenges everything whether it is politics, love, morality, popular truth, culture, art or the god you believe in.
        </p>
        <Link to="/philosophy" className={styles.categoryTag}>Philosophy</Link>
      </div>
      <div className={styles.imageWrapper}>
        <img src={sisyphusSketch} alt="Sisyphus pushing a boulder - one must imagine sisyphus happy" className={styles.sisyphusImage} />
      </div>
    </section>
  );
};

export default PhilosophyHero;
