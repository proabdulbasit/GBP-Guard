import { config } from '../config.js';

const readSecret = (req) => {
  const bearer = (req.headers.authorization || '').replace(/^Bearer\s+/i, '');
  const header = req.headers['x-api-key'];
  const query = req.url ? new URL(req.url, 'http://localhost').searchParams.get('key') : '';
  return String(query || header || bearer || '').trim();
};

export const requireAutoPostSecret = (req, res) => {
  if (!config.autoPostSecret) return true;
  return readSecret(req) === config.autoPostSecret;
};
