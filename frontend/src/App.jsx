import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout/Layout';

// Временные заглушки для страниц
const HomePage = () => (
  <div style={{ textAlign: 'center', padding: '50px' }}>
    <h1>Главная страница</h1>
    <p>Список вузов будет здесь</p>
  </div>
);

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

const AboutPage = () => (
  <div style={{ textAlign: 'center', padding: '50px' }}>
    <h1>О проекте</h1>
    <p>Страница в разработке</p>
  </div>
);

const LoginPage = () => (
  <div style={{ textAlign: 'center', padding: '50px' }}>
    <h1>Вход</h1>
    <p>Страница входа в разработке</p>
  </div>
);

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/calculator" element={<CalculatorPage />} />
          <Route path="/statistics" element={<StatisticsPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/login" element={<LoginPage />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;