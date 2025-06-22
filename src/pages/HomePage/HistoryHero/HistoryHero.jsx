import React from 'react';
import { Link } from 'react-router-dom';
import styles from './HistoryHero.module.css';
import silkRoadMap from '../../../assets/silk-road-map.png';

const HistoryHero = () => {
  return (
    <section className={styles.historyHero}>
      <div className={styles.imageWrapper}>
        <img
          src={silkRoadMap}
          alt="Silk Road Map"
          className={styles.silkRoadImage}
        />
      </div>

      <div className={styles.contentWrapper}>
        <h1 className={styles.mainHeading}>
          History is not a thing <br /> of past.
        </h1>
        <p className={styles.description}>
          It echoes in the future with strange faces <br /> and in modern clothes.
        </p>
        <div className={styles.buttonWrapper}>
          <Link to="/history" className={styles.categoryTag}>History</Link>
        </div>
      </div>
    </section>
  );
};

export default HistoryHero;
