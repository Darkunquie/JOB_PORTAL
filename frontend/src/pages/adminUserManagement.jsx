import React, { useState, useEffect } from 'react';
import { adminAPI } from '../api/client';
import { format } from 'date-fns';

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Filters
  const [filters, setFilters] = useState({
    role: '',
    is_active: '',
    search: ''
  });

  // Pagination
  const [page, setPage] = useState(1);
  const [limit] = useState(20);

  useEffect(() => {
    fetchUsers();
  }, [filters, page]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params = {
        skip: (page - 1) * limit,
        limit,
        ...(filters.role && { role: filters.role }),
        ...(filters.is_active !== '' && { is_active: filters.is_active === 'true' }),
        ...(filters.search && { search: filters.search })
      };

      const response = await adminAPI.getUsers(params);
      setUsers(response.data);
    } catch (err) {
      console.error('Error fetching users:', err);
      setError('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusToggle = async (userId, currentStatus) => {
    if (!window.confirm(`Are you sure you want to ${currentStatus ? 'deactivate' : 'activate'} this user?`)) {
      return;
    }

    try {
      await adminAPI.updateUserStatus(userId, { is_active: !currentStatus });
      setSuccess(`User ${!currentStatus ? 'activated' : 'deactivated'} successfully!`);
      fetchUsers();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to update user status');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    if (!window.confirm(`Are you sure you want to change this user's role to ${newRole}?`)) {
      return;
    }

    try {
      await adminAPI.updateUserRole(userId, { role: newRole });
      setSuccess('User role updated successfully!');
      fetchUsers();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to update user role');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleDeleteUser = async (userId, userEmail) => {
    if (!window.confirm(`Are you sure you want to permanently delete user "${userEmail}"?\n\nThis action cannot be undone and will delete all their data including companies, jobs, and applications.`)) {
      return;
    }

    try {
      await adminAPI.deleteUser(userId);
      setSuccess('User deleted successfully!');
      fetchUsers();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to delete user');
      setTimeout(() => setError(''), 3000);
    }
  };

  const getRoleBadgeColor = (role) => {
    const colors = {
      admin: { bg: '#fee2e2', text: '#991b1b', border: '#ef4444' },
      employer: { bg: '#dbeafe', text: '#1e40af', border: '#3b82f6' },
      seeker: { bg: '#d1fae5', text: '#065f46', border: '#10b981' }
    };
    return colors[role] || colors.seeker;
  };

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
    setPage(1); // Reset to first page when filtering
  };

  return (
    <div className="container" style={{ padding: '2rem' }}>
      <h1 style={{ marginBottom: '0.5rem' }}>User Management</h1>
      <p style={{ color: '#64748b', marginBottom: '2rem' }}>Manage all platform users, roles, and permissions</p>

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

      {/* Filters */}
      <div className="card" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
        <h3 style={{ marginBottom: '1rem' }}>Filters</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', fontSize: '0.9rem' }}>
              Role
            </label>
            <select
              name="role"
              value={filters.role}
              onChange={handleFilterChange}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                fontSize: '0.95rem'
              }}
            >
              <option value="">All Roles</option>
              <option value="admin">Admin</option>
              <option value="employer">Employer</option>
              <option value="seeker">Job Seeker</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', fontSize: '0.9rem' }}>
              Status
            </label>
            <select
              name="is_active"
              value={filters.is_active}
              onChange={handleFilterChange}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                fontSize: '0.95rem'
              }}
            >
              <option value="">All Statuses</option>
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', fontSize: '0.9rem' }}>
              Search
            </label>
            <input
              type="text"
              name="search"
              value={filters.search}
              onChange={handleFilterChange}
              placeholder="Search by name or email..."
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                fontSize: '0.95rem'
              }}
            />
          </div>
        </div>

        {(filters.role || filters.is_active !== '' || filters.search) && (
          <button
            onClick={() => {
              setFilters({ role: '', is_active: '', search: '' });
              setPage(1);
            }}
            style={{
              marginTop: '1rem',
              padding: '0.5rem 1rem',
              background: '#f1f5f9',
              border: '1px solid #e2e8f0',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '0.9rem',
              color: '#64748b'
            }}
          >
            Clear Filters
          </button>
        )}
      </div>

      {/* User Count */}
      <div style={{ marginBottom: '1rem' }}>
        <p style={{ color: '#64748b', fontSize: '0.95rem' }}>
          Showing <strong>{users.length}</strong> user{users.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Users Table */}
      {loading ? (
        <div className="flex-center" style={{ minHeight: '200px' }}>
          <div className="spinner"></div>
        </div>
      ) : users.length === 0 ? (
        <div className="card text-center" style={{ padding: '3rem' }}>
          <p style={{ fontSize: '3rem', marginBottom: '1rem' }}>👥</p>
          <h3 style={{ color: '#64748b', marginBottom: '0.5rem' }}>No users found</h3>
          <p style={{ color: '#94a3b8' }}>
            {filters.role || filters.is_active !== '' || filters.search
              ? 'Try adjusting your filters'
              : 'No users in the system yet'}
          </p>
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{
            width: '100%',
            borderCollapse: 'collapse',
            background: 'white',
            borderRadius: '8px',
            overflow: 'hidden',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
          }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', color: '#475569' }}>ID</th>
                <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', color: '#475569' }}>Name</th>
                <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', color: '#475569' }}>Email</th>
                <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', color: '#475569' }}>Role</th>
                <th style={{ padding: '1rem', textAlign: 'center', fontWeight: '600', color: '#475569' }}>Status</th>
                <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', color: '#475569' }}>Joined</th>
                <th style={{ padding: '1rem', textAlign: 'center', fontWeight: '600', color: '#475569' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user, index) => {
                const roleColor = getRoleBadgeColor(user.role);
                return (
                  <tr
                    key={user.id}
                    style={{
                      borderBottom: '1px solid #f1f5f9',
                      background: index % 2 === 0 ? 'white' : '#fafbfc'
                    }}
                  >
                    <td style={{ padding: '1rem', color: '#64748b' }}>#{user.id}</td>
                    <td style={{ padding: '1rem', color: '#1e293b', fontWeight: '500' }}>
                      {user.full_name || 'N/A'}
                    </td>
                    <td style={{ padding: '1rem', color: '#64748b' }}>{user.email}</td>
                    <td style={{ padding: '1rem' }}>
                      <select
                        value={user.role}
                        onChange={(e) => handleRoleChange(user.id, e.target.value)}
                        style={{
                          padding: '0.4rem 0.8rem',
                          background: roleColor.bg,
                          color: roleColor.text,
                          border: `1px solid ${roleColor.border}`,
                          borderRadius: '6px',
                          fontSize: '0.85rem',
                          fontWeight: '600',
                          cursor: 'pointer'
                        }}
                      >
                        <option value="admin">Admin</option>
                        <option value="employer">Employer</option>
                        <option value="seeker">Seeker</option>
                      </select>
                    </td>
                    <td style={{ padding: '1rem', textAlign: 'center' }}>
                      <button
                        onClick={() => handleStatusToggle(user.id, user.is_active)}
                        style={{
                          padding: '0.4rem 0.8rem',
                          background: user.is_active ? '#d1fae5' : '#fee2e2',
                          color: user.is_active ? '#065f46' : '#991b1b',
                          border: `1px solid ${user.is_active ? '#10b981' : '#ef4444'}`,
                          borderRadius: '6px',
                          fontSize: '0.85rem',
                          fontWeight: '600',
                          cursor: 'pointer'
                        }}
                      >
                        {user.is_active ? 'Active' : 'Inactive'}
                      </button>
                    </td>
                    <td style={{ padding: '1rem', color: '#64748b', fontSize: '0.9rem' }}>
                      {format(new Date(user.created_at), 'MMM dd, yyyy')}
                    </td>
                    <td style={{ padding: '1rem', textAlign: 'center' }}>
                      <button
                        onClick={() => handleDeleteUser(user.id, user.email)}
                        style={{
                          padding: '0.4rem 0.8rem',
                          background: '#fee2e2',
                          color: '#991b1b',
                          border: '1px solid #ef4444',
                          borderRadius: '6px',
                          fontSize: '0.85rem',
                          fontWeight: '600',
                          cursor: 'pointer'
                        }}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {!loading && users.length >= limit && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginTop: '2rem' }}>
          <button
            onClick={() => setPage(page - 1)}
            disabled={page === 1}
            style={{
              padding: '0.5rem 1rem',
              background: page === 1 ? '#f1f5f9' : '#667eea',
              color: page === 1 ? '#94a3b8' : 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: page === 1 ? 'not-allowed' : 'pointer',
              fontWeight: '600'
            }}
          >
            Previous
          </button>
          <span style={{ display: 'flex', alignItems: 'center', color: '#64748b', fontWeight: '600' }}>
            Page {page}
          </span>
          <button
            onClick={() => setPage(page + 1)}
            disabled={users.length < limit}
            style={{
              padding: '0.5rem 1rem',
              background: users.length < limit ? '#f1f5f9' : '#667eea',
              color: users.length < limit ? '#94a3b8' : 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: users.length < limit ? 'not-allowed' : 'pointer',
              fontWeight: '600'
            }}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
