import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import styles from './PageTransition.module.css';
import { usePageTransition } from './PageTransitionContext';
import getPageComponent from './PageMapper';

const PageTransition = ({ children }) => {
  const location = useLocation();
  const { isTransitioning, transitionDirection, targetPageContent } = usePageTransition();
  
  const [showAnimation, setShowAnimation] = useState(false);

  useEffect(() => {
    if (isTransitioning && targetPageContent) {
      console.log('🎬 Starting visual animation');
      
      // Start animation immediately
      setTimeout(() => {
        setShowAnimation(true);
      }, 50);
      
      // Reset animation state when transition ends
      setTimeout(() => {
        setShowAnimation(false);
      }, 650);
    }
  }, [isTransitioning, targetPageContent]);

  if (window.innerWidth <= 768) {
    return <>{children}</>;
  }

  return (
    <div className={`${styles.transitionContainer} ${showAnimation ? styles.transitioning : ''}`}>
      
      {/* Current Page (Philosophy) - slides out */}
      <div 
        className={`
          ${styles.pageWrapper} 
          ${showAnimation ? styles.transitioning : ''}
          ${showAnimation ? (transitionDirection === 'right' ? styles.slideRight : styles.slideLeft) : ''}
        `}
      >
        {children}
      </div>
      
      {/* Target Page (History) - slides in */}
      {isTransitioning && targetPageContent && (
        <div 
          className={`
            ${styles.incomingPage}
            ${showAnimation ? styles.slideInComplete : (transitionDirection === 'right' ? styles.fromLeft : styles.fromRight)}
          `}
        >
          {getPageComponent(targetPageContent)}
        </div>
      )}
    </div>
  );
};

export default PageTransition;
