import React, { useState } from 'react';
import { analyzeSymptoms } from '@/lib/med-api';
import { useLanguage } from '@/lib/LanguageContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Stethoscope, Plus, X, Loader2, AlertTriangle, CheckCircle, Info, ChevronRight, ShieldAlert } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const COMMON_SYMPTOMS = [
  'Headache', 'Fever', 'Fatigue', 'Cough', 'Shortness of breath',
  'Chest pain', 'Nausea', 'Vomiting', 'Dizziness', 'Sore throat',
  'Runny nose', 'Body aches', 'Abdominal pain', 'Diarrhea', 'Rash',
  'Joint pain', 'Back pain', 'Swollen lymph nodes', 'Loss of appetite', 'Chills'
];

const urgencyConfig = {
  emergency: { color: 'bg-red-50 border-red-200', badge: 'bg-red-100 text-red-700', icon: ShieldAlert, iconColor: 'text-red-500', label: 'Seek Emergency Care Immediately' },
  urgent: { color: 'bg-orange-50 border-orange-200', badge: 'bg-orange-100 text-orange-700', icon: AlertTriangle, iconColor: 'text-orange-500', label: 'See a Doctor Soon' },
  moderate: { color: 'bg-yellow-50 border-yellow-200', badge: 'bg-yellow-100 text-yellow-700', icon: Info, iconColor: 'text-yellow-600', label: 'Schedule a Doctor Visit' },
  mild: { color: 'bg-green-50 border-green-200', badge: 'bg-green-100 text-green-700', icon: CheckCircle, iconColor: 'text-green-500', label: 'Home Care May Be Sufficient' },
};

