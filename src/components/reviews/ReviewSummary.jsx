import React from 'react';
import { useLanguage } from '@/lib/LanguageContext';
import RatingStars from '@/components/reviews/RatingStars';

export default function ReviewSummary({ averageRating = 0, reviewCount = 0 }) {
  const { lang } = useLanguage();

  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-2">
        <RatingStars rating={Math.round(averageRating)} size="sm" />
        <span className="text-sm font-semibold text-foreground">
          {averageRating ? averageRating.toFixed(1) : '0.0'}
        </span>
      </div>
      <span className="text-sm text-muted-foreground">
        {lang === 'ar'
          ? `${reviewCount} ${reviewCount === 1 ? 'مراجعة' : 'مراجعات'}`
          : `${reviewCount} review${reviewCount === 1 ? '' : 's'}`}
      </span>
    </div>
  );
}
