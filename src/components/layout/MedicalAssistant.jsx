import React, { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { useLanguage } from '@/lib/LanguageContext';
import { Bot, Loader2, Send, ShieldAlert, Stethoscope } from 'lucide-react';

const UI_COPY = {
  en: {
    trigger: 'Medical AI',
    title: 'Medical AI Assistant',
    subtitle: 'Serious health information only. No jokes, no speculation, no fake certainty.',
    badge: 'Educational only',
    warning: 'This assistant gives educational medical information. It is not a diagnosis and does not replace emergency or in-person care.',
    placeholder: 'Ask a medical question. Example: What are common causes of persistent cough?',
    send: 'Send',
    thinking: 'Thinking...',
    clear: 'Clear chat',
    emergency: 'For chest pain, trouble breathing, stroke symptoms, severe bleeding, or suicidal thoughts, seek emergency care now.',
    welcome: 'Ask a health question and I will answer with serious educational information. I will be direct about uncertainty and when medical care is needed.',
    unavailable: 'The medical assistant is not configured yet. Add OPENAI_API_KEY on the server.',
  },
  ar: {
    trigger: 'مساعد طبي',
    title: 'المساعد الطبي',
    subtitle: 'معلومات صحية جادة فقط. بلا مزاح، بلا تخمين، وبلا يقين زائف.',
    badge: 'للتثقيف فقط',
    warning: 'هذا المساعد يقدم معلومات طبية تثقيفية. لا يمثل تشخيصًا ولا يغني عن الطوارئ أو الرعاية الطبية المباشرة.',
    placeholder: 'اطرح سؤالًا طبيًا. مثال: ما الأسباب الشائعة للسعال المستمر؟',
    send: 'إرسال',
    thinking: 'جارٍ التفكير...',
    clear: 'مسح المحادثة',
    emergency: 'في حال ألم الصدر أو صعوبة التنفس أو علامات السكتة أو النزيف الشديد أو الأفكار الانتحارية، اطلب الطوارئ فورًا.',
    welcome: 'اطرح سؤالًا صحيًا وسأجيب بمعلومات طبية تثقيفية جادة، مع توضيح حدود المعرفة ومتى يجب طلب الرعاية الطبية.',
    unavailable: 'المساعد الطبي غير مهيأ بعد. أضف OPENAI_API_KEY على الخادم.',
  },
};

function MessageBubble({ role, content }) {
  const isAssistant = role === 'assistant';

  return (
    <div className={`flex ${isAssistant ? 'justify-start' : 'justify-end'}`}>
      <div
        className={`max-w-[88%] rounded-2xl px-4 py-3 text-sm leading-6 shadow-sm ${
          isAssistant
            ? 'bg-muted text-foreground border border-border'
            : 'bg-primary text-primary-foreground'
        }`}
      >
        <p className="whitespace-pre-wrap">{content}</p>
      </div>
    </div>
  );
}

export default function MedicalAssistant() {
  const { lang, isRTL } = useLanguage();
  const copy = UI_COPY[lang] || UI_COPY.en;
  const initialMessages = useMemo(
    () => [{ role: 'assistant', content: copy.welcome }],
    [copy.welcome],
  );
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState(initialMessages);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setMessages((current) => {
      const hasUserMessage = current.some((entry) => entry.role === 'user');
      return hasUserMessage ? current : [{ role: 'assistant', content: copy.welcome }];
    });
    setError('');
  }, [copy.welcome]);

  const handleClear = () => {
    setMessages([{ role: 'assistant', content: copy.welcome }]);
    setMessage('');
    setError('');
  };

  const handleSend = async () => {
    const trimmed = message.trim();
    if (!trimmed || loading) return;

    const nextMessages = [...messages, { role: 'user', content: trimmed }];
    setMessages(nextMessages);
    setMessage('');
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/medical-assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lang,
          message: trimmed,
          history: nextMessages.slice(-8),
        }),
      });

      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload?.error || copy.unavailable);
      }

      setMessages((current) => [...current, { role: 'assistant', content: payload.answer }]);
    } catch (requestError) {
      const nextError = requestError instanceof Error ? requestError.message : copy.unavailable;
      setError(nextError);
      setMessages((current) => [
        ...current,
        { role: 'assistant', content: nextError },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    await handleSend();
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <div className={`fixed bottom-5 z-40 ${isRTL ? 'left-5' : 'right-5'}`}>
        <SheetTrigger asChild>
          <Button className="h-12 rounded-full px-4 shadow-lg gap-2">
            <Bot className="w-4 h-4" />
            {copy.trigger}
          </Button>
        </SheetTrigger>
      </div>
      <SheetContent side={isRTL ? 'left' : 'right'} className="w-full sm:max-w-xl p-0 flex flex-col">
        <SheetHeader className="px-6 py-5 border-b border-border text-left">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Stethoscope className="w-5 h-5 text-primary" />
            </div>
            <div>
              <SheetTitle>{copy.title}</SheetTitle>
              <SheetDescription>{copy.subtitle}</SheetDescription>
            </div>
          </div>
          <div className="flex items-center justify-between gap-3 mt-4">
            <Badge variant="outline" className="rounded-full">{copy.badge}</Badge>
            <Button variant="ghost" size="sm" onClick={handleClear}>{copy.clear}</Button>
          </div>
        </SheetHeader>

        <div className="px-6 pt-4">
          <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            <div className="flex items-start gap-2">
              <ShieldAlert className="w-4 h-4 mt-0.5 shrink-0" />
              <div className="space-y-2">
                <p>{copy.warning}</p>
                <p className="font-medium">{copy.emergency}</p>
              </div>
            </div>
          </div>
        </div>

        <ScrollArea className="flex-1 px-6 py-4">
          <div className="space-y-4 pr-2">
            {messages.map((entry, index) => (
              <MessageBubble
                key={`${entry.role}-${index}`}
                role={entry.role}
                content={entry.content}
              />
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="rounded-2xl px-4 py-3 text-sm bg-muted border border-border text-muted-foreground inline-flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {copy.thinking}
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        <form onSubmit={handleSubmit} className="border-t border-border px-6 py-4 space-y-3">
          <Textarea
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            placeholder={copy.placeholder}
            className="min-h-[104px] resize-none rounded-2xl"
          />
          <div className="flex items-center justify-between gap-3">
            <p className="text-xs text-muted-foreground">{error ? error : ' '}</p>
            <Button type="submit" disabled={loading || !message.trim()} className="rounded-full gap-2">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              {copy.send}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}
