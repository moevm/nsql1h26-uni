import React, { useState, useEffect, useRef } from 'react';
import styles from './AdminPage.module.css';
import {
  createProgram,
  createUniversity,
  deleteProgram,
  deleteUniversity,
  exportAllDataCsv,
  exportAllDataJson,
  exportAllDataXml,
  importAllDataJson,
  getProgram,
  getPrograms,
  getUniversity,
  getUniversities,
  updateProgram,
  updateUniversity,
} from '../services/api';
import { getAdminSession } from '../services/auth';
import ConfirmModal from '../components/ConfirmModal/ConfirmModal';
import { parsePhoneNumberFromString } from 'libphonenumber-js';

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

const DELETE_CONFIRM_TEXT = 'Удалить';
const DELETE_CANCEL_TEXT = 'Отмена';
const DELETE_UNIVERSITY_TITLE = 'Удалить вуз';
const DELETE_PROGRAM_TITLE = 'Удалить направление';

const getDeleteUniversityMessage = (name) =>
  `Вы уверены, что хотите удалить вуз "${name}"? Это приведет к удалению всех связанных данных. Это действие нельзя отменить.`;

const getDeleteProgramMessage = (name, code) =>
  `Вы уверены, что хотите удалить направление "${name}" (${code})? Это действие нельзя отменить.`;

const isValidPhone = (value) => {
  const normalized = value.trim();
  const phoneNumber = parsePhoneNumberFromString(normalized, 'RU');
  return Boolean(phoneNumber && phoneNumber.isValid());
};

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

const buildImportJsonTemplate = () => ({
  meta: {
    format: 'json',
    version: '1.0',
    exported_at: '2026-04-18T10:15:00+00:00',
  },
  admins: [
    {
      _id: '67f100000000000000000001',
      username: 'admin',
      password_hash: '$2b$12$example.hash.value',
      createdAt: '2026-04-18T10:15:00+00:00',
    },
  ],
  universities: [
    {
      _id: '67f200000000000000000001',
      name: 'МГУ',
      city: 'Москва',
      address: 'Ленинские горы, д. 1',
      has_dormitory: true,
      military_dept: true,
      website: 'https://www.msu.ru',
      foundation_year: 1755,
      students_count: 40000,
      faculties_count: 15,
      phone: '+7 (495) 939-10-00',
      email: 'priem@msu.ru',
      comment: 'Пример записи для импорта',
      rating: 4.8,
      programs_count: 120,
      createdAt: '2026-04-18T10:15:00+00:00',
      updatedAt: '2026-04-18T10:15:00+00:00',
    },
  ],
  programs: [
    {
      _id: '67f300000000000000000001',
      university_id: '67f200000000000000000001',
      code: '01.03.02',
      name: 'Прикладная математика и информатика',
      budget_places: 80,
      paid_places: 20,
      passing_score: 260,
      form_of_education: 'Очная',
      required_subjects: [
        {
          subject: 'Математика',
          minimum_points: 70,
        },
      ],
      comment: 'Пример записи для импорта',
      createdAt: '2026-04-18T10:15:00+00:00',
      updatedAt: '2026-04-18T10:15:00+00:00',
    },
  ],
});

