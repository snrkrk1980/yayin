// "corridor" slayt tipleri: veri gorsellestirmesi agirlikli, her slayt kendi Remotion animasyonuyla.
// Slayt metinleri ve rakamlar bu dosyada DEGIL, sunumun index.html dosyasindaki deck-data blogunda durur.
// Tipler: c-cover, c-map, c-skyline, c-section, c-flow, c-tr-map, c-race, c-strip, c-funnel,
//         c-gauges, c-orbit, c-plays, c-road, c-country, c-stairs, c-bubbles, c-heat, c-priorities
import React from "react";
import { useCurrentFrame, interpolate, spring, Easing } from "remotion";
import {
  html, C, HEAD, BODY, clamp, WIDTH, HEIGHT, FPS, pad, gradText, useLook, useSpring,
  Frame, Footer, Kicker, RiseText, Fade, Logo, Beacon, registerSlideTypes,
} from "./slides.js";

// ---------- ortak yardimcilar ----------
const fmt = (v, d = 0) => v.toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d });
const glass = { background: "rgba(255,255,255,.045)", border: "1px solid rgba(255,255,255,.12)", borderRadius: 24, backdropFilter: "blur(8px)" };
const muted = "rgba(255,255,255,.66)";
const RED = "#FF6B6B";
const ease = { ...clamp, easing: Easing.out(Easing.cubic) };
const tone = (v) => (v < 0 ? RED : C.green);

function useT(delay, dur = 40) {
  const frame = useCurrentFrame();
  return interpolate(frame - delay, [0, dur], [0, 1], ease);
}
function Counter({ to, from = 0, decimals = 0, prefix = "", suffix = "", delay = 0, dur = 45, style }) {
  const p = useT(delay, dur);
  const v = from + (to - from) * p;
  return html`<span style=${{ fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap", ...style }}>${prefix}${fmt(v, decimals)}${suffix}</span>`;
}
// Sayi nesnesi: { value, decimals, prefix, suffix }
function Num({ n, delay, style, dur }) {
  return html`<${Counter} to=${n.value} decimals=${n.decimals || 0} prefix=${n.prefix || ""} suffix=${n.suffix || ""} delay=${delay} dur=${dur} style=${style} />`;
}
function Head({ s, delay = 0, size = 76, max = 1400 }) {
  return html`<div>
    <${Kicker} text=${s.kicker} delay=${delay + 2} />
    <${RiseText} text=${s.title} delay=${delay + 6} stagger=${2} gradientWords=${s.gradientWords ?? 1}
      style=${{ marginTop: 26, font: `600 ${size}px/1.04 ${HEAD}`, letterSpacing: "-0.04em", maxWidth: max }} />
  </div>`;
}
function Pop({ delay = 0, children, style, y = 40, scale = 0.96 }) {
  const p = useSpring(delay, { damping: 16, stiffness: 110, mass: 0.8 });
  return html`<div style=${{ opacity: Math.min(1, p), transform: `translateY(${(1 - p) * y}px) scale(${scale + (1 - scale) * p})`, ...style }}>${children}</div>`;
}
function Label({ children, style }) {
  return html`<div style=${{ font: `500 19px/1.2 ${BODY}`, letterSpacing: "0.16em", textTransform: "uppercase", color: muted, ...style }}>${children}</div>`;
}
function Badge({ text, color = C.green, delay = 0 }) {
  const p = useSpring(delay, { damping: 12, stiffness: 160, mass: 0.6 });
  return html`<span style=${{ display: "inline-block", padding: "6px 14px", borderRadius: 999, font: `600 20px/1.2 ${HEAD}`,
    color, background: `${color}1f`, border: `1px solid ${color}66`, transform: `scale(${p})`, whiteSpace: "nowrap" }}>${text}</span>`;
}
// Projeksiyon: boylam/enlem -> kutu icinde piksel
function projector(b, w, h) {
  const k = Math.cos(((b.lat0 + b.lat1) / 2) * Math.PI / 180);
  const sx = w / ((b.lon1 - b.lon0) * k), sy = h / (b.lat1 - b.lat0);
  const s = Math.min(sx, sy);
  const ox = (w - (b.lon1 - b.lon0) * k * s) / 2, oy = (h - (b.lat1 - b.lat0) * s) / 2;
  return (lon, lat) => [ox + (lon - b.lon0) * k * s, oy + (b.lat1 - lat) * s];
}
// Kayan bant (referans projeler)
function Ticker({ items = [], delay = 0, speed = 1.8, top, bottom }) {
  const frame = useCurrentFrame();
  const p = useT(delay, 30);
  const W = 470;
  const span = items.length * W;
  const x = -(((frame - delay) * speed) % span);
  return html`<div style=${{ position: "absolute", left: 0, right: 0, top, bottom, height: 74, overflow: "hidden", opacity: p,
      maskImage: "linear-gradient(90deg, transparent, #000 8%, #000 92%, transparent)", WebkitMaskImage: "linear-gradient(90deg, transparent, #000 8%, #000 92%, transparent)" }}>
    <div style=${{ position: "absolute", left: x, top: 0, display: "flex" }}>
      ${[...items, ...items, ...items].map((it, i) => html`<div key=${i} style=${{ width: W, flexShrink: 0, display: "flex", alignItems: "center", gap: 18, paddingRight: 30 }}>
        <span style=${{ width: 10, height: 10, borderRadius: "50%", background: C.amber, boxShadow: `0 0 14px ${C.amber}`, flexShrink: 0 }} />
        <span style=${{ font: `500 24px/1.2 ${HEAD}`, color: "#fff", whiteSpace: "nowrap" }}>${it.name}</span>
        ${it.value && html`<span style=${{ font: `500 22px/1.2 ${BODY}`, color: C.green, whiteSpace: "nowrap" }}>${it.value}</span>`}
      </div>`)}
    </div>
  </div>`;
}

// ---------- 1. kapak ----------
function CCover({ s, meta }) {
  const frame = useCurrentFrame();
  const route = s.route || [];
  const line = interpolate(frame, [40, 110], [0, 1], { ...clamp, easing: Easing.inOut(Easing.cubic) });
  const sweep = interpolate(frame, [26, 80], [-30, 130], clamp);
  return html`<${Frame} dark=${true}>
    <${Beacon} size=${760} x="77%" y="40%" delay=${4} />
    <div style=${{ ...pad, bottom: 300 }}>
      <${Logo} width=${190} />
      <div style=${{ position: "absolute", top: 190 }}>
        <${Kicker} text=${s.kicker} delay=${8} />
        <div style=${{ position: "relative", marginTop: 36, maxWidth: 1150 }}>
          <${RiseText} text=${s.title} delay=${12} stagger=${5} gradientWords=${1} style=${{ font: `600 150px/0.95 ${HEAD}`, letterSpacing: "-0.05em" }} />
          <div style=${{ position: "absolute", inset: "-10px -40px", pointerEvents: "none", mixBlendMode: "overlay",
            background: `linear-gradient(100deg, transparent ${sweep - 12}%, rgba(255,255,255,.45) ${sweep}%, transparent ${sweep + 12}%)` }} />
        </div>
        <${Fade} delay=${30} style=${{ marginTop: 34, font: `400 36px/1.4 ${BODY}`, color: "rgba(255,255,255,.8)", maxWidth: 1050 }}>${s.subtitle}<//>
      </div>
    </div>
    <div style=${{ position: "absolute", left: 120, right: 120, bottom: 190, height: 80 }}>
      <div style=${{ position: "absolute", left: 0, right: 0, top: 18, height: 2, background: "rgba(255,255,255,.1)" }} />
      <div style=${{ position: "absolute", left: 0, top: 17, height: 4, width: `${line * 100}%`, borderRadius: 4,
        background: `linear-gradient(90deg, ${C.amber}, ${C.green}, ${C.teal})`, boxShadow: `0 0 24px ${C.green}` }} />
      ${route.map((r, i) => {
        const at = route.length > 1 ? i / (route.length - 1) : 0;
        const lit = interpolate(line, [at - 0.04, at], [0, 1], clamp);
        return html`<div key=${i} style=${{ position: "absolute", left: `${at * 100}%`, top: 0, transform: `translateX(${i === 0 ? 0 : i === route.length - 1 ? -100 : -50}%)`,
            display: "flex", flexDirection: "column", alignItems: i === 0 ? "flex-start" : i === route.length - 1 ? "flex-end" : "center" }}>
          <div style=${{ width: 38, height: 38, borderRadius: "50%", display: "grid", placeItems: "center", background: `rgba(0,228,135,${0.15 * lit})` }}>
            <div style=${{ width: 14, height: 14, borderRadius: "50%", background: lit > 0.5 ? "#fff" : "rgba(255,255,255,.3)", boxShadow: `0 0 ${24 * lit}px ${C.green}` }} />
          </div>
          <span style=${{ marginTop: 12, font: `500 24px/1 ${HEAD}`, letterSpacing: "0.04em", color: `rgba(255,255,255,${0.35 + 0.65 * lit})`, whiteSpace: "nowrap" }}>${r}</span>
        </div>`;
      })}
    </div>
    <${Fade} delay=${44} style=${{ position: "absolute", left: 120, right: 120, bottom: 70, display: "flex", gap: 44, alignItems: "baseline", font: `400 24px/1.3 ${BODY}`, color: muted }}>
      <span style=${{ font: `600 28px/1.2 ${HEAD}`, color: "#fff" }}>${s.presenter || meta.presenter}</span>
      <span>${s.role || meta.role}</span>
      ${s.date && html`<span style=${{ color: C.green }}>${s.date}</span>`}
    <//>
  <//>`;
}

// ---------- 2. koridor haritasi: gercek ulke sinirlari + sehirler arasi isik hatlari ----------
// Ulke sinirlari world-atlas (Natural Earth 1:110m) verisinden calisma aninda yuklenir; slayt verisindeki "atlas" adresi.
let atlasCache = null;
function loadAtlas(url) {
  if (!atlasCache) {
    atlasCache = Promise.all([fetch(url).then((r) => r.json()), import("https://esm.sh/topojson-client@3.1.0")])
      .then(([topo, tj]) => tj.feature(topo, topo.objects.countries).features)
      .catch(() => { atlasCache = null; return []; });
  }
  return atlasCache;
}
function useAtlas(url) {
  const [geo, setGeo] = React.useState(null);
  React.useEffect(() => {
    let on = true;
    if (url) loadAtlas(url).then((f) => { if (on) setGeo(f); });
    return () => { on = false; };
  }, [url]);
  return geo;
}
function geoPath(geom, proj) {
  const polys = geom.type === "Polygon" ? [geom.coordinates] : geom.type === "MultiPolygon" ? geom.coordinates : [];
  return polys.map((poly) => poly.map((ring) => ring.map(([lo, la], i) => {
    const [x, y] = proj(lo, la);
    return `${i ? "L" : "M"}${x.toFixed(1)} ${y.toFixed(1)}`;
  }).join("") + "Z").join("")).join("");
}
function CMap({ s, meta, index, total }) {
  const frame = useCurrentFrame();
  const W = 1680, H = 520;
  const proj = projector(s.bounds, W, H);
  const geo = useAtlas(s.atlas);
  const shapes = React.useMemo(() => (geo || []).map((f) => ({ id: f.id, d: geoPath(f.geometry, proj) })), [geo]);
  const colorOf = Object.fromEntries((s.countries || []).map((c) => [c.id, c.color]));
  const draw = useT(4, 60);
  const cities = (s.cities || []).map((c) => ({ ...c, xy: proj(c.lon, c.lat), lit: 0 }));
  const byName = Object.fromEntries(cities.map((c) => [c.name, c]));
  // Her hat sirayla cizilir; bir sehir, ona ilk ulasan hatla birlikte yanar
  const routes = (s.routes || []).map((r, ri) => {
    const pts = (r.cities || []).map((n) => byName[n]).filter(Boolean);
    const segs = pts.slice(1).map((c, i) => Math.hypot(c.xy[0] - pts[i].xy[0], c.xy[1] - pts[i].xy[1]));
    const len = segs.reduce((a, b) => a + b, 0) || 1;
    const cum = [0]; segs.forEach((l, i) => cum.push(cum[i] + l / len));
    const start = 24 + ri * 18, dur = 30 + len / 16;
    const p = interpolate(frame, [start, start + dur], [0, 1], clamp);
    pts.forEach((c, i) => { c.lit = Math.max(c.lit, interpolate(p, [cum[i] - 0.03, cum[i]], [0, 1], clamp)); });
    // isik paketi: hat cizilince bastan sona dolasmaya devam eder
    const pp = p < 1 ? p : ((frame - start - dur) / (dur * 1.8)) % 1;
    let k = 0; while (k < cum.length - 2 && cum[k + 1] < pp) k++;
    const lt = cum[k + 1] > cum[k] ? (pp - cum[k]) / (cum[k + 1] - cum[k]) : 0;
    const pkt = pts.length > 1 ? [pts[k].xy[0] + (pts[k + 1].xy[0] - pts[k].xy[0]) * lt, pts[k].xy[1] + (pts[k + 1].xy[1] - pts[k].xy[1]) * lt] : null;
    const d = pts.map((c, i) => `${i ? "L" : "M"}${c.xy[0].toFixed(1)} ${c.xy[1].toFixed(1)}`).join(" ");
    return { d, p, pkt, color: r.color || C.green, started: frame > start };
  });
  const regions = s.regions || [];
  return html`<${Frame} dark=${true}>
    <div style=${pad}>
      <${Head} s=${s} size=${64} />
      <svg width=${W} height=${H} style=${{ position: "absolute", left: 0, top: 130, overflow: "hidden" }}>
        <defs><filter id="mglow" x="-20%" y="-50%" width="140%" height="200%"><feGaussianBlur stdDeviation="7" /></filter></defs>
        <g>
          ${shapes.map((sh) => {
            const col = colorOf[sh.id];
            return html`<path key=${sh.id} d=${sh.d} fill=${col || "#ffffff"} fillOpacity=${(col ? 0.12 : 0.025) * draw}
              stroke=${col || "#ffffff"} strokeOpacity=${col ? 0.75 : 0.16} strokeWidth=${col ? 1.6 : 0.8} strokeLinejoin="round"
              pathLength="1" strokeDasharray="1" strokeDashoffset=${1 - draw} />`;
          })}
        </g>
        ${(s.countries || []).filter((c) => c.label).map((c, i) => {
          const [x, y] = proj(c.labelLon, c.labelLat);
          return html`<text key=${"l" + i} x=${x} y=${y} textAnchor="middle" fill=${c.color} opacity=${0.55 * useT(40 + i * 4, 30)}
            style=${{ font: `600 15px ${BODY}`, letterSpacing: "0.32em" }}>${c.label}</text>`;
        })}
        ${routes.map((r, i) => html`<g key=${"r" + i}>
          <path d=${r.d} fill="none" stroke=${r.color} strokeWidth="12" opacity=".3" filter="url(#mglow)" pathLength="1" strokeDasharray="1" strokeDashoffset=${1 - r.p} />
          <path d=${r.d} fill="none" stroke=${r.color} strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" pathLength="1" strokeDasharray="1" strokeDashoffset=${1 - r.p} />
          ${r.started && r.pkt && html`<g><circle cx=${r.pkt[0]} cy=${r.pkt[1]} r="18" fill=${r.color} opacity=".3" /><circle cx=${r.pkt[0]} cy=${r.pkt[1]} r="6" fill="#fff" /></g>`}
        </g>`)}
        ${cities.map((c, i) => {
          const big = c.size || 1;
          const pulse = 1 + 0.3 * Math.sin(frame / 9 + i);
          const below = c.labelPos === "below";
          return html`<g key=${c.name} opacity=${c.lit}>
            <circle cx=${c.xy[0]} cy=${c.xy[1]} r=${16 * big * pulse} fill=${c.color || C.green} opacity=".18" />
            <circle cx=${c.xy[0]} cy=${c.xy[1]} r=${4 + 2.5 * big} fill="#fff" />
            <text x=${c.xy[0]} y=${c.xy[1] + (below ? 34 + 4 * big : -16 - 4 * big)} textAnchor="middle" fill="#fff"
              style=${{ font: `${big > 1 ? 600 : 500} ${big > 1 ? 22 : 18}px ${HEAD}`, paintOrder: "stroke", stroke: "rgba(4,6,12,.8)", strokeWidth: 4 }}>${c.name}</text>
          </g>`;
        })}
      </svg>
      <div style=${{ position: "absolute", left: 0, right: 0, bottom: 0, display: "grid", gridTemplateColumns: `repeat(${regions.length}, 1fr)`, gap: 22 }}>
        ${regions.map((r, i) => html`<${Pop} key=${i} delay=${60 + i * 12} style=${{ ...glass, padding: "16px 22px", display: "flex", gap: 18, alignItems: "center" }}>
          <div style=${{ font: `600 42px/1 ${HEAD}`, ...(r.color ? { color: r.color, textShadow: `0 0 24px ${r.color}66` } : gradText(`linear-gradient(120deg, ${C.green}, ${C.teal})`)) }}>${String(i + 1).padStart(2, "0")}</div>
          <div>
            <div style=${{ font: `600 26px/1.15 ${HEAD}` }}>${r.name}</div>
            <div style=${{ marginTop: 6, font: `400 18px/1.35 ${BODY}`, color: muted }}>${r.text}</div>
          </div>
        <//>`)}
      </div>
    </div>
    <${Footer} index=${index} total=${total} title=${meta.title} />
  <//>`;
}

