/** Public site origin used for canonical URLs and other absolute metadata. */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ||
  process.env.SITE_BASE_URL ||
  'https://gbp-guard.com'
).replace(/\/$/, '')

export const indexFollowRobots = {
  index: true,
  follow: true,
  'max-image-preview': 'large' as const,
  'max-snippet': -1,
  'max-video-preview': -1,
  googleBot: {
    index: true,
    follow: true,
    'max-image-preview': 'large' as const,
    'max-snippet': -1,
    'max-video-preview': -1,
  },
}
