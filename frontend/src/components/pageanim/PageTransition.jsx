import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import styles from './PageTransition.module.css';
import { usePageTransition } from './PageTransitionContext';

const PageTransition = ({ children }) => {
  const location = useLocation();
  const { isTransitioning, transitionDirection, endTransition } = usePageTransition();
  const [previousPage, setPreviousPage] = useState(null);
  const [currentPage, setCurrentPage] = useState(children);
  const previousLocation = useRef(location.pathname);

  useEffect(() => {
    if (location.pathname !== previousLocation.current) {
      if (isTransitioning) {
        console.log('🎬 Animation started');
        setPreviousPage(currentPage); // The old page is what's currently displayed
        setCurrentPage(children);     // The new page is the new children

        // After the animation duration, clean up
        const timer = setTimeout(() => {
          console.log('✅ Animation complete, cleaning up previous page');
          setPreviousPage(null);
          endTransition();
        }, 1050); // This should match the total animation time

        previousLocation.current = location.pathname;

        return () => clearTimeout(timer);
      } else {
        // If not transitioning, just update the page
        setCurrentPage(children);
        previousLocation.current = location.pathname;
      }
    }
  }, [location, children, isTransitioning, endTransition, currentPage]);

  if (window.innerWidth <= 768 || !isTransitioning) {
    return <>{currentPage}</>;
  }

  return (
    <div className={styles.transitionContainer}>
      {previousPage && (
        <div
          className={`
            ${styles.pageWrapper}
            ${styles.animatingOut}
            ${transitionDirection === 'right' ? styles.slideRight : styles.slideLeft}
          `}
        >
          {previousPage}
        </div>
      )}
      <div
        className={`
          ${styles.pageWrapper}
          ${styles.animatingIn}
          ${transitionDirection === 'right' ? styles.fromLeft : styles.fromRight}
        `}
      >
        {currentPage}
      </div>
    </div>
  );
};

export default PageTransition;
