import React, { useEffect, useState, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import styles from "./Navbar.module.css";

import jerusalemHomeLight from "../../assets/jerusalemhomelight.png";
import jerusalemHomeDark from "../../assets/jerusalemhomedark.png";

const Navbar = () => {
  const [hide, setHide] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);
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
  const navLinksRef = useRef(null);
  const location = useLocation();
  const currentPath = location.pathname;
  const brandWrapperRef = useRef(null);
  const tapTimeout = useRef(null);
  const navigate = useNavigate();

  const [isMobileView, setIsMobileView] = useState(false);

  // Progressive hover magnification state for desktop links
  const [hoverProgress, setHoverProgress] = useState({});

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
    // ... (This function remains unchanged)
  };

  const handleNavLinkMouseLeave = (path) => {
    // ... (This function remains unchanged)
  };

  useEffect(() => {
    const activeLink = navLinksRef.current?.querySelector(`[href="${currentPath}"]`);
    updateHighlight(activeLink);
  }, [currentPath]);

  useEffect(() => {
    const handleScroll = () => {
      // ... (This function remains unchanged)
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  // --- FIX: This is the final, robust color detection logic ---
  useEffect(() => {
    // 1. Define the default theme for specific URL paths.
    const lightBackgroundPaths = [
      "/philosophy", "/history", "/writings", "/legal-social",
      "/tech", "/daily-thoughts"
    ];
    const isPathDefaultLight = lightBackgroundPaths.some(path => currentPath.startsWith(path));

    // 2. We use a ref to track all currently visible "light" sensors.
    const intersectingSensors = new Set();

    // 3. The observer's job is to update our set of visible sensors.
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            intersectingSensors.add(entry.target);
          } else {
            intersectingSensors.delete(entry.target);
          }
        });

        // 4. After checking all changes, set the theme.
        // If any light sensor is visible, the background MUST be light.
        // Otherwise, fall back to our reliable path-based default.
        const isAnyLightSensorVisible = intersectingSensors.size > 0;
        setIsLightBackground(isAnyLightSensorVisible || isPathDefaultLight);
      },
      { threshold: 0.6 } // When 60% of a sensor is visible
    );

    // 5. Find ALL sensors on the page and observe them.
    const targets = document.querySelectorAll("[data-navbar-bg-detect]");
    targets.forEach(target => observer.observe(target));

    // Cleanup: when the component unmounts or path changes, stop observing.
    return () => {
      targets.forEach(target => observer.unobserve(target));
    };
  }, [currentPath]); // Re-run this entire setup whenever the page URL changes.


  useEffect(() => {
    const observer = new ResizeObserver((entries) => {
      // ... (This function remains unchanged)
    });
    if (brandWrapperRef.current) observer.observe(brandWrapperRef.current);
    return () => brandWrapperRef.current && observer.unobserve(brandWrapperRef.current);
  }, [currentPath]);

  useEffect(() => {
    const handleResize = () => setIsMobileView(window.innerWidth <= 768);
    // ... (This function remains unchanged)
  }, []);

  const getCenterTitle = () => { /* ... Unchanged ... */ };
  const handleBrandTap = () => { /* ... Unchanged ... */ };
  const getHighlightBarActiveClass = () => { /* ... Unchanged ... */ };
  const toggleMenu = () => { /* ... Unchanged ... */ };
  const handleNavLinkClick = (e, path) => { /* ... Unchanged ... */ };

  return (
    <>
      <Link to="/" className={`${styles.homeButton} ${hide ? styles.hide : ""}`} aria-label="Home">
        <img
          src={isLightBackground ? jerusalemHomeLight : jerusalemHomeDark}
          alt="Home"
          style={{ width: "27px", height: "27px", objectFit: "contain" }}
        />
      </Link>


      <div
        className={`${styles.bridgeConnector} ${hide ? styles.hide : ""} ${isLightBackground ? styles.darkText : styles.lightText}`}
        style={{
          width: `${bridgeWidth}px`,
          left: `${bridgeLeft}px`,
        }}
      ></div>


      <div
        className={`
          ${styles.navbarLeft}
          ${currentPath === "/legal-social" ? styles.legalSocialPage : ""}
          ${hide ? styles.hide : ""}
          ${isLightBackground ? styles.darkText : styles.lightText}
        `}
        style={{ width: !isMobileView && leftNavbarWidth ? `${leftNavbarWidth}px` : "auto" }}
      >
        <div 
          ref={brandWrapperRef} 
          className={styles.brandWrapper} 
          onClick={handleBrandTap} 
          style={{ cursor: "pointer" }}
        >
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
        `}
      >
        {/* Hamburger icon: animated, morphs into cross on mobile menu open */}
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

