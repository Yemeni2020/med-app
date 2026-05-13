import React, { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, BookOpen, Clock, Eye } from 'lucide-react';
import { useLanguage } from '@/lib/LanguageContext';
import { getDoctor } from '@/lib/med-api';
import Seo from '@/components/seo/Seo';
import ReviewSection from '@/components/reviews/ReviewSection';
import RatingSummary from '@/components/reviews/RatingSummary';
import LoadingState from '@/components/state/LoadingState';
import ErrorState from '@/components/state/ErrorState';
import { Badge } from '@/components/ui/badge';

export default function DoctorDetail() {
  const { id } = useParams();
  const { t, lang, isRTL } = useLanguage();
  const [summary, setSummary] = useState(null);

  const { data: doctor, isLoading, error, refetch } = useQuery({
    queryKey: ['doctor', id],
    queryFn: () => getDoctor(id),
    enabled: Boolean(id),
  });

  const articles = useMemo(() => doctor?.articles || [], [doctor]);

  if (isLoading) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
        <LoadingState title={lang === 'ar' ? 'جاري تحميل ملف الطبيب' : 'Loading doctor profile'} />
      </div>
    );
  }

  if (error || !doctor) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
        <ErrorState
          title={lang === 'ar' ? 'تعذر تحميل الطبيب' : 'Unable to load doctor'}
          description={error?.message || t.common.noResults}
          actionLabel={lang === 'ar' ? 'إعادة المحاولة' : 'Try again'}
          onAction={refetch}
        />
      </div>
    );
  }

  const resolvedSummary = {
    average_rating: summary?.average_rating ?? doctor.average_rating ?? 0,
    review_count: summary?.review_count ?? doctor.review_count ?? 0,
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <Seo
        title={doctor.meta_title}
        description={doctor.meta_description}
        canonicalUrl={doctor.canonical_url}
        keywords={doctor.meta_keywords}
        robots={doctor.robots}
        openGraph={doctor.open_graph}
        twitter={doctor.twitter_card}
        jsonLd={doctor.json_ld}
      />

      <Link to="/doctors" className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
        <ArrowLeft className={`h-4 w-4 ${isRTL ? 'rotate-180' : ''}`} />
        {lang === 'ar' ? 'العودة إلى الأطباء' : 'Back to doctors'}
      </Link>

      <div className="rounded-3xl border border-border bg-card p-8">
        <div className="flex flex-col gap-6 sm:flex-row">
          <div className="flex h-24 w-24 items-center justify-center rounded-full bg-primary/10 text-4xl font-bold text-primary">
            {doctor.author_avatar ? (
              <img src={doctor.author_avatar} alt={doctor.name} className="h-full w-full rounded-full object-cover" />
            ) : (
              doctor.name?.[0]
            )}
          </div>

          <div className="flex-1">
            <h1 className="font-serif text-3xl font-bold">{doctor.name}</h1>
            {doctor.title ? <p className="mt-1 text-muted-foreground">{doctor.title}</p> : null}
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <Badge className="rounded-full capitalize">{doctor.specialty?.replace('_', ' ')}</Badge>
              <span className="inline-flex items-center gap-1 text-sm text-muted-foreground">
                <BookOpen className="h-4 w-4" />
                {doctor.articles_count} {t.home.doctors.articles}
              </span>
              <RatingSummary
                averageRating={resolvedSummary.average_rating}
                reviewCount={resolvedSummary.review_count}
              />
            </div>
            {doctor.bio ? <p className="mt-5 leading-8 text-foreground/80">{doctor.bio}</p> : null}
          </div>
        </div>
      </div>

      <section className="mt-10">
        <h2 className="mb-5 font-serif text-2xl font-bold">
          {lang === 'ar' ? 'المقالات المنشورة' : 'Published articles'}
        </h2>
        <div className="space-y-4">
          {articles.map((article) => {
            const title = lang === 'ar' && article.title_ar ? article.title_ar : article.title;
            const excerpt = lang === 'ar' && article.excerpt_ar ? article.excerpt_ar : article.excerpt;

            return (
              <Link key={article.id} to={`/articles/${article.id}`} className="block rounded-2xl border border-border bg-card p-5 transition-all hover:border-primary/30 hover:shadow-md">
                <div className="flex gap-4">
                  {article.cover_image ? (
                    <img src={article.cover_image} alt={title} className="h-20 w-24 flex-shrink-0 rounded-xl object-cover" />
                  ) : null}
                  <div className="min-w-0 flex-1">
                    <div className="mb-2 flex flex-wrap items-center gap-2">
                      <Badge variant="secondary" className="rounded-full text-xs">
                        {t.categories[article.category]}
                      </Badge>
                      <RatingSummary averageRating={article.average_rating} reviewCount={article.review_count} />
                    </div>
                    <h3 className="line-clamp-2 text-base font-semibold">{title}</h3>
                    <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{excerpt}</p>
                    <div className="mt-3 flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="inline-flex items-center gap-1"><Clock className="h-3 w-3" /> {article.read_time_minutes || 5} {t.common.minRead}</span>
                      <span className="inline-flex items-center gap-1"><Eye className="h-3 w-3" /> {article.views_count || 0}</span>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      <div data-tour="review-section">
        <ReviewSection
          reviewableType="doctor"
          reviewableId={doctor.id}
          summary={resolvedSummary}
          onSummaryChange={setSummary}
        />
      </div>
    </div>
  );
}
