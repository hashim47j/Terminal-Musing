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

    if (currentPath.startsWith('/blogs/') || targetPath.startsWith('/blogs/')) {
      return currentPath.startsWith('/blogs/') ? 'left' : 'right';
    }

    const currentIndex = pageOrder.indexOf(currentPath);
    const targetIndex = pageOrder.indexOf(targetPath);

    if (currentIndex === -1 || targetIndex === -1) {
      return 'right';
    }

    return targetIndex > currentIndex ? 'right' : 'left';
  };

  const startPageTransition = (targetPath, callback) => {
    const currentPath = window.location.pathname;
    
    if (currentPath === targetPath || isTransitioning) {
      callback();
      return;
    }

    const direction = calculateDirection(currentPath, targetPath);
    
    if (direction === 'none' || window.innerWidth <= 768) {
      callback();
      return;
    }

    console.log('🎬 Starting transition:', currentPath, '→', targetPath, 'direction:', direction);
    
    setTransitionDirection(direction);
    setIsTransitioning(true);
    setPendingNavigation(targetPath);

    // Navigate after setting up animation state
    setTimeout(() => {
      callback();
    }, 100);
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