// ---------- 3. skyline: kanal satislari bina olarak ----------
function hash(n) { const x = Math.sin(n * 127.1) * 43758.5453; return x - Math.floor(x); }
function Building({ b, i, max, delay, x, w, ground, maxH }) {
  const frame = useCurrentFrame();
  const rise = spring({ frame: frame - delay, fps: FPS, config: { damping: 18, stiffness: 60, mass: 1.4 } });
  const h = (b.value / max) * maxH * rise;
  const cols = 5, cw = (w - 40) / cols, rows = Math.floor(h / 34);
  const lightT = frame - delay - 20;
  return html`<div style=${{ position: "absolute", left: x, bottom: HEIGHT - ground, width: w, height: h }}>
    <div style=${{ position: "absolute", inset: 0, borderRadius: "10px 10px 0 0", background: "linear-gradient(180deg, #16203A, #0B1222)",
      border: "1px solid rgba(255,255,255,.12)", borderBottom: "none", overflow: "hidden" }}>
      <div style=${{ position: "absolute", left: 0, right: 0, top: 0, height: 4, background: `linear-gradient(90deg, ${C.green}, ${C.teal})`, boxShadow: `0 0 30px ${C.green}` }} />
      ${Array.from({ length: rows }).map((_, r) => Array.from({ length: cols }).map((__, c) => {
        const seed = hash(i * 1000 + r * 13 + c);
        const on = lightT > seed * 70 + r * 1.5 && seed > 0.18;
        const flick = 0.75 + 0.25 * Math.sin(frame / (6 + seed * 9) + seed * 10);
        return html`<div key=${r + "-" + c} style=${{ position: "absolute", left: 20 + c * cw + 4, bottom: 16 + r * 34, width: cw - 12, height: 16, borderRadius: 2,
          background: on ? (seed > 0.8 ? C.green : C.amber) : "rgba(255,255,255,.05)", opacity: on ? flick * (0.55 + seed * 0.45) : 1,
          boxShadow: on ? `0 0 10px ${seed > 0.8 ? C.green : C.amber}` : "none" }} />`;
      }))}
    </div>
    ${b.base && html`<div style=${{ position: "absolute", left: -6, right: -6, bottom: 0, height: h * (b.base / b.value), borderTop: `2px dashed ${C.amber}`,
      opacity: interpolate(frame - delay, [30, 45], [0, 1], clamp), pointerEvents: "none" }}>
      <span style=${{ position: "absolute", right: 10, top: 6, padding: "2px 6px", borderRadius: 4, background: "rgba(4,6,12,.85)", font: `600 16px/1 ${HEAD}`, color: C.amber, letterSpacing: "0.06em" }}>2025</span>
    </div>`}
    <div style=${{ position: "absolute", left: -20, right: -20, bottom: "100%", marginBottom: 20 + Math.max(0, h * ((b.base || 0) / b.value - 1)), textAlign: "center", opacity: rise }}>
      <${Num} n=${b} delay=${delay + 6} style=${{ font: `600 54px/1 ${HEAD}`, letterSpacing: "-0.03em" }} />
      ${b.badge && html`<div style=${{ marginTop: 10 }}><${Badge} text=${b.badge} delay=${delay + 30} color=${b.badge.startsWith("−") || b.badge.startsWith("-") ? RED : C.green} /></div>`}
    </div>
    <div style=${{ position: "absolute", left: -20, right: -20, top: "100%", marginTop: 22, textAlign: "center" }}>
      <div style=${{ font: `600 26px/1.15 ${HEAD}` }}>${b.label}</div>
      <div style=${{ marginTop: 6, font: `400 19px/1.3 ${BODY}`, color: muted }}>${b.sub}</div>
    </div>
  </div>`;
}
function CSkyline({ s, meta, index, total }) {
  const items = s.buildings || [];
  const max = Math.max(...items.map((b) => b.value), 1);
  const ground = 790, w = 210, gap = 70, x0 = 740;
  return html`<${Frame} dark=${true}>
    <div style=${pad}>
      <${Head} s=${s} size=${66} max=${560} />
      <${Pop} delay=${30} style=${{ position: "absolute", left: 0, top: 360, width: 520 }}>
        <${Label}>${s.totalLabel}<//>
        <${Num} n=${s.total} delay=${34} dur=${70} style=${{ display: "block", marginTop: 14, font: `600 128px/1 ${HEAD}`, letterSpacing: "-0.05em", ...gradText(`linear-gradient(120deg, ${C.green}, ${C.teal})`) }} />
        ${s.totalGrowth && html`<div style=${{ marginTop: 14 }}><${Badge} text=${s.totalGrowth} delay=${90} /></div>`}
        <div style=${{ marginTop: 18, font: `400 23px/1.45 ${BODY}`, color: muted }}>${s.note}</div>
      <//>
    </div>
    <div style=${{ position: "absolute", left: 700, right: 0, top: ground, height: 2, background: "linear-gradient(90deg, transparent, rgba(255,255,255,.35), transparent)" }} />
    ${items.map((b, i) => html`<${Building} key=${i} b=${b} i=${i} max=${max} delay=${20 + i * 10} x=${x0 + i * (w + gap)} w=${w} ground=${ground} maxH=${380} />`)}
    <${Footer} index=${index} total=${total} title=${meta.title} />
  <//>`;
}

// ---------- 4. bolum gecisi ----------
function CSection({ s, meta, index, total }) {
  const frame = useCurrentFrame();
  const sweep = interpolate(frame, [0, 90], [-40, 140], clamp);
  const draw = useT(0, 60);
  const stats = s.stats || [];
  return html`<${Frame} dark=${true}>
    <div style=${{ position: "absolute", right: 60, top: 40, font: `700 640px/0.9 ${HEAD}`, letterSpacing: "-0.06em", color: "transparent",
      WebkitTextStroke: "2px rgba(255,255,255,.18)", opacity: draw }}>${s.number}</div>
    <div style=${{ position: "absolute", right: 60, top: 40, font: `700 640px/0.9 ${HEAD}`, letterSpacing: "-0.06em",
      ...gradText(`linear-gradient(100deg, transparent ${sweep - 18}%, rgba(0,228,135,.9) ${sweep}%, transparent ${sweep + 18}%)`) }}>${s.number}</div>
    <div style=${{ ...pad, display: "flex", flexDirection: "column", justifyContent: "flex-end" }}>
      ${s.chapter ? html`
        <${Kicker} text=${s.chapterLabel || `Section ${s.number}`} delay=${4} />
        <${RiseText} text=${s.chapter} delay=${8} stagger=${4} gradientWords=${s.chapter.split(" ").length}
          style=${{ marginTop: 22, font: `700 150px/0.95 ${HEAD}`, letterSpacing: "-0.05em", maxWidth: 1400 }} />
        <div style=${{ marginTop: 26, width: 120 * useT(14, 30), height: 4, borderRadius: 2, background: C.green, boxShadow: `0 0 18px ${C.green}` }} />
        <${RiseText} text=${s.title} delay=${16} stagger=${3} gradientWords=${0}
          style=${{ marginTop: 26, font: `600 64px/1.05 ${HEAD}`, letterSpacing: "-0.03em", maxWidth: 1300 }} />` : html`
        <${Kicker} text=${s.kicker} delay=${6} />
        <${RiseText} text=${s.title} delay=${10} stagger=${4} gradientWords=${s.gradientWords ?? 1}
          style=${{ marginTop: 30, font: `600 120px/0.98 ${HEAD}`, letterSpacing: "-0.05em", maxWidth: 1300 }} />`}
      <${Fade} delay=${26} style=${{ marginTop: 28, font: `400 34px/1.4 ${BODY}`, color: "rgba(255,255,255,.78)", maxWidth: 1100 }}>${s.subtitle}<//>
      <div style=${{ marginTop: 60, display: "flex", gap: 80 }}>
        ${stats.map((st, i) => html`<${Pop} key=${i} delay=${36 + i * 8}>
          <${Num} n=${st} delay=${40 + i * 8} style=${{ font: `600 72px/1 ${HEAD}`, letterSpacing: "-0.04em", color: "#fff" }} />
          <div style=${{ marginTop: 10, font: `400 22px/1.3 ${BODY}`, color: muted }}>${st.label}</div>
        <//>`)}
      </div>
    </div>
    <${Footer} index=${index} total=${total} title=${meta.title} />
  <//>`;
}

