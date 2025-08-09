import React, { useEffect, useState, useRef, useContext } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import styles from "./Navbar.module.css";
import { PageContext } from "../../context/PageContext.jsx"; // Make sure this points to .jsx

import jerusalemHomeLight from "../../assets/jerusalemhomelight.png";
import jerusalemHomeDark from "../../assets/jerusalemhomedark.png";

const Navbar = () => {
  // State for the new feature
  const { pageTitle } = useContext(PageContext);
  const [isScrolled, setIsScrolled] = useState(false);

  // General Navbar state
  const [hide, setHide] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);
  
  // All other state variables
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
  
  // Refs and hooks
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

  // --- FIX: THIS IS THE NEW, SINGLE, UNIFIED SCROLL HANDLER ---
  // It replaces the two conflicting useEffects from the previous code.
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      // Logic for the blog page "title on scroll"
      if (isBlogPostPage) {
        setIsScrolled(currentScrollY > 50);
      } else {
        // On non-blog pages, this state is always false
        setIsScrolled(false);
      }
      
      // Logic for "hide on scroll down" (on non-blog pages)
      if (window.innerWidth > 768 && !isBlogPostPage) {
        setHide(currentScrollY > lastScrollY && currentScrollY > 50);
      } else {
        // On mobile or on a blog page, this type of hiding is disabled.
        setHide(false); 
      }
      
      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isBlogPostPage, lastScrollY]); // Dependencies are correct

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

  // --- The rest of your functions and useEffects are correct and unchanged ---
  const updateHighlight = (element) => { /* ... */ };
  const handleNavLinkMouseMove = (e, path) => { /* ... */ };
  const handleNavLinkMouseLeave = (path) => { /* ... */ };
  useEffect(() => {
    const activeLink = navLinksRef.current?.querySelector(`[href="${currentPath}"]`);
    updateHighlight(activeLink);
  }, [currentPath]);
  useEffect(() => {
    const lightBackgroundPaths = [ "/philosophy", "/history", "/writings", "/legal-social", "/tech", "/daily-thoughts" ];
    const isPathDefaultLight = lightBackgroundPaths.some(path => currentPath.startsWith(path));
    const intersectingSensors = new Set();
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) intersectingSensors.add(entry.target);
        else intersectingSensors.delete(entry.target);
      });
      setIsLightBackground(intersectingSensors.size > 0 || isPathDefaultLight);
    }, { threshold: 0.6 });
    const targets = document.querySelectorAll("[data-navbar-bg-detect]");
    targets.forEach(target => observer.observe(target));
    return () => targets.forEach(target => observer.unobserve(target));
  }, [currentPath]);
  useEffect(() => {
    const observer = new ResizeObserver((entries) => {
      for (let entry of entries) {
        const padding = 40;
        const calculatedLeftNavbarWidth = entry.contentRect.width + padding;
        setLeftNavbarWidth(calculatedLeftNavbarWidth);
        const homeButtonCenter = HOME_BUTTON_LEFT + HOME_BUTTON_WIDTH / 2;
        setBridgeLeft(homeButtonCenter);
        const calculatedBridgeWidth = NAVBAR_LEFT_INITIAL_LEFT - homeButtonCenter;
        setBridgeWidth(Math.max(0, calculatedBridgeWidth));
      }
    });
    if (brandWrapperRef.current) observer.observe(brandWrapperRef.current);
    return () => brandWrapperRef.current && observer.unobserve(brandWrapperRef.current);
  }, [currentPath]);
  useEffect(() => {
    const handleResize = () => setIsMobileView(window.innerWidth <= 768);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  const handleBrandTap = () => { /* ... */ };
  const getHighlightBarActiveClass = () => { /* ... */ };
  const toggleMenu = () => { /* ... */ };
  const handleNavLinkClick = (e, path) => { /* ... */ };

  return (
    <>
      <Link to="/" className={`${styles.homeButton} ${hide ? styles.hide : ""}`} aria-label="Home">
        <img src={isLightBackground ? jerusalemHomeDark : jerusalemHomeLight} alt="Home" style={{ width: "27px", height: "27px", objectFit: "contain" }} />
      </Link>
      <div className={`${styles.bridgeConnector} ${hide ? styles.hide : ""} ${isLightBackground ? styles.darkText : styles.lightText}`} style={{ width: `${bridgeWidth}px`, left: `${bridgeLeft}px` }}></div>
      
      {/* --- FIX: THIS CLASSNAME LOGIC IS NOW RELIABLE --- */}
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
      
      {/* The rest of the Navbar JSX is unchanged */}
      <div className={`
          ${styles.navbarRight}
          ${hide ? styles.hide : ""}
          ${isLightBackground ? styles.darkText : styles.lightText}
          ${menuOpen ? styles.menuOpen : ""}
          ${menuClosing ? styles.menuClosing : ""}
      `}>
        <div onClick={toggleMenu} className={`${styles.hamburger} ${menuOpen ? styles.hamburgerActive : ""}`} aria-label="Toggle menu" role="button" tabIndex={0} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { toggleMenu(); } }}>
          <span className={styles.line}></span>
          <span className={styles.line}></span>
          <span className={styles.line}></span>
        </div>
        <div ref={navLinksRef} className={`${styles.navLinks} ${menuOpen ? styles.mobileOpen : ""} ${menuClosing ? styles.mobileClosing : ""}`} onClick={(e) => e.stopPropagation()}>
          <div className={`${styles.highlightBar} ${getHighlightBarActiveClass()}`} style={highlightStyle}></div>
          {[ { to: "/philosophy", label: "Philosophy" }, { to: "/history", label: "History" }, { to: "/writings", label: "Writings" }, { to: "/legal-social", label: "Legal & Social Issues" }, { to: "/tech", label: "Tech" }, { to: "/daily-thoughts", label: "Daily Thoughts" }, { to: "/admin/login", label: "Author(s)", isAdmin: true }, ].map(({ to, label, isAdmin }) => ( <Link key={to} to={to} className={` ${styles.navLink} ${menuClosing && clickedPath === to ? styles.clickedLink : ""} ${currentPath === to && to === "/daily-thoughts" ? styles.dailyThoughtsActive : ""} ${isAdmin ? styles.adminLink : ""} `} onClick={(e) => handleNavLinkClick(e, to)} onMouseMove={(e) => !isMobileView && handleNavLinkMouseMove(e, to)} onMouseLeave={() => !isMobileView && handleNavLinkMouseLeave(to)} style={{ "--hover-progress": hoverProgress[to] || 0 }} > {label} </Link> ))}
        </div>
      </div>
      <div className={`${styles.mobileOverlay} ${menuOpen ? styles.active : ""}`} onClick={toggleMenu}></div>
      {showSecretDialog && ( <div className={styles.secretOverlay} onClick={() => setShowSecretDialog(false)}> <div className={styles.secretBox} onClick={(e) => e.stopPropagation()}> <h3>Upload Admin Key</h3> <input type="file" /> <button onClick={() => setShowSecretDialog(false)}>Close</button> </div> </div> )}
    </>
  );
};

export default Navbar;
