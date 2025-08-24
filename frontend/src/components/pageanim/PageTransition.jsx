import React, { useEffect, useState, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import styles from './PageTransition.module.css';
import { usePageTransition } from './PageTransitionContext';

const PageTransition = ({ children }) => {
  const location = useLocation();
  const { isTransitioning, transitionDirection, pendingNavigation, endTransition } = usePageTransition();
  
  const [currentContent, setCurrentContent] = useState(children);
  const [previousContent, setPreviousContent] = useState(null);
  const [showAnimation, setShowAnimation] = useState(false);
  const previousLocation = useRef(location.pathname);

  useEffect(() => {
    // Only react to location changes when we're expecting them
    if (location.pathname !== previousLocation.current) {
      
      if (isTransitioning && pendingNavigation) {
        console.log('🎬 Route changed during transition - setting up animation');
        
        // Step 1: Keep the OLD content visible and prepare for animation
        setPreviousContent(currentContent);
        setShowAnimation(true);
        
        // Step 2: Start the slide animation
        setTimeout(() => {
          // Both pages slide simultaneously
          console.log('🎬 Both pages sliding now');
          
          // Step 3: Complete the animation
          setTimeout(() => {
            setCurrentContent(children);
            setPreviousContent(null);
            setShowAnimation(false);
            endTransition();
            previousLocation.current = location.pathname;
            console.log('✅ Animation completed');
          }, 650);
        }, 50);
        
      } else {
        // No animation - direct update
        setCurrentContent(children);
        previousLocation.current = location.pathname;
      }
    }
  }, [location.pathname, isTransitioning, pendingNavigation, children, currentContent, endTransition]);

  if (window.innerWidth <= 768) {
    return <>{children}</>;
  }

  return (
    <div className={`${styles.transitionContainer} ${showAnimation ? styles.transitioning : ''}`}>
      
      {/* Current/Previous Page (slides out) */}
      <div 
        className={`
          ${styles.pageWrapper} 
          ${showAnimation ? styles.transitioning : ''}
          ${showAnimation ? (transitionDirection === 'right' ? styles.slideRight : styles.slideLeft) : ''}
        `}
      >
        {showAnimation ? previousContent : currentContent}
      </div>
      
      {/* New Page (slides in) */}
      {showAnimation && (
        <div 
          className={`
            ${styles.incomingPage}
            ${transitionDirection === 'right' ? styles.fromLeft : styles.fromRight}
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
