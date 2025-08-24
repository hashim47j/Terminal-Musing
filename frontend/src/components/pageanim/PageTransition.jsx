import React, { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import styles from './PageTransition.module.css';
import usePageTransition from './usePageTransition.js'; // Added .js extension

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

    // Force a reflow to ensure the incoming page is positioned
    if (containerRef.current) {
      containerRef.current.offsetHeight;
    }

    // Start the animation after a small delay
    const animationTimer = setTimeout(() => {
      // Trigger the slide animation
      setCurrentPage(null); // This will trigger the slide out
      
      // Complete the transition after animation duration
      const completeTimer = setTimeout(() => {
        setCurrentPage(children);
        setIncomingPage(null);
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

  const getPageWrapperClasses = () => {
    let classes = [styles.pageWrapper];
    
    if (isTransitioning) {
      classes.push(styles.transitioning);
      
      if (!currentPage) {
        // Page is sliding out
        classes.push(
          transitionDirection === 'right' ? styles.slideLeft : styles.slideRight
        );
      } else {
        classes.push(styles.slideIn);
      }
    }
    
    return classes.join(' ');
  };

  const getIncomingPageClasses = () => {
    let classes = [styles.incomingPage];
    
    if (isTransitioning) {
      if (currentPage) {
        // Incoming page is sliding in
        classes.push(styles.slideInComplete);
      } else {
        // Incoming page is waiting
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
      {currentPage && (
        <div className={getPageWrapperClasses()}>
          {currentPage}
        </div>
      )}
      
      {/* Incoming Page */}
      {incomingPage && (
        <div className={getIncomingPageClasses()}>
          {incomingPage}
        </div>
      )}
    </div>
  );
};

export default PageTransition;
