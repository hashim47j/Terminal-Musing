import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import styles from './PageTransition.module.css';
import { usePageTransition } from './PageTransitionContext';
import getPageComponent from './PageMapper';

const PageTransition = ({ children }) => {
  const location = useLocation();
  const { isTransitioning, transitionDirection, targetPageContent } = usePageTransition();
  
  const [animationPhase, setAnimationPhase] = useState('idle'); // idle, blackwhiteblur, drift, complete
  
  useEffect(() => {
    if (isTransitioning && targetPageContent) {
      console.log('🎬 Starting 2-phase animation, direction:', transitionDirection);
      
      // PHASE 1: B&W + Blur together
      setAnimationPhase('blackwhiteblur');
      
      setTimeout(() => {
        console.log('🌊 Phase 2: Drifting');
        setAnimationPhase('drift');
        
        setTimeout(() => {
          console.log('✅ Phase 3: Complete - no more animations');
          setAnimationPhase('complete'); // NEW PHASE
        }, 600);
      }, 400);
    } else {
      setAnimationPhase('idle');
    }
  }, [isTransitioning, targetPageContent, transitionDirection]);

  if (window.innerWidth <= 768) {
    return <>{children}</>;
  }

  return (
    <div className={styles.transitionContainer}>
      
      {/* Current Page - only shows during drift phase */}
      {animationPhase !== 'complete' && animationPhase !== 'idle' && (
        <div 
          className={`
            ${styles.pageWrapper} 
            ${animationPhase === 'blackwhiteblur' ? styles.turnBlackWhiteBlur : ''}
            ${animationPhase === 'drift' ? (transitionDirection === 'right' ? styles.driftLeft : styles.driftRight) : ''}
          `}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            zIndex: 1
          }}
        >
          {children}
        </div>
      )}
      
      {/* New Page - only shows during drift phase */}
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

      {/* Final Static Page - no animations */}
      {(animationPhase === 'idle' || animationPhase === 'complete') && (
        <div className={styles.pageWrapper}>
          {animationPhase === 'complete' ? getPageComponent(targetPageContent) : children}
        </div>
      )}
      
    </div>
  );
};

export default PageTransition;
