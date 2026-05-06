const OPENAI_API_URL = 'https://api.openai.com/v1/responses';

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

function extractOutputText(responseBody) {
  if (typeof responseBody?.output_text === 'string' && responseBody.output_text.trim()) {
    return responseBody.output_text.trim();
  }

  const outputItems = Array.isArray(responseBody?.output) ? responseBody.output : [];
  for (const item of outputItems) {
    if (!Array.isArray(item?.content)) continue;
    for (const contentItem of item.content) {
      if (contentItem?.type === 'output_text' && typeof contentItem?.text === 'string' && contentItem.text.trim()) {
        return contentItem.text.trim();
      }
    }
  }

  return '';
}

function buildPrompt(history, message, lang) {
  const transcript = history
    .slice(-8)
    .map((entry) => `${entry.role === 'assistant' ? 'Assistant' : 'User'}: ${entry.content}`)
    .join('\n');

  const answerLanguage = lang === 'ar' ? 'Arabic' : 'English';

  return [
    transcript ? `Conversation so far:\n${transcript}` : '',
    `User: ${message}`,
    '',
    `Respond in ${answerLanguage}.`,
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
    'Be clinically cautious, calm, and direct. Never joke, roleplay, moralize, or fabricate.',
    'Do not invent facts, studies, or citations. If you are uncertain, say so plainly.',
    'Do not present your answer as a diagnosis. Explain possibilities and uncertainty when symptoms are discussed.',
    'If the user mentions emergency warning signs such as chest pain, trouble breathing, stroke symptoms, severe bleeding, seizure, confusion, suicidal thoughts, or anaphylaxis, tell them to seek immediate emergency care.',
    'Do not tell people to delay urgent care.',
    'Do not give unsafe or overly specific medication dosing for children, pregnancy, frail older adults, or complex high-risk situations. Recommend a clinician or pharmacist for personalized dosing.',
    'Prefer short structured answers with these sections when useful: Direct answer, Why, When to seek care, Limits.',
    'State clearly that the information is educational and not a substitute for an in-person clinician when the question is personal medical advice.',
  ].join(' ');
}

export async function handleMedicalAssistantRequest(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return sendJson(res, 405, { error: 'Method not allowed.' });
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return sendJson(res, 503, {
      error: 'Medical assistant is not configured yet. Set OPENAI_API_KEY on the server.',
    });
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

  if (!message) {
    return sendJson(res, 400, { error: 'Message is required.' });
  }

  try {
    const response = await fetch(OPENAI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || 'gpt-5.5',
        instructions: buildInstructions(lang),
        input: buildPrompt(history, message, lang),
        max_output_tokens: 900,
        temperature: 0.2,
      }),
    });

    const responseBody = await response.json();

    if (!response.ok) {
      const errorMessage =
        responseBody?.error?.message ||
        'The assistant could not generate a response.';
      return sendJson(res, response.status, { error: errorMessage });
    }

    const answer = extractOutputText(responseBody);
    if (!answer) {
      return sendJson(res, 502, { error: 'The assistant returned an empty response.' });
    }

    return sendJson(res, 200, {
      answer,
      model: process.env.OPENAI_MODEL || 'gpt-5.5',
    });
  } catch (error) {
    return sendJson(res, 500, {
      error: 'The assistant is temporarily unavailable.',
      detail: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
