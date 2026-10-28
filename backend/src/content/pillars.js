export const SERVICE_LINKS = [
  { href: '/#services', anchor: 'review removal services' },
  { href: '/#how-it-works', anchor: 'how review removal works' },
  { href: '/#pricing', anchor: 'review removal pricing' },
  { href: '/#faq', anchor: 'review removal FAQ' },
  { href: '/#contact', anchor: 'talk to GBP-Guard' },
  { href: '/blog', anchor: 'GBP-Guard blog' },
];

export const PILLARS = [
  {
    key: 'fake-review-removal',
    name: 'Fake Review Removal',
    covers: 'Identifying and removing fake Google reviews from non-customers, bots, and accounts that never interacted with the business.',
    angles: [
      'How to spot a fake Google review',
      'What evidence Google needs to remove fake reviews',
      'Why fake reviews hurt local rankings and bookings',
    ],
  },
  {
    key: 'defamatory-reviews',
    name: 'Defamatory Reviews',
    covers: 'False statements, accusations, and legally defamatory content in Google reviews and how legitimate policy-based removal works.',
    angles: [
      'When a negative review crosses into defamation',
      'How to document false claims for a removal case',
      'Why legal-grade submissions outperform informal complaints',
    ],
  },
  {
    key: 'competitor-sabotage',
    name: 'Competitor Sabotage Reviews',
    covers: 'Coordinated negative review campaigns from competitors and pattern-based abuse reporting.',
    angles: [
      'Signs of a competitor review attack',
      'How to map review clusters and timing patterns',
      'What Google looks for in conflict-of-interest removals',
    ],
  },
  {
    key: 'review-monitoring',
    name: 'Review Monitoring',
    covers: 'Ongoing Google Business Profile monitoring, alerts, and proactive removal requests for new violating reviews.',
    angles: [
      'Why waiting weeks to respond costs customers',
      'What a monitoring workflow should include',
      'How proactive alerts protect your star rating',
    ],
  },
  {
    key: 'google-policy-compliance',
    name: 'Google Policy Compliance',
    covers: 'Google review content policies, prohibited content, and legitimate takedown channels.',
    angles: [
      'Which Google review policies matter most for removals',
      'Common reasons Google rejects removal requests',
      'How to strengthen a policy-based appeal',
    ],
  },
  {
    key: 'local-reputation',
    name: 'Local Reputation and Ratings',
    covers: 'How star ratings, review volume, and reputation affect local search, conversions, and trust.',
    angles: [
      'How one-star reviews affect local search visibility',
      'What a healthy review mix looks like for local businesses',
      'How reputation recovery works after a review attack',
    ],
  },
  {
    key: 'gbp-best-practices',
    name: 'GBP Best Practices',
    covers: 'Google Business Profile hygiene, response strategy, and reputation best practices that reduce future risk.',
    angles: [
      'How to respond to negative reviews without making things worse',
      'GBP settings that reduce spam and abuse exposure',
      'Building a review strategy that supports long-term trust',
    ],
  },
];

const normalize = (value = '') => String(value).toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();

const latestForPillar = (posts, pillar) => {
  const matches = posts.filter((post) => normalize(post.category) === normalize(pillar.name));
  if (matches.length === 0) return 0;
  return Math.max(
    ...matches.map((post) => new Date(post.publishedAt || post.createdAt || 0).getTime())
  );
};

export const pickPillar = (recentPosts, requestedCategory = null) => {
  if (requestedCategory) {
    const requested = normalize(requestedCategory);
    const match = PILLARS.find(
      (pillar) => normalize(pillar.key) === requested || normalize(pillar.name) === requested
    );
    if (match) return match;
    return {
      key: requested.replace(/\s+/g, '-'),
      name: requestedCategory.trim(),
      covers: 'Custom category supplied at runtime.',
      angles: ['How it works', 'Why it matters', 'How to implement it'],
    };
  }

  return [...PILLARS].sort(
    (left, right) => latestForPillar(recentPosts, left) - latestForPillar(recentPosts, right)
  )[0];
};
