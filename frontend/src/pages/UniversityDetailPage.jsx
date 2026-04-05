import React, { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getUniversity } from '../services/api';
import styles from './UniversityDetailPage.module.css';

// Моковые данные для вузов
const universitiesData = {
  '1': {
    id: '1',
    name: 'МГУ им. Ломоносова',
    city: 'Москва',
    address: 'Москва, Ленинские горы, 1',
    hasDormitory: true,
    militaryDept: true,
    website: 'msu.ru',
    foundationYear: 1755,
    studentsCount: 40000,
    faculties: 15,
    programsCount: 128,
    createdAt: '01.09.2022',
    updatedAt: '20.03.2025'
  },
  '2': {
    id: '2',
    name: 'МФТИ (Физтех)',
    city: 'Долгопрудный',
    address: 'Московская обл., г. Долгопрудный, Институтский пер., 9',
    hasDormitory: true,
    militaryDept: true,
    website: 'mipt.ru',
    foundationYear: 1951,
    studentsCount: 7000,
    faculties: 10,
    programsCount: 85,
    createdAt: '01.09.2022',
    updatedAt: '15.03.2025'
  },
  '3': {
    id: '3',
    name: 'НИУ ВШЭ',
    city: 'Москва',
    address: 'Москва, ул. Мясницкая, 20',
    hasDormitory: true,
    militaryDept: false,
    website: 'hse.ru',
    foundationYear: 1992,
    studentsCount: 45000,
    faculties: 12,
    programsCount: 156,
    createdAt: '01.09.2023',
    updatedAt: '10.03.2025'
  },
  '4': {
    id: '4',
    name: 'МГТУ им. Баумана',
    city: 'Москва',
    address: 'Москва, 2-я Бауманская ул., 5',
    hasDormitory: true,
    militaryDept: true,
    website: 'bmstu.ru',
    foundationYear: 1830,
    studentsCount: 30000,
    faculties: 15,
    programsCount: 112,
    createdAt: '01.09.2022',
    updatedAt: '05.03.2025'
  }
};

// Моковые данные для направлений
const programsData = {
  '1': [
    {
      id: 'p1',
      name: 'Прикладная математика',
      budgetPlaces: 25,
      paidPlaces: 15,
      passingScore: 287,
      form: 'Очная',
      subjects: ['Математика (75)', 'Физика (70)', 'Русский язык (60)']
    },
    {
      id: 'p2',
      name: 'Фундаментальная физика',
      budgetPlaces: 20,
      paidPlaces: 10,
      passingScore: 275,
      form: 'Очная',
      subjects: ['Физика (75)', 'Математика (70)', 'Русский язык (60)']
    },
    {
      id: 'p3',
      name: 'Лингвистика',
      budgetPlaces: 15,
      paidPlaces: 25,
      passingScore: 260,
      form: 'Очная',
      subjects: ['Русский язык (70)', 'Иностранный язык (70)', 'Литература (60)']
    },
    {
      id: 'p4',
      name: 'Химия',
      budgetPlaces: 30,
      paidPlaces: 10,
      passingScore: 255,
      form: 'Очная',
      subjects: ['Химия (75)', 'Математика (65)', 'Русский язык (60)']
    },
    {
      id: 'p5',
      name: 'Информатика и вычислительная техника',
      budgetPlaces: 35,
      paidPlaces: 20,
      passingScore: 290,
      form: 'Очная',
      subjects: ['Математика (80)', 'Информатика (75)', 'Русский язык (65)']
    }
  ],
  '2': [
    {
      id: 'p6',
      name: 'Прикладная математика и физика',
      budgetPlaces: 30,
      paidPlaces: 15,
      passingScore: 280,
      form: 'Очная',
      subjects: ['Математика (80)', 'Физика (75)', 'Русский язык (65)']
    },
    {
      id: 'p7',
      name: 'Информатика и вычислительная техника',
      budgetPlaces: 25,
      paidPlaces: 20,
      passingScore: 275,
      form: 'Очная',
      subjects: ['Математика (75)', 'Информатика (70)', 'Русский язык (60)']
    }
  ],
  '3': [
    {
      id: 'p8',
      name: 'Экономика',
      budgetPlaces: 40,
      paidPlaces: 60,
      passingScore: 285,
      form: 'Очная',
      subjects: ['Математика (75)', 'Обществознание (70)', 'Русский язык (65)']
    },
    {
      id: 'p9',
      name: 'Бизнес-информатика',
      budgetPlaces: 25,
      paidPlaces: 35,
      passingScore: 270,
      form: 'Очная',
      subjects: ['Математика (70)', 'Информатика (65)', 'Русский язык (60)']
    }
  ],
  '4': [
    {
      id: 'p10',
      name: 'Машиностроение',
      budgetPlaces: 50,
      paidPlaces: 20,
      passingScore: 245,
      form: 'Очная',
      subjects: ['Математика (65)', 'Физика (60)', 'Русский язык (55)']
    },
    {
      id: 'p11',
      name: 'Робототехника',
      budgetPlaces: 20,
      paidPlaces: 15,
      passingScore: 265,
      form: 'Очная',
      subjects: ['Математика (70)', 'Физика (65)', 'Информатика (60)']
    }
  ]
};

