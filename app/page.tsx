'use client'

import { useState } from 'react'
import {
  ArrowRight,
  Check,
  ChevronDown,
  CircleCheck,
  FileSearch,
  Menu,
  Scale,
  ShieldCheck,
  Sparkles,
  X,
} from 'lucide-react'
import BlogPreview from '@/components/blog/BlogPreview'

const steps = [
  {
    number: '01',
    icon: FileSearch,
    title: 'Free review analysis',
    description: 'Send us the review and your Google Business Profile. We identify policy violations and tell you exactly where you stand.',
  },
  {
    number: '02',
    icon: Scale,
    title: 'We build your case',
    description: 'Our specialists document the violation, prepare the evidence, and file a precise removal request with Google.',
  },
  {
    number: '03',
    icon: CircleCheck,
    title: 'Review removed',
    description: 'We manage the follow-up until the unfair review is gone — and keep you updated at every step.',
  },
]

const features = [
  { title: 'Policy-led, not guesswork', description: 'Every case is grounded in Google’s published content policies — not a generic appeal template.', icon: ShieldCheck },
  { title: 'Built for local business', description: 'From law firms to auto shops, we understand the stakes of a single unfair review.', icon: Sparkles },
  { title: 'Clear case visibility', description: 'Know what we found, what we filed, and what happens next with simple progress updates.', icon: FileSearch },
  { title: 'No success, no fee', description: 'You only pay when Google removes the review. Straightforward pricing, aligned incentives.', icon: Check },
]

const services = [
  { title: 'Review removal', description: 'Policy-led cases for fake, defamatory, spam, and off-topic Google reviews.', icon: ShieldCheck },
  { title: 'Profile recovery', description: 'Restore trust after a wave of suspicious reviews or a sudden rating drop.', icon: CircleCheck },
  { title: 'Multi-location defense', description: 'Centralized reputation protection for growing brands and franchise groups.', icon: Sparkles },
  { title: 'Review response strategy', description: 'Turn difficult feedback into a calm, credible response that protects customer trust.', icon: FileSearch },
  { title: 'Reputation monitoring', description: 'Stay ahead of new risks with practical guidance for every review that comes in.', icon: Scale },
]

  const testimonials = [
    { quote: 'GBP-Guard gave us a clear case strategy and handled the process end to end. The review was removed and our team could focus on serving clients.', name: 'Tom Maruzzo' },
    { quote: 'The updates made the process simple. We knew what was filed, why it mattered, and what would happen next.', name: 'Heno Avagian' },
    { quote: 'We finally had a professional path forward instead of trying to solve a policy issue on our own.', name: 'Michael Torres' },
  ]

const faqs = [
  ['What kinds of reviews can you remove?', 'We focus on reviews that violate Google’s policies — including spam, conflicts of interest, harassment, impersonation, off-topic content, and fake or manipulated reviews.'],
  ['How long does the process take?', 'Most reviews are resolved within 21 days. Complex cases can take longer, depending on Google’s response time and the evidence available.'],
  ['Do you guarantee removal?', 'We cannot guarantee Google’s final decision, but our 94% success rate reflects a careful, policy-first approach. You only pay when we succeed.'],
  ['What do you need from me?', 'Just the review URL, your business profile link, and a little context about what happened. Our free analysis starts there.'],
  ['Can you handle multiple locations?', 'Yes. Our enterprise plans support multi-location businesses with consolidated reporting and a dedicated case strategy.'],
  ['Is this the same as asking customers for reviews?', 'No. We never create, alter, or suppress legitimate feedback. We only challenge content that breaks Google’s policies.'],
]

