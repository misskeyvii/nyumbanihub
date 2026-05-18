import { useEffect } from 'react';

const BASE_URL = 'https://nyumbanilink.com';
const DEFAULT_IMAGE = 'https://i.postimg.cc/qM8Nz01k/Untitled-design.png';

interface SEOProps {
  title: string;
  description: string;
  path?: string;
  image?: string;
  type?: 'website' | 'article';
  structuredData?: object;
}

export default function SEO({ title, description, path = '', image = DEFAULT_IMAGE, type = 'website', structuredData }: SEOProps) {
  useEffect(() => {
    const fullTitle = `${title} | Nyumbani Hub`;
    const canonical = `${BASE_URL}${path}`;

    document.title = fullTitle;

    const setMeta = (attr: string, key: string, content: string) => {
      let el = document.querySelector(`meta[${attr}="${key}"]`) as HTMLMetaElement;
      if (!el) { el = document.createElement('meta'); el.setAttribute(attr, key); document.head.appendChild(el); }
      el.content = content;
    };

    const setLink = (rel: string, href: string) => {
      let el = document.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement;
      if (!el) { el = document.createElement('link'); el.rel = rel; document.head.appendChild(el); }
      el.href = href;
    };

    // Standard
    setMeta('name', 'description', description);
    setLink('canonical', canonical);

    // Open Graph
    setMeta('property', 'og:title', fullTitle);
    setMeta('property', 'og:description', description);
    setMeta('property', 'og:url', canonical);
    setMeta('property', 'og:image', image);
    setMeta('property', 'og:type', type);

    // Twitter
    setMeta('name', 'twitter:title', fullTitle);
    setMeta('name', 'twitter:description', description);
    setMeta('name', 'twitter:image', image);

    // Structured data
    if (structuredData) {
      const id = 'ld-json-dynamic';
      let script = document.getElementById(id) as HTMLScriptElement;
      if (!script) { script = document.createElement('script'); script.id = id; script.type = 'application/ld+json'; document.head.appendChild(script); }
      script.textContent = JSON.stringify(structuredData);
    }
  }, [title, description, path, image, type, structuredData]);

  return null;
}
