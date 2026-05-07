import React, { useRef, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, Clock3, FileUp, LibraryBig, MessageSquareQuote, ShieldCheck, ShieldX, Trash2, Upload } from 'lucide-react';
import { listMedicalKnowledgeSources, saveMedicalKnowledgeSource, deleteMedicalKnowledgeSource, importMedicalKnowledgeSources } from '@/lib/medical-knowledge-api';
import { getSourceFreshness, normalizeSource } from '@/lib/medicalKnowledgeBase';
import { getMedicalAssistantAnalytics } from '@/lib/medical-assistant-api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { useLanguage } from '@/lib/LanguageContext';

const PAGE_COPY = {
  en: {
    back: 'Back',
    title: 'Medical Knowledge Base',
    subtitle: 'Upload and manage trusted medical sources used by the assistant.',
    caution: 'Only upload vetted medical content from trusted organizations. The assistant will answer from this knowledge base and cite the selected sources.',
    addSource: 'Add source',
    importJson: 'Import JSON',
    sourceTitle: 'Source title',
    organization: 'Organization',
    url: 'Source URL',
    category: 'Category',
    evidenceLevel: 'Evidence level',
    tags: 'Tags',
    specialty: 'Specialty',
    reviewStatus: 'Review status',
    reviewOwner: 'Reviewer',
    reviewedAt: 'Reviewed at',
    expiresAt: 'Review expires',
    sourcePublishedAt: 'Published at',
    reviewNotes: 'Review notes',
    summary: 'Summary',
    content: 'Source content',
    tagsPlaceholder: 'comma, separated, tags',
    summaryPlaceholder: 'Short high-signal summary of what the source says.',
    contentPlaceholder: 'Paste the medical content or policy summary used for grounded answers.',
    saveSource: 'Save source',
    storedSources: 'Custom sources',
    none: 'No custom sources yet.',
    delete: 'Delete',
    retrievalStats: 'Retrieval stats',
    totalSources: 'Total sources',
    customSources: 'Custom sources',
    indexedChunks: 'Indexed chunks',
    approvedSources: 'Approved custom sources',
    staleSources: 'Stale custom sources',
    feedbackTitle: 'Assistant feedback',
    interactions: 'Logged interactions',
    positiveFeedback: 'Positive feedback',
    negativeFeedback: 'Negative feedback',
    importSuccess: 'Knowledge sources imported.',
    saveSuccess: 'Knowledge source saved.',
    deleteSuccess: 'Knowledge source deleted.',
    invalidImport: 'Unsupported file. Use JSON, TXT, or MD.',
    uploadHint: 'You can import a JSON file with one source object or an array of source objects.',
    requiredFields: 'Missing required source fields.',
  },
  ar: {
    back: 'رجوع',
    title: 'قاعدة المعرفة الطبية',
    subtitle: 'ارفع وأدر المصادر الطبية الموثوقة التي يستخدمها المساعد.',
    caution: 'ارفع فقط محتوى طبيًا موثقًا من جهات موثوقة. سيجيب المساعد من هذه القاعدة المعرفية مع عرض المصادر المستخدمة.',
    addSource: 'إضافة مصدر',
    importJson: 'استيراد JSON',
    sourceTitle: 'عنوان المصدر',
    organization: 'الجهة',
    url: 'رابط المصدر',
    category: 'التصنيف',
    evidenceLevel: 'مستوى الدليل',
    tags: 'الوسوم',
    specialty: 'التخصص',
    reviewStatus: 'حالة المراجعة',
    reviewOwner: 'المراجع',
    reviewedAt: 'تاريخ المراجعة',
    expiresAt: 'انتهاء المراجعة',
    sourcePublishedAt: 'تاريخ النشر',
    reviewNotes: 'ملاحظات المراجعة',
    summary: 'الملخص',
    content: 'محتوى المصدر',
    tagsPlaceholder: 'وسوم، مفصولة، بفواصل',
    summaryPlaceholder: 'ملخص قصير عالي الإشارة لما يقوله المصدر.',
    contentPlaceholder: 'الصق المحتوى الطبي أو ملخص السياسة المستخدم للإجابات المعتمدة على المصادر.',
    saveSource: 'حفظ المصدر',
    storedSources: 'المصادر المخصصة',
    none: 'لا توجد مصادر مخصصة بعد.',
    delete: 'حذف',
    retrievalStats: 'إحصاءات الاسترجاع',
    totalSources: 'إجمالي المصادر',
    customSources: 'المصادر المخصصة',
    indexedChunks: 'الأجزاء المفهرسة',
    approvedSources: 'المصادر المخصصة المعتمدة',
    staleSources: 'المصادر المخصصة القديمة',
    feedbackTitle: 'تقييمات المساعد',
    interactions: 'المحادثات المسجلة',
    positiveFeedback: 'التقييمات الإيجابية',
    negativeFeedback: 'التقييمات السلبية',
    importSuccess: 'تم استيراد المصادر المعرفية.',
    saveSuccess: 'تم حفظ المصدر المعرفي.',
    deleteSuccess: 'تم حذف المصدر المعرفي.',
    invalidImport: 'ملف غير مدعوم. استخدم JSON أو TXT أو MD.',
    uploadHint: 'يمكنك استيراد ملف JSON يحتوي على مصدر واحد أو مصفوفة من المصادر.',
    requiredFields: 'الحقول الأساسية للمصدر غير مكتملة.',
  },
};

