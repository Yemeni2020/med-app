import React, { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Bot, ChevronDown, ExternalLink, MessageCircle, Send, User, X } from 'lucide-react';
import { useLanguage } from '@/lib/LanguageContext';
import { listMedicalKnowledgeSources } from '@/lib/local-store';
import { useIsMobile } from '@/hooks/use-mobile';

const MIN_THINKING_MS = 5000;

const parseJsonSafe = (value, fallback = {}) => {
  try {
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
};

const escapeHtml = (value) =>
  String(value || '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');

const formatMessageHtml = (text) =>
  escapeHtml(text)
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '$1')
    .replace(/\n/g, '<br/>');

const UI_COPY = {
  en: {
    trigger: 'Medical AI',
    title: 'Medical AI Assistant',
    subtitleOnline: 'Source-grounded medical support',
    subtitleOffline: 'Educational medical guidance',
    botBadge: 'Medical AI',
    supportBadge: 'Medical AI',
    online: 'Assistant ready',
    offline: 'Local model offline',
    placeholder: 'Write your medical question...',
    thinking: 'Thinking...',
    poweredBy: 'Powered by local AI',
    unavailable: 'Local AI is not ready. Start Ollama locally and install the selected model.',
    welcome: 'Hello. I can help with symptoms, when to seek care, common conditions, and general medication-safety questions using the approved medical knowledge base.',
    quickReplies: [
      'What can you help with?',
      'What are common causes of persistent cough?',
      'Should I worry about chest pain with sweating?',
      'What should I know before taking pain relievers?',
    ],
    sourceLabel: 'Source',
    emergencyHint: 'Emergency symptoms like chest pain, severe breathing trouble, stroke signs, severe bleeding, or suicidal thoughts need urgent in-person care.',
  },
  ar: {
    trigger: 'مساعد طبي',
    title: 'المساعد الطبي',
    subtitleOnline: 'دعم طبي معتمد على المصادر',
    subtitleOffline: 'إرشاد طبي تثقيفي',
    botBadge: 'ذكاء طبي',
    supportBadge: 'ذكاء طبي',
    online: 'المساعد جاهز',
    offline: 'النموذج المحلي غير متصل',
    placeholder: 'اكتب سؤالك الطبي...',
    thinking: 'جارٍ التفكير...',
    poweredBy: 'مدعوم بذكاء محلي',
    unavailable: 'الذكاء المحلي غير جاهز بعد. شغّل Ollama محليًا وثبّت النموذج المحدد.',
    welcome: 'مرحبًا. أستطيع مساعدتك في الأعراض، ومتى يجب طلب الرعاية، وشرح الحالات الشائعة، ومعلومات عامة عن سلامة الأدوية بالاعتماد على قاعدة المعرفة الطبية المعتمدة.',
    quickReplies: [
      'بماذا يمكنك المساعدة؟',
      'ما الأسباب الشائعة للسعال المستمر؟',
      'هل ألم الصدر مع التعرق مقلق؟',
      'ما المهم معرفته قبل استخدام مسكنات الألم؟',
    ],
    sourceLabel: 'المصدر',
    emergencyHint: 'أعراض الطوارئ مثل ألم الصدر أو صعوبة التنفس الشديدة أو علامات السكتة أو النزيف الشديد أو الأفكار الانتحارية تحتاج إلى رعاية مباشرة وعاجلة.',
  },
};

function MessageBubble({ msg, locale, copy, isRTL }) {
  const isBot = msg.role !== 'user';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.22, ease: 'easeOut' }}
      className={`flex gap-2 ${isBot ? 'justify-start' : 'justify-end'}`}
    >
      {isBot ? (
        <div className="mt-0.5 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-slate-900/5 text-slate-700">
          <Bot className="h-4 w-4" />
        </div>
      ) : null}

      <div className="flex max-w-[82%] flex-col gap-2">
        <div
          className={`rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed shadow-sm ${
            isBot
              ? 'rounded-tl-sm border border-slate-200/80 bg-white text-slate-800'
              : 'rounded-tr-sm bg-gradient-to-br from-blue-600 to-blue-700 text-white'
          }`}
        >
          <div className={`mb-1 text-[10px] font-bold uppercase tracking-[0.16em] ${isBot ? 'text-slate-400' : 'text-blue-100/90'}`}>
            {isBot ? (msg.label || copy.botBadge) : (locale === 'ar' ? 'أنت' : 'You')}
          </div>
          <div dangerouslySetInnerHTML={{ __html: formatMessageHtml(msg.text) }} />
        </div>

        {isBot && Array.isArray(msg.citations) && msg.citations.length > 0 ? (
          <div className={`flex flex-col gap-2 ${isRTL ? 'items-end' : 'items-start'}`}>
            {msg.citations.map((citation) => (
              <a
                key={citation.id}
                href={citation.url || '#'}
                target={citation.url ? '_blank' : undefined}
                rel={citation.url ? 'noreferrer' : undefined}
                className="inline-flex max-w-full items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700 transition-colors hover:bg-blue-100"
              >
                <ExternalLink className="h-3 w-3" />
                <span className="truncate">{copy.sourceLabel}: {citation.title}</span>
              </a>
            ))}
          </div>
        ) : null}
      </div>

      {!isBot ? (
        <div className="mt-0.5 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-500">
          <User className="h-4 w-4" />
        </div>
      ) : null}
    </motion.div>
  );
}

