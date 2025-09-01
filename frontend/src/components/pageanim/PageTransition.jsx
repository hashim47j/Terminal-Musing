import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
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
      console.log('🎬 Starting Framer Motion enhanced animation, direction:', transitionDirection);
      
      setFinalContent(getPageComponent(targetPageContent));
      setAnimationPhase('blackwhiteblur');
      
      setTimeout(() => {
        console.log('🌊 Phase 2: Drifting');
        setAnimationPhase('drift');
        
        setTimeout(() => {
          console.log('✅ Animation complete - showing final content');
          setAnimationPhase('idle');
        }, 600);
      }, 400);
    } else if (!isTransitioning) {
      setFinalContent(children);
      setAnimationPhase('idle');
    }
  }, [isTransitioning, targetPageContent, transitionDirection, children]);

  if (window.innerWidth <= 768) {
    return <>{children}</>;
  }

  return (
    <div className={styles.transitionContainer}>
      <AnimatePresence mode="wait">
        {/* Animation phases with Framer Motion wrapper */}
        {animationPhase !== 'idle' && (
          <motion.div
            key="animating-content"
            initial={{ opacity: 1 }}
            exit={{ opacity: 1 }}
            transition={{ duration: 0 }}
          >
            {/* Current Page - animating out */}
            <motion.div 
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
              animate={{
                filter: animationPhase === 'blackwhiteblur' 
                  ? 'grayscale(100%) blur(8px)' 
                  : animationPhase === 'drift' 
                    ? 'grayscale(100%) blur(12px)' 
                    : 'none',
                x: animationPhase === 'drift' 
                  ? (transitionDirection === 'right' ? -30 : 30) 
                  : 0,
                opacity: animationPhase === 'drift' ? 0 : 1
              }}
              transition={{
                filter: { duration: animationPhase === 'blackwhiteblur' ? 0.4 : 0.6, ease: "easeOut" },
                x: { duration: 0.6, ease: "easeOut" },
                opacity: { duration: 0.6, ease: "easeOut" }
              }}
            >
              {children}
            </motion.div>
            
            {/* New Page - appearing during drift */}
            {animationPhase === 'drift' && (
              <motion.div 
                className={styles.incomingPage}
                style={{ zIndex: 2 }}
                initial={{ 
                  opacity: 0, 
                  filter: 'blur(15px)' 
                }}
                animate={{ 
                  opacity: 1, 
                  filter: 'blur(0px)' 
                }}
                transition={{ 
                  duration: 0.6, 
                  ease: "easeOut" 
                }}
              >
                {finalContent}
              </motion.div>
            )}
          </motion.div>
        )}

        {/* Final static page - only when idle */}
        {animationPhase === 'idle' && (
          <motion.div
            key={`static-${location.pathname}`}
            className={styles.pageWrapper}
            initial={{ opacity: 1 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0 }}
          >
            {finalContent}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PageTransition;
