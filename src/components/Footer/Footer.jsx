// Terminal-Musing/src/components/Footer/Footer.jsx
import React from 'react';
import styles from './Footer.module.css';

const Footer = () => {
  return (
    <footer className={styles.footer}>
      <p>&copy; {new Date().getFullYear()} Terminal Musing. All rights reserved.</p>
      <div className={styles.socialLinks}>
        {/* Placeholder for your social media icons (e.g., LinkedIn, GitHub) */}
        {/* <a href="#" target="_blank" rel="noopener noreferrer">Icon</a> */}
      </div>
    </footer>
  );
};

export default Footer;