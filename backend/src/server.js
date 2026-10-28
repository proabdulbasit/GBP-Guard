import http from 'node:http';
import { config } from './config.js';
import { getCorsHeaders, sendJson, notFound, parseJsonBody } from './utils/http.js';
import { requireAutoPostSecret } from './middleware/requireAutoPostSecret.js';
import { autoPublishPosts, getPostBySlug, listPosts } from './services/posts.service.js';
import { buildSitemapXml, notifySearchEngines } from './services/sitemap.js';

const handleRequest = async (req, res) => {
  const url = new URL(req.url || '/', 'http://localhost');

  if (req.method === 'OPTIONS') {
    res.writeHead(204, getCorsHeaders(req));
    res.end();
    return;
  }

  try {
    // Dynamic sitemap — static pages + all published blog posts from MongoDB
    if (req.method === 'GET' && (url.pathname === '/sitemap.xml' || url.pathname === '/api/v1/sitemap.xml')) {
      const xml = await buildSitemapXml();
      res.writeHead(200, {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'public, max-age=600',
        ...getCorsHeaders(req),
      });
      res.end(xml);
      return;
    }

    if ((req.method === 'GET' || req.method === 'HEAD') && url.pathname === '/health') {
      if (req.method === 'HEAD') {
        res.writeHead(200, {
          'Content-Type': 'application/json; charset=utf-8',
          ...getCorsHeaders(req),
        });
        res.end();
        return;
      }
      sendJson(res, 200, {
        ok: true,
        uptimeSeconds: Math.floor(process.uptime()),
        nodeVersion: process.version,
        timestamp: new Date().toISOString(),
      }, {}, req);
      return;
    }

    if (req.method === 'GET' && url.pathname === '/') {
      sendJson(res, 200, {
        service: 'gbp-guard-groq-backend',
        status: 'ok',
        endpoints: {
          health: 'GET /health',
          listPosts: 'GET /api/v1/posts',
          getPost: 'GET /api/v1/posts/:slug',
          sitemap: 'GET /sitemap.xml',
          autoPublish: 'POST /api/v1/posts/auto-publish',
        },
      }, {}, req);
      return;
    }

    if ((req.method === 'GET' || req.method === 'HEAD') && url.pathname === '/api/v1/posts') {
      if (req.method === 'HEAD') {
        res.writeHead(200, {
          'Content-Type': 'application/json; charset=utf-8',
          ...getCorsHeaders(req),
        });
        res.end();
        return;
      }
      const page = Number(url.searchParams.get('page') || '1');
      const perPage = Number(url.searchParams.get('perPage') || '12');
      const category = url.searchParams.get('category') || null;
      const result = await listPosts({ page, perPage, category });
      sendJson(res, 200, result, {}, req);
      return;
    }

    if ((req.method === 'GET' || req.method === 'HEAD') && url.pathname.startsWith('/api/v1/posts/')) {
      const slug = decodeURIComponent(url.pathname.replace('/api/v1/posts/', ''));
      const post = await getPostBySlug(slug);
      if (!post) {
        notFound(res, req.method, url.pathname, req);
        return;
      }
      if (req.method === 'HEAD') {
        res.writeHead(200, {
          'Content-Type': 'application/json; charset=utf-8',
          ...getCorsHeaders(req),
        });
        res.end();
        return;
      }
      sendJson(res, 200, { post }, {}, req);
      return;
    }

    if (req.method === 'POST' && url.pathname === '/api/v1/posts/auto-publish') {
      if (!requireAutoPostSecret(req, res)) {
        sendJson(res, 401, { error: 'unauthorized', detail: 'Invalid auto-post secret' }, {}, req);
        return;
      }

      const body = await parseJsonBody(req);
      const count = body.count == null ? 1 : Number(body.count);
      const category = typeof body.category === 'string' ? body.category.trim() : null;
      const dryRun = Boolean(body.dryRun);

      const result = await autoPublishPosts({ count, category, dryRun });

      if (!dryRun && result.published > 0) {
        const postUrls = result.results
          .filter((item) => item.ok && item.post?.slug)
          .map((item) => `${config.siteBaseUrl}/${item.post.slug}`);
        await notifySearchEngines(postUrls);
      }

      sendJson(res, 201, result, {}, req);
      return;
    }

    notFound(res, req.method, url.pathname, req);
  } catch (error) {
    console.error('Unhandled backend error:', error);
    sendJson(res, 500, { error: 'internal_server_error' }, {}, req);
  }
};

export const createServer = () => http.createServer(handleRequest);
