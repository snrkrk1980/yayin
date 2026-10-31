// "executive" slayt tipleri: yonetim kurulu (Leadership Team) sunumlari icin sade, kurumsal tasarim.
// Acik zemin, net tablolar, sakin animasyon. Kapak ve kapanis lacivert.
// Slayt metinleri ve rakamlar bu dosyada DEGIL, sunumun index.html dosyasindaki deck-data blogunda durur.
// Tipler: e-cover, e-summary, e-table, e-gap, e-bridge, e-cards, e-model, e-compare, e-shift, e-decline, e-channel, e-stats, e-engine, e-timeline, e-ask, e-closing
import React from "react";
import { useCurrentFrame, interpolate, Easing } from "remotion";
import {
  html, C, HEAD, BODY, clamp, pad, useSpring,
  Frame, Footer, Kicker, RiseText, Fade, Logo, Motif, registerSlideTypes,
} from "./slides.js";

// ---------- ortak yardimcilar ----------
const INK = "#0E1116";
const MUTED = "#5B616E";
const LINE = "#E3E6EB";
const NAVY = "#0A1633";
const BLUE = C.blue;
const GREEN = "#00A86B";
const RED = "#D64545";
const AMBER = "#D98C1F";
const card = { background: "#fff", border: `1px solid ${LINE}`, borderRadius: 16, boxShadow: "0 1px 2px rgba(16,24,40,.04), 0 10px 28px rgba(16,24,40,.06)" };
const ease = { ...clamp, easing: Easing.out(Easing.cubic) };
const fmt = (v, d = 0) => v.toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d });

function useT(delay, dur = 30) {
  const frame = useCurrentFrame();
  return interpolate(frame - delay, [0, dur], [0, 1], ease);
}
function Counter({ to, from = 0, decimals = 0, prefix = "", suffix = "", delay = 0, dur = 40, style }) {
  const p = useT(delay, dur);
  return html`<span style=${{ fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap", ...style }}>${prefix}${fmt(from + (to - from) * p, decimals)}${suffix}</span>`;
}
// Sayi nesnesi { value, decimals, prefix, suffix } ya da duz metin
function Val({ v, delay, style }) {
  if (v == null) return null;
  if (typeof v === "object") return html`<${Counter} to=${v.value} decimals=${v.decimals || 0} prefix=${v.prefix || ""} suffix=${v.suffix || ""} delay=${delay} style=${style} />`;
  return html`<span style=${style}>${v}</span>`;
}
function Rise({ delay = 0, children, style, y = 22 }) {
  const p = useT(delay, 26);
  return html`<div style=${{ opacity: p, transform: `translateY(${(1 - p) * y}px)`, ...style }}>${children}</div>`;
}
function Head({ s, size = 58, max = 1500 }) {
  return html`<div>
    <${Kicker} text=${s.kicker} delay=${2} />
    <${RiseText} text=${s.title} delay=${6} stagger=${1.5} gradientWords=${0}
      style=${{ marginTop: 22, font: `600 ${size}px/1.08 ${HEAD}`, letterSpacing: "-0.03em", maxWidth: max, color: INK }} />
    ${s.sub && html`<${Rise} delay=${16} style=${{ marginTop: 16, font: `400 25px/1.4 ${BODY}`, color: MUTED, maxWidth: max }}>${s.sub}<//>`}
  </div>`;
}
function Tag({ children, color = BLUE, style }) {
  return html`<div style=${{ font: `600 17px/1.2 ${BODY}`, letterSpacing: "0.14em", textTransform: "uppercase", color, ...style }}>${children}</div>`;
}
function Note({ s, delay = 60 }) {
  if (!s.note) return null;
  return html`<${Rise} delay=${delay} style=${{ position: "absolute", left: 0, right: 0, bottom: 0, display: "flex", gap: 14, alignItems: "baseline",
      font: `400 19px/1.4 ${BODY}`, color: MUTED, borderTop: `1px solid ${LINE}`, paddingTop: 14 }}>
    ${s.noteLabel && html`<span style=${{ font: `600 15px/1 ${BODY}`, letterSpacing: "0.14em", textTransform: "uppercase", color: AMBER, flexShrink: 0 }}>${s.noteLabel}</span>`}
    <span>${s.note}</span>
  <//>`;
}
const colorOf = (c) => ({ green: GREEN, red: RED, amber: AMBER, blue: BLUE, navy: NAVY, teal: C.teal }[c] || c || BLUE);

// ---------- 1. kapak (lacivert) ----------
function ECover({ s, meta }) {
  return html`<${Frame} dark=${true}>
    <${Motif} size=${900} x="76%" y="50%" delay=${6} />
    <div style=${{ ...pad, display: "flex", flexDirection: "column", justifyContent: "center" }}>
      <${Logo} width=${190} style=${{ position: "absolute", top: 0, left: 0 }} />
      ${s.badge && html`<${Rise} delay=${4} style=${{ position: "absolute", top: 6, right: 0, padding: "8px 16px", border: "1px solid rgba(255,255,255,.3)", borderRadius: 6,
        font: `600 16px/1 ${BODY}`, letterSpacing: "0.16em", textTransform: "uppercase", color: "rgba(255,255,255,.8)" }}>${s.badge}<//>`}
      <${Kicker} text=${s.kicker} delay=${8} />
      <${RiseText} text=${s.title} delay=${12} stagger=${3} gradientWords=${s.gradientWords ?? 1}
        style=${{ marginTop: 34, font: `600 108px/1.02 ${HEAD}`, letterSpacing: "-0.04em", maxWidth: 1150 }} />
      ${s.subtitle && html`<${Rise} delay=${30} style=${{ marginTop: 34, maxWidth: 1000, font: `400 32px/1.4 ${BODY}`, color: "rgba(255,255,255,.78)" }}>${s.subtitle}<//>`}
      <${Rise} delay=${42} style=${{ marginTop: 70, display: "flex", gap: 46, alignItems: "baseline" }}>
        <div>
          <div style=${{ font: `600 28px/1.2 ${HEAD}` }}>${meta.presenter}</div>
          <div style=${{ marginTop: 6, font: `400 21px/1.3 ${BODY}`, color: "rgba(255,255,255,.6)" }}>${meta.role}</div>
        </div>
        ${s.date && html`<div style=${{ font: `400 21px/1.3 ${BODY}`, color: "rgba(255,255,255,.6)", paddingLeft: 46, borderLeft: "1px solid rgba(255,255,255,.2)" }}>${s.date}</div>`}
      <//>
    </div>
  <//>`;
}

// ---------- 2. yonetici ozeti: numarali mesajlar + sagda tek buyuk rakam ----------
// points: [{ title, text }], highlight: { label, from: {value,...,caption}, to: {value,...,caption}, note }
function ESummary({ s, meta, index, total }) {
  const h = s.highlight || {};
  return html`<${Frame} dark=${false}>
    <div style=${pad}>
      <${Head} s=${s} max=${1680} />
      <div style=${{ position: "absolute", left: 0, right: 0, top: 190, bottom: 0, display: "grid", gridTemplateColumns: "1fr 560px", gap: 40 }}>
        <div style=${{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
          ${(s.points || []).map((p, i) => html`<${Rise} key=${i} delay=${16 + i * 7} style=${{ display: "flex", gap: 26, paddingBottom: 18, borderBottom: i < s.points.length - 1 ? `1px solid ${LINE}` : "none" }}>
            <div style=${{ font: `600 34px/1 ${HEAD}`, color: BLUE, width: 48, flexShrink: 0 }}>${String(i + 1).padStart(2, "0")}</div>
            <div>
              <div style=${{ font: `600 27px/1.25 ${HEAD}`, color: INK }}>${p.title}</div>
              <div style=${{ marginTop: 6, font: `400 21px/1.42 ${BODY}`, color: MUTED }}>${p.text}</div>
            </div>
          <//>`)}
        </div>
        <${Rise} delay=${24} style=${{ background: NAVY, borderRadius: 18, padding: "44px 44px", color: "#fff", display: "flex", flexDirection: "column", justifyContent: "center", position: "relative", overflow: "hidden" }}>
          <div style=${{ position: "absolute", right: -120, top: -120, width: 360, height: 360, borderRadius: "50%", border: `2px solid rgba(255,255,255,.08)` }} />
          <${Tag} color=${C.green}>${h.label}<//>
          ${h.from && html`<div style=${{ marginTop: 30 }}>
            <div style=${{ font: `400 20px/1.3 ${BODY}`, color: "rgba(255,255,255,.6)" }}>${h.from.caption}</div>
            <${Val} v=${h.from} delay=${30} style=${{ display: "block", marginTop: 4, font: `600 76px/1 ${HEAD}`, letterSpacing: "-0.03em", color: "rgba(255,255,255,.55)" }} />
          </div>`}
          <div style=${{ margin: "22px 0", height: 2, background: "rgba(255,255,255,.15)" }} />
          ${h.to && html`<div>
            <div style=${{ font: `400 20px/1.3 ${BODY}`, color: "rgba(255,255,255,.6)" }}>${h.to.caption}</div>
            <${Val} v=${h.to} delay=${40} style=${{ display: "block", marginTop: 4, font: `600 124px/1 ${HEAD}`, letterSpacing: "-0.04em", color: C.green }} />
          </div>`}
          ${h.note && html`<div style=${{ marginTop: 26, font: `400 20px/1.45 ${BODY}`, color: "rgba(255,255,255,.75)" }}>${h.note}</div>`}
        <//>
      </div>
    </div>
    <${Footer} index=${index} total=${total} title=${meta.title} />
  <//>`;
}

