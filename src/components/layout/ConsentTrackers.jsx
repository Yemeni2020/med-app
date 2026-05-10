import { useEffect } from 'react';
import { useCookieConsent } from '@/lib/CookieConsentContext';
import { initGoogleAnalytics, initMetaPixel } from '@/lib/trackers';

export default function ConsentTrackers() {
  const { hasDecision, canUse } = useCookieConsent();

  useEffect(() => {
    if (!hasDecision) return;

    const gaId = import.meta.env.VITE_GA_MEASUREMENT_ID;
    const metaPixelId = import.meta.env.VITE_META_PIXEL_ID;

    if (canUse('analytics')) {
      initGoogleAnalytics(gaId);
    }

    if (canUse('marketing')) {
      initMetaPixel(metaPixelId);
    }
  }, [hasDecision, canUse]);

  return null;
}
