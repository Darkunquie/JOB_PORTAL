import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { applicationsAPI, companiesAPI, jobsAPI } from '../api/client';
import StatCard from '../components/StatCard';
import StatusBadge from '../components/StatusBadge';
import { format } from 'date-fns';

export default function SeekerDashboard() {
  const [applications, setApplications] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' or 'companies'

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [appsResponse, companiesResponse, jobsResponse] = await Promise.all([
        applicationsAPI.getMy(),
        companiesAPI.getAll(),
        jobsAPI.search({})
      ]);
      setApplications(appsResponse.data);
      setCompanies(companiesResponse.data);
      setJobs(jobsResponse.data);
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  const stats = {
    total: applications.length,
    applied: applications.filter(a => a.status === 'applied').length,
    reviewed: applications.filter(a => a.status === 'reviewed').length,
    accepted: applications.filter(a => a.status === 'accepted').length,
    rejected: applications.filter(a => a.status === 'rejected').length,
  };

  const recentApplications = applications.slice(0, 5);

  // Get job counts per company
  const companiesWithJobCount = companies.map(company => ({
    ...company,
    jobCount: jobs.filter(job => job.company_id === company.id && job.status === 'open').length
  })).filter(company => company.jobCount > 0);

  return (
    <div className="container" style={{ padding: '2rem' }}>
      <div style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: '2rem',
        borderRadius: '12px',
        color: 'white',
        marginBottom: '2rem'
      }}>
        <h1 style={{ marginBottom: '0.5rem', color: 'white' }}>Welcome to Your Dashboard</h1>
        <p style={{ opacity: 0.9 }}>Track your job applications and find new opportunities</p>
      </div>

      {/* Tab Navigation */}
      <div style={{
        display: 'flex',
        gap: '0.5rem',
        marginBottom: '2rem',
        borderBottom: '2px solid #e2e8f0'
      }}>
        <button
          onClick={() => setActiveTab('overview')}
          style={{
            padding: '0.75rem 1.5rem',
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'overview' ? '3px solid #667eea' : '3px solid transparent',
            color: activeTab === 'overview' ? '#667eea' : '#64748b',
            fontWeight: activeTab === 'overview' ? '600' : '400',
            cursor: 'pointer',
            transition: 'all 0.2s',
            fontSize: '1rem'
          }}
        >
          📊 Overview
        </button>
        <button
          onClick={() => setActiveTab('companies')}
          style={{
            padding: '0.75rem 1.5rem',
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'companies' ? '3px solid #667eea' : '3px solid transparent',
            color: activeTab === 'companies' ? '#667eea' : '#64748b',
            fontWeight: activeTab === 'companies' ? '600' : '400',
            cursor: 'pointer',
            transition: 'all 0.2s',
            fontSize: '1rem'
          }}
        >
          🏢 Companies ({companiesWithJobCount.length})
        </button>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
            <StatCard title="Total Applications" value={stats.total} icon="📝" loading={loading} />
            <StatCard title="Applied" value={stats.applied} icon="📤" color="#3b82f6" loading={loading} />
            <StatCard title="Under Review" value={stats.reviewed} icon="👀" color="#f59e0b" loading={loading} />
            <StatCard title="Accepted" value={stats.accepted} icon="✅" color="#10b981" loading={loading} />
            <StatCard title="Rejected" value={stats.rejected} icon="❌" color="#ef4444" loading={loading} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
            <Link to="/" className="card" style={{
              padding: '2rem',
              textAlign: 'center',
              textDecoration: 'none',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
              <p style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>🔍</p>
              <h3 style={{ color: '#1e293b', marginBottom: '0.5rem' }}>Browse Jobs</h3>
              <p style={{ color: '#64748b', marginBottom: 0 }}>Find new opportunities</p>
            </Link>

            <Link to="/my-applications" className="card" style={{
              padding: '2rem',
              textAlign: 'center',
              textDecoration: 'none',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
              <p style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>📋</p>
              <h3 style={{ color: '#1e293b', marginBottom: '0.5rem' }}>My Applications</h3>
              <p style={{ color: '#64748b', marginBottom: 0 }}>Track your progress</p>
            </Link>
          </div>

          {recentApplications.length > 0 && (
            <div className="card" style={{ padding: '1.5rem' }}>
              <h2 style={{ marginBottom: '1.5rem', fontSize: '1.5rem' }}>Recent Applications</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {recentApplications.map(app => (
                  <div key={app.id} style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '1rem',
                    background: '#f8fafc',
                    borderRadius: '8px'
                  }}>
                    <div>
                      <Link to={`/jobs/${app.job_id}`} style={{
                        fontWeight: '600',
                        color: '#1e293b',
                        textDecoration: 'none',
                        display: 'block',
                        marginBottom: '0.25rem'
                      }}>
                        {app.job_title}
                      </Link>
                      <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: 0 }}>
                        {app.company_name} • {format(new Date(app.applied_at), 'MMM dd')}
                      </p>
                    </div>
                    <StatusBadge status={app.status} />
                  </div>
                ))}
              </div>
              <Link to="/my-applications" className="btn btn-secondary" style={{
                marginTop: '1rem',
                width: '100%',
                textAlign: 'center'
              }}>
                View All Applications
              </Link>
            </div>
          )}
        </>
      )}

      {/* Companies Tab */}
      {activeTab === 'companies' && (
        <div>
          {loading ? (
            <div className="flex-center" style={{ minHeight: '200px' }}>
              <div className="spinner"></div>
            </div>
          ) : companiesWithJobCount.length === 0 ? (
            <div className="card text-center" style={{ padding: '3rem' }}>
              <p style={{ fontSize: '3rem', marginBottom: '1rem' }}>🏢</p>
              <h3 style={{ color: '#64748b', marginBottom: '0.5rem' }}>No Companies Available</h3>
              <p style={{ color: '#94a3b8' }}>No companies are currently hiring</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1.5rem' }}>
              {companiesWithJobCount.map(company => (
                <div
                  key={company.id}
                  className="card"
                  style={{
                    padding: '1.5rem',
                    transition: 'all 0.3s ease',
                    border: '1px solid #e2e8f0',
                    cursor: 'pointer'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-4px)';
                    e.currentTarget.style.boxShadow = '0 8px 16px rgba(0,0,0,0.1)';
                    e.currentTarget.style.borderColor = '#667eea';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
                    e.currentTarget.style.borderColor = '#e2e8f0';
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                    <div>
                      <h3 style={{ marginBottom: '0.5rem', color: '#1e293b', fontSize: '1.25rem' }}>
                        {company.name}
                      </h3>
                      <div style={{
                        display: 'inline-block',
                        padding: '0.25rem 0.75rem',
                        background: '#667eea',
                        color: 'white',
                        borderRadius: '20px',
                        fontSize: '0.85rem',
                        fontWeight: '600'
                      }}>
                        {company.jobCount} Open {company.jobCount === 1 ? 'Position' : 'Positions'}
                      </div>
                    </div>
                    <span style={{ fontSize: '2.5rem' }}>🏢</span>
                  </div>

                  {company.description && (
                    <p style={{
                      color: '#64748b',
                      fontSize: '0.95rem',
                      lineHeight: '1.5',
                      marginBottom: '1rem',
                      display: '-webkit-box',
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden'
                    }}>
                      {company.description}
                    </p>
                  )}

                  <Link
                    to={`/?company=${company.id}`}
                    className="btn btn-primary"
                    style={{
                      width: '100%',
                      textAlign: 'center',
                      padding: '0.75rem',
                      borderRadius: '8px',
                      fontWeight: '600',
                      textDecoration: 'none',
                      display: 'block'
                    }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    View All Jobs →
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
