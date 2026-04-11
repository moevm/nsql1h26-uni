import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getProgramsByUniversity, getUniversity } from '../services/api';
import styles from './UniversityDetailPage.module.css';

const normalizeProgram = (program) => ({
  id: program._id || program.id,
  name: program.name || 'Без названия',
  budgetPlaces: program.budget_places ?? program.budgetPlaces ?? 0,
  paidPlaces: program.paid_places ?? program.paidPlaces ?? 0,
  passingScore: program.passing_score ?? program.passingScore ?? 0,
  form: program.form_of_education || program.form || 'Не указана',
  subjects: Array.isArray(program.required_subjects)
    ? program.required_subjects.map((subject) => `${subject.subject} (${subject.minimum_points})`)
    : (program.subjects || []),
});

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

const EDUCATION_FORM_OPTIONS = ['Очная', 'Очно-заочная', 'Заочная'];

const MAX_POSSIBLE_PASING_SCORE = 410;

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

const normalizeUniversity = (rawUniversity) => {
  if (!rawUniversity) {
    return null;
  }

  const source = rawUniversity;

  return {
    id: source._id || source.id,
    name: source.name || '-',
    city: source.city || '-',
    address: source.address || '-',
    hasDormitory: source.has_dormitory ?? source.hasDormitory ?? false,
    militaryDept: source.military_dept ?? source.militaryDept ?? false,
    website: source.website || '-',
    foundationYear: source.foundation_year || source.foundationYear || '-',
    studentsCount: source.students_count || source.studentsCount || '-',
    facultiesCount: source.faculties_count || source.facultiesCount || source.faculties || '-',
    phone: source.phone || '-',
    email: source.email || '-',
    rating: source.rating ?? '-',
    programsCount: source.programs_count || source.programsCount || 0,
    createdAt: toReadableDate(source.created_at || source.createdAt),
    updatedAt: toReadableDate(source.updated_at || source.updatedAt),
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

const SUBJECT_ABBREVIATIONS = {
  'русский язык': 'РУ',
  'математика': 'МА',
  'физика': 'ФИ',
  'химия': 'ХИ',
  'история': 'ИС',
  'обществознание': 'ОБ',
  'информатика': 'ИКТ',
  'информатика и икт': 'ИКТ',
  'биология': 'БИ',
  'география': 'ГЕ',
  'литература': 'ЛИ',
  'английский язык': 'АЯ',
  'немецкий язык': 'НЯ',
  'французский язык': 'ФЯ',
  'испанский язык': 'ИЯ',
  'китайский язык': 'КЯ',
};

const getSubjectAbbreviation = (subject) => {
  const normalizedSubject = normalizeSubjectName(subject).toLowerCase();
  if (!normalizedSubject) {
    return '';
  }

  if (SUBJECT_ABBREVIATIONS[normalizedSubject]) {
    return SUBJECT_ABBREVIATIONS[normalizedSubject];
  }

  const words = normalizedSubject
    .replace(/[^a-zа-я0-9\s-]/gi, ' ')
    .split(/\s+/)
    .filter(Boolean);

  if (words.length === 0) {
    return '';
  }

  if (words.length === 1) {
    return words[0].slice(0, 3).toUpperCase();
  }

  return words
    .slice(0, 3)
    .map((word) => word[0].toUpperCase())
    .join('');
};

const getProgramSubjectBadges = (program) => {
  const uniqueSubjects = [...new Set(getProgramRequiredSubjects(program))];

  return uniqueSubjects
    .map((subject) => {
      const abbr = getSubjectAbbreviation(subject);
      if (!abbr) {
        return null;
      }

      return {
        key: `${subject}-${abbr}`,
        full: subject,
        abbr,
      };
    })
    .filter(Boolean);
};

const getFiltersSignature = (filters) => {
  const normalized = {
    ...filters,
    required_subjects: Array.isArray(filters.required_subjects)
      ? [...filters.required_subjects].sort((a, b) => a.localeCompare(b, 'ru'))
      : undefined,
  };

  return JSON.stringify(normalized);
};

const UniversityDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [university, setUniversity] = useState(null);
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [programsError, setProgramsError] = useState(null);
  const [programsLoading, setProgramsLoading] = useState(false);
  const [appliedFiltersSignature, setAppliedFiltersSignature] = useState(getFiltersSignature({}));

  const [searchQuery, setSearchQuery] = useState('');
  const [minBudgetPlaces, setMinBudgetPlaces] = useState('');
  const [maxBudgetPlaces, setMaxBudgetPlaces] = useState('');
  const [isBudgetDropdownOpen, setIsBudgetDropdownOpen] = useState(false);
  const [minPassingScore, setMinPassingScore] = useState('');
  const [maxPassingScore, setMaxPassingScore] = useState('');
  const [isScoreDropdownOpen, setIsScoreDropdownOpen] = useState(false);
  const [minPaidPlaces, setMinPaidPlaces] = useState('');
  const [maxPaidPlaces, setMaxPaidPlaces] = useState('');
  const [isPaidDropdownOpen, setIsPaidDropdownOpen] = useState(false);
  const [selectedEducationForm, setSelectedEducationForm] = useState('');
  const [isEducationFormDropdownOpen, setIsEducationFormDropdownOpen] = useState(false);
  const [isSubjectDropdownOpen, setIsSubjectDropdownOpen] = useState(false);
  const [subjectSearchQuery, setSubjectSearchQuery] = useState('');
  const [selectedSubjects, setSelectedSubjects] = useState([]);

  const budgetDropdownRef = useRef(null);
  const scoreDropdownRef = useRef(null);
  const paidDropdownRef = useRef(null);
  const educationFormDropdownRef = useRef(null);
  const subjectDropdownRef = useRef(null);

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

  const budgetPlacesValidationError = useMemo(() => {
    const minValue = minBudgetPlaces === '' ? null : Number(minBudgetPlaces);
    const maxValue = maxBudgetPlaces === '' ? null : Number(maxBudgetPlaces);

    if (minValue !== null && (!Number.isFinite(minValue) || minValue < 0)) {
      return 'Минимум бюджетных мест не может быть отрицательным';
    }

    if (maxValue !== null && (!Number.isFinite(maxValue) || maxValue < 0)) {
      return 'Максимум бюджетных мест не может быть отрицательным';
    }

    if (
      minValue !== null &&
      maxValue !== null &&
      Number.isFinite(minValue) &&
      Number.isFinite(maxValue) &&
      maxValue < minValue
    ) {
      return 'Максимум бюджетных мест должен быть больше или равен минимуму';
    }

    return '';
  }, [maxBudgetPlaces, minBudgetPlaces]);

  const isBudgetPlacesRangeValid = !budgetPlacesValidationError;

  const paidPlacesValidationError = useMemo(() => {
    const minValue = minPaidPlaces === '' ? null : Number(minPaidPlaces);
    const maxValue = maxPaidPlaces === '' ? null : Number(maxPaidPlaces);

    if (minValue !== null && (!Number.isFinite(minValue) || minValue < 0)) {
      return 'Минимум платных мест не может быть отрицательным';
    }

    if (maxValue !== null && (!Number.isFinite(maxValue) || maxValue < 0)) {
      return 'Максимум платных мест не может быть отрицательным';
    }

    if (
      minValue !== null &&
      maxValue !== null &&
      Number.isFinite(minValue) &&
      Number.isFinite(maxValue) &&
      maxValue < minValue
    ) {
      return 'Максимум платных мест должен быть больше или равен минимуму';
    }

    return '';
  }, [maxPaidPlaces, minPaidPlaces]);

  const isPaidPlacesRangeValid = !paidPlacesValidationError;

  const buildProgramsFilters = () => {
    const filters = {};

    if (searchQuery.trim()) {
      filters.name = searchQuery.trim();
    }

    if (isBudgetPlacesRangeValid && minBudgetPlaces !== '') {
      filters.min_budget_places = Number(minBudgetPlaces);
    }
    if (isBudgetPlacesRangeValid && maxBudgetPlaces !== '') {
      filters.max_budget_places = Number(maxBudgetPlaces);
    }

    if (isPaidPlacesRangeValid && minPaidPlaces !== '') {
      filters.min_paid_places = Number(minPaidPlaces);
    }
    if (isPaidPlacesRangeValid && maxPaidPlaces !== '') {
      filters.max_paid_places = Number(maxPaidPlaces);
    }

    if (isScoreRangeValid && minPassingScore !== '') {
      filters.min_passing_score = Number(minPassingScore);
    }
    if (isScoreRangeValid && maxPassingScore !== '') {
      filters.max_passing_score = Number(maxPassingScore);
    }

    if (selectedEducationForm) {
      filters.form_of_education = selectedEducationForm;
    }

    if (selectedSubjects.length > 0) {
      filters.required_subjects = selectedSubjects;
    }

    return filters;
  };

  const fetchPrograms = async (filters = {}) => {
    setProgramsLoading(true);
    setProgramsError(null);

    try {
      const programsData = await getProgramsByUniversity(id, filters);
      setPrograms(Array.isArray(programsData) ? programsData.map(normalizeProgram) : []);
      setAppliedFiltersSignature(getFiltersSignature(filters));
      setCurrentPage(1);
    } catch (err) {
      setPrograms([]);
      setProgramsError(err.message || 'Не удалось загрузить направления');
    } finally {
      setProgramsLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;

    const loadUniversity = async () => {
      setLoading(true);
      setError(null);
      setProgramsError(null);

      try {
        const universityData = await getUniversity(id);

        if (!isMounted) {
          return;
        }

        setUniversity(normalizeUniversity(universityData));
        await fetchPrograms();
      } catch (err) {
        if (!isMounted) {
          return;
        }

        try {
          const fallbackUniversity = await getUniversity(id);
          if (!isMounted) {
            return;
          }

          setUniversity(normalizeUniversity(fallbackUniversity));
          await fetchPrograms();
        } catch (universityErr) {
          setUniversity(null);
          setPrograms([]);
          setError(universityErr.message || 'Университет не найден');
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
  }, [id]);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (budgetDropdownRef.current && !budgetDropdownRef.current.contains(event.target)) {
        setIsBudgetDropdownOpen(false);
      }

      if (scoreDropdownRef.current && !scoreDropdownRef.current.contains(event.target)) {
        setIsScoreDropdownOpen(false);
      }

      if (paidDropdownRef.current && !paidDropdownRef.current.contains(event.target)) {
        setIsPaidDropdownOpen(false);
      }

      if (educationFormDropdownRef.current && !educationFormDropdownRef.current.contains(event.target)) {
        setIsEducationFormDropdownOpen(false);
      }

      if (subjectDropdownRef.current && !subjectDropdownRef.current.contains(event.target)) {
        setIsSubjectDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, []);

  const universityPrograms = programs;
  const subjectOptions = useMemo(() => SUBJECT_OPTIONS, []);
  const educationFormOptions = useMemo(() => EDUCATION_FORM_OPTIONS, []);

  const filteredSubjectOptions = subjectOptions.filter((subject) =>
    subject.toLowerCase().includes(subjectSearchQuery.toLowerCase())
  );

  const currentFiltersSignature = getFiltersSignature(buildProgramsFilters());
  const hasFilterChanges = currentFiltersSignature !== appliedFiltersSignature;

  const filteredPrograms = universityPrograms;
  
  const totalPages = Math.ceil(filteredPrograms.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedPrograms = filteredPrograms.slice(startIndex, startIndex + itemsPerPage);
  
  const handleResetFilters = () => {
    setSearchQuery('');
    setMinBudgetPlaces('');
    setMaxBudgetPlaces('');
    setIsBudgetDropdownOpen(false);
    setMinPassingScore('');
    setMaxPassingScore('');
    setIsScoreDropdownOpen(false);
    setMinPaidPlaces('');
    setMaxPaidPlaces('');
    setIsPaidDropdownOpen(false);
    setSelectedEducationForm('');
    setIsEducationFormDropdownOpen(false);
    setIsSubjectDropdownOpen(false);
    setSubjectSearchQuery('');
    setSelectedSubjects([]);
    fetchPrograms();
  };

  const handleApplyFilters = () => {
    fetchPrograms(buildProgramsFilters());
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
              Всего направлений: {universityPrograms.length}
            </div>
          </div>

          {programsError && (
            <div className={styles.emptyPrograms}>
              ⚠️ {programsError}
            </div>
          )}

          <div className={styles.programsFilters}>
            <div className={styles.searchRow}>
              <input
                type="text"
                className={styles.searchInput}
                placeholder="Название направления..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                }}
              />
            </div>

            <div className={styles.filterGroup}>
              <div className={styles.budgetDropdown} ref={budgetDropdownRef}>
                <button
                  type="button"
                  className={styles.budgetDropdownTrigger}
                  onClick={() => setIsBudgetDropdownOpen((currentState) => !currentState)}
                >
                  <span>
                    {minBudgetPlaces || maxBudgetPlaces
                      ? `Бюджетные места: от ${minBudgetPlaces || '0'} до ${maxBudgetPlaces || '∞'}`
                      : 'Бюджетные места: любое количество'}
                  </span>
                  <span className={styles.budgetDropdownChevron}>
                    {isBudgetDropdownOpen ? '▲' : '▼'}
                  </span>
                </button>

                {isBudgetDropdownOpen && (
                  <div className={styles.budgetDropdownPanel}>
                    <div className={styles.budgetRange}>
                      <input
                        type="number"
                        className={styles.budgetInput}
                        placeholder="от"
                        value={minBudgetPlaces}
                        min="0"
                        step="1"
                        onChange={(e) => {
                          setMinBudgetPlaces(e.target.value);
                        }}
                      />
                      <span className={styles.budgetRangeSeparator}>—</span>
                      <input
                        type="number"
                        className={styles.budgetInput}
                        placeholder="до"
                        value={maxBudgetPlaces}
                        min="0"
                        step="1"
                        onChange={(e) => {
                          setMaxBudgetPlaces(e.target.value);
                        }}
                      />
                    </div>

                    {budgetPlacesValidationError && (
                      <div className={styles.budgetDropdownError}>
                        {budgetPlacesValidationError}
                      </div>
                    )}

                    <div className={styles.budgetDropdownFooter}>
                      <span>
                        {minBudgetPlaces || maxBudgetPlaces
                          ? `От ${minBudgetPlaces || '0'} до ${maxBudgetPlaces || '∞'}`
                          : 'Укажите диапазон бюджетных мест'}
                      </span>
                      <button
                        type="button"
                        className={styles.budgetDropdownClose}
                        disabled={!isBudgetPlacesRangeValid}
                        onClick={() => setIsBudgetDropdownOpen(false)}
                      >
                        Готово
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div className={styles.scoreDropdown} ref={scoreDropdownRef}>
                <button
                  type="button"
                  className={styles.scoreDropdownTrigger}
                  onClick={() => setIsScoreDropdownOpen((currentState) => !currentState)}
                >
                  <span>
                    {minPassingScore || maxPassingScore
                      ? `Проходной балл: от ${minPassingScore || '0'} до ${maxPassingScore || '∞'}`
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
                        placeholder="от"
                        value={minPassingScore}
                        min="0"
                        max={MAX_POSSIBLE_PASING_SCORE}
                        step="1"
                        onChange={(e) => {
                          setMinPassingScore(e.target.value);
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
                          ? `От ${minPassingScore || '0'} до ${maxPassingScore || '∞'}`
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

              <div className={styles.paidDropdown} ref={paidDropdownRef}>
                <button
                  type="button"
                  className={styles.paidDropdownTrigger}
                  onClick={() => setIsPaidDropdownOpen((currentState) => !currentState)}
                >
                  <span>
                    {minPaidPlaces || maxPaidPlaces
                      ? `Платные места: ${minPaidPlaces || '0'}-${maxPaidPlaces || '∞'}`
                      : 'Платные места: любое количество'}
                  </span>
                  <span className={styles.paidDropdownChevron}>
                    {isPaidDropdownOpen ? '▲' : '▼'}
                  </span>
                </button>

                {isPaidDropdownOpen && (
                  <div className={styles.paidDropdownPanel}>
                    <div className={styles.paidRange}>
                      <input
                        type="number"
                        className={styles.paidInput}
                        placeholder="от"
                        value={minPaidPlaces}
                        min="0"
                        step="1"
                        onChange={(e) => {
                          setMinPaidPlaces(e.target.value);
                        }}
                      />
                      <span className={styles.paidRangeSeparator}>—</span>
                      <input
                        type="number"
                        className={styles.paidInput}
                        placeholder="до"
                        value={maxPaidPlaces}
                        min="0"
                        step="1"
                        onChange={(e) => {
                          setMaxPaidPlaces(e.target.value);
                        }}
                      />
                    </div>

                    {paidPlacesValidationError && (
                      <div className={styles.paidDropdownError}>
                        {paidPlacesValidationError}
                      </div>
                    )}

                    <div className={styles.paidDropdownFooter}>
                      <span>
                        {minPaidPlaces || maxPaidPlaces
                          ? `Диапазон: ${minPaidPlaces || '0'}-${maxPaidPlaces || '∞'}`
                          : 'Укажите диапазон платных мест'}
                      </span>
                      <button
                        type="button"
                        className={styles.paidDropdownClose}
                        disabled={!isPaidPlacesRangeValid}
                        onClick={() => setIsPaidDropdownOpen(false)}
                      >
                        Готово
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div className={styles.educationFormDropdown} ref={educationFormDropdownRef}>
                <button
                  type="button"
                  className={styles.educationFormDropdownTrigger}
                  onClick={() => setIsEducationFormDropdownOpen((currentState) => !currentState)}
                >
                  <span>
                    {selectedEducationForm
                      ? `Форма обучения: ${selectedEducationForm}`
                      : 'Форма обучения: любая'}
                  </span>
                  <span className={styles.educationFormDropdownChevron}>
                    {isEducationFormDropdownOpen ? '▲' : '▼'}
                  </span>
                </button>

                {isEducationFormDropdownOpen && (
                  <div className={styles.educationFormDropdownPanel}>
                    <button
                      type="button"
                      className={`${styles.educationFormOption} ${selectedEducationForm === '' ? styles.educationFormOptionActive : ''}`}
                      onClick={() => {
                        setSelectedEducationForm('');
                        setIsEducationFormDropdownOpen(false);
                      }}
                    >
                      Любая форма
                    </button>

                    {educationFormOptions.map((form) => (
                      <button
                        key={form}
                        type="button"
                        className={`${styles.educationFormOption} ${selectedEducationForm === form ? styles.educationFormOptionActive : ''}`}
                        onClick={() => {
                          setSelectedEducationForm(form);
                          setIsEducationFormDropdownOpen(false);
                        }}
                      >
                        {form}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className={styles.subjectDropdown} ref={subjectDropdownRef}>
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
              <button
                onClick={handleApplyFilters}
                className={styles.applyFiltersBtn}
                disabled={!hasFilterChanges || !isBudgetPlacesRangeValid || !isScoreRangeValid || !isPaidPlacesRangeValid || programsLoading}
              >
                {programsLoading ? 'Поиск...' : 'Применить'}
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
                  <span>Предметы</span>
                  <span></span>
                </div>

                {paginatedPrograms.map(program => {
                  const subjectBadges = getProgramSubjectBadges(program);

                  return (
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
                      <div className={styles.programSubjects}>
                        {subjectBadges.length > 0 ? (
                          subjectBadges.map((subjectBadge) => (
                            <span
                              key={subjectBadge.key}
                              className={styles.subjectBadge}
                              title={subjectBadge.full}
                              aria-label={subjectBadge.full}
                            >
                              {subjectBadge.abbr}
                            </span>
                          ))
                        ) : (
                          '—'
                        )}
                      </div>
                      <div className={styles.programLink}>→</div>
                    </div>
                  );
                })}
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