export default function Page() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [openFaq, setOpenFaq] = useState<number | null>(0)

  return (
    <main className="site-shell">
      <nav className="nav-shell" aria-label="Main navigation">
        <div className="nav-inner">
          <a href="#top" className="brand" aria-label="GBP-Guard home"><span className="brand-mark" aria-hidden="true"><ShieldCheck /></span><span className="brand-word">GBP-Guard</span><span className="brand-badge" aria-hidden="true">REPUTATION<br />DEFENSE</span></a><a href="tel:+13239680000" className="nav-phone">(323) 968-0000</a>
          <div className={`nav-links ${menuOpen ? 'is-open' : ''}`}>
            <a href="#how-it-works" onClick={() => setMenuOpen(false)}>How it works</a>
            <a href="#services" onClick={() => setMenuOpen(false)}>Services</a>
            <a href="#pricing" onClick={() => setMenuOpen(false)}>Pricing</a>
            <a href="#blog" onClick={() => setMenuOpen(false)}>Blog</a>
            <a href="#testimonials" onClick={() => setMenuOpen(false)}>Testimonials</a>
            <a href="#faq" onClick={() => setMenuOpen(false)}>FAQ</a>
            <a href="#analysis" className="nav-cta" onClick={() => setMenuOpen(false)}>Free Review Analysis <ArrowRight /></a>
          </div>
          <button className="menu-button" aria-label={menuOpen ? 'Close menu' : 'Open menu'} onClick={() => setMenuOpen(!menuOpen)}>{menuOpen ? <X /> : <Menu />}</button>
        </div>
      </nav>

      <section className="hero-section" id="top">
        <div className="hero-glow" />
        <div className="container hero-grid">
          <div className="hero-copy">
            <div className="eyebrow"><span className="eyebrow-dot" /> Reputation protection for local business</div>
            <h1>An unfair Google review is costing you customers. <em>We get it removed.</em></h1>
            <p className="hero-lede">GBP-Guard finds the policy violations others miss, builds your case, and handles the removal process from start to finish.</p>
            <div className="hero-actions"><a href="#analysis" className="button button-accent">Get a free analysis <ArrowRight /></a><a href="#how-it-works" className="button button-ghost">See how it works <ArrowRight /></a></div>
            <p className="hero-note"><Check /> No success, no fee &nbsp;·&nbsp; Policy-led review removal</p>
          </div>
          <div className="hero-visual" aria-label="GBP-Guard review removal success dashboard illustration">
            <div className="visual-orbit orbit-one" /><div className="visual-orbit orbit-two" />
            <div className="dashboard-card">
              <div className="dashboard-top"><span className="mini-label">CASE OVERVIEW</span><span className="status-pill"><span /> Active</span></div>
              <div className="review-row"><div className="google-badge">G</div><div><strong>Review flagged</strong><span>Policy violation detected</span></div><span className="review-stars">★ ★ ★ ★ ★</span></div>
              <div className="progress-block"><div className="progress-heading"><span>Removal progress</span><strong>78%</strong></div><div className="progress-track"><span /></div><div className="progress-meta"><span>Case filed with Google</span><span>Step 2 of 3</span></div></div>
              <div className="visual-stats"><div><strong>94%</strong><span>success rate</span></div><div><strong>21 days</strong><span>avg. removal</span></div><div><strong>500+</strong><span>reviews removed</span></div></div>
              <div className="case-footer"><div className="avatar-stack"><span>JD</span><span>AS</span><span>MK</span></div><span>Last updated today</span><CircleCheck /></div>
            </div>
            <div className="floating-card"><CircleCheck /><div><strong>Review removed</strong><span>Google Business Profile</span></div></div>
          </div>
        </div>
      </section>

      <section className="stats-band"><div className="container stats-grid"><div><strong>500<span>+</span></strong><span>reviews removed</span></div><div><strong>94<span>%</span></strong><span>success rate</span></div><div><strong>21</strong><span>days average removal time</span></div><div><strong>200<span>+</span></strong><span>businesses protected</span></div></div></section>

      <section className="light-section process-section" id="how-it-works"><div className="container"><div className="section-heading"><div><div className="eyebrow dark-eyebrow">Simple process. Serious results.</div><h2 className="process-title">From unfair review<br /><em>to resolved.</em></h2></div><p>We do the hard work of turning a frustrating review into a clear, policy-backed case Google can act on.</p></div><div className="process-promo"><div className="process-promo-copy"><div className="feature-icon"><Sparkles /></div><h3>Make every customer touchpoint count.</h3><p>One clear workflow for finding, documenting, and resolving reputation risks before they cost you the next customer.</p><a href="#analysis" className="text-link">Start with a free analysis <ArrowRight /></a></div></div><div className="removal-demo" aria-label="Animated review removal workflow"><div className="removal-demo-copy"><div className="eyebrow dark-eyebrow">See the workflow in motion</div><h3>From flagged to gone — without the guesswork.</h3><p>Our specialists turn a questionable review into a documented policy case, then keep pressure on until the right outcome lands.</p></div><div className="removal-timeline"><div className="timeline-line" /><div className="timeline-step active"><span className="timeline-icon"><FileSearch /></span><div><strong>Review identified</strong><small>Policy violation found</small></div></div><div className="timeline-step active"><span className="timeline-icon"><Scale /></span><div><strong>Case submitted</strong><small>Evidence filed with Google</small></div></div><div className="timeline-step complete"><span className="timeline-icon"><CircleCheck /></span><div><strong>Review removed</strong><small>Profile protected</small></div></div></div></div><div className="steps-grid">{steps.map((step) => { const Icon = step.icon; return <article className="step-card" key={step.number}><div className="step-top"><span>{step.number}</span><Icon /></div><h3>{step.title}</h3><p>{step.description}</p><a href="#analysis">Learn more <ArrowRight /></a></article> })}</div></div></section>

      <section className="navy-section features-section"><div className="container"><div className="section-heading light-heading"><div><div className="eyebrow">Why GBP-Guard</div><h2>Protect the reputation<br />you <em>worked for.</em></h2></div><p>We combine policy expertise, careful documentation, and persistence to protect how customers see your business.</p></div><div className="features-grid">{features.map((feature) => { const Icon = feature.icon; return <article className="feature-card" key={feature.title}><div className="feature-icon"><Icon /></div><h3>{feature.title}</h3><p>{feature.description}</p></article> })}</div></div></section>

      <section className="services-section" id="services"><div className="container"><div className="section-heading"><div><div className="eyebrow dark-eyebrow">What we do</div><h2>Reputation support<br /><em>built around you.</em></h2></div><p>From one urgent review to a multi-location program, our specialists make reputation defense clear and actionable.</p></div><div className="services-grid"><article className="service-photo-card"><img src="/gbp-guard-business-owner.png" alt="Local business owner reviewing reputation insights" /><div className="service-photo-overlay"><span>Built for local business</span><strong>Protect trust at every touchpoint.</strong></div></article>{services.map((service) => { const Icon = service.icon; return <article className="service-card" key={service.title}><div className="service-icon"><Icon /></div><h3>{service.title}</h3><p>{service.description}</p><a href="#analysis" className="text-link">Learn more <ArrowRight /></a></article> })}</div></div></section>

      <BlogPreview />
      <section className="testimonials-section" id="testimonials"><div className="container"><div className="center-heading"><div className="eyebrow dark-eyebrow">Businesses we protect</div><h2>Proof in the <em>outcome.</em></h2><p>Real reputation work is measured by clarity, persistence, and the trust you earn back.</p></div><div className="testimonials-grid">{testimonials.map((testimonial) => <article className="testimonial-card" key={testimonial.name}><div className="testimonial-stars" aria-label="5 out of 5 stars">★★★★★</div><blockquote>“{testimonial.quote}”</blockquote><div className="testimonial-author"><strong>{testimonial.name}</strong></div></article>)}</div></div></section>

      <section className="light-section pricing-section" id="pricing"><div className="container"><div className="center-heading"><div className="eyebrow dark-eyebrow">Transparent pricing</div><h2 className="pricing-heading-title">Choose the coverage<br /><em>that fits your business.</em></h2><p>Start with one review or protect every location. You only pay when we win.</p></div><div className="pricing-showcase"><div className="pricing-showcase-copy"><div className="feature-icon"><ShieldCheck /></div><div className="eyebrow dark-eyebrow">Live case demonstration</div><h3>See how a review moves from flagged to removed.</h3><p>Watch the policy-led workflow in a quick visual loop: identify the violation, submit the evidence, and confirm the result.</p><img className="case-photo" src="/gbp-guard-case-review.png" alt="Specialist reviewing a Google Business Profile case" /></div><div className="pricing-video" role="img" aria-label="Animated demonstration of a Google review removal case"><div className="video-top"><span><span className="video-dot" /> GBP-GUARD CASE FLOW</span><span>00:21</span></div><div className="video-screen"><div className="video-review"><span className="google-badge">G</span><div><strong>Unfair review detected</strong><small>Policy conflict identified</small></div><span className="video-status">FLAGGED</span></div><div className="video-progress"><span /></div><div className="video-steps"><span className="done"><Check /> Analyze</span><span className="done"><Check /> File case</span><span className="active"><CircleCheck /> Removed</span></div></div><div className="video-caption"><span>Policy evidence verified</span><strong>Outcome confirmed</strong></div></div></div><div className="pricing-grid"><article className="price-card"><span className="price-kicker">SINGLE CASE</span><h3>$150</h3><p className="price-description">One unfair review, handled end-to-end.</p><ul><li><Check /> Free policy analysis</li><li><Check /> Case built and filed</li><li><Check /> Progress updates</li></ul><a href="#analysis" className="button button-outline">Start a case <ArrowRight /></a></article><article className="price-card featured-price"><div className="popular-tag">MOST POPULAR</div><span className="price-kicker">GROWTH PACK</span><h3>$1,000</h3><p className="price-description">Up to 10 reviews across your business.</p><ul><li><Check /> Everything in Single Case</li><li><Check /> Multi-review strategy</li><li><Check /> Priority case handling</li></ul><a href="#analysis" className="button button-accent">Protect your profile <ArrowRight /></a></article><article className="price-card"><span className="price-kicker">ENTERPRISE</span><h3>Custom</h3><p className="price-description">Ongoing protection for multi-location teams.</p><ul><li><Check /> Dedicated account support</li><li><Check /> Location-wide reporting</li><li><Check /> Custom review volume</li></ul><a href="mailto:support@gbp-guard.com" className="button button-outline">Talk to our team <ArrowRight /></a></article></div></div></section>

      <section className="faq-section" id="faq"><div className="container faq-layout"><div className="faq-intro"><div className="eyebrow">Questions, answered.</div><h2>Know exactly<br /><em>what to expect.</em></h2><p>Still have questions? Our team is here to help.</p><a href="mailto:support@gbp-guard.com">Contact support <ArrowRight /></a></div><div className="faq-list">{faqs.map(([question, answer], index) => <div className={`faq-item ${openFaq === index ? 'open' : ''}`} key={question}><button onClick={() => setOpenFaq(openFaq === index ? null : index)} aria-expanded={openFaq === index}><span>{question}</span><ChevronDown /></button><div className="faq-answer"><p>{answer}</p></div></div>)}</div></div></section>
      <section className="cta-band" id="analysis"><div className="container cta-inner"><div><div className="eyebrow">Your next customer is searching.</div><h2>Don&apos;t let one unfair review<br />write your <em>story.</em></h2></div><a href="mailto:support@gbp-guard.com?subject=Free%20Review%20Analysis" className="button button-accent">Get your free analysis <ArrowRight /></a></div></section>
      <div className="floating-actions" aria-label="Quick actions"><a href="mailto:support@gbp-guard.com" className="floating-action floating-contact"><span className="floating-action-icon"><ShieldCheck /></span><span>Contact</span></a></div><footer className="footer"><div className="container footer-inner"><a href="#top" className="brand"><span className="brand-mark"><ShieldCheck /></span><span>GBP-Guard</span></a><div className="footer-meta"><span>Review removal, done right.</span><a href="tel:+13239680000">(323) 968-0000</a><a href="mailto:support@gbp-guard.com">support@gbp-guard.com</a><span>© 2026 GBP-Guard</span></div></div></footer>
    </main>
  )
}
