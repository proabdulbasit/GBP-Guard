import Link from 'next/link'
import { ArrowRight, ShieldCheck } from 'lucide-react'

export function BlogHeader() {
  return <header className="blog-header"><div className="blog-header-inner"><Link href="/" className="brand"><span className="brand-mark"><ShieldCheck /></span><span className="blog-brand-copy"><strong>GBP-Guard</strong><small>Review Removal Experts</small></span></Link><nav><Link href="/#how-it-works">How It Works</Link><Link href="/#services">Services</Link><Link href="/#pricing">Pricing</Link><Link href="/blog" className="active">Blog</Link><Link href="/#testimonials">Testimonials</Link><Link href="/#faq">FAQ</Link><Link href="/#analysis" className="blog-header-cta">Free Review Analysis <ArrowRight /></Link></nav></div></header>
}

export function BlogFooter() {
  return <footer className="blog-footer"><div><Link href="/" className="brand"><span className="brand-mark"><ShieldCheck /></span><span>GBP-Guard</span></Link><p>Review removal, done right.</p></div><div><a href="mailto:support@gbp-guard.com">support@gbp-guard.com</a><span>© 2026 GBP-Guard</span></div></footer>
}
