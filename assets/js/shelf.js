// "shelf" slayt tipleri: Out-of-the-box urunler sunumu. Hareket dili: raf isiklari titreyerek yanar, urun kutulari rafa duser.
// Renkler Philips Professional kutularindan (lacivert, Philips mavisi, camgobegi). Rol renkleri: Traffic camgobegi, Value lila, Hero altin.
// Urun listesi ve tum metinler sunumun index.html dosyasindaki deck-data icindedir ("products" ve "slides").
// Tipler: s-cover, s-shift, s-basket, s-stores, s-filters, s-roles, s-family, s-steps, s-scanner, s-smart, s-photo, s-ev,
//         s-route, s-returns, s-flywheel, s-plan, s-ask
import React from "react";
import { useCurrentFrame, interpolate, Easing, spring } from "remotion";
import { html, C, HEAD, BODY, clamp, Logo, registerSlideTypes } from "./slides.js";

const W = 1920, H = 1080;
const K = {
  bg: "#040A1C", blue: "#2F6BFF", deep: "#0B1F5C", cyan: "#38D6FF", ice: "#CFF3FF", value: "#9DB2FF", hero: "#FFC85C",
  warn: "#FF8A5C", grey: "#6B7287", text: "rgba(255,255,255,.74)", soft: "rgba(255,255,255,.55)", line: "rgba(255,255,255,.12)",
  green: C.green, cable: "#FFC400", pipe: "#3DA5FF",
};
const ROLE = {
  traffic: { c: K.cyan, label: "Traffic & Repeat" },
  value: { c: K.value, label: "Professional Value" },
  hero: { c: K.hero, label: "Hero Innovation" },
};
const out = { ...clamp, easing: Easing.out(Easing.cubic) };
const inOut = { ...clamp, easing: Easing.bezier(0.7, 0, 0.2, 1) };
const stillMode = new URLSearchParams(location.search).has("still");

// ---------- medya: yerelde dogrudan, yayinda (.enc) indirilip tarayicida cozulur ----------
const DATA = JSON.parse(document.getElementById("deck-data")?.textContent || "{}");
const KEY = DATA.mediaKey || "";
const PR = DATA.products || {};
const cache = new Map();
let cryptoKey = null;
const hexBytes = (h) => Uint8Array.from(h.match(/../g).map((b) => parseInt(b, 16)));
function load(src) {
  if (!KEY) return Promise.resolve(src);
  if (!cache.has(src)) cache.set(src, (async () => {
    const r = await fetch(src + ".enc");
    if (!r.ok) throw new Error("medya yok: " + src);
    const buf = await r.arrayBuffer();
    cryptoKey = cryptoKey || await crypto.subtle.importKey("raw", hexBytes(KEY), "AES-GCM", false, ["decrypt"]);
    const plain = await crypto.subtle.decrypt({ name: "AES-GCM", iv: buf.slice(0, 12) }, cryptoKey, buf.slice(12));
    return URL.createObjectURL(new Blob([plain], { type: "image/jpeg" }));
  })());
  return cache.get(src);
}
function useMedia(src) {
  const [url, setUrl] = React.useState(() => (src && !KEY ? src : null));
  React.useEffect(() => {
    let live = true;
    if (src) load(src).then((u) => { if (live) setUrl(u); }).catch((e) => console.error(e));
    return () => { live = false; };
  }, [src]);
  return url;
}
const med = (k) => "medya/" + k + ".jpg";
// Tum gorselleri arka planda hazirla (toplam ~3 MB), gecisler bekletmesin
if (!stillMode && DATA.style === "shelf") {
  const all = new Set(Object.keys(PR).map(med));
  JSON.stringify(DATA.slides || []).replace(/"(medya\/[^"]+)"/g, (_, s) => all.add(s));
  const q = [...all]; let n = 0;
  const step = () => { const s = q[n++]; if (!s) return; if (KEY) load(s).catch(() => {}); else { const i = new Image(); i.src = s; } setTimeout(step, KEY ? 160 : 40); };
  setTimeout(step, 800);
}

// ---------- yardimcilar ----------
const useF = () => useCurrentFrame();
const P = (f, d, dur, cfg = out) => interpolate(f - d, [0, dur], [0, 1], cfg);
const sp = (f, d, config = { damping: 13, mass: 0.7, stiffness: 140 }) => spring({ frame: f - d, fps: 30, config });
const abs = (x, y, extra) => ({ position: "absolute", left: x, top: y, ...extra });
// Isik titremesi: yanarken 2-3 kez kirpar
function flick(f, on, off) {
  let o = 0;
  const k = f - on;
  if (k >= 0) o = k < 3 ? 0.85 : k < 5 ? 0.15 : k < 8 ? 1 : k < 10 ? 0.35 : 1;
  if (off != null && f >= off) { const j = f - off; o = j < 2 ? 0.25 : j < 4 ? 0.9 : j < 6 ? 0.15 : j < 8 ? 0.5 : Math.max(0, 0.5 - (j - 8) / 14); }
  return o;
}

