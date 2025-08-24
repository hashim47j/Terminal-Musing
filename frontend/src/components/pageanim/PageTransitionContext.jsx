import React, { createContext, useState, useContext } from 'react';

const PageTransitionContext = createContext();

export const PageTransitionProvider = ({ children }) => {
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [transitionDirection, setTransitionDirection] = useState('right');
  const [targetPageContent, setTargetPageContent] = useState(null);

  const pageOrder = [
    '/',
    '/philosophy',
    '/history', 
    '/writings',
    '/legal-social',
    '/tech',
    '/daily-thoughts'
  ];

  const calculateDirection = (currentPath, targetPath) => {
    const currentIndex = pageOrder.indexOf(currentPath);
    const targetIndex = pageOrder.indexOf(targetPath);

    if (currentIndex === -1 || targetIndex === -1) {
      return 'right';
    }

    return targetIndex > currentIndex ? 'right' : 'left';
  };

  const startPageTransition = (targetPath, navigationCallback) => {
    const currentPath = window.location.pathname;
    
    if (currentPath === targetPath || isTransitioning) {
      return;
    }

    const direction = calculateDirection(currentPath, targetPath);
    
    if (direction === 'none' || window.innerWidth <= 768) {
      navigationCallback();
      return;
    }

    console.log('🎬 Starting blocked animation:', currentPath, '→', targetPath, 'direction:', direction);
    
    // Step 1: Block navigation and set up animation
    setTransitionDirection(direction);
    setIsTransitioning(true);
    
    // Step 2: Pre-load target page content (we'll fake this)
    setTargetPageContent(targetPath);
    
    // Step 3: After animation completes, actually navigate
    setTimeout(() => {
      console.log('🚀 Animation done, now navigating');
      setIsTransitioning(false);
      setTargetPageContent(null);
      navigationCallback(); // NOW actually navigate
    }, 650);
  };

  const endTransition = () => {
    setIsTransitioning(false);
    setTargetPageContent(null);
  };

  return (
    <PageTransitionContext.Provider
      value={{
        isTransitioning,
        transitionDirection,
        targetPageContent,
        startPageTransition,
        endTransition,
      }}
    >
      {children}
    </PageTransitionContext.Provider>
  );
};

export const usePageTransition = () => {
  const context = useContext(PageTransitionContext);
  if (!context) {
    throw new Error('usePageTransition must be used within PageTransitionProvider');
  }
  return context;
};

export { PageTransitionContext };
