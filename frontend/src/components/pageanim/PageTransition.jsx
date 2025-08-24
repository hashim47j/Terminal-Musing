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

  // DEBUG: Log everything
  console.log('🔍 DEBUG:', {
    isTransitioning,
    transitionDirection,
    animationState,
    currentPath: location.pathname,
    previousPath: previousLocation.current
  });

  useEffect(() => {
    if (location.pathname === previousLocation.current) {
      return;
    }

    if (isTransitioning) {
      console.log('🎬 STARTING ANIMATION');
      console.log('🎬 Direction:', transitionDirection);
      
      setAnimationState('prepare');
      setPreviousPage(displayedPage);
      
      setTimeout(() => {
        console.log('🎬 ANIMATE STATE');
        setAnimationState('animate');
        
        setTimeout(() => {
          console.log('🎬 COMPLETE');
          setDisplayedPage(children);
          setPreviousPage(null);
          setAnimationState('idle');
          endTransition();
          previousLocation.current = location.pathname;
        }, 2000); // Made it 2 seconds for debugging
      }, 100);
    } else {
      setDisplayedPage(children);
      previousLocation.current = location.pathname;
    }
  }, [location.pathname, isTransitioning, children, displayedPage, endTransition, transitionDirection]);

  if (window.innerWidth <= 768) {
    return <>{children}</>;
  }

  // DEBUG: Log actual classes being applied
  const outgoingClasses = `
    ${styles.pageWrapper} 
    ${animationState === 'animate' ? (transitionDirection === 'right' ? styles.slideLeft : styles.slideRight) : ''}
  `;
  
  const incomingClasses = `
    ${styles.incomingPage}
    ${animationState === 'prepare' ? (transitionDirection === 'right' ? styles.fromRight : styles.fromLeft) : ''}
    ${animationState === 'animate' ? styles.slideInComplete : ''}
  `;

  console.log('🔍 Outgoing classes:', outgoingClasses);
  console.log('🔍 Incoming classes:', incomingClasses);
  console.log('🔍 Styles object:', styles);

  return (
    <div 
      className={styles.transitionContainer}
      style={{ border: '3px solid red', minHeight: '100vh' }} // Debug border
    >
      
      {/* Old page with debug styling */}
      <div 
        className={outgoingClasses}
        style={{
          position: animationState !== 'idle' ? 'absolute' : 'relative',
          top: 0,
          left: 0,
          width: '100%',
          zIndex: 1,
          border: '3px solid blue', // Debug border
          backgroundColor: 'rgba(0,0,255,0.1)' // Debug background
        }}
      >
        <h1 style={{color: 'red'}}>OLD PAGE: {previousPage ? 'Previous' : 'Current'}</h1>
        {previousPage || displayedPage}
      </div>
      
      {/* New page with debug styling */}
      {animationState !== 'idle' && (
        <div 
          className={incomingClasses}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            zIndex: 2,
            border: '3px solid green', // Debug border
            backgroundColor: 'rgba(0,255,0,0.1)' // Debug background
          }}
        >
          <h1 style={{color: 'green'}}>NEW PAGE</h1>
          {children}
        </div>
      )}
      
    </div>
  );
};

export default PageTransition;
