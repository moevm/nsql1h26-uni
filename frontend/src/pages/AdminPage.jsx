import React, { useState, useEffect } from 'react';
import styles from './AdminPage.module.css';
import { createUniversity, getUniversities } from '../services/api';
import { getAdminSession } from '../services/auth';

const PHONE_REGEX = /^\+?[0-9()\-\s]{7,20}$/;

const INITIAL_UNIVERSITY_FORM = {
  name: '',
  city: '',
  address: '',
  website: '',
  foundation_year: '',
  students_count: '',
  faculties_count: '',
  phone: '',
  email: '',
  has_dormitory: false,
  military_dept: false,
  rating: '',
  programs_count: '',
  comment: '',
};

const AdminPage = () => {
  const [universities, setUniversities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitError, setSubmitError] = useState(null);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isAddUniversityOpen, setIsAddUniversityOpen] = useState(false);
  const [universityForm, setUniversityForm] = useState(INITIAL_UNIVERSITY_FORM);
  const itemsPerPage = 4;

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
        createdAt: uni.createdAt ? new Date(uni.createdAt).toLocaleDateString('ru-RU') : '-',
        updatedAt: uni.updatedAt ? new Date(uni.updatedAt).toLocaleDateString('ru-RU') : '-',
      }));
      setUniversities(transformedData);
    } catch (err) {
      setError(err.message || 'Ошибка при загрузке вузов');
      console.error('Ошибка загрузки вузов:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
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

  const handleOpenAddUniversity = () => {
    setSubmitError(null);
    setUniversityForm(INITIAL_UNIVERSITY_FORM);
    setIsAddUniversityOpen(true);
  };

  const handleCloseAddUniversity = () => {
    setIsAddUniversityOpen(false);
    setSubmitError(null);
    setUniversityForm(INITIAL_UNIVERSITY_FORM);
  };

  const handleFormChange = (field, value) => {
    setUniversityForm(prev => ({ ...prev, [field]: value }));
  };

  const handleCreateUniversity = async (event) => {
    event.preventDefault();
    setSubmitError(null);

    const adminSession = getAdminSession();
    if (!adminSession?.adminId) {
      setSubmitError('Сессия администратора не найдена. Войдите снова.');
      return;
    }

    if (!universityForm.name.trim() || !universityForm.city.trim() || !universityForm.website.trim()) {
      setSubmitError('Заполните обязательные поля: название, город и сайт.');
      return;
    }

    if (universityForm.phone.trim() && !PHONE_REGEX.test(universityForm.phone.trim())) {
      setSubmitError('Некорректный формат телефона. Пример: +7 (495) 123-45-67');
      return;
    }

    if (universityForm.rating !== '') {
      const ratingValue = Number.parseFloat(universityForm.rating);
      if (Number.isNaN(ratingValue) || ratingValue < 0 || ratingValue > 5) {
        setSubmitError('Рейтинг должен быть от 0 до 5.0');
        return;
      }
    }

    try {
      setSubmitLoading(true);

      const parseOptionalInt = (value) => {
        if (value === '') {
          return null;
        }
        const parsed = Number.parseInt(value, 10);
        return Number.isNaN(parsed) ? null : parsed;
      };

      const parseOptionalFloat = (value) => {
        if (value === '') {
          return null;
        }
        const parsed = Number.parseFloat(value);
        return Number.isNaN(parsed) ? null : parsed;
      };

      await createUniversity(
        {
          name: universityForm.name.trim(),
          city: universityForm.city.trim(),
          address: universityForm.address.trim() || null,
          website: universityForm.website.trim(),
          foundation_year: parseOptionalInt(universityForm.foundation_year),
          students_count: parseOptionalInt(universityForm.students_count),
          faculties_count: parseOptionalInt(universityForm.faculties_count),
          phone: universityForm.phone.trim() || null,
          email: universityForm.email.trim() || null,
          has_dormitory: universityForm.has_dormitory,
          military_dept: universityForm.military_dept,
          rating: parseOptionalFloat(universityForm.rating),
          programs_count: parseOptionalInt(universityForm.programs_count),
          comment: universityForm.comment.trim() || null,
        },
        adminSession.adminId
      );

      handleCloseAddUniversity();
      await fetchUniversities();
      setCurrentPage(1);
    } catch (requestError) {
      setSubmitError(requestError.message || 'Не удалось создать университет');
    } finally {
      setSubmitLoading(false);
    }
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
            <button className={styles.addBtn} onClick={handleOpenAddUniversity}>
              + Добавить вуз
            </button>
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

        {isAddUniversityOpen && (
          <div className={styles.modalOverlay} onClick={handleCloseAddUniversity}>
            <div className={styles.modal} onClick={(event) => event.stopPropagation()}>
              <div className={styles.modalHeader}>
                <h4>Добавить вуз</h4>
                <button
                  type="button"
                  className={styles.closeBtn}
                  onClick={handleCloseAddUniversity}
                  aria-label="Закрыть"
                >
                  ✕
                </button>
              </div>

              <form className={styles.modalForm} onSubmit={handleCreateUniversity}>
                <div className={styles.requiredHint}>Поля со * обязательны для заполнения</div>

                <label className={styles.formField}>
                  <span>Название *</span>
                  <input
                    type="text"
                    value={universityForm.name}
                    onChange={(e) => handleFormChange('name', e.target.value)}
                    placeholder="Например, МГУ"
                    required
                    disabled={submitLoading}
                  />
                </label>

                <label className={styles.formField}>
                  <span>Город *</span>
                  <input
                    type="text"
                    value={universityForm.city}
                    onChange={(e) => handleFormChange('city', e.target.value)}
                    placeholder="Москва"
                    required
                    disabled={submitLoading}
                  />
                </label>

                <label className={styles.formField}>
                  <span>Адрес</span>
                  <input
                    type="text"
                    value={universityForm.address}
                    onChange={(e) => handleFormChange('address', e.target.value)}
                    placeholder="ул. Ленина, 1"
                    disabled={submitLoading}
                  />
                </label>

                <label className={styles.formField}>
                  <span>Сайт *</span>
                  <input
                    type="url"
                    value={universityForm.website}
                    onChange={(e) => handleFormChange('website', e.target.value)}
                    placeholder="https://example.ru"
                    required
                    disabled={submitLoading}
                  />
                </label>

                <div className={styles.formGrid}>
                  <label className={styles.formField}>
                    <span>Год основания</span>
                    <input
                      type="number"
                      min="0"
                      value={universityForm.foundation_year}
                      onChange={(e) => handleFormChange('foundation_year', e.target.value)}
                      placeholder="1755"
                      disabled={submitLoading}
                    />
                  </label>

                  <label className={styles.formField}>
                    <span>Студентов</span>
                    <input
                      type="number"
                      min="0"
                      value={universityForm.students_count}
                      onChange={(e) => handleFormChange('students_count', e.target.value)}
                      placeholder="40000"
                      disabled={submitLoading}
                    />
                  </label>
                </div>

                <div className={styles.formGrid}>
                  <label className={styles.formField}>
                    <span>Факультетов</span>
                    <input
                      type="number"
                      min="0"
                      value={universityForm.faculties_count}
                      onChange={(e) => handleFormChange('faculties_count', e.target.value)}
                      placeholder="15"
                      disabled={submitLoading}
                    />
                  </label>

                  <label className={styles.formField}>
                    <span>Рейтинг</span>
                    <input
                      type="number"
                      min="0"
                      max="5"
                      step="0.1"
                      value={universityForm.rating}
                      onChange={(e) => handleFormChange('rating', e.target.value)}
                      placeholder="4.7"
                      disabled={submitLoading}
                    />
                  </label>
                </div>

                <div className={styles.formGrid}>
                  <label className={styles.formField}>
                    <span>Телефон</span>
                    <input
                      type="text"
                      value={universityForm.phone}
                      onChange={(e) => handleFormChange('phone', e.target.value)}
                      placeholder="+7 (495) 123-45-67"
                      pattern="^\\+?[0-9()\-\s]{7,20}$"
                      title="Введите телефон в формате +7 (495) 123-45-67"
                      disabled={submitLoading}
                    />
                  </label>

                  <label className={styles.formField}>
                    <span>Email</span>
                    <input
                      type="email"
                      value={universityForm.email}
                      onChange={(e) => handleFormChange('email', e.target.value)}
                      placeholder="info@university.ru"
                      disabled={submitLoading}
                    />
                  </label>
                </div>

                <label className={styles.formField}>
                  <span>Количество направлений</span>
                  <input
                    type="number"
                    min="0"
                    value={universityForm.programs_count}
                    onChange={(e) => handleFormChange('programs_count', e.target.value)}
                    placeholder="0"
                    disabled={submitLoading}
                  />
                </label>

                <label className={styles.formField}>
                  <span>Комментарий</span>
                  <textarea
                    value={universityForm.comment}
                    onChange={(e) => handleFormChange('comment', e.target.value)}
                    placeholder="Короткая заметка"
                    rows={3}
                    disabled={submitLoading}
                  />
                </label>

                <div className={styles.checkboxRow}>
                  <label className={styles.checkboxField}>
                    <input
                      type="checkbox"
                      checked={universityForm.has_dormitory}
                      onChange={(e) => handleFormChange('has_dormitory', e.target.checked)}
                      disabled={submitLoading}
                    />
                    <span>Есть общежитие</span>
                  </label>

                  <label className={styles.checkboxField}>
                    <input
                      type="checkbox"
                      checked={universityForm.military_dept}
                      onChange={(e) => handleFormChange('military_dept', e.target.checked)}
                      disabled={submitLoading}
                    />
                    <span>Есть военная кафедра</span>
                  </label>
                </div>

                {submitError && <div className={styles.formError}>❌ {submitError}</div>}

                <div className={styles.modalActions}>
                  <button
                    type="button"
                    className={`${styles.btn} ${styles.btnSecondary}`}
                    onClick={handleCloseAddUniversity}
                    disabled={submitLoading}
                  >
                    Отмена
                  </button>
                  <button type="submit" className={`${styles.btn} ${styles.btnPrimary}`} disabled={submitLoading}>
                    {submitLoading ? 'Создание...' : 'Создать вуз'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  };
  
  export default AdminPage;
