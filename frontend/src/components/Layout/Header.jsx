import React from 'react';
import { Link, NavLink } from 'react-router-dom';
import styles from './Header.module.css';

const Header = () => {
  const isAdmin = false; // Заглушка авторизации

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <Link to="/" className={styles.logo}>
          uni︎guide
        </Link>
        
        <nav className={styles.nav}>
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              isActive ? `${styles.navLink} ${styles.navLinkActive}` : styles.navLink
            }
          >
            Вузы
          </NavLink>
          <NavLink
            to="/calculator"
            className={({ isActive }) =>
              isActive ? `${styles.navLink} ${styles.navLinkActive}` : styles.navLink
            }
          >
            Калькулятор ЕГЭ
          </NavLink>
          <NavLink
            to="/statistics"
            className={({ isActive }) =>
              isActive ? `${styles.navLink} ${styles.navLinkActive}` : styles.navLink
            }
          >
            Статистика
          </NavLink>
          <NavLink
            to="/about"
            className={({ isActive }) =>
              isActive ? `${styles.navLink} ${styles.navLinkActive}` : styles.navLink
            }
          >
            О проекте
          </NavLink>
        </nav>
        
        {isAdmin && (
          <Link to="/admin" className={styles.adminLink}>
            Админ-панель
          </Link>
        )}
      </div>
    </header>
  );
};

export default Header;