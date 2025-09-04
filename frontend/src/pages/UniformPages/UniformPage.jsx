// frontend/src/pages/UniformPages/UniformPage.jsx
import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import styles from './UniformPage.module.css';
import { getThemeByCategory, getCategoryFromPath } from '../../config/blogThemes';
import { useBlog } from '../../context/BlogContext';
import SmartImage from './SmartImage';

// Enhanced Dynamic Background Shadow Component
const DynamicBackgroundShadow = ({ theme, category }) => {
  const headerRef = useRef(null);
  const imgRef = useRef(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [currentBgUrl, setCurrentBgUrl] = useState(null);
  const { 
    getBackgroundCache, 
    cacheBackground, 
    isBackgroundImageCached, 
    cacheBackgroundImage 
  } = useBlog();

  // Reset only when background URL actually changes
  useEffect(() => {
    const bgUrl = theme.headerConfig.backgroundImage;
    
    if (bgUrl !== currentBgUrl) {
      setImageLoaded(false);
      setCurrentBgUrl(bgUrl);
    }
    
    if (!bgUrl) return;
    
    const cachedShadowColor = getBackgroundCache(bgUrl);
    if (cachedShadowColor && headerRef.current) {
      headerRef.current.style.setProperty('--header-shadow-color', cachedShadowColor);
      return;
    }

    if (isBackgroundImageCached(bgUrl)) {
      setImageLoaded(true);
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
        
        cacheBackground(bgUrl, shadowColor);
      } catch (err) {
        console.warn('Could not extract color from background image:', err);
      }
    };

    if (imageLoaded) {
      extractColorFromImage();
    }
  }, [theme.headerConfig.backgroundImage, currentBgUrl, imageLoaded, getBackgroundCache, cacheBackground, isBackgroundImageCached]);

  const handleImageLoad = () => {
    setImageLoaded(true);
    if (theme.headerConfig.backgroundImage) {
      cacheBackgroundImage(theme.headerConfig.backgroundImage);
    }
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
          key={theme.headerConfig.backgroundImage} // Reset only when URL changes
        />
      )}
      <HeaderSection theme={theme} headerRef={headerRef} category={category} />
    </>
  );
};

// Enhanced Header Section Component  
const HeaderSection = ({ theme, headerRef, category }) => {
  const { cacheHeroImage, isHeroImageCached } = useBlog();
  const [currentHeroUrl, setCurrentHeroUrl] = useState(null);
  const [showImage, setShowImage] = useState(false);

  // Hide image immediately when category changes, show when loaded
  useEffect(() => {
    const heroUrl = theme.headerConfig.heroImage;
    
    if (heroUrl !== currentHeroUrl) {
      setShowImage(false); // Hide immediately on URL change
      setCurrentHeroUrl(heroUrl);
      
      // If image is cached, show it quickly
      if (isHeroImageCached(heroUrl)) {
        setShowImage(true);
      }
    }
  }, [theme.headerConfig.heroImage, currentHeroUrl, isHeroImageCached]);

  const handleImageLoad = () => {
    setShowImage(true);
    if (theme.headerConfig.heroImage) {
      cacheHeroImage(theme.headerConfig.heroImage);
    }
  };

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
        <SmartImage
          src={theme.headerConfig.heroImage}
          alt={theme.headerConfig.altText}
          className={styles.heroImage}
          style={{
            '--hero-x': `${theme.headerConfig.heroPosition.x}px`,
            '--hero-y': `${theme.headerConfig.heroPosition.y}px`,
            width: `${theme.headerConfig.heroWidth}px`,
            opacity: showImage ? 1 : 0,
            transition: 'opacity 0.3s ease'
          }}
          cacheCallback={handleImageLoad}
          key={theme.headerConfig.heroImage} // Reset when URL changes
        />
      )}
    </section>
  );
};

// ... keep your BlogCard component unchanged ...

// Main Uniform Page Component - Enhanced
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

  console.log('Current category:', category);
  console.log('Category state:', categoryState);
  console.log('Theme API endpoint:', theme.apiEndpoint);

  if (!categoryState) {
    return <div>Loading...</div>;
  }

  useEffect(() => {
    fetchPosts(category, theme.apiEndpoint);
  }, [category, theme.apiEndpoint, fetchPosts]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setActiveCardId(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getWordCount = (content) => {
    if (!content || !Array.isArray(content)) return 0;
    
    const textContent = content
      .filter(block => block.type === 'paragraph' && block.text)
      .map(block => block.text)
      .join(' ');
    
    return textContent.trim().split(/\s+/).filter(word => word.length > 0).length;
  };

  const handlePostClick = (post) => {
    navigate(`${theme.routeBase}/${post.id}`);
  };

  const handleKeyDown = (e, post) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handlePostClick(post);
    }
  };

  return (
    <div 
      className={styles[theme.containerClass]}
      style={{ backgroundColor: theme.backgroundColor }}
    >
      <div
        data-navbar-bg-detect
        style={{ position: 'absolute', top: 0, height: '80px', width: '100%' }}
      />

      <DynamicBackgroundShadow theme={theme} category={category} />

      <section 
        className={styles.postsSection}
        style={{ backgroundColor: theme.postsSection.backgroundColor }}
      >
        <h2 className={styles.postsHeading}>{theme.postsSection.heading}</h2>

        <div ref={containerRef} className={styles.blogGridContainer}>
          <div className={styles.blogGrid}>
            {categoryState.loading ? (
              <div className={styles.loadingState}>
                <div className={styles.spinner}></div>
                <p>{theme.postsSection.loadingText}</p>
              </div>
            ) : categoryState.error ? (
              <div className={styles.errorState}>
                <h3>Oops! Something went wrong</h3>
                <p style={{ color: 'red' }}>{categoryState.error}</p>
                <button 
                  onClick={() => window.location.reload()} 
                  className={styles.retryBtn}
                >
                  Try Again
                </button>
              </div>
            ) : !Array.isArray(categoryState.data) || categoryState.data.length === 0 ? (
              <div className={styles.emptyState}>
                <h3>{theme.postsSection.emptyStateTitle}</h3>
                <p>{theme.postsSection.emptyStateText}</p>
              </div>
            ) : (
              categoryState.data.map((post) => (
                <BlogCard
                  key={post.id}
                  post={post}
                  hoveredPostId={hoveredPostId}
                  onMouseEnter={() => setHoveredPostId(post.id)}
                  onMouseLeave={() => setHoveredPostId(null)}
                  onClick={() => handlePostClick(post)}
                  onKeyDown={(e) => handleKeyDown(e, post)}
                  currentAuthor={currentAuthor}
                  getWordCount={getWordCount}
                  activeCardId={activeCardId}
                  setActiveCardId={setActiveCardId}
                  theme={theme}
                />
              ))
            )}
          </div>
        </div>
      </section>

      <div 
        className={styles.grayStrip}
        style={{ backgroundColor: theme.stripColor }}
      ></div>
    </div>
  );
};

export default UniformPage;
