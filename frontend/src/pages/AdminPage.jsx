import React, { useState, useEffect } from 'react';
import styles from './AdminPage.module.css';
import { createProgram, createUniversity, getPrograms, getUniversities } from '../services/api';
import { getAdminSession } from '../services/auth';

const PHONE_REGEX = /^\+?[0-9()\-\s]{7,20}$/;
const FORM_OF_EDUCATION_OPTIONS = ['Очная', 'Очно-заочная', 'Заочная'];
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

const INITIAL_PROGRAM_FORM = {
  university_id: '',
  code: '',
  name: '',
  budget_places: '',
  paid_places: '',
  passing_score: '',
  form_of_education: '',
  required_subjects: [],
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
  const [programSearchQuery, setProgramSearchQuery] = useState('');
  const [currentProgramPage, setCurrentProgramPage] = useState(1);
  const [isAddUniversityOpen, setIsAddUniversityOpen] = useState(false);
  const [universityForm, setUniversityForm] = useState(INITIAL_UNIVERSITY_FORM);
  const [isAddProgramOpen, setIsAddProgramOpen] = useState(false);
  const [programForm, setProgramForm] = useState(INITIAL_PROGRAM_FORM);
  const [programUniversitySearch, setProgramUniversitySearch] = useState('');
  const [isProgramUniversityDropdownOpen, setIsProgramUniversityDropdownOpen] = useState(false);
  const [activeSubjectDropdownIndex, setActiveSubjectDropdownIndex] = useState(null);
  const [programSubmitLoading, setProgramSubmitLoading] = useState(false);
  const [programSubmitError, setProgramSubmitError] = useState(null);
  const [programs, setPrograms] = useState([]);
  const [programsLoading, setProgramsLoading] = useState(true);
  const [programsError, setProgramsError] = useState(null);
  const itemsPerPage = 4;
  const programItemsPerPage = 4;

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
    fetchPrograms();
  }, []);

  const fetchPrograms = async () => {
    try {
      setProgramsLoading(true);
      setProgramsError(null);
      const data = await getPrograms();
      const transformedData = data.map((program) => ({
        id: program._id,
        universityId: program.university_id,
        code: program.code || '-',
        name: program.name || 'Без названия',
        form: program.form_of_education || '-',
        passingScore: program.passing_score ?? 0,
        budgetPlaces: program.budget_places ?? 0,
        paidPlaces: program.paid_places ?? 0,
        updatedAt: program.updatedAt ? new Date(program.updatedAt).toLocaleDateString('ru-RU') : '-',
      }));
      setPrograms(transformedData);
    } catch (err) {
      setProgramsError(err.message || 'Ошибка при загрузке направлений');
      console.error('Ошибка загрузки направлений:', err);
    } finally {
      setProgramsLoading(false);
    }
  };

  const filteredUniversities = universities.filter(uni =>
    uni.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getUniversityNameById = (universityId) => {
    const university = universities.find((item) => item.id === universityId);
    return university?.name || 'Неизвестный вуз';
  };

  const filteredPrograms = programs.filter((program) => {
    const query = programSearchQuery.trim().toLowerCase();
    if (!query) {
      return true;
    }

    const universityName = getUniversityNameById(program.universityId).toLowerCase();
    return (
      program.name.toLowerCase().includes(query)
      || program.code.toLowerCase().includes(query)
      || universityName.includes(query)
    );
  });

  const totalPages = Math.ceil(filteredUniversities.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedUniversities = filteredUniversities.slice(startIndex, startIndex + itemsPerPage);
  const totalProgramPages = Math.ceil(filteredPrograms.length / programItemsPerPage);
  const programStartIndex = (currentProgramPage - 1) * programItemsPerPage;
  const paginatedPrograms = filteredPrograms.slice(programStartIndex, programStartIndex + programItemsPerPage);

  const handleEditUniversity = (id) => {
    console.log('Редактирование вуза:', id);
    // TODO: Реализовать редактирование
  };

  const handleDeleteUniversity = (id) => {
    console.log('Удаление вуза:', id);
    // TODO: Реализовать удаление
  };

  const handleEditProgram = (id) => {
    console.log('Редактирование направления:', id);
    // TODO: Реализовать редактирование
  };

  const handleDeleteProgram = (id) => {
    console.log('Удаление направления:', id);
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

  const handleOpenAddProgram = () => {
    setProgramSubmitError(null);
    setProgramUniversitySearch('');
    setIsProgramUniversityDropdownOpen(false);
    setProgramForm(INITIAL_PROGRAM_FORM);
    setIsAddProgramOpen(true);
  };

  const handleCloseAddProgram = () => {
    setIsAddProgramOpen(false);
    setProgramSubmitError(null);
    setProgramUniversitySearch('');
    setIsProgramUniversityDropdownOpen(false);
    setActiveSubjectDropdownIndex(null);
    setProgramForm(INITIAL_PROGRAM_FORM);
  };

  const handleProgramFormChange = (field, value) => {
    setProgramForm(prev => ({ ...prev, [field]: value }));
  };

  const programUniversityOptions = universities.filter((uni) =>
    uni.name.toLowerCase().includes(programUniversitySearch.trim().toLowerCase())
  );

  const handleProgramUniversitySearchChange = (value) => {
    setProgramUniversitySearch(value);
    setProgramForm((prev) => ({ ...prev, university_id: '' }));
    setIsProgramUniversityDropdownOpen(true);
  };

  const handleProgramUniversitySelect = (university) => {
    setProgramUniversitySearch(university.name);
    setProgramForm((prev) => ({ ...prev, university_id: university.id }));
    setIsProgramUniversityDropdownOpen(false);
  };

  const handleAddProgramSubject = () => {
    setProgramForm((prev) => ({
      ...prev,
      required_subjects: [
        ...prev.required_subjects,
        { subject: '', minimum_points: '', search: '' },
      ],
    }));
  };

  const handleRemoveProgramSubject = (index) => {
    setProgramForm((prev) => ({
      ...prev,
      required_subjects: prev.required_subjects.filter((_, itemIndex) => itemIndex !== index),
    }));
  };

  const handleProgramSubjectChange = (index, field, value) => {
    setProgramForm((prev) => ({
      ...prev,
      required_subjects: prev.required_subjects.map((item, itemIndex) =>
        itemIndex === index
          ? {
              ...item,
              [field]: value,
              ...(field === 'search' ? { subject: '' } : {}),
            }
          : item
      ),
    }));

    if (field === 'search') {
      setActiveSubjectDropdownIndex(index);
    }
  };

  const handleProgramSubjectSelect = (index, subject) => {
    setProgramForm((prev) => ({
      ...prev,
      required_subjects: prev.required_subjects.map((item, itemIndex) =>
        itemIndex === index
          ? {
              ...item,
              subject,
              search: subject,
            }
          : item
      ),
    }));
    setActiveSubjectDropdownIndex(null);
  };

  const handleCreateProgram = async (event) => {
    event.preventDefault();
    setProgramSubmitError(null);

    const adminSession = getAdminSession();
    if (!adminSession?.adminId) {
      setProgramSubmitError('Сессия администратора не найдена. Войдите снова.');
      return;
    }

    const requiredFields = [
      programForm.university_id,
      programForm.code,
      programForm.name,
      programForm.budget_places,
      programForm.paid_places,
      programForm.passing_score,
      programForm.form_of_education,
    ];

    if (requiredFields.some((value) => String(value).trim() === '')) {
      setProgramSubmitError('Заполните все обязательные поля направления.');
      return;
    }

    const budgetPlaces = Number.parseInt(programForm.budget_places, 10);
    const paidPlaces = Number.parseInt(programForm.paid_places, 10);
    const passingScore = Number.parseInt(programForm.passing_score, 10);

    if ([budgetPlaces, paidPlaces, passingScore].some((value) => Number.isNaN(value) || value < 0)) {
      setProgramSubmitError('Количество мест и проходной балл должны быть целыми неотрицательными числами.');
      return;
    }

    if (programForm.required_subjects.length === 0) {
      setProgramSubmitError('Добавьте хотя бы один предмет.');
      return;
    }

    const subjects = {};
    for (const item of programForm.required_subjects) {
      const subjectName = item.subject.trim();
      const minimumPoints = Number.parseInt(item.minimum_points, 10);

      if (!subjectName) {
        setProgramSubmitError('Выберите предмет для каждой добавленной строки.');
        return;
      }

      if (Number.isNaN(minimumPoints) || minimumPoints < 0 || minimumPoints > 100) {
        setProgramSubmitError(`Укажите корректный минимальный балл от 0 до 100 для предмета "${subjectName}".`);
        return;
      }

      if (subjects[subjectName] !== undefined) {
        setProgramSubmitError(`Предмет "${subjectName}" добавлен несколько раз.`);
        return;
      }

      subjects[subjectName] = minimumPoints;
    }

    if (Object.keys(subjects).length === 0) {
      setProgramSubmitError('Добавьте хотя бы один предмет с минимальным баллом.');
      return;
    }

    try {
      setProgramSubmitLoading(true);
      await createProgram(
        {
          university_id: programForm.university_id,
          code: programForm.code.trim(),
          name: programForm.name.trim(),
          budget_places: budgetPlaces,
          paid_places: paidPlaces,
          passing_score: passingScore,
          form_of_education: programForm.form_of_education,
          required_subjects: subjects,
          comment: programForm.comment.trim() || null,
        },
        adminSession.adminId
      );

      handleCloseAddProgram();
      await fetchPrograms();
      await fetchUniversities();
      setCurrentProgramPage(1);
    } catch (requestError) {
      setProgramSubmitError(requestError.message || 'Не удалось создать направление');
    } finally {
      setProgramSubmitLoading(false);
    }
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
            <button className={styles.addBtn} onClick={handleOpenAddProgram}>
              + Добавить направление
            </button>
          </div>

          <input
            className={styles.searchInput}
            placeholder="Поиск направления..."
            value={programSearchQuery}
            onChange={(e) => {
              setProgramSearchQuery(e.target.value);
              setCurrentProgramPage(1);
            }}
          />

          {programsLoading && (
            <div style={{ textAlign: 'center', padding: '30px', color: '#64748b' }}>
              ⏳ Загрузка направлений...
            </div>
          )}

          {programsError && (
            <div style={{ textAlign: 'center', padding: '30px', color: '#d32f2f' }}>
              ❌ {programsError}
            </div>
          )}

          {!programsLoading && !programsError && filteredPrograms.length === 0 && (
            <div style={{ textAlign: 'center', padding: '30px', color: '#64748b' }}>
              📭 Направления не найдены
            </div>
          )}

          {!programsLoading && !programsError && filteredPrograms.length > 0 && (
            <>
              <div className={styles.programTableHeader}>
                <span>Код</span>
                <span>Название</span>
                <span>Вуз</span>
                <span>Форма</span>
                <span>Балл</span>
                <span>Места (б/п)</span>
                <span>Изменен</span>
                <span>Действия</span>
              </div>

              {paginatedPrograms.map((program) => (
                <div key={program.id} className={styles.programRow}>
                  <span>{program.code}</span>
                  <span>{program.name}</span>
                  <span>{getUniversityNameById(program.universityId)}</span>
                  <span>{program.form}</span>
                  <span>{program.passingScore}</span>
                  <span>{program.budgetPlaces}/{program.paidPlaces}</span>
                  <span>{program.updatedAt}</span>
                  <div className={styles.actionBtns}>
                    <button
                      className={styles.actionBtn}
                      onClick={() => handleEditProgram(program.id)}
                      title="Редактировать"
                    >
                      ✎
                    </button>
                    <button
                      className={styles.actionBtn}
                      onClick={() => handleDeleteProgram(program.id)}
                      title="Удалить"
                    >
                      🗑
                    </button>
                  </div>
                </div>
              ))}

              {totalProgramPages > 1 && (
                <div className={styles.pagination}>
                  <span style={{ color: '#4b637a' }}>
                    {programStartIndex + 1}-{Math.min(programStartIndex + programItemsPerPage, filteredPrograms.length)} из {filteredPrograms.length}
                  </span>
                  <div className={styles.pageNumbers}>
                    {Array.from({ length: Math.min(totalProgramPages, 5) }, (_, i) => i + 1).map(page => (
                      <button
                        key={page}
                        className={`${styles.pageBtn} ${currentProgramPage === page ? styles.active : ''}`}
                        onClick={() => setCurrentProgramPage(page)}
                      >
                        {page}
                      </button>
                    ))}
                    {totalProgramPages > 5 && (
                      <>
                        <span className={styles.dots}>⋯</span>
                        <button
                          className={styles.pageBtn}
                          onClick={() => setCurrentProgramPage(totalProgramPages)}
                        >
                          {totalProgramPages}
                        </button>
                      </>
                    )}
                    <button
                      className={styles.pageBtn}
                      onClick={() => setCurrentProgramPage(Math.min(currentProgramPage + 1, totalProgramPages))}
                      disabled={currentProgramPage === totalProgramPages}
                    >
                      →
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {isAddProgramOpen && (
          <div className={styles.modalOverlay} onClick={handleCloseAddProgram}>
            <div className={styles.modal} onClick={(event) => event.stopPropagation()}>
              <div className={styles.modalHeader}>
                <h4>Добавить направление</h4>
                <button
                  type="button"
                  className={styles.closeBtn}
                  onClick={handleCloseAddProgram}
                  aria-label="Закрыть"
                >
                  ✕
                </button>
              </div>

              <form className={styles.modalForm} onSubmit={handleCreateProgram}>
                <div className={styles.requiredHint}>Поля со * обязательны для заполнения</div>

                <div className={styles.autocompleteWrapper}>
                  <label className={styles.formField}>
                    <span>Вуз *</span>
                    <input
                      type="text"
                      value={programUniversitySearch}
                      onChange={(e) => handleProgramUniversitySearchChange(e.target.value)}
                      onFocus={() => setIsProgramUniversityDropdownOpen(true)}
                      onBlur={() => setTimeout(() => setIsProgramUniversityDropdownOpen(false), 120)}
                      placeholder="Начните вводить название вуза..."
                      required
                      disabled={programSubmitLoading}
                    />
                  </label>

                  {isProgramUniversityDropdownOpen && programUniversitySearch.trim() !== '' && (
                    <div className={styles.autocompleteList}>
                      {programUniversityOptions.length === 0 && (
                        <div className={styles.autocompleteEmpty}>Ничего не найдено</div>
                      )}
                      {programUniversityOptions.map((uni) => (
                        <button
                          type="button"
                          key={uni.id}
                          className={styles.autocompleteItem}
                          onMouseDown={() => handleProgramUniversitySelect(uni)}
                        >
                          {uni.name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div className={styles.formGrid}>
                  <label className={styles.formField}>
                    <span>Код направления *</span>
                    <input
                      type="text"
                      value={programForm.code}
                      onChange={(e) => handleProgramFormChange('code', e.target.value)}
                      placeholder="01.03.02"
                      required
                      disabled={programSubmitLoading}
                    />
                  </label>

                  <label className={styles.formField}>
                    <span>Форма обучения *</span>
                    <select
                      className={styles.formSelect}
                      value={programForm.form_of_education}
                      onChange={(e) => handleProgramFormChange('form_of_education', e.target.value)}
                      required
                      disabled={programSubmitLoading}
                    >
                      <option value="">Выберите форму обучения</option>
                      {FORM_OF_EDUCATION_OPTIONS.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>

                <label className={styles.formField}>
                  <span>Название *</span>
                  <input
                    type="text"
                    value={programForm.name}
                    onChange={(e) => handleProgramFormChange('name', e.target.value)}
                    placeholder="Прикладная информатика"
                    required
                    disabled={programSubmitLoading}
                  />
                </label>

                <div className={styles.formGrid}>
                  <label className={styles.formField}>
                    <span>Бюджетные места *</span>
                    <input
                      type="number"
                      min="0"
                      step="1"
                      value={programForm.budget_places}
                      onChange={(e) => handleProgramFormChange('budget_places', e.target.value)}
                      required
                      disabled={programSubmitLoading}
                    />
                  </label>

                  <label className={styles.formField}>
                    <span>Платные места *</span>
                    <input
                      type="number"
                      min="0"
                      step="1"
                      value={programForm.paid_places}
                      onChange={(e) => handleProgramFormChange('paid_places', e.target.value)}
                      required
                      disabled={programSubmitLoading}
                    />
                  </label>
                </div>

                <label className={styles.formField}>
                  <span>Проходной балл *</span>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={programForm.passing_score}
                    onChange={(e) => handleProgramFormChange('passing_score', e.target.value)}
                    required
                    disabled={programSubmitLoading}
                  />
                </label>

                <label className={styles.formField}>
                  <span>Предметы и минимальные баллы *</span>
                  <button
                    type="button"
                    className={styles.addInlineBtn}
                    onClick={handleAddProgramSubject}
                    disabled={programSubmitLoading}
                  >
                    + Добавить предмет
                  </button>
                </label>

                {programForm.required_subjects.length === 0 && (
                  <div className={styles.requiredHint}>Добавьте хотя бы один предмет.</div>
                )}

                {programForm.required_subjects.map((item, index) => {
                  const filteredSubjectOptions = SUBJECT_OPTIONS.filter((subject) =>
                    subject.toLowerCase().includes(item.search.trim().toLowerCase())
                  );

                  return (
                    <div key={index} className={styles.subjectRow}>
                      <div className={styles.subjectHeader}>
                        <span>Предмет {index + 1}</span>
                        <button
                          type="button"
                          className={styles.removeInlineBtn}
                          onClick={() => handleRemoveProgramSubject(index)}
                          disabled={programSubmitLoading}
                        >
                          Удалить
                        </button>
                      </div>

                      <div className={styles.autocompleteWrapper}>
                        <label className={styles.formField}>
                          <span>Название *</span>
                          <input
                            type="text"
                            value={item.search}
                            onChange={(e) => handleProgramSubjectChange(index, 'search', e.target.value)}
                            onFocus={() => setActiveSubjectDropdownIndex(index)}
                            onBlur={() => setTimeout(() => setActiveSubjectDropdownIndex(null), 120)}
                            placeholder="Начните вводить название предмета..."
                            required
                            disabled={programSubmitLoading}
                          />
                        </label>

                        {activeSubjectDropdownIndex === index && item.search.trim() !== '' && (
                          <div className={styles.autocompleteList}>
                            {filteredSubjectOptions.length === 0 && (
                              <div className={styles.autocompleteEmpty}>Ничего не найдено</div>
                            )}
                            {filteredSubjectOptions.map((subject) => (
                              <button
                                type="button"
                                key={subject}
                                className={styles.autocompleteItem}
                                onMouseDown={() => handleProgramSubjectSelect(index, subject)}
                              >
                                {subject}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>

                      <label className={styles.formField}>
                        <span>Минимальный балл *</span>
                        <input
                          type="number"
                          min="0"
                          max="100"
                          step="1"
                          value={item.minimum_points}
                          onChange={(e) => handleProgramSubjectChange(index, 'minimum_points', e.target.value)}
                          required
                          disabled={programSubmitLoading}
                        />
                      </label>
                    </div>
                  );
                })}

                <label className={styles.formField}>
                  <span>Комментарий</span>
                  <textarea
                    value={programForm.comment}
                    onChange={(e) => handleProgramFormChange('comment', e.target.value)}
                    placeholder="Комментарий к направлению"
                    rows={3}
                    disabled={programSubmitLoading}
                  />
                </label>

                {programSubmitError && <div className={styles.formError}>❌ {programSubmitError}</div>}

                <div className={styles.modalActions}>
                  <button
                    type="button"
                    className={`${styles.btn} ${styles.btnSecondary}`}
                    onClick={handleCloseAddProgram}
                    disabled={programSubmitLoading}
                  >
                    Отмена
                  </button>
                  <button type="submit" className={`${styles.btn} ${styles.btnPrimary}`} disabled={programSubmitLoading}>
                    {programSubmitLoading ? 'Создание...' : 'Создать направление'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

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
