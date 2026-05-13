import React from 'react';
import { useLanguage } from '@/lib/LanguageContext';
import RatingStars from '@/components/reviews/RatingStars';
import { Badge } from '@/components/ui/badge';

export default function ReviewCard({ review, showModeration = false, actions = null }) {
  const { lang, isRTL } = useLanguage();
  const statusMap = {
    approved: lang === 'ar' ? 'معتمد' : 'Approved',
    pending: lang === 'ar' ? 'بانتظار المراجعة' : 'Pending',
    rejected: lang === 'ar' ? 'مرفوض' : 'Rejected',
  };

  return (
    <article className="rounded-2xl border border-border bg-card p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="font-semibold text-foreground">{review.user?.name || 'User'}</p>
          <p className="mt-1 text-xs text-muted-foreground">
            {review.created_date ? new Date(review.created_date).toLocaleDateString(lang === 'ar' ? 'ar' : 'en') : ''}
          </p>
          {showModeration && review.reviewable ? (
            <p className="mt-1 text-xs text-muted-foreground">
              {review.reviewable.type} #{review.reviewable.id}
            </p>
          ) : null}
        </div>
        <div className={`flex flex-col gap-2 ${isRTL ? 'items-start' : 'items-end'}`}>
          <RatingStars rating={review.rating} size="sm" />
          <Badge variant={review.status === 'approved' ? 'default' : review.status === 'rejected' ? 'destructive' : 'secondary'}>
            {statusMap[review.status] || review.status}
          </Badge>
        </div>
      </div>

      {review.comment ? (
        <p className="mt-4 text-sm leading-7 text-foreground/80">{review.comment}</p>
      ) : null}

      {showModeration && review.moderator?.name ? (
        <p className="mt-3 text-xs text-muted-foreground">
          {lang === 'ar' ? 'آخر مراجعة بواسطة:' : 'Last moderated by:'} {review.moderator.name}
        </p>
      ) : null}

      {actions ? <div className="mt-4 flex flex-wrap gap-2">{actions}</div> : null}
    </article>
  );
}
