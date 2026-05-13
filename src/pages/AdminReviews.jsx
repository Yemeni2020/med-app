import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/lib/AuthContext';
import { useLanguage } from '@/lib/LanguageContext';
import { deleteReview, listReviewModerationQueue, moderateReview } from '@/lib/med-api';
import PageSeo from '@/components/seo/PageSeo';
import ReviewList from '@/components/reviews/ReviewList';
import { Button } from '@/components/ui/button';
import ErrorState from '@/components/state/ErrorState';

const STATUSES = ['pending', 'approved', 'rejected'];

export default function AdminReviews() {
  const { lang, isRTL } = useLanguage();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [status, setStatus] = useState('pending');
  const queryKey = ['review-moderation', status];

  if (!['admin', 'manager'].includes(user?.role)) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        <ErrorState
          title={lang === 'ar' ? 'غير مصرح' : 'Unauthorized'}
          description={lang === 'ar' ? 'هذه الصفحة متاحة للإدارة فقط.' : 'This page is available to admins and managers only.'}
        />
      </div>
    );
  }

  const { data: reviews = [], isLoading, error, refetch } = useQuery({
    queryKey,
    queryFn: () => listReviewModerationQueue(status),
  });

  const refresh = async () => {
    await queryClient.invalidateQueries({ queryKey });
  };

  const moderateMutation = useMutation({
    mutationFn: ({ reviewId, nextStatus }) => moderateReview(reviewId, { status: nextStatus }),
    onSuccess: async () => {
      await refresh();
      toast.success(lang === 'ar' ? 'تم تحديث حالة المراجعة.' : 'Review status updated.');
    },
    onError: (mutationError) => {
      toast.error(mutationError.message || (lang === 'ar' ? 'تعذر تحديث المراجعة.' : 'Unable to update review.'));
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteReview,
    onSuccess: async () => {
      await refresh();
      toast.success(lang === 'ar' ? 'تم حذف المراجعة.' : 'Review deleted.');
    },
    onError: (mutationError) => {
      toast.error(mutationError.message || (lang === 'ar' ? 'تعذر حذف المراجعة.' : 'Unable to delete review.'));
    },
  });

  const labels = {
    pending: lang === 'ar' ? 'قيد المراجعة' : 'Pending',
    approved: lang === 'ar' ? 'المعتمدة' : 'Approved',
    rejected: lang === 'ar' ? 'المرفوضة' : 'Rejected',
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <PageSeo page="admin-reviews" fallback={{ meta_title: 'Review moderation', meta_description: 'Moderate user reviews.', canonical_url: `${window.location.origin}/admin/reviews`, robots: 'noindex,nofollow' }} />

      <Link to="/dashboard" className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
        <ArrowLeft className={`h-4 w-4 ${isRTL ? 'rotate-180' : ''}`} />
        {lang === 'ar' ? 'العودة' : 'Back'}
      </Link>

      <div className="mb-6">
        <h1 className="font-serif text-3xl font-bold">{lang === 'ar' ? 'مراجعة التقييمات' : 'Review moderation'}</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {lang === 'ar' ? 'اعتماد أو رفض أو حذف تقييمات المستخدمين.' : 'Approve, reject, or delete user reviews.'}
        </p>
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        {STATUSES.map((value) => (
          <Button
            key={value}
            variant={status === value ? 'default' : 'outline'}
            className="rounded-full"
            onClick={() => setStatus(value)}
          >
            {labels[value]}
          </Button>
        ))}
      </div>

      <ReviewList
        reviews={reviews}
        isLoading={isLoading}
        error={error}
        onRetry={refetch}
        showModeration
        renderActions={(review) => (
          <>
            {review.status !== 'approved' ? (
              <Button
                size="sm"
                className="rounded-full"
                disabled={moderateMutation.isPending}
                onClick={() => moderateMutation.mutate({ reviewId: review.id, nextStatus: 'approved' })}
              >
                {lang === 'ar' ? 'اعتماد' : 'Approve'}
              </Button>
            ) : null}
            {review.status !== 'rejected' ? (
              <Button
                size="sm"
                variant="outline"
                className="rounded-full"
                disabled={moderateMutation.isPending}
                onClick={() => moderateMutation.mutate({ reviewId: review.id, nextStatus: 'rejected' })}
              >
                {lang === 'ar' ? 'رفض' : 'Reject'}
              </Button>
            ) : null}
            <Button
              size="sm"
              variant="destructive"
              className="rounded-full"
              disabled={deleteMutation.isPending}
              onClick={() => deleteMutation.mutate(review.id)}
            >
              {lang === 'ar' ? 'حذف' : 'Delete'}
            </Button>
          </>
        )}
      />
    </div>
  );
}
