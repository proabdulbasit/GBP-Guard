// Next.js only exposes browser-safe variables prefixed with NEXT_PUBLIC_.
// Prefer NEXT_PUBLIC_BACKEND_API_URL; fall back to the live Render API.
export const BACKEND_API_URL = (
  process.env.NEXT_PUBLIC_BACKEND_API_URL ||
  'https://gbp-guard.onrender.com/api/v1'
).replace(/\/$/, '')

export interface WpMedia {
  source_url: string
  alt_text?: string
}

export interface BlogPost {
  id: string
  date: string
  slug: string
  title: { rendered: string }
  excerpt: { rendered: string }
  content: { rendered: string }
  rank_math_title?: string
  rank_math_description?: string
  rank_math_focus_keyword?: string
  readingMinutes?: number | null
  _embedded?: { 'wp:featuredmedia'?: WpMedia[] }
}

export interface PostsListResponse {
  posts: BlogPost[]
  totalPages: number
  totalPosts: number
}

/** Temporary overrides while production still serves deleted Unsplash URLs. */
const FEATURED_IMAGE_OVERRIDES: Record<string, string> = {
  'outsourcing-fake-google-review-removal-costs-benefits-roi':
    'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=1200&h=630&fit=crop&q=80',
}

const BROKEN_UNSPLASH_IDS: Record<string, string> = {
  'photo-1556742502-ec7c0e9f3415':
    'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=1200&h=630&fit=crop&q=80',
  'photo-1556741533-f6acd647d2fb':
    'https://images.unsplash.com/photo-1556761175-b413da4baf72?w=1200&h=630&fit=crop&q=80',
  'photo-1556745753-b290469aa3ea':
    'https://images.unsplash.com/photo-1542744173-05336fcc7ad4?w=1200&h=630&fit=crop&q=80',
  'photo-1510511459019-5dda7724ec77':
    'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=1200&h=630&fit=crop&q=80',
  'photo-1573164713980-97440b4950c7':
    'https://images.unsplash.com/photo-1600880292089-90a7e086ee0c?w=1200&h=630&fit=crop&q=80',
}

export function getFeaturedImage(post: BlogPost): string | null {
  if (FEATURED_IMAGE_OVERRIDES[post.slug]) return FEATURED_IMAGE_OVERRIDES[post.slug]

  const raw = post._embedded?.['wp:featuredmedia']?.[0]?.source_url || null
  if (!raw) return null

  for (const [brokenId, replacement] of Object.entries(BROKEN_UNSPLASH_IDS)) {
    if (raw.includes(brokenId)) return replacement
  }

  return raw
}

export async function fetchPosts(page = 1, perPage = 12): Promise<PostsListResponse> {
  const response = await fetch(`${BACKEND_API_URL}/posts?page=${page}&perPage=${perPage}`, {
    cache: 'no-store',
  })
  if (!response.ok) throw new Error(`Failed to load posts (${response.status})`)
  return response.json()
}

export async function fetchPostBySlug(slug: string): Promise<BlogPost> {
  const response = await fetch(`${BACKEND_API_URL}/posts/${encodeURIComponent(slug)}`, {
    cache: 'no-store',
  })
  if (!response.ok) throw new Error(response.status === 404 ? 'Post not found' : `Failed to load post (${response.status})`)
  const data = await response.json()
  return data.post as BlogPost
}
