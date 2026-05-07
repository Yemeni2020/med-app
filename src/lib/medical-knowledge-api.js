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
    throw new Error(payload?.error || 'Medical knowledge request failed.');
  }

  return payload;
}

export async function listMedicalKnowledgeSources() {
  const payload = await request('/api/med/medical-knowledge/sources');
  return payload;
}

export async function saveMedicalKnowledgeSource(source) {
  const payload = await request('/api/med/medical-knowledge/sources', {
    method: 'POST',
    body: JSON.stringify({ source }),
  });
  return payload;
}

export async function importMedicalKnowledgeSources(sources) {
  const payload = await request('/api/med/medical-knowledge/import', {
    method: 'POST',
    body: JSON.stringify({ sources }),
  });
  return payload;
}

export async function deleteMedicalKnowledgeSource(id) {
  const payload = await request(`/api/med/medical-knowledge/sources/${encodeURIComponent(id)}`, {
    method: 'DELETE',
  });
  return payload;
}
