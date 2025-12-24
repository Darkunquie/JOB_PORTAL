import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { jobsAPI } from '../api/client';
import { format } from 'date-fns';

export default function HomePage() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [searchLocation, setSearchLocation] = useState('');

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const jobsResponse = await jobsAPI.search({ limit: 10 });
      setJobs(jobsResponse.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const params = {};
    if (searchKeyword) params.search = searchKeyword;
    if (searchLocation) params.location = searchLocation;

    jobsAPI.search(params).then(response => {
      setJobs(response.data);
    }).catch(error => {
      console.error('Error searching jobs:', error);
    });
  };

  return (
    <div style={{ minHeight: '100vh', background: '#FAFBFC' }}>
      {/* Hero Section - Modern gradient design */}
      <div style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: '100px 0 120px',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Bokeh circles effect overlay */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          pointerEvents: 'none',
          overflow: 'hidden'
        }}>
          <div style={{
            position: 'absolute',
            width: '150px',
            height: '150px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(255, 255, 255, 0.6) 0%, rgba(255, 255, 255, 0.2) 50%, transparent 70%)',
            bottom: '-20px',
            left: '5%',
            filter: 'blur(3px)'
          }}></div>
          <div style={{
            position: 'absolute',
            width: '100px',
            height: '100px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(200, 220, 255, 0.5) 0%, rgba(200, 220, 255, 0.2) 50%, transparent 70%)',
            bottom: '10%',
            left: '15%',
            filter: 'blur(2px)'
          }}></div>
          <div style={{
            position: 'absolute',
            width: '200px',
            height: '200px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(255, 255, 255, 0.4) 0%, rgba(255, 255, 255, 0.15) 50%, transparent 70%)',
            bottom: '-50px',
            left: '25%',
            filter: 'blur(4px)'
          }}></div>
          <div style={{
            position: 'absolute',
            width: '120px',
            height: '120px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(180, 210, 255, 0.5) 0%, rgba(180, 210, 255, 0.2) 50%, transparent 70%)',
            bottom: '5%',
            left: '35%',
            filter: 'blur(3px)'
          }}></div>
          <div style={{
            position: 'absolute',
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(255, 255, 255, 0.7) 0%, rgba(255, 255, 255, 0.3) 50%, transparent 70%)',
            bottom: '15%',
            left: '45%',
            filter: 'blur(2px)'
          }}></div>
          <div style={{
            position: 'absolute',
            width: '140px',
            height: '140px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(220, 235, 255, 0.6) 0%, rgba(220, 235, 255, 0.25) 50%, transparent 70%)',
            bottom: '-10px',
            right: '40%',
            filter: 'blur(3px)'
          }}></div>
          <div style={{
            position: 'absolute',
            width: '180px',
            height: '180px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(255, 255, 255, 0.5) 0%, rgba(255, 255, 255, 0.2) 50%, transparent 70%)',
            bottom: '8%',
            right: '25%',
            filter: 'blur(4px)'
          }}></div>
          <div style={{
            position: 'absolute',
            width: '90px',
            height: '90px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(190, 215, 255, 0.6) 0%, rgba(190, 215, 255, 0.25) 50%, transparent 70%)',
            bottom: '20%',
            right: '15%',
            filter: 'blur(2px)'
          }}></div>
          <div style={{
            position: 'absolute',
            width: '250px',
            height: '250px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(255, 255, 255, 0.35) 0%, rgba(255, 255, 255, 0.12) 50%, transparent 70%)',
            bottom: '-80px',
            right: '5%',
            filter: 'blur(5px)'
          }}></div>
          <div style={{
            position: 'absolute',
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(255, 255, 255, 0.8) 0%, rgba(255, 255, 255, 0.4) 50%, transparent 70%)',
            bottom: '12%',
            left: '8%',
            filter: 'blur(1.5px)'
          }}></div>
        </div>

        {/* Abstract geometric shapes */}
        <div style={{
          position: 'absolute',
          top: '10%',
          right: '5%',
          width: '300px',
          height: '300px',
          background: 'rgba(255, 255, 255, 0.1)',
          borderRadius: '50%',
          filter: 'blur(60px)'
        }}></div>
        <div style={{
          position: 'absolute',
          bottom: '15%',
          left: '8%',
          width: '200px',
          height: '200px',
          background: 'rgba(255, 255, 255, 0.08)',
          borderRadius: '50%',
          filter: 'blur(50px)'
        }}></div>

        <div style={{
          maxWidth: '1280px',
          margin: '0 auto',
          padding: '0 2rem',
          textAlign: 'center',
          position: 'relative',
          zIndex: 1
        }}>
          <div style={{
            display: 'inline-block',
            background: 'rgba(255, 255, 255, 0.15)',
            backdropFilter: 'blur(10px)',
            padding: '8px 20px',
            borderRadius: '50px',
            marginBottom: '32px',
            border: '1px solid rgba(255, 255, 255, 0.2)'
          }}>
            <p style={{
              color: 'white',
              fontSize: '14px',
              margin: 0,
              fontWeight: '600',
              letterSpacing: '0.3px'
            }}>
              🚀 50,000+ opportunities waiting for you
            </p>
          </div>

          <h1 style={{
            fontSize: '64px',
            fontWeight: '800',
            marginBottom: '24px',
            color: 'white',
            lineHeight: '1.15',
            letterSpacing: '-1.5px',
            textShadow: '0 2px 20px rgba(0, 0, 0, 0.1)'
          }}>
            Discover Your Next<br/>
            <span style={{
              background: 'linear-gradient(90deg, #fbbf24 0%, #f59e0b 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}>Career Adventure</span>
          </h1>

          <p style={{
            fontSize: '20px',
            color: 'rgba(255, 255, 255, 0.9)',
            maxWidth: '680px',
            margin: '0 auto 48px',
            lineHeight: '1.7',
            fontWeight: '400'
          }}>
            Connect with top employers worldwide. Find remote, hybrid, or on-site positions tailored to your skills and ambitions.
          </p>

          {/* Modern Search Box */}
          <div style={{
            background: 'white',
            borderRadius: '16px',
            padding: '10px',
            maxWidth: '900px',
            margin: '0 auto',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.2)',
            display: 'flex',
            gap: '10px'
          }}>
            <form onSubmit={handleSearch} style={{ display: 'flex', gap: '10px', width: '100%', alignItems: 'center' }}>
              <div style={{
                flex: '1',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '16px 20px',
                background: '#f9fafb',
                borderRadius: '12px',
                border: '2px solid transparent',
                transition: 'all 0.3s'
              }}>
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" style={{ flexShrink: 0 }}>
                  <path d="M17.5 17.5L14.5834 14.5833M16.6667 9.58333C16.6667 13.4954 13.4954 16.6667 9.58333 16.6667C5.67132 16.6667 2.5 13.4954 2.5 9.58333C2.5 5.67132 5.67132 2.5 9.58333 2.5C13.4954 2.5 16.6667 5.67132 16.6667 9.58333Z" stroke="#6b7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <input
                  type="text"
                  placeholder="Job title, skills, or company"
                  value={searchKeyword}
                  onChange={(e) => setSearchKeyword(e.target.value)}
                  style={{
                    border: 'none',
                    outline: 'none',
                    background: 'transparent',
                    fontSize: '15px',
                    color: '#111827',
                    width: '100%',
                    fontWeight: '500'
                  }}
                />
              </div>

              <div style={{
                flex: '1',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '16px 20px',
                background: '#f9fafb',
                borderRadius: '12px',
                border: '2px solid transparent',
                transition: 'all 0.3s'
              }}>
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" style={{ flexShrink: 0 }}>
                  <path d="M17.5 8.33333C17.5 14.1667 10 19.1667 10 19.1667C10 19.1667 2.5 14.1667 2.5 8.33333C2.5 6.34421 3.29018 4.4366 4.6967 3.03007C6.10322 1.62355 8.01088 0.833333 10 0.833333C11.9891 0.833333 13.8968 1.62355 15.3033 3.03007C16.7098 4.4366 17.5 6.34421 17.5 8.33333Z" stroke="#6b7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M10 10.8333C11.3807 10.8333 12.5 9.71405 12.5 8.33333C12.5 6.95262 11.3807 5.83333 10 5.83333C8.61929 5.83333 7.5 6.95262 7.5 8.33333C7.5 9.71405 8.61929 10.8333 10 10.8333Z" stroke="#6b7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <input
                  type="text"
                  placeholder="Location or remote"
                  value={searchLocation}
                  onChange={(e) => setSearchLocation(e.target.value)}
                  style={{
                    border: 'none',
                    outline: 'none',
                    background: 'transparent',
                    fontSize: '15px',
                    color: '#111827',
                    width: '100%',
                    fontWeight: '500'
                  }}
                />
              </div>

              <button
                type="submit"
                style={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '16px 36px',
                  fontSize: '15px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.3s',
                  boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)',
                  letterSpacing: '0.3px'
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 8px 25px rgba(102, 126, 234, 0.5)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 4px 15px rgba(102, 126, 234, 0.4)';
                }}
              >
                Search Jobs
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Latest Opportunities - Modern design */}
      <div style={{ padding: '100px 0', background: 'white' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 2rem' }}>
          <div style={{
            textAlign: 'center',
            marginBottom: '56px'
          }}>
            <h2 style={{
              fontSize: '48px',
              fontWeight: '800',
              color: '#111827',
              marginBottom: '16px',
              letterSpacing: '-1.2px'
            }}>
              Featured <span style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}>Opportunities</span>
            </h2>
            <p style={{ color: '#6b7280', fontSize: '18px', margin: 0, maxWidth: '600px', marginLeft: 'auto', marginRight: 'auto' }}>
              Discover handpicked roles from top companies matching your skills and experience
            </p>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '60px 0' }}>
              <div className="spinner"></div>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '24px' }}>
              {jobs.slice(0, 6).map((job, index) => (
                <Link
                  key={job.id}
                  to={`/jobs/${job.id}`}
                  style={{
                    background: 'white',
                    border: '1px solid rgba(0, 0, 0, 0.08)',
                    borderRadius: '20px',
                    padding: '32px',
                    display: 'block',
                    textDecoration: 'none',
                    color: 'inherit',
                    transition: 'all 0.3s',
                    position: 'relative',
                    overflow: 'hidden'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-4px)';
                    e.currentTarget.style.boxShadow = '0 20px 40px rgba(0,0,0,0.12)';
                    e.currentTarget.style.borderColor = 'rgba(102, 126, 234, 0.3)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
                    e.currentTarget.style.borderColor = 'rgba(0, 0, 0, 0.08)';
                  }}
                >
                  <div style={{ display: 'flex', gap: '20px', marginBottom: '20px' }}>
                    <div style={{
                      width: '64px',
                      height: '64px',
                      background: `linear-gradient(135deg, ${getJobBgColor(index)} 0%, ${getJobBgColor(index)}dd 100%)`,
                      borderRadius: '16px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontSize: '22px',
                      fontWeight: '800',
                      flexShrink: 0,
                      boxShadow: `0 8px 20px ${getJobBgColor(index)}40`
                    }}>
                      {(job.company?.name || 'JB').substring(0, 2).toUpperCase()}
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <h3 style={{
                        fontSize: '20px',
                        fontWeight: '700',
                        color: '#111827',
                        margin: '0 0 8px',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}>
                        {job.title}
                      </h3>
                      <p style={{
                        fontSize: '15px',
                        color: '#6b7280',
                        margin: 0,
                        fontWeight: '600'
                      }}>
                        {job.company?.name || 'Company'}
                      </p>
                    </div>
                  </div>

                  <div style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '12px',
                    marginBottom: '20px'
                  }}>
                    <span style={{
                      padding: '6px 14px',
                      borderRadius: '8px',
                      fontSize: '13px',
                      fontWeight: '700',
                      letterSpacing: '0.2px',
                      ...getEmploymentTypeBadgeStyle(job.employment_type)
                    }}>
                      {formatEmploymentType(job.employment_type)}
                    </span>
                    <span style={{
                      padding: '6px 14px',
                      background: '#f3f4f6',
                      color: '#374151',
                      borderRadius: '8px',
                      fontSize: '13px',
                      fontWeight: '600',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}>
                      📍 {job.location || 'Remote'}
                    </span>
                    {(job.salary_min || job.salary_max) && (
                      <span style={{
                        padding: '6px 14px',
                        background: 'linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)',
                        color: '#065f46',
                        borderRadius: '8px',
                        fontSize: '13px',
                        fontWeight: '700',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}>
                        💰 {formatSalary(job.salary_min, job.salary_max)}
                      </span>
                    )}
                  </div>

                  <p style={{
                    fontSize: '14px',
                    color: '#6b7280',
                    lineHeight: '1.7',
                    margin: '0 0 20px',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden'
                  }}>
                    {job.description?.substring(0, 150)}...
                  </p>

                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    paddingTop: '20px',
                    borderTop: '1px solid #f3f4f6'
                  }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#9ca3af', fontWeight: '600' }}>
                      🕒 {format(new Date(job.created_at), 'MMM dd, yyyy')}
                    </span>
                    <div style={{
                      padding: '10px 20px',
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      color: 'white',
                      borderRadius: '10px',
                      fontSize: '14px',
                      fontWeight: '700',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      letterSpacing: '0.3px'
                    }}>
                      View Details →
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {/* View All Jobs Button */}
          {jobs.length > 6 && (
            <div style={{ textAlign: 'center', marginTop: '48px' }}>
              <button style={{
                background: '#3B82F6',
                color: 'white',
                border: 'none',
                borderRadius: '10px',
                padding: '14px 40px',
                fontSize: '15px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.3s'
              }}
              onMouseEnter={(e) => {
                e.target.style.background = '#2563EB';
                e.target.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = '#3B82F6';
                e.target.style.transform = 'translateY(0)';
              }}>
                View All {jobs.length} Jobs →
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Footer - Modern gradient design */}
      <div style={{
        background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
        padding: '80px 0 40px',
        color: 'white',
        position: 'relative'
      }}>
        <div style={{
          maxWidth: '1280px',
          margin: '0 auto',
          padding: '0 2rem'
        }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '60px',
            marginBottom: '60px'
          }}>
            <div>
              <Link to="/" style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                marginBottom: '24px',
                textDecoration: 'none',
                color: 'inherit'
              }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  borderRadius: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '18px',
                  fontWeight: '700',
                  boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)'
                }}>JF</div>
                <span style={{ fontSize: '22px', fontWeight: '800' }}>JobFlow</span>
              </Link>
              <p style={{ fontSize: '15px', color: '#94A3B8', lineHeight: '1.7', marginBottom: '24px' }}>
                Connecting talented professionals with exceptional career opportunities worldwide.
              </p>
              <div style={{ display: 'flex', gap: '12px' }}>
                <a href="#" style={{
                  width: '40px',
                  height: '40px',
                  background: 'rgba(255, 255, 255, 0.1)',
                  borderRadius: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  textDecoration: 'none',
                  fontSize: '18px',
                  transition: 'all 0.3s'
                }}>𝕏</a>
                <a href="#" style={{
                  width: '40px',
                  height: '40px',
                  background: 'rgba(255, 255, 255, 0.1)',
                  borderRadius: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  textDecoration: 'none',
                  fontSize: '18px',
                  transition: 'all 0.3s'
                }}>in</a>
                <a href="#" style={{
                  width: '40px',
                  height: '40px',
                  background: 'rgba(255, 255, 255, 0.1)',
                  borderRadius: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  textDecoration: 'none',
                  fontSize: '18px',
                  transition: 'all 0.3s'
                }}>f</a>
              </div>
            </div>

            <div>
              <h4 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '20px' }}>For Job Seekers</h4>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                <li style={{ marginBottom: '12px' }}>
                  <a href="#" style={{ color: '#94A3B8', textDecoration: 'none', fontSize: '14px' }}>Browse Jobs</a>
                </li>
                <li style={{ marginBottom: '12px' }}>
                  <a href="#" style={{ color: '#94A3B8', textDecoration: 'none', fontSize: '14px' }}>Companies</a>
                </li>
                <li style={{ marginBottom: '12px' }}>
                  <a href="#" style={{ color: '#94A3B8', textDecoration: 'none', fontSize: '14px' }}>Salaries</a>
                </li>
                <li style={{ marginBottom: '12px' }}>
                  <a href="#" style={{ color: '#94A3B8', textDecoration: 'none', fontSize: '14px' }}>Resources</a>
                </li>
              </ul>
            </div>

            <div>
              <h4 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '20px' }}>For Companies</h4>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                <li style={{ marginBottom: '12px' }}>
                  <a href="#" style={{ color: '#94A3B8', textDecoration: 'none', fontSize: '14px' }}>Post a Job</a>
                </li>
                <li style={{ marginBottom: '12px' }}>
                  <a href="#" style={{ color: '#94A3B8', textDecoration: 'none', fontSize: '14px' }}>Browse Talent</a>
                </li>
                <li style={{ marginBottom: '12px' }}>
                  <a href="#" style={{ color: '#94A3B8', textDecoration: 'none', fontSize: '14px' }}>Solutions</a>
                </li>
                <li style={{ marginBottom: '12px' }}>
                  <a href="#" style={{ color: '#94A3B8', textDecoration: 'none', fontSize: '14px' }}>Pricing</a>
                </li>
              </ul>
            </div>

            <div>
              <h4 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '20px' }}>Legal</h4>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                <li style={{ marginBottom: '12px' }}>
                  <a href="#" style={{ color: '#94A3B8', textDecoration: 'none', fontSize: '14px' }}>Privacy Policy</a>
                </li>
                <li style={{ marginBottom: '12px' }}>
                  <a href="#" style={{ color: '#94A3B8', textDecoration: 'none', fontSize: '14px' }}>Terms of Service</a>
                </li>
                <li style={{ marginBottom: '12px' }}>
                  <a href="#" style={{ color: '#94A3B8', textDecoration: 'none', fontSize: '14px' }}>Cookie Policy</a>
                </li>
                <li style={{ marginBottom: '12px' }}>
                  <a href="#" style={{ color: '#94A3B8', textDecoration: 'none', fontSize: '14px' }}>Contact</a>
                </li>
              </ul>
            </div>
          </div>

          <div style={{
            borderTop: '1px solid #334155',
            paddingTop: '30px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <p style={{ fontSize: '14px', color: '#94A3B8', margin: 0 }}>
              © 2024 JobFlow. All rights reserved.
            </p>
            <div style={{ display: 'flex', gap: '20px' }}>
              <a href="#" style={{ color: '#94A3B8', textDecoration: 'none', fontSize: '14px' }}>Twitter</a>
              <a href="#" style={{ color: '#94A3B8', textDecoration: 'none', fontSize: '14px' }}>LinkedIn</a>
              <a href="#" style={{ color: '#94A3B8', textDecoration: 'none', fontSize: '14px' }}>GitHub</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper Functions
function formatEmploymentType(type) {
  if (!type) return 'Full-time';
  return type.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join('-');
}

function getEmploymentTypeBadgeStyle(type) {
  const styles = {
    full_time: { background: '#DBEAFE', color: '#1E40AF' },
    part_time: { background: '#FEF3C7', color: '#92400E' },
    contract: { background: '#FCE7F3', color: '#9F1239' },
    internship: { background: '#D1FAE5', color: '#065F46' }
  };
  return styles[type] || { background: '#F1F5F9', color: '#475569' };
}

function formatSalary(min, max) {
  const format = (amount) => Number(amount).toLocaleString('en-IN');
  if (min && max) return `₹${format(min)} - ₹${format(max)}`;
  if (min) return `From ₹${format(min)}`;
  if (max) return `Up to ₹${format(max)}`;
  return 'Competitive';
}

function getJobBgColor(index) {
  const colors = ['#3B82F6', '#8B5CF6', '#10B981', '#F59E0B', '#EC4899', '#06B6D4'];
  return colors[index % colors.length];
}