const AdminPage = () => {
  const importFileInputRef = useRef(null);
  const [universities, setUniversities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitError, setSubmitError] = useState(null);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [deletingUniversityId, setDeletingUniversityId] = useState(null);
  const [universityToDelete, setUniversityToDelete] = useState(null);
  const [programSearchQuery, setProgramSearchQuery] = useState('');
  const [currentProgramPage, setCurrentProgramPage] = useState(1);
  const [isAddUniversityOpen, setIsAddUniversityOpen] = useState(false);
  const [editingUniversityId, setEditingUniversityId] = useState(null);
  const [universityForm, setUniversityForm] = useState(INITIAL_UNIVERSITY_FORM);
  const [isAddProgramOpen, setIsAddProgramOpen] = useState(false);
  const [editingProgramId, setEditingProgramId] = useState(null);
  const [programForm, setProgramForm] = useState(INITIAL_PROGRAM_FORM);
  const [programUniversitySearch, setProgramUniversitySearch] = useState('');
  const [isProgramUniversityDropdownOpen, setIsProgramUniversityDropdownOpen] = useState(false);
  const [activeSubjectDropdownIndex, setActiveSubjectDropdownIndex] = useState(null);
  const [programSubmitLoading, setProgramSubmitLoading] = useState(false);
  const [programSubmitError, setProgramSubmitError] = useState(null);
  const [importFile, setImportFile] = useState(null);
  const [importLoading, setImportLoading] = useState(false);
  const [importError, setImportError] = useState(null);
  const [importSuccessMessage, setImportSuccessMessage] = useState(null);
  const [exportFormat, setExportFormat] = useState('json');
  const [exportLoading, setExportLoading] = useState(false);
  const [exportError, setExportError] = useState(null);
  const [exportSuccessMessage, setExportSuccessMessage] = useState(null);
  const [deletingProgramId, setDeletingProgramId] = useState(null);
  const [programToDelete, setProgramToDelete] = useState(null);
  const [programs, setPrograms] = useState([]);
  const [programsLoading, setProgramsLoading] = useState(true);
  const [programsError, setProgramsError] = useState(null);
  const itemsPerPage = 4;
  const programItemsPerPage = 4;

  const [totalProgramsCount, setTotalProgramsCount] = useState(0);

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
    fetchPrograms(currentProgramPage, programItemsPerPage);
  }, []);

  // useEffect для загрузки при смене страницы
  useEffect(() => {
    fetchPrograms(currentProgramPage, programItemsPerPage);
  }, [currentProgramPage]);

  const fetchPrograms = async (page = 1, limit = 4) => {
    try {
      setProgramsLoading(true);
      setProgramsError(null);
      console.log('Загрузка страницы:', page, 'Лимит:', limit);
      const response = await getPrograms(
        {},
        page,
        limit
      );
      console.log('Ответ от сервера:', response);
      const transformedData = response.items.map((program) => ({
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
      setTotalProgramsCount(response.total);
      setCurrentProgramPage(response.page);
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
  const totalProgramPages = Math.ceil(totalProgramsCount / programItemsPerPage);
  const programStartIndex = (currentProgramPage - 1) * programItemsPerPage;
  const paginatedPrograms = filteredPrograms.slice(programStartIndex, programStartIndex + programItemsPerPage);

  const handleEditUniversity = async (id) => {
    try {
      setSubmitLoading(true);
      setSubmitError(null);

      const university = await getUniversity(id);

      setUniversityForm({
        name: university.name || '',
        city: university.city || '',
        address: university.address || '',
        website: university.website || '',
        foundation_year:
          university.foundation_year === null || university.foundation_year === undefined
            ? ''
            : String(university.foundation_year),
        students_count:
          university.students_count === null || university.students_count === undefined
            ? ''
            : String(university.students_count),
        faculties_count:
          university.faculties_count === null || university.faculties_count === undefined
            ? ''
            : String(university.faculties_count),
        phone: university.phone || '',
        email: university.email || '',
        has_dormitory: Boolean(university.has_dormitory),
        military_dept: Boolean(university.military_dept),
        rating:
          university.rating === null || university.rating === undefined
            ? ''
            : String(university.rating),
        programs_count:
          university.programs_count === null || university.programs_count === undefined
            ? ''
            : String(university.programs_count),
        comment: university.comment || '',
      });

      setEditingUniversityId(id);
      setIsAddUniversityOpen(true);
    } catch (requestError) {
      setError(requestError.message || 'Не удалось загрузить данные университета');
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleDeleteUniversity = (id) => {
    const selectedUniversity = universities.find((item) => item.id === id);
    setUniversityToDelete({
      id,
      name: selectedUniversity?.name || 'без названия',
    });
  };

  const handleCloseDeleteUniversityModal = () => {
    if (deletingUniversityId) {
      return;
    }
    setUniversityToDelete(null);
  };

  const handleConfirmDeleteUniversity = async () => {
    if (!universityToDelete?.id) {
      return;
    }

    const adminSession = getAdminSession();
    if (!adminSession?.adminId) {
      setError('Сессия администратора не найдена. Войдите снова.');
      setUniversityToDelete(null);
      return;
    }

    try {
      setDeletingUniversityId(universityToDelete.id);
      setError(null);

      await deleteUniversity(universityToDelete.id, adminSession.adminId);

      setUniversities((prev) => {
        const updated = prev.filter((item) => item.id !== universityToDelete.id);
        const newTotalPages = Math.max(1, Math.ceil(updated.length / itemsPerPage));
        setCurrentPage((prevPage) => Math.min(prevPage, newTotalPages));
        return updated;
      });

      setPrograms((prev) => {
        const updated = prev.filter((item) => item.universityId !== universityToDelete.id);
        const newTotalProgramPages = Math.max(1, Math.ceil(updated.length / programItemsPerPage));
        setCurrentProgramPage((prevPage) => Math.min(prevPage, newTotalProgramPages));
        return updated;
      });

      setUniversityToDelete(null);
    } catch (requestError) {
      setError(requestError.message || 'Не удалось удалить университет');
    } finally {
      setDeletingUniversityId(null);
    }
  };

  const handleEditProgram = async (id) => {
    try {
      setProgramSubmitLoading(true);
      setProgramSubmitError(null);

      const program = await getProgram(id);

      const requiredSubjects = Array.isArray(program.required_subjects)
        ? program.required_subjects.map((item) => ({
          subject: item.subject || '',
          minimum_points:
            item.minimum_points === null || item.minimum_points === undefined
              ? ''
              : String(item.minimum_points),
          search: item.subject || '',
        }))
        : Object.entries(program.required_subjects || {}).map(([subject, minimumPoints]) => ({
          subject,
          minimum_points:
            minimumPoints === null || minimumPoints === undefined ? '' : String(minimumPoints),
          search: subject,
        }));

      const selectedUniversityName = getUniversityNameById(program.university_id);

      setProgramForm({
        university_id: program.university_id || '',
        code: program.code || '',
        name: program.name || '',
        budget_places:
          program.budget_places === null || program.budget_places === undefined
            ? ''
            : String(program.budget_places),
        paid_places:
          program.paid_places === null || program.paid_places === undefined
            ? ''
            : String(program.paid_places),
        passing_score:
          program.passing_score === null || program.passing_score === undefined
            ? ''
            : String(program.passing_score),
        form_of_education: program.form_of_education || '',
        required_subjects: requiredSubjects,
        comment: program.comment || '',
      });

      setProgramUniversitySearch(
        selectedUniversityName === 'Неизвестный вуз' ? '' : selectedUniversityName
      );
      setIsProgramUniversityDropdownOpen(false);
      setActiveSubjectDropdownIndex(null);
      setEditingProgramId(id);
      setIsAddProgramOpen(true);
    } catch (requestError) {
      setProgramsError(requestError.message || 'Не удалось загрузить данные направления');
    } finally {
      setProgramSubmitLoading(false);
    }
  };

  const handleDeleteProgram = (id) => {
    const selectedProgram = programs.find((item) => item.id === id);
    setProgramToDelete({
      id,
      name: selectedProgram?.name || 'без названия',
      code: selectedProgram?.code || '-',
    });
  };

  const handleCloseDeleteProgramModal = () => {
    if (deletingProgramId) {
      return;
    }
    setProgramToDelete(null);
  };

  const handleConfirmDeleteProgram = async () => {
    if (!programToDelete?.id) {
      return;
    }

    const adminSession = getAdminSession();
    if (!adminSession?.adminId) {
      setProgramsError('Сессия администратора не найдена. Войдите снова.');
      setProgramToDelete(null);
      return;
    }

    try {
      setDeletingProgramId(programToDelete.id);
      setProgramsError(null);

      await deleteProgram(programToDelete.id, adminSession.adminId);

      setPrograms((prev) => {
        const updated = prev.filter((item) => item.id !== programToDelete.id);
        const newTotalPages = Math.max(1, Math.ceil(updated.length / programItemsPerPage));
        setCurrentProgramPage((prevPage) => Math.min(prevPage, newTotalPages));
        return updated;
      });

      setProgramToDelete(null);
    } catch (requestError) {
      setProgramsError(requestError.message || 'Не удалось удалить направление');
    } finally {
      setDeletingProgramId(null);
    }
  };

  const handleOpenAddUniversity = () => {
    setSubmitError(null);
    setEditingUniversityId(null);
    setUniversityForm(INITIAL_UNIVERSITY_FORM);
    setIsAddUniversityOpen(true);
  };

  const handleCloseAddUniversity = () => {
    setIsAddUniversityOpen(false);
    setSubmitError(null);
    setEditingUniversityId(null);
    setUniversityForm(INITIAL_UNIVERSITY_FORM);
  };

  const handleFormChange = (field, value) => {
    setUniversityForm(prev => ({ ...prev, [field]: value }));
  };

  const handleOpenAddProgram = () => {
    setProgramSubmitError(null);
    setProgramUniversitySearch('');
    setIsProgramUniversityDropdownOpen(false);
    setEditingProgramId(null);
    setProgramForm(INITIAL_PROGRAM_FORM);
    setIsAddProgramOpen(true);
  };

  const handleCloseAddProgram = () => {
    setIsAddProgramOpen(false);
    setProgramSubmitError(null);
    setProgramUniversitySearch('');
    setIsProgramUniversityDropdownOpen(false);
    setActiveSubjectDropdownIndex(null);
    setEditingProgramId(null);
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

  const handleSubmitProgram = async (event) => {
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
      const payload = {
        university_id: programForm.university_id,
        code: programForm.code.trim(),
        name: programForm.name.trim(),
        budget_places: budgetPlaces,
        paid_places: paidPlaces,
        passing_score: passingScore,
        form_of_education: programForm.form_of_education,
        required_subjects: subjects,
        comment: programForm.comment.trim() || null,
      };

      if (editingProgramId) {
        await updateProgram(editingProgramId, payload, adminSession.adminId);
      } else {
        await createProgram(payload, adminSession.adminId);
      }

      handleCloseAddProgram();
      await fetchPrograms();
      await fetchUniversities();
      if (!editingProgramId) {
        setCurrentProgramPage(1);
      }
    } catch (requestError) {
      setProgramSubmitError(
        requestError.message
        || (editingProgramId ? 'Не удалось обновить направление' : 'Не удалось создать направление')
      );
    } finally {
      setProgramSubmitLoading(false);
    }
  };

  const handleSubmitUniversity = async (event) => {
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

    if (universityForm.phone.trim() && !isValidPhone(universityForm.phone.trim())) {
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

      const payload = {
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
      };

      if (editingUniversityId) {
        await updateUniversity(editingUniversityId, payload, adminSession.adminId);
      } else {
        await createUniversity(payload, adminSession.adminId);
      }

      handleCloseAddUniversity();
      await fetchUniversities();
      if (!editingUniversityId) {
        setCurrentPage(1);
      }
    } catch (requestError) {
      setSubmitError(
        requestError.message
        || (editingUniversityId ? 'Не удалось обновить университет' : 'Не удалось создать университет')
      );
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleExportAllData = async () => {
    const adminSession = getAdminSession();
    if (!adminSession?.adminId) {
      setExportError('Сессия администратора не найдена. Войдите снова.');
      setExportSuccessMessage(null);
      return;
    }

    try {
      setExportLoading(true);
      setExportError(null);
      setExportSuccessMessage(null);

      const exporterByFormat = {
        json: exportAllDataJson,
        csv: exportAllDataCsv,
        xml: exportAllDataXml,
      };
      const exporter = exporterByFormat[exportFormat] || exportAllDataJson;
      const { blob, filename } = await exporter(adminSession.adminId);

      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(downloadUrl);

      setExportSuccessMessage(`Экспорт завершен: ${filename}`);
    } catch (requestError) {
      setExportError(requestError.message || 'Не удалось экспортировать данные');
    } finally {
      setExportLoading(false);
    }
  };

  const handleImportFileChange = (event) => {
    const file = event.target.files?.[0] || null;
    setImportFile(file);
    setImportError(null);
    setImportSuccessMessage(null);
  };

  const handleImportFileClick = () => {
    importFileInputRef.current?.click();
  };

  const handleImportAllDataJson = async () => {
    const adminSession = getAdminSession();
    if (!adminSession?.adminId) {
      setImportError('Сессия администратора не найдена. Войдите снова.');
      setImportSuccessMessage(null);
      return;
    }

    if (!importFile) {
      setImportError('Выберите JSON-файл для импорта.');
      setImportSuccessMessage(null);
      return;
    }

    try {
      setImportLoading(true);
      setImportError(null);
      setImportSuccessMessage(null);

      const result = await importAllDataJson(importFile, adminSession.adminId);

      await fetchUniversities();
      await fetchPrograms();
      setCurrentPage(1);
      setCurrentProgramPage(1);

      const imported = result?.imported || {};
      setImportSuccessMessage(
        `Импорт завершен: админы ${imported.admins ?? 0}, вузы ${imported.universities ?? 0}, направления ${imported.programs ?? 0}`
      );
      setImportFile(null);
    } catch (requestError) {
      setImportError(requestError.message || 'Не удалось импортировать данные');
    } finally {
      setImportLoading(false);
    }
  };

  const handleDownloadImportTemplate = () => {
    const template = buildImportJsonTemplate();
    const content = JSON.stringify(template, null, 2);
    const blob = new Blob([content], { type: 'application/json' });
    const downloadUrl = window.URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = 'nsql-import-template.json';
    document.body.appendChild(link);
    link.click();
    link.remove();

    window.URL.revokeObjectURL(downloadUrl);
  };

  return (
    <div className={styles.container}>
      <div className={styles.screenTitle}>⚙️ Администрирование</div>

      <div className={styles.importExportCard}>
        <div className={styles.sectionSubtitle}>📦 Массовый импорт/экспорт данных</div>
        <div className={styles.importExportGrid}>
          <div className={styles.importBox}>
            <div className={styles.boxTitle}>Импорт</div>
            {importFile ? (
              <button
                type="button"
                className={styles.selectedFileName}
                onClick={handleImportFileClick}
                disabled={importLoading}
                title="Нажмите, чтобы выбрать другой файл"
              >
                {importFile.name}
              </button>
            ) : (
              <label className={styles.fileInput} htmlFor="admin-import-file-input">
                📁 Нажмите для выбора JSON-файла<br />
                <span style={{ fontSize: '0.85rem' }}>
                  Поддерживаются файлы .json
                </span>
              </label>
            )}
            <input
              ref={importFileInputRef}
              id="admin-import-file-input"
              type="file"
              accept="application/json,.json"
              onChange={handleImportFileChange}
              className={styles.hiddenFileInput}
              disabled={importLoading}
            />
            <div className={styles.warning}>
              ⚠️ Все текущие данные будут заменены
            </div>
            <details className={styles.adminImportHint}>
              <summary>Особенности импорта администратора</summary>
              <p>Импорт не удаляет администратора, под которым вы вошли в систему: эта учетная запись всегда сохраняется.</p>
              <ul className={styles.importHintList}>
                <li>
                  Для администраторов нужен хэш пароля в поле <code>password_hash</code>; обычный пароль импортировать нельзя.
                </li>
                <li>
                  Если в файле есть администратор с тем же <code>username</code>, что и текущий, он не будет продублирован.
                </li>
                <li>
                  Если у администраторов совпадет <code>_id</code>, система назначит новый id, чтобы запись не потерялась.
                </li>
              </ul>
            </details>
            <details className={styles.importHint}>
              <summary>Требования к JSON-файлу</summary>
              <p>Файл должен быть JSON-объектом с секциями: <b>admins</b>, <b>universities</b>, <b>programs</b>.</p>
              <p>Обязательные поля в элементах массивов:</p>
              <ul className={styles.importHintList}>
                <li>
                  <b>admins[]:</b> <code>_id</code>, <code>username</code>, <code>password_hash</code>, <code>createdAt</code>
                </li>
                <li>
                  <b>universities[]:</b> <code>_id</code>, <code>name</code>, <code>city</code>, <code>has_dormitory</code>, <code>military_dept</code>, <code>website</code>
                </li>
                <li>
                  <b>programs[]:</b> <code>_id</code>, <code>university_id</code>, <code>code</code>, <code>name</code>, <code>budget_places</code>, <code>paid_places</code>, <code>passing_score</code>, <code>form_of_education</code>, <code>required_subjects</code>
                </li>
              </ul>
              <p>
                Для сохранения связей все значения <code>programs[].university_id</code> должны существовать среди <code>universities[]._id</code>.
              </p>
              <p>
                Если необязательные поля отсутствуют, они будут автоматически инициализированы значениями по умолчанию и их можно отредактировать позже.
              </p>
              <pre className={styles.importHintCode}>{`{
  "meta": { "format": "json", "version": "1.0" },
  "admins": [
    {
      "_id": "67f1...",
      "username": "admin",
      "password_hash": "...",
      "createdAt": "2026-04-18T10:15:00+00:00"
    }
  ],
  "universities": [
    {
      "_id": "67f2...",
      "name": "МГУ",
      "city": "Москва",
      "address": "...",
      "has_dormitory": true,
      "military_dept": true,
      "website": "https://...",
      "foundation_year": 1755,
      "students_count": 40000,
      "faculties_count": 15,
      "phone": "+7 ...",
      "email": "...",
      "comment": "",
      "rating": 4.8,
      "programs_count": 120,
      "createdAt": "2026-04-18T10:15:00+00:00",
      "updatedAt": "2026-04-18T10:15:00+00:00"
    }
  ],
  "programs": [
    {
      "_id": "67f3...",
      "university_id": "67f2...",
      "code": "01.03.02",
      "name": "Прикладная математика и информатика",
      "budget_places": 80,
      "paid_places": 20,
      "passing_score": 260,
      "form_of_education": "Очная",
      "required_subjects": [
        { "subject": "Математика", "minimum_points": 70 }
      ],
      "comment": "",
      "createdAt": "2026-04-18T10:15:00+00:00",
      "updatedAt": "2026-04-18T10:15:00+00:00"
    }
  ]
}`}</pre>
              <p>Рекомендуется импортировать JSON, ранее скачанный через Экспорт.</p>
              <div className={styles.importHintActions}>
                <button
                  type="button"
                  className={`${styles.btn} ${styles.btnSecondary}`}
                  onClick={handleDownloadImportTemplate}
                >
                  Скачать шаблон JSON
                </button>
              </div>
            </details>
            <button
              className={`${styles.btn} ${styles.btnDanger}`}
              onClick={handleImportAllDataJson}
              disabled={importLoading}
            >
              {importLoading ? 'Импорт...' : 'Загрузить и заменить данные'}
            </button>
            {importError && <div className={styles.formError}>❌ {importError}</div>}
            {importSuccessMessage && (
              <div className={styles.requiredHint}>✅ {importSuccessMessage}</div>
            )}
          </div>

          <div className={styles.exportBox}>
            <div className={styles.boxTitle}>Экспорт</div>
            <select
              className={styles.formatSelect}
              value={exportFormat}
              onChange={(event) => setExportFormat(event.target.value)}
              disabled={exportLoading}
            >
              <option value="json">JSON</option>
              <option value="csv">CSV</option>
              <option value="xml">XML</option>
            </select>
            <button
              className={`${styles.btn} ${styles.btnPrimary}`}
              style={{ marginBottom: '10px' }}
              onClick={handleExportAllData}
              disabled={exportLoading}
            >
              {exportLoading ? 'Экспорт...' : 'Скачать все данные'}
            </button>
            {exportError && <div className={styles.formError}>❌ {exportError}</div>}
            {exportSuccessMessage && (
              <div className={styles.requiredHint}>✅ {exportSuccessMessage}</div>
            )}
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
                    aria-label="Редактировать"
                    data-tooltip="Редактировать"
                  >
                    ✎
                  </button>
                  <button
                    className={styles.actionBtn}
                    onClick={() => handleDeleteUniversity(uni.id)}
                    disabled={deletingUniversityId === uni.id}
                    aria-label="Удалить"
                    data-tooltip="Удалить"
                  >
                    {deletingUniversityId === uni.id ? '...' : '🗑'}
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

            {programs.map((program) => (
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
                    aria-label="Редактировать"
                    data-tooltip="Редактировать"
                  >
                    ✎
                  </button>
                  <button
                    className={styles.actionBtn}
                    onClick={() => handleDeleteProgram(program.id)}
                    disabled={deletingProgramId === program.id}
                    aria-label="Удалить"
                    data-tooltip="Удалить"
                  >
                    {deletingProgramId === program.id ? '...' : '🗑'}
                  </button>
                </div>
              </div>
            ))}

            {totalProgramPages > 1 && (
              <div className={styles.pagination}>
                <span style={{ color: '#4b637a' }}>
                  {(currentProgramPage - 1) * programItemsPerPage + 1}-
                  {Math.min(currentProgramPage * programItemsPerPage, totalProgramsCount)} из {totalProgramsCount}
                </span>
                <div className={styles.pageNumbers}>
                  <button
                    className={styles.pageBtn}
                    onClick={() => setCurrentProgramPage(prev => Math.max(1, prev - 1))}
                    disabled={currentProgramPage === 1}
                  >
                    ←
                  </button>
                  {Array.from({ length: Math.min(totalProgramPages, 5) }, (_, i) => {
                    let pageNum;
                    if (totalProgramPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentProgramPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentProgramPage >= totalProgramPages - 2) {
                      pageNum = totalProgramPages - 4 + i;
                    } else {
                      pageNum = currentProgramPage - 2 + i;
                    }

                    return (
                      <button
                        key={pageNum}
                        className={`${styles.pageBtn} ${currentProgramPage === pageNum ? styles.active : ''}`}
                        onClick={() => setCurrentProgramPage(pageNum)}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                  <button
                    className={styles.pageBtn}
                    onClick={() => setCurrentProgramPage(prev => Math.min(totalProgramPages, prev + 1))}
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
              <h4>{editingProgramId ? 'Редактировать направление' : 'Добавить направление'}</h4>
              <button
                type="button"
                className={styles.closeBtn}
                onClick={handleCloseAddProgram}
                aria-label="Закрыть"
              >
                ✕
              </button>
            </div>

            <form className={styles.modalForm} onSubmit={handleSubmitProgram}>
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
                  {programSubmitLoading
                    ? (editingProgramId ? 'Сохранение...' : 'Создание...')
                    : (editingProgramId ? 'Сохранить изменения' : 'Создать направление')}
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
              <h4>{editingUniversityId ? 'Редактировать вуз' : 'Добавить вуз'}</h4>
              <button
                type="button"
                className={styles.closeBtn}
                onClick={handleCloseAddUniversity}
                aria-label="Закрыть"
              >
                ✕
              </button>
            </div>

            <form className={styles.modalForm} onSubmit={handleSubmitUniversity}>
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
                  {submitLoading
                    ? (editingUniversityId ? 'Сохранение...' : 'Создание...')
                    : (editingUniversityId ? 'Сохранить изменения' : 'Создать вуз')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={Boolean(universityToDelete)}
        title={DELETE_UNIVERSITY_TITLE}
        message={getDeleteUniversityMessage(universityToDelete?.name || '')}
        confirmText={DELETE_CONFIRM_TEXT}
        cancelText={DELETE_CANCEL_TEXT}
        isLoading={Boolean(deletingUniversityId)}
        onConfirm={handleConfirmDeleteUniversity}
        onClose={handleCloseDeleteUniversityModal}
      />

      <ConfirmModal
        isOpen={Boolean(programToDelete)}
        title={DELETE_PROGRAM_TITLE}
        message={getDeleteProgramMessage(programToDelete?.name || '', programToDelete?.code || '-')}
        confirmText={DELETE_CONFIRM_TEXT}
        cancelText={DELETE_CANCEL_TEXT}
        isLoading={Boolean(deletingProgramId)}
        onConfirm={handleConfirmDeleteProgram}
        onClose={handleCloseDeleteProgramModal}
      />
    </div>
  );
};

export default AdminPage;
