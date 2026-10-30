import Link from 'next/link'
import { ArrowRight, Calendar, Clock } from 'lucide-react'
import BlogFeaturedImage from '@/components/blog/BlogFeaturedImage'
import { getFeaturedImage, type BlogPost } from '@/lib/blogApi'

export default function BlogPostCard({ post }: { post: BlogPost }) {
  const image = getFeaturedImage(post)
  const date = new Date(post.date)
  return (
    <Link href={`/${post.slug}`} className="blog-card group">
      <div className="blog-card-image">
        <BlogFeaturedImage src={image} alt={post.title.rendered} />
      </div>
      <div className="blog-card-body">
        <div className="blog-meta">
          <span>
            <Calendar />
            {date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </span>
          {post.readingMinutes ? (
            <span>
              <Clock />
              {post.readingMinutes} min
            </span>
          ) : null}
        </div>
        <h2>{post.title.rendered}</h2>
        <p dangerouslySetInnerHTML={{ __html: post.excerpt.rendered }} />
        <span className="blog-read-more">
          Read more <ArrowRight />
        </span>
      </div>
    </Link>
  )
}
