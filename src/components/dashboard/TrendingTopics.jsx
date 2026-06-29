import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, TrendingUp } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/lib/LanguageContext';
import { cn } from '@/lib/utils';

export default function TrendingTopics({ savedItems }) {
  const { t, lang } = useLanguage();
  const isArabic = lang === 'ar';

  const categoryCounts = savedItems.reduce((acc, item) => {
    if (item.category) acc[item.category] = (acc[item.category] || 0) + 1;
    return acc;
  }, {});

  const sorted = Object.entries(categoryCounts).sort((a, b) => b[1] - a[1]).slice(0, 5);

  const defaultTopics = [
    { category: 'cardiology', count: 0 },
    { category: 'neurology', count: 0 },
    { category: 'oncology', count: 0 },
  ];

  const topics = sorted.length > 0
    ? sorted.map(([category, count]) => ({ category, count }))
    : defaultTopics;

  return (
    <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_18px_55px_-38px_rgba(15,23,42,0.5)] ring-1 ring-white/70">
      <div className={cn('mb-5 flex items-start gap-3', isArabic && 'flex-row-reverse text-right')}>
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-sky-50 text-primary ring-1 ring-primary/10">
          <TrendingUp className="h-5 w-5" />
        </div>
        <div className="min-w-0 space-y-1">
          <h2 className="text-lg font-bold text-slate-950">{t.trendingTopics.title}</h2>
          <p className="text-sm leading-6 text-slate-500">
            {sorted.length === 0
              ? t.trendingTopics.empty
              : (isArabic ? 'ترتيب مبني على ما قمت بحفظه وقراءته مؤخرًا.' : 'Ranked from what you have been saving and reading recently.')}
          </p>
        </div>
      </div>
      <div className="space-y-3">
        {topics.map(({ category, count }, i) => (
          <Link key={category} to={`/articles?category=${category}`} className="block rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30">
            <div
              className={cn(
                'group flex min-h-[64px] items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:bg-sky-50/40 hover:shadow-md',
                isArabic && 'text-right'
              )}
            >
              {isArabic && (
                <div className="flex shrink-0 items-center gap-2">
                  <ChevronLeft className="h-4 w-4 text-slate-400" />
                  {count > 0 && (
                    <Badge variant="secondary" className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600 hover:bg-slate-100">
                      {count} {t.trendingTopics.savedSuffix}
                    </Badge>
                  )}
                </div>
              )}
              <div className={cn('flex min-w-0 items-center gap-3', isArabic && 'flex-row-reverse')}>
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-slate-100 text-sm font-bold text-slate-500 transition-colors group-hover:bg-primary/10 group-hover:text-primary">
                  #{i + 1}
                </div>
                <div className="min-w-0 space-y-1">
                  <p className="truncate text-sm font-semibold text-slate-950 transition-colors group-hover:text-primary">
                    {t.categories[category] || category}
                  </p>
                  <p className="text-xs text-slate-500">
                    {isArabic ? 'موضوع موصى به' : 'Suggested topic'}
                  </p>
                </div>
              </div>
              {!isArabic && (
                <div className="flex shrink-0 items-center gap-2">
                  {count > 0 && (
                    <Badge variant="secondary" className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600 hover:bg-slate-100">
                      {count} {t.trendingTopics.savedSuffix}
                    </Badge>
                  )}
                  <ChevronRight className="h-4 w-4 text-slate-400" />
                </div>
              )}
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
