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
  const [showBothPages, setShowBothPages] = useState(false);
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

    console.log('🎬 Animation:', prevPath, '→', currentPath, 'direction:', transitionDirection);

    // Step 1: Set up incoming page (positioned off-screen)
    setIncomingPage(children);
    setShowBothPages(false);

    // Step 2: Start animation after DOM update
    setTimeout(() => {
      setShowBothPages(true); // This triggers both pages to animate
      
      // Step 3: Complete animation
      setTimeout(() => {
        setCurrentPage(children);
        setIncomingPage(null);
        setShowBothPages(false);
        endTransition();
        previousPath.current = currentPath;
      }, 650);
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
      {/* Current/Outgoing Page - Always render during transition */}
      {(currentPage || isTransitioning) && (
        <div 
          className={`
            ${styles.pageWrapper} 
            ${showBothPages ? styles.transitioning : ''}
            ${showBothPages ? (transitionDirection === 'right' ? styles.slideRight : styles.slideLeft) : ''}
          `}
        >
          {currentPage}
        </div>
      )}
      
      {/* Incoming Page - Only render during transition */}
      {incomingPage && isTransitioning && (
        <div 
          className={`
            ${styles.incomingPage}
            ${showBothPages ? styles.slideInComplete : (transitionDirection === 'right' ? styles.fromLeft : styles.fromRight)}
          `}
        >
          {incomingPage}
        </div>
      )}
    </div>
  );
};

export default PageTransition;
