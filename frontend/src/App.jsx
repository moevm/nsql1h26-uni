import React from 'react';
import { BrowserRouter as Router, Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import Layout from './components/Layout/Layout';
import LoginPage from './pages/LoginPage';
import AboutPage from './pages/AboutPage';
import UniversitiesPage from './pages/UniversitiesPage';
import UniversityDetailPage from './pages/UniversityDetailPage';
import { clearAdminSession, getAdminSession, isAdminAuthenticated } from './services/auth';

// Временные заглушки для страниц
const CalculatorPage = () => (
  <div style={{ textAlign: 'center', padding: '50px' }}>
    <h1>Калькулятор ЕГЭ</h1>
    <p>Страница в разработке</p>
  </div>
);

const StatisticsPage = () => (
  <div style={{ textAlign: 'center', padding: '50px' }}>
    <h1>Статистика</h1>
    <p>Страница в разработке</p>
  </div>
);

const RequireAdmin = ({ children }) => {
  const location = useLocation();

  if (!isAdminAuthenticated()) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return children;
};

const AdminPage = () => {
  const navigate = useNavigate();
  const adminSession = getAdminSession();

  const handleLogout = () => {
    clearAdminSession();
    navigate('/', { replace: true });
  };

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '50px 20px' }}>
      <div
        style={{
          background: '#f9fcff',
          border: '1px solid #e2eaf2',
          borderRadius: '20px',
          padding: '32px',
          textAlign: 'center',
        }}
      >
        <div style={{ fontSize: '3rem', marginBottom: '12px' }}>✅</div>
        <h1>Авторизация успешна</h1>
        <p style={{ marginTop: '12px' }}>
          Вы вошли как {adminSession?.username || 'администратор'}.
        </p>
        <p style={{ marginTop: '16px' }}>Admin ID: {adminSession?.adminId}</p>
      </div>
    </div>
  );
};

function App() {
  return (
    <Router>
    <Routes>
        <Route path="/login" element={<LoginPage />} />
        
        <Route path="/" element={
          <Layout>
            <UniversitiesPage />
          </Layout>
        } />
        <Route path="/calculator" element={
          <Layout>
            <CalculatorPage />
          </Layout>
        } />
        <Route path="/statistics" element={
          <Layout>
            <StatisticsPage />
          </Layout>
        } />
        <Route path="/universities/:id" element={
          <Layout>
            <UniversityDetailPage />
          </Layout>
        } />
        <Route path="/about" element={
          <Layout>
            <AboutPage />
          </Layout>
        } />
        <Route
          path="/admin"
          element={
            <RequireAdmin>
              <Layout>
                <AdminPage />
              </Layout>
            </RequireAdmin>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;