async function request(path, options = {}) {
  const response = await fetch(path, {
    headers: {
      'Content-Type': 'application/json',
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
  return request('/api/medical-assistant/feedback', {
    method: 'POST',
    body: JSON.stringify({ responseId, rating, comment }),
  });
}

export function getMedicalAssistantAnalytics() {
  return request('/api/medical-assistant/analytics');
}
