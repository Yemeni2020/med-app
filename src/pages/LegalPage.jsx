import React from 'react';
import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { FileText, ShieldCheck } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { getMedSetting } from '@/lib/med-api';
import { useLanguage } from '@/lib/LanguageContext';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

const PAGE_MAP = {
  '/policy': {
    key: 'agreement_policy',
    fallbackKey: 'agreementPolicy',
    icon: FileText,
  },
  '/privacy': {
    key: 'privacy_policy',
    fallbackKey: 'privacyPolicy',
    icon: ShieldCheck,
  },
};

function resolveLocalized(value, lang, fallback = '') {
  if (!value || typeof value !== 'object') {
    return value ?? fallback;
  }

  return value[lang] ?? value.en ?? value.ar ?? fallback;
}

export default function LegalPage() {
  const { pathname } = useLocation();
  const { t, lang, isRTL } = useLanguage();
  const config = PAGE_MAP[pathname] ?? PAGE_MAP['/policy'];
  const Icon = config.icon;

  const { data, isLoading } = useQuery({
    queryKey: ['legal-page', config.key],
    queryFn: () => getMedSetting(config.key),
  });

  const page = useMemo(() => {
    const value = data?.value || {};
    const fallback = t.legal[config.fallbackKey];

    return {
      title: resolveLocalized(value.title, lang, fallback.title),
      description: resolveLocalized(value.description, lang, fallback.description),
      updatedAt: value.updated_at || null,
      sections: Array.isArray(value.sections) ? value.sections.map((section) => ({
        heading: resolveLocalized(section.heading, lang, ''),
        body: resolveLocalized(section.body, lang, ''),
      })) : [],
    };
  }, [config.fallbackKey, data?.value, lang, t.legal]);

  if (isLoading) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
        <div className="space-y-5">
          <Skeleton className="h-8 w-40 rounded-full" />
          <Skeleton className="h-14 w-96 max-w-full rounded-2xl" />
          <Skeleton className="h-5 w-[34rem] max-w-full rounded-xl" />
          <Skeleton className="h-52 w-full rounded-[2rem]" />
        </div>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden">
      <div className="absolute inset-x-0 top-0 h-72 bg-[radial-gradient(circle_at_top,_rgba(14,165,233,0.18),_transparent_55%),linear-gradient(180deg,rgba(45,212,191,0.16),transparent)]" />
      <div className="relative mx-auto max-w-5xl px-4 py-10 sm:px-6">
        <section className="mb-8 rounded-[2rem] border border-border/60 bg-card/90 p-8 shadow-[0_24px_80px_-40px_rgba(15,23,42,0.35)] backdrop-blur">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-2 text-sm font-semibold text-primary">
            <Icon className="h-4 w-4" />
            {t.legal.label}
          </div>
          <h1 className="max-w-3xl text-4xl font-serif font-black tracking-tight text-foreground sm:text-5xl">
            {page.title}
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-muted-foreground sm:text-base">
            {page.description}
          </p>
          {page.updatedAt ? (
            <div className="mt-6 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              {t.legal.lastUpdated}: {page.updatedAt}
            </div>
          ) : null}
        </section>

        <div className="space-y-5">
          {page.sections.length > 0 ? page.sections.map((section, index) => (
            <Card key={`${section.heading}-${index}`} className="overflow-hidden rounded-[1.75rem] border-border/60 bg-card/95 shadow-sm">
              <CardContent className="p-0">
                <div className="h-1.5 w-full bg-gradient-to-r from-primary via-secondary to-sky-300" />
                <div className="p-6 sm:p-8">
                  {section.heading ? (
                    <h2 className="text-xl font-bold text-foreground sm:text-2xl">{section.heading}</h2>
                  ) : null}
                  {section.body ? (
                    <p className={`mt-4 whitespace-pre-line text-sm leading-8 text-muted-foreground sm:text-base ${isRTL ? 'text-right' : 'text-left'}`}>
                      {section.body}
                    </p>
                  ) : null}
                </div>
              </CardContent>
            </Card>
          )) : (
            <Card className="rounded-[1.75rem] border-border/60 bg-card/95 shadow-sm">
              <CardContent className="p-8 text-sm text-muted-foreground">
                {t.legal.noContent}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
