const requireEnv = (key) => {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
};

const inferMongoDbName = (uri) => {
  if (!uri) return 'app';
  try {
    const pathname = new URL(uri).pathname.replace(/^\/+/, '');
    return pathname || 'app';
  } catch {
    return 'app';
  }
};

/** Groq retired these on 2026-08-16 — map old IDs so existing secrets keep working. */
const GROQ_MODEL_ALIASES = {
  'llama-3.1-8b-instant': 'openai/gpt-oss-20b',
  'llama-3.3-70b-versatile': 'openai/gpt-oss-120b',
  'llama3-8b-8192': 'openai/gpt-oss-20b',
  'llama3-70b-8192': 'openai/gpt-oss-120b',
};

const DEFAULT_GROQ_MODEL = 'openai/gpt-oss-120b';

const resolveGroqModel = (raw) => {
  const model = String(raw || '').trim();
  if (!model) return DEFAULT_GROQ_MODEL;
  return GROQ_MODEL_ALIASES[model] || model;
};

export const config = {
  port: Number(process.env.PORT) || 8000,
  nodeEnv: process.env.NODE_ENV ?? 'development',
  isProduction: process.env.NODE_ENV === 'production',
  siteBaseUrl: (() => {
    const fallback = 'https://gbp-guard.com';
    const raw = (process.env.SITE_BASE_URL || fallback).trim().replace(/\/+$/, '');
    if (!raw) return fallback;
    if (/^https?:\/\//i.test(raw)) return raw;
    return `https://${raw}`;
  })(),
  groqModel: resolveGroqModel(process.env.GROQ_MODEL),
  autoPostSecret: process.env.AUTO_POST_SECRET ?? null,
  getGroqApiKey: () => {
    if (process.env.USE_GROQ_WEEKLY_KEY === '1' && process.env.GROQ_WEEKLY_API_KEY) {
      return process.env.GROQ_WEEKLY_API_KEY;
    }
    return requireEnv('GROQ_API_KEY');
  },
  getMongoUri: () => requireEnv('MONGODB_URI'),
  // GitHub Actions sets MONGODB_DB="" when the var is unset; "" is not nullish for ??,
  // and MongoClient.db("") silently uses the "test" database — treat blank as unset.
  getMongoDbName: () => {
    const explicit = String(process.env.MONGODB_DB || '').trim();
    return explicit || inferMongoDbName(process.env.MONGODB_URI);
  },
};
