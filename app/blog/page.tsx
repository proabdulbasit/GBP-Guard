import { BlogFooter, BlogHeader } from '@/components/blog/BlogChrome'
import BlogList from './BlogList'

export const metadata = { title: 'GBP-Guard Blog | Reputation Defense Insights', description: 'Practical guidance for protecting your Google Business Profile reputation.' }

export default function BlogPage() { return <div className="blog-page"><BlogHeader /><main className="blog-main"><BlogList /></main><BlogFooter /></div> }
