import React, { useEffect, useState, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import styles from './PageTransition.module.css';
import { usePageTransition } from './PageTransitionContext';

const PageTransition = ({ children }) => {
  const location = useLocation();
  const { isTransitioning, transitionDirection, endTransition } = usePageTransition();
  
  const [displayedPage, setDisplayedPage] = useState(children);
  const [previousPage, setPreviousPage] = useState(null);
  const [animationState, setAnimationState] = useState('idle'); // 'idle', 'prepare', 'animate', 'complete'
  const previousLocation = useRef(location.pathname);

  useEffect(() => {
    if (location.pathname === previousLocation.current) {
      return;
    }

    if (isTransitioning) {
      console.log('🎬 Route changed during transition, setting up animation');
      
      // Step 1: Keep the OLD page visible and prepare the NEW page
      setAnimationState('prepare');
      setPreviousPage(displayedPage); // Keep the old page
      // Don't update displayedPage yet!
      
      // Step 2: Start the animation after one frame
      setTimeout(() => {
        setAnimationState('animate');
        
        // Step 3: Complete the animation
        setTimeout(() => {
          setDisplayedPage(children); // NOW show the new page
          setPreviousPage(null);      // Remove previous page immediately
          setAnimationState('idle');  // End animation state
          endTransition();
          previousLocation.current = location.pathname;
          console.log('✅ Animation completed: previousPage removed');
        }, 650);
      }, 50);
    } else {
      // No animation - just update normally
      setDisplayedPage(children);
      previousLocation.current = location.pathname;
    }
  }, [location.pathname, isTransitioning, children, displayedPage, endTransition]);

  if (window.innerWidth <= 768) {
    return <>{children}</>;
  }

  return (
    <div className={`${styles.transitionContainer} ${isTransitioning ? styles.transitioning : ''}`}>
      
      {/* Show the OLD page during transition */}
      {(animationState === 'prepare' || animationState === 'animate') && previousPage && (
        <div 
          className={`
            ${styles.pageWrapper} 
            ${animationState === 'animate' ? styles.transitioning : ''}
            ${animationState === 'animate' ? (transitionDirection === 'right' ? styles.slideRight : styles.slideLeft) : ''}
          `}
        >
          {previousPage}
        </div>
      )}

      {/* Show the new page ONLY when idle */}
      {animationState === 'idle' && displayedPage && (
        <div className={styles.pageWrapper}>
          {displayedPage}
        </div>
      )}
      
      {/* Show the NEW page sliding in during animation */}
      {(animationState === 'prepare' || animationState === 'animate') && children && (
        <div 
          className={`
            ${styles.incomingPage}
            ${animationState === 'prepare' ? (transitionDirection === 'right' ? styles.fromLeft : styles.fromRight) : ''}
            ${animationState === 'animate' ? styles.slideInComplete : ''}
          `}
        >
          {children}
        </div>
      )}
      
    </div>
  );
};

export default PageTransition;
