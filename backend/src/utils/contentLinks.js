/**
 * Strip /blog/ from internal post links so they match root-level routes (/:slug).
 */
export const normalizeInternalLinks = (html = '') =>
  String(html)
    .replace(/href=(["'])\/blog\//gi, 'href=$1/')
    .replace(/href=(["'])(https?:\/\/[^"']+)\/blog\//gi, 'href=$1$2/');
