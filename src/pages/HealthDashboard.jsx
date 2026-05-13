import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteHealthMetric, listHealthMetrics } from '@/lib/med-api';
import { useSavedArticles } from '@/lib/SavedArticlesContext';
import { useAuth } from '@/lib/AuthContext';
import MetricChart from '@/components/dashboard/MetricChart';
import AddMetricModal from '@/components/dashboard/AddMetricModal';
import TrendingTopics from '@/components/dashboard/TrendingTopics';
import { Button } from '@/components/ui/button';
import { LayoutDashboard, Plus, Stethoscope, Bookmark, TrendingUp, LibraryBig, Brain } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/lib/LanguageContext';
import PageSeo from '@/components/seo/PageSeo';

const METRIC_META = {
  weight: { label: 'Weight', unit: 'kg', color: '#0ea5e9' },
  blood_pressure_systolic: { label: 'BP Systolic', unit: 'mmHg', color: '#ef4444' },
  blood_pressure_diastolic: { label: 'BP Diastolic', unit: 'mmHg', color: '#f97316' },
  heart_rate: { label: 'Heart Rate', unit: 'bpm', color: '#ec4899' },
  blood_glucose: { label: 'Blood Glucose', unit: 'mg/dL', color: '#a855f7' },
  sleep_hours: { label: 'Sleep', unit: 'hours', color: '#6366f1' },
  steps: { label: 'Steps', unit: 'steps', color: '#10b981' },
  water_intake: { label: 'Water Intake', unit: 'L', color: '#06b6d4' },
  temperature: { label: 'Temperature', unit: '°C', color: '#f59e0b' },
  oxygen_saturation: { label: 'O₂ Saturation', unit: '%', color: '#14b8a6' },
};

export default function HealthDashboard() {
  const { t } = useLanguage();
  const { user } = useAuth();
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
  const activeData = metrics.filter(m => m.metric_type === activeMetric)
    .sort((a, b) => new Date(a.recorded_date) - new Date(b.recorded_date));

  const latestByType = metricTypes.map(type => {
    const latest = metrics.filter(m => m.metric_type === type).sort((a, b) => new Date(b.recorded_date) - new Date(a.recorded_date))[0];
    return { type, latest };
  });

  return (
    <div data-tour="health-dashboard" className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
      <PageSeo page="dashboard" />
      {/* Header */}
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
            <LayoutDashboard className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-serif font-bold">{t.dashboard.title}</h1>
            <p className="text-sm text-muted-foreground">{t.dashboard.subtitle}</p>
          </div>
        </div>
        <Button data-tour="health-metric-entry" onClick={() => setShowAddModal(true)} className="gap-2 rounded-xl">
          <Plus className="w-4 h-4" /> {t.dashboard.logMetric}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Metrics */}
        <div className="lg:col-span-2 space-y-6">
          {/* Metric selector + latest values */}
          {isLoading ? (
            <div className="bg-card border border-border rounded-2xl p-6 h-40 flex items-center justify-center">
              <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : latestByType.length === 0 ? (
            <div className="bg-card border border-border rounded-2xl p-10 text-center">
              <TrendingUp className="w-12 h-12 mx-auto mb-4 text-muted-foreground/30" />
              <p className="font-semibold text-lg mb-1">{t.dashboard.noData}</p>
              <p className="text-sm text-muted-foreground mb-4">{t.dashboard.noDataDescription}</p>
              <Button onClick={() => setShowAddModal(true)} className="gap-2 rounded-xl">
                <Plus className="w-4 h-4" /> {t.dashboard.firstMetric}
              </Button>
            </div>
          ) : (
            <>
              {/* Latest metric summary cards */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {latestByType.map(({ type, latest }) => {
                  const meta = METRIC_META[type] || { label: type, unit: '', color: '#64748b' };
                  const isActive = activeMetric === type;
                  return (
                    <button
                      key={type}
                      onClick={() => setActiveMetric(type)}
                      className={`rounded-2xl border p-4 text-left transition-all hover:shadow-md ${isActive ? 'border-primary/50 bg-primary/5 shadow-sm' : 'border-border bg-card'}`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-muted-foreground font-medium">{t.dashboard.metrics[type] || meta.label}</span>
                        <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: meta.color }} />
                      </div>
                      <div className="text-2xl font-bold" style={{ color: isActive ? meta.color : undefined }}>
                        {latest.value}
                        <span className="text-xs font-normal text-muted-foreground ml-1">{meta.unit}</span>
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">{latest.recorded_date}</div>
                    </button>
                  );
                })}
              </div>

              {/* Chart */}
              {activeData.length > 0 && (
                <MetricChart
                  data={activeData}
                  meta={{ ...(METRIC_META[activeMetric] || { label: activeMetric, unit: '', color: '#0ea5e9' }), label: t.dashboard.metrics[activeMetric] || (METRIC_META[activeMetric]?.label ?? activeMetric) }}
                  metricType={activeMetric}
                  onDelete={(id) => deleteMutation.mutate(id)}
                />
              )}
            </>
          )}
        </div>

        {/* Right sidebar */}
        <div className="space-y-6">
          {/* Saved stats */}
          <div className="bg-card border border-border rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <Bookmark className="w-4 h-4 text-primary" />
              <h3 className="font-semibold">{t.dashboard.readingActivity}</h3>
            </div>
            <div className="grid grid-cols-3 gap-3 mb-4">
              {[
                { label: t.dashboard.saved, value: savedItems.length },
                { label: t.dashboard.articles, value: savedItems.filter(s => s.item_type === 'article').length },
                { label: t.dashboard.stories, value: savedItems.filter(s => s.item_type === 'story').length },
              ].map(stat => (
                <div key={stat.label} className="text-center p-3 bg-muted/40 rounded-xl">
                  <div className="text-2xl font-bold text-primary">{stat.value}</div>
                  <div className="text-xs text-muted-foreground">{stat.label}</div>
                </div>
              ))}
            </div>
            {savedItems.length > 0 && (
              <Link to="/saved">
                <Button variant="outline" size="sm" className="w-full rounded-xl gap-1.5">
                  <Bookmark className="w-3.5 h-3.5" /> {t.dashboard.viewSaved}
                </Button>
              </Link>
            )}
          </div>

          {/* Trending topics */}
          <TrendingTopics savedItems={savedItems} />

          {/* Quick links */}
          <div className="bg-card border border-border rounded-2xl p-5">
            <h3 className="font-semibold mb-3">{t.dashboard.quickTools}</h3>
            <div className="space-y-2">
              <Link to="/symptom-checker">
                <Button variant="outline" size="sm" className="w-full justify-start gap-2 rounded-xl">
                  <Stethoscope className="w-4 h-4 text-primary" /> {t.dashboard.symptomChecker}
                </Button>
              </Link>
              <Link to="/health-tools">
                <Button variant="outline" size="sm" className="w-full justify-start gap-2 rounded-xl">
                  <TrendingUp className="w-4 h-4 text-primary" /> {t.dashboard.healthTools}
                </Button>
              </Link>
              <Link to="/health-insights">
                <Button variant="outline" size="sm" className="w-full justify-start gap-2 rounded-xl">
                  <Brain className="w-4 h-4 text-primary" /> {t.dashboard.healthInsights}
                </Button>
              </Link>
              {user?.role === 'admin' ? (
                <Link to="/admin/knowledge-base">
                  <Button variant="outline" size="sm" className="w-full justify-start gap-2 rounded-xl">
                    <LibraryBig className="w-4 h-4 text-primary" /> Medical Knowledge Base
                  </Button>
                </Link>
              ) : null}
            </div>
          </div>
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