// ---------- 5. trade akisi: yillar, IGM, urun ayrismasi ----------
function CFlow({ s, meta, index, total }) {
  const frame = useCurrentFrame();
  const years = s.years || [];
  const max = Math.max(...years.map((y) => y.value), 1);
  const H = 430, bw = 150, gap = 60;
  // IGM cizgisi grafigin ust bandinda (ilk 110 px), cubuklar altta kalir
  const igmMin = 35, igmMax = 45;
  const pts = years.map((y, i) => [i * (bw + gap) + bw / 2, 110 - ((y.igm - igmMin) / (igmMax - igmMin)) * 90]);
  const lineP = useT(50, 50);
  // satis buyume cizgisi (onceki yila gore %) cubuklarin alt bandinda; sadece growth verilen yillar
  const gMin = -5, gMax = 10;
  const gPts = years.map((y, i) => y.growth == null ? null : [i * (bw + gap) + bw / 2, H - 40 - ((Math.max(gMin, Math.min(gMax, y.growth)) - gMin) / (gMax - gMin)) * 100, y]).filter(Boolean);
  const gP = useT(80, 40);
  const tight = !!s.story;
  return html`<${Frame} dark=${true}>
    <div style=${pad}>
      <${Head} s=${s} size=${66} max=${1500} />
      <div style=${{ position: "absolute", left: 0, top: 260, width: 650, height: H + 80 }}>
        <${Label} style=${{ marginBottom: 20 }}>${s.yearsLabel}<//>
        <div style=${{ position: "relative", height: H, marginTop: 40 }}>
          ${years.map((y, i) => {
            const p = spring({ frame: frame - 16 - i * 8, fps: FPS, config: { damping: 16, stiffness: 70 } });
            const h = (y.value / max) * (H - 170) * p;
            return html`<div key=${i} style=${{ position: "absolute", left: i * (bw + gap), bottom: 0, width: bw, height: h, borderRadius: "16px 16px 4px 4px",
                background: i === years.length - 1 ? `linear-gradient(180deg, ${C.green}, rgba(0,228,135,.15))` : "linear-gradient(180deg, rgba(255,255,255,.3), rgba(255,255,255,.04))",
                boxShadow: i === years.length - 1 ? `0 0 50px rgba(0,228,135,.35)` : "none" }}>
              <div style=${{ position: "absolute", left: -20, right: -20, bottom: "100%", marginBottom: 12, textAlign: "center" }}>
                <${Counter} to=${y.value} decimals=${3} prefix="€" suffix="m" delay=${20 + i * 8} style=${{ font: `600 32px/1 ${HEAD}` }} />
              </div>
              <div style=${{ position: "absolute", left: 0, right: 0, top: "100%", marginTop: 14, textAlign: "center", font: `500 22px/1.2 ${BODY}`, color: muted }}>${y.label}</div>
            </div>`;
          })}
          <svg width=${650} height=${H} style=${{ position: "absolute", left: 0, top: 0, overflow: "visible" }}>
            <path d=${pts.map((q, i) => `${i ? "L" : "M"}${q[0]} ${q[1]}`).join(" ")} fill="none" stroke=${C.amber} strokeWidth="4" pathLength="1" strokeDasharray="1" strokeDashoffset=${1 - lineP} />
            ${pts.map((q, i) => html`<g key=${i} opacity=${interpolate(lineP, [i / Math.max(1, pts.length - 1) - 0.1, i / Math.max(1, pts.length - 1)], [0, 1], clamp)}>
              <circle cx=${q[0]} cy=${q[1]} r="10" fill=${C.amber} />
              <rect x=${q[0] - 52} y=${q[1] - 52} width="104" height="34" rx="17" fill="rgba(255,181,71,.18)" stroke=${C.amber} />
              <text x=${q[0]} y=${q[1] - 28} textAnchor="middle" fill=${C.amber} style=${{ font: `600 20px ${HEAD}` }}>IGM ${years[i].igm}%</text>
            </g>`)}
            ${gPts.length > 1 && html`<path d=${gPts.map((q, i) => `${i ? "L" : "M"}${q[0]} ${q[1]}`).join(" ")} fill="none" stroke=${C.teal} strokeWidth="4" strokeDasharray="10 8" opacity=${gP} />`}
            ${gPts.map((q, i) => html`<g key=${"g" + i} opacity=${interpolate(gP, [i / Math.max(1, gPts.length) , (i + 1) / Math.max(1, gPts.length)], [0, 1], clamp)}>
              <rect x=${q[0] - 9} y=${q[1] - 9} width="18" height="18" rx="4" fill=${C.teal} transform=${`rotate(45 ${q[0]} ${q[1]})`} />
              <rect x=${q[0] - 74} y=${q[1] + 16} width="148" height="34" rx="17" fill="rgba(11,14,20,.85)" stroke=${C.teal} />
              <text x=${q[0]} y=${q[1] + 40} textAnchor="middle" fill=${C.teal} style=${{ font: `600 19px ${HEAD}` }}>${q[2].growthLabel || `${q[2].growth > 0 ? "+" : ""}${q[2].growth}%`}</text>
            </g>`)}
          </svg>
        </div>
        ${gPts.length > 0 && html`<${Fade} delay=${90} style=${{ position: "absolute", right: 0, top: 0, display: "flex", gap: 22, font: `500 18px/1 ${BODY}`, color: muted }}>
          <span><span style=${{ display: "inline-block", width: 22, height: 4, background: C.amber, verticalAlign: "middle", marginRight: 8 }} />IGM</span>
          <span><span style=${{ display: "inline-block", width: 22, height: 0, borderTop: `4px dashed ${C.teal}`, verticalAlign: "middle", marginRight: 8 }} />${s.growthLegend || "Sales growth"}</span>
        <//>`}
      </div>
      <div style=${{ position: "absolute", left: 760, right: 0, top: 260, display: "flex", flexDirection: "column", gap: tight ? 16 : 24 }}>
        ${(s.split || []).map((sp, i) => {
          const p = useT(40 + i * 12, 50);
          const mx = Math.max(sp.from, sp.to);
          const neg = sp.to < sp.from;
          return html`<${Pop} key=${i} delay=${36 + i * 12} style=${{ ...glass, padding: tight ? "18px 28px" : "26px 32px" }}>
            <div style=${{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style=${{ font: `600 30px/1.2 ${HEAD}` }}>${sp.label}</span>
              <${Badge} text=${sp.growth} color=${neg ? RED : C.green} delay=${60 + i * 12} />
            </div>
            ${["2026", "2027"].map((yr, k) => {
              const v = k === 0 ? sp.from : sp.from + (sp.to - sp.from) * p;
              return html`<div key=${yr} style=${{ display: "flex", alignItems: "center", gap: 18, marginTop: tight ? 10 : 16 }}>
                <span style=${{ width: 70, font: `500 20px/1 ${BODY}`, color: muted }}>${yr}</span>
                <div style=${{ flex: 1, height: 22, borderRadius: 11, background: "rgba(255,255,255,.06)", overflow: "hidden" }}>
                  <div style=${{ height: "100%", width: `${(v / mx) * 100 * (k === 0 ? useT(30 + i * 12, 30) : 1)}%`, borderRadius: 11,
                    background: k === 0 ? "rgba(255,255,255,.35)" : neg ? `linear-gradient(90deg, ${RED}, #ff9b9b)` : `linear-gradient(90deg, ${C.green}, ${C.teal})` }} />
                </div>
                <span style=${{ width: 130, textAlign: "right", font: `600 24px/1 ${HEAD}`, fontVariantNumeric: "tabular-nums" }}>€${fmt(v, 2)}m</span>
              </div>`;
            })}
          <//>`;
        })}
        <div style=${{ display: "grid", gridTemplateColumns: `repeat(${(s.facts || []).length}, 1fr)`, gap: 24 }}>
          ${(s.facts || []).map((f, i) => html`<${Pop} key=${i} delay=${70 + i * 8} style=${{ ...glass, padding: tight ? "16px 20px" : "22px 26px" }}>
            <div style=${{ font: `600 ${tight ? 34 : 40}px/1 ${HEAD}`, color: f.color === "red" ? RED : C.green }}>${f.value}</div>
            <div style=${{ marginTop: 8, font: `400 ${tight ? 17 : 19}px/1.35 ${BODY}`, color: muted }}>${f.label}</div>
          <//>`)}
        </div>
        ${s.story && html`<${Fade} delay=${100} style=${{ padding: "16px 24px", borderRadius: 14, border: `1px solid ${C.green}55`, background: "rgba(0,228,135,.07)", font: `400 20px/1.4 ${BODY}` }}>
          <span style=${{ color: C.green, fontWeight: 600 }}>${s.storyLabel || "How"} · </span>${s.story}<//>`}
      </div>
    </div>
    <${Footer} index=${index} total=${total} title=${meta.title} />
  <//>`;
}

// ---------- 6. Turkiye takimyildiz haritasi ----------
function CTrMap({ s, meta, index, total }) {
  const frame = useCurrentFrame();
  const W = 1120, H = 640;
  const proj = projector(s.bounds, W, H);
  const outline = (s.outline || []).map(([lo, la]) => proj(lo, la));
  const outP = useT(4, 70);
  const hub = proj(s.hub.lon, s.hub.lat);
  const layers = s.layers || [];
  return html`<${Frame} dark=${true}>
    <div style=${pad}>
      <${Head} s=${s} size=${62} max=${560} />
      <div style=${{ position: "absolute", left: 0, top: 330, width: 500, display: "flex", flexDirection: "column", gap: 22 }}>
        ${layers.map((L, i) => html`<${Pop} key=${i} delay=${40 + i * 30} style=${{ ...glass, padding: "22px 28px", display: "flex", alignItems: "center", gap: 24 }}>
          <div style=${{ width: 20, height: 20, borderRadius: "50%", background: L.dashed ? "transparent" : L.color, border: L.dashed ? `3px dashed ${L.color}` : "none", boxShadow: `0 0 18px ${L.color}`, flexShrink: 0 }} />
          <div>
            <div style=${{ display: "flex", alignItems: "baseline", gap: 14 }}>
              <${Counter} to=${L.count} delay=${44 + i * 30} dur=${30} style=${{ font: `600 52px/1 ${HEAD}`, color: L.color }} />
              <span style=${{ font: `600 26px/1.2 ${HEAD}` }}>${L.label}</span>
            </div>
            <div style=${{ marginTop: 6, font: `400 19px/1.35 ${BODY}`, color: muted }}>${L.text}</div>
          </div>
        <//>`)}
      </div>
    </div>
    <svg width=${W} height=${H} style=${{ position: "absolute", left: 700, top: 230, overflow: "visible" }}>
      <defs><filter id="tglow" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="6" /></filter></defs>
      <path d=${outline.map((q, i) => `${i ? "L" : "M"}${q[0]} ${q[1]}`).join(" ") + "Z"} fill="rgba(255,255,255,.025)" stroke="rgba(255,255,255,.35)" strokeWidth="1.5"
        strokeDasharray="3 7" pathLength="1" strokeDashoffset="0" opacity=${outP} />
      ${layers.map((L, li) => (L.cities || []).map((c, ci) => {
        const [x, y] = proj(c.lon, c.lat);
        const start = 40 + li * 30 + ci * 3;
        const q = interpolate(frame, [start, start + 18], [0, 1], ease);
        const r = 7 + Math.sqrt(c.n || 1) * 6;
        const pulse = 1 + 0.35 * Math.sin(frame / 8 + ci + li);
        const off = li === 0 ? 0 : li === 1 ? 10 : -10;
        return html`<g key=${li + "-" + ci} opacity=${q}>
          <line x1=${hub[0]} y1=${hub[1]} x2=${hub[0] + (x - hub[0]) * q} y2=${hub[1] + (y - hub[1]) * q} stroke=${L.color} strokeWidth="1.2" opacity=".35" />
          <circle cx=${x + off} cy=${y} r=${r * 2 * pulse} fill=${L.color} opacity=".14" filter="url(#tglow)" />
          ${L.dashed
            ? html`<circle cx=${x + off} cy=${y} r=${r} fill="none" stroke=${L.color} strokeWidth="3" strokeDasharray="5 5" transform=${`rotate(${frame * 2} ${x + off} ${y})`} />`
            : html`<circle cx=${x + off} cy=${y} r=${r * q} fill=${L.color} />`}
          ${c.n > 1 && html`<text x=${x + off} y=${y + 7} textAnchor="middle" fill=${C.night} style=${{ font: `700 19px ${HEAD}` }}>${c.n}</text>`}
          ${c.label && html`<text x=${x + off} y=${y - r - 12} textAnchor="middle" fill="#fff" style=${{ font: `500 19px ${BODY}` }}>${c.label}</text>`}
        </g>`;
      }))}
      <circle cx=${hub[0]} cy=${hub[1]} r=${16 + 4 * Math.sin(frame / 7)} fill="none" stroke="#fff" strokeWidth="2" />
    </svg>
    <${Footer} index=${index} total=${total} title=${meta.title} />
  <//>`;
}

// ---------- 7. bayi yarisi ----------
function CRace({ s, meta, index, total }) {
  const frame = useCurrentFrame();
  const items = s.items || [];
  const t = interpolate(frame, [30, 120], [0, 1], { ...clamp, easing: Easing.inOut(Easing.cubic) });
  const vals = items.map((it) => ({ ...it, v: it.from + (it.to - it.from) * t }));
  const order = [...vals].sort((a, b) => b.v - a.v);
  const max = Math.max(...items.map((i) => Math.max(i.from, i.to)), 1);
  const rowH = 62, W = 700;
  const year = t < 0.5 ? s.fromLabel : s.toLabel;
  return html`<${Frame} dark=${true}>
    <div style=${pad}>
      <${Head} s=${s} size=${62} max=${1450} />
      <div style=${{ position: "absolute", left: 0, top: 250, width: 1100, height: rowH * items.length }}>
        <div style=${{ position: "absolute", right: 0, top: -64, font: `600 54px/1 ${HEAD}`, color: "rgba(255,255,255,.2)" }}>${year}</div>
        ${vals.map((it, i) => {
          const rank = order.indexOf(it);
          const appear = useT(10 + i * 3, 20);
          // kaynak tablodaki buyume orani varsa onu goster (yuvarlanmis €k degerlerden hesaplamak sapabilir)
          const growth = it.growth || (it.from ? `+${Math.round((it.to / it.from - 1) * 100)}%` : null);
          return html`<div key=${it.label} style=${{ position: "absolute", left: 0, right: 0, top: rank * rowH, height: rowH - 14, display: "flex", alignItems: "center", gap: 20, opacity: appear }}>
            <span style=${{ width: 210, textAlign: "right", font: `500 24px/1 ${HEAD}`, whiteSpace: "nowrap" }}>${it.label}</span>
            <div style=${{ position: "relative", width: W, height: "100%" }}>
              <div style=${{ position: "absolute", left: 0, top: 0, bottom: 0, width: (it.v / max) * W, borderRadius: 8,
                background: it.hl ? `linear-gradient(90deg, rgba(0,228,135,.25), ${C.green})` : "linear-gradient(90deg, rgba(255,255,255,.08), rgba(255,255,255,.32))",
                boxShadow: it.hl ? `0 0 30px rgba(0,228,135,.35)` : "none" }} />
              <span style=${{ position: "absolute", left: (it.v / max) * W + 16, top: "50%", transform: "translateY(-50%)", font: `600 24px/1 ${HEAD}`, whiteSpace: "nowrap" }}>
                ${s.unit ? `${s.unit.prefix || ""}${fmt(it.v, s.unit.decimals || 0)}${s.unit.suffix || ""}` : `€${fmt(it.v, 0)}k`} ${t > 0.98 && growth != null && html`<span style=${{ marginLeft: 10, color: /^[−-]/.test(growth) ? RED : C.green, font: `500 20px/1 ${BODY}` }}>${growth}</span>`}
              </span>
            </div>
          </div>`;
        })}
      </div>
      <div style=${{ position: "absolute", right: 0, top: 250, width: 460, display: "flex", flexDirection: "column", gap: 22 }}>
        ${(s.kpis || []).map((k, i) => html`<${Pop} key=${i} delay=${50 + i * 10} style=${{ ...glass, padding: "24px 30px" }}>
          <${Num} n=${k} delay=${54 + i * 10} style=${{ font: `600 60px/1 ${HEAD}`, letterSpacing: "-0.03em", ...gradText(`linear-gradient(120deg, ${C.green}, ${C.teal})`) }} />
          <div style=${{ marginTop: 10, font: `400 21px/1.4 ${BODY}`, color: muted }}>${k.label}</div>
        <//>`)}
      </div>
      ${s.note && html`<${Fade} delay=${90} style=${{ position: "absolute", left: 0, width: 1100, bottom: 0, padding: "16px 24px", borderRadius: 14, border: `1px solid ${C.amber}55`,
        background: "rgba(255,181,71,.07)", font: `400 21px/1.4 ${BODY}` }}><span style=${{ color: C.amber, fontWeight: 600 }}>${s.noteLabel || "Note"} · </span>${s.note}<//>`}
    </div>
    <${Footer} index=${index} total=${total} title=${meta.title} />
  <//>`;
}

