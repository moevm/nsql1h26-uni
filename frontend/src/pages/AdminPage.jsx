import React, { useState, useEffect } from 'react';
import styles from './AdminPage.module.css';
import { getUniversities } from '../services/api';

const AdminPage = () => {
  const [universities, setUniversities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 4;

  useEffect(() => {
    const fetchUniversities = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getUniversities();
        const transformedData = data.map(uni => ({
          id: uni._id,
          name: uni.name,
          city: uni.city,
          website: uni.website || '-',
          createdAt: new Date(uni.createdAt).toLocaleDateString('ru-RU'),
          updatedAt: new Date(uni.updatedAt).toLocaleDateString('ru-RU'),
        }));
        setUniversities(transformedData);
      } catch (err) {
        setError(err.message || 'Ошибка при загрузке вузов');
        console.error('Ошибка загрузки вузов:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchUniversities();
  }, []);

  const filteredUniversities = universities.filter(uni =>
    uni.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPages = Math.ceil(filteredUniversities.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedUniversities = filteredUniversities.slice(startIndex, startIndex + itemsPerPage);

  const handleEditUniversity = (id) => {
    console.log('Редактирование вуза:', id);
    // TODO: Реализовать редактирование
  };

  const handleDeleteUniversity = (id) => {
    console.log('Удаление вуза:', id);
    // TODO: Реализовать удаление
  };

  return (
    <div className={styles.container}>
        <div className={styles.screenTitle}>⚙️ Администрирование</div>

        <div className={styles.importExportCard}>
          <div className={styles.sectionSubtitle}>📦 Массовый импорт/экспорт данных</div>
          <div className={styles.importExportGrid}>
            <div className={styles.importBox}>
              <div className={styles.boxTitle}>Импорт</div>
              <div className={styles.fileInput}>
                📁 Перетащите файл или нажмите для выбора<br />
                <span style={{ fontSize: '0.85rem' }}>Поддерживаются файлы .json</span>
              </div>
              <div className={styles.warning}>
                ⚠️ Все текущие данные будут заменены
              </div>
              <button className={`${styles.btn} ${styles.btnDanger}`}>Загрузить и заменить данные</button>
            </div>

            <div className={styles.exportBox}>
              <div className={styles.boxTitle}>Экспорт</div>
              <select className={styles.formatSelect}>
                <option>JSON</option>
              </select>
              <button className={`${styles.btn} ${styles.btnPrimary}`} style={{ marginBottom: '10px' }}>
                Скачать все данные
              </button>
            </div>
          </div>
        </div>

        <div className={styles.managementSection}>
          <div className={styles.managementHeader}>
            <h3>🏛 Управление вузами</h3>
            <span className={styles.addBtn}>+ Добавить вуз</span>
          </div>

          <input
            className={styles.searchInput}
            placeholder="Поиск вуза..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
          />

          {loading && (
            <div style={{ textAlign: 'center', padding: '30px', color: '#64748b' }}>
              ⏳ Загрузка вузов...
            </div>
          )}

          {error && (
            <div style={{ textAlign: 'center', padding: '30px', color: '#d32f2f' }}>
              ❌ {error}
            </div>
          )}

          {!loading && !error && universities.length > 0 && (
            <>
              <div className={styles.tableHeader}>
                <span>Название</span>
                <span>Город</span>
                <span>Сайт</span>
                <span>Дата создания</span>
                <span>Изменен</span>
                <span>Действия</span>
              </div>

              {paginatedUniversities.map(uni => (
                <div key={uni.id} className={styles.uniRow}>
                  <span>{uni.name}</span>
                  <span>{uni.city}</span>
                  <span style={{ fontSize: '0.9rem', color: '#0066cc' }}>
                    {uni.website !== '-' ? uni.website : '-'}
                  </span>
                  <span>{uni.createdAt}</span>
                  <span>{uni.updatedAt}</span>
                  <div className={styles.actionBtns}>
                    <button
                      className={styles.actionBtn}
                      onClick={() => handleEditUniversity(uni.id)}
                      title="Редактировать"
                    >
                      ✎
                    </button>
                    <button
                      className={styles.actionBtn}
                      onClick={() => handleDeleteUniversity(uni.id)}
                      title="Удалить"
                    >
                      🗑
                    </button>
                  </div>
                </div>
              ))}

              {totalPages > 1 && (
                <div className={styles.pagination}>
                  <span style={{ color: '#4b637a' }}>
                    {startIndex + 1}-{Math.min(startIndex + itemsPerPage, filteredUniversities.length)} из {filteredUniversities.length}
                  </span>
                  <div className={styles.pageNumbers}>
                    {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map(page => (
                      <button
                        key={page}
                        className={`${styles.pageBtn} ${currentPage === page ? styles.active : ''}`}
                        onClick={() => setCurrentPage(page)}
                      >
                        {page}
                      </button>
                    ))}
                    {totalPages > 5 && (
                      <>
                        <span className={styles.dots}>⋯</span>
                        <button
                          className={styles.pageBtn}
                          onClick={() => setCurrentPage(totalPages)}
                        >
                          {totalPages}
                        </button>
                      </>
                    )}
                    <button
                      className={styles.pageBtn}
                      onClick={() => setCurrentPage(Math.min(currentPage + 1, totalPages))}
                      disabled={currentPage === totalPages}
                    >
                      →
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        <div className={styles.managementSection}>
          <div className={styles.managementHeader}>
            <h3>📚 Управление направлениями</h3>
            <span className={styles.addBtn}>+ Добавить направление</span>
          </div>

          <input className={styles.searchInput} placeholder="Поиск направления..." disabled />

          <div style={{ textAlign: 'center', padding: '30px', color: '#64748b' }}>
            📋 Управление направлениями скоро будет доступно
          </div>
        </div>
      </div>
    );
  };
  
  export default AdminPage;
