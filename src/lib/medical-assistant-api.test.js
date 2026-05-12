import { describe, expect, it, vi } from 'vitest';

vi.mock('@/lib/med-api', () => ({
  askMedicalAssistant: vi.fn(async (payload) => ({ ok: true, payload })),
  medApiRequest: vi.fn(async (path, options) => ({ path, options })),
}));

const { createMedicalAssistantResponse, submitMedicalAssistantFeedback } = await import('@/lib/medical-assistant-api');
const { askMedicalAssistant, medApiRequest } = await import('@/lib/med-api');

describe('medical assistant api helpers', () => {
  it('sends assistant payload through the backend med endpoint helper', async () => {
    const payload = { lang: 'en', message: 'What is hypertension?' };
    const result = await createMedicalAssistantResponse(payload);

    expect(askMedicalAssistant).toHaveBeenCalledWith(payload);
    expect(result).toEqual({ ok: true, payload });
  });

  it('submits assistant feedback to the backend api', async () => {
    await submitMedicalAssistantFeedback({ responseId: 'abc', rating: 'up', comment: 'helpful' });

    expect(medApiRequest).toHaveBeenCalledWith('/medical-assistant/feedback', {
      method: 'POST',
      body: JSON.stringify({ responseId: 'abc', rating: 'up', comment: 'helpful' }),
    });
  });
});
