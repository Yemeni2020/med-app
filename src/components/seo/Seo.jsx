import { useEffect } from 'react';

function upsertMeta(selector, attributes) {
  let element = document.head.querySelector(selector);
  if (!element) {
    element = document.createElement('meta');
    document.head.appendChild(element);
  }

  Object.entries(attributes).forEach(([key, value]) => {
    if (value) {
      element.setAttribute(key, value);
    }
  });
}

function upsertCanonical(href) {
  let link = document.head.querySelector('link[rel="canonical"]');
  if (!link) {
    link = document.createElement('link');
    link.setAttribute('rel', 'canonical');
    document.head.appendChild(link);
  }

  link.setAttribute('href', href);
}

export default function Seo({
  title,
  description,
  canonicalUrl,
  keywords = [],
  robots = 'index,follow',
  openGraph = {},
  twitter = {},
  jsonLd = null,
}) {
  useEffect(() => {
    const previousTitle = document.title;
    const existingJsonLd = document.getElementById('seo-json-ld');

    if (title) {
      document.title = title;
      upsertMeta('meta[name="title"]', { name: 'title', content: title });
      upsertMeta('meta[property="og:title"]', { property: 'og:title', content: openGraph.title || title });
      upsertMeta('meta[name="twitter:title"]', { name: 'twitter:title', content: openGraph.title || title });
    }

    if (description) {
      upsertMeta('meta[name="description"]', { name: 'description', content: description });
      upsertMeta('meta[property="og:description"]', { property: 'og:description', content: openGraph.description || description });
      upsertMeta('meta[name="twitter:description"]', { name: 'twitter:description', content: twitter.description || openGraph.description || description });
    }

    if (keywords.length > 0) {
      upsertMeta('meta[name="keywords"]', { name: 'keywords', content: keywords.join(', ') });
    }

    upsertMeta('meta[name="robots"]', { name: 'robots', content: robots });

    if (canonicalUrl) {
      upsertCanonical(canonicalUrl);
      upsertMeta('meta[property="og:url"]', { property: 'og:url', content: openGraph.url || canonicalUrl });
    }

    upsertMeta('meta[property="og:type"]', { property: 'og:type', content: openGraph.type || 'website' });
    if (openGraph.image) {
      upsertMeta('meta[property="og:image"]', { property: 'og:image', content: openGraph.image });
      upsertMeta('meta[property="og:image:alt"]', { property: 'og:image:alt', content: openGraph.image_alt || title });
      upsertMeta('meta[name="twitter:image"]', { name: 'twitter:image', content: openGraph.image });
    }
    upsertMeta('meta[name="twitter:title"]', { name: 'twitter:title', content: twitter.title || openGraph.title || title });
    upsertMeta('meta[name="twitter:card"]', { name: 'twitter:card', content: twitter.card || (openGraph.image ? 'summary_large_image' : 'summary') });

    if (jsonLd) {
      if (existingJsonLd) {
        existingJsonLd.remove();
      }

      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.id = 'seo-json-ld';
      script.text = JSON.stringify(jsonLd);
      document.head.appendChild(script);
    }

    return () => {
      if (previousTitle) {
        document.title = previousTitle;
      }

      const script = document.getElementById('seo-json-ld');
      if (script) {
        script.remove();
      }
    };
  }, [title, description, canonicalUrl, keywords, robots, openGraph, twitter, jsonLd]);

  return null;
}
