import React, { useEffect, useRef, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { AnimatePresence, motion } from 'framer-motion';
import {
  AlertTriangle,
  Bot,
  ChevronDown,
  ChevronLeft,
  Clock3,
  ExternalLink,
  HeartPulse,
  Loader2,
  Mail,
  Phone,
  RotateCcw,
  Send,
  ShieldAlert,
  Sparkles,
  Stethoscope,
  ThumbsDown,
  ThumbsUp,
  User,
  X,
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { useLanguage } from '@/lib/LanguageContext';
import { useIsMobile } from '@/hooks/use-mobile';
import { createMedicalAssistantResponse, submitMedicalAssistantFeedback } from '@/lib/medical-assistant-api';

const MIN_THINKING_MS = 5000;

const CONTENT = {
  en: {
    name: 'MedBot AI Assistant',
    statusOnline: 'Online · Medical API',
    statusOffline: 'Offline · Medical API unavailable',
    welcome: "Hello. I'm MedBot, the medical assistant on MedBlog.\n\nI explain symptoms, common conditions, medications, and when to seek care using the approved medical knowledge base.\n\nImportant: I provide general health information only. I do not replace a licensed clinician, and I do not diagnose or prescribe.",
    quickLabel: 'Quick questions',
    quickPrompts: [
      'What are symptoms of hypertension?',
      'How can I improve sleep quality?',
      'Difference between Type 1 and Type 2 diabetes?',
      'When should I seek care for chest pain?',
    ],
    placeholder: 'Ask a medical question...',
    disclaimer: 'General information only · Not a substitute for a licensed clinician',
    reset: 'Reset chat',
    contactTitle: 'Contact a Doctor',
    contactSubtitle: 'Prefer a human medical professional?',
    contactBtn: 'Contact doctor',
    phoneLabel: 'Emergency Hotline',
    emailLabel: 'Book Appointment',
    backToChat: 'Back to chat',
    sourceLabel: 'Source details',
    intakeLabel: 'Symptom intake',
    intakeSubtitle: 'Optional. Adds clinical context before you ask.',
    askWithIntake: 'Use symptom intake',
    ageGroup: 'Age group',
    duration: 'Duration',
    severity: 'Severity',
    fever: 'Fever',
    pregnancy: 'Pregnancy',
    chronicConditions: 'Chronic conditions',
    none: 'Not specified',
    followUp: 'Suggested follow-up',
    action: 'Recommended action',
    why: 'Why this was selected',
    feedbackSaved: 'Feedback saved.',
    sourceFreshness: 'Review status',
    sourceReviewedBy: 'Reviewer',
    unavailable: 'The medical assistant is temporarily unavailable. Please try again shortly.',
    ageGroupOptions: ['Adult', 'Child', 'Older adult'],
    durationOptions: ['Less than 24 hours', '1 to 3 days', 'More than 3 days'],
    severityOptions: ['Mild', 'Moderate', 'Severe'],
    binaryOptions: ['No', 'Yes'],
  },
  ar: {
    name: 'مساعد ميدبوت الذكي',
    statusOnline: 'متصل · واجهة طبية',
    statusOffline: 'غير متصل · الواجهة الطبية غير متاحة',
    welcome: 'مرحبًا. أنا ميدبوت، المساعد الطبي في MedBlog.\n\nأشرح الأعراض والحالات الشائعة والأدوية ومتى يجب طلب الرعاية بالاعتماد على قاعدة المعرفة الطبية المعتمدة.\n\nمهم: أقدم معلومات صحية عامة فقط. لا أستبدل الطبيب المرخّص، ولا أقدّم تشخيصًا أو وصفًا دوائيًا.',
    quickLabel: 'أسئلة سريعة',
    quickPrompts: [
      'ما هي أعراض ارتفاع ضغط الدم؟',
      'كيف أحسن جودة النوم؟',
      'ما الفرق بين السكري النوع الأول والثاني؟',
      'متى يجب طلب الرعاية بسبب ألم الصدر؟',
    ],
    placeholder: 'اطرح سؤالاً طبياً...',
    disclaimer: 'معلومات عامة فقط · لا تغني عن مراجعة مختص مرخّص',
    reset: 'إعادة المحادثة',
    contactTitle: 'تواصل مع طبيب',
    contactSubtitle: 'هل تفضل التحدث مع متخصص بشري؟',
    contactBtn: 'التواصل مع طبيب',
    phoneLabel: 'خط الطوارئ',
    emailLabel: 'حجز موعد',
    backToChat: 'العودة للمحادثة',
    sourceLabel: 'تفاصيل المصدر',
    intakeLabel: 'نموذج الأعراض',
    intakeSubtitle: 'اختياري. يضيف سياقًا سريريًا قبل السؤال.',
    askWithIntake: 'استخدم نموذج الأعراض',
    ageGroup: 'الفئة العمرية',
    duration: 'المدة',
    severity: 'الشدة',
    fever: 'الحرارة',
    pregnancy: 'الحمل',
    chronicConditions: 'أمراض مزمنة',
    none: 'غير محدد',
    followUp: 'سؤال متابعة مقترح',
    action: 'الإجراء الموصى به',
    why: 'سبب اختيار المصدر',
    feedbackSaved: 'تم حفظ التقييم.',
    sourceFreshness: 'حالة المراجعة',
    sourceReviewedBy: 'المراجع',
    unavailable: 'المساعد الطبي غير متاح مؤقتًا. حاول مرة أخرى بعد قليل.',
    ageGroupOptions: ['بالغ', 'طفل', 'كبير سن'],
    durationOptions: ['أقل من 24 ساعة', 'من يوم إلى 3 أيام', 'أكثر من 3 أيام'],
    severityOptions: ['خفيفة', 'متوسطة', 'شديدة'],
    binaryOptions: ['لا', 'نعم'],
  },
};

const INITIAL_INTAKE = {
  ageGroup: '',
  duration: '',
  severity: '',
  fever: '',
  pregnancy: '',
  chronicConditions: '',
};

const URGENCY_META = {
  emergency: {
    icon: ShieldAlert,
    tone: 'border-red-200 bg-red-50 text-red-900 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-100',
  },
  urgent: {
    icon: AlertTriangle,
    tone: 'border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-100',
  },
  routine: {
    icon: Clock3,
    tone: 'border-blue-200 bg-blue-50 text-blue-900 dark:border-blue-900/60 dark:bg-blue-950/30 dark:text-blue-100',
  },
  medication_caution: {
    icon: HeartPulse,
    tone: 'border-violet-200 bg-violet-50 text-violet-900 dark:border-violet-900/60 dark:bg-violet-950/30 dark:text-violet-100',
  },
  insufficient_evidence: {
    icon: AlertTriangle,
    tone: 'border-slate-200 bg-slate-50 text-slate-900 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100',
  },
  refused: {
    icon: ShieldAlert,
    tone: 'border-red-200 bg-red-50 text-red-900 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-100',
  },
  unsupported: {
    icon: AlertTriangle,
    tone: 'border-slate-200 bg-slate-50 text-slate-900 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100',
  },
  info_only: {
    icon: HeartPulse,
    tone: 'border-emerald-200 bg-emerald-50 text-emerald-900 dark:border-emerald-900/60 dark:bg-emerald-950/30 dark:text-emerald-100',
  },
};

function AssessmentBanner({ assessment, copy, isRTL }) {
  if (!assessment) return null;

  const meta = URGENCY_META[assessment.urgency] || URGENCY_META.info_only;
  const Icon = meta.icon;

  return (
    <div className={`rounded-2xl border px-3 py-2 ${meta.tone}`}>
      <div className={`flex items-start gap-2 ${isRTL ? 'flex-row-reverse text-right' : 'text-left'}`}>
        <Icon className="mt-0.5 h-4 w-4 shrink-0" />
        <div className="space-y-1">
          <p className="text-xs font-semibold">{copy.action}</p>
          <p className="text-xs leading-relaxed">{assessment.recommendedAction}</p>
          {assessment.followUpQuestion ? (
            <div className="rounded-xl bg-white/60 px-2.5 py-2 text-[11px] dark:bg-black/20">
              <p className="mb-1 font-semibold">{copy.followUp}</p>
              <p>{assessment.followUpQuestion}</p>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function CitationDetails({ citations, copy, isRTL }) {
  const [openId, setOpenId] = useState('');

  if (!Array.isArray(citations) || citations.length === 0) return null;

  return (
    <div className={`flex flex-col gap-2 ${isRTL ? 'items-end' : 'items-start'}`}>
      {citations.slice(0, 3).map((citation) => {
        const open = openId === citation.id;
        return (
          <div key={citation.id} className="w-full max-w-full rounded-2xl border border-border/80 bg-muted/40">
            <button
              type="button"
              onClick={() => setOpenId(open ? '' : citation.id)}
              className={`flex w-full items-center justify-between gap-3 px-3 py-2 text-left text-xs ${isRTL ? 'text-right' : ''}`}
            >
              <div className="min-w-0">
                <p className="truncate font-semibold text-foreground">{citation.title}</p>
                <p className="truncate text-muted-foreground">{citation.organization}</p>
              </div>
              <ChevronDown className={`h-4 w-4 shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
            </button>

            {open ? (
              <div className="space-y-2 border-t border-border/70 px-3 py-3 text-[11px] text-muted-foreground">
                <div className="flex flex-wrap gap-2">
                  <span className="rounded-full bg-primary/10 px-2 py-1 font-medium text-primary">{citation.evidenceLevel}</span>
                  <span className="rounded-full bg-secondary/10 px-2 py-1 font-medium text-secondary">{citation.freshnessLabel}</span>
                  <span className="rounded-full bg-muted px-2 py-1 font-medium text-foreground">{citation.reviewStatus}</span>
                </div>
                <p><span className="font-semibold text-foreground">{copy.why}:</span> {citation.reasonSelected}</p>
                {citation.reviewOwner ? (
                  <p><span className="font-semibold text-foreground">{copy.sourceReviewedBy}:</span> {citation.reviewOwner}</p>
                ) : null}
                <p><span className="font-semibold text-foreground">{copy.sourceFreshness}:</span> {citation.reviewedAt || citation.sourcePublishedAt || copy.none}</p>
                {citation.url ? (
                  <a
                    href={citation.url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 font-medium text-primary"
                  >
                    <ExternalLink className="h-3 w-3" />
                    {copy.sourceLabel}
                  </a>
                ) : null}
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}

function FeedbackControls({ responseId, feedback, onRate, pending, lang, isRTL }) {
  if (!responseId) return null;

  return (
    <div className={`flex items-center gap-2 ${isRTL ? 'justify-end' : ''}`}>
      <button
        type="button"
        onClick={() => onRate(responseId, 'up')}
        disabled={pending || feedback === 'up'}
        className={`flex h-7 w-7 items-center justify-center rounded-lg border transition-colors ${
          feedback === 'up' ? 'border-emerald-300 bg-emerald-100 text-emerald-700 dark:border-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-200' : 'border-border bg-background text-muted-foreground hover:text-foreground'
        }`}
        title={lang === 'ar' ? 'مفيد' : 'Helpful'}
      >
        <ThumbsUp className="h-3.5 w-3.5" />
      </button>
      <button
        type="button"
        onClick={() => onRate(responseId, 'down')}
        disabled={pending || feedback === 'down'}
        className={`flex h-7 w-7 items-center justify-center rounded-lg border transition-colors ${
          feedback === 'down' ? 'border-red-300 bg-red-100 text-red-700 dark:border-red-700 dark:bg-red-900/40 dark:text-red-200' : 'border-border bg-background text-muted-foreground hover:text-foreground'
        }`}
        title={lang === 'ar' ? 'غير مفيد' : 'Not helpful'}
      >
        <ThumbsDown className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

function MessageBubble({ msg, copy, lang, isRTL, onRateFeedback, feedbackState, feedbackPending }) {
  const isUser = msg.role === 'user';
  const feedback = msg.responseId ? feedbackState[msg.responseId] : '';

  return (
    <div className={`flex gap-2.5 ${isUser ? 'flex-row-reverse' : ''}`}>
      <div
        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
          isUser
            ? 'bg-primary text-primary-foreground'
            : 'bg-gradient-to-br from-primary/20 to-secondary/20 text-primary dark:from-primary/35 dark:to-secondary/35'
        }`}
      >
        {isUser ? <User className="h-3.5 w-3.5" /> : <Bot className="h-3.5 w-3.5" />}
      </div>

      <div className={`flex max-w-[84%] flex-col gap-2 ${isUser && isRTL ? 'items-start' : isUser ? 'items-end' : isRTL ? 'items-end' : 'items-start'}`}>
        {!isUser ? <AssessmentBanner assessment={msg.assessment} copy={copy} isRTL={isRTL} /> : null}

        <div
          className={`rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed shadow-sm ${
            isUser
              ? 'rounded-tr-sm bg-primary text-primary-foreground'
              : 'rounded-tl-sm border border-border bg-card text-card-foreground'
          }`}
        >
          <div className={`mb-1 text-[10px] font-bold uppercase tracking-[0.16em] ${isUser ? 'text-primary-foreground/80' : 'text-muted-foreground'}`}>
            {isUser ? (lang === 'ar' ? 'أنت' : 'You') : copy.name}
          </div>

          {isUser ? (
            <p>{msg.text}</p>
          ) : (
            <div className="prose prose-sm max-w-none dark:prose-invert [&>*:first-child]:mt-0 [&>*:last-child]:mb-0">
              <ReactMarkdown
                components={{
                  p: ({ children }) => <p className="my-1 leading-relaxed">{children}</p>,
                  ul: ({ children }) => <ul className="my-1 ms-4 list-disc space-y-0.5">{children}</ul>,
                  li: ({ children }) => <li className="my-0">{children}</li>,
                  strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
                }}
              >
                {msg.text}
              </ReactMarkdown>
            </div>
          )}
        </div>

        {!isUser ? <CitationDetails citations={msg.citations} copy={copy} isRTL={isRTL} /> : null}
        {!isUser ? (
          <FeedbackControls
            responseId={msg.responseId}
            feedback={feedback}
            pending={feedbackPending}
            onRate={onRateFeedback}
            lang={lang}
            isRTL={isRTL}
          />
        ) : null}
      </div>
    </div>
  );
}

function LoadingBubble() {
  return (
    <div className="flex gap-2.5">
      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 text-primary dark:from-primary/35 dark:to-secondary/35">
        <Bot className="h-3.5 w-3.5" />
      </div>
      <div className="flex items-center gap-1.5 rounded-2xl rounded-tl-sm border border-border bg-card px-4 py-3">
        <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground/40 [animation-delay:0ms]" />
        <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground/40 [animation-delay:150ms]" />
        <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground/40 [animation-delay:300ms]" />
      </div>
    </div>
  );
}

function IntakePanel({ open, setOpen, intake, setIntake, copy, isRTL, lang }) {
  const setField = (key, value) => setIntake((current) => ({ ...current, [key]: value }));
  const activeCount = Object.values(intake).filter(Boolean).length;

  return (
    <div className="shrink-0 px-4 pb-2">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className={`mb-2 flex w-full items-center justify-between rounded-2xl border border-border/70 bg-card px-3 py-3 text-left shadow-sm ${isRTL ? 'text-right' : ''}`}
      >
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-xs font-semibold text-foreground">{copy.intakeLabel}</p>
            {activeCount > 0 ? (
              <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
                {activeCount}
              </span>
            ) : null}
          </div>
          <p className="truncate text-[11px] text-muted-foreground">
            {activeCount > 0
              ? (lang === 'ar' ? 'تمت إضافة معلومات سريرية إضافية.' : 'Additional clinical context added.')
              : copy.intakeSubtitle}
          </p>
        </div>
        <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open ? (
        <div className="grid grid-cols-2 gap-2 rounded-2xl border border-border/70 bg-card p-3 shadow-sm">
          <label className="space-y-1 text-[11px] text-muted-foreground">
            <span>{copy.ageGroup}</span>
            <select
              value={intake.ageGroup}
              onChange={(event) => setField('ageGroup', event.target.value)}
              className="h-10 w-full rounded-xl border border-border bg-background px-3 text-xs text-foreground outline-none transition-colors focus:border-primary"
            >
              <option value="">{copy.none}</option>
              {copy.ageGroupOptions.map((option) => <option key={option} value={option}>{option}</option>)}
            </select>
          </label>

          <label className="space-y-1 text-[11px] text-muted-foreground">
            <span>{copy.duration}</span>
            <select
              value={intake.duration}
              onChange={(event) => setField('duration', event.target.value)}
              className="h-10 w-full rounded-xl border border-border bg-background px-3 text-xs text-foreground outline-none transition-colors focus:border-primary"
            >
              <option value="">{copy.none}</option>
              {copy.durationOptions.map((option) => <option key={option} value={option}>{option}</option>)}
            </select>
          </label>

          <label className="space-y-1 text-[11px] text-muted-foreground">
            <span>{copy.severity}</span>
            <select
              value={intake.severity}
              onChange={(event) => setField('severity', event.target.value)}
              className="h-10 w-full rounded-xl border border-border bg-background px-3 text-xs text-foreground outline-none transition-colors focus:border-primary"
            >
              <option value="">{copy.none}</option>
              {copy.severityOptions.map((option) => <option key={option} value={option}>{option}</option>)}
            </select>
          </label>

          <label className="space-y-1 text-[11px] text-muted-foreground">
            <span>{copy.fever}</span>
            <select
              value={intake.fever}
              onChange={(event) => setField('fever', event.target.value === copy.binaryOptions[1] ? 'yes' : event.target.value === copy.binaryOptions[0] ? 'no' : '')}
              className="h-10 w-full rounded-xl border border-border bg-background px-3 text-xs text-foreground outline-none transition-colors focus:border-primary"
            >
              <option value="">{copy.none}</option>
              {copy.binaryOptions.map((option) => <option key={option} value={option}>{option}</option>)}
            </select>
          </label>

          <label className="space-y-1 text-[11px] text-muted-foreground">
            <span>{copy.pregnancy}</span>
            <select
              value={intake.pregnancy}
              onChange={(event) => setField('pregnancy', event.target.value === copy.binaryOptions[1] ? 'yes' : event.target.value === copy.binaryOptions[0] ? 'no' : '')}
              className="h-10 w-full rounded-xl border border-border bg-background px-3 text-xs text-foreground outline-none transition-colors focus:border-primary"
            >
              <option value="">{copy.none}</option>
              {copy.binaryOptions.map((option) => <option key={option} value={option}>{option}</option>)}
            </select>
          </label>

          <label className="col-span-2 space-y-1 text-[11px] text-muted-foreground">
            <span>{copy.chronicConditions}</span>
            <input
              value={intake.chronicConditions}
              onChange={(event) => setField('chronicConditions', event.target.value)}
              className="h-10 w-full rounded-xl border border-border bg-background px-3 text-xs text-foreground outline-none transition-colors focus:border-primary"
              placeholder={lang === 'ar' ? 'مثال: سكري، ربو' : 'Example: diabetes, asthma'}
            />
          </label>
        </div>
      ) : null}
    </div>
  );
}

export default function MedicalAssistant() {
  const { lang, isRTL } = useLanguage();
  const isMobile = useIsMobile();
  const copy = CONTENT[lang] || CONTENT.en;
  const welcomeMessage = { id: 'intro', role: 'assistant', text: copy.welcome, citations: [], assessment: null };

  const [open, setOpen] = useState(false);
  const [view, setView] = useState('chat');
  const [messages, setMessages] = useState([welcomeMessage]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [assistantOnline, setAssistantOnline] = useState(true);
  const [error, setError] = useState('');
  const [unread, setUnread] = useState(0);
  const [intakeOpen, setIntakeOpen] = useState(false);
  const [intake, setIntake] = useState(INITIAL_INTAKE);
  const [feedbackState, setFeedbackState] = useState({});
  const bottomRef = useRef(null);
  const inputRef = useRef(null);
  const openRef = useRef(open);

  const feedbackMutation = useMutation({
    mutationFn: submitMedicalAssistantFeedback,
    onSuccess: (_, variables) => {
      setFeedbackState((current) => ({ ...current, [variables.responseId]: variables.rating }));
    },
  });

  useEffect(() => {
    openRef.current = open;
  }, [open]);

  useEffect(() => {
    setMessages([welcomeMessage]);
    setView('chat');
    setError('');
    setFeedbackState({});
    setIntake(INITIAL_INTAKE);
  }, [lang]);

  useEffect(() => {
    if (open) {
      setUnread(0);
      window.setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [open]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading, view]);

  const resetChat = () => {
    setMessages([welcomeMessage]);
    setView('chat');
    setInput('');
    setError('');
    setIntake(INITIAL_INTAKE);
    setFeedbackState({});
  };

  const rateFeedback = (responseId, rating) => {
    feedbackMutation.mutate({ responseId, rating, comment: '' });
  };

  const sendMessage = async (rawText) => {
    const userText = (rawText || input).trim();
    if (!userText || loading) return;

    const activeIntake = Object.values(intake).some(Boolean) ? intake : null;
    const userMessage = { id: `user-${Date.now()}`, role: 'user', text: userText };
    const nextMessages = [...messages, userMessage];
    const assistantId = `assistant-${Date.now()}`;
    const history = nextMessages
      .filter((message) => message.role === 'assistant' || message.role === 'user')
      .slice(-8)
      .map((message) => ({
        role: message.role,
        content: message.text,
      }));

    setMessages(nextMessages);
    setInput('');
    setLoading(true);
    setError('');

    try {
      const startedAt = Date.now();
      let bufferedText = '';
      let finalPayload = {
        responseId: '',
        citations: [],
        assessment: null,
        answer: '',
      };
      let revealed = false;

      const reveal = () => {
        if (revealed) return;
        revealed = true;
        setMessages((current) => [...current, {
          id: assistantId,
          role: 'assistant',
          text: bufferedText,
          citations: finalPayload.citations,
          assessment: finalPayload.assessment,
          responseId: finalPayload.responseId,
        }]);
      };

      const revealAfterDelay = async () => {
        const elapsed = Date.now() - startedAt;
        const remaining = Math.max(0, MIN_THINKING_MS - elapsed);
        if (remaining > 0) {
          await new Promise((resolve) => setTimeout(resolve, remaining));
        }
        reveal();
      };

      const minimumDelayPromise = revealAfterDelay();
      const data = await createMedicalAssistantResponse({
        lang,
        message: userText,
        history,
        intake: activeIntake,
      });
      setAssistantOnline(true);
      bufferedText = data.answer || '';
      finalPayload = {
        responseId: data.responseId || '',
        citations: Array.isArray(data.sources) ? data.sources : (Array.isArray(data.citations) ? data.citations : []),
        assessment: data.assessment || null,
        answer: data.answer || '',
      };

      await minimumDelayPromise;
      setMessages((current) => current.map((message) => (
        message.id === assistantId
          ? {
              ...message,
              text: bufferedText || finalPayload.answer,
              citations: finalPayload.citations,
              assessment: finalPayload.assessment,
              responseId: finalPayload.responseId,
            }
          : message
      )));
      setIntake(INITIAL_INTAKE);
      setIntakeOpen(false);
    } catch (requestError) {
      const message = requestError instanceof Error ? requestError.message : copy.unavailable;
      setAssistantOnline(false);
      setError(message);
      setMessages((current) => [...current, { id: assistantId, role: 'assistant', text: message, citations: [], assessment: null }]);
    } finally {
      setLoading(false);
      if (!openRef.current) {
        setUnread((count) => count + 1);
      }
    }
  };

  return (
    <>
      <AnimatePresence>
        {!open ? (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            onClick={() => setOpen(true)}
            data-tour="medical-assistant"
            className={`fixed bottom-24 z-50 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-secondary text-white shadow-2xl shadow-primary/30 transition-transform duration-200 hover:scale-110 md:bottom-6 ${isRTL ? 'left-4 md:left-6' : 'right-4 md:right-6'}`}
          >
            <Stethoscope className="relative z-10 h-6 w-6" />
            <span className="absolute inset-0 animate-ping rounded-2xl bg-primary/40" />
            {unread > 0 ? (
              <span className="absolute -right-1 -top-1 z-20 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
                {unread}
              </span>
            ) : null}
          </motion.button>
        ) : null}
      </AnimatePresence>

      <AnimatePresence>
        {open ? (
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.95 }}
            transition={{ type: 'spring', damping: 26, stiffness: 320 }}
            dir={isRTL ? 'rtl' : 'ltr'}
            className={`fixed bottom-24 z-50 flex h-[640px] w-[420px] max-w-[calc(100vw-1.5rem)] flex-col overflow-hidden rounded-3xl border border-border/80 bg-background shadow-2xl shadow-black/25 md:bottom-6 ${isRTL ? 'left-3 md:left-6' : 'right-3 md:right-6'}`}
          >
            <div className="flex shrink-0 items-center gap-3 bg-gradient-to-r from-primary via-primary/90 to-secondary px-4 py-3.5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15 backdrop-blur-sm">
                <Bot className="h-5 w-5 text-white" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <p className="truncate text-sm font-bold text-white">{copy.name}</p>
                  <Sparkles className="h-3.5 w-3.5 shrink-0 text-yellow-300" />
                </div>
                <div className="mt-0.5 flex items-center gap-1.5">
                  <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${assistantOnline ? 'animate-pulse bg-emerald-400' : 'bg-amber-300'}`} />
                  <p className="text-xs text-white/75">{assistantOnline ? copy.statusOnline : copy.statusOffline}</p>
                </div>
              </div>

              <button
                onClick={() => setView((current) => current === 'contact' ? 'chat' : 'contact')}
                title={copy.contactBtn}
                className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/15 transition-colors hover:bg-white/25"
              >
                <Phone className="h-3.5 w-3.5 text-white" />
              </button>
              <button
                onClick={resetChat}
                title={copy.reset}
                className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/15 transition-colors hover:bg-white/25"
              >
                <RotateCcw className="h-3.5 w-3.5 text-white" />
              </button>
              <button
                onClick={() => setOpen(false)}
                className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/15 transition-colors hover:bg-white/25"
              >
                {isMobile ? <X className="h-4 w-4 text-white" /> : <ChevronDown className="h-4 w-4 text-white" />}
              </button>
            </div>

            <AnimatePresence mode="wait">
              {view === 'contact' ? (
                <motion.div
                  key="contact"
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 30 }}
                  className="flex flex-1 flex-col items-center justify-center gap-5 bg-background p-6 text-center"
                >
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 to-secondary/20">
                    <Phone className="h-8 w-8 text-primary" />
                  </div>
                  <div>
                    <h3 className="mb-1 text-lg font-bold text-foreground">{copy.contactTitle}</h3>
                    <p className="text-sm text-muted-foreground">{copy.contactSubtitle}</p>
                  </div>

                  <div className="w-full space-y-3">
                    <a
                      href="tel:+18006332564"
                      className="flex w-full items-center gap-3 rounded-2xl bg-primary/10 px-4 py-3.5 text-primary transition-colors hover:bg-primary/20 dark:bg-primary/20 dark:hover:bg-primary/30"
                    >
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary">
                        <Phone className="h-4 w-4 text-white" />
                      </div>
                      <div className={isRTL ? 'text-right' : 'text-left'}>
                        <p className="text-xs text-muted-foreground">{copy.phoneLabel}</p>
                        <p className="text-sm font-bold">+1-800-MED-BLOG</p>
                      </div>
                    </a>

                    <a
                      href="mailto:doctors@medblog.com"
                      className="flex w-full items-center gap-3 rounded-2xl bg-secondary/10 px-4 py-3.5 text-secondary transition-colors hover:bg-secondary/20 dark:bg-secondary/20 dark:hover:bg-secondary/30"
                    >
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-secondary">
                        <Mail className="h-4 w-4 text-white" />
                      </div>
                      <div className={isRTL ? 'text-right' : 'text-left'}>
                        <p className="text-xs text-muted-foreground">{copy.emailLabel}</p>
                        <p className="text-sm font-bold">doctors@medblog.com</p>
                      </div>
                    </a>
                  </div>

                  <button
                    onClick={() => setView('chat')}
                    className="flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    <ChevronLeft className={`h-4 w-4 ${isRTL ? 'rotate-180' : ''}`} />
                    {copy.backToChat}
                  </button>
                </motion.div>
              ) : (
                <motion.div
                  key="chat"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-1 flex-col overflow-hidden bg-background"
                >
                  <div className="flex-1 overflow-y-auto p-4">
                    <div className="space-y-4">
                      {messages.map((message) => (
                        <MessageBubble
                          key={message.id}
                          msg={message}
                          copy={copy}
                          lang={lang}
                          isRTL={isRTL}
                          onRateFeedback={rateFeedback}
                          feedbackState={feedbackState}
                          feedbackPending={feedbackMutation.isPending}
                        />
                      ))}

                      {loading ? <LoadingBubble /> : null}
                      <div ref={bottomRef} />
                    </div>
                  </div>

                  {messages.length === 1 ? (
                    <>
                      <IntakePanel
                        open={intakeOpen}
                        setOpen={setIntakeOpen}
                        intake={intake}
                        setIntake={setIntake}
                        copy={copy}
                        isRTL={isRTL}
                        lang={lang}
                      />
                      <div className="shrink-0 px-4 pb-2">
                        <p className="mb-2 text-xs font-medium text-muted-foreground">{copy.quickLabel}</p>
                        <div className="flex flex-col gap-1.5">
                          {copy.quickPrompts.map((prompt) => (
                            <button
                              key={prompt}
                              onClick={() => sendMessage(prompt)}
                              className="rounded-2xl border border-border bg-card px-3 py-3 text-left text-sm text-foreground shadow-sm transition-colors hover:border-primary/30 hover:bg-primary/5"
                              disabled={loading}
                            >
                              {prompt}
                            </button>
                          ))}
                        </div>
                      </div>
                    </>
                  ) : null}

                  <div className="shrink-0 border-t border-border/50 bg-background px-3 pb-3 pt-2">
                    <div className="rounded-2xl border border-border/70 bg-card px-3 py-2.5 shadow-sm transition-all focus-within:border-primary/30 focus-within:ring-2 focus-within:ring-primary/20">
                      <div className="flex items-end gap-2">
                        <textarea
                          ref={inputRef}
                          value={input}
                          onChange={(event) => setInput(event.target.value)}
                          onKeyDown={async (event) => {
                            if (event.key === 'Enter' && !event.shiftKey) {
                              event.preventDefault();
                              await sendMessage();
                            }
                          }}
                          placeholder={copy.placeholder}
                          rows={1}
                          className="max-h-24 min-h-[22px] flex-1 resize-none bg-transparent text-sm leading-relaxed text-foreground outline-none placeholder:text-muted-foreground/60"
                          disabled={loading}
                        />
                        <button
                          onClick={() => sendMessage()}
                          disabled={!input.trim() || loading}
                          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm transition-all hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-40 active:scale-95"
                        >
                          {loading ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <Send className={`h-3.5 w-3.5 ${isRTL ? 'rotate-180' : ''}`} />
                          )}
                        </button>
                      </div>
                    </div>
                    <p className="mt-1.5 text-center text-[10px] text-muted-foreground/60">{copy.disclaimer}</p>
                    {error ? <p className="mt-1 text-center text-[10px] text-destructive">{error}</p> : null}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}
