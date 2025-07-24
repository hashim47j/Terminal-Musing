import React, { useEffect, useState, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import styles from './Navbar.module.css';

const Navbar = () => {
  const [hide, setHide] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const [isLightBackground, setIsLightBackground] = useState(true);
  const [leftWidth, setLeftWidth] = useState(null);
  const [tapCount, setTapCount] = useState(0);
  const [showSecretDialog, setShowSecretDialog] = useState(false);

  const location = useLocation();
  const currentPath = location.pathname;
  const brandWrapperRef = useRef(null);
  const tapTimeout = useRef(null);

  // Hide on scroll
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setHide(currentScrollY > lastScrollY && currentScrollY > 50);
      setLastScrollY(currentScrollY);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  // Detect light/dark background
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => setIsLightBackground(entry.isIntersecting),
      { threshold: 0.6 }
    );
    const target = document.querySelector('[data-navbar-bg-detect]');
    if (target) observer.observe(target);
    return () => target && observer.unobserve(target);
  }, [location]);

  // Resize brand wrapper
  useEffect(() => {
    const observer = new ResizeObserver((entries) => {
      for (let entry of entries) {
        const padding = 40;
        setLeftWidth(entry.contentRect.width + padding);
      }
    });
    if (brandWrapperRef.current) observer.observe(brandWrapperRef.current);
    return () => brandWrapperRef.current && observer.unobserve(brandWrapperRef.current);
  }, [currentPath]);

  // Path-based title
  const getCenterTitle = () => {
    switch (currentPath) {
      case '/': return 'Terminal Musing';
      case '/philosophy': return 'Philosophy';
      case '/history': return 'History';
      case '/writings': return 'Writings';
      case '/legal-social': return 'Legal & Social Concerns';
      case '/tech': return 'Tech';
      case '/daily-thoughts': return 'Daily Thoughts';
      case '/admin/login': return 'Author(s)';
      default: return '';
    }
  };

  // 3-tap admin upload
  const handleBrandTap = () => {
    if (tapTimeout.current) clearTimeout(tapTimeout.current);
    setTapCount((prev) => {
      const next = prev + 1;
      if (next === 3) {
        setShowSecretDialog(true);
        return 0;
      }
      tapTimeout.current = setTimeout(() => setTapCount(0), 1500);
      return next;
    });
  };

  return (
    <>
      {/* Left Title */}
      <div
        className={`
          ${styles.navbarLeft}
          ${hide ? styles.hide : ''}
          ${isLightBackground ? styles.darkText : styles.lightText}
        `}
        style={{ width: leftWidth ? `${leftWidth}px` : 'auto' }}
      >
        <div
          ref={brandWrapperRef}
          className={styles.brandWrapper}
          onClick={handleBrandTap}
          style={{ cursor: 'pointer' }}
        >
          <Link to={currentPath} className={styles.brand}>
            {getCenterTitle()}
          </Link>
        </div>
      </div>

      {/* Right Nav */}
      <div
        className={`
          ${styles.navbarRight}
          ${hide ? styles.hide : ''}
          ${isLightBackground ? styles.darkText : styles.lightText}
        `}
      >
        <div
          onClick={() => setMenuOpen(!menuOpen)}
          className={styles.hamburger}
          aria-label="Toggle menu"
          role="button"
        >
          ☰
        </div>
        <div className={`${styles.navLinks} ${menuOpen ? styles.mobileOpen : ''}`}>
          <Link to="/philosophy" className={styles.navLink}>Philosophy</Link>
          <Link to="/history" className={styles.navLink}>History</Link>
          <Link to="/writings" className={styles.navLink}>Writings</Link>
          <Link to="/legal-social" className={styles.navLink}>Legal & Social Issues</Link>
          <Link to="/tech" className={styles.navLink}>Tech</Link>
          <Link to="/daily-thoughts" className={styles.navLink}>Daily Thoughts</Link>
          <Link to="/admin/login" className={`${styles.navLink} ${styles.adminLink}`}>Author(s)</Link>
        </div>
      </div>

      {/* Admin Key Upload */}
      {showSecretDialog && (
        <div className={styles.secretOverlay} onClick={() => setShowSecretDialog(false)}>
          <div className={styles.secretBox} onClick={(e) => e.stopPropagation()}>
            <h3>Upload Admin Key</h3>
            <input type="file" />
            <button onClick={() => setShowSecretDialog(false)}>Close</button>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
