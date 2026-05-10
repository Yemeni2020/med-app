import React, { createContext, useContext, useMemo, useState } from 'react';
import { defaultConsent, readConsentCookie, writeConsentCookie } from '@/lib/cookie-consent';

const CookieConsentContext = createContext(null);

export function CookieConsentProvider({ children }) {
  const [preferences, setPreferences] = useState(() => readConsentCookie() || defaultConsent);
  const [hasDecision, setHasDecision] = useState(() => Boolean(readConsentCookie()));
  const [isPreferencesOpen, setIsPreferencesOpen] = useState(false);

  const applyDecision = (nextPreferences) => {
    const normalized = {
      necessary: true,
      functional: Boolean(nextPreferences.functional),
      analytics: Boolean(nextPreferences.analytics),
      marketing: Boolean(nextPreferences.marketing),
    };
    setPreferences(normalized);
    setHasDecision(true);
    writeConsentCookie(normalized);
  };

  const acceptAll = () => {
    applyDecision({
      necessary: true,
      functional: true,
      analytics: true,
      marketing: true,
    });
    setIsPreferencesOpen(false);
  };

  const rejectNonEssential = () => {
    applyDecision({
      necessary: true,
      functional: false,
      analytics: false,
      marketing: false,
    });
    setIsPreferencesOpen(false);
  };

  const savePreferences = (nextPreferences) => {
    applyDecision(nextPreferences);
    setIsPreferencesOpen(false);
  };

  const value = useMemo(() => ({
    preferences,
    hasDecision,
    isPreferencesOpen,
    setIsPreferencesOpen,
    acceptAll,
    rejectNonEssential,
    savePreferences,
    canUse(category) {
      if (category === 'necessary') return true;
      return Boolean(preferences[category]);
    },
  }), [preferences, hasDecision, isPreferencesOpen]);

  return (
    <CookieConsentContext.Provider value={value}>
      {children}
    </CookieConsentContext.Provider>
  );
}

export function useCookieConsent() {
  const context = useContext(CookieConsentContext);
  if (!context) {
    throw new Error('useCookieConsent must be used within CookieConsentProvider');
  }
  return context;
}
