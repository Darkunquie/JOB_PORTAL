import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { companiesAPI, jobsAPI } from '../api/client';

export default function PostJob() {
  const navigate = useNavigate();
  const [companies, setCompanies] = useState([]);
  const [myJobs, setMyJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    employment_type: 'full_time',
    salary_min: '',
    salary_max: '',
    required_skills: '',
    company_id: ''
  });

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

      if (companiesRes.data.length > 0) {
        setFormData(prev => ({ ...prev, company_id: companiesRes.data[0].id }));
      }

      const myCompanyIds = companiesRes.data.map(c => c.id);
      const filteredJobs = jobsRes.data.filter(job => myCompanyIds.includes(job.company_id));
      setMyJobs(filteredJobs);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSubmitting(true);

    if (!formData.company_id) {
      setError('Please select a company');
      setSubmitting(false);
      return;
    }

    try {
      const jobData = {
        ...formData,
        company_id: parseInt(formData.company_id),
        salary_min: formData.salary_min ? parseFloat(formData.salary_min) : null,
        salary_max: formData.salary_max ? parseFloat(formData.salary_max) : null
      };

      await jobsAPI.create(jobData);
      setSuccess('Job posted successfully!');

      setFormData({
        title: '',
        description: '',
        location: '',
        employment_type: 'full_time',
        salary_min: '',
        salary_max: '',
        required_skills: '',
        company_id: companies.length > 0 ? companies[0].id : ''
      });

      fetchData();

      setTimeout(() => {
        navigate('/employer/applications');
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to post job');
    } finally {
      setSubmitting(false);
    }
  };

  const handleJobStatusToggle = async (jobId, currentStatus) => {
    try {
      const newStatus = currentStatus === 'open' ? 'closed' : 'open';
      await jobsAPI.update(jobId, { status: newStatus });
      setSuccess('Job status updated successfully');
      fetchData();
    } catch (err) {
      setError('Failed to update job status');
    }
  };

  const handleDeleteJob = async (jobId) => {
    if (!window.confirm('Are you sure you want to delete this job? This will also delete all applications.')) {
      return;
    }

    try {
      await jobsAPI.delete(jobId);
      setSuccess('Job deleted successfully');
      fetchData();
    } catch (err) {
      setError('Failed to delete job');
    }
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

  if (companies.length === 0) {
    return (
      <div className="container" style={{ padding: '2rem' }}>
        <div className="card text-center" style={{ padding: '3rem' }}>
          <p style={{ fontSize: '3rem', marginBottom: '1rem' }}>🏢</p>
          <h3 style={{ color: '#64748b', marginBottom: '0.5rem' }}>No Company Found</h3>
          <p style={{ color: '#94a3b8', marginBottom: '1.5rem' }}>
            You need to create a company before posting jobs
          </p>
          <button onClick={() => navigate('/employer/companies')} className="btn btn-primary">
            Create Company
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: '2rem' }}>
      <h1 style={{ marginBottom: '0.5rem' }}>Post a New Job</h1>
      <p style={{ color: '#64748b', marginBottom: '2rem' }}>Fill in the details below to create a job listing</p>

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

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
        <div className="card" style={{ padding: '2rem' }}>
          <h2 style={{ marginBottom: '1.5rem' }}>Job Details</h2>

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
                Company *
              </label>
              <select
                value={formData.company_id}
                onChange={(e) => setFormData({ ...formData, company_id: e.target.value })}
                required
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  fontSize: '1rem'
                }}
              >
                {companies.map(company => (
                  <option key={company.id} value={company.id}>{company.name}</option>
                ))}
              </select>
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
                Job Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g., Senior Software Engineer"
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

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
                Description *
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe the role, responsibilities, and requirements..."
                rows={6}
                required
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

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
                  Location *
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="e.g., New York, NY"
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

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
                  Employment Type *
                </label>
                <select
                  value={formData.employment_type}
                  onChange={(e) => setFormData({ ...formData, employment_type: e.target.value })}
                  required
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    fontSize: '1rem'
                  }}
                >
                  <option value="full_time">Full Time</option>
                  <option value="part_time">Part Time</option>
                  <option value="contract">Contract</option>
                  <option value="internship">Internship</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
                  Minimum Salary
                </label>
                <input
                  type="number"
                  value={formData.salary_min}
                  onChange={(e) => setFormData({ ...formData, salary_min: e.target.value })}
                  placeholder="e.g., 50000"
                  min="0"
                  step="1000"
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    fontSize: '1rem'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
                  Maximum Salary
                </label>
                <input
                  type="number"
                  value={formData.salary_max}
                  onChange={(e) => setFormData({ ...formData, salary_max: e.target.value })}
                  placeholder="e.g., 80000"
                  min="0"
                  step="1000"
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    fontSize: '1rem'
                  }}
                />
              </div>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
                Required Skills
              </label>
              <textarea
                value={formData.required_skills}
                onChange={(e) => setFormData({ ...formData, required_skills: e.target.value })}
                placeholder="e.g., JavaScript, React, Node.js (comma-separated)"
                rows={3}
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

            <button
              type="submit"
              className="btn btn-primary"
              disabled={submitting}
              style={{ width: '100%', padding: '0.75rem', fontSize: '1rem' }}
            >
              {submitting ? 'Posting...' : 'Post Job'}
            </button>
          </form>
        </div>

        <div>
          <h2 style={{ marginBottom: '1rem' }}>My Posted Jobs ({myJobs.length})</h2>

          {myJobs.length === 0 ? (
            <div className="card text-center" style={{ padding: '2rem' }}>
              <p style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>💼</p>
              <p style={{ color: '#64748b' }}>No jobs posted yet</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {myJobs.map(job => (
                <div key={job.id} className="card" style={{ padding: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '0.5rem' }}>
                    <h4 style={{ margin: 0, fontSize: '1rem', color: '#1e293b' }}>{job.title}</h4>
                    <span style={{
                      padding: '0.25rem 0.5rem',
                      background: job.status === 'open' ? '#d1fae5' : '#fee2e2',
                      color: job.status === 'open' ? '#065f46' : '#991b1b',
                      borderRadius: '4px',
                      fontSize: '0.75rem',
                      fontWeight: '600'
                    }}>
                      {job.status === 'open' ? 'Open' : 'Closed'}
                    </span>
                  </div>
                  <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '0.75rem' }}>
                    {job.location}
                  </p>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                      onClick={() => handleJobStatusToggle(job.id, job.status)}
                      style={{
                        flex: 1,
                        padding: '0.4rem',
                        fontSize: '0.8rem',
                        background: job.status === 'open' ? '#fee2e2' : '#d1fae5',
                        color: job.status === 'open' ? '#991b1b' : '#065f46',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer'
                      }}
                    >
                      {job.status === 'open' ? 'Close' : 'Open'}
                    </button>
                    <button
                      onClick={() => handleDeleteJob(job.id)}
                      style={{
                        flex: 1,
                        padding: '0.4rem',
                        fontSize: '0.8rem',
                        background: '#fee2e2',
                        color: '#991b1b',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer'
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
