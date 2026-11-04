/**
 * Brand splash on the first home-page visit of a browser session (styles: `#h1q-splash` in
 * globals.css). The inline script runs while the HTML is parsed, so it shows before hydration.
 * It builds the overlay outside React's tree: React never reconciles or removes it, so it can't
 * cause hydration mismatches. It never blocks: no JS means no splash; it ends on `load` (at least
 * 0.6 s, so the draw-in reads), and CSS fades it out at 1.2 s regardless. Client-side navigation
 * doesn't re-run inline scripts, and sessionStorage skips it on later full loads.
 */
const SCRIPT = `(function(){try{
if(matchMedia("(prefers-reduced-motion: reduce)").matches)return;
var k="h1q-splash";if(sessionStorage.getItem(k))return;sessionStorage.setItem(k,"1");
}catch(e){return}
var d=document.createElement("div");d.id="h1q-splash";d.setAttribute("aria-hidden","true");
d.innerHTML='<div class="h1q-tile"><svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#00FF88" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 10a2 2 0 0 1 .709-1.528l7-6a2 2 0 0 1 2.582 0l7 6A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8"/></svg></div><div class="h1q-name" dir="ltr">Home<b>1</b>raq</div><div class="h1q-line"></div>';
document.body.appendChild(d);
var t0=performance.now(),gone=false;
function out(){if(gone)return;gone=true;d.classList.add("is-out");setTimeout(function(){d.remove()},400)}
function ready(){setTimeout(out,Math.max(0,600-(performance.now()-t0)))}
if(document.readyState==="complete")ready();else addEventListener("load",ready,{once:true});
setTimeout(out,1200);
})();`;

export function FirstVisitSplash() {
  return <script dangerouslySetInnerHTML={{ __html: SCRIPT }} />;
}
