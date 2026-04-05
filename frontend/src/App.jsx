import React from 'react';
import { BrowserRouter as Router, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import Layout from './components/Layout/Layout';
import LoginPage from './pages/LoginPage';
import AboutPage from './pages/AboutPage';
import UniversitiesPage from './pages/UniversitiesPage';
import UniversityDetailPage from './pages/UniversityDetailPage';
import AdminPage from './pages/AdminPage';
import { isAdminAuthenticated } from './services/auth';

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