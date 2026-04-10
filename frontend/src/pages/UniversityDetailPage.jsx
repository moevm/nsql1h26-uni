import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styles from './UniversityDetailPage.module.css';
import { getUniversity } from '../services/api';

const formatDateTime = (value) => {
  if (!value) {
    return 'нет данных';
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return String(value);
  }

  return new Intl.DateTimeFormat('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
};

const normalizeProgram = (program) => ({
  id: program._id || program.id,
  name: program.name || 'Без названия',
  budgetPlaces: program.budget_places ?? 0,
  paidPlaces: program.paid_places ?? 0,
  passingScore: program.passing_score ?? 0,
  form: program.form_of_education || 'Не указана',
  subjects: Array.isArray(program.required_subjects)
    ? program.required_subjects.map((subject) => `${subject.subject} (${subject.minimum_points})`)
    : []
});

const UniversityDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [university, setUniversity] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [showBudgetOnly, setShowBudgetOnly] = useState(false);
  const [minPassingScore, setMinPassingScore] = useState('');
  const [maxPassingScore, setMaxPassingScore] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 4;

  useEffect(() => {
    const fetchUniversity = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getUniversity(id);
        setUniversity({
          id: data._id,
          name: data.name,
          city: data.city,
          address: data.address || 'не указан',
          hasDormitory: Boolean(data.has_dormitory),
          militaryDept: Boolean(data.military_dept),
          website: data.website || 'не указан',
          foundationYear: data.foundation_year ?? 'не указан',
          studentsCount: data.students_count ?? 'не указано',
          faculties: data.faculties_count ?? 'не указано',
          programsCount: data.programs_count ?? 0,
          phone: data.phone || 'не указан',
          email: data.email || 'не указан',
          createdAt: formatDateTime(data.createdAt),
          updatedAt: formatDateTime(data.updatedAt),
          programs: Array.isArray(data.programs) ? data.programs.map(normalizeProgram) : []
        });
      } catch (err) {
        setError(err.message || 'Ошибка при загрузке данных университета');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchUniversity();
    }
  }, [id]);

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.errorMessage}>
          <h2>Загрузка данных...</h2>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.errorMessage}>
          <h2>Ошибка загрузки</h2>
          <p>{error}</p>
          <button onClick={() => navigate('/')} className={styles.backButton}>
            Вернуться на главную
          </button>
        </div>
      </div>
    );
  }
  
  if (!university) {
    return (
      <div className={styles.container}>
        <div className={styles.errorMessage}>
          <h2>Вуз не найден</h2>
          <button onClick={() => navigate('/')} className={styles.backButton}>
            Вернуться на главную
          </button>
        </div>
      </div>
    );
  }
  
  const universityPrograms = university.programs || [];
  
  const filteredPrograms = universityPrograms.filter(program => {
    if (searchQuery && !program.name.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    
    if (showBudgetOnly && program.budgetPlaces === 0) {
      return false;
    }
    
    if (minPassingScore && program.passingScore < Number(minPassingScore)) {
      return false;
    }
    if (maxPassingScore && program.passingScore > Number(maxPassingScore)) {
      return false;
    }
    
    if (selectedSubject) {
      const hasSubject = program.subjects.some(subj => 
        subj.toLowerCase().includes(selectedSubject.toLowerCase())
      );
      if (!hasSubject) return false;
    }
    
    return true;
  });
  
  const totalPages = Math.ceil(filteredPrograms.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedPrograms = filteredPrograms.slice(startIndex, startIndex + itemsPerPage);
  
  const handleResetFilters = () => {
    setSearchQuery('');
    setShowBudgetOnly(false);
    setMinPassingScore('');
    setMaxPassingScore('');
    setSelectedSubject('');
    setCurrentPage(1);
  };
  
  const handleProgramClick = (programId) => {
    navigate(`/program/${programId}`);
  };
  
  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <div className={styles.breadcrumbs}>
          <button onClick={() => navigate('/')} className={styles.breadcrumbLink}>
            Вузы
          </button>
          <span className={styles.breadcrumbSeparator}>/</span>
          <span className={styles.breadcrumbCurrent}>{university.name}</span>
        </div>
        
        <div className={styles.universityHeader}>
          <div className={styles.universityInfo}>
            <h1 className={styles.universityName}>{university.name}</h1>
            <div className={styles.universityMeta}>
              <span>📍 {university.city}</span>
              <span>🏠 {university.hasDormitory ? 'общежитие есть' : 'общежития нет'}</span>
              {university.militaryDept && <span>⚔️ военная кафедра есть</span>}
            </div>
          </div>
        </div>
        
        <div className={styles.infoSection}>
            <div className={styles.infoCard}>
                <h3>Общая информация</h3>
                <div className={styles.infoRow}>
                    <span className={styles.infoLabel}>Год основания:</span>
                    <span className={styles.infoValue}>{university.foundationYear}</span>
                </div>
                <div className={styles.infoRow}>
                    <span className={styles.infoLabel}>Студентов:</span>
                    <span className={styles.infoValue}>≈ {university.studentsCount}</span>
                </div>
                <div className={styles.infoRow}>
                    <span className={styles.infoLabel}>Факультетов:</span>
                    <span className={styles.infoValue}>{university.faculties}</span>
                </div>
                <div className={styles.infoRow}>
                    <span className={styles.infoLabel}>Направлений:</span>
                    <span className={styles.infoValue}>{university.programsCount}</span>
                </div>
                <div className={styles.infoRow}>
                    <span className={styles.infoLabel}>Сайт:</span>
                    <span className={styles.infoValue}>{university.website}</span>
                </div>
            </div>
            <div className={styles.infoCard}>
                <h3>Контактная информация</h3>
                <div className={styles.infoRow}>
                    <span className={styles.infoLabel}>Адрес:</span>
                    <span className={styles.infoValue}>{university.address}</span>
                </div>
                <div className={styles.infoRow}>
                    <span className={styles.infoLabel}>Приемная комиссия:</span>
                  <span className={styles.infoValue}>{university.phone}</span>
                </div>
                <div className={styles.infoRow}>
                    <span className={styles.infoLabel}>Email:</span>
                  <span className={styles.infoValue}>{university.email}</span>
                </div>
            </div>
        </div>
        
        <div className={styles.programsSection}>
          <div className={styles.programsHeader}>
            <h3>Направления подготовки</h3>
            <div className={styles.programsCount}>
              Всего: {universityPrograms.length} направлений
            </div>
          </div>
          
          <div className={styles.programsFilters}>
            <div className={styles.searchRow}>
              <input
                type="text"
                className={styles.searchInput}
                placeholder="Поиск направлений по названию..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>
            
            <div className={styles.filterGroup}>
              <label className={styles.filterCheckbox}>
                <input
                  type="checkbox"
                  checked={showBudgetOnly}
                  onChange={(e) => {
                    setShowBudgetOnly(e.target.checked);
                    setCurrentPage(1);
                  }}
                />
                <span>Только бюджетные места</span>
              </label>
              
              <div className={styles.scoreRange}>
                <input
                  type="number"
                  className={styles.scoreInput}
                  placeholder="Проходной балл от"
                  value={minPassingScore}
                  onChange={(e) => {
                    setMinPassingScore(e.target.value);
                    setCurrentPage(1);
                  }}
                />
                <span>-</span>
                <input
                  type="number"
                  className={styles.scoreInput}
                  placeholder="до"
                  value={maxPassingScore}
                  onChange={(e) => {
                    setMaxPassingScore(e.target.value);
                    setCurrentPage(1);
                  }}
                />
              </div>
              
              <input
                type="text"
                className={styles.subjectInput}
                placeholder="Предмет ЕГЭ (математика, физика...)"
                value={selectedSubject}
                onChange={(e) => {
                  setSelectedSubject(e.target.value);
                  setCurrentPage(1);
                }}
              />
              
              <button onClick={handleResetFilters} className={styles.resetFiltersBtn}>
                Сбросить
              </button>
            </div>
          </div>
          
          {filteredPrograms.length === 0 ? (
            <div className={styles.emptyPrograms}>
              😕 По вашему запросу ничего не найдено
            </div>
          ) : (
            <>
              <div className={styles.programsTable}>
                <div className={styles.tableHeader}>
                  <span>Направление</span>
                  <span>Бюджетных мест</span>
                  <span>Платных мест</span>
                  <span>Проходной балл</span>
                  <span>Форма</span>
                  <span></span>
                </div>
                
                {paginatedPrograms.map(program => (
                  <div
                    key={program.id}
                    className={styles.programRow}
                    onClick={() => handleProgramClick(program.id)}
                  >
                    <div className={styles.programName}>{program.name}</div>
                    <div className={styles.programBudget}>{program.budgetPlaces}</div>
                    <div className={styles.programPaid}>{program.paidPlaces}</div>
                    <div className={styles.programScore}>{program.passingScore}</div>
                    <div className={styles.programForm}>{program.form}</div>
                    <div className={styles.programLink}>→</div>
                  </div>
                ))}
              </div>
              
              {totalPages > 1 && (
                <div className={styles.pagination}>
                  <span className={styles.paginationInfo}>
                    {startIndex + 1}-{Math.min(startIndex + itemsPerPage, filteredPrograms.length)} из {filteredPrograms.length}
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
        
        <div className={styles.datesFooter}>
          <span>📅 Страница создана: {university.createdAt}</span>
          <span>📅 Последнее обновление: {university.updatedAt}</span>
        </div>
        
        <div className={styles.progressLine}>
          <div className={styles.progressFill} style={{ width: '60%' }}></div>
        </div>
        <div className={styles.loadingStatus}>данные загружены</div>
      </div>
    </div>
  );
};

export default UniversityDetailPage;