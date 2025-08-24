import React, { createContext, useState, useContext, useEffect } from 'react';
import { useNavigate, useLocation, useBlocker } from 'react-router-dom';

const PageTransitionContext = createContext();

export const PageTransitionProvider = ({ children }) => {
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [transitionDirection, setTransitionDirection] = useState('right');
  const [pendingNavigation, setPendingNavigation] = useState(null);
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

  // Block ALL navigation when transitioning
  const blocker = useBlocker(
    ({ currentLocation, nextLocation }) => {
      if (isTransitioning) {
        return true; // Block navigation during transition
      }
      
      if (pendingNavigation && currentLocation.pathname !== nextLocation.pathname) {
        const direction = calculateDirection(currentLocation.pathname, nextLocation.pathname);
        
        if (direction === 'none' || window.innerWidth <= 768) {
          return false; // Allow navigation
        }
        
        // Start our custom transition
        console.log('🚫 Blocking navigation to start animation');
        setTransitionDirection(direction);
        setIsTransitioning(true);
        setPendingNavigation(nextLocation.pathname);
        
        // Allow navigation after animation setup
        setTimeout(() => {
          setIsTransitioning(false);
          setPendingNavigation(null);
        }, 50);
        
        return true; // Block initial navigation
      }
      
      return false; // Don't block
    }
  );

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

    console.log('🎬 Starting blocked transition:', currentPath, '→', targetPath);
    
    setPendingNavigation(targetPath);
    setTransitionDirection(direction);
    setIsTransitioning(true);

    // Navigate after we're ready
    setTimeout(() => {
      navigate(targetPath);
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
