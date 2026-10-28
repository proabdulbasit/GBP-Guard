import Link from 'next/link'
import { ArrowLeft, Calendar, Clock } from 'lucide-react'
import { BlogFooter, BlogHeader } from '@/components/blog/BlogChrome'
import { fetchPostBySlug, getFeaturedImage } from '@/lib/blogApi'

export const dynamic = 'force-dynamic'
const RESERVED = new Set(['blog', 'api', 'assets'])

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  if (RESERVED.has(slug)) return null
  let post = null; let error = false
  try { post = await fetchPostBySlug(slug) } catch { error = true }
  const image = post ? getFeaturedImage(post) : null
  const date = post ? new Date(post.date) : null
  return <div className="blog-page"><BlogHeader /><main className="blog-post-main"><Link href="/blog" className="blog-back"><ArrowLeft /> Back to Blog</Link>{error || !post ? <div className="blog-message error"><strong>Post not found</strong><Link href="/blog">Browse all posts</Link></div> : <article><header><h1>{post.title.rendered}</h1><div className="blog-meta">{date && <span><Calendar />{date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>}{post.readingMinutes ? <span><Clock />{post.readingMinutes} min read</span> : null}</div></header>{image && <img className="blog-post-image" src={image} alt={post.title.rendered} /> }<div className="blog-prose" dangerouslySetInnerHTML={{ __html: post.content.rendered }} /><div className="blog-post-cta"><Link href="/#analysis">Get your free review analysis <ArrowLeft /></Link></div></article>}</main><BlogFooter /></div>
}