// ---------- 8. fiyat farki serit grafigi ----------
function CStrip({ s, meta, index, total }) {
  const frame = useCurrentFrame();
  const rows = s.rows || [];
  const all = rows.flatMap((r) => r.values);
  // ok = kabul edilebilir fiyat farki (orn. %10), severe = cok pahali esigi (orn. %50)
  const ok = s.threshold ?? 10, severe = s.severe ?? 50;
  const over = all.filter((v) => v > ok).length;
  const far = all.filter((v) => v > severe).length;
  // karekok olcek: %10 bandi okunur kalir, %437 gibi uc degerler de sigar
  const X0 = 330, W = 980, MAX = s.max || 450;
  const sx = (v) => X0 + Math.sqrt(Math.min(v, MAX) / MAX) * W;
  const rowH = 78, top = 350, bottom = top + rowH * rows.length;
  const axis = useT(10, 40);
  const zones = [
    { from: 0, to: ok, color: C.green, label: s.okLabel || "Acceptable" },
    { from: ok, to: severe, color: C.amber, label: `Too expensive` },
    { from: severe, to: MAX, color: RED, label: `Far too expensive >${severe}%` },
  ];
  const colOf = (v) => (v <= ok ? C.green : v <= severe ? C.amber : RED);
  let k = 0;
  return html`<${Frame} dark=${true}>
    <div style=${pad}>
      <${Head} s=${s} size=${58} max=${1500} />
      ${s.sub && html`<${Fade} delay=${10} style=${{ marginTop: 14, font: `400 22px/1.4 ${BODY}`, color: muted }}>${s.sub}<//>`}
    </div>
    <svg width=${WIDTH} height=${HEIGHT} style=${{ position: "absolute", left: 120, top: 0 }}>
      ${zones.map((z, i) => html`<g key=${"z" + i} opacity=${axis}>
        <rect x=${sx(z.from)} y=${top - 34} width=${sx(z.to) - sx(z.from)} height=${bottom - top + 34} fill=${z.color} opacity=".07" />
        <text x=${(sx(z.from) + sx(z.to)) / 2} y=${top - 12} textAnchor="middle" fill=${z.color} style=${{ font: `600 17px ${HEAD}`, letterSpacing: ".04em" }}>${z.label.toUpperCase()}</text>
      </g>`)}
      ${[0, 25, 100, 200, 300, 450].map((g) => html`<g key=${g} opacity=${axis}>
        <line x1=${sx(g)} y1=${top} x2=${sx(g)} y2=${bottom} stroke="rgba(255,255,255,.1)" strokeDasharray=${g === 0 ? "0" : "3 6"} />
        <text x=${sx(g)} y=${bottom + 30} textAnchor="middle" fill=${muted} style=${{ font: `400 17px ${BODY}` }}>${g ? "+" : ""}${g}%</text>
      </g>`)}
      ${[ok, severe].map((g, i) => html`<g key=${"t" + g} opacity=${useT(30 + i * 10, 20)}>
        <line x1=${sx(g)} y1=${top - 34} x2=${sx(g)} y2=${bottom + 8} stroke=${i ? RED : C.green} strokeWidth=${i ? 2 : 4} strokeDasharray=${i ? "6 6" : "0"} />
        <text x=${sx(g)} y=${bottom + 30} textAnchor="middle" fill=${i ? RED : C.green} style=${{ font: `600 18px ${HEAD}` }}>+${g}%</text>
      </g>`)}
      ${rows.map((r, ri) => {
        const y = top + ri * rowH + rowH / 2;
        const lab = useT(14 + ri * 4, 20);
        return html`<g key=${ri}>
          <text x=${X0 - 26} y=${y + (r.rivals ? -2 : 8)} textAnchor="end" fill="#fff" opacity=${lab} style=${{ font: `500 24px ${HEAD}` }}>${r.family}</text>
          ${r.rivals && html`<text x=${X0 - 26} y=${y + 22} textAnchor="end" fill=${muted} opacity=${lab} style=${{ font: `400 15px ${BODY}` }}>vs ${r.rivals}</text>`}
          <line x1=${X0} y1=${y} x2=${X0 + W} y2=${y} stroke="rgba(255,255,255,.06)" />
          ${r.values.map((v, vi) => {
            const d = 20 + (k++) * 3;
            const p = spring({ frame: frame - d, fps: FPS, config: { damping: 12, stiffness: 120, mass: 0.6 } });
            const col = colOf(v);
            const x = X0 + (sx(v) - X0) * Math.min(1, p);
            return html`<g key=${vi}>
              <circle cx=${x} cy=${y} r=${20 * Math.min(1, p)} fill=${col} opacity=".18" />
              <circle cx=${x} cy=${y} r=${8 * Math.min(1, p)} fill=${col} />
              ${(v >= 200 || vi === r.values.indexOf(Math.min(...r.values))) && html`<text x=${x} y=${y - 18} textAnchor="middle" fill=${col} opacity=${p} style=${{ font: `600 16px ${HEAD}` }}>+${v}%</text>`}
            </g>`;
          })}
        </g>`;
      })}
    </svg>
    <div style=${{ position: "absolute", right: 120, top: 316, width: 300, display: "flex", flexDirection: "column", gap: 18 }}>
      <${Pop} delay=${100} style=${{ ...glass, padding: "22px 26px" }}>
        <${Counter} to=${over} delay=${104} dur=${25} suffix=${" / " + all.length} style=${{ font: `600 52px/1 ${HEAD}`, color: over ? RED : C.green }} />
        <div style=${{ marginTop: 8, font: `400 19px/1.4 ${BODY}`, color: muted }}>${s.overLabel}</div>
      <//>
      <${Pop} delay=${106} style=${{ ...glass, padding: "22px 26px" }}>
        <${Counter} to=${far} delay=${110} dur=${25} suffix=${" / " + all.length} style=${{ font: `600 52px/1 ${HEAD}`, color: RED }} />
        <div style=${{ marginTop: 8, font: `400 19px/1.4 ${BODY}`, color: muted }}>${s.farLabel || `SKUs more than ${severe}% above`}</div>
      <//>
      ${(s.notes || []).map((n, i) => html`<${Pop} key=${i} delay=${112 + i * 8} style=${{ ...glass, padding: "20px 26px", font: `400 20px/1.45 ${BODY}`, color: "rgba(255,255,255,.82)" }}>${n}<//>`)}
    </div>
    <${Footer} index=${index} total=${total} title=${meta.title} />
  <//>`;
}

// ---------- 9. IB huni + ceyrek hedefleri ----------
function CFunnel({ s, meta, index, total }) {
  const frame = useCurrentFrame();
  const st = s.stages || [];
  const q = s.quarters || [];
  const qmax = Math.max(...q.map((x) => x.cum), 1);
  const FW = 560, FH = 560;
  return html`<${Frame} dark=${true}>
    <div style=${pad}>
      <${Head} s=${s} size=${62} max=${1500} />
    </div>
    <svg width=${FW} height=${FH} style=${{ position: "absolute", left: 120, top: 300, overflow: "visible" }}>
      <defs>
        <linearGradient id="fun" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="rgba(255,255,255,.14)" /><stop offset="1" stopColor="rgba(0,228,135,.55)" /></linearGradient>
      </defs>
      ${st.map((g, i) => {
        const p = useT(14 + i * 14, 30);
        const y0 = (i / st.length) * FH, y1 = ((i + 1) / st.length) * FH - 14;
        const w0 = FW * (1 - i * 0.28), w1 = FW * (1 - (i + 1) * 0.28 + 0.06);
        const cx = FW / 2;
        return html`<g key=${i} opacity=${p} transform=${`translate(0 ${(1 - p) * 30})`}>
          <path d=${`M${cx - w0 / 2} ${y0} L${cx + w0 / 2} ${y0} L${cx + w1 / 2} ${y1} L${cx - w1 / 2} ${y1} Z`} fill="url(#fun)" stroke="rgba(255,255,255,.2)" />
          <text x=${cx} y=${y0 + (y1 - y0) / 2 - 2} textAnchor="middle" fill="#fff" style=${{ font: `600 46px ${HEAD}` }}>${g.display}</text>
          <text x=${cx} y=${y0 + (y1 - y0) / 2 + 34} textAnchor="middle" fill="rgba(255,255,255,.75)" style=${{ font: `400 20px ${BODY}` }}>${g.label}</text>
        </g>`;
      })}
      ${Array.from({ length: 26 }).map((_, i) => {
        const ph = ((frame * 0.9 + i * 23) % FH) / FH;
        const spread = FW * (1 - ph * 0.8) * 0.4;
        const x = FW / 2 + Math.sin(i * 7.3) * spread;
        return html`<circle key=${i} cx=${x} cy=${ph * FH} r=${2 + (i % 3)} fill=${ph > 0.7 ? C.green : "#fff"} opacity=${0.5 * (frame > 50 ? 1 : 0)} />`;
      })}
    </svg>
    <div style=${{ position: "absolute", left: 790, right: 120, top: 290 }}>
      <${Label}>${s.quartersLabel}<//>
      <div style=${{ position: "relative", height: 300, marginTop: 24, display: "flex", alignItems: "flex-end", gap: 34 }}>
        ${q.map((x, i) => {
          const p = spring({ frame: frame - 30 - i * 7, fps: FPS, config: { damping: 15, stiffness: 80 } });
          return html`<div key=${i} style=${{ flex: 1, position: "relative", height: "100%", display: "flex", alignItems: "flex-end" }}>
            <div style=${{ position: "absolute", left: 0, right: 0, bottom: 0, height: (x.cum / qmax) * 260 * Math.min(1, useT(60 + i * 6, 30)), borderRadius: 10, border: `2px dashed rgba(0,228,135,.45)` }} />
            <div style=${{ position: "relative", width: "60%", margin: "0 auto", height: (x.value / qmax) * 260 * p, borderRadius: "10px 10px 3px 3px", background: `linear-gradient(180deg, ${C.green}, rgba(0,228,135,.2))` }}>
              <div style=${{ position: "absolute", left: -40, right: -40, bottom: "100%", marginBottom: 8, textAlign: "center", font: `600 26px/1 ${HEAD}` }}>€${fmt(x.value * Math.min(1, p))}k</div>
            </div>
            <div style=${{ position: "absolute", left: 0, right: 0, top: "100%", marginTop: 12, textAlign: "center", font: `500 21px/1.2 ${BODY}`, color: muted }}>${x.label}<br/><span style=${{ color: C.green }}>Σ €${fmt(x.cum)}k</span></div>
          </div>`;
        })}
      </div>
      <div style=${{ marginTop: 92, display: "grid", gridTemplateColumns: `repeat(${(s.merchs || []).length}, 1fr)`, gap: 18 }}>
        ${(s.merchs || []).map((m, i) => html`<${Pop} key=${i} delay=${80 + i * 6} style=${{ ...glass, padding: "18px 20px" }}>
          <div style=${{ font: `600 30px/1 ${HEAD}`, color: C.green }}>${m.value}</div>
          <div style=${{ marginTop: 8, font: `500 20px/1.25 ${HEAD}` }}>${m.region}</div>
          <div style=${{ marginTop: 4, font: `400 18px/1.25 ${BODY}`, color: muted }}>${m.name}</div>
        <//>`)}
      </div>
      ${s.split && html`<${Pop} delay=${110} style=${{ marginTop: 22, display: "flex", height: 48, borderRadius: 12, overflow: "hidden", font: `600 20px/48px ${HEAD}` }}>
        ${s.split.map((p, i) => html`<div key=${i} style=${{ width: `${p.share}%`, paddingLeft: 18, whiteSpace: "nowrap", background: i ? "rgba(30,203,208,.35)" : "rgba(0,228,135,.45)" }}>${p.label}</div>`)}
      <//>`}
    </div>
    <${Footer} index=${index} total=${total} title=${meta.title} />
  <//>`;
}

