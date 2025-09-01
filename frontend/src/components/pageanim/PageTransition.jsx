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
  const [hidePreviousPage, setHidePreviousPage] = useState(false);

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
          
          // HIDE the previous page completely before showing final content
          setHidePreviousPage(true);
          
          setTimeout(() => {
            setAnimationPhase('idle');
            // Reset after animation is done
            setTimeout(() => {
              setHidePreviousPage(false);
            }, 50);
          }, 100); // Longer delay to ensure clean transition
        }, 600);
      }, 400);
    } else if (!isTransitioning) {
      // Update content when not transitioning
      setFinalContent(children);
      setAnimationPhase('idle');
      setHidePreviousPage(false);
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
              zIndex: 1,
              // MAKE IT FULLY TRANSPARENT when we're about to show final content
              opacity: hidePreviousPage ? 0 : 1,
              visibility: hidePreviousPage ? 'hidden' : 'visible'
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
        <div className={styles.pageWrapper}>
          {finalContent}
        </div>
      )}
      
    </div>
  );
};

export default PageTransition;