// ---------- 3. P&L tablosu + sagda vurgu kutulari ----------
// columns: ["2025 Actual", ...], rows: [{ label, values: [...], hl, bold, sub }], callouts: [{ value, label, color }]
function ETable({ s, meta, index, total }) {
  const cols = s.columns || [];
  const rows = s.rows || [];
  const hasSide = (s.callouts || []).length > 0;
  return html`<${Frame} dark=${false}>
    <div style=${pad}>
      <${Head} s=${s} />
      <div style=${{ position: "absolute", left: 0, right: 0, top: s.sub ? 250 : 200, bottom: s.note ? 70 : 0, display: "grid", gridTemplateColumns: hasSide ? "1fr 470px" : "1fr", gap: 40 }}>
        <${Rise} delay=${14} style=${{ ...card, padding: "18px 34px", display: "flex", flexDirection: "column", justifyContent: "center" }}>
          <div style=${{ display: "grid", gridTemplateColumns: `1.5fr repeat(${cols.length}, 1fr)`, padding: "12px 0", borderBottom: `2px solid ${INK}` }}>
            <div style=${{ font: `600 18px/1.2 ${BODY}`, color: MUTED, letterSpacing: "0.1em", textTransform: "uppercase" }}>${s.unit || ""}</div>
            ${cols.map((c, j) => html`<div key=${j} style=${{ textAlign: "right", font: `600 21px/1.2 ${HEAD}`, color: INK }}>${c}</div>`)}
          </div>
          ${rows.map((r, i) => html`<${Rise} key=${i} delay=${20 + i * 4} y=${10} style=${{ display: "grid", gridTemplateColumns: `1.5fr repeat(${cols.length}, 1fr)`, alignItems: "center",
              padding: r.hl ? "14px 14px" : "11px 0", margin: r.hl ? "6px -14px" : 0, borderRadius: r.hl ? 10 : 0,
              background: r.hl ? "rgba(20,50,255,.07)" : "transparent", borderBottom: r.hl ? "none" : `1px solid ${LINE}` }}>
            <div style=${{ font: `${r.bold || r.hl ? 600 : 400} ${r.sub ? 19 : 23}px/1.2 ${r.bold || r.hl ? HEAD : BODY}`, color: r.sub ? MUTED : INK, paddingLeft: r.sub ? 22 : 0 }}>${r.label}</div>
            ${(r.values || []).map((v, j) => html`<div key=${j} style=${{ textAlign: "right", fontVariantNumeric: "tabular-nums",
              font: `${r.bold || r.hl ? 600 : 400} ${r.sub ? 19 : 23}px/1.2 ${BODY}`, color: r.hl ? BLUE : r.sub ? MUTED : INK }}>${v}</div>`)}
          <//>`)}
        <//>
        ${hasSide && html`<div style=${{ display: "flex", flexDirection: "column", gap: 20 }}>
          ${s.callouts.map((c, i) => html`<${Rise} key=${i} delay=${40 + i * 8} style=${{ ...card, flex: 1, padding: "22px 28px", borderLeft: `5px solid ${colorOf(c.color)}`, display: "flex", flexDirection: "column", justifyContent: "center" }}>
            <${Val} v=${c.value} delay=${46 + i * 8} style=${{ font: `600 46px/1 ${HEAD}`, letterSpacing: "-0.03em", color: colorOf(c.color) }} />
            <div style=${{ marginTop: 10, font: `400 20px/1.4 ${BODY}`, color: INK }}>${c.label}</div>
          <//>`)}
        </div>`}
      </div>
      <${Note} s=${s} delay=${70} />
    </div>
    <${Footer} index=${index} total=${total} title=${meta.title} />
  <//>`;
}

// ---------- 4. hedef acigi: iki cubuk + acigi kapatmanin iki yolu ----------
// bars: [{ label, value (%), amount, color }], gapLabel, optionsTitle, options: [{ value, label, text }]
function EGap({ s, meta, index, total }) {
  const frame = useCurrentFrame();
  const bars = s.bars || [];
  const max = s.max || 30;
  const H = 330;
  const top = bars.length > 1 ? bars[1] : null;
  return html`<${Frame} dark=${false}>
    <div style=${pad}>
      <${Head} s=${s} />
      <div style=${{ position: "absolute", left: 0, right: 0, top: s.sub ? 260 : 210, bottom: s.note ? 70 : 0, display: "grid", gridTemplateColumns: "760px 1fr", gap: 60 }}>
        <${Rise} delay=${12} style=${{ ...card, padding: "30px 40px", position: "relative" }}>
          <${Tag} color=${MUTED}>${s.chartLabel || ""}<//>
          <div style=${{ position: "absolute", left: 40, right: 40, bottom: 80, height: H, display: "flex", alignItems: "flex-end", justifyContent: "space-around", borderBottom: `2px solid ${INK}` }}>
            ${bars.map((b, i) => {
              const p = interpolate(frame - 20 - i * 12, [0, 40], [0, 1], ease);
              const h = (b.value / max) * H * p;
              const col = colorOf(b.color);
              return html`<div key=${i} style=${{ width: 190, display: "flex", flexDirection: "column", alignItems: "center", position: "relative" }}>
                <div style=${{ font: `600 46px/1 ${HEAD}`, color: col, marginBottom: 12, opacity: p }}>${fmt(b.value * p, 1)}%</div>
                <div style=${{ font: `400 19px/1 ${BODY}`, color: MUTED, marginBottom: 14, opacity: p }}>${b.amount || ""}</div>
                <div style=${{ width: "100%", height: h, background: b.dashed ? "transparent" : col, border: b.dashed ? `3px dashed ${col}` : "none", borderBottom: "none", borderRadius: "8px 8px 0 0" }} />
                <div style=${{ position: "absolute", bottom: -52, font: `500 20px/1.2 ${BODY}`, color: INK, textAlign: "center", whiteSpace: "nowrap" }}>${b.label}</div>
              </div>`;
            })}
          </div>
          ${s.gapLabel && html`<${Rise} delay=${60} style=${{ display: "inline-block", marginTop: 14, padding: "8px 16px", borderRadius: 8, background: "rgba(214,69,69,.08)", border: `1px solid ${RED}55`,
            font: `600 22px/1.2 ${HEAD}`, color: RED }}>${s.gapLabel}<//>`}
        <//>
        <div style=${{ display: "flex", flexDirection: "column", gap: 22 }}>
          ${s.optionsTitle && html`<${Rise} delay=${40} style=${{ font: `600 26px/1.3 ${HEAD}`, color: INK }}>${s.optionsTitle}<//>`}
          ${(s.options || []).map((o, i) => html`<${Rise} key=${i} delay=${50 + i * 10} style=${{ ...card, flex: 1, padding: "26px 32px", display: "flex", gap: 30, alignItems: "center" }}>
            <${Val} v=${o.value} delay=${56 + i * 10} style=${{ font: `600 60px/1 ${HEAD}`, letterSpacing: "-0.03em", color: RED, minWidth: 210 }} />
            <div>
              <div style=${{ font: `600 25px/1.25 ${HEAD}`, color: INK }}>${o.label}</div>
              <div style=${{ marginTop: 8, font: `400 20px/1.42 ${BODY}`, color: MUTED }}>${o.text}</div>
            </div>
          <//>`)}
          ${s.punch && html`<${Rise} delay=${80} style=${{ padding: "18px 26px", borderRadius: 12, background: NAVY, color: "#fff", font: `500 23px/1.4 ${BODY}` }}>${s.punch}<//>`}
        </div>
      </div>
      <${Note} s=${s} delay=${90} />
    </div>
    <${Footer} index=${index} total=${total} title=${meta.title} />
  <//>`;
}

// ---------- 5. ISM kopru grafigi: bugun vs EROP modeli, iki selale ----------
// panels: [{ title, caption, steps: [{ label, value, kind: "up"|"down"|"total" }], floor: { value, label } }]
function Waterfall({ pnl, delay, max }) {
  const frame = useCurrentFrame();
  const H = 270;
  const y = (v) => H - (v / max) * H;
  let run = 0;
  const steps = pnl.steps.map((st) => {
    const from = st.kind === "total" ? 0 : st.kind === "down" ? run - st.value : run;
    const to = st.kind === "total" ? st.value : st.kind === "down" ? run : run + st.value;
    if (st.kind === "up") run += st.value; else if (st.kind === "down") run -= st.value; else run = st.value;
    return { ...st, lo: Math.min(from, to), hi: Math.max(from, to) };
  });
  const n = steps.length;
  const W = 640, colW = W / n;
  return html`<div style=${{ position: "relative", height: H + 64 }}>
    <svg width=${W} height=${H + 4} style=${{ position: "absolute", left: 0, top: 0, overflow: "visible" }}>
      <line x1="0" x2=${W} y1=${H} y2=${H} stroke=${INK} strokeWidth="2" />
      ${pnl.floor && (() => {
        const q = interpolate(frame - delay - 70, [0, 25], [0, 1], ease);
        return html`<g opacity=${q}>
          <line x1="0" x2=${W * q} y1=${y(pnl.floor.value)} y2=${y(pnl.floor.value)} stroke=${GREEN} strokeWidth="2.5" strokeDasharray="10 8" />
        </g>`;
      })()}
      ${steps.map((st, i) => {
        const p = interpolate(frame - delay - i * 12, [0, 30], [0, 1], ease);
        const col = st.kind === "total" ? colorOf(st.color || "blue") : st.kind === "down" ? RED : colorOf(st.color || "teal");
        const x = i * colW + colW * 0.18, w = colW * 0.64;
        const top = y(st.hi), hgt = (y(st.lo) - y(st.hi)) * p;
        const yy = st.kind === "down" ? top : y(st.lo) - hgt;
        return html`<g key=${i}>
          <rect x=${x} y=${yy} width=${w} height=${Math.max(0, hgt)} rx="6" fill=${col} opacity=${st.kind === "total" ? 1 : 0.85} />
          ${i < n - 1 && html`<line x1=${x + w} x2=${x + colW} y1=${y(steps[i].kind === "down" ? st.lo : st.hi)} y2=${y(steps[i].kind === "down" ? st.lo : st.hi)} stroke=${MUTED} strokeWidth="1.5" strokeDasharray="4 5" opacity=${p * 0.6} />`}
        </g>`;
      })}
    </svg>
    ${steps.map((st, i) => {
      const p = interpolate(frame - delay - i * 12 - 10, [0, 20], [0, 1], ease);
      const x = i * colW;
      return html`<div key=${i} style=${{ position: "absolute", left: x, width: colW, top: y(st.hi) - 46, textAlign: "center", opacity: p,
          font: `600 ${st.kind === "total" ? 36 : 28}px/1 ${HEAD}`, color: st.kind === "down" ? RED : st.kind === "total" ? colorOf(st.color || "blue") : INK }}>
        ${st.display || (st.kind === "down" ? "−" : st.kind === "up" ? "+" : "") + fmt(st.value, 1) + "%"}
      </div>`;
    })}
    ${steps.map((st, i) => html`<div key=${"l" + i} style=${{ position: "absolute", left: i * colW, width: colW, top: H + 12, textAlign: "center", font: `500 18px/1.25 ${BODY}`, color: INK, padding: "0 6px" }}>${st.label}</div>`)}
  </div>`;
}
function EBridge({ s, meta, index, total }) {
  const panels = s.panels || [];
  const max = s.max || 45;
  return html`<${Frame} dark=${false}>
    <div style=${pad}>
      <${Head} s=${s} />
      <div style=${{ position: "absolute", left: 0, right: 0, top: s.sub ? 255 : 205, bottom: s.note ? 70 : 0, display: "grid", gridTemplateColumns: `repeat(${panels.length}, 1fr)`, gap: 40 }}>
        ${panels.map((pn, i) => html`<${Rise} key=${i} delay=${12 + i * 30} style=${{ ...card, padding: "24px 40px 0", border: pn.accent ? `2px solid ${BLUE}` : card.border }}>
          <div style=${{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
            <div style=${{ font: `600 28px/1.2 ${HEAD}`, color: pn.accent ? BLUE : INK }}>${pn.title}</div>
            <div style=${{ font: `400 18px/1.2 ${BODY}`, color: MUTED }}>${pn.caption}</div>
          </div>
          ${pn.floor && html`<div style=${{ marginTop: 10, display: "flex", alignItems: "center", gap: 10, font: `600 17px/1 ${BODY}`, color: GREEN }}>
            <span style=${{ width: 34, borderTop: `3px dashed ${GREEN}` }} />${pn.floor.label}
          </div>`}
          <div style=${{ marginTop: 56 }}><${Waterfall} pnl=${pn} delay=${20 + i * 30} max=${max} /></div>
        <//>`)}
      </div>
      <${Note} s=${s} delay=${110} />
    </div>
    <${Footer} index=${index} total=${total} title=${meta.title} />
  <//>`;
}

// ---------- 6. kartlar: garanti, risk, yonetisim vb. ----------
// cards: [{ tag, value, label, points: [...], color }], columns, intro
function ECards({ s, meta, index, total }) {
  const cards = s.cards || [];
  const cols = s.columns || Math.min(cards.length, 3);
  // rakamsiz kartlarda yazi buyur, kart bos kalmasin
  const noValues = cards.every((c) => c.value == null);
  const z = s.scale || (cards.length <= 3 ? 1.12 : 1) * (noValues ? 1.2 : 1);
  return html`<${Frame} dark=${false}>
    <div style=${pad}>
      <${Head} s=${s} />
      <div style=${{ position: "absolute", left: 0, right: 0, top: s.sub ? 255 : 205, bottom: s.note ? 70 : 0, display: "grid", gridTemplateColumns: `repeat(${cols}, 1fr)`, gridAutoRows: "1fr", gap: 26 }}>
        ${cards.map((c, i) => {
          const col = colorOf(c.color);
          const d = 14 + i * 7;
          return html`<${Rise} key=${i} delay=${d} style=${{ ...card, padding: `${28 * z}px ${32 * z}px`, borderTop: `5px solid ${col}`, display: "flex", flexDirection: "column", justifyContent: noValues ? "center" : "flex-start" }}>
            ${c.tag && html`<${Tag} color=${col}>${c.tag}<//>`}
            ${c.value != null && html`<${Val} v=${c.value} delay=${d + 6} style=${{ display: "block", marginTop: 16, font: `600 ${54 * z}px/1 ${HEAD}`, letterSpacing: "-0.03em", color: INK }} />`}
            ${c.label && html`<div style=${{ marginTop: 12, font: `600 ${24 * z}px/1.28 ${HEAD}`, color: INK }}>${c.label}</div>`}
            ${(c.points || []).map((p, k) => html`<${Rise} key=${k} delay=${d + 14 + k * 4} y=${8} style=${{ marginTop: 13, display: "flex", gap: 12, font: `400 ${20 * z}px/1.42 ${BODY}`, color: "#2E3440" }}>
              <span style=${{ width: 7, height: 7, borderRadius: "50%", background: col, flexShrink: 0, marginTop: "0.55em" }} /><span>${p}</span>
            <//>`)}
          <//>`;
        })}
      </div>
      <${Note} s=${s} delay=${70} />
    </div>
    <${Footer} index=${index} total=${total} title=${meta.title} />
  <//>`;
}

