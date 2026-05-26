import { useState } from 'react';

interface LazyImageProps {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  quality?: number;
}

// Transforms Supabase Storage URLs to use built-in image resizing
function optimizeUrl(src: string, width: number, quality: number): string {
  if (!src) return src;
  // Supabase storage transform API
  if (src.includes('/storage/v1/object/public/')) {
    const url = new URL(src);
    url.searchParams.set('width', String(width));
    url.searchParams.set('quality', String(quality));
    url.searchParams.set('resize', 'cover');
    return url.toString();
  }
  return src;
}

export default function LazyImage({ src, alt, className = '', width = 600, quality = 75 }: LazyImageProps) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  const optimized = optimizeUrl(src, width, quality);

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {/* Blur placeholder shown until image loads */}
      {!loaded && !error && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse" />
      )}
      <img
        src={error ? src : optimized}
        alt={alt}
        loading="lazy"
        decoding="async"
        onLoad={() => setLoaded(true)}
        onError={() => { setError(true); setLoaded(true); }}
        className={`w-full h-full object-cover object-top transition-opacity duration-300 ${loaded ? 'opacity-100' : 'opacity-0'}`}
      />
    </div>
  );
}
