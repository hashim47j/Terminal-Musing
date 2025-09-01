import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import styles from './PageTransition.module.css';
import { usePageTransition } from './PageTransitionContext';
import getPageComponent from './PageMapper';

const PageTransition = ({ children }) => {
  const location = useLocation();
  const { isTransitioning, transitionDirection, targetPageContent } = usePageTransition();
  const [animationPhase, setAnimationPhase] = useState('idle');
  const [currentContent, setCurrentContent] = useState(children); // What's currently displayed
  const [newContent, setNewContent] = useState(null); // What's coming in

  useEffect(() => {
    if (isTransitioning && targetPageContent) {
      console.log('🎬 Starting animation, direction:', transitionDirection);
      
      // Prepare the new content but don't show it yet
      setNewContent(getPageComponent(targetPageContent));
      setAnimationPhase('blackwhiteblur');
      
      setTimeout(() => {
        console.log('🌊 Phase 2: Drifting');
        setAnimationPhase('drift');
        
        setTimeout(() => {
          console.log('✅ Animation complete');
          // Now switch to the new content and clean up
          setCurrentContent(getPageComponent(targetPageContent));
          setNewContent(null);
          setAnimationPhase('idle');
        }, 600);
      }, 400);
    } else if (!isTransitioning) {
      // When not transitioning, just update current content
      setCurrentContent(children);
      setNewContent(null);
      setAnimationPhase('idle');
    }
  }, [isTransitioning, targetPageContent, transitionDirection, children]);

  if (window.innerWidth <= 768) {
    return <>{children}</>;
  }

  return (
    <div className={styles.transitionContainer}>
      
      {/* During animation phases */}
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
            {currentContent}
          </div>
          
          {/* New Page - appearing during drift */}
          {animationPhase === 'drift' && newContent && (
            <div 
              className={`
                ${styles.incomingPage}
                ${styles.slideInFromBlur}
                ${styles.fromLeft}
              `}
              style={{ zIndex: 2 }}
            >
              {newContent}
            </div>
          )}
        </>
      )}

      {/* Final static page - only when idle */}
      {animationPhase === 'idle' && (
        <div className={styles.pageWrapper}>
          {currentContent}
        </div>
      )}
      
    </div>
  );
};

export default PageTransition;
