import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteHealthMetric, listHealthMetrics } from '@/lib/med-api';
import { useSavedArticles } from '@/lib/SavedArticlesContext';
import { useAuth } from '@/lib/AuthContext';
import MetricChart from '@/components/dashboard/MetricChart';
import AddMetricModal from '@/components/dashboard/AddMetricModal';
import TrendingTopics from '@/components/dashboard/TrendingTopics';
import { Button } from '@/components/ui/button';
import {
  Activity,
  ArrowUpRight,
  Bookmark,
  Brain,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Droplets,
  Footprints,
  Gauge,
  HeartPulse,
  LibraryBig,
  LayoutDashboard,
  Moon,
  Plus,
  Scale,
  Sparkles,
  Stethoscope,
  Thermometer,
  TrendingUp,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/lib/LanguageContext';
import PageSeo from '@/components/seo/PageSeo';
import { cn } from '@/lib/utils';

const METRIC_META = {
  weight: { label: 'Weight', unit: 'kg', color: '#0284c7', Icon: Scale },
  blood_pressure_systolic: { label: 'BP Systolic', unit: 'mmHg', color: '#dc2626', Icon: Activity },
  blood_pressure_diastolic: { label: 'BP Diastolic', unit: 'mmHg', color: '#ea580c', Icon: Activity },
  heart_rate: { label: 'Heart Rate', unit: 'bpm', color: '#e11d48', Icon: HeartPulse },
  blood_glucose: { label: 'Blood Glucose', unit: 'mg/dL', color: '#7c3aed', Icon: Gauge },
  sleep_hours: { label: 'Sleep', unit: 'hours', color: '#4f46e5', Icon: Moon },
  steps: { label: 'Steps', unit: 'steps', color: '#059669', Icon: Footprints },
  water_intake: { label: 'Water Intake', unit: 'L', color: '#0891b2', Icon: Droplets },
  temperature: { label: 'Temperature', unit: '°C', color: '#d97706', Icon: Thermometer },
  oxygen_saturation: { label: 'O2 Saturation', unit: '%', color: '#0d9488', Icon: Activity },
};

function SidebarSection({ icon: Icon, title, description, children, isArabic }) {
  return (
    <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_18px_55px_-38px_rgba(15,23,42,0.5)] ring-1 ring-white/70">
      <div className={cn('mb-5 flex items-start gap-3', isArabic && 'flex-row-reverse text-right')}>
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-sky-50 text-primary ring-1 ring-primary/10">
          <Icon className="h-5 w-5" />
        </div>
        <div className="min-w-0 space-y-1">
          <h2 className="text-lg font-bold text-slate-950">{title}</h2>
          <p className="text-sm leading-6 text-slate-500">{description}</p>
        </div>
      </div>
      {children}
    </section>
  );
}

function SidebarLinkRow({ to, icon: Icon, title, subtitle, isArabic }) {
  return (
    <Link to={to} className="block rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30">
      <div
        className={cn(
          'flex min-h-[64px] items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:bg-sky-50/40 hover:shadow-md',
          isArabic && 'text-right'
        )}
      >
        {isArabic && <ChevronLeft className="h-4 w-4 shrink-0 text-slate-400" />}
        <div className={cn('flex min-w-0 items-center gap-3', isArabic && 'flex-row-reverse')}>
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-slate-100 text-primary">
            <Icon className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-slate-950">{title}</p>
            <p className="text-xs text-slate-500">{subtitle}</p>
          </div>
        </div>
        {!isArabic && <ChevronRight className="h-4 w-4 shrink-0 text-slate-400" />}
      </div>
    </Link>
  );
}

