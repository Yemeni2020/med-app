import React from 'react';
import { useLanguage } from '@/lib/LanguageContext';
import ReviewCard from '@/components/reviews/ReviewCard';
import EmptyState from '@/components/state/EmptyState';
import ErrorState from '@/components/state/ErrorState';
import LoadingState from '@/components/state/LoadingState';

export default function ReviewList({
  reviews = [],
  isLoading = false,
  error = null,
  onRetry,
  showModeration = false,
  renderActions,
}) {
  const { lang } = useLanguage();

  if (isLoading) {
    return <LoadingState title={lang === 'ar' ? 'جاري تحميل المراجعات' : 'Loading reviews'} />;
  }

  if (error) {
    return (
        <ErrorState
          title={lang === 'ar' ? 'تعذر تحميل المراجعات' : 'Unable to load reviews'}
          description={error.message}
          actionLabel={lang === 'ar' ? 'إعادة المحاولة' : 'Try again'}
          onAction={onRetry}
        />
      );
  }

  if (reviews.length === 0) {
    return (
        <EmptyState
          title={lang === 'ar' ? 'لا توجد مراجعات بعد' : 'No reviews yet'}
          description={lang === 'ar' ? 'كن أول من يضيف تقييمًا وملاحظة.' : 'Be the first to leave a rating and comment.'}
        />
      );
  }

  return (
    <div className="space-y-4">
      {reviews.map((review) => (
        <ReviewCard
          key={review.id}
          review={review}
          showModeration={showModeration}
          actions={renderActions ? renderActions(review) : null}
        />
      ))}
    </div>
  );
}
