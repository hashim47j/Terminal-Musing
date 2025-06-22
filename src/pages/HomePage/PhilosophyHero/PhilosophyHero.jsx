// Terminal-Musing/src/pages/HomePage/PhilosophyHero/PhilosophyHero.jsx
import React, { useRef } from 'react'; // <<-- NEW: Import useRef
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion'; // <<-- NEW: Import useScroll, useTransform
import styles from './PhilosophyHero.module.css';
import sisyphusImage from '../../../assets/sisyphus-sketch.jpg'; // Adjust path if needed

const PhilosophyHero = () => {
  const ref = useRef(null); // <<-- NEW: Create a ref for this section

  // <<-- NEW: Use useScroll to track scroll progress of THIS section -->>
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"] // Tracks progress as element enters/leaves viewport
  });

  // <<-- NEW: Use useTransform to map scroll progress to opacity -->>
  const opacity = useTransform(scrollYProgress,
    [0, 0.1, 0.9, 1], // Input range (scrollYProgress from 0 to 1)
    [0, 1, 1, 0]     // Output range (opacity from 0 to 1 and back to 0)
  );

  return (
    <motion.section
      ref={ref} // <<-- NEW: Assign the ref to the motion.section
      className={styles.philosophyHero}
      style={{ opacity }} // <<-- NEW: Apply the dynamically calculated opacity
    >
      <div className={styles.contentWrapper}>
        <h1 className={styles.mainHeading}>
          The unexamined life <br /> is not worth living.
        </h1>
        <p className={styles.description}>
          Dive into the profound questions that have shaped human thought, explore the ideas of great thinkers, and find new perspectives on existence, knowledge, values, and reason.
        </p>
        <Link to="/philosophy" className={styles.categoryTag}>Explore Philosophy</Link>
      </div>
      <div className={styles.imageWrapper}>
        <img src={sisyphusImage} alt="Sisyphus" className={styles.sisyphusImage} />
        <p className={styles.camusQuote}>
          "The struggle itself toward the heights is enough to fill a man's heart. One must imagine Sisyphus happy." <br /> — Albert Camus
        </p>
      </div>
    </motion.section>
  );
};

export default PhilosophyHero;