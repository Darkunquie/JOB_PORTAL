import React, { useState, useEffect } from 'react';
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
        background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 59, 0.92) 100%), url("https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1920&q=80")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
        padding: '100px 0 120px',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Animated light streaks overlay */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'linear-gradient(45deg, transparent 30%, rgba(59, 130, 246, 0.05) 50%, transparent 70%)',
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
            background: 'rgba(59, 130, 246, 0.2)',
            backdropFilter: 'blur(10px)',
            padding: '8px 20px',
            borderRadius: '50px',
            marginBottom: '24px',
            border: '1px solid rgba(59, 130, 246, 0.3)'
          }}>
            <p style={{
              color: '#60a5fa',
              fontSize: '14px',
              margin: 0,
              fontWeight: '600',
              letterSpacing: '0.5px'
            }}>
              EMPLOYER PORTAL
            </p>
          </div>

          {/* Main Heading */}
          <h1 style={{
            fontSize: '64px',
            fontWeight: '800',
            marginBottom: '20px',
            color: 'white',
            lineHeight: '1.1',
            letterSpacing: '-2px',
            textShadow: '0 4px 20px rgba(0, 0, 0, 0.3)'
          }}>
            Manage Your<br/>
            <span style={{
              background: 'linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}>Talent Acquisition</span>
          </h1>

          {/* Subtitle */}
          <p style={{
            fontSize: '20px',
            color: 'rgba(255, 255, 255, 0.8)',
            maxWidth: '600px',
            lineHeight: '1.6',
            marginBottom: '40px',
            fontWeight: '400'
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
                padding: '16px 32px',
                borderRadius: '12px',
                textDecoration: 'none',
                fontWeight: '700',
                fontSize: '16px',
                boxShadow: '0 8px 24px rgba(59, 130, 246, 0.4)',
                transition: 'all 0.3s ease',
                display: 'inline-block'
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 12px 32px rgba(59, 130, 246, 0.5)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 8px 24px rgba(59, 130, 246, 0.4)';
              }}
            >
              Post New Job →
            </Link>

            <Link
              to="/employer/applications"
              style={{
                background: 'rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(10px)',
                color: 'white',
                padding: '16px 32px',
                borderRadius: '12px',
                textDecoration: 'none',
                fontWeight: '700',
                fontSize: '16px',
                border: '2px solid rgba(255, 255, 255, 0.2)',
                transition: 'all 0.3s ease',
                display: 'inline-block'
              }}
              onMouseEnter={(e) => {
                e.target.style.background = 'rgba(255, 255, 255, 0.15)';
                e.target.style.borderColor = 'rgba(255, 255, 255, 0.3)';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'rgba(255, 255, 255, 0.1)';
                e.target.style.borderColor = 'rgba(255, 255, 255, 0.2)';
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
        margin: '-60px auto 0',
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
            borderRadius: '16px',
            padding: '32px 24px',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
            border: '1px solid rgba(0, 0, 0, 0.05)',
            transition: 'all 0.3s ease',
            cursor: 'default'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-4px)';
            e.currentTarget.style.boxShadow = '0 12px 40px rgba(0, 0, 0, 0.12)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.08)';
          }}>
            <h3 style={{
              fontSize: '36px',
              fontWeight: '800',
              color: '#0f172a',
              margin: '0 0 4px',
              letterSpacing: '-1px'
            }}>
              {loading ? '...' : stats.totalCompanies}
            </h3>
            <p style={{
              color: '#64748b',
              fontSize: '14px',
              margin: 0,
              fontWeight: '600',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>Companies</p>
          </div>

          {/* Total Jobs Card */}
          <div style={{
            background: 'white',
            borderRadius: '16px',
            padding: '32px 24px',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
            border: '1px solid rgba(0, 0, 0, 0.05)',
            transition: 'all 0.3s ease',
            cursor: 'default'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-4px)';
            e.currentTarget.style.boxShadow = '0 12px 40px rgba(0, 0, 0, 0.12)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.08)';
          }}>
            <h3 style={{
              fontSize: '36px',
              fontWeight: '800',
              color: '#0f172a',
              margin: '0 0 4px',
              letterSpacing: '-1px'
            }}>
              {loading ? '...' : stats.totalJobs}
            </h3>
            <p style={{
              color: '#64748b',
              fontSize: '14px',
              margin: 0,
              fontWeight: '600',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>Total Jobs</p>
          </div>

          {/* Active Jobs Card */}
          <div style={{
            background: 'white',
            borderRadius: '16px',
            padding: '32px 24px',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
            border: '1px solid rgba(0, 0, 0, 0.05)',
            transition: 'all 0.3s ease',
            cursor: 'default'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-4px)';
            e.currentTarget.style.boxShadow = '0 12px 40px rgba(0, 0, 0, 0.12)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.08)';
          }}>
            <h3 style={{
              fontSize: '36px',
              fontWeight: '800',
              color: '#0f172a',
              margin: '0 0 4px',
              letterSpacing: '-1px'
            }}>
              {loading ? '...' : stats.activeJobs}
            </h3>
            <p style={{
              color: '#64748b',
              fontSize: '14px',
              margin: 0,
              fontWeight: '600',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>Active Jobs</p>
          </div>

          {/* Total Applications Card */}
          <div style={{
            background: 'white',
            borderRadius: '16px',
            padding: '32px 24px',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
            border: '1px solid rgba(0, 0, 0, 0.05)',
            transition: 'all 0.3s ease',
            cursor: 'default'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-4px)';
            e.currentTarget.style.boxShadow = '0 12px 40px rgba(0, 0, 0, 0.12)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.08)';
          }}>
            <h3 style={{
              fontSize: '36px',
              fontWeight: '800',
              color: '#0f172a',
              margin: '0 0 4px',
              letterSpacing: '-1px'
            }}>
              {loading ? '...' : stats.totalApplications}
            </h3>
            <p style={{
              color: '#64748b',
              fontSize: '14px',
              margin: 0,
              fontWeight: '600',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>Applications</p>
          </div>

          {/* Pending Review Card */}
          <div style={{
            background: 'white',
            borderRadius: '16px',
            padding: '32px 24px',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
            border: '1px solid rgba(0, 0, 0, 0.05)',
            transition: 'all 0.3s ease',
            cursor: 'default'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-4px)';
            e.currentTarget.style.boxShadow = '0 12px 40px rgba(0, 0, 0, 0.12)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.08)';
          }}>
            <h3 style={{
              fontSize: '36px',
              fontWeight: '800',
              color: '#0f172a',
              margin: '0 0 4px',
              letterSpacing: '-1px'
            }}>
              {loading ? '...' : stats.pendingApplications}
            </h3>
            <p style={{
              color: '#64748b',
              fontSize: '14px',
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
            fontSize: '32px',
            fontWeight: '800',
            color: '#0f172a',
            marginBottom: '32px',
            letterSpacing: '-1px'
          }}>Quick Actions</h2>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '24px'
          }}>
            {/* Manage Companies */}
            <Link
              to="/employer/companies"
              style={{
                background: 'white',
                borderRadius: '16px',
                padding: '32px',
                textDecoration: 'none',
                border: '1px solid rgba(0, 0, 0, 0.05)',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
                transition: 'all 0.3s ease',
                display: 'block'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 12px 32px rgba(0, 0, 0, 0.1)';
                e.currentTarget.style.borderColor = 'rgba(59, 130, 246, 0.3)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.04)';
                e.currentTarget.style.borderColor = 'rgba(0, 0, 0, 0.05)';
              }}
            >
              <h3 style={{
                fontSize: '20px',
                fontWeight: '700',
                color: '#0f172a',
                marginBottom: '8px',
                letterSpacing: '-0.5px'
              }}>Manage Companies</h3>
              <p style={{
                color: '#64748b',
                fontSize: '14px',
                margin: 0,
                lineHeight: '1.6'
              }}>Create and edit your company profiles</p>
            </Link>

            {/* Post New Job */}
            <Link
              to="/employer/post-job"
              style={{
                background: 'white',
                borderRadius: '16px',
                padding: '32px',
                textDecoration: 'none',
                border: '1px solid rgba(0, 0, 0, 0.05)',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
                transition: 'all 0.3s ease',
                display: 'block'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 12px 32px rgba(0, 0, 0, 0.1)';
                e.currentTarget.style.borderColor = 'rgba(139, 92, 246, 0.3)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.04)';
                e.currentTarget.style.borderColor = 'rgba(0, 0, 0, 0.05)';
              }}
            >
              <h3 style={{
                fontSize: '20px',
                fontWeight: '700',
                color: '#0f172a',
                marginBottom: '8px',
                letterSpacing: '-0.5px'
              }}>Post New Job</h3>
              <p style={{
                color: '#64748b',
                fontSize: '14px',
                margin: 0,
                lineHeight: '1.6'
              }}>Create a new job listing to attract talent</p>
            </Link>

            {/* View Applications */}
            <Link
              to="/employer/applications"
              style={{
                background: 'white',
                borderRadius: '16px',
                padding: '32px',
                textDecoration: 'none',
                border: '1px solid rgba(0, 0, 0, 0.05)',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
                transition: 'all 0.3s ease',
                display: 'block'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 12px 32px rgba(0, 0, 0, 0.1)';
                e.currentTarget.style.borderColor = 'rgba(16, 185, 129, 0.3)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.04)';
                e.currentTarget.style.borderColor = 'rgba(0, 0, 0, 0.05)';
              }}
            >
              <h3 style={{
                fontSize: '20px',
                fontWeight: '700',
                color: '#0f172a',
                marginBottom: '8px',
                letterSpacing: '-0.5px'
              }}>View Applications</h3>
              <p style={{
                color: '#64748b',
                fontSize: '14px',
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
            borderRadius: '16px',
            padding: '60px 40px',
            textAlign: 'center',
            border: '2px dashed rgba(0, 0, 0, 0.1)'
          }}>
            <h3 style={{
              fontSize: '24px',
              fontWeight: '700',
              color: '#0f172a',
              marginBottom: '12px',
              letterSpacing: '-0.5px'
            }}>No Companies Yet</h3>
            <p style={{
              color: '#64748b',
              fontSize: '16px',
              marginBottom: '32px',
              maxWidth: '400px',
              margin: '0 auto 32px'
            }}>Create your first company profile to start posting jobs and hiring talent</p>
            <Link
              to="/employer/companies"
              style={{
                background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                color: 'white',
                padding: '14px 32px',
                borderRadius: '12px',
                textDecoration: 'none',
                fontWeight: '700',
                fontSize: '16px',
                boxShadow: '0 4px 16px rgba(59, 130, 246, 0.3)',
                transition: 'all 0.3s ease',
                display: 'inline-block'
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 8px 24px rgba(59, 130, 246, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 4px 16px rgba(59, 130, 246, 0.3)';
              }}
            >
              Create Your First Company
            </Link>
          </div>
        )}
      </div>

      <div style={{ height: '60px' }}></div>
    </div>
  );
}
