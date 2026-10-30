import type { Metadata } from 'next'
import { BlogFooter, BlogHeader } from '@/components/blog/BlogChrome'
import { indexFollowRobots } from '@/lib/site'
import BlogList from './BlogList'

export const metadata: Metadata = {
  title: 'GBP-Guard Blog | Reputation Defense Insights',
  description: 'Practical guidance for protecting your Google Business Profile reputation.',
  robots: indexFollowRobots,
  alternates: {
    canonical: '/blog',
  },
}

export default function BlogPage() {
  return (
    <div className="blog-page">
      <BlogHeader />
      <main className="blog-main">
        <BlogList />
      </main>
      <BlogFooter />
    </div>
  )
}
