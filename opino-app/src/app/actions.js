'use server'
import { logger } from '@/lib/logger';

export async function logToServer(message, data) {
  logger.info(message, data);
}
