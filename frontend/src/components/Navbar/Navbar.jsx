import React, { useEffect, useState, useRef, useContext } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import styles from "./Navbar.module.css";
import { PageContext } from "../../context/PageContext.jsx";

import jerusalemHomeLight from "../../assets/jerusalemhomelight.png";
import jerusalemHomeDark from "../../assets/jerusalemhomedark.png";

import { PageTransitionContext } from '../pageanim/PageTransitionContext';

const Navbar = () => {
  // Contexts
  const { pageTitle } = useContext(PageContext);
  const { startPageTransition } = useContext(PageTransitionContext);

  // Router
  const location = useLocation();
  const navigate = useNavigate();
  const currentPath = location.pathname;

  // State - UI
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isScrolled, setIsScrolled] = useState(false);
  const [hide, setHide] = useState(false); // For desktop navbar hiding
  const [hideNavControls, setHideNavControls] = useState(false); // For mobile controls
  const [highlightStyle, setHighlightStyle] = useState({});
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuClosing, setMenuClosing] = useState(false);
  const [clickedPath, setClickedPath] = useState(null);
  const [tapCount, setTapCount] = useState(0);
  const [showSecretDialog, setShowSecretDialog] = useState(false);
  const [isHomePage, setIsHomePage] = useState(false);
  const [isScrolledEnough, setIsScrolledEnough] = useState(false);
  const [isLightBackground, setIsLightBackground] = useState(false);
  const [isMobileView, setIsMobileView] = useState(false);
  const [hoverProgress, setHoverProgress] = useState({});

  // State - Navbar resize/positioning for shrinking background
  const [bgWidth, setBgWidth] = useState(null);
  const [bgLeft, setBgLeft] = useState(null);
  const [bgHeight, setBgHeight] = useState(null);
  const [bgTop, setBgTop] = useState(null);
  const [slideLeft, setSlideLeft] = useState(false);
  if (hideNavControls && isMobileView && blogMinimalTitleRef.current && blogMobileHeaderRef.current) {
    const headingRect = blogMinimalTitleRef.current.getBoundingClientRect();
    
    const headingCenter = headingRect.left + (headingRect.width / 2);
    const newNavbarLeft = headingCenter - (headingRect.width / 2);
    
    setBgWidth(headingRect.width);
    setBgHeight(headingRect.height);
    setBgLeft(newNavbarLeft);
    setBgTop(headingRect.top);
    setSlideLeft(true); // ✅ Add slide left state
  } else {
    setBgWidth(null);
    setBgLeft(null);
    setBgHeight(null);
    setBgTop(null);
    setSlideLeft(false); // ✅ Reset slide left
  }
  



  // Refs
  const navLinksRef = useRef(null);
  const brandWrapperRef = useRef(null);
  const blogMobileHeaderRef = useRef(null);
  const blogMinimalTitleRef = useRef(null);
  const tapTimeout = useRef(null);

  // Constants
  const HOME_BUTTON_LEFT = 30;
  const HOME_BUTTON_WIDTH = 54;
  const NAVBAR_LEFT_INITIAL = 105;

  // Detect if on blog post (3+ segment paths starting with "blog")
  const pathSegments = currentPath.split("/").filter(Boolean);
  const isBlogPost = pathSegments.length >= 3 && pathSegments[0] === "blog";

  // Responsive detection of view
  useEffect(() => {
    function handleResize() {
      setIsMobileView(window.innerWidth <= 768);
    }
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Scroll handler for progress, navbar hiding, and control hiding
  useEffect(() => {
    let lastScrollY = window.pageYOffset;

    function onScroll() {
      const currentY = window.pageYOffset;

      if (isBlogPost) {
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const progress = docHeight > 0 ? (currentY / docHeight) * 100 : 0;
        setScrollProgress(Math.min(progress, 100));
        // Handle showing/hiding navbar on scroll for blog post
        setIsScrolledEnough(currentY > 50);
      } else {
        setScrollProgress(0);
        setIsScrolledEnough(false);
      }

      // Desktop: Hide navbar if scrolling down past 50px (non-blog)
      if (!isMobileView && !isBlogPost) {
        setHide(currentY > lastScrollY && currentY > 50);
      } else {
        setHide(false);
      }

      // Mobile: set hideNavControls depending on scroll direction
      if (isMobileView) {
        if (currentY > 100 && currentY > lastScrollY) {
          setHideNavControls(true);
        } else {
          setHideNavControls(false);
        }
      } else {
        setHideNavControls(false);
      }

      lastScrollY = currentY;
    }

    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, [isBlogPost, isMobileView]);

  // Update measurements for shrinking bg when hideNavControls changes OR window resizes
  // throttled ResizeObserver can be added for better perf if needed
  useEffect(() => {
    if (hideNavControls && isMobileView && blogMinimalTitleRef.current && blogMobileHeaderRef.current) {
      const headingRect = blogMinimalTitleRef.current.getBoundingClientRect();
      
      // Calculate exact center position
      const headingCenter = headingRect.left + (headingRect.width / 2);
      const newNavbarLeft = headingCenter - (headingRect.width / 2);
      
      setBgWidth(headingRect.width);
      setBgHeight(headingRect.height); // Add height matching
      setBgLeft(newNavbarLeft); // This centers the navbar background on the heading
      setBgTop(headingRect.top); // Add top position matching
    } else {
      setBgWidth(null);
      setBgLeft(null);
      setBgHeight(null); // Reset height
      setBgTop(null); // Reset top
    }
    }, [hideNavControls, isMobileView]);
    
    // Recalculate on window resize to handle orientation/font changes
    useEffect(() => {
      function handleResize() {
        if (hideNavControls && isMobileView && blogMinimalTitleRef.current && blogMobileHeaderRef.current) {
          const headingRect = blogMinimalTitleRef.current.getBoundingClientRect();
          
          // Calculate exact center position
          const headingCenter = headingRect.left + (headingRect.width / 2);
          const newNavbarLeft = headingCenter - (headingRect.width / 2);
          
          setBgWidth(headingRect.width);
          setBgHeight(headingRect.height); // Add height matching
          setBgLeft(newNavbarLeft);
          setBgTop(headingRect.top); // Add top position matching
        }
      }
      window.addEventListener("resize", handleResize);
      return () => window.removeEventListener("resize", handleResize);
    }, [hideNavControls, isMobileView]);
    

  // Homepage detection for shadow control
  useEffect(() => {
    const checkHome = () => {
      setIsHomePage(Boolean(document.querySelector("[data-navbar-no]")));
    };
    checkHome();

    const observer = new MutationObserver(checkHome);
    observer.observe(document.body, { subtree: true, childList: true });
    return () => observer.disconnect();
  }, [currentPath]);

  // Track navbar width for bridge connector and left navbar (desktop)
  useEffect(() => {
    if (!brandWrapperRef.current) return;

    function updateSizes() {
      const isMobile = window.innerWidth <= 768;
      const padding = isMobile ? 16 : 40;
      const wrapperWidth = brandWrapperRef.current.offsetWidth || 0;
      setBgWidth(null); // Clear shrinking bg when width changes to reset
      setBgLeft(null);
      // This controls the left navbar width as well
      setBgWidth(null);
    }

    updateSizes();
    window.addEventListener("resize", updateSizes);
    return () => window.removeEventListener("resize", updateSizes);
  }, [currentPath]);

  // Determine page title to show (center, nav)
  function getCenterText() {
    if (isBlogPost) {
      if (pageTitle) return pageTitle;
      if (currentPath.startsWith("/blog/")) {
        const cat = pathSegments[1];
        switch (cat) {
          case "philosophy": return "Philosophy";
          case "history": return "History";
          case "tech": return "Technology";
          case "lsconcern": return "Legal & Social";
          case "writings": return "Writings";
          default: return "Blog";
        }
      }
    }

    const map = {
      "/": "Terminal Musing",
      "/daily-thoughts": "Daily Thoughts",
      "/admin": "Admin",
      "/admin/login": "Author(s)",
    };
    return map[currentPath] || "";
  }

  // Active nav path for highlight
  function getActivePath() {
    if (currentPath.startsWith("/blog/")) {
      const cat = pathSegments[1];
      const mapping = {
        philosophy: "/blog/philosophy",
        history: "/blog/history",
        tech: "/blog/tech",
        lsconcern: "/blog/lsconcern",
        writings: "/blog/writings",
      };
      return mapping[cat] || currentPath;
    }
    return currentPath;
  }

  // Highlight bar update
  useEffect(() => {
    if (!navLinksRef.current) return;
    const active = navLinksRef.current.querySelector(`a[href="${getActivePath()}"]`);
    if (!active) {
      setHighlightStyle({ width: 0, transform: "translateX(0)", opacity: 0 });
      return;
    }
    const parentRect = navLinksRef.current.getBoundingClientRect();
    const rect = active.getBoundingClientRect();
    setHighlightStyle({
      width: rect.width,
      transform: `translateX(${rect.left - parentRect.left}px)`,
      opacity: 1,
    });
  }, [location, menuOpen]);

  // Hover progress (for hover gradient effect)
  function handleHover(e, path) {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    setHoverProgress((v) => ({ ...v, [path]: x / rect.width }));
  }
  function clearHover(path) {
    setHoverProgress((v) => ({ ...v, [path]: 0 }));
  }

  // Tap multiple times on brand to open secret dialog (example)
  function handleTap() {
    if (tapTimeout.current) clearTimeout(tapTimeout.current);
    setTapCount((c) => {
      if (c + 1 === 3) {
        setShowSecretDialog(true);
        return 0;
      }
      tapTimeout.current = setTimeout(() => setTapCount(0), 1500);
      return c + 1;
    });
  }

  // Nav link click handler
  function onNavClick(e, to) {
    e.preventDefault();

    setClickedPath(to);
    if (menuOpen) {
      setMenuClosing(true);
      setTimeout(() => {
        setMenuOpen(false);
        setMenuClosing(false);
        setClickedPath(null);
        navigate(to);
      }, 400);
    } else {
      navigate(to);
    }
    startPageTransition(to);
  }

  // Mobile navbar JSX
  if (isBlogPost && isMobileView) {
    return (
      <>
<div
  ref={blogMobileHeaderRef}
  className={`${styles.blogMobileHeader} ${bgWidth ? styles.shrunk : ''}`}
  style={{
    width: bgWidth ? `${bgWidth}px` : "100%",
    height: bgHeight ? `${bgHeight}px` : "54px",
    left: bgLeft ? `${bgLeft}px` : "0",
    top: bgTop ? `${bgTop}px` : "0",
    transform: slideLeft ? 'translateX(-20%)' : 'translateX(0)', // ✅ Slide navbar bg too
    transition: "width 0.4s, left 0.4s, height 0.4s, top 0.4s, border-radius 0.4s, transform 0.4s",
    position: "fixed"
  }}

          data-navbar-no
        >
          <Link
            to="/"
            className={`${styles["blogMinimalHomeButton"]} ${
              hideNavControls ? styles.hideNavButton : ""
            }`}
            aria-label="Home"
          >
            <img
              src={isLightBackground ? jerusalemHomeLight : jerusalemHomeDark}
              alt="Home"
              style={{ width: 22, height: 22, objectFit: "contain" }}
            />
          </Link>

          <span
            ref={blogMinimalTitleRef}
            className={`${styles.blogMinimalTitle} ${slideLeft ? styles.slideLeft : ''}`}
          >
            {pageTitle || getCenterText()}

            <div
              className={styles.progressFillMobile}  
              style={{ width: scrollProgress + "%" }}
            />
          </span>

          <button
            className={`${styles.blogMinimalHamburger} ${
              menuOpen ? styles.hamburgerActive : ""
            } ${hideNavControls ? styles.hideNavButton : ""}`}
            aria-label="Toggle menu"
            onClick={() => setMenuOpen(!menuOpen)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                setMenuOpen(!menuOpen);
              }
            }}
          >
            <span className={styles.line} />
            <span className={styles.line} />
            <span className={styles.line} />
          </button>
        </div>

        <div
          className={`${styles.mobileOverlay} ${
            menuOpen ? styles.active : ""
          }`}
          onClick={() => setMenuOpen(false)}
        />

        <nav
          ref={navLinksRef}
          className={`${styles.navLinks} ${
            menuOpen ? styles.mobileOpen : ""
          } ${menuClosing ? styles.mobileClosing : ""}`}
          onClick={(e) => e.stopPropagation()}
        >
          <div
            className={`${styles.highlightBar} ${styles[getActivePath() + "Active"]}`}
            style={highlightStyle}
          />
          {[
            { to: "/blog/philosophy", label: "Philosophy" },
            { to: "/blog/history", label: "History" },
            { to: "/blog/writings", label: "Writings" },
            { to: "/blog/lsconcern", label: "Legal & Social" },
            { to: "/blog/tech", label: "Tech" },
            { to: "/daily-thoughts", label: "Daily Thoughts" },
            { to: "/admin/login", label: "Author(s)", admin: true },
          ].map(({ to, label, admin }) => (
            <Link
              key={to}
              to={to}
              className={`${styles.navLink} ${admin ? styles.adminLink : ""} ${
                getActivePath() === to ? styles[getActivePath() + "Active"] : ""
              }`}
              onClick={(e) => onNavClick(e, to)}
              onMouseMove={(e) => !isMobileView && handleHover(e, to)}
              onMouseLeave={() => !isMobileView && clearHover(to)}
              style={{ "--hover-progress": hoverProgress[to] || 0 }}
            >
              {label}
            </Link>
          ))}
        </nav>

        {showSecretDialog && (
          <div
            className={styles.secretOverlay}
            onClick={() => setShowSecretDialog(false)}
          >
            <div onClick={(e) => e.stopPropagation()} className={styles.secretBox}>
              <h3>Upload Admin Key</h3>
              <input type="file" />
              <button onClick={() => setShowSecretDialog(false)}>Close</button>
            </div>
          </div>
        )}
      </>
    );
  }

  // Desktop/mobile legacy navbar JSX (unchanged)
  return (
    <>
      <Link
        to="/"
        className={`${styles.homeButton} ${hide ? styles.hide : ""} ${
          isHomePage ? styles.noShadow : ""
        }`}
        aria-label="Home"
      >
        <img
          src={isLightBackground ? jerusalemHomeLight : jerusalemHomeDark}
          alt="Home"
          style={{ width: 27, height: 27, objectFit: "contain" }}
        />
      </Link>

      <div
        className={`${styles.bridgeConnector} ${
          hide ? styles.hide : ""
        } ${isLightBackground ? styles.darkText : styles.lightText} ${
          isHomePage ? styles.noShadow : ""
        }`}
        style={{
          width: `${bgWidth ? bgWidth + 48 : 0}px`, // Example bridge width based on title width plus padding
          left: `${bgLeft ? bgLeft - 16 : 0}px`, // Example left offset to align with navbar and padding
        }}
      />

      <div
        className={`${styles.navbarLeft} ${
          isBlogPost ? styles.blogActive : ""
        } ${isLightBackground ? styles.darkText : styles.lightText} ${
          !isBlogPost && hide ? styles.hide : ""
        }`}
      >
        {isBlogPost && (
          <div
            className={styles.progressFill}
            style={{
              width: scrollProgress + "%",
              opacity: isScrolledEnough ? 0.3 : 0,
            }}
          />
        )}
        <div onClick={handleTap} className={styles.brandWrapper}>
          <Link to={currentPath} className={styles.brand}>
            {getCenterText()}
          </Link>
        </div>
      </div>

      <div
        className={`${styles.navbarRight} ${
          hide ? styles.hide : ""
        } ${isLightBackground ? styles.darkText : styles.lightText}`}
      >
        <div
          className={`${styles.hamburger} ${menuOpen ? styles.hamburgerActive : ""}`}
          onClick={() => setMenuOpen(!menuOpen)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              setMenuOpen(!menuOpen);
            }
          }}
          role="button"
          tabIndex={0}
          aria-label="Toggle menu"
        >
          <span className={styles.line} />
          <span className={styles.line} />
          <span className={styles.line} />
        </div>
      </div>

      <div
        ref={navLinksRef}
        className={`${styles.navLinks} ${
          menuOpen ? styles.mobileOpen : ""
        } ${menuClosing ? styles.mobileClosing : ""}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className={`${styles.highlightBar} ${styles[getActivePath() + "Active"]}`}
          style={highlightStyle}
        />
        {[
          { to: "/blog/philosophy", label: "Philosophy" },
          { to: "/blog/history", label: "History" },
          { to: "/blog/writings", label: "Writings" },
          { to: "/blog/lsconcern", label: "Legal & Social" },
          { to: "/blog/tech", label: "Tech" },
          { to: "/daily-thoughts", label: "Daily Thoughts" },
          { to: "/admin/login", label: "Author(s)", admin: true },
        ].map(({ to, label, admin }) => (
          <Link
            key={to}
            to={to}
            className={`${styles.navLink} ${admin ? styles.adminLink : ""} ${
              getActivePath() === to ? styles[getActivePath() + "Active"] : ""
            }`}
            onClick={(e) => onNavClick(e, to)}
            onMouseMove={(e) => !isMobileView && handleHover(e, to)}
            onMouseLeave={() => !isMobileView && clearHover(to)}
            style={{ "--hover-progress": hoverProgress[to] || 0 }}
          >
            {label}
          </Link>
        ))}
      </div>

      <div
        className={`${styles.mobileOverlay} ${
          menuOpen ? styles.active : ""
        }`}
        onClick={() => setMenuOpen(false)}
      />

      {showSecretDialog && (
        <div
          className={styles.secretOverlay}
          onClick={() => setShowSecretDialog(false)}
        >
          <div onClick={(e) => e.stopPropagation()} className={styles.secretBox}>
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
