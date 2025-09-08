import React, { createContext, useState, useContext } from 'react';
import { useLocation } from 'react-router-dom';

// FIX: Added 'export' to the line below
export const PageTransitionContext = createContext();

export const PageTransitionProvider = ({ children }) => {
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [transitionDirection, setTransitionDirection] = useState('right');
  const location = useLocation();

  const navbarOrder = [
    '/blog/philosophy',
    '/blog/history',
    '/blog/writings',
    '/blog/lsconcern',
    '/blog/tech',
    '/daily-thoughts'
  ];

  const calculateDirection = (currentPath, targetPath) => {
    if (targetPath.startsWith('/admin') || currentPath.startsWith('/admin') || currentPath === targetPath) {
      return 'none';
    }
    const currentIndex = navbarOrder.indexOf(currentPath);
    const targetIndex = navbarOrder.indexOf(targetPath);
    if (currentIndex === -1 || targetIndex === -1) {
      return 'right';
    }
    return targetIndex > currentIndex ? 'right' : 'left';
  };

  const startPageTransition = (targetPath, navigationCallback) => {
    const direction = calculateDirection(location.pathname, targetPath);
    
    if (direction === 'none' || window.innerWidth <= 768 || isTransitioning) {
      if (location.pathname !== targetPath) {
        navigationCallback();
      }
      return;
    }
    
    setTransitionDirection(direction);
    setIsTransitioning(true);
    
    navigationCallback();
  };

  const endTransition = () => {
    setIsTransitioning(false);
  };

  return (
    <PageTransitionContext.Provider
      value={{
        isTransitioning,
        transitionDirection,
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
