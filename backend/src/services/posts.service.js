import { config } from '../config.js';
import { slugify } from '../utils/slug.js';
import { chatJSON, chatText, GroqError } from './groq.js';
import { buildUniqueFeaturedImageUrl } from './images.js';
import { normalizeInternalLinks } from '../utils/contentLinks.js';
import { qualityGate } from './qualityGate.js';
import { PILLARS, SERVICE_LINKS, pickPillar } from '../content/pillars.js';
import * as repo from '../repositories/posts.repository.js';

const normalize = (value = '') => String(value).toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();

const cleanHtmlBody = (raw = '') => {
  let html = String(raw).trim();
  html = html.replace(/^```(?:html)?\s*/i, '').replace(/```\s*$/i, '').trim();
  const firstTag = html.search(/<(h2|h3|p|ul|ol|blockquote)\b/i);
  if (firstTag > 0) html = html.slice(firstTag);
  return html.trim();
};

const normalizeTags = (tags) => {
  if (!Array.isArray(tags)) return [];
  return [...new Set(tags.filter((tag) => typeof tag === 'string' && tag.trim()).map((tag) => tag.trim().toLowerCase()))].slice(0, 8);
};

const clampMetaDescription = (text, focusKeyword, min = 120, max = 160) => {
  let value = String(text || '').trim();
  if (!value) {
    value = `Learn practical strategies for ${focusKeyword} and how legitimate review removal protects your Google Business Profile.`;
  }
  if (value.length < min) {
    value = `${value} Expert insights from GBP-Guard.`.trim();
  }
  if (value.length > max) {
    value = value.slice(0, max - 3).trim() + '...';
  }
  while (value.length < min && value.length < max) {
    value += '.';
  }
  return value.slice(0, max);
};

const clampExcerpt = (text, title, max = 220) => {
  const value = String(text || title || '').trim();
  if (value.length <= max) return value;
  return value.slice(0, max - 3).trim() + '...';
};

const serviceLinksText = SERVICE_LINKS.map((link) => `${link.href} (${link.anchor})`).join(', ');

const countInternalLinks = (html = '') =>
  (String(html).match(/href=["']\/(?!\/)[^"']*["']/g) || []).length;

/** Guarantee quality-gate internal links when the model omits them (common on first posts). */
const ensureInternalLinks = (html = '') => {
  if (countInternalLinks(html) >= 2) return html;

  const picks = SERVICE_LINKS.slice(0, 3);
  const links = picks
    .map((link) => `<a href="${link.href}">${link.anchor}</a>`)
    .join(', ');

  return `${html}\n<p>Learn more about our ${links}.</p>`;
};

const buildUniqueSlug = async (desired, excludeId = null) => {
  const base = slugify(desired) || 'post';
  let slug = base;
  let suffix = 2;
  while (await repo.slugExists(slug, excludeId)) {
    slug = `${base}-${suffix}`;
    suffix += 1;
  }
  return slug;
};

const proposeTopic = async (pillar, recentPosts) => {
  const existing = recentPosts
    .slice(0, 40)
    .map((post) => `- ${post.title.rendered} (/${post.slug})`)
    .join('\n');

  const data = await chatJSON({
    system:
      'You are the head of content and SEO for GBP-Guard, a Google review removal and reputation protection company. Be practical, specific, and avoid fluff. Respond with JSON only.',
    user: [
      `Category: ${pillar.name}`,
      `What this category covers: ${pillar.covers}`,
      'Angles to avoid repeating verbatim:',
      ...pillar.angles.map((angle) => `- ${angle}`),
      '',
      'Already published:',
      existing || '(none yet)',
      '',
      'Return a JSON object with exactly these keys:',
      'title (string, 45-65 chars), focusKeyword (string), audience (string), outline (array of 7-9 strings), searchIntent (informational or commercial)',
    ].join('\n'),
    temperature: 0.7,
    maxTokens: 1000,
  });

  if (!data?.title || !data?.focusKeyword) return null;

  return {
    title: String(data.title).trim(),
    focusKeyword: String(data.focusKeyword).trim(),
    audience: String(data.audience ?? 'local business owners and operators').trim(),
    outline: Array.isArray(data.outline)
      ? data.outline.map((item) => String(item).trim()).filter(Boolean).slice(0, 9)
      : [],
    searchIntent: String(data.searchIntent ?? 'informational').trim(),
  };
};

