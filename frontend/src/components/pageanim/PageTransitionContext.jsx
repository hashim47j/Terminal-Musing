import React, { createContext, useState, useContext } from 'react';

const PageTransitionContext = createContext();

export const PageTransitionProvider = ({ children }) => {
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [transitionDirection, setTransitionDirection] = useState('right');
  const [targetPageContent, setTargetPageContent] = useState(null);

  // This represents the VISUAL order of buttons in your navbar
  const navbarOrder = [
    '/philosophy',    // Position 0 (leftmost)
    '/history',       // Position 1  
    '/writings',      // Position 2
    '/legal-social',  // Position 3
    '/tech',          // Position 4
    '/daily-thoughts' // Position 5 (rightmost)
  ];

  const calculateDirection = (currentPath, targetPath) => {
    if (targetPath === '/admin/login' || currentPath === '/admin/login') {
      return 'none';
    }

    const currentIndex = navbarOrder.indexOf(currentPath);
    const targetIndex = navbarOrder.indexOf(targetPath);

    if (currentIndex === -1 || targetIndex === -1) {
      return 'right';
    }

    console.log('🎯 Button positions:', {
      current: currentPath,
      currentIndex,
      target: targetPath, 
      targetIndex
    });

    // If target is to the RIGHT of current → slide LEFT out, slide in from RIGHT
    // If target is to the LEFT of current → slide RIGHT out, slide in from LEFT
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

    console.log('🎬 Animation direction:', direction);
    console.log('📍 Current page slides:', direction === 'right' ? 'LEFT' : 'RIGHT');
    console.log('📍 Target page slides from:', direction === 'right' ? 'RIGHT' : 'LEFT');
    
    setTransitionDirection(direction);
    setIsTransitioning(true);
    setTargetPageContent(targetPath);
    
    setTimeout(() => {
      console.log('🚀 Animation done, now navigating');
      setIsTransitioning(false);
      setTargetPageContent(null);
      navigationCallback();
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
    throw new error('usePageTransition must be used within PageTransitionProvider');
  }
  return context;
};

export { PageTransitionContext };
