// frontend/src/pages/UniformPages/SmartImage.jsx
import React, { useState, useEffect } from 'react';

const SmartImage = ({ 
  src, 
  alt, 
  className, 
  style, 
  onLoad, 
  onError, 
  isHeroImage = false,
  cacheCallback
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [currentSrc, setCurrentSrc] = useState(null);

  // Check if image is already in browser cache
  useEffect(() => {
    if (!src) return;

    // If switching to a new image, reset loading state
    if (src !== currentSrc) {
      setIsLoaded(false);
      setCurrentSrc(src);

      // Check if image is already cached in browser
      const img = new Image();
      img.onload = () => {
        setIsLoaded(true);
        if (cacheCallback) cacheCallback(src);
        if (onLoad) onLoad();
      };
      img.onerror = () => {
        if (onError) onError();
      };
      img.src = src;
    }
  }, [src, currentSrc, onLoad, onError, cacheCallback]);

  if (!src) return null;

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      style={{
        ...style,
        opacity: isLoaded ? 1 : 0,
        transition: 'opacity 0.3s ease'
      }}
    />
  );
};

export default SmartImage;
