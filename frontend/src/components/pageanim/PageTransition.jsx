import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import styles from './PageTransition.module.css';
import { usePageTransition } from './PageTransitionContext';

const PageTransition = ({ children }) => {
  const location = useLocation();
  const { isTransitioning, transitionDirection, endTransition } = usePageTransition();
  
  // A single state object to manage both pages. This prevents race conditions.
  const [page, setPage] = useState({
    current: children,
    previous: null,
  });

  const previousLocationRef = useRef(location.pathname);

  useEffect(() => {
    if (location.pathname !== previousLocationRef.current) {
      previousLocationRef.current = location.pathname;

      if (isTransitioning && window.innerWidth > 768) {
        // Start the transition
        setPage(p => ({
          current: children,   // The new page is the incoming children
          previous: p.current, // The page that was on screen becomes the "previous" page
        }));

        // Set a timer to clean up after the animation
        const timer = setTimeout(() => {
          endTransition();
          // After the animation, remove the previous page from state
          setPage(p => ({
            current: p.current,
            previous: null,
          }));
        }, 1050); // This duration MUST match your CSS animation time

        return () => clearTimeout(timer);
      } else {
        // If not transitioning, just update the page immediately
        setPage({ current: children, previous: null });
      }
    }
  }, [location, children, isTransitioning, endTransition]);

  // Render logic
  const { current, previous } = page;

  return (
    <div className={styles.transitionContainer}>
      {/* The static page when not animating */}
      {!previous && (
        <div className={styles.staticPageWrapper}>
          {current}
        </div>
      )}

      {/* The outgoing page (only rendered during animation) */}
      {previous && (
        <div
          className={`
            ${styles.pageWrapper}
            ${styles.animatingOut}
            ${transitionDirection === 'right' ? styles.slideRight : styles.slideLeft}
          `}
        >
          {previous}
        </div>
      )}

      {/* The incoming page (only rendered during animation) */}
      {previous && (
        <div
          className={`
            ${styles.pageWrapper}
            ${styles.animatingIn}
            ${transitionDirection === 'right' ? styles.fromLeft : styles.fromRight}
          `}
        >
          {current}
        </div>
      )}
    </div>
  );
};

export default PageTransition;