// ---------- 10. hedef / gerceklesme gostergeleri ----------
function Dial({ q, delay, vsWord }) {
  const p = useT(delay, 50);
  const ratio = q.actual / q.target;
  const shown = Math.min(ratio, 2) * p;
  const R = 92, len = Math.PI * R;
  const pos = q.actual >= q.target;
  const col = pos ? C.green : RED;
  return html`<${Pop} delay=${delay - 6} style=${{ ...glass, padding: "26px 22px 22px", textAlign: "center" }}>
    <svg width="200" height="111" viewBox="0 0 220 122" style=${{ overflow: "visible" }}>
      <path d=${`M${110 - R} 112 A${R} ${R} 0 0 1 ${110 + R} 112`} fill="none" stroke="rgba(255,255,255,.1)" strokeWidth="16" strokeLinecap="round" />
      <path d=${`M${110 - R} 112 A${R} ${R} 0 0 1 ${110 + R} 112`} fill="none" stroke=${col} strokeWidth="16" strokeLinecap="round"
        strokeDasharray=${len} strokeDashoffset=${len * (1 - Math.min(shown, 1))} style=${{ filter: `drop-shadow(0 0 8px ${col})` }} />
      ${shown > 1 && html`<path d=${`M${110 - R + 22} 112 A${R - 22} ${R - 22} 0 0 1 ${110 + R - 22} 112`} fill="none" stroke=${C.amber} strokeWidth="6" strokeLinecap="round"
        strokeDasharray=${Math.PI * (R - 22)} strokeDashoffset=${Math.PI * (R - 22) * (1 - (shown - 1))} />`}
    </svg>
    <div style=${{ marginTop: -36, font: `600 30px/1 ${HEAD}`, color: col }}>${q.variance}</div>
    <div style=${{ marginTop: 16, font: `600 26px/1 ${HEAD}` }}>${q.label}</div>
    <div style=${{ marginTop: 8, font: `400 17px/1.3 ${BODY}`, color: muted, whiteSpace: "nowrap" }}>€${fmt(q.actual, 2)}m vs €${fmt(q.target, 2)}m${vsWord ? ` ${vsWord}` : ""}</div>
  <//>`;
}
function CGauges({ s, meta, index, total }) {
  const frame = useCurrentFrame();
  const m = s.main;
  const p = useT(16, 70);
  const R = 200, len = 2 * Math.PI * R;
  const ratio = m.actual / m.target;
  return html`<${Frame} dark=${true}>
    <div style=${pad}>
      <${Head} s=${s} size=${62} max=${1500} />
    </div>
    <svg width="520" height="520" style=${{ position: "absolute", left: 120, top: 290, overflow: "visible" }}>
      <circle cx="260" cy="260" r=${R} fill="none" stroke="rgba(255,255,255,.08)" strokeWidth="30" />
      <circle cx="260" cy="260" r=${R} fill="none" stroke=${C.green} strokeWidth="30" strokeLinecap="round" transform="rotate(-90 260 260)"
        strokeDasharray=${len} strokeDashoffset=${len * (1 - Math.min(1, ratio * p))} style=${{ filter: `drop-shadow(0 0 14px ${C.green})` }} />
      ${ratio > 1 && html`<circle cx="260" cy="260" r=${R - 44} fill="none" stroke=${C.amber} strokeWidth="14" strokeLinecap="round" transform="rotate(-90 260 260)"
        strokeDasharray=${2 * Math.PI * (R - 44)} strokeDashoffset=${2 * Math.PI * (R - 44) * (1 - Math.max(0, ratio * p - 1))} />`}
      <circle cx="260" cy="260" r=${R - 80 + 4 * Math.sin(frame / 12)} fill="rgba(0,228,135,.05)" />
    </svg>
    <div style=${{ position: "absolute", left: 120, top: 290, width: 520, height: 520, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center" }}>
      <${Label}>${m.label}<//>
      <${Counter} to=${m.actual} decimals=${3} prefix="€" suffix="m" delay=${16} dur=${70} style=${{ marginTop: 10, font: `600 76px/1 ${HEAD}`, letterSpacing: "-0.03em" }} />
      <div style=${{ marginTop: 10, font: `400 22px/1.3 ${BODY}`, color: muted }}>${m.vs}</div>
      <div style=${{ marginTop: 16 }}><${Badge} text=${m.badge} delay=${80} /></div>
    </div>
    <div style=${{ position: "absolute", left: 740, right: 120, top: 290, display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 22 }}>
      ${(s.quarters || []).map((q, i) => html`<${Dial} key=${i} q=${q} delay=${30 + i * 10} vsWord=${s.quartersVs} />`)}
    </div>
    <div style=${{ position: "absolute", left: 740, right: 120, top: 640, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 22 }}>
      ${(s.lists || []).map((L, i) => html`<${Pop} key=${i} delay=${80 + i * 10} style=${{ ...glass, padding: "22px 28px" }}>
        <${Label} style=${{ color: i ? RED : C.green }}>${L.title}<//>
        ${L.items.map((it, k) => html`<div key=${k} style=${{ marginTop: 10, display: "flex", gap: 12, font: `400 21px/1.35 ${BODY}`, opacity: useT(86 + i * 10 + k * 4, 16) }}>
          <span style=${{ color: i ? RED : C.green }}>•</span><span>${it}</span></div>`)}
      <//>`)}
    </div>
    <${Footer} index=${index} total=${total} title=${meta.title} />
  <//>`;
}

// ---------- 11. partner yorungesi ----------
function COrbit({ s, meta, index, total }) {
  const frame = useCurrentFrame();
  const cx = 1290, cy = 530;
  const rings = [{ r: 210, items: s.core || [], sp: 0.06, color: C.green }, { r: 360, items: s.outer || [], sp: -0.04, color: C.teal }];
  return html`<${Frame} dark=${true}>
    <div style=${pad}>
      <${Head} s=${s} size=${60} max=${640} />
      <div style=${{ position: "absolute", left: 0, top: 340, width: 560, display: "flex", flexDirection: "column", gap: 20 }}>
        ${(s.kpis || []).map((k, i) => html`<${Pop} key=${i} delay=${50 + i * 10} style=${{ ...glass, padding: "22px 28px" }}>
          <${Num} n=${k} delay=${54 + i * 10} style=${{ font: `600 56px/1 ${HEAD}`, ...gradText(`linear-gradient(120deg, ${C.green}, ${C.teal})`) }} />
          <div style=${{ marginTop: 8, font: `400 20px/1.4 ${BODY}`, color: muted }}>${k.label}</div>
        <//>`)}
      </div>
    </div>
    <svg width=${WIDTH} height=${HEIGHT} style=${{ position: "absolute", inset: 0, pointerEvents: "none" }}>
      ${rings.map((R, i) => {
        const len = 2 * Math.PI * R.r;
        const p = useT(10 + i * 14, 50);
        return html`<circle key=${i} cx=${cx} cy=${cy} r=${R.r} fill="none" stroke=${R.color} strokeOpacity=".35" strokeWidth="1.5" strokeDasharray=${len} strokeDashoffset=${len * (1 - p)} />`;
      })}
      <circle cx=${cx} cy=${cy} r=${90 + 6 * Math.sin(frame / 14)} fill="rgba(0,228,135,.08)" />
      <circle cx=${cx} cy=${cy} r="70" fill="rgba(0,228,135,.18)" stroke=${C.green} strokeWidth="2" />
    </svg>
    <div style=${{ position: "absolute", left: cx - 60, top: cy - 26, width: 120 }}><${Logo} width=${120} /></div>
    ${rings.map((R, ri) => R.items.map((it, i) => {
      const a = (i / R.items.length) * Math.PI * 2 + frame * R.sp * Math.PI / 180 * 6 - Math.PI / 2;
      const x = cx + Math.cos(a) * R.r, y = cy + Math.sin(a) * R.r;
      const p = useSpring(30 + ri * 20 + i * 5, { damping: 14, stiffness: 120 });
      const neg = String(it.growth || "").startsWith("−") || String(it.growth || "").startsWith("-");
      const size = ri === 0 ? 26 : 18;
      return html`<div key=${ri + "-" + i} style=${{ position: "absolute", left: x, top: y, transform: `translate(-50%,-50%) scale(${p})` }}>
        <div style=${{ width: size, height: size, borderRadius: "50%", margin: "0 auto", background: R.color, boxShadow: `0 0 24px ${R.color}` }} />
        <div style=${{ position: "absolute", left: "50%", top: size + 8, transform: "translateX(-50%)", textAlign: "center", whiteSpace: "nowrap" }}>
          <div style=${{ font: `600 ${ri === 0 ? 24 : 20}px/1.1 ${HEAD}` }}>${it.name}</div>
          ${it.role && html`<div style=${{ font: `400 16px/1.3 ${BODY}`, color: muted }}>${it.role}</div>`}
          ${it.growth && html`<div style=${{ font: `600 18px/1.3 ${HEAD}`, color: neg ? RED : C.green }}>${it.growth}</div>`}
        </div>
      </div>`;
    }))}
    <${Fade} delay=${90} style=${{ position: "absolute", right: 120, top: 150, display: "flex", gap: 26, font: `500 19px/1 ${BODY}`, color: muted }}>
      ${(s.legend || []).map((l, i) => html`<span key=${i} style=${{ display: "flex", alignItems: "center", gap: 10 }}>
        <i style=${{ width: 12, height: 12, borderRadius: "50%", background: i ? C.teal : C.green }} />${l}</span>`)}
    <//>
    <${Footer} index=${index} total=${total} title=${meta.title} />
  <//>`;
}

// ---------- 12. dort buyume oyunu (mini grafikli kartlar) ----------
function MiniViz({ v, delay }) {
  const frame = useCurrentFrame();
  if (v.type === "bars") {
    const max = Math.max(...v.values, 1);
    return html`<div style=${{ display: "flex", alignItems: "flex-end", gap: 18, height: 170 }}>
      ${v.values.map((x, i) => {
        const p = spring({ frame: frame - delay - i * 6, fps: FPS, config: { damping: 15, stiffness: 90 } });
        const last = i === v.values.length - 1;
        return html`<div key=${i} style=${{ flex: 1, textAlign: "center" }}>
          <div style=${{ font: `600 22px/1 ${HEAD}`, marginBottom: 8, opacity: p }}>${v.display[i]}</div>
          <div style=${{ height: (x / max) * 110 * p, borderRadius: "8px 8px 2px 2px", background: last ? `linear-gradient(180deg, ${C.green}, rgba(0,228,135,.2))` : "rgba(255,255,255,.22)" }} />
          <div style=${{ marginTop: 8, font: `400 17px/1 ${BODY}`, color: muted }}>${v.labels[i]}</div>
        </div>`;
      })}
    </div>`;
  }
  if (v.type === "share") {
    const p = useT(delay, 60);
    const val = v.from + (v.to - v.from) * p;
    const R = 66, len = 2 * Math.PI * R;
    return html`<div style=${{ display: "flex", alignItems: "center", gap: 30, height: 170 }}>
      <svg width="160" height="160">
        <circle cx="80" cy="80" r=${R} fill="none" stroke="rgba(255,255,255,.1)" strokeWidth="18" />
        <circle cx="80" cy="80" r=${R} fill="none" stroke=${C.teal} strokeWidth="18" transform="rotate(-90 80 80)" strokeDasharray=${len} strokeDashoffset=${len * (1 - val / 100)} />
        <text x="80" y="90" textAnchor="middle" fill="#fff" style=${{ font: `600 30px ${HEAD}` }}>${fmt(val, 0)}%</text>
      </svg>
      <div style=${{ font: `400 20px/1.45 ${BODY}`, color: muted }}>${v.caption}</div>
    </div>`;
  }
  if (v.type === "line") {
    const max = Math.max(...v.values, 1);
    const W = 340, H = 120;
    const pts = v.values.map((x, i) => [i * (W / (v.values.length - 1)), H - (x / max) * H]);
    const p = useT(delay, 50);
    return html`<div style=${{ height: 170, position: "relative" }}>
      <svg width=${W} height=${H + 50} style=${{ overflow: "visible", marginTop: 20 }}>
        <path d=${pts.map((q, i) => `${i ? "L" : "M"}${q[0]} ${q[1]}`).join(" ") + ` L${W} ${H} L0 ${H} Z`} fill="rgba(0,228,135,.12)" opacity=${p} />
        <path d=${pts.map((q, i) => `${i ? "L" : "M"}${q[0]} ${q[1]}`).join(" ")} fill="none" stroke=${C.green} strokeWidth="4" pathLength="1" strokeDasharray="1" strokeDashoffset=${1 - p} />
        ${pts.map((q, i) => html`<g key=${i} opacity=${interpolate(p, [i / (pts.length - 1) - 0.05, i / (pts.length - 1)], [0, 1], clamp)}>
          <circle cx=${q[0]} cy=${q[1]} r="8" fill="#fff" />
          <text x=${q[0]} y=${q[1] - 18} textAnchor=${i === 0 ? "start" : i === pts.length - 1 ? "end" : "middle"} fill="#fff" style=${{ font: `600 20px ${HEAD}` }}>${v.display[i]}</text>
          <text x=${q[0]} y=${H + 34} textAnchor=${i === 0 ? "start" : i === pts.length - 1 ? "end" : "middle"} fill=${muted} style=${{ font: `400 17px ${BODY}` }}>${v.labels[i]}</text>
        </g>`)}
      </svg>
    </div>`;
  }
  // pipeline: buyuk sayi + yigilmis serit
  const tot = v.parts.reduce((a, b) => a + b.value, 0);
  const p = useT(delay, 50);
  const cols = [C.green, C.teal, C.blueLight, C.amber, "#ffffff", "#888"];
  return html`<div style=${{ height: 170, display: "flex", flexDirection: "column", justifyContent: "center", gap: 16 }}>
    <${Counter} to=${tot} decimals=${2} prefix="€" suffix="m" delay=${delay} dur=${50} style=${{ font: `600 54px/1 ${HEAD}` }} />
    <div style=${{ display: "flex", height: 26, borderRadius: 8, overflow: "hidden", width: `${p * 100}%` }}>
      ${v.parts.map((x, i) => html`<div key=${i} style=${{ width: `${(x.value / tot) * 100}%`, background: cols[i % cols.length], opacity: 0.85, borderRight: "2px solid #04060C" }} />`)}
    </div>
    <div style=${{ font: `400 18px/1.4 ${BODY}`, color: muted }}>${v.caption}</div>
  </div>`;
}
function CPlays({ s, meta, index, total }) {
  const tiles = s.tiles || [];
  return html`<${Frame} dark=${true}>
    <div style=${pad}>
      <${Head} s=${s} size=${60} max=${1500} />
      <div style=${{ position: "absolute", left: 0, right: 0, top: 200, bottom: 0, display: "grid", gridTemplateColumns: "1fr 1fr", gridTemplateRows: "1fr 1fr", gap: 24 }}>
        ${tiles.map((t, i) => html`<${Pop} key=${i} delay=${20 + i * 10} style=${{ ...glass, padding: "26px 34px", display: "grid", gridTemplateColumns: "1fr 380px", gap: 30, alignItems: "center" }}>
          <div>
            <${Label} style=${{ color: C.green }}>${t.tag}<//>
            <div style=${{ marginTop: 12, font: `600 34px/1.1 ${HEAD}`, letterSpacing: "-0.02em" }}>${t.title}</div>
            <div style=${{ marginTop: 12, font: `400 20px/1.45 ${BODY}`, color: muted }}>${t.text}</div>
          </div>
          <${MiniViz} v=${t.viz} delay=${34 + i * 10} />
        <//>`)}
      </div>
    </div>
    <${Footer} index=${index} total=${total} title=${meta.title} />
  <//>`;
}

