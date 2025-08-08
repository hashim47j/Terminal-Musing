import React from 'react';
import { Link } from 'react-router-dom';
import styles from './HistoryHero.module.css';
import silkRoadMap from '../../../assets/silk-road-map.png';

const HistoryHero = () => {
  return (
    <section className={styles.historyHero}>
      {/* --- OPTIONAL SENSOR --- */}
      {/* Uncomment the line below ONLY if this section has a light background */}
      {/* <div data-navbar-bg-detect></div> */}

      <img src={silkRoadMap} alt="Silk Road Map" className={styles.silkRoadImage} />
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
