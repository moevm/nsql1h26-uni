import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './UniversitiesPage.module.css';

const mockUniversities = [
  {
    id: '1',
    name: 'МГУ им. Ломоносова',
    city: 'Москва',
    rating: 4.9,
    hasDormitory: true,
    militaryDept: true,
    programsCount: 128
  },
  {
    id: '2',
    name: 'МФТИ (Физтех)',
    city: 'Долгопрудный',
    rating: 4.8,
    hasDormitory: true,
    militaryDept: true,
    programsCount: 85
  },
  {
    id: '3',
    name: 'НИУ ВШЭ',
    city: 'Москва',
    rating: 4.7,
    hasDormitory: true,
    militaryDept: false,
    programsCount: 156
  },
  {
    id: '4',
    name: 'МГТУ им. Баумана',
    city: 'Москва',
    rating: 4.6,
    hasDormitory: true,
    militaryDept: true,
    programsCount: 112
  },
  {
    id: '5',
    name: 'СПбГУ',
    city: 'Санкт-Петербург',
    rating: 4.7,
    hasDormitory: true,
    militaryDept: false,
    programsCount: 98
  },
  {
    id: '6',
    name: 'НГУ',
    city: 'Новосибирск',
    rating: 4.5,
    hasDormitory: true,
    militaryDept: false,
    programsCount: 67
  }
];

const UniversitiesPage = () => {
  const navigate = useNavigate();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [dormitory, setDormitory] = useState('');
  const [militaryDept, setMilitaryDept] = useState('');
  const [isCityDropdownOpen, setIsCityDropdownOpen] = useState(false);
  const [sortBy, setSortBy] = useState('rating_desc');
  
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  
  const cities = [...new Set(mockUniversities.map((uni) => uni.city))];
  const cityOptions = cities.filter((city) => city.toLowerCase().includes(selectedCity.toLowerCase()));
  
  const filteredUniversities = mockUniversities.filter(uni => {
    if (searchQuery && !uni.name.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    if (selectedCity && !uni.city.toLowerCase().includes(selectedCity.toLowerCase())) {
      return false;
    }
    if (dormitory && uni.hasDormitory !== (dormitory === 'yes')) {
      return false;
    }
    if (militaryDept && uni.militaryDept !== (militaryDept === 'yes')) {
      return false;
    }
    return true;
  });

  const sortedUniversities = [...filteredUniversities].sort((a, b) => {
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
  
  const handleReset = () => {
    setSearchQuery('');
    setSelectedCity('');
    setDormitory('');
    setMilitaryDept('');
    setIsCityDropdownOpen(false);
    setSortBy('rating_desc');
    setCurrentPage(1);
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
        
        <div className={styles.searchCard}>
          <div className={styles.searchRow}>
            <input
              type="text"
              className={styles.searchInput}
              placeholder="Название вуза"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
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
                    setCurrentPage(1);
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
                            setCurrentPage(1);
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
            
            <select
              className={styles.filterSelect}
              value={dormitory}
              onChange={(e) => {
                setDormitory(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="">🏠 Общежитие: не важно</option>
              <option value="yes">🏠 Общежитие: Есть</option>
              <option value="no">🏠 Общежитие: Нет</option>
            </select>
            
            <select
              className={styles.filterSelect}
              value={militaryDept}
              onChange={(e) => {
                setMilitaryDept(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="">⚔️ Военная кафедра: не важно</option>
              <option value="yes">⚔️ Военная кафедра: Есть</option>
              <option value="no">⚔️ Военная кафедра: Нет</option>
            </select>
            
            <button onClick={handleReset} className={styles.resetBtn}>
              Сбросить
            </button>
          </div>
        </div>
        
        <div className={styles.resultBar}>
          <span className={styles.resultCount}>
            📌 Найдено вузов: {filteredUniversities.length}
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
        
        <div className={styles.progressLine}>
          <div className={styles.progressFill} style={{ width: '60%' }}></div>
        </div>
        <div className={styles.loadingStatus}>загрузка данных...</div>
      </div>
    </div>
  );
};

export default UniversitiesPage;