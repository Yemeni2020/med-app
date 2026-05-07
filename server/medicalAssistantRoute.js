import { detectMedicalProfile, mergeKnowledgeSources, selectGroundingSources } from '../src/lib/medicalKnowledgeBase.js';

const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || 'http://127.0.0.1:11434';
const OLLAMA_GENERATE_URL = `${OLLAMA_BASE_URL.replace(/\/$/, '')}/api/generate`;
const MEDICAL_KEYWORDS = [
  'pain', 'fever', 'cough', 'doctor', 'medicine', 'medical', 'symptom', 'symptoms', 'blood', 'pressure',
  'glucose', 'diabetes', 'stroke', 'heart', 'lung', 'breathing', 'infection', 'rash', 'vomiting', 'nausea',
  'headache', 'hospital', 'treatment', 'diagnosis', 'therapy', 'dose', 'drug', 'prescription', 'pregnant',
  'child', 'emergency', 'urgent', 'clinic', 'health', 'surgery', 'cardiology', 'neurology', 'oncology',
  'صداع', 'حمى', 'ألم', 'دواء', 'طبيب', 'أعراض', 'سكر', 'ضغط', 'تنفس', 'جلطة', 'قلب', 'علاج', 'صحة',
];
const GREETING_KEYWORDS = [
  'hello', 'hi', 'hey', 'good morning', 'good afternoon', 'good evening', 'thanks', 'thank you', 'welcome',
  'مرحبا', 'مرحباً', 'اهلا', 'أهلا', 'السلام عليكم', 'شكرا', 'شكراً', 'يعطيك العافية',
];
const EMERGENCY_KEYWORDS = [
  'chest pain', 'shortness of breath', 'trouble breathing', 'can’t breathe', 'stroke', 'face droop',
  'one-sided weakness', 'severe bleeding', 'seizure', 'passed out', 'fainting', 'suicidal', 'anaphylaxis',
  'throat swelling', 'blue lips', 'ألم الصدر', 'ضيق التنفس', 'صعوبة التنفس', 'جلطة', 'نزيف شديد', 'إغماء',
  'تشنج', 'انتحار', 'اختناق',
];
const REFUSAL_KEYWORDS = [
  'fake prescription', 'forge prescription', 'fake sick note', 'forge medical certificate', 'overdose',
  'poison', 'harm myself', 'harm someone', 'avoid drug test', 'تزوير وصفة', 'شهادة مرضية مزورة', 'جرعة زائدة',
  'إيذاء نفسي', 'إيذاء شخص',
];
const SMALL_TALK_PATTERNS = [
  'how are you', 'who are you', 'what can you do', 'what can you help with', 'can you help me',
  'what do you do', 'are you ai', 'who made you', 'how can you help',
  'كيف حالك', 'من أنت', 'ماذا يمكنك', 'بماذا تساعد', 'هل يمكنك مساعدتي', 'ما الذي يمكنك فعله',
];
const FOLLOW_UP_PATTERNS = [
  'is that dangerous', 'what should i do', 'should i worry', 'what now', 'what next', 'is it serious',
  'what about pregnancy', 'what about my child', 'هل هذا خطير', 'ماذا أفعل', 'هل أقلق', 'ماذا الآن', 'هل هو خطير',
];

function readRequestBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk;
      if (body.length > 100_000) {
        reject(new Error('Request body too large.'));
      }
    });
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch {
        reject(new Error('Invalid JSON payload.'));
      }
    });
    req.on('error', reject);
  });
}

function sendJson(res, statusCode, payload) {
  res.statusCode = statusCode;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.end(JSON.stringify(payload));
}

function startSse(res) {
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders?.();
}

function sendSseEvent(res, event, payload) {
  res.write(`event: ${event}\n`);
  res.write(`data: ${JSON.stringify(payload)}\n\n`);
}

function extractOutputText(responseBody) {
  if (typeof responseBody?.response === 'string' && responseBody.response.trim()) {
    return responseBody.response.trim();
  }
  return '';
}

