/**
 * Comprehensive error tracking and logging system
 * Helps identify exact failures with detailed context
 */

class ErrorTracker {
  constructor() {
    this.errors = [];
    this.maxErrors = 100; // Keep last 100 errors
    this.sessionId = this.generateSessionId();
  }

  generateSessionId() {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  calculateChecksum(data) {
    // Simple checksum calculation for frontend
    const str = JSON.stringify(data);
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash).toString(16);
  }

  /**
   * Track an error with full context
   * @param {Object} params - Error parameters
   * @param {string} params.feature - Feature name (e.g., 'job_application', 'authentication')
   * @param {string} params.action - Action being performed (e.g., 'submit', 'login')
   * @param {Error|string} params.error - The error object or message
   * @param {Object} params.context - Additional context data
   * @param {string} params.severity - Severity level: 'error', 'warning', 'info'
   */
  track({
    feature,
    action,
    error,
    context = {},
    severity = 'error'
  }) {
    const errorEntry = {
      id: `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      sessionId: this.sessionId,
      timestamp: new Date().toISOString(),
      feature,
      action,
      severity,
      error: {
        message: error?.message || error?.toString() || 'Unknown error',
        stack: error?.stack,
        name: error?.name,
        code: error?.code,
        response: error?.response ? {
          status: error.response.status,
          statusText: error.response.statusText,
          data: error.response.data
        } : null
      },
      context: {
        ...context,
        url: window.location.href,
        userAgent: navigator.userAgent,
        timestamp: Date.now()
      },
      checksum: null
    };

    // Calculate checksum for this error
    errorEntry.checksum = this.calculateChecksum({
      feature,
      action,
      error: errorEntry.error.message,
      timestamp: errorEntry.timestamp
    });

    // Add to errors array
    this.errors.push(errorEntry);

    // Keep only last maxErrors
    if (this.errors.length > this.maxErrors) {
      this.errors = this.errors.slice(-this.maxErrors);
    }

    // Store in localStorage for persistence
    this.saveToStorage();

    return errorEntry;
  }

  /**
   * Track API request errors with detailed information
   */
  trackAPIError({
    endpoint,
    method = 'GET',
    error,
    requestData = null,
    context = {}
  }) {
    return this.track({
      feature: 'api_request',
      action: `${method} ${endpoint}`,
      error,
      context: {
        ...context,
        endpoint,
        method,
        requestData,
        responseStatus: error?.response?.status,
        responseData: error?.response?.data
      },
      severity: 'error'
    });
  }

  /**
   * Get all errors for a specific feature
   */
  getErrorsByFeature(feature) {
    return this.errors.filter(e => e.feature === feature);
  }

  /**
   * Get errors by severity
   */
  getErrorsBySeverity(severity) {
    return this.errors.filter(e => e.severity === severity);
  }

  /**
   * Get error statistics
   */
  getStats() {
    const stats = {
      total: this.errors.length,
      byFeature: {},
      bySeverity: {
        error: 0,
        warning: 0,
        info: 0
      },
      byAction: {},
      recentErrors: this.errors.slice(-10),
      sessionId: this.sessionId
    };

    this.errors.forEach(err => {
      // Count by feature
      stats.byFeature[err.feature] = (stats.byFeature[err.feature] || 0) + 1;

      // Count by severity
      stats.bySeverity[err.severity]++;

      // Count by action
      const actionKey = `${err.feature}:${err.action}`;
      stats.byAction[actionKey] = (stats.byAction[actionKey] || 0) + 1;
    });

    stats.checksum = this.calculateChecksum(stats);

    return stats;
  }

  /**
   * Export errors as JSON for debugging
   */
  exportErrors() {
    return {
      sessionId: this.sessionId,
      exportedAt: new Date().toISOString(),
      errors: this.errors,
      stats: this.getStats()
    };
  }

  /**
   * Clear all errors
   */
  clearErrors() {
    this.errors = [];
    localStorage.removeItem('errorTracker');
  }

  /**
   * Save errors to localStorage
   */
  saveToStorage() {
    try {
      const data = {
        sessionId: this.sessionId,
        errors: this.errors.slice(-50), // Save last 50 errors
        savedAt: new Date().toISOString()
      };
      localStorage.setItem('errorTracker', JSON.stringify(data));
    } catch (e) {
      // Silently fail if localStorage is unavailable
    }
  }

  /**
   * Load errors from localStorage
   */
  loadFromStorage() {
    try {
      const data = localStorage.getItem('errorTracker');
      if (data) {
        const parsed = JSON.parse(data);
        this.errors = parsed.errors || [];
      }
    } catch (e) {
      // Silently fail if localStorage is unavailable
    }
  }

  /**
   * Get health report
   */
  getHealthReport() {
    const recentErrors = this.errors.slice(-10);
    const errorRate = this.errors.length;

    return {
      status: errorRate === 0 ? 'healthy' : errorRate < 5 ? 'warning' : 'unhealthy',
      errorCount: errorRate,
      recentErrors,
      stats: this.getStats(),
      checksum: this.calculateChecksum({
        errorCount: errorRate,
        timestamp: Date.now()
      })
    };
  }
}

// Create singleton instance
const errorTracker = new ErrorTracker();

// Load previous errors on initialization
errorTracker.loadFromStorage();

// Export for use throughout the app
export default errorTracker;

// Convenience methods
export const trackError = (params) => errorTracker.track(params);
export const trackAPIError = (params) => errorTracker.trackAPIError(params);
export const getErrorStats = () => errorTracker.getStats();
export const exportErrors = () => errorTracker.exportErrors();
export const clearErrors = () => errorTracker.clearErrors();
export const getHealthReport = () => errorTracker.getHealthReport();
