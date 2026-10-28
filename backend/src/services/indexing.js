const PRODUCTION_HOST = 'gbp-guard.vercel.app';

const resolveHost = () => {
  try {
    const raw = (process.env.SITE_BASE_URL || `https://${PRODUCTION_HOST}`).trim();
    return new URL(/^https?:\/\//i.test(raw) ? raw : `https://${raw}`).host;
  } catch {
    return PRODUCTION_HOST;
  }
};

/**
 * Notify Bing/Yandex via IndexNow when URLs are published or updated.
 * Google does not use IndexNow — use sitemap + crawlable HTML for Google.
 */
export const submitToIndexNow = async (urls = []) => {
  const key = process.env.INDEXNOW_KEY;
  if (!key) {
    console.warn('[indexnow] INDEXNOW_KEY not set — skipping');
    return { ok: false, skipped: true };
  }

  const host = resolveHost();
  const absolute = urls
    .map((url) => {
      const value = String(url || '').trim();
      if (!value) return null;
      if (/^https?:\/\//i.test(value)) return value;
      return `https://${host}${value.startsWith('/') ? value : `/${value}`}`;
    })
    .filter(Boolean);

  if (absolute.length === 0) {
    return { ok: false, skipped: true };
  }

  const payload = {
    host,
    key,
    keyLocation: `https://${host}/${key}.txt`,
    urlList: absolute.slice(0, 10000),
  };

  const endpoints = ['https://api.indexnow.org/indexnow', 'https://www.bing.com/indexnow'];
  const results = [];

  for (const endpoint of endpoints) {
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json; charset=utf-8' },
        body: JSON.stringify(payload),
      });
      results.push({ endpoint, status: res.status });
      console.log(`[indexnow] ${endpoint} → ${res.status}`);
    } catch (error) {
      results.push({ endpoint, error: error.message });
      console.warn(`[indexnow] ${endpoint} failed: ${error.message}`);
    }
  }

  return { ok: results.some((item) => item.status === 200 || item.status === 202), results };
};
