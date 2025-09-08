import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import styles from './PageTransition.module.css';
import { usePageTransition } from './PageTransitionContext';

const PageTransition = ({ children }) => {
  const location = useLocation();
  const { isTransitioning, transitionDirection, endTransition } = usePageTransition();

  const [page, setPage] = useState({
    current: children,
    previous: null,
  });
  const [animationPhase, setAnimationPhase] = useState('idle'); // idle -> phase1 -> phase2 -> phase3
  const previousLocationRef = useRef(location.pathname);

  useEffect(() => {
    if (location.pathname !== previousLocationRef.current) {
      previousLocationRef.current = location.pathname;

      if (isTransitioning && window.innerWidth > 768) {
        // Step 1: Capture pages and start phase 1 (B&W)
        setPage({ current: children, previous: page.current });
        setAnimationPhase('phase1');

        // Step 2: After a delay, start phase 2 (Blur)
        const phase2Timer = setTimeout(() => {
          setAnimationPhase('phase2');
        }, 300); // Duration for B&W effect to complete

        // Step 3: After another delay, start phase 3 (Drift + New Page In)
        const phase3Timer = setTimeout(() => {
          setAnimationPhase('phase3');
        }, 600); // Total time before drift starts

        // Step 4: After the full animation, cleanup
        const cleanupTimer = setTimeout(() => {
          endTransition();
          setPage({ current: children, previous: null });
          setAnimationPhase('idle');
        }, 1200); // Total animation duration

        return () => {
          clearTimeout(phase2Timer);
          clearTimeout(phase3Timer);
          clearTimeout(cleanupTimer);
        };
      } else {
        // No animation, just update the page
        setPage({ current: children, previous: null });
        if (isTransitioning) endTransition();
      }
    }
  }, [location, children, isTransitioning, endTransition, page.current]);

  const { current, previous } = page;

  // When not transitioning, just show the current page
  if (animationPhase === 'idle') {
    return <div className={styles.staticPageWrapper}>{current}</div>;
  }

  // During transition, render both pages and apply animation classes
  return (
    <div className={styles.transitionContainer}>
      {/* OUTGOING PAGE */}
      {previous && (
        <div
          className={`
            ${styles.pageWrapper}
            ${animationPhase === 'phase1' ? styles.phase1_bw : ''}
            ${animationPhase === 'phase2' ? styles.phase2_blur : ''}
            ${animationPhase === 'phase3' ? (transitionDirection === 'right' ? styles.phase3_driftLeft : styles.phase3_driftRight) : ''}
          `}
        >
          {previous}
        </div>
      )}
      
      {/* INCOMING PAGE */}
      {current && (
        <div
          className={`
            ${styles.pageWrapper}
            ${styles.incomingPage}
            ${animationPhase === 'phase3' ? styles.incoming_visible : ''}
          `}
        >
          {current}
        </div>
      )}
    </div>
  );
};

export default PageTransition;