export default function SymptomChecker() {
  const { t, lang } = useLanguage();
  const [symptoms, setSymptoms] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const addSymptom = (s) => {
    const trimmed = s.trim();
    if (trimmed && !symptoms.includes(trimmed)) {
      setSymptoms(prev => [...prev, trimmed]);
    }
    setInputValue('');
  };

  const removeSymptom = (s) => setSymptoms(prev => prev.filter(x => x !== s));

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addSymptom(inputValue);
    }
  };

  const analyze = async () => {
    if (symptoms.length === 0) return;
    setLoading(true);
    setResult(null);
    const data = await analyzeSymptoms(symptoms, lang);
    setResult(data);
    setLoading(false);
  };

  const cfg = result ? (urgencyConfig[result.urgency] || urgencyConfig.moderate) : null;
  const UrgencyIcon = cfg?.icon;
  const symptomLabels = t.symptomChecker.symptoms || {};

  const likelihoodColor = { common: 'bg-primary/10 text-primary', possible: 'bg-muted text-muted-foreground', 'less likely': 'bg-muted/50 text-muted-foreground' };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
      {/* Header */}
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
          <Stethoscope className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-serif font-bold">{t.symptomChecker.title}</h1>
          <p className="text-sm text-muted-foreground">{t.symptomChecker.subtitle}</p>
        </div>
      </div>

      {/* Disclaimer banner */}
      <div className="flex gap-2 items-start bg-blue-50 border border-blue-200 rounded-xl p-4 mb-8 text-sm text-blue-800">
        <Info className="w-4 h-4 mt-0.5 shrink-0" />
        <p>{t.symptomChecker.disclaimer}</p>
      </div>

      {/* Symptom input */}
      <div className="bg-card border border-border rounded-2xl p-6 mb-6">
        <h2 className="font-semibold text-lg mb-4">{t.symptomChecker.prompt}</h2>

        {/* Quick select chips */}
        <div className="flex flex-wrap gap-2 mb-4">
          {COMMON_SYMPTOMS.map(s => (
            <button
              key={s}
              onClick={() => addSymptom(s)}
              disabled={symptoms.includes(s)}
              className={`text-xs px-3 py-1.5 rounded-full border transition-all ${
                symptoms.includes(s)
                  ? 'bg-primary/10 border-primary/30 text-primary cursor-default'
                  : 'bg-muted/50 border-border hover:border-primary/50 hover:bg-accent text-muted-foreground hover:text-foreground'
              }`}
            >
              {symptoms.includes(s) ? <span className="flex items-center gap-1"><CheckCircle className="w-3 h-3" />{symptomLabels[s] || s}</span> : (symptomLabels[s] || s)}
            </button>
          ))}
        </div>

        {/* Custom input */}
        <div className="flex gap-2">
          <input
            type="text"
            value={inputValue}
            onChange={e => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={t.symptomChecker.customPlaceholder}
            className="flex-1 h-10 px-4 rounded-xl border border-input bg-muted/30 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
          <Button size="sm" variant="outline" onClick={() => addSymptom(inputValue)} className="gap-1 rounded-xl">
            <Plus className="w-4 h-4" /> {t.common.add}
          </Button>
        </div>

        {/* Selected symptoms */}
        <AnimatePresence>
          {symptoms.length > 0 && (
            <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-border">
              {symptoms.map(s => (
                <Badge key={s} variant="secondary" className="gap-1.5 pl-3 pr-2 py-1 rounded-full text-sm">
                  {symptomLabels[s] || s}
                  <button onClick={() => removeSymptom(s)} className="hover:text-destructive transition-colors">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </Badge>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <Button
        onClick={analyze}
        disabled={symptoms.length === 0 || loading}
        className="w-full h-12 text-base font-semibold rounded-xl gap-2 mb-8"
      >
        {loading ? <><Loader2 className="w-5 h-5 animate-spin" /> {t.symptomChecker.analyzing}</> : <><Stethoscope className="w-5 h-5" /> {t.symptomChecker.analyze}</>}
      </Button>

      {/* Results */}
      <AnimatePresence>
        {result && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
            {/* Urgency card */}
            <div className={`rounded-2xl border p-5 ${cfg.color}`}>
              <div className="flex items-center gap-3 mb-3">
                <UrgencyIcon className={`w-6 h-6 ${cfg.iconColor}`} />
                <div>
                  <span className={`text-xs font-bold uppercase tracking-wide px-2.5 py-1 rounded-full ${cfg.badge}`}>{t.symptomChecker.urgency[result.urgency] || cfg.label}</span>
                </div>
              </div>
              <p className="text-sm font-medium text-foreground">{result.summary}</p>
            </div>

            {/* Recommendation */}
            <div className="bg-card border border-border rounded-2xl p-5">
              <h3 className="font-semibold mb-2 flex items-center gap-2"><ChevronRight className="w-4 h-4 text-primary" />{t.symptomChecker.recommendation}</h3>
              <p className="text-sm text-muted-foreground">{result.recommendation}</p>
            </div>

            {/* Possible causes */}
            {result.possible_causes?.length > 0 && (
              <div className="bg-card border border-border rounded-2xl p-5">
                <h3 className="font-semibold mb-4">{t.symptomChecker.possibleCauses}</h3>
                <div className="space-y-3">
                  {result.possible_causes.map((c, i) => (
                    <div key={i} className="flex items-start gap-3 p-3 bg-muted/30 rounded-xl">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-sm">{c.name}</span>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${likelihoodColor[c.likelihood] || likelihoodColor['possible']}`}>{c.likelihood}</span>
                        </div>
                        <p className="text-xs text-muted-foreground">{c.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Red flags */}
            {result.red_flags?.length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-2xl p-5">
                <h3 className="font-semibold mb-3 flex items-center gap-2 text-red-700"><ShieldAlert className="w-4 h-4" />{t.symptomChecker.redFlags}</h3>
                <ul className="space-y-1.5">
                  {result.red_flags.map((f, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-red-700">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-400 shrink-0" />{f}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Disclaimer */}
            {result.disclaimer && (
              <p className="text-xs text-muted-foreground text-center px-4">{result.disclaimer}</p>
            )}

            <Button variant="outline" className="w-full rounded-xl" onClick={() => { setResult(null); setSymptoms([]); }}>
              {t.common.startOver}
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
