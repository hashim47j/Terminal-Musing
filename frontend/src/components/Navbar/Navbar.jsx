import React, { useEffect, useState, useRef, useContext } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import styles from "./Navbar.module.css";
import { PageContext } from "../../context/PageContext.jsx";

import jerusalemHomeLight from "../../assets/jerusalemhomelight.png";
import jerusalemHomeDark from "../../assets/jerusalemhomedark.png";
import { PageTransitionContext } from '../pageanim/PageTransitionContext';


const Navbar = () => {
  const { pageTitle } = useContext(PageContext);
  const [isScrolled, setIsScrolled] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

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
  const [isMobileView, setIsMobileView] = useState(false);
  const [hoverProgress, setHoverProgress] = useState({});
  const [isHomePage, setIsHomePage] = useState(false);

  const [desktopMinimal, setDesktopMinimal] = useState(false);

  const navLinksRef = useRef(null);
  const location = useLocation();
  const currentPath = location.pathname;

  const pathParts = currentPath.split('/').filter(Boolean);
  const isBlogPostPage = pathParts.length >= 3 && pathParts[0] === 'blog';

  const brandWrapperRef = useRef(null);
  const tapTimeout = useRef(null);
  const navigate = useNavigate();

  const lastToggleTime = useRef(0);

  const HOME_BUTTON_LEFT = 30;
  const HOME_BUTTON_WIDTH = 54;
  const NAVBAR_LEFT_INITIAL_LEFT = 105;

  const { startPageTransition } = useContext(PageTransitionContext);
  const [hideNavControls, setHideNavControls] = useState(false);
  const blogMinimalTitleRef = useRef(null);
  const blogMobileHeaderRef = useRef(null);
  const [bgWidth, setBgWidth] = useState(null);
  const [bgLeft, setBgLeft] = useState(null);
  const [bgHeight, setBgHeight] = useState(null);
  const [bgTop, setBgTop] = useState(null);
  const [slideLeft, setSlideLeft] = useState(false);

  const lightBackgroundPaths = [
    "/philosophy", "/history", "/writings", "/legal-social",
    "/tech", "/daily-thoughts", "/blog/"
  ];

  const stripCategorySuffix = (text) => {
    if (!text) return "";
    const catPattern = /\s*[-–—]\s*(Philosophy|History|Technology|Tech|Writings|Legal\s*&\s*Social)\s*$/i;
    return text.replace(catPattern, "").trim();
  };


  // ── isLightBackground ──
  // Watches data-navbar-theme on <body>.
  // HomePage drives it per-section via react-intersection-observer (useInView).
  // All other pages set it explicitly in their own component useEffect.
  // Falls back to path-based guess if no attribute is set.
  useEffect(() => {
    const isPathDefaultLight =
      lightBackgroundPaths.some((p) => currentPath.startsWith(p)) ||
      currentPath.startsWith("/blogs/");

    const update = () => {
      const theme = document.body.getAttribute("data-navbar-theme");
      if (theme === "light") {
        setIsLightBackground(true);
      } else if (theme === "dark") {
        setIsLightBackground(false);
      } else {
        setIsLightBackground(isPathDefaultLight);
      }
    };

    update();

    const observer = new MutationObserver(update);
    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ["data-navbar-theme"],
    });

    return () => observer.disconnect();
  }, [currentPath]);


  useEffect(() => {
    if (hideNavControls && isMobileView && blogMinimalTitleRef.current && blogMobileHeaderRef.current) {
      const headingRect = blogMinimalTitleRef.current.getBoundingClientRect();
      const shrinkPx = 8;
      setBgWidth(headingRect.width - shrinkPx);
      setBgHeight(headingRect.height);
      setBgTop(headingRect.top);
      setSlideLeft(true);
    } else {
      setBgWidth(null);
      setBgHeight(null);
      setBgTop(null);
      setSlideLeft(false);
    }
  }, [hideNavControls, isMobileView]);

  useEffect(() => {
    function handleResize() {
      if (hideNavControls && isMobileView && blogMinimalTitleRef.current && blogMobileHeaderRef.current) {
        const headingRect = blogMinimalTitleRef.current.getBoundingClientRect();
        const shrinkPx = 8;
        setBgWidth(headingRect.width - shrinkPx);
        setBgHeight(headingRect.height);
        setBgTop(headingRect.top);
        setSlideLeft(true);
      } else {
        setBgWidth(null);
        setBgHeight(null);
        setBgLeft(null);
        setBgTop(null);
        setSlideLeft(false);
      }
    }
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [hideNavControls, isMobileView]);

  useEffect(() => {
    let lastScrollY = window.scrollY;
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > 100 && currentScrollY > lastScrollY) {
        setHideNavControls(true);
      } else {
        setHideNavControls(false);
      }
      lastScrollY = currentScrollY;
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isMobileView]);

  useEffect(() => {
    let lastScrollY = window.scrollY;
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > 100 && currentScrollY > lastScrollY) {
        setHideNavControls(true);
      } else {
        setHideNavControls(false);
      }
      lastScrollY = currentScrollY;
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isBlogPostPage]);

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

  useEffect(() => {
    let lastY = window.scrollY;
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (isBlogPostPage) {
        const documentHeight = document.documentElement.scrollHeight - window.innerHeight;
        const progress = documentHeight > 0 ? (currentScrollY / documentHeight) * 100 : 0;
        setScrollProgress(Math.min(progress, 100));
        setIsScrolled(currentScrollY > 50);

        if (!isMobileView) {
          if (currentScrollY > 120 && currentScrollY > lastY) {
            setDesktopMinimal(true);
          } else if (currentScrollY < lastY) {
            setDesktopMinimal(false);
          }
        }
      } else {
        setScrollProgress(0);
        setIsScrolled(false);
        setDesktopMinimal(false);
      }

      if (window.innerWidth > 768 && !isBlogPostPage) {
        setHide(currentScrollY > lastScrollY && currentScrollY > 50);
      } else {
        setHide(false);
      }

      lastY = currentScrollY;
      setLastScrollY(currentScrollY);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isBlogPostPage, lastScrollY, isMobileView]);

  useEffect(() => {
    if (!isBlogPostPage) setDesktopMinimal(false);
  }, [isBlogPostPage]);

  const getCenterTitle = () => {
    // On a blog POST page, only show the article title — never the category name
    if (isBlogPostPage) return pageTitle || '';
  
    if (currentPath.startsWith('/blog/')) {
      const pathParts = currentPath.split('/');
      if (pathParts.length >= 3) {
        const category = pathParts[2];
        switch (category) {
          case 'history': return 'History';
          case 'philosophy': return 'Philosophy';
          case 'tech': return 'Technology';
          case 'lsconcern': return 'Legal & Social';
          case 'writings': return 'Writings';
          default: return pageTitle || '';
        }
      }
    }
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
    if (categoryMappings[currentPath]) return categoryMappings[currentPath];
    switch (currentPath) {
      case "/": return "Terminal Musing";
      case "/daily-thoughts": return "Daily Thoughts";
      case "/admin/login": return "Author(s)";
      default: return pageTitle || "";
    }
  };

  const getActiveNavPath = () => {
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

  useEffect(() => {
    const activeNavPath = getActiveNavPath();
    const activeLink = navLinksRef.current?.querySelector(`[href="${activeNavPath}"]`);
    updateHighlight(activeLink);
  }, [currentPath]);

  useEffect(() => {
    const observer = new ResizeObserver((entries) => {
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

  useEffect(() => {
    const handleResize = () => {
      const newIsMobileView = window.innerWidth <= 768;
      setIsMobileView(newIsMobileView);
      if (!newIsMobileView) setDesktopMinimal(false);
    };
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

  const getHighlightBarActiveClass = () => {
    const activeNavPath = getActiveNavPath();
    switch (activeNavPath) {
      case "/daily-thoughts": return styles.dailyThoughtsActive;
      case "/blog/philosophy": return styles.philosophyActive;
      case "/blog/history": return styles.historyActive;
      case "/blog/writings": return styles.writingsActive;
      case "/blog/lsconcern": return styles.legalSocialActive;
      case "/blog/tech": return styles.techActive;
      default: return "";
    }
  };

  const toggleMenu = () => {
    const now = Date.now();
    if (now - lastToggleTime.current < 300) return;
    lastToggleTime.current = now;

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
    if (menuOpen) toggleMenu();
    startPageTransition(path, () => navigate(path));
  };

  const navbarLeftClass = `
    ${styles.navbarLeft}
    ${getActiveNavPath() === "/blog/lsconcern" ? styles.legalSocialPage : ""}
    ${isBlogPostPage ? styles.blogPostActive : ''}
    ${isLightBackground ? styles.darkText : styles.lightText}
    ${!isBlogPostPage && hide ? styles.hide : ''}
    ${isBlogPostPage && !isScrolled && isMobileView ? styles.hide : ''}
    ${isHomePage ? styles.noShadow : ""}
    ${currentPath === "/" ? styles.homePagePosition : ""}
  `;

  const bridgeClass = `
    ${styles.bridgeConnector}
    ${hide ? styles.hide : ""}
    ${isLightBackground ? styles.darkText : styles.lightText}
    ${isHomePage ? styles.noShadow : ""}
    ${currentPath === "/" ? styles.hideOnHome : ""}
  `;

  const navLinks = [
    { to: "/blog/philosophy", label: "Philosophy" },
    { to: "/blog/history", label: "History" },
    { to: "/blog/writings", label: "Writings" },
    { to: "/blog/lsconcern", label: "Legal & Social Issues" },
    { to: "/blog/tech", label: "Tech" },
    { to: "/daily-thoughts", label: "Daily Thoughts" },
    { to: "/admin/login", label: "Author(s)", isAdmin: true },
  ];


  // ── Mobile Blog Post Layout ──
  if (isBlogPostPage && isMobileView) {
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
            transition: "width 0.4s, left 0.4s, height 0.4s, top 0.4s, border-radius 0.4s",
            position: "fixed"
          }}
          data-navbar-no
        >
          {currentPath !== "/" && (
            <Link
              to="/"
              className={`${styles.blogMinimalHomeButton} ${hideNavControls ? styles.hideNavButton : ""}`}
              aria-label="Home"
            >
              <img
                src={isLightBackground ? jerusalemHomeLight : jerusalemHomeDark}
                alt="Home"
                style={{ width: "22px", height: "22px", objectFit: "contain" }}
              />
            </Link>
          )}

          <span
            ref={blogMinimalTitleRef}
            className={[
              styles.blogMinimalTitle,
              slideLeft ? styles.slideLeft : ''
            ].join(' ')}
          >
            {stripCategorySuffix(pageTitle || getCenterTitle())}
            <div className={styles.progressFillMobile} style={{ width: `${scrollProgress}%` }} />
          </span>

          <button
            className={`${styles.blogMinimalHamburger} ${menuOpen ? styles.hamburgerActive : ""} ${hideNavControls ? styles.hideNavButton : ""}`}
            aria-label="Toggle menu"
            onClick={toggleMenu}
            onTouchEnd={(e) => {
              e.preventDefault();
              e.stopPropagation();
              toggleMenu();
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') toggleMenu();
            }}
          >
            <span className={styles.line}></span>
            <span className={styles.line}></span>
            <span className={styles.line}></span>
          </button>
        </div>

        <div
          className={`${styles.mobileOverlay} ${menuOpen ? styles.active : ""}`}
          onClick={toggleMenu}
          onTouchEnd={(e) => { e.preventDefault(); toggleMenu(); }}
        />

        <div
          ref={navLinksRef}
          className={`${styles.navLinks} ${menuOpen ? styles.mobileOpen : ""} ${menuClosing ? styles.mobileClosing : ""}`}
          onClick={(e) => e.stopPropagation()}
        >
          <div className={`${styles.highlightBar} ${getHighlightBarActiveClass()}`} style={highlightStyle}></div>
          {navLinks.map(({ to, label, isAdmin }) => {
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


  // ── Desktop Layout ──
  return (
    <>
      {currentPath !== "/" && (
        <Link
          to="/"
          className={`
            ${styles.homeButton}
            ${hide ? styles.hide : ""}
            ${isHomePage ? styles.noShadow : ""}
            ${isBlogPostPage && desktopMinimal ? styles.desktopMinimalHideButton : ""}
          `}
          aria-label="Home"
        >
          <img
            src={isLightBackground ? jerusalemHomeLight : jerusalemHomeDark}
            alt="Home"
            style={{ width: "27px", height: "27px", objectFit: "contain" }}
          />
        </Link>
      )}

      <div
        className={`
          ${bridgeClass}
          ${isBlogPostPage && desktopMinimal ? styles.desktopMinimalHideButton : ""}
        `}
        style={{ width: `${bridgeWidth}px`, left: `${bridgeLeft}px` }}
      ></div>

      <div
        className={`
          ${navbarLeftClass}
          ${isBlogPostPage && desktopMinimal ? styles.desktopMinimalLeft : ""}
        `}
        style={
          isBlogPostPage && desktopMinimal
            ? { width: "100%", left: 0, borderRadius: "0 0 16px 16px", top: 0 }
            : {
                width: leftNavbarWidth ? `${leftNavbarWidth}px` : "auto",
                maxWidth: `calc(100vw - 105px - 20px)`
              }
        }
      >
        {isBlogPostPage && (
          <div
            className={styles.progressFill}
            style={{ width: `${scrollProgress}%`, opacity: isScrolled ? 0.3 : 0 }}
          />
        )}

        <div
          ref={brandWrapperRef}
          className={`${styles.brandWrapper} ${isBlogPostPage && desktopMinimal ? styles.desktopMinimalBrand : ""}`}
          onClick={handleBrandTap}
          style={{ cursor: "pointer" }}
        >
          <Link to={currentPath} className={styles.brand}>
            {getCenterTitle() === "Terminal Musing" && currentPath === "/" ? (
              <>
                <span style={{ fontFamily: 'Abhaya Libre, serif', fontSize: isMobileView ? '30px' : '50px' }}>Terminal</span>
                <span style={{ fontFamily: 'Luxurious Script, cursive', marginLeft: '-10px', position: 'relative', top: '5px', fontSize: isMobileView ? '28px' : '46px' }}> Musing</span>
              </>
            ) : getCenterTitle() === "Terminal Musing" ? (
              <>
                <span style={{ fontFamily: 'Abhaya Libre, serif' }}>Terminal</span>
                <span style={{ fontFamily: 'Luxurious Script, cursive', marginLeft: '-10px', position: 'relative', top: '5px' }}> Musing</span>
              </>
            ) : (
              isBlogPostPage
              ? stripCategorySuffix(getCenterTitle())
              : getCenterTitle()
            )}
          </Link>
        </div>

        {isBlogPostPage && (
          <Link
            to="/"
            className={`
              ${styles.desktopInlineHomeBtn}
              ${desktopMinimal ? styles.desktopInlineHomeBtnVisible : ""}
            `}
            aria-label="Home"
          >
            <img
              src={isLightBackground ? jerusalemHomeLight : jerusalemHomeDark}
              alt="Home"
              style={{ width: "22px", height: "22px", objectFit: "contain" }}
            />
          </Link>
        )}
      </div>

      <div
        className={`
          ${styles.navbarRight}
          ${hide ? styles.hide : ""}
          ${isLightBackground ? styles.darkText : styles.lightText}
          ${menuOpen ? styles.menuOpen : ""}
          ${menuClosing ? styles.menuClosing : ""}
          ${isHomePage ? styles.noShadow : ""}
          ${isBlogPostPage && desktopMinimal ? styles.desktopMinimalHideButton : ""}
        `}
      >
        <div
          onClick={toggleMenu}
          onTouchEnd={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleMenu();
          }}
          className={`${styles.hamburger} ${menuOpen ? styles.hamburgerActive : ""}`}
          aria-label="Toggle menu"
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') toggleMenu();
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
          {navLinks.map(({ to, label, isAdmin }) => {
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

      <div
        className={`${styles.mobileOverlay} ${menuOpen ? styles.active : ""}`}
        onClick={toggleMenu}
        onTouchEnd={(e) => { e.preventDefault(); toggleMenu(); }}
      />

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