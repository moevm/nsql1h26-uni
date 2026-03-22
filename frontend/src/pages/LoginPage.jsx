import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './LoginPage.module.css';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const canSubmit = email.trim() !== '' && password.trim() !== '';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!canSubmit) {
      setError('Заполните email и пароль');
      return;
    }

    setLoading(true);

    // Заглушка авторизации
    if (email === 'admin@example.com' && password === 'admin123') {
      localStorage.setItem('isAdmin', 'true');
      localStorage.setItem('email', email);
      navigate('/admin');
    } else {
      setError('Неверный email или пароль');
    }
    setLoading(false);
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
                <label htmlFor="email" className={styles.formLabel}>Email</label>
                <input
                  id="email"
                  type="email"
                  className={styles.formInput}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="user@example.com"
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