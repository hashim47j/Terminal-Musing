// Terminal-Musing/src/components/Navbar/Navbar.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import styles from './Navbar.module.css';

const Navbar = () => {
  return (
    <nav className={styles.navbar}>
      <Link to="/" className={styles.brand}>
        Terminal Musing
      </Link>
      <div className={styles.navLinks}>
        {/* Your topic links go here. Make sure these match your future routes. */}
        <Link to="/law" className={styles.navLink}>Law</Link>
        <Link to="/social-issues" className={styles.navLink}>Social Issues</Link>
        <Link to="/poems" className={styles.navLink}>Poems</Link>
        <Link to="/photography" className={styles.navLink}>Photography</Link>
        <Link to="/philosophy" className={styles.navLink}>Philosophy</Link>
        <Link to="/history" className={styles.navLink}>History</Link>
        <Link to="/short-stories" className={styles.navLink}>Short Stories</Link>
        <Link to="/android-linux" className={styles.navLink}>Android & Linux</Link>
      </div>
      {/* This is a placeholder for a responsive hamburger menu icon */}
      <div className={styles.hamburger}>☰</div>
    </nav>
  );
};

export default Navbar;