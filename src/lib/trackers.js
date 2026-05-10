function appendScript({ id, src, inline, async = true }) {
  if (typeof document === 'undefined') return;
  if (document.getElementById(id)) return;

  const script = document.createElement('script');
  script.id = id;
  script.async = async;

  if (src) {
    script.src = src;
  }

  if (inline) {
    script.text = inline;
  }

  document.head.appendChild(script);
}

export function initGoogleAnalytics(measurementId) {
  if (!measurementId || typeof window === 'undefined') return;
  if (window.__medGaInitialized) return;

  appendScript({
    id: 'med-ga-lib',
    src: `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(measurementId)}`,
  });

  appendScript({
    id: 'med-ga-init',
    inline: `
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      window.gtag = gtag;
      gtag('js', new Date());
      gtag('config', '${measurementId}', { anonymize_ip: true });
    `,
  });

  window.__medGaInitialized = true;
}

export function initMetaPixel(pixelId) {
  if (!pixelId || typeof window === 'undefined') return;
  if (window.__medMetaPixelInitialized) return;

  appendScript({
    id: 'med-meta-pixel-init',
    inline: `
      !function(f,b,e,v,n,t,s)
      {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
      n.callMethod.apply(n,arguments):n.queue.push(arguments)};
      if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
      n.queue=[];t=b.createElement(e);t.async=!0;
      t.src=v;s=b.getElementsByTagName(e)[0];
      s.parentNode.insertBefore(t,s)}(window, document,'script',
      'https://connect.facebook.net/en_US/fbevents.js');
      fbq('init', '${pixelId}');
      fbq('track', 'PageView');
    `,
  });

  window.__medMetaPixelInitialized = true;
}
