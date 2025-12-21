import React from 'react';

export default function StatusBadge({ status }) {
  const getStatusStyle = (status) => {
    const styles = {
      // Application statuses
      applied: { bg: '#e3f2fd', color: '#1976d2', text: 'Applied' },
      reviewed: { bg: '#fff3e0', color: '#f57c00', text: 'Reviewed' },
      accepted: { bg: '#e8f5e9', color: '#388e3c', text: 'Accepted' },
      rejected: { bg: '#ffebee', color: '#d32f2f', text: 'Rejected' },

      // Job statuses
      open: { bg: '#e8f5e9', color: '#388e3c', text: 'Open' },
      closed: { bg: '#f5f5f5', color: '#616161', text: 'Closed' },

      // User statuses
      active: { bg: '#e8f5e9', color: '#388e3c', text: 'Active' },
      inactive: { bg: '#ffebee', color: '#d32f2f', text: 'Inactive' },

      // User roles
      admin: { bg: '#f3e5f5', color: '#7b1fa2', text: 'Admin' },
      employer: { bg: '#e1f5fe', color: '#0277bd', text: 'Employer' },
      seeker: { bg: '#f1f8e9', color: '#558b2f', text: 'Job Seeker' },
    };

    return styles[status] || { bg: '#f5f5f5', color: '#616161', text: status };
  };

  const style = getStatusStyle(status);

  return (
    <span
      style={{
        display: 'inline-block',
        padding: '0.4rem 0.8rem',
        borderRadius: '6px',
        fontSize: '0.85rem',
        fontWeight: '600',
        backgroundColor: style.bg,
        color: style.color,
        textTransform: 'capitalize'
      }}
    >
      {style.text}
    </span>
  );
}
