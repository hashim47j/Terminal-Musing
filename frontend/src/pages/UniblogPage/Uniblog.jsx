import React, { useEffect, useState, useContext, useMemo, useRef } from 'react';
import { useParams } from 'react-router-dom';
import styles from './Uniblog.module.css';
import { useDarkMode } from '../../context/DarkModeContext';
import BlogRenderer from '../../components/BlogRenderer';
import { PageContext } from '../../context/PageContext';
import CommentSection from '../../components/CommentSection/CommentSection';

const THEMES = {
  history:    { name: 'history',    display: 'History' },
  philosophy: { name: 'philosophy', display: 'Philosophy' },
  tech:       { name: 'tech',       display: 'Technology' },
  lsconcern:  { name: 'lsconcern',  display: 'Legal & Social' }
};

const Uniblog = () => {
  const { category, id } = useParams();
  const { darkMode } = useDarkMode();
  const { setPageTitle } = useContext(PageContext);

  const [blog, setBlog]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');

  const heroRef = useRef(null);
  const [scrollProgress, setScrollProgress] = useState(0);

  const currentTheme = useMemo(() => THEMES[category] || THEMES.history, [category]);

  const apiUrls = useMemo(() => ({
    blog:  `/api/blogs/${category}/${id}`,
    views: `/api/views/${category}/${id}`
  }), [category, id]);

  // Scroll blur animation
  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          if (!heroRef.current) return;
          const progress = Math.min(window.scrollY / (heroRef.current.offsetHeight * 0.5), 1);
          setScrollProgress(progress);
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Fetch blog + track view
  useEffect(() => {
    if (!category || !id) return;
    const fetchBlog = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await fetch(apiUrls.blog);
        if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}`);
        const data = await res.json();
        setBlog(data);
        if (data?.title) setPageTitle(`${data.title} - ${currentTheme.display}`);
        fetch(apiUrls.views, { method: 'POST' }).catch(() => {});
      } catch (err) {
        setError(err.message || 'Failed to load blog');
        setBlog(null);
      } finally {
        setLoading(false);
      }
    };
    fetchBlog();
    return () => setPageTitle(null);
  }, [category, id, apiUrls.blog, apiUrls.views, setPageTitle, currentTheme.display]);

  const formattedDate = useMemo(() => {
    if (!blog?.date) return '';
    return new Date(blog.date).toLocaleDateString('en-US', {
      day: 'numeric', month: 'short', year: 'numeric'
    });
  }, [blog?.date]);

  const metaText = useMemo(() => {
    if (!formattedDate) return '';
    return `On ${formattedDate}${blog?.author ? `, By ${blog.author}` : ''}`;
  }, [formattedDate, blog?.author]);

  const subtitle = useMemo(
    () => blog?.subtitle || blog?.subheading || '',
    [blog?.subtitle, blog?.subheading]
  );

  // ── Loading / Error / Not Found states ──
  if (loading) return (
    <div className={`${styles.blogPageOuterContainer} ${styles[currentTheme.name]} ${darkMode ? styles.darkMode : ''}`}>
      <div className={styles.mainContentWrapper}>
        <div className={styles.loadingContainer}>
          <div className={styles.loadingSpinner}></div>
          <p>Loading blog post...</p>
        </div>
      </div>
    </div>
  );

  if (error) return (
    <div className={`${styles.blogPageOuterContainer} ${styles[currentTheme.name]} ${darkMode ? styles.darkMode : ''}`}>
      <div className={styles.mainContentWrapper}>
        <div className={styles.errorContainer}>
          <h2>Oops! Something went wrong</h2>
          <p style={{ color: 'red' }}>{error}</p>
          <button onClick={() => window.location.reload()} className={styles.retryBtn}>
            Try Again
          </button>
        </div>
      </div>
    </div>
  );

  if (!blog) return (
    <div className={`${styles.blogPageOuterContainer} ${styles[currentTheme.name]} ${darkMode ? styles.darkMode : ''}`}>
      <div className={styles.mainContentWrapper}>
        <div className={styles.notFoundContainer}>
          <h2>Blog Post Not Found</h2>
          <p>The blog post you're looking for doesn't exist or has been moved.</p>
          <button onClick={() => window.history.back()} className={styles.goBackBtn}>Go Back</button>
        </div>
      </div>
    </div>
  );

  return (
    <div className={`${styles.blogPageOuterContainer} ${styles[currentTheme.name]} ${darkMode ? styles.darkMode : ''}`}>
      <div data-navbar-bg-detect style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '200px', pointerEvents: 'none', zIndex: -1 }} />

      {/* Hero */}
      {blog.coverImage && (
        <section ref={heroRef} className={styles.heroSection} style={{ '--scroll-progress': scrollProgress }}>
          <div className={styles.heroImageWrapper}>
            <img
              src={blog.coverImage}
              alt={blog.title}
              className={styles.heroImage}
              onError={(e) => { e.target.style.display = 'none'; }}
            />
            <div className={styles.heroGrain} />
            <div className={styles.heroOverlay} />
            <div className={styles.heroBlurOverlay} />
          </div>
          <div
            className={styles.heroContent}
            style={{
              transform: `translateY(${scrollProgress * 30}px)`,
              opacity: 1 - scrollProgress * 0.6,
            }}
          >
            <div className={styles.categoryBadge}>{currentTheme.display}</div>
            <h1 className={styles.title}>{blog.title}</h1>
            {subtitle && <p className={styles.subheadingText}>{subtitle}</p>}
            <p className={styles.date}>{metaText}</p>
          </div>
        </section>
      )}

      {/* Main Content */}
      <div className={styles.mainContentWrapper}>
        <section className={styles.postContentSection}>
          {!blog.coverImage && (
            <>
              <div className={`${styles.titleLine} ${styles[currentTheme.name]}`} />
              <div className={styles.categoryBadge}>{currentTheme.display}</div>
              <h1 className={styles.contentTitle}>{blog.title}</h1>
              <p className={styles.contentDate}>{metaText}</p>
            </>
          )}
          <div className={styles.contentBodyPlaceholder}>
            <BlogRenderer content={blog.content?.filter(block =>
              !(block.type === 'paragraph' && block.text === subtitle)
            ) || blog.content} />
          </div>
        </section>

        {/* ✅ CommentSection fully self-contained */}
        <CommentSection category={category} blogId={id} />
      </div>
    </div>
  );
};

export default Uniblog;
