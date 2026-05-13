import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { getSeoPage } from '@/lib/med-api';
import Seo from '@/components/seo/Seo';

export default function PageSeo({ page, params = {}, fallback = {} }) {
  const { data } = useQuery({
    queryKey: ['page-seo', page, params],
    queryFn: () => getSeoPage(page, params),
    enabled: Boolean(page),
    staleTime: 300000,
  });

  const payload = data || fallback;

  return (
    <Seo
      title={payload.meta_title}
      description={payload.meta_description}
      canonicalUrl={payload.canonical_url}
      keywords={payload.meta_keywords || []}
      robots={payload.robots}
      openGraph={payload.open_graph}
      twitter={payload.twitter_card}
      jsonLd={payload.json_ld}
    />
  );
}
