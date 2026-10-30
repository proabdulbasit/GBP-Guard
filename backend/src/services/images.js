import { slugify } from '../utils/slug.js';

/**
 * Topic-tagged Unsplash image catalogs (all URLs verified HTTP 200).
 * Each post gets a unique image from its matched topic pool (or global pool).
 */
const IMAGE_POOLS = {
  cms: [
    'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1200&h=630&fit=crop&q=80',
    'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1200&h=630&fit=crop&q=80',
    'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=1200&h=630&fit=crop&q=80',
  ],
  graphql: [
    'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=1200&h=630&fit=crop&q=80',
    'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1200&h=630&fit=crop&q=80',
    'https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200&h=630&fit=crop&q=80',
  ],
  devops: [
    'https://images.unsplash.com/photo-1667372393119-3d4c48d07fc9?w=1200&h=630&fit=crop&q=80',
    'https://images.unsplash.com/photo-1618401471353-b98afee0b2eb?w=1200&h=630&fit=crop&q=80',
    'https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=1200&h=630&fit=crop&q=80',
    'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=1200&h=630&fit=crop&q=80',
    'https://images.unsplash.com/photo-1629654297299-c8506221ca97?w=1200&h=630&fit=crop&q=80',
  ],
  mobile: [
    'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=1200&h=630&fit=crop&q=80',
    'https://images.unsplash.com/photo-1551650975-87deedd944c3?w=1200&h=630&fit=crop&q=80',
    'https://images.unsplash.com/photo-1607252650355-f7fd0460ccdb?w=1200&h=630&fit=crop&q=80',
    'https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?w=1200&h=630&fit=crop&q=80',
  ],
  design: [
    'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=1200&h=630&fit=crop&q=80',
    'https://images.unsplash.com/photo-1586717791821-3f44a563fa4c?w=1200&h=630&fit=crop&q=80',
    'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=1200&h=630&fit=crop&q=80',
    'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&h=630&fit=crop&q=80',
  ],
  seo: [
    'https://images.unsplash.com/photo-1432888498266-38ffec3eaf0a?w=1200&h=630&fit=crop&q=80',
    'https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?w=1200&h=630&fit=crop&q=80',
    'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&h=630&fit=crop&q=80',
    'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&h=630&fit=crop&q=80',
    'https://images.unsplash.com/photo-1506784365847-bbad939e9335?w=1200&h=630&fit=crop&q=80',
    'https://images.unsplash.com/photo-1434626881859-194d67b2b86f?w=1200&h=630&fit=crop&q=80',
  ],
  marketing: [
    'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=1200&h=630&fit=crop&q=80',
    'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&h=630&fit=crop&q=80',
    'https://images.unsplash.com/photo-1552664730-d307ca884978?w=1200&h=630&fit=crop&q=80',
    'https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=1200&h=630&fit=crop&q=80',
    'https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=1200&h=630&fit=crop&q=80',
    'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=1200&h=630&fit=crop&q=80',
  ],
  performance: [
    'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=1200&h=630&fit=crop&q=80',
    'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=1200&h=630&fit=crop&q=80',
    'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=1200&h=630&fit=crop&q=80',
    'https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?w=1200&h=630&fit=crop&q=80',
  ],
  security: [
    'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=1200&h=630&fit=crop&q=80',
    'https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?w=1200&h=630&fit=crop&q=80',
    'https://images.unsplash.com/photo-1614064641938-3bbee52942c7?w=1200&h=630&fit=crop&q=80',
    'https://images.unsplash.com/photo-1633265486064-086b219458ec?w=1200&h=630&fit=crop&q=80',
    'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=1200&h=630&fit=crop&q=80',
    'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=1200&h=630&fit=crop&q=80',
    'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=1200&h=630&fit=crop&q=80',
    'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=1200&h=630&fit=crop&q=80',
    'https://images.unsplash.com/photo-1504639725590-34d0984388bd?w=1200&h=630&fit=crop&q=80',
  ],
  ai: [
    'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=1200&h=630&fit=crop&q=80',
    'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=1200&h=630&fit=crop&q=80',
    'https://images.unsplash.com/photo-1535378620166-273708d44e4c?w=1200&h=630&fit=crop&q=80',
  ],
  business: [
    'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=1200&h=630&fit=crop&q=80',
    'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1200&h=630&fit=crop&q=80',
    'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=1200&h=630&fit=crop&q=80',
    'https://images.unsplash.com/photo-1553877522-43269d4ea984?w=1200&h=630&fit=crop&q=80',
    'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=1200&h=630&fit=crop&q=80',
    'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=1200&h=630&fit=crop&q=80',
    'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=1200&h=630&fit=crop&q=80',
    'https://images.unsplash.com/photo-1600880292089-90a7e086ee0c?w=1200&h=630&fit=crop&q=80',
    'https://images.unsplash.com/photo-1556761175-4b46a572b786?w=1200&h=630&fit=crop&q=80',
    'https://images.unsplash.com/photo-1542744095-291d1f67b221?w=1200&h=630&fit=crop&q=80',
    'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=1200&h=630&fit=crop&q=80',
    'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200&h=630&fit=crop&q=80',
  ],
  web: [
    'https://images.unsplash.com/photo-1547658719-da2b51169166?w=1200&h=630&fit=crop&q=80',
    'https://images.unsplash.com/photo-1542831371-29b0f74f9713?w=1200&h=630&fit=crop&q=80',
    'https://images.unsplash.com/photo-1593720213428-28a5b9e94613?w=1200&h=630&fit=crop&q=80',
    'https://images.unsplash.com/photo-1487058792275-0ad4aaf24ca7?w=1200&h=630&fit=crop&q=80',
    'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=1200&h=630&fit=crop&q=80',
    'https://images.unsplash.com/photo-1504639725590-34d0984388bd?w=1200&h=630&fit=crop&q=80',
  ],
  reputation: [
    'https://images.unsplash.com/photo-1556745757-8d76bdb6984b?w=1200&h=630&fit=crop&q=80',
    'https://images.unsplash.com/photo-1542744173-05336fcc7ad4?w=1200&h=630&fit=crop&q=80',
    'https://images.unsplash.com/photo-1556761175-b413da4baf72?w=1200&h=630&fit=crop&q=80',
    'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=1200&h=630&fit=crop&q=80',
    'https://images.unsplash.com/photo-1556742111-a301076d9d18?w=1200&h=630&fit=crop&q=80',
    'https://images.unsplash.com/photo-1556740738-b6a63e27c4df?w=1200&h=630&fit=crop&q=80',
    'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1200&h=630&fit=crop&q=80',
    'https://images.unsplash.com/photo-1552664730-d307ca884978?w=1200&h=630&fit=crop&q=80',
    'https://images.unsplash.com/photo-1556742031-c6961e8560b0?w=1200&h=630&fit=crop&q=80',
    'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=1200&h=630&fit=crop&q=80',
    'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=1200&h=630&fit=crop&q=80',
    'https://images.unsplash.com/photo-1573164574572-cb89e39749b4?w=1200&h=630&fit=crop&q=80',
  ],
};