// ---------- 7. model semasi: Signify -> EROP -> yerel sirketler -> pazar ----------
// top: { name, text }, link: "...", hub: { name, text }, units: [{ name, sub, points }], market, side: { title, items: [...] }
function EModel({ s, meta, index, total }) {
  const frame = useCurrentFrame();
  const units = s.units || [];
  const hasSide = !!s.side;
  const draw = (d) => interpolate(frame - d, [0, 24], [0, 1], ease);
  const box = (bg, fg, border) => ({ borderRadius: 14, padding: "14px 26px", background: bg, color: fg, border: border || "none", textAlign: "center" });
  return html`<${Frame} dark=${false}>
    <div style=${pad}>
      <${Head} s=${s} />
      <div style=${{ position: "absolute", left: 0, right: 0, top: s.sub ? 250 : 200, bottom: 0, display: "grid", gridTemplateColumns: hasSide ? "1fr 440px" : "1fr", gap: 40 }}>
        <div style=${{ display: "flex", flexDirection: "column", alignItems: "center" }}>
          <${Rise} delay=${12} style=${{ ...box(NAVY, "#fff"), width: 520 }}>
            <div style=${{ font: `600 30px/1.1 ${HEAD}` }}>${s.top?.name}</div>
            <div style=${{ marginTop: 6, font: `400 18px/1.3 ${BODY}`, color: "rgba(255,255,255,.7)" }}>${s.top?.text}</div>
          <//>
          <div style=${{ position: "relative", height: 56, width: 2, background: BLUE, transform: `scaleY(${draw(24)})`, transformOrigin: "top" }}>
            <div style=${{ position: "absolute", left: 22, top: 16, width: 760, font: `500 18px/1.3 ${BODY}`, color: BLUE, opacity: draw(30), whiteSpace: "nowrap" }}>${s.link}</div>
          </div>
          <${Rise} delay=${32} style=${{ ...box(BLUE, "#fff"), width: 700, boxShadow: "0 12px 30px rgba(20,50,255,.25)" }}>
            <div style=${{ font: `600 34px/1.1 ${HEAD}` }}>${s.hub?.name}</div>
            <div style=${{ marginTop: 6, font: `400 19px/1.35 ${BODY}`, color: "rgba(255,255,255,.85)" }}>${s.hub?.text}</div>
          <//>
          <svg width="1100" height="44" style=${{ overflow: "visible" }}>
            ${units.map((u, i) => {
              const x = (1100 / units.length) * (i + 0.5);
              const len = Math.hypot(x - 550, 44);
              return html`<line key=${i} x1="550" y1="0" x2=${x} y2="44" stroke=${BLUE} strokeWidth="2" strokeDasharray=${len} strokeDashoffset=${len * (1 - draw(46 + i * 4))} />`;
            })}
          </svg>
          <div style=${{ width: 1100, display: "grid", gridTemplateColumns: `repeat(${units.length}, 1fr)`, gap: 20 }}>
            ${units.map((u, i) => html`<${Rise} key=${i} delay=${54 + i * 6} style=${{ ...card, padding: "18px 22px", borderTop: `4px solid ${C.teal}` }}>
              <div style=${{ font: `600 25px/1.15 ${HEAD}`, color: INK }}>${u.name}</div>
              ${u.sub && html`<div style=${{ marginTop: 4, font: `400 16px/1.3 ${BODY}`, color: MUTED }}>${u.sub}</div>`}
              ${(u.points || []).map((p, k) => html`<div key=${k} style=${{ marginTop: 8, font: `400 17px/1.35 ${BODY}`, color: "#2E3440", display: "flex", gap: 8 }}>
                <span style=${{ color: C.teal }}>›</span><span>${p}</span></div>`)}
            <//>`)}
          </div>
          ${s.market && html`<${Rise} delay=${80} style=${{ marginTop: 16, width: 1100, padding: "12px 20px", borderRadius: 10, border: `1px dashed ${MUTED}88`, textAlign: "center", font: `500 19px/1.3 ${BODY}`, color: MUTED }}>${s.market}<//>`}
        </div>
        ${hasSide && html`<${Rise} delay=${40} style=${{ ...card, padding: "28px 30px", alignSelf: "stretch", display: "flex", flexDirection: "column" }}>
          <${Tag}>${s.side.title}<//>
          ${(s.side.items || []).map((it, i) => html`<${Rise} key=${i} delay=${50 + i * 6} y=${8} style=${{ marginTop: 18, paddingBottom: 14, borderBottom: i < s.side.items.length - 1 ? `1px solid ${LINE}` : "none" }}>
            <div style=${{ font: `600 21px/1.25 ${HEAD}`, color: INK }}>${it.title}</div>
            <div style=${{ marginTop: 4, font: `400 18px/1.4 ${BODY}`, color: MUTED }}>${it.text}</div>
          <//>`)}
        <//>`}
      </div>
    </div>
    <${Footer} index=${index} total=${total} title=${meta.title} />
  <//>`;
}

// ---------- 8. secenek karsilastirma matrisi ----------
// options: [{ name, sub, accent, verdict, r }], rows: [{ label, cells: [{ r: "good"|"mid"|"bad", t }] }]
function ECompare({ s, meta, index, total }) {
  const opts = s.options || [];
  const rows = s.rows || [];
  const dot = { good: GREEN, mid: AMBER, bad: RED };
  const hasVerdict = opts.some((o) => o.verdict);
  const acc = opts.findIndex((o) => o.accent);
  const grid = `330px repeat(${opts.length}, 1fr)`;
  return html`<${Frame} dark=${false}>
    <div style=${pad}>
      <${Head} s=${s} />
      <div style=${{ position: "absolute", left: 0, right: 0, top: s.sub ? 255 : 205, bottom: s.note ? 70 : 0 }}>
        <div style=${{ position: "relative", height: "100%" }}>
          ${acc >= 0 && html`<${Rise} delay=${10} style=${{ position: "absolute", top: -10, bottom: -10, left: `calc(330px + (100% - 330px) / ${opts.length} * ${acc})`, width: `calc((100% - 330px) / ${opts.length})`,
            borderRadius: 16, border: `2px solid ${BLUE}`, background: "rgba(20,50,255,.04)" }} />`}
          <div style=${{ position: "relative", display: "grid", gridTemplateColumns: grid, padding: "8px 0 16px", borderBottom: `2px solid ${INK}` }}>
            <div />
            ${opts.map((o, j) => html`<${Rise} key=${j} delay=${12 + j * 5} style=${{ padding: "0 24px", font: `600 26px/1.2 ${HEAD}`, color: o.accent ? BLUE : INK }}>
              ${o.name}
              ${o.sub && html`<div style=${{ marginTop: 4, font: `400 17px/1.3 ${BODY}`, color: MUTED }}>${o.sub}</div>`}
              ${o.verdict && html`<div style=${{ display: "inline-block", marginTop: 12, padding: "7px 14px", borderRadius: 999, background: `${dot[o.r] || MUTED}1A`,
                font: `600 17px/1.1 ${BODY}`, color: dot[o.r] || MUTED }}>${o.verdict}</div>`}
            <//>`)}
          </div>
          <div style=${{ position: "absolute", left: 0, right: 0, top: hasVerdict ? 146 : 96, bottom: 0, display: "flex", flexDirection: "column" }}>
          ${rows.map((r, i) => html`<${Rise} key=${i} delay=${26 + i * 6} y=${10} style=${{ flex: 1, position: "relative", display: "grid", gridTemplateColumns: grid, alignItems: "center", borderBottom: `1px solid ${LINE}` }}>
            <div style=${{ font: `600 24px/1.25 ${HEAD}`, color: INK, paddingRight: 20 }}>${r.label}</div>
            ${(r.cells || []).map((c, j) => html`<div key=${j} style=${{ padding: "0 24px", display: "flex", gap: 14, alignItems: "flex-start" }}>
              <span style=${{ width: 16, height: 16, borderRadius: "50%", background: dot[c.r] || MUTED, flexShrink: 0, marginTop: 6 }} />
              <span style=${{ font: `${opts[j]?.accent && c.r === "good" ? 600 : 400} 21px/1.38 ${BODY}`, color: opts[j]?.accent && c.r === "good" ? "#00875A" : "#2E3440" }}>${c.t}</span>
            </div>`)}
          <//>`)}
          </div>
        </div>
      </div>
      <${Note} s=${s} delay=${80} />
    </div>
    <${Footer} index=${index} total=${total} title=${meta.title} />
  <//>`;
}

// ---------- 8b. maliyet tasinir, yok olmaz: solda tasinan fonksiyonlar, sagda sonuc zinciri ----------
// fromTitle, functions: [...], to: "Regional hub", chainTitle, chain: [{ title, text }], punch
function EShift({ s, meta, index, total }) {
  const frame = useCurrentFrame();
  const fns = s.functions || [];
  const chain = s.chain || [];
  const line = interpolate(frame - (fns.length ? 60 : 30), [0, 60], [0, 1], ease);
  return html`<${Frame} dark=${false}>
    <div style=${pad}>
      <${Head} s=${s} />
      <div style=${{ position: "absolute", left: 0, right: 0, top: s.sub ? 255 : 205, bottom: s.punch ? 112 : 0, display: "grid", gridTemplateColumns: !fns.length ? "1fr" : s.wideLeft ? "1.45fr 1fr" : "1fr 1fr", gap: 36 }}>
        ${fns.length > 0 && html`<${Rise} delay=${12} style=${{ ...card, padding: "22px 30px", display: "flex", flexDirection: "column" }}>
          <${Tag}>${s.fromTitle}<//>
          <div style=${{ flex: 1, marginTop: 10, display: "flex", flexDirection: "column", justifyContent: "space-around" }}>
            ${fns.map((f0, i) => {
              // f: "metin" ya da { name, to, why, bad } (bad: uzaktan yapilamaz, kirmizi)
              const f = typeof f0 === "string" ? { name: f0 } : f0;
              const q = interpolate(frame - 20 - i * 6, [0, 20], [0, 1], ease);
              const tagBg = f.bad ? "rgba(214,69,69,.10)" : "rgba(214,140,31,.12)";
              const tagFg = f.bad ? RED : "#9A5F0C";
              return html`<div key=${i} style=${{ opacity: q, paddingBottom: f.why ? 8 : 0, borderBottom: f.why && i < fns.length - 1 ? `1px solid ${LINE}` : "none" }}>
                <div style=${{ display: "grid", gridTemplateColumns: `1fr ${f.why ? 44 : 64}px ${f.why ? 210 : 220}px`, alignItems: "center" }}>
                  <span style=${{ font: `${f.why ? 600 : 500} ${f.why ? 22 : 24}px/1.25 ${f.why ? HEAD : BODY}`, color: INK }}>${f.name}</span>
                  <span style=${{ height: 2, background: MUTED, transform: `scaleX(${q})`, transformOrigin: "left", position: "relative" }}>
                    <span style=${{ position: "absolute", right: -2, top: -7, color: MUTED, fontSize: 16, lineHeight: 1 }}>▶</span>
                  </span>
                  <span style=${{ marginLeft: 12, padding: "7px 12px", borderRadius: 8, background: tagBg, color: tagFg, font: `600 17px/1 ${BODY}`, textAlign: "center", whiteSpace: "nowrap" }}>${f.to || s.to}</span>
                </div>
                ${f.why && html`<div style=${{ marginTop: 4, font: `400 17px/1.35 ${BODY}`, color: MUTED }}>${f.why}</div>`}
              </div>`;
            })}
          </div>
        <//>`}
        <${Rise} delay=${fns.length ? 40 : 12} style=${{ ...card, padding: "26px 32px", display: "flex", flexDirection: "column" }}>
          <${Tag} color=${RED}>${s.chainTitle}<//>
          <div style=${{ position: "relative", flex: 1, marginTop: 10, display: "flex", flexDirection: "column", justifyContent: "space-around" }}>
            <div style=${{ position: "absolute", left: 17, top: 30, bottom: 30, width: 2, background: LINE }}>
              <div style=${{ height: `${line * 100}%`, background: `linear-gradient(${AMBER}, ${RED})` }} />
            </div>
            ${chain.map((c, i) => {
              const last = i === chain.length - 1;
              const col = last ? RED : AMBER;
              return html`<${Rise} key=${i} delay=${(fns.length ? 58 : 28) + i * 10} y=${10} style=${{ position: "relative", display: "flex", gap: 22, alignItems: "flex-start" }}>
                <span style=${{ width: 36, height: 36, borderRadius: "50%", background: last ? RED : "#fff", border: `3px solid ${col}`, flexShrink: 0,
                  font: `600 17px/30px ${HEAD}`, textAlign: "center", color: last ? "#fff" : col }}>${i + 1}</span>
                <div>
                  <div style=${{ font: `600 ${fns.length ? 25 : 30}px/1.25 ${HEAD}`, color: last ? RED : INK }}>${c.title}</div>
                  ${c.text && html`<div style=${{ marginTop: 3, font: `400 ${fns.length ? 19 : 22}px/1.38 ${BODY}`, color: MUTED }}>${c.text}</div>`}
                </div>
              <//>`;
            })}
          </div>
        <//>
      </div>
      ${s.punch && html`<${Rise} delay=${118} style=${{ position: "absolute", left: 0, right: 0, bottom: 0, height: 86, borderRadius: 14, background: NAVY, color: "#fff",
        display: "flex", alignItems: "center", padding: "0 34px", font: `600 28px/1.3 ${HEAD}` }}>${s.punch}<//>`}
    </div>
    <${Footer} index=${index} total=${total} title=${meta.title} />
  <//>`;
}

// ---------- 8c. devir sonrasi satis egrisi: asamalar + alt kartlar ----------
// chartLabel, values: [100, ...] ya da series: [{ values, color, label, labelBelow }], phases: [{ when, title, text, color }], cards: [{ tag, title, text, color }]
function EDecline({ s, meta, index, total }) {
  const frame = useCurrentFrame();
  const ph = s.phases || [];
  const v = s.values || [];
  const cards = s.cards || [];
  const n = ph.length;
  const p = interpolate(frame - 20, [0, 70], [0, 1], ease);
  const H = s.chartH || 200;
  const y = (val) => 16 + (1 - val / 100) * (H - 30);
  // tek egri (values, maviden kirmiziya) ya da birden cok egri (series: [{ values, color, label }])
  const series = (s.series || [{ values: v }]).map((x) => {
    const pts = x.values.map((val, i) => [((i + 0.5) * 1000) / n, y(val)]);
    const line = "M" + pts.map((q) => q.join(",")).join(" L");
    return { ...x, pts, line, col: x.color ? colorOf(x.color) : null };
  });
  const { pts, line } = series[0];
  const area = `${line} L${pts[pts.length - 1][0]},${H} L${pts[0][0]},${H} Z`;
  const dotCol = (x, i) => x.col || (i < 2 ? BLUE : RED);
  const phaseCol = (st, i) => (st.color ? colorOf(st.color) : s.series ? BLUE : i < 2 ? BLUE : RED);
  return html`<${Frame} dark=${false}>
    <div style=${pad}>
      <${Head} s=${s} />
      <div style=${{ position: "absolute", left: 0, right: 0, top: s.sub ? 255 : 205 }}>
        ${s.chartLabel && html`<${Rise} delay=${12}><${Tag} color=${MUTED}>${s.chartLabel}<//><//>`}
        <div style=${{ position: "relative", height: H, marginTop: 14 }}>
          <svg viewBox=${`0 0 1000 ${H}`} preserveAspectRatio="none" style=${{ position: "absolute", inset: 0, width: "100%", height: "100%", overflow: "visible" }}>
            <defs>
              <linearGradient id="declLine" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor=${BLUE} /><stop offset="0.4" stopColor=${BLUE} /><stop offset="1" stopColor=${RED} /></linearGradient>
              <linearGradient id="declArea" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor=${RED} stopOpacity="0.12" /><stop offset="1" stopColor=${RED} stopOpacity="0" /></linearGradient>
              <clipPath id="declClip"><rect x="0" y="-20" width=${1000 * p} height=${H + 40} /></clipPath>
            </defs>
            <line x1="0" y1=${H} x2="1000" y2=${H} stroke=${LINE} strokeWidth="2" vectorEffect="non-scaling-stroke" />
            <g clipPath="url(#declClip)">
              ${!s.series && html`<path d=${area} fill="url(#declArea)" />`}
              ${series.map((x, k) => html`<path key=${k} d=${x.line} fill="none" stroke=${x.col || "url(#declLine)"} strokeWidth="5" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />`)}
            </g>
          </svg>
          ${series.map((x, k) => x.pts.map((q, i) => html`<div key=${k + "-" + i} style=${{ position: "absolute", left: `${((i + 0.5) * 100) / n}%`, top: q[1] - 9, width: 18, height: 18, marginLeft: -9, borderRadius: "50%",
            background: "#fff", border: `4px solid ${dotCol(x, i)}`, opacity: interpolate(frame - 24 - i * 13, [0, 10], [0, 1], ease) }} />`))}
          ${series.filter((x) => x.label).map((x, k) => html`<div key=${"l" + k} style=${{ position: "absolute", right: 0, top: x.pts[x.pts.length - 1][1] + (x.labelBelow ? 16 : -40),
            font: `600 20px/1.2 ${BODY}`, color: x.col, whiteSpace: "nowrap", opacity: interpolate(frame - 90, [0, 14], [0, 1], ease) }}>${x.label}</div>`)}
        </div>
        <div style=${{ marginTop: 18, display: "grid", gridTemplateColumns: `repeat(${n}, 1fr)`, gap: 20 }}>
          ${ph.map((st, i) => html`<${Rise} key=${i} delay=${26 + i * 12} style=${{ textAlign: "center", padding: "0 8px" }}>
            <${Tag} color=${phaseCol(st, i)}>${st.when}<//>
            <div style=${{ marginTop: 8, font: `600 25px/1.2 ${HEAD}`, color: INK }}>${st.title}</div>
            <div style=${{ marginTop: 6, font: `400 19px/1.38 ${BODY}`, color: MUTED }}>${st.text}</div>
          <//>`)}
        </div>
      </div>
      ${cards.length > 0 && html`<div style=${{ position: "absolute", left: 0, right: 0, bottom: 0, height: 170, display: "grid", gridTemplateColumns: `repeat(${cards.length}, 1fr)`, gap: 24 }}>
        ${cards.map((c, i) => html`<${Rise} key=${i} delay=${90 + i * 8} style=${{ ...card, padding: "18px 26px", borderLeft: `5px solid ${colorOf(c.color)}` }}>
          <${Tag} color=${colorOf(c.color)}>${c.tag}<//>
          <div style=${{ marginTop: 10, font: `600 24px/1.25 ${HEAD}`, color: INK }}>${c.title}</div>
          <div style=${{ marginTop: 6, font: `400 19px/1.4 ${BODY}`, color: MUTED }}>${c.text}</div>
        <//>`)}
      </div>`}
    </div>
    <${Footer} index=${index} total=${total} title=${meta.title} />
  <//>`;
}

// ---------- 8d. kanal catismasi: iki sema yan yana (tek distributor vs EROP) ----------
// panels: [{ title, good, mid, tier: [...] (ara katman, istege bagli), partners: [...], lost: "...", caption }], example: { tag, text }, punch
function EChannel({ s, meta, index, total }) {
  const frame = useCurrentFrame();
  const panels = s.panels || [];
  const draw = (d) => interpolate(frame - d, [0, 22], [0, 1], ease);
  return html`<${Frame} dark=${false}>
    <div style=${pad}>
      <${Head} s=${s} />
      <div style=${{ position: "absolute", left: 0, right: 0, top: s.sub ? 255 : 205, display: "grid", gridTemplateColumns: `repeat(${panels.length}, 1fr)`, gap: 32 }}>
        ${panels.map((pn, k) => {
          const col = pn.good ? GREEN : RED;
          const d = 12 + k * 30;
          const parts = pn.partners || [];
          const W = 760;
          return html`<${Rise} key=${k} delay=${d} style=${{ ...card, padding: "22px 28px 20px", borderTop: `5px solid ${col}`, display: "flex", flexDirection: "column", alignItems: "center" }}>
            <${Tag} color=${col} style=${{ alignSelf: "flex-start" }}>${pn.title}<//>
            <div style=${{ marginTop: 14, padding: "10px 30px", borderRadius: 12, background: NAVY, color: "#fff", font: `600 24px/1.1 ${HEAD}` }}>Signify</div>
            <div style=${{ width: 2, height: 16, background: MUTED, transform: `scaleY(${draw(d + 8)})`, transformOrigin: "top" }} />
            ${typeof pn.mid === "object"
              ? html`<div style=${{ padding: "12px 34px 13px", borderRadius: 14, background: pn.good ? BLUE : "#fff", border: pn.good ? "none" : `2px solid ${RED}`,
                  color: pn.good ? "#fff" : RED, textAlign: "center", maxWidth: 640, boxShadow: pn.good ? "0 10px 24px rgba(20,50,255,.22)" : "none", opacity: draw(d + 12) }}>
                  <div style=${{ font: `600 26px/1.1 ${HEAD}` }}>${pn.mid.name}</div>
                  ${(pn.mid.lines || []).map((l, i) => html`<div key=${i} style=${{ marginTop: i ? 2 : 6, font: `400 16px/1.35 ${BODY}`, opacity: 0.88 }}>${l}</div>`)}
                </div>`
              : html`<div style=${{ padding: "10px 24px", borderRadius: 12, background: pn.good ? BLUE : "#fff", border: pn.good ? "none" : `2px solid ${RED}`,
                  color: pn.good ? "#fff" : RED, font: `600 22px/1.2 ${HEAD}`, textAlign: "center", opacity: draw(d + 12) }}>${pn.mid}</div>`}
            ${pn.tier && (() => {
              const tw = W / pn.tier.length;
              const bx = (i) => tw * (i + 0.5);
              const px = (i) => (W / parts.length) * (i + 0.5);
              const q = draw(d + 18);
              return html`<svg width=${W} height="16" style=${{ overflow: "visible" }}>
                  ${pn.tier.map((t, i) => html`<line key=${i} x1=${W / 2} y1="0" x2=${bx(i)} y2="16" stroke=${BLUE} strokeWidth="2" opacity=${q} />`)}
                </svg>
                <div style=${{ width: W, display: "grid", gridTemplateColumns: `repeat(${pn.tier.length}, 1fr)`, gap: 12, opacity: q }}>
                  ${pn.tier.map((t, i) => html`<div key=${i} style=${{ padding: "8px 6px", borderRadius: 10, background: "rgba(30,203,208,.14)", color: "#0B7F83", font: `600 18px/1.15 ${HEAD}`, textAlign: "center" }}>${t}</div>`)}
                </div>
                <svg width=${W} height="26" style=${{ overflow: "visible" }}>
                  ${pn.tier.map((t, i) => html`<line key=${"v" + i} x1=${bx(i)} y1="0" x2=${bx(i)} y2="12" stroke=${GREEN} strokeWidth="2" opacity=${draw(d + 24)} />`)}
                  <line x1=${px(0)} y1="12" x2=${px(parts.length - 1)} y2="12" stroke=${GREEN} strokeWidth="2" opacity=${draw(d + 24)} />
                  ${parts.map((p, i) => html`<line key=${"p" + i} x1=${px(i)} y1="12" x2=${px(i)} y2="26" stroke=${GREEN} strokeWidth="2" opacity=${draw(d + 28)} />`)}
                </svg>`;
            })()}
            ${!pn.tier && html`<svg width=${W} height="40" style=${{ overflow: "visible" }}>
              ${parts.map((p, i) => {
                const x = (W / parts.length) * (i + 0.5);
                const len = Math.hypot(x - W / 2, 40);
                return html`<line key=${i} x1=${W / 2} y1="0" x2=${x} y2="40" stroke=${pn.good ? GREEN : RED} strokeWidth="2" strokeDasharray=${pn.good ? len : "6 6"}
                  strokeDashoffset=${pn.good ? len * (1 - draw(d + 20 + i * 3)) : 0} opacity=${pn.good ? 1 : draw(d + 20 + i * 3)} />`;
              })}
            </svg>`}
            <div style=${{ width: W, display: "grid", gridTemplateColumns: `repeat(${parts.length}, 1fr)`, gap: 10 }}>
              ${parts.map((p, i) => html`<div key=${i} style=${{ opacity: draw(d + 26 + i * 4), display: "flex", justifyContent: "center", alignItems: "baseline", gap: 8, padding: "9px 4px", borderRadius: 10,
                background: pn.good ? "rgba(0,168,107,.08)" : "rgba(214,69,69,.06)", border: `1px solid ${pn.good ? "rgba(0,168,107,.35)" : "rgba(214,69,69,.35)"}` }}>
                <span style=${{ font: `600 18px/1 ${HEAD}`, color: pn.good ? GREEN : RED }}>${pn.good ? "✓" : "✕"}</span>
                <span style=${{ font: `500 17px/1.2 ${BODY}`, color: INK }}>${p}</span>
              </div>`)}
            </div>
            ${pn.lost && html`<div style=${{ marginTop: 10, font: `600 18px/1.3 ${BODY}`, color: col, opacity: draw(d + 50) }}>${pn.lost}</div>`}
            ${pn.caption && html`<div style=${{ marginTop: 10, font: `400 20px/1.42 ${BODY}`, color: "#2E3440", textAlign: "center" }}>${pn.caption}</div>`}
          <//>`;
        })}
      </div>
      ${s.example && html`<${Rise} delay=${90} style=${{ position: "absolute", left: 0, right: 0, bottom: s.punch ? 96 : 0, display: "flex", gap: 16, alignItems: "baseline",
        padding: "12px 22px", borderRadius: 12, background: "rgba(217,140,31,.08)", borderLeft: `4px solid ${AMBER}`, font: `400 20px/1.42 ${BODY}`, color: INK }}>
        <span style=${{ font: `600 15px/1 ${BODY}`, letterSpacing: "0.14em", textTransform: "uppercase", color: AMBER, flexShrink: 0 }}>${s.example.tag}</span>
        <span>${s.example.text}</span>
      <//>`}
      ${s.punch && html`<${Rise} delay=${110} style=${{ position: "absolute", left: 0, right: 0, bottom: 0, height: 80, borderRadius: 14, background: NAVY, color: "#fff",
        display: "flex", alignItems: "center", padding: "0 34px", font: `600 27px/1.3 ${HEAD}` }}>${s.punch}<//>`}
    </div>
    <${Footer} index=${index} total=${total} title=${meta.title} />
  <//>`;
}

