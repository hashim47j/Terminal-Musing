import React, { useState, useEffect } from 'react';
import styles from './PageTransition.module.css';
import { usePageTransition } from './PageTransitionContext';

const PageTransition = ({ children }) => {
  const { isTransitioning, transitionDirection, completeTransition } = usePageTransition();
  const [animationPhase, setAnimationPhase] = useState('idle');

  useEffect(() => {
    if (isTransitioning) {
      // Start the phased animation on the CURRENT page
      setAnimationPhase('phase1'); // Black & White

      const phase2Timer = setTimeout(() => setAnimationPhase('phase2'), 300); // Blur
      const phase3Timer = setTimeout(() => setAnimationPhase('phase3'), 600); // Drift

      // After the animation is finished, tell the context to navigate
      const finalTimer = setTimeout(() => {
        completeTransition();
        // Reset the animation phase for the new page
        setTimeout(() => setAnimationPhase('idle'), 50);
      }, 1200); // Total animation duration

      return () => {
        clearTimeout(phase2Timer);
        clearTimeout(phase3Timer);
        clearTimeout(finalTimer);
      };
    }
  }, [isTransitioning, completeTransition]);

  return (
    <div
      className={`
        ${styles.pageWrapper}
        ${isTransitioning ? styles.isAnimating : ''}
        ${animationPhase === 'phase1' ? styles.phase1_bw : ''}
        ${animationPhase === 'phase2' ? styles.phase2_blur : ''}
        ${animationPhase === 'phase3' ? (transitionDirection === 'right' ? styles.phase3_driftLeft : styles.phase3_driftRight) : ''}
      `}
    >
      {children}
    </div>
  );
};

export default PageTransition;
