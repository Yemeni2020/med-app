import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Button } from '@/components/ui/button';
import { BarChart3, ListChecks, Minus, Trash2, TrendingDown, TrendingUp } from 'lucide-react';
import { format } from 'date-fns';
import { useLanguage } from '@/lib/LanguageContext';
import { cn } from '@/lib/utils';

export default function MetricChart({ data, meta, onDelete }) {
  const { t, lang } = useLanguage();
  const [showTable, setShowTable] = useState(false);
  const isArabic = lang === 'ar';

  const chartData = data.map(d => ({
    ...d,
    date: format(new Date(d.recorded_date), lang === 'ar' ? 'd MMM' : 'MMM d'),
    fullDate: d.recorded_date,
  }));

  const values = data.map(d => d.value);
  const latest = values[values.length - 1];
  const previous = values[values.length - 2];
  const trend = previous !== undefined ? latest - previous : 0;
  const TrendIcon = trend > 0 ? TrendingUp : trend < 0 ? TrendingDown : Minus;
  const trendColor = trend > 0
    ? 'border-emerald-100 bg-emerald-50 text-emerald-600'
    : trend < 0
      ? 'border-rose-100 bg-rose-50 text-rose-600'
      : 'border-slate-100 bg-slate-50 text-slate-500';

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_22px_70px_-44px_rgba(15,23,42,0.55)]">
      <div className={cn('flex flex-wrap items-start justify-between gap-4 border-b border-slate-100 bg-gradient-to-r from-white via-sky-50/55 to-teal-50/60 px-5 py-5 sm:px-6', isArabic && 'flex-row-reverse text-right')}>
        <div>
          <div className={cn('mb-2 flex items-center gap-2', isArabic && 'flex-row-reverse')}>
            <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-white text-primary shadow-sm">
              <BarChart3 className="h-4 w-4" />
            </span>
            <h2 className="text-lg font-bold text-slate-950">{meta.label} {t.metricChart.history}</h2>
          </div>
          <div className={cn('flex flex-wrap items-center gap-2 text-sm text-slate-500', isArabic && 'flex-row-reverse')}>
            <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium">
              {data.length} {t.metricChart.entries}
            </span>
            {previous !== undefined && (
              <span className={cn('flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-semibold', trendColor, isArabic && 'flex-row-reverse')}>
                <TrendIcon className="h-3.5 w-3.5" />
                {Math.abs(trend).toFixed(1)} {meta.unit} {t.metricChart.vsPrev}
              </span>
            )}
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowTable(value => !value)}
          className="h-9 gap-2 rounded-xl border-slate-200 bg-white text-xs font-semibold text-slate-700 shadow-sm hover:border-primary/30 hover:bg-primary/5 hover:text-primary focus-visible:ring-2 focus-visible:ring-primary/30"
        >
          <ListChecks className="h-3.5 w-3.5" />
          {showTable ? t.metricChart.showChart : t.metricChart.showTable}
        </Button>
      </div>

      <div className="p-4 sm:p-6">
        {!showTable ? (
          <div className="rounded-2xl border border-slate-100 bg-slate-50/50 p-2">
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={chartData} margin={{ top: 12, right: 18, left: -6, bottom: 0 }}>
                <CartesianGrid strokeDasharray="4 4" stroke="#e2e8f0" vertical={false} />
                <XAxis dataKey="date" tick={{ fontSize: 12, fill: '#64748b' }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 12, fill: '#64748b' }} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', boxShadow: '0 18px 35px -28px rgba(15, 23, 42, 0.55)', fontSize: '12px' }}
                  formatter={(v) => [`${v} ${meta.unit}`, meta.label]}
                />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke={meta.color}
                  strokeWidth={3}
                  dot={{ r: 4, fill: '#fff', stroke: meta.color, strokeWidth: 2 }}
                  activeDot={{ r: 7, fill: meta.color, stroke: '#fff', strokeWidth: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="max-h-72 overflow-auto rounded-2xl border border-slate-100">
            <table className="w-full text-sm">
              <thead className="bg-slate-50">
                <tr className="border-b border-slate-100 text-xs text-slate-500">
                  <th className={cn('px-4 py-3 font-semibold', isArabic ? 'text-right' : 'text-left')}>{t.metricChart.date}</th>
                  <th className={cn('px-4 py-3 font-semibold', isArabic ? 'text-left' : 'text-right')}>{t.metricChart.value}</th>
                  <th className={cn('px-4 py-3 font-semibold', isArabic ? 'text-right' : 'text-left')}>{t.metricChart.notes}</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {[...data].reverse().map(d => (
                  <tr key={d.id} className="group transition-colors hover:bg-slate-50/80">
                    <td className="px-4 py-3 text-slate-500">{d.recorded_date}</td>
                    <td className="px-4 py-3 text-right font-semibold text-slate-950">
                      {d.value} <span className="text-xs font-normal text-slate-400">{meta.unit}</span>
                    </td>
                    <td className="max-w-[160px] truncate px-4 py-3 text-xs text-slate-500">{d.notes || '-'}</td>
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        onClick={() => onDelete(d.id)}
                        className="rounded-lg p-1.5 text-slate-400 opacity-100 transition-all hover:bg-rose-50 hover:text-destructive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-destructive/25 sm:opacity-0 sm:group-hover:opacity-100"
                        aria-label={t.common?.delete || 'Delete'}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}
