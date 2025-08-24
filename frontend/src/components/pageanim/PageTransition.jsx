import React, { useEffect, useState, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import styles from './PageTransition.module.css';
import { usePageTransition } from './PageTransitionContext';

const PageTransition = ({ children }) => {
  const location = useLocation();
  const { isTransitioning, transitionDirection, endTransition } = usePageTransition();
  
  const [currentPage, setCurrentPage] = useState(children);
  const [incomingPage, setIncomingPage] = useState(null);
  const [animationPhase, setAnimationPhase] = useState('idle'); // 'idle', 'prepare', 'animate'
  const previousPath = useRef(location.pathname);

  useEffect(() => {
    if (location.pathname !== previousPath.current) {
      if (isTransitioning) {
        console.log('🎬 Route changed, starting animation');
        
        // Phase 1: Prepare animation
        setAnimationPhase('prepare');
        setIncomingPage(children);
        
        // Phase 2: Start animation
        setTimeout(() => {
          setAnimationPhase('animate');
          
          // Phase 3: Complete animation
          setTimeout(() => {
            setCurrentPage(children);
            setIncomingPage(null);
            setAnimationPhase('idle');
            endTransition();
            previousPath.current = location.pathname;
          }, 650);
        }, 50);
      } else {
        // No transition - just update
        setCurrentPage(children);
        previousPath.current = location.pathname;
      }
    }
  }, [location.pathname, isTransitioning, children, endTransition]);

  if (window.innerWidth <= 768) {
    return <>{children}</>;
  }

  return (
    <div className={`${styles.transitionContainer} ${isTransitioning ? styles.transitioning : ''}`}>
      {/* Current page */}
      <div 
        className={`
          ${styles.pageWrapper} 
          ${animationPhase === 'animate' ? styles.transitioning : ''}
          ${animationPhase === 'animate' ? (transitionDirection === 'right' ? styles.slideRight : styles.slideLeft) : ''}
        `}
      >
        {currentPage}
      </div>
      
      {/* Incoming page during transition */}
      {incomingPage && animationPhase !== 'idle' && (
        <div 
          className={`
            ${styles.incomingPage}
            ${animationPhase === 'prepare' ? (transitionDirection === 'right' ? styles.fromLeft : styles.fromRight) : ''}
            ${animationPhase === 'animate' ? styles.slideInComplete : ''}
          `}
        >
          {incomingPage}
        </div>
      )}
    </div>
  );
};

export default PageTransition;
