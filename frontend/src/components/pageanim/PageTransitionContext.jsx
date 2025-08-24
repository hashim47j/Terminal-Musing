import React, { createContext, useState, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const PageTransitionContext = createContext();

export const PageTransitionProvider = ({ children }) => {
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [transitionDirection, setTransitionDirection] = useState('right');
  const [shouldBlockNavigation, setShouldBlockNavigation] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

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

  const startPageTransition = (targetPath) => {
    const currentPath = location.pathname;
    
    if (currentPath === targetPath || isTransitioning) {
      return;
    }

    const direction = calculateDirection(currentPath, targetPath);
    
    if (direction === 'none' || window.innerWidth <= 768) {
      navigate(targetPath);
      return;
    }

    console.log('🎬 Starting controlled transition:', currentPath, '→', targetPath, 'direction:', direction);
    
    // Block navigation and set up animation
    setShouldBlockNavigation(true);
    setTransitionDirection(direction);
    setIsTransitioning(true);

    // Navigate ONLY after we've set up the animation states
    setTimeout(() => {
      navigate(targetPath);
    }, 16); // One frame delay
  };

  const endTransition = () => {
    setIsTransitioning(false);
    setShouldBlockNavigation(false);
  };

  return (
    <PageTransitionContext.Provider
      value={{
        isTransitioning,
        transitionDirection,
        shouldBlockNavigation,
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
