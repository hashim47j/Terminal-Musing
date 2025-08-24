import React, { createContext, useState, useContext } from 'react';

const PageTransitionContext = createContext();

export const PageTransitionProvider = ({ children }) => {
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [transitionDirection, setTransitionDirection] = useState('right');
  const [pendingNavigation, setPendingNavigation] = useState(null);

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
    if (targetPath === '/admin/login' || currentPath === '/admin/login') {
      return 'none';
    }

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
      navigationCallback();
      return;
    }

    const direction = calculateDirection(currentPath, targetPath);
    
    if (direction === 'none' || window.innerWidth <= 768) {
      navigationCallback();
      return;
    }

    console.log('🎬 Starting transition:', currentPath, '→', targetPath, 'direction:', direction);
    
    setTransitionDirection(direction);
    setIsTransitioning(true);
    setPendingNavigation(targetPath);

    // IMPORTANT: Delay navigation to allow animation setup
    setTimeout(() => {
      navigationCallback();
    }, 200); // Increased delay
  };

  const endTransition = () => {
    setIsTransitioning(false);
    setPendingNavigation(null);
  };

  return (
    <PageTransitionContext.Provider
      value={{
        isTransitioning,
        transitionDirection,
        pendingNavigation,
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
