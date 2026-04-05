import React from 'react';
import { Link } from 'react-router-dom';
import { isAdminAuthenticated } from '../../services/auth';
import styles from './Footer.module.css';

const Footer = () => {
  const isAdmin = isAdminAuthenticated();

  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <Link to={isAdmin ? '/admin' : '/login'} className={styles.adminLoginLink}>
          {isAdmin ? '👤 админ-панель' : '🔑 вход для администратора'}
        </Link>
      </div>
    </footer>
  );
};

export default Footer;