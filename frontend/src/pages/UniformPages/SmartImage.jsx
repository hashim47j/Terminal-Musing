// frontend/src/pages/UniformPages/SmartImage.jsx
import React, { useState, useEffect } from 'react';

const SmartImage = ({ 
  src, 
  alt, 
  className, 
  style, 
  onLoad, 
  onError, 
  cacheCallback
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [currentSrc, setCurrentSrc] = useState(null);

  useEffect(() => {
    if (!src) return;

    // If switching to a new image, hide immediately
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
        setIsLoaded(false);
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
        transition: 'opacity 0.2s ease'
      }}
    />
  );
};

export default SmartImage;
