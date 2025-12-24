import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { applicationsAPI } from '../api/client';
import StatusBadge from '../components/StatusBadge';
import { format } from 'date-fns';

export default function MyApplications() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const response = await applicationsAPI.getMy();
      setApplications(response.data);
    } catch (err) {
      setError('Failed to load applications');
      console.error('Error fetching applications:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredApplications = applications.filter(app => {
    if (filterStatus === 'all') return true;
    return app.status === filterStatus;
  });

  const getStatusCounts = () => {
    return {
      all: applications.length,
      applied: applications.filter(a => a.status === 'applied').length,
      reviewed: applications.filter(a => a.status === 'reviewed').length,
      accepted: applications.filter(a => a.status === 'accepted').length,
      rejected: applications.filter(a => a.status === 'rejected').length,
    };
  };

  const counts = getStatusCounts();

  if (loading) {
    return (
      <div className="container" style={{ padding: '2rem', textAlign: 'center' }}>
        <div className="spinner"></div>
        <p style={{ marginTop: '1rem' }}>Loading your applications...</p>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: '2rem' }}>
      <h1 style={{ marginBottom: '1.5rem' }}>My Applications</h1>

      {error && (
        <div className="alert alert-error" style={{ marginBottom: '1.5rem' }}>
          {error}
        </div>
      )}

      {/* Status Filter Tabs */}
      <div style={{
        display: 'flex',
        gap: '0.5rem',
        marginBottom: '2rem',
        borderBottom: '2px solid #e2e8f0',
        flexWrap: 'wrap'
      }}>
        {[
          { key: 'all', label: 'All' },
          { key: 'applied', label: 'Applied' },
          { key: 'reviewed', label: 'Reviewed' },
          { key: 'accepted', label: 'Accepted' },
          { key: 'rejected', label: 'Rejected' }
        ].map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setFilterStatus(key)}
            style={{
              padding: '0.75rem 1.5rem',
              background: 'none',
              border: 'none',
              borderBottom: filterStatus === key ? '3px solid #667eea' : '3px solid transparent',
              color: filterStatus === key ? '#667eea' : '#64748b',
              fontWeight: filterStatus === key ? '600' : '400',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            {label} ({counts[key]})
          </button>
        ))}
      </div>

      {filteredApplications.length === 0 ? (
        <div className="card text-center" style={{ padding: '3rem' }}>
          <p style={{ fontSize: '3rem', marginBottom: '1rem' }}>📋</p>
          <h3 style={{ color: '#64748b', marginBottom: '0.5rem' }}>
            {filterStatus === 'all' ? 'No applications yet' : `No ${filterStatus} applications`}
          </h3>
          <p style={{ color: '#94a3b8' }}>
            {filterStatus === 'all' ? 'Start applying to jobs to see them here' : `You don't have any ${filterStatus} applications`}
          </p>
          {filterStatus === 'all' && (
            <Link to="/" className="btn btn-primary" style={{ marginTop: '1.5rem' }}>
              Browse Jobs
            </Link>
          )}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {filteredApplications.map((application) => (
            <div
              key={application.id}
              className="card"
              style={{
                padding: '1.5rem',
                transition: 'all 0.3s ease',
                border: '1px solid #e2e8f0'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: '250px' }}>
                  <Link
                    to={`/jobs/${application.job_id}`}
                    style={{
                      fontSize: '1.25rem',
                      fontWeight: '600',
                      color: '#1e293b',
                      textDecoration: 'none',
                      marginBottom: '0.5rem',
                      display: 'block'
                    }}
                  >
                    {application.job_title}
                  </Link>
                  <p style={{ color: '#64748b', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontSize: '1.2rem' }}>🏢</span>
                    <strong>{application.company_name}</strong>
                  </p>
                  <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: 0 }}>
                    Applied on {format(new Date(application.applied_at), 'MMM dd, yyyy')}
                  </p>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.75rem' }}>
                  <StatusBadge status={application.status} />
                  <Link
                    to={`/jobs/${application.job_id}`}
                    className="btn btn-secondary"
                    style={{
                      padding: '0.5rem 1rem',
                      fontSize: '0.9rem',
                      borderRadius: '6px'
                    }}
                  >
                    View Job
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