function isMedicalTopic(message, history, profile, matchedSources) {
  const text = String(message || '').toLowerCase();
  if (MEDICAL_KEYWORDS.some((keyword) => text.includes(keyword))) return true;
  if (profile.specialties.length > 0 || profile.intents.length > 0) return true;
  if (matchedSources.length > 0) return true;

  const recentContext = history
    .slice(-6)
    .map((entry) => String(entry?.content || '').toLowerCase())
    .join(' ');

  return FOLLOW_UP_PATTERNS.some((pattern) => text.includes(pattern)) && MEDICAL_KEYWORDS.some((keyword) => recentContext.includes(keyword));
}

function isGreeting(message) {
  const text = String(message || '').toLowerCase();
  return GREETING_KEYWORDS.some((keyword) => text.includes(keyword));
}

function isSmallTalk(message) {
  const text = String(message || '').toLowerCase();
  return SMALL_TALK_PATTERNS.some((pattern) => text.includes(pattern));
}

function hasEmergencySignals(message) {
  const text = String(message || '').toLowerCase();
  return EMERGENCY_KEYWORDS.some((keyword) => text.includes(keyword));
}

function shouldRefuse(message) {
  const text = String(message || '').toLowerCase();
  return REFUSAL_KEYWORDS.some((keyword) => text.includes(keyword));
}

function buildAnswerTemplate(profile, lang) {
  const isArabic = lang === 'ar';

  switch (profile.primaryIntent) {
    case 'symptoms':
      return isArabic
        ? 'ابدأ بإجابة مباشرة وطبيعية على شكوى المستخدم نفسها، لا بمقدمة رسمية. في الشكاوى البسيطة أو القصيرة مثل "أشعر بالبرد" أو "عندي صداع"، اكتب فقرة أو فقرتين قصيرتين فقط: ما السبب المحتمل الأكثر شيوعًا، ما العلامات التي تستدعي الانتباه، وما الخطوة العملية التالية. لا تستخدم عناوين ثابتة إلا إذا كان السؤال معقدًا أو طلب المستخدم شرحًا مفصلًا.'
        : 'Start with a direct natural answer to the user’s symptom, not a formal preamble. For short simple symptom statements like "I feel cold" or "I have a headache", answer in one or two short paragraphs only: the most likely common explanation, the key warning signs to watch for, and the practical next step. Do not use fixed section headings unless the question is complex or the user asks for a detailed breakdown.';
    case 'medications':
      return isArabic
        ? 'أجب بشكل مباشر وبسيط أولًا. اشرح الفكرة الأساسية أو التحذير الأهم بلغة مفهومة، ثم أضف تنبيهًا موجزًا عن السلامة إذا كان مهمًا. لا تعط جرعات شخصية مفصلة إلا إذا كانت عامة وآمنة وموجودة بوضوح في المصادر. تجنب القوالب الجامدة.'
        : 'Answer directly and simply first. Explain the main point or key safety issue in plain language, then add a brief caution only if it matters. Do not give individualized dosing unless it is clearly general, safe, and explicitly supported by the sources. Avoid rigid report-style formatting.';
    case 'triage':
      return isArabic
        ? 'اذكر مستوى الاستعجال بوضوح في أول سطر، ثم اشرح السبب باختصار، ثم ماذا يفعل المستخدم الآن. اجعل الجواب إنسانيًا ومباشرًا، لا تقريريًا.'
        : 'State the urgency level clearly in the first line, then briefly explain why, then what the person should do now. Keep it human and direct, not report-like.';
    default:
      return isArabic
        ? 'قدّم جوابًا طبيعيًا ومهنيًا بصيغة محادثة إنسانية. ابدأ بالإجابة نفسها مباشرة، ثم أضف توضيحًا مختصرًا أو خطوة عملية. لا تستخدم عبارات مثل "الانطباع المباشر" أو "حدود هذه الإجابة" إلا إذا كان ذلك ضروريًا فعلًا.'
        : 'Give a natural professional answer in a human conversational style. Start with the answer itself, then add a brief explanation or practical step. Do not use phrases like "Direct impression" or "Limits of this answer" unless they are genuinely necessary.';
  }
}

