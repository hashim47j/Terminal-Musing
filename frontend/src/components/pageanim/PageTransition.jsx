import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import styles from './PageTransition.module.css';
import { usePageTransition } from './PageTransitionContext';
import getPageComponent from './PageMapper';

const PageTransition = ({ children }) => {
  const location = useLocation();
  const { isTransitioning, transitionDirection, targetPageContent } = usePageTransition();
  
  const [animationPhase, setAnimationPhase] = useState('idle'); // idle, blackwhite, blur, drift
  
  useEffect(() => {
    if (isTransitioning && targetPageContent) {
      console.log('🎬 Starting 3-phase animation');
      
      // PHASE 1: Turn black and white INSTANTLY
      setAnimationPhase('blackwhite');
      
      setTimeout(() => {
        console.log('🌫️ Phase 2: Adding blur');
        setAnimationPhase('blur');
        
        setTimeout(() => {
          console.log('🌊 Phase 3: Drifting');
          setAnimationPhase('drift');
          
          setTimeout(() => {
            setAnimationPhase('idle');
          }, 600); // Drift duration
        }, 300); // Blur duration  
      }, 200); // B&W duration
    } else {
      setAnimationPhase('idle');
    }
  }, [isTransitioning, targetPageContent, transitionDirection]);

  if (window.innerWidth <= 768) {
    return <>{children}</>;
  }

  return (
    <div className={styles.transitionContainer}>
      
      {/* Current Page - 3-phase transition */}
      <div 
        className={`
          ${styles.pageWrapper} 
          ${animationPhase === 'blackwhite' ? styles.turnBlackWhite : ''}
          ${animationPhase === 'blur' ? styles.addBlur : ''}
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
      
      {/* New Page - slides in during drift phase */}
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
