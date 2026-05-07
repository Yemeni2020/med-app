import fs from 'node:fs';
import path from 'node:path';

const DATA_DIR = path.resolve(process.cwd(), 'data');
const STORE_PATH = path.join(DATA_DIR, 'medical-assistant-log.json');
const STORE_VERSION = 1;
const MAX_LOG_ENTRIES = 500;

function ensureStoreFile() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  if (!fs.existsSync(STORE_PATH)) {
    const initial = {
      version: STORE_VERSION,
      updatedAt: new Date().toISOString(),
      interactions: [],
    };
    fs.writeFileSync(STORE_PATH, `${JSON.stringify(initial, null, 2)}\n`, 'utf8');
  }
}

function loadStore() {
  ensureStoreFile();

  try {
    const parsed = JSON.parse(fs.readFileSync(STORE_PATH, 'utf8'));
    return {
      version: STORE_VERSION,
      updatedAt: parsed?.updatedAt || new Date().toISOString(),
      interactions: Array.isArray(parsed?.interactions) ? parsed.interactions : [],
    };
  } catch {
    return {
      version: STORE_VERSION,
      updatedAt: new Date().toISOString(),
      interactions: [],
    };
  }
}

function persistStore(interactions) {
  ensureStoreFile();
  const payload = {
    version: STORE_VERSION,
    updatedAt: new Date().toISOString(),
    interactions: interactions.slice(0, MAX_LOG_ENTRIES),
  };
  fs.writeFileSync(STORE_PATH, `${JSON.stringify(payload, null, 2)}\n`, 'utf8');
  return payload;
}

export function appendMedicalAssistantInteraction(interaction) {
  const store = loadStore();
  const nextInteractions = [interaction, ...store.interactions].slice(0, MAX_LOG_ENTRIES);
  persistStore(nextInteractions);
  return interaction;
}

export function saveMedicalAssistantFeedback(responseId, feedback) {
  const store = loadStore();
  const nextInteractions = store.interactions.map((interaction) => (
    interaction.id === responseId
      ? {
          ...interaction,
          feedback: {
            rating: feedback.rating,
            comment: feedback.comment || '',
            updatedAt: new Date().toISOString(),
          },
        }
      : interaction
  ));

  persistStore(nextInteractions);
  return nextInteractions.find((interaction) => interaction.id === responseId) || null;
}

export function getMedicalAssistantAnalytics() {
  const store = loadStore();
  const interactions = store.interactions;
  const feedback = interactions.filter((interaction) => interaction.feedback?.rating);
  const positive = feedback.filter((interaction) => interaction.feedback.rating === 'up').length;
  const negative = feedback.filter((interaction) => interaction.feedback.rating === 'down').length;
  const byUrgency = interactions.reduce((accumulator, interaction) => {
    const urgency = interaction.response?.assessment?.urgency || 'unknown';
    accumulator[urgency] = (accumulator[urgency] || 0) + 1;
    return accumulator;
  }, {});

  return {
    updatedAt: store.updatedAt,
    totals: {
      interactions: interactions.length,
      feedback: feedback.length,
      positive,
      negative,
    },
    byUrgency,
    recent: interactions.slice(0, 20),
  };
}
