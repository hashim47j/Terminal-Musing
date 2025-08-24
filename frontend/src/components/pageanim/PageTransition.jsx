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
    console.log('🔄 Location changed:', location.pathname);
    console.log('📍 Previous path:', previousPath.current);
    console.log('📱 Is mobile:', isMobile);

    const currentPath = location.pathname;
    const prevPath = previousPath.current;

    if (currentPath === prevPath) {
      console.log('⏭️ Same path, skipping animation');
      return;
    }

    const shouldAnimate = startTransition(prevPath, currentPath);
    console.log('🎬 Should animate:', shouldAnimate);
    console.log('➡️ Transition direction:', transitionDirection);
    
    if (!shouldAnimate || isMobile) {
      setCurrentPage(children);
      previousPath.current = currentPath;
      console.log('❌ No animation - mobile or admin page');
      return;
    }

    console.log('✅ Starting animation');
    setIncomingPage(children);

    setTimeout(() => {
      console.log('🏁 Completing animation');
      setTimeout(() => {
        setCurrentPage(children);
        setIncomingPage(null);
        endTransition();
        previousPath.current = currentPath;
      }, 600);
    }, 16);

  }, [location.pathname, children, startTransition, endTransition, isMobile]);

  if (isMobile) {
    return <>{children}</>;
  }

  console.log('🎨 Rendering - isTransitioning:', isTransitioning, 'hasIncomingPage:', !!incomingPage);

  return (
    <div 
      ref={containerRef}
      className={`${styles.transitionContainer} ${isTransitioning ? styles.transitioning : ''}`}
      style={{ border: '2px solid red' }} // Temporary visual indicator
    >
      {/* Current/Outgoing Page */}
      <div 
        className={`${styles.pageWrapper} ${isTransitioning ? styles.transitioning : ''} ${isTransitioning ? (transitionDirection === 'right' ? styles.slideLeft : styles.slideRight) : ''}`}
        style={{ border: '2px solid blue' }} // Temporary visual indicator
      >
        {currentPage}
      </div>
      
      {/* Incoming Page */}
      {incomingPage && (
        <div 
          className={`${styles.incomingPage} ${isTransitioning ? styles.slideInComplete : (transitionDirection === 'right' ? styles.fromRight : styles.fromLeft)}`}
          style={{ border: '2px solid green' }} // Temporary visual indicator
        >
          {incomingPage}
        </div>
      )}
    </div>
  );
};

export default PageTransition;
