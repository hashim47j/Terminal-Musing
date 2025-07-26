import React, { useEffect, useState, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import styles from './Navbar.module.css';

// Import your PNG images
import jerusalemHomeLight from '../../assets/jerusalemhomelight.png';
import jerusalemHomeDark from '../../assets/jerusalemhomedark.png';

const Navbar = () => {
  const [hide, setHide] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const [isLightBackground, setIsLightBackground] = useState(true);
  const [leftNavbarWidth, setLeftNavbarWidth] = useState(null);
  const [bridgeWidth, setBridgeWidth] = useState(0);
  const [bridgeLeft, setBridgeLeft] = useState(0);
  const [tapCount, setTapCount] = useState(0);
  const [showSecretDialog, setShowSecretDialog] = useState(false);

  // highlightStyle state for the active link bar
  const [highlightStyle, setHighlightStyle] = useState({});

  // navLinksRef now points to the SINGLE .navLinks element
  const navLinksRef = useRef(null);

  const location = useLocation();
  const currentPath = location.pathname;
  const brandWrapperRef = useRef(null);
  const tapTimeout = useRef(null);

  const HOME_BUTTON_LEFT = 30;
  const HOME_BUTTON_WIDTH = 54;
  const NAVBAR_LEFT_INITIAL_LEFT = 105;

  // Function to update highlight bar position and width
  // It now correctly always uses navLinksRef for its parent calculations
  const updateHighlight = (element) => {
    if (element && navLinksRef.current) {
      const parentRect = navLinksRef.current.getBoundingClientRect();
      const linkRect = element.getBoundingClientRect();

      // Only set highlightStyle if the parent is visible (e.g., desktop, or mobile when menu is open)
      // This helps prevent highlight from showing up oddly if mobile menu is hidden but highlight calculation runs
      if (window.innerWidth > 768 && parentRect.width > 0 && parentRect.height > 0) { // Only show highlight on desktop
        setHighlightStyle({
          width: linkRect.width,
          transform: `translateX(${linkRect.left - parentRect.left}px)`,
          opacity: 1
        });
      } else {
        setHighlightStyle({ // Hide highlight on mobile or if parent is not visible
          width: 0,
          transform: `translateX(0px)`,
          opacity: 0
        });
      }
    } else {
      setHighlightStyle({
        width: 0,
        transform: `translateX(0px)`,
        opacity: 0
      });
    }
  };

  // Set initial highlight based on current path on mount/path change
  useEffect(() => {
    // Always use navLinksRef as it's the single source of truth for navigation links
    const activeLink = navLinksRef.current?.querySelector(`[href="${currentPath}"]`);
    updateHighlight(activeLink);

    // If menu is open and path changes (e.g., direct URL change or back/forward), close it
    if (menuOpen) {
      setMenuOpen(false);
    }
  }, [currentPath, menuOpen]); // Added menuOpen to dependency array to re-evaluate on menu state change

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      // Only apply hide/show logic for desktop
      if (window.innerWidth > 768) {
        setHide(currentScrollY > lastScrollY && currentScrollY > 50);
      } else {
        setHide(false); // Navbar elements should not hide on scroll in mobile view
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

  return (
    <>
      {console.log("Is menu open in render? ", menuOpen)}

      {/* Floating Home Button (visible on both desktop and mobile) */}
      <Link
        to="/"
        className={`${styles.homeButton} ${hide ? styles.hide : ''}`}
        aria-label="Home"
      >
        <img
          src={isLightBackground ? jerusalemHomeDark : jerusalemHomeLight}
          alt="Home"
          style={{ width: '27px', height: '27px', objectFit: 'contain' }}
        />
      </Link>

      {/* Bridge Connector (desktop-only, hidden by CSS on mobile) */}
      <div
        className={`${styles.bridgeConnector} ${hide ? styles.hide : ''} ${isLightBackground ? styles.darkText : styles.lightText}`}
        style={{
          width: `${bridgeWidth}px`,
          left: `${bridgeLeft}px`
        }}
      ></div>

      {/* Left Title Island (desktop-only, hidden by CSS on mobile) */}
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

      {/* Right Navbar Island - Contains Hamburger and Nav Links */}
      {/* This element adapts for mobile/desktop purely through CSS */}
      <div
        className={`
          ${styles.navbarRight}
          ${hide ? styles.hide : ''}
          ${isLightBackground ? styles.darkText : styles.lightText}
        `}
      >
        {/* Hamburger Menu - hidden on desktop by CSS, visible on mobile */}
        <div
          onClick={() => {
            console.log("Hamburger clicked! Current menuOpen state:", menuOpen);
            setMenuOpen(!menuOpen);
          }}
          className={styles.hamburger}
          aria-label="Toggle menu"
          role="button"
        >
          ☰
        </div>

        {/* This is the overlay that appears when the mobile menu is open */}
        {menuOpen && (
            <div className={styles.mobileOverlay} onClick={() => setMenuOpen(false)}></div>
        )}

        {/* Navigation Links - This is the SINGLE .navLinks element.
            Its display (row/column, inline/fixed) is controlled by CSS media queries.
            mobileOpen class is added for mobile-specific slide animation.
        */}
        <div ref={navLinksRef} className={`${styles.navLinks} ${menuOpen ? styles.mobileOpen : ''}`}>
          {/* Highlight bar inside the navLinks container */}
          <div className={`${styles.highlightBar} ${getHighlightBarActiveClass()}`} style={highlightStyle}></div>

          {/* Navigation Links - clicking a link will now also close the menu */}
          <Link to="/philosophy" className={styles.navLink} onClick={(e) => { updateHighlight(e.currentTarget); setMenuOpen(false); }}>Philosophy</Link>
          <Link to="/history" className={styles.navLink} onClick={(e) => { updateHighlight(e.currentTarget); setMenuOpen(false); }}>History</Link>
          <Link to="/writings" className={styles.navLink} onClick={(e) => { updateHighlight(e.currentTarget); setMenuOpen(false); }}>Writings</Link>
          <Link to="/legal-social" className={styles.navLink} onClick={(e) => { updateHighlight(e.currentTarget); setMenuOpen(false); }}>Legal & Social Issues</Link>
          <Link to="/tech" className={styles.navLink} onClick={(e) => { updateHighlight(e.currentTarget); setMenuOpen(false); }}>Tech</Link>
          <Link
            to="/daily-thoughts"
            className={`${styles.navLink} ${currentPath === '/daily-thoughts' ? styles.dailyThoughtsActive : ''}`}
            onClick={(e) => { updateHighlight(e.currentTarget); setMenuOpen(false); }}
          >
            Daily Thoughts
          </Link>
          <Link to="/admin/login" className={`${styles.navLink} ${styles.adminLink}`} onClick={(e) => { updateHighlight(e.currentTarget); setMenuOpen(false); }}>Author(s)</Link>
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