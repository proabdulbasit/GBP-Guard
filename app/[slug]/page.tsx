import Link from 'next/link'
import type { Metadata } from 'next'
import { ArrowLeft, Calendar, Clock } from 'lucide-react'
import { BlogFooter, BlogHeader } from '@/components/blog/BlogChrome'
import BlogFeaturedImage from '@/components/blog/BlogFeaturedImage'
import RecentPostsSidebar from '@/components/blog/RecentPostsSidebar'
import { fetchPostBySlug, fetchPosts, getFeaturedImage, type BlogPost } from '@/lib/blogApi'
import { indexFollowRobots } from '@/lib/site'

export const dynamic = 'force-dynamic'
const RESERVED = new Set(['blog', 'api', 'assets'])
const SIDEBAR_COUNT = 6

async function loadRecentPosts(currentSlug: string): Promise<BlogPost[]> {
  try {
    const data = await fetchPosts(1, SIDEBAR_COUNT + 1)
    return data.posts.filter((post) => post.slug !== currentSlug).slice(0, SIDEBAR_COUNT)
  } catch {
    return []
  }
}

function stripHtml(value = '') {
  return value.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  if (RESERVED.has(slug)) {
    return { robots: { index: false, follow: false } }
  }

  try {
    const post = await fetchPostBySlug(slug)
    const title = post.rank_math_title || post.title.rendered
    const description =
      post.rank_math_description ||
      stripHtml(post.excerpt.rendered) ||
      'Practical guidance for protecting your Google Business Profile reputation.'
    const image = getFeaturedImage(post)

    return {
      title,
      description,
      robots: indexFollowRobots,
      alternates: {
        canonical: `/${post.slug}`,
      },
      openGraph: {
        title,
        description,
        url: `/${post.slug}`,
        type: 'article',
        ...(image ? { images: [{ url: image }] } : {}),
      },
    }
  } catch {
    return {
      title: 'Post not found | GBP-Guard',
      robots: { index: false, follow: false },
    }
  }
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  if (RESERVED.has(slug)) return null

  let post: BlogPost | null = null
  let error = false
  try {
    post = await fetchPostBySlug(slug)
  } catch {
    error = true
  }

  const recentPosts = post ? await loadRecentPosts(slug) : []
  const image = post ? getFeaturedImage(post) : null
  const date = post ? new Date(post.date) : null

  return (
    <div className="blog-page">
      <BlogHeader />
      <main className="blog-post-main">
        <Link href="/blog" className="blog-back">
          <ArrowLeft /> Back to Blog
        </Link>
        {error || !post ? (
          <div className="blog-message error">
            <strong>Post not found</strong>
            <Link href="/blog">Browse all posts</Link>
          </div>
        ) : (
          <div className={recentPosts.length ? 'blog-post-layout' : undefined}>
            <article>
              <header>
                <h1>{post.title.rendered}</h1>
                <div className="blog-meta">
                  {date && (
                    <span>
                      <Calendar />
                      {date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                    </span>
                  )}
                  {post.readingMinutes ? (
                    <span>
                      <Clock />
                      {post.readingMinutes} min read
                    </span>
                  ) : null}
                </div>
              </header>
              {image ? (
                <BlogFeaturedImage
                  src={image}
                  alt={post.title.rendered}
                  className="blog-post-image"
                  fallbackClassName="blog-post-image blog-card-fallback"
                />
              ) : null}
              <div className="blog-prose" dangerouslySetInnerHTML={{ __html: post.content.rendered }} />
              <div className="blog-post-cta">
                <Link href="/#analysis">
                  Get your free review analysis <ArrowLeft />
                </Link>
              </div>
            </article>
            <RecentPostsSidebar posts={recentPosts} />
          </div>
        )}
      </main>
      <BlogFooter />
    </div>
  )
}
