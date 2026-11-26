// "night" slayt tipleri: sinematik, tam ekran gorsel sunum. Gorsel her zaman ana oge, oran asla bozulmaz.
// Fotografin kaplamadigi alan, ayni fotografin bulanik kopyasiyla dolar. Yazilar kucuk ve her slaytta ayni boydadir.
// Medya kaynak/sunumlar/<sunum>/medya altinda durur. Yayinda dosyalar sifreli (.enc) olur; anahtar sifreli sayfanin icindedir.
// Tipler: n-cover, n-divider, n-video, n-hero, n-gallery, n-icons, n-summary, n-closing
import React from "react";
import { useCurrentFrame, interpolate, Easing } from "remotion";
import { html, C, HEAD, BODY, clamp, Logo, registerSlideTypes, FPS } from "./slides.js";

const W = 1920, H = 1080, GREEN = C.green, TEAL = C.teal;
const out = { ...clamp, easing: Easing.out(Easing.cubic) };
const inOut = { ...clamp, easing: Easing.bezier(0.7, 0, 0.2, 1) };
const stillMode = new URLSearchParams(location.search).has("still");

// ---------- medya: yerelde dogrudan, yayinda indirilip tarayicida cozulur ----------
const DATA = JSON.parse(document.getElementById("deck-data")?.textContent || "{}");
const KEY = DATA.mediaKey || "";
const SLIDES = DATA.slides || [];
const cache = new Map();
let cryptoKey = null;
const hexBytes = (h) => Uint8Array.from(h.match(/../g).map((b) => parseInt(b, 16)));
const mimeOf = (s) => (s.endsWith(".mp4") ? "video/mp4" : "image/jpeg");
function load(src) {
  if (!KEY) return Promise.resolve(src);
  if (!cache.has(src)) cache.set(src, (async () => {
    const r = await fetch(src + ".enc");
    if (!r.ok) throw new Error("medya yok: " + src);
    const buf = await r.arrayBuffer();
    cryptoKey = cryptoKey || await crypto.subtle.importKey("raw", hexBytes(KEY), "AES-GCM", false, ["decrypt"]);
    const plain = await crypto.subtle.decrypt({ name: "AES-GCM", iv: buf.slice(0, 12) }, cryptoKey, buf.slice(12));
    return URL.createObjectURL(new Blob([plain], { type: mimeOf(src) }));
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
function mediaOf(o, list = []) {
  if (Array.isArray(o)) o.forEach((x) => mediaOf(x, list));
  else if (o && typeof o === "object") for (const k of Object.keys(o)) { if ((k === "src" || k === "poster" || k === "thumb") && typeof o[k] === "string") list.push(o[k]); else mediaOf(o[k], list); }
  return list;
}
const warmed = new Set();
function warm(src) {
  if (warmed.has(src)) return; warmed.add(src);
  if (KEY) load(src).catch(() => {});
  else if (!src.endsWith(".mp4")) { const i = new Image(); i.src = src; }
}
function warmAround(index) { for (let k = 0; k <= 3; k++) if (SLIDES[index + k]) mediaOf(SLIDES[index + k]).forEach(warm); }
// Arka planda butun fotograflari sirayla hazirla, gecisler bekletmesin
if (SLIDES.length && !stillMode) {
  const q = mediaOf(SLIDES).filter((s) => !s.endsWith(".mp4"));
  let n = 0;
  const step = () => { const s = q[n++]; if (!s) return; warm(s); setTimeout(step, KEY ? 220 : 60); };
  setTimeout(step, 1500);
}

// ---------- ortak parcalar ----------
const useF = () => useCurrentFrame();
function T(f, delay, dur, cfg = out) { return interpolate(f - delay, [0, dur], [0, 1], cfg); }

function Backdrop({ thumb, dim = 0.42 }) {
  const url = useMedia(thumb);
  return html`<div style=${{ position: "absolute", inset: 0, overflow: "hidden", background: "#05070A" }}>
    ${url && html`<img src=${url} style=${{ position: "absolute", left: -80, top: -80, width: W + 160, height: H + 160, objectFit: "cover", filter: `blur(46px) saturate(1.35) brightness(${dim})` }} />`}
    <div style=${{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at center, rgba(0,0,0,0) 40%, rgba(0,0,0,.55) 100%)" }} />
  </div>`;
}
function Sweep({ delay = 0, dur = 46, strong = 0.5 }) {
  const f = useF();
  const p = T(f, delay, dur, inOut);
  if (p <= 0 || p >= 1) return null;
  return html`<div style=${{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none", mixBlendMode: "screen" }}>
    <div style=${{ position: "absolute", top: "-30%", bottom: "-30%", width: "34%", left: `${-40 + p * 140}%`, transform: "rotate(14deg)",
      background: `linear-gradient(90deg, rgba(255,255,255,0), rgba(190,255,230,${strong}), rgba(255,255,255,0))` }} />
  </div>`;
}
function Words({ text, delay = 0, stagger = 2.4, style }) {
  const f = useF();
  return html`<div style=${{ display: "flex", flexWrap: "wrap", columnGap: "0.25em", ...style }}>
    ${String(text).split(/\s+/).filter(Boolean).map((w, i) => {
      const p = T(f, delay + i * stagger, 24);
      return html`<span key=${i} style=${{ display: "inline-block", overflow: "hidden", paddingBottom: "0.12em", marginBottom: "-0.12em" }}>
        <span style=${{ display: "inline-block", transform: `translateY(${(1 - p) * 105}%)`, opacity: p }}>${w}</span></span>`;
    })}
  </div>`;
}
function Rise({ delay = 0, y = 18, children, style }) {
  const f = useF(); const p = T(f, delay, 24);
  return html`<div style=${{ opacity: p, transform: `translateY(${(1 - p) * y}px)`, ...style }}>${children}</div>`;
}
const Kicker = ({ text, delay = 0, style }) => text ? html`<${Rise} delay=${delay} style=${{ font: `600 19px/1.2 ${BODY}`, letterSpacing: "0.16em", textTransform: "uppercase", color: GREEN, ...style }}>${text}<//>` : null;

function Counter({ v, delay }) {
  const f = useF();
  if (v.to == null) return html`<span>${v.text}</span>`;
  const p = T(f, delay, 46);
  const val = (v.to * p).toLocaleString("en-US", { minimumFractionDigits: v.decimals || 0, maximumFractionDigits: v.decimals || 0 });
  return html`<span style=${{ fontVariantNumeric: "tabular-nums" }}>${v.prefix || ""}${val}${v.suffix || ""}</span>`;
}
function Stats({ items, delay = 26, style, size = 68 }) {
  return html`<div style=${{ display: "flex", gap: 56, ...style }}>
    ${items.map((it, i) => html`<div key=${i} style=${{ flex: "1 1 0", minWidth: 0 }}>
      <${Rise} delay=${delay + i * 7}>
        <div style=${{ font: `300 ${size}px/1.05 ${HEAD}`, letterSpacing: "-0.02em", color: GREEN, whiteSpace: "nowrap" }}><${Counter} v=${it} delay=${delay + i * 7} /></div>
        <div style=${{ marginTop: 8, font: `400 22px/1.3 ${BODY}`, color: "rgba(255,255,255,.72)" }}>${it.label}</div>
      <//>
    </div>`)}
  </div>`;
}
// Ust bant: her slaytta ayni yer, ayni boy
function TopBar({ title, sub, index, total }) {
  return html`<div style=${{ position: "absolute", left: 0, right: 0, top: 0, height: 150, background: "linear-gradient(180deg, rgba(0,0,0,.82), rgba(0,0,0,0))", pointerEvents: "none" }} />
    <div style=${{ position: "absolute", left: 40, right: 280, top: 26, display: "flex", alignItems: "baseline", columnGap: 22, flexWrap: "wrap" }}>
      <${Words} text=${title} delay=${2} stagger=${1.6} style=${{ font: `600 44px/1.15 ${HEAD}`, letterSpacing: "-0.015em", color: "#fff" }} />
      ${sub && html`<${Rise} delay=${14} y=${8} style=${{ font: `400 23px/1.2 ${BODY}`, color: "rgba(255,255,255,.72)" }}>${sub}<//>`}
    </div>
    <${Corner} index=${index} total=${total} />`;
}
function Corner({ index, total }) {
  return html`<div style=${{ position: "absolute", right: 40, top: 30, display: "flex", alignItems: "center", gap: 18, filter: "drop-shadow(0 1px 6px rgba(0,0,0,.6))" }}>
    <span style=${{ font: `500 16px/1 ${BODY}`, color: "rgba(255,255,255,.7)", fontVariantNumeric: "tabular-nums" }}>${index + 1}</span>
    <${Logo} width=${124} />
  </div>`;
}

// Oran bozulmadan, sira korunarak en cok alani dolduran duzen
function partitions(a) { if (a.length <= 1) return [[a]]; const r = []; for (let i = 1; i <= a.length; i++) { const h = a.slice(0, i), t = a.slice(i); if (!t.length) r.push([h]); else for (const p of partitions(t)) r.push([h, ...p]); } return r; }
const ar = (p) => p.w / p.h;
function layoutRows(photos, box, gap) {
  let best = null;
  for (const rows of partitions(photos)) {
    const hs = rows.map((r) => (box.w - gap * (r.length - 1)) / r.reduce((t, p) => t + ar(p), 0));
    const k = Math.min(1, (box.h - gap * (rows.length - 1)) / hs.reduce((a, b) => a + b, 0));
    const Hs = hs.map((h) => h * k);
    const widths = rows.map((r, i) => r.reduce((t, p) => t + ar(p) * Hs[i], 0) + gap * (r.length - 1));
    let area = 0; rows.forEach((r, i) => r.forEach((p) => { area += ar(p) * Hs[i] * Hs[i]; }));
    const counts = rows.map((r) => r.length);
    const score = area * (Math.min(...widths) / Math.max(...widths)) ** 0.5 * (Math.min(...counts) / Math.max(...counts)) ** 0.3;
    if (!best || score > best.score) best = { rows, Hs, widths, score };
  }
  const out_ = []; const used = best.Hs.reduce((a, b) => a + b, 0) + gap * (best.rows.length - 1);
  let y = box.y + (box.h - used) / 2;
  best.rows.forEach((r, i) => { let x = box.x + (box.w - best.widths[i]) / 2; r.forEach((p) => { const w = ar(p) * best.Hs[i]; out_.push({ p, x, y, w, h: best.Hs[i] }); x += w + gap; }); y += best.Hs[i] + gap; });
  return out_;
}
function layoutCols(cols, box, gap) {
  const sl = cols.map((c) => 1 / c.reduce((t, p) => t + 1 / ar(p), 0));
  const ic = cols.map((c, i) => -(c.length - 1) * gap * sl[i]);
  let Hh = (box.w - gap * (cols.length - 1) - ic.reduce((a, b) => a + b, 0)) / sl.reduce((a, b) => a + b, 0);
  Hh = Math.min(Hh, box.h);
  const Ws = cols.map((c, i) => sl[i] * Hh + ic[i]);
  const total = Ws.reduce((a, b) => a + b, 0) + gap * (cols.length - 1);
  let x = box.x + (box.w - total) / 2; const out_ = [];
  cols.forEach((c, i) => { const w = Ws[i]; const ch = c.reduce((t, p) => t + w / ar(p), 0) + gap * (c.length - 1); let y = box.y + (box.h - ch) / 2; c.forEach((p) => { const h = w / ar(p); out_.push({ p, x, y, w, h }); y += h + gap; }); x += w + gap; });
  return out_;
}
function Tile({ t, delay, i }) {
  const f = useF(); const url = useMedia(t.p.src);
  const a = T(f, delay, 30, inOut);
  const dir = i % 4;
  const clip = dir === 0 ? `inset(0 ${(1 - a) * 100}% 0 0)` : dir === 1 ? `inset(${(1 - a) * 100}% 0 0 0)` : dir === 2 ? `inset(0 0 0 ${(1 - a) * 100}%)` : `inset(0 0 ${(1 - a) * 100}% 0)`;
  const settle = interpolate(f - delay, [0, 60], [1.16, 1], out);
  const drift = interpolate(f, [0, FPS * 90], [0, 0.04], clamp);
  return html`<div style=${{ position: "absolute", left: t.x, top: t.y, width: t.w, height: t.h, clipPath: clip, overflow: "hidden", background: "#0B0E13", boxShadow: "0 18px 50px rgba(0,0,0,.45)" }}>
    ${url && html`<img src=${url} alt=${t.p.cap || ""} style=${{ position: "absolute", inset: 0, width: "100%", height: "100%", transform: `scale(${settle + drift})` }} />`}
    <${Sweep} delay=${delay + 8} dur=${40} strong=${0.42} />
    ${t.p.cap && html`<div style=${{ position: "absolute", left: 0, right: 0, bottom: 0, padding: "34px 16px 12px", background: "linear-gradient(0deg, rgba(0,0,0,.78), rgba(0,0,0,0))", font: `500 21px/1.25 ${BODY}`, color: "#fff", opacity: T(f, delay + 24, 18) }}>${t.p.cap}</div>`}
  </div>`;
}

// ---------- slayt tipleri ----------
function Beams({ strength = 1 }) {
  const f = useF(); const a = T(f, 0, 50);
  const rot = (s, o) => o + Math.sin(f / s) * 16;
  return html`<div style=${{ position: "absolute", inset: 0, overflow: "hidden", background: "radial-gradient(ellipse at 50% 120%, #0B2A24 0%, #05070A 62%)" }}>
    ${[[-30, 90, GREEN, 0.5], [12, 130, TEAL, 0.36], [46, 110, GREEN, 0.3]].map(([o, s, c, op], i) => html`<div key=${i} style=${{ position: "absolute", left: "50%", bottom: -180, width: 440, height: 1700, marginLeft: -220, transformOrigin: "50% 100%", transform: `rotate(${rot(s, o)}deg)`,
      background: `linear-gradient(0deg, ${c}, rgba(0,0,0,0) 86%)`, opacity: op * a * strength, filter: "blur(38px)", clipPath: "polygon(44% 100%, 56% 100%, 100% 0, 0 0)" }} />`)}
    ${Array.from({ length: 30 }).map((_, i) => { const sp = 0.3 + ((i * 37) % 10) / 16, x = (i * 211) % W, y = H + 40 - ((f * sp + i * 97) % (H + 80)), z = 2 + (i % 3);
      return html`<div key=${"d" + i} style=${{ position: "absolute", left: x, top: y, width: z, height: z, borderRadius: "50%", background: i % 3 ? GREEN : "#fff", boxShadow: `0 0 ${z * 6}px ${GREEN}`, opacity: 0.45 * a }} />`; })}
  </div>`;
}
function Ring({ size = 760, x = "50%", y = "50%", delay = 0 }) {
  const f = useF(); const p = T(f, delay, 70, inOut); const r = size / 2 - 8, c = 2 * Math.PI * r;
  return html`<svg width=${size} height=${size} style=${{ position: "absolute", left: x, top: y, transform: `translate(-50%,-50%) rotate(${-90 + f * 0.12}deg)`, filter: `drop-shadow(0 0 22px ${GREEN})` }}>
    <circle cx=${size / 2} cy=${size / 2} r=${r} fill="none" stroke=${GREEN} strokeWidth="5" strokeLinecap="round" strokeDasharray=${`${c * 0.86 * p} ${c}`} opacity="0.85" /></svg>`;
}
function NCover({ s }) {
  const f = useF(); const url = useMedia(s.photo.src);
  const z = interpolate(f, [0, FPS * 30], [1.0, 1.08], clamp);
  return html`<div style=${{ position: "absolute", inset: 0, background: "#000", overflow: "hidden" }}>
    <${Backdrop} thumb=${s.photo.thumb} />
    ${url && html`<img src=${url} style=${{ position: "absolute", left: "50%", top: "50%", height: "100%", width: H * ar(s.photo), transform: `translate(-50%,-50%) scale(${Math.max(W / (H * ar(s.photo)), 1) * z})`, opacity: T(f, 0, 30) }} />`}
    <div style=${{ position: "absolute", inset: 0, background: "linear-gradient(90deg, rgba(0,0,0,.88), rgba(0,0,0,.28) 62%, rgba(0,0,0,.05))" }} />
    <${Sweep} delay=${10} dur=${70} strong=${0.3} />
    <${Rise} delay=${6}><${Logo} width=${260} style=${{ position: "absolute", left: 110, top: 96 }} /><//>
    <div style=${{ position: "absolute", left: 110, bottom: 120, width: 1300 }}>
      <${Words} text=${s.title} delay=${14} stagger=${4} style=${{ font: `300 100px/1.06 ${HEAD}`, letterSpacing: "-0.03em", color: "#fff" }} />
      <${Rise} delay=${46} style=${{ marginTop: 44, font: `500 38px/1.2 ${HEAD}`, color: GREEN }}>${s.name}<//>
      <${Rise} delay=${54} style=${{ marginTop: 12, font: `400 25px/1.35 ${BODY}`, color: "rgba(255,255,255,.88)" }}>${s.role}<//>
      <${Rise} delay=${62} style=${{ marginTop: 4, font: `400 25px/1.35 ${BODY}`, color: "rgba(255,255,255,.88)" }}>${s.org}<//>
    </div>
  </div>`;
}
function NDivider({ s, index, total }) {
  return html`<div style=${{ position: "absolute", inset: 0, overflow: "hidden" }}>
    <${Beams} />
    <${Ring} size=${900} x="74%" y="46%" delay=${6} />
    <div style=${{ position: "absolute", left: 120, right: 120, top: 0, bottom: 0, display: "flex", flexDirection: "column", justifyContent: "center" }}>
      <${Kicker} text=${s.kicker} delay=${10} style=${{ marginBottom: 26, fontSize: 24 }} />
      <${Words} text=${s.title} delay=${14} stagger=${3} style=${{ font: `500 ${s.size || 92}px/1.1 ${HEAD}`, letterSpacing: "-0.025em", color: "#fff", maxWidth: 1450 }} />
      ${s.name && html`<${Rise} delay=${40} style=${{ marginTop: 44, font: `500 36px/1.2 ${HEAD}`, color: GREEN }}>${s.name}<//>`}
      ${s.role && html`<${Rise} delay=${48} style=${{ marginTop: 12, font: `400 25px/1.35 ${BODY}`, color: "rgba(255,255,255,.8)" }}>${s.role}<//>`}
      ${s.org && html`<${Rise} delay=${54} style=${{ marginTop: 4, font: `400 25px/1.35 ${BODY}`, color: "rgba(255,255,255,.8)" }}>${s.org}<//>`}
    </div>
    <${Corner} index=${index} total=${total} />
  </div>`;
}
function NVideo({ s, index, total }) {
  const f = useF(); const url = useMedia(s.src); const poster = useMedia(s.poster); const ref = React.useRef(null);
  const [mutedChip, setChip] = React.useState(false);
  React.useEffect(() => {
    const v = ref.current; if (!v || !url || stillMode) return;
    v.muted = false;
    const go = () => v.play().catch(() => { v.muted = true; setChip(true); v.play().catch(() => {}); });
    go();
    const key = (e) => { if (e.key === "m" || e.key === "M") { v.muted = !v.muted; setChip(v.muted); } if (e.key === "p" || e.key === "P") { v.paused ? v.play() : v.pause(); } };
    document.addEventListener("keydown", key);
    return () => { document.removeEventListener("keydown", key); v.pause(); };
  }, [url]);
  const list = s.videos || [{ src: s.src, poster: s.poster, w: s.w, h: s.h }];
  const fadeTitle = s.title ? 1 - T(f, 120, 40) : 0;
  const full = s.w / s.h > 1.7;
  const a = T(f, 0, 24);
  let vw = W, vh = W / (s.w / s.h);
  if (vh > H) { vh = H; vw = H * (s.w / s.h); }
  return html`<div style=${{ position: "absolute", inset: 0, background: "#000", overflow: "hidden" }}>
    ${!full && html`<${Backdrop} thumb=${s.thumb} dim=${0.5} />`}
    <div style=${{ position: "absolute", left: (W - vw) / 2, top: (H - vh) / 2, width: vw, height: vh, opacity: a, background: "#000", boxShadow: full ? "none" : "0 0 90px rgba(0,0,0,.6)" }}>
      ${poster && html`<img src=${poster} style=${{ position: "absolute", inset: 0, width: "100%", height: "100%" }} />`}
      ${url && !stillMode && html`<video ref=${ref} src=${url} playsInline preload="auto" style=${{ position: "absolute", inset: 0, width: "100%", height: "100%" }} />`}
      ${!url && !stillMode && html`<div style=${{ position: "absolute", left: "50%", top: "50%", width: 54, height: 54, margin: -27, borderRadius: "50%", border: "4px solid rgba(255,255,255,.2)", borderTopColor: GREEN, animation: "deck-spin .9s linear infinite" }} />`}
    </div>
    ${s.title && html`<div style=${{ opacity: fadeTitle }}><${TopBar} title=${s.title} sub=${s.sub} index=${index} total=${total} /></div>`}
    ${mutedChip && html`<div style=${{ position: "absolute", left: 40, bottom: 40, padding: "10px 18px", borderRadius: 30, background: "rgba(0,0,0,.65)", font: `500 20px/1 ${BODY}`, color: "#fff" }}>Sound off · press M</div>`}
    <${React.Fragment}>${list.length ? null : null}<//>
  </div>`;
}
// Dikey iki video yan yana
function NVideos({ s, index, total }) {
  const refs = React.useRef([]);
  const urls = [useMedia(s.videos[0]?.src), useMedia(s.videos[1]?.src)];
  const posters = [useMedia(s.videos[0]?.poster), useMedia(s.videos[1]?.poster)];
  React.useEffect(() => {
    if (stillMode) return;
    refs.current.forEach((v, i) => { if (v && urls[i]) { v.muted = i > 0; v.play().catch(() => { v.muted = true; v.play().catch(() => {}); }); } });
    return () => refs.current.forEach((v) => v?.pause());
  }, [urls[0], urls[1]]);
  const gap = 28, h = H - 150, n = s.videos.length;
  const ws = s.videos.map((v) => h * (v.w / v.h));
  let x = (W - ws.reduce((a, b) => a + b, 0) - gap * (n - 1)) / 2;
  return html`<div style=${{ position: "absolute", inset: 0, background: "#000", overflow: "hidden" }}>
    <${Backdrop} thumb=${s.thumb} dim=${0.5} />
    ${s.videos.map((v, i) => { const l = x; x += ws[i] + gap; return html`<${Rise} key=${i} delay=${4 + i * 8} y=${30} style=${{ position: "absolute", left: l, top: 120, width: ws[i], height: h, background: "#000", boxShadow: "0 20px 70px rgba(0,0,0,.6)" }}>
      ${posters[i] && html`<img src=${posters[i]} style=${{ position: "absolute", inset: 0, width: "100%", height: "100%" }} />`}
      ${urls[i] && !stillMode && html`<video ref=${(el) => { refs.current[i] = el; }} src=${urls[i]} playsInline loop=${n > 1} preload="auto" style=${{ position: "absolute", inset: 0, width: "100%", height: "100%" }} />`}
    <//>`; })}
    <${TopBar} title=${s.title} sub=${s.sub} index=${index} total=${total} />
  </div>`;
}
function Panel({ s, delay = 18 }) {
  return html`
    <${Kicker} text=${s.loc} delay=${delay - 8} style=${{ marginBottom: 14 }} />
    <${Words} text=${s.title} delay=${delay - 6} stagger=${2.4} style=${{ font: `600 44px/1.15 ${HEAD}`, letterSpacing: "-0.015em", color: "#fff" }} />
    ${s.text && html`<${Rise} delay=${delay + 8} style=${{ marginTop: 18, font: `400 26px/1.42 ${BODY}`, color: "rgba(255,255,255,.86)" }}>${s.text}<//>`}
    ${s.quote && html`<${Rise} delay=${delay + 8} style=${{ marginTop: 18, font: `italic 400 26px/1.42 ${BODY}`, color: "#fff" }}>“${s.quote}”<//>`}
    ${s.by && html`<${Rise} delay=${delay + 16} style=${{ marginTop: 12, font: `400 21px/1.35 ${BODY}`, color: "rgba(255,255,255,.72)" }}>${s.by}<//>`}
    ${s.list && html`<div style=${{ marginTop: 18 }}>${s.list.map((t, i) => html`<${Rise} key=${i} delay=${delay + 10 + i * 5} style=${{ display: "flex", gap: 14, marginBottom: 10, font: `400 24px/1.35 ${BODY}`, color: "rgba(255,255,255,.88)" }}><span style=${{ color: GREEN }}>✓</span><span>${t}</span><//>`)}</div>`}
    ${s.stats && html`<${Stats} items=${s.stats} delay=${delay + 12} style=${{ marginTop: 28 }} />`}
    ${s.link && html`<${Rise} delay=${delay + 20} style=${{ marginTop: 18, font: `500 22px/1.3 ${BODY}` }}><a href=${s.link.url} target="_blank" rel="noopener" onClick=${(e) => e.stopPropagation()} style=${{ color: TEAL }}>${s.link.text}</a><//>`}`;
}
function NHero({ s, index, total }) {
  const f = useF(); const url = useMedia(s.photo.src); const a = ar(s.photo);
  const split = a < 1.15;
  let ph = H, pw = H * a; if (pw > W) { pw = W; ph = W / a; }
  const z = interpolate(f, [0, 60], [1.1, 1], out) + interpolate(f, [0, FPS * 90], [0, 0.05], clamp);
  const fx = split ? (s.side === "left" ? 0 : W - pw) : (W - pw) / 2;
  return html`<div style=${{ position: "absolute", inset: 0, overflow: "hidden" }}>
    <${Backdrop} thumb=${s.photo.thumb} />
    <div style=${{ position: "absolute", left: fx, top: (H - ph) / 2, width: pw, height: ph, overflow: "hidden", clipPath: `inset(0 ${(1 - T(f, 0, 34, inOut)) * 100}% 0 0)`, boxShadow: "0 0 80px rgba(0,0,0,.55)" }}>
      ${url && html`<img src=${url} alt=${s.title} style=${{ position: "absolute", inset: 0, width: "100%", height: "100%", transform: `scale(${z})` }} />`}
      <${Sweep} delay=${14} dur=${56} strong=${0.36} />
    </div>
    ${split
      ? html`<div style=${{ position: "absolute", left: s.side === "left" ? pw + 80 : 90, width: W - pw - 170, top: 0, bottom: 0, display: "flex", flexDirection: "column", justifyContent: "center" }}><${Panel} s=${s} /></div>`
      : html`<div style=${{ position: "absolute", left: 0, right: 0, bottom: 0, height: 560, background: "linear-gradient(0deg, rgba(0,0,0,.9), rgba(0,0,0,.55) 42%, rgba(0,0,0,0))" }} />
        <div style=${{ position: "absolute", left: 60, bottom: 56, width: s.stats ? 1100 : 1040 }}><${Panel} s=${s} /></div>`}
    <${Corner} index=${index} total=${total} />
  </div>`;
}
function NGallery({ s, index, total }) {
  const stats = s.stats ? 170 : 0, note = s.note ? 44 : 0, text = s.text ? 84 : 0;
  const box = { x: 36, y: 104, w: W - 72, h: H - 104 - 28 - stats - note - text };
  const gap = 12;
  const tiles = s.cols ? layoutCols(s.cols, box, gap) : layoutRows(s.photos, box, gap);
  return html`<div style=${{ position: "absolute", inset: 0, overflow: "hidden" }}>
    <${Backdrop} thumb=${(s.cols ? s.cols[0][0] : s.photos[0]).thumb} />
    ${tiles.map((t, i) => html`<${Tile} key=${i} t=${t} i=${i} delay=${6 + i * 7} />`)}
    ${s.text && html`<${Rise} delay=${30} style=${{ position: "absolute", left: 40, right: 40, bottom: 30 + note, height: text - 14, display: "flex", alignItems: "flex-end", justifyContent: "center", textAlign: "center", font: `400 26px/1.35 ${BODY}`, color: "rgba(255,255,255,.9)" }}>${s.text}<//>`}
    ${s.stats && html`<${Stats} items=${s.stats} delay=${26} style=${{ position: "absolute", left: 60, right: 60, bottom: 30 }} />`}
    ${s.note && html`<${Rise} delay=${34} style=${{ position: "absolute", left: 40, right: 40, bottom: 12, textAlign: "center", font: `400 17px/1.3 ${BODY}`, color: "rgba(255,255,255,.62)" }}>${s.note}<//>`}
    <${TopBar} title=${s.title} sub=${s.sub} index=${index} total=${total} />
  </div>`;
}
function NIcons({ s, index, total }) {
  const f = useF();
  return html`<div style=${{ position: "absolute", inset: 0, overflow: "hidden" }}>
    <${Beams} strength=${0.45} />
    <div style=${{ position: "absolute", left: 60, right: 60, top: 150, bottom: 60, display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gridTemplateRows: "1fr 1fr", gap: 24 }}>
      ${s.items.map((it, i) => { const p = T(f, 12 + i * 9, 26); const flash = interpolate(f - (12 + i * 9), [0, 12, 40], [0, 1, 0.25], clamp);
        return html`<div key=${i} style=${{ position: "relative", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 28, background: "rgba(255,255,255,.05)", border: `1px solid rgba(0,228,135,${0.1 + flash * 0.6})`, boxShadow: `0 0 ${flash * 60}px rgba(0,228,135,${flash * 0.5}), inset 0 0 ${flash * 50}px rgba(0,228,135,${flash * 0.18})`, opacity: 0.25 + p * 0.75 }}>
          <div style=${{ width: 92, height: 92, color: GREEN, filter: `drop-shadow(0 0 ${6 + flash * 22}px ${GREEN})` }} dangerouslySetInnerHTML=${{ __html: it.svg }} />
          <div style=${{ font: `500 26px/1.25 ${BODY}`, color: "#fff", textAlign: "center", padding: "0 18px" }}>${it.label}</div>
        </div>`; })}
    </div>
    <${TopBar} title=${s.title} index=${index} total=${total} />
  </div>`;
}
function Marquee({ photos, y, h }) {
  const f = useF(); const seq = [...photos, ...photos, ...photos];
  const unit = photos.reduce((t, p) => t + h * ar(p) + 12, 0);
  const off = (f * 1.1) % unit;
  let x = -off;
  return html`<div style=${{ position: "absolute", left: 0, right: 0, top: y, height: h, overflow: "hidden" }}>
    ${seq.map((p, i) => { const l = x, w = h * ar(p); x += w + 12; return html`<${MarqImg} key=${i} p=${p} l=${l} w=${w} h=${h} />`; })}
  </div>`;
}
function MarqImg({ p, l, w, h }) { const u = useMedia(p.src); return u ? html`<img src=${u} style=${{ position: "absolute", left: l, top: 0, width: w, height: h }} />` : null; }
function NSummary({ s, index, total }) {
  return html`<div style=${{ position: "absolute", inset: 0, overflow: "hidden" }}>
    <${Beams} strength=${0.5} />
    <div style=${{ position: "absolute", left: 60, right: 60, top: 130, height: 500, display: "grid", gridTemplateColumns: "1fr 1fr", gridTemplateRows: "1fr 1fr", gap: 22 }}>
      ${s.items.map((it, i) => html`<${Rise} key=${i} delay=${10 + i * 7} y=${24} style=${{ display: "flex", gap: 30, alignItems: "center", padding: "0 40px", background: "rgba(255,255,255,.06)", border: "1px solid rgba(255,255,255,.1)" }}>
        <div style=${{ width: 72, height: 72, flexShrink: 0, color: GREEN, filter: `drop-shadow(0 0 12px ${GREEN})` }} dangerouslySetInnerHTML=${{ __html: it.svg }} />
        <div><div style=${{ font: `600 34px/1.2 ${HEAD}`, color: "#fff" }}>${it.title}</div><div style=${{ marginTop: 8, font: `400 24px/1.35 ${BODY}`, color: "rgba(255,255,255,.78)" }}>${it.text}</div></div>
      <//>`)}
    </div>
    <${Rise} delay=${44} style=${{ position: "absolute", left: 60, right: 60, top: 650, textAlign: "center", font: `500 25px/1.3 ${BODY}`, color: GREEN }}>${s.line}<//>
    <${Marquee} photos=${s.photos} y=${706} h=${340} />
    <${TopBar} title=${s.title} index=${index} total=${total} />
  </div>`;
}
function NClosing() {
  const f = useF(); const p = T(f, 18, 40);
  return html`<div style=${{ position: "absolute", inset: 0, overflow: "hidden" }}>
    <${Beams} />
    <${Ring} size=${820} delay=${0} />
    <div style=${{ position: "absolute", left: "50%", top: "50%", transform: `translate(-50%,-50%) scale(${0.94 + p * 0.06})`, opacity: p }}><${Logo} width=${620} /></div>
  </div>`;
}
const withWarm = (Comp) => (props) => { React.useEffect(() => { warmAround(props.index); }, [props.index]); return html`<${Comp} ...${props} />`; };
registerSlideTypes({
  "n-cover": withWarm(NCover), "n-divider": withWarm(NDivider), "n-video": withWarm(NVideo), "n-videos": withWarm(NVideos),
  "n-hero": withWarm(NHero), "n-gallery": withWarm(NGallery), "n-icons": withWarm(NIcons), "n-summary": withWarm(NSummary), "n-closing": withWarm(NClosing),
});
