import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './UniversitiesPage.module.css';
import { getUniversities } from '../services/api';

const getFiltersSignature = (filters) => JSON.stringify(filters);

const UniversitiesPage = () => {
  const navigate = useNavigate();
  
  const [universities, setUniversities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [dormitory, setDormitory] = useState('');
  const [militaryDept, setMilitaryDept] = useState('');
  const [minRating, setMinRating] = useState('');
  const [maxRating, setMaxRating] = useState('');
  const [minProgramsCount, setMinProgramsCount] = useState('');
  const [maxProgramsCount, setMaxProgramsCount] = useState('');
  const [isCityDropdownOpen, setIsCityDropdownOpen] = useState(false);
  const [isRatingDropdownOpen, setIsRatingDropdownOpen] = useState(false);
  const [isProgramsDropdownOpen, setIsProgramsDropdownOpen] = useState(false);
  const [isDormitoryDropdownOpen, setIsDormitoryDropdownOpen] = useState(false);
  const [isMilitaryDeptDropdownOpen, setIsMilitaryDeptDropdownOpen] = useState(false);
  const [sortBy, setSortBy] = useState('rating_desc');
  const [appliedFiltersSignature, setAppliedFiltersSignature] = useState(getFiltersSignature({}));

  const ratingDropdownRef = useRef(null);
  const programsDropdownRef = useRef(null);
  const dormitoryDropdownRef = useRef(null);
  const militaryDeptDropdownRef = useRef(null);

  const ratingValidationError = useMemo(() => {
    const minValue = minRating === '' ? null : Number(minRating);
    const maxValue = maxRating === '' ? null : Number(maxRating);

    if (minValue !== null && (!Number.isFinite(minValue) || minValue < 0 || minValue > 5)) {
      return 'Минимальный рейтинг должен быть в диапазоне от 0 до 5';
    }

    if (maxValue !== null && (!Number.isFinite(maxValue) || maxValue < 0 || maxValue > 5)) {
      return 'Максимальный рейтинг должен быть в диапазоне от 0 до 5';
    }

    if (minValue !== null && maxValue !== null && maxValue < minValue) {
      return 'Максимальный рейтинг должен быть больше или равен минимальному';
    }

    return '';
  }, [maxRating, minRating]);

  const programsCountValidationError = useMemo(() => {
    const minValue = minProgramsCount === '' ? null : Number(minProgramsCount);
    const maxValue = maxProgramsCount === '' ? null : Number(maxProgramsCount);

    if (minValue !== null && (!Number.isFinite(minValue) || minValue < 0)) {
      return 'Минимальное количество направлений не может быть отрицательным';
    }

    if (maxValue !== null && (!Number.isFinite(maxValue) || maxValue < 0)) {
      return 'Максимальное количество направлений не может быть отрицательным';
    }

    if (minValue !== null && maxValue !== null && maxValue < minValue) {
      return 'Максимум направлений должен быть больше или равен минимуму';
    }

    return '';
  }, [maxProgramsCount, minProgramsCount]);

  const isRatingRangeValid = !ratingValidationError;
  const isProgramsCountRangeValid = !programsCountValidationError;

  const buildUniversitiesFilters = () => {
    const filters = {};

    if (searchQuery.trim()) {
      filters.name = searchQuery.trim();
    }

    if (selectedCity.trim()) {
      filters.city = selectedCity.trim();
    }

    if (dormitory) {
      filters.has_dormitory = dormitory === 'yes';
    }

    if (militaryDept) {
      filters.military_dept = militaryDept === 'yes';
    }

    if (isRatingRangeValid && minRating !== '') {
      filters.min_rating = Number(minRating);
    }

    if (isRatingRangeValid && maxRating !== '') {
      filters.max_rating = Number(maxRating);
    }

    if (isProgramsCountRangeValid && minProgramsCount !== '') {
      filters.min_programs_count = Number(minProgramsCount);
    }

    if (isProgramsCountRangeValid && maxProgramsCount !== '') {
      filters.max_programs_count = Number(maxProgramsCount);
    }

    return filters;
  };

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  
  const cities = [...new Set(universities.map((uni) => uni.city))];
  const cityOptions = cities.filter((city) => city.toLowerCase().includes(selectedCity.toLowerCase()));
  
  const sortedUniversities = [...universities].sort((a, b) => {
    switch (sortBy) {
      case 'rating_asc':
        return a.rating - b.rating;
      case 'rating_desc':
        return b.rating - a.rating;
      case 'name_asc':
        return a.name.localeCompare(b.name, 'ru');
      case 'name_desc':
        return b.name.localeCompare(a.name, 'ru');
      case 'city_asc':
        return a.city.localeCompare(b.city, 'ru');
      case 'city_desc':
        return b.city.localeCompare(a.city, 'ru');
      default:
        return 0;
    }
  });
  
  const totalPages = Math.ceil(sortedUniversities.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedUniversities = sortedUniversities.slice(startIndex, startIndex + itemsPerPage);

  const currentFiltersSignature = getFiltersSignature(buildUniversitiesFilters());
  const hasFilterChanges = currentFiltersSignature !== appliedFiltersSignature;

  const fetchUniversities = async (filters = {}) => {
    try {
      setLoading(true);
      setError(null);
      const data = await getUniversities(filters);
      const transformedData = data.map(uni => ({
        id: uni._id,
        name: uni.name,
        city: uni.city,
        rating: uni.rating || 0,
        hasDormitory: uni.has_dormitory || false,
        militaryDept: uni.military_dept || false,
        programsCount: uni.programs_count || 0
      }));
      setUniversities(transformedData);
      setAppliedFiltersSignature(getFiltersSignature(filters));
      setCurrentPage(1);
    } catch (err) {
      setError(err.message || 'Ошибка при загрузке данных');
      console.error('Ошибка загрузки университетов:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUniversities();
  }, []);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (ratingDropdownRef.current && !ratingDropdownRef.current.contains(event.target)) {
        setIsRatingDropdownOpen(false);
      }

      if (programsDropdownRef.current && !programsDropdownRef.current.contains(event.target)) {
        setIsProgramsDropdownOpen(false);
      }

      if (dormitoryDropdownRef.current && !dormitoryDropdownRef.current.contains(event.target)) {
        setIsDormitoryDropdownOpen(false);
      }

      if (militaryDeptDropdownRef.current && !militaryDeptDropdownRef.current.contains(event.target)) {
        setIsMilitaryDeptDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, []);

  const handleApplyFilters = () => {
    fetchUniversities(buildUniversitiesFilters());
  };
  
  const handleReset = () => {
    setSearchQuery('');
    setSelectedCity('');
    setDormitory('');
    setMilitaryDept('');
    setMinRating('');
    setMaxRating('');
    setMinProgramsCount('');
    setMaxProgramsCount('');
    setIsCityDropdownOpen(false);
    setIsRatingDropdownOpen(false);
    setIsProgramsDropdownOpen(false);
    setIsDormitoryDropdownOpen(false);
    setIsMilitaryDeptDropdownOpen(false);
    setSortBy('rating_desc');
    setCurrentPage(1);
    fetchUniversities({});
  };

  const handleSortChange = (e) => {
    setSortBy(e.target.value);
    setCurrentPage(1);
  };
  
  const handleUniversityClick = (id) => {
    navigate(`/universities/${id}`);
  };
  
  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <div className={styles.screenTitle}>🔍 Поиск вузов</div>
        
        {loading && (
          <div className={styles.message} style={{ textAlign: 'center', padding: '40px' }}>
            ⏳ Загрузка данных...
          </div>
        )}
        
        {error && (
          <div className={styles.message} style={{ textAlign: 'center', padding: '40px', color: '#d32f2f' }}>
            ❌ Ошибка: {error}
          </div>
        )}
        
        {!loading && !error && (
          <>
        <div className={styles.searchCard}>
          <div className={styles.searchRow}>
            <input
              type="text"
              className={styles.searchInput}
              placeholder="Название вуза"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
              }}
            />
          </div>
          
          <div className={styles.filterGroup}>
            <div className={styles.citySearchBlock}>
              <div className={styles.cityInputWrap}>
                <input
                  id="city-search-input"
                  type="text"
                  className={`${styles.filterSelect} ${styles.citySearchInput}`}
                  placeholder="📍 Город: начните вводить"
                  value={selectedCity}
                  onFocus={() => setIsCityDropdownOpen(true)}
                  onBlur={() => {
                    setTimeout(() => setIsCityDropdownOpen(false), 120);
                  }}
                  onChange={(e) => {
                    setSelectedCity(e.target.value);
                    setIsCityDropdownOpen(true);
                  }}
                />
                {isCityDropdownOpen && (
                  <div className={styles.cityOptions}>
                    {cityOptions.length > 0 ? (
                      cityOptions.slice(0, 7).map((city) => (
                        <button
                          key={city}
                          type="button"
                          className={styles.cityOption}
                          onMouseDown={() => {
                            setSelectedCity(city);
                            setIsCityDropdownOpen(false);
                          }}
                        >
                          {city}
                        </button>
                      ))
                    ) : (
                      <div className={styles.cityOptionsEmpty}>
                        По вашему запросу город не найден
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
            
            <div className={styles.dormitoryDropdown} ref={dormitoryDropdownRef}>
              <button
                type="button"
                className={styles.dormitoryDropdownTrigger}
                onClick={() => setIsDormitoryDropdownOpen((currentState) => !currentState)}
              >
                <span>
                  {dormitory === 'yes'
                    ? '🏠 Общежитие: Есть'
                    : dormitory === 'no'
                    ? '🏠 Общежитие: Нет'
                    : '🏠 Общежитие: не важно'}
                </span>
                <span className={styles.dormitoryDropdownChevron}>
                  {isDormitoryDropdownOpen ? '▲' : '▼'}
                </span>
              </button>

              {isDormitoryDropdownOpen && (
                <div className={styles.dormitoryDropdownPanel}>
                  <div className={styles.optionsGroup}>
                    <button
                      type="button"
                      className={`${styles.optionButton} ${dormitory === '' ? styles.optionButtonActive : ''}`}
                      onClick={() => {
                        setDormitory('');
                        setIsDormitoryDropdownOpen(false);
                      }}
                    >
                      не важно
                    </button>
                    <button
                      type="button"
                      className={`${styles.optionButton} ${dormitory === 'yes' ? styles.optionButtonActive : ''}`}
                      onClick={() => {
                        setDormitory('yes');
                        setIsDormitoryDropdownOpen(false);
                      }}
                    >
                      есть
                    </button>
                    <button
                      type="button"
                      className={`${styles.optionButton} ${dormitory === 'no' ? styles.optionButtonActive : ''}`}
                      onClick={() => {
                        setDormitory('no');
                        setIsDormitoryDropdownOpen(false);
                      }}
                    >
                      нет
                    </button>
                  </div>
                </div>
              )}
            </div>
            
            <div className={styles.militaryDeptDropdown} ref={militaryDeptDropdownRef}>
              <button
                type="button"
                className={styles.militaryDeptDropdownTrigger}
                onClick={() => setIsMilitaryDeptDropdownOpen((currentState) => !currentState)}
              >
                <span>
                  {militaryDept === 'yes'
                    ? '⚔️ Военная кафедра: Есть'
                    : militaryDept === 'no'
                    ? '⚔️ Военная кафедра: Нет'
                    : '⚔️ Военная кафедра: не важно'}
                </span>
                <span className={styles.militaryDeptDropdownChevron}>
                  {isMilitaryDeptDropdownOpen ? '▲' : '▼'}
                </span>
              </button>

              {isMilitaryDeptDropdownOpen && (
                <div className={styles.militaryDeptDropdownPanel}>
                  <div className={styles.optionsGroup}>
                    <button
                      type="button"
                      className={`${styles.optionButton} ${militaryDept === '' ? styles.optionButtonActive : ''}`}
                      onClick={() => {
                        setMilitaryDept('');
                        setIsMilitaryDeptDropdownOpen(false);
                      }}
                    >
                      не важно
                    </button>
                    <button
                      type="button"
                      className={`${styles.optionButton} ${militaryDept === 'yes' ? styles.optionButtonActive : ''}`}
                      onClick={() => {
                        setMilitaryDept('yes');
                        setIsMilitaryDeptDropdownOpen(false);
                      }}
                    >
                      есть
                    </button>
                    <button
                      type="button"
                      className={`${styles.optionButton} ${militaryDept === 'no' ? styles.optionButtonActive : ''}`}
                      onClick={() => {
                        setMilitaryDept('no');
                        setIsMilitaryDeptDropdownOpen(false);
                      }}
                    >
                      нет
                    </button>
                  </div>
                </div>
              )}
            </div>
            
            <button onClick={handleReset} className={styles.resetBtn}>
              Сбросить
            </button>

            <div className={styles.ratingDropdown} ref={ratingDropdownRef}>
              <button
                type="button"
                className={styles.ratingDropdownTrigger}
                onClick={() => setIsRatingDropdownOpen((currentState) => !currentState)}
              >
                <span>
                  {minRating || maxRating
                    ? `⭐ Рейтинг: от ${minRating || '0'} до ${maxRating || '5'}`
                    : '⭐ Рейтинг: любой'}
                </span>
                <span className={styles.ratingDropdownChevron}>
                  {isRatingDropdownOpen ? '▲' : '▼'}
                </span>
              </button>

              {isRatingDropdownOpen && (
                <div className={styles.ratingDropdownPanel}>
                  <div className={styles.rangeGrid}>
                    <input
                      type="number"
                      className={styles.rangeInput}
                      placeholder="от"
                      value={minRating}
                      min="0"
                      max="5"
                      step="0.1"
                      onChange={(e) => setMinRating(e.target.value)}
                    />
                    <span className={styles.rangeSeparator}>—</span>
                    <input
                      type="number"
                      className={styles.rangeInput}
                      placeholder="до"
                      value={maxRating}
                      min="0"
                      max="5"
                      step="0.1"
                      onChange={(e) => setMaxRating(e.target.value)}
                    />
                  </div>

                  {ratingValidationError && (
                    <div className={styles.dropdownError}>{ratingValidationError}</div>
                  )}

                  <div className={styles.dropdownFooter}>
                    <span>
                      {minRating || maxRating
                        ? `От ${minRating || '0'} до ${maxRating || '5'}`
                        : 'Укажите диапазон рейтинга'}
                    </span>
                    <button
                      type="button"
                      className={styles.dropdownClose}
                      disabled={!isRatingRangeValid}
                      onClick={() => setIsRatingDropdownOpen(false)}
                    >
                      Готово
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className={styles.programsDropdown} ref={programsDropdownRef}>
              <button
                type="button"
                className={styles.programsDropdownTrigger}
                onClick={() => setIsProgramsDropdownOpen((currentState) => !currentState)}
              >
                <span>
                  {minProgramsCount || maxProgramsCount
                    ? `📚 Направлений: от ${minProgramsCount || '0'} до ${maxProgramsCount || '∞'}`
                    : '📚 Направлений: любое количество'}
                </span>
                <span className={styles.programsDropdownChevron}>
                  {isProgramsDropdownOpen ? '▲' : '▼'}
                </span>
              </button>

              {isProgramsDropdownOpen && (
                <div className={styles.programsDropdownPanel}>
                  <div className={styles.rangeGrid}>
                    <input
                      type="number"
                      className={styles.rangeInput}
                      placeholder="от"
                      value={minProgramsCount}
                      min="0"
                      step="1"
                      onChange={(e) => setMinProgramsCount(e.target.value)}
                    />
                    <span className={styles.rangeSeparator}>—</span>
                    <input
                      type="number"
                      className={styles.rangeInput}
                      placeholder="до"
                      value={maxProgramsCount}
                      min="0"
                      step="1"
                      onChange={(e) => setMaxProgramsCount(e.target.value)}
                    />
                  </div>

                  {programsCountValidationError && (
                    <div className={styles.dropdownError}>{programsCountValidationError}</div>
                  )}

                  <div className={styles.dropdownFooter}>
                    <span>
                      {minProgramsCount || maxProgramsCount
                        ? `От ${minProgramsCount || '0'} до ${maxProgramsCount || '∞'}`
                        : 'Укажите диапазон количества направлений'}
                    </span>
                    <button
                      type="button"
                      className={styles.dropdownClose}
                      disabled={!isProgramsCountRangeValid}
                      onClick={() => setIsProgramsDropdownOpen(false)}
                    >
                      Готово
                    </button>
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={handleApplyFilters}
              className={styles.applyBtn}
              disabled={!hasFilterChanges || !isRatingRangeValid || !isProgramsCountRangeValid || loading}
            >
              {loading ? 'Поиск...' : 'Применить'}
            </button>
          </div>
        </div>
        
        <div className={styles.resultBar}>
          <span className={styles.resultCount}>
            📌 Найдено вузов: {sortedUniversities.length}
          </span>
          <select className={styles.sortSelect} value={sortBy} onChange={handleSortChange}>
            <option value="rating_desc">Рейтинг: по убыванию</option>
            <option value="rating_asc">Рейтинг: по возрастанию</option>
            <option value="name_asc">Название: А-Я</option>
            <option value="name_desc">Название: Я-А</option>
            <option value="city_asc">Город: А-Я</option>
            <option value="city_desc">Город: Я-А</option>
          </select>
        </div>
        
        {sortedUniversities.length === 0 ? (
          <div className={styles.message} style={{ textAlign: 'center', padding: '40px' }}>
            📭 По вашему запросу вузы не найдены
          </div>
        ) : (
          <>
            <div className={styles.universitiesList}>
              {paginatedUniversities.map(uni => (
                <div
                  key={uni.id}
                  className={styles.universityCard}
                  onClick={() => handleUniversityClick(uni.id)}
                >
                  <div className={styles.uniName}>{uni.name}</div>
                  <div className={styles.uniRating}>⭐ {uni.rating}</div>
                  <div className={styles.uniCity}>{uni.city}</div>
                  <div className={styles.uniStats}>
                    <span className={styles.uniDorm}>
                      {uni.hasDormitory ? 'общежитие ✓' : 'общежития нет'}
                    </span>
                    {uni.militaryDept && (
                      <span className={styles.uniMilitary}>⚔️ военная кафедра</span>
                    )}
                  </div>
                  <div className={styles.uniPrograms}>
                    {uni.programsCount} направлений
                  </div>
                </div>
              ))}
            </div>

            {totalPages > 1 && (
              <div className={styles.pagination}>
                <span className={styles.paginationInfo}>
                  {startIndex + 1}-{Math.min(startIndex + itemsPerPage, sortedUniversities.length)} из {sortedUniversities.length}
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
          </>
        )}
      </div>
    </div>
  );
};

export default UniversitiesPage;