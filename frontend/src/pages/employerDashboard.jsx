import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { companiesAPI, jobsAPI, applicationsAPI } from '../api/client';

export default function EmployerDashboard() {
  const [companies, setCompanies] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [companiesRes, jobsRes, applicationsRes] = await Promise.all([
        companiesAPI.getMy(),
        jobsAPI.search({ limit: 100 }),
        applicationsAPI.getForEmployer()
      ]);

      setCompanies(companiesRes.data);

      // Filter jobs owned by user's companies
      const myCompanyIds = companiesRes.data.map(c => c.id);
      const myJobs = jobsRes.data.filter(job => myCompanyIds.includes(job.company_id));
      setJobs(myJobs);

      setApplications(applicationsRes.data);
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  const stats = {
    totalCompanies: companies.length,
    totalJobs: jobs.length,
    activeJobs: jobs.filter(j => j.status === 'open').length,
    totalApplications: applications.length,
    pendingApplications: applications.filter(a => a.status === 'applied').length,
    reviewedApplications: applications.filter(a => a.status === 'reviewed').length,
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
      {/* Hero Section with Background Image */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.97) 0%, rgba(30, 41, 59, 0.94) 50%, rgba(51, 65, 85, 0.92) 100%), url("/office-bg.png")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
        padding: '120px 0 140px',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Animated geometric overlay */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'radial-gradient(circle at 80% 30%, rgba(59, 130, 246, 0.15) 0%, transparent 50%)',
          pointerEvents: 'none'
        }}></div>

        <div style={{
          maxWidth: '1280px',
          margin: '0 auto',
          padding: '0 2rem',
          position: 'relative',
          zIndex: 1
        }}>
          {/* Badge */}
          <div style={{
            display: 'inline-block',
            background: 'rgba(59, 130, 246, 0.25)',
            backdropFilter: 'blur(16px)',
            padding: '10px 24px',
            borderRadius: '50px',
            marginBottom: '28px',
            border: '1px solid rgba(59, 130, 246, 0.4)',
            boxShadow: '0 4px 20px rgba(59, 130, 246, 0.2)'
          }}>
            <p style={{
              color: '#60a5fa',
              fontSize: '13px',
              margin: 0,
              fontWeight: '700',
              letterSpacing: '1.5px',
              textTransform: 'uppercase'
            }}>
              💼 Employer Portal
            </p>
          </div>

          {/* Main Heading */}
          <h1 style={{
            fontSize: '72px',
            fontWeight: '900',
            marginBottom: '24px',
            color: 'white',
            lineHeight: '1.1',
            letterSpacing: '-3px',
            textShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
            maxWidth: '900px'
          }}>
            Manage Your
            <br/>
            <span style={{
              background: 'linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}>Talent Acquisition</span>
          </h1>

          {/* Subtitle */}
          <p style={{
            fontSize: '22px',
            color: 'rgba(255, 255, 255, 0.9)',
            maxWidth: '700px',
            lineHeight: '1.7',
            marginBottom: '48px',
            fontWeight: '400',
            textShadow: '0 2px 8px rgba(0, 0, 0, 0.2)'
          }}>
            Access enterprise-grade tools to post jobs, manage applications, and build your dream team.
          </p>

          {/* CTA Buttons */}
          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
            <Link
              to="/employer/post-job"
              style={{
                background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                color: 'white',
                padding: '18px 36px',
                borderRadius: '14px',
                textDecoration: 'none',
                fontWeight: '700',
                fontSize: '17px',
                boxShadow: '0 8px 28px rgba(59, 130, 246, 0.5)',
                transition: 'all 0.3s ease',
                display: 'inline-block',
                border: 'none'
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-3px)';
                e.target.style.boxShadow = '0 12px 36px rgba(59, 130, 246, 0.6)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 8px 28px rgba(59, 130, 246, 0.5)';
              }}
            >
              Post New Job →
            </Link>

            <Link
              to="/employer/applications"
              style={{
                background: 'rgba(255, 255, 255, 0.12)',
                backdropFilter: 'blur(16px)',
                color: 'white',
                padding: '18px 36px',
                borderRadius: '14px',
                textDecoration: 'none',
                fontWeight: '700',
                fontSize: '17px',
                border: '2px solid rgba(255, 255, 255, 0.25)',
                transition: 'all 0.3s ease',
                display: 'inline-block'
              }}
              onMouseEnter={(e) => {
                e.target.style.background = 'rgba(255, 255, 255, 0.18)';
                e.target.style.borderColor = 'rgba(255, 255, 255, 0.35)';
                e.target.style.transform = 'translateY(-3px)';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'rgba(255, 255, 255, 0.12)';
                e.target.style.borderColor = 'rgba(255, 255, 255, 0.25)';
                e.target.style.transform = 'translateY(0)';
              }}
            >
              Review Applications
            </Link>
          </div>
        </div>
      </div>

      {/* Stats Section - Modern Glass Cards */}
      <div style={{
        maxWidth: '1280px',
        margin: '-70px auto 0',
        padding: '0 2rem',
        position: 'relative',
        zIndex: 10
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '24px',
          marginBottom: '60px'
        }}>
          {/* Companies Card */}
          <div style={{
            background: 'white',
            borderRadius: '20px',
            padding: '32px 24px',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
            border: '1px solid rgba(0, 0, 0, 0.05)',
            transition: 'all 0.3s ease',
            cursor: 'default'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-6px)';
            e.currentTarget.style.boxShadow = '0 16px 48px rgba(0, 0, 0, 0.12)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.08)';
          }}>
            <div style={{
              width: '52px',
              height: '52px',
              borderRadius: '14px',
              background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '16px',
              fontSize: '24px',
              boxShadow: '0 4px 16px rgba(139, 92, 246, 0.3)'
            }}>
              🏢
            </div>
            <h3 style={{
              fontSize: '40px',
              fontWeight: '900',
              color: '#0f172a',
              margin: '0 0 4px',
              letterSpacing: '-2px'
            }}>
              {loading ? '...' : stats.totalCompanies}
            </h3>
            <p style={{
              color: '#64748b',
              fontSize: '13px',
              margin: 0,
              fontWeight: '600',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>Companies</p>
          </div>

          {/* Total Jobs Card */}
          <div style={{
            background: 'white',
            borderRadius: '20px',
            padding: '32px 24px',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
            border: '1px solid rgba(0, 0, 0, 0.05)',
            transition: 'all 0.3s ease',
            cursor: 'default'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-6px)';
            e.currentTarget.style.boxShadow = '0 16px 48px rgba(0, 0, 0, 0.12)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.08)';
          }}>
            <div style={{
              width: '52px',
              height: '52px',
              borderRadius: '14px',
              background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '16px',
              fontSize: '24px',
              boxShadow: '0 4px 16px rgba(59, 130, 246, 0.3)'
            }}>
              💼
            </div>
            <h3 style={{
              fontSize: '40px',
              fontWeight: '900',
              color: '#0f172a',
              margin: '0 0 4px',
              letterSpacing: '-2px'
            }}>
              {loading ? '...' : stats.totalJobs}
            </h3>
            <p style={{
              color: '#64748b',
              fontSize: '13px',
              margin: 0,
              fontWeight: '600',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>Total Jobs</p>
          </div>

          {/* Active Jobs Card */}
          <div style={{
            background: 'white',
            borderRadius: '20px',
            padding: '32px 24px',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
            border: '1px solid rgba(0, 0, 0, 0.05)',
            transition: 'all 0.3s ease',
            cursor: 'default'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-6px)';
            e.currentTarget.style.boxShadow = '0 16px 48px rgba(0, 0, 0, 0.12)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.08)';
          }}>
            <div style={{
              width: '52px',
              height: '52px',
              borderRadius: '14px',
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '16px',
              fontSize: '24px',
              boxShadow: '0 4px 16px rgba(16, 185, 129, 0.3)'
            }}>
              ✓
            </div>
            <h3 style={{
              fontSize: '40px',
              fontWeight: '900',
              color: '#0f172a',
              margin: '0 0 4px',
              letterSpacing: '-2px'
            }}>
              {loading ? '...' : stats.activeJobs}
            </h3>
            <p style={{
              color: '#64748b',
              fontSize: '13px',
              margin: 0,
              fontWeight: '600',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>Active Jobs</p>
          </div>

          {/* Total Applications Card */}
          <div style={{
            background: 'white',
            borderRadius: '20px',
            padding: '32px 24px',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
            border: '1px solid rgba(0, 0, 0, 0.05)',
            transition: 'all 0.3s ease',
            cursor: 'default'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-6px)';
            e.currentTarget.style.boxShadow = '0 16px 48px rgba(0, 0, 0, 0.12)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.08)';
          }}>
            <div style={{
              width: '52px',
              height: '52px',
              borderRadius: '14px',
              background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '16px',
              fontSize: '24px',
              boxShadow: '0 4px 16px rgba(245, 158, 11, 0.3)'
            }}>
              📋
            </div>
            <h3 style={{
              fontSize: '40px',
              fontWeight: '900',
              color: '#0f172a',
              margin: '0 0 4px',
              letterSpacing: '-2px'
            }}>
              {loading ? '...' : stats.totalApplications}
            </h3>
            <p style={{
              color: '#64748b',
              fontSize: '13px',
              margin: 0,
              fontWeight: '600',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>Applications</p>
          </div>

          {/* Pending Review Card */}
          <div style={{
            background: 'white',
            borderRadius: '20px',
            padding: '32px 24px',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
            border: '1px solid rgba(0, 0, 0, 0.05)',
            transition: 'all 0.3s ease',
            cursor: 'default'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-6px)';
            e.currentTarget.style.boxShadow = '0 16px 48px rgba(0, 0, 0, 0.12)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.08)';
          }}>
            <div style={{
              width: '52px',
              height: '52px',
              borderRadius: '14px',
              background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '16px',
              fontSize: '24px',
              boxShadow: '0 4px 16px rgba(239, 68, 68, 0.3)'
            }}>
              ⏱️
            </div>
            <h3 style={{
              fontSize: '40px',
              fontWeight: '900',
              color: '#0f172a',
              margin: '0 0 4px',
              letterSpacing: '-2px'
            }}>
              {loading ? '...' : stats.pendingApplications}
            </h3>
            <p style={{
              color: '#64748b',
              fontSize: '13px',
              margin: 0,
              fontWeight: '600',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>Pending Review</p>
          </div>
        </div>

        {/* Quick Actions Section */}
        <div style={{ marginBottom: '60px' }}>
          <h2 style={{
            fontSize: '36px',
            fontWeight: '900',
            color: '#0f172a',
            marginBottom: '32px',
            letterSpacing: '-1.5px'
          }}>Quick Actions</h2>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '24px'
          }}>
            {/* Manage Companies */}
            <Link
              to="/employer/companies"
              style={{
                background: 'white',
                borderRadius: '20px',
                padding: '40px 32px',
                textDecoration: 'none',
                border: '1px solid rgba(0, 0, 0, 0.06)',
                boxShadow: '0 4px 16px rgba(0, 0, 0, 0.05)',
                transition: 'all 0.3s ease',
                display: 'block',
                position: 'relative',
                overflow: 'hidden'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-8px)';
                e.currentTarget.style.boxShadow = '0 20px 48px rgba(139, 92, 246, 0.15)';
                e.currentTarget.style.borderColor = 'rgba(139, 92, 246, 0.3)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 16px rgba(0, 0, 0, 0.05)';
                e.currentTarget.style.borderColor = 'rgba(0, 0, 0, 0.06)';
              }}
            >
              <div style={{
                width: '64px',
                height: '64px',
                borderRadius: '16px',
                background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '20px',
                fontSize: '32px',
                boxShadow: '0 8px 24px rgba(139, 92, 246, 0.3)'
              }}>
                🏢
              </div>
              <h3 style={{
                fontSize: '24px',
                fontWeight: '800',
                color: '#0f172a',
                marginBottom: '10px',
                letterSpacing: '-0.5px'
              }}>Manage Companies</h3>
              <p style={{
                color: '#64748b',
                fontSize: '15px',
                margin: 0,
                lineHeight: '1.6'
              }}>Create and edit your company profiles</p>
            </Link>

            {/* Post New Job */}
            <Link
              to="/employer/post-job"
              style={{
                background: 'white',
                borderRadius: '20px',
                padding: '40px 32px',
                textDecoration: 'none',
                border: '1px solid rgba(0, 0, 0, 0.06)',
                boxShadow: '0 4px 16px rgba(0, 0, 0, 0.05)',
                transition: 'all 0.3s ease',
                display: 'block',
                position: 'relative',
                overflow: 'hidden'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-8px)';
                e.currentTarget.style.boxShadow = '0 20px 48px rgba(59, 130, 246, 0.15)';
                e.currentTarget.style.borderColor = 'rgba(59, 130, 246, 0.3)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 16px rgba(0, 0, 0, 0.05)';
                e.currentTarget.style.borderColor = 'rgba(0, 0, 0, 0.06)';
              }}
            >
              <div style={{
                width: '64px',
                height: '64px',
                borderRadius: '16px',
                background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '20px',
                fontSize: '32px',
                boxShadow: '0 8px 24px rgba(59, 130, 246, 0.3)'
              }}>
                ✏️
              </div>
              <h3 style={{
                fontSize: '24px',
                fontWeight: '800',
                color: '#0f172a',
                marginBottom: '10px',
                letterSpacing: '-0.5px'
              }}>Post New Job</h3>
              <p style={{
                color: '#64748b',
                fontSize: '15px',
                margin: 0,
                lineHeight: '1.6'
              }}>Create a new job listing to attract talent</p>
            </Link>

            {/* View Applications */}
            <Link
              to="/employer/applications"
              style={{
                background: 'white',
                borderRadius: '20px',
                padding: '40px 32px',
                textDecoration: 'none',
                border: '1px solid rgba(0, 0, 0, 0.06)',
                boxShadow: '0 4px 16px rgba(0, 0, 0, 0.05)',
                transition: 'all 0.3s ease',
                display: 'block',
                position: 'relative',
                overflow: 'hidden'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-8px)';
                e.currentTarget.style.boxShadow = '0 20px 48px rgba(16, 185, 129, 0.15)';
                e.currentTarget.style.borderColor = 'rgba(16, 185, 129, 0.3)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 16px rgba(0, 0, 0, 0.05)';
                e.currentTarget.style.borderColor = 'rgba(0, 0, 0, 0.06)';
              }}
            >
              <div style={{
                width: '64px',
                height: '64px',
                borderRadius: '16px',
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '20px',
                fontSize: '32px',
                boxShadow: '0 8px 24px rgba(16, 185, 129, 0.3)'
              }}>
                📊
              </div>
              <h3 style={{
                fontSize: '24px',
                fontWeight: '800',
                color: '#0f172a',
                marginBottom: '10px',
                letterSpacing: '-0.5px'
              }}>View Applications</h3>
              <p style={{
                color: '#64748b',
                fontSize: '15px',
                margin: 0,
                lineHeight: '1.6'
              }}>Review and manage job applications</p>
            </Link>
          </div>
        </div>

        {/* Empty State */}
        {companies.length === 0 && !loading && (
          <div style={{
            background: 'white',
            borderRadius: '24px',
            padding: '80px 48px',
            textAlign: 'center',
            border: '2px dashed rgba(0, 0, 0, 0.1)',
            marginBottom: '60px'
          }}>
            <div style={{
              width: '96px',
              height: '96px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 24px',
              fontSize: '48px'
            }}>
              🏢
            </div>
            <h3 style={{
              fontSize: '32px',
              fontWeight: '900',
              color: '#0f172a',
              marginBottom: '16px',
              letterSpacing: '-1px'
            }}>No Companies Yet</h3>
            <p style={{
              color: '#64748b',
              fontSize: '18px',
              marginBottom: '36px',
              maxWidth: '500px',
              margin: '0 auto 36px',
              lineHeight: '1.6'
            }}>Create your first company profile to start posting jobs and hiring top talent</p>
            <Link
              to="/employer/companies"
              style={{
                background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                color: 'white',
                padding: '16px 40px',
                borderRadius: '14px',
                textDecoration: 'none',
                fontWeight: '700',
                fontSize: '17px',
                boxShadow: '0 6px 24px rgba(59, 130, 246, 0.4)',
                transition: 'all 0.3s ease',
                display: 'inline-block',
                border: 'none'
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 10px 32px rgba(59, 130, 246, 0.5)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 6px 24px rgba(59, 130, 246, 0.4)';
              }}
            >
              Create Your First Company →
            </Link>
          </div>
        )}
      </div>

      <div style={{ height: '80px' }}></div>
    </div>
  );
}
