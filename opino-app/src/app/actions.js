'use server'

export async function logToServer(message, data) {
  const timestamp = new Date().toISOString();
  console.log(`[SERVER LOG] ${timestamp} - ${message}`, JSON.stringify(data, null, 2));
}