// ---------- 13. otoyol: lambalar sirayla yanar ----------
function CRoad({ s, meta, index, total }) {
  const frame = useCurrentFrame();
  const segs = s.segments || [];
  const vx = 1330, vy = 330, base = HEIGHT;
  const scr = (z, side) => {
    const y = vy + (base - vy) / z;
    const hw = 560 / z;
    return { x: vx + side * hw * 1.12, y, s: 1 / z };
  };
  const zs = [1.35, 1.8, 2.4, 3.2, 4.4, 6.2];
  const lampAt = (i) => 40 + i * 14;
  const dash = (frame * 14) % 120;
  return html`<${Frame} dark=${true}>
    <svg width=${WIDTH} height=${HEIGHT} style=${{ position: "absolute", inset: 0 }}>
      <defs>
        <linearGradient id="asph" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#0b1120" /><stop offset="1" stopColor="#161d2d" /></linearGradient>
        <radialGradient id="pool"><stop offset="0" stopColor=${C.amber} stopOpacity=".55" /><stop offset="1" stopColor=${C.amber} stopOpacity="0" /></radialGradient>
        <linearGradient id="cone" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#fff2d6" stopOpacity=".55" /><stop offset="1" stopColor=${C.amber} stopOpacity="0" /></linearGradient>
      </defs>
      <path d=${`M${vx - 6} ${vy} L${vx + 6} ${vy} L${vx + 760} ${base} L${vx - 760} ${base} Z`} fill="url(#asph)" />
      <path d=${`M${vx} ${vy} L${vx} ${base}`} stroke="rgba(255,255,255,.55)" strokeWidth="6" strokeDasharray="60 60" strokeDashoffset=${-dash} style=${{ transformOrigin: "0 0" }} />
      ${zs.map((z, i) => {
        const side = i % 2 ? -1 : 1;
        const g = scr(z, side);
        const pole = 430 * g.s;
        const lit = interpolate(frame, [lampAt(i), lampAt(i) + 4, lampAt(i) + 6, lampAt(i) + 10], [0, 1, 0.4, 1], clamp);
        const head = { x: g.x - side * 70 * g.s, y: g.y - pole };
        return html`<g key=${i}>
          <ellipse cx=${head.x} cy=${g.y + 10 * g.s} rx=${260 * g.s} ry=${70 * g.s} fill="url(#pool)" opacity=${lit} />
          <path d=${`M${head.x - 14 * g.s} ${head.y} L${head.x + 14 * g.s} ${head.y} L${head.x + 150 * g.s} ${g.y + 10 * g.s} L${head.x - 150 * g.s} ${g.y + 10 * g.s} Z`} fill="url(#cone)" opacity=${lit * 0.7} />
          <line x1=${g.x} y1=${g.y} x2=${g.x} y2=${head.y} stroke="#3a4255" strokeWidth=${8 * g.s + 1} />
          <line x1=${g.x} y1=${head.y} x2=${head.x} y2=${head.y} stroke="#3a4255" strokeWidth=${7 * g.s + 1} />
          <ellipse cx=${head.x} cy=${head.y + 4 * g.s} rx=${30 * g.s} ry=${9 * g.s} fill=${lit > 0.5 ? "#fff6e0" : "#2a3142"} style=${{ filter: lit > 0.5 ? `drop-shadow(0 0 ${20 * g.s}px ${C.amber})` : "none" }} />
          <g opacity=${interpolate(frame, [lampAt(i) + 6, lampAt(i) + 16], [0, 1], clamp)}>
            <rect x=${head.x - 70} y=${head.y - 66} width="140" height="40" rx="20" fill="rgba(4,6,12,.75)" stroke=${C.amber} />
            <text x=${head.x} y=${head.y - 39} textAnchor="middle" fill=${C.amber} style=${{ font: `600 22px ${HEAD}` }}>€${fmt(segs[i]?.value || 0, 2)}m</text>
          </g>
        </g>`;
      })}
    </svg>
    <div style=${{ position: "absolute", left: 0, top: 0, bottom: 0, width: 820, background: "linear-gradient(90deg, rgba(4,6,12,.96) 70%, transparent)" }} />
    <div style=${{ ...pad, right: "auto", width: 700 }}>
      <${Head} s=${s} size=${60} max=${700} />
      <div style=${{ marginTop: 26, display: "flex", alignItems: "baseline", gap: 18 }}>
        <${Num} n=${s.total} delay=${20} dur=${110} style=${{ font: `600 92px/1 ${HEAD}`, letterSpacing: "-0.04em", color: C.amber }} />
        <span style=${{ font: `400 22px/1.3 ${BODY}`, color: muted }}>${s.totalLabel}</span>
      </div>
      <div style=${{ marginTop: 22 }}>
        ${segs.map((sg, i) => {
          const lit = interpolate(frame, [lampAt(i), lampAt(i) + 10], [0, 1], clamp);
          return html`<div key=${i} style=${{ display: "flex", alignItems: "center", gap: 16, padding: "9px 0", borderBottom: "1px solid rgba(255,255,255,.08)", opacity: 0.35 + 0.65 * lit }}>
            <span style=${{ width: 12, height: 12, borderRadius: "50%", background: lit > 0.5 ? C.amber : "rgba(255,255,255,.2)", boxShadow: lit > 0.5 ? `0 0 14px ${C.amber}` : "none" }} />
            <span style=${{ flex: 1, font: `500 22px/1.25 ${HEAD}` }}>${sg.label}</span>
            <span style=${{ font: `600 22px/1 ${HEAD}`, color: C.amber }}>€${fmt(sg.value, 2)}m</span>
          </div>`;
        })}
      </div>
    </div>
    <div style=${{ position: "absolute", left: 120, right: 120, bottom: 120, display: "grid", gridTemplateColumns: `repeat(${(s.steps || []).length}, 1fr)`, gap: 18 }}>
      ${(s.steps || []).map((st, i) => html`<${Pop} key=${i} delay=${130 + i * 8} style=${{ ...glass, background: "rgba(4,6,12,.72)", padding: "16px 22px" }}>
        <div style=${{ font: `600 20px/1.2 ${HEAD}`, color: C.amber }}>${String(i + 1).padStart(2, "0")} · ${st.title}</div>
        <div style=${{ marginTop: 6, font: `400 17px/1.35 ${BODY}`, color: muted }}>${st.text}</div>
      <//>`)}
    </div>
    <${Footer} index=${index} total=${total} title=${meta.title} />
  <//>`;
}

// ---------- 14. ulke ozeti: KPI + pipeline halkasi + anahtar musteriler ----------
function Donut({ parts, delay, size = 380, center }) {
  const p = useT(delay, 60);
  const tot = parts.reduce((a, b) => a + b.value, 0);
  const R = size / 2 - 30, len = 2 * Math.PI * R;
  const cols = [C.green, C.teal, C.amber, C.blueLight, "#fff"];
  let acc = 0;
  return html`<div style=${{ position: "relative", width: size, height: size }}>
    <svg width=${size} height=${size}>
      <circle cx=${size / 2} cy=${size / 2} r=${R} fill="none" stroke="rgba(255,255,255,.07)" strokeWidth="40" />
      ${parts.map((x, i) => {
        const frac = x.value / tot;
        const start = acc; acc += frac;
        const vis = Math.max(0, Math.min(frac, p - start));
        return html`<circle key=${i} cx=${size / 2} cy=${size / 2} r=${R} fill="none" stroke=${cols[i % cols.length]} strokeWidth="40"
          strokeDasharray=${`${Math.max(0, vis * len - 4)} ${len}`} strokeDashoffset=${-start * len} transform=${`rotate(-90 ${size / 2} ${size / 2})`} />`;
      })}
    </svg>
    <div style=${{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>${center}</div>
  </div>`;
}
function CCountry({ s, meta, index, total }) {
  const cols = [C.green, C.teal, C.amber, C.blueLight, "#fff"];
  return html`<${Frame} dark=${true}>
    <div style=${pad}>
      <${Head} s=${s} size=${60} max=${1500} />
      <div style=${{ position: "absolute", left: 0, top: 200, width: 440, display: "flex", flexDirection: "column", gap: 18 }}>
        ${(s.kpis || []).map((k, i) => html`<${Pop} key=${i} delay=${20 + i * 8} style=${{ ...glass, padding: "18px 26px" }}>
          <${Num} n=${k} delay=${24 + i * 8} style=${{ font: `600 44px/1 ${HEAD}`, color: i === 0 ? C.green : "#fff" }} />
          <div style=${{ marginTop: 8, font: `400 19px/1.35 ${BODY}`, color: muted }}>${k.label}</div>
        <//>`)}
      </div>
      <div style=${{ position: "absolute", left: 500, top: 210, width: 560, display: "flex", flexDirection: "column", alignItems: "center" }}>
        <${Donut} parts=${s.pipeline} delay=${36} size=${360}
          center=${html`<${Label}>${s.pipelineLabel}<//>${s.pipelineCenter
            ? html`<${Num} n=${s.pipelineCenter} delay=${36} dur=${60} style=${{ marginTop: 8, font: `600 64px/1 ${HEAD}` }} />`
            : html`<${Counter} to=${s.pipeline.reduce((a, b) => a + b.value, 0)} decimals=${1} prefix="€" suffix="m" delay=${36} dur=${60} style=${{ marginTop: 8, font: `600 64px/1 ${HEAD}` }} />`}`} />
        <div style=${{ marginTop: 18, display: "grid", gridTemplateColumns: "1fr", gap: 8, width: 420 }}>
          ${s.pipeline.map((x, i) => html`<${Fade} key=${i} delay=${60 + i * 6} y=${10} style=${{ display: "flex", alignItems: "center", gap: 12, font: `400 19px/1.3 ${BODY}` }}>
            <i style=${{ width: 14, height: 14, borderRadius: 4, background: cols[i % cols.length], flexShrink: 0 }} />
            <span style=${{ flex: 1 }}>${x.label}</span><span style=${{ font: `600 20px/1 ${HEAD}` }}>${s.pipelineUnit ? `${x.value}${s.pipelineUnit}` : `€${x.value}m`}</span>
          <//>`)}
        </div>
      </div>
      <div style=${{ position: "absolute", right: 0, top: 200, width: 520, display: "flex", flexDirection: "column", gap: 18 }}>
        <${Label} style=${{ color: C.green }}>${s.accountsLabel}<//>
        ${(s.accounts || []).map((a, i) => html`<${Pop} key=${i} delay=${50 + i * 10} style=${{ ...glass, padding: "20px 26px" }}>
          <div style=${{ font: `600 28px/1.15 ${HEAD}` }}>${a.name}</div>
          <div style=${{ marginTop: 8, font: `400 19px/1.4 ${BODY}`, color: muted }}>${a.text}</div>
        <//>`)}
      </div>
    </div>
    <div style=${{ position: "absolute", left: 120, right: 120, bottom: 190 }}><${Label}>${s.tickerLabel}<//></div>
    <${Ticker} items=${s.ticker || []} delay=${70} bottom=${110} />
    <${Footer} index=${index} total=${total} title=${meta.title} />
  <//>`;
}

// ---------- 15. merdiven: buyume basamaklari ----------
function CStairs({ s, meta, index, total }) {
  const frame = useCurrentFrame();
  const steps = s.steps || [];
  const max = Math.max(...steps.map((x) => x.value), 1);
  const bw = 230, gap = 26, ground = 780, maxH = 400, x0 = 120;
  return html`<${Frame} dark=${true}>
    <div style=${pad}>
      <${Head} s=${s} size=${60} max=${1500} />
    </div>
    ${steps.map((st, i) => {
      const p = spring({ frame: frame - 20 - i * 12, fps: FPS, config: { damping: 16, stiffness: 60, mass: 1.2 } });
      const h = (st.value / max) * maxH * p;
      const x = x0 + i * (bw + gap);
      const last = i === steps.length - 1;
      return html`<div key=${i} style=${{ position: "absolute", left: x, top: ground - h, width: bw, height: h }}>
        <div style=${{ position: "absolute", inset: 0, borderRadius: "14px 14px 0 0", background: last ? `linear-gradient(180deg, rgba(0,228,135,.55), rgba(0,228,135,.05))` : "linear-gradient(180deg, rgba(255,255,255,.22), rgba(255,255,255,.03))",
          border: `1px solid ${last ? C.green : "rgba(255,255,255,.2)"}`, borderBottom: "none", boxShadow: last ? `0 0 60px rgba(0,228,135,.3)` : "none" }} />
        <div style=${{ position: "absolute", left: 0, right: 0, top: 22, textAlign: "center" }}>
          <${Counter} to=${st.value} decimals=${2} prefix="€" suffix="m" delay=${24 + i * 12} style=${{ font: `600 38px/1 ${HEAD}` }} />
          <div style=${{ marginTop: 10, font: `500 19px/1 ${BODY}`, color: C.amber }}>IGM ${st.igm}%</div>
        </div>
        <div style=${{ position: "absolute", left: 0, right: 0, top: "100%", marginTop: 14, textAlign: "center", font: `500 22px/1.2 ${BODY}`, color: muted }}>${st.label}</div>
        ${st.growth && html`<div style=${{ position: "absolute", top: -54, textAlign: "center",
            // buyumede rozet iki basamak arasinda; dususte basamagin kendi ustunde (onceki basamagin ustune binmesin)
            ...(i > 0 && st.value < steps[i - 1].value ? { left: 0, right: 0 } : { left: -gap / 2 - 60, width: 120 }) }}><${Badge} text=${st.growth} delay=${50 + i * 12} color=${/^[−-]/.test(st.growth) ? RED : C.green} /></div>`}
      </div>`;
    })}
    <div style=${{ position: "absolute", left: 100, width: 3 * (bw + gap) + 20, top: ground, height: 2, background: "rgba(255,255,255,.35)" }} />
    <div style=${{ position: "absolute", left: 960, right: 120, top: 300, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 22 }}>
      <${Label} style=${{ gridColumn: "1 / -1" }}>${s.factsLabel}<//>
      ${(s.facts || []).map((f, i) => html`<${Pop} key=${i} delay=${50 + i * 8} style=${{ ...glass, padding: "22px 26px" }}>
        <${Num} n=${f} delay=${54 + i * 8} dur=${60} style=${{ font: `600 52px/1 ${HEAD}`, ...gradText(`linear-gradient(120deg, ${C.green}, ${C.teal})`) }} />
        <div style=${{ marginTop: 10, font: `400 19px/1.35 ${BODY}`, color: muted }}>${f.label}</div>
      <//>`)}
    </div>
    <div style=${{ position: "absolute", left: 120, right: 120, bottom: 190 }}><${Label}>${s.tickerLabel}<//></div>
    <${Ticker} items=${s.ticker || []} delay=${70} bottom=${110} />
    <${Footer} index=${index} total=${total} title=${meta.title} />
  <//>`;
}