function Bg() {
  const f = useF();
  const sheen = ((f * 1.6) % 3400) - 1100;
  return html`<div style=${{ position: "absolute", inset: 0, overflow: "hidden", background: `radial-gradient(120% 90% at 72% -10%, #12306F 0%, ${K.bg} 52%, #02050F 100%)` }}>
    <div style=${{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(90deg, rgba(120,170,255,.045) 1px, transparent 1px)", backgroundSize: "240px 100%" }} />
    <div style=${{ position: "absolute", top: -300, height: 1700, width: 700, left: sheen, transform: "rotate(16deg)", background: "linear-gradient(90deg, rgba(80,160,255,0), rgba(80,160,255,.07), rgba(80,160,255,0))" }} />
    <div style=${{ position: "absolute", left: 0, right: 0, bottom: 0, height: 320, background: "linear-gradient(0deg, rgba(47,107,255,.10), rgba(47,107,255,0))" }} />
  </div>`;
}

// Raf tahtasi + altindaki LED isik serit (sunumun imza hareketi)
function Strip({ x, y, w, on = 0, off = null, color = K.cyan, glow = 170 }) {
  const f = useF();
  const o = flick(f, on, off);
  const grow = P(f, on - 8, 16);
  return html`<div style=${abs(x, y, { width: w, height: 0 })}>
    <div style=${{ position: "absolute", left: 0, top: 0, height: 14, width: w * grow, borderRadius: 3, background: "linear-gradient(180deg,#22366A,#0B1430)", boxShadow: "0 12px 30px rgba(0,0,0,.55)" }} />
    <div style=${{ position: "absolute", left: 10, right: 10, top: 12, height: 4, borderRadius: 2, background: color, opacity: o, boxShadow: `0 0 16px ${color}, 0 0 44px ${color}` }} />
    <div style=${{ position: "absolute", left: 0, right: 0, top: 16, height: glow, opacity: o * 0.32, background: `linear-gradient(180deg, ${color}66, ${color}00)`, clipPath: "polygon(3% 0, 97% 0, 100% 100%, 0 100%)" }} />
  </div>`;
}

const cardW = (k, h) => { const p = PR[k] || { w: 3, h: 2 }; return Math.round((h * p.w) / p.h); };
// Urun kutusu: rafa yaylanarak duser. Kart orani gorsel oraniyla ayni, gorsel asla bozulmaz.
function Card({ k, h, delay = 0, drop = true, label = 0, style, lit = 1 }) {
  const f = useF();
  const p = PR[k] || {};
  const w = cardW(k, h);
  const s = sp(f, delay);
  const o = interpolate(f - delay, [0, 6], [0, 1], clamp);
  const url = useMedia(med(k));
  const role = ROLE[p.role];
  return html`<div style=${{ width: w, opacity: o, transform: `translateY(${(1 - s) * (drop ? -140 : 40)}px)`, ...style }}>
    <div style=${{ position: "relative", width: w, height: h, borderRadius: 10, overflow: "hidden", background: "#E9ECF2",
      boxShadow: "0 22px 44px rgba(0,0,0,.5), 0 0 0 1px rgba(255,255,255,.10)", filter: `brightness(${0.35 + 0.65 * lit}) saturate(${lit})` }}>
      ${url && html`<img src=${url} style=${{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />`}
    </div>
    ${label > 0 && html`<div style=${{ marginTop: label === 2 ? 30 : 12, display: "flex", alignItems: "baseline", gap: 10, flexWrap: "wrap" }}>
      ${role && html`<i style=${{ width: 9, height: 9, borderRadius: 5, background: role.c, boxShadow: `0 0 10px ${role.c}`, flex: "none", transform: "translateY(-2px)" }} />`}
      <span style=${{ font: `600 ${h > 200 ? 24 : 20}px/1.15 ${HEAD}`, color: "#fff" }}>${p.name || k}</span>
      ${label === 2 && p.line && html`<span style=${{ width: "100%", font: `400 19px/1.3 ${BODY}`, color: K.soft }}>${p.line}</span>`}
    </div>`}
  </div>`;
}

function Words({ text, delay = 0, stagger = 2.2, style, accent = 0, color = K.cyan }) {
  const f = useF();
  const words = String(text || "").split(/\s+/).filter(Boolean);
  return html`<div style=${{ display: "flex", flexWrap: "wrap", columnGap: "0.24em", ...style }}>
    ${words.map((w, i) => {
      const p = P(f, delay + i * stagger, 22);
      const hi = accent > 0 && i >= words.length - accent;
      return html`<span key=${i} style=${{ display: "inline-block", overflow: "hidden", paddingBottom: "0.14em", marginBottom: "-0.14em" }}>
        <span style=${{ display: "inline-block", transform: `translateY(${(1 - p) * 105}%)`, opacity: p, color: hi ? color : undefined,
          textShadow: hi ? `0 0 30px ${color}66` : undefined }}>${w}</span></span>`;
    })}
  </div>`;
}
function Rise({ delay = 0, y = 18, children, style }) {
  const f = useF(); const p = P(f, delay, 22);
  return html`<div style=${{ opacity: p, transform: `translateY(${(1 - p) * y}px)`, ...style }}>${children}</div>`;
}
function Kicker({ text, delay = 0, color = K.cyan, style }) {
  if (!text) return null;
  return html`<${Rise} delay=${delay} y=${10} style=${{ display: "flex", alignItems: "center", gap: 14, font: `600 19px/1 ${BODY}`, letterSpacing: "0.18em", textTransform: "uppercase", color, ...style }}>
    <i style=${{ width: 28, height: 3, borderRadius: 2, background: color, boxShadow: `0 0 10px ${color}` }} />${text}<//>`;
}
function Pill({ role, text, delay = 0, style }) {
  const r = ROLE[role] || { c: K.cyan, label: text };
  return html`<${Rise} delay=${delay} y=${8} style=${{ display: "inline-flex", alignItems: "center", gap: 10, padding: "9px 18px", borderRadius: 40,
      border: `1px solid ${r.c}88`, background: `${r.c}1A`, font: `600 18px/1 ${BODY}`, letterSpacing: "0.06em", color: r.c, ...style }}>
    <i style=${{ width: 9, height: 9, borderRadius: 5, background: r.c, boxShadow: `0 0 10px ${r.c}` }} />${text || r.label}<//>`;
}
// Standart baslik blogu
function Head({ s, width = 1500, size = 60 }) {
  return html`<div style=${abs(110, 86, { width })}>
    <${Kicker} text=${s.kicker} delay=${2} />
    <${Words} text=${s.title} delay=${6} accent=${s.accent || 0} style=${{ marginTop: 22, font: `600 ${size}px/1.06 ${HEAD}`, letterSpacing: "-0.022em", color: "#fff" }} />
    ${s.sub && html`<${Rise} delay=${18} style=${{ marginTop: 18, maxWidth: width, font: `400 25px/1.4 ${BODY}`, color: K.text }}>${s.sub}<//>`}
  </div>`;
}
function Chrome({ index, total, note }) {
  const f = useF(); const o = P(f, 10, 20) * 0.9;
  return html`<div style=${{ position: "absolute", left: 110, right: 70, bottom: 34, display: "flex", alignItems: "center", justifyContent: "space-between", opacity: o }}>
    <span style=${{ font: `500 15px/1.3 ${BODY}`, letterSpacing: "0.14em", textTransform: "uppercase", color: "rgba(255,255,255,.42)" }}>
      Out of the box · Philips Professional${note ? html`<span style=${{ marginLeft: 22, letterSpacing: "0.02em", textTransform: "none", color: "rgba(255,255,255,.36)" }}>${note}</span>` : ""}
    </span>
    <span style=${{ display: "flex", alignItems: "center", gap: 22 }}>
      <span style=${{ font: `500 16px/1 ${BODY}`, color: "rgba(255,255,255,.55)", fontVariantNumeric: "tabular-nums" }}>${String(index + 1).padStart(2, "0")} / ${String(total).padStart(2, "0")}</span>
      <${Logo} width=${108} />
    </span>
  </div>`;
}
function Stage({ children, index, total, note, bg = true, chrome = true }) {
  return html`<div style=${{ position: "absolute", inset: 0, overflow: "hidden", background: K.bg, color: "#fff", fontFamily: BODY }}>
    ${bg && html`<${Bg} />`}
    ${children}
    ${chrome && html`<${Chrome} index=${index} total=${total} note=${note} />`}
  </div>`;
}

// ---------- cizgi ikonlar (SVG, 200x200) ----------
const ICON = {
  bulb: html`<g><circle cx="100" cy="78" r="50" /><path d="M76 120 V146 H124 V120" /><path d="M80 158 H120 M85 169 H115 M93 180 H107" /><path d="M86 98 L100 80 L114 98" /></g>`,
  flood: html`<g><rect x="38" y="46" width="124" height="92" rx="12" /><rect x="54" y="62" width="92" height="60" rx="4" /><path d="M100 138 V168 M66 172 H134 M38 92 H22 M162 92 H178" /></g>`,
  batten: html`<g><rect x="14" y="80" width="172" height="44" rx="22" /><path d="M38 102 H162" /><rect x="46" y="72" width="14" height="60" rx="3" /><rect x="140" y="72" width="14" height="60" rx="3" /></g>`,
  lum: html`<g><path d="M100 18 V62" /><path d="M62 62 H138 L172 122 H28 Z" /><path d="M58 146 L48 170 M100 150 V178 M142 146 L152 170" /></g>`,
  box: html`<g><path d="M40 70 L100 40 L160 70 V140 L100 170 L40 140 Z" /><path d="M40 70 L100 100 L160 70 M100 100 V170" /></g>`,
  check: html`<g><path d="M48 104 L86 140 L154 62" /></g>`,
  shield: html`<g><path d="M100 26 L160 50 V100 C160 140 132 164 100 176 C68 164 40 140 40 100 V50 Z" /><path d="M72 102 L94 122 L130 82" /></g>`,
  clock: html`<g><circle cx="100" cy="100" r="66" /><path d="M100 60 V100 L128 118" /></g>`,
  euro: html`<g><circle cx="100" cy="100" r="66" /><path d="M128 72 C118 62 104 58 92 62 C70 68 62 92 66 110 C70 132 96 146 128 128 M54 92 H112 M54 112 H108" /></g>`,
  bolt: html`<g><path d="M112 22 L52 114 H98 L86 178 L148 84 H102 Z" /></g>`,
  leaf: html`<g><path d="M44 156 C44 90 90 44 160 44 C160 118 114 156 44 156 Z" /><path d="M44 156 L118 84" /></g>`,
  net: html`<g><circle cx="100" cy="100" r="18" /><circle cx="44" cy="56" r="14" /><circle cx="156" cy="56" r="14" /><circle cx="44" cy="148" r="14" /><circle cx="156" cy="148" r="14" /><path d="M86 90 L56 64 M114 90 L144 64 M86 110 L56 140 M114 110 L144 140" /></g>`,
  basket: html`<g><path d="M28 80 H172 L152 168 H48 Z" /><path d="M64 80 L94 32 M136 80 L106 32" /><path d="M72 104 V144 M100 104 V144 M128 104 V144" /></g>`,
  battery: html`<g><rect x="30" y="62" width="128" height="76" rx="10" /><path d="M158 86 H172 V114 H158" /><path d="M100 72 L78 104 H102 L92 130 L122 94 H98 Z" /></g>`,
  chip: html`<g><rect x="44" y="56" width="112" height="88" rx="10" /><path d="M14 78 H44 M14 100 H44 M14 122 H44 M156 78 H186 M156 100 H186 M156 122 H186" /><path d="M72 84 H128 M72 116 H112" /></g>`,
  duct: html`<g><rect x="16" y="72" width="168" height="56" rx="6" /><path d="M16 92 H184" /><path d="M48 72 V128 M100 72 V128 M152 72 V128" /></g>`,
  torch: html`<g><path d="M24 82 H112 L150 60 V140 L112 118 H24 Z" /><path d="M164 70 L186 58 M166 100 H190 M164 130 L186 142" /></g>`,
  store: html`<g><path d="M30 80 L44 40 H156 L170 80 Z" /><path d="M38 80 V168 H162 V80" /><rect x="58" y="104" width="40" height="64" /><rect x="114" y="104" width="32" height="30" /></g>`,
};
function Icon({ name, size = 60, color = K.cyan, glow = 0, stroke = 9, style }) {
  return html`<svg viewBox="0 0 200 200" width=${size} height=${size} style=${{ overflow: "visible", filter: glow ? `drop-shadow(0 0 ${glow}px ${color})` : undefined, ...style }}
    fill="none" stroke=${color} strokeWidth=${stroke} strokeLinecap="round" strokeLinejoin="round">${ICON[name]}</svg>`;
}

// =====================================================================
// s-cover: raf unitesi kurulur, isiklar yanar, urunler duser. s.closing ile kapanista da kullanilir.
function Cover({ s, index, total }) {
  const f = useF();
  const shelves = s.shelves || [];
  const ux = 1010, uw = 820, tops = [400, 650, 900], ch = 170;
  const sign = flick(f, 4);
  return html`<${Stage} index=${index} total=${total}>
    <div style=${abs(ux - 16, 150, { width: 12, height: 760, borderRadius: 4, background: "linear-gradient(90deg,#0E1A3D,#1E3170)", opacity: P(f, 0, 14) })} />
    <div style=${abs(ux + uw + 4, 150, { width: 12, height: 760, borderRadius: 4, background: "linear-gradient(90deg,#1E3170,#0E1A3D)", opacity: P(f, 0, 14) })} />
    <div style=${abs(ux, 120, { width: uw, height: 74, borderRadius: 8, background: `linear-gradient(90deg, ${K.deep}, #1840B8)`, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 30px", boxSizing: "border-box",
      opacity: 0.25 + 0.75 * sign, boxShadow: `0 0 ${40 * sign}px rgba(56,214,255,.35)`, border: "1px solid rgba(255,255,255,.14)" })}>
      <span style=${{ font: `700 32px/1 ${HEAD}`, letterSpacing: "0.08em", color: "#fff" }}>PHILIPS</span>
      <span style=${{ font: `500 21px/1 ${BODY}`, letterSpacing: "0.16em", textTransform: "uppercase", color: K.ice }}>${s.sign || "Professional · Electrician Point"}</span>
    </div>
    ${tops.map((y, i) => html`<${Strip} key=${i} x=${ux} y=${y} w=${uw} on=${8 + i * 7} />`)}
    ${shelves.map((row, i) => {
      const ws = row.map((k) => cardW(k, ch)); const gap = 26;
      let x = ux + (uw - ws.reduce((a, b) => a + b, 0) - gap * (row.length - 1)) / 2;
      return row.map((k, j) => { const el = html`<${Card} key=${k} k=${k} h=${ch} delay=${16 + i * 8 + j * 4} style=${abs(x, tops[i] - ch - 2)} />`; x += ws[j] + gap; return el; });
    })}
    <div style=${abs(110, s.closing ? 300 : 250, { width: 800 })}>
      <${Kicker} text=${s.kicker} delay=${4} />
      <${Words} text=${s.title} delay=${10} stagger=${3} accent=${s.accent || 0} style=${{ marginTop: 34, font: `600 ${s.size || 128}px/0.96 ${HEAD}`, letterSpacing: "-0.04em", color: "#fff" }} />
      ${s.sub && html`<${Rise} delay=${30} style=${{ marginTop: 36, font: `400 28px/1.42 ${BODY}`, color: K.text, maxWidth: 760 }}>${s.sub}<//>`}
      ${s.date && html`<${Rise} delay=${40} style=${{ marginTop: 44, font: `500 20px/1.4 ${BODY}`, letterSpacing: "0.12em", textTransform: "uppercase", color: K.soft }}>${s.date}<//>`}
    </div>
  <//>`;
}

// s-shift: Dun Profesyonel ekip LED ampul satiyordu; LED ampul giris urunuydu, projektor ve etanj onunla rafa giriyordu.
// Bugun LED ampul Consumer ekibinde: ampul panelden kayarak cikar, projektor ve etanj soner, rafi baska markalar doldurur.
function Shift({ s, index, total }) {
  const f = useF();
  const T0 = 14, OFF = 56, IN = 100;
  const panel = (x, label, sub, now) => {
    const items = s.then || [];
    const shelfY = 410;
    return html`<div style=${abs(x, 270, { width: 820, height: 520, borderRadius: 18, overflow: "hidden", border: "1px solid rgba(255,255,255,.10)", background: "rgba(10,20,50,.45)", opacity: P(f, now ? 6 : 2, 18) })}>
      <div style=${abs(34, 30, { font: `600 19px/1 ${BODY}`, letterSpacing: "0.18em", textTransform: "uppercase", color: now ? K.warn : K.cyan })}>${label}</div>
      <div style=${abs(34, 62, { font: `600 34px/1.1 ${HEAD}`, color: "#fff" })}>${sub}</div>
      ${items.map((it, i) => {
        const entry = i === 0;
        let o = flick(f, T0 + i * 4), fall = 0, slide = 0;
        if (now && entry) slide = P(f, OFF, 30, inOut);
        if (now && !entry) { o = flick(f, T0 + i * 4, OFF + 22 + i * 5); fall = P(f, OFF + 28 + i * 5, 18); }
        const dark = now && !entry && f > OFF + 26 + i * 5;
        return html`<div key=${i} style=${abs(70 + i * 240 + slide * 820, shelfY - 214 + fall * 30, { width: 200, opacity: now && !entry ? Math.max(0.06, 1 - fall * 0.94) : 1, textAlign: "center" })}>
          <${Icon} name=${it.icon} size=${190} color=${dark ? "#3A4566" : K.cyan} glow=${18 * o} stroke=${7} />
        </div>`;
      })}
      ${!now && items.map((it, i) => it.tag && html`<div key=${"t" + i} style=${abs(70 + i * 240, 150, { width: 200, textAlign: "center", opacity: P(f, T0 + 16 + i * 4, 14) })}>
        <span style=${{ display: "inline-block", padding: "6px 12px", borderRadius: 20, font: `600 15px/1 ${BODY}`, letterSpacing: "0.12em", textTransform: "uppercase",
          color: i === 0 ? "#04122C" : K.ice, background: i === 0 ? K.cyan : "transparent", border: `1px solid ${i === 0 ? K.cyan : "rgba(207,243,255,.35)"}` }}>${it.tag}</span>
      </div>`)}
      ${now && s.movedTag && html`<div style=${abs(34, 124, { padding: "8px 16px", borderRadius: 24, border: `1px solid ${K.warn}`, background: "rgba(255,138,92,.12)",
        font: `600 19px/1 ${BODY}`, color: K.warn, opacity: P(f, OFF + 8, 14), transform: `translateX(${(1 - P(f, OFF + 8, 20)) * 30}px)` })}>${s.movedTag}</div>`}
      ${now && [0, 1, 2, 3].map((i) => {
        const p = sp(f, IN + i * 6);
        const wv = [150, 120, 170, 130][i];
        return html`<div key=${"g" + i} style=${abs(60 + [0, 175, 320, 515][i], shelfY - [150, 120, 165, 135][i], { width: wv, height: [150, 120, 165, 135][i], borderRadius: 6,
          background: "linear-gradient(160deg,#5A6177,#3A4054)", border: "1px solid rgba(255,255,255,.12)", opacity: P(f, IN + i * 6, 6), transform: `translateX(${(1 - p) * 420}px)` })}>
          <div style=${{ margin: "18px 16px", height: 10, borderRadius: 3, background: "rgba(255,255,255,.22)" }} />
          <div style=${{ margin: "0 16px", width: "55%", height: 8, borderRadius: 3, background: "rgba(255,255,255,.14)" }} />
        </div>`;
      })}
      ${now && s.nowTag && html`<div style=${abs(560, 96, { width: 230, textAlign: "center", opacity: P(f, IN + 26, 16) })}>
        <${Icon} name="lum" size=${120} color=${K.value} glow=${10} stroke=${7} />
        <div style=${{ marginTop: 8, font: `500 19px/1.3 ${BODY}`, color: K.value }}>${s.nowTag}</div>
      </div>`}
      <${Strip} x=${30} y=${shelfY} w=${760} on=${T0 - 4} off=${now ? OFF + 30 : null} color=${K.cyan} glow=${120} />
      ${now && html`<${Strip} x=${30} y=${shelfY} w=${760} on=${OFF + 46} color="#8A93AA" glow=${90} />`}
      ${!now && items.map((it, i) => html`<div key=${"l" + i} style=${abs(70 + i * 240, shelfY + 34, { width: 200, textAlign: "center", font: `500 21px/1.3 ${BODY}`, color: K.ice, opacity: P(f, T0 + 10 + i * 4, 14) })}>${it.label}</div>`)}
      ${now && html`<div style=${abs(34, shelfY + 34, { font: `500 21px/1.3 ${BODY}`, color: "rgba(255,255,255,.5)", opacity: P(f, IN + 20, 14) })}>${s.othersTag}</div>`}
    </div>`;
  };
  return html`<${Stage} index=${index} total=${total}>
    <${Head} s=${s} width=${1700} />
    ${panel(110, s.thenLabel, s.thenTitle, false)}
    ${panel(990, s.nowLabel, s.nowTitle, true)}
    <${Rise} delay=${24} style=${abs(110, 812, { width: 820, font: `400 23px/1.4 ${BODY}`, color: K.text })}>${s.thenText}<//>
    <${Rise} delay=${OFF + 20} style=${abs(990, 812, { width: 820, font: `400 23px/1.4 ${BODY}`, color: K.text })}>${s.nowText}<//>
    <${Rise} delay=${IN + 40} style=${abs(110, 914, { font: `600 34px/1.2 ${HEAD}`, color: K.warn, textShadow: `0 0 28px ${K.warn}55` })}>${s.punch}<//>
  <//>`;
}

// s-basket: tek bir is icin elektrikcinin sepeti. Bugun sepette sadece isik bizden; hedef sepetin tamami Philips.
function Basket({ s, index, total }) {
  const f = useF();
  const items = s.items || [];
  const n = items.length;
  const flipAt = (i) => 112 + i * 10;
  const done = items.reduce((t, it, i) => t + (it.ours ? 1 : P(f, flipAt(i), 10)), 0);
  const whole = items.filter((it, i) => it.ours || f >= flipAt(i) + 5).length;
  const goal = f >= flipAt(n - 1) + 10;
  const R = 150, circ = 2 * Math.PI * R;
  return html`<${Stage} index=${index} total=${total} note=${s.note}>
    <${Head} s=${s} width=${1700} size=${58} />
    <div style=${abs(110, 290, { width: 560 })}>
      <${Rise} delay=${10} style=${{ font: `600 19px/1 ${BODY}`, letterSpacing: "0.16em", textTransform: "uppercase", color: K.value }}>${s.leftTitle}<//>
      ${(s.left || []).map((t, i) => html`<${Rise} key=${i} delay=${14 + i * 5} style=${{ marginTop: i ? 14 : 26, display: "flex", alignItems: "center", gap: 16, font: `500 28px/1.2 ${HEAD}`, color: "#fff" }}>
        ${s.leftIcon === "dot" ? html`<i style=${{ flex: "none", width: 12, height: 12, borderRadius: 6, background: i === 0 ? K.cyan : K.warn, boxShadow: `0 0 10px ${i === 0 ? K.cyan : K.warn}` }} />`
          : html`<${Icon} name="check" size=${24} color=${K.value} stroke=${20} />`}${t}<//>`)}
      <${Rise} delay=${32} style=${{ marginTop: 30, font: `400 24px/1.45 ${BODY}`, color: K.text }}>${s.leftText}<//>
      <${Rise} delay=${44} style=${{ marginTop: 34, paddingLeft: 22, borderLeft: `3px solid ${K.cyan}`, font: `600 30px/1.25 ${HEAD}`, color: K.cyan }}>${s.turn}<//>
    </div>
    <div style=${abs(740, 280, { width: 600, height: 640, boxSizing: "border-box", padding: "28px 30px", borderRadius: 20, background: "rgba(10,20,50,.6)",
      border: "1px solid rgba(255,255,255,.12)", opacity: P(f, 6, 16), transform: `translateY(${(1 - P(f, 6, 20)) * 30}px)` })}>
      <div style=${{ display: "flex", alignItems: "center", gap: 16, font: `600 26px/1.2 ${HEAD}`, color: "#fff" }}>
        <${Icon} name="basket" size=${44} color=${K.cyan} stroke=${10} glow=${6} />${s.basketTitle}
      </div>
      ${items.map((it, i) => {
        const d = 16 + i * 7; const p = P(f, d, 16);
        const ours = it.ours || f >= flipAt(i);
        const flash = !it.ours && f >= flipAt(i) ? Math.max(0, 1 - (f - flipAt(i)) / 14) : 0;
        return html`<div key=${i} style=${{ marginTop: i ? 10 : 22, height: 66, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 18px",
          background: ours ? `rgba(47,107,255,${0.22 + flash * 0.4})` : "rgba(255,255,255,.04)", border: `1px solid ${ours ? "rgba(56,214,255,.55)" : "rgba(255,255,255,.10)"}`,
          opacity: p, transform: `translateX(${(1 - p) * -40}px)`, boxShadow: flash ? `0 0 ${30 * flash}px rgba(56,214,255,.6)` : "none" }}>
          <div>
            <div style=${{ font: `600 23px/1.15 ${HEAD}`, color: "#fff" }}>${it.name}</div>
            ${it.note && html`<div style=${{ marginTop: 3, font: `400 16px/1.2 ${BODY}`, color: K.soft }}>${it.note}</div>`}
          </div>
          <span style=${{ flex: "none", display: "inline-flex", alignItems: "center", gap: 8, padding: "7px 14px", borderRadius: 20, font: `600 16px/1 ${BODY}`, letterSpacing: "0.1em", textTransform: "uppercase",
            background: ours ? K.cyan : "transparent", color: ours ? "#04122C" : "rgba(255,255,255,.5)", border: `1px solid ${ours ? K.cyan : "rgba(255,255,255,.25)"}` }}>
            ${ours ? s.ours : s.other}</span>
        </div>`;
      })}
    </div>
    <div style=${abs(1400, 330, { width: 420, textAlign: "center", opacity: P(f, 30, 16) })}>
      <svg width="360" height="360" style=${{ overflow: "visible" }}>
        <circle cx="180" cy="180" r=${R} fill="none" stroke="rgba(255,255,255,.08)" strokeWidth="18" />
        <circle cx="180" cy="180" r=${R} fill="none" stroke=${K.cyan} strokeWidth="18" strokeLinecap="round" transform="rotate(-90 180 180)"
          strokeDasharray=${`${(circ * done) / n} ${circ}`} style=${{ filter: `drop-shadow(0 0 ${goal ? 16 : 6}px ${K.cyan})` }} />
      </svg>
      <div style=${abs(0, 120, { width: 360, textAlign: "center" })}>
        <div style=${{ font: `300 96px/1 ${HEAD}`, letterSpacing: "-0.03em", color: "#fff", fontVariantNumeric: "tabular-nums" }}>${whole}<span style=${{ color: K.soft, fontSize: 56 }}> / ${n}</span></div>
        <div style=${{ margin: "10px auto 0", width: 220, font: `500 17px/1.25 ${BODY}`, letterSpacing: "0.06em", textTransform: "uppercase", color: K.soft }}>${s.unit}</div>
      </div>
      <div style=${{ marginTop: 26, width: 360, font: `600 28px/1.25 ${HEAD}`, color: goal ? K.cyan : "#fff" }}>${goal ? s.goalLabel : s.todayLabel}</div>
    </div>
  <//>`;
}

// s-stores: uc raf (mahalle elektrikcisi, kucuk dagitici, buyuk bayi). mode "off": Philips tabelasi soner; "on": geri yanar
function Store({ x, w, h, st, i, on }) {
  const f = useF();
  const base = 790;
  const d = 10 + i * 10;
  const sign = on ? flick(f, 34 + i * 12) : flick(f, d, 44 + i * 12);
  const shelves = 3;
  const rise = P(f, d - 8, 22);
  return html`<div style=${abs(x, base - h, { width: w, height: h, opacity: rise, transform: `translateY(${(1 - rise) * 30}px)` })}>
    <div style=${abs(-10, 0, { width: w + 20, height: 46, borderRadius: "8px 8px 0 0", background: "repeating-linear-gradient(90deg, #1B3A9A 0 40px, #DCE6FF 40px 80px)", opacity: 0.85 })} />
    <div style=${abs(0, 46, { width: w, height: 58, background: "#0D1838", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 18px", boxSizing: "border-box", borderBottom: "1px solid rgba(255,255,255,.1)" })}>
      <span style=${{ font: `700 22px/1 ${HEAD}`, letterSpacing: "0.12em", color: "rgba(255,255,255,.75)" }}>${st.sign}</span>
      <span style=${{ padding: "7px 14px", borderRadius: 4, background: sign > 0.3 ? "#1D4ED8" : "#1A2140", color: sign > 0.3 ? "#fff" : "#3A4566",
        font: `700 18px/1 ${HEAD}`, letterSpacing: "0.1em", boxShadow: `0 0 ${30 * sign}px rgba(56,140,255,${0.8 * sign})` }}>PHILIPS</span>
    </div>
    <div style=${abs(0, 104, { width: w, height: h - 104, background: "linear-gradient(180deg,#0B1530,#08101F)", border: "1px solid rgba(255,255,255,.08)", boxSizing: "border-box" })}>
      ${Array.from({ length: shelves }).map((_, r) => {
        const y = ((h - 104) / shelves) * (r + 1) - 8;
        const n = Math.floor((w - 40) / 46);
        return html`<div key=${r}>
          ${Array.from({ length: n }).map((__, c) => {
            const blue = on ? f > 40 + i * 12 + r * 5 + c * 1.4 : (c + r * 3 + i) % 7 === 0 && f < 44 + i * 12;
            const hh = 26 + ((c * 7 + r * 5) % 4) * 6;
            return html`<div key=${c} style=${abs(20 + c * 46, y - hh, { width: 36, height: hh, borderRadius: 3, background: blue ? "linear-gradient(160deg,#3B7BFF,#1D4ED8)" : "#2A3046",
              boxShadow: blue ? "0 0 12px rgba(59,123,255,.6)" : "none" })} />`;
          })}
          <div style=${abs(10, y, { width: w - 22, height: 4, borderRadius: 2, background: on && f > 34 + i * 12 ? K.cyan : "#2A3046", boxShadow: on && f > 34 + i * 12 ? `0 0 12px ${K.cyan}` : "none" })} />
        </div>`;
      })}
    </div>
    <div style=${abs(0, h + 26, { width: w })}>
      <div style=${{ font: `600 28px/1.15 ${HEAD}`, color: "#fff", opacity: P(f, d + 6, 14) }}>${st.name}</div>
      <div style=${{ marginTop: 8, font: `400 21px/1.35 ${BODY}`, color: K.text, opacity: P(f, d + 10, 14) }}>${st.who}</div>
      ${on && st.format && html`<div style=${{ marginTop: 14, display: "inline-block", padding: "8px 16px", borderRadius: 30, background: "rgba(56,214,255,.14)", border: `1px solid ${K.cyan}88`,
        font: `600 19px/1 ${BODY}`, color: K.cyan, opacity: P(f, 60 + i * 12, 14) }}>${st.format}</div>`}
      ${on && st.items && html`<div style=${{ marginTop: 10, font: `400 19px/1.35 ${BODY}`, color: K.soft, opacity: P(f, 66 + i * 12, 14) }}>${st.items}</div>`}
      ${!on && st.today && html`<div style=${{ marginTop: 12, font: `500 20px/1.35 ${BODY}`, color: K.warn, opacity: P(f, 56 + i * 12, 14) }}>${st.today}</div>`}
    </div>
  </div>`;
}
function Stores({ s, index, total }) {
  const on = s.mode === "on";
  const geo = [[110, 420, 300], [600, 500, 370], [1170, 640, 440]];
  return html`<${Stage} index=${index} total=${total}>
    <${Head} s=${s} />
    <div style=${abs(60, 790, { width: 1800, height: 2, background: "linear-gradient(90deg, rgba(56,214,255,0), rgba(56,214,255,.5), rgba(56,214,255,0))" })} />
    ${(s.stores || []).map((st, i) => html`<${Store} key=${i} x=${geo[i][0]} w=${geo[i][1]} h=${geo[i][2]} st=${st} i=${i} on=${on} />`)}
  <//>`;
}

// s-filters: bir urun uc kapidan gecer, sonunda rafa konur
function Filters({ s, index, total }) {
  const f = useF();
  const gates = s.gates || [];
  const y = 690, x0 = 130, x1 = 1700;
  const gx = gates.map((_, i) => 470 + i * 400);
  const tx = interpolate(f, [34, 150], [x0, x1], inOut);
  return html`<${Stage} index=${index} total=${total}>
    <${Head} s=${s} size=${66} width=${1600} />
    <div style=${abs(x0, y - 1, { width: (x1 - x0) * P(f, 20, 30), height: 2, background: "rgba(255,255,255,.18)" })} />
    ${gates.map((g, i) => {
      const passed = tx > gx[i];
      const o = passed ? flick(f, Math.round(interpolate(gx[i], [x0, x1], [34, 150]))) : 0;
      return html`<div key=${i} style=${abs(gx[i] - 170, 450, { width: 340, height: 380, borderRadius: 20, boxSizing: "border-box", padding: "34px 30px",
        border: `2px solid ${passed ? K.cyan : "rgba(255,255,255,.14)"}`, background: passed ? "rgba(56,214,255,.08)" : "rgba(10,20,50,.4)",
        boxShadow: `0 0 ${40 * o}px rgba(56,214,255,.35)`, opacity: P(f, 22 + i * 6, 18) })}>
        <div style=${{ font: `600 17px/1 ${BODY}`, letterSpacing: "0.18em", textTransform: "uppercase", color: passed ? K.cyan : K.soft }}>Criterion ${i + 1}</div>
        <div style=${{ marginTop: 20, font: `600 31px/1.18 ${HEAD}`, color: "#fff" }}>${g}</div>
        <div style=${abs(30, 290, { width: 54, height: 54, borderRadius: 27, display: "flex", alignItems: "center", justifyContent: "center", background: passed ? K.cyan : "transparent", border: `2px solid ${passed ? K.cyan : "rgba(255,255,255,.2)"}` })}>
          <${Icon} name="check" size=${30} color=${passed ? "#04122C" : "rgba(255,255,255,.2)"} stroke=${20} />
        </div>
      </div>`;
    })}
    <div style=${abs(1640, 560, { width: 200, textAlign: "center", opacity: P(f, 140, 14) })}>
      <div style=${{ font: `600 19px/1.2 ${BODY}`, letterSpacing: "0.12em", textTransform: "uppercase", color: K.cyan }}>${s.end}</div>
    </div>
    <${Strip} x=${1630} y=${y + 30} w=${210} on=${146} glow=${80} />
    <div style=${abs(tx - 34, y - 34 + (f > 150 ? -2 : Math.sin(f / 3) * 3), { width: 68, height: 68, opacity: P(f, 30, 8) })}>
      <${Icon} name="box" size=${68} color=${f > 150 ? K.cyan : "#fff"} glow=${f > 150 ? 14 : 6} stroke=${10} />
    </div>
  <//>`;
}

// s-roles: uc rol, her rolde dort urun
function Roles({ s, index, total }) {
  const f = useF();
  const cols = s.cols || [];
  return html`<${Stage} index=${index} total=${total} note=${s.note}>
    <${Head} s=${s} />
    ${cols.map((c, i) => {
      const x = 110 + i * 583; const r = ROLE[c.role];
      return html`<div key=${i} style=${abs(x, 250, { width: 540 })}>
        <div style=${{ height: 3, width: 540 * P(f, 10 + i * 8, 24), background: r.c, boxShadow: `0 0 12px ${r.c}` }} />
        <${Pill} role=${c.role} delay=${12 + i * 8} style=${{ marginTop: 22 }} />
        <${Rise} delay=${16 + i * 8} style=${{ marginTop: 16, height: 66, font: `400 22px/1.4 ${BODY}`, color: K.text }}>${c.text}<//>
        ${c.families ? html`<div style=${{ marginTop: 26 }}>
          ${c.families.map((fam, j) => { const p = P(f, 24 + i * 8 + j * 5, 18); return html`<div key=${j} style=${{ marginTop: j ? 18 : 0, height: 120, borderRadius: 14, boxSizing: "border-box", padding: "0 24px",
            display: "flex", alignItems: "center", gap: 18, background: `${r.c}14`, border: `1px solid ${r.c}55`, opacity: p, transform: `translateY(${(1 - p) * 24}px)` }}>
            <${Icon} name=${fam.icon || "box"} size=${46} color=${r.c} stroke=${10} glow=${6} />
            <div>
              <div style=${{ font: `600 27px/1.15 ${HEAD}`, color: "#fff" }}>${fam.name}</div>
              ${fam.text && html`<div style=${{ marginTop: 6, font: `400 19px/1.3 ${BODY}`, color: K.soft }}>${fam.text}</div>`}
            </div>
          </div>`; })}
        </div>` : html`<div style=${{ marginTop: 18, display: "grid", gridTemplateColumns: "262px 262px", columnGap: 16, rowGap: 22 }}>
          ${c.items.map((k, j) => html`<${Card} key=${k} k=${k} h=${176} delay=${24 + i * 8 + j * 4} drop=${false} label=${1} />`)}
        </div>`}
      </div>`;
    })}
    <div style=${abs(110, 930, { display: "flex", gap: 34, font: `600 31px/1.2 ${HEAD}` })}>
      ${(s.lines || []).map((t, i) => { const r = ROLE[cols[i]?.role] || { c: "#fff" }; const p = P(f, 70 + i * 16, 16);
        return html`<span key=${i} style=${{ opacity: p, color: r.c, textShadow: `0 0 ${24 * p}px ${r.c}55` }}>${t}</span>`; })}
    </div>
  <//>`;
}

// s-family: urun ailesi rafta. s.rows: [[urun anahtarlari], ...], s.h: kart yuksekligi
function Family({ s, index, total }) {
  const f = useF();
  const rows = s.rows || [];
  const one = rows.length === 1;
  const h = s.h || (one ? 240 : 210);
  const bottoms = one ? [s.bottom || 790] : [590, 895];
  return html`<${Stage} index=${index} total=${total} note=${s.note}>
    <div style=${abs(110, 86, { width: 1700 })}>
      <div style=${{ display: "flex", alignItems: "center", gap: 18 }}>
        <${Kicker} text=${s.kicker} delay=${2} />
        ${(s.roles || []).map((r, i) => html`<${Pill} key=${r} role=${r} delay=${6 + i * 3} />`)}
      </div>
      <${Words} text=${s.title} delay=${6} accent=${s.accent || 0} style=${{ marginTop: 20, font: `600 58px/1.06 ${HEAD}`, letterSpacing: "-0.022em", color: "#fff" }} />
    </div>
    ${[[(s.labels || [])[0] || "Solves", s.solves, 110], [(s.labels || [])[1] || "Why us", s.why, 990]].map(([l, t, x], i) => {
      // s.callout: ikinci blok vurgulu kutu olur (or. "bunlar ornek urunler" mesaji)
      const box = s.callout && i === 1;
      return t && html`<${Rise} key=${l} delay=${16 + i * 5} style=${abs(x, box ? 222 : 236, { width: 820, boxSizing: "border-box", font: `${box ? 500 : 400} 23px/1.42 ${BODY}`, color: box ? "#fff" : K.text,
        ...(box ? { padding: "14px 22px", borderRadius: 14, border: `1px solid ${K.hero}`, background: "rgba(255,200,92,.10)", boxShadow: "0 0 30px rgba(255,200,92,.15)" } : {}) })}>
      <span style=${{ font: `600 18px/1 ${BODY}`, letterSpacing: "0.16em", textTransform: "uppercase", color: box ? K.hero : K.cyan, marginRight: 12 }}>${l}</span>${t}<//>`;
    })}
    ${rows.map((row, i) => {
      const gap = s.gap || 44; const ws = row.map((k) => cardW(k, h));
      const tw = ws.reduce((a, b) => a + b, 0) + gap * (row.length - 1);
      let x = (W - tw) / 2; const by = bottoms[i];
      return html`<div key=${i}>
        <${Strip} x=${(W - tw) / 2 - 40} y=${by} w=${tw + 80} on=${14 + i * 8} glow=${70} />
        ${row.map((k, j) => { const el = html`<${Card} key=${k} k=${k} h=${h} delay=${22 + i * 10 + j * 4} label=${2} style=${abs(x, by - h - 2)} />`; x += ws[j] + gap; return el; })}
      </div>`;
    })}
    ${s.tagline && html`<${Rise} delay=${60} style=${abs(110, 960 - 30, { width: 1700, textAlign: "center", font: `600 32px/1.2 ${HEAD}`, color: ROLE[(s.roles || [])[0]]?.c || K.cyan })}>${s.tagline}<//>`}
  <//>`;
}

