import React, { useEffect, useState, useRef, useContext } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import styles from "./Navbar.module.css";
import { PageContext } from "../../context/PageContext.jsx";

import jerusalemHomeLight from "../../assets/jerusalemhomelight.png";
import jerusalemHomeDark from "../../assets/jerusalemhomedark.png";

const Navbar = () => {
  // State for the new feature
  const { pageTitle } = useContext(PageContext);
  const [isScrolled, setIsScrolled] = useState(false);

  // General Navbar state
  const [hide, setHide] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);
  
  // All other state variables and hooks...
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuClosing, setMenuClosing] = useState(false);
  const [isLightBackground, setIsLightBackground] = useState(false);
  const [leftNavbarWidth, setLeftNavbarWidth] = useState(null);
  const [bridgeWidth, setBridgeWidth] = useState(0);
  const [bridgeLeft, setBridgeLeft] = useState(0);
  const [tapCount, setTapCount] = useState(0);
  const [showSecretDialog, setShowSecretDialog] = useState(false);
  const [clickedPath, setClickedPath] = useState(null);
  const [highlightStyle, setHighlightStyle] = useState({});
  const [isMobileView, setIsMobileView] = useState(false);
  const [hoverProgress, setHoverProgress] = useState({});
  
  const navLinksRef = useRef(null);
  const location = useLocation();
  const currentPath = location.pathname;
  const isBlogPostPage = currentPath.startsWith('/blogs/');
  const brandWrapperRef = useRef(null);
  const tapTimeout = useRef(null);
  const navigate = useNavigate();

  const HOME_BUTTON_LEFT = 30;
  const HOME_BUTTON_WIDTH = 54;
  const NAVBAR_LEFT_INITIAL_LEFT = 105;

  // --- DEBUGGING STEP ---
  // This will log the critical state values to the console
  useEffect(() => {
    console.log("NAVBAR DEBUG:", {
      isBlogPostPage,
      pageTitle,
      isScrolled,
      hide
    });
  }, [isBlogPostPage, pageTitle, isScrolled, hide]);


  // --- Unified Scroll Handler ---
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (isBlogPostPage) {
        setIsScrolled(currentScrollY > 50);
      } else {
        setIsScrolled(false);
      }
      if (window.innerWidth > 768 && !isBlogPostPage) {
        setHide(currentScrollY > lastScrollY && currentScrollY > 50);
      } else {
        setHide(false); 
      }
      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isBlogPostPage, lastScrollY]);

  const getCenterTitle = () => {
    if (isBlogPostPage && pageTitle) {
      return pageTitle;
    }
    switch (currentPath) {
      case "/": return "Terminal Musing";
      case "/philosophy": return "Philosophy";
      case "/history": return "History";
      case "/writings": return "Writings";
      case "/legal-social": return "Legal & Social Concerns";
      case "/tech": return "Tech";
      case "/daily-thoughts": return "Daily Thoughts";
      case "/admin/login": return "Author(s)";
      default: return "";
    }
  };
  
  // The rest of your functions and useEffects
  const updateHighlight = (element) => { /* ... */ };
  const handleNavLinkMouseMove = (e, path) => { /* ... */ };
  const handleNavLinkMouseLeave = (path) => { /* ... */ };
  useEffect(() => { /* for highlight bar */ }, [currentPath]);
  useEffect(() => { /* for color detection */ }, [currentPath]);
  useEffect(() => { /* for resize observer */ }, [currentPath]);
  useEffect(() => { /* for mobile view */ }, []);
  const handleBrandTap = () => { /* ... */ };
  const getHighlightBarActiveClass = () => { /* ... */ };

  const toggleMenu = () => {
    if (menuOpen) {
      setMenuClosing(true);
      setTimeout(() => {
        setMenuOpen(false);
        setMenuClosing(false);
        setClickedPath(null);
      }, 500);
    } else {
      setMenuOpen(true);
    }
  };
  
  const handleNavLinkClick = (e, path) => {
    e.preventDefault();
    updateHighlight(e.currentTarget);
    setClickedPath(path);
    if (menuOpen) {
      toggleMenu();
    }
    setTimeout(() => {
      navigate(path);
    }, 100);
  };

  return (
    <>
      <Link to="/" className={`${styles.homeButton} ${hide ? styles.hide : ""}`} aria-label="Home">
        <img src={isLightBackground ? jerusalemHomeDark : jerusalemHomeLight} alt="Home" style={{ width: "27px", height: "27px", objectFit: "contain" }} />
      </Link>
      <div className={`${styles.bridgeConnector} ${hide ? styles.hide : ""} ${isLightBackground ? styles.darkText : styles.lightText}`} style={{ width: `${bridgeWidth}px`, left: `${bridgeLeft}px` }}></div>
      
      <div
        className={`
          ${styles.navbarLeft}
          ${currentPath === "/legal-social" ? styles.legalSocialPage : ""}
          ${isBlogPostPage ? styles.blogPostActive : ''}
          ${isLightBackground ? styles.darkText : styles.lightText}
          ${!isBlogPostPage && hide ? styles.hide : ''}
          ${isBlogPostPage && !isScrolled ? styles.hide : ''}
        `}
        style={{ width: !isMobileView && leftNavbarWidth ? `${leftNavbarWidth}px` : "auto" }}
      >
        <div ref={brandWrapperRef} className={styles.brandWrapper} onClick={handleBrandTap} style={{ cursor: "pointer" }}>
          <Link to={currentPath} className={styles.brand}>
            {getCenterTitle()}
          </Link>
        </div>
      </div>
      
      {/* --- FIX: The complete, unabridged JSX for the right navbar --- */}
      <div
        className={`
          ${styles.navbarRight}
          ${hide ? styles.hide : ""}
          ${isLightBackground ? styles.darkText : styles.lightText}
          ${menuOpen ? styles.menuOpen : ""}
          ${menuClosing ? styles.menuClosing : ""}
        `}
      >
        <div
          onClick={toggleMenu}
          className={`${styles.hamburger} ${menuOpen ? styles.hamburgerActive : ""}`}
          aria-label="Toggle menu"
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              toggleMenu();
            }
          }}
        >
          <span className={styles.line}></span>
          <span className={styles.line}></span>
          <span className={styles.line}></span>
        </div>

        <div
          ref={navLinksRef}
          className={`${styles.navLinks} ${menuOpen ? styles.mobileOpen : ""} ${menuClosing ? styles.mobileClosing : ""}`}
          onClick={(e) => e.stopPropagation()}
        >
          <div className={`${styles.highlightBar} ${getHighlightBarActiveClass()}`} style={highlightStyle}></div>
          {[
            { to: "/philosophy", label: "Philosophy" },
            { to: "/history", label: "History" },
            { to: "/writings", label: "Writings" },
            { to: "/legal-social", label: "Legal & Social Issues" },
            { to: "/tech", label: "Tech" },
            { to: "/daily-thoughts", label: "Daily Thoughts" },
            { to: "/admin/login", label: "Author(s)", isAdmin: true },
          ].map(({ to, label, isAdmin }) => (
            <Link
              key={to}
              to={to}
              className={`
                ${styles.navLink} 
                ${menuClosing && clickedPath === to ? styles.clickedLink : ""}
                ${currentPath === to && to === "/daily-thoughts" ? styles.dailyThoughtsActive : ""}
                ${isAdmin ? styles.adminLink : ""}
              `}
              onClick={(e) => handleNavLinkClick(e, to)}
              onMouseMove={(e) => !isMobileView && handleNavLinkMouseMove(e, to)}
              onMouseLeave={() => !isMobileView && handleNavLinkMouseLeave(to)}
              style={{ "--hover-progress": hoverProgress[to] || 0 }}
            >
              {label}
            </Link>
          ))}
        </div>
      </div>

      <div className={`${styles.mobileOverlay} ${menuOpen ? styles.active : ""}`} onClick={toggleMenu}></div>

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
