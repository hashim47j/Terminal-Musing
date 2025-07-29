// /home/hash/Documents/Terminal-Musing/frontend/src/pages/HomePage/TechHero/TechHero.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import styles from './TechHero.module.css';

// Import the tech hero background image
import techHeroBg from '../../../assets/techherobg.png';

const TechHero = () => {
  return (
    <section className={styles.techHero}>
      <div className={styles.backgroundWrapper}>
        <img src={techHeroBg} alt="Tech binary background" className={styles.backgroundImage} />
        <div className={styles.overlay}></div>
      </div>
      <div className={styles.contentWrapper}>
        <h1 className={styles.mainHeading}>Pushing towards blind innovation</h1>
        <p className={styles.description}>
          To build without understanding is to automate ignorance.
        </p>
        <Link to="/technology" className={styles.categoryTag}>Technology</Link>
      </div>
    </section>
  );
};

export default TechHero;
