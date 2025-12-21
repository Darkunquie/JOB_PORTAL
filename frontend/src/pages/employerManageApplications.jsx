import React, { useState, useEffect } from 'react';
import { applicationsAPI, jobsAPI, companiesAPI } from '../api/client';

export default function ManageApplications() {
  const [applications, setApplications] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Filters
  const [selectedJob, setSelectedJob] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [expandedApp, setExpandedApp] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [applicationsRes, jobsRes, companiesRes] = await Promise.all([
        applicationsAPI.getForEmployer(),
        jobsAPI.search({ limit: 100 }),
        companiesAPI.getMy()
      ]);

      // Filter jobs owned by user's companies
      const myCompanyIds = companiesRes.data.map(c => c.id);
      const myJobs = jobsRes.data.filter(job => myCompanyIds.includes(job.company_id));

      setApplications(applicationsRes.data);
      setJobs(myJobs);
      setCompanies(companiesRes.data);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to load applications');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (applicationId, newStatus) => {
    try {
      await applicationsAPI.updateStatus(applicationId, { status: newStatus });
      setSuccess(`Application ${newStatus} successfully!`);
      fetchData();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to update status');
      setTimeout(() => setError(''), 3000);
    }
  };

  const getFilteredApplications = () => {
    let filtered = applications;

    if (selectedJob !== 'all') {
      filtered = filtered.filter(app => app.job_id === parseInt(selectedJob));
    }

    if (selectedStatus !== 'all') {
      filtered = filtered.filter(app => app.status === selectedStatus);
    }

    return filtered;
  };

  const getStats = () => {
    return {
      total: applications.length,
      applied: applications.filter(a => a.status === 'applied').length,
      reviewed: applications.filter(a => a.status === 'reviewed').length,
      accepted: applications.filter(a => a.status === 'accepted').length,
      rejected: applications.filter(a => a.status === 'rejected').length
    };
  };

  const getStatusColor = (status) => {
    const colors = {
      applied: { bg: '#dbeafe', text: '#1e40af', border: '#3b82f6' },
      reviewed: { bg: '#fef3c7', text: '#92400e', border: '#f59e0b' },
      accepted: { bg: '#d1fae5', text: '#065f46', border: '#10b981' },
      rejected: { bg: '#fee2e2', text: '#991b1b', border: '#ef4444' }
    };
    return colors[status] || colors.applied;
  };

  const getStatusLabel = (status) => {
    const labels = {
      applied: 'New',
      reviewed: 'Reviewed',
      accepted: 'Accepted',
      rejected: 'Rejected'
    };
    return labels[status] || status;
  };

  const filteredApplications = getFilteredApplications();
  const stats = getStats();

  if (loading) {
    return (
      <div className="container" style={{ padding: '2rem' }}>
        <div className="flex-center" style={{ minHeight: '400px' }}>
          <div className="spinner"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: '2rem' }}>
      <h1 style={{ marginBottom: '0.5rem' }}>Manage Applications</h1>
      <p style={{ color: '#64748b', marginBottom: '2rem' }}>Review and manage job applications</p>

      {error && (
        <div style={{ marginBottom: '1rem', padding: '1rem', background: '#fee2e2', border: '1px solid #ef4444', borderRadius: '8px', color: '#991b1b' }}>
          {error}
        </div>
      )}

      {success && (
        <div style={{ marginBottom: '1rem', padding: '1rem', background: '#d1fae5', border: '1px solid #10b981', borderRadius: '8px', color: '#065f46' }}>
          {success}
        </div>
      )}

      {/* Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        <div className="card" style={{
          padding: '1.5rem',
          textAlign: 'center',
          background: 'white',
          border: '1px solid #e5e7eb',
          borderLeft: '4px solid #667eea'
        }}>
          <div style={{ fontSize: '0.875rem', color: '#64748b', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>
            Total
          </div>
          <div style={{ fontSize: '2.5rem', fontWeight: '700', color: '#1e293b' }}>
            {stats.total}
          </div>
        </div>
        <div className="card" style={{
          padding: '1.5rem',
          textAlign: 'center',
          background: 'white',
          border: '1px solid #e5e7eb',
          borderLeft: '4px solid #3b82f6'
        }}>
          <div style={{ fontSize: '0.875rem', color: '#64748b', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>
            New
          </div>
          <div style={{ fontSize: '2.5rem', fontWeight: '700', color: '#1e293b' }}>
            {stats.applied}
          </div>
        </div>
        <div className="card" style={{
          padding: '1.5rem',
          textAlign: 'center',
          background: 'white',
          border: '1px solid #e5e7eb',
          borderLeft: '4px solid #f59e0b'
        }}>
          <div style={{ fontSize: '0.875rem', color: '#64748b', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>
            Reviewed
          </div>
          <div style={{ fontSize: '2.5rem', fontWeight: '700', color: '#1e293b' }}>
            {stats.reviewed}
          </div>
        </div>
        <div className="card" style={{
          padding: '1.5rem',
          textAlign: 'center',
          background: 'white',
          border: '1px solid #e5e7eb',
          borderLeft: '4px solid #10b981'
        }}>
          <div style={{ fontSize: '0.875rem', color: '#64748b', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>
            Accepted
          </div>
          <div style={{ fontSize: '2.5rem', fontWeight: '700', color: '#1e293b' }}>
            {stats.accepted}
          </div>
        </div>
        <div className="card" style={{
          padding: '1.5rem',
          textAlign: 'center',
          background: 'white',
          border: '1px solid #e5e7eb',
          borderLeft: '4px solid #ef4444'
        }}>
          <div style={{ fontSize: '0.875rem', color: '#64748b', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>
            Rejected
          </div>
          <div style={{ fontSize: '2.5rem', fontWeight: '700', color: '#1e293b' }}>
            {stats.rejected}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="card" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
        <h3 style={{ marginBottom: '1rem' }}>Filters</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', fontSize: '0.9rem' }}>
              Job Position
            </label>
            <select
              value={selectedJob}
              onChange={(e) => setSelectedJob(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                fontSize: '0.95rem'
              }}
            >
              <option value="all">All Jobs ({applications.length})</option>
              {jobs.map(job => {
                const count = applications.filter(a => a.job_id === job.id).length;
                return (
                  <option key={job.id} value={job.id}>
                    {job.title} ({count})
                  </option>
                );
              })}
            </select>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', fontSize: '0.9rem' }}>
              Status
            </label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                fontSize: '0.95rem'
              }}
            >
              <option value="all">All Statuses ({applications.length})</option>
              <option value="applied">New ({stats.applied})</option>
              <option value="reviewed">Reviewed ({stats.reviewed})</option>
              <option value="accepted">Accepted ({stats.accepted})</option>
              <option value="rejected">Rejected ({stats.rejected})</option>
            </select>
          </div>
        </div>

        {(selectedJob !== 'all' || selectedStatus !== 'all') && (
          <button
            onClick={() => {
              setSelectedJob('all');
              setSelectedStatus('all');
            }}
            style={{
              marginTop: '1rem',
              padding: '0.5rem 1rem',
              background: '#f1f5f9',
              border: '1px solid #e2e8f0',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '0.9rem',
              color: '#64748b'
            }}
          >
            Clear Filters
          </button>
        )}
      </div>

      {/* Applications List */}
      {filteredApplications.length === 0 ? (
        <div className="card text-center" style={{ padding: '4rem 2rem', background: '#fafafa', border: '2px dashed #e5e7eb' }}>
          <h3 style={{ color: '#64748b', marginBottom: '0.5rem', fontSize: '1.25rem' }}>No applications found</h3>
          <p style={{ color: '#94a3b8' }}>
            {selectedJob !== 'all' || selectedStatus !== 'all'
              ? 'Try adjusting your filters'
              : 'Applications will appear here when candidates apply to your jobs'}
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {filteredApplications.map(app => {
            const job = jobs.find(j => j.id === app.job_id);
            const statusColor = getStatusColor(app.status);
            const isExpanded = expandedApp === app.id;

            return (
              <div
                key={app.id}
                className="card"
                style={{
                  padding: '1.5rem',
                  border: '1px solid #e2e8f0',
                  transition: 'all 0.3s ease'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                      <h3 style={{ margin: 0, color: '#1e293b', fontSize: '1.15rem' }}>
                        {app.applicant_name || 'Candidate'}
                      </h3>
                      <span style={{
                        padding: '0.25rem 0.75rem',
                        background: statusColor.bg,
                        color: statusColor.text,
                        border: `1px solid ${statusColor.border}`,
                        borderRadius: '20px',
                        fontSize: '0.8rem',
                        fontWeight: '600'
                      }}>
                        {getStatusLabel(app.status)}
                      </span>
                    </div>
                    <p style={{ color: '#64748b', fontSize: '0.95rem', margin: '0.25rem 0' }}>
                      <strong>Applied for:</strong> {job?.title || 'Unknown Position'}
                    </p>
                    <p style={{ color: '#94a3b8', fontSize: '0.85rem', margin: '0.25rem 0' }}>
                      <strong>Email:</strong> {app.applicant_email || 'No email provided'}
                    </p>
                    <p style={{ color: '#94a3b8', fontSize: '0.85rem', margin: '0.25rem 0' }}>
                      <strong>Applied:</strong> {new Date(app.applied_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>

                  <button
                    onClick={() => setExpandedApp(isExpanded ? null : app.id)}
                    style={{
                      padding: '0.5rem 1rem',
                      background: '#f1f5f9',
                      border: '1px solid #e2e8f0',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '0.9rem',
                      color: '#475569'
                    }}
                  >
                    {isExpanded ? 'Hide Details' : 'View Details'}
                  </button>
                </div>

                {isExpanded && (
                  <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '1rem', marginTop: '1rem' }}>
                    {/* Cover Letter */}
                    {app.cover_letter && (
                      <div style={{ marginBottom: '1rem' }}>
                        <h4 style={{ color: '#1e293b', fontSize: '0.95rem', marginBottom: '0.5rem' }}>Cover Letter</h4>
                        <p style={{
                          color: '#64748b',
                          fontSize: '0.9rem',
                          lineHeight: '1.6',
                          padding: '1rem',
                          background: '#f8fafc',
                          borderRadius: '6px',
                          whiteSpace: 'pre-wrap'
                        }}>
                          {app.cover_letter}
                        </p>
                      </div>
                    )}

                    {/* Resume */}
                    {app.resume_file_url && (
                      <div style={{ marginBottom: '1rem' }}>
                        <h4 style={{ color: '#1e293b', fontSize: '0.95rem', marginBottom: '0.5rem' }}>Resume</h4>
                        <a
                          href={app.resume_file_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            display: 'inline-block',
                            padding: '0.5rem 1rem',
                            background: '#667eea',
                            color: 'white',
                            textDecoration: 'none',
                            borderRadius: '6px',
                            fontSize: '0.9rem'
                          }}
                        >
                          Download Resume
                        </a>
                      </div>
                    )}

                    {/* Status Actions */}
                    <div style={{ marginTop: '1rem' }}>
                      <h4 style={{ color: '#1e293b', fontSize: '0.95rem', marginBottom: '0.5rem' }}>Update Status</h4>
                      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                        {app.status !== 'reviewed' && (
                          <button
                            onClick={() => handleStatusUpdate(app.id, 'reviewed')}
                            style={{
                              padding: '0.5rem 1rem',
                              background: '#fef3c7',
                              color: '#92400e',
                              border: '1px solid #f59e0b',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              fontSize: '0.9rem',
                              fontWeight: '500'
                            }}
                          >
                            Mark as Reviewed
                          </button>
                        )}
                        {app.status !== 'accepted' && (
                          <button
                            onClick={() => handleStatusUpdate(app.id, 'accepted')}
                            style={{
                              padding: '0.5rem 1rem',
                              background: '#d1fae5',
                              color: '#065f46',
                              border: '1px solid #10b981',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              fontSize: '0.9rem',
                              fontWeight: '500'
                            }}
                          >
                            Accept
                          </button>
                        )}
                        {app.status !== 'rejected' && (
                          <button
                            onClick={() => handleStatusUpdate(app.id, 'rejected')}
                            style={{
                              padding: '0.5rem 1rem',
                              background: '#fee2e2',
                              color: '#991b1b',
                              border: '1px solid #ef4444',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              fontSize: '0.9rem',
                              fontWeight: '500'
                            }}
                          >
                            Reject
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
