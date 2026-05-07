import React, { useState } from 'react';
import { createHealthMetric } from '@/lib/med-api';
import { useLanguage } from '@/lib/LanguageContext';
import { Button } from '@/components/ui/button';
import { X, Loader2 } from 'lucide-react';

const METRIC_OPTIONS = [
  { value: 'weight', label: 'Weight', unit: 'kg', placeholder: '70' },
  { value: 'blood_pressure_systolic', label: 'Blood Pressure (Systolic)', unit: 'mmHg', placeholder: '120' },
  { value: 'blood_pressure_diastolic', label: 'Blood Pressure (Diastolic)', unit: 'mmHg', placeholder: '80' },
  { value: 'heart_rate', label: 'Heart Rate', unit: 'bpm', placeholder: '72' },
  { value: 'blood_glucose', label: 'Blood Glucose', unit: 'mg/dL', placeholder: '100' },
  { value: 'sleep_hours', label: 'Sleep Duration', unit: 'hours', placeholder: '7.5' },
  { value: 'steps', label: 'Daily Steps', unit: 'steps', placeholder: '8000' },
  { value: 'water_intake', label: 'Water Intake', unit: 'L', placeholder: '2' },
  { value: 'temperature', label: 'Body Temperature', unit: '°C', placeholder: '36.6' },
  { value: 'oxygen_saturation', label: 'O₂ Saturation', unit: '%', placeholder: '98' },
];

export default function AddMetricModal({ onClose, onSaved }) {
  const { t } = useLanguage();
  const [metricType, setMetricType] = useState('weight');
  const [value, setValue] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const selected = METRIC_OPTIONS.find(o => o.value === metricType);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!value || !date) return;
    setLoading(true);
    await createHealthMetric({
      metric_type: metricType,
      value: parseFloat(value),
      unit: selected?.unit || '',
      recorded_date: date,
      notes: notes || undefined,
    });
    onSaved();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-md p-6 relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground">
          <X className="w-5 h-5" />
        </button>
        <h2 className="text-xl font-bold mb-5">{t.dashboard.logMetric}</h2>
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-1.5 block">{t.dashboard.metricType}</label>
            <select
              value={metricType}
              onChange={e => setMetricType(e.target.value)}
              className="w-full h-10 px-3 rounded-xl border border-input bg-muted/30 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            >
              {METRIC_OPTIONS.map(o => (
                <option key={o.value} value={o.value}>{t.dashboard.metrics[o.value] || o.label} ({o.unit})</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm font-medium mb-1.5 block">{t.dashboard.value} <span className="text-muted-foreground">({selected?.unit})</span></label>
            <input
              type="number"
              step="any"
              value={value}
              onChange={e => setValue(e.target.value)}
              placeholder={selected?.placeholder}
              required
              className="w-full h-10 px-3 rounded-xl border border-input bg-muted/30 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-1.5 block">{t.dashboard.date}</label>
            <input
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
              required
              className="w-full h-10 px-3 rounded-xl border border-input bg-muted/30 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-1.5 block">{t.dashboard.notes} <span className="text-muted-foreground font-normal">({t.dashboard.optional})</span></label>
            <input
              type="text"
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder={t.dashboard.notesPlaceholder}
              className="w-full h-10 px-3 rounded-xl border border-input bg-muted/30 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1 rounded-xl">{t.common.cancel}</Button>
            <Button type="submit" disabled={loading} className="flex-1 rounded-xl gap-2">
              {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> {t.dashboard.saving}</> : t.dashboard.saveMetric}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
