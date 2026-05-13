import React, { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';
import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Activity, Brain, Droplets, MoonStar, Sparkles, Stethoscope, TrendingUp } from 'lucide-react';
import { getHealthInsights } from '@/lib/med-api';
import { useLanguage } from '@/lib/LanguageContext';
import LoadingState from '@/components/state/LoadingState';
import ErrorState from '@/components/state/ErrorState';
import EmptyState from '@/components/state/EmptyState';
import { Button } from '@/components/ui/button';
import Seo from '@/components/seo/Seo';

const METRIC_META = {
  weight: { icon: Activity, color: '#0ea5e9', unit: 'kg' },
  blood_pressure_systolic: { icon: Activity, color: '#ef4444', unit: 'mmHg' },
  blood_pressure_diastolic: { icon: Activity, color: '#f97316', unit: 'mmHg' },
  heart_rate: { icon: Activity, color: '#ec4899', unit: 'bpm' },
  blood_glucose: { icon: Activity, color: '#a855f7', unit: 'mg/dL' },
  sleep_hours: { icon: MoonStar, color: '#6366f1', unit: 'hours' },
  steps: { icon: TrendingUp, color: '#10b981', unit: 'steps' },
  water_intake: { icon: Droplets, color: '#06b6d4', unit: 'L' },
  temperature: { icon: Activity, color: '#f59e0b', unit: '°C' },
  oxygen_saturation: { icon: Sparkles, color: '#14b8a6', unit: '%' },
};

function CorrelationCard({ title, value, hint }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <p className="text-xs uppercase tracking-wide text-muted-foreground">{title}</p>
      <p className="mt-2 text-2xl font-bold text-foreground">{value}</p>
      <p className="mt-1 text-sm text-muted-foreground">{hint}</p>
    </div>
  );
}

