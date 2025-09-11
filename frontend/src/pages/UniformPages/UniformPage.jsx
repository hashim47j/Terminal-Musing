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
    }),
    '--hero-x': `${theme.headerConfig.heroPosition.x}px`,
    '--hero-y': `${theme.headerConfig.heroPosition.y}px`,
    '--hero-width': `${theme.headerConfig.heroWidth}px`,
    '--hero-width-mobile': `${theme.headerConfig.mobileHeroWidth}px`,
  }}
>
  {theme.headerConfig.heroImage && (
    <SmartImage
      src={theme.headerConfig.heroImage}
      alt={theme.headerConfig.altText}
      className={styles.heroImage}
      style={{
        opacity: showImage ? 1 : 0,
        transition: 'opacity 0.3s ease'
      }}
      cacheCallback={handleImageLoad}
      key={theme.headerConfig.heroImage}
    />
  )}
</section>

  );
};
// Blog Card Component (keeping your existing BlogCard component unchanged)
const BlogCard = ({ 
  post, 
  hoveredPostId, 
  onMouseEnter, 
  onMouseLeave, 
  onClick, 
  onKeyDown, 
  currentAuthor, 
  getWordCount,
  activeCardId,
  setActiveCardId,
  theme
}) => {
  const [isMobile, setIsMobile] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [shadowColor, setShadowColor] = useState('rgba(0,0,0,0)');
  const cardRef = useRef(null);
  const imgRef = useRef(null);
  const { isImageCached, cacheImage } = useBlog();

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768 || 'ontouchstart' in window);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (post.coverImage && isImageCached(post.coverImage)) {
      setImageLoaded(true);
    }
  }, [post.coverImage, isImageCached]);

  const extractColorFromImage = () => {
    if (!imgRef.current || !cardRef.current || !imageLoaded) return;

    const img = imgRef.current;
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;

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

      const shadow = `rgba(${r}, ${g}, ${b}, 0.6)`;
      setShadowColor(shadow);
    } catch (err) {
      console.warn('Could not extract color from card image:', err);
    }
  };

  useEffect(() => {
    if (imageLoaded) extractColorFromImage();
  }, [imageLoaded]);

  const handleCardClick = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (isMobile) {
      const newActiveId = post.id === activeCardId ? null : post.id;
      setActiveCardId(newActiveId);
    } else {
      onClick();
    }
  };

  const handleReadButtonClick = (e) => {
    e.stopPropagation();
    e.preventDefault();
    onClick();
  };

  const handleImageLoad = () => {
    setImageLoaded(true);
    if (post.coverImage) {
      cacheImage(post.coverImage);
    }
  };

  const isHovered = !isMobile && hoveredPostId === post.id;
  const isMobileActive = isMobile && activeCardId === post.id;
  const isActive = isHovered || isMobileActive;

  return (
    <article
      ref={cardRef}
      className={`${styles.blogCard} ${isMobileActive ? styles.mobileExpanded : ''}`}
      onClick={handleCardClick}
      onMouseEnter={!isMobile ? onMouseEnter : undefined}
      onMouseLeave={!isMobile ? onMouseLeave : undefined}
      role="button"
      tabIndex={0}
      style={{
        cursor: 'pointer',
        '--card-shadow-color': (isHovered || isMobileActive) ? shadowColor : 'rgba(0, 0, 0, 0)',
        backgroundColor: theme.cardStyle.backgroundColor
      }}
      onKeyDown={onKeyDown}
      aria-label={`${isActive ? 'Expanded' : 'Read'} article: ${post.title}`}
    >
      {post.coverImage ? (
        <img
          ref={imgRef}
          src={post.coverImage}
          alt={`Cover for ${post.title}`}
          className={`${styles.coverImage} ${isActive ? styles.expanded : ''}`}
          loading="lazy"
          onLoad={handleImageLoad}
          onError={(e) => {
            e.target.style.display = 'none';
          }}
        />
      ) : (
        <div
          className={`${styles.coverImage} ${isActive ? styles.expanded : ''}`} 
          style={{ backgroundColor: '#ccc' }}
        >
          <span className={styles.noImageText}>No Image</span>
        </div>
      )}

      <div className={`${styles.blogContent} ${isActive ? styles.hiddenContent : ''}`}>
        <h3 className={styles.blogTitle}>{post.title}</h3>

        <div className={styles.cardBottomFixed}>
          <div className={styles.cardSeparatorLine}></div>
          <div className={styles.cardMetaRow}>
            <span className={styles.cardAuthor}>
              by {post.author || currentAuthor}
            </span>
            <span className={styles.cardDate}>
              {new Date(post.date).toLocaleDateString('en-US', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              })}
            </span>
            <span className={styles.cardWordCount}>
              {getWordCount(post.content)} words
            </span>
          </div>
        </div>
      </div>

      {isActive && (
        <div className={styles.hoverOverlay}>
          <div className={styles.subheadingContainer}>
            <p className={styles.hoverSubheading}>
              {post.subheading || post.title}
            </p>
          </div>

          <div className={styles.bottomFixed}>
            <div className={styles.leftContent}>
              <div className={styles.separatorLine}></div>
              <div className={styles.authorDateContainer}>
                <span className={styles.authorName}>
                  {post.author || currentAuthor}
                </span>
                <span className={styles.postDate}>
                  {new Date(post.date).toLocaleDateString('en-US', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })}
                </span>
              </div>
            </div>

            <div className={styles.rightContent}>
              <button
                className={styles.shareIcon}
                onClick={(e) => {
                  e.stopPropagation();
                  if (navigator.share) {
                    navigator.share({
                      title: post.title,
                      text: post.subheading,
                      url: `${theme.routeBase}/${post.id}`
                    });
                  } else {
                    navigator.clipboard.writeText(`${window.location.origin}${theme.routeBase}/${post.id}`);
                    alert('Link copied to clipboard!');
                  }
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.50-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92s2.92-1.31 2.92-2.92c0-1.61-1.31-2.92-2.92-2.92z"/>
                </svg>
              </button>

              <button 
                className={styles.readBtn}
                onClick={handleReadButtonClick}
              >
                Read
              </button>
            </div>
          </div>
        </div>
      )}
    </article>
  );
};

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