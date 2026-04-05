import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { loginAdmin } from '../services/api';
import { saveAdminSession } from '../services/auth';
import styles from './LoginPage.module.css';

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const canSubmit = username.trim() !== '' && password.trim() !== '';
  const fromPath = location.state?.from?.pathname || '/admin';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!canSubmit) {
      setError('Заполните логин и пароль');
      return;
    }

    setLoading(true);

    try {
      const response = await loginAdmin({
        username: username.trim(),
        password,
      });

      saveAdminSession({
        adminId: response.admin_id,
        username: response.username,
      });

      navigate(fromPath, { replace: true });
    } catch (requestError) {
      setError(requestError.message || 'Неверный логин или пароль');
    } finally {
      setLoading(false);
    }
  };

  return (
      <div className={styles.contentWrapper}>
        <div className={styles.authLogo}>
          <span>uni︎guide</span>
        </div>
        <div className={styles.screenTitle}>🔐 Вход в админ-панель</div>
        <div className={styles.formWrapper}>
          <div className={styles.formContainer}>
            <form onSubmit={handleSubmit}>
              <div className={styles.formGroup}>
                <label htmlFor="username" className={styles.formLabel}>Логин</label>
                <input
                  id="username"
                  type="text"
                  className={styles.formInput}
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="admin"
                  required
                  autoComplete="username"
                  aria-invalid={Boolean(error)}
                  disabled={loading}
                />
              </div>
              
              <div className={styles.formGroup}>
                <label htmlFor="password" className={styles.formLabel}>Пароль</label>
                <input
                  id="password"
                  type="password"
                  className={styles.formInput}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••"
                  required
                  autoComplete="current-password"
                  aria-invalid={Boolean(error)}
                  disabled={loading}
                />
              </div>
              
              {error && (
                <div className={styles.error} role="alert" aria-live="polite">
                  {error}
                </div>
              )}
              
              <button 
                type="submit" 
                className={`${styles.btn} ${styles.btnPrimary}`}
                disabled={loading || !canSubmit}
              >
                {loading ? 'Вход...' : 'Войти'}
              </button>
            </form>
          </div>
        </div>
      </div>
  );
};

export default LoginPage;