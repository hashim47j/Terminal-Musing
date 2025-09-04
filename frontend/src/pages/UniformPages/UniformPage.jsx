// frontend/src/pages/UniformPages/UniformPage.jsx
import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import styles from './UniformPage.module.css';
import { getThemeByCategory, getCategoryFromPath } from '../../config/blogThemes';
import { useBlog } from '../../context/BlogContext';

// Simplified Dynamic Background Shadow Component
const DynamicBackgroundShadow = ({ theme }) => {
  const headerRef = useRef(null);
  const imgRef = useRef(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  const { getBackgroundCache, cacheBackground } = useBlog();

  useEffect(() => {
    const bgUrl = theme.headerConfig.backgroundImage;
    
    // Skip if no background image
    if (!bgUrl) return;
    
    // Check if background color is already cached
    const cachedShadowColor = getBackgroundCache(bgUrl);
    if (cachedShadowColor && headerRef.current) {
      headerRef.current.style.setProperty('--header-shadow-color', cachedShadowColor);
      return;
    }

    const extractColorFromImage = () => {
      if (!imgRef.current || !headerRef.current || !imageLoaded) return;

      const img = imgRef.current;
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      canvas.width = img.width;
      canvas.height = img.height;
      
      try {
        ctx.drawImage(img, 0, 0);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        
        let r = 0, g = 0, b = 0, count = 0;
        
        for (let i = 0; i < data.length; i += 4 * 10) {
          r += data[i];
          g += data[i + 1];
          b += data[i + 2];
          count++;
        }
        
        r = Math.floor(r / count);
        g = Math.floor(g / count);
        b = Math.floor(b / count);

        const shadowColor = `rgba(${r}, ${g}, ${b}, 0.8)`;
        headerRef.current.style.setProperty('--header-shadow-color', shadowColor);
        
        // Cache the extracted color
        cacheBackground(bgUrl, shadowColor);
      } catch (err) {
        console.warn('Could not extract color from background image:', err);
      }
    };

    if (imageLoaded) {
      extractColorFromImage();
    }
  }, [imageLoaded, theme.headerConfig.backgroundImage, getBackgroundCache, cacheBackground]);

  const handleImageLoad = () => {
    setImageLoaded(true);
  };

  return (
    <>
      {theme.headerConfig.backgroundImage && (
        <img
          ref={imgRef}
          src={theme.headerConfig.backgroundImage}
          alt="Background for color extraction"
          style={{ display: 'none' }}
          onLoad={handleImageLoad}
          onError={() => setImageLoaded(false)}
        />
      )}
      <HeaderSection theme={theme} headerRef={headerRef} />
    </>
  );
};

// Header Section Component
const HeaderSection = ({ theme, headerRef }) => {
  return (
    <section 
      ref={headerRef} 
      className={styles.headerSection}
      style={{
        ...(theme.headerConfig.backgroundImage && {
          backgroundImage: `url(${theme.headerConfig.backgroundImage})`
        })
      }}
    >
      {theme.headerConfig.heroImage && (
        <img
          src={theme.headerConfig.heroImage}
          alt={theme.headerConfig.altText}
          className={styles.heroImage}
          style={{
            '--hero-x': `${theme.headerConfig.heroPosition.x}px`,
            '--hero-y': `${theme.headerConfig.heroPosition.y}px`,
            width: `${theme.headerConfig.heroWidth}px`
          }}
        />
      )}
    </section>
  );
};

// ... keep your BlogCard component as is ...

// Main Uniform Page Component
const UniformPage = () => {
  const containerRef = useRef(null); 
  const navigate = useNavigate();
  const location = useLocation();
  const [hoveredPostId, setHoveredPostId] = useState(null);
  const [activeCardId, setActiveCardId] = useState(null);

  const category = getCategoryFromPath(location.pathname);
  const theme = getThemeByCategory(category);
  
  const { state, fetchPosts } = useBlog();
  const categoryState = state.posts[category];
  const currentAuthor = state.currentAuthor;

  // Add safety check
  if (!categoryState) {
    return <div>Loading...</div>;
  }

  // Fetch posts for current category if not loaded
  useEffect(() => {
    fetchPosts(category, theme.apiEndpoint);
  }, [category, theme.apiEndpoint, fetchPosts]);

  // ... rest of your component logic stays the same ...

  return (
    <div 
      className={styles[theme.containerClass]}
      style={{ backgroundColor: theme.backgroundColor }}
    >
      <div
        data-navbar-bg-detect
        style={{ position: 'absolute', top: 0, height: '80px', width: '100%' }}
      />

      <DynamicBackgroundShadow theme={theme} />

      {/* ... rest of your JSX ... */}
    </div>
  );
};

export default UniformPage;
