import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import styles from './PageTransition.module.css';
import { usePageTransition } from './PageTransitionContext';

const PageTransition = ({ children }) => {
  const location = useLocation();
  const { isTransitioning, transitionDirection, endTransition } = usePageTransition();

  const [display, setDisplay] = useState({
    content: children,
    isAnimating: false,
    animationPhase: 'idle',
    key: location.key,
  });

  useEffect(() => {
    // Only trigger animation if the route changes and a transition is requested
    if (location.key !== display.key && isTransitioning && window.innerWidth > 768) {
      
      // Keep the OLD content on screen and start the animation sequence
      setDisplay(prev => ({
        ...prev,
        isAnimating: true,
        animationPhase: 'phase1', // Start with B&W
      }));

      // Phase 2: Blur
      const phase2Timer = setTimeout(() => {
        setDisplay(prev => ({ ...prev, animationPhase: 'phase2' }));
      }, 300);

      // Phase 3: Drift
      const phase3Timer = setTimeout(() => {
        setDisplay(prev => ({ ...prev, animationPhase: 'phase3' }));
      }, 600);
      
      // Final Step: After animation, switch to the NEW content
      const finalTimer = setTimeout(() => {
        endTransition();
        setDisplay({
          content: children, // NOW we show the new page
          isAnimating: false,
          animationPhase: 'idle',
          key: location.key,
        });
      }, 1200); // Total animation time

      return () => {
        clearTimeout(phase2Timer);
        clearTimeout(phase3Timer);
        clearTimeout(finalTimer);
      };
    } else {
      // If not transitioning, update content immediately
      setDisplay({
        content: children,
        isAnimating: false,
        animationPhase: 'idle',
        key: location.key,
      });
      if (isTransitioning) endTransition();
    }
  }, [location, children, isTransitioning, endTransition]);

  return (
    <div
      className={`
        ${styles.pageWrapper}
        ${display.isAnimating ? styles.isAnimating : ''}
        ${display.animationPhase === 'phase1' ? styles.phase1_bw : ''}
        ${display.animationPhase === 'phase2' ? styles.phase2_blur : ''}
        ${display.animationPhase === 'phase3' ? (transitionDirection === 'right' ? styles.phase3_driftLeft : styles.phase3_driftRight) : ''}
      `}
    >
      {display.content}
    </div>
  );
};

export default PageTransition;
