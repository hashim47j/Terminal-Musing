import React from 'react';
import { Link } from 'react-router-dom';
import styles from './HistoryHero.module.css';
import silkRoadMap from '../../../assets/silk-road-map.png';

const HistoryHero = () => {
  return (
    <section className={styles.historyHero}>
      <img src={silkRoadMap} alt="Silk Road Map" className={styles.silkRoadImage} />

      {/* Aapda ka Awsar – the overlay */}
      <div className={styles.overlay}></div>

      <h1 className={styles.mainHeading}>
        History is not a thing <br /> of past.
      </h1>

      <p className={styles.description}>
        It echoes in the future with strange faces <br /> and in modern clothes.
      </p>

      <Link to="/history" className={styles.categoryTag}>History</Link>
    </section>
  );
};

export default HistoryHero;
