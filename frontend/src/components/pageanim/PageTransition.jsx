import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import styles from './PageTransition.module.css';
import { usePageTransition } from './PageTransitionContext';
import getPageComponent from './PageMapper';

const PageTransition = ({ children }) => {
  const location = useLocation();
  const { isTransitioning, transitionDirection, targetPageContent } = usePageTransition();
  
  const [animationPhase, setAnimationPhase] = useState('idle');

  useEffect(() => {
    if (isTransitioning && targetPageContent) {
      console.log('🎬 Starting smooth animation');
      
      setAnimationPhase('prepare');
      
      // Use requestAnimationFrame for smoother timing
      requestAnimationFrame(() => {
        setTimeout(() => {
          console.log('🎬 Animation phase: sliding');
          setAnimationPhase('animate');
        }, 16); // One frame delay
      });
      
      // Clean reset timing
      setTimeout(() => {
        console.log('🎬 Animation phase: reset');
        setAnimationPhase('idle');
      }, 950);
    } else {
      setAnimationPhase('idle');
    }
  }, [isTransitioning, targetPageContent, transitionDirection]);

  if (window.innerWidth <= 768) {
    return <>{children}</>;
  }

  return (
    <div className={`${styles.transitionContainer} ${isTransitioning ? styles.transitioning : ''}`}>
      
      {/* Show the OLD page during transition */}
      {(animationState === 'idle' || animationState === 'prepare' || animationState === 'animate') && displayedPage && (
        <div 
          className={`
            ${styles.pageWrapper} 
            ${animationState === 'animate' ? styles.transitioning : ''}
            ${animationState === 'animate' ? (transitionDirection === 'right' ? styles.slideLeft : styles.slideRight) : ''}
          `}
        >
          {animationState === 'prepare' || animationState === 'animate' ? previousPage : displayedPage}
        </div>
      )}
      
      {/* Show the NEW page sliding in during animation */}
      {(animationState === 'prepare' || animationState === 'animate') && children && (
        <div 
          className={`
            ${styles.incomingPage}
            ${animationState === 'prepare' ? (transitionDirection === 'right' ? styles.fromRight : styles.fromLeft) : ''}
            ${animationState === 'animate' ? styles.slideInComplete : ''}
          `}
        >
          {children}
        </div>
      )}
      
    </div>
  );
};  

export default PageTransition;
