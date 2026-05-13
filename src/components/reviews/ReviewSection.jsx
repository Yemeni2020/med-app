import React from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuth } from '@/lib/AuthContext';
import { useLanguage } from '@/lib/LanguageContext';
import { createReview, deleteReview, listReviews, updateReview } from '@/lib/med-api';
import ReviewForm from '@/components/reviews/ReviewForm';
import ReviewList from '@/components/reviews/ReviewList';
import RatingSummary from '@/components/reviews/RatingSummary';

export default function ReviewSection({
  reviewableType,
  reviewableId,
  summary = { average_rating: 0, review_count: 0 },
  onSummaryChange,
}) {
  const { isAuthenticated } = useAuth();
  const { lang } = useLanguage();
  const queryClient = useQueryClient();
  const queryKey = ['reviews', reviewableType, String(reviewableId)];

  const { data, isLoading, error, refetch } = useQuery({
    queryKey,
    queryFn: () => listReviews(reviewableType, reviewableId),
    enabled: Boolean(reviewableType && reviewableId),
  });

  const applySummary = (payload) => {
    onSummaryChange?.({
      average_rating: payload.average_rating || 0,
      review_count: payload.review_count || 0,
    });
  };

  const refreshReviews = async () => {
    const next = await queryClient.invalidateQueries({ queryKey });
    return next;
  };

  const submitMutation = useMutation({
    mutationFn: (form) => {
      const existing = data?.reviews?.find((review) => review.can_edit);

      if (existing) {
        return updateReview(existing.id, form);
      }

      return createReview({
        ...form,
        reviewable_type: reviewableType,
        reviewable_id: reviewableId,
      });
    },
    onSuccess: async () => {
      await refreshReviews();
      const refreshed = await listReviews(reviewableType, reviewableId);
      queryClient.setQueryData(queryKey, refreshed);
      applySummary(refreshed);
      toast.success(lang === 'ar' ? 'تم حفظ المراجعة.' : 'Review saved.');
    },
    onError: (mutationError) => {
      toast.error(mutationError.message || (lang === 'ar' ? 'تعذر حفظ المراجعة.' : 'Unable to save review.'));
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (reviewId) => deleteReview(reviewId),
    onSuccess: async () => {
      await refreshReviews();
      const refreshed = await listReviews(reviewableType, reviewableId);
      queryClient.setQueryData(queryKey, refreshed);
      applySummary(refreshed);
      toast.success(lang === 'ar' ? 'تم حذف المراجعة.' : 'Review deleted.');
    },
    onError: (mutationError) => {
      toast.error(mutationError.message || (lang === 'ar' ? 'تعذر حذف المراجعة.' : 'Unable to delete review.'));
    },
  });

  const reviews = data?.reviews || [];
  const ownReview = reviews.find((review) => review.can_edit) || null;
  const publicReviews = reviews.filter((review) => review.status === 'approved' || review.can_edit);
  const displaySummary = {
    average_rating: data?.average_rating ?? summary.average_rating ?? 0,
    review_count: data?.review_count ?? summary.review_count ?? 0,
  };

  return (
    <section className="mt-12 space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-2xl font-serif font-bold">
            {lang === 'ar' ? 'المراجعات والتقييمات' : 'Reviews and ratings'}
          </h2>
          <p className="text-sm text-muted-foreground">
            {lang === 'ar' ? 'آراء المستخدمين تساعد الآخرين على تقييم المحتوى.' : 'User feedback helps others evaluate the content.'}
          </p>
        </div>
        <RatingSummary
          averageRating={displaySummary.average_rating}
          reviewCount={displaySummary.review_count}
        />
      </div>

      {isAuthenticated ? (
        <ReviewForm
          initialReview={ownReview}
          isSubmitting={submitMutation.isPending || deleteMutation.isPending}
          onSubmit={(form) => submitMutation.mutate(form)}
          onDelete={() => ownReview && deleteMutation.mutate(ownReview.id)}
          canDelete={Boolean(ownReview)}
        />
      ) : (
        <div className="rounded-2xl border border-dashed border-border p-5 text-sm text-muted-foreground">
          <Link to="/login" className="font-medium text-primary hover:underline">
            {lang === 'ar' ? 'سجّل الدخول لكتابة مراجعة' : 'Login to write a review'}
          </Link>
        </div>
      )}

      <ReviewList
        reviews={publicReviews}
        isLoading={isLoading}
        error={error}
        onRetry={refetch}
      />
    </section>
  );
}
