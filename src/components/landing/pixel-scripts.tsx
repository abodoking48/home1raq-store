import Script from "next/script";

const tiktokPixelId = process.env.NEXT_PUBLIC_TIKTOK_PIXEL_ID?.trim();

/**
 * TikTok pixel only here — Meta Pixel loads once in `src/app/layout.tsx` to avoid
 * duplicate `fbq` init / double PageView on `/landing/*`.
 */
export function LandingPixelScripts() {
  return tiktokPixelId ? (
    <Script id="tiktok-pixel-home1raq" strategy="afterInteractive">
      {`!function(w,d,t){w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie","holdConsent","revokeConsent","grantConsent"],ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);ttq.instance=function(t){for(var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e},ttq.load=function(e,n){var i="https://analytics.tiktok.com/i18n/pixel/events.js";ttq._i=ttq._i||{},ttq._i[e]=[],ttq._i[e]._u=i,ttq._t=ttq._t||{},ttq._t[e]=+new Date,ttq._o=ttq._o||{},ttq._o[e]=n||{};n=document.createElement("script");n.type="text/javascript",n.async=!0,n.src=i+"?sdkid="+e+"&lib="+t;var o=document.getElementsByTagName("script")[0];o.parentNode.insertBefore(n,o)};ttq.load('${tiktokPixelId}');ttq.page();}(window,document,'ttq');`}
    </Script>
  ) : null;
}
