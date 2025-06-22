import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import styles from './Navbar.module.css';

const Navbar = () => {
  const [hide, setHide] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY > lastScrollY && currentScrollY > 50) {
        setHide(true); // Scrolling down
      } else {
        setHide(false); // Scrolling up
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll);

    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  return (
    <nav className={`${styles.navbar} ${hide ? styles.hide : ''}`}>
      <Link to="/" className={styles.brand}>
        Terminal Musing
      </Link>
      <div className={styles.navLinks}>
        <Link to="/law" className={styles.navLink}>Law</Link>
        <Link to="/social-issues" className={styles.navLink}>Social Issues</Link>
        <Link to="/poems" className={styles.navLink}>Poems</Link>
        <Link to="/photography" className={styles.navLink}>Photography</Link>
        <Link to="/philosophy" className={styles.navLink}>Philosophy</Link>
        <Link to="/history" className={styles.navLink}>History</Link>
        <Link to="/short-stories" className={styles.navLink}>Short Stories</Link>
        <Link to="/android-linux" className={styles.navLink}>Android & Linux</Link>
      </div>
      <div className={styles.hamburger}>☰</div>
    </nav>
  );
};

export default Navbar;
