'use client'

import { useEffect, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import BlogPostCard from '@/components/blog/BlogPostCard'
import { fetchPosts, type BlogPost } from '@/lib/blogApi'

const PER_PAGE = 12
function pagination(current: number, total: number): (number | 'ellipsis')[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)
  const pages = current <= 3 ? [1, 2, 3, 4, total] : current >= total - 2 ? [1, total - 3, total - 2, total - 1, total] : [1, current - 1, current, current + 1, total]
  const unique = [...new Set(pages)].sort((a, b) => a - b)
  return unique.flatMap((page, index) => index && page - unique[index - 1] > 1 ? ['ellipsis', page] : [page])
}

export default function BlogList() {
  const [posts, setPosts] = useState<BlogPost[]>([]); const [page, setPage] = useState(1); const [totalPages, setTotalPages] = useState(1); const [totalPosts, setTotalPosts] = useState(0); const [loading, setLoading] = useState(true); const [error, setError] = useState<string | null>(null)
  useEffect(() => { let cancelled = false; setLoading(true); setError(null); fetchPosts(page, PER_PAGE).then((data) => { if (cancelled) return; setPosts(data.posts); setTotalPages(data.totalPages); setTotalPosts(data.totalPosts); window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior }) }).catch((e: Error) => { if (!cancelled) { setError(e.message); setPosts([]) } }).finally(() => { if (!cancelled) setLoading(false) }); return () => { cancelled = true } }, [page])
  return <>
    <div className="blog-hero"><span className="blog-eyebrow">GBP-GUARD INSIGHTS</span><h1>Practical guidance for protecting your reputation.</h1><p>Policy-led advice, local search insights, and clear next steps for handling unfair Google reviews.</p></div>
    {loading && <div className="blog-grid">{Array.from({ length: 6 }, (_, i) => <div key={i} className="blog-skeleton" />)}</div>}
    {!loading && error && <div className="blog-message error"><strong>Could not load blog posts</strong><span>{error}</span><small>Make sure the backend is running and NEXT_PUBLIC_BACKEND_API_URL is set.</small></div>}
    {!loading && !error && posts.length === 0 && <div className="blog-message"><strong>No posts published yet</strong><span>New articles will appear here automatically.</span></div>}
    {!loading && !error && posts.length > 0 && <><div className="blog-grid">{posts.map((post) => <BlogPostCard key={post.id} post={post} />)}</div>{totalPages > 1 && <><div className="blog-pagination"><button disabled={page <= 1} onClick={() => setPage((p) => p - 1)} aria-label="Previous page"><ChevronLeft /></button>{pagination(page, totalPages).map((item, i) => item === 'ellipsis' ? <span key={`e-${i}`}>…</span> : <button key={item} onClick={() => setPage(item)} className={item === page ? 'current' : ''}>{item}</button>)}<button disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)} aria-label="Next page"><ChevronRight /></button></div><p className="blog-count">Showing {(page - 1) * PER_PAGE + 1}–{Math.min(page * PER_PAGE, totalPosts)} of {totalPosts} posts</p></>}</>}
  </>
}
