'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import BlogPostCard from './BlogPostCard'
import { fetchPosts, type BlogPost } from '@/lib/blogApi'

export default function BlogPreview() {
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    fetchPosts(1, 3)
      .then((data) => { if (!cancelled) setPosts(data.posts) })
      .catch(() => { if (!cancelled) setPosts([]) })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [])

  return (
    <section className="home-blog-section" id="blog">
      <div className="container">
        <div className="home-blog-heading">
          <span className="blog-eyebrow">BLOG</span>
          <h2>Latest insights on reviews &amp;<br /> reputation</h2>
          <p>Practical guidance on fake reviews, Google policies, and protecting your<br className="desktop-only" /> Google Business Profile.</p>
        </div>

        {loading && <div className="blog-grid home-blog-grid">{Array.from({ length: 3 }, (_, i) => <div key={i} className="blog-skeleton" />)}</div>}
        {!loading && posts.length > 0 && <div className="blog-grid home-blog-grid">{posts.map((post) => <BlogPostCard key={post.id} post={post} />)}</div>}
        {!loading && posts.length === 0 && <div className="blog-message"><strong>No posts published yet</strong><span>New articles will appear here automatically.</span></div>}

        <div className="home-blog-action"><Link href="/blog">View all posts <ArrowRight /></Link></div>
      </div>
    </section>
  )
}
