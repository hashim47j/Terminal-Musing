// Terminal-Musing/src/pages/HomePage/PhilosophyHero/PhilosophyHero.jsx
import React from 'react';
import { Link } from 'react-router-dom'; // Important for linking the "Philosophy" tag
import styles from './PhilosophyHero.module.css'; // Link to its specific CSS module

// Import your image - make sure you've placed it in the assets folder
// Or you can place it directly in the public folder and use a public path
import sisyphusSketch from '../../../assets/sisyphus-sketch.jpg';
// If you put it in `public` folder, you would use:
// const sisyphusSketch = '/sisyphus-sketch.jpg';

const PhilosophyHero = () => {
  return (
    <section className={styles.philosophyHero}>
      <div className={styles.contentWrapper}>
        <h1 className={styles.mainHeading}>With a thought it all began</h1>
        <p className={styles.description}>
          Philosophy challenges everything whether it is politics, love, morality, popular truth, culture, art or the god you believe in.
        </p>
        {/* The clickable "Philosophy" tag linking to its future page */}
        <Link to="/philosophy" className={styles.categoryTag}>Philosophy</Link>
      </div>
      <div className={styles.imageWrapper}>
        <img src={sisyphusSketch} alt="Sisyphus pushing a boulder - one must imagine sisyphus happy" className={styles.sisyphusImage} />
        <p className={styles.camusQuote}>
          "One must imagine sisyphus happy"<br />
          - Albert Camus
        </p>
      </div>
    </section>
  );
};

export default PhilosophyHero;