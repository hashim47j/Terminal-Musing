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
      console.log('🎬 Cinematic animation with fade & grayscale');
      
      setAnimationPhase('prepare');
      
      setTimeout(() => {
        console.log('🎬 Both pages sliding with effects');
        setAnimationPhase('animate');
      }, 50);
      
      setTimeout(() => {
        setAnimationPhase('idle');
      }, 650);
    } else {
      setAnimationPhase('idle');
    }
  }, [isTransitioning, targetPageContent, transitionDirection]);

  if (window.innerWidth <= 768) {
    return <>{children}</>;
  }

  return (
    <div className={`${styles.transitionContainer} ${animationPhase === 'animate' ? styles.transitioning : ''}`}>
      
      {/* Dark overlay during transition for extra drama */}
      {animationPhase === 'animate' && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0, 0, 0, 0.1)',
            zIndex: 3,
            pointerEvents: 'none',
            transition: 'opacity 600ms ease'
          }}
        />
      )}
      
      {/* Current Page - fades to black/white and slides out */}
      <div 
        className={`
          ${styles.pageWrapper} 
          ${animationPhase === 'animate' ? styles.transitioning : ''}
          ${animationPhase === 'animate' ? (transitionDirection === 'right' ? styles.slideLeft : styles.slideRight) : ''}
        `}
        style={{
          position: animationPhase === 'animate' ? 'absolute' : 'relative',
          top: animationPhase === 'animate' ? 0 : 'auto',
          left: animationPhase === 'animate' ? 0 : 'auto',
          width: animationPhase === 'animate' ? '100%' : 'auto',
          zIndex: animationPhase === 'animate' ? 1 : 'auto'
        }}
      >
        {children}
      </div>
      
      {/* Target Page - slides in with full color */}
      {isTransitioning && targetPageContent && (
        <div 
          className={`
            ${styles.incomingPage}
            ${animationPhase === 'prepare' ? (transitionDirection === 'right' ? styles.fromRight : styles.fromLeft) : ''}
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
