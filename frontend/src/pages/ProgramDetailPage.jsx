import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getProgram, getUniversity } from '../services/api';
import styles from './ProgramDetailPage.module.css';

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

const normalizeProgram = (rawProgram) => {
  if (!rawProgram) {
    return null;
  }

  return {
    id: rawProgram._id || rawProgram.id,
    universityId: rawProgram.university_id || rawProgram.universityId,
    code: rawProgram.code || '-',
    name: rawProgram.name || 'Без названия',
    budgetPlaces: rawProgram.budget_places ?? rawProgram.budgetPlaces ?? 0,
    paidPlaces: rawProgram.paid_places ?? rawProgram.paidPlaces ?? 0,
    passingScore: rawProgram.passing_score ?? rawProgram.passingScore ?? 0,
    form: rawProgram.form_of_education || rawProgram.form || '-',
    requiredSubjects: Array.isArray(rawProgram.required_subjects)
      ? rawProgram.required_subjects
      : [],
    createdAt: toReadableDate(rawProgram.createdAt || rawProgram.created_at),
    updatedAt: toReadableDate(rawProgram.updatedAt || rawProgram.updated_at),
  };
};

const normalizeUniversity = (rawUniversity) => {
  if (!rawUniversity) {
    return null;
  }

  return {
    id: rawUniversity._id || rawUniversity.id,
    name: rawUniversity.name || 'Вуз',
  };
};

const ProgramDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [program, setProgram] = useState(null);
  const [university, setUniversity] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      setLoading(true);
      setError('');

      try {
        const programRaw = await getProgram(id);
        if (!isMounted) {
          return;
        }

        const normalizedProgram = normalizeProgram(programRaw);
        setProgram(normalizedProgram);

        if (normalizedProgram?.universityId) {
          try {
            const universityRaw = await getUniversity(normalizedProgram.universityId);
            if (isMounted) {
              setUniversity(normalizeUniversity(universityRaw));
            }
          } catch {
            if (isMounted) {
              setUniversity(null);
            }
          }
        }
      } catch (requestError) {
        if (isMounted) {
          setError(requestError.message || 'Не удалось загрузить направление');
          setProgram(null);
          setUniversity(null);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadData();

    return () => {
      isMounted = false;
    };
  }, [id]);

  const historyRows = useMemo(() => {
    if (!program) {
      return [];
    }

    return [
      {
        date: program.updatedAt,
        status: 'обновление',
        details: 'Данные направления были изменены',
      },
      {
        date: program.createdAt,
        status: 'создание',
        details: 'Направление добавлено в систему',
      },
    ];
  }, [program]);

  if (loading) {
    return <div className={styles.stateBox}>Загрузка направления...</div>;
  }

  if (!program) {
    return (
      <div className={styles.stateBoxError}>
        <h2>Не удалось открыть страницу направления</h2>
        <p>{error || 'Направление не найдено'}</p>
        <button className={styles.actionBtn} onClick={() => navigate(-1)}>
          Назад
        </button>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <div className={styles.breadcrumbs}>
          <button
            type="button"
            className={styles.breadcrumbLink}
            onClick={() => navigate('/')}
          >
            Вузы
          </button>
          <span className={styles.breadcrumbSeparator}>/</span>
          <button
            type="button"
            className={styles.breadcrumbLink}
            onClick={() => navigate(`/universities/${program.universityId}`)}
          >
            {university?.name || 'Вуз'}
          </button>
          <span className={styles.breadcrumbSeparator}>/</span>
          <span className={styles.breadcrumbCurrent}>{program.name}</span>
        </div>

        <div className={styles.programHeader}>
          <div className={styles.programTitle}>
            <h1>{program.name}</h1>
            <div className={styles.programMeta}>
              <span>Код {program.code}</span>
              <span>{program.form}</span>
              <span>Бюджет/платно</span>
            </div>
          </div>
        </div>

        <div className={styles.infoSection}>
          <div className={styles.infoCard}>
            <h3>Основные параметры</h3>
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>Код направления:</span>
              <span className={styles.infoValue}>{program.code}</span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>Бюджетных мест:</span>
              <span className={styles.infoValue}>{program.budgetPlaces}</span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>Платных мест:</span>
              <span className={styles.infoValue}>{program.paidPlaces}</span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>Проходной балл:</span>
              <span className={styles.infoValue}>{program.passingScore}</span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>Форма обучения:</span>
              <span className={styles.infoValue}>{program.form}</span>
            </div>
          </div>

          <div className={styles.infoCard}>
            <h3>Вступительные испытания</h3>
            {program.requiredSubjects.length > 0 ? (
              program.requiredSubjects.map((subjectItem, index) => (
                <div key={`${subjectItem.subject}-${index}`} className={styles.infoRow}>
                  <span className={styles.infoLabel}>ЕГЭ {index + 1}:</span>
                  <span className={styles.infoValue}>
                    {subjectItem.subject} - {subjectItem.minimum_points}
                  </span>
                </div>
              ))
            ) : (
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>ЕГЭ:</span>
                <span className={styles.infoValue}>Нет данных</span>
              </div>
            )}
          </div>
        </div>

        <div className={styles.historySection}>
          <h3>История изменений</h3>
          <div className={styles.historyList}>
            {historyRows.map((item) => (
              <div key={`${item.date}-${item.status}`} className={styles.historyItem}>
                <span className={styles.historyDate}>{item.date}</span>
                <span className={styles.historyStatus}>{item.status}</span>
                <span className={styles.historyComment}>{item.details}</span>
              </div>
            ))}
          </div>
        </div>

        <div className={styles.datesFooter}>
          <span>Элемент создан: {program.createdAt}</span>
          <span>Последнее изменение: {program.updatedAt}</span>
        </div>

        <div className={styles.progressLine}>
          <div className={styles.progressFill} />
        </div>
        <div className={styles.loadingStatus}>данные загружены</div>
      </div>
    </div>
  );
};

export default ProgramDetailPage;