function buildPrompt(history, message, lang, sources, profile) {
  const transcript = history
    .slice(-8)
    .map((entry) => `${entry.role === 'assistant' ? 'Assistant' : 'User'}: ${entry.content}`)
    .join('\n');

  const answerLanguage = lang === 'ar' ? 'Arabic' : 'English';
  const sourceContext = sources
    .map(({ source }, index) => [
      `Source ${index + 1}`,
      `ID: ${source.id}`,
      `Title: ${source.title}`,
      `Organization: ${source.organization}`,
      `Category: ${source.category}`,
      `Specialty: ${source.specialty}`,
      `Topic pack: ${source.topicPack}`,
      `Evidence level: ${source.evidenceLevel}`,
      `Summary: ${source.summary}`,
      `Content: ${source.content}`,
      source.url ? `URL: ${source.url}` : '',
    ].filter(Boolean).join('\n'))
    .join('\n\n');

  return [
    transcript ? `Conversation so far:\n${transcript}` : '',
    `Detected focus: specialty=${profile.primarySpecialty}; intent=${profile.primaryIntent}; vulnerable_groups=${profile.vulnerableGroups.join(', ') || 'none'}.`,
    `Approved medical knowledge base sources:\n${sourceContext}`,
    `User: ${message}`,
    '',
    `Respond in ${answerLanguage}.`,
    buildAnswerTemplate(profile, lang),
  ]
    .filter(Boolean)
    .join('\n');
}

function buildInstructions(lang) {
  const languageRule = lang === 'ar'
    ? 'Write in Arabic unless the user clearly asks for another language.'
    : 'Write in English unless the user clearly asks for another language.';

  return [
    'You are MedBlog Assistant, a serious medical information assistant for website visitors.',
    languageRule,
    'Only answer health and medicine related questions. If a request is unrelated, politely say you only handle health topics.',
    'Sound calm, serious, warm, and naturally conversational, like a careful clinical educator speaking to one person. Do not claim to be human, a doctor, or a personal clinician.',
    'Never joke, roleplay, moralize, or fabricate.',
    'Do not invent facts, studies, or citations. If you are uncertain, say so plainly.',
    'Answer only from the provided medical knowledge base sources. If the sources are insufficient, say you do not have enough approved source material to answer safely.',
    'Do not present your answer as a diagnosis. Explain possibilities and uncertainty when symptoms are discussed.',
    'If the user mentions emergency warning signs such as chest pain, trouble breathing, stroke symptoms, severe bleeding, seizure, confusion, suicidal thoughts, or anaphylaxis, tell them to seek immediate emergency care.',
    'Do not tell people to delay urgent care.',
    'Do not give unsafe or overly specific medication dosing for children, pregnancy, frail older adults, or complex high-risk situations. Recommend a clinician or pharmacist for personalized dosing.',
    'For simple questions, answer simply. Do not force headings, long disclaimers, or multi-section templates when a short direct answer would be better.',
    'Mirror the user’s wording and answer the actual question first. If they say "I feel cold", start by explaining common reasons someone may feel cold.',
    'Keep disclaimers brief and only when needed. Do not end every answer with a long limitation paragraph.',
    'Do not sound robotic, stiff, or like a report. Avoid labels such as "Direct impression", "What the symptoms may fit", "Practical next step", or "Limits of this answer" unless the user explicitly wants a structured breakdown.',
    'If the question is broad or missing one key detail, you may ask one focused follow-up question after giving the safest general guidance from the sources.',
    'State clearly that the information is educational and not a substitute for an in-person clinician when the question is personal medical advice.',
  ].join(' ');
}

function buildSimpleReply({ lang, answer, citations = [], triage, grounded = false, refusal = false, stream = false, res }) {
  const payload = { answer, citations, triage, grounded, refusal };

  if (!stream) return payload;

  startSse(res);
  sendSseEvent(res, 'delta', { token: answer });
  sendSseEvent(res, 'done', payload);
  res.end();
  return null;
}

