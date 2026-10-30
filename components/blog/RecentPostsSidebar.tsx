import Link from 'next/link'
import BlogFeaturedImage from '@/components/blog/BlogFeaturedImage'
import { getFeaturedImage, type BlogPost } from '@/lib/blogApi'

export default function RecentPostsSidebar({ posts }: { posts: BlogPost[] }) {
  if (posts.length === 0) return null

  return (
    <aside className="blog-sidebar" aria-label="Recent posts">
      <div className="blog-sidebar-card">
        <h2>Recent Posts</h2>
        <ul>
          {posts.map((post) => {
            const image = getFeaturedImage(post)
            return (
              <li key={post.id}>
                <Link href={`/${post.slug}`}>
                  <BlogFeaturedImage src={image} alt="" fallbackClassName="blog-sidebar-fallback" />
                  <span className="blog-sidebar-title">{post.title.rendered}</span>
                </Link>
              </li>
            )
          })}
        </ul>
      </div>
    </aside>
  )
}
