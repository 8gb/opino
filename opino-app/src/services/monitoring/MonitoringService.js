import { logToServer } from '@/app/actions';
import { logger } from '@/lib/logger';

class MonitoringService {
  constructor() {
    this.events = [];
  }

  logEvent(eventName, data = {}) {
    const timestamp = new Date().toISOString();
    const event = { eventName, data, timestamp };
    this.events.push(event);

    // In a real app, send to analytics backend (e.g. GA, Mixpanel, Sentry)
    logger.info(`[Monitoring] ${eventName}:`, data);

    // Send to server
    logToServer(`EVENT: ${eventName}`, data).catch(e => logger.error('Server logging failed', e));
  }

  logError(error, context = {}) {
    const timestamp = new Date().toISOString();
    const event = { eventName: 'ERROR', error: error.message, stack: error.stack, context, timestamp };
    this.events.push(event);

    logger.error(`[Monitoring] Error in ${context.operation || 'unknown'}:`, error);

    // Send to server
    logToServer(`ERROR in ${context.operation || 'unknown'}`, {
      message: error.message,
      stack: error.stack,
      context
    }).catch(e => logger.error('Server logging failed', e));
  }

  getEvents() {
    return this.events;
  }
}

export default new MonitoringService();
