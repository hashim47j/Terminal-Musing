import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import styles from './Navbar.module.css';
import { useDarkMode } from '../../context/DarkModeContext'; // adjust path

const Navbar = () => {
  const { darkMode, setDarkMode } = useDarkMode(); // ✅ use context only

  const [hide, setHide] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);

  const location = useLocation();
  const currentPath = location.pathname;

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setHide(currentScrollY > lastScrollY && currentScrollY > 50);
      setLastScrollY(currentScrollY);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  const getCenterTitle = () => {
    if (currentPath === '/') return 'Terminal Musing';
    if (currentPath === '/philosophy') return 'Philosophy';
    return '';
  };

  return (
    <nav className={`${styles.navbar} ${hide ? styles.hide : ''} ${darkMode ? styles.dark : ''}`}>
      <div className={styles.leftSpacer}></div>

      <div className={styles.centerTitle}>
        {getCenterTitle() && <Link to={currentPath} className={styles.brand}>{getCenterTitle()}</Link>}
      </div>

      <div className={styles.rightControls}>
        <div onClick={() => setMenuOpen(!menuOpen)} className={styles.hamburger}>☰</div>
        <button onClick={() => setDarkMode(!darkMode)} className={styles.toggleDarkBtn}>
          {darkMode ? '☀️' : '🌙'}
        </button>
      </div>

      <div className={`${styles.navLinks} ${menuOpen ? styles.mobileOpen : ''}`}>
        <Link to="/law" className={styles.navLink}>Law</Link>
        <Link to="/social-issues" className={styles.navLink}>Social Issues</Link>
        <Link to="/poems" className={styles.navLink}>Poems</Link>
        <Link to="/photography" className={styles.navLink}>Photography</Link>
        <Link to="/philosophy" className={styles.navLink}>Philosophy</Link>
        <Link to="/history" className={styles.navLink}>History</Link>
        <Link to="/short-stories" className={styles.navLink}>Short Stories</Link>
        <Link to="/android-linux" className={styles.navLink}>Android & Linux</Link>
        <Link to="/admin" className={`${styles.navLink} ${styles.adminLink}`}>Admin</Link>
      </div>
    </nav>
  );
};

export default Navbar;
