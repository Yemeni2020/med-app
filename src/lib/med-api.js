const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '');
const CLIENT_ID_KEY = 'med-app-client-id';

function getClientId() {
  if (typeof window === 'undefined') return 'server-render';

  let value = window.localStorage.getItem(CLIENT_ID_KEY);
  if (!value) {
    value = window.crypto?.randomUUID?.() || `client-${Date.now()}`;
    window.localStorage.setItem(CLIENT_ID_KEY, value);
  }
  return value;
}

function buildUrl(path) {
  return API_BASE_URL ? `${API_BASE_URL}${path}` : path;
}

async function request(path, options = {}) {
  const response = await fetch(buildUrl(path), {
    headers: {
      'Content-Type': 'application/json',
      'X-Client-Id': getClientId(),
      'X-App-Locale': typeof document !== 'undefined' ? document.documentElement.lang || 'en' : 'en',
      ...(options.headers || {}),
    },
    ...options,
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload?.message || payload?.error || 'Request failed.');
  }

  return payload;
}

export function medApiRequest(path, options) {
  return request(`/api/med${path}`, options);
}

export async function listArticles(limit = 50) {
  return medApiRequest(`/articles?limit=${limit}`);
}

export async function getArticle(id) {
  return medApiRequest(`/articles/${encodeURIComponent(id)}`);
}

export async function listDoctors() {
  return medApiRequest('/doctors');
}

export async function listMedicalNews() {
  return medApiRequest('/news');
}

export async function listQASessions() {
  return medApiRequest('/qa-sessions');
}

export async function listPatientStories() {
  return medApiRequest('/patient-stories');
}

export async function createPatientStory(story) {
  return medApiRequest('/patient-stories', {
    method: 'POST',
    body: JSON.stringify(story),
  });
}

export async function analyzeSymptoms(symptoms, lang = 'en') {
  return medApiRequest('/symptom-checker/analyze', {
    method: 'POST',
    body: JSON.stringify({ symptoms, lang }),
  });
}

export async function listSavedItems() {
  return medApiRequest('/saved-items');
}

export async function saveItem(item) {
  return medApiRequest('/saved-items', {
    method: 'POST',
    body: JSON.stringify(item),
  });
}

export async function removeSavedItem(itemId) {
  return medApiRequest(`/saved-items/${encodeURIComponent(itemId)}`, {
    method: 'DELETE',
  });
}

export async function listHealthMetrics() {
  return medApiRequest('/health-metrics');
}

export async function createHealthMetric(metric) {
  return medApiRequest('/health-metrics', {
    method: 'POST',
    body: JSON.stringify(metric),
  });
}

export async function deleteHealthMetric(id) {
  return medApiRequest(`/health-metrics/${encodeURIComponent(id)}`, {
    method: 'DELETE',
  });
}

export async function saveNewsletterSubscription(subscription) {
  return request('/api/newsletter/subscribe', {
    method: 'POST',
    body: JSON.stringify(subscription),
  });
}
