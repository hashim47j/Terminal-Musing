import React, { useEffect, useState, useRef, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import styles from './WritingsPage.module.css';
import writingsHero from '../../assets/writings-hero.png';
import writingsBackground from '../../assets/Wrting-background.png';

const DEFAULT_CONVERSATIONS_STORIES = [
  {
    id: 'conversations-the-midnight-train',
    title: 'Episode I: The Midnight Train',
    subtitle: 'Two strangers in a dimly lit carriage discover they share the same memory.',
    series: 'Conversations',
    episode: 'Episode I',
    date: '2026-11-15T00:00:00.000Z',
    author: 'Terminal Musing',
    setting: 'A second-class passenger coach on the night train departing Warsaw for Vienna.',
    characters: 'Julian & Elena',
    wordCount: 380,
  },
  {
    id: 'conversations-the-third-chair',
    title: 'Episode II: The Third Chair',
    subtitle: 'Two siblings clearing an estate must decide who keeps an empty chair.',
    series: 'Conversations',
    episode: 'Episode II',
    date: '2026-11-15T00:00:00.000Z',
    author: 'Terminal Musing',
    setting: 'The dining room of a century-old stone farmhouse filled with cardboard boxes.',
    characters: 'Tariq & Amira',
    wordCount: 350,
  }
];

const DynamicBackgroundShadow = () => {
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
      <img
        ref={imgRef}
        src={writingsBackground}
        alt="Background for color extraction"
        crossOrigin="anonymous"
        style={{ display: 'none' }}
        onLoad={handleImageLoad}
        onError={() => setImageLoaded(false)}
      />
      <section ref={headerRef} className={styles.headerSection}>
        <img
          src={writingsHero}
          alt="Writings Hero"
          className={styles.heroImage}
        />
      </section>
    </>
  );
};