const KEYWORD_TO_POOL = [
  [/headless|cms|wordpress|content management/i, 'cms'],
  [/graphql|api|data.?efficiency|query/i, 'graphql'],
  [/devops|deploy|ci.?cd|docker|kubernetes|zero.?downtime|serverless|edge|isr|incremental static|observability|pipeline|testing/i, 'devops'],
  [/mobile|android|ios|app.?development|react native|flutter/i, 'mobile'],
  [/ui.?ux|design|usability|interface|figma|component.?driven/i, 'design'],
  [/seo|search engine|ranking|organic|google business|gbp|local search/i, 'seo'],
  [/reputation|star rating|trust|review monitor/i, 'reputation'],
  [/marketing|campaign|ads|social media|growth|workflow/i, 'marketing'],
  [/performance|static|cache|speed|optimization|progressive enhancement/i, 'performance'],
  [/security|auth|encryption|cyber|securing|defamat|legal|policy|fake review|removal/i, 'security'],
  [/ai|machine learning|llm|chatbot|artificial/i, 'ai'],
  [/i18n|internationali[sz]|locali[sz]|multi.?lang/i, 'web'],
  [/business|crm|enterprise|startup|team|project.?management|monitoring|competitor/i, 'business'],
  [/web|frontend|react|next\.?js|javascript|typescript/i, 'web'],
];

