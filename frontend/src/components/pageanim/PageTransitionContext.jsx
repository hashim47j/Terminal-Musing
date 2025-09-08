import React, { createContext, useState, useContext } from 'react';
import { useLocation } from 'react-router-dom';

export const PageTransitionContext = createContext();

export const PageTransitionProvider = ({ children }) => {
  const [transitionState, setTransitionState] = useState({
    isTransitioning: false,
    direction: 'right',
    navigationCallback: null,
  });
  const location = useLocation();

  const navbarOrder = [
    '/blog/philosophy', '/blog/history', '/blog/writings',
    '/blog/lsconcern', '/blog/tech', '/daily-thoughts'
  ];

  const calculateDirection = (currentPath, targetPath) => {
    if (targetPath.startsWith('/admin') || currentPath.startsWith('/admin') || currentPath === targetPath) {
      return 'none';
    }
    const currentIndex = navbarOrder.indexOf(currentPath);
    const targetIndex = navbarOrder.indexOf(targetPath);
    return currentIndex === -1 || targetIndex === -1 || targetIndex > currentIndex ? 'right' : 'left';
  };

  const startPageTransition = (targetPath, navigationCallback) => {
    if (transitionState.isTransitioning) return;

    const direction = calculateDirection(location.pathname, targetPath);

    if (direction === 'none' || window.innerWidth <= 768) {
      if (location.pathname !== targetPath) navigationCallback();
      return;
    }
    
    // Set state to START the transition and store the navigation function
    setTransitionState({
      isTransitioning: true,
      direction,
      navigationCallback,
    });
  };

  // This function will be called by the animation component AFTER the animation is done
  const completeTransition = () => {
    if (transitionState.navigationCallback) {
      transitionState.navigationCallback(); // Execute the stored navigation
    }
    // Reset the state for the next transition
    setTransitionState({
      isTransitioning: false,
      direction: 'right',
      navigationCallback: null,
    });
  };

  return (
    <PageTransitionContext.Provider
      value={{
        isTransitioning: transitionState.isTransitioning,
        transitionDirection: transitionState.direction,
        startPageTransition,
        completeTransition, // Expose this new function
      }}
    >
      {children}
    </PageTransitionContext.Provider>
  );
};

export const usePageTransition = () => {
  return useContext(PageTransitionContext);
};
