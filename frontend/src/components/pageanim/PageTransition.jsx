import React, { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import styles from './PageTransition.module.css';
import usePageTransition from './usePageTransition';

const PageTransition = ({ children }) => {
  const location = useLocation();
  const { 
    isTransitioning, 
    transitionDirection, 
    isMobile, 
    startTransition, 
    endTransition 
  } = usePageTransition();
  
  const [currentPage, setCurrentPage] = useState(children);
  const [incomingPage, setIncomingPage] = useState(null);
  const [animationPhase, setAnimationPhase] = useState('idle'); // 'idle', 'starting', 'animating'
  const previousPath = useRef(location.pathname);
  const containerRef = useRef(null);

  useEffect(() => {
    const currentPath = location.pathname;
    const prevPath = previousPath.current;

    if (currentPath === prevPath) {
      return;
    }

    const shouldAnimate = startTransition(prevPath, currentPath);
    
    if (!shouldAnimate || isMobile) {
      setCurrentPage(children);
      previousPath.current = currentPath;
      return;
    }

    console.log('🎬 Starting animation from', prevPath, 'to', currentPath, 'direction:', transitionDirection);

    // Phase 1: Setup incoming page
    setAnimationPhase('starting');
    setIncomingPage(children);

    // Phase 2: Start animation after DOM update
    setTimeout(() => {
      setAnimationPhase('animating');
      
      // Phase 3: Complete animation
      setTimeout(() => {
        setCurrentPage(children);
        setIncomingPage(null);
        setAnimationPhase('idle');
        endTransition();
        previousPath.current = currentPath;
        console.log('✅ Animation completed');
      }, 650); // Slightly longer than CSS transition
    }, 50);

  }, [location.pathname, children, startTransition, endTransition, isMobile]);

  if (isMobile) {
    return <>{children}</>;
  }

  return (
    <div 
      ref={containerRef}
      className={`${styles.transitionContainer} ${isTransitioning ? styles.transitioning : ''}`}
    >
      {/* Current/Outgoing Page */}
      {currentPage && (
        <div 
          className={`
            ${styles.pageWrapper} 
            ${animationPhase === 'animating' ? styles.transitioning : ''}
            ${animationPhase === 'animating' ? (transitionDirection === 'right' ? styles.slideLeft : styles.slideRight) : ''}
          `}
        >
          {currentPage}
        </div>
      )}
      
      {/* Incoming Page */}
      {incomingPage && (
        <div 
          className={`
            ${styles.incomingPage}
            ${animationPhase === 'starting' ? (transitionDirection === 'right' ? styles.fromRight : styles.fromLeft) : ''}
            ${animationPhase === 'animating' ? styles.slideInComplete : ''}
          `}
        >
          {incomingPage}
        </div>
      )}
    </div>
  );
};

export default PageTransition;
