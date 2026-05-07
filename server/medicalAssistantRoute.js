import crypto from 'node:crypto';
import { detectMedicalProfile, getSourceFreshness, selectGroundingContextFromChunks } from '../src/lib/medicalKnowledgeBase.js';
import { getPersistedMedicalKnowledgeSnapshot } from './medicalKnowledgeStore.js';
import {
  appendMedicalAssistantInteraction,
  getMedicalAssistantAnalytics,
  saveMedicalAssistantFeedback,
} from './medicalAssistantStore.js';

const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || 'http://127.0.0.1:11434';
const OLLAMA_GENERATE_URL = `${OLLAMA_BASE_URL.replace(/\/$/, '')}/api/generate`;
const BODY_LIMIT = 120_000;
const MAX_HISTORY_ITEMS = 8;
const MAX_HISTORY_CONTENT = 1_200;
const RATE_LIMITS = {
  assistant: { windowMs: 60_000, limit: 12 },
  feedback: { windowMs: 60_000, limit: 24 },
};

const rateLimitState = new Map();

const MEDICAL_KEYWORDS = [
  'pain', 'fever', 'cough', 'doctor', 'medicine', 'medical', 'symptom', 'symptoms', 'blood', 'pressure',
  'glucose', 'diabetes', 'stroke', 'heart', 'lung', 'breathing', 'infection', 'rash', 'vomiting', 'nausea',
  'headache', 'hospital', 'treatment', 'diagnosis', 'therapy', 'dose', 'drug', 'prescription', 'pregnant',
  'child', 'emergency', 'urgent', 'clinic', 'health', 'surgery', 'cardiology', 'neurology', 'oncology',
  'sleep', 'sleeping', 'insomnia', 'can t sleep', 'cannot sleep', 'sleep quality', 'snoring',
  'صداع', 'حمى', 'ألم', 'دواء', 'طبيب', 'أعراض', 'سكر', 'ضغط', 'تنفس', 'جلطة', 'قلب', 'علاج', 'صحة',
  'نوم', 'أرق', 'لا أستطيع النوم', 'جودة النوم', 'شخير',
];
const GREETING_KEYWORDS = [
  'hello', 'hi', 'hey', 'good morning', 'good afternoon', 'good evening', 'thanks', 'thank you', 'welcome',
  'مرحبا', 'مرحباً', 'اهلا', 'أهلا', 'السلام عليكم', 'شكرا', 'شكراً', 'يعطيك العافية',
];
const EMERGENCY_KEYWORDS = [
  'chest pain', 'shortness of breath', 'trouble breathing', 'can’t breathe', "can't breathe", 'stroke', 'face droop',
  'one-sided weakness', 'severe bleeding', 'seizure', 'passed out', 'fainting', 'suicidal', 'anaphylaxis',
  'throat swelling', 'blue lips', 'ألم الصدر', 'ضيق التنفس', 'صعوبة التنفس', 'جلطة', 'نزيف شديد', 'إغماء',
  'تشنج', 'انتحار', 'اختناق',
];
const URGENT_KEYWORDS = [
  'worsening', 'getting worse', 'dehydration', 'persistent vomiting', 'bloody stool', 'high fever',
  'pregnant with', 'child with', 'new weakness', 'vision loss', 'rapid swelling',
  'يزداد', 'يتفاقم', 'جفاف', 'قيء مستمر', 'دم في البراز', 'حرارة عالية', 'تورم سريع',
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
      if (body.length > BODY_LIMIT) {
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

function normalizeMatchText(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function includesPhrase(text, phrase) {
  const normalizedText = ` ${normalizeMatchText(text)} `;
  const normalizedPhrase = normalizeMatchText(phrase);
  if (!normalizedPhrase) return false;
  return normalizedText.includes(` ${normalizedPhrase} `);
}

function getLocalPath(req) {
  const url = new URL(req.url, 'http://localhost');
  const pathname = url.pathname.replace(/\/+$/, '');
  return pathname.replace(/^\/api\/medical-assistant/, '') || '/';
}

function getClientKey(req) {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string' && forwarded.trim()) {
    return forwarded.split(',')[0].trim();
  }
  return req.socket?.remoteAddress || 'unknown';
}

function checkRateLimit(scope, clientKey) {
  const config = RATE_LIMITS[scope];
  const stateKey = `${scope}:${clientKey}`;
  const now = Date.now();
  const current = rateLimitState.get(stateKey) || [];
  const windowStart = now - config.windowMs;
  const recent = current.filter((timestamp) => timestamp > windowStart);

  if (recent.length >= config.limit) {
    return false;
  }

  recent.push(now);
  rateLimitState.set(stateKey, recent);
  return true;
}

function sanitizeHistory(history) {
  if (!Array.isArray(history)) return [];

  return history
    .filter((entry) => entry && (entry.role === 'user' || entry.role === 'assistant'))
    .slice(-MAX_HISTORY_ITEMS)
    .map((entry) => ({
      role: entry.role,
      content: String(entry.content || '').slice(0, MAX_HISTORY_CONTENT),
    }));
}

function normalizeIntake(rawIntake) {
  if (!rawIntake || typeof rawIntake !== 'object') return null;

  const ageGroup = String(rawIntake.ageGroup || '').trim();
  const duration = String(rawIntake.duration || '').trim();
  const severity = String(rawIntake.severity || '').trim();
  const fever = rawIntake.fever === 'yes' || rawIntake.fever === 'no' ? rawIntake.fever : '';
  const pregnancy = rawIntake.pregnancy === 'yes' || rawIntake.pregnancy === 'no' ? rawIntake.pregnancy : '';
  const chronicConditions = String(rawIntake.chronicConditions || '').trim();

  if (!ageGroup && !duration && !severity && !fever && !pregnancy && !chronicConditions) {
    return null;
  }

  return {
    ageGroup,
    duration,
    severity,
    fever,
    pregnancy,
    chronicConditions,
  };
}

function formatIntakeForPrompt(intake, lang) {
  if (!intake) return '';

  if (lang === 'ar') {
    return [
      'سياق من نموذج الأعراض:',
      intake.ageGroup ? `- الفئة العمرية: ${intake.ageGroup}` : '',
      intake.duration ? `- المدة: ${intake.duration}` : '',
      intake.severity ? `- الشدة: ${intake.severity}` : '',
      intake.fever ? `- هل توجد حرارة: ${intake.fever}` : '',
      intake.pregnancy ? `- هل توجد حالة حمل: ${intake.pregnancy}` : '',
      intake.chronicConditions ? `- أمراض مزمنة: ${intake.chronicConditions}` : '',
    ].filter(Boolean).join('\n');
  }

  return [
    'Structured symptom intake:',
    intake.ageGroup ? `- Age group: ${intake.ageGroup}` : '',
    intake.duration ? `- Duration: ${intake.duration}` : '',
    intake.severity ? `- Severity: ${intake.severity}` : '',
    intake.fever ? `- Fever: ${intake.fever}` : '',
    intake.pregnancy ? `- Pregnancy: ${intake.pregnancy}` : '',
    intake.chronicConditions ? `- Chronic conditions: ${intake.chronicConditions}` : '',
  ].filter(Boolean).join('\n');
}

function buildEffectiveMessage(message, intake, lang) {
  const intakeText = formatIntakeForPrompt(intake, lang);
  return intakeText ? `${message}\n\n${intakeText}` : message;
}

function isMedicalTopic(message, history, profile, matchedSources) {
  const text = String(message || '').toLowerCase();
  if (MEDICAL_KEYWORDS.some((keyword) => text.includes(keyword))) return true;
  if (profile.specialties.length > 0 || profile.intents.length > 0) return true;
  if (matchedSources.some(({ matchedChunks }) => (matchedChunks?.[0]?.score || 0) > 20)) return true;

  const recentContext = history
    .slice(-6)
    .map((entry) => String(entry?.content || '').toLowerCase())
    .join(' ');

  return FOLLOW_UP_PATTERNS.some((pattern) => text.includes(pattern)) && MEDICAL_KEYWORDS.some((keyword) => recentContext.includes(keyword));
}

function isGreeting(message) {
  return GREETING_KEYWORDS.some((keyword) => includesPhrase(message, keyword));
}

function isSmallTalk(message) {
  return SMALL_TALK_PATTERNS.some((pattern) => includesPhrase(message, pattern));
}

function hasEmergencySignals(message) {
  const text = String(message || '').toLowerCase();
  return EMERGENCY_KEYWORDS.some((keyword) => text.includes(keyword));
}

function hasUrgentSignals(message, intake, profile) {
  const text = String(message || '').toLowerCase();
  if (URGENT_KEYWORDS.some((keyword) => text.includes(keyword))) return true;
  if (intake?.severity === 'severe') return true;
  if (intake?.pregnancy === 'yes' && profile.intents.includes('symptoms')) return true;
  return false;
}

function shouldRefuse(message) {
  if (REFUSAL_KEYWORDS.some((keyword) => includesPhrase(message, keyword))) {
    return true;
  }

  const normalized = normalizeMatchText(message);
  const hasForgeryIntent = /\b(fake|forge|forged|تزوير|مزورة)\b/u.test(normalized);
  const hasProtectedMedicalTarget = /\b(prescription|medical certificate|sick note|وصفة|شهادة مرضية)\b/u.test(normalized);

  return hasForgeryIntent && hasProtectedMedicalTarget;
}

function buildAnswerTemplate(profile, lang) {
  const isArabic = lang === 'ar';

  switch (profile.primaryIntent) {
    case 'symptoms':
      return isArabic
        ? 'ابدأ بإجابة مباشرة وطبيعية على شكوى المستخدم نفسها، لا بمقدمة رسمية. في الشكاوى البسيطة أو القصيرة مثل "أشعر بالبرد" أو "عندي صداع"، اكتب فقرة أو فقرتين قصيرتين فقط: ما السبب المحتمل الأكثر شيوعًا، ما العلامات التي تستدعي الانتباه، وما الخطوة العملية التالية. إذا كانت هناك معلومة ناقصة واحدة مهمة فاسأل سؤال متابعة واحدًا واضحًا في النهاية.'
        : 'Start with a direct natural answer to the user’s symptom, not a formal preamble. For short simple symptom statements like "I feel cold" or "I have a headache", answer in one or two short paragraphs only: the most likely common explanation, the key warning signs to watch for, and the practical next step. If one key fact is missing, ask exactly one focused follow-up question at the end.';
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

function buildPrompt(history, message, lang, chunks, profile, intake, followUpQuestion) {
  const transcript = history
    .slice(-8)
    .map((entry) => `${entry.role === 'assistant' ? 'Assistant' : 'User'}: ${entry.content}`)
    .join('\n');

  const answerLanguage = lang === 'ar' ? 'Arabic' : 'English';
  const sourceContext = chunks
    .map(({ chunk }, index) => [
      `Chunk ${index + 1}`,
      `Source ID: ${chunk.sourceId}`,
      `Title: ${chunk.title}`,
      `Organization: ${chunk.organization}`,
      `Category: ${chunk.category}`,
      `Specialty: ${chunk.specialty}`,
      `Topic pack: ${chunk.topicPack}`,
      `Evidence level: ${chunk.evidenceLevel}`,
      `Chunk text: ${chunk.text}`,
      chunk.url ? `URL: ${chunk.url}` : '',
    ].filter(Boolean).join('\n'))
    .join('\n\n');

  return [
    transcript ? `Conversation so far:\n${transcript}` : '',
    `Detected focus: specialty=${profile.primarySpecialty}; intent=${profile.primaryIntent}; vulnerable_groups=${profile.vulnerableGroups.join(', ') || 'none'}.`,
    intake ? `Structured intake:\n${formatIntakeForPrompt(intake, 'en')}` : '',
    `Approved medical knowledge base sources:\n${sourceContext}`,
    `User: ${message}`,
    followUpQuestion ? `If needed, end with this exact focused follow-up question or a close equivalent: ${followUpQuestion}` : '',
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
    'Mirror the user’s wording and answer the actual question first.',
    'Keep disclaimers brief and only when needed.',
    'Do not sound robotic, stiff, or like a report.',
    'If the question is broad or missing one key detail, you may ask one focused follow-up question after giving the safest general guidance from the sources.',
    'State clearly that the information is educational and not a substitute for an in-person clinician when the question is personal medical advice.',
  ].join(' ');
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

export function suggestFollowUpQuestion(profile, lang, intake) {
  if (profile.primaryIntent !== 'symptoms' && profile.primaryIntent !== 'triage') {
    return '';
  }

  if (!intake?.duration) {
    return lang === 'ar'
      ? 'منذ متى بدأت هذه الأعراض، وهل تزداد سوءًا؟'
      : 'How long have these symptoms been going on, and are they getting worse?';
  }

  if (profile.primarySpecialty === 'respiratory' && !intake?.fever) {
    return lang === 'ar'
      ? 'هل توجد حرارة أو ضيق في التنفس مع هذه الأعراض؟'
      : 'Do you also have fever or any shortness of breath with this?';
  }

  if (profile.primarySpecialty === 'general-medicine' && !intake?.severity) {
    return lang === 'ar'
      ? 'ما شدة العرض الآن، وهل يؤثر على نشاطك المعتاد؟'
      : 'How severe is it right now, and is it affecting your usual activity?';
  }

  return '';
}

function buildReasoningBasis(profile, selectedSources, intake, flags, lang) {
  const reasons = [];

  if (profile.primarySpecialty && profile.primarySpecialty !== 'general-medicine') {
    reasons.push(lang === 'ar'
      ? `تم توجيه السؤال إلى مجال ${profile.primarySpecialty}.`
      : `The question was routed toward ${profile.primarySpecialty}.`);
  }

  if (intake?.severity) {
    reasons.push(lang === 'ar'
      ? `أُخذت شدة الأعراض في الاعتبار: ${intake.severity}.`
      : `Symptom severity was considered: ${intake.severity}.`);
  }

  if (flags.urgent) {
    reasons.push(lang === 'ar'
      ? 'توجد مؤشرات تستدعي تقييمًا أسرع من المتابعة الروتينية.'
      : 'There are features that justify faster review than routine follow-up.');
  }

  for (const entry of selectedSources.slice(0, 3)) {
    reasons.push(lang === 'ar'
      ? `الاستناد إلى ${entry.source.organization} - ${entry.source.title}.`
      : `Grounded in ${entry.source.organization} - ${entry.source.title}.`);
  }

  return reasons;
}

export function buildAssessment({
  lang,
  profile,
  intake,
  selectedSources = [],
  flags = {},
}) {
  const followUpQuestion = suggestFollowUpQuestion(profile, lang, intake);

  let urgency = 'info_only';
  let recommendedAction = lang === 'ar'
    ? 'اتبع الإرشادات العامة وراقب الأعراض.'
    : 'Follow the general guidance and monitor symptoms.';

  if (flags.refusal) {
    urgency = 'refused';
    recommendedAction = lang === 'ar'
      ? 'اطلب مساعدة مباشرة من خدمة طبية أو طارئة مناسبة إذا كانت السلامة في خطر.'
      : 'Seek direct medical or emergency help if safety is at risk.';
  } else if (flags.nonMedical) {
    urgency = 'unsupported';
    recommendedAction = lang === 'ar'
      ? 'اطرح سؤالًا صحيًا أو طبيًا وسأجيب من المصادر المعتمدة.'
      : 'Ask a health or medical question and I will answer from approved sources.';
  } else if (flags.emergency) {
    urgency = 'emergency';
    recommendedAction = lang === 'ar'
      ? 'اطلب رعاية طارئة فورًا أو توجّه إلى أقرب طوارئ.'
      : 'Seek emergency care now or go to the nearest emergency department.';
  } else if (flags.insufficientEvidence) {
    urgency = 'insufficient_evidence';
    recommendedAction = lang === 'ar'
      ? 'راجع مختصًا أو أضف مصدرًا معتمدًا مناسبًا قبل الاعتماد على الإجابة.'
      : 'Consult a clinician or add an approved source before relying on an answer.';
  } else if (flags.urgent) {
    urgency = 'urgent';
    recommendedAction = lang === 'ar'
      ? 'رتّب تقييمًا طبيًا سريعًا اليوم أو خلال 24 ساعة إذا استمرت الأعراض أو ساءت.'
      : 'Arrange prompt medical review today or within 24 hours if symptoms persist or worsen.';
  } else if (profile.primaryIntent === 'symptoms' || profile.primaryIntent === 'triage') {
    urgency = 'routine';
    recommendedAction = lang === 'ar'
      ? 'راقب الأعراض واطلب مراجعة طبية إذا استمرت أو ظهرت علامات إنذار.'
      : 'Monitor symptoms and seek clinical review if they persist or warning signs appear.';
  } else if (profile.primaryIntent === 'medications') {
    urgency = 'medication_caution';
    recommendedAction = lang === 'ar'
      ? 'استخدم هذه المعلومات كمراجعة عامة فقط وارجع إلى صيدلي أو طبيب للجرعات الشخصية.'
      : 'Use this as general guidance only and confirm personal dosing with a pharmacist or clinician.';
  }

  return {
    urgency,
    recommendedAction,
    needsFollowUpQuestion: Boolean(followUpQuestion),
    followUpQuestion,
    reasoningBasis: buildReasoningBasis(profile, selectedSources, intake, flags, lang),
    specialty: profile.primarySpecialty,
    intent: profile.primaryIntent,
    vulnerableGroups: profile.vulnerableGroups,
  };
}

function mapCitations(selectedSources) {
  return selectedSources.map(({ source, matchedChunks }) => {
    const freshness = getSourceFreshness(source);
    const topChunk = matchedChunks?.[0]?.chunk;

    return {
      id: source.id,
      title: source.title,
      organization: source.organization,
      url: source.url,
      category: source.category,
      evidenceLevel: source.evidenceLevel,
      reviewStatus: source.reviewStatus,
      reviewedAt: source.reviewedAt,
      reviewOwner: source.reviewOwner,
      sourcePublishedAt: source.sourcePublishedAt,
      freshnessStatus: freshness.status,
      freshnessLabel: freshness.label,
      reasonSelected: topChunk?.text || source.summary,
    };
  });
}

function buildInteractionRecord({ responseId, lang, message, intake, history, citations, assessment, triage, grounded, refusal, model }) {
  return {
    id: responseId,
    createdAt: new Date().toISOString(),
    request: {
      lang,
      message,
      intake,
      history,
    },
    response: {
      triage,
      grounded,
      refusal,
      model: model || null,
      citations,
      assessment,
    },
  };
}

function sendSimpleReply({ res, stream, answer, citations, assessment, triage, grounded, refusal, model, interaction }) {
  const payload = {
    responseId: interaction.id,
    answer,
    citations,
    assessment,
    triage,
    grounded,
    refusal,
    model: model || null,
  };

  appendMedicalAssistantInteraction(interaction);

  if (!stream) {
    return payload;
  }

  startSse(res);
  sendSseEvent(res, 'delta', { token: answer });
  sendSseEvent(res, 'done', payload);
  res.end();
  return null;
}

async function handleAssistantChat(req, res) {
  if (!checkRateLimit('assistant', getClientKey(req))) {
    return sendJson(res, 429, { error: 'Too many assistant requests. Please slow down.' });
  }

  let payload;
  try {
    payload = await readRequestBody(req);
  } catch (error) {
    return sendJson(res, 400, { error: error.message });
  }

  const message = typeof payload?.message === 'string' ? payload.message.trim().slice(0, 4000) : '';
  const lang = payload?.lang === 'ar' ? 'ar' : 'en';
  const intake = normalizeIntake(payload?.intake);
  const history = sanitizeHistory(payload?.history);
  const stream = Boolean(payload?.stream);
  const responseId = crypto.randomUUID();

  if (!message) {
    return sendJson(res, 400, { error: 'Message is required.' });
  }

  const effectiveMessage = buildEffectiveMessage(message, intake, lang);
  const snapshot = getPersistedMedicalKnowledgeSnapshot();
  const { profile, selectedSources, selectedChunks } = selectGroundingContextFromChunks(
    snapshot.sources,
    snapshot.chunks,
    effectiveMessage,
    { sourceLimit: 4, chunkLimit: 8, maxChunksPerSource: 2 },
  );
  const citations = mapCitations(selectedSources);
  const urgent = hasUrgentSignals(effectiveMessage, intake, profile);

  if (isGreeting(message)) {
    const assessment = buildAssessment({ lang, profile, intake, flags: {} });
    const interaction = buildInteractionRecord({
      responseId,
      lang,
      message,
      intake,
      history,
      citations: [],
      assessment,
      triage: 'greeting',
      grounded: false,
      refusal: false,
      model: null,
    });
    const reply = sendSimpleReply({
      res,
      stream,
      answer: createGreetingAnswer(lang),
      citations: [],
      assessment,
      triage: 'greeting',
      grounded: false,
      refusal: false,
      interaction,
    });
    if (reply) return sendJson(res, 200, reply);
    return;
  }

  if (isSmallTalk(message)) {
    const assessment = buildAssessment({ lang, profile, intake, flags: {} });
    const interaction = buildInteractionRecord({
      responseId,
      lang,
      message,
      intake,
      history,
      citations: [],
      assessment,
      triage: 'small_talk',
      grounded: false,
      refusal: false,
      model: null,
    });
    const reply = sendSimpleReply({
      res,
      stream,
      answer: createSmallTalkAnswer(lang),
      citations: [],
      assessment,
      triage: 'small_talk',
      grounded: false,
      refusal: false,
      interaction,
    });
    if (reply) return sendJson(res, 200, reply);
    return;
  }

  if (!isMedicalTopic(effectiveMessage, history, profile, selectedSources)) {
    const assessment = buildAssessment({ lang, profile, intake, flags: { nonMedical: true } });
    const interaction = buildInteractionRecord({
      responseId,
      lang,
      message,
      intake,
      history,
      citations: [],
      assessment,
      triage: 'refusal',
      grounded: false,
      refusal: true,
      model: null,
    });
    const reply = sendSimpleReply({
      res,
      stream,
      answer: lang === 'ar'
        ? 'أتعامل فقط مع الأسئلة الصحية والطبية. اطرح سؤالًا طبيًا وسأجيب من قاعدة المعرفة المعتمدة.'
        : 'I only handle health and medical questions. Ask a medical question and I will answer from the approved knowledge base.',
      citations: [],
      assessment,
      triage: 'refusal',
      grounded: false,
      refusal: true,
      interaction,
    });
    if (reply) return sendJson(res, 200, reply);
    return;
  }

  if (shouldRefuse(message)) {
    const assessment = buildAssessment({ lang, profile, intake, selectedSources, flags: { refusal: true } });
    const interaction = buildInteractionRecord({
      responseId,
      lang,
      message,
      intake,
      history,
      citations,
      assessment,
      triage: 'refusal',
      grounded: false,
      refusal: true,
      model: null,
    });
    const reply = sendSimpleReply({
      res,
      stream,
      answer: lang === 'ar'
        ? 'لا أستطيع المساعدة في طلبات قد تسبب ضررًا أو تتضمن تزويرًا طبيًا أو إساءة استخدام للأدوية. إذا كان الأمر متعلقًا بسلامتك أو صحة شخص آخر، اطلب مساعدة طبية أو طارئة مباشرة.'
        : 'I cannot help with requests involving harm, forged medical material, or unsafe medication misuse. If this concerns your safety or someone else’s, seek direct medical or emergency help.',
      citations,
      assessment,
      triage: 'refusal',
      grounded: false,
      refusal: true,
      interaction,
    });
    if (reply) return sendJson(res, 200, reply);
    return;
  }

  if (hasEmergencySignals(effectiveMessage)) {
    const assessment = buildAssessment({ lang, profile, intake, selectedSources, flags: { emergency: true } });
    const interaction = buildInteractionRecord({
      responseId,
      lang,
      message,
      intake,
      history,
      citations,
      assessment,
      triage: 'emergency',
      grounded: true,
      refusal: false,
      model: null,
    });
    const reply = sendSimpleReply({
      res,
      stream,
      answer: lang === 'ar'
        ? 'توجد في سؤالك علامات إنذار قد تستدعي رعاية طارئة فورية. اطلب خدمات الطوارئ الآن أو توجه إلى أقرب قسم طوارئ، خاصة عند ألم الصدر أو صعوبة التنفس أو علامات الجلطة أو النزيف الشديد أو الإغماء أو التشنجات.'
        : 'Your question includes warning signs that may need immediate emergency care. Call emergency services now or go to the nearest emergency department, especially for chest pain, breathing difficulty, stroke symptoms, severe bleeding, fainting, or seizures.',
      citations,
      assessment,
      triage: 'emergency',
      grounded: true,
      refusal: false,
      interaction,
    });
    if (reply) return sendJson(res, 200, reply);
    return;
  }

  if (selectedSources.length === 0 || selectedChunks.length === 0) {
    const assessment = buildAssessment({ lang, profile, intake, flags: { insufficientEvidence: true, urgent } });
    const interaction = buildInteractionRecord({
      responseId,
      lang,
      message,
      intake,
      history,
      citations: [],
      assessment,
      triage: 'insufficient_evidence',
      grounded: false,
      refusal: false,
      model: null,
    });
    const reply = sendSimpleReply({
      res,
      stream,
      answer: lang === 'ar'
        ? 'لا أملك في قاعدة المعرفة الحالية مصادر معتمدة كافية للإجابة بأمان على هذا السؤال. أضف مصدرًا موثوقًا مناسبًا في لوحة الإدارة أو راجع مختصًا صحيًا.'
        : 'I do not have enough approved source material in the current knowledge base to answer this safely. Add a relevant trusted source in the admin knowledge base or consult a clinician.',
      citations: [],
      assessment,
      triage: 'insufficient_evidence',
      grounded: false,
      refusal: false,
      interaction,
    });
    if (reply) return sendJson(res, 200, reply);
    return;
  }

  try {
    const model = process.env.OLLAMA_MODEL || 'gemma3';
    const assessment = buildAssessment({ lang, profile, intake, selectedSources, flags: { urgent } });
    const response = await fetch(OLLAMA_GENERATE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        prompt: buildPrompt(history, effectiveMessage, lang, selectedChunks, profile, intake, assessment.followUpQuestion),
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
      let answer = '';

      for await (const chunk of response.body) {
        buffer += decoder.decode(chunk, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed) continue;

          const item = JSON.parse(trimmed);
          if (item.response) {
            answer += item.response;
            sendSseEvent(res, 'delta', { token: item.response });
          }
          if (item.done) {
            const interaction = buildInteractionRecord({
              responseId,
              lang,
              message,
              intake,
              history,
              citations,
              assessment,
              triage: 'standard',
              grounded: true,
              refusal: false,
              model,
            });
            appendMedicalAssistantInteraction(interaction);
            sendSseEvent(res, 'done', {
              responseId,
              answer: answer.trim(),
              citations,
              assessment,
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

      const interaction = buildInteractionRecord({
        responseId,
        lang,
        message,
        intake,
        history,
        citations,
        assessment,
        triage: 'standard',
        grounded: true,
        refusal: false,
        model,
      });
      appendMedicalAssistantInteraction(interaction);
      sendSseEvent(res, 'done', {
        responseId,
        answer: answer.trim(),
        citations,
        assessment,
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

    const interaction = buildInteractionRecord({
      responseId,
      lang,
      message,
      intake,
      history,
      citations,
      assessment,
      triage: 'standard',
      grounded: true,
      refusal: false,
      model,
    });
    appendMedicalAssistantInteraction(interaction);

    return sendJson(res, 200, {
      responseId,
      answer,
      citations,
      assessment,
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

async function handleAssistantFeedback(req, res) {
  if (!checkRateLimit('feedback', getClientKey(req))) {
    return sendJson(res, 429, { error: 'Too many feedback requests. Please slow down.' });
  }

  let payload;
  try {
    payload = await readRequestBody(req);
  } catch (error) {
    return sendJson(res, 400, { error: error.message });
  }

  const responseId = String(payload?.responseId || '').trim();
  const rating = String(payload?.rating || '').trim();
  const comment = String(payload?.comment || '').trim().slice(0, 500);

  if (!responseId || !['up', 'down'].includes(rating)) {
    return sendJson(res, 400, { error: 'Valid responseId and rating are required.' });
  }

  const interaction = saveMedicalAssistantFeedback(responseId, { rating, comment });
  if (!interaction) {
    return sendJson(res, 404, { error: 'Assistant response not found.' });
  }

  return sendJson(res, 200, {
    ok: true,
    feedback: interaction.feedback,
  });
}

export async function handleMedicalAssistantRequest(req, res) {
  const localPath = getLocalPath(req);

  if (req.method === 'GET' && localPath === '/analytics') {
    return sendJson(res, 200, getMedicalAssistantAnalytics());
  }

  if (req.method === 'POST' && localPath === '/feedback') {
    return handleAssistantFeedback(req, res);
  }

  if (req.method === 'POST' && localPath === '/') {
    return handleAssistantChat(req, res);
  }

  res.setHeader('Allow', 'GET, POST');
  return sendJson(res, 405, { error: 'Method not allowed.' });
}
