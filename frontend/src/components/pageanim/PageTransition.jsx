import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import styles from './PageTransition.module.css';
import { usePageTransition } from './PageTransitionContext';
import getPageComponent from './PageMapper';

const PageTransition = ({ children }) => {
  const location = useLocation();
  const { isTransitioning, transitionDirection, targetPageContent } = usePageTransition();
  const [animationPhase, setAnimationPhase] = useState('idle');
  const [finalContent, setFinalContent] = useState(children);

  useEffect(() => {
    if (isTransitioning && targetPageContent) {
      console.log('🎬 Starting animation, direction:', transitionDirection);
      
      // Store the target content for final rendering
      setFinalContent(getPageComponent(targetPageContent));
      
      setAnimationPhase('blackwhiteblur');
      
      setTimeout(() => {
        console.log('🌊 Phase 2: Drifting');
        setAnimationPhase('drift');
        
        setTimeout(() => {
          console.log('✅ Animation complete - showing final content');
          // THE ONLY FIX: Don't set idle immediately, wait one more frame
          setTimeout(() => {
            setAnimationPhase('idle');
          }, 16); // One frame delay to prevent flicker
        }, 600);
      }, 400);
    } else if (!isTransitioning) {
      // Update content when not transitioning
      setFinalContent(children);
      setAnimationPhase('idle');
    }
  }, [isTransitioning, targetPageContent, transitionDirection, children]);

  if (window.innerWidth <= 768) {
    return <>{children}</>;
  }

  return (
    <div className={styles.transitionContainer}>
      
      {/* Show animation phases */}
      {animationPhase !== 'idle' && (
        <>
          {/* Current Page - animating out */}
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
          
          {/* New Page - appearing during drift */}
          {animationPhase === 'drift' && (
            <div 
              className={`
                ${styles.incomingPage}
                ${styles.slideInFromBlur}
                ${styles.fromLeft}
              `}
              style={{ zIndex: 2 }}
            >
              {finalContent}
            </div>
          )}
        </>
      )}

      {/* Final static page - no animations */}
      {animationPhase === 'idle' && (
        <div className={styles.pageWrapper} style={{ opacity: 1 }}>
          {finalContent}
        </div>
      )}
      
    </div>
  );
};

export default PageTransition;
