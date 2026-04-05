import React from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { clearAdminSession, getAdminSession, isAdminAuthenticated } from '../../services/auth';
import styles from './Header.module.css';

const Header = () => {
  const navigate = useNavigate();
  const adminSession = getAdminSession();
  const isAdmin = isAdminAuthenticated();

  const handleLogout = () => {
    clearAdminSession();
    navigate('/', { replace: true });
  };

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
          <div className={styles.adminActions}>
            <span className={styles.adminName}>{adminSession?.username || 'Администратор'}</span>
            <Link to="/admin" className={styles.adminLink}>
              Админ-панель
            </Link>
            <button type="button" className={styles.logoutButton} onClick={handleLogout}>
              Выйти
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;