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

  useEffect(() => {
    if (location.pathname === previousLocation.current) {
      return;
    }

    if (isTransitioning) {
      console.log('🎬 Starting animation, direction:', transitionDirection);
      
      // Step 1: Prepare both pages
      setAnimationState('prepare');
      setPreviousPage(displayedPage);
      
      // Step 2: Force browser to render the preparation state
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          console.log('🎬 Animating now');
          setAnimationState('animate');
          
          // Step 3: Complete animation
          setTimeout(() => {
            setDisplayedPage(children);
            setPreviousPage(null);
            setAnimationState('idle');
            endTransition();
            previousLocation.current = location.pathname;
            console.log('✅ Animation completed');
          }, 900);
        });
      });
    } else {
      setDisplayedPage(children);
      previousLocation.current = location.pathname;
    }
  }, [location.pathname, isTransitioning, children, displayedPage, endTransition, transitionDirection]);

  if (window.innerWidth <= 768) {
    return <>{children}</>;
  }

  return (
    <div className={`${styles.transitionContainer} ${animationState !== 'idle' ? styles.transitioning : ''}`}>
      
      {/* Old page - slides out */}
      <div 
        className={`
          ${styles.pageWrapper} 
          ${animationState === 'animate' ? (transitionDirection === 'right' ? styles.slideLeft : styles.slideRight) : ''}
        `}
        style={{
          position: animationState !== 'idle' ? 'absolute' : 'relative',
          top: 0,
          left: 0,
          width: '100%',
          zIndex: 1
        }}
      >
        {previousPage || displayedPage}
      </div>
      
      {/* New page - slides in */}
      {animationState !== 'idle' && (
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
