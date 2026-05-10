import { medApiRequest } from '@/lib/med-api';

export async function listMedicalKnowledgeSources() {
  const payload = await medApiRequest('/medical-knowledge/sources');
  return payload;
}

export async function saveMedicalKnowledgeSource(source) {
  const payload = await medApiRequest('/medical-knowledge/sources', {
    method: 'POST',
    body: JSON.stringify({ source }),
  });
  return payload;
}

export async function importMedicalKnowledgeSources(sources) {
  const payload = await medApiRequest('/medical-knowledge/import', {
    method: 'POST',
    body: JSON.stringify({ sources }),
  });
  return payload;
}

export async function deleteMedicalKnowledgeSource(id) {
  const payload = await medApiRequest(`/medical-knowledge/sources/${encodeURIComponent(id)}`, {
    method: 'DELETE',
  });
  return payload;
}
