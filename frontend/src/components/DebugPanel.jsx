import React, { useState, useEffect } from 'react';
import { getErrorStats, exportErrors, clearErrors, getHealthReport } from '../utils/errorTracker';

export default function DebugPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const [stats, setStats] = useState(null);
  const [healthReport, setHealthReport] = useState(null);
  const [backendHealth, setBackendHealth] = useState(null);

  const refreshStats = () => {
    setStats(getErrorStats());
    setHealthReport(getHealthReport());
  };

  const fetchBackendHealth = async () => {
    try {
      const response = await fetch('/health/detailed');
      const data = await response.json();
      setBackendHealth(data);
    } catch (error) {
      console.error('Failed to fetch backend health:', error);
    }
  };

  useEffect(() => {
    if (isOpen) {
      refreshStats();
      fetchBackendHealth();
    }
  }, [isOpen]);

  const handleExport = () => {
    const data = exportErrors();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `error-report-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleClear = () => {
    if (confirm('Clear all error logs?')) {
      clearErrors();
      refreshStats();
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          backgroundColor: healthReport?.status === 'healthy' ? '#4caf50' : '#f44336',
          color: 'white',
          border: 'none',
          borderRadius: '50%',
          width: '60px',
          height: '60px',
          fontSize: '24px',
          cursor: 'pointer',
          boxShadow: '0 4px 8px rgba(0,0,0,0.3)',
          zIndex: 9999
        }}
        title="Open Debug Panel"
      >
        🔧
      </button>
    );
  }

  return (
    <div style={{
      position: 'fixed',
      bottom: '20px',
      right: '20px',
      width: '400px',
      maxHeight: '600px',
      backgroundColor: 'white',
      borderRadius: '12px',
      boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
      zIndex: 9999,
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Header */}
      <div style={{
        padding: '15px',
        backgroundColor: '#667eea',
        color: 'white',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <h3 style={{ margin: 0, fontSize: '16px' }}>System Health Monitor</h3>
        <button
          onClick={() => setIsOpen(false)}
          style={{
            background: 'none',
            border: 'none',
            color: 'white',
            fontSize: '24px',
            cursor: 'pointer'
          }}
        >
          ×
        </button>
      </div>

      {/* Content */}
      <div style={{ padding: '15px', overflowY: 'auto', flex: 1 }}>
        {/* Frontend Health */}
        <div style={{ marginBottom: '15px' }}>
          <h4 style={{ marginTop: 0, fontSize: '14px', color: '#666' }}>Frontend Status</h4>
          {healthReport && (
            <div style={{
              padding: '10px',
              backgroundColor: healthReport.status === 'healthy' ? '#e8f5e9' : '#ffebee',
              borderRadius: '8px',
              fontSize: '12px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                <span><strong>Status:</strong> {healthReport.status}</span>
                <span><strong>Errors:</strong> {healthReport.errorCount}</span>
              </div>
              <div style={{ fontSize: '11px', color: '#666', marginTop: '5px' }}>
                Checksum: {healthReport.checksum}
              </div>
            </div>
          )}
        </div>

        {/* Backend Health */}
        <div style={{ marginBottom: '15px' }}>
          <h4 style={{ marginTop: 0, fontSize: '14px', color: '#666' }}>Backend Status</h4>
          {backendHealth ? (
            <div style={{
              padding: '10px',
              backgroundColor: backendHealth.overall_status === 'healthy' ? '#e8f5e9' : '#ffebee',
              borderRadius: '8px',
              fontSize: '12px'
            }}>
              <div style={{ marginBottom: '5px' }}>
                <strong>Status:</strong> {backendHealth.overall_status}
              </div>
              <div style={{ marginBottom: '5px' }}>
                <strong>Checks:</strong> {backendHealth.summary.healthy}/{backendHealth.summary.total_checks} passing
              </div>
              <div style={{ fontSize: '11px', color: '#666' }}>
                Checksum: {backendHealth.checksum}
              </div>
              {backendHealth.errors.length > 0 && (
                <div style={{ marginTop: '10px', padding: '8px', backgroundColor: '#ffcdd2', borderRadius: '4px' }}>
                  <strong>Errors:</strong>
                  {backendHealth.errors.map((err, idx) => (
                    <div key={idx} style={{ fontSize: '11px', marginTop: '4px' }}>• {err}</div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div style={{ padding: '10px', backgroundColor: '#f5f5f5', borderRadius: '8px', fontSize: '12px' }}>
              Loading...
            </div>
          )}
        </div>

        {/* Error Statistics */}
        {stats && stats.total > 0 && (
          <div style={{ marginBottom: '15px' }}>
            <h4 style={{ marginTop: 0, fontSize: '14px', color: '#666' }}>Error Statistics</h4>
            <div style={{ padding: '10px', backgroundColor: '#fff3e0', borderRadius: '8px', fontSize: '12px' }}>
              <div><strong>Total Errors:</strong> {stats.total}</div>
              <div><strong>By Severity:</strong></div>
              <div style={{ paddingLeft: '10px', fontSize: '11px' }}>
                <div>Errors: {stats.bySeverity.error}</div>
                <div>Warnings: {stats.bySeverity.warning}</div>
                <div>Info: {stats.bySeverity.info}</div>
              </div>
              {Object.keys(stats.byFeature).length > 0 && (
                <>
                  <div style={{ marginTop: '8px' }}><strong>By Feature:</strong></div>
                  <div style={{ paddingLeft: '10px', fontSize: '11px' }}>
                    {Object.entries(stats.byFeature).map(([feature, count]) => (
                      <div key={feature}>{feature}: {count}</div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* Recent Errors */}
        {stats && stats.recentErrors && stats.recentErrors.length > 0 && (
          <div style={{ marginBottom: '15px' }}>
            <h4 style={{ marginTop: 0, fontSize: '14px', color: '#666' }}>Recent Errors</h4>
            <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
              {stats.recentErrors.map((error) => (
                <div key={error.id} style={{
                  padding: '8px',
                  backgroundColor: '#ffebee',
                  borderRadius: '4px',
                  marginBottom: '8px',
                  fontSize: '11px'
                }}>
                  <div><strong>{error.feature}</strong> - {error.action}</div>
                  <div style={{ color: '#666', marginTop: '4px' }}>{error.error.message}</div>
                  <div style={{ color: '#999', marginTop: '4px', fontSize: '10px' }}>
                    {new Date(error.timestamp).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={refreshStats}
            style={{
              flex: 1,
              padding: '8px',
              backgroundColor: '#667eea',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '12px'
            }}
          >
            Refresh
          </button>
          <button
            onClick={handleExport}
            style={{
              flex: 1,
              padding: '8px',
              backgroundColor: '#4caf50',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '12px'
            }}
          >
            Export
          </button>
          <button
            onClick={handleClear}
            style={{
              flex: 1,
              padding: '8px',
              backgroundColor: '#f44336',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '12px'
            }}
          >
            Clear
          </button>
        </div>
      </div>
    </div>
  );
}
