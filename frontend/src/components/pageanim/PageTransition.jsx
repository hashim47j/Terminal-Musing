import React, { useEffect, useState, useLayoutEffect } from 'react';
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
  const [shouldRender, setShouldRender] = useState(true);

  // Use useLayoutEffect to prevent flicker
  useLayoutEffect(() => {
    if (isTransitioning && targetPageContent) {
      console.log('🎬 Starting Framer Motion enhanced animation, direction:', transitionDirection);
      
      // Pre-load the content
      const newContent = getPageComponent(targetPageContent);
      setFinalContent(newContent);
      setShouldRender(false); // Hide current content immediately
      
      // Start animation phases
      setTimeout(() => {
        setShouldRender(true);
        setAnimationPhase('blackwhiteblur');
        
        setTimeout(() => {
          console.log('🌊 Phase 2: Drifting');
          setAnimationPhase('drift');
          
          setTimeout(() => {
            console.log('✅ Animation complete - showing final content');
            setAnimationPhase('complete');
            
            // Ensure clean transition to final state
            setTimeout(() => {
              setAnimationPhase('idle');
              setShouldRender(true);
            }, 16); // One frame delay
          }, 600);
        }, 400);
      }, 16); // One frame delay
    } else if (!isTransitioning) {
      setFinalContent(children);
      setAnimationPhase('idle');
      setShouldRender(true);
    }
  }, [isTransitioning, targetPageContent, transitionDirection, children]);

  if (window.innerWidth <= 768) {
    return <>{children}</>;
  }

  return (
    <div className={styles.transitionContainer}>
      <AnimatePresence mode="wait" initial={false}>
        {/* Animation phases */}
        {animationPhase !== 'idle' && shouldRender && (
          <motion.div
            key={`animating-${location.pathname}`}
            initial={false}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.1 }}
            style={{ position: 'absolute', width: '100%', top: 0, left: 0 }}
          >
            {/* Current Page - animating out */}
            <motion.div 
              className={`${styles.pageWrapper}`}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                zIndex: animationPhase === 'drift' ? 1 : 2
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
                style={{ 
                  zIndex: 2,
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%'
                }}
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

        {/* Final static page - ONLY when completely idle */}
        {animationPhase === 'idle' && (
          <motion.div
            key={`static-${location.pathname}`}
            className={styles.pageWrapper}
            initial={{ opacity: 1 }}
            animate={{ opacity: 1 }}
            style={{ position: 'relative', zIndex: 1 }}
          >
            {finalContent}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PageTransition;
