import React from 'react';
import Modal from './Modal';

export default function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  confirmStyle = 'danger' // 'danger' or 'primary'
}) {
  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} maxWidth="500px">
      <div>
        <p style={{ color: '#475569', lineHeight: '1.6', marginBottom: '1.5rem' }}>
          {message}
        </p>

        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
          <button
            onClick={onClose}
            className="btn btn-secondary"
            style={{
              padding: '0.75rem 1.5rem',
              borderRadius: '8px',
              fontWeight: '600'
            }}
          >
            {cancelText}
          </button>
          <button
            onClick={handleConfirm}
            className={confirmStyle === 'danger' ? 'btn btn-danger' : 'btn btn-primary'}
            style={{
              padding: '0.75rem 1.5rem',
              borderRadius: '8px',
              fontWeight: '600',
              backgroundColor: confirmStyle === 'danger' ? '#dc2626' : undefined,
              color: confirmStyle === 'danger' ? 'white' : undefined
            }}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </Modal>
  );
}
