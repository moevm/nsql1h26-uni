import React from 'react';
import styles from './AboutPage.module.css';

const AboutPage = () => {
  return (
    <div className={styles.screen}>
      <h1 className={styles.screenTitle}><span aria-hidden="true">ℹ️</span> О проекте</h1>

      <div className={styles.aboutContent}>
        <div className={styles.heroSection}>
          <h2 className={styles.heroTitle}>uni︎guide</h2>
          <div className={styles.heroSubtitle}>
            Сервис для детального поиска вузов и направлений подготовки
          </div>
        </div>

        <div className={styles.infoGrid}>
          <div className={styles.infoCard}>
            <div className={styles.infoIcon} aria-hidden="true">🔍</div>
            <h3>Детальный поиск</h3>
            <p>
              Поиск вузов по названию, городу, наличию общежития, военной кафедры и другим параметрам
            </p>
          </div>
          <div className={styles.infoCard}>
            <div className={styles.infoIcon} aria-hidden="true">🎯</div>
            <h3>Поиск направлений</h3>
            <p>
              Фильтрация программ по предметам ЕГЭ, форме обучения, проходным баллам
            </p>
          </div>
          <div className={styles.infoCard}>
            <div className={styles.infoIcon} aria-hidden="true">📈</div>
            <h3>Аналитика</h3>
            <p>
              Построение графиков и статистики на основе выбранных критериев
            </p>
          </div>
        </div>

        <div className={styles.descriptionSection}>
          <h2>О проекте</h2>
          <p>
            Uniguide — это веб-приложение для абитуриентов, позволяющее искать вузы и 
            направления подготовки по различным критериям, рассчитывать шансы поступления 
            на основе баллов ЕГЭ и анализировать статистику.
          </p>
          <p>
            Проект разработан в рамках идз по предмету "Введение в нереляционные базы данных" 
            студентами 3 курса СПбГЭТУ "ЛЭТИ"
          </p>

          <h3 className={styles.techSectionTitle}>Технологии</h3>
          <div className={styles.techList}>
            <span className={styles.techTag}>FastAPI</span>
            <span className={styles.techTag}>React</span>
            <span className={styles.techTag}>MongoDB</span>
            <span className={styles.techTag}>Docker</span>
            <span className={styles.techTag}>HTML/CSS</span>
            <span className={styles.techTag}>JavaScript</span>
          </div>
        </div>

        <div className={styles.teamSection}>
          <h2>Над проектом работали</h2>
          <div className={styles.teamGrid}>
            <div className={styles.teamMember}>
              <div className={styles.memberAvatar} aria-hidden="true">А</div>
              <div className={styles.memberName}>Антон Корниенко</div>
            </div>
            <div className={styles.teamMember}>
              <div className={styles.memberAvatar} aria-hidden="true">Д</div>
              <div className={styles.memberName}>Данила Иванов</div>
            </div>
            <div className={styles.teamMember}>
              <div className={styles.memberAvatar} aria-hidden="true">А</div>
              <div className={styles.memberName}>Александр Русанов</div>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.progressLine}></div>
      <div className={styles.version}>версия 1.0</div>
    </div>
  );
};

export default AboutPage;