export default function HealthDashboard() {
  const { t, lang } = useLanguage();
  const { user } = useAuth();
  const isArabic = lang === 'ar';
  const [showAddModal, setShowAddModal] = useState(false);
  const [activeMetric, setActiveMetric] = useState('weight');
  const { savedItems } = useSavedArticles();
  const queryClient = useQueryClient();

  const { data: metrics = [], isLoading } = useQuery({
    queryKey: ['health_metrics'],
    queryFn: listHealthMetrics,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteHealthMetric,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['health_metrics'] }),
  });

  const metricTypes = [...new Set(metrics.map(m => m.metric_type))];
  const displayedMetric = metricTypes.includes(activeMetric) ? activeMetric : (metricTypes[0] || activeMetric);
  const activeData = metrics.filter(m => m.metric_type === displayedMetric)
    .sort((a, b) => new Date(a.recorded_date) - new Date(b.recorded_date));

  const latestByType = metricTypes.map(type => {
    const latest = metrics.filter(m => m.metric_type === type).sort((a, b) => new Date(b.recorded_date) - new Date(a.recorded_date))[0];
    return { type, latest };
  });

  const quickTools = [
    { to: '/symptom-checker', icon: Stethoscope, label: t.dashboard.symptomChecker },
    { to: '/health-tools', icon: TrendingUp, label: t.dashboard.healthTools },
    { to: '/health-insights', icon: Brain, label: t.dashboard.healthInsights },
  ];

  if (user?.role === 'admin') {
    quickTools.push({ to: '/admin/knowledge-base', icon: LibraryBig, label: 'Medical Knowledge Base' });
  }

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#f8fbfd_0%,#ffffff_44%,#f7fafc_100%)]">
      <PageSeo page="dashboard" />
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:py-10">
        <header
          className={cn(
            'mb-8 flex flex-col gap-5 rounded-2xl border border-slate-200/80 bg-white/95 p-5 shadow-[0_18px_60px_-42px_rgba(15,23,42,0.55)] sm:p-6 lg:flex-row lg:items-center lg:justify-between',
            isArabic && 'lg:flex-row-reverse'
          )}
        >
          <div className={cn('flex items-start gap-4', isArabic && 'flex-row-reverse text-right')}>
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-100 to-cyan-50 text-primary shadow-inner">
              <LayoutDashboard className="h-5 w-5" />
            </div>
            <div>
              <div className={cn('mb-2 flex flex-wrap items-center gap-2', isArabic && 'justify-end')}>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/15 bg-primary/5 px-3 py-1 text-xs font-semibold text-primary">
                  <Sparkles className="h-3.5 w-3.5" />
                  {isArabic ? 'نظرة صحية شخصية' : 'Personal health workspace'}
                </span>
              </div>
              <h1 className="font-serif text-3xl font-bold tracking-normal text-slate-950 sm:text-4xl">{t.dashboard.title}</h1>
              <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">{t.dashboard.subtitle}</p>
            </div>
          </div>
          <div className={cn('flex flex-col gap-3 sm:flex-row sm:items-center', isArabic && 'sm:flex-row-reverse')}>
            <div className="hidden rounded-2xl border border-slate-200 bg-slate-50/80 px-4 py-3 text-sm font-medium text-slate-600 sm:block">
              <div className={cn('flex items-center gap-2', isArabic && 'flex-row-reverse')}>
                <CalendarDays className="h-4 w-4 text-primary" />
                <span>{metrics.length} {t.metricChart.entries}</span>
              </div>
            </div>
            <Button
              onClick={() => setShowAddModal(true)}
              className="h-11 gap-2 rounded-2xl bg-primary px-5 font-semibold shadow-[0_14px_28px_-18px_rgba(2,132,199,0.95)] transition-all hover:-translate-y-0.5 hover:bg-primary/90 hover:shadow-[0_18px_34px_-20px_rgba(2,132,199,0.9)] focus-visible:ring-2 focus-visible:ring-primary/30"
            >
              <Plus className="h-4 w-4" /> {t.dashboard.logMetric}
            </Button>
          </div>
        </header>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_356px] xl:grid-cols-[minmax(0,1fr)_380px]">
          <main className="space-y-6">
            {isLoading ? (
              <div className="flex h-64 items-center justify-center rounded-2xl border border-slate-200/80 bg-white shadow-[0_18px_50px_-38px_rgba(15,23,42,0.45)]">
                <div className="h-7 w-7 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              </div>
            ) : latestByType.length === 0 ? (
              <section className={cn('overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_22px_70px_-44px_rgba(15,23,42,0.5)]', isArabic && 'text-right')}>
                <div className="border-b border-slate-100 bg-gradient-to-r from-sky-50 via-white to-teal-50 px-6 py-5">
                  <div className={cn('flex items-center gap-3', isArabic && 'flex-row-reverse')}>
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-primary shadow-sm">
                      <HeartPulse className="h-5 w-5" />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-slate-950">{isArabic ? 'المؤشرات الصحية' : 'Health Metrics'}</h2>
                      <p className="text-sm text-slate-500">{isArabic ? 'ابدأ بسجل واحد لبناء خط زمني صحي.' : 'Start with one reading to build a clean health timeline.'}</p>
                    </div>
                  </div>
                </div>
                <div className="grid gap-8 px-6 py-10 sm:px-10 lg:grid-cols-[1fr_260px] lg:items-center">
                  <div className={cn('mx-auto max-w-xl text-center lg:mx-0', isArabic ? 'lg:text-right' : 'lg:text-left')}>
                    <div className={cn('mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary ring-8 ring-primary/[0.04]', isArabic ? 'lg:mr-0' : 'lg:ml-0')}>
                      <ArrowUpRight className="h-7 w-7" />
                    </div>
                    <p className="mb-2 text-2xl font-bold text-slate-950">{t.dashboard.noData}</p>
                    <p className="mb-6 text-sm leading-6 text-slate-500">{t.dashboard.noDataDescription}</p>
                    <Button
                      onClick={() => setShowAddModal(true)}
                      className="h-11 gap-2 rounded-2xl bg-primary px-5 font-semibold shadow-[0_14px_28px_-18px_rgba(2,132,199,0.95)] hover:bg-primary/90 focus-visible:ring-2 focus-visible:ring-primary/30"
                    >
                      <Plus className="h-4 w-4" /> {t.dashboard.firstMetric}
                    </Button>
                  </div>
                  <div className="hidden rounded-2xl border border-slate-200 bg-slate-50/70 p-4 lg:block">
                    <div className="space-y-3">
                      {[HeartPulse, Droplets, Moon].map((Icon, index) => (
                        <div key={index} className="flex items-center gap-3 rounded-2xl bg-white px-4 py-3 shadow-sm">
                          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-50 text-primary">
                            <Icon className="h-4 w-4" />
                          </div>
                          <div className="h-2 flex-1 rounded-full bg-slate-200">
                            <div className="h-2 rounded-full bg-primary/70" style={{ width: `${64 - index * 12}%` }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </section>
            ) : (
              <>
                <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  {latestByType.map(({ type, latest }) => {
                    const meta = METRIC_META[type] || { label: type, unit: '', color: '#64748b', Icon: Activity };
                    const Icon = meta.Icon || Activity;
                    const isActive = displayedMetric === type;
                    return (
                      <button
                        key={type}
                        onClick={() => setActiveMetric(type)}
                        className={cn(
                          'group min-h-[148px] rounded-2xl border bg-white p-5 text-left shadow-[0_16px_42px_-34px_rgba(15,23,42,0.55)] transition-all hover:-translate-y-0.5 hover:shadow-[0_22px_50px_-34px_rgba(15,23,42,0.55)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30',
                          isActive ? 'border-primary/35 ring-1 ring-primary/20' : 'border-slate-200/80 hover:border-primary/25',
                          isArabic && 'text-right'
                        )}
                      >
                        <div className={cn('mb-5 flex items-start justify-between gap-3', isArabic && 'flex-row-reverse')}>
                          <div
                            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-slate-50 transition-colors group-hover:bg-primary/10"
                            style={{ color: meta.color }}
                          >
                            <Icon className="h-5 w-5" />
                          </div>
                          <span className="rounded-full bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-500">{latest.recorded_date}</span>
                        </div>
                        <p className="text-sm font-semibold text-slate-600">{t.dashboard.metrics[type] || meta.label}</p>
                        <div className={cn('mt-2 flex items-end gap-1.5', isArabic && 'flex-row-reverse justify-start')}>
                          <span className="text-3xl font-bold leading-none text-slate-950" style={{ color: isActive ? meta.color : undefined }}>
                            {latest.value}
                          </span>
                          <span className="pb-1 text-sm font-medium text-slate-400">{meta.unit}</span>
                        </div>
                      </button>
                    );
                  })}
                </section>

                {activeData.length > 0 && (
                  <MetricChart
                    data={activeData}
                    meta={{ ...(METRIC_META[displayedMetric] || { label: displayedMetric, unit: '', color: '#0ea5e9' }), label: t.dashboard.metrics[displayedMetric] || (METRIC_META[displayedMetric]?.label ?? displayedMetric) }}
                    metricType={displayedMetric}
                    onDelete={(id) => deleteMutation.mutate(id)}
                  />
                )}
              </>
            )}
          </main>

          <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
            <SidebarSection
              icon={Bookmark}
              title={t.dashboard.readingActivity}
              description={isArabic ? 'ملخص سريع لما احتفظت به للعودة إليه لاحقًا.' : 'A quick summary of what you saved for later.'}
              isArabic={isArabic}
            >
              <div className="space-y-3">
                <div className="rounded-2xl border border-primary/15 bg-gradient-to-br from-primary/[0.08] to-cyan-50 px-4 py-5">
                  <div className={cn('flex items-center justify-between gap-4', isArabic && 'flex-row-reverse')}>
                    <div className={cn('space-y-1', isArabic && 'text-right')}>
                      <p className="text-sm font-semibold text-slate-600">{t.dashboard.saved}</p>
                      <p className="text-4xl font-bold leading-none text-primary">{savedItems.length}</p>
                    </div>
                    <div className="rounded-2xl bg-white/85 px-3 py-2 text-xs font-semibold text-slate-500 shadow-sm">
                      {isArabic ? 'إجمالي المحفوظات' : 'Total saved'}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: t.dashboard.articles, value: savedItems.filter(s => s.item_type === 'article').length },
                    { label: t.dashboard.stories, value: savedItems.filter(s => s.item_type === 'story').length },
                  ].map(stat => (
                    <div key={stat.label} className={cn('rounded-2xl border border-slate-200/80 bg-white px-4 py-4 shadow-sm', isArabic && 'text-right')}>
                      <p className={cn('text-xs font-semibold text-slate-400', isArabic ? '' : 'uppercase tracking-[0.16em]')}>{stat.label}</p>
                      <p className="mt-3 text-2xl font-bold text-slate-950">{stat.value}</p>
                    </div>
                  ))}
                </div>

                {savedItems.length > 0 && (
                  <SidebarLinkRow
                    to="/saved"
                    icon={Bookmark}
                    title={t.dashboard.viewSaved}
                    subtitle={isArabic ? 'عرض قائمتك المحفوظة' : 'Open your saved list'}
                    isArabic={isArabic}
                  />
                )}
              </div>
            </SidebarSection>

            <TrendingTopics savedItems={savedItems} />

            <SidebarSection
              icon={LayoutDashboard}
              title={t.dashboard.quickTools}
              description={isArabic ? 'اختصارات للوصول إلى الأدوات الأساسية بسرعة.' : 'Shortcuts to the tools you use most often.'}
              isArabic={isArabic}
            >
              <div className="space-y-3">
                {quickTools.map(({ to, icon: Icon, label }) => (
                  <SidebarLinkRow
                    key={to}
                    to={to}
                    icon={Icon}
                    title={label}
                    subtitle={isArabic ? 'فتح الأداة' : 'Open tool'}
                    isArabic={isArabic}
                  />
                ))}
              </div>
            </SidebarSection>
          </aside>
        </div>
      </div>

      {showAddModal && (
        <AddMetricModal
          onClose={() => setShowAddModal(false)}
          onSaved={() => {
            queryClient.invalidateQueries({ queryKey: ['health_metrics'] });
            setShowAddModal(false);
          }}
        />
      )}
    </div>
  );
}
