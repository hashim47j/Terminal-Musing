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
  const [showBothPages, setShowBothPages] = useState(false);
  const previousPath = useRef(location.pathname);
  const containerRef = useRef(null);

  useEffect(() => {
    const currentPath = location.pathname;
    const prevPath = previousPath.current;

    // Skip animation if paths are the same
    if (currentPath === prevPath) {
      return;
    }

    // Start transition
    const shouldAnimate = startTransition(prevPath, currentPath);
    
    if (!shouldAnimate || isMobile) {
      // No animation - just update content immediately
      setCurrentPage(children);
      previousPath.current = currentPath;
      return;
    }

    // Set up incoming page
    setIncomingPage(children);
    setShowBothPages(true);

    // Force a reflow to ensure the incoming page is positioned
    if (containerRef.current) {
      containerRef.current.offsetHeight;
    }

    // Start the animation after a small delay
    const animationTimer = setTimeout(() => {
      // This will trigger both pages to animate simultaneously
      setShowBothPages(true);
      
      // Complete the transition after animation duration
      const completeTimer = setTimeout(() => {
        setCurrentPage(children);
        setIncomingPage(null);
        setShowBothPages(false);
        endTransition();
        previousPath.current = currentPath;
      }, 600); // Match CSS transition duration

      return () => clearTimeout(completeTimer);
    }, 50);

    return () => clearTimeout(animationTimer);
  }, [location.pathname, children, startTransition, endTransition, isMobile]);

  // Don't render transition container on mobile
  if (isMobile) {
    return <>{children}</>;
  }

  const getCurrentPageClasses = () => {
    let classes = [styles.pageWrapper];
    
    if (isTransitioning && showBothPages) {
      classes.push(styles.transitioning);
      // Current page slides out in the direction opposite to incoming page
      classes.push(
        transitionDirection === 'right' ? styles.slideLeft : styles.slideRight
      );
    }
    
    return classes.join(' ');
  };

  const getIncomingPageClasses = () => {
    let classes = [styles.incomingPage];
    
    if (isTransitioning) {
      classes.push(styles.transitioning);
      
      if (showBothPages) {
        // Incoming page slides in from the specified direction
        classes.push(styles.slideInComplete);
      } else {
        // Incoming page starts positioned off-screen
        classes.push(
          transitionDirection === 'right' ? styles.fromRight : styles.fromLeft
        );
      }
    }
    
    return classes.join(' ');
  };

  return (
    <div 
      ref={containerRef}
      className={`${styles.transitionContainer} ${isTransitioning ? styles.transitioning : ''}`}
    >
      {/* Current/Outgoing Page */}
      {currentPage && !incomingPage && (
        <div className={styles.pageWrapper}>
          {currentPage}
        </div>
      )}
      
      {/* During transition - show both pages */}
      {isTransitioning && currentPage && incomingPage && (
        <>
          {/* Current page sliding out */}
          <div className={getCurrentPageClasses()}>
            {currentPage}
          </div>
          
          {/* Incoming page sliding in */}
          <div className={getIncomingPageClasses()}>
            {incomingPage}
          </div>
        </>
      )}
      
      {/* After transition - show only new page */}
      {!isTransitioning && !incomingPage && (
        <div className={styles.pageWrapper}>
          {currentPage}
        </div>
      )}
    </div>
  );
};

export default PageTransition;
