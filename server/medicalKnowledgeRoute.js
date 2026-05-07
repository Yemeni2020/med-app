import {
  deletePersistedMedicalKnowledgeSource,
  getPersistedMedicalKnowledgeSnapshot,
  importPersistedMedicalKnowledgeSources,
  listPersistedMedicalKnowledgeSources,
  savePersistedMedicalKnowledgeSource,
} from './medicalKnowledgeStore.js';

function readRequestBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk;
      if (body.length > 1_000_000) {
        reject(new Error('Request body too large.'));
      }
    });
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch {
        reject(new Error('Invalid JSON payload.'));
      }
    });
    req.on('error', reject);
  });
}

function sendJson(res, statusCode, payload) {
  res.statusCode = statusCode;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.end(JSON.stringify(payload));
}

export async function handleMedicalKnowledgeRequest(req, res) {
  const url = new URL(req.url, 'http://localhost');
  const pathname = url.pathname.replace(/\/+$/, '');
  const localPath = pathname.replace(/^\/api\/medical-knowledge/, '') || '/';

  if (req.method === 'GET' && localPath === '/sources') {
    const snapshot = getPersistedMedicalKnowledgeSnapshot();
    return sendJson(res, 200, {
      sources: listPersistedMedicalKnowledgeSources(),
      stats: snapshot.stats,
      updatedAt: snapshot.updatedAt,
    });
  }

  if (req.method === 'POST' && localPath === '/sources') {
    try {
      const payload = await readRequestBody(req);
      const source = savePersistedMedicalKnowledgeSource(payload?.source || payload);
      const snapshot = getPersistedMedicalKnowledgeSnapshot();
      return sendJson(res, 200, {
        source,
        stats: snapshot.stats,
      });
    } catch (error) {
      return sendJson(res, 400, { error: error.message || 'Could not save source.' });
    }
  }

  if (req.method === 'POST' && localPath === '/import') {
    try {
      const payload = await readRequestBody(req);
      const imported = importPersistedMedicalKnowledgeSources(Array.isArray(payload?.sources) ? payload.sources : []);
      const snapshot = getPersistedMedicalKnowledgeSnapshot();
      return sendJson(res, 200, {
        sources: imported,
        stats: snapshot.stats,
      });
    } catch (error) {
      return sendJson(res, 400, { error: error.message || 'Could not import sources.' });
    }
  }

  if (req.method === 'DELETE' && localPath.startsWith('/sources/')) {
    const id = decodeURIComponent(localPath.replace('/sources/', ''));
    const remaining = deletePersistedMedicalKnowledgeSource(id);
    const snapshot = getPersistedMedicalKnowledgeSnapshot();
    return sendJson(res, 200, {
      sources: remaining,
      stats: snapshot.stats,
    });
  }

  return sendJson(res, 404, { error: 'Not found.' });
}
