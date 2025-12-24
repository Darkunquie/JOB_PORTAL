import React, { useState } from 'react';

export default function FileUpload({
  accept = '.pdf,.doc,.docx',
  maxSize = 5242880, // 5MB in bytes
  onFileSelect,
  label = 'Upload File',
  required = false
}) {
  const [file, setFile] = useState(null);
  const [error, setError] = useState('');

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setError('');

    if (!selectedFile) {
      setFile(null);
      onFileSelect(null);
      return;
    }

    // Validate file size
    if (selectedFile.size > maxSize) {
      setError(`File size must be less than ${(maxSize / 1024 / 1024).toFixed(1)}MB`);
      setFile(null);
      onFileSelect(null);
      return;
    }

    // Validate file type
    const fileExtension = '.' + selectedFile.name.split('.').pop().toLowerCase();
    const allowedExtensions = accept.toLowerCase().split(',').map(ext => ext.trim());

    if (!allowedExtensions.includes(fileExtension)) {
      setError(`File type must be one of: ${accept}`);
      setFile(null);
      onFileSelect(null);
      return;
    }

    setFile(selectedFile);
    onFileSelect(selectedFile);
  };

  const clearFile = () => {
    setFile(null);
    setError('');
    onFileSelect(null);
  };

  return (
    <div className="form-group">
      <label>
        {label} {required && <span style={{ color: '#dc2626' }}>*</span>}
      </label>

      <div
        style={{
          border: '2px dashed #cbd5e1',
          borderRadius: '8px',
          padding: '1.5rem',
          textAlign: 'center',
          backgroundColor: '#f8fafc',
          transition: 'all 0.3s ease'
        }}
      >
        {!file ? (
          <>
            <input
              type="file"
              accept={accept}
              onChange={handleFileChange}
              style={{ display: 'none' }}
              id="file-upload"
              required={required}
            />
            <label
              htmlFor="file-upload"
              style={{
                cursor: 'pointer',
                color: '#667eea',
                fontWeight: '600',
                display: 'block'
              }}
            >
              📎 Click to upload or drag and drop
            </label>
            <p style={{ color: '#64748b', fontSize: '0.875rem', marginTop: '0.5rem', marginBottom: 0 }}>
              {accept.toUpperCase().replace(/\./g, '')} files up to {(maxSize / 1024 / 1024).toFixed(1)}MB
            </p>
          </>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <span style={{ fontSize: '1.5rem' }}>📄</span>
              <div style={{ textAlign: 'left' }}>
                <p style={{ fontWeight: '600', color: '#1e293b', marginBottom: '0.25rem' }}>
                  {file.name}
                </p>
                <p style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: 0 }}>
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={clearFile}
              style={{
                background: 'none',
                border: 'none',
                color: '#dc2626',
                cursor: 'pointer',
                fontSize: '1.5rem',
                padding: '0.25rem'
              }}
              aria-label="Remove file"
            >
              ×
            </button>
          </div>
        )}
      </div>

      {error && (
        <p style={{ color: '#dc2626', fontSize: '0.875rem', marginTop: '0.5rem', marginBottom: 0 }}>
          {error}
        </p>
      )}
    </div>
  );
}
