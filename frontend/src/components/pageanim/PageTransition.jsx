import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import styles from './PageTransition.module.css';
import { usePageTransition } from './PageTransitionContext';

const PageTransition = ({ children }) => {
  const location = useLocation();
  const { isTransitioning, transitionDirection, endTransition } = usePageTransition();
  
  const [currentPage, setCurrentPage] = useState(children);
  const [incomingPage, setIncomingPage] = useState(null);
  const [animationPhase, setAnimationPhase] = useState('idle');

  useEffect(() => {
    if (isTransitioning) {
      console.log('🎬 Animation phase: starting');
      setAnimationPhase('starting');
      setIncomingPage(children);

      setTimeout(() => {
        console.log('🎬 Animation phase: animating');
        setAnimationPhase('animating');
        
        setTimeout(() => {
          console.log('🎬 Animation phase: completed');
          setCurrentPage(children);
          setIncomingPage(null);
          setAnimationPhase('idle');
          endTransition();
        }, 650);
      }, 50);
    }
  }, [isTransitioning, children, endTransition]);

  if (window.innerWidth <= 768) {
    return <>{children}</>;
  }

  return (
    <div className={`${styles.transitionContainer} ${isTransitioning ? styles.transitioning : ''}`}>
      {/* Current Page */}
      {currentPage && (
        <div 
          className={`
            ${styles.pageWrapper} 
            ${animationPhase === 'animating' ? styles.transitioning : ''}
            ${animationPhase === 'animating' ? (transitionDirection === 'right' ? styles.slideRight : styles.slideLeft) : ''}
          `}
        >
          {currentPage}
        </div>
      )}
      
      {/* Incoming Page */}
      {incomingPage && animationPhase !== 'idle' && (
        <div 
          className={`
            ${styles.incomingPage}
            ${animationPhase === 'starting' ? (transitionDirection === 'right' ? styles.fromLeft : styles.fromRight) : ''}
            ${animationPhase === 'animating' ? styles.slideInComplete : ''}
          `}
        >
          {incomingPage}
        </div>
      )}
    </div>
  );
};

export default PageTransition;
