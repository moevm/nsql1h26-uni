import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout/Layout';
import LoginPage from './pages/LoginPage';
import AboutPage from './pages/AboutPage';
import UniversitiesPage from './pages/UniversitiesPage';

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

const AdminPage = () => (
  <div style={{ textAlign: 'center', padding: '50px' }}>
    <h1>Админ-панель</h1>
    <p>Страница в разработке</p>
  </div>
);

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
        <Route path="/about" element={
          <Layout>
            <AboutPage />
          </Layout>
        } />
        <Route path="/admin" element={
          <Layout>
            <AdminPage />
          </Layout>
        } />
      </Routes>
    </Router>
  );
}

export default App;