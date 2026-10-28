import { listSitemapEntries } from '../repositories/posts.repository.js';
import { submitToIndexNow } from './indexing.js';

/**
 * Public site URL used in sitemap <loc> entries.
 * Until a custom domain exists, this is the Vercel production URL.
 * When you buy a brand domain, set SITE_BASE_URL (or SITEMAP_SITE_URL) on Render to that domain.
 */
const PRODUCTION_SITE_URL = 'https://gbp-guard.vercel.app';

const resolveSitemapSiteUrl = () => {
  const raw = (process.env.SITEMAP_SITE_URL || process.env.SITE_BASE_URL || PRODUCTION_SITE_URL)
    .trim()
    .replace(/\/+$/, '');

  let url = raw;
  if (!/^https?:\/\//i.test(url)) {
    url = `https://${url}`;
  }

  try {
    const parsed = new URL(url);
    // Backend/local hosts are never the public site — fall back to production
    if (
      parsed.hostname.includes('onrender.com') ||
      parsed.hostname.includes('localhost') ||
      parsed.hostname.includes('127.0.0.1')
    ) {
      return PRODUCTION_SITE_URL;
    }
    // vercel.app is allowed while it is the live site; custom domains also pass through
    return `${parsed.protocol}//${parsed.host}`;
  } catch {
    return PRODUCTION_SITE_URL;
  }
};

const SITE_URL = () => resolveSitemapSiteUrl();

const STATIC_PAGES = [
  { path: '/', priority: '1.0', changefreq: 'weekly' },
  { path: '/blog', priority: '0.9', changefreq: 'daily' },
];

const formatDate = (value) => {
  const date = value instanceof Date ? value : new Date(value || Date.now());
  if (Number.isNaN(date.getTime())) return new Date().toISOString().slice(0, 10);
  return date.toISOString().slice(0, 10);
};

const escapeXml = (value = '') =>
  String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');

/**
 * Builds a full sitemap: static site pages + every published MongoDB blog post.
 * Automatically includes new posts as soon as they are published.
 */
export const buildSitemapXml = async () => {
  const siteUrl = SITE_URL();
  const today = formatDate(new Date());
  const posts = await listSitemapEntries();

  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

  for (const page of STATIC_PAGES) {
    xml += '  <url>\n';
    xml += `    <loc>${escapeXml(`${siteUrl}${page.path}`)}</loc>\n`;
    xml += `    <lastmod>${today}</lastmod>\n`;
    xml += `    <changefreq>${page.changefreq}</changefreq>\n`;
    xml += `    <priority>${page.priority}</priority>\n`;
    xml += '  </url>\n';
  }

  for (const post of posts) {
    xml += '  <url>\n';
    xml += `    <loc>${escapeXml(`${siteUrl}/${post.slug}`)}</loc>\n`;
    xml += `    <lastmod>${formatDate(post.lastmod)}</lastmod>\n`;
    xml += '    <changefreq>weekly</changefreq>\n';
    xml += '    <priority>0.7</priority>\n';
    xml += '  </url>\n';
  }

  xml += '</urlset>';
  return xml;
};

/**
 * Ping search engines and submit URLs to IndexNow when a new post is published.
 */
export const notifySearchEngines = async (postUrls = []) => {
  const siteUrl = SITE_URL();
  const sitemapUrl = `${siteUrl}/sitemap.xml`;
  const allUrls = [...postUrls, sitemapUrl];

  await submitToIndexNow(allUrls);

  // Google deprecated sitemap ping — sitemap + IndexNow + crawlable HTML is the reliable path.
  const sitemapEncoded = encodeURIComponent(sitemapUrl);
  const pings = [
    `https://www.bing.com/ping?sitemap=${sitemapEncoded}`,
  ];

  for (const url of pings) {
    try {
      const res = await fetch(url);
      console.log(`[sitemap] ping ${url.split('?')[0]} → ${res.status}`);
    } catch (err) {
      console.warn(`[sitemap] ping failed: ${err.message}`);
    }
  }

  for (const postUrl of postUrls) {
    console.log(`[indexing] new URL ready: ${postUrl}`);
  }
};
