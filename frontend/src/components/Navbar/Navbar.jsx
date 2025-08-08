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
    const { left, width } = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - left;
    let progress = x / width;
    progress = Math.min(Math.max(progress, 0), 1);
    setHoverProgress((prev) => ({ ...prev, [path]: progress }));
  };

  const handleNavLinkMouseLeave = (path) => {
    setHoverProgress((prev) => ({ ...prev, [path]: 0 }));
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
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  // --- Our new, robust color detection logic ---
  useEffect(() => {
    const lightBackgroundPaths = [
      "/philosophy", "/history", "/writings", "/legal-social",
      "/tech", "/daily-thoughts"
    ];
    const isPathDefaultLight = lightBackgroundPaths.some(path => currentPath.startsWith(path));
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

  const getCenterTitle = () => {
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
      case "/daily-thoughts": return styles.dailyThoughtsActive;
      case "/philosophy": return styles.philosophyActive;
      case "/history": return styles.historyActive;
      case "/writings": return styles.writingsActive;
      case "/legal-social": return styles.legalSocialActive;
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

  // --- FIX: Restored the entire JSX block that was accidentally removed ---
  return (
    <>
      <Link to="/" className={`${styles.homeButton} ${hide ? styles.hide : ""}`} aria-label="Home">
        <img
          src={isLightBackground ? jerusalemHomeDark : jerusalemHomeLight}
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
