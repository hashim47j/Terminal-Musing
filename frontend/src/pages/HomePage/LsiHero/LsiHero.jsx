// Terminal-Musing/src/pages/HomePage/LsiHero/LsiHero.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import styles from './LsiHero.module.css';

// Import the Magna Carta image
import magnaCartaImage from '../../../assets/magnacarta.png';

const LsiHero = () => {
  return (
    <section className={styles.lsiHero}>
      {/* --- SENSOR ADDED --- */}
      {/* This tells the Navbar that this section has a light background. */}
      <div data-navbar-bg-detect></div>

      <div className={styles.contentWrapper}>
        <h1 className={styles.mainHeading}>Social struggle evolves the way of justice</h1>
        <p className={styles.description}>
          And justice is something which strives to propagate the truth even if one against a thousand dares to speak.
        </p>
        <Link to="/legal-social" className={styles.categoryTag}>Legal and Social Issues</Link>
      </div>
      <div className={styles.imageWrapper}>
        <img src={magnaCartaImage} alt="Magna Carta signing ceremony" className={styles.magnaCartaImage} />
      </div>
    </section>
  );
};

export default LsiHero;