export default function HealthInsights() {
  const { t, lang } = useLanguage();
  const [activeMetric, setActiveMetric] = useState('');

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['health_insights'],
    queryFn: getHealthInsights,
  });

  const metricSeries = data?.metric_series || [];
  const symptomHistory = data?.symptom_history || [];

  const selectedMetric = activeMetric || metricSeries[0]?.metric_type || '';
  const selectedSeries = metricSeries.find((series) => series.metric_type === selectedMetric) || null;
  const selectedCorrelation = (data?.correlations || []).find((entry) => entry.metric_type === selectedMetric) || null;

  const chartData = useMemo(() => {
    if (!data?.timeline || !selectedMetric) {
      return [];
    }

    return data.timeline.map((day) => ({
      date: day.date,
      label: format(new Date(day.date), lang === 'ar' ? 'd MMM' : 'MMM d'),
      metricValue: day.metrics?.[selectedMetric] ?? null,
      symptomScore: day.symptom_score ?? 0,
      symptomEvents: day.symptom_event_count ?? 0,
    }));
  }, [data?.timeline, selectedMetric, lang]);

  const pageTitle = lang === 'ar'
    ? 'ترابط الأعراض والمؤشرات الصحية | MedBlog'
    : 'Symptom and Metric Correlations | MedBlog';
  const pageDescription = lang === 'ar'
    ? 'قارِن بين الأعراض المسجلة ومؤشراتك الصحية مثل النوم وشرب الماء لرؤية الأنماط المحتملة بمرور الوقت.'
    : 'Compare recorded symptoms with your health metrics such as sleep and hydration to spot possible patterns over time.';

  if (isLoading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <Seo title={pageTitle} description={pageDescription} robots="noindex,nofollow" />
        <LoadingState title={t.healthInsights.loadingTitle} description={t.healthInsights.loadingDescription} />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <Seo title={pageTitle} description={pageDescription} robots="noindex,nofollow" />
        <ErrorState
          title={t.healthInsights.errorTitle}
          description={error?.message || t.healthInsights.errorDescription}
          actionLabel={t.healthInsights.retry}
          onAction={refetch}
        />
      </div>
    );
  }

  const hasData = metricSeries.length > 0 && symptomHistory.length > 0;

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <Seo title={pageTitle} description={pageDescription} robots="noindex,nofollow" />

      <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10">
            <Brain className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-serif font-bold">{t.healthInsights.title}</h1>
            <p className="text-sm text-muted-foreground">{t.healthInsights.subtitle}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Link to="/dashboard">
            <Button variant="outline" className="rounded-xl">{t.healthInsights.backToDashboard}</Button>
          </Link>
          <Link to="/symptom-checker">
            <Button className="gap-2 rounded-xl">
              <Stethoscope className="h-4 w-4" />
              {t.healthInsights.runAssessment}
            </Button>
          </Link>
        </div>
      </div>

      {!hasData ? (
        <EmptyState
          title={t.healthInsights.emptyTitle}
          description={t.healthInsights.emptyDescription}
        />
      ) : (
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <CorrelationCard
              title={t.healthInsights.cards.metricEntries}
              value={data.overview.total_metric_entries}
              hint={t.healthInsights.cards.metricEntriesHint}
            />
            <CorrelationCard
              title={t.healthInsights.cards.assessments}
              value={data.overview.total_symptom_assessments}
              hint={t.healthInsights.cards.assessmentsHint}
            />
            <CorrelationCard
              title={t.healthInsights.cards.trackedMetrics}
              value={data.overview.metric_types_tracked.length}
              hint={t.healthInsights.cards.trackedMetricsHint}
            />
            <CorrelationCard
              title={t.healthInsights.cards.symptomDays}
              value={data.overview.symptom_days}
              hint={t.healthInsights.cards.symptomDaysHint}
            />
          </div>

          <div className="rounded-3xl border border-border bg-card p-5">
            <div className="mb-4 flex flex-wrap gap-2">
              {metricSeries.map((series) => {
                const meta = METRIC_META[series.metric_type] || { icon: Activity, color: '#0ea5e9' };
                const Icon = meta.icon;
                const isActive = selectedMetric === series.metric_type;

                return (
                  <button
                    key={series.metric_type}
                    type="button"
                    onClick={() => setActiveMetric(series.metric_type)}
                    className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm transition ${
                      isActive ? 'border-primary bg-primary/10 text-primary' : 'border-border bg-background hover:border-primary/40'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {t.dashboard.metrics[series.metric_type] || series.metric_type}
                  </button>
                );
              })}
            </div>

            <div className="grid gap-6 xl:grid-cols-[1.4fr_0.6fr]">
              <div className="rounded-2xl border border-border/70 bg-muted/20 p-4">
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <h2 className="font-semibold text-lg">{t.healthInsights.chartTitle}</h2>
                    <p className="text-sm text-muted-foreground">{t.healthInsights.chartDescription}</p>
                  </div>
                </div>
                <ResponsiveContainer width="100%" height={320}>
                  <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="label" tickLine={false} axisLine={false} />
                    <YAxis yAxisId="metric" tickLine={false} axisLine={false} />
                    <YAxis yAxisId="symptoms" orientation="right" tickLine={false} axisLine={false} allowDecimals={false} />
                    <Tooltip
                      contentStyle={{
                        background: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '16px',
                      }}
                      formatter={(value, name) => {
                        if (name === 'metricValue') {
                          return [`${value} ${selectedSeries?.unit || METRIC_META[selectedMetric]?.unit || ''}`, t.dashboard.metrics[selectedMetric] || selectedMetric];
                        }

                        if (name === 'symptomScore') {
                          return [value, t.healthInsights.symptomScore];
                        }

                        return [value, t.healthInsights.symptomEvents];
                      }}
                    />
                    <Legend
                      formatter={(value) => {
                        if (value === 'metricValue') return t.dashboard.metrics[selectedMetric] || selectedMetric;
                        if (value === 'symptomScore') return t.healthInsights.symptomScore;
                        return t.healthInsights.symptomEvents;
                      }}
                    />
                    <Bar yAxisId="symptoms" dataKey="symptomScore" fill="#f59e0b" radius={[8, 8, 0, 0]} />
                    <Line
                      yAxisId="metric"
                      type="monotone"
                      dataKey="metricValue"
                      stroke={METRIC_META[selectedMetric]?.color || '#0ea5e9'}
                      strokeWidth={3}
                      dot={{ r: 4 }}
                      connectNulls
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>

              <div className="space-y-4">
                <div className="rounded-2xl border border-border/70 bg-muted/20 p-4">
                  <h3 className="font-semibold">{t.healthInsights.correlationTitle}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{t.healthInsights.correlationDescription}</p>
                  {selectedCorrelation ? (
                    <div className="mt-4 space-y-3 text-sm">
                      <div className="rounded-xl bg-card p-3">
                        <p className="text-muted-foreground">{t.healthInsights.onSymptomDays}</p>
                        <p className="mt-1 text-xl font-bold">
                          {selectedCorrelation.symptom_day_average ?? '—'} {selectedCorrelation.unit || ''}
                        </p>
                      </div>
                      <div className="rounded-xl bg-card p-3">
                        <p className="text-muted-foreground">{t.healthInsights.onOtherDays}</p>
                        <p className="mt-1 text-xl font-bold">
                          {selectedCorrelation.baseline_average ?? '—'} {selectedCorrelation.unit || ''}
                        </p>
                      </div>
                      <div className="rounded-xl bg-card p-3">
                        <p className="text-muted-foreground">{t.healthInsights.detectedPattern}</p>
                        <p className="mt-1 font-semibold">{t.healthInsights.patterns[selectedCorrelation.direction] || selectedCorrelation.direction}</p>
                        <p className="mt-1 text-muted-foreground">
                          {t.healthInsights.confidence}: {t.healthInsights.confidenceLevels[selectedCorrelation.confidence] || selectedCorrelation.confidence}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <EmptyState
                      className="mt-4 p-4"
                      title={t.healthInsights.notEnoughDataTitle}
                      description={t.healthInsights.notEnoughDataDescription}
                    />
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-border bg-card p-5">
            <h2 className="text-lg font-semibold">{t.healthInsights.symptomHistoryTitle}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{t.healthInsights.symptomHistoryDescription}</p>
            <div className="mt-4 grid gap-3">
              {symptomHistory.slice().reverse().map((entry) => (
                <div key={entry.id} className="rounded-2xl border border-border/70 bg-muted/20 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="font-semibold">{entry.symptoms.join(', ')}</p>
                      <p className="text-sm text-muted-foreground">{entry.date}</p>
                    </div>
                    <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                      {t.symptomChecker.urgency[entry.urgency] || entry.urgency}
                    </span>
                  </div>
                  {entry.summary ? <p className="mt-3 text-sm text-muted-foreground">{entry.summary}</p> : null}
                  {entry.next_steps?.length ? (
                    <ul className="mt-3 space-y-1 text-sm text-muted-foreground">
                      {entry.next_steps.slice(0, 2).map((step, index) => (
                        <li key={`${entry.id}-${index}`} className="flex items-start gap-2">
                          <span className="mt-2 h-1.5 w-1.5 rounded-full bg-primary" />
                          <span>{step}</span>
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