function createGreetingAnswer(lang) {
  return lang === 'ar'
    ? 'مرحبًا. أنا المساعد الطبي في MedBlog. أستطيع مساعدتك بمعلومات صحية وطبية جادة ومعتمدة على المصادر، وسأوضح لك متى تستدعي الحالة مراجعة عاجلة أو طارئة. اطرح سؤالك الطبي متى شئت.'
    : 'Hello. I am the MedBlog medical assistant. I can help with serious, source-grounded medical information, and I will be clear about when symptoms may need urgent or emergency care. Ask your medical question whenever you are ready.';
}

function createSmallTalkAnswer(lang) {
  return lang === 'ar'
    ? 'أنا هنا للمساعدة. أستطيع شرح الأعراض العامة، توضيح متى تستدعي الحالة رعاية عاجلة، تقديم شرح مبسّط للحالات الشائعة، وتقديم معلومات عامة عن سلامة الأدوية من المصادر المعتمدة في قاعدة المعرفة.'
    : 'I am here to help. I can explain general symptoms, when something may need urgent care, common condition basics, and general medication-safety information using the approved knowledge base.';
}

export async function handleMedicalAssistantRequest(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return sendJson(res, 405, { error: 'Method not allowed.' });
  }

  let payload;
  try {
    payload = await readRequestBody(req);
  } catch (error) {
    return sendJson(res, 400, { error: error.message });
  }

  const message = typeof payload?.message === 'string' ? payload.message.trim() : '';
  const lang = payload?.lang === 'ar' ? 'ar' : 'en';
  const history = Array.isArray(payload?.history) ? payload.history : [];
  const customSources = Array.isArray(payload?.customSources) ? payload.customSources.slice(0, 50) : [];
  const stream = Boolean(payload?.stream);

  if (!message) {
    return sendJson(res, 400, { error: 'Message is required.' });
  }

  const allSources = mergeKnowledgeSources(customSources);
  const profile = detectMedicalProfile(message);
  const selectedSources = selectGroundingSources(allSources, message, 5);
  const citations = selectedSources.map(({ source }) => ({
    id: source.id,
    title: source.title,
    organization: source.organization,
    url: source.url,
    category: source.category,
    evidenceLevel: source.evidenceLevel,
  }));

  if (isGreeting(message)) {
    const payload = buildSimpleReply({ lang, answer: createGreetingAnswer(lang), citations: [], triage: 'greeting', grounded: false, refusal: false, stream, res });
    if (payload) return sendJson(res, 200, payload);
    return;
  }

  if (isSmallTalk(message)) {
    const payload = buildSimpleReply({ lang, answer: createSmallTalkAnswer(lang), citations: [], triage: 'small_talk', grounded: false, refusal: false, stream, res });
    if (payload) return sendJson(res, 200, payload);
    return;
  }

  if (!isMedicalTopic(message, history, profile, selectedSources)) {
    const payload = buildSimpleReply({
      lang,
      answer: lang === 'ar'
        ? 'أتعامل فقط مع الأسئلة الصحية والطبية. اطرح سؤالًا طبيًا وسأجيب من قاعدة المعرفة المعتمدة.'
        : 'I only handle health and medical questions. Ask a medical question and I will answer from the approved knowledge base.',
      citations: [],
      triage: 'refusal',
      grounded: false,
      refusal: true,
      stream,
      res,
    });
    if (payload) return sendJson(res, 200, payload);
    return;
  }

  if (shouldRefuse(message)) {
    const payload = buildSimpleReply({
      lang,
      answer: lang === 'ar'
        ? 'لا أستطيع المساعدة في طلبات قد تسبب ضررًا أو تتضمن تزويرًا طبيًا أو إساءة استخدام للأدوية. إذا كان الأمر متعلقًا بسلامتك أو صحة شخص آخر، اطلب مساعدة طبية أو طارئة مباشرة.'
        : 'I cannot help with requests involving harm, forged medical material, or unsafe medication misuse. If this concerns your safety or someone else’s, seek direct medical or emergency help.',
      citations,
      triage: 'refusal',
      grounded: false,
      refusal: true,
      stream,
      res,
    });
    if (payload) return sendJson(res, 200, payload);
    return;
  }

  if (hasEmergencySignals(message)) {
    const payload = buildSimpleReply({
      lang,
      answer: lang === 'ar'
        ? 'توجد في سؤالك علامات إنذار قد تستدعي رعاية طارئة فورية. اطلب خدمات الطوارئ الآن أو توجه إلى أقرب قسم طوارئ، خاصة عند ألم الصدر أو صعوبة التنفس أو علامات الجلطة أو النزيف الشديد أو الإغماء أو التشنجات.'
        : 'Your question includes warning signs that may need immediate emergency care. Call emergency services now or go to the nearest emergency department, especially for chest pain, breathing difficulty, stroke symptoms, severe bleeding, fainting, or seizures.',
      citations,
      triage: 'emergency',
      grounded: true,
      refusal: false,
      stream,
      res,
    });
    if (payload) return sendJson(res, 200, payload);
    return;
  }

  if (selectedSources.length === 0) {
    const payload = buildSimpleReply({
      lang,
      answer: lang === 'ar'
        ? 'لا أملك في قاعدة المعرفة الحالية مصادر معتمدة كافية للإجابة بأمان على هذا السؤال. أضف مصدرًا موثوقًا مناسبًا في لوحة الإدارة أو راجع مختصًا صحيًا.'
        : 'I do not have enough approved source material in the current knowledge base to answer this safely. Add a relevant trusted source in the admin knowledge base or consult a clinician.',
      citations: [],
      triage: 'insufficient_evidence',
      grounded: false,
      refusal: false,
      stream,
      res,
    });
    if (payload) return sendJson(res, 200, payload);
    return;
  }

  try {
    const model = process.env.OLLAMA_MODEL || 'gemma3';
    const response = await fetch(OLLAMA_GENERATE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        prompt: buildPrompt(history, message, lang, selectedSources, profile),
        system: buildInstructions(lang),
        stream,
        options: {
          temperature: 0.15,
          num_predict: 900,
        },
      }),
    });

    if (stream) {
      if (!response.ok || !response.body) {
        const failedBody = await response.json().catch(() => ({}));
        return sendJson(res, response.status || 500, {
          error: failedBody?.error || 'The assistant could not generate a response.',
        });
      }

      startSse(res);
      const decoder = new TextDecoder();
      let buffer = '';
      for await (const chunk of response.body) {
        buffer += decoder.decode(chunk, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed) continue;

          const item = JSON.parse(trimmed);
          if (item.response) {
            sendSseEvent(res, 'delta', { token: item.response });
          }
          if (item.done) {
            sendSseEvent(res, 'done', {
              answer: '',
              citations,
              triage: 'standard',
              grounded: true,
              refusal: false,
              model,
            });
            res.end();
            return;
          }
        }
      }

      sendSseEvent(res, 'done', {
        answer: '',
        citations,
        triage: 'standard',
        grounded: true,
        refusal: false,
        model,
      });
      res.end();
      return;
    }

    const responseBody = await response.json();

    if (!response.ok) {
      const errorMessage =
        responseBody?.error?.message ||
        responseBody?.error ||
        'The assistant could not generate a response.';
      return sendJson(res, response.status, { error: errorMessage });
    }

    const answer = extractOutputText(responseBody);
    if (!answer) {
      return sendJson(res, 502, { error: 'The assistant returned an empty response.' });
    }

    return sendJson(res, 200, {
      answer,
      citations,
      triage: 'standard',
      grounded: true,
      refusal: false,
      model,
    });
  } catch (error) {
    const detail = error instanceof Error ? error.message : 'Unknown error';
    const statusCode = detail.includes('ECONNREFUSED') || detail.includes('fetch failed') ? 503 : 500;
    return sendJson(res, statusCode, {
      error: 'Local AI is unavailable. Make sure Ollama is running and the selected model is installed.',
      detail,
    });
  }
}
