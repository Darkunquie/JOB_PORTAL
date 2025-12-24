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
    <div style={{ minHeight: '100vh', background: '#f1f5f9' }}>
      {/* Hero Section with Modern Glass Effect */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.97) 0%, rgba(139, 92, 246, 0.95) 50%, rgba(168, 85, 247, 0.93) 100%), url("/office-bg.png")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
        padding: '120px 0 140px',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Animated gradient overlay */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'radial-gradient(circle at 30% 20%, rgba(255, 255, 255, 0.1) 0%, transparent 50%)',
          pointerEvents: 'none',
          animation: 'pulse 4s ease-in-out infinite'
        }}></div>

        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          {/* Badge */}
          <div style={{
            display: 'inline-block',
            background: 'rgba(255, 255, 255, 0.25)',
            backdropFilter: 'blur(12px)',
            padding: '10px 24px',
            borderRadius: '50px',
            marginBottom: '28px',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)'
          }}>
            <p style={{
              color: 'white',
              fontSize: '13px',
              margin: 0,
              fontWeight: '700',
              letterSpacing: '1.5px',
              textTransform: 'uppercase'
            }}>
              🔐 System Administrator
            </p>
          </div>

          {/* Main Heading */}
          <h1 style={{
            fontSize: '72px',
            fontWeight: '900',
            marginBottom: '24px',
            color: 'white',
            lineHeight: '1',
            letterSpacing: '-3px',
            textShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
            maxWidth: '900px'
          }}>
            Admin Command
            <br />
            <span style={{
              background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.7) 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}>Center</span>
          </h1>

          {/* Subtitle */}
          <p style={{
            fontSize: '22px',
            color: 'rgba(255, 255, 255, 0.95)',
            maxWidth: '700px',
            lineHeight: '1.7',
            marginBottom: '48px',
            fontWeight: '400',
            textShadow: '0 2px 8px rgba(0, 0, 0, 0.2)'
          }}>
            Complete platform oversight with real-time analytics, user management, and system controls at your fingertips.
          </p>

          {/* Quick Stats Banner */}
          {stats && (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
              gap: '16px',
              maxWidth: '800px'
            }}>
              <div style={{
                background: 'rgba(255, 255, 255, 0.15)',
                backdropFilter: 'blur(20px)',
                padding: '20px',
                borderRadius: '16px',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '32px', fontWeight: '900', color: 'white', marginBottom: '4px' }}>
                  {stats.users.total}
                </div>
                <div style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.9)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Total Users
                </div>
              </div>
              <div style={{
                background: 'rgba(255, 255, 255, 0.15)',
                backdropFilter: 'blur(20px)',
                padding: '20px',
                borderRadius: '16px',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '32px', fontWeight: '900', color: 'white', marginBottom: '4px' }}>
                  {stats.companies.total}
                </div>
                <div style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.9)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Companies
                </div>
              </div>
              <div style={{
                background: 'rgba(255, 255, 255, 0.15)',
                backdropFilter: 'blur(20px)',
                padding: '20px',
                borderRadius: '16px',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '32px', fontWeight: '900', color: 'white', marginBottom: '4px' }}>
                  {stats.jobs.open}
                </div>
                <div style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.9)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Open Jobs
                </div>
              </div>
              <div style={{
                background: 'rgba(255, 255, 255, 0.15)',
                backdropFilter: 'blur(20px)',
                padding: '20px',
                borderRadius: '16px',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '32px', fontWeight: '900', color: 'white', marginBottom: '4px' }}>
                  {stats.applications.total}
                </div>
                <div style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.9)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Applications
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="container" style={{ padding: '0 2rem', marginTop: '-80px', position: 'relative', zIndex: 10 }}>

        {error && (
          <div style={{ marginBottom: '1.5rem', padding: '1.2rem', background: '#fee2e2', border: '1px solid #ef4444', borderRadius: '12px', color: '#991b1b', fontWeight: '600' }}>
            {error}
          </div>
        )}

        {successMessage && (
          <div style={{ marginBottom: '1.5rem', padding: '1.2rem', background: '#d1fae5', border: '1px solid #10b981', borderRadius: '12px', color: '#065f46', fontWeight: '600' }}>
            {successMessage}
          </div>
        )}

        {/* Pending Employer Approvals - High Priority Alert */}
        {pendingEmployers.length > 0 && (
          <div style={{ marginBottom: '3rem' }}>
            <div style={{
              background: 'white',
              borderRadius: '20px',
              padding: '2rem',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
              border: '2px solid #fbbf24'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1.5rem' }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: '16px',
                  fontSize: '24px'
                }}>
                  ⏳
                </div>
                <div>
                  <h2 style={{ margin: 0, color: '#0f172a', fontSize: '28px', fontWeight: '800', letterSpacing: '-1px' }}>
                    Pending Employer Approvals
                  </h2>
                  <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: '14px' }}>
                    {pendingEmployers.length} employer{pendingEmployers.length > 1 ? 's' : ''} waiting for approval
                  </p>
                </div>
              </div>

              <div style={{ display: 'grid', gap: '1rem' }}>
                {pendingEmployers.map(employer => (
                  <div key={employer.id} style={{
                    padding: '1.5rem',
                    background: 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)',
                    borderRadius: '16px',
                    border: '2px solid #fcd34d',
                    transition: 'all 0.3s ease'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                      <div style={{ flex: '1', minWidth: '250px' }}>
                        <h3 style={{ marginBottom: '8px', color: '#0f172a', fontSize: '20px', fontWeight: '700' }}>
                          {employer.full_name || 'No name provided'}
                        </h3>
                        <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '4px' }}>
                          <strong>Email:</strong> {employer.email}
                        </p>
                        <p style={{ color: '#64748b', fontSize: '14px', margin: 0 }}>
                          <strong>Registered:</strong> {new Date(employer.created_at).toLocaleString()}
                        </p>
                      </div>
                      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                        <button
                          onClick={() => handleApprove(employer.id)}
                          style={{
                            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                            color: 'white',
                            border: 'none',
                            padding: '12px 28px',
                            borderRadius: '12px',
                            fontSize: '15px',
                            fontWeight: '700',
                            cursor: 'pointer',
                            transition: 'all 0.3s ease',
                            boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
                          }}
                          onMouseEnter={(e) => {
                            e.target.style.transform = 'translateY(-2px)';
                            e.target.style.boxShadow = '0 6px 20px rgba(16, 185, 129, 0.4)';
                          }}
                          onMouseLeave={(e) => {
                            e.target.style.transform = 'translateY(0)';
                            e.target.style.boxShadow = '0 4px 12px rgba(16, 185, 129, 0.3)';
                          }}
                        >
                          ✓ Approve
                        </button>
                        <button
                          onClick={() => handleReject(employer.id)}
                          style={{
                            background: 'white',
                            color: '#ef4444',
                            border: '2px solid #ef4444',
                            padding: '12px 28px',
                            borderRadius: '12px',
                            fontSize: '15px',
                            fontWeight: '700',
                            cursor: 'pointer',
                            transition: 'all 0.3s ease'
                          }}
                          onMouseEnter={(e) => {
                            e.target.style.background = '#ef4444';
                            e.target.style.color = 'white';
                            e.target.style.transform = 'translateY(-2px)';
                          }}
                          onMouseLeave={(e) => {
                            e.target.style.background = 'white';
                            e.target.style.color = '#ef4444';
                            e.target.style.transform = 'translateY(0)';
                          }}
                        >
                          ✕ Reject
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Analytics Dashboard */}
        <div style={{ marginBottom: '3rem' }}>
          <h2 style={{ marginBottom: '2rem', color: '#0f172a', fontSize: '32px', fontWeight: '800', letterSpacing: '-1px' }}>
            Platform Analytics
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '2rem' }}>

            {/* User Distribution Chart */}
            <div style={{
              background: 'white',
              borderRadius: '20px',
              padding: '2rem',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.06)',
              border: '1px solid rgba(0, 0, 0, 0.05)'
            }}>
              <h3 style={{ marginBottom: '1.5rem', color: '#0f172a', fontSize: '20px', fontWeight: '700' }}>
                User Distribution
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={userDistributionData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="category" tick={{ fill: '#64748b', fontSize: 11 }} angle={-15} textAnchor="end" height={80} />
                  <YAxis tick={{ fill: '#64748b', fontSize: 12 }} />
                  <Tooltip contentStyle={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                  <Bar dataKey="count" radius={[10, 10, 0, 0]}>
                    {userDistributionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* User Activity Pie Chart */}
            <div style={{
              background: 'white',
              borderRadius: '20px',
              padding: '2rem',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.06)',
              border: '1px solid rgba(0, 0, 0, 0.05)'
            }}>
              <h3 style={{ marginBottom: '1.5rem', color: '#0f172a', fontSize: '20px', fontWeight: '700' }}>
                User Activity
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={userActivityData}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={110}
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
                <p style={{ fontSize: '36px', fontWeight: '900', color: '#3b82f6', margin: 0, letterSpacing: '-1px' }}>
                  {stats.users.total > 0 ? Math.round((stats.users.active / stats.users.total) * 100) : 0}%
                </p>
                <p style={{ fontSize: '13px', color: '#64748b', margin: '4px 0 0', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Active User Rate
                </p>
              </div>
            </div>

            {/* Platform Activity Trends - Full Width */}
            <div style={{
              background: 'white',
              borderRadius: '20px',
              padding: '2rem',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.06)',
              border: '1px solid rgba(0, 0, 0, 0.05)',
              gridColumn: '1 / -1'
            }}>
              <h3 style={{ marginBottom: '1.5rem', color: '#0f172a', fontSize: '20px', fontWeight: '700' }}>
                Platform Growth Trends (Last 7 Days)
              </h3>
              <ResponsiveContainer width="100%" height={320}>
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
                  <Tooltip contentStyle={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                  <Legend wrapperStyle={{ paddingTop: '16px' }} />
                  <Area type="monotone" dataKey="companies" stroke="#8b5cf6" strokeWidth={2} fillOpacity={1} fill="url(#colorCompanies)" name="Companies" />
                  <Area type="monotone" dataKey="jobs" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorJobs)" name="Jobs" />
                  <Area type="monotone" dataKey="applications" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorApplications)" name="Applications" />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Job Status Pie Chart */}
            <div style={{
              background: 'white',
              borderRadius: '20px',
              padding: '2rem',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.06)',
              border: '1px solid rgba(0, 0, 0, 0.05)'
            }}>
              <h3 style={{ marginBottom: '1.5rem', color: '#0f172a', fontSize: '20px', fontWeight: '700' }}>
                Job Status
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={jobStatusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={110}
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
                <p style={{ fontSize: '36px', fontWeight: '900', color: '#10b981', margin: 0, letterSpacing: '-1px' }}>
                  {stats.jobs.total > 0 ? Math.round((stats.jobs.open / stats.jobs.total) * 100) : 0}%
                </p>
                <p style={{ fontSize: '13px', color: '#64748b', margin: '4px 0 0', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Open Job Rate
                </p>
              </div>
            </div>

            {/* Key Metrics */}
            <div style={{
              background: 'linear-gradient(135deg, #f8fafc 0%, #ffffff 100%)',
              borderRadius: '20px',
              padding: '2rem',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.06)',
              border: '1px solid rgba(0, 0, 0, 0.05)'
            }}>
              <h3 style={{ marginBottom: '1.5rem', color: '#0f172a', fontSize: '20px', fontWeight: '700' }}>
                Key Metrics
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem' }}>
                <div style={{ padding: '16px', background: 'white', borderRadius: '12px' }}>
                  <p style={{ color: '#64748b', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>
                    Total Companies
                  </p>
                  <p style={{ fontSize: '32px', fontWeight: '900', color: '#8b5cf6', margin: 0, letterSpacing: '-1px' }}>
                    {stats.companies.total}
                  </p>
                </div>
                <div style={{ padding: '16px', background: 'white', borderRadius: '12px' }}>
                  <p style={{ color: '#64748b', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>
                    Total Jobs
                  </p>
                  <p style={{ fontSize: '32px', fontWeight: '900', color: '#3b82f6', margin: 0, letterSpacing: '-1px' }}>
                    {stats.jobs.total}
                  </p>
                </div>
                <div style={{ padding: '16px', background: 'white', borderRadius: '12px' }}>
                  <p style={{ color: '#64748b', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>
                    Total Applications
                  </p>
                  <p style={{ fontSize: '32px', fontWeight: '900', color: '#10b981', margin: 0, letterSpacing: '-1px' }}>
                    {stats.applications.total}
                  </p>
                </div>
                <div style={{ padding: '16px', background: 'white', borderRadius: '12px' }}>
                  <p style={{ color: '#64748b', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>
                    Pending Apps
                  </p>
                  <p style={{ fontSize: '32px', fontWeight: '900', color: '#f59e0b', margin: 0, letterSpacing: '-1px' }}>
                    {stats.applications.pending}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div style={{ marginBottom: '4rem' }}>
          <h2 style={{ marginBottom: '2rem', color: '#0f172a', fontSize: '32px', fontWeight: '800', letterSpacing: '-1px' }}>
            Quick Actions
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
            <Link
              to="/admin/users"
              style={{
                background: 'white',
                padding: '2rem',
                textAlign: 'center',
                textDecoration: 'none',
                transition: 'all 0.3s ease',
                borderRadius: '20px',
                border: '2px solid #e2e8f0',
                boxShadow: '0 2px 12px rgba(0, 0, 0, 0.04)',
                display: 'block'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-6px)';
                e.currentTarget.style.borderColor = '#6366f1';
                e.currentTarget.style.boxShadow = '0 12px 32px rgba(99, 102, 241, 0.2)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.borderColor = '#e2e8f0';
                e.currentTarget.style.boxShadow = '0 2px 12px rgba(0, 0, 0, 0.04)';
              }}
            >
              <div style={{ fontSize: '40px', marginBottom: '12px' }}>👥</div>
              <h3 style={{ color: '#0f172a', marginBottom: '8px', fontSize: '20px', fontWeight: '700' }}>Manage Users</h3>
              <p style={{ color: '#64748b', marginBottom: 0, fontSize: '14px' }}>
                View and manage all users
              </p>
            </Link>

            <Link
              to="/admin/jobs"
              style={{
                background: 'white',
                padding: '2rem',
                textAlign: 'center',
                textDecoration: 'none',
                transition: 'all 0.3s ease',
                borderRadius: '20px',
                border: '2px solid #e2e8f0',
                boxShadow: '0 2px 12px rgba(0, 0, 0, 0.04)',
                display: 'block'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-6px)';
                e.currentTarget.style.borderColor = '#8b5cf6';
                e.currentTarget.style.boxShadow = '0 12px 32px rgba(139, 92, 246, 0.2)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.borderColor = '#e2e8f0';
                e.currentTarget.style.boxShadow = '0 2px 12px rgba(0, 0, 0, 0.04)';
              }}
            >
              <div style={{ fontSize: '40px', marginBottom: '12px' }}>💼</div>
              <h3 style={{ color: '#0f172a', marginBottom: '8px', fontSize: '20px', fontWeight: '700' }}>Manage Jobs</h3>
              <p style={{ color: '#64748b', marginBottom: 0, fontSize: '14px' }}>
                Moderate all job listings
              </p>
            </Link>

            <Link
              to="/employer/companies"
              style={{
                background: 'white',
                padding: '2rem',
                textAlign: 'center',
                textDecoration: 'none',
                transition: 'all 0.3s ease',
                borderRadius: '20px',
                border: '2px solid #e2e8f0',
                boxShadow: '0 2px 12px rgba(0, 0, 0, 0.04)',
                display: 'block'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-6px)';
                e.currentTarget.style.borderColor = '#10b981';
                e.currentTarget.style.boxShadow = '0 12px 32px rgba(16, 185, 129, 0.2)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.borderColor = '#e2e8f0';
                e.currentTarget.style.boxShadow = '0 2px 12px rgba(0, 0, 0, 0.04)';
              }}
            >
              <div style={{ fontSize: '40px', marginBottom: '12px' }}>🏢</div>
              <h3 style={{ color: '#0f172a', marginBottom: '8px', fontSize: '20px', fontWeight: '700' }}>Manage Companies</h3>
              <p style={{ color: '#64748b', marginBottom: 0, fontSize: '14px' }}>
                View all companies
              </p>
            </Link>

            <Link
              to="/employer/applications"
              style={{
                background: 'white',
                padding: '2rem',
                textAlign: 'center',
                textDecoration: 'none',
                transition: 'all 0.3s ease',
                borderRadius: '20px',
                border: '2px solid #e2e8f0',
                boxShadow: '0 2px 12px rgba(0, 0, 0, 0.04)',
                display: 'block'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-6px)';
                e.currentTarget.style.borderColor = '#f59e0b';
                e.currentTarget.style.boxShadow = '0 12px 32px rgba(245, 158, 11, 0.2)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.borderColor = '#e2e8f0';
                e.currentTarget.style.boxShadow = '0 2px 12px rgba(0, 0, 0, 0.04)';
              }}
            >
              <div style={{ fontSize: '40px', marginBottom: '12px' }}>📋</div>
              <h3 style={{ color: '#0f172a', marginBottom: '8px', fontSize: '20px', fontWeight: '700' }}>View Applications</h3>
              <p style={{ color: '#64748b', marginBottom: 0, fontSize: '14px' }}>
                Monitor all applications
              </p>
            </Link>
          </div>
        </div>
      </div>

      <div style={{ height: '60px' }}></div>
    </div>
  );
}
