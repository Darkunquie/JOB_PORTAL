import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function PendingApproval() {
  const { user, logout } = useAuth();

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      <div style={{
        maxWidth: '600px',
        width: '100%',
        background: 'white',
        borderRadius: '20px',
        padding: '60px 40px',
        textAlign: 'center',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.1)',
        border: '1px solid rgba(0, 0, 0, 0.05)'
      }}>
        {/* Icon */}
        <div style={{
          width: '120px',
          height: '120px',
          background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '60px',
          margin: '0 auto 32px',
          boxShadow: '0 10px 30px rgba(245, 158, 11, 0.3)'
        }}>
          ⏳
        </div>

        {/* Heading */}
        <h1 style={{
          fontSize: '32px',
          fontWeight: '800',
          color: '#0f172a',
          marginBottom: '16px',
          letterSpacing: '-1px'
        }}>
          Pending Approval
        </h1>

        {/* Message */}
        <p style={{
          fontSize: '18px',
          color: '#64748b',
          marginBottom: '32px',
          lineHeight: '1.6'
        }}>
          Thank you for registering as an employer, <strong>{user?.full_name || user?.email}</strong>!
        </p>

        <div style={{
          background: '#fffbeb',
          border: '2px solid #fbbf24',
          borderRadius: '12px',
          padding: '24px',
          marginBottom: '32px',
          textAlign: 'left'
        }}>
          <h3 style={{
            fontSize: '18px',
            fontWeight: '700',
            color: '#92400e',
            marginBottom: '12px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <span>🔔</span> What happens next?
          </h3>
          <ul style={{
            color: '#78350f',
            fontSize: '15px',
            lineHeight: '1.8',
            margin: 0,
            paddingLeft: '20px'
          }}>
            <li>Our admin team is reviewing your employer registration</li>
            <li>You'll receive an email once your account is approved</li>
            <li>After approval, you can create companies and post jobs</li>
            <li>This typically takes 24-48 hours</li>
          </ul>
        </div>

        {/* Info Box */}
        <div style={{
          background: '#f1f5f9',
          borderRadius: '12px',
          padding: '20px',
          marginBottom: '32px'
        }}>
          <p style={{
            fontSize: '14px',
            color: '#475569',
            margin: 0,
            lineHeight: '1.6'
          }}>
            <strong>Need help?</strong> If you have any questions or need to update your information, please contact our support team.
          </p>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link
            to="/"
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
            Browse Jobs
          </Link>

          <button
            onClick={logout}
            style={{
              background: 'transparent',
              color: '#64748b',
              padding: '14px 32px',
              borderRadius: '12px',
              border: '2px solid #e2e8f0',
              fontWeight: '700',
              fontSize: '16px',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.target.style.borderColor = '#cbd5e1';
              e.target.style.color = '#475569';
            }}
            onMouseLeave={(e) => {
              e.target.style.borderColor = '#e2e8f0';
              e.target.style.color = '#64748b';
            }}
          >
            Logout
          </button>
        </div>

        {/* Footer Note */}
        <p style={{
          fontSize: '13px',
          color: '#94a3b8',
          marginTop: '32px',
          marginBottom: 0
        }}>
          Account registered on {new Date().toLocaleDateString()}
        </p>
      </div>
    </div>
  );
}