// ---------- 16. portfoy baloncuklari + proje listesi ----------
function CBubbles({ s, meta, index, total }) {
  const frame = useCurrentFrame();
  const items = s.items || [];
  const max = Math.max(...items.flatMap((x) => [x.from, x.to]), 1);
  const t = interpolate(frame, [40, 110], [0, 1], { ...clamp, easing: Easing.inOut(Easing.cubic) });
  // s.mix varsa baloncuklar tek sirada kuculur, alta urun grubu ozeti gelir
  const one = !!s.mix, R = one ? 62 : 95, step = one ? 920 / Math.max(items.length, 1) : 310;
  return html`<${Frame} dark=${true}>
    <div style=${pad}>
      <${Head} s=${s} size=${58} max=${1500} />
    </div>
    <div style=${{ position: "absolute", left: 120, top: 280, width: 920, height: 600 }}>
      <div style=${{ position: "absolute", right: 0, top: -40, font: `600 46px/1 ${HEAD}`, color: "rgba(255,255,255,.2)" }}>${t < 0.5 ? s.fromLabel : s.toLabel}</div>
      ${items.map((it, i) => {
        const col = one ? i : i % 3, row = one ? 0 : Math.floor(i / 3);
        const cx = one ? step / 2 + col * step : 150 + col * 310, cy = one ? 100 : 150 + row * 290;
        // en kucuk baloncuk da gorunur kalsin (orn. €39k vs €3.5m)
        const rMin = one ? 24 : 30;
        const r0 = Math.max(Math.sqrt(it.from / max) * R, rMin), r1 = Math.max(Math.sqrt(it.to / max) * R, rMin);
        const app = useSpring(14 + i * 6, { damping: 13, stiffness: 120 });
        const r = (r0 + (r1 - r0) * t) * app;
        const neg = it.to < it.from;
        const col2 = neg ? RED : it.to / it.from > 2 ? C.amber : C.green;
        return html`<div key=${i}>
          <div style=${{ position: "absolute", left: cx - r0, top: cy - r0, width: r0 * 2, height: r0 * 2, borderRadius: "50%", border: "2px dashed rgba(255,255,255,.3)", opacity: app }} />
          <div style=${{ position: "absolute", left: cx - r, top: cy - r, width: r * 2, height: r * 2, borderRadius: "50%",
            background: `radial-gradient(circle at 35% 30%, ${col2}cc, ${col2}33 70%)`, boxShadow: `0 0 ${40 * t}px ${col2}66` }} />
          <div style=${{ position: "absolute", left: cx - (one ? step / 2 : 140), top: cy + R + 12, width: one ? step : 280, textAlign: "center" }}>
            <div style=${{ font: `600 ${one ? 21 : 24}px/1.15 ${HEAD}` }}>${it.label}</div>
            <div style=${{ marginTop: 4, font: `400 18px/1.3 ${BODY}`, color: muted }}>€${fmt(it.from + (it.to - it.from) * t)}k</div>
          </div>
          <div style=${{ position: "absolute", left: cx - 80, top: cy - 18, width: 160, textAlign: "center", font: `700 28px/1 ${HEAD}`, opacity: t, textShadow: "0 2px 12px rgba(0,0,0,.6)" }}>${it.growth}</div>
        </div>`;
      })}
    </div>
    ${one && html`<div style=${{ position: "absolute", left: 120, top: 590, width: 920 }}>
      <${Label}>${s.mixLabel}<//>
      <div style=${{ marginTop: 14, display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px 28px" }}>
        ${s.mix.map((m, i) => {
          const neg = /^[−-]/.test(m.growth);
          const col = neg ? RED : C.green;
          return html`<${Pop} key=${i} delay=${60 + i * 5} style=${{ display: "flex", justifyContent: "space-between", alignItems: "baseline", padding: "10px 16px", borderRadius: 12,
            background: `${col}12`, border: `1px solid ${col}44` }}>
            <span style=${{ font: `500 20px/1.2 ${HEAD}` }}>${m.label}<span style=${{ marginLeft: 10, font: `400 16px/1 ${BODY}`, color: muted }}>${m.value}</span></span>
            <span style=${{ font: `600 22px/1 ${HEAD}`, color: col }}>${m.growth}</span>
          <//>`;
        })}
      </div>
      ${s.mixNote && html`<div style=${{ marginTop: 12, font: `400 18px/1.35 ${BODY}`, color: muted }}>${s.mixNote}</div>`}
      ${s.note && html`<${Fade} delay=${90} style=${{ marginTop: 14, padding: "12px 20px", borderRadius: 14, border: `1px solid ${C.amber}55`,
        background: "rgba(255,181,71,.07)", font: `400 19px/1.4 ${BODY}` }}><span style=${{ color: C.amber, fontWeight: 600 }}>${s.noteLabel || "Note"} · </span>${s.note}<//>`}
    </div>`}
    <div style=${{ position: "absolute", right: 120, top: 270, width: 600 }}>
      <div style=${{ display: "flex", gap: 20 }}>
        ${(s.kpis || []).map((k, i) => html`<${Pop} key=${i} delay=${30 + i * 8} style=${{ ...glass, flex: 1, padding: "18px 22px" }}>
          <${Num} n=${k} delay=${34 + i * 8} style=${{ font: `600 40px/1 ${HEAD}`, color: i ? "#fff" : C.green }} />
          <div style=${{ marginTop: 6, font: `400 17px/1.3 ${BODY}`, color: muted }}>${k.label}</div>
        <//>`)}
      </div>
      <${Label} style=${{ marginTop: 28 }}>${s.projectsLabel}<//>
      ${(s.projects || []).map((pr, i) => {
        const p = useT(60 + i * 8, 40);
        return html`<div key=${i} style=${{ marginTop: 14, opacity: Math.min(1, p * 2) }}>
          <div style=${{ display: "flex", justifyContent: "space-between", font: `500 21px/1.25 ${HEAD}` }}>
            <span>${pr.name}</span><span style=${{ color: C.green }}>${pr.value}</span>
          </div>
          <div style=${{ marginTop: 7, height: 10, borderRadius: 5, background: "rgba(255,255,255,.07)" }}>
            <div style=${{ height: "100%", width: `${(pr.share ?? pr.conversion) * p}%`, borderRadius: 5, background: `linear-gradient(90deg, ${C.teal}, ${C.green})` }} />
          </div>
          <div style=${{ marginTop: 4, font: `400 16px/1.2 ${BODY}`, color: muted }}>${pr.segment} · ${pr.note || `${Math.round(pr.conversion * p)}% expected conversion`}</div>
        </div>`;
      })}
    </div>
    ${s.note && !one && html`<${Fade} delay=${90} style=${{ position: "absolute", left: 120, top: 680, width: 920, padding: "16px 24px", borderRadius: 14, border: `1px solid ${C.amber}55`,
      background: "rgba(255,181,71,.07)", font: `400 21px/1.4 ${BODY}` }}><span style=${{ color: C.amber, fontWeight: 600 }}>${s.noteLabel || "Note"} · </span>${s.note}<//>`}
    <${Footer} index=${index} total=${total} title=${meta.title} />
  <//>`;
}

// ---------- 17. risk isi haritasi ----------
function CHeat({ s, meta, index, total }) {
  const frame = useCurrentFrame();
  const cols = s.columns || [];
  const rows = s.rows || [];
  const LW = cols.length > 4 ? 270 : 330, CW = (1680 - LW - 14 * cols.length) / cols.length, RH = 76;
  const colors = ["rgba(255,255,255,.04)", "rgba(30,203,208,.22)", "rgba(255,181,71,.32)", "rgba(255,107,107,.42)"];
  const edges = ["rgba(255,255,255,.08)", C.teal, C.amber, RED];
  return html`<${Frame} dark=${true}>
    <div style=${pad}>
      <${Head} s=${s} size=${58} max=${1500} />
    </div>
    <div style=${{ position: "absolute", left: 120, top: 248, width: 1680 }}>
      <div style=${{ display: "flex", gap: 14, marginLeft: LW + 14 }}>
        ${cols.map((c, i) => html`<${Fade} key=${i} delay=${8 + i * 4} y=${10} style=${{ width: CW, font: `600 22px/1.2 ${HEAD}`, textAlign: "center" }}>${c}<//>`)}
      </div>
      ${rows.map((r, ri) => html`<div key=${ri} style=${{ display: "flex", gap: 14, marginTop: 12 }}>
        <${Fade} delay=${12 + ri * 4} y=${0} style=${{ width: LW, height: RH, display: "flex", alignItems: "center", font: `500 24px/1.2 ${HEAD}` }}>${r.label}<//>
        ${r.cells.map((cell, ci) => {
          const d = 20 + (ri + ci) * 5;
          const on = interpolate(frame, [d, d + 3, d + 5, d + 9], [0, 1, 0.5, 1], clamp);
          const lvl = cell[0];
          const pulse = lvl === 3 ? 0.88 + 0.12 * Math.sin(frame / 10 + ri + ci) : 1;
          return html`<div key=${ci} style=${{ width: CW, height: RH, borderRadius: 14, padding: "0 18px", display: "flex", alignItems: "center", gap: 12,
              background: colors[lvl], border: `1px solid ${edges[lvl]}`, opacity: on * pulse,
              boxShadow: lvl === 3 ? `inset 0 0 30px rgba(255,107,107,.25)` : "none" }}>
            <span style=${{ display: "flex", gap: 4, flexShrink: 0 }}>${[1, 2, 3].map((k) => html`<i key=${k} style=${{ width: 8, height: 22, borderRadius: 3, background: k <= lvl ? edges[lvl] : "rgba(255,255,255,.12)" }} />`)}</span>
            <span style=${{ font: `400 18px/1.25 ${BODY}`, color: "rgba(255,255,255,.88)" }}>${cell[1]}</span>
          </div>`;
        })}
      </div>`)}
      <${Fade} delay=${70} style=${{ marginTop: 22, display: "flex", gap: 30, font: `400 18px/1 ${BODY}`, color: muted }}>
        ${(s.legend || []).map((l, i) => html`<span key=${i} style=${{ display: "flex", alignItems: "center", gap: 10 }}><i style=${{ width: 16, height: 16, borderRadius: 4, background: colors[i + 1], border: `1px solid ${edges[i + 1]}` }} />${l}</span>`)}
        <span style=${{ marginLeft: "auto" }}>${s.note}</span>
      <//>
    </div>
    <${Footer} index=${index} total=${total} title=${meta.title} />
  <//>`;
}

// ---------- 18. 2027 oncelikleri: isik sutunlari ----------
function CPriorities({ s, meta, index, total }) {
  const frame = useCurrentFrame();
  const pr = s.items || [];
  const asks = s.asks || [];
  return html`<${Frame} dark=${true}>
    <div style=${pad}>
      <${Head} s=${s} size=${62} max=${1500} />
    </div>
    <div style=${{ position: "absolute", left: 120, right: 120, top: 270, height: 470, display: "grid", gridTemplateColumns: `repeat(${pr.length}, 1fr)`, gap: 22 }}>
      ${pr.map((p, i) => {
        const rise = spring({ frame: frame - 14 - i * 9, fps: FPS, config: { damping: 18, stiffness: 70 } });
        const beam = 0.6 + 0.4 * Math.sin(frame / 15 + i);
        return html`<div key=${i} style=${{ position: "relative", height: "100%" }}>
          <div style=${{ position: "absolute", left: 0, right: 0, bottom: 0, height: `${rise * 100}%`, borderRadius: 22, overflow: "hidden",
            background: "linear-gradient(0deg, rgba(0,228,135,.22), rgba(0,228,135,.02) 70%)", border: "1px solid rgba(0,228,135,.3)" }}>
            <div style=${{ position: "absolute", left: "50%", bottom: 0, width: 4, height: "100%", transform: "translateX(-50%)",
              background: `linear-gradient(0deg, ${C.green}, transparent)`, opacity: 0.35 * beam }} />
          </div>
          <div style=${{ position: "absolute", left: 24, right: 24, top: 26, opacity: interpolate(rise, [0.6, 1], [0, 1], clamp) }}>
            <div style=${{ font: `600 56px/1 ${HEAD}`, ...gradText(`linear-gradient(120deg, ${C.green}, ${C.teal})`) }}>${String(i + 1).padStart(2, "0")}</div>
            <div style=${{ marginTop: 14, font: `600 29px/1.12 ${HEAD}`, letterSpacing: "-0.02em" }}>${p.title}</div>
            ${(p.points || []).map((x, k) => html`<div key=${k} style=${{ marginTop: 12, font: `400 19px/1.4 ${BODY}`, color: "rgba(255,255,255,.75)", display: "flex", gap: 10 }}>
              <span style=${{ color: C.green }}>›</span><span>${x}</span></div>`)}
          </div>
        </div>`;
      })}
    </div>
    <div style=${{ position: "absolute", left: 120, right: 120, top: 770 }}>
      <${Label} style=${{ color: C.amber }}>${s.asksLabel}<//>
      <div style=${{ marginTop: 14, display: "flex", flexWrap: "wrap", gap: 12 }}>
        ${asks.map((a, i) => html`<${Pop} key=${i} delay=${80 + i * 5} y=${14} style=${{ padding: "11px 20px", borderRadius: 999, border: `1px solid ${C.amber}66`, background: "rgba(255,181,71,.08)", font: `500 19px/1.2 ${BODY}` }}>${a}<//>`)}
      </div>
    </div>
    <${Footer} index=${index} total=${total} title=${meta.title} />
  <//>`;
}

// ---------- 19. kartlar: firsatlar, riskler, planlar (buyuk rakam + maddeler) ----------
// Kart: { tag, value: {value, decimals, prefix, suffix} veya "metin", label, points: [...], color }
function CCards({ s, meta, index, total }) {
  const frame = useCurrentFrame();
  const cards = s.cards || [];
  const cols = s.columns || Math.min(cards.length, 3);
  // az kart varsa yazilar buyur, kartlar bos kalmasin
  const z = cards.length <= 2 ? 1.4 : cards.length <= 4 ? 1.18 : 1;
  return html`<${Frame} dark=${true}>
    <div style=${pad}>
      <${Head} s=${s} size=${60} max=${1500} />
      <div style=${{ position: "absolute", left: 0, right: 0, top: 200, bottom: s.note ? 56 : 0, display: "grid", gridTemplateColumns: `repeat(${cols}, 1fr)`, gridAutoRows: "1fr", gap: 22 }}>
        ${cards.map((c, i) => {
          const col = c.color || C.green;
          const d = 18 + i * 8;
          const sweep = interpolate(frame - d, [6, 40], [0, 1], ease);
          return html`<${Pop} key=${i} delay=${d} style=${{ ...glass, position: "relative", overflow: "hidden", padding: `${24 * z}px ${28 * z}px`, display: "flex", flexDirection: "column", justifyContent: z > 1 ? "center" : "flex-start" }}>
            <div style=${{ position: "absolute", left: 0, top: 0, height: 3, width: `${sweep * 100}%`, background: `linear-gradient(90deg, transparent, ${col})`, boxShadow: `0 0 18px ${col}` }} />
            ${c.tag && html`<${Label} style=${{ color: col, fontSize: 19 * z }}>${c.tag}<//>`}
            ${c.value != null && (typeof c.value === "object"
              ? html`<${Num} n=${c.value} delay=${d + 6} style=${{ marginTop: 12 * z, font: `600 ${50 * z}px/1 ${HEAD}`, letterSpacing: "-0.03em", color: "#fff" }} />`
              : html`<div style=${{ marginTop: 12 * z, font: `600 ${46 * z}px/1 ${HEAD}`, letterSpacing: "-0.03em" }}>${c.value}</div>`)}
            ${c.label && html`<div style=${{ marginTop: 10 * z, font: `600 ${24 * z}px/1.2 ${HEAD}` }}>${c.label}</div>`}
            ${(c.points || []).map((p, k) => html`<div key=${k} style=${{ marginTop: 12 * z, display: "flex", gap: 10, font: `400 ${19 * z}px/1.4 ${BODY}`, color: "rgba(255,255,255,.8)", opacity: useT(d + 14 + k * 4, 16) }}>
              <span style=${{ color: col, flexShrink: 0 }}>›</span><span>${p}</span></div>`)}
          <//>`;
        })}
      </div>
      ${s.note && html`<${Fade} delay=${70} style=${{ position: "absolute", left: 0, right: 0, bottom: 0, padding: "12px 22px", borderRadius: 14, border: `1px solid ${C.amber}55`,
        background: "rgba(255,181,71,.07)", font: `500 20px/1.35 ${BODY}` }}><span style=${{ color: C.amber, fontWeight: 600 }}>${s.noteLabel || "Takeaway"} · </span>${s.note}<//>`}
    </div>
    <${Footer} index=${index} total=${total} title=${meta.title} />
  <//>`;
}