// ── Standard Blog Card ──
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
  setActiveCardId
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
          style={{ backgroundColor: '#e2d7c5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          <span style={{ fontSize: '0.75rem', color: '#666', fontStyle: 'italic', letterSpacing: '1px' }}>
            {post.type === 'poem' || post.category === 'poems' ? 'POETRY' : 'WRITING'}
          </span>
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
              {new Date(post.date || Date.now()).toLocaleDateString('en-US', {
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
              {post.subheading || post.subtitle || post.title}
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
                  {new Date(post.date || Date.now()).toLocaleDateString('en-US', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })}
                </span>
              </div>
            </div>

            <div className={styles.rightContent}>
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

// ── Featured "Conversations" Series Card ──
const ConversationsCard = ({ 
  storiesCount, 
  onClick, 
  isHovered, 
  onMouseEnter, 
  onMouseLeave 
}) => {
  return (
    <article
      className={`${styles.blogCard} ${styles.seriesCard}`}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      }}
      aria-label="Open Conversations Drama Series"
    >
      <div className={styles.seriesIllustration}>
        <svg 
          className={styles.seriesIllustrationSvg} 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="1.5"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
        </svg>
        <span className={styles.seriesEpisodesCount}>
          {storiesCount} Episodes
        </span>
      </div>

      <div className={`${styles.blogContent} ${isHovered ? styles.hiddenContent : ''}`}>
        <span className={styles.seriesBadge}>Original Series</span>
        <h3 className={styles.blogTitle} style={{ fontSize: '1.35rem', color: '#1a1714' }}>
          Conversations
        </h3>
        <p style={{ fontSize: '0.82rem', color: '#6a6256', margin: '4px 0 0 0', lineHeight: 1.35 }}>
          A series of short drama-type stories exploring human dialogue and unspoken tensions.
        </p>

        <div className={styles.cardBottomFixed}>
          <div className={styles.cardSeparatorLine}></div>
          <div className={styles.cardMetaRow}>
            <span className={styles.cardAuthor}>by Terminal Musing</span>
            <span className={styles.cardWordCount} style={{ color: '#8b6834', fontWeight: 600 }}>
              Click to Open Series ➔
            </span>
          </div>
        </div>
      </div>

      {isHovered && (
        <div className={styles.hoverOverlay} style={{ background: 'linear-gradient(135deg, rgba(247,238,219,0.96), rgba(240,226,200,0.98))' }}>
          <div className={styles.subheadingContainer}>
            <span className={styles.seriesHoverTag}>DRAMA SERIES</span>
            <p className={styles.seriesPrompt}>
              "Dialogue is not the order of words—it is the room where two souls meet."
            </p>
          </div>

          <div className={styles.bottomFixed}>
            <div className={styles.leftContent}>
              <div className={styles.separatorLine}></div>
              <div className={styles.authorDateContainer}>
                <span className={styles.authorName}>Terminal Musing</span>
                <span className={styles.postDate}>{storiesCount} Episodes</span>
              </div>
            </div>

            <div className={styles.rightContent}>
              <button 
                className={`${styles.readBtn} ${styles.openSeriesBtn}`}
                onClick={(e) => {
                  e.stopPropagation();
                  onClick();
                }}
              >
                Explore Series
              </button>
            </div>
          </div>
        </div>
      )}
    </article>
  );
};

// ── Series Modal / Reader Drawer ──
const ConversationsModal = ({ stories, onClose, onReadStory }) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <div 
      className={styles.seriesModalBackdrop}
      onClick={onClose}
    >
      <div 
        className={styles.seriesModal}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="series-title"
      >
        <div className={styles.modalHeader}>
          <button 
            className={styles.modalCloseBtn}
            onClick={onClose}
            aria-label="Close series view"
          >
            ×
          </button>
          <span className={styles.modalSeriesBadge}>Original Series • Short Drama</span>
          <h2 id="series-title" className={styles.modalSeriesTitle}>Conversations</h2>
          <p className={styles.modalSeriesSubtitle}>A series of short drama-type stories by Terminal Musing</p>
          <p className={styles.modalSeriesSynopsis}>
            Dialogue is not merely an exchange of speech—it is the theater of human vulnerability, power, and memory. Each episode is a self-contained drama unfolding between characters in a single room, carriage, or moment.
          </p>
        </div>

        <div className={styles.modalContentList}>
          {stories.map((story, index) => (
            <div key={story.id || index} className={styles.storyItemCard}>
              <div className={styles.storyTopRow}>
                <span className={styles.storyEpisodeLabel}>
                  {story.episode || `Episode ${index + 1}`}
                </span>
                <span className={styles.storyMetaTime}>
                  {story.characters || 'Drama'} • {story.wordCount || 350} words
                </span>
              </div>

              <h3 className={styles.storyItemTitle}>{story.title}</h3>
              {story.subtitle && (
                <p className={styles.storyItemSubtitle}>{story.subtitle}</p>
              )}

              {story.setting && (
                <div className={styles.storyItemExcerpt}>
                  Setting: {story.setting}
                </div>
              )}

              <div className={styles.storyItemBottom}>
                <span className={styles.storyAuthorTag}>
                  by {story.author || 'Terminal Musing'}
                </span>
                <button 
                  className={styles.readEpisodeBtn}
                  onClick={() => onReadStory(story)}
                >
                  Read Episode
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ── Main Writings & Poems Page ──
const WritingsPage = () => {
  const containerRef = useRef(null); 
  const navigate = useNavigate();
  const location = useLocation();

  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [hoveredPostId, setHoveredPostId] = useState(null);
  const [currentAuthor, setCurrentAuthor] = useState('Terminal Musing');
  const [activeCardId, setActiveCardId] = useState(null);

  // Determine initial tab from query param ?tab=poems or URL path
  const [activeTab, setActiveTab] = useState(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('tab') === 'poems' || location.pathname.includes('/poems')) {
      return 'poems';
    }
    return 'writings';
  });

  const [isConversationsOpen, setIsConversationsOpen] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('tab') === 'poems') {
      setActiveTab('poems');
    }
  }, [location.search]);

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
    const fetchPosts = async () => {
      setLoading(true);
      setError('');
      
      try {
        const res = await fetch('/api/blogs/writings');
        if (!res.ok) throw new Error(`Failed to fetch blogs (status: ${res.status})`);
        
        const data = await res.json();
        
        let postsArray = [];
        if (Array.isArray(data)) {
          postsArray = data;
        } else if (data && Array.isArray(data.blogs)) {
          postsArray = data.blogs;
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
        setError(`Failed to load writings posts: ${err.message}`);
        setPosts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  // Separate posts into Poems, Conversations stories, and Standalone Writings
  const { poemPosts, conversationsStories, standaloneWritings } = useMemo(() => {
    const poems = [];
    const convos = [...DEFAULT_CONVERSATIONS_STORIES];
    const standalone = [];

    posts.forEach((post) => {
      const isPoem = post.type === 'poem' || post.category === 'poems' || post.id?.includes('poem') || post.title?.toLowerCase().includes('poem');
      const isConversation = post.series?.toLowerCase() === 'conversations' || post.id?.startsWith('conversations') || post.title?.toLowerCase().includes('conversations');

      if (isPoem) {
        poems.push(post);
      } else if (isConversation) {
        // If not already in default stories, add it
        const exists = convos.some(c => c.id === post.id);
        if (!exists) {
          convos.push({
            id: post.id,
            title: post.title,
            subtitle: post.subtitle || post.subheading || '',
            series: 'Conversations',
            episode: post.episode || `Episode ${convos.length + 1}`,
            date: post.date,
            author: post.author || 'Terminal Musing',
            setting: post.setting || 'Drama dialogue piece.',
            characters: post.characters || 'Characters',
            wordCount: getWordCount(post.content) || 350,
          });
        }
      } else {
        standalone.push(post);
      }
    });

    return {
      poemPosts: poems,
      conversationsStories: convos,
      standaloneWritings: standalone,
    };
  }, [posts]);

  const handlePostClick = (post) => {
    const targetCategory = post.category === 'poems' || post.type === 'poem' ? 'writings' : 'writings';
    navigate(`/blog/${targetCategory}/${post.id}`);
  };

  const handleReadStory = (story) => {
    setIsConversationsOpen(false);
    navigate(`/blog/writings/${story.id}`);
  };

  return (
    <div className={styles.writingsPageContainer}>
      <div
        data-navbar-bg-detect
        style={{ position: 'absolute', top: 0, height: '80px', width: '100%' }}
      />

      <DynamicBackgroundShadow />

      <section className={styles.postsSection}>
        <h2 className={styles.postsHeading}>Writings & Poetry</h2>

        {/* ── Sub-section Division Tabs ── */}
        <div className={styles.tabContainer} role="tablist" aria-label="Writings category tabs">
          <button
            role="tab"
            aria-selected={activeTab === 'writings'}
            className={`${styles.tabButton} ${activeTab === 'writings' ? styles.activeTab : ''}`}
            onClick={() => setActiveTab('writings')}
          >
            Writings & Drama
            <span className={styles.tabBadge}>
              {standaloneWritings.length + 1}
            </span>
          </button>

          <button
            role="tab"
            aria-selected={activeTab === 'poems'}
            className={`${styles.tabButton} ${activeTab === 'poems' ? styles.activeTab : ''}`}
            onClick={() => setActiveTab('poems')}
          >
            Poems
            <span className={styles.tabBadge}>
              {poemPosts.length}
            </span>
          </button>
        </div>

        <div ref={containerRef} className={styles.blogGridContainer}>
          {loading ? (
            <div className={styles.loadingState}>
              <div className={styles.spinner}></div>
              <p>Loading {activeTab === 'poems' ? 'poems' : 'writings'}...</p>
            </div>
          ) : error && posts.length === 0 ? (
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
          ) : (
            <div className={styles.blogGrid}>
              {activeTab === 'writings' ? (
                <>
                  {/* Featured Conversations Series Card */}
                  <ConversationsCard
                    storiesCount={conversationsStories.length}
                    onClick={() => setIsConversationsOpen(true)}
                    isHovered={hoveredPostId === 'conversations-series'}
                    onMouseEnter={() => setHoveredPostId('conversations-series')}
                    onMouseLeave={() => setHoveredPostId(null)}
                  />

                  {/* Other standalone writings */}
                  {standaloneWritings.map((post) => (
                    <BlogCard
                      key={post.id}
                      post={post}
                      hoveredPostId={hoveredPostId}
                      onMouseEnter={() => setHoveredPostId(post.id)}
                      onMouseLeave={() => setHoveredPostId(null)}
                      onClick={() => handlePostClick(post)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          handlePostClick(post);
                        }
                      }}
                      currentAuthor={currentAuthor}
                      getWordCount={getWordCount}
                      activeCardId={activeCardId}
                      setActiveCardId={setActiveCardId}
                    />
                  ))}
                </>
              ) : (
                /* Poems View */
                poemPosts.length === 0 ? (
                  <div className={styles.emptyState} style={{ gridColumn: '1 / -1' }}>
                    <h3>No Poems Available</h3>
                    <p>New poetic compositions will appear here soon.</p>
                  </div>
                ) : (
                  poemPosts.map((post) => (
                    <BlogCard
                      key={post.id}
                      post={post}
                      hoveredPostId={hoveredPostId}
                      onMouseEnter={() => setHoveredPostId(post.id)}
                      onMouseLeave={() => setHoveredPostId(null)}
                      onClick={() => handlePostClick(post)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          handlePostClick(post);
                        }
                      }}
                      currentAuthor={currentAuthor}
                      getWordCount={getWordCount}
                      activeCardId={activeCardId}
                      setActiveCardId={setActiveCardId}
                    />
                  ))
                )
              )}
            </div>
          )}
        </div>
      </section>

      {/* ── Conversations Series Modal / Drawer ── */}
      {isConversationsOpen && (
        <ConversationsModal
          stories={conversationsStories}
          onClose={() => setIsConversationsOpen(false)}
          onReadStory={handleReadStory}
        />
      )}

      <div className={styles.grayStrip}></div>
    </div>
  );
};

export default WritingsPage;
