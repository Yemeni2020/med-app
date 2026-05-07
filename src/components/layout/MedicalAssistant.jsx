import React, { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Bot,
  ChevronDown,
  ChevronLeft,
  ExternalLink,
  Loader2,
  Mail,
  Phone,
  RotateCcw,
  Send,
  Sparkles,
  Stethoscope,
  User,
  X,
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { useLanguage } from '@/lib/LanguageContext';
import { useIsMobile } from '@/hooks/use-mobile';

const MIN_THINKING_MS = 5000;

const CONTENT = {
  en: {
    name: 'MedBot AI Assistant',
    statusOnline: 'Online · Medical AI',
    statusOffline: 'Offline · Local model unavailable',
    welcome: "👋 **Hello! I'm MedBot**, your medical assistant on MedBlog.\n\nI can help explain symptoms, common conditions, medications, when to seek care, and general health guidance using the approved medical knowledge base.\n\n⚠️ **Important:** I provide general health information only. I do not replace a licensed clinician, and I do not diagnose or prescribe.\n\nHow can I help you today?",
    quickLabel: 'Quick questions:',
    quickPrompts: [
      'What are symptoms of hypertension?',
      'How can I improve sleep quality?',
      'Difference between Type 1 and Type 2 diabetes?',
      'When should I seek care for chest pain?',
    ],
    placeholder: 'Ask a medical question...',
    disclaimer: 'Not medical advice · Always consult a licensed doctor',
    reset: 'Reset chat',
    contactTitle: 'Contact a Doctor',
    contactSubtitle: 'Prefer a human medical professional?',
    contactBtn: 'Contact doctor',
    phoneLabel: 'Emergency Hotline',
    emailLabel: 'Book Appointment',
    backToChat: 'Back to chat',
    sourceLabel: 'Source',
    unavailable: 'Local AI is not ready. Start Ollama locally and install the configured model.',
  },
  ar: {
    name: 'مساعد ميدبوت الذكي',
    statusOnline: 'متصل · ذكاء اصطناعي طبي',
    statusOffline: 'غير متصل · النموذج المحلي غير جاهز',
    welcome: "👋 **مرحباً! أنا ميدبوت**، مساعدك الطبي في MedBlog.\n\nيمكنني مساعدتك في شرح الأعراض والحالات الشائعة والأدوية ومتى يجب طلب الرعاية والإرشاد الصحي العام بالاعتماد على قاعدة المعرفة الطبية المعتمدة.\n\n⚠️ **مهم:** أقدم معلومات صحية عامة فقط. لا أستبدل الطبيب المرخّص، ولا أقدّم تشخيصًا أو وصفًا دوائيًا.\n\nكيف يمكنني مساعدتك اليوم؟",
    quickLabel: 'أسئلة سريعة:',
    quickPrompts: [
      'ما هي أعراض ارتفاع ضغط الدم؟',
      'كيف أحسن جودة النوم؟',
      'ما الفرق بين السكري النوع الأول والثاني؟',
      'متى يجب طلب الرعاية بسبب ألم الصدر؟',
    ],
    placeholder: 'اطرح سؤالاً طبياً...',
    disclaimer: 'ليست نصيحة طبية · استشر طبيبًا مرخصًا دائمًا',
    reset: 'إعادة المحادثة',
    contactTitle: 'تواصل مع طبيب',
    contactSubtitle: 'هل تفضل التحدث مع متخصص بشري؟',
    contactBtn: 'التواصل مع طبيب',
    phoneLabel: 'خط الطوارئ',
    emailLabel: 'حجز موعد',
    backToChat: 'العودة للمحادثة',
    sourceLabel: 'المصدر',
    unavailable: 'الذكاء المحلي غير جاهز. شغّل Ollama محليًا وثبّت النموذج المحدد.',
  },
};

function CitationPills({ citations, label, isRTL }) {
  if (!Array.isArray(citations) || citations.length === 0) return null;

  const visibleCitations = citations.slice(0, 2);
  const hiddenCount = Math.max(0, citations.length - visibleCitations.length);

  return (
    <div className={`flex flex-col gap-2 ${isRTL ? 'items-end' : 'items-start'}`}>
      {visibleCitations.map((citation) => (
        <a
          key={citation.id}
          href={citation.url || '#'}
          target={citation.url ? '_blank' : undefined}
          rel={citation.url ? 'noreferrer' : undefined}
          className="inline-flex max-w-full items-center gap-1.5 rounded-full border border-primary/20 bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary transition-colors hover:bg-primary/15"
        >
          <ExternalLink className="h-3 w-3" />
          <span className="truncate">{label}: {citation.title}</span>
        </a>
      ))}
      {hiddenCount > 0 ? (
        <span className="px-1 text-[11px] font-medium text-muted-foreground">
          {isRTL
            ? `+${hiddenCount} مصادر إضافية`
            : `+${hiddenCount} more source${hiddenCount > 1 ? 's' : ''}`}
        </span>
      ) : null}
    </div>
  );
}

function MessageBubble({ msg, copy, lang, isRTL }) {
  const isUser = msg.role === 'user';

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

      <div className={`flex max-w-[82%] flex-col gap-2 ${isUser && isRTL ? 'items-start' : isUser ? 'items-end' : isRTL ? 'items-end' : 'items-start'}`}>
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

        {!isUser ? <CitationPills citations={msg.citations} label={copy.sourceLabel} isRTL={isRTL} /> : null}
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

export default function MedicalAssistant() {
  const { lang, isRTL } = useLanguage();
  const isMobile = useIsMobile();
  const copy = CONTENT[lang] || CONTENT.en;
  const welcomeMessage = { id: 'intro', role: 'assistant', text: copy.welcome, citations: [] };

  const [open, setOpen] = useState(false);
  const [view, setView] = useState('chat');
  const [messages, setMessages] = useState([welcomeMessage]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [assistantOnline, setAssistantOnline] = useState(true);
  const [error, setError] = useState('');
  const [unread, setUnread] = useState(0);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);
  const openRef = useRef(open);

  useEffect(() => {
    openRef.current = open;
  }, [open]);

  useEffect(() => {
    setMessages([welcomeMessage]);
    setView('chat');
    setError('');
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
  };

  const sendMessage = async (rawText) => {
    const userText = (rawText || input).trim();
    if (!userText || loading) return;

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
      let finalCitations = [];
      let revealed = false;

      const reveal = () => {
        if (revealed) return;
        revealed = true;
        setMessages((current) => [...current, { id: assistantId, role: 'assistant', text: bufferedText, citations: finalCitations }]);
      };

      const revealAfterDelay = async () => {
        const elapsed = Date.now() - startedAt;
        const remaining = Math.max(0, MIN_THINKING_MS - elapsed);
        if (remaining > 0) {
          await new Promise((resolve) => setTimeout(resolve, remaining));
        }
        reveal();
      };

      const response = await fetch('/api/medical-assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lang,
          message: userText,
          history,
          stream: true,
        }),
      });

      if (!response.ok || !response.body) {
        const payload = await response.json().catch(() => ({}));
        throw new Error(payload?.error || copy.unavailable);
      }

      setAssistantOnline(true);
      const minimumDelayPromise = revealAfterDelay();
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const chunks = buffer.split('\n\n');
        buffer = chunks.pop() || '';

        for (const chunk of chunks) {
          const eventLine = chunk.split('\n').find((line) => line.startsWith('event:'));
          const dataLine = chunk.split('\n').find((line) => line.startsWith('data:'));
          if (!eventLine || !dataLine) continue;

          const event = eventLine.replace('event:', '').trim();
          const data = JSON.parse(dataLine.replace('data:', '').trim());

          if (event === 'delta') {
            bufferedText += data.token || '';
            if (revealed) {
              setMessages((current) => current.map((message) => (
                message.id === assistantId
                  ? { ...message, text: bufferedText, citations: finalCitations }
                  : message
              )));
            }
          }

          if (event === 'done') {
            finalCitations = Array.isArray(data.citations) ? data.citations : [];
            if (revealed) {
              setMessages((current) => current.map((message) => (
                message.id === assistantId
                  ? { ...message, text: bufferedText || data.answer || '', citations: finalCitations }
                  : message
              )));
            }
          }
        }
      }

      await minimumDelayPromise;
      setMessages((current) => current.map((message) => (
        message.id === assistantId
          ? { ...message, text: bufferedText, citations: finalCitations }
          : message
      )));
    } catch (requestError) {
      const message = requestError instanceof Error ? requestError.message : copy.unavailable;
      setAssistantOnline(false);
      setError(message);
      setMessages((current) => [...current, { id: assistantId, role: 'assistant', text: message, citations: [] }]);
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
            className={`fixed bottom-24 z-50 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-secondary text-white shadow-2xl shadow-primary/30 transition-transform duration-200 hover:scale-110 md:bottom-6 ${isRTL ? 'left-4 md:left-6' : 'right-4 md:right-6'}`}
          >
            <Stethoscope className="relative z-10 h-6 w-6" />
            <span className="absolute inset-0 rounded-2xl bg-primary/40 animate-ping" />
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
            className={`fixed bottom-24 z-50 flex h-[580px] w-[390px] max-w-[calc(100vw-1.5rem)] flex-col overflow-hidden rounded-3xl border border-border/80 bg-background shadow-2xl shadow-black/25 md:bottom-6 ${isRTL ? 'left-3 md:left-6' : 'right-3 md:right-6'}`}
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
                  <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${assistantOnline ? 'bg-emerald-400 animate-pulse' : 'bg-amber-300'}`} />
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
                        />
                      ))}

                      {loading ? <LoadingBubble /> : null}
                      <div ref={bottomRef} />
                    </div>
                  </div>

                  {messages.length === 1 ? (
                    <div className="shrink-0 px-4 pb-2">
                      <p className="mb-2 text-xs font-medium text-muted-foreground">{copy.quickLabel}</p>
                      <div className="flex flex-col gap-1.5">
                        {copy.quickPrompts.map((prompt) => (
                          <button
                            key={prompt}
                            onClick={() => sendMessage(prompt)}
                            className="rounded-xl border border-border/50 bg-muted px-3 py-2 text-left text-xs text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary"
                            disabled={loading}
                          >
                            {prompt}
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : null}

                  <div className="shrink-0 border-t border-border/50 bg-background px-3 pb-3 pt-2">
                    <div className="rounded-2xl bg-muted px-3 py-2.5 transition-all focus-within:ring-2 focus-within:ring-primary/30">
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
                          className="max-h-24 min-h-[22px] flex-1 resize-none bg-transparent text-sm leading-relaxed text-foreground outline-none placeholder:text-muted-foreground/55"
                          disabled={loading}
                        />
                        <button
                          onClick={() => sendMessage()}
                          disabled={!input.trim() || loading}
                          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground transition-all hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-40 active:scale-95"
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
