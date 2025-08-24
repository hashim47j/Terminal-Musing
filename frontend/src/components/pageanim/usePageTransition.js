import { useState, useEffect, useCallback } from 'react';

const usePageTransition = () => {
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [transitionDirection, setTransitionDirection] = useState('right');
  const [isMobile, setIsMobile] = useState(false);

  // Define the page order for horizontal navigation
  const pageOrder = [
    '/',
    '/philosophy',
    '/history', 
    '/writings',
    '/legal-social',
    '/tech',
    '/daily-thoughts'
  ];

  // Check if device is mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Calculate transition direction based on current and target pages
  const calculateDirection = useCallback((currentPath, targetPath) => {
    // Skip animation for mobile or admin page
    if (isMobile || targetPath === '/admin/login' || currentPath === '/admin/login') {
      return 'none';
    }

    // Handle blog post pages - they should slide from right
    if (currentPath.startsWith('/blogs/') || targetPath.startsWith('/blogs/')) {
      return currentPath.startsWith('/blogs/') ? 'left' : 'right';
    }

    const currentIndex = pageOrder.indexOf(currentPath);
    const targetIndex = pageOrder.indexOf(targetPath);

    // If either page is not in our defined order, default to right
    if (currentIndex === -1 || targetIndex === -1) {
      return 'right';
    }

    // Determine direction based on index positions
    return targetIndex > currentIndex ? 'right' : 'left';
  }, [isMobile, pageOrder]);

  // Start transition
  const startTransition = useCallback((currentPath, targetPath) => {
    const direction = calculateDirection(currentPath, targetPath);
    
    if (direction === 'none') {
      return false; // No animation
    }

    setTransitionDirection(direction);
    setIsTransitioning(true);
    return true; // Animation will occur
  }, [calculateDirection]);

  // End transition
  const endTransition = useCallback(() => {
    setIsTransitioning(false);
  }, []);

  return {
    isTransitioning,
    transitionDirection,
    isMobile,
    startTransition,
    endTransition
  };
};

export default usePageTransition;
