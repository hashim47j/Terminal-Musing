// Terminal-Musing/src/pages/HomePage/HistoryHero/HistoryHero.jsx
import React, { useRef } from 'react'; // <<-- NEW: Import useRef
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion'; // <<-- NEW: Import useScroll, useTransform
import styles from './HistoryHero.module.css';
import silkRoadMap from '../../../assets/silk-road-map.png';

const HistoryHero = () => {
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
  // This means:
  // 0% scrollYProgress (bottom of element hits bottom of viewport): opacity 0 (faded out)
  // 10% scrollYProgress (element starts to enter, 10% in view): opacity 1 (faded in)
  // 90% scrollYProgress (element almost completely in view, about to leave): opacity 1
  // 100% scrollYProgress (top of element hits top of viewport): opacity 0 (faded out)


  // Keep your existing variants if you still want them for initial entry
  const sectionVariants = {
    hidden: { opacity: 0, y: 100 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: 'easeOut' } },
  };

  const textVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: 'easeOut' } },
  };

  return (
    <motion.section
      ref={ref} // <<-- NEW: Assign the ref to the motion.section
      className={styles.historyHero}
      // Apply the animated opacity here
      style={{ opacity }} // <<-- NEW: Apply the dynamically calculated opacity
      // You can keep Framer Motion initial/whileInView if you want an *additional* entrance animation
      // However, the `opacity` from useTransform will override static opacity.
      // If you want initial opacity to be 1, ensure `offset` range and `useTransform` logic match.
      // For a seamless fade, it's often better to rely solely on `useTransform` for opacity.
      // If you have `initial="hidden"` and `visible="visible"` for `opacity: 0`, this might conflict.
      // Let's remove them for now to ensure `useTransform` is the primary opacity control.
      // variants={sectionVariants}
      // initial="hidden"
      // whileInView="visible"
      // viewport={{ once: true, amount: 0.3 }}
    >
      <div className={styles.imageAndOverlayWrapper}>
        <img
          src={silkRoadMap}
          alt="Ancient Silk Road Map"
          className={styles.silkRoadImage}
        />
        <div className={styles.overlay}></div>
      </div>

      {/* Text elements - you can decide if you want them to fade with the section or separately */}
      {/* If you want them to fade with the section, remove their individual `variants` */}
      <motion.h1 className={styles.mainHeading} /* variants={textVariants} */>
        History is not a thing <br /> of past.
      </motion.h1>
      <motion.p className={styles.description} /* variants={textVariants} transition={{ delay: 0.2 }}*/>
        It echoes in the future with strange faces <br /> and in modern clothes.
      </motion.p>
      <motion.div /* variants={textVariants} transition={{ delay: 0.4 }}*/>
        <Link to="/history" className={styles.categoryTag}>History</Link>
      </motion.div>
    </motion.section>
  );
};

export default HistoryHero;