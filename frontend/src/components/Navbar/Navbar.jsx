import React, { useEffect, useState, useRef, useContext } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import styles from "./Navbar.module.css";
import { PageContext } from "../../context/PageContext.jsx";

import jerusalemHomeLight from "../../assets/jerusalemhomelight.png";
import jerusalemHomeDark from "../../assets/jerusalemhomedark.png";
import { PageTransitionContext } from '../pageanim/PageTransitionContext';

const Navbar = () => {
  // State for the new feature
  const { pageTitle } = useContext(PageContext);
  const [isScrolled, setIsScrolled] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

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
  const [isHomePage, setIsHomePage] = useState(false);
  
  const navLinksRef = useRef(null);
  const location = useLocation();
  const currentPath = location.pathname;
  
  // ✅ Enhanced blog post detection for unified routes
  const isBlogPostPage = currentPath.startsWith('/blogs/') || currentPath.startsWith('/blog/');
  
  const brandWrapperRef = useRef(null);
  const tapTimeout = useRef(null);
  const navigate = useNavigate();

  const HOME_BUTTON_LEFT = 30;
  const HOME_BUTTON_WIDTH = 54;
  const NAVBAR_LEFT_INITIAL_LEFT = 105;

  const { startPageTransition } = useContext(PageTransitionContext);

  // Homepage detection for shadow control
  useEffect(() => {
    const checkHomePage = () => {
      const homeElement = document.querySelector('[data-navbar-no-shadow]');
      setIsHomePage(!!homeElement);
    };

    checkHomePage();
    const observer = new MutationObserver(checkHomePage);
    observer.observe(document.body, { childList: true, subtree: true });

    return () => observer.disconnect();
  }, [currentPath]);

  // ✅ RESTORED: Simple and smooth scroll progress tracking (original implementation)
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      // Calculate scroll progress for blog pages
      if (isBlogPostPage) {
        const documentHeight = document.documentElement.scrollHeight - window.innerHeight;
        const progress = documentHeight > 0 ? (currentScrollY / documentHeight) * 100 : 0;
        
        setScrollProgress(Math.min(progress, 100));
        setIsScrolled(currentScrollY > 50);
      } else {
        setScrollProgress(0);
        setIsScrolled(false);
      }
      
      // Navbar hiding logic
      if (window.innerWidth > 768 && !isBlogPostPage) {
        setHide(currentScrollY > lastScrollY && currentScrollY > 50);
      } else {
        setHide(false); 
      }
      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll);
    
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [isBlogPostPage, lastScrollY]);

  const getCenterTitle = () => {
    if (isBlogPostPage && pageTitle) {
      return pageTitle;
    }
    
    // Handle unified blog routes
    if (currentPath.startsWith('/blog/')) {
      const pathParts = currentPath.split('/');
      if (pathParts.length >= 3) {
        const category = pathParts[2];
        switch (category) {
          case 'history': return pageTitle || 'History';
          case 'philosophy': return pageTitle || 'Philosophy';
          case 'tech': return pageTitle || 'Technology';
          case 'lsconcern': return pageTitle || 'Legal & Social';
          case 'writings': return pageTitle || 'Writings';
          default: return pageTitle || 'Blog Post';
        }
      }
    }
    
    // Handle category pages - NEW: Support both old and new routes
    const categoryMappings = {
      '/philosophy': 'Philosophy',
      '/blog/philosophy': 'Philosophy',
      '/history': 'History', 
      '/blog/history': 'History',
      '/writings': 'Writings',
      '/blog/writings': 'Writings',
      '/legal-social': 'Legal & Social Concerns',
      '/blog/lsconcern': 'Legal & Social Concerns',
      '/tech': 'Tech',
      '/blog/tech': 'Tech'
    };
    
    if (categoryMappings[currentPath]) {
      return categoryMappings[currentPath];
    }
    
    switch (currentPath) {
      case "/": return "Terminal Musing";
      case "/daily-thoughts": return "Daily Thoughts";
      case "/admin/login": return "Author(s)";
      default: return pageTitle || "";
    }
  };

  // ✅ Helper function to get the active nav link path
  const getActiveNavPath = () => {
    // For unified blog category pages, map back to the nav link path
    if (currentPath.startsWith('/blog/')) {
      const pathParts = currentPath.split('/');
      if (pathParts.length >= 3) {
        const category = pathParts[2];
        switch (category) {
          case 'philosophy': return '/blog/philosophy';
          case 'history': return '/blog/history';
          case 'tech': return '/blog/tech';
          case 'lsconcern': return '/blog/lsconcern';
          case 'writings': return '/blog/writings';
          default: return currentPath;
        }
      }
    }
    
    // Handle legacy redirects - map old paths to new nav paths
    const legacyMappings = {
      '/philosophy': '/blog/philosophy',
      '/history': '/blog/history', 
      '/tech': '/blog/tech',
      '/legal-social': '/blog/lsconcern',
      '/writings': '/blog/writings'
    };
    
    return legacyMappings[currentPath] || currentPath;
  };
  
  const updateHighlight = (element) => {
    if (element && navLinksRef.current) {
      const parentRect = navLinksRef.current.getBoundingClientRect();
      const linkRect = element.getBoundingClientRect();

      if (window.innerWidth > 768 && parentRect.width > 0 && parentRect.height > 0) {
        setHighlightStyle({
          width: linkRect.width,
          transform: `translateX(${linkRect.left - parentRect.left}px)`,
          opacity: 1,
        });
      } else {
        setHighlightStyle({ width: 0, transform: `translateX(0px)`, opacity: 0 });
      }
    } else {
      setHighlightStyle({ width: 0, transform: `translateX(0px)`, opacity: 0 });
    }
  };

  const handleNavLinkMouseMove = (e, path) => {
    const { left, width } = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - left;
    let progress = x / width;
    progress = Math.min(Math.max(progress, 0), 1);
    setHoverProgress((prev) => ({ ...prev, [path]: progress }));
  };

  const handleNavLinkMouseLeave = (path) => {
    setHoverProgress((prev) => ({ ...prev, [path]: 0 }));
  };

  // Highlight bar effect - ✅ Updated to work with new routes
  useEffect(() => {
    const activeNavPath = getActiveNavPath();
    const activeLink = navLinksRef.current?.querySelector(`[href="${activeNavPath}"]`);
    updateHighlight(activeLink);
  }, [currentPath]);

  // Color detection effect - ✅ Updated for new blog routes
  useEffect(() => {
    const lightBackgroundPaths = [
      "/philosophy", "/history", "/writings", "/legal-social",
      "/tech", "/daily-thoughts", "/blog/"
    ];
    
    const isPathDefaultLight = lightBackgroundPaths.some(path => currentPath.startsWith(path)) ||
                               currentPath.startsWith('/blogs/');
    
    const intersectingSensors = new Set();

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            intersectingSensors.add(entry.target);
          } else {
            intersectingSensors.delete(entry.target);
          }
        });
        const isAnyLightSensorVisible = intersectingSensors.size > 0;
        setIsLightBackground(isAnyLightSensorVisible || isPathDefaultLight);
      },
      { threshold: 0.6 }
    );

    const targets = document.querySelectorAll("[data-navbar-bg-detect]");
    targets.forEach(target => observer.observe(target));

    return () => {
      targets.forEach(target => observer.unobserve(target));
    };
  }, [currentPath]);

  useEffect(() => {
    const observer = new ResizeObserver((entries) =>{
      for (let entry of entries) {   
        const isMobileView = window.innerWidth <= 768;
        const padding = isMobileView ? 16 : 40;
        
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

  // Mobile view effect
  useEffect(() => {
    const handleResize = () => setIsMobileView(window.innerWidth <= 768);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

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

  // ✅ Updated to work with new route structure
  const getHighlightBarActiveClass = () => {
    const activeNavPath = getActiveNavPath();
    switch (activeNavPath) {
      case "/daily-thoughts": return styles.dailyThoughtsActive;
      case "/blog/philosophy": return styles.philosophyActive;
      case "/blog/history": return styles.historyActive;
      case "/blog/writings": return styles.writingsActive;
      case "/blog/lsconcern": return styles.legalSocialActive;
      case "/blog/tech": return styles.techActive; // Add if you have this class
      default: return "";
    }
  };

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

if (isBlogPostPage && isMobileView) {
  return (
    <>
      {/* Blog Mobile Header */}
      <div className={styles.blogMobileHeader}>
        <Link to="/" className={styles.blogMinimalHomeButton} aria-label="Home">
          <img 
            src={isLightBackground ? jerusalemHomeLight : jerusalemHomeDark} 
            alt="Home" 
            style={{ width: "22px", height: "22px", objectFit: "contain" }} 
          />
        </Link>
        <span className={styles.blogMinimalTitle}>
          {pageTitle || getCenterTitle()}
        </span>
        <button 
          className={`${styles.blogMinimalHamburger} ${menuOpen ? styles.hamburgerActive : ""}`}
          aria-label="Toggle menu"
          onClick={toggleMenu}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              toggleMenu();
            }
          }}
        >
          <span className={styles.line}></span>
          <span className={styles.line}></span>
          <span className={styles.line}></span>
        </button>
      </div>

      {/* REUSE THE SAME MOBILE OVERLAY AND MENU FROM HOME PAGE */}
      <div className={`${styles.mobileOverlay} ${menuOpen ? styles.active : ""}`} onClick={toggleMenu}></div>

      <div
        ref={navLinksRef}
        className={`${styles.navLinks} ${menuOpen ? styles.mobileOpen : ""} ${menuClosing ? styles.mobileClosing : ""}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={`${styles.highlightBar} ${getHighlightBarActiveClass()}`} style={highlightStyle}></div>
        {[
          { to: "/blog/philosophy", label: "Philosophy" },
          { to: "/blog/history", label: "History" },
          { to: "/blog/writings", label: "Writings" },
          { to: "/blog/lsconcern", label: "Legal & Social Issues" },
          { to: "/blog/tech", label: "Tech" },
          { to: "/daily-thoughts", label: "Daily Thoughts" },
          { to: "/admin/login", label: "Author(s)", isAdmin: true },
        ].map(({ to, label, isAdmin }) => {
          const isActive = getActiveNavPath() === to;
          return (
            <Link
              key={to}
              to={to}
              className={`
                ${styles.navLink} 
                ${menuClosing && clickedPath === to ? styles.clickedLink : ""}
                ${isActive && to === "/daily-thoughts" ? styles.dailyThoughtsActive : ""}
                ${isAdmin ? styles.adminLink : ""}
              `}
              onClick={(e) => handleNavLinkClick(e, to)}
              onMouseMove={(e) => !isMobileView && handleNavLinkMouseMove(e, to)}
              onMouseLeave={() => !isMobileView && handleNavLinkMouseLeave(to)}
              style={{ "--hover-progress": hoverProgress[to] || 0 }}
            >
              {label}
            </Link>
          );
        })}
      </div>

      {/* Secret Dialog */}
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
}

  
  const handleNavLinkClick = (e, path) => {
    e.preventDefault();
    updateHighlight(e.currentTarget);
    setClickedPath(path);
    
    if (menuOpen) {
      toggleMenu();
    }
  
    // Start animation FIRST, navigate LATER
    startPageTransition(path, () => {
      navigate(path);
    });
  };


  return (
    <>
      <Link to="/" className={`${styles.homeButton} ${hide ? styles.hide : ""} ${isHomePage ? styles.noShadow : ""}`} aria-label="Home">
        <img src={isLightBackground ? jerusalemHomeLight : jerusalemHomeDark} alt="Home" style={{ width: "27px", height: "27px", objectFit: "contain" }} />
      </Link>
      
      <div className={`${styles.bridgeConnector} ${hide ? styles.hide : ""} ${isLightBackground ? styles.darkText : styles.lightText} ${isHomePage ? styles.noShadow : ""}`} style={{ width: `${bridgeWidth}px`, left: `${bridgeLeft}px` }}></div>
      
      <div
        className={`
          ${styles.navbarLeft}
          ${getActiveNavPath() === "/blog/lsconcern" ? styles.legalSocialPage : ""}
          ${isBlogPostPage ? styles.blogPostActive : ''}
          ${isLightBackground ? styles.darkText : styles.lightText}
          ${!isBlogPostPage && hide ? styles.hide : ''}
          ${isBlogPostPage && !isScrolled ? styles.hide : ''}
          ${isHomePage ? styles.noShadow : ""}
        `}
        style={{ 
          width: leftNavbarWidth ? `${leftNavbarWidth}px` : "auto",
          ...(isBlogPostPage && { 
           transform: `translateY(${isMobileView ? '0px' : '0px'})`
          })
        }}
      >
        {/* Progress fill overlay */}
        {isBlogPostPage && (
          <div 
            className={styles.progressFill}
            style={{ 
              width: `${scrollProgress}%`,
              opacity: isScrolled ? 0.3 : 0
            }}
          />
        )}

        <div ref={brandWrapperRef} className={styles.brandWrapper} onClick={handleBrandTap} style={{ cursor: "pointer" }}>
          <Link to={currentPath} className={styles.brand}>
            {getCenterTitle()}
          </Link>
        </div>
      </div>
      
      <div
        className={`
          ${styles.navbarRight}
          ${hide ? styles.hide : ""}
          ${isLightBackground ? styles.darkText : styles.lightText}
          ${menuOpen ? styles.menuOpen : ""}
          ${menuClosing ? styles.menuClosing : ""}
          ${isHomePage ? styles.noShadow : ""}
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
            { to: "/blog/philosophy", label: "Philosophy" },
            { to: "/blog/history", label: "History" },
            { to: "/blog/writings", label: "Writings" },
            { to: "/blog/lsconcern", label: "Legal & Social Issues" },
            { to: "/blog/tech", label: "Tech" },
            { to: "/daily-thoughts", label: "Daily Thoughts" },
            { to: "/admin/login", label: "Author(s)", isAdmin: true },
          ].map(({ to, label, isAdmin }) => {
            const isActive = getActiveNavPath() === to;
            return (
              <Link
                key={to}
                to={to}
                className={`
                  ${styles.navLink} 
                  ${menuClosing && clickedPath === to ? styles.clickedLink : ""}
                  ${isActive && to === "/daily-thoughts" ? styles.dailyThoughtsActive : ""}
                  ${isAdmin ? styles.adminLink : ""}
                `}
                onClick={(e) => handleNavLinkClick(e, to)}
                onMouseMove={(e) => !isMobileView && handleNavLinkMouseMove(e, to)}
                onMouseLeave={() => !isMobileView && handleNavLinkMouseLeave(to)}
                style={{ "--hover-progress": hoverProgress[to] || 0 }}
              >
                {label}
              </Link>
            );
          })}
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