const writePost = async (topic, recentPosts, pillar, { deep = false } = {}) => {
  const relatedPosts = recentPosts
    .slice(0, 12)
    .map((post) => `/${post.slug} - "${post.title.rendered}"`)
    .join('\n');
  const outline = (topic.outline.length
    ? topic.outline
    : ['Introduction', 'Common mistakes', 'How to do it well', 'What to do next']
  ).map((line) => `- ${line}`).join('\n');
  const pillarLinks = PILLARS.slice(0, 3).map((item) => `/${item.key} - ${item.name}`).join('\n');

  const body = await chatText({
    system:
      'You are an expert SEO writer for GBP-Guard, a company that removes fake, defamatory, and policy-violating Google reviews through legitimate channels. Write useful, grounded content with no filler and no made-up statistics.',
    user: [
      `Title: ${topic.title}`,
      `Focus keyword: ${topic.focusKeyword}`,
      `Audience: ${topic.audience}`,
      `Category: ${pillar.name}`,
      '',
      `Service links available: ${serviceLinksText}`,
      'Related posts:',
      relatedPosts || '(none yet)',
      '',
      'Outline. Write every item as an <h2> section:',
      outline,
      '',
      'Requirements:',
      '- Return only HTML, starting with the first tag.',
      '- Use only h2, h3, p, ul, ol, li, blockquote, strong, em, a.',
      '- Include at least TWO internal links using root-relative hrefs that start with / (example: href="/#services" or href="/blog"). Never use full https:// URLs for internal links. Never use /blog/ in post URLs.',
      relatedPosts
        ? '- Prefer linking to related posts listed above when available, plus at least one service link from the service links list.'
        : '- There are no related posts yet. You MUST include at least two links from the service links list (e.g. /#services, /#how-it-works, /blog, /#contact).',
      '- End with a short call to action that includes an <a href="/#contact"> contact link.',
      '- Make the article feel complete and ready to publish.',
      '- Include the focus keyword naturally in the first paragraph and in at least one section heading.',
      deep
        ? '- Aim for 1,500 to 2,000 words and go deeper with practical detail.'
        : '- Aim for 800 to 1,200 words.',
      '',
      'Optional pillar context:',
      pillarLinks,
    ].join('\n'),
    temperature: 0.65,
    maxTokens: deep ? 7000 : 5500,
  });

  const contentHtml = ensureInternalLinks(normalizeInternalLinks(cleanHtmlBody(body)));

  const seo = await chatJSON({
    system: 'You are a strict SEO editor. Respond with a single JSON object only.',
    user: [
      `Title: ${topic.title}`,
      `Focus keyword: ${topic.focusKeyword}`,
      '',
      'Article text:',
      contentHtml.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 3000),
      '',
      'Return JSON keys: seoTitle (max 60 chars), metaDescription (120-160 chars), excerpt (max 220 chars), tags (array of 3-6 lowercase strings)',
    ].join('\n'),
    temperature: 0.4,
    maxTokens: 800,
  });

  const metaDescription = clampMetaDescription(seo?.metaDescription, topic.focusKeyword);
  const excerpt = clampExcerpt(seo?.excerpt, topic.title);

  return {
    contentHtml,
    seoTitle: String(seo?.seoTitle ?? topic.title).trim().slice(0, 60),
    metaDescription,
    excerpt,
    tags: normalizeTags(seo?.tags),
  };
};

