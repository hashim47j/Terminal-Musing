import React, { useEffect, useState, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import styles from './Navbar.module.css';

import jerusalemHomeLight from '../../assets/jerusalemhomelight.png';
import jerusalemHomeDark from '../../assets/jerusalemhomedark.png';

const Navbar = () => {
  const [hide, setHide] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuClosing, setMenuClosing] = useState(false);
  const [isLightBackground, setIsLightBackground] = useState(true);
  const [leftNavbarWidth, setLeftNavbarWidth] = useState(null);
  const [bridgeWidth, setBridgeWidth] = useState(0);
  const [bridgeLeft, setBridgeLeft] = useState(0);
  const [tapCount, setTapCount] = useState(0);
  const [showSecretDialog, setShowSecretDialog] = useState(false);

  const [highlightStyle, setHighlightStyle] = useState({});
  const navLinksRef = useRef(null);
  const location = useLocation();
  const currentPath = location.pathname;
  const brandWrapperRef = useRef(null);
  const tapTimeout = useRef(null);

  const HOME_BUTTON_LEFT = 30;
  const HOME_BUTTON_WIDTH = 54;
  const NAVBAR_LEFT_INITIAL_LEFT = 105;

  const updateHighlight = (element) => {
    if (element && navLinksRef.current) {
      const parentRect = navLinksRef.current.getBoundingClientRect();
      const linkRect = element.getBoundingClientRect();

      if (window.innerWidth > 768 && parentRect.width > 0 && parentRect.height > 0) {
        setHighlightStyle({
          width: linkRect.width,
          transform: `translateX(${linkRect.left - parentRect.left}px)`,
          opacity: 1
        });
      } else {
        setHighlightStyle({ width: 0, transform: `translateX(0px)`, opacity: 0 });
      }
    } else {
      setHighlightStyle({ width: 0, transform: `translateX(0px)`, opacity: 0 });
    }
  };

  useEffect(() => {
    const activeLink = navLinksRef.current?.querySelector(`[href="${currentPath}"]`);
    updateHighlight(activeLink);
  }, [currentPath]);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (window.innerWidth > 768) {
        setHide(currentScrollY > lastScrollY && currentScrollY > 50);
      } else {
        setHide(false);
      }
      setLastScrollY(currentScrollY);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => setIsLightBackground(entry.isIntersecting),
      { threshold: 0.6 }
    );
    const target = document.querySelector('[data-navbar-bg-detect]');
    if (target) observer.observe(target);
    return () => target && observer.unobserve(target);
  }, [location]);

  useEffect(() => {
    const observer = new ResizeObserver((entries) => {
      for (let entry of entries) {
        const padding = 40;
        const calculatedLeftNavbarWidth = entry.contentRect.width + padding;
        setLeftNavbarWidth(calculatedLeftNavbarWidth);

        const homeButtonCenter = HOME_BUTTON_LEFT + (HOME_BUTTON_WIDTH / 2);
        setBridgeLeft(homeButtonCenter);
        const calculatedBridgeWidth = NAVBAR_LEFT_INITIAL_LEFT - homeButtonCenter;
        setBridgeWidth(Math.max(0, calculatedBridgeWidth));
      }
    });
    if (brandWrapperRef.current) observer.observe(brandWrapperRef.current);
    return () => brandWrapperRef.current && observer.unobserve(brandWrapperRef.current);
  }, [currentPath]);

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

  const getHighlightBarActiveClass = () => {
    switch (currentPath) {
      case '/daily-thoughts': return styles.dailyThoughtsActive;
      case '/philosophy': return styles.philosophyActive;
      case '/history': return styles.historyActive;
      case '/writings': return styles.writingsActive;
      case '/legal-social': return styles.legalSocialActive;
      default: return '';
    }
  };

  const toggleMenu = () => {
    if (menuOpen) {
      setMenuClosing(true);
      setTimeout(() => {
        setMenuOpen(false);
        setMenuClosing(false);
      }, 300); // This should ideally match the overall closing transition duration
    } else {
      setMenuOpen(true);
    }
  };

  return (
    <>
      <Link to="/" className={`${styles.homeButton} ${hide ? styles.hide : ''}`} aria-label="Home">
        <img
          src={isLightBackground ? jerusalemHomeDark : jerusalemHomeLight}
          alt="Home"
          style={{ width: '27px', height: '27px', objectFit: 'contain' }}
        />
      </Link>

      <div
        className={`${styles.bridgeConnector} ${hide ? styles.hide : ''} ${isLightBackground ? styles.darkText : styles.lightText}`}
        style={{
          width: `${bridgeWidth}px`,
          left: `${bridgeLeft}px`
        }}
      ></div>

      <div
        className={`
          ${styles.navbarLeft}
          ${hide ? styles.hide : ''}
          ${isLightBackground ? styles.darkText : styles.lightText}
        `}
        style={{ width: leftNavbarWidth ? `${leftNavbarWidth}px` : 'auto' }}
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

      <div
        className={`
          ${styles.navbarRight}
          ${hide ? styles.hide : ''}
          ${isLightBackground ? styles.darkText : styles.lightText}
        `}
      >
        <div
          onClick={toggleMenu}
          className={styles.hamburger}
          aria-label="Toggle menu"
          role="button"
        >
          ☰
        </div>

        {/* Mobile Overlay */}
        <div
          className={`${styles.mobileOverlay} ${menuOpen ? styles.active : ''}`}
          onClick={toggleMenu}
        ></div>

        <div
          ref={navLinksRef}
          className={`${styles.navLinks} ${menuOpen ? styles.mobileOpen : ''} ${menuClosing ? styles.mobileClosing : ''}`}
          onClick={(e) => e.stopPropagation()}
        >
          <div className={`${styles.highlightBar} ${getHighlightBarActiveClass()}`} style={highlightStyle}></div>

          <Link to="/philosophy" className={styles.navLink} onClick={(e) => { updateHighlight(e.currentTarget); toggleMenu(); }}>Philosophy</Link>
          <Link to="/history" className={styles.navLink} onClick={(e) => { updateHighlight(e.currentTarget); toggleMenu(); }}>History</Link>
          <Link to="/writings" className={styles.navLink} onClick={(e) => { updateHighlight(e.currentTarget); toggleMenu(); }}>Writings</Link>
          <Link to="/legal-social" className={styles.navLink} onClick={(e) => { updateHighlight(e.currentTarget); toggleMenu(); }}>Legal & Social Issues</Link>
          <Link to="/tech" className={styles.navLink} onClick={(e) => { updateHighlight(e.currentTarget); toggleMenu(); }}>Tech</Link>
          <Link
            to="/daily-thoughts"
            className={`${styles.navLink} ${currentPath === '/daily-thoughts' ? styles.dailyThoughtsActive : ''}`}
            onClick={(e) => { updateHighlight(e.currentTarget); toggleMenu(); }}
          >
            Daily Thoughts
          </Link>
          <Link to="/admin/login" className={`${styles.navLink} ${styles.adminLink}`} onClick={(e) => { updateHighlight(e.currentTarget); toggleMenu(); }}>Author(s)</Link>
        </div>
      </div>

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