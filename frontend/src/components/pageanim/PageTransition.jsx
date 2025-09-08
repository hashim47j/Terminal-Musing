import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import styles from './PageTransition.module.css';
import { usePageTransition } from './PageTransitionContext';

const PageTransition = ({ children }) => {
  const location = useLocation();
  const { isTransitioning, transitionDirection, endTransition } = usePageTransition();
  
  const [page, setPage] = useState({
    current: children,
    previous: null,
  });

  const previousLocationRef = useRef(location.pathname);

  useEffect(() => {
    if (location.pathname !== previousLocationRef.current) {
      previousLocationRef.current = location.pathname;

      if (isTransitioning && window.innerWidth > 768) {
        setPage(p => ({
          current: children,
          previous: p.current,
        }));

        const timer = setTimeout(() => {
          endTransition();
          setPage(p => ({
            current: p.current,
            previous: null,
          }));
        }, 1050); // Matches CSS animation duration

        return () => clearTimeout(timer);
      } else {
        setPage({ current: children, previous: null });
      }
    }
  }, [location, children, isTransitioning, endTransition]);

  const { current, previous } = page;

  // Do not render animation wrappers unless a transition is active
  if (!previous) {
    return <>{current}</>;
  }

  return (
    <div className={styles.transitionContainer}>
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
      {current && (
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
