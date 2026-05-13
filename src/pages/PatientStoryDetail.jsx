import React, { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Quote, User } from 'lucide-react';
import { useLanguage } from '@/lib/LanguageContext';
import { getPatientStory } from '@/lib/med-api';
import Seo from '@/components/seo/Seo';
import ReviewSection from '@/components/reviews/ReviewSection';
import RatingSummary from '@/components/reviews/RatingSummary';
import LoadingState from '@/components/state/LoadingState';
import ErrorState from '@/components/state/ErrorState';
import { Badge } from '@/components/ui/badge';

export default function PatientStoryDetail() {
  const { id } = useParams();
  const { lang, isRTL, t } = useLanguage();
  const [summary, setSummary] = useState(null);

  const { data: story, isLoading, error, refetch } = useQuery({
    queryKey: ['patient-story', id],
    queryFn: () => getPatientStory(id),
    enabled: Boolean(id),
  });

  if (isLoading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
        <LoadingState title={lang === 'ar' ? 'جاري تحميل القصة' : 'Loading story'} />
      </div>
    );
  }

  if (error || !story) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
        <ErrorState
          title={lang === 'ar' ? 'تعذر تحميل القصة' : 'Unable to load story'}
          description={error?.message || t.common.noResults}
          actionLabel={lang === 'ar' ? 'إعادة المحاولة' : 'Try again'}
          onAction={refetch}
        />
      </div>
    );
  }

  const title = lang === 'ar' && story.title_ar ? story.title_ar : story.title;
  const condition = lang === 'ar' && story.condition_ar ? story.condition_ar : story.condition;
  const content = lang === 'ar' && story.story_ar ? story.story_ar : story.story;
  const resolvedSummary = {
    average_rating: summary?.average_rating ?? story.average_rating ?? 0,
    review_count: summary?.review_count ?? story.review_count ?? 0,
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <Seo
        title={story.meta_title}
        description={story.meta_description}
        canonicalUrl={story.canonical_url}
        keywords={story.meta_keywords}
        robots={story.robots}
        openGraph={story.open_graph}
        twitter={story.twitter_card}
        jsonLd={story.json_ld}
      />

      <Link to="/stories" className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
        <ArrowLeft className={`h-4 w-4 ${isRTL ? 'rotate-180' : ''}`} />
        {lang === 'ar' ? 'العودة إلى القصص' : 'Back to stories'}
      </Link>

      <article className="rounded-3xl border border-border bg-card p-8">
        <div className="mb-4 flex items-center justify-between gap-4">
          <Badge variant="secondary">{condition}</Badge>
          <Quote className="h-9 w-9 text-primary/20" />
        </div>
        <h1 className="font-serif text-3xl font-bold">{title}</h1>
        <div className="mt-5 flex flex-wrap items-center gap-4">
          <div className="inline-flex items-center gap-2 text-sm text-muted-foreground">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-muted">
              <User className="h-4 w-4" />
            </span>
            {story.is_anonymous ? t.common.anonymous : (story.display_name || t.common.anonymous)}
          </div>
          <RatingSummary averageRating={resolvedSummary.average_rating} reviewCount={resolvedSummary.review_count} />
        </div>
        <div className="mt-8 whitespace-pre-line leading-8 text-foreground/85">
          {content}
        </div>
      </article>

      <div data-tour="review-section">
        <ReviewSection
          reviewableType="patient_story"
          reviewableId={story.id}
          summary={resolvedSummary}
          onSummaryChange={setSummary}
        />
      </div>
    </div>
  );
}
