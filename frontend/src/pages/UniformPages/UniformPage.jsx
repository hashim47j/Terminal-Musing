// frontend/src/pages/UniformPages/UniformPage.jsx
import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import styles from './UniformPage.module.css';
import { getThemeByCategory, getCategoryFromPath } from '../../config/blogThemes';

// ✅ Dynamic Background Shadow Component
const DynamicBackgroundShadow = ({ theme }) => {
  const headerRef = useRef(null);
  const imgRef = useRef(null);
  const [imageLoaded, setImageLoaded] = useState(false);

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
      {theme.headerConfig.backgroundImage && (
        <img
          ref={imgRef}
          src={theme.headerConfig.backgroundImage}
          alt="Background for color extraction"
          crossOrigin="anonymous"
          style={{ display: 'none' }}
          onLoad={handleImageLoad}
          onError={() => setImageLoaded(false)}
        />
      )}
      <HeaderSection theme={theme} headerRef={headerRef} />
    </>
  );
};

// ✅ Header Section Component
const HeaderSection = ({ theme, headerRef }) => {
  return (
    <section 
      ref={headerRef} 
      className={styles.headerSection}
      style={{
        backgroundImage: `url(${theme.headerConfig.backgroundImage})`
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

// ✅ Blog Card Component (keep all exact functionality)
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

// ✅ Main Uniform Page Component
const UniformPage = () => {
  const containerRef = useRef(null); 
  const navigate = useNavigate();
  const location = useLocation();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [hoveredPostId, setHoveredPostId] = useState(null);
  const [currentAuthor, setCurrentAuthor] = useState('Terminal Musing');
  const [activeCardId, setActiveCardId] = useState(null);

  const category = getCategoryFromPath(location.pathname);
  const theme = getThemeByCategory(category);

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
        setError(`Failed to load ${theme.postsSection.heading.toLowerCase()}: ${err.message}`);
        setPosts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [theme]);

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

      <DynamicBackgroundShadow theme={theme} />

      <section 
        className={styles.postsSection}
        style={{ backgroundColor: theme.postsSection.backgroundColor }}
      >
        <h2 className={styles.postsHeading}>{theme.postsSection.heading}</h2>

        <div ref={containerRef} className={styles.blogGridContainer}>
          <div className={styles.blogGrid}>
            {loading ? (
              <div className={styles.loadingState}>
                <div className={styles.spinner}></div>
                <p>{theme.postsSection.loadingText}</p>
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
                <h3>{theme.postsSection.emptyStateTitle}</h3>
                <p>{theme.postsSection.emptyStateText}</p>
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
        style={{ backgroundColor: theme.stripColor }}
      ></div>
    </div>
  );
};

export default UniformPage;
