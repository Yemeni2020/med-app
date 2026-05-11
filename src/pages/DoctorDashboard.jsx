import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { FileText, Send, ShieldCheck, Stethoscope, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/lib/AuthContext';
import { useLanguage } from '@/lib/LanguageContext';
import { createDoctorArticle, getDoctorRequest, listDoctorArticles, listDoctorCategories, submitDoctorRequest } from '@/lib/med-api';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';

const emptyRequest = {
  specialty: '',
  license_number: '',
  organization: '',
  years_of_experience: '',
  document_url: '',
  message: '',
};

const emptyArticle = {
  titleEn: '',
  titleAr: '',
  subtitleEn: '',
  excerptEn: '',
  contentEn: '',
  contentAr: '',
  categoryId: '',
  heroImageUrl: '',
};

export default function DoctorDashboard() {
  const { user, refreshUser } = useAuth();
  const { t, lang } = useLanguage();
  const copy = t.doctorDashboard;
  const queryClient = useQueryClient();
  const [requestForm, setRequestForm] = useState(emptyRequest);
  const [articleForm, setArticleForm] = useState(emptyArticle);

  const { data: requestState, isLoading: isLoadingRequest } = useQuery({
    queryKey: ['doctor-request'],
    queryFn: getDoctorRequest,
  });

  const latestRequest = requestState?.request;
  const isApprovedDoctor = Boolean(
    user?.doctorProfile?.verified
      || requestState?.doctor_profile?.verified
      || latestRequest?.status === 'approved'
  );

  const { data: categories = [] } = useQuery({
    queryKey: ['doctor-categories'],
    queryFn: listDoctorCategories,
    enabled: isApprovedDoctor,
  });

  const { data: articlesPayload, isLoading: isLoadingArticles } = useQuery({
    queryKey: ['doctor-articles'],
    queryFn: listDoctorArticles,
    enabled: isApprovedDoctor,
  });

  const requestMutation = useMutation({
    mutationFn: submitDoctorRequest,
    onSuccess: async () => {
      toast.success(copy.requestSent);
      setRequestForm(emptyRequest);
      await queryClient.invalidateQueries({ queryKey: ['doctor-request'] });
    },
    onError: (error) => {
      toast.error(error?.payload ? Object.values(error.payload.errors || {}).flat()[0] : error.message);
    },
  });

  const articleMutation = useMutation({
    mutationFn: createDoctorArticle,
    onSuccess: async () => {
      toast.success(copy.articleSent);
      setArticleForm(emptyArticle);
      await queryClient.invalidateQueries({ queryKey: ['doctor-articles'] });
      await refreshUser();
    },
    onError: (error) => {
      toast.error(error?.payload ? Object.values(error.payload.errors || {}).flat()[0] : error.message);
    },
  });

  const articles = articlesPayload?.data || [];

  const updateRequest = (key, value) => setRequestForm((current) => ({ ...current, [key]: value }));
  const updateArticle = (key, value) => setArticleForm((current) => ({ ...current, [key]: value }));

  const submitRequest = (event) => {
    event.preventDefault();
    requestMutation.mutate(requestForm);
  };

  const submitArticle = (event) => {
    event.preventDefault();
    articleMutation.mutate({
      title: { en: articleForm.titleEn, ar: articleForm.titleAr || null },
      subtitle: { en: articleForm.subtitleEn || null, ar: null },
      excerpt: { en: articleForm.excerptEn || null, ar: null },
      content: { en: articleForm.contentEn, ar: articleForm.contentAr || null },
      category_id: articleForm.categoryId,
      hero_image_url: articleForm.heroImageUrl || null,
    });
  };

  if (isLoadingRequest) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-10">
        <Skeleton className="h-36 rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4 border-b border-border pb-6">
        <div>
          <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-primary">{copy.eyebrow}</p>
          <h1 className="text-3xl font-bold tracking-tight">{copy.title}</h1>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            {copy.subtitle}
          </p>
        </div>
        <StatusBadge request={latestRequest} isApprovedDoctor={isApprovedDoctor} labels={copy.status} />
      </div>

      {isApprovedDoctor ? (
        <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <section className="rounded-2xl border border-border bg-card p-5">
            <div className="mb-5 flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-semibold">{copy.createArticle}</h2>
            </div>

            <form onSubmit={submitArticle} className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <Field label={copy.fields.title}>
                  <Input value={articleForm.titleEn} onChange={(e) => updateArticle('titleEn', e.target.value)} required />
                </Field>
                <Field label={copy.fields.arabicTitle}>
                  <Input value={articleForm.titleAr} onChange={(e) => updateArticle('titleAr', e.target.value)} />
                </Field>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <Field label={copy.fields.category}>
                  <select
                    value={articleForm.categoryId}
                    onChange={(e) => updateArticle('categoryId', e.target.value)}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    required
                  >
                    <option value="">{copy.selectCategory}</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name?.[lang] || category.name?.en || category.name?.ar || category.slug}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label={copy.fields.heroImageUrl}>
                  <Input value={articleForm.heroImageUrl} onChange={(e) => updateArticle('heroImageUrl', e.target.value)} placeholder={copy.placeholders.url} />
                </Field>
              </div>

              <Field label={copy.fields.subtitle}>
                <Input value={articleForm.subtitleEn} onChange={(e) => updateArticle('subtitleEn', e.target.value)} />
              </Field>

              <Field label={copy.fields.excerpt}>
                <textarea value={articleForm.excerptEn} onChange={(e) => updateArticle('excerptEn', e.target.value)} rows={3} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
              </Field>

              <Field label={copy.fields.content}>
                <textarea value={articleForm.contentEn} onChange={(e) => updateArticle('contentEn', e.target.value)} rows={9} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" required />
              </Field>

              <Field label={copy.fields.arabicContent}>
                <textarea value={articleForm.contentAr} onChange={(e) => updateArticle('contentAr', e.target.value)} rows={7} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
              </Field>

              <Button type="submit" className="rounded-xl gap-2" disabled={articleMutation.isPending}>
                <Send className="h-4 w-4" />
                {articleMutation.isPending ? copy.submitting : copy.submitForReview}
              </Button>
            </form>
          </section>

          <section className="rounded-2xl border border-border bg-card p-5">
            <h2 className="mb-4 text-lg font-semibold">{copy.myArticles}</h2>
            {isLoadingArticles ? (
              <div className="space-y-3">
                <Skeleton className="h-20 rounded-xl" />
                <Skeleton className="h-20 rounded-xl" />
              </div>
            ) : articles.length === 0 ? (
              <p className="rounded-xl bg-muted/40 p-4 text-sm text-muted-foreground">{copy.noArticles}</p>
            ) : (
              <div className="space-y-3">
                {articles.map((article) => (
                  <div key={article.id} className="rounded-xl border border-border p-4">
                    <div className="mb-2 flex flex-wrap items-start justify-between gap-2">
                      <h3 className="font-semibold">{article.title?.[lang] || article.title?.en || article.title?.ar || copy.untitledArticle}</h3>
                      <div className="flex gap-2">
                        <Badge variant="secondary">{copy.status[article.status] || article.status}</Badge>
                        <Badge>{copy.status[article.approval_status] || article.approval_status}</Badge>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground">{article.category?.name?.[lang] || article.category?.name?.en || article.category?.slug}</p>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      ) : (
        <DoctorRequestPanel
          latestRequest={latestRequest}
          requestForm={requestForm}
          updateRequest={updateRequest}
          submitRequest={submitRequest}
          isSubmitting={requestMutation.isPending}
          copy={copy}
        />
      )}
    </div>
  );
}

function DoctorRequestPanel({ latestRequest, requestForm, updateRequest, submitRequest, isSubmitting, copy }) {
  const canSubmit = !latestRequest || latestRequest.status === 'rejected';

  return (
    <div className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
      <section className="rounded-2xl border border-border bg-card p-5">
        <div className="mb-4 flex items-center gap-2">
          <Stethoscope className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold">{copy.accessRequest}</h2>
        </div>
        <p className="text-sm leading-6 text-muted-foreground">
          {copy.requestIntro}
        </p>
        {latestRequest ? (
          <div className="mt-5 rounded-xl border border-border bg-muted/30 p-4 text-sm">
            <div className="mb-2 flex items-center justify-between gap-3">
              <span className="font-medium">{latestRequest.specialty}</span>
              <StatusBadge request={latestRequest} labels={copy.status} />
            </div>
            {latestRequest.review_notes ? <p className="text-muted-foreground">{latestRequest.review_notes}</p> : null}
          </div>
        ) : null}
      </section>

      <section className="rounded-2xl border border-border bg-card p-5">
        {canSubmit ? (
          <form onSubmit={submitRequest} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Field label={copy.fields.specialty}>
                <Input value={requestForm.specialty} onChange={(e) => updateRequest('specialty', e.target.value)} placeholder={copy.placeholders.specialty} required />
              </Field>
              <Field label={copy.fields.licenseNumber}>
                <Input value={requestForm.license_number} onChange={(e) => updateRequest('license_number', e.target.value)} />
              </Field>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <Field label={copy.fields.organization}>
                <Input value={requestForm.organization} onChange={(e) => updateRequest('organization', e.target.value)} placeholder={copy.placeholders.organization} />
              </Field>
              <Field label={copy.fields.experience}>
                <Input value={requestForm.years_of_experience} onChange={(e) => updateRequest('years_of_experience', e.target.value)} placeholder={copy.placeholders.experience} />
              </Field>
            </div>
            <Field label={copy.fields.credentialDocumentUrl}>
              <Input value={requestForm.document_url} onChange={(e) => updateRequest('document_url', e.target.value)} placeholder={copy.placeholders.url} />
            </Field>
            <Field label={copy.fields.messageToAdmin}>
              <textarea value={requestForm.message} onChange={(e) => updateRequest('message', e.target.value)} rows={5} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
            </Field>
            <Button type="submit" className="rounded-xl gap-2" disabled={isSubmitting}>
              <Send className="h-4 w-4" />
              {isSubmitting ? copy.sending : copy.sendRequest}
            </Button>
          </form>
        ) : (
          <div className="rounded-xl bg-muted/40 p-5 text-sm text-muted-foreground">
            {copy.pendingMessage}
          </div>
        )}
      </section>
    </div>
  );
}

function Field({ label, children }) {
  const id = label.toLowerCase().replace(/\s+/g, '-');
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      {React.cloneElement(children, { id })}
    </div>
  );
}

function StatusBadge({ request, isApprovedDoctor = false, labels = {} }) {
  if (isApprovedDoctor) {
    return (
      <Badge className="gap-1 bg-emerald-600 text-white hover:bg-emerald-600">
        <ShieldCheck className="h-3.5 w-3.5" />
        {labels.approved || 'Approved Doctor'}
      </Badge>
    );
  }

  const status = request?.status || 'not_requested';
  const color = status === 'pending' ? 'bg-amber-500' : status === 'rejected' ? 'bg-rose-600' : 'bg-slate-600';
  const Icon = status === 'rejected' ? XCircle : Stethoscope;

  return (
    <Badge className={`gap-1 text-white ${color}`}>
      <Icon className="h-3.5 w-3.5" />
      {labels[status] || status.replace('_', ' ')}
    </Badge>
  );
}