function TypingIndicator() {
  return (
    <div className="flex items-center gap-2">
      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-900/5 text-slate-700">
        <Bot className="h-4 w-4" />
      </div>
      <div className="flex h-9 items-center gap-1 rounded-2xl rounded-tl-sm border border-slate-200/80 bg-white px-3.5 py-2.5 shadow-sm">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400"
            style={{ animationDelay: `${i * 0.15}s` }}
          />
        ))}
      </div>
    </div>
  );
}

export default function MedicalAssistant() {
  const { lang, isRTL } = useLanguage();
  const isMobile = useIsMobile();
  const copy = UI_COPY[lang] || UI_COPY.en;
  const config = useMemo(() => parseJsonSafe('', {}), []);

  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { id: 'intro', role: 'assistant', label: copy.botBadge, text: copy.welcome, citations: [] },
  ]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const [unread, setUnread] = useState(0);
  const [error, setError] = useState('');
  const [assistantOnline, setAssistantOnline] = useState(true);
  const messagesRef = useRef(null);
  const openRef = useRef(open);

  useEffect(() => {
    openRef.current = open;
  }, [open]);

  useEffect(() => {
    setMessages((current) => {
      const hasUserMessage = current.some((message) => message.role === 'user');
      if (hasUserMessage) return current;
      return [{ id: 'intro', role: 'assistant', label: copy.botBadge, text: copy.welcome, citations: [] }];
    });
  }, [copy.botBadge, copy.welcome]);

  useEffect(() => {
    if (open) setUnread(0);
  }, [open]);

  useEffect(() => {
    messagesRef.current?.scrollTo({ top: messagesRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, typing, open]);

  const pushAssistantMessage = (assistantId, nextText, citations = []) => {
    setMessages((current) => current.map((message) => (
      message.id === assistantId
        ? { ...message, text: nextText, citations }
        : message
    )));
  };

  const sendMessage = async (rawMessage) => {
    const trimmed = rawMessage.trim();
    if (!trimmed || typing) return;

    const userMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      text: trimmed,
    };
    const assistantId = `bot-${Date.now()}`;
    const historyForApi = [...messages, userMessage]
      .filter((message) => message.role === 'assistant' || message.role === 'user')
      .slice(-8)
      .map((message) => ({
        role: message.role,
        content: message.text,
      }));

    setMessages((current) => [...current, userMessage, { id: assistantId, role: 'assistant', label: copy.botBadge, text: '', citations: [], pending: true }]);
    setTyping(true);
    setInput('');
    setError('');

    try {
      const startedAt = Date.now();
      let bufferedText = '';
      let finalCitations = [];
      let revealed = false;

      const reveal = () => {
        if (revealed) return;
        revealed = true;
        pushAssistantMessage(assistantId, bufferedText, finalCitations);
      };

      const revealAfterMinimumDelay = async () => {
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
          message: trimmed,
          history: historyForApi,
          customSources: listMedicalKnowledgeSources(),
          stream: true,
        }),
      });

      if (!response.ok || !response.body) {
        const payload = await response.json().catch(() => ({}));
        throw new Error(payload?.error || copy.unavailable);
      }

      setAssistantOnline(true);
      const minimumDelayPromise = revealAfterMinimumDelay();
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const frames = buffer.split('\n\n');
        buffer = frames.pop() || '';

        for (const frame of frames) {
          const lines = frame.split('\n');
          const eventLine = lines.find((line) => line.startsWith('event:'));
          const dataLine = lines.find((line) => line.startsWith('data:'));
          if (!eventLine || !dataLine) continue;

          const event = eventLine.replace('event:', '').trim();
          const data = JSON.parse(dataLine.replace('data:', '').trim());

          if (event === 'delta') {
            bufferedText += data.token || '';
            if (revealed) {
              pushAssistantMessage(assistantId, bufferedText, finalCitations);
            }
          }

          if (event === 'done') {
            finalCitations = Array.isArray(data.citations) ? data.citations : [];
            if (revealed) {
              pushAssistantMessage(assistantId, bufferedText || data.answer || '', finalCitations);
            }
          }
        }
      }

      await minimumDelayPromise;
      pushAssistantMessage(assistantId, bufferedText, finalCitations);
    } catch (requestError) {
      const message = requestError instanceof Error ? requestError.message : copy.unavailable;
      setAssistantOnline(false);
      setError(message);
      pushAssistantMessage(assistantId, message, []);
    } finally {
      setTyping(false);
      setMessages((current) => current.map((message) => (
        message.id === assistantId ? { ...message, pending: false } : message
      )));
      if (!openRef.current) {
        setUnread((count) => count + 1);
      }
    }
  };

  const visibleMessages = messages.filter((message) => !(message.pending && !message.text));

  return (
    <>
      <AnimatePresence>
        {!open ? (
          <motion.button
            key="chat-trigger"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            onClick={() => setOpen(true)}
            className={`fixed bottom-28 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-blue-600 text-white shadow-xl transition-colors hover:bg-blue-700 md:bottom-6 ${isRTL ? 'left-4 md:left-6' : 'right-4 md:right-6'}`}
          >
            <MessageCircle className="h-6 w-6" />
            {unread > 0 ? (
              <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
                {unread}
              </span>
            ) : null}
          </motion.button>
        ) : null}
      </AnimatePresence>

      <AnimatePresence>
        {open ? (
          <motion.div
            key="chat-panel"
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 20 }}
            transition={{ type: 'spring', damping: 24, stiffness: 260 }}
            className={`fixed bottom-24 z-50 flex h-[min(560px,calc(100vh-6rem))] w-[calc(100vw-1.5rem)] max-w-sm flex-col overflow-hidden rounded-[1.75rem] border border-slate-200/80 bg-slate-50 shadow-2xl md:bottom-6 ${isRTL ? 'left-3 md:left-6' : 'right-3 md:right-6'}`}
          >
            <div className="flex flex-shrink-0 items-center justify-between border-b border-slate-200/80 bg-blue-50/80 px-4 py-3.5">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-100 text-blue-700">
                    <Bot className="h-5 w-5" />
                  </div>
                  <span className={`absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-slate-50 ${assistantOnline ? 'bg-emerald-400' : 'bg-amber-400'}`} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900">{copy.title}</p>
                  <p className={`text-xs ${assistantOnline ? 'text-emerald-500' : 'text-amber-500'}`}>
                    {assistantOnline ? copy.subtitleOnline : copy.subtitleOffline}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-full text-slate-500 transition-colors hover:bg-white hover:text-slate-900"
              >
                {isMobile ? <X className="h-4 w-4" /> : <ChevronDown className="h-5 w-5" />}
              </button>
            </div>

            <div className="px-4 pt-3 text-[11px] text-slate-500">
              {copy.emergencyHint}
            </div>

            <div ref={messagesRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-3">
              {visibleMessages.map((msg) => (
                <MessageBubble
                  key={msg.id}
                  msg={msg}
                  locale={lang}
                  copy={copy}
                  config={config}
                  isRTL={isRTL}
                />
              ))}

              {typing ? <TypingIndicator /> : null}
            </div>

            <div className="flex flex-shrink-0 gap-1.5 overflow-x-auto px-3 pb-2">
              {copy.quickReplies.map((reply) => (
                <button
                  key={reply}
                  onClick={() => sendMessage(reply)}
                  className="whitespace-nowrap rounded-full border border-slate-200 bg-white px-2.5 py-1.5 text-[11px] text-slate-600 transition-colors hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                  disabled={typing}
                >
                  {reply}
                </button>
              ))}
            </div>

            <div className="flex-shrink-0 px-3 pb-3">
              <form
                onSubmit={async (event) => {
                  event.preventDefault();
                  await sendMessage(input);
                }}
                className="rounded-2xl border border-slate-200/80 bg-white px-3 py-2"
              >
                <div className="flex items-center gap-2">
                  <input
                    value={input}
                    onChange={(event) => setInput(event.target.value)}
                    onKeyDown={async (event) => {
                      if (event.key === 'Enter' && !event.shiftKey) {
                        event.preventDefault();
                        await sendMessage(input);
                      }
                    }}
                    placeholder={copy.placeholder}
                    className="flex-1 bg-transparent text-sm text-slate-800 outline-none placeholder:text-slate-400"
                    maxLength={2000}
                    disabled={typing}
                  />

                  <button
                    type="submit"
                    disabled={typing || input.trim() === ''}
                    className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-blue-600 text-white transition-colors hover:bg-blue-700 disabled:opacity-40"
                  >
                    <Send className="h-3.5 w-3.5" />
                  </button>
                </div>
              </form>

              <p className="mt-2 text-center text-[10px] text-slate-400">
                {copy.poweredBy}
              </p>
              {error ? <p className="mt-1 text-center text-[10px] text-red-500">{error}</p> : null}
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}
