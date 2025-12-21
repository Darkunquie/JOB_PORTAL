import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { jobsAPI, applicationsAPI } from '../api/client';
import Modal from '../components/Modal';
import FileUpload from '../components/FileUpload';

export default function JobDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Application modal state
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [resumeFile, setResumeFile] = useState(null);
  const [coverLetter, setCoverLetter] = useState('');
  const [applying, setApplying] = useState(false);
  const [applyError, setApplyError] = useState('');
  const [applySuccess, setApplySuccess] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);

  // Application form fields
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    linkedin: ''
  });

  useEffect(() => {
    fetchJobDetails();
  }, [id]);

  const fetchJobDetails = async () => {
    try {
      setLoading(true);
      const response = await jobsAPI.getById(id);
      setJob(response.data);

      // Check if user has already applied
      if (user && user.role === 'seeker') {
        checkIfApplied();
      }
    } catch (err) {
      setError('Failed to load job details');
      console.error('Error fetching job:', err);
    } finally {
      setLoading(false);
    }
  };

  const checkIfApplied = async () => {
    try {
      const response = await applicationsAPI.getMy();
      const applied = response.data.some(app => app.job_id === parseInt(id));
      setHasApplied(applied);
    } catch (err) {
      console.error('Error checking application status:', err);
    }
  };

  const handleApplyClick = () => {
    if (!user) {
      navigate('/login', { state: { returnTo: `/jobs/${id}` } });
      return;
    }

    if (user.role !== 'seeker') {
      alert('Only job seekers can apply to jobs');
      return;
    }

    if (hasApplied) {
      alert('You have already applied to this job');
      return;
    }

    setShowApplyModal(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmitApplication = async (e) => {
    e.preventDefault();
    setApplyError('');
    setApplying(true);

    // Validate required fields
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.phone) {
      setApplyError('Please fill in all required fields');
      setApplying(false);
      return;
    }

    if (!resumeFile) {
      setApplyError('Please upload your resume');
      setApplying(false);
      return;
    }

    try {
      const submitData = new FormData();
      submitData.append('resume', resumeFile);

      // Add cover letter with applicant details
      const coverLetterText = `Name: ${formData.firstName} ${formData.lastName}
Email: ${formData.email}
Phone: ${formData.phone}
${formData.linkedin ? `LinkedIn: ${formData.linkedin}` : ''}

${coverLetter.trim()}`;

      submitData.append('cover_letter', coverLetterText);

      await applicationsAPI.apply(id, submitData);
      setApplySuccess(true);
      setHasApplied(true);

      setTimeout(() => {
        setShowApplyModal(false);
        setApplySuccess(false);
        setResumeFile(null);
        setCoverLetter('');
        setFormData({
          firstName: '',
          lastName: '',
          email: '',
          phone: '',
          linkedin: ''
        });
      }, 2000);
    } catch (err) {
      setApplyError(err.response?.data?.detail || 'Failed to submit application. Please try again.');
    } finally {
      setApplying(false);
    }
  };

  if (loading) {
    return (
      <div className="container" style={{ padding: '2rem', textAlign: 'center' }}>
        <div className="spinner"></div>
        <p style={{ marginTop: '1rem' }}>Loading job details...</p>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="container" style={{ padding: '2rem', textAlign: 'center' }}>
        <p style={{ color: 'red' }}>{error || 'Job not found'}</p>
        <button onClick={() => navigate('/')} className="btn-secondary" style={{ marginTop: '1rem' }}>
          Back to Job Listings
        </button>
      </div>
    );
  }

  // Format salary in Indian Rupees
  const formatSalary = () => {
    const formatIndianCurrency = (amount) => {
      return Number(amount).toLocaleString('en-IN');
    };

    if (job.salary_min && job.salary_max) {
      return `₹${formatIndianCurrency(job.salary_min)} - ₹${formatIndianCurrency(job.salary_max)}`;
    } else if (job.salary_min) {
      return `From ₹${formatIndianCurrency(job.salary_min)}`;
    } else if (job.salary_max) {
      return `Up to ₹${formatIndianCurrency(job.salary_max)}`;
    }
    return 'Competitive';
  };

  // Format employment type
  const formatEmploymentType = (type) => {
    const typeMap = {
      'full_time': 'Full Time',
      'part_time': 'Part Time',
      'contract': 'Contract',
      'internship': 'Internship'
    };
    return typeMap[type] || type;
  };

  // Format description with markdown-style formatting
  const formatDescription = (text) => {
    if (!text) return null;

    const lines = text.split('\n');
    return lines.map((line, index) => {
      // Handle bold headers (e.g., **Benefits:**)
      if (line.match(/^\*\*.*\*\*$/)) {
        const cleanText = line.replace(/\*\*/g, '');
        return <h3 key={index} style={{ marginTop: '1.5rem', marginBottom: '0.5rem', fontSize: '1.1rem' }}>{cleanText}</h3>;
      }
      // Handle list items
      if (line.startsWith('-')) {
        return <li key={index} style={{ marginLeft: '1.5rem', marginBottom: '0.3rem' }}>{line.substring(1).trim()}</li>;
      }
      // Handle empty lines
      if (line.trim() === '') {
        return <br key={index} />;
      }
      // Regular text
      return <p key={index} style={{ marginBottom: '0.5rem' }}>{line}</p>;
    });
  };

  return (
    <div className="container" style={{ padding: '2rem', maxWidth: '900px', margin: '0 auto' }}>
      <button
        onClick={() => navigate('/')}
        className="btn-secondary"
        style={{ marginBottom: '1.5rem' }}
      >
        ← Back to Jobs
      </button>

      <div className="card" style={{ padding: '2rem' }}>
        <div style={{ marginBottom: '1.5rem', borderBottom: '2px solid #e0e0e0', paddingBottom: '1rem' }}>
          <h1 style={{ marginBottom: '0.5rem', fontSize: '2rem' }}>{job.title}</h1>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginTop: '0.5rem', color: '#666' }}>
            <span><strong>Company:</strong> {job.company?.name || 'N/A'}</span>
            <span>•</span>
            <span><strong>Location:</strong> {job.location || 'Remote'}</span>
            <span>•</span>
            <span className="badge badge-primary">{formatEmploymentType(job.employment_type)}</span>
          </div>
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1.3rem', marginBottom: '0.5rem' }}>Salary Range</h2>
          <p style={{ fontSize: '1.2rem', color: '#28a745', fontWeight: 'bold' }}>{formatSalary()}</p>
        </div>

        {job.required_skills && (
          <div style={{ marginBottom: '1.5rem' }}>
            <h2 style={{ fontSize: '1.3rem', marginBottom: '0.5rem' }}>Required Skills</h2>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {job.required_skills.split(',').map((skill, index) => (
                <span
                  key={index}
                  className="badge"
                  style={{
                    backgroundColor: '#e3f2fd',
                    color: '#1976d2',
                    padding: '0.4rem 0.8rem',
                    borderRadius: '4px'
                  }}
                >
                  {skill.trim()}
                </span>
              ))}
            </div>
          </div>
        )}

        <div style={{ marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1.3rem', marginBottom: '0.5rem' }}>Job Description</h2>
          <div style={{ lineHeight: '1.6', color: '#333' }}>
            {formatDescription(job.description)}
          </div>
        </div>

        <div style={{
          marginTop: '2rem',
          paddingTop: '1rem',
          borderTop: '2px solid #e0e0e0',
          color: '#666',
          fontSize: '0.9rem'
        }}>
          <p>Posted: {new Date(job.created_at).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })}</p>
          {job.company?.description && (
            <div style={{ marginTop: '1rem' }}>
              <h3 style={{ fontSize: '1.1rem', marginBottom: '0.3rem' }}>About {job.company.name}</h3>
              <p>{job.company.description}</p>
            </div>
          )}
        </div>

        <div style={{ marginTop: '2rem', textAlign: 'center' }}>
          <button
            onClick={handleApplyClick}
            className="btn-primary"
            style={{
              padding: '0.8rem 2rem',
              fontSize: '1.1rem',
              opacity: hasApplied ? 0.6 : 1,
              cursor: hasApplied ? 'not-allowed' : 'pointer'
            }}
            disabled={hasApplied}
          >
            {hasApplied ? '✓ Already Applied' : 'Apply Now'}
          </button>
          {hasApplied && (
            <p style={{ color: '#388e3c', marginTop: '0.5rem', fontSize: '0.9rem' }}>
              You have already applied to this position
            </p>
          )}
        </div>
      </div>

      {/* Application Modal */}
      <Modal
        isOpen={showApplyModal}
        onClose={() => !applying && setShowApplyModal(false)}
        title={`Apply for ${job.title}`}
        maxWidth="700px"
      >
        {applySuccess ? (
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>✓</div>
            <h3 style={{ color: '#388e3c', marginBottom: '0.5rem' }}>Application Submitted!</h3>
            <p style={{ color: '#666' }}>Your application has been sent to the employer.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmitApplication} style={{ padding: '0.5rem' }}>
            {/* Job title badge */}
            <div style={{ marginBottom: '1.5rem' }}>
              <span style={{
                display: 'inline-block',
                padding: '0.4rem 1rem',
                backgroundColor: '#e3f2fd',
                color: '#1976d2',
                borderRadius: '20px',
                fontSize: '0.9rem',
                fontWeight: '500'
              }}>
                {job.company?.name || 'Engineering'}
              </span>
            </div>

            {/* Name fields - side by side */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: '500', color: '#333' }}>
                  First Name <span style={{ color: 'red' }}>*</span>
                </label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  required
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    borderRadius: '8px',
                    border: '1px solid #d1d5db',
                    fontSize: '1rem',
                    outline: 'none',
                    transition: 'border-color 0.2s'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#667eea'}
                  onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: '500', color: '#333' }}>
                  Last Name <span style={{ color: 'red' }}>*</span>
                </label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  required
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    borderRadius: '8px',
                    border: '1px solid #d1d5db',
                    fontSize: '1rem',
                    outline: 'none',
                    transition: 'border-color 0.2s'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#667eea'}
                  onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                />
              </div>
            </div>

            {/* Email and Phone fields - side by side */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: '500', color: '#333' }}>
                  Email <span style={{ color: 'red' }}>*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    borderRadius: '8px',
                    border: '1px solid #d1d5db',
                    fontSize: '1rem',
                    outline: 'none',
                    transition: 'border-color 0.2s'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#667eea'}
                  onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: '500', color: '#333' }}>
                  Phone <span style={{ color: 'red' }}>*</span>
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  required
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    borderRadius: '8px',
                    border: '1px solid #d1d5db',
                    fontSize: '1rem',
                    outline: 'none',
                    transition: 'border-color 0.2s'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#667eea'}
                  onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                />
              </div>
            </div>

            {/* LinkedIn field - full width */}
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: '500', color: '#333' }}>
                LinkedIn Profile (Optional)
              </label>
              <input
                type="url"
                name="linkedin"
                value={formData.linkedin}
                onChange={handleInputChange}
                placeholder="https://linkedin.com/in/yourprofile"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  borderRadius: '8px',
                  border: '1px solid #d1d5db',
                  fontSize: '1rem',
                  outline: 'none',
                  transition: 'border-color 0.2s'
                }}
                onFocus={(e) => e.target.style.borderColor = '#667eea'}
                onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
              />
            </div>

            {/* Resume upload */}
            <div style={{ marginBottom: '1rem' }}>
              <FileUpload
                label="Resume/CV"
                accept=".pdf,.doc,.docx"
                maxSize={5242880}
                onFileSelect={setResumeFile}
                required
              />
            </div>

            {/* Cover Letter - Optional and less prominent */}
            <details style={{ marginBottom: '1rem' }}>
              <summary style={{
                cursor: 'pointer',
                fontSize: '0.9rem',
                fontWeight: '500',
                color: '#667eea',
                marginBottom: '0.5rem',
                userSelect: 'none'
              }}>
                Add Cover Letter (Optional)
              </summary>
              <textarea
                value={coverLetter}
                onChange={(e) => setCoverLetter(e.target.value)}
                placeholder="Tell the employer why you're a great fit for this role..."
                maxLength={5000}
                rows={4}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  borderRadius: '8px',
                  border: '1px solid #d1d5db',
                  fontSize: '0.95rem',
                  resize: 'vertical',
                  marginTop: '0.5rem',
                  outline: 'none'
                }}
                onFocus={(e) => e.target.style.borderColor = '#667eea'}
                onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
              />
              <small style={{ color: '#64748b', fontSize: '0.85rem' }}>
                {coverLetter.length}/5000 characters
              </small>
            </details>

            {applyError && (
              <div style={{
                padding: '0.75rem',
                backgroundColor: '#fee',
                color: '#c33',
                borderRadius: '8px',
                marginBottom: '1rem',
                fontSize: '0.9rem'
              }}>
                {applyError}
              </div>
            )}

            {/* Submit button */}
            <button
              type="submit"
              disabled={applying || !resumeFile}
              style={{
                width: '100%',
                padding: '0.9rem',
                backgroundColor: applying || !resumeFile ? '#9ca3af' : '#667eea',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '1rem',
                fontWeight: '600',
                cursor: applying || !resumeFile ? 'not-allowed' : 'pointer',
                transition: 'background-color 0.2s',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem'
              }}
              onMouseEnter={(e) => {
                if (!applying && resumeFile) {
                  e.target.style.backgroundColor = '#5568d3';
                }
              }}
              onMouseLeave={(e) => {
                if (!applying && resumeFile) {
                  e.target.style.backgroundColor = '#667eea';
                }
              }}
            >
              {applying ? 'Submitting...' : (
                <>
                  Submit Application
                  <span style={{ fontSize: '1.2rem' }}>→</span>
                </>
              )}
            </button>
          </form>
        )}
      </Modal>
    </div>
  );
}
