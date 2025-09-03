import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useDarkMode } from '../../context/DarkModeContext';
import { blogThemes } from '../../config/blogThemes';
import styles from './UniformPage.module.css';

const DynamicBackgroundShadow = ({ theme, darkMode }) => {
  const headerRef = useRef(null);
  const imgRef = useRef(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [backgroundImageSrc, setBackgroundImageSrc] = useState('');
  const [heroImageSrc, setHeroImageSrc] = useState('');

  useEffect(() => {
    const loadImages = async () => {
      try {
        const backgroundModule = await theme.backgroundImage();
        const heroModule = await theme.heroImage();
        
        setBackgroundImageSrc(backgroundModule.default);
        setHeroImageSrc(heroModule.default);
        
        // Load dark mode image for philosophy if supported
        if (theme.supportsDarkMode && theme.heroDarkImage && darkMode) {
          const darkHeroModule = await theme.heroDarkImage();
          setHeroImageSrc(darkHeroModule.default);
        }
      } catch (err) {
        console.warn('Failed to load theme images:', err);
      }
    };

    loadImages();
  }, [theme, darkMode]);

  useEffect(() => {
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
      } catch (err) {
        console.warn('Could not extract color from background image:', err);
      }
    };

    if (imageLoaded) {
      extractColorFromImage();
    }
  }, [imageLoaded]);

  const handleImageLoad = () => {
    setImageLoaded(true);
  };

  return (
    <>
      {backgroundImageSrc && (
        <img
          ref={imgRef}
          src={backgroundImageSrc}
          alt="Background for color extraction"
          crossOrigin="anonymous"
          style={{ display: 'none' }}
          onLoad={handleImageLoad}
          onError={() => setImageLoaded(false)}
        />
      )}
      <section 
        ref={headerRef} 
        className={styles.headerSection}
        style={{
          backgroundImage: backgroundImageSrc ? `url(${backgroundImageSrc})` : 'none'
        }}
      >
        {heroImageSrc && (
          <img
            src={heroImageSrc}
            alt={`${theme.name} Hero`}
            className={`${styles.heroImage} ${styles[theme.heroImageClass]}`}
            style={{
              '--hero-x': theme.heroPositioning.desktop.x,
              '--hero-y': theme.heroPositioning.desktop.y,
              '--hero-x-mobile': theme.heroPositioning.mobile.x,
              '--hero-y-mobile': theme.heroPositioning.mobile.y,
              '--hero-width-desktop': theme.heroWidth?.desktop,
              '--hero-width-mobile': theme.heroWidth?.mobile
            }}
          />
        )}
      </section>
    </>
  );
};

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

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768 || 'ontouchstart' in window);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

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
        background: theme.cardBackground
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
          onLoad={() => setImageLoaded(true)}
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
                      text: post.subheading || post.title,
                      url: `${theme.routePath}/${post.id}`
                    });
                  } else {
                    navigator.clipboard.writeText(`${window.location.origin}${theme.routePath}/${post.id}`);
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
  const { category } = useParams();
  const { darkMode } = useDarkMode();
  const containerRef = useRef(null); 
  const navigate = useNavigate();
  
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [hoveredPostId, setHoveredPostId] = useState(null);
  const [currentAuthor, setCurrentAuthor] = useState('Terminal Musing');
  const [activeCardId, setActiveCardId] = useState(null);

  // Get theme based on category
  const theme = blogThemes[category];

  useEffect(() => {
    if (!theme) {
      setError('Invalid blog category');
      setLoading(false);
      return;
    }
  }, [category, theme]);

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

  useEffect(() => {
    const fetchCurrentAuthor = async () => {
      try {
        const endpoints = [
          '/api/user/me',
          '/api/admin/profile', 
          '/api/auth/user',
          '/api/current-user'
        ];
        
        for (const endpoint of endpoints) {
          try {
            const res = await fetch(endpoint);
            if (res.ok) {
              const userData = await res.json();
              const authorName = userData.name || 
                               userData.username || 
                               userData.displayName || 
                               userData.fullName ||
                               'Terminal Musing';
              setCurrentAuthor(authorName);
              return;
            }
          } catch (err) {
            continue;
          }
        }
        
        const storedUser = localStorage.getItem('currentUser');
        if (storedUser) {
          const user = JSON.parse(storedUser);
          setCurrentAuthor(user.name || user.username || 'Terminal Musing');
        }
        
      } catch (err) {
        setCurrentAuthor('Terminal Musing');
      }
    };

    fetchCurrentAuthor();
  }, []);

  useEffect(() => {
    if (!theme) return;

    const fetchPosts = async () => {
      setLoading(true);
      setError('');
      
      try {
        const res = await fetch(theme.apiEndpoint);
        if (!res.ok) throw new Error(`Failed to fetch blogs (status: ${res.status})`);
        
        const data = await res.json();
        
        let postsArray = [];
        if (Array.isArray(data)) {
          postsArray = data;
        } else if (data && Array.isArray(data.blogs)) {
          postsArray = data.blogs;
        } else {
          postsArray = [];
        }

        const sorted = postsArray
          .filter(post => post && post.id && post.title)
          .sort((a, b) => {
            const dateA = new Date(a.date || 0);
            const dateB = new Date(b.date || 0);
            return dateB - dateA;
          });
          
        setPosts(sorted);
        
      } catch (err) {
        setError(`Failed to load ${theme.errorPrefix} posts: ${err.message}`);
        setPosts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [theme]);

  const handlePostClick = (post) => {
    navigate(`${theme.routePath}/${post.id}`);
  };

  const handleKeyDown = (e, post) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handlePostClick(post);
    }
  };

  if (!theme) {
    return (
      <div className={styles.errorContainer}>
        <h1>Invalid Blog Category</h1>
        <p>The requested blog category "{category}" does not exist.</p>
      </div>
    );
  }

  return (
    <div 
      className={`${styles.pageContainer} ${styles[theme.containerClass]}`}
      style={{
        backgroundColor: theme.pageBackground
      }}
    >
      <div
        data-navbar-bg-detect
        style={{ position: 'absolute', top: 0, height: '80px', width: '100%' }}
      />

      <DynamicBackgroundShadow theme={theme} darkMode={darkMode} />

      <section 
        className={styles.postsSection}
        style={{
          backgroundColor: theme.sectionBackground
        }}
      >
        <h2 
          className={styles.postsHeading}
          style={{
            '--mobile-heading-bg': theme.mobileHeadingBackground
          }}
        >
          {theme.name}
        </h2>

        <div ref={containerRef} className={styles.blogGridContainer}>
          <div className={styles.blogGrid}>
            {loading ? (
              <div className={styles.loadingState}>
                <div className={styles.spinner}></div>
                <p>{theme.loadingText}</p>
              </div>
            ) : error ? (
              <div className={styles.errorState}>
                <h3>Oops! Something went wrong</h3>
                <p style={{ color: 'red' }}>{error}</p>
                <button 
                  onClick={() => window.location.reload()} 
                  className={styles.retryBtn}
                >
                  Try Again
                </button>
              </div>
            ) : !Array.isArray(posts) || posts.length === 0 ? (
              <div className={styles.emptyState}>
                <h3>No {theme.name} Available</h3>
                <p>{theme.emptyStateText}</p>
              </div>
            ) : (
              posts.map((post) => (
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
        style={{
          backgroundColor: theme.stripBackground
        }}
      ></div>
    </div>
  );
};

export default UniformPage;
