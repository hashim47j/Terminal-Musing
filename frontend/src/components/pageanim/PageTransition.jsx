import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import styles from './PageTransition.module.css';
import { usePageTransition } from './PageTransitionContext';

const PageTransition = ({ children }) => {
  const location = useLocation();
  const { isTransitioning, transitionDirection, pendingNavigation, endTransition } = usePageTransition();
  
  const [currentPage, setCurrentPage] = useState(children);
  const [previousPage, setPreviousPage] = useState(null);

  useEffect(() => {
    if (isTransitioning && pendingNavigation) {
      console.log('🎬 Animation: keeping old page, preparing new page');
      
      // Keep old page visible, prepare new page
      setPreviousPage(currentPage);
      
      // Start animation after setup
      setTimeout(() => {
        console.log('🎬 Animation: both pages sliding');
        
        // Complete animation
        setTimeout(() => {
          setCurrentPage(children);
          setPreviousPage(null);
          endTransition();
          console.log('✅ Animation completed');
        }, 650);
      }, 50);
    } else if (!isTransitioning) {
      setCurrentPage(children);
    }
  }, [isTransitioning, pendingNavigation, children, currentPage, endTransition]);

  if (window.innerWidth <= 768) {
    return <>{children}</>;
  }

  return (
    <div className={`${styles.transitionContainer} ${isTransitioning ? styles.transitioning : ''}`}>
      {/* Current/Previous Page */}
      <div 
        className={`
          ${styles.pageWrapper} 
          ${isTransitioning && previousPage ? styles.transitioning : ''}
          ${isTransitioning && previousPage ? (transitionDirection === 'right' ? styles.slideRight : styles.slideLeft) : ''}
        `}
      >
        {isTransitioning && previousPage ? previousPage : currentPage}
      </div>
      
      {/* New Page sliding in */}
      {isTransitioning && pendingNavigation && (
        <div 
          className={`
            ${styles.incomingPage}
            ${styles.slideInComplete}
          `}
        >
          {children}
        </div>
      )}
    </div>
  );
};

export default PageTransition;
