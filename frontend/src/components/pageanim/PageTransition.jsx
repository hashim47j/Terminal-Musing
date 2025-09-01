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
  const [isAnimationComplete, setIsAnimationComplete] = useState(true);

  useEffect(() => {
    if (isTransitioning && targetPageContent) {
      console.log('🎬 Starting animation, direction:', transitionDirection);
      
      // STEP 1: Hide the final content completely
      setIsAnimationComplete(false);
      
      // STEP 2: Prepare the new content
      setFinalContent(getPageComponent(targetPageContent));
      
      // STEP 3: Start blur phase
      setAnimationPhase('blackwhiteblur');
      
      setTimeout(() => {
        console.log('🌊 Phase 2: Drifting');
        setAnimationPhase('drift');
        
        setTimeout(() => {
          console.log('✅ Animation complete');
          
          // STEP 4: Clean transition - hide animation, show final content
          setAnimationPhase('idle');
          
          // STEP 5: Wait one more frame, then show final content
          setTimeout(() => {
            setIsAnimationComplete(true);
          }, 16);
        }, 600);
      }, 400);
    } else if (!isTransitioning) {
      // No animation - update normally
      setFinalContent(children);
      setAnimationPhase('idle');
      setIsAnimationComplete(true);
    }
  }, [isTransitioning, targetPageContent, transitionDirection, children]);

  if (window.innerWidth <= 768) {
    return <>{children}</>;
  }

  return (
    <div className={styles.transitionContainer}>
      
      {/* Show animation phases - ONLY when animation is running */}
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
              zIndex: 2
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
              style={{ zIndex: 3 }}
            >
              {finalContent}
            </div>
          )}
        </>
      )}

      {/* Final static page - ONLY show when animation is completely done */}
      {animationPhase === 'idle' && isAnimationComplete && (
        <div className={styles.pageWrapper} style={{ zIndex: 1 }}>
          {finalContent}
        </div>
      )}
      
    </div>
  );
};

export default PageTransition;
