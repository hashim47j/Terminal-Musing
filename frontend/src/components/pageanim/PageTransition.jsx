import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import styles from './PageTransition.module.css';
import { usePageTransition } from './PageTransitionContext';
import getPageComponent from './PageMapper';

const PageTransition = ({ children }) => {
  const location = useLocation();
  const { isTransitioning, transitionDirection, targetPageContent } = usePageTransition();
  
  const [animationPhase, setAnimationPhase] = useState('idle');
  const [showWindParticles, setShowWindParticles] = useState(false);

  // Generate random particles for wind effect
  const generateParticles = () => {
    return Array.from({ length: 12 }, (_, i) => ({
      id: i,
      delay: Math.random() * 400,
      size: Math.random() * 4 + 2,
      startX: Math.random() * 100,
      startY: Math.random() * 100,
      endX: Math.random() * 200 - 50,
      endY: Math.random() * 200 - 50,
    }));
  };

  const [particles] = useState(generateParticles());

  useEffect(() => {
    if (isTransitioning && targetPageContent) {
      console.log('🌬️ Wind effect animation starting');
      
      setAnimationPhase('prepare');
      setShowWindParticles(true);
      
      setTimeout(() => {
        console.log('🌪️ Wind blowing both pages');
        setAnimationPhase('animate');
      }, 50);
      
      setTimeout(() => {
        setAnimationPhase('idle');
        setShowWindParticles(false);
      }, 650);
    } else {
      setAnimationPhase('idle');
      setShowWindParticles(false);
    }
  }, [isTransitioning, targetPageContent, transitionDirection]);

  if (window.innerWidth <= 768) {
    return <>{children}</>;
  }

  return (
    <div className={`${styles.transitionContainer} ${animationPhase === 'animate' ? styles.transitioning : ''}`}>
      
      {/* Wind particles effect */}
      {showWindParticles && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            pointerEvents: 'none',
            zIndex: 4
          }}
        >
          {particles.map((particle) => (
            <div
              key={particle.id}
              style={{
                position: 'absolute',
                left: `${particle.startX}%`,
                top: `${particle.startY}%`,
                width: `${particle.size}px`,
                height: `${particle.size}px`,
                backgroundColor: 'rgba(255, 255, 255, 0.6)',
                borderRadius: '50%',
                animation: `windParticle${transitionDirection === 'right' ? 'Left' : 'Right'} 600ms ease-out ${particle.delay}ms forwards`,
                opacity: 0,
              }}
            />
          ))}
        </div>
      )}
      
      {/* Subtle wind overlay */}
      {animationPhase === 'animate' && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: 'linear-gradient(45deg, rgba(255,255,255,0.05) 0%, transparent 50%, rgba(255,255,255,0.05) 100%)',
            zIndex: 3,
            pointerEvents: 'none',
            animation: `windOverlay${transitionDirection === 'right' ? 'Left' : 'Right'} 600ms ease-out`
          }}
        />
      )}
      
      {/* Current Page - blown away by wind */}
      <div 
        className={`
          ${styles.pageWrapper} 
          ${animationPhase === 'animate' ? styles.transitioning : ''}
          ${animationPhase === 'animate' ? (transitionDirection === 'right' ? styles.slideLeft : styles.slideRight) : ''}
        `}
        style={{
          position: animationPhase === 'animate' ? 'absolute' : 'relative',
          top: animationPhase === 'animate' ? 0 : 'auto',
          left: animationPhase === 'animate' ? 0 : 'auto',
          width: animationPhase === 'animate' ? '100%' : 'auto',
          zIndex: animationPhase === 'animate' ? 1 : 'auto'
        }}
      >
        {children}
      </div>
      
      {/* Target Page - slides in fresh */}
      {isTransitioning && targetPageContent && (
        <div 
          className={`
            ${styles.incomingPage}
            ${animationPhase === 'prepare' ? (transitionDirection === 'right' ? styles.fromRight : styles.fromLeft) : ''}
            ${animationPhase === 'animate' ? styles.slideInComplete : ''}
          `}
        >
          {getPageComponent(targetPageContent)}
        </div>
      )}
    </div>
  );
};

export default PageTransition;
