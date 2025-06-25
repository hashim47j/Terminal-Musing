import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import styles from './Navbar.module.css';

const Navbar = () => {
  const [hide, setHide] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [darkMode, setDarkMode] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false); // ⬅️ NEW

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > lastScrollY && currentScrollY > 50) {
        setHide(true);
      } else {
        setHide(false);
      }
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  const toggleDarkMode = () => {
    setDarkMode((prev) => !prev);
  };

  const toggleMenu = () => {
    setMenuOpen(prev => !prev); // ⬅️ NEW
  };

  return (
    <nav className={`${styles.navbar} ${hide ? styles.hide : ''} ${darkMode ? styles.dark : ''}`}>
      <Link to="/" className={styles.brand}>Terminal Musing</Link>

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

      <div className={styles.controls}>
        <div onClick={toggleMenu} className={styles.hamburger}>☰</div>
        <button onClick={toggleDarkMode} className={styles.toggleDarkBtn}>
          {darkMode ? '☀️' : '🌙'}
        </button>
      </div>
    </nav>
  );
};

export default Navbar;