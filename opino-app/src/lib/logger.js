/**
 * Logging utility for Opino application
 * Provides environment-aware logging with different levels
 */

const isDev = process.env.NODE_ENV === 'development';
const isTest = process.env.NODE_ENV === 'test';

/**
 * Format log message with timestamp and context
 * @param {string} level - Log level (DEBUG, INFO, WARN, ERROR)
 * @param {Array} args - Arguments to log
 * @returns {Array} Formatted arguments
 */
function formatMessage(level, args) {
  const timestamp = new Date().toISOString();
  return [`[${timestamp}] [${level}]`, ...args];
}

/**
 * Logger instance with multiple log levels
 */
export const logger = {
  /**
   * Debug level logging - only in development
   * Use for detailed debugging information
   */
  debug: (...args) => {
    if (isDev && !isTest) {
      console.debug(...formatMessage('DEBUG', args));
    }
  },

  /**
   * Info level logging - only in development
   * Use for general informational messages
   */
  info: (...args) => {
    if (isDev && !isTest) {
      console.info(...formatMessage('INFO', args));
    }
  },

  /**
   * Warning level logging - all environments
   * Use for warning messages that should be reviewed
   */
  warn: (...args) => {
    if (!isTest) {
      console.warn(...formatMessage('WARN', args));
    }
  },

  /**
   * Error level logging - all environments
   * Use for error messages that need immediate attention
   */
  error: (...args) => {
    if (!isTest) {
      console.error(...formatMessage('ERROR', args));
    }

    // In production, you can integrate with error tracking services
    // Example: Sentry.captureException(args[0]);
    if (!isDev && !isTest && typeof window === 'undefined') {
      // Server-side production error tracking would go here
      // errorTracker.captureException(args[0]);
    }
  },

  /**
   * Log with context information
   * @param {string} level - Log level
   * @param {string} message - Log message
   * @param {Object} context - Additional context
   */
  logWithContext: (level, message, context = {}) => {
    const logFn = logger[level] || logger.info;
    logFn(message, JSON.stringify(context, null, 2));
  },
};

/**
 * Default export for convenience
 */
export default logger;