// ---------- 8e. buyuk rakamlar + bugun / EROP ile iki blok ----------
// stats: [{ value, label, color }], left: { title, points }, right: { title, points }
function EStats({ s, meta, index, total }) {
  const stats = s.stats || [];
  const L = s.left || {};
  const R = s.right || {};
  return html`<${Frame} dark=${false}>
    <div style=${pad}>
      <${Head} s=${s} />
      <div style=${{ position: "absolute", left: 0, right: 0, top: s.sub ? 255 : 200, display: "grid", gridTemplateColumns: `repeat(${stats.length}, 1fr)`, gap: 24 }}>
        ${stats.map((st, i) => {
          const col = colorOf(st.color);
          return html`<${Rise} key=${i} delay=${12 + i * 7} style=${{ borderTop: `4px solid ${col}`, paddingTop: 16 }}>
            <${Val} v=${st.value} delay=${18 + i * 7} style=${{ display: "block", font: `600 78px/1 ${HEAD}`, letterSpacing: "-0.03em", color: col }} />
            <div style=${{ marginTop: 10, font: `500 21px/1.32 ${BODY}`, color: INK }}>${st.label}</div>
          <//>`;
        })}
      </div>
      <div style=${{ position: "absolute", left: 0, right: 0, bottom: 0, height: 330, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 28 }}>
        <${Rise} delay=${50} style=${{ ...card, padding: "26px 34px", borderLeft: `5px solid ${RED}` }}>
          <${Tag} color=${RED}>${L.title}<//>
          ${(L.points || []).map((p, k) => html`<${Rise} key=${k} delay=${58 + k * 5} y=${8} style=${{ marginTop: 16, display: "flex", gap: 14, font: `400 22px/1.38 ${BODY}`, color: INK }}>
            <span style=${{ color: RED, fontWeight: 600, flexShrink: 0 }}>✕</span><span>${p}</span>
          <//>`)}
        <//>
        <${Rise} delay=${70} style=${{ background: NAVY, borderRadius: 16, padding: "26px 34px", color: "#fff", position: "relative", overflow: "hidden" }}>
          <div style=${{ position: "absolute", right: -110, top: -110, width: 320, height: 320, borderRadius: "50%", border: "2px solid rgba(255,255,255,.08)" }} />
          <${Tag} color=${C.green}>${R.title}<//>
          ${(R.points || []).map((p, k) => html`<${Rise} key=${k} delay=${78 + k * 5} y=${8} style=${{ marginTop: 16, display: "flex", gap: 14, font: `${k === R.points.length - 1 ? 600 : 400} 22px/1.38 ${BODY}`, color: k === R.points.length - 1 ? C.green : "#fff" }}>
            <span style=${{ color: C.green, fontWeight: 600, flexShrink: 0 }}>✓</span><span>${p}</span>
          <//>`)}
        <//>
      </div>
    </div>
    <${Footer} index=${index} total=${total} title=${meta.title} />
  <//>`;
}

