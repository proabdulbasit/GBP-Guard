const stripHtml = (html = '') =>
  String(html)
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const countWords = (text = '') => (text ? text.split(' ').filter(Boolean).length : 0);
const countMatches = (text, pattern) => (text.match(pattern) || []).length;
const countInternalLinks = (html = '') => countMatches(html, /href=["']\/(?!\/)[^"']*["']/g);

export const qualityGate = ({ title, contentHtml, metaDescription, focusKeyword, slug }) => {
  const reasons = [];
  const text = stripHtml(contentHtml);
  const words = countWords(text);
  const headings = countMatches(contentHtml, /<h2\b/gi);
  const internalLinks = countInternalLinks(contentHtml);
  let score = 0;

  if (!title || !focusKeyword) reasons.push('missing title or focus keyword');
  if (!contentHtml || contentHtml.length < 800) reasons.push('content too short');
  if (words < 500) reasons.push(`only ${words} words`);
  if (headings < 4) reasons.push('too few H2 sections');
  if (internalLinks < 2) reasons.push('not enough internal links');
  if (!metaDescription || metaDescription.length < 100 || metaDescription.length > 200) {
    reasons.push('meta description length is off');
  }
  if (!slug || slug.length < 3) reasons.push('slug is too short');

  score += Math.min(30, Math.round(words / 50));
  score += Math.min(20, headings * 4);
  score += Math.min(20, internalLinks * 10);
  score += metaDescription?.length >= 100 && metaDescription?.length <= 200 ? 20 : 0;
  score += focusKeyword ? 10 : 0;

  return { ok: reasons.length === 0, reasons, score: Math.min(100, score), words, headings, internalLinks };
};
