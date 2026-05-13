import React, { useMemo, useState } from 'react';
import { analyzeSymptoms } from '@/lib/med-api';
import { useLanguage } from '@/lib/LanguageContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Stethoscope, Plus, X, Loader2, AlertTriangle, CheckCircle, Info, ShieldAlert, Brain, HeartPulse, ClipboardList, ArrowRight, TimerReset, ActivitySquare } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ErrorState from '@/components/state/ErrorState';
import PageSeo from '@/components/seo/PageSeo';
import { Link } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';

const COMMON_SYMPTOMS = [
  'Headache', 'Fever', 'Fatigue', 'Cough', 'Shortness of breath',
  'Chest pain', 'Nausea', 'Vomiting', 'Dizziness', 'Sore throat',
  'Runny nose', 'Body aches', 'Abdominal pain', 'Diarrhea', 'Rash',
  'Joint pain', 'Back pain', 'Swollen lymph nodes', 'Loss of appetite', 'Chills',
];

const PAGE_COPY = {
  en: {
    introTitle: 'How it works',
    introText: 'Start with symptoms, answer a few follow-up questions, and get a structured summary of what to discuss with a doctor.',
    buildAssessment: 'Start Smart Assessment',
    clarifyTitle: 'Clarifying Questions',
    clarifyText: 'These questions narrow down urgency and the most relevant medical specialties.',
    questionProgress: 'Question',
    finish: 'Finish Assessment',
    chooseOption: 'Choose one option',
    suggestedSummary: 'Suggested Discussion Summary',
    healthAreas: 'Potential health areas to discuss',
    specialties: 'Relevant specialties',
    doctorPoints: 'Points to mention to a doctor',
    urgencyReason: 'Why this urgency level was selected',
    visitWindow: 'Suggested timing',
    nextSteps: 'Suggested next steps',
    resetAssessment: 'Start a New Assessment',
    backToSymptoms: 'Back to symptoms',
    cannotAnalyze: 'Unable to analyze symptoms right now.',
  },
  ar: {
    introTitle: 'كيف يعمل',
    introText: 'ابدأ بالأعراض، ثم أجب عن عدة أسئلة توضيحية، واحصل على ملخص منظم لما ينبغي مناقشته مع الطبيب.',
    buildAssessment: 'ابدأ التقييم الذكي',
    clarifyTitle: 'أسئلة توضيحية',
    clarifyText: 'هذه الأسئلة تساعد على تحديد مستوى الاستعجال وأقرب التخصصات الطبية المناسبة.',
    questionProgress: 'السؤال',
    finish: 'إنهاء التقييم',
    chooseOption: 'اختر إجابة واحدة',
    suggestedSummary: 'ملخص مقترح للمناقشة مع الطبيب',
    healthAreas: 'المجالات الصحية المحتملة للمناقشة',
    specialties: 'التخصصات المناسبة',
    doctorPoints: 'نقاط لذكرها للطبيب',
    urgencyReason: 'سبب اختيار مستوى الاستعجال',
    visitWindow: 'التوقيت المقترح',
    nextSteps: 'الخطوات التالية المقترحة',
    resetAssessment: 'بدء تقييم جديد',
    backToSymptoms: 'العودة إلى الأعراض',
    cannotAnalyze: 'تعذر تحليل الأعراض حاليًا.',
  },
};

const urgencyConfig = {
  emergency: { color: 'bg-red-50 border-red-200', badge: 'bg-red-100 text-red-700', icon: ShieldAlert, iconColor: 'text-red-500' },
  urgent: { color: 'bg-orange-50 border-orange-200', badge: 'bg-orange-100 text-orange-700', icon: AlertTriangle, iconColor: 'text-orange-500' },
  moderate: { color: 'bg-yellow-50 border-yellow-200', badge: 'bg-yellow-100 text-yellow-700', icon: Info, iconColor: 'text-yellow-600' },
  mild: { color: 'bg-green-50 border-green-200', badge: 'bg-green-100 text-green-700', icon: CheckCircle, iconColor: 'text-green-500' },
};

const SUMMARY_ICONS = [HeartPulse, Brain, ActivitySquare];

