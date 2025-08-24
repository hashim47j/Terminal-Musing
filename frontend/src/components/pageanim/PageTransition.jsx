import React, { useEffect, useState, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import styles from './PageTransition.module.css';
import { usePageTransition } from './PageTransitionContext';

const PageTransition = ({ children }) => {
  const location = useLocation();
  const { isTransitioning, transitionDirection, endTransition } = usePageTransition();
  
  const [displayedPage, setDisplayedPage] = useState(children);
  const [previousPage, setPreviousPage] = useState(null);
  const [animationState, setAnimationState] = useState('idle'); // Make sure this is defined
  const previousLocation = useRef(location.pathname);

  useEffect(() => {
    if (location.pathname === previousLocation.current) {
      return;
    }

    if (isTransitioning) {
      console.log('🎬 Route changed during transition, setting up animation');
      
      setAnimationState('prepare');
      setPreviousPage(displayedPage);
      
      setTimeout(() => {
        setAnimationState('animate');
        
        setTimeout(() => {
          setDisplayedPage(children);
          setPreviousPage(null);
          setAnimationState('idle');
          endTransition();
          previousLocation.current = location.pathname;
          console.log('✅ Animation completed');
        }, 900); // Match CSS timing
      }, 50);
    } else {
      setDisplayedPage(children);
      previousLocation.current = location.pathname;
    }
  }, [location.pathname, isTransitioning, children, displayedPage, endTransition]);

  if (window.innerWidth <= 768) {
    return <>{children}</>;
  }

  return (
    <div className={`${styles.transitionContainer} ${isTransitioning ? styles.transitioning : ''}`}>
      
      {/* Current/Previous page - slides out */}
      {(animationState === 'idle' || animationState === 'prepare' || animationState === 'animate') && displayedPage && (
        <div 
          className={`
            ${styles.pageWrapper} 
            ${animationState === 'animate' ? styles.transitioning : ''}
            ${animationState === 'animate' ? (transitionDirection === 'right' ? styles.slideLeft : styles.slideRight) : ''}
          `}
        >
          {animationState === 'prepare' || animationState === 'animate' ? previousPage : displayedPage}
        </div>
      )}
      
      {/* Incoming page - slides in */}
      {(animationState === 'prepare' || animationState === 'animate') && children && (
        <div 
          className={`
            ${styles.incomingPage}
            ${animationState === 'prepare' ? (transitionDirection === 'right' ? styles.fromRight : styles.fromLeft) : ''}
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