const initialForm = {
  title: '',
  organization: '',
  url: '',
  category: 'general-medicine',
  specialty: 'general-medicine',
  evidenceLevel: 'reference',
  tags: '',
  reviewStatus: 'draft',
  reviewOwner: '',
  reviewedAt: '',
  expiresAt: '',
  sourcePublishedAt: '',
  reviewNotes: '',
  summary: '',
  content: '',
};

export default function AdminKnowledgeBase() {
  const { lang, isRTL } = useLanguage();
  const copy = PAGE_COPY[lang] || PAGE_COPY.en;
  const queryClient = useQueryClient();
  const fileInputRef = useRef(null);
  const [form, setForm] = useState(initialForm);

  const { data: knowledgeData } = useQuery({
    queryKey: ['medical-knowledge-sources'],
    queryFn: listMedicalKnowledgeSources,
  });
  const { data: assistantAnalytics } = useQuery({
    queryKey: ['medical-assistant-analytics'],
    queryFn: getMedicalAssistantAnalytics,
  });
  const sources = knowledgeData?.sources || [];
  const stats = knowledgeData?.stats || {};

  const saveMutation = useMutation({
    mutationFn: saveMedicalKnowledgeSource,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['medical-knowledge-sources'] });
      setForm(initialForm);
      toast.success(copy.saveSuccess);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteMedicalKnowledgeSource,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['medical-knowledge-sources'] });
      toast.success(copy.deleteSuccess);
    },
  });

  const importMutation = useMutation({
    mutationFn: importMedicalKnowledgeSources,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['medical-knowledge-sources'] });
      toast.success(copy.importSuccess);
    },
  });

  const updateForm = (key, value) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const analyticsTotals = assistantAnalytics?.totals || {};

  const handleSubmit = (event) => {
    event.preventDefault();
    const normalized = normalizeSource(form);
    if (!normalized) {
      toast.error(copy.requiredFields || 'Missing required source fields.');
      return;
    }
    saveMutation.mutate(normalized);
  };

  const handleFileImport = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const extension = file.name.split('.').pop()?.toLowerCase();

      if (extension === 'json') {
        const parsed = JSON.parse(text);
        const records = Array.isArray(parsed) ? parsed : [parsed];
        importMutation.mutate(records);
      } else if (extension === 'txt' || extension === 'md') {
        updateForm('content', text);
      } else {
        toast.error(copy.invalidImport);
      }
    } catch {
      toast.error(copy.invalidImport);
    } finally {
      event.target.value = '';
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
      <div className="flex items-center gap-4 mb-6">
        <Link to="/dashboard">
          <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground">
            <ArrowLeft className={`w-4 h-4 ${isRTL ? 'rotate-180' : ''}`} />
            {copy.back}
          </Button>
        </Link>
      </div>

      <div className="flex items-start justify-between gap-4 flex-wrap mb-8">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <LibraryBig className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-serif font-bold">{copy.title}</h1>
            <p className="text-muted-foreground mt-1">{copy.subtitle}</p>
          </div>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept=".json,.txt,.md"
          className="hidden"
          onChange={handleFileImport}
        />
        <Button variant="outline" className="gap-2 rounded-xl" onClick={() => fileInputRef.current?.click()}>
          <Upload className="w-4 h-4" /> {copy.importJson}
        </Button>
      </div>

      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900 mb-8">
        <div className="flex items-start gap-2">
          <ShieldCheck className="w-4 h-4 mt-0.5 shrink-0" />
          <div className="space-y-2">
            <p>{copy.caution}</p>
            <p className="text-xs">{copy.uploadHint}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
        <Card className="rounded-2xl">
          <CardHeader className="pb-3">
            <CardDescription>{copy.retrievalStats}</CardDescription>
            <CardTitle>{copy.totalSources}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-primary">{stats.sourceCount || 0}</p>
          </CardContent>
        </Card>
        <Card className="rounded-2xl">
          <CardHeader className="pb-3">
            <CardDescription>{copy.retrievalStats}</CardDescription>
            <CardTitle>{copy.customSources}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-primary">{stats.customSourceCount || 0}</p>
          </CardContent>
        </Card>
        <Card className="rounded-2xl">
          <CardHeader className="pb-3">
            <CardDescription>{copy.retrievalStats}</CardDescription>
            <CardTitle>{copy.indexedChunks}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-primary">{stats.chunkCount || 0}</p>
          </CardContent>
        </Card>
        <Card className="rounded-2xl">
          <CardHeader className="pb-3">
            <CardDescription>{copy.retrievalStats}</CardDescription>
            <CardTitle>{copy.approvedSources}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-emerald-600">{stats.approvedCustomSourceCount || 0}</p>
          </CardContent>
        </Card>
        <Card className="rounded-2xl">
          <CardHeader className="pb-3">
            <CardDescription>{copy.retrievalStats}</CardDescription>
            <CardTitle>{copy.staleSources}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-amber-600">{stats.staleCustomSourceCount || 0}</p>
          </CardContent>
        </Card>
        <Card className="rounded-2xl">
          <CardHeader className="pb-3">
            <CardDescription>{copy.feedbackTitle}</CardDescription>
            <CardTitle>{copy.interactions}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-primary">{analyticsTotals.interactions || 0}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle>{copy.feedbackTitle}</CardTitle>
            <CardDescription>{copy.positiveFeedback}</CardDescription>
          </CardHeader>
          <CardContent className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <p className="text-2xl font-bold text-foreground">{analyticsTotals.positive || 0}</p>
          </CardContent>
        </Card>
        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle>{copy.feedbackTitle}</CardTitle>
            <CardDescription>{copy.negativeFeedback}</CardDescription>
          </CardHeader>
          <CardContent className="flex items-center gap-3">
            <ShieldX className="w-5 h-5 text-red-600" />
            <p className="text-2xl font-bold text-foreground">{analyticsTotals.negative || 0}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1.15fr_0.85fr] gap-6">
        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle>{copy.addSource}</CardTitle>
            <CardDescription>{copy.subtitle}</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{copy.sourceTitle}</Label>
                  <Input value={form.title} onChange={(e) => updateForm('title', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>{copy.organization}</Label>
                  <Input value={form.organization} onChange={(e) => updateForm('organization', e.target.value)} />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2 md:col-span-2">
                  <Label>{copy.url}</Label>
                  <Input value={form.url} onChange={(e) => updateForm('url', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>{copy.category}</Label>
                  <Input value={form.category} onChange={(e) => updateForm('category', e.target.value)} />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>{copy.specialty}</Label>
                  <Input value={form.specialty} onChange={(e) => updateForm('specialty', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>{copy.evidenceLevel}</Label>
                  <Input value={form.evidenceLevel} onChange={(e) => updateForm('evidenceLevel', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>{copy.tags}</Label>
                  <Input value={form.tags} placeholder={copy.tagsPlaceholder} onChange={(e) => updateForm('tags', e.target.value)} />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>{copy.reviewStatus}</Label>
                  <Input value={form.reviewStatus} onChange={(e) => updateForm('reviewStatus', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>{copy.reviewOwner}</Label>
                  <Input value={form.reviewOwner} onChange={(e) => updateForm('reviewOwner', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>{copy.reviewedAt}</Label>
                  <Input type="date" value={form.reviewedAt} onChange={(e) => updateForm('reviewedAt', e.target.value)} />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{copy.expiresAt}</Label>
                  <Input type="date" value={form.expiresAt} onChange={(e) => updateForm('expiresAt', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>{copy.sourcePublishedAt}</Label>
                  <Input type="date" value={form.sourcePublishedAt} onChange={(e) => updateForm('sourcePublishedAt', e.target.value)} />
                </div>
              </div>

              <div className="space-y-2">
                <Label>{copy.summary}</Label>
                <Textarea value={form.summary} placeholder={copy.summaryPlaceholder} onChange={(e) => updateForm('summary', e.target.value)} className="min-h-[92px]" />
              </div>

              <div className="space-y-2">
                <Label>{copy.reviewNotes}</Label>
                <Textarea value={form.reviewNotes} onChange={(e) => updateForm('reviewNotes', e.target.value)} className="min-h-[92px]" />
              </div>

              <div className="space-y-2">
                <Label>{copy.content}</Label>
                <Textarea value={form.content} placeholder={copy.contentPlaceholder} onChange={(e) => updateForm('content', e.target.value)} className="min-h-[220px]" />
              </div>

              <Button type="submit" disabled={saveMutation.isPending} className="rounded-xl gap-2">
                <FileUp className="w-4 h-4" /> {copy.saveSource}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle>{copy.storedSources}</CardTitle>
            <CardDescription>{sources.length} source(s)</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {sources.length === 0 ? (
              <p className="text-sm text-muted-foreground">{copy.none}</p>
            ) : (
              sources.map((source, index) => {
                const freshness = getSourceFreshness(source);

                return (
                <div key={source.id} className="space-y-3">
                  {index > 0 && <Separator />}
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-2 min-w-0">
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="outline" className="rounded-full">{source.organization}</Badge>
                        <Badge variant="secondary" className="rounded-full">{source.evidenceLevel}</Badge>
                        <Badge variant="secondary" className="rounded-full">{source.category}</Badge>
                        <Badge variant={source.reviewStatus === 'approved' ? 'default' : 'outline'} className="rounded-full">{source.reviewStatus}</Badge>
                        <Badge variant="outline" className="rounded-full">{freshness.label}</Badge>
                      </div>
                      <div>
                        <p className="font-semibold">{source.title}</p>
                        <p className="text-sm text-muted-foreground line-clamp-3">{source.summary}</p>
                      </div>
                      <div className="grid grid-cols-1 gap-1 text-xs text-muted-foreground">
                        <p>{copy.specialty}: {source.specialty}</p>
                        {source.reviewOwner ? <p>{copy.reviewOwner}: {source.reviewOwner}</p> : null}
                        {source.reviewNotes ? <p>{copy.reviewNotes}: {source.reviewNotes}</p> : null}
                      </div>
                      {source.tags?.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {source.tags.map((tag) => (
                            <Badge key={`${source.id}-${tag}`} variant="outline" className="rounded-full text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="shrink-0"
                      onClick={() => deleteMutation.mutate(source.id)}
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              )})
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="rounded-2xl mt-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquareQuote className="w-5 h-5 text-primary" />
            {copy.feedbackTitle}
          </CardTitle>
          <CardDescription>{assistantAnalytics?.updatedAt || ''}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {(assistantAnalytics?.recent || []).length === 0 ? (
            <p className="text-sm text-muted-foreground">{copy.none}</p>
          ) : (
            assistantAnalytics.recent.slice(0, 8).map((entry, index) => (
              <div key={entry.id} className="space-y-3">
                {index > 0 && <Separator />}
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1 min-w-0">
                    <p className="text-sm font-medium text-foreground line-clamp-2">{entry.request?.message}</p>
                    <p className="text-xs text-muted-foreground">
                      {entry.response?.assessment?.urgency || 'unknown'} · {entry.response?.assessment?.specialty || 'general'}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 text-xs">
                    {entry.feedback?.rating === 'up' ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : null}
                    {entry.feedback?.rating === 'down' ? <ShieldX className="w-4 h-4 text-red-600" /> : null}
                    {!entry.feedback?.rating ? <Clock3 className="w-4 h-4 text-muted-foreground" /> : null}
                  </div>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
