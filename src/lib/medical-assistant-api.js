import { medApiRequest } from '@/lib/med-api';

export function submitMedicalAssistantFeedback({ responseId, rating, comment }) {
  return medApiRequest('/medical-assistant/feedback', {
    method: 'POST',
    body: JSON.stringify({ responseId, rating, comment }),
  });
}

export function getMedicalAssistantAnalytics() {
  return medApiRequest('/medical-assistant/analytics');
}
