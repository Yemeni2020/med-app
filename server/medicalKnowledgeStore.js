import fs from 'node:fs';
import path from 'node:path';
import {
  buildKnowledgeChunks,
  defaultMedicalSources,
  getSourceFreshness,
  mergeKnowledgeSources,
  normalizeSource,
} from '../src/lib/medicalKnowledgeBase.js';

const DATA_DIR = path.resolve(process.cwd(), 'data');
const STORE_PATH = path.join(DATA_DIR, 'medical-rag-store.json');
const STORE_VERSION = 1;

const defaultSources = defaultMedicalSources
  .map((source) => normalizeSource(source, true))
  .filter(Boolean);
const defaultSourceIds = new Set(defaultSources.map((source) => source.id));
const defaultChunks = buildKnowledgeChunks(defaultSources);

function ensureStoreFile() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  if (!fs.existsSync(STORE_PATH)) {
    const initial = {
      version: STORE_VERSION,
      updatedAt: new Date().toISOString(),
      customSources: [],
      customChunks: [],
    };
    fs.writeFileSync(STORE_PATH, `${JSON.stringify(initial, null, 2)}\n`, 'utf8');
  }
}

function loadStore() {
  ensureStoreFile();

  try {
    const parsed = JSON.parse(fs.readFileSync(STORE_PATH, 'utf8'));
    const customSources = Array.isArray(parsed?.customSources)
      ? parsed.customSources.map((source) => normalizeSource(source, false)).filter(Boolean)
      : [];

    return {
      version: STORE_VERSION,
      updatedAt: parsed?.updatedAt || new Date().toISOString(),
      customSources,
      customChunks: buildKnowledgeChunks(customSources),
    };
  } catch {
    return {
      version: STORE_VERSION,
      updatedAt: new Date().toISOString(),
      customSources: [],
      customChunks: [],
    };
  }
}

function persistStore(customSources) {
  ensureStoreFile();

  const normalizedSources = customSources
    .map((source) => normalizeSource(source, false))
    .filter(Boolean);

  const payload = {
    version: STORE_VERSION,
    updatedAt: new Date().toISOString(),
    customSources: normalizedSources,
    customChunks: buildKnowledgeChunks(normalizedSources),
  };

  fs.writeFileSync(STORE_PATH, `${JSON.stringify(payload, null, 2)}\n`, 'utf8');
  return payload;
}

export function listPersistedMedicalKnowledgeSources() {
  return loadStore().customSources;
}

export function getPersistedMedicalKnowledgeSnapshot() {
  const store = loadStore();
  const mergedSources = mergeKnowledgeSources(store.customSources);
  const mergedChunks = [
    ...defaultChunks,
    ...store.customChunks.filter((chunk) => !defaultSourceIds.has(chunk.sourceId)),
  ];
  const approvedCustomSources = store.customSources.filter((source) => source.reviewStatus === 'approved');
  const staleCustomSources = store.customSources.filter((source) => getSourceFreshness(source).status === 'stale');
  const expiringCustomSources = store.customSources.filter((source) => getSourceFreshness(source).status === 'expiring');

  return {
    version: store.version,
    updatedAt: store.updatedAt,
    customSources: store.customSources,
    customChunks: store.customChunks,
    sources: mergedSources,
    chunks: mergedChunks,
    stats: {
      sourceCount: mergedSources.length,
      customSourceCount: store.customSources.length,
      approvedCustomSourceCount: approvedCustomSources.length,
      draftCustomSourceCount: store.customSources.length - approvedCustomSources.length,
      staleCustomSourceCount: staleCustomSources.length,
      expiringCustomSourceCount: expiringCustomSources.length,
      chunkCount: mergedChunks.length,
      defaultChunkCount: defaultChunks.length,
      customChunkCount: store.customChunks.length,
    },
  };
}

export function savePersistedMedicalKnowledgeSource(source) {
  const normalized = normalizeSource(source, false);
  if (!normalized) {
    throw new Error('Missing required source fields.');
  }

  const existing = listPersistedMedicalKnowledgeSources().filter((item) => item.id !== normalized.id);
  const nextStore = persistStore([normalized, ...existing]);
  return nextStore.customSources.find((item) => item.id === normalized.id);
}

export function importPersistedMedicalKnowledgeSources(sources) {
  const normalizedSources = sources
    .map((source) => normalizeSource(source, false))
    .filter(Boolean);

  const byId = new Map();
  for (const source of [...listPersistedMedicalKnowledgeSources(), ...normalizedSources]) {
    byId.set(source.id, source);
  }

  const nextStore = persistStore(Array.from(byId.values()));
  return nextStore.customSources;
}

export function deletePersistedMedicalKnowledgeSource(id) {
  const remaining = listPersistedMedicalKnowledgeSources().filter((source) => source.id !== id);
  const nextStore = persistStore(remaining);
  return nextStore.customSources;
}
