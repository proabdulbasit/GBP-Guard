'use client'

import { useState } from 'react'

export default function BlogFeaturedImage({
  src,
  alt,
  className,
  fallbackClassName = 'blog-card-fallback',
}: {
  src: string | null
  alt: string
  className?: string
  fallbackClassName?: string
}) {
  const [failed, setFailed] = useState(false)

  if (!src || failed) return <div className={fallbackClassName} aria-hidden="true" />

  return <img className={className} src={src} alt={alt} loading="lazy" onError={() => setFailed(true)} />
}