export default function SymptomChecker() {
  const { t, lang, isRTL } = useLanguage();
  const { isAuthenticated } = useAuth();
  const copy = PAGE_COPY[lang] || PAGE_COPY.en;
  const [symptoms, setSymptoms] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [questionnaire, setQuestionnaire] = useState(null);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const symptomLabels = t.symptomChecker.symptoms || {};
  const activeQuestionIndex = useMemo(
    () => questionnaire?.questions?.findIndex((question) => !answers[question.id]) ?? -1,
    [answers, questionnaire]
  );
  const activeQuestion = activeQuestionIndex >= 0 ? questionnaire.questions[activeQuestionIndex] : null;

  const addSymptom = (symptom) => {
    const trimmed = symptom.trim();
    if (trimmed && !symptoms.includes(trimmed)) {
      setSymptoms((current) => [...current, trimmed]);
    }
    setInputValue('');
  };

  const removeSymptom = (symptom) => setSymptoms((current) => current.filter((item) => item !== symptom));

  const handleKeyDown = (event) => {
    if (event.key === 'Enter' || event.key === ',') {
      event.preventDefault();
      addSymptom(inputValue);
    }
  };

  const beginAssessment = async () => {
    if (symptoms.length === 0) return;

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const response = await analyzeSymptoms({ symptoms, lang });
      setQuestionnaire(response);
      setAnswers({});
    } catch (requestError) {
      setError(requestError.message || copy.cannotAnalyze);
    } finally {
      setLoading(false);
    }
  };

  const resetAssessment = () => {
    setSymptoms([]);
    setInputValue('');
    setQuestionnaire(null);
    setAnswers({});
    setResult(null);
    setError('');
  };

  const chooseAnswer = async (questionId, value) => {
    const nextAnswers = { ...answers, [questionId]: value };
    setAnswers(nextAnswers);

    if (questionnaire && Object.keys(nextAnswers).length === questionnaire.question_count) {
      await completeAssessmentWith(nextAnswers);
    }
  };

  const completeAssessmentWith = async (nextAnswers) => {
    setLoading(true);
    setError('');

    try {
      const response = await analyzeSymptoms({ symptoms, answers: nextAnswers, lang });
      setAnswers(nextAnswers);
      setResult(response);
    } catch (requestError) {
      setError(requestError.message || copy.cannotAnalyze);
    } finally {
      setLoading(false);
    }
  };

  const cfg = result ? (urgencyConfig[result.urgency] || urgencyConfig.moderate) : null;
  const UrgencyIcon = cfg?.icon;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
      <PageSeo page="symptom-checker" />
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
          <Stethoscope className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-serif font-bold">{t.symptomChecker.title}</h1>
          <p className="text-sm text-muted-foreground">{t.symptomChecker.subtitle}</p>
        </div>
      </div>

      <div className="flex gap-2 items-start bg-blue-50 border border-blue-200 rounded-xl p-4 mb-8 text-sm text-blue-800">
        <Info className="w-4 h-4 mt-0.5 shrink-0" />
        <p>{result?.disclaimer || questionnaire?.disclaimer || t.symptomChecker.disclaimer}</p>
      </div>

      {!questionnaire && !result ? (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <div className="bg-card border border-border rounded-2xl p-6">
            <div className="mb-4">
              <h2 className="font-semibold text-lg">{t.symptomChecker.prompt}</h2>
              <p className="text-sm text-muted-foreground mt-1">{copy.introText}</p>
            </div>

            <div className="flex flex-wrap gap-2 mb-4">
              {COMMON_SYMPTOMS.map((symptom) => (
                <button
                  key={symptom}
                  onClick={() => addSymptom(symptom)}
                  disabled={symptoms.includes(symptom)}
                  className={`text-xs px-3 py-1.5 rounded-full border transition-all ${
                    symptoms.includes(symptom)
                      ? 'bg-primary/10 border-primary/30 text-primary cursor-default'
                      : 'bg-muted/50 border-border hover:border-primary/50 hover:bg-accent text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {symptomLabels[symptom] || symptom}
                </button>
              ))}
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={inputValue}
                onChange={(event) => setInputValue(event.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={t.symptomChecker.customPlaceholder}
                className="flex-1 h-10 px-4 rounded-xl border border-input bg-muted/30 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
              <Button size="sm" variant="outline" onClick={() => addSymptom(inputValue)} className="gap-1 rounded-xl">
                <Plus className="w-4 h-4" /> {t.common.add}
              </Button>
            </div>

            <AnimatePresence>
              {symptoms.length > 0 ? (
                <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-border">
                  {symptoms.map((symptom) => (
                    <Badge key={symptom} variant="secondary" className="gap-1.5 pl-3 pr-2 py-1 rounded-full text-sm">
                      {symptomLabels[symptom] || symptom}
                      <button onClick={() => removeSymptom(symptom)} className="hover:text-destructive transition-colors">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </Badge>
                  ))}
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>

          <div className="bg-muted/30 border border-border rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-semibold flex items-center gap-2">
                <ClipboardList className="w-4 h-4 text-primary" />
                {copy.introTitle}
              </h3>
              <p className="text-sm text-muted-foreground mt-1">{copy.introText}</p>
            </div>
            <Button
              onClick={beginAssessment}
              disabled={symptoms.length === 0 || loading}
              className="rounded-xl gap-2 min-w-[220px]"
            >
              {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> {t.symptomChecker.analyzing}</> : <>{copy.buildAssessment} <ArrowRight className={`w-4 h-4 ${isRTL ? 'rotate-180' : ''}`} /></>}
            </Button>
          </div>
        </motion.div>
      ) : null}

      {questionnaire && !result ? (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <div className="bg-card border border-border rounded-2xl p-6">
            <div className="flex items-start justify-between gap-4 mb-5">
              <div>
                <h2 className="text-xl font-semibold">{copy.clarifyTitle}</h2>
                <p className="text-sm text-muted-foreground mt-1">{questionnaire.intro || copy.clarifyText}</p>
              </div>
              <Badge variant="outline" className="rounded-full px-3 py-1">
                {copy.questionProgress} {Math.max(activeQuestionIndex + 1, 1)} / {questionnaire.question_count}
              </Badge>
            </div>

            <div className="flex flex-wrap gap-2 mb-5">
              {symptoms.map((symptom) => (
                <Badge key={symptom} variant="secondary" className="rounded-full">
                  {symptomLabels[symptom] || symptom}
                </Badge>
              ))}
            </div>

            {activeQuestion ? (
              <div className="space-y-4">
                <div className="rounded-2xl bg-muted/30 border border-border p-5">
                  <p className="text-base font-semibold">{activeQuestion.prompt}</p>
                  <p className="text-sm text-muted-foreground mt-1">{activeQuestion.help_text}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {activeQuestion.options.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => chooseAnswer(activeQuestion.id, option.value)}
                      disabled={loading}
                      className="rounded-2xl border border-border bg-card px-4 py-4 text-left transition-all hover:border-primary/40 hover:bg-primary/5 disabled:opacity-60"
                    >
                      <p className="font-medium text-sm">{option.label}</p>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="rounded-2xl border border-border p-5 text-sm text-muted-foreground">
                {copy.chooseOption}
              </div>
            )}
          </div>

          {Object.keys(answers).length > 0 ? (
            <div className="bg-card border border-border rounded-2xl p-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold">{copy.clarifyTitle}</h3>
                <Button variant="ghost" size="sm" className="rounded-xl" onClick={() => { setQuestionnaire(null); setAnswers({}); }}>
                  {copy.backToSymptoms}
                </Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {questionnaire.questions.map((question) => {
                  const selected = question.options.find((option) => option.value === answers[question.id]);

                  return (
                    <div key={question.id} className="rounded-xl bg-muted/30 border border-border p-3">
                      <p className="text-xs uppercase tracking-wide text-muted-foreground mb-1">{question.prompt}</p>
                      <p className="text-sm font-medium">{selected?.label || '...'}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : null}
        </motion.div>
      ) : null}

      <AnimatePresence>
        {result ? (
          <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
            <div className={`rounded-2xl border p-5 ${cfg.color}`}>
              <div className="flex items-center gap-3 mb-3">
                <UrgencyIcon className={`w-6 h-6 ${cfg.iconColor}`} />
                <span className={`text-xs font-bold uppercase tracking-wide px-2.5 py-1 rounded-full ${cfg.badge}`}>
                  {t.symptomChecker.urgency[result.urgency]}
                </span>
              </div>
              <p className="text-sm font-medium text-foreground">{result.summary}</p>
              <p className="text-sm text-foreground/80 mt-2">{result.recommendation}</p>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-[1.2fr_0.8fr] gap-5">
              <div className="space-y-5">
                <div className="bg-card border border-border rounded-2xl p-5">
                  <h3 className="font-semibold mb-2 flex items-center gap-2">
                    <ClipboardList className="w-4 h-4 text-primary" />
                    {copy.suggestedSummary}
                  </h3>
                  <p className="text-sm text-muted-foreground">{result.structured_summary.urgency_reason}</p>
                </div>

                <div className="bg-card border border-border rounded-2xl p-5">
                  <h3 className="font-semibold mb-4">{copy.healthAreas}</h3>
                  <div className="space-y-3">
                    {result.structured_summary.health_areas.map((area, index) => {
                      const Icon = SUMMARY_ICONS[index % SUMMARY_ICONS.length];

                      return (
                        <div key={`${area.title}-${index}`} className="rounded-2xl bg-muted/30 p-4 border border-border/60">
                          <div className="flex items-start gap-3">
                            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                              <Icon className="w-4 h-4 text-primary" />
                            </div>
                            <div>
                              <p className="font-semibold text-sm">{area.title}</p>
                              <p className="text-sm text-muted-foreground mt-1">{area.summary}</p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="bg-card border border-border rounded-2xl p-5">
                  <h3 className="font-semibold mb-3">{copy.doctorPoints}</h3>
                  <ul className="space-y-2">
                    {result.structured_summary.discussion_points.map((point, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" />
                        {point}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="space-y-5">
                <div className="bg-card border border-border rounded-2xl p-5">
                  <h3 className="font-semibold mb-3">{copy.specialties}</h3>
                  <div className="space-y-3">
                    {result.structured_summary.specialties.map((specialty) => (
                      <div key={specialty.slug} className="rounded-xl border border-border bg-muted/30 p-4">
                        <p className="font-semibold text-sm">{specialty.name}</p>
                        <p className="text-sm text-muted-foreground mt-1">{specialty.reason}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-card border border-border rounded-2xl p-5">
                  <h3 className="font-semibold mb-2">{copy.visitWindow}</h3>
                  <p className="text-sm text-muted-foreground">{result.structured_summary.doctor_visit_window}</p>
                  <div className="mt-4 pt-4 border-t border-border">
                    <h4 className="font-semibold text-sm mb-2">{copy.nextSteps}</h4>
                    <ul className="space-y-2">
                      {result.structured_summary.suggested_next_steps.map((step, index) => (
                        <li key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
                          <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" />
                          {step}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="bg-red-50 border border-red-200 rounded-2xl p-5">
                  <h3 className="font-semibold mb-3 flex items-center gap-2 text-red-700">
                    <ShieldAlert className="w-4 h-4" />
                    {t.symptomChecker.redFlags}
                  </h3>
                  <ul className="space-y-1.5">
                    {result.red_flags.map((flag, index) => (
                      <li key={index} className="flex items-center gap-2 text-sm text-red-700">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-400 shrink-0" />
                        {flag}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            <Button variant="outline" className="w-full rounded-xl gap-2" onClick={resetAssessment}>
              <TimerReset className="w-4 h-4" />
              {copy.resetAssessment}
            </Button>
            {isAuthenticated ? (
              <Link to="/health-insights" className="block">
                <Button variant="ghost" className="w-full rounded-xl">
                  {t.healthInsights.viewCorrelations}
                </Button>
              </Link>
            ) : null}
          </motion.div>
        ) : null}
      </AnimatePresence>

      {error ? (
        <div className="mt-4">
          <ErrorState title={copy.cannotAnalyze} description={error} />
        </div>
      ) : null}
    </div>
  );
}
