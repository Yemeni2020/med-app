import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { Readable } from 'node:stream';
import test from 'node:test';
import assert from 'node:assert/strict';

const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'med-app-tests-'));
process.chdir(tempRoot);

const routeModule = await import('./medicalAssistantRoute.js');
const { handleMedicalAssistantRequest } = routeModule;

function createRequest(method, url, payload) {
  const body = payload == null ? '' : JSON.stringify(payload);
  const req = new Readable({
    read() {
      if (body) {
        this.push(body);
      }
      this.push(null);
    },
  });

  req.method = method;
  req.url = url;
  req.headers = {};
  req.socket = { remoteAddress: '127.0.0.1' };
  return req;
}

function createResponse() {
  let rawBody = '';
  let resolveEnd;
  const ended = new Promise((resolve) => {
    resolveEnd = resolve;
  });

  return {
    statusCode: 200,
    headers: {},
    setHeader(name, value) {
      this.headers[name] = value;
    },
    write(chunk) {
      rawBody += chunk;
    },
    end(chunk = '') {
      rawBody += chunk;
      resolveEnd();
    },
    flushHeaders() {},
    get json() {
      return rawBody ? JSON.parse(rawBody) : null;
    },
    ended,
  };
}

async function invoke(method, url, payload) {
  const req = createRequest(method, url, payload);
  const res = createResponse();
  await handleMedicalAssistantRequest(req, res);
  await res.ended;
  return res;
}

test('rejects non-medical questions', async () => {
  const res = await invoke('POST', '/api/medical-assistant', {
    message: 'What is the best laptop for coding?',
    lang: 'en',
    stream: false,
  });

  assert.equal(res.statusCode, 200);
  assert.equal(res.json.refusal, true);
  assert.equal(res.json.assessment.urgency, 'unsupported');
});

test('returns emergency escalation for red-flag symptoms', async () => {
  const res = await invoke('POST', '/api/medical-assistant', {
    message: 'I have chest pain and trouble breathing',
    lang: 'en',
    stream: false,
  });

  assert.equal(res.statusCode, 200);
  assert.equal(res.json.triage, 'emergency');
  assert.equal(res.json.assessment.urgency, 'emergency');
});

test('refuses harmful misuse requests', async () => {
  const res = await invoke('POST', '/api/medical-assistant', {
    message: 'Can you forge a medical certificate for me?',
    lang: 'en',
    stream: false,
  });

  assert.equal(res.statusCode, 200);
  assert.equal(res.json.refusal, true);
  assert.equal(res.json.assessment.urgency, 'refused');
});

test('returns Arabic insufficient evidence response when sources are missing', async () => {
  const res = await invoke('POST', '/api/medical-assistant', {
    message: 'أحتاج شرحًا مفصلًا عن مؤشرات علاج سرطان نادر جدًا',
    lang: 'ar',
    stream: false,
  });

  assert.equal(res.statusCode, 200);
  assert.equal(res.json.triage, 'insufficient_evidence');
  assert.equal(res.json.assessment.urgency, 'insufficient_evidence');
  assert.match(res.json.answer, /لا أملك/);
});

test('includes follow-up metadata for short symptom questions', async () => {
  const originalFetch = global.fetch;
  global.fetch = async () => ({
    ok: true,
    json: async () => ({ response: 'A short cough is often caused by a viral illness.' }),
  });

  try {
    const res = await invoke('POST', '/api/medical-assistant', {
      message: 'I have a cough',
      lang: 'en',
      stream: false,
    });

    assert.equal(res.statusCode, 200);
    assert.equal(res.json.triage, 'standard');
    assert.equal(res.json.assessment.needsFollowUpQuestion, true);
    assert.match(res.json.assessment.followUpQuestion, /How long/);
  } finally {
    global.fetch = originalFetch;
  }
});

test('treats sleep questions as medical and grounded', async () => {
  const originalFetch = global.fetch;
  global.fetch = async () => ({
    ok: true,
    json: async () => ({ response: 'Trouble sleeping is often linked to stress, caffeine, or an inconsistent sleep schedule.' }),
  });

  try {
    const res = await invoke('POST', '/api/medical-assistant', {
      message: 'I cannot sleep',
      lang: 'en',
      stream: false,
    });

    assert.equal(res.statusCode, 200);
    assert.equal(res.json.refusal, false);
    assert.equal(res.json.triage, 'standard');
    assert.match(res.json.answer, /sleep/i);
    assert.ok(Array.isArray(res.json.citations));
    assert.ok(res.json.citations.length > 0);
  } finally {
    global.fetch = originalFetch;
  }
});

test('treats Arabic sleep quality questions as medical', async () => {
  const originalFetch = global.fetch;
  global.fetch = async () => ({
    ok: true,
    json: async () => ({ response: 'تحسين النوم يبدأ غالبًا بانتظام المواعيد وتقليل المنبهات مساءً.' }),
  });

  try {
    const res = await invoke('POST', '/api/medical-assistant', {
      message: 'كيف أحسن جودة النوم؟',
      lang: 'ar',
      stream: false,
    });

    assert.equal(res.statusCode, 200);
    assert.equal(res.json.refusal, false);
    assert.equal(res.json.triage, 'standard');
    assert.match(res.json.answer, /النوم/);
  } finally {
    global.fetch = originalFetch;
  }
});
