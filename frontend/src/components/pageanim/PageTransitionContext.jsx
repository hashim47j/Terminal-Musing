import React, { createContext, useState, useContext } from 'react';

const PageTransitionContext = createContext();

export const PageTransitionProvider = ({ children }) => {
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [transitionDirection, setTransitionDirection] = useState('right');
  const [targetPageContent, setTargetPageContent] = useState(null);

  const navbarOrder = [
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
    const currentIndex = navbarOrder.indexOf(currentPath);
    const targetIndex = navbarOrder.indexOf(targetPath);
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
    
    console.log('🌀 Smooth blur transition:', direction); // Fixed log message
    
    setTransitionDirection(direction);
    setIsTransitioning(true);
    setTargetPageContent(targetPath);
    
    // Back to original timing
    setTimeout(() => {
      console.log('✨ Smooth transition completed');
      setIsTransitioning(false);
      setTargetPageContent(null);
      navigationCallback();
    }, 1050); // Keep the 1050ms timing
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
