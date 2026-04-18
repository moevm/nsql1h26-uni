import React from 'react';
import styles from './ConfirmModal.module.css';

const ConfirmModal = ({
  isOpen,
  title,
  message,
  confirmText = 'Удалить',
  cancelText = 'Отмена',
  isLoading = false,
  onConfirm,
  onClose,
}) => {
  if (!isOpen) {
    return null;
  }

  const handleOverlayClose = () => {
    if (isLoading) {
      return;
    }
    onClose();
  };

  return (
    <div className={styles.overlay} onClick={handleOverlayClose}>
      <div className={styles.modal} onClick={(event) => event.stopPropagation()}>
        <div className={styles.header}>
          <h4 className={styles.title}>{title}</h4>
          <button
            type="button"
            className={styles.closeBtn}
            onClick={handleOverlayClose}
            aria-label="Закрыть"
            disabled={isLoading}
          >
            ✕
          </button>
        </div>

        <div className={styles.message}>{message}</div>

        <div className={styles.actions}>
          <button
            type="button"
            className={`${styles.button} ${styles.cancelButton}`}
            onClick={handleOverlayClose}
            disabled={isLoading}
          >
            {cancelText}
          </button>
          <button
            type="button"
            className={`${styles.button} ${styles.confirmButton}`}
            onClick={onConfirm}
            disabled={isLoading}
          >
            {isLoading ? 'Удаление...' : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