// ---------- 9. ticari motor: Trade ve Project yan yana dongu ----------
// columns: [{ title, tag, steps: [...], text, risk: { title, points: [...] }, punch }]
function EEngine({ s, meta, index, total }) {
  const frame = useCurrentFrame();
  const cols = s.columns || [];
  return html`<${Frame} dark=${false}>
    <div style=${pad}>
      <${Head} s=${s} />
      <div style=${{ position: "absolute", left: 0, right: 0, top: s.sub ? 255 : 205, bottom: s.note ? 70 : 0, display: "grid", gridTemplateColumns: `repeat(${cols.length}, 1fr)`, gap: 36 }}>
        ${cols.map((c, i) => {
          const d = 14 + i * 16;
          return html`<${Rise} key=${i} delay=${d} style=${{ ...card, padding: "30px 36px", display: "flex", flexDirection: "column" }}>
            <${Tag} color=${i ? C.teal : BLUE}>${c.tag}<//>
            <div style=${{ marginTop: 10, font: `600 38px/1.2 ${HEAD}`, color: INK }}>${c.title}</div>
            <div style=${{ marginTop: c.risk ? 20 : 30, display: "flex", alignItems: "center", flexWrap: "wrap", rowGap: 14 }}>
              ${(c.steps || []).map((st, k) => {
                const q = interpolate(frame - d - 10 - k * 6, [0, 16], [0, 1], ease);
                return html`<div key=${k} style=${{ display: "flex", alignItems: "center", opacity: q }}>
                  <span style=${{ padding: c.risk ? "9px 14px" : "11px 18px", borderRadius: 999, background: i ? "rgba(30,203,208,.12)" : "rgba(20,50,255,.08)", font: `600 ${c.risk ? 18 : 21}px/1 ${BODY}`, color: i ? "#0B7F83" : BLUE, whiteSpace: "nowrap" }}>${st}</span>
                  ${k < c.steps.length - 1 && html`<span style=${{ margin: c.risk ? "0 5px" : "0 8px", color: MUTED, fontSize: 18 }}>→</span>`}
                </div>`;
              })}
            </div>
            <div style=${{ marginTop: c.risk ? 22 : 34, font: `400 ${c.risk ? 22 : 26}px/1.45 ${BODY}`, color: "#2E3440", flex: c.risk ? "none" : 1 }}>${c.text}</div>
            ${c.risk && html`<${Rise} delay=${d + 40} y=${10} style=${{ marginTop: 18, flex: 1, padding: "14px 22px", borderRadius: 12, background: "rgba(214,69,69,.06)", borderLeft: `4px solid ${RED}` }}>
              <${Tag} color=${RED}>${c.risk.title}<//>
              ${(c.risk.points || []).map((p, k) => html`<${Rise} key=${k} delay=${d + 48 + k * 6} y=${6} style=${{ marginTop: 11, display: "flex", gap: 12, font: `400 21px/1.38 ${BODY}`, color: INK }}>
                <span style=${{ color: RED, fontWeight: 600, flexShrink: 0 }}>✕</span><span>${p}</span>
              <//>`)}
            <//>`}
            ${c.punch && html`<div style=${{ marginTop: c.risk ? 14 : 18, paddingTop: c.risk ? 14 : 20, borderTop: `1px solid ${LINE}`, font: `600 ${c.risk ? 24 : 27}px/1.3 ${HEAD}`, color: i ? "#0B7F83" : BLUE }}>${c.punch}</div>`}
          <//>`;
        })}
      </div>
      <${Note} s=${s} delay=${80} />
    </div>
    <${Footer} index=${index} total=${total} title=${meta.title} />
  <//>`;
}

