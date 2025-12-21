import React from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Layout() {
  const { user, logout, isAdmin, isEmployer } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div>
      <nav style={styles.nav}>
        <div className="container" style={styles.navContainer}>
          <Link to="/" style={styles.brand}>Job Marketplace</Link>

          <div style={styles.navLinks}>
            <Link
              to="/"
              style={styles.link}
              onMouseEnter={(e) => e.target.style.backgroundColor = 'rgba(37, 99, 235, 0.08)'}
              onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
            >
              Jobs
            </Link>

            {!user ? (
              <>
                <Link
                  to="/login"
                  style={styles.link}
                  onMouseEnter={(e) => e.target.style.backgroundColor = 'rgba(37, 99, 235, 0.08)'}
                  onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="btn btn-primary"
                  style={{
                    marginLeft: '0',
                    background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                    border: 'none',
                    boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.transform = 'translateY(-2px)';
                    e.target.style.boxShadow = '0 6px 16px rgba(37, 99, 235, 0.4)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = '0 4px 12px rgba(37, 99, 235, 0.3)';
                  }}
                >
                  Register
                </Link>
              </>
            ) : (
              <>
                {isAdmin && (
                  <>
                    <Link
                      to="/admin/dashboard"
                      style={styles.link}
                      onMouseEnter={(e) => e.target.style.backgroundColor = 'rgba(37, 99, 235, 0.08)'}
                      onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                    >
                      Admin
                    </Link>
                    <Link
                      to="/admin/users"
                      style={styles.link}
                      onMouseEnter={(e) => e.target.style.backgroundColor = 'rgba(37, 99, 235, 0.08)'}
                      onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                    >
                      Users
                    </Link>
                  </>
                )}

                {isEmployer && (
                  <>
                    <Link
                      to="/employer/dashboard"
                      style={styles.link}
                      onMouseEnter={(e) => e.target.style.backgroundColor = 'rgba(37, 99, 235, 0.08)'}
                      onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                    >
                      Dashboard
                    </Link>
                    <Link
                      to="/employer/companies"
                      style={styles.link}
                      onMouseEnter={(e) => e.target.style.backgroundColor = 'rgba(37, 99, 235, 0.08)'}
                      onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                    >
                      Companies
                    </Link>
                    <Link
                      to="/employer/applications"
                      style={styles.link}
                      onMouseEnter={(e) => e.target.style.backgroundColor = 'rgba(37, 99, 235, 0.08)'}
                      onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                    >
                      Applications
                    </Link>
                  </>
                )}

                {user.role === 'seeker' && (
                  <>
                    <Link
                      to="/dashboard"
                      style={styles.link}
                      onMouseEnter={(e) => e.target.style.backgroundColor = 'rgba(37, 99, 235, 0.08)'}
                      onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                    >
                      Dashboard
                    </Link>
                    <Link
                      to="/my-applications"
                      style={styles.link}
                      onMouseEnter={(e) => e.target.style.backgroundColor = 'rgba(37, 99, 235, 0.08)'}
                      onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                    >
                      My Applications
                    </Link>
                  </>
                )}

                <Link
                  to="/profile"
                  style={styles.link}
                  onMouseEnter={(e) => e.target.style.backgroundColor = 'rgba(37, 99, 235, 0.08)'}
                  onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                >
                  Profile
                </Link>
                <button
                  onClick={handleLogout}
                  className="btn btn-outline"
                  style={{
                    marginLeft: '0',
                    borderColor: '#2563eb',
                    color: '#2563eb',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = '#2563eb';
                    e.target.style.color = 'white';
                    e.target.style.transform = 'translateY(-2px)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = 'transparent';
                    e.target.style.color = '#2563eb';
                    e.target.style.transform = 'translateY(0)';
                  }}
                >
                  Logout
                </button>
              </>
            )}
          </div>
        </div>
      </nav>

      <main style={styles.main}>
        <Outlet />
      </main>

      <footer style={styles.footer}>
        <div className="container text-center">
          <p>&copy; 2025 Job Marketplace. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

const styles = {
  nav: {
    backgroundColor: 'rgba(255, 255, 255, 0.75)',
    backdropFilter: 'blur(15px)',
    WebkitBackdropFilter: 'blur(15px)',
    borderBottom: '1px solid rgba(37, 99, 235, 0.1)',
    padding: '1.25rem 0',
    boxShadow: '0 4px 12px rgba(37, 99, 235, 0.08)',
    position: 'sticky',
    top: 0,
    zIndex: 1000,
  },
  navContainer: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  brand: {
    fontSize: '1.75rem',
    fontWeight: '700',
    background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
    textDecoration: 'none',
    letterSpacing: '-0.5px',
    transition: 'all 0.3s ease',
  },
  navLinks: {
    display: 'flex',
    alignItems: 'center',
    gap: '2rem',
  },
  link: {
    color: 'var(--text-primary)',
    textDecoration: 'none',
    fontWeight: '500',
    fontSize: '0.95rem',
    letterSpacing: '0.2px',
    padding: '0.5rem 1rem',
    borderRadius: '8px',
    transition: 'all 0.3s ease',
  },
  main: {
    minHeight: 'calc(100vh - 140px)',
    padding: 0,
  },
  footer: {
    backgroundColor: 'var(--background)',
    borderTop: '1px solid var(--border)',
    padding: '2rem 0',
    marginTop: '4rem',
  },
};
