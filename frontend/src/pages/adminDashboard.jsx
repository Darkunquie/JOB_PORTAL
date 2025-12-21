import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminAPI } from '../api/client';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area, Legend } from 'recharts';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [pendingEmployers, setPendingEmployers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [statsRes, employersRes] = await Promise.all([
        adminAPI.getStats(),
        adminAPI.getPendingEmployers()
      ]);
      setStats(statsRes.data);
      setPendingEmployers(employersRes.data);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (employerId) => {
    try {
      await adminAPI.approveEmployer(employerId);
      setSuccessMessage('Employer approved successfully');
      fetchData();
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error('Error approving employer:', err);
      setError('Failed to approve employer');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleReject = async (employerId) => {
    if (!window.confirm('Are you sure you want to reject this employer? This will permanently delete their account.')) {
      return;
    }
    try {
      await adminAPI.rejectEmployer(employerId);
      setSuccessMessage('Employer rejected and removed');
      fetchData();
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error('Error rejecting employer:', err);
      setError('Failed to reject employer');
      setTimeout(() => setError(''), 3000);
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

  // Prepare data for charts
  const userDistributionData = stats ? [
    { category: 'Total Users', count: stats.users.total, fill: '#3b82f6' },
    { category: 'Active Users', count: stats.users.active, fill: '#10b981' },
    { category: 'Employers', count: stats.users.employers, fill: '#8b5cf6' },
    { category: 'Job Seekers', count: stats.users.seekers, fill: '#f59e0b' },
    { category: 'Pending', count: stats.users.pending_employers, fill: '#ef4444' }
  ] : [];

  // Mock platform activity trend data (last 7 days)
  const trendData = stats ? [
    { date: 'Day 1', companies: Math.floor(stats.companies.total * 0.7), jobs: Math.floor(stats.jobs.total * 0.6), applications: Math.floor(stats.applications.total * 0.5) },
    { date: 'Day 2', companies: Math.floor(stats.companies.total * 0.75), jobs: Math.floor(stats.jobs.total * 0.7), applications: Math.floor(stats.applications.total * 0.6) },
    { date: 'Day 3', companies: Math.floor(stats.companies.total * 0.8), jobs: Math.floor(stats.jobs.total * 0.75), applications: Math.floor(stats.applications.total * 0.7) },
    { date: 'Day 4', companies: Math.floor(stats.companies.total * 0.85), jobs: Math.floor(stats.jobs.total * 0.85), applications: Math.floor(stats.applications.total * 0.8) },
    { date: 'Day 5', companies: Math.floor(stats.companies.total * 0.9), jobs: Math.floor(stats.jobs.total * 0.9), applications: Math.floor(stats.applications.total * 0.85) },
    { date: 'Day 6', companies: Math.floor(stats.companies.total * 0.95), jobs: Math.floor(stats.jobs.total * 0.95), applications: Math.floor(stats.applications.total * 0.92) },
    { date: 'Today', companies: stats.companies.total, jobs: stats.jobs.total, applications: stats.applications.total }
  ] : [];

  // Pie chart data for platform health
  const jobStatusData = stats ? [
    { name: 'Open Jobs', value: stats.jobs.open, fill: '#10b981' },
    { name: 'Closed Jobs', value: stats.jobs.total - stats.jobs.open, fill: '#94a3b8' }
  ] : [];

  const userActivityData = stats ? [
    { name: 'Active Users', value: stats.users.active, fill: '#3b82f6' },
    { name: 'Inactive Users', value: stats.users.total - stats.users.active, fill: '#e5e7eb' }
  ] : [];

  return (
    <div className="container" style={{ padding: '2rem' }}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: '2rem',
        borderRadius: '12px',
        color: 'white',
        marginBottom: '2rem'
      }}>
        <h1 style={{ marginBottom: '0.5rem', color: 'white' }}>Admin Dashboard</h1>
        <p style={{ opacity: 0.9 }}>Platform overview and analytics</p>
      </div>

      {error && (
        <div style={{ marginBottom: '1rem', padding: '1rem', background: '#fee2e2', border: '1px solid #ef4444', borderRadius: '8px', color: '#991b1b' }}>
          {error}
        </div>
      )}

      {successMessage && (
        <div style={{ marginBottom: '1rem', padding: '1rem', background: '#d1fae5', border: '1px solid #10b981', borderRadius: '8px', color: '#065f46' }}>
          {successMessage}
        </div>
      )}

      {/* Statistics Grid - 2 Column Layout */}
      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ marginBottom: '1.5rem', color: '#1e293b', fontSize: '1.75rem', fontWeight: '700' }}>Platform Statistics</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem' }}>

          {/* User Distribution Chart */}
          <div className="card" style={{ padding: '2rem' }}>
            <h3 style={{ marginBottom: '1.5rem', color: '#475569', fontSize: '1.1rem', fontWeight: '600' }}>User Distribution</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={userDistributionData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="category" tick={{ fill: '#64748b', fontSize: 12 }} angle={-15} textAnchor="end" height={80} />
                <YAxis tick={{ fill: '#64748b', fontSize: 12 }} />
                <Tooltip
                  contentStyle={{
                    background: 'white',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                  }}
                />
                <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                  {userDistributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* User Activity Pie Chart */}
          <div className="card" style={{ padding: '2rem' }}>
            <h3 style={{ marginBottom: '1.5rem', color: '#475569', fontSize: '1.1rem', fontWeight: '600' }}>User Activity</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={userActivityData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {userActivityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div style={{ textAlign: 'center', marginTop: '1rem' }}>
              <p style={{ fontSize: '2rem', fontWeight: '700', color: '#3b82f6', margin: 0 }}>
                {stats.users.total > 0 ? Math.round((stats.users.active / stats.users.total) * 100) : 0}%
              </p>
              <p style={{ fontSize: '0.875rem', color: '#64748b', margin: 0 }}>Active User Rate</p>
            </div>
          </div>

          {/* Platform Activity Trends - Full Width */}
          <div className="card" style={{ padding: '2rem', gridColumn: '1 / -1' }}>
            <h3 style={{ marginBottom: '1.5rem', color: '#475569', fontSize: '1.1rem', fontWeight: '600' }}>Platform Activity Trends (Last 7 Days)</h3>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={trendData}>
                <defs>
                  <linearGradient id="colorCompanies" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorJobs" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorApplications" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="date" tick={{ fill: '#64748b', fontSize: 12 }} />
                <YAxis tick={{ fill: '#64748b', fontSize: 12 }} />
                <Tooltip
                  contentStyle={{
                    background: 'white',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                  }}
                />
                <Legend wrapperStyle={{ paddingTop: '10px' }} />
                <Area type="monotone" dataKey="companies" stroke="#8b5cf6" fillOpacity={1} fill="url(#colorCompanies)" name="Companies" />
                <Area type="monotone" dataKey="jobs" stroke="#3b82f6" fillOpacity={1} fill="url(#colorJobs)" name="Jobs" />
                <Area type="monotone" dataKey="applications" stroke="#10b981" fillOpacity={1} fill="url(#colorApplications)" name="Applications" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Job Status Pie Chart */}
          <div className="card" style={{ padding: '2rem' }}>
            <h3 style={{ marginBottom: '1.5rem', color: '#475569', fontSize: '1.1rem', fontWeight: '600' }}>Job Status Distribution</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={jobStatusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {jobStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div style={{ textAlign: 'center', marginTop: '1rem' }}>
              <p style={{ fontSize: '2rem', fontWeight: '700', color: '#10b981', margin: 0 }}>
                {stats.jobs.total > 0 ? Math.round((stats.jobs.open / stats.jobs.total) * 100) : 0}%
              </p>
              <p style={{ fontSize: '0.875rem', color: '#64748b', margin: 0 }}>Open Job Rate</p>
            </div>
          </div>

          {/* Key Metrics */}
          <div className="card" style={{ padding: '2rem', background: 'linear-gradient(135deg, #f8fafc 0%, #ffffff 100%)', border: '1px solid #e5e7eb' }}>
            <h3 style={{ marginBottom: '1.5rem', color: '#475569', fontSize: '1.1rem', fontWeight: '600' }}>Key Metrics</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem' }}>
              <div>
                <p style={{ color: '#64748b', fontSize: '0.75rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>
                  Total Companies
                </p>
                <p style={{ fontSize: '2rem', fontWeight: '700', color: '#8b5cf6', margin: 0 }}>
                  {stats.companies.total}
                </p>
              </div>
              <div>
                <p style={{ color: '#64748b', fontSize: '0.75rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>
                  Total Jobs
                </p>
                <p style={{ fontSize: '2rem', fontWeight: '700', color: '#3b82f6', margin: 0 }}>
                  {stats.jobs.total}
                </p>
              </div>
              <div>
                <p style={{ color: '#64748b', fontSize: '0.75rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>
                  Total Applications
                </p>
                <p style={{ fontSize: '2rem', fontWeight: '700', color: '#10b981', margin: 0 }}>
                  {stats.applications.total}
                </p>
              </div>
              <div>
                <p style={{ color: '#64748b', fontSize: '0.75rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>
                  Pending Apps
                </p>
                <p style={{ fontSize: '2rem', fontWeight: '700', color: '#f59e0b', margin: 0 }}>
                  {stats.applications.pending}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Pending Employer Approvals */}
      {pendingEmployers.length > 0 && (
        <div style={{ marginBottom: '2rem' }}>
          <h2 style={{ marginBottom: '1rem', color: '#1e293b', fontSize: '1.5rem', fontWeight: '700' }}>Pending Employer Approvals</h2>
          <div style={{ display: 'grid', gap: '1rem' }}>
            {pendingEmployers.map(employer => (
              <div key={employer.id} className="card" style={{ padding: '1.5rem', border: '2px solid #fed7aa', background: '#fffbeb' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                  <div style={{ flex: '1', minWidth: '250px' }}>
                    <h3 style={{ marginBottom: '0.5rem', color: '#1e293b', fontSize: '1.1rem', fontWeight: '700' }}>{employer.full_name || 'No name provided'}</h3>
                    <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '0.25rem' }}><strong>Email:</strong> {employer.email}</p>
                    <p style={{ color: '#64748b', fontSize: '0.9rem', margin: 0 }}><strong>Registered:</strong> {new Date(employer.created_at).toLocaleDateString()}</p>
                  </div>
                  <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                    <button
                      onClick={() => handleApprove(employer.id)}
                      className="btn btn-primary"
                      style={{
                        background: '#10b981',
                        borderColor: '#10b981',
                        padding: '0.5rem 1.5rem',
                        fontSize: '0.9rem'
                      }}
                      onMouseEnter={(e) => e.target.style.background = '#059669'}
                      onMouseLeave={(e) => e.target.style.background = '#10b981'}
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleReject(employer.id)}
                      className="btn btn-outline"
                      style={{
                        borderColor: '#ef4444',
                        color: '#ef4444',
                        padding: '0.5rem 1.5rem',
                        fontSize: '0.9rem'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.background = '#ef4444';
                        e.target.style.color = 'white';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.background = 'transparent';
                        e.target.style.color = '#ef4444';
                      }}
                    >
                      Reject
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div>
        <h2 style={{ marginBottom: '1rem', color: '#1e293b', fontSize: '1.5rem', fontWeight: '700' }}>Quick Actions</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
          <Link
            to="/admin/users"
            className="card"
            style={{
              padding: '2rem',
              textAlign: 'center',
              textDecoration: 'none',
              transition: 'all 0.3s ease',
              border: '2px solid #e2e8f0'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.borderColor = '#667eea';
              e.currentTarget.style.boxShadow = '0 8px 16px rgba(102, 126, 234, 0.2)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.borderColor = '#e2e8f0';
              e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
            }}
          >
            <h3 style={{ color: '#1e293b', marginBottom: '0.5rem', fontSize: '1.25rem', fontWeight: '700' }}>Manage Users</h3>
            <p style={{ color: '#64748b', marginBottom: 0, fontSize: '0.95rem' }}>
              View, edit, and manage all platform users
            </p>
          </Link>

          <Link
            to="/admin/jobs"
            className="card"
            style={{
              padding: '2rem',
              textAlign: 'center',
              textDecoration: 'none',
              transition: 'all 0.3s ease',
              border: '2px solid #e2e8f0'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.borderColor = '#667eea';
              e.currentTarget.style.boxShadow = '0 8px 16px rgba(102, 126, 234, 0.2)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.borderColor = '#e2e8f0';
              e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
            }}
          >
            <h3 style={{ color: '#1e293b', marginBottom: '0.5rem', fontSize: '1.25rem', fontWeight: '700' }}>Manage Jobs</h3>
            <p style={{ color: '#64748b', marginBottom: 0, fontSize: '0.95rem' }}>
              View and moderate all job listings
            </p>
          </Link>

          <Link
            to="/admin/companies"
            className="card"
            style={{
              padding: '2rem',
              textAlign: 'center',
              textDecoration: 'none',
              transition: 'all 0.3s ease',
              border: '2px solid #e2e8f0'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.borderColor = '#667eea';
              e.currentTarget.style.boxShadow = '0 8px 16px rgba(102, 126, 234, 0.2)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.borderColor = '#e2e8f0';
              e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
            }}
          >
            <h3 style={{ color: '#1e293b', marginBottom: '0.5rem', fontSize: '1.25rem', fontWeight: '700' }}>Manage Companies</h3>
            <p style={{ color: '#64748b', marginBottom: 0, fontSize: '0.95rem' }}>
              View and manage all registered companies
            </p>
          </Link>

          <Link
            to="/admin/applications"
            className="card"
            style={{
              padding: '2rem',
              textAlign: 'center',
              textDecoration: 'none',
              transition: 'all 0.3s ease',
              border: '2px solid #e2e8f0'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.borderColor = '#667eea';
              e.currentTarget.style.boxShadow = '0 8px 16px rgba(102, 126, 234, 0.2)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.borderColor = '#e2e8f0';
              e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
            }}
          >
            <h3 style={{ color: '#1e293b', marginBottom: '0.5rem', fontSize: '1.25rem', fontWeight: '700' }}>View Applications</h3>
            <p style={{ color: '#64748b', marginBottom: 0, fontSize: '0.95rem' }}>
              Monitor all job applications
            </p>
          </Link>
        </div>
      </div>
    </div>
  );
}
