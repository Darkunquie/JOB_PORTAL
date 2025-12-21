import React from 'react';

export default function StatCard({ title, value, icon, color = '#667eea', loading = false }) {
  return (
    <div
      style={{
        background: 'white',
        borderRadius: '12px',
        padding: '1.5rem',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        border: '1px solid #e2e8f0',
        transition: 'all 0.3s ease',
        cursor: 'default'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <p style={{ color: '#64748b', fontSize: '0.875rem', marginBottom: '0.5rem', fontWeight: '500' }}>
            {title}
          </p>
          {loading ? (
            <div style={{ fontSize: '2rem', color: color }}>...</div>
          ) : (
            <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1e293b', marginBottom: 0 }}>
              {value}
            </p>
          )}
        </div>
        {icon && (
          <div
            style={{
              fontSize: '2.5rem',
              opacity: 0.8
            }}
          >
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}
