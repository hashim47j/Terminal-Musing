import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import styles from './PageTransition.module.css';
import { usePageTransition } from './PageTransitionContext';
import getPageComponent from './PageMapper';

const PageTransition = ({ children }) => {
  const location = useLocation();
  const { isTransitioning, transitionDirection, targetPageContent } = usePageTransition();
  
  const [animationPhase, setAnimationPhase] = useState('idle'); // idle, blackwhiteblur, drift
  
  useEffect(() => {
    if (isTransitioning && targetPageContent) {
      console.log('🎬 Starting 2-phase animation, direction:', transitionDirection);
      
      // PHASE 1: B&W + Blur together
      setAnimationPhase('blackwhiteblur');
      
      setTimeout(() => {
        console.log('🌊 Phase 2: Drifting', transitionDirection === 'right' ? 'LEFT' : 'RIGHT');
        setAnimationPhase('drift');
        
        setTimeout(() => {
          setAnimationPhase('idle');
        }, 600); // Drift duration
      }, 400); // B&W + Blur duration  
    } else {
      setAnimationPhase('idle');
    }
  }, [isTransitioning, targetPageContent, transitionDirection]);

  if (window.innerWidth <= 768) {
    return <>{children}</>;
  }

  return (
    <div className={styles.transitionContainer}>
      
      {/* Current Page - 2-phase transition with direction logic */}
      <div 
        className={`
          ${styles.pageWrapper} 
          ${animationPhase === 'blackwhiteblur' ? styles.turnBlackWhiteBlur : ''}
          ${animationPhase === 'drift' ? (transitionDirection === 'right' ? styles.driftLeft : styles.driftRight) : ''}
        `}
        style={{
          position: animationPhase !== 'idle' ? 'absolute' : 'relative',
          top: 0,
          left: 0,
          width: '100%',
          zIndex: 1
        }}
      >
        {children}
      </div>
      
      {/* New Page - slides in from correct direction */}
      {animationPhase === 'drift' && targetPageContent && (
        <div 
          className={`
            ${styles.incomingPage}
            ${styles.slideInFromBlur}
            ${transitionDirection === 'right' ? styles.fromRight : styles.fromLeft}
          `}
        >
          {getPageComponent(targetPageContent)}
        </div>
      )}
      
    </div>
  );
};

export default PageTransition;