// ---------- 20. fiyat farki dagilimi: kac urun ne kadar pahali ----------
function CGap({ s, meta, index, total }) {
  const frame = useCurrentFrame();
  const buckets = s.buckets || [];
  const maxN = Math.max(...buckets.map((b) => b.items.length), 1);
  const rowH = 104, top = 300, BW = 300;
  const cols = [C.amber, "#FF9A57", RED, "#FF4D6D", "#FF2E63"];
  return html`<${Frame} dark=${true}>
    <div style=${pad}>
      <${Head} s=${s} size=${58} max=${1600} />
      ${s.sub && html`<${Fade} delay=${10} style=${{ marginTop: 14, font: `400 22px/1.4 ${BODY}`, color: muted }}>${s.sub}<//>`}
    </div>
    <div style=${{ position: "absolute", left: 120, top, width: 1180 }}>
      ${buckets.map((b, i) => {
        const col = b.color || cols[Math.min(i, cols.length - 1)];
        const p = spring({ frame: frame - 18 - i * 8, fps: FPS, config: { damping: 15, stiffness: 90 } });
        const n = b.items.length;
        return html`<div key=${i} style=${{ position: "absolute", left: 0, right: 0, top: i * rowH, height: rowH - 16, display: "flex", alignItems: "center", gap: 22, opacity: useT(12 + i * 8, 16) }}>
          <div style=${{ width: 170, textAlign: "right", font: `600 30px/1 ${HEAD}`, color: col }}>${b.label}</div>
          <div style=${{ position: "relative", width: BW, height: 54 }}>
            <div style=${{ position: "absolute", left: 0, top: 0, bottom: 0, width: (n / maxN) * BW * Math.min(1, p), borderRadius: 12,
              background: `linear-gradient(90deg, ${col}33, ${col})`, boxShadow: `0 0 26px ${col}55` }} />
            <div style=${{ position: "absolute", left: (n / maxN) * BW * Math.min(1, p) + 14, top: "50%", transform: "translateY(-50%)", whiteSpace: "nowrap" }}>
              <span style=${{ font: `600 40px/1 ${HEAD}` }}>${n}</span><span style=${{ marginLeft: 8, font: `400 18px/1 ${BODY}`, color: muted }}>SKUs</span>
            </div>
          </div>
          <div style=${{ flex: 1, marginLeft: 130, display: "flex", flexWrap: "wrap", gap: 8 }}>
            ${b.items.map((it, k) => html`<span key=${k} style=${{ padding: "6px 12px", borderRadius: 999, border: `1px solid ${col}66`, background: `${col}14`,
              font: `500 16px/1 ${BODY}`, whiteSpace: "nowrap", opacity: useT(30 + i * 8 + k * 2, 12) }}>${it}</span>`)}
          </div>
        </div>`;
      })}
    </div>
    <div style=${{ position: "absolute", right: 120, top: 300, width: 380, display: "flex", flexDirection: "column", gap: 18 }}>
      ${(s.kpis || []).map((k, i) => html`<${Pop} key=${i} delay=${70 + i * 10} style=${{ ...glass, padding: "20px 26px" }}>
        <${Num} n=${k} delay=${74 + i * 10} style=${{ font: `600 56px/1 ${HEAD}`, letterSpacing: "-0.03em", color: RED }} />
        <div style=${{ marginTop: 8, font: `400 19px/1.35 ${BODY}`, color: muted }}>${k.label}</div>
      <//>`)}
    </div>
    ${s.punch && html`<${Pop} delay=${120} style=${{ position: "absolute", left: 120, right: 120, bottom: 120, padding: "18px 28px", borderRadius: 18,
      border: `1px solid ${RED}88`, background: "rgba(255,107,107,.10)", font: `600 28px/1.3 ${HEAD}` }}>${s.punch}<//>`}
    <${Footer} index=${index} total=${total} title=${meta.title} />
  <//>`;
}

// ---------- 21. bolge ekonomisi: Turkiye makas + diger ulkeler ----------
function CRegion({ s, meta, index, total }) {
  const frame = useCurrentFrame();
  const tr = s.main || {};
  const bars = tr.bars || [];
  const bmax = Math.max(...bars.map((b) => b.value), 1);
  const BW = 520;
  return html`<${Frame} dark=${true}>
    <div style=${pad}>
      <${Head} s=${s} size=${58} max=${1600} />
    </div>
    <${Pop} delay=${12} style=${{ ...glass, position: "absolute", left: 120, top: 250, width: 900, bottom: 150, padding: "28px 36px", borderColor: `${RED}66` }}>
      <${Label} style=${{ color: RED }}>${tr.tag}<//>
      <div style=${{ marginTop: 8, font: `600 34px/1.2 ${HEAD}` }}>${tr.headline}</div>
      <div style=${{ marginTop: 26, display: "flex", flexDirection: "column", gap: 16 }}>
        ${bars.map((b, i) => {
          const p = spring({ frame: frame - 30 - i * 14, fps: FPS, config: { damping: 16, stiffness: 70 } });
          const col = i === 0 ? RED : C.teal;
          return html`<div key=${i} style=${{ display: "flex", alignItems: "center", gap: 18 }}>
            <span style=${{ width: 220, font: `500 19px/1.25 ${BODY}`, color: muted }}>${b.label}</span>
            <div style=${{ position: "relative", width: BW, height: 44 }}>
              <div style=${{ position: "absolute", left: 0, top: 0, bottom: 0, width: (b.value / bmax) * BW * Math.min(1, p), borderRadius: 10,
                background: `linear-gradient(90deg, ${col}33, ${col})`, boxShadow: `0 0 24px ${col}55` }} />
              <span style=${{ position: "absolute", left: (b.value / bmax) * BW * Math.min(1, p) + 12, top: "50%", transform: "translateY(-50%)", font: `600 32px/1 ${HEAD}`, color: col }}>+${fmt(b.value * Math.min(1, p), 1)}%</span>
            </div>
          </div>`;
        })}
        ${tr.gap && html`<${Fade} delay=${70} style=${{ marginLeft: 238, font: `600 22px/1.3 ${HEAD}`, color: C.amber }}>${tr.gap}<//>`}
      </div>
      <div style=${{ marginTop: 26, display: "grid", gridTemplateColumns: `repeat(${(tr.kpis || []).length}, 1fr)`, gap: 18 }}>
        ${(tr.kpis || []).map((k, i) => html`<${Pop} key=${i} delay=${60 + i * 8}>
          <${Num} n=${k} delay=${64 + i * 8} style=${{ font: `600 44px/1 ${HEAD}`, letterSpacing: "-0.03em", color: "#fff" }} />
          <div style=${{ marginTop: 6, font: `400 17px/1.3 ${BODY}`, color: muted }}>${k.label}</div>
        <//>`)}
      </div>
      <div style=${{ marginTop: 22, display: "flex", flexDirection: "column", gap: 8 }}>
        ${(tr.points || []).map((pt, i) => html`<div key=${i} style=${{ display: "flex", gap: 12, font: `400 20px/1.35 ${BODY}`, opacity: useT(80 + i * 6, 14) }}>
          <span style=${{ color: RED }}>›</span><span>${pt}</span></div>`)}
      </div>
    <//>
    <div style=${{ position: "absolute", left: 1050, right: 120, top: 250, bottom: 150, display: "flex", flexDirection: "column", gap: 16 }}>
      ${(s.others || []).map((o, i) => html`<${Pop} key=${i} delay=${30 + i * 10} style=${{ ...glass, flex: 1, padding: "18px 26px" }}>
        <div style=${{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
          <${Label} style=${{ color: o.color || C.amber }}>${o.tag}<//>
          <span style=${{ font: `600 30px/1 ${HEAD}`, color: o.color || C.amber }}>${o.value}</span>
        </div>
        ${o.valueLabel && html`<div style=${{ textAlign: "right", marginTop: 2, font: `400 15px/1.2 ${BODY}`, color: muted }}>${o.valueLabel}</div>`}
        ${(o.points || []).map((pt, k) => html`<div key=${k} style=${{ marginTop: 6, display: "flex", gap: 10, font: `400 18px/1.32 ${BODY}` }}>
          <span style=${{ color: o.color || C.amber }}>›</span><span>${pt}</span></div>`)}
      <//>`)}
    </div>
    ${s.source && html`<div style=${{ position: "absolute", left: 120, right: 120, bottom: 112, font: `400 14px/1.3 ${BODY}`, color: "rgba(255,255,255,.4)" }}>${s.source}</div>`}
    <${Footer} index=${index} total=${total} title=${meta.title} />
  <//>`;
}

registerSlideTypes({
  "c-cover": CCover, "c-map": CMap, "c-skyline": CSkyline, "c-section": CSection, "c-flow": CFlow,
  "c-tr-map": CTrMap, "c-race": CRace, "c-strip": CStrip, "c-funnel": CFunnel, "c-gauges": CGauges,
  "c-orbit": COrbit, "c-plays": CPlays, "c-road": CRoad, "c-country": CCountry, "c-stairs": CStairs,
  "c-bubbles": CBubbles, "c-heat": CHeat, "c-priorities": CPriorities, "c-cards": CCards, "c-gap": CGap, "c-region": CRegion,
});
