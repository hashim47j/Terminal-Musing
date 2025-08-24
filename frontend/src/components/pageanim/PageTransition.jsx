import React, { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import styles from './PageTransition.module.css';
import usePageTransition from './usePageTransition.js';

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
  const [isAnimating, setIsAnimating] = useState(false);
  const previousPath = useRef(location.pathname);
  const containerRef = useRef(null);

  useEffect(() => {
    console.log('🔄 Location changed:', location.pathname);
    
    const currentPath = location.pathname;
    const prevPath = previousPath.current;

    // Skip if same path or already animating
    if (currentPath === prevPath || isAnimating) {
      console.log('⏭️ Skipping - same path or already animating');
      return;
    }

    const shouldAnimate = startTransition(prevPath, currentPath);
    console.log('🎬 Should animate:', shouldAnimate);
    
    if (!shouldAnimate || isMobile) {
      setCurrentPage(children);
      previousPath.current = currentPath;
      return;
    }

    console.log('✅ Starting animation');
    setIsAnimating(true);
    setIncomingPage(children);

    // Wait one frame to ensure DOM is ready
    requestAnimationFrame(() => {
      // Complete after animation duration
      setTimeout(() => {
        console.log('🏁 Completing animation');
        setCurrentPage(children);
        setIncomingPage(null);
        setIsAnimating(false);
        endTransition();
        previousPath.current = currentPath;
      }, 600);
    });

  }, [location.pathname]); // Removed other dependencies to prevent double triggers

  if (isMobile) {
    return <>{children}</>;
  }

  return (
    <div 
      ref={containerRef}
      className={`${styles.transitionContainer} ${isTransitioning ? styles.transitioning : ''}`}
    >
      {/* Current/Outgoing Page */}
      <div 
        className={`${styles.pageWrapper} ${isTransitioning && isAnimating ? styles.transitioning : ''} ${isTransitioning && isAnimating ? (transitionDirection === 'right' ? styles.slideLeft : styles.slideRight) : ''}`}
      >
        {currentPage}
      </div>
      
      {/* Incoming Page */}
      {incomingPage && isAnimating && (
        <div 
          className={`${styles.incomingPage} ${styles.slideInComplete}`}
        >
          {incomingPage}
        </div>
      )}
    </div>
  );
};

export default PageTransition;
