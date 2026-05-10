const CONSENT_COOKIE_NAME = 'med_consent_v1';
const CONSENT_MAX_AGE_DAYS = 180;

export const defaultConsent = {
  necessary: true,
  functional: false,
  analytics: false,
  marketing: false,
};

function getCookieValue(name) {
  if (typeof document === 'undefined') return '';
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length !== 2) return '';
  return parts.pop()?.split(';').shift() || '';
}

export function readConsentCookie() {
  const raw = getCookieValue(CONSENT_COOKIE_NAME);
  if (!raw) return null;

  try {
    const parsed = JSON.parse(decodeURIComponent(raw));
    return {
      necessary: true,
      functional: Boolean(parsed.functional),
      analytics: Boolean(parsed.analytics),
      marketing: Boolean(parsed.marketing),
      updatedAt: parsed.updatedAt || null,
    };
  } catch {
    return null;
  }
}

export function writeConsentCookie(preferences) {
  if (typeof document === 'undefined') return;
  const maxAge = CONSENT_MAX_AGE_DAYS * 24 * 60 * 60;
  const payload = encodeURIComponent(JSON.stringify({
    functional: Boolean(preferences.functional),
    analytics: Boolean(preferences.analytics),
    marketing: Boolean(preferences.marketing),
    updatedAt: new Date().toISOString(),
  }));
  document.cookie = `${CONSENT_COOKIE_NAME}=${payload}; path=/; max-age=${maxAge}; SameSite=Lax`;
}