// ---------- 10. zaman cizelgesi + alt kartlar ----------
// steps: [{ when, title, text }], cards: [{ tag, title, text, color }]
function ETimeline({ s, meta, index, total }) {
  const frame = useCurrentFrame();
  const steps = s.steps || [];
  const line = interpolate(frame - 14, [0, 50], [0, 1], ease);
  const cards = s.cards || [];
  const big = cards.length === 0; // kart yoksa cizelge ortaya iner, yazilar buyur
  return html`<${Frame} dark=${false}>
    <div style=${pad}>
      <${Head} s=${s} />
      <div style=${{ position: "absolute", left: 0, right: 0, top: (s.sub ? 260 : 215) + (big ? 90 : 0) }}>
        <div style=${{ position: "relative", height: 4, background: LINE, borderRadius: 2, margin: "26px 0 0" }}>
          <div style=${{ position: "absolute", left: 0, top: 0, bottom: 0, width: `${line * 100}%`, background: BLUE, borderRadius: 2 }} />
        </div>
        <div style=${{ display: "grid", gridTemplateColumns: `repeat(${steps.length}, 1fr)`, gap: 24 }}>
          ${steps.map((st, i) => {
            const d = 18 + i * 9;
            return html`<${Rise} key=${i} delay=${d} style=${{ position: "relative", paddingTop: 34 }}>
              <div style=${{ position: "absolute", top: -14, left: 0, width: 24, height: 24, borderRadius: "50%", background: "#fff", border: `5px solid ${BLUE}` }} />
              <${Tag} color=${BLUE}>${st.when}<//>
              <div style=${{ marginTop: 10, font: `600 ${big ? 34 : 28}px/1.25 ${HEAD}`, color: INK }}>${st.title}</div>
              <div style=${{ marginTop: 8, font: `400 ${big ? 24 : 21}px/1.42 ${BODY}`, color: MUTED }}>${st.text}</div>
            <//>`;
          })}
        </div>
      </div>
      <${Note} s=${s} delay=${70} />
      ${cards.length > 0 && html`<div style=${{ position: "absolute", left: 0, right: 0, bottom: 0, height: 250, display: "grid", gridTemplateColumns: `repeat(${cards.length}, 1fr)`, gap: 24 }}>
        ${cards.map((c, i) => html`<${Rise} key=${i} delay=${70 + i * 8} style=${{ ...card, padding: "22px 28px", borderLeft: `5px solid ${colorOf(c.color)}` }}>
          <${Tag} color=${colorOf(c.color)}>${c.tag}<//>
          <div style=${{ marginTop: 12, font: `600 27px/1.25 ${HEAD}`, color: INK }}>${c.title}</div>
          <div style=${{ marginTop: 10, font: `400 21px/1.42 ${BODY}`, color: MUTED }}>${c.text}</div>
        <//>`)}
      </div>`}
    </div>
    <${Footer} index=${index} total=${total} title=${meta.title} />
  <//>`;
}