const buildDraftPost = async ({ pillar, topic, recentPosts, dryRun = false, deep = false }) => {
  const drafted = await writePost(topic, recentPosts, pillar, { deep });
  const slug = await buildUniqueSlug(topic.title);
  const usedImages = await repo.listFeaturedImages();
  const now = new Date().toISOString();
  const doc = {
    slug,
    title: topic.title,
    excerpt: drafted.excerpt || topic.title.slice(0, 160),
    contentHtml: drafted.contentHtml,
    featuredImage: buildUniqueFeaturedImageUrl(topic.title, pillar.name, usedImages),
    authorName: 'Groq Agent',
    authorId: null,
    category: pillar.name,
    tags: drafted.tags,
    status: 'published',
    seo: {
      seoTitle: drafted.seoTitle || topic.title,
      metaDescription: drafted.metaDescription,
      focusKeyword: topic.focusKeyword,
      searchIntent: topic.searchIntent,
      robots: 'index,follow',
      score: 0,
    },
    publishedAt: now,
    createdAt: now,
    updatedAt: now,
    source: {
      provider: 'groq',
      model: config.groqModel,
      dryRun,
    },
  };

  const gate = qualityGate({
    title: doc.title,
    contentHtml: doc.contentHtml,
    metaDescription: doc.seo.metaDescription,
    focusKeyword: doc.seo.focusKeyword,
    slug: doc.slug,
  });

  if (!gate.ok) {
    return { ok: false, reasons: gate.reasons, title: doc.title, pillar: pillar.name };
  }

  doc.seo.score = gate.score;

  if (dryRun) {
    return { ok: true, dryRun: true, post: doc, score: gate.score };
  }

  const saved = await repo.insertPost(doc);
  return { ok: true, dryRun: false, post: saved, score: gate.score };
};

export const listPosts = async ({ page = 1, perPage = 12, category = null } = {}) => {
  const limit = Math.min(Math.max(Number(perPage) || 12, 1), 50);
  const currentPage = Math.max(Number(page) || 1, 1);
  const offset = (currentPage - 1) * limit;
  const [posts, totalPosts] = await Promise.all([
    repo.listPublished({ limit, offset, category }),
    repo.countPublished({ category }),
  ]);
  const totalPages = Math.max(1, Math.ceil(totalPosts / limit));
  return { posts, totalPages, totalPosts };
};

export const getPostBySlug = async (slug) => repo.findPublishedBySlug(slug);

export const autoPublishPosts = async ({ count = 1, category = null, dryRun = false, deep = false } = {}) => {
  const safeCount = Math.min(Math.max(Number(count) || 1, 1), 5);
  const recentPosts = await repo.recentPosts(250);
  const seenTitles = new Set(recentPosts.map((post) => normalize(post.title.rendered)));
  const results = [];

  for (let index = 0; index < safeCount; index += 1) {
    const pillar = pickPillar(recentPosts, category);
    if (!pillar) {
      results.push({ ok: false, skipped: true, reason: 'no pillar available' });
      continue;
    }

    let topic = null;
    for (let attempt = 0; attempt < 3; attempt += 1) {
      topic = await proposeTopic(pillar, recentPosts);
      if (!topic) continue;
      if (seenTitles.has(normalize(topic.title))) {
        topic = null;
        continue;
      }
      break;
    }

    if (!topic) {
      results.push({ ok: false, skipped: true, reason: `no unique topic for ${pillar.name}` });
      continue;
    }

    try {
      let outcome = null;
      for (let draftAttempt = 0; draftAttempt < 3; draftAttempt += 1) {
        if (draftAttempt > 0) {
          console.warn(`[agent] retrying draft for "${topic.title}" (attempt ${draftAttempt + 1}/3)`);
          topic = await proposeTopic(pillar, recentPosts);
          if (!topic || seenTitles.has(normalize(topic.title))) continue;
        }

        outcome = await buildDraftPost({ pillar, topic, recentPosts, dryRun, deep });
        if (outcome.ok) break;
        console.warn(`[agent] quality gate failed: ${outcome.reasons?.join(', ')}`);
      }

      if (!outcome?.ok) {
        results.push({
          ok: false,
          skipped: true,
          title: topic.title,
          pillar: pillar.name,
          reasons: outcome?.reasons || ['draft failed after retries'],
        });
        continue;
      }

      seenTitles.add(normalize(outcome.post.title.rendered));
      recentPosts.unshift(outcome.post);
      results.push(outcome);
    } catch (error) {
      if (error instanceof GroqError) throw error;
      results.push({ ok: false, skipped: true, title: topic.title, pillar: pillar.name, reason: error.message });
    }
  }

  return {
    requested: safeCount,
    dryRun,
    deep,
    published: results.filter((entry) => entry.ok && !entry.dryRun).length,
    drafted: results.filter((entry) => entry.ok && entry.dryRun).length,
    results,
  };
};
