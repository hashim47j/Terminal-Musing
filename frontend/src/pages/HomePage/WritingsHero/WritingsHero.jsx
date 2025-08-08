// /home/hash/Documents/Terminal-Musing/frontend/src/pages/HomePage/WritingsHero/WritingsHero.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import styles from './WritingsHero.module.css';

// Import the sculpture images
import danteImage from '../../../assets/dante.png';
import galibImage from '../../../assets/galib.png';
import twainImage from '../../../assets/twain.png';
import pushkinImage from '../../../assets/pushkin.png';
import sapphoImage from '../../../assets/sappho.png';
import shakespeareImage from '../../../assets/shakespeare.png';

const WritingsHero = () => {
  return (
    <section className={styles.writingsHero}>
      {/* --- SENSOR ADDED --- */}
      <div data-navbar-bg-detect></div>

      <div className={styles.contentWrapper}>
        <h1 className={styles.mainHeading}>It is not found in the order of words</h1>
        <div className={styles.haiku}>
          <p className={styles.haikuLine}>Poetry predates civilizations and languages</p>
          <p className={styles.haikuLine}>we did not invent it,</p>
          <p className={styles.haikuLine}>it is born with the human heart.</p>
        </div>
        <Link to="/writings" className={styles.categoryTag}>Writings</Link>
      </div>
      <div className={styles.sculpturesContainer}>
        <div className={styles.sculptureWrapper}>
          <img src={pushkinImage} alt="Pushkin sculpture" className={styles.sculptureImage} />
          <div className={styles.sculptureName}>Pushkin</div>
        </div>
        <div className={styles.sculptureWrapper}>
          <img src={galibImage} alt="Ghalib sculpture" className={styles.sculptureImage} />
          <div className={styles.sculptureName}>Ghalib</div>
        </div>
        <div className={styles.sculptureWrapper}>
          <img src={twainImage} alt="Mark Twain sculpture" className={styles.sculptureImage} />
          <div className={styles.sculptureName}>Mark Twain</div>
        </div>
        <div className={styles.sculptureWrapper}>
          <img src={shakespeareImage} alt="Shakespeare sculpture" className={styles.sculptureImage} />
          <div className={styles.sculptureName}>Shakespeare</div>
        </div>
        <div className={styles.sculptureWrapper}>
          <img src={sapphoImage} alt="Sappho sculpture" className={styles.sculptureImage} />
          <div className={styles.sculptureName}>Sappho</div>
        </div>
        <div className={styles.sculptureWrapper}>
          <img src={danteImage} alt="Dante sculpture" className={styles.sculptureImage} />
          <div className={styles.sculptureName}>Dante</div>
        </div>
      </div>
    </section>
  );
};

export default WritingsHero;
