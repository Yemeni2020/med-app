import React, { useEffect, useState } from 'react';
import { useLanguage } from '@/lib/LanguageContext';
import RatingStars from '@/components/reviews/RatingStars';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

const EMPTY_FORM = { rating: 0, comment: '' };

export default function ReviewForm({
  initialReview = null,
  isSubmitting = false,
  onSubmit,
  onDelete,
  canDelete = false,
}) {
  const { lang } = useLanguage();
  const [form, setForm] = useState(EMPTY_FORM);

  useEffect(() => {
    if (initialReview) {
      setForm({
        rating: initialReview.rating || 0,
        comment: initialReview.comment || '',
      });
      return;
    }

    setForm(EMPTY_FORM);
  }, [initialReview]);

  const submitLabel = initialReview
    ? (lang === 'ar' ? 'تحديث المراجعة' : 'Update review')
    : (lang === 'ar' ? 'إرسال المراجعة' : 'Submit review');

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit?.(form);
      }}
      className="rounded-2xl border border-border bg-card p-5"
    >
      <div className="flex flex-col gap-4">
        <div>
          <p className="mb-2 text-sm font-medium text-foreground">
            {lang === 'ar' ? 'التقييم' : 'Rating'}
          </p>
          <RatingStars
            rating={form.rating}
            interactive
            size="lg"
            onChange={(rating) => setForm((current) => ({ ...current, rating }))}
          />
        </div>

        <div>
          <p className="mb-2 text-sm font-medium text-foreground">
            {lang === 'ar' ? 'تعليقك' : 'Your comment'}
          </p>
          <Textarea
            value={form.comment}
            onChange={(event) => setForm((current) => ({ ...current, comment: event.target.value }))}
            placeholder={lang === 'ar' ? 'أضف ملاحظاتك عن هذا المحتوى' : 'Add your feedback about this content'}
            className="min-h-28 rounded-xl"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Button type="submit" disabled={isSubmitting || form.rating < 1} className="rounded-full">
            {submitLabel}
          </Button>
          {canDelete ? (
            <Button type="button" variant="outline" disabled={isSubmitting} className="rounded-full" onClick={onDelete}>
              {lang === 'ar' ? 'حذف المراجعة' : 'Delete review'}
            </Button>
          ) : null}
          {initialReview?.status === 'pending' ? (
            <span className="text-xs font-medium text-amber-600">
              {lang === 'ar' ? 'بانتظار المراجعة من الإدارة' : 'Pending admin approval'}
            </span>
          ) : null}
        </div>
      </div>
    </form>
  );
}
