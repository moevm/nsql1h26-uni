import React from 'react';
import { Link } from 'react-router-dom';
import styles from './Footer.module.css';

const Footer = () => {
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <Link to="/login" className={styles.adminLoginLink}>
          🔑 вход для администратора
        </Link>
      </div>
    </footer>
  );
};

export default Footer;