const CATEGORY_TO_POOL = {
  'Fake Review Removal': 'security',
  'Defamatory Reviews': 'security',
  'Competitor Sabotage Reviews': 'business',
  'Review Monitoring': 'reputation',
  'Google Policy Compliance': 'security',
  'Local Reputation and Ratings': 'reputation',
  'GBP Best Practices': 'marketing',
  'Web Development': 'web',
  'Mobile App Development': 'mobile',
  'UI/UX Design': 'design',
  SEO: 'seo',
  'Content Writing': 'marketing',
  'Software Maintenance': 'devops',
  'Digital Marketing': 'marketing',
  DevOps: 'devops',
  'Project Management': 'business',
  'QA Testing': 'devops',
};

const RAW_ALL_IMAGES = [...new Set(Object.values(IMAGE_POOLS).flat())];

/** Strip cache-buster query so uniqueness compares the real photo. */
export const normalizeImageKey = (url = '') =>
  String(url)
    .replace(/[?&]v=[^&]*/g, '')
    .replace(/\?&/, '?')
    .replace(/[?&]$/, '');

const hashString = (value = '') => {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
};

const pickPoolKey = (title = '', category = '') => {
  for (const [pattern, pool] of KEYWORD_TO_POOL) {
    if (pattern.test(title)) return pool;
  }
  if (category && CATEGORY_TO_POOL[category]) {
    return CATEGORY_TO_POOL[category];
  }
  return 'business';
};

/**
 * Returns a unique, reliable featured image URL for a blog post.
 * Topic keywords bias the pool, then title hash picks a distinct photo.
 */
export const buildFeaturedImageUrl = (title, category = 'review removal') => {
  const key = slugify(title) || String(title || 'post');
  const hash = hashString(key);
  const poolKey = pickPoolKey(title, category);
  const preferred = IMAGE_POOLS[poolKey] || IMAGE_POOLS.business;
  const rest = ALL_UNIQUE_IMAGES.filter((url) => !preferred.includes(url));
  const ordered = [...preferred, ...rest];
  return ordered[hash % ordered.length];
};

/**
 * Old Pollinations and known-deleted Unsplash IDs — replace them on read.
 */
export const isUnreliableImageUrl = (url = '') =>
  !url ||
  url.includes('image.pollinations.ai') ||
  url.includes('pollinations.ai') ||
  url.includes('localhost') ||
  url.includes('photo-1533750349088-cd871a87b26d') ||
  url.includes('photo-1432888622747-4eb9a8f2c3a1') ||
  url.includes('photo-1484417894907-623942c8ee41') ||
  url.includes('photo-1542744173-8e2bd585f267') ||
  url.includes('photo-1556742502-ec7c0e9f3415') ||
  url.includes('photo-1556741533-f6acd647d2fb') ||
  url.includes('photo-1556745753-b290469aa3ea') ||
  url.includes('photo-1510511459019-5dda7724ec77') ||
  url.includes('photo-1573164713980-97440b4950c7') ||
  url.includes('photo-1556740758-90de354c81a1');

const ALL_UNIQUE_IMAGES = RAW_ALL_IMAGES.filter((url) => !isUnreliableImageUrl(url));

/**
 * Pick a featured image that is not already used by another post.
 * Never reuses a pool image already present in `used` while unused ones remain.
 */
export const buildUniqueFeaturedImageUrl = (title, category = 'review removal', used = new Set()) => {
  const usedKeys = new Set([...used].map(normalizeImageKey));
  const isFree = (candidate) =>
    !isUnreliableImageUrl(candidate) && !usedKeys.has(normalizeImageKey(candidate));

  const preferred = buildFeaturedImageUrl(title, category);
  if (isFree(preferred)) return preferred;

  for (let salt = 1; salt <= ALL_UNIQUE_IMAGES.length + 20; salt += 1) {
    const candidate = buildFeaturedImageUrl(`${title}-${salt}`, category);
    if (isFree(candidate)) return candidate;
  }

  // Exhaustive scan of the full catalog
  const hash = hashString(slugify(title) || title);
  const start = ALL_UNIQUE_IMAGES.length ? hash % ALL_UNIQUE_IMAGES.length : 0;
  const rotated = [
    ...ALL_UNIQUE_IMAGES.slice(start),
    ...ALL_UNIQUE_IMAGES.slice(0, start),
  ];
  for (const candidate of rotated) {
    if (isFree(candidate)) return candidate;
  }

  // Pool fully exhausted — still return a unique URL (different cache key per post)
  const base = preferred || ALL_UNIQUE_IMAGES[0];
  const slug = slugify(title) || `post-${Date.now()}`;
  return `${base}${base.includes('?') ? '&' : '?'}v=${encodeURIComponent(slug)}`;
};