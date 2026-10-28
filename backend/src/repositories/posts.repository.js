import { ObjectId } from 'mongodb';
import { getPostsCollection } from '../db/mongo.js';
import { buildFeaturedImageUrl, isUnreliableImageUrl, normalizeImageKey } from '../services/images.js';
import { normalizeInternalLinks } from '../utils/contentLinks.js';

const estimateReadingMinutes = (html = '') => {
  const text = String(html)
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  if (!text) return null;
  return Math.max(1, Math.round(text.split(' ').filter(Boolean).length / 220));
};

const toObjectId = (value) => {
  try {
    return new ObjectId(String(value));
  } catch {
    return null;
  }
};

const resolveFeaturedImage = (doc) => {
  if (doc.featuredImage && !isUnreliableImageUrl(doc.featuredImage)) {
    return doc.featuredImage;
  }
  return buildFeaturedImageUrl(doc.title, doc.category);
};

const toWpPost = (doc) =>
  doc && {
    id: doc._id.toString(),
    date: (doc.publishedAt || doc.createdAt || new Date()).toISOString(),
    slug: doc.slug,
    title: { rendered: doc.title },
    excerpt: { rendered: doc.excerpt || '' },
    content: { rendered: normalizeInternalLinks(doc.contentHtml || '') },
    rank_math_title: doc.seo?.seoTitle || '',
    rank_math_description: doc.seo?.metaDescription || '',
    rank_math_focus_keyword: doc.seo?.focusKeyword || '',
    _embedded: {
      'wp:featuredmedia': [{ source_url: resolveFeaturedImage(doc), alt_text: doc.title }],
    },
  };

const toSummary = (doc) => ({
  id: doc._id.toString(),
  slug: doc.slug,
  date: (doc.publishedAt || doc.createdAt || new Date()).toISOString(),
  title: { rendered: doc.title || '' },
  excerpt: { rendered: doc.excerpt || '' },
  content: { rendered: '' },
  rank_math_title: doc.seo?.seoTitle || '',
  rank_math_description: doc.seo?.metaDescription || '',
  rank_math_focus_keyword: doc.seo?.focusKeyword || '',
  _embedded: {
    'wp:featuredmedia': [{ source_url: resolveFeaturedImage(doc), alt_text: doc.title }],
  },
  readingMinutes: estimateReadingMinutes(doc.contentHtml),
});

export const listFeaturedImages = async () => {
  const posts = await getPostsCollection();
  const docs = await posts.find({}).project({ featuredImage: 1, title: 1, category: 1 }).toArray();
  const used = new Set();

  for (const doc of docs) {
    if (doc.featuredImage && !isUnreliableImageUrl(doc.featuredImage)) {
      used.add(normalizeImageKey(doc.featuredImage));
      used.add(doc.featuredImage);
    } else {
      const fallback = buildFeaturedImageUrl(doc.title, doc.category);
      used.add(normalizeImageKey(fallback));
      used.add(fallback);
    }
  }

  return used;
};

export const slugExists = async (slug, excludeId = null) => {
  const posts = await getPostsCollection();
  const query = { slug };
  const objectId = excludeId ? toObjectId(excludeId) : null;
  if (objectId) query._id = { $ne: objectId };
  return (await posts.countDocuments(query)) > 0;
};

export const insertPost = async (post) => {
  const posts = await getPostsCollection();
  const now = new Date();
  const document = {
    ...post,
    createdAt: post.createdAt ? new Date(post.createdAt) : now,
    updatedAt: post.updatedAt ? new Date(post.updatedAt) : now,
    publishedAt: post.publishedAt ? new Date(post.publishedAt) : now,
  };
  const result = await posts.insertOne(document);
  return toWpPost({ ...document, _id: result.insertedId });
};

export const listPublished = async ({ limit = 9, offset = 0, category = null } = {}) => {
  const posts = await getPostsCollection();
  const query = { status: 'published' };
  if (category) query.category = category;
  const docs = await posts
    .find(query)
    .sort({ publishedAt: -1, createdAt: -1 })
    .skip(offset)
    .limit(limit)
    .toArray();
  return docs.map(toSummary);
};

export const countPublished = async ({ category = null } = {}) => {
  const posts = await getPostsCollection();
  const query = { status: 'published' };
  if (category) query.category = category;
  return posts.countDocuments(query);
};

export const findPublishedBySlug = async (slug) => {
  const posts = await getPostsCollection();
  const doc = await posts.findOne({ slug, status: 'published' });
  return toWpPost(doc);
};

export const recentPosts = async (limit = 200) => {
  const posts = await getPostsCollection();
  const docs = await posts.find({}).sort({ updatedAt: -1, createdAt: -1 }).limit(limit).toArray();
  return docs.map(toWpPost);
};

/** Lightweight list for sitemap.xml generation */
export const listSitemapEntries = async () => {
  const posts = await getPostsCollection();
  const docs = await posts
    .find({ status: 'published' })
    .project({ slug: 1, updatedAt: 1, publishedAt: 1 })
    .sort({ publishedAt: -1 })
    .toArray();

  return docs.map((doc) => ({
    slug: doc.slug,
    lastmod: doc.updatedAt || doc.publishedAt || new Date(),
  }));
};
