async function request(path, options = {}) {
  const response = await fetch(path, {
    headers: {
      'Content-Type': 'application/json',
      'X-Client-Id': typeof window !== 'undefined'
        ? (window.localStorage.getItem('med-app-client-id') || (() => {
            const id = window.crypto?.randomUUID?.() || `client-${Date.now()}`;
            window.localStorage.setItem('med-app-client-id', id);
            return id;
          })())
        : 'server-render',
      ...(options.headers || {}),
    },
    ...options,
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload?.error || 'Medical assistant request failed.');
  }

  return payload;
}

export function submitMedicalAssistantFeedback({ responseId, rating, comment }) {
  return request('/api/med/medical-assistant/feedback', {
    method: 'POST',
    body: JSON.stringify({ responseId, rating, comment }),
  });
}

export function getMedicalAssistantAnalytics() {
  return request('/api/med/medical-assistant/analytics');
}
