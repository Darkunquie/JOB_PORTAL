import React, { useState, useEffect } from 'react';
import { companiesAPI, jobsAPI } from '../api/client';

export default function CompanyManagement() {
  const [companies, setCompanies] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCompany, setEditingCompany] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [companiesRes, jobsRes] = await Promise.all([
        companiesAPI.getMy(),
        jobsAPI.search({ limit: 100 })
      ]);
      setCompanies(companiesRes.data);
      setJobs(jobsRes.data);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to load companies');
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = () => {
    setEditingCompany(null);
    setFormData({ name: '', description: '' });
    setShowModal(true);
    setError('');
    setSuccess('');
  };

  const openEditModal = (company) => {
    setEditingCompany(company);
    setFormData({
      name: company.name,
      description: company.description || ''
    });
    setShowModal(true);
    setError('');
    setSuccess('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!formData.name.trim()) {
      setError('Company name is required');
      return;
    }

    try {
      if (editingCompany) {
        await companiesAPI.update(editingCompany.id, formData);
        setSuccess('Company updated successfully!');
      } else {
        await companiesAPI.create(formData);
        setSuccess('Company created successfully!');
      }

      setShowModal(false);
      fetchData();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to save company');
    }
  };

  const handleDelete = async (companyId) => {
    if (!window.confirm('Are you sure you want to delete this company? This will also delete all associated jobs and applications.')) {
      return;
    }

    try {
      await companiesAPI.delete(companyId);
      setSuccess('Company deleted successfully!');
      fetchData();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to delete company');
    }
  };

  const getCompanyJobCount = (companyId) => {
    return jobs.filter(job => job.company_id === companyId).length;
  };

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
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '2rem'
      }}>
        <div>
          <h1 style={{ marginBottom: '0.5rem' }}>Company Management</h1>
          <p style={{ color: '#64748b' }}>Create and manage your companies</p>
        </div>
        <button
          onClick={openCreateModal}
          className="btn btn-primary"
          style={{ padding: '0.75rem 1.5rem' }}
        >
          ➕ Create Company
        </button>
      </div>

      {error && (
        <div className="alert alert-error" style={{ marginBottom: '1rem', padding: '1rem', background: '#fee2e2', border: '1px solid #ef4444', borderRadius: '8px', color: '#991b1b' }}>
          {error}
        </div>
      )}

      {success && (
        <div className="alert alert-success" style={{ marginBottom: '1rem', padding: '1rem', background: '#d1fae5', border: '1px solid #10b981', borderRadius: '8px', color: '#065f46' }}>
          {success}
        </div>
      )}

      {companies.length === 0 ? (
        <div className="card text-center" style={{ padding: '3rem' }}>
          <p style={{ fontSize: '3rem', marginBottom: '1rem' }}>🏢</p>
          <h3 style={{ color: '#64748b', marginBottom: '0.5rem' }}>No companies yet</h3>
          <p style={{ color: '#94a3b8', marginBottom: '1.5rem' }}>Create your first company to start posting jobs</p>
          <button onClick={openCreateModal} className="btn btn-primary">
            Create Company
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1.5rem' }}>
          {companies.map(company => (
            <div
              key={company.id}
              className="card"
              style={{
                padding: '1.5rem',
                transition: 'all 0.3s ease',
                border: '1px solid #e2e8f0'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                <div style={{ flex: 1 }}>
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
                    {getCompanyJobCount(company.id)} {getCompanyJobCount(company.id) === 1 ? 'Job' : 'Jobs'}
                  </div>
                </div>
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

              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                <button
                  onClick={() => openEditModal(company)}
                  className="btn btn-secondary"
                  style={{ flex: 1, padding: '0.5rem', fontSize: '0.9rem' }}
                >
                  ✏️ Edit
                </button>
                <button
                  onClick={() => handleDelete(company.id)}
                  className="btn"
                  style={{
                    flex: 1,
                    padding: '0.5rem',
                    fontSize: '0.9rem',
                    background: '#fee2e2',
                    color: '#991b1b',
                    border: '1px solid #fca5a5'
                  }}
                >
                  🗑️ Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}
        onClick={() => setShowModal(false)}>
          <div
            className="card"
            style={{
              width: '90%',
              maxWidth: '500px',
              padding: '2rem',
              maxHeight: '90vh',
              overflow: 'auto'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 style={{ marginBottom: '1.5rem' }}>
              {editingCompany ? 'Edit Company' : 'Create New Company'}
            </h2>

            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
                  Company Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Acme Corporation"
                  required
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    fontSize: '1rem'
                  }}
                />
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Brief description of your company..."
                  rows={4}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    fontSize: '1rem',
                    resize: 'vertical'
                  }}
                />
              </div>

              {error && (
                <div style={{
                  padding: '0.75rem',
                  background: '#fee2e2',
                  border: '1px solid #ef4444',
                  borderRadius: '8px',
                  color: '#991b1b',
                  marginBottom: '1rem'
                }}>
                  {error}
                </div>
              )}

              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="btn btn-secondary"
                  style={{ flex: 1 }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ flex: 1 }}
                >
                  {editingCompany ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
