import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/lib/LanguageContext';
import { useCookieConsent } from '@/lib/CookieConsentContext';

function PreferenceToggle({ checked, disabled = false, onChange }) {
  return (
    <button
      type="button"
      onClick={onChange}
      disabled={disabled}
      className={`relative h-6 w-11 rounded-full transition-colors ${checked ? 'bg-primary' : 'bg-muted-foreground/30'} ${disabled ? 'opacity-70 cursor-not-allowed' : ''}`}
    >
      <span className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${checked ? 'translate-x-5' : 'translate-x-0'}`} />
    </button>
  );
}

export default function CookieConsentBanner() {
  const { t } = useLanguage();
  const {
    hasDecision,
    preferences,
    isPreferencesOpen,
    setIsPreferencesOpen,
    acceptAll,
    rejectNonEssential,
    savePreferences,
  } = useCookieConsent();
  const [draft, setDraft] = useState(preferences);

  useEffect(() => {
    setDraft(preferences);
  }, [preferences, isPreferencesOpen]);

  if (hasDecision && !isPreferencesOpen) {
    return null;
  }

  return (
    <div className="fixed inset-x-0 bottom-0 z-[90] p-3 sm:p-4">
      {!isPreferencesOpen ? (
        <div className="mx-auto max-w-5xl rounded-2xl border border-border bg-card/95 backdrop-blur shadow-2xl p-4 sm:p-5">
          <p className="font-semibold text-foreground">{t.cookies.title}</p>
          <p className="mt-1 text-sm text-muted-foreground">{t.cookies.description}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button className="rounded-xl" onClick={acceptAll}>{t.cookies.acceptAll}</Button>
            <Button variant="outline" className="rounded-xl" onClick={rejectNonEssential}>{t.cookies.rejectNonEssential}</Button>
            <Button variant="ghost" className="rounded-xl" onClick={() => setIsPreferencesOpen(true)}>{t.cookies.managePreferences}</Button>
          </div>
        </div>
      ) : (
        <div className="mx-auto max-w-2xl rounded-2xl border border-border bg-card shadow-2xl p-5">
          <p className="font-semibold text-foreground">{t.cookies.managePreferences}</p>
          <p className="mt-1 text-sm text-muted-foreground">{t.cookies.preferencesDescription}</p>

          <div className="mt-4 space-y-3">
            <div className="flex items-center justify-between rounded-xl border border-border p-3">
              <div>
                <p className="text-sm font-medium">{t.cookies.categories.necessary}</p>
                <p className="text-xs text-muted-foreground">{t.cookies.categories.necessaryDesc}</p>
              </div>
              <PreferenceToggle checked disabled />
            </div>

            <div className="flex items-center justify-between rounded-xl border border-border p-3">
              <div>
                <p className="text-sm font-medium">{t.cookies.categories.functional}</p>
                <p className="text-xs text-muted-foreground">{t.cookies.categories.functionalDesc}</p>
              </div>
              <PreferenceToggle
                checked={draft.functional}
                onChange={() => setDraft((prev) => ({ ...prev, functional: !prev.functional }))}
              />
            </div>

            <div className="flex items-center justify-between rounded-xl border border-border p-3">
              <div>
                <p className="text-sm font-medium">{t.cookies.categories.analytics}</p>
                <p className="text-xs text-muted-foreground">{t.cookies.categories.analyticsDesc}</p>
              </div>
              <PreferenceToggle
                checked={draft.analytics}
                onChange={() => setDraft((prev) => ({ ...prev, analytics: !prev.analytics }))}
              />
            </div>

            <div className="flex items-center justify-between rounded-xl border border-border p-3">
              <div>
                <p className="text-sm font-medium">{t.cookies.categories.marketing}</p>
                <p className="text-xs text-muted-foreground">{t.cookies.categories.marketingDesc}</p>
              </div>
              <PreferenceToggle
                checked={draft.marketing}
                onChange={() => setDraft((prev) => ({ ...prev, marketing: !prev.marketing }))}
              />
            </div>
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            <Button className="rounded-xl" onClick={() => savePreferences(draft)}>{t.cookies.savePreferences}</Button>
            <Button variant="outline" className="rounded-xl" onClick={acceptAll}>{t.cookies.acceptAll}</Button>
            <Button variant="ghost" className="rounded-xl" onClick={() => setIsPreferencesOpen(false)}>{t.common.cancel}</Button>
          </div>
        </div>
      )}
    </div>
  );
}
