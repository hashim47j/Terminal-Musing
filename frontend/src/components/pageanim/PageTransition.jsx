import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import styles from './PageTransition.module.css';
import { usePageTransition } from './PageTransitionContext';
import getPageComponent from './PageMapper';

const PageTransition = ({ children }) => {
  const location = useLocation();
  const { isTransitioning, transitionDirection, targetPageContent } = usePageTransition();
  
  const [animationPhase, setAnimationPhase] = useState('idle'); // 'idle', 'prepare', 'animate'

  useEffect(() => {
    if (isTransitioning && targetPageContent) {
      console.log('🎬 Starting visual animation phases');
      
      // Phase 1: Prepare (position incoming page off-screen)
      setAnimationPhase('prepare');
      
      // Phase 2: Animate (both pages slide simultaneously)
      setTimeout(() => {
        console.log('🎬 Both pages now sliding');
        setAnimationPhase('animate');
      }, 50);
      
      // Phase 3: Reset after animation
      setTimeout(() => {
        setAnimationPhase('idle');
      }, 650);
    } else {
      setAnimationPhase('idle');
    }
  }, [isTransitioning, targetPageContent]);

  if (window.innerWidth <= 768) {
    return <>{children}</>;
  }

  return (
    <div className={`${styles.transitionContainer} ${animationPhase === 'animate' ? styles.transitioning : ''}`}>
      
      {/* Current Page (Philosophy) - MUST slide out */}
      <div 
        className={`
          ${styles.pageWrapper} 
          ${animationPhase === 'animate' ? styles.transitioning : ''}
          ${animationPhase === 'animate' ? (transitionDirection === 'right' ? styles.slideRight : styles.slideLeft) : ''}
        `}
        style={{
          // Force absolute positioning during animation to allow sliding
          position: animationPhase === 'animate' ? 'absolute' : 'relative',
          top: animationPhase === 'animate' ? 0 : 'auto',
          left: animationPhase === 'animate' ? 0 : 'auto',
          width: animationPhase === 'animate' ? '100%' : 'auto',
          zIndex: animationPhase === 'animate' ? 1 : 'auto'
        }}
      >
        {children}
      </div>
      
      {/* Target Page (History) - slides in */}
      {isTransitioning && targetPageContent && (
        <div 
          className={`
            ${styles.incomingPage}
            ${animationPhase === 'prepare' ? (transitionDirection === 'right' ? styles.fromLeft : styles.fromRight) : ''}
            ${animationPhase === 'animate' ? styles.slideInComplete : ''}
          `}
        >
          {getPageComponent(targetPageContent)}
        </div>
      )}
    </div>
  );
};

export default PageTransition;
