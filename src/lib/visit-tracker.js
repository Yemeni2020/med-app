import { apiRequest, getClientId } from '@/lib/med-api';

const TRACKED_PATHS_KEY = 'med-app-tracked-site-paths';

const PUBLIC_SITE_PATTERNS = [
  /^\/$/,
  /^\/articles(?:\/[^/]+)?$/,
  /^\/health-tools$/,
  /^\/stories(?:\/[^/]+)?$/,
  /^\/qa$/,
  /^\/news$/,
  /^\/guidelines$/,
  /^\/doctors(?:\/[^/]+)?$/,
  /^\/policy$/,
  /^\/privacy$/,
  /^\/symptom-checker$/,
];

function isTrackablePublicPath(pathname) {
  return PUBLIC_SITE_PATTERNS.some((pattern) => pattern.test(pathname));
}

function getTrackedPaths() {
  try {
    const stored = window.sessionStorage.getItem(TRACKED_PATHS_KEY);
    const parsed = stored ? JSON.parse(stored) : [];

    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function setTrackedPaths(paths) {
  window.sessionStorage.setItem(TRACKED_PATHS_KEY, JSON.stringify(paths));
}

export async function trackPublicSiteVisit(pathname, search = '') {
  if (typeof window === 'undefined' || !isTrackablePublicPath(pathname)) {
    return;
  }

  const path = `${pathname}${search}`;
  const trackedPaths = getTrackedPaths();

  if (trackedPaths.includes(path)) {
    return;
  }

  setTrackedPaths([...trackedPaths, path]);

  try {
    await apiRequest('/site-visits', {
      method: 'POST',
      body: JSON.stringify({
        visitor_id: getClientId(),
        path,
        referrer: document.referrer || null,
      }),
    });
  } catch {
    // Visit tracking should never block navigation.
  }
}
