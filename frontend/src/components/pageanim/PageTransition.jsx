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

    // Force a reflow
    if (containerRef.current) {
      containerRef.current.offsetHeight;
    }

    // Start animation immediately
    setTimeout(() => {
      // Complete transition
      setTimeout(() => {
        setCurrentPage(children);
        setIncomingPage(null);
        endTransition();
        previousPath.current = currentPath;
      }, 600); // Match CSS transition duration
    }, 16); // One frame delay

  }, [location.pathname, children, startTransition, endTransition, isMobile]);

  // Don't render transition container on mobile
  if (isMobile) {
    return <>{children}</>;
  }

  return (
    <div 
      ref={containerRef}
      className={`${styles.transitionContainer} ${isTransitioning ? styles.transitioning : ''}`}
    >
      {/* Current/Outgoing Page */}
      <div className={`${styles.pageWrapper} ${isTransitioning ? styles.transitioning : ''} ${isTransitioning ? (transitionDirection === 'right' ? styles.slideLeft : styles.slideRight) : ''}`}>
        {currentPage}
      </div>
      
      {/* Incoming Page */}
      {incomingPage && (
        <div className={`${styles.incomingPage} ${isTransitioning ? styles.slideInComplete : (transitionDirection === 'right' ? styles.fromRight : styles.fromLeft)}`}>
          {incomingPage}
        </div>
      )}
    </div>
  );
};

export default PageTransition;