// s-steps: ProPull Magnetic adim adim
function Steps({ s, index, total }) {
  const f = useF();
  const steps = s.steps || [];
  const h = 470, gap = 70, top = 270;
  const ws = steps.map((st) => Math.round((h * st.w) / st.h));
  const tw = ws.reduce((a, b) => a + b, 0) + gap * (steps.length - 1);
  let x = (W - tw) / 2; const xs = ws.map((w) => { const v = x; x += w + gap; return v; });
  const at = (i) => 22 + i * 20;
  return html`<${Stage} index=${index} total=${total} note=${s.note}>
    <div style=${abs(110, 86, { width: 1700, display: "flex", alignItems: "center", gap: 18 })}>
      <${Kicker} text=${s.kicker} delay=${2} color=${K.hero} /><${Pill} role="hero" delay=${6} />
    </div>
    <${Words} text=${s.title} delay=${6} style=${{ ...abs(110, 132, { width: 1700 }), font: `600 56px/1.06 ${HEAD}`, letterSpacing: "-0.022em", color: "#fff" }} />
    <div style=${abs(xs[0] + ws[0] / 2, top + h + 49, { height: 2, width: (xs[steps.length - 1] + ws[steps.length - 1] / 2 - xs[0] - ws[0] / 2) * P(f, at(0), at(steps.length - 1) - at(0) + 10, { ...clamp }), background: K.hero, boxShadow: `0 0 10px ${K.hero}` })} />
    ${steps.map((st, i) => html`<${StepImg} key=${i} st=${st} x=${xs[i]} w=${ws[i]} h=${h} top=${top} d=${at(i)} n=${i + 1} />`)}
    <${Rise} delay=${at(steps.length) + 10} style=${abs(110, 952, { width: 1700, textAlign: "center", font: `600 30px/1.2 ${HEAD}`, color: K.hero })}>${s.tagline}<//>
  <//>`;
}
function StepImg({ st, x, w, h, top, d, n }) {
  const f = useF(); const url = useMedia(st.src); const p = sp(f, d); const lit = f >= d;
  return html`<div>
    <div style=${abs(x, top + (1 - p) * 40, { width: w, height: h, borderRadius: 14, overflow: "hidden", background: "#EEF0F4", opacity: P(f, d, 8),
      boxShadow: lit ? `0 20px 50px rgba(0,0,0,.5), 0 0 0 2px ${K.hero}55` : "none" })}>
      ${url && html`<img src=${url} style=${{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />`}
    </div>
    <div style=${abs(x + w / 2 - 25, top + h + 25, { width: 50, height: 50, borderRadius: 25, background: lit ? K.hero : "#121C3A", color: lit ? "#1A1200" : "#fff",
      display: "flex", alignItems: "center", justifyContent: "center", font: `700 24px/1 ${HEAD}`, transform: `scale(${0.6 + 0.4 * p})`, boxShadow: lit ? `0 0 20px ${K.hero}88` : "none" })}>${n}</div>
    <div style=${abs(x + w / 2 - 150, top + h + 90, { width: 300, textAlign: "center", opacity: P(f, d + 4, 14) })}>
      <div style=${{ font: `600 25px/1.15 ${HEAD}`, color: "#fff" }}>${st.title}</div>
      <div style=${{ marginTop: 8, font: `400 19px/1.35 ${BODY}`, color: K.soft }}>${st.text}</div>
    </div>
  </div>`;
}

// s-scanner: duvar tarayici kutusu + duvarin icini gosteren canli tarama
function Scanner({ s, index, total }) {
  const f = useF();
  const box = useMedia(s.image);
  const wx = 1010, wy = 280, ww = 810, wh = 420;
  const sx = interpolate(f, [26, 156], [-80, ww + 80], inOut);
  const shown = Math.max(0, Math.min(ww, sx));
  const objs = [
    { t: "v", x: 210, c: K.cable, w: 14, label: s.labels?.[0] }, { t: "v", x: 252, c: K.cable, w: 14 },
    { t: "v", x: 560, c: K.pipe, w: 26, label: s.labels?.[1] }, { t: "h", y: 300, c: "#C9CED6", w: 18, label: s.labels?.[2] },
  ];
  const near = objs.filter((o) => o.t === "v").some((o) => Math.abs(sx - o.x) < 40);
  const depth = interpolate(f, [60, 90], [0, 3.2], clamp);
  return html`<${Stage} index=${index} total=${total} note=${s.note}>
    <div style=${abs(110, 86, { width: 1700, display: "flex", alignItems: "center", gap: 18 })}>
      <${Kicker} text=${s.kicker} delay=${2} color=${K.hero} /><${Pill} role="hero" delay=${6} />
    </div>
    <${Words} text=${s.title} delay=${6} style=${{ ...abs(110, 132, { width: 1700 }), font: `600 56px/1.06 ${HEAD}`, letterSpacing: "-0.022em", color: "#fff" }} />
    <div style=${abs(110, 280, { width: 840, height: 560, borderRadius: 16, overflow: "hidden", opacity: P(f, 8, 18), boxShadow: "0 30px 70px rgba(0,0,0,.55)" })}>
      ${box && html`<img src=${box} style=${{ width: "100%", height: "100%", objectFit: "cover", transform: `scale(${1 + 0.04 * P(f, 0, 300, { ...clamp })})` }} />`}
    </div>
    <${Rise} delay=${30} style=${abs(110, 868, { width: 840, font: `400 21px/1.4 ${BODY}`, color: K.soft })}>${s.users}<//>
    <div style=${abs(wx, wy, { width: ww, height: wh, borderRadius: 16, overflow: "hidden", opacity: P(f, 12, 16),
      background: "radial-gradient(circle at 30% 20%, #A9AFBA, #7F8693 70%)", boxShadow: "inset 0 0 80px rgba(0,0,0,.35)" })}>
      <div style=${{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(rgba(0,0,0,.10) 1px, transparent 1.6px)", backgroundSize: "9px 9px", opacity: 0.7 }} />
      <div style=${{ position: "absolute", left: 0, top: 0, bottom: 0, width: shown, overflow: "hidden", background: "rgba(4,10,28,.86)" }}>
        <div style=${{ position: "absolute", inset: 0, width: ww, backgroundImage: "linear-gradient(rgba(56,214,255,.08) 1px, transparent 1px), linear-gradient(90deg, rgba(56,214,255,.08) 1px, transparent 1px)", backgroundSize: "40px 40px" }} />
        ${objs.map((o, i) => o.t === "v"
          ? html`<div key=${i} style=${abs(o.x - o.w / 2, 0, { width: o.w, height: wh, background: o.c, boxShadow: `0 0 18px ${o.c}` })} />`
          : html`<div key=${i} style=${abs(0, o.y, { width: ww, height: o.w, background: o.c, opacity: 0.85, boxShadow: `0 0 12px ${o.c}` })} />`)}
        ${objs.filter((o) => o.label).map((o, i) => html`<div key=${"l" + i} style=${abs(o.t === "v" ? o.x + 22 : 640, o.t === "v" ? 24 + i * 6 : o.y - 40, { padding: "6px 12px", borderRadius: 6,
          background: "rgba(4,10,28,.9)", border: `1px solid ${o.c}`, color: o.c, font: `600 18px/1 ${BODY}`, whiteSpace: "nowrap" })}>${o.label}</div>`)}
      </div>
      <div style=${abs(sx - 75, wh / 2 - 125, { width: 150, height: 250, borderRadius: 26, background: "linear-gradient(160deg,#20263A,#0B0F1C)", border: `3px solid ${near ? K.cyan : "#2F6BFF"}`,
        boxShadow: `0 20px 40px rgba(0,0,0,.5), 0 0 ${near ? 40 : 14}px ${near ? K.cyan : "#2F6BFF"}`, opacity: f > 22 && f < 170 ? 1 : 0 })}>
        <div style=${{ margin: "26px 18px 0", height: 110, borderRadius: 8, background: near ? "#0E3B4A" : "#0B1A33", border: "1px solid rgba(255,255,255,.12)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style=${{ width: 8, height: 80, background: near ? K.cable : "rgba(255,255,255,.15)", boxShadow: near ? `0 0 14px ${K.cable}` : "none" }} />
        </div>
        <div style=${{ margin: "22px auto 0", width: 40, height: 40, borderRadius: 20, border: `3px solid ${K.cyan}` }} />
      </div>
      ${near && html`<div style=${abs(sx - 110, wh / 2 - 110, { width: 220, height: 220, borderRadius: 110, border: `2px solid ${K.cyan}`, opacity: 0.6 - ((f % 12) / 12) * 0.6, transform: `scale(${1 + (f % 12) / 12})` })} />`}
    </div>
    <div style=${abs(wx + ww - 300, wy + wh + 18, { width: 300, textAlign: "right", font: `600 22px/1 ${BODY}`, color: K.cyan, opacity: P(f, 60, 10), fontVariantNumeric: "tabular-nums" })}>Detection depth ${depth.toFixed(1)} cm</div>
    <div style=${abs(wx, wy + wh + 14, { display: "flex", gap: 14 })}>
      ${(s.steps || []).map((t, i) => html`<${Rise} key=${i} delay=${150 + i * 6} y=${8} style=${{ display: "flex", alignItems: "center", gap: 10, font: `600 22px/1 ${HEAD}`, color: "#fff" }}>
        <span style=${{ width: 34, height: 34, borderRadius: 17, background: K.cyan, color: "#04122C", display: "flex", alignItems: "center", justifyContent: "center", font: `700 18px/1 ${HEAD}` }}>${i + 1}</span>${t}<//>`)}
    </div>
    <div style=${abs(wx, 800, { width: ww, display: "grid", gridTemplateColumns: "1fr 1fr", columnGap: 30, rowGap: 22 })}>
      ${(s.benefits || []).map((b, i) => html`<${Rise} key=${i} delay=${168 + i * 5} style=${{ display: "flex", alignItems: "center", gap: 16, font: `500 23px/1.25 ${BODY}`, color: "#fff" }}>
        <span style=${{ flex: "none", width: 56, height: 56, borderRadius: 14, background: "rgba(56,214,255,.10)", border: "1px solid rgba(56,214,255,.35)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <${Icon} name=${b.icon} size=${32} color=${K.cyan} stroke=${12} /></span>${b.text}<//>`)}
    </div>
  <//>`;
}

// s-smart: dijital katman (akilli sigorta, E-Scan, Power Doctor, Wall Scanner)
function SmartCard({ src, x, y, w, h, d }) {
  const f = useF(); const url = useMedia(src); const p = sp(f, d, { damping: 16, mass: 0.8, stiffness: 110 });
  const sw = P(f, d + 10, 30, inOut);
  return html`<div style=${abs(x, y, { width: w, height: h, perspective: 1400 })}>
    <div style=${{ position: "absolute", inset: 0, borderRadius: 14, overflow: "hidden", background: "#07141A", transform: `rotateY(${(1 - p) * 70}deg)`, transformOrigin: "left center",
      opacity: P(f, d, 8), boxShadow: "0 24px 50px rgba(0,0,0,.5), 0 0 0 1px rgba(0,228,135,.25)" }}>
      ${url && html`<img src=${url} style=${{ width: "100%", height: "100%", objectFit: "contain", display: "block" }} />`}
      ${sw > 0 && sw < 1 && html`<div style=${{ position: "absolute", top: -40, bottom: -40, width: 160, left: `${-30 + sw * 130}%`, transform: "rotate(12deg)", background: "linear-gradient(90deg, rgba(255,255,255,0), rgba(190,255,230,.35), rgba(255,255,255,0))" }} />`}
    </div>
  </div>`;
}
function Smart({ s, index, total }) {
  const cards = s.cards || [];
  return html`<${Stage} index=${index} total=${total} note=${s.note}>
    <div style=${abs(110, 86, { width: 450 })}>
      <${Kicker} text=${s.kicker} delay=${2} color=${K.green} />
      <${Words} text=${s.title} delay=${6} style=${{ marginTop: 22, font: `600 54px/1.06 ${HEAD}`, letterSpacing: "-0.022em", color: "#fff" }} />
      <${Rise} delay=${18} style=${{ marginTop: 22, font: `400 23px/1.42 ${BODY}`, color: K.text }}>${s.sub}<//>
      <${Rise} delay=${24} style=${{ marginTop: 40, font: `600 18px/1 ${BODY}`, letterSpacing: "0.16em", textTransform: "uppercase", color: K.green }}>${s.whyTitle}<//>
      ${(s.why || []).map((w, i) => html`<${Rise} key=${i} delay=${28 + i * 5} style=${{ marginTop: 20, display: "flex", alignItems: "center", gap: 16, font: `500 22px/1.3 ${BODY}`, color: "#fff" }}>
        <${Icon} name=${w.icon} size=${38} color=${K.green} stroke=${11} />${w.text}<//>`)}
    </div>
    ${cards.map((c, i) => {
      // 2 kart: yan yana, dikeyde ortada; 3 kart: ustte iki, altta ortada bir; 4 kart: 2x2
      const x = cards.length === 3 && i === 2 ? 920 : 615 + (i % 2) * 610;
      const y = cards.length <= 2 ? 400 : 240 + Math.floor(i / 2) * 350;
      return html`<${SmartCard} key=${i} src=${c} x=${x} y=${y} w=${595} h=${330} d=${16 + i * 9} />`;
    })}
  <//>`;
}

// s-photo: tam ekran gorsel (yavas yakinlasma), metin ve sayac/nokta kartlari
function Counter({ v, delay }) {
  const f = useF();
  if (v.to == null) return html`<span>${v.text}</span>`;
  const p = P(f, delay, 40);
  const val = (v.to * p).toLocaleString("en-US", { minimumFractionDigits: v.decimals || 0, maximumFractionDigits: v.decimals || 0 });
  return html`<span style=${{ fontVariantNumeric: "tabular-nums" }}>${v.prefix || ""}${val}${v.suffix || ""}</span>`;
}
function Photo({ s, index, total }) {
  const f = useF();
  const url = useMedia(s.src);
  const z = 1 + 0.06 * interpolate(f, [0, 360], [0, 1], clamp);
  // layout: "left" (metin solda), "bottom" (kartlar altta), "right" (kartlar sagda alt alta, gorselin sag yarisini kapatir)
  // clean: sadece fotograf, yazi/kart/alt bilgi yok (yavas yakinlasma kalir)
  if (s.clean) return html`<${Stage} index=${index} total=${total} bg=${false} chrome=${false}>
    <div style=${{ position: "absolute", inset: 0, opacity: P(f, 0, 24) }}>
      ${url && html`<img src=${url} style=${{ width: W, height: H, objectFit: "cover", transform: `scale(${z})`, transformOrigin: s.origin || "50% 50%" }} />`}
    </div>
  <//>`;
  const right = s.layout === "right";
  const bottom = s.layout === "bottom" || right;
  return html`<${Stage} index=${index} total=${total} note=${s.note} bg=${false}>
    <div style=${{ position: "absolute", inset: 0, opacity: P(f, 0, 20), filter: `brightness(${0.6 + 0.4 * P(f, 0, 30)})` }}>
      ${url && html`<img src=${url} style=${{ width: W, height: H, objectFit: "cover", transform: `scale(${z})`, transformOrigin: s.origin || "60% 50%" }} />`}
    </div>
    <div style=${{ position: "absolute", inset: 0, background: right
      ? "linear-gradient(180deg, rgba(3,8,22,.94) 0%, rgba(3,8,22,.78) 20%, rgba(3,8,22,.1) 36%, rgba(3,8,22,0) 60%, rgba(3,8,22,.55) 100%)"
      : bottom
      ? "linear-gradient(180deg, rgba(3,8,22,.94) 0%, rgba(3,8,22,.78) 20%, rgba(3,8,22,.1) 36%, rgba(3,8,22,0) 50%, rgba(3,8,22,.85) 78%, rgba(3,8,22,.95) 100%)"
      : "linear-gradient(90deg, rgba(3,8,22,.92) 0%, rgba(3,8,22,.6) 38%, rgba(3,8,22,0) 66%), linear-gradient(0deg, rgba(3,8,22,.7), rgba(3,8,22,0) 30%)" }} />
    <div style=${abs(110, bottom ? 86 : 230, { width: bottom ? 1500 : 860 })}>
      <${Kicker} text=${s.kicker} delay=${6} />
      <${Words} text=${s.title} delay=${10} accent=${s.accent || 0} style=${{ marginTop: 24, font: `600 ${bottom ? 60 : 78}px/1.03 ${HEAD}`, letterSpacing: "-0.03em", color: "#fff" }} />
      ${s.sub && html`<${Rise} delay=${24} style=${{ marginTop: 26, font: `400 26px/1.42 ${BODY}`, color: "rgba(255,255,255,.82)", maxWidth: 800 }}>${s.sub}<//>`}
    </div>
    ${s.stats && html`<div style=${abs(110, 800, { display: "flex", gap: 70 })}>
      ${s.stats.map((v, i) => html`<${Rise} key=${i} delay=${34 + i * 7}>
        <div style=${{ font: `300 92px/1 ${HEAD}`, letterSpacing: "-0.03em", color: K.cyan, textShadow: `0 0 30px ${K.cyan}55` }}><${Counter} v=${v} delay=${34 + i * 7} /></div>
        <div style=${{ marginTop: 10, font: `500 20px/1.3 ${BODY}`, letterSpacing: "0.12em", textTransform: "uppercase", color: K.soft }}>${v.label}</div>
      <//>`)}
    </div>`}
    ${right && html`<div style=${abs(930, 400, { width: W - 930, height: H - 400, opacity: P(f, 20, 20),
      background: "linear-gradient(180deg, rgba(3,8,22,0) 0%, rgba(3,8,22,.9) 7%, rgba(3,8,22,.94) 100%)" })} />`}
    ${s.points && html`<div style=${abs(right ? 960 : 110, right ? 430 : 760, { width: right ? 850 : 1700, display: "grid", gridTemplateColumns: right ? "1fr" : `repeat(${s.points.length}, 1fr)`, gap: right ? 14 : 26 })}>
      ${s.points.map((p, i) => html`<${Rise} key=${i} delay=${30 + i * 8} style=${{ padding: "26px 30px", borderRadius: 16, background: right ? "rgba(6,14,36,.95)" : "rgba(6,14,36,.72)", border: "1px solid rgba(56,214,255,.3)", backdropFilter: "blur(8px)" }}>
        <div style=${{ display: "flex", alignItems: "baseline", gap: 14 }}>
          <span style=${{ font: `600 20px/1 ${HEAD}`, color: K.cyan }}>${String(i + 1).padStart(2, "0")}</span>
          <span style=${{ font: `600 28px/1.15 ${HEAD}`, color: "#fff" }}>${p.title}</span>
        </div>
        <div style=${{ marginTop: 12, font: `400 21px/1.4 ${BODY}`, color: K.text }}>${p.text}</div>
      <//>`)}
    </div>`}
  <//>`;
}

// s-ev: EasyCharge urun konsepti
function Img({ src, x, y, w, h, d, style }) {
  const f = useF(); const url = useMedia(src); const p = sp(f, d, { damping: 18, mass: 0.8, stiffness: 120 });
  return html`<div style=${abs(x, y, { width: w, height: h, borderRadius: 16, overflow: "hidden", opacity: P(f, d, 10), transform: `translateY(${(1 - p) * 40}px)`, boxShadow: "0 26px 60px rgba(0,0,0,.55)", background: "#0B1430", ...style })}>
    ${url && html`<img src=${url} style=${{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />`}
  </div>`;
}
function Ev({ s, index, total }) {
  const f = useF();
  return html`<${Stage} index=${index} total=${total} note=${s.note}>
    <${Head} s=${s} width=${1000} size=${58} />
    <${Img} src=${s.images[0]} x=${1200} y=${110} w=${620} h=${413} d=${10} />
    <${Img} src=${s.images[1]} x=${1200} y=${548} w=${620} h=${349} d=${18} />
    <div style=${abs(110, 330, { width: 1000 })}>
      ${(s.blocks || []).map((b, i) => html`<${Rise} key=${i} delay=${20 + i * 7} style=${{ marginTop: i ? 30 : 0, paddingLeft: 26, borderLeft: `3px solid ${i === 1 ? K.cyan : "rgba(56,214,255,.35)"}` }}>
        <div style=${{ font: `600 28px/1.2 ${HEAD}`, color: "#fff" }}>${b.title}</div>
        ${b.text && html`<div style=${{ marginTop: 8, font: `400 22px/1.42 ${BODY}`, color: K.text }}>${b.text}</div>`}
        ${b.pair && html`<div style=${{ marginTop: 12, display: "flex", gap: 22 }}>${b.pair.map((p, j) => html`<div key=${j} style=${{ flex: 1, padding: "14px 18px", borderRadius: 12, background: "rgba(56,214,255,.07)", border: "1px solid rgba(56,214,255,.22)" }}>
          <div style=${{ font: `600 22px/1.2 ${HEAD}`, color: K.cyan }}>${p.title}</div><div style=${{ marginTop: 6, font: `400 19px/1.35 ${BODY}`, color: K.text }}>${p.text}</div></div>`)}</div>`}
      <//>`)}
    </div>
    <div style=${abs(110, 910, { width: 1710, display: "flex", gap: 14, flexWrap: "wrap" })}>
      ${(s.chips || []).map((c, i) => { const p = sp(f, 50 + i * 4); return html`<span key=${i} style=${{ padding: "12px 22px", borderRadius: 40, background: i === 0 ? K.cyan : "rgba(255,255,255,.06)",
        color: i === 0 ? "#04122C" : "#fff", border: `1px solid ${i === 0 ? K.cyan : "rgba(255,255,255,.18)"}`, font: `600 21px/1 ${BODY}`, transform: `scale(${p})`, display: "inline-block" }}>${c}</span>`; })}
    </div>
  <//>`;
}

// s-route: pazara giden yol, akan isik darbeleri + gelir katmanlari
function Route({ s, index, total }) {
  const f = useF();
  const nodes = s.nodes || [];
  const cw = 360, gap = 87, y = 330;
  return html`<${Stage} index=${index} total=${total}>
    <${Head} s=${s} width=${1650} size=${54} />
    ${nodes.map((n, i) => {
      const x = 110 + i * (cw + gap); const p = sp(f, 12 + i * 8);
      return html`<div key=${i}>
        <div style=${abs(x, y, { width: cw, height: 250, boxSizing: "border-box", padding: "26px 28px", borderRadius: 18, background: i === 0 ? "linear-gradient(160deg,#1A3FB0,#0B1F5C)" : "rgba(12,24,60,.7)",
          border: `1px solid ${i === 0 ? "rgba(56,214,255,.6)" : "rgba(255,255,255,.14)"}`, transform: `translateY(${(1 - p) * 40}px)`, opacity: P(f, 12 + i * 8, 10) })}>
          <div style=${{ font: `600 30px/1.1 ${HEAD}`, color: i === 0 ? "#fff" : K.cyan }}>${n.title}</div>
          ${n.items.map((t, j) => html`<div key=${j} style=${{ marginTop: j ? 8 : 18, font: `400 21px/1.3 ${BODY}`, color: K.text }}>${t}</div>`)}
        </div>
        ${i < nodes.length - 1 && html`<div style=${abs(x + cw, y + 124, { width: gap, height: 2, background: "rgba(56,214,255,.25)" })}>
          ${[0, 1, 2].map((k) => { const t = ((f - 30 - i * 6 + k * 14) % 42) / 42; return f > 30 + i * 6 ? html`<i key=${k} style=${abs(t * gap - 5, -4, { width: 10, height: 10, borderRadius: 5, background: K.cyan, boxShadow: `0 0 12px ${K.cyan}`, opacity: Math.sin(t * Math.PI) })} />` : null; })}
        </div>`}
      </div>`;
    })}
    <${Rise} delay=${44} style=${abs(110, 630, { font: `600 19px/1 ${BODY}`, letterSpacing: "0.16em", textTransform: "uppercase", color: K.cyan })}>${s.layersTitle}<//>
    ${(s.layers || []).map((l, i) => {
      const p = P(f, 50 + i * 10, 24, inOut);
      return html`<div key=${i} style=${abs(110, 670 + i * 92, { width: 1700 * p, height: 76, borderRadius: 12, overflow: "hidden", boxSizing: "border-box",
        background: `linear-gradient(90deg, ${["#1D4ED8", "#1A63C9", "#127FA8"][i]}, rgba(56,214,255,.18))`, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 30px" })}>
        <span style=${{ font: `600 27px/1 ${HEAD}`, color: "#fff", whiteSpace: "nowrap", opacity: P(f, 62 + i * 10, 12) }}>${l.title}</span>
        <span style=${{ font: `500 21px/1 ${BODY}`, color: K.ice, whiteSpace: "nowrap", opacity: P(f, 66 + i * 10, 12) }}>${l.tag}</span>
      </div>`;
    })}
  <//>`;
}

// s-returns: dort stratejik getiri + izlenecek gostergeler
function Returns({ s, index, total }) {
  const f = useF();
  const cols = s.cols || [];
  return html`<${Stage} index=${index} total=${total}>
    <${Head} s=${s} />
    ${cols.map((c, i) => {
      const x = 110 + i * 428;
      return html`<div key=${i} style=${abs(x, 270, { width: 400 })}>
        <div style=${{ height: 3, width: 400 * P(f, 10 + i * 7, 22), background: K.cyan, boxShadow: `0 0 12px ${K.cyan}` }} />
        <${Rise} delay=${14 + i * 7} style=${{ marginTop: 24, font: `300 88px/1 ${HEAD}`, color: K.cyan, letterSpacing: "-0.03em" }}>${String(i + 1).padStart(2, "0")}<//>
        <${Rise} delay=${18 + i * 7} style=${{ marginTop: 16, font: `600 34px/1.1 ${HEAD}`, color: "#fff" }}>${c.title}<//>
        ${c.items.map((t, j) => html`<${Rise} key=${j} delay=${22 + i * 7 + j * 3} style=${{ marginTop: j ? 12 : 20, display: "flex", gap: 12, font: `400 22px/1.38 ${BODY}`, color: K.text }}>
          <i style=${{ flex: "none", marginTop: 11, width: 7, height: 7, borderRadius: 4, background: K.cyan }} />${t}<//>`)}
      </div>`;
    })}
    <${Rise} delay=${60} style=${abs(110, 850, { width: 1700, display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" })}>
      <span style=${{ font: `600 19px/1 ${BODY}`, letterSpacing: "0.16em", textTransform: "uppercase", color: K.cyan, marginRight: 10 }}>${s.trackTitle}</span>
      ${(s.track || []).map((t, i) => html`<span key=${i} style=${{ padding: "11px 20px", borderRadius: 30, border: "1px solid rgba(255,255,255,.2)", font: `500 21px/1 ${BODY}`, color: "#fff" }}>${t}</span>`)}
    <//>
  <//>`;
}

// s-flywheel: donen buyume carki
function Flywheel({ s, index, total }) {
  const f = useF();
  const nodes = s.nodes || [];
  const cx = 1300, cy = 585, R = 320;
  const rot = f * 0.08;
  const pulse = ((f - 40) / 150) * 360;
  return html`<${Stage} index=${index} total=${total}>
    <div style=${abs(110, 120, { width: 640 })}>
      <${Kicker} text=${s.kicker} delay=${2} />
      <${Words} text=${s.title} delay=${6} style=${{ marginTop: 26, font: `600 54px/1.08 ${HEAD}`, letterSpacing: "-0.022em", color: "#fff" }} />
      <${Rise} delay=${20} style=${{ marginTop: 28, font: `400 25px/1.45 ${BODY}`, color: K.text }}>${s.sub}<//>
      ${s.goal && html`<${Rise} delay=${90} style=${{ marginTop: 36, padding: "20px 24px", borderRadius: 14, border: `1px solid ${K.cyan}66`, background: "rgba(56,214,255,.08)", font: `600 24px/1.35 ${HEAD}`, color: K.cyan }}>${s.goal}<//>`}
      ${s.track && html`<${Rise} delay=${110} style=${{ marginTop: 34 }}>
        <div style=${{ font: `600 18px/1 ${BODY}`, letterSpacing: "0.16em", textTransform: "uppercase", color: K.soft }}>${s.trackTitle}</div>
        <div style=${{ marginTop: 16, display: "flex", flexWrap: "wrap", gap: 10 }}>
          ${s.track.map((t, i) => html`<span key=${i} style=${{ padding: "10px 16px", borderRadius: 26, border: "1px solid rgba(255,255,255,.2)", font: `500 19px/1 ${BODY}`, color: "#fff" }}>${t}</span>`)}
        </div>
      <//>`}
    </div>
    <svg width=${W} height=${H} style=${abs(0, 0)}>
      <defs><marker id="sh-ar" markerWidth="10" markerHeight="10" refX="5" refY="5" orient="auto"><path d="M0 0 L10 5 L0 10 Z" fill=${K.cyan} /></marker></defs>
      <circle cx=${cx} cy=${cy} r=${R} fill="none" stroke="rgba(56,214,255,.25)" strokeWidth="3" strokeDasharray=${`${2 * Math.PI * R * P(f, 6, 40)} 9999`} transform=${`rotate(-90 ${cx} ${cy})`} />
      ${nodes.map((_, i) => { const a = ((-90 + i * 60 + 30 + rot) * Math.PI) / 180; const a2 = a + 0.08;
        return f > 40 ? html`<path key=${i} d=${`M${cx + R * Math.cos(a)} ${cy + R * Math.sin(a)} L${cx + R * Math.cos(a2)} ${cy + R * Math.sin(a2)}`} stroke=${K.cyan} strokeWidth="3" markerEnd="url(#sh-ar)" opacity=".8" />` : null; })}
      ${f > 40 && html`<circle cx=${cx + R * Math.cos(((pulse - 90 + rot) * Math.PI) / 180)} cy=${cy + R * Math.sin(((pulse - 90 + rot) * Math.PI) / 180)} r="9" fill=${K.cyan} style=${{ filter: `drop-shadow(0 0 10px ${K.cyan})` }} />`}
    </svg>
    <div style=${abs(cx - 120, cy - 120, { width: 240, height: 240, borderRadius: 120, background: "radial-gradient(circle,#163A8F,#081638)", border: `2px solid ${K.cyan}66`,
      display: "flex", alignItems: "center", justifyContent: "center", textAlign: "center", transform: `scale(${sp(f, 10)}) rotate(${-rot * 0}deg)` })}>
      <div style=${{ width: 190, font: `600 24px/1.25 ${HEAD}`, color: "#fff" }}>${s.center}</div>
    </div>
    ${nodes.map((n, i) => {
      const a = ((-90 + i * 60 + rot) * Math.PI) / 180; const x = cx + R * Math.cos(a), y = cy + R * Math.sin(a);
      const d = 20 + i * 10; const p = sp(f, d);
      const hot = Math.abs((((pulse - i * 60) % 360) + 360) % 360) < 30 && f > 40;
      return html`<div key=${i} style=${abs(x - 140, y - 38, { width: 280, height: 76, borderRadius: 38, display: "flex", alignItems: "center", gap: 14, padding: "0 22px", boxSizing: "border-box",
        background: hot ? "rgba(56,214,255,.22)" : "rgba(10,20,50,.92)", border: `1px solid ${hot ? K.cyan : "rgba(56,214,255,.35)"}`, transform: `scale(${p})`, boxShadow: hot ? `0 0 30px ${K.cyan}66` : "none" })}>
        <span style=${{ flex: "none", width: 36, height: 36, borderRadius: 18, background: K.cyan, color: "#04122C", display: "flex", alignItems: "center", justifyContent: "center", font: `700 18px/1 ${HEAD}` }}>${i + 1}</span>
        <span style=${{ font: `600 22px/1.15 ${HEAD}`, color: "#fff" }}>${n}</span>
      </div>`;
    })}
  <//>`;
}

// s-plan: 180 gunluk dogrulama plani, oynatma basligi soldan saga gecer
function Plan({ s, index, total }) {
  const f = useF();
  const ph = s.phases || [];
  const x0 = 110, span = 1700, days = 180, px = span / days;
  const head = interpolate(f, [24, 170], [0, days], inOut);
  return html`<${Stage} index=${index} total=${total} note=${s.note}>
    <${Head} s=${s} width=${1650} size=${56} />
    ${ph.map((p, i) => {
      const a = p.from, b = p.to; const x = x0 + a * px, w = (b - a) * px - 8;
      const fill = Math.max(0, Math.min(1, (head - a) / (b - a)));
      return html`<div key=${i}>
        <div style=${abs(x, 330, { width: w, height: 70, borderRadius: 10, overflow: "hidden", background: "rgba(255,255,255,.06)", border: "1px solid rgba(255,255,255,.12)", opacity: P(f, 10 + i * 4, 12) })}>
          <div style=${{ position: "absolute", left: 0, top: 0, bottom: 0, width: `${fill * 100}%`, background: i === ph.length - 1 ? `linear-gradient(90deg, ${K.hero}, #FFE29A)` : `linear-gradient(90deg, #1D4ED8, ${K.cyan})` }} />
          <div style=${{ position: "absolute", inset: 0, display: "flex", alignItems: "center", padding: "0 18px", font: `600 25px/1 ${HEAD}`, color: fill > 0.5 && i === ph.length - 1 ? "#1A1200" : "#fff" }}>${p.name}</div>
        </div>
        <div style=${abs(x, 414, { width: w, font: `500 19px/1 ${BODY}`, color: K.cyan, opacity: P(f, 14 + i * 4, 12) })}>${p.days}</div>
        <div style=${abs(x, 456, { width: w - 10 })}>
          ${p.items.map((t, j) => html`<div key=${j} style=${{ marginTop: j ? 10 : 0, font: `400 21px/1.3 ${BODY}`, color: head >= a ? "#fff" : K.soft, opacity: P(f, 20 + i * 4 + j * 2, 12) }}>${t}</div>`)}
        </div>
      </div>`;
    })}
    <div style=${abs(x0 + head * px - 1, 312, { width: 2, height: 270, background: "#fff", boxShadow: "0 0 14px #fff", opacity: head > 0 && head < days ? 1 : 0 })} />
    <${Rise} delay=${150} style=${abs(110, 660, { width: 1700, boxSizing: "border-box", padding: "30px 36px", borderRadius: 18, background: "linear-gradient(90deg, rgba(255,200,92,.16), rgba(255,200,92,.04))", border: `1px solid ${K.hero}88` })}>
      <div style=${{ font: `600 19px/1 ${BODY}`, letterSpacing: "0.16em", textTransform: "uppercase", color: K.hero }}>${s.decisionTitle}</div>
      <div style=${{ marginTop: 14, font: `600 34px/1.25 ${HEAD}`, color: "#fff" }}>${s.decision}</div>
    <//>
  <//>`;
}

// s-ask: iki karar
function Ask({ s, index, total }) {
  const f = useF();
  return html`<${Stage} index=${index} total=${total}>
    <${Head} s=${s} width=${1650} size=${62} />
    ${(s.cards || []).map((c, i) => {
      const x = 110 + i * 870; const p = sp(f, 16 + i * 10);
      return html`<div key=${i} style=${abs(x, 330, { width: 830, height: 560, boxSizing: "border-box", padding: "44px 48px", borderRadius: 22,
        background: i === 0 ? "linear-gradient(160deg, rgba(29,78,216,.55), rgba(10,20,50,.6))" : "linear-gradient(160deg, rgba(18,127,168,.5), rgba(10,20,50,.6))",
        border: "1px solid rgba(56,214,255,.35)", transform: `translateY(${(1 - p) * 60}px)`, opacity: P(f, 16 + i * 10, 10) })}>
        <div style=${{ display: "flex", alignItems: "center", gap: 20 }}>
          <span style=${{ width: 64, height: 64, borderRadius: 32, background: K.cyan, color: "#04122C", display: "flex", alignItems: "center", justifyContent: "center", font: `700 30px/1 ${HEAD}` }}>${i + 1}</span>
          <span style=${{ font: `600 19px/1.2 ${BODY}`, letterSpacing: "0.16em", textTransform: "uppercase", color: K.cyan }}>${c.kicker}</span>
        </div>
        <div style=${{ marginTop: 30, font: `600 42px/1.12 ${HEAD}`, color: "#fff" }}>${c.title}</div>
        <div style=${{ marginTop: 22, font: `400 24px/1.45 ${BODY}`, color: K.text }}>${c.text}</div>
        <div style=${{ position: "absolute", left: 48, right: 48, bottom: 44, display: "flex", gap: 12, flexWrap: "wrap" }}>
          ${(c.chips || []).map((t, j) => html`<span key=${j} style=${{ padding: "10px 18px", borderRadius: 30, background: "rgba(255,255,255,.08)", border: "1px solid rgba(255,255,255,.2)", font: `500 20px/1 ${BODY}`, color: "#fff", opacity: P(f, 40 + i * 10 + j * 4, 12) }}>${t}</span>`)}
        </div>
      </div>`;
    })}
  <//>`;
}

// s-ideas: eklenebilecek urun fikirleri, uc sutun (baslik, alt baslik, ikonlu kutular) ve altta tek cumlelik kural
const IDEA_C = [K.cyan, K.value, K.hero];
function Ideas({ s, index, total }) {
  const f = useF();
  const cols = s.cols || [];
  return html`<${Stage} index=${index} total=${total} note=${s.note}>
    <${Head} s=${s} width=${1700} size=${58} />
    ${cols.map((c, i) => {
      const cw = (1700 - 43 * (cols.length - 1)) / cols.length;
      const x = 110 + i * (cw + 43); const col = IDEA_C[i % 3];
      return html`<div key=${i} style=${abs(x, 240, { width: cw })}>
        <div style=${{ height: 3, width: cw * P(f, 10 + i * 8, 22), background: col, boxShadow: `0 0 12px ${col}` }} />
        <${Rise} delay=${12 + i * 8} style=${{ marginTop: 22, font: `600 34px/1.1 ${HEAD}`, color: col }}>${c.title}<//>
        <${Rise} delay=${16 + i * 8} style=${{ marginTop: 10, height: 60, font: `400 21px/1.4 ${BODY}`, color: K.text }}>${c.sub}<//>
        <div style=${{ marginTop: 16 }}>
          ${c.items.map((it, j) => { const p = P(f, 24 + i * 8 + j * 5, 18); return html`<div key=${j} style=${{ marginTop: j ? 14 : 0, height: 104, borderRadius: 14, boxSizing: "border-box", padding: "0 22px",
            display: "flex", alignItems: "center", gap: 18, background: `${col}12`, border: `1px solid ${col}55`, opacity: p, transform: `translateY(${(1 - p) * 24}px)` }}>
            <span style=${{ flex: "none", width: 58, display: "flex", justifyContent: "center" }}><${Icon} name=${it.icon || "box"} size=${50} color=${col} stroke=${10} glow=${6} /></span>
            <div>
              <div style=${{ font: `600 25px/1.15 ${HEAD}`, color: "#fff" }}>${it.name}</div>
              ${it.text && html`<div style=${{ marginTop: 6, font: `400 18px/1.3 ${BODY}`, color: K.soft }}>${it.text}</div>`}
            </div>
          </div>`; })}
        </div>
      </div>`;
    })}
    ${s.rule && html`<${Rise} delay=${70} style=${abs(110, 948, { width: 1700, font: `600 30px/1.25 ${HEAD}`, color: "#fff" })}>
      <span style=${{ color: K.cyan, marginRight: 14 }}>${s.ruleLabel || "The rule:"}</span>${s.rule}<//>`}
  <//>`;
}

// s-exit: solda tek isin sepeti (bugunku hal: 1 bizim, 6 baska marka), sagda iki sahne:
// "bugun" elektrikci dukkandan rengarenk markalarla cikar, "yarin" cantasi tamamen Philips mavisiyle cikar.
const BRAND_C = ["#D9483B", "#F2A33A", "#3BAA5C", "#9AA0AE", "#E8D44D", "#8E5BD6"];
const PH_BLUE = "#1D4ED8";
function Walker({ f0, ours }) {
  const f = useF();
  const t = f - f0;
  const DROP = 34, WALK = 92;
  const walk = interpolate(t, [DROP, DROP + WALK], [0, 1], { ...clamp, easing: Easing.inOut(Easing.quad) });
  const moving = t > DROP && t < DROP + WALK;
  const ph = moving ? Math.sin((t - DROP) * 0.42) : 0;
  const bob = moving ? Math.abs(Math.sin((t - DROP) * 0.42)) * 4 : 0;
  const x = 160 + walk * 290, y = 286 - bob;
  const a = (ph * 26 * Math.PI) / 180;
  const hip = [0, -72], L = 72;
  const foot = (s) => [hip[0] + Math.sin(s * a) * L, hip[1] + Math.cos(s * a) * L];
  const [f1x, f1y] = foot(1), [f2x, f2y] = foot(-1);
  const body = "#C7D3EC";
  const boxes = Array.from({ length: 7 }).map((_, i) => {
    const row = i < 4 ? 0 : 1, col = row ? i - 4 : i;
    const bx = 34 + col * 22 + (row ? 11 : 0), by = -104 - (row + 1) * 25;
    const p = P(f, f0 + 4 + i * 4, 12);
    const c = ours || i === 0 ? PH_BLUE : BRAND_C[(i - 1) % BRAND_C.length];
    return html`<g key=${i} opacity=${p} transform=${`translate(0 ${(1 - p) * -50})`}>
      <rect x=${bx} y=${by} width="20" height="24" rx="2" fill=${c} stroke="rgba(0,0,0,.35)" strokeWidth="1" />
      ${(ours || i === 0) && html`<rect x=${bx + 3} y=${by + 4} width="14" height="4" fill="#fff" opacity=".9" />`}
    </g>`;
  });
  return html`<g transform=${`translate(${x} ${y})`}>
    <line x1=${hip[0]} y1=${hip[1]} x2=${f2x} y2=${f2y} stroke="#9EACC8" strokeWidth="15" strokeLinecap="round" />
    <line x1=${hip[0]} y1=${hip[1]} x2=${f1x} y2=${f1y} stroke=${body} strokeWidth="15" strokeLinecap="round" />
    <line x1="0" y1="-72" x2="5" y2="-142" stroke=${body} strokeWidth="30" strokeLinecap="round" />
    <circle cx="10" cy="-170" r="18" fill=${body} />
    <line x1="6" y1="-132" x2="40" y2="-100" stroke=${body} strokeWidth="11" strokeLinecap="round" />
    ${boxes}
    <rect x="28" y="-104" width="100" height="52" rx="6" fill="#26324F" stroke="#5A6A90" strokeWidth="2" />
    <path d="M40 -104 V-90 M64 -104 V-90 M88 -104 V-90 M112 -104 V-90" stroke="#5A6A90" strokeWidth="2" />
  </g>`;
}
function ExitScene({ y, f0, ours, label, big, sub }) {
  const f = useF();
  const col = ours ? K.cyan : K.warn;
  const won = ours ? P(f, f0 + 40, 14) : 0;
  return html`<div style=${abs(760, y, { width: 1050, height: 310, borderRadius: 18, overflow: "hidden", opacity: P(f, f0 - 10, 14),
    border: `1px solid ${ours ? "rgba(56,214,255,.45)" : "rgba(255,255,255,.12)"}`, background: ours ? "rgba(20,50,120,.35)" : "rgba(10,20,50,.45)",
    boxShadow: ours ? `0 0 ${40 * won}px rgba(56,214,255,.25)` : "none" })}>
    <svg width="1050" height="310" style=${{ position: "absolute", left: 0, top: 0 }}>
      <rect x="40" y="70" width="96" height="216" rx="4" fill="rgba(255,230,170,.10)" stroke=${ours ? K.cyan : "#5A6A90"} strokeWidth="3" />
      <rect x="30" y="52" width="116" height="20" rx="3" fill=${ours ? PH_BLUE : "#3A4566"} />
      <text x="88" y="67" textAnchor="middle" fill="#fff" style=${{ font: `700 13px ${HEAD}`, letterSpacing: "0.12em" }}>${ours ? "PHILIPS" : "SHOP"}</text>
      <line x1="0" y1="287" x2="1050" y2="287" stroke="rgba(255,255,255,.18)" strokeWidth="2" />
      <${Walker} f0=${f0} ours=${ours} />
    </svg>
    <div style=${abs(620, 70, { width: 400 })}>
      <div style=${{ font: `600 18px/1 ${BODY}`, letterSpacing: "0.18em", textTransform: "uppercase", color: col, opacity: P(f, f0, 12) }}>${label}</div>
      <div style=${{ marginTop: 14, font: `600 46px/1.05 ${HEAD}`, color: "#fff", opacity: P(f, f0 + 60, 16), textShadow: ours ? `0 0 26px ${K.cyan}66` : "none" }}>${big}</div>
      <div style=${{ marginTop: 12, font: `400 21px/1.4 ${BODY}`, color: K.text, opacity: P(f, f0 + 70, 16) }}>${sub}</div>
    </div>
  </div>`;
}
function Exit({ s, index, total }) {
  const f = useF();
  const items = s.items || [];
  return html`<${Stage} index=${index} total=${total} note=${s.note}>
    <${Head} s=${s} width=${1700} size=${58} />
    <div style=${abs(110, 250, { width: 600, boxSizing: "border-box", padding: "24px 26px", borderRadius: 20, background: "rgba(10,20,50,.6)", border: "1px solid rgba(255,255,255,.12)", opacity: P(f, 6, 16) })}>
      <div style=${{ display: "flex", alignItems: "center", gap: 14, font: `600 24px/1.2 ${HEAD}`, color: "#fff" }}>
        <${Icon} name="basket" size=${40} color=${K.cyan} stroke=${10} glow=${6} />${s.basketTitle}
      </div>
      ${items.map((it, i) => {
        const p = P(f, 14 + i * 6, 14); const ours = !!it.ours;
        return html`<div key=${i} style=${{ marginTop: i ? 8 : 18, height: 54, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 16px",
          background: ours ? "rgba(47,107,255,.25)" : "rgba(255,255,255,.04)", border: `1px solid ${ours ? "rgba(56,214,255,.55)" : "rgba(255,255,255,.10)"}`, opacity: p, transform: `translateX(${(1 - p) * -30}px)` }}>
          <span style=${{ display: "flex", alignItems: "center", gap: 12, font: `600 21px/1.1 ${HEAD}`, color: "#fff" }}>
            <i style=${{ width: 14, height: 18, borderRadius: 2, background: ours ? PH_BLUE : BRAND_C[(i - 1) % BRAND_C.length], boxShadow: "0 0 0 1px rgba(255,255,255,.2)" }} />${it.name}</span>
          <span style=${{ padding: "6px 12px", borderRadius: 16, font: `600 14px/1 ${BODY}`, letterSpacing: "0.1em", textTransform: "uppercase",
            background: ours ? K.cyan : "transparent", color: ours ? "#04122C" : "rgba(255,255,255,.5)", border: `1px solid ${ours ? K.cyan : "rgba(255,255,255,.25)"}` }}>${ours ? s.ours : s.other}</span>
        </div>`;
      })}
    </div>
    <${ExitScene} y=${250} f0=${24} ours=${false} label=${s.today.label} big=${s.today.big} sub=${s.today.sub} />
    <${ExitScene} y=${590} f0=${150} ours=${true} label=${s.goal.label} big=${s.goal.big} sub=${s.goal.sub} />
    <${Rise} delay=${60} style=${abs(110, 920, { width: 600, font: `600 32px/1.2 ${HEAD}`, color: K.cyan, textShadow: `0 0 24px ${K.cyan}55` })}>${s.turn}<//>
  <//>`;
}

registerSlideTypes({
  "s-exit": Exit,
  "s-ideas": Ideas,
  "s-cover": Cover, "s-shift": Shift, "s-basket": Basket, "s-stores": Stores, "s-filters": Filters, "s-roles": Roles, "s-family": Family,
  "s-steps": Steps, "s-scanner": Scanner, "s-smart": Smart, "s-photo": Photo, "s-ev": Ev, "s-route": Route, "s-returns": Returns,
  "s-flywheel": Flywheel, "s-plan": Plan, "s-ask": Ask,
});
