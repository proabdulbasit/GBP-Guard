// Next.js only exposes browser-safe variables prefixed with NEXT_PUBLIC_.
// Keep localhost as a development fallback, but configure this explicitly in
// Vercel/production so the browser never depends on a local backend.
export const BACKEND_API_URL = (
  process.env.NEXT_PUBLIC_BACKEND_API_URL ||
  (process.env.NODE_ENV === 'development' ? 'http://localhost:8000/api/v1' : '')
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

export function getFeaturedImage(post: BlogPost): string | null {
  return post._embedded?.['wp:featuredmedia']?.[0]?.source_url || null
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
