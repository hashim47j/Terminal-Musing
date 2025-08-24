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
  const [animationKey, setAnimationKey] = useState(0); // FORCE ANIMATION RESTART
  const previousLocation = useRef(location.pathname);

  useEffect(() => {
    if (location.pathname === previousLocation.current) {
      return;
    }

    if (isTransitioning) {
      console.log('🎬 STARTING ANIMATION');
      
      // FORCE NEW ANIMATION by changing key
      setAnimationKey(prev => prev + 1);
      
      setAnimationState('prepare');
      setPreviousPage(displayedPage);
      
      // Use requestAnimationFrame to ensure proper timing
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          console.log('🎬 ANIMATE NOW');
          setAnimationState('animate');
          
          setTimeout(() => {
            console.log('🎬 COMPLETE');
            setDisplayedPage(children);
            setPreviousPage(null);
            setAnimationState('idle');
            endTransition();
            previousLocation.current = location.pathname;
          }, 900);
        });
      });
    } else {
      setDisplayedPage(children);
      previousLocation.current = location.pathname;
    }
  }, [location.pathname, isTransitioning, children, displayedPage, endTransition]);

  if (window.innerWidth <= 768) {
    return <>{children}</>;
  }

  return (
    <div className={styles.transitionContainer}>
      
      {/* OLD PAGE - Force restart with key */}
      <div 
        key={`old-${animationKey}`} // FORCE RE-RENDER
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
      
      {/* NEW PAGE - Force restart with key */}
      {animationState !== 'idle' && (
        <div 
          key={`new-${animationKey}`} // FORCE RE-RENDER
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
