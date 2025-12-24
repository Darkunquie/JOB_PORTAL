import { useState, useEffect } from 'react';
import { usersAPI } from '../api/client';
import { useAuth } from '../context/AuthContext';

export default function ProfilePage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [formData, setFormData] = useState({
    full_name: '',
    headline: '',
    profile_image_url: '',
    date_of_birth: '',
    phone: '',
    location: '',
    experience_text: '',
    skills_text: '',
    education_text: '',
    linkedin_url: '',
    github_url: '',
    portfolio_url: ''
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await usersAPI.getProfile();
      setProfile(response.data);
      setFormData({
        full_name: response.data.full_name || '',
        headline: response.data.headline || '',
        profile_image_url: response.data.profile_image_url || '',
        date_of_birth: response.data.date_of_birth || '',
        phone: response.data.phone || '',
        location: response.data.location || '',
        experience_text: response.data.experience_text || '',
        skills_text: response.data.skills_text || '',
        education_text: response.data.education_text || '',
        linkedin_url: response.data.linkedin_url || '',
        github_url: response.data.github_url || '',
        portfolio_url: response.data.portfolio_url || ''
      });
      setImagePreview(response.data.profile_image_url);
    } catch (err) {
      setError('Failed to load profile');
      console.error('Error fetching profile:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
    setSuccess('');
  };

  const handleImageUrlChange = (e) => {
    const url = e.target.value;
    setFormData({ ...formData, profile_image_url: url });
    setImagePreview(url);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const response = await usersAPI.updateProfile(formData);
      setProfile(response.data);
      setSuccess('Profile updated successfully!');
      setIsEditing(false);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to update profile');
      console.error('Error updating profile:', err);
    }
  };

  const handleCancel = () => {
    setFormData({
      full_name: profile.full_name || '',
      headline: profile.headline || '',
      profile_image_url: profile.profile_image_url || '',
      date_of_birth: profile.date_of_birth || '',
      phone: profile.phone || '',
      location: profile.location || '',
      experience_text: profile.experience_text || '',
      skills_text: profile.skills_text || '',
      education_text: profile.education_text || '',
      linkedin_url: profile.linkedin_url || '',
      github_url: profile.github_url || '',
      portfolio_url: profile.portfolio_url || ''
    });
    setImagePreview(profile.profile_image_url);
    setIsEditing(false);
    setError('');
    setSuccess('');
  };

  if (loading) {
    return (
      <div className="container" style={{ padding: '2rem', textAlign: 'center' }}>
        <div className="spinner"></div>
        <p style={{ marginTop: '1rem' }}>Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: '2rem', maxWidth: '1000px', margin: '0 auto' }}>
      {/* Alerts */}
      {error && (
        <div className="alert alert-error" style={{ marginBottom: '1.5rem' }}>
          {error}
        </div>
      )}

      {success && (
        <div className="alert alert-success" style={{ marginBottom: '1.5rem' }}>
          {success}
        </div>
      )}

      {/* Profile Header Card */}
      <div className="card" style={{ padding: '2.5rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', gap: '2rem', alignItems: 'flex-start', flexWrap: 'wrap' }}>
          {/* Profile Image */}
          <div style={{ flex: '0 0 auto' }}>
            <div style={{
              width: '150px',
              height: '150px',
              borderRadius: '50%',
              overflow: 'hidden',
              border: '1px solid #e5e7eb',
              background: '#f3f4f6',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '4rem',
              color: '#9ca3af',
              fontWeight: 'bold',
              boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
            }}>
              {imagePreview || formData.profile_image_url ? (
                <img
                  src={imagePreview || formData.profile_image_url}
                  alt="Profile"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.parentElement.innerHTML = (formData.full_name || user?.email || 'U').charAt(0).toUpperCase();
                  }}
                />
              ) : (
                (formData.full_name || user?.email || 'U').charAt(0).toUpperCase()
              )}
            </div>
            {isEditing && (
              <div style={{ marginTop: '1rem', fontSize: '0.85rem' }}>
                <label style={{ fontWeight: '600', color: '#4a5568', display: 'block', marginBottom: '0.5rem' }}>
                  Image URL
                </label>
                <input
                  type="url"
                  value={formData.profile_image_url}
                  onChange={handleImageUrlChange}
                  placeholder="https://example.com/image.jpg"
                  style={{
                    width: '150px',
                    padding: '0.5rem',
                    borderRadius: '6px',
                    border: '2px solid #e2e8f0',
                    fontSize: '0.85rem'
                  }}
                />
              </div>
            )}
          </div>

          {/* Profile Info */}
          <div style={{ flex: '1 1 auto', minWidth: '300px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
              <div>
                <h1 style={{ marginBottom: '0.5rem', color: '#1e293b', fontSize: '2rem', fontWeight: '700' }}>
                  {formData.full_name || 'Your Name'}
                </h1>
                {formData.headline && (
                  <p style={{ fontSize: '1.1rem', color: '#64748b', marginBottom: '0.75rem', fontStyle: 'italic' }}>
                    {formData.headline}
                  </p>
                )}
                <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', marginTop: '1rem' }}>
                  {formData.location && (
                    <span style={{ color: '#64748b', fontSize: '0.95rem' }}>
                      <strong style={{ color: '#1e293b' }}>Location:</strong> {formData.location}
                    </span>
                  )}
                  {formData.phone && (
                    <span style={{ color: '#64748b', fontSize: '0.95rem' }}>
                      <strong style={{ color: '#1e293b' }}>Phone:</strong> {formData.phone}
                    </span>
                  )}
                  {user?.email && (
                    <span style={{ color: '#64748b', fontSize: '0.95rem' }}>
                      <strong style={{ color: '#1e293b' }}>Email:</strong> {user.email}
                    </span>
                  )}
                </div>
              </div>
              {!isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="btn btn-primary"
                  style={{
                    padding: '0.75rem 1.5rem',
                    fontWeight: '600',
                    borderRadius: '8px'
                  }}
                >
                  Edit Profile
                </button>
              )}
            </div>

            {/* Social Links */}
            {(formData.linkedin_url || formData.github_url || formData.portfolio_url) && (
              <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem', flexWrap: 'wrap' }}>
                {formData.linkedin_url && (
                  <a
                    href={formData.linkedin_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      padding: '0.5rem 1rem',
                      background: 'white',
                      color: '#0077b5',
                      border: '2px solid #0077b5',
                      borderRadius: '6px',
                      textDecoration: 'none',
                      fontSize: '0.9rem',
                      fontWeight: '600',
                      transition: 'all 0.3s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.background = '#0077b5';
                      e.target.style.color = 'white';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.background = 'white';
                      e.target.style.color = '#0077b5';
                    }}
                  >
                    LinkedIn
                  </a>
                )}
                {formData.github_url && (
                  <a
                    href={formData.github_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      padding: '0.5rem 1rem',
                      background: 'white',
                      color: '#333',
                      border: '2px solid #333',
                      borderRadius: '6px',
                      textDecoration: 'none',
                      fontSize: '0.9rem',
                      fontWeight: '600',
                      transition: 'all 0.3s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.background = '#333';
                      e.target.style.color = 'white';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.background = 'white';
                      e.target.style.color = '#333';
                    }}
                  >
                    GitHub
                  </a>
                )}
                {formData.portfolio_url && (
                  <a
                    href={formData.portfolio_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      padding: '0.5rem 1rem',
                      background: 'white',
                      color: '#3b82f6',
                      border: '2px solid #3b82f6',
                      borderRadius: '6px',
                      textDecoration: 'none',
                      fontSize: '0.9rem',
                      fontWeight: '600',
                      transition: 'all 0.3s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.background = '#3b82f6';
                      e.target.style.color = 'white';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.background = 'white';
                      e.target.style.color = '#3b82f6';
                    }}
                  >
                    Portfolio
                  </a>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        {isEditing && (
          <div className="card" style={{ padding: '2rem', marginBottom: '1.5rem' }}>
            <div style={{
              borderLeft: '4px solid #3b82f6',
              paddingLeft: '1rem',
              marginBottom: '1.5rem'
            }}>
              <h2 style={{ fontSize: '1.5rem', color: '#1e293b', fontWeight: '700', margin: 0 }}>
                Basic Information
              </h2>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
              {/* Full Name */}
              <div className="form-group">
                <label style={{ fontWeight: '600', color: '#4a5568', marginBottom: '0.5rem', display: 'block' }}>
                  Full Name <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input
                  type="text"
                  name="full_name"
                  value={formData.full_name}
                  onChange={handleChange}
                  required
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    borderRadius: '8px',
                    border: '2px solid #e2e8f0',
                    fontSize: '1rem'
                  }}
                />
              </div>

              {/* Date of Birth */}
              <div className="form-group">
                <label style={{ fontWeight: '600', color: '#4a5568', marginBottom: '0.5rem', display: 'block' }}>
                  Date of Birth
                </label>
                <input
                  type="date"
                  name="date_of_birth"
                  value={formData.date_of_birth}
                  onChange={handleChange}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    borderRadius: '8px',
                    border: '2px solid #e2e8f0',
                    fontSize: '1rem'
                  }}
                />
              </div>

              {/* Phone */}
              <div className="form-group">
                <label style={{ fontWeight: '600', color: '#4a5568', marginBottom: '0.5rem', display: 'block' }}>
                  Phone Number
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+1 (555) 123-4567"
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    borderRadius: '8px',
                    border: '2px solid #e2e8f0',
                    fontSize: '1rem'
                  }}
                />
              </div>

              {/* Location */}
              <div className="form-group">
                <label style={{ fontWeight: '600', color: '#4a5568', marginBottom: '0.5rem', display: 'block' }}>
                  Location
                </label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  placeholder="City, Country"
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    borderRadius: '8px',
                    border: '2px solid #e2e8f0',
                    fontSize: '1rem'
                  }}
                />
              </div>
            </div>

            {/* Headline */}
            <div className="form-group" style={{ marginTop: '1.5rem' }}>
              <label style={{ fontWeight: '600', color: '#4a5568', marginBottom: '0.5rem', display: 'block' }}>
                Professional Headline
              </label>
              <input
                type="text"
                name="headline"
                value={formData.headline}
                onChange={handleChange}
                placeholder="e.g., Senior Software Engineer | Full Stack Developer"
                maxLength={500}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  borderRadius: '8px',
                  border: '2px solid #e2e8f0',
                  fontSize: '1rem'
                }}
              />
            </div>

            {/* Social Links Section */}
            <div style={{
              borderLeft: '4px solid #3b82f6',
              paddingLeft: '1rem',
              marginTop: '2rem',
              marginBottom: '1rem'
            }}>
              <h3 style={{ fontSize: '1.2rem', color: '#1e293b', fontWeight: '700', margin: 0 }}>
                Social Links
              </h3>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
              <div className="form-group">
                <label style={{ fontWeight: '600', color: '#4a5568', marginBottom: '0.5rem', display: 'block' }}>
                  LinkedIn URL
                </label>
                <input
                  type="url"
                  name="linkedin_url"
                  value={formData.linkedin_url}
                  onChange={handleChange}
                  placeholder="https://linkedin.com/in/yourprofile"
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    borderRadius: '8px',
                    border: '2px solid #e2e8f0',
                    fontSize: '1rem'
                  }}
                />
              </div>

              <div className="form-group">
                <label style={{ fontWeight: '600', color: '#4a5568', marginBottom: '0.5rem', display: 'block' }}>
                  GitHub URL
                </label>
                <input
                  type="url"
                  name="github_url"
                  value={formData.github_url}
                  onChange={handleChange}
                  placeholder="https://github.com/yourusername"
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    borderRadius: '8px',
                    border: '2px solid #e2e8f0',
                    fontSize: '1rem'
                  }}
                />
              </div>

              <div className="form-group">
                <label style={{ fontWeight: '600', color: '#4a5568', marginBottom: '0.5rem', display: 'block' }}>
                  Portfolio URL
                </label>
                <input
                  type="url"
                  name="portfolio_url"
                  value={formData.portfolio_url}
                  onChange={handleChange}
                  placeholder="https://yourportfolio.com"
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    borderRadius: '8px',
                    border: '2px solid #e2e8f0',
                    fontSize: '1rem'
                  }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Experience Section */}
        <div className="card" style={{ padding: '2rem', marginBottom: '1.5rem' }}>
          <div style={{
            borderLeft: '4px solid #3b82f6',
            paddingLeft: '1rem',
            marginBottom: '1.5rem'
          }}>
            <h2 style={{ fontSize: '1.5rem', color: '#1e293b', fontWeight: '700', margin: 0 }}>
              Work Experience
            </h2>
          </div>
          {isEditing ? (
            <textarea
              name="experience_text"
              value={formData.experience_text}
              onChange={handleChange}
              placeholder="Describe your work experience, previous roles, achievements..."
              rows={8}
              style={{
                width: '100%',
                padding: '1rem',
                borderRadius: '8px',
                border: '2px solid #e2e8f0',
                fontSize: '1rem',
                fontFamily: 'inherit',
                resize: 'vertical'
              }}
            />
          ) : (
            <div style={{
              fontSize: '1rem',
              color: '#2d3748',
              lineHeight: '1.8',
              whiteSpace: 'pre-wrap',
              background: '#f7fafc',
              padding: '1.5rem',
              borderRadius: '8px',
              minHeight: '120px'
            }}>
              {formData.experience_text || 'No experience added yet.'}
            </div>
          )}
        </div>

        {/* Skills Section */}
        <div className="card" style={{ padding: '2rem', marginBottom: '1.5rem' }}>
          <div style={{
            borderLeft: '4px solid #3b82f6',
            paddingLeft: '1rem',
            marginBottom: '1.5rem'
          }}>
            <h2 style={{ fontSize: '1.5rem', color: '#1e293b', fontWeight: '700', margin: 0 }}>
              Skills
            </h2>
          </div>
          {isEditing ? (
            <textarea
              name="skills_text"
              value={formData.skills_text}
              onChange={handleChange}
              placeholder="List your skills, technologies, certifications..."
              rows={6}
              style={{
                width: '100%',
                padding: '1rem',
                borderRadius: '8px',
                border: '2px solid #e2e8f0',
                fontSize: '1rem',
                fontFamily: 'inherit',
                resize: 'vertical'
              }}
            />
          ) : (
            <div style={{
              fontSize: '1rem',
              color: '#2d3748',
              lineHeight: '1.8',
              whiteSpace: 'pre-wrap',
              background: '#f7fafc',
              padding: '1.5rem',
              borderRadius: '8px',
              minHeight: '100px'
            }}>
              {formData.skills_text || 'No skills added yet.'}
            </div>
          )}
        </div>

        {/* Education Section */}
        <div className="card" style={{ padding: '2rem', marginBottom: '1.5rem' }}>
          <div style={{
            borderLeft: '4px solid #3b82f6',
            paddingLeft: '1rem',
            marginBottom: '1.5rem'
          }}>
            <h2 style={{ fontSize: '1.5rem', color: '#1e293b', fontWeight: '700', margin: 0 }}>
              Education
            </h2>
          </div>
          {isEditing ? (
            <textarea
              name="education_text"
              value={formData.education_text}
              onChange={handleChange}
              placeholder="List your education, degrees, certifications..."
              rows={6}
              style={{
                width: '100%',
                padding: '1rem',
                borderRadius: '8px',
                border: '2px solid #e2e8f0',
                fontSize: '1rem',
                fontFamily: 'inherit',
                resize: 'vertical'
              }}
            />
          ) : (
            <div style={{
              fontSize: '1rem',
              color: '#2d3748',
              lineHeight: '1.8',
              whiteSpace: 'pre-wrap',
              background: '#f7fafc',
              padding: '1.5rem',
              borderRadius: '8px',
              minHeight: '100px'
            }}>
              {formData.education_text || 'No education added yet.'}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        {isEditing && (
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <button
              type="submit"
              className="btn btn-primary"
              style={{
                padding: '1rem 2.5rem',
                fontSize: '1.05rem',
                fontWeight: '600',
                borderRadius: '8px',
                minWidth: '200px'
              }}
            >
              Save Changes
            </button>
            <button
              type="button"
              onClick={handleCancel}
              className="btn btn-secondary"
              style={{
                padding: '1rem 2.5rem',
                fontSize: '1.05rem',
                fontWeight: '600',
                borderRadius: '8px',
                minWidth: '200px'
              }}
            >
              Cancel
            </button>
          </div>
        )}
      </form>

      {/* Account Info */}
      {!isEditing && (
        <div className="card" style={{ padding: '1.5rem', background: '#f7fafc' }}>
          <div style={{
            borderLeft: '4px solid #3b82f6',
            paddingLeft: '1rem',
            marginBottom: '1rem'
          }}>
            <h3 style={{ fontSize: '1.1rem', color: '#1e293b', fontWeight: '700', margin: 0 }}>
              Account Information
            </h3>
          </div>
          <div style={{ display: 'grid', gap: '0.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#64748b' }}>Email:</span>
              <span style={{ fontWeight: '600', color: '#2d3748' }}>{user?.email}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#64748b' }}>Role:</span>
              <span style={{ fontWeight: '600', color: '#2d3748', textTransform: 'capitalize' }}>
                {user?.role}
              </span>
            </div>
            {formData.date_of_birth && (
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>Date of Birth:</span>
                <span style={{ fontWeight: '600', color: '#2d3748' }}>
                  {new Date(formData.date_of_birth).toLocaleDateString()}
                </span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