const SUBJECT_OPTIONS = [
  'Русский язык',
  'Математика',
  'Физика',
  'Химия',
  'История',
  'Обществознание',
  'Информатика и ИКТ',
  'Биология',
  'География',
  'Литература',
  'Английский язык',
  'Немецкий язык',
  'Французский язык',
  'Испанский язык',
  'Китайский язык',
];

const MAX_POSSIBLE_PASING_SCORE = 410;

const getFallbackUniversity = (id) => universitiesData[id] || null;

const toReadableDate = (value) => {
  if (!value) {
    return '-';
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return String(value);
  }

  return parsed.toLocaleDateString('ru-RU');
};

const normalizeUniversity = (rawUniversity, fallbackUniversity = null) => {
  if (!rawUniversity && !fallbackUniversity) {
    return null;
  }

  const source = rawUniversity || fallbackUniversity;
  const fallback = fallbackUniversity || source;

  return {
    id: source._id || source.id,
    name: source.name || fallback.name,
    city: source.city || fallback.city,
    address: source.address || fallback.address || '-',
    hasDormitory: source.has_dormitory ?? source.hasDormitory ?? fallback.hasDormitory ?? false,
    militaryDept: source.military_dept ?? source.militaryDept ?? fallback.militaryDept ?? false,
    website: source.website || fallback.website || '-',
    foundationYear: source.foundation_year || source.foundationYear || fallback.foundationYear || '-',
    studentsCount: source.students_count || source.studentsCount || fallback.studentsCount || '-',
    facultiesCount: source.faculties_count || source.facultiesCount || fallback.faculties || fallback.facultiesCount || '-',
    phone: source.phone || fallback.phone || '-',
    email: source.email || fallback.email || '-',
    rating: source.rating ?? fallback.rating ?? '-',
    programsCount: source.programs_count || source.programsCount || fallback.programsCount || 0,
    createdAt: toReadableDate(source.created_at || source.createdAt || fallback.createdAt),
    updatedAt: toReadableDate(source.updated_at || source.updatedAt || fallback.updatedAt),
  };
};

const normalizeSubjectName = (subject) => {
  if (!subject) {
    return '';
  }

  if (typeof subject === 'string') {
    return subject.replace(/\s*\(.*\)\s*$/, '').trim();
  }

  if (typeof subject === 'object') {
    return String(subject.name || subject.title || subject.subject || '').trim();
  }

  return String(subject).trim();
};

const getProgramRequiredSubjects = (program) => {
  const rawSubjects = Array.isArray(program.required_subjects) && program.required_subjects.length > 0
    ? program.required_subjects
    : (program.subjects || []);

  return rawSubjects.map(normalizeSubjectName).filter(Boolean);
};

const UniversityDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const fallbackUniversity = useMemo(() => getFallbackUniversity(id), [id]);

  const [university, setUniversity] = useState(() => normalizeUniversity(null, fallbackUniversity));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [showBudgetOnly, setShowBudgetOnly] = useState(false);
  const [minPassingScore, setMinPassingScore] = useState('');
  const [maxPassingScore, setMaxPassingScore] = useState('');
  const [isScoreDropdownOpen, setIsScoreDropdownOpen] = useState(false);
  const [isSubjectDropdownOpen, setIsSubjectDropdownOpen] = useState(false);
  const [subjectSearchQuery, setSubjectSearchQuery] = useState('');
  const [selectedSubjects, setSelectedSubjects] = useState([]);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 4;

  const scoreRangeValidationError = useMemo(() => {
    const minValue = minPassingScore === '' ? null : Number(minPassingScore);
    const maxValue = maxPassingScore === '' ? null : Number(maxPassingScore);

    if (minValue !== null && (!Number.isFinite(minValue) || minValue < 0)) {
      return 'Минимальный проходной балл не может быть отрицательным';
    }

    if (maxValue !== null && (!Number.isFinite(maxValue) || maxValue < 0)) {
      return 'Максимальный проходной балл не может быть отрицательным';
    }

    if (minValue !== null && minValue > MAX_POSSIBLE_PASING_SCORE) {
      return `Минимальный проходной балл не может быть выше ${MAX_POSSIBLE_PASING_SCORE}`;
    }

    if (maxValue !== null && maxValue > MAX_POSSIBLE_PASING_SCORE) {
      return `Максимальный проходной балл не может быть выше ${MAX_POSSIBLE_PASING_SCORE}`;
    }

    if (
      minValue !== null &&
      maxValue !== null &&
      Number.isFinite(minValue) &&
      Number.isFinite(maxValue) &&
      maxValue < minValue
    ) {
      return 'Максимальная граница должна быть больше или равна минимальной';
    }

    return '';
  }, [maxPassingScore, minPassingScore]);

  const isScoreRangeValid = !scoreRangeValidationError;

  useEffect(() => {
    let isMounted = true;

    const loadUniversity = async () => {
      setLoading(true);
      setError(null);

      try {
        const data = await getUniversity(id);
        if (!isMounted) {
          return;
        }

        setUniversity(normalizeUniversity(data, fallbackUniversity));
      } catch (err) {
        if (!isMounted) {
          return;
        }

        if (fallbackUniversity) {
          setUniversity(normalizeUniversity(null, fallbackUniversity));
        } else {
          setUniversity(null);
          setError(err.message || 'Университет не найден');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadUniversity();

    return () => {
      isMounted = false;
    };
  }, [id, fallbackUniversity]);

  const universityPrograms = programsData[id] || [];
  const subjectOptions = useMemo(() => SUBJECT_OPTIONS, []);

  const filteredSubjectOptions = subjectOptions.filter((subject) =>
    subject.toLowerCase().includes(subjectSearchQuery.toLowerCase())
  );

  const filteredPrograms = universityPrograms.filter(program => {
    if (searchQuery && !program.name.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    
    if (showBudgetOnly && program.budgetPlaces === 0) {
      return false;
    }
    
    if (isScoreRangeValid && minPassingScore && program.passingScore < Number(minPassingScore)) {
      return false;
    }
    if (isScoreRangeValid && maxPassingScore && program.passingScore > Number(maxPassingScore)) {
      return false;
    }

    if (selectedSubjects.length > 0) {
      const requiredSubjects = getProgramRequiredSubjects(program);
      const isCompatible = requiredSubjects.every((subject) => selectedSubjects.includes(subject));

      if (!isCompatible) {
        return false;
      }
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
    setIsScoreDropdownOpen(false);
    setIsSubjectDropdownOpen(false);
    setSubjectSearchQuery('');
    setSelectedSubjects([]);
    setCurrentPage(1);
  };

  const toggleSubject = (subject) => {
    setSelectedSubjects((currentSubjects) => {
      if (currentSubjects.includes(subject)) {
        return currentSubjects.filter((item) => item !== subject);
      }

      return [...currentSubjects, subject];
    });
    setCurrentPage(1);
  };
  
  const handleProgramClick = (programId) => {
    navigate(`/program/${programId}`);
  };

  if (!university && loading) {
    return (
      <div className={styles.page}>
        <div className={styles.container}>
          <div className={styles.emptyPrograms}>⏳ Загрузка данных вуза...</div>
        </div>
      </div>
    );
  }

  if (!university) {
    return (
      <div className={styles.page}>
        <div className={styles.container}>
          <div className={styles.errorMessage}>
            <h2>Вуз не найден</h2>
            <p>{error || 'Не удалось загрузить данные'}</p>
            <button onClick={() => navigate('/')} className={styles.backButton}>
              Вернуться на главную
            </button>
          </div>
        </div>
      </div>
    );
  }

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
              <span className={styles.infoValue}>
                {typeof university.studentsCount === 'number'
                  ? `≈ ${university.studentsCount.toLocaleString('ru-RU')}`
                  : university.studentsCount}
              </span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>Факультетов:</span>
              <span className={styles.infoValue}>{university.facultiesCount}</span>
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

              <div className={styles.scoreDropdown}>
                <button
                  type="button"
                  className={styles.scoreDropdownTrigger}
                  onClick={() => setIsScoreDropdownOpen((currentState) => !currentState)}
                >
                  <span>
                    {minPassingScore || maxPassingScore
                      ? `Проходной балл: ${minPassingScore || '0'}-${maxPassingScore || '∞'}`
                      : 'Проходной балл: любой'}
                  </span>
                  <span className={styles.scoreDropdownChevron}>
                    {isScoreDropdownOpen ? '▲' : '▼'}
                  </span>
                </button>

                {isScoreDropdownOpen && (
                  <div className={styles.scoreDropdownPanel}>
                    <div className={styles.scoreRange}>
                      <input
                        type="number"
                        className={styles.scoreInput}
                        placeholder="Проходной балл от"
                        value={minPassingScore}
                        min="0"
                        max={MAX_POSSIBLE_PASING_SCORE}
                        step="1"
                        onChange={(e) => {
                          setMinPassingScore(e.target.value);
                          setCurrentPage(1);
                        }}
                      />
                      <span className={styles.scoreRangeSeparator}>—</span>
                      <input
                        type="number"
                        className={styles.scoreInput}
                        placeholder="до"
                        value={maxPassingScore}
                        min="0"
                        max={MAX_POSSIBLE_PASING_SCORE}
                        step="1"
                        onChange={(e) => {
                          setMaxPassingScore(e.target.value);
                          setCurrentPage(1);
                        }}
                      />
                    </div>

                    {scoreRangeValidationError && (
                      <div className={styles.scoreDropdownError}>
                        {scoreRangeValidationError}
                      </div>
                    )}

                    <div className={styles.scoreDropdownFooter}>
                      <span>
                        {minPassingScore || maxPassingScore
                          ? `Диапазон: ${minPassingScore || '0'}-${maxPassingScore || '∞'}`
                          : 'Укажите диапазон проходного балла'}
                      </span>
                      <button
                        type="button"
                        className={styles.scoreDropdownClose}
                        disabled={!isScoreRangeValid}
                        onClick={() => setIsScoreDropdownOpen(false)}
                      >
                        Готово
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div className={styles.subjectDropdown}>
                <button
                  type="button"
                  className={styles.subjectDropdownTrigger}
                  onClick={() => setIsSubjectDropdownOpen((currentState) => !currentState)}
                >
                  <span>
                    {selectedSubjects.length > 0
                      ? `ЕГЭ: выбрано ${selectedSubjects.length}`
                      : 'Предметы ЕГЭ: не выбраны'}
                  </span>
                  <span className={styles.subjectDropdownChevron}>
                    {isSubjectDropdownOpen ? '▲' : '▼'}
                  </span>
                </button>

                {isSubjectDropdownOpen && (
                  <div className={styles.subjectDropdownPanel}>
                    <input
                      type="text"
                      className={styles.subjectDropdownSearch}
                      placeholder="Начните вводить название предмета"
                      value={subjectSearchQuery}
                      onChange={(e) => setSubjectSearchQuery(e.target.value)}
                    />

                    <div className={styles.subjectOptionsList}>
                      {filteredSubjectOptions.length > 0 ? (
                        filteredSubjectOptions.map((subject) => (
                          <label key={subject} className={styles.subjectOption}>
                            <input
                              type="checkbox"
                              checked={selectedSubjects.includes(subject)}
                              onChange={() => toggleSubject(subject)}
                            />
                            <span>{subject}</span>
                          </label>
                        ))
                      ) : (
                        <div className={styles.subjectOptionsEmpty}>
                          Ничего не найдено
                        </div>
                      )}
                    </div>

                    <div className={styles.subjectDropdownFooter}>
                      <span>
                        {selectedSubjects.length > 0
                          ? `Выбрано: ${selectedSubjects.join(', ')}`
                          : 'Выберите предметы для фильтра'}
                      </span>
                      <button
                        type="button"
                        className={styles.subjectDropdownClose}
                        onClick={() => setIsSubjectDropdownOpen(false)}
                      >
                        Готово
                      </button>
                    </div>
                  </div>
                )}
              </div>

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
          <div className={styles.progressFill} style={{ width: loading ? '60%' : '100%' }}></div>
        </div>
        <div className={styles.loadingStatus}>{loading ? 'данные загружаются' : 'данные загружены'}</div>
      </div>
    </div>
  );
};

export default UniversityDetailPage;