// ---------- 11. karar talebi ----------
// statement, askTitle, asks: [...], checkTitle, checks: [...], next
function EAsk({ s, meta, index, total }) {
  return html`<${Frame} dark=${false}>
    <div style=${pad}>
      <${Head} s=${s} />
      <div style=${{ position: "absolute", left: 0, right: 0, top: s.sub ? 255 : 205, bottom: 0, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 36 }}>
        <${Rise} delay=${14} style=${{ background: NAVY, borderRadius: 18, padding: "40px 44px", color: "#fff", display: "flex", flexDirection: "column" }}>
          <${Tag} color=${C.green}>${s.askTitle}<//>
          ${(s.asks || []).map((a, i) => html`<${Rise} key=${i} delay=${24 + i * 8} style=${{ marginTop: 26, display: "flex", gap: 22 }}>
            <div style=${{ font: `600 30px/1.1 ${HEAD}`, color: C.green, width: 42, flexShrink: 0 }}>${i + 1}</div>
            <div style=${{ font: `500 27px/1.35 ${HEAD}` }}>${a}</div>
          <//>`)}
          ${s.next && html`<div style=${{ marginTop: "auto", paddingTop: 22, borderTop: "1px solid rgba(255,255,255,.15)", font: `400 20px/1.45 ${BODY}`, color: "rgba(255,255,255,.75)" }}>${s.next}</div>`}
        <//>
        <${Rise} delay=${24} style=${{ ...card, padding: "36px 40px" }}>
          <${Tag}>${s.checkTitle}<//>
          ${(s.checks || []).map((c, i) => html`<${Rise} key=${i} delay=${34 + i * 5} y=${8} style=${{ marginTop: 28, display: "flex", gap: 18, alignItems: "flex-start", font: `400 25px/1.4 ${BODY}`, color: INK }}>
            <span style=${{ width: 26, height: 26, borderRadius: 6, border: `2px solid ${BLUE}`, flexShrink: 0, marginTop: 4 }} />
            <span>${c}</span>
          <//>`)}
        <//>
      </div>
    </div>
    <${Footer} index=${index} total=${total} title=${meta.title} />
  <//>`;
}

// ---------- 12. kapanis (lacivert) ----------
function EClosing({ s, meta }) {
  return html`<${Frame} dark=${true}>
    <${Motif} size=${760} x="78%" y="50%" delay=${4} />
    <div style=${{ ...pad, display: "flex", flexDirection: "column", justifyContent: "center" }}>
      <${Logo} width=${190} style=${{ position: "absolute", top: 0, left: 0 }} />
      <${RiseText} text=${s.title} delay=${8} stagger=${3} gradientWords=${s.gradientWords ?? 0}
        style=${{ font: `600 96px/1.05 ${HEAD}`, letterSpacing: "-0.04em", maxWidth: 1100 }} />
      ${s.subtitle && html`<${Fade} delay=${26} style=${{ marginTop: 30, font: `400 30px/1.4 ${BODY}`, color: "rgba(255,255,255,.75)", maxWidth: 1000 }}>${s.subtitle}<//>`}
      <${Fade} delay=${36} style=${{ marginTop: 60, font: `600 26px/1.2 ${HEAD}` }}>${meta.presenter}<//>
    </div>
  <//>`;
}

registerSlideTypes({
  "e-cover": ECover, "e-summary": ESummary, "e-table": ETable, "e-gap": EGap, "e-bridge": EBridge, "e-cards": ECards,
  "e-model": EModel, "e-compare": ECompare, "e-shift": EShift, "e-decline": EDecline, "e-channel": EChannel, "e-stats": EStats, "e-engine": EEngine, "e-timeline": ETimeline, "e-ask": EAsk, "e-closing": EClosing,
});
