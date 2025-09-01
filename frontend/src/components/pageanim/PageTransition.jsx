import React, { useEffect, useState, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import styles from './PageTransition.module.css';
import { usePageTransition } from './PageTransitionContext';

const PageTransition = ({ children }) => {
  const location = useLocation();
  const { isTransitioning, transitionDirection, endTransition } = usePageTransition();
  const [displayedPage, setDisplayedPage] = useState(children);
  const [previousPage, setPreviousPage] = useState(null);
  const [animationState, setAnimationState] = useState('idle');
  const previousLocation = useRef(location.pathname);
  const isCleaningUp = useRef(false); // Prevent multiple cleanups

  useEffect(() => {
    if (location.pathname === previousLocation.current || isCleaningUp.current) {
      return;
    }

    if (isTransitioning) {
      console.log('🎬 Route changed during transition, setting up animation');
      
      isCleaningUp.current = false;
      
      // Step 1: Prepare animation
      setAnimationState('prepare');
      setPreviousPage(displayedPage);
      
      // Step 2: Start animation
      const animateTimeout = setTimeout(() => {
        if (!isCleaningUp.current) {
          setAnimationState('animate');
          
          // Step 3: Complete animation with atomic state updates
          const completeTimeout = setTimeout(() => {
            if (!isCleaningUp.current) {
              isCleaningUp.current = true;
              
              // Atomic state update - all at once to prevent flicker
              setAnimationState('idle');
              setDisplayedPage(children);
              setPreviousPage(null);
              endTransition();
              previousLocation.current = location.pathname;
              
              // Reset cleanup flag after a small delay
              setTimeout(() => {
                isCleaningUp.current = false;
              }, 50);
              
              console.log('✅ Animation completed cleanly');
            }
          }, 650);

          return () => clearTimeout(completeTimeout);
        }
      }, 50);

      return () => clearTimeout(animateTimeout);
    } else {
      // No animation - just update normally
      setDisplayedPage(children);
      previousLocation.current = location.pathname;
    }
  }, [location.pathname, isTransitioning, children, displayedPage, endTransition]);

  // Clean exit if component unmounts during transition
  useEffect(() => {
    return () => {
      isCleaningUp.current = true;
    };
  }, []);

  if (window.innerWidth <= 768) {
    return <>{children}</>;
  }

  return (
    <div className={`${styles.transitionContainer} ${isTransitioning ? styles.transitioning : ''}`}>
      
      {/* Current/Old page */}
      {animationState !== 'idle' && previousPage && (
        <div 
          className={`
            ${styles.pageWrapper} 
            ${styles.transitioning}
            ${animationState === 'animate' ? (transitionDirection === 'right' ? styles.slideRight : styles.slideLeft) : ''}
          `}
          style={{
            zIndex: animationState === 'animate' ? 1 : 2
          }}
        >
          {previousPage}
        </div>
      )}
      
      {/* New page sliding in */}
      {animationState !== 'idle' && children && (
        <div 
          className={`
            ${styles.incomingPage}
            ${animationState === 'prepare' ? (transitionDirection === 'right' ? styles.fromLeft : styles.fromRight) : ''}
            ${animationState === 'animate' ? styles.slideInComplete : ''}
          `}
          style={{
            zIndex: animationState === 'animate' ? 2 : 1
          }}
        >
          {children}
        </div>
      )}

      {/* Final settled page - only show when idle */}
      {animationState === 'idle' && (
        <div className={styles.pageWrapper}>
          {displayedPage}
        </div>
      )}
      
    </div>
  );
};

export default PageTransition;
