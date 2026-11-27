// "cluster" slayt tipleri (corridor stiliyle): PEM Dubai 2026 cluster plan formatinin sayfalari.
// Metinler ve rakamlar sunumun index.html dosyasindaki deck-data blogunda durur.
// Tipler: c-onepage (2027 tek sayfa + rakam tablosu), c-bridge (buyume koprusu), c-actions (aksiyon tablolari),
//         c-needs (organizasyon ve enabler destegi), c-commit (5 atilim taahhudu + ana risk),
//         c-blocks (aksiyonlar: yapi tasi basina bir kart, bolge etiketleri)
import React from "react";
import { useCurrentFrame, interpolate, Easing, spring } from "remotion";
import {
  html, C, HEAD, BODY, clamp, pad, gradText, useSpring, FPS,
  Frame, Footer, Kicker, RiseText, Fade, Logo, registerSlideTypes,
} from "./slides.js";

const fmt = (v, d = 0) => v.toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d });
const glass = { background: "rgba(20,25,34,.9)", border: "1px solid rgba(255,255,255,.12)", borderRadius: 20 };
const muted = "rgba(255,255,255,.66)";
const ease = { ...clamp, easing: Easing.out(Easing.cubic) };
const NEUTRAL = "#C9D4E3"; // bolge disi kartlar: renk = bolge kurali bozulmasin
const ROW_COLORS = [C.green, C.teal, C.amber, C.blueLight, "#FF8FA3"];
const ROW_BG = ["rgba(22,27,36,.94)", "rgba(14,18,25,.94)"]; // opak satirlar: arka plan isik cizgileri yazinin ustunden gecmesin

function useT(delay, dur = 40) {
  const frame = useCurrentFrame();
  return interpolate(frame - delay, [0, dur], [0, 1], ease);
}
function Counter({ to, from = 0, decimals = 0, prefix = "", suffix = "", delay = 0, dur = 45, style }) {
  const p = useT(delay, dur);
  return html`<span style=${{ fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap", ...style }}>${prefix}${fmt(from + (to - from) * p, decimals)}${suffix}</span>`;
}
function Pop({ delay = 0, children, style, y = 34, x = 0 }) {
  const p = useSpring(delay, { damping: 16, stiffness: 110, mass: 0.8 });
  return html`<div style=${{ opacity: Math.min(1, p), transform: `translate(${(1 - p) * x}px, ${(1 - p) * y}px)`, ...style }}>${children}</div>`;
}
function Label({ children, style }) {
  return html`<div style=${{ font: `500 18px/1.2 ${BODY}`, letterSpacing: "0.15em", textTransform: "uppercase", color: muted, ...style }}>${children}</div>`;
}
// [x] gibi doldurulacak yerleri sari gosterir
function Rich({ text }) {
  return String(text ?? "").split(/(\[[^\]]*\])/).map((p, i) => p.startsWith("[")
    ? html`<span key=${i} style=${{ color: C.amber, fontWeight: 600 }}>${p}</span>` : p);
}
// Baslik: yesil "lead" + beyaz devam (format: "Win in Trade: our 2027 actions")
function THead({ s, delay = 0, size = 58 }) {
  const font = `600 ${size}px/1.06 ${HEAD}`;
  return html`<div>
    <${Kicker} text=${s.kicker} delay=${delay + 2} />
    <div style=${{ marginTop: 22, display: "flex", flexWrap: "wrap", columnGap: "0.24em", fontSize: size, maxWidth: s.titleWidth || 1260 }}>
      ${s.lead && html`<${RiseText} text=${s.lead} delay=${delay + 6} stagger=${2} gradientWords=${s.lead.split(/\s+/).length} style=${{ font, letterSpacing: "-0.035em" }} />`}
      <${RiseText} text=${s.title} delay=${delay + 10} stagger=${2} gradientWords=${0} style=${{ font, letterSpacing: "-0.035em" }} />
    </div>
  </div>`;
}
// Sag ustte kaynak / taslak etiketleri
function TopTags({ s }) {
  const tags = [];
  if (s.source) tags.push({ t: s.source, c: C.green });
  if (s.draft) tags.push({ t: s.draft === true ? "Draft for discussion" : s.draft, c: C.amber });
  if (!tags.length) return null;
  return html`<div style=${{ position: "absolute", right: 120, top: 118, display: "flex", gap: 12 }}>
    ${tags.map((g, i) => html`<${Pop} key=${i} delay=${20 + i * 6} y=${-16} style=${{ padding: "9px 18px", borderRadius: 999, border: `1px solid ${g.c}77`,
      background: `${g.c}14`, color: g.c, font: `600 17px/1 ${HEAD}`, letterSpacing: "0.06em", textTransform: "uppercase", whiteSpace: "nowrap" }}>${g.t}<//>`)}
  </div>`;
}

// ---------- c-onepage: 2027 tek sayfada (hedef + 3 oncelik + rakamlar) ----------
// kpis: [{label, lv, target, ambition, change, prefix, suffix, decimals}]
function COnePage({ s, meta, index, total }) {
  const pr = s.priorities || [];
  const rows = s.kpis || [];
  const COLS = [320, 150, 170, 150, 180];
  const cx = (k) => COLS.slice(0, k).reduce((a, b) => a + b, 0) + COLS[k] / 2;
  const x0 = cx(1), x1 = cx(4), xT = cx(2);
  const line = useT(20, 30);
  return html`<${Frame} dark=${true}>
    <div style=${pad}><${THead} s=${s} size=${56} /></div>
    <${TopTags} s=${s} />
    <div style=${{ position: "absolute", left: 120, top: 292, width: 640 }}>
      <${Pop} delay=${14} style=${{ ...glass, padding: "24px 30px 26px 34px", position: "relative", overflow: "hidden" }}>
        <div style=${{ position: "absolute", left: 0, top: 0, bottom: 0, width: 5, background: `linear-gradient(180deg, ${C.green}, ${C.greenLight})`, boxShadow: `0 0 18px ${C.green}` }} />
        <${Label} style=${{ color: C.green }}>${s.ambitionLabel || "Our 2027 ambition"}<//>
        <div style=${{ marginTop: 14, font: `500 26px/1.4 ${HEAD}`, letterSpacing: "-0.01em" }}>${s.ambition}</div>
      <//>
      <${Label} style=${{ marginTop: 38, color: C.green }}>${s.prioritiesLabel || "Three priorities that make our year"}<//>
      <div style=${{ marginTop: 10, height: 2, width: `${line * 100}%`, background: `linear-gradient(90deg, ${C.green}, transparent)` }} />
      ${pr.map((p, i) => html`<${Pop} key=${i} delay=${30 + i * 9} y=${18} style=${{ display: "flex", gap: 20, marginTop: 22 }}>
        <div style=${{ width: 66, flexShrink: 0, font: `600 44px/1 ${HEAD}`, ...gradText(`linear-gradient(120deg, ${C.green}, ${C.greenLight})`) }}>${String(i + 1).padStart(2, "0")}</div>
        <div>
          <div style=${{ font: `600 25px/1.15 ${HEAD}` }}>${p.title}</div>
          <div style=${{ marginTop: 6, font: `400 18px/1.4 ${BODY}`, color: muted }}>${p.text}</div>
        </div>
      <//>`)}
    </div>

    <div style=${{ position: "absolute", left: 830, top: 292, width: 970 }}>
      <${Label} style=${{ color: C.green }}>${s.numbersLabel || "Our numbers"}<//>
      <div style=${{ marginTop: 10, height: 2, width: `${line * 100}%`, background: `linear-gradient(90deg, ${C.green}, transparent)` }} />
      <${Fade} delay=${16} y=${8} style=${{ display: "grid", gridTemplateColumns: COLS.map((c) => c + "px").join(" "), marginTop: 18, font: `600 18px/1.2 ${HEAD}`, color: muted }}>
        ${(s.columns || ["KPI", "2026 LV", "2027 target", "Change", "2029 ambition*"]).map((c, i) => html`<div key=${i} style=${{ textAlign: i ? "center" : "left", paddingLeft: i ? 0 : 22,
          color: i === 2 ? C.green : i === 4 ? NEUTRAL : muted }}>${c}</div>`)}
      <//>
      ${rows.map((r, i) => {
        const d = 24 + i * 9;
        const fill = useT(d + 12, 46);
        const dec = r.decimals ?? 1;
        const val = (v, dl, st) => html`<${Counter} to=${v} decimals=${dec} prefix=${r.prefix || ""} suffix=${r.suffix || ""} delay=${dl} style=${st} />`;
        const litT = interpolate(fill, [(xT - x0) / (x1 - x0) - 0.03, (xT - x0) / (x1 - x0)], [0, 1], clamp);
        const litA = interpolate(fill, [0.95, 1], [0, 1], clamp);
        return html`<${Pop} key=${i} delay=${d} x=${40} y=${0} style=${{ position: "relative", height: 88, marginTop: 10, borderRadius: 16,
            background: i % 2 ? ROW_BG[1] : ROW_BG[0], border: "1px solid rgba(255,255,255,.08)" }}>
          <div style=${{ position: "absolute", left: 22, top: 0, height: 88, width: COLS[0] - 30, display: "flex", alignItems: "center", font: `600 23px/1.2 ${HEAD}` }}>${r.label}</div>
          <div style=${{ position: "absolute", left: x0, top: 14, transform: "translateX(-50%)" }}>${val(r.lv, d + 6, { font: `500 30px/1 ${HEAD}`, color: "rgba(255,255,255,.78)" })}</div>
          <div style=${{ position: "absolute", left: xT, top: 12, transform: "translateX(-50%)" }}>${val(r.target, d + 10, { font: `700 34px/1 ${HEAD}`, color: "#fff" })}</div>
          <div style=${{ position: "absolute", left: cx(3), top: 15, transform: `translateX(-50%) scale(${useSpring(d + 30, { damping: 12, stiffness: 160, mass: 0.6 })})`,
            padding: "5px 12px", borderRadius: 999, background: `${C.green}22`, border: `1px solid ${C.green}77`, color: C.green, font: `600 21px/1.1 ${HEAD}`, whiteSpace: "nowrap" }}>${r.change}</div>
          <div style=${{ position: "absolute", left: x1, top: 14, transform: "translateX(-50%)" }}>${val(r.ambition, d + 16, { font: `600 30px/1 ${HEAD}`, color: NEUTRAL })}</div>
          <div style=${{ position: "absolute", left: x0, top: 64, width: x1 - x0, height: 2, background: "rgba(255,255,255,.12)" }} />
          <div style=${{ position: "absolute", left: x0, top: 63, width: (x1 - x0) * fill, height: 4, borderRadius: 2,
            background: `linear-gradient(90deg, rgba(255,255,255,.4), ${C.green}, ${NEUTRAL})`, boxShadow: `0 0 12px ${C.green}` }} />
          <i style=${{ position: "absolute", left: x0 - 6, top: 59, width: 12, height: 12, borderRadius: "50%", background: "rgba(255,255,255,.7)" }} />
          <i style=${{ position: "absolute", left: xT - 8, top: 57, width: 16, height: 16, borderRadius: "50%", background: litT > 0.5 ? C.green : "rgba(255,255,255,.2)", boxShadow: `0 0 ${18 * litT}px ${C.green}` }} />
          <i style=${{ position: "absolute", left: x1 - 8, top: 57, width: 16, height: 16, borderRadius: "50%", border: `3px solid ${litA > 0.5 ? NEUTRAL : "rgba(255,255,255,.25)"}`, boxShadow: `0 0 ${16 * litA}px ${NEUTRAL}`, boxSizing: "border-box" }} />
        <//>`;
      })}
      <${Fade} delay=${80} y=${8} style=${{ marginTop: 16, font: `400 18px/1.35 ${BODY}`, color: muted }}><${Rich} text=${s.note || "*Not a target, but our realistic ambition"} /><//>
    </div>
    <${Footer} index=${index} total=${total} title=${meta.title} />
  <//>`;
}

// ---------- c-bridge: buyume koprusu (waterfall) 2026 LV -> 2027 -> 2029 ----------
// bars: [{label, value, kind: "total"|"step", hl}] ; axisMin, axisMax ; kpis: [{value, decimals, prefix, suffix, label}]
function CBridge({ s, meta, index, total }) {
  const frame = useCurrentFrame();
  const bars = s.bars || [];
  const min = s.axisMin ?? 0, max = s.axisMax ?? Math.max(...bars.map((b) => b.value)) * 1.08;
  const L = 120, Wd = 1680, top = 300, bottom = 700, H = bottom - top;
  const slot = Wd / bars.length, bw = Math.min(150, slot * 0.56);
  const y = (v) => bottom - ((v - min) / (max - min)) * H;
  let cum = 0;
  const geo = bars.map((b) => {
    let from, to;
    if (b.kind === "total") { from = min; to = b.value; cum = b.value; }
    else { from = cum; to = cum + b.value; cum = to; }
    return { from, to };
  });
  const unit = s.unit || { prefix: "€", suffix: "m" };
  return html`<${Frame} dark=${true}>
    <div style=${pad}><${THead} s=${s} size=${56} /></div>
    <${TopTags} s=${s} />
    <svg width="1920" height="1080" style=${{ position: "absolute", left: 0, top: 0, overflow: "visible", pointerEvents: "none" }}>
      <defs>
        <linearGradient id="brTot" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="rgba(255,255,255,.55)" /><stop offset="1" stopColor="rgba(255,255,255,.12)" /></linearGradient>
        <linearGradient id="brHl" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor=${C.green} /><stop offset="1" stopColor="rgba(0,228,135,.25)" /></linearGradient>
        <linearGradient id="brStep" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor=${NEUTRAL} /><stop offset="1" stopColor="rgba(201,212,227,.28)" /></linearGradient>
        <filter id="brGlow" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="12" /></filter>
      </defs>
      <line x1=${L} x2=${L + Wd} y1=${bottom} y2=${bottom} stroke="rgba(255,255,255,.25)" strokeWidth="2" />
      ${bars.map((b, i) => {
        const g = geo[i];
        const d = 16 + i * 11;
        const p = interpolate(frame - d, [0, 26], [0, 1], ease);
        const x = L + slot * i + (slot - bw) / 2;
        const yTop = y(g.to), yBot = y(g.from);
        const h = (yBot - yTop) * p;
        const isTot = b.kind === "total";
        const fill = b.hl ? "url(#brHl)" : isTot ? "url(#brTot)" : "url(#brStep)";
        const next = geo[i + 1];
        const conn = interpolate(frame - d - 22, [0, 12], [0, 1], clamp);
        return html`<g key=${i}>
          ${b.hl && html`<rect x=${x - 6} y=${yBot - h - 6} width=${bw + 12} height=${h + 6} rx="10" fill=${C.green} opacity=${0.35 * p} filter="url(#brGlow)" />`}
          <rect x=${x} y=${isTot ? yBot - h : yBot - h} width=${bw} height=${Math.max(h, 0)} rx="8" fill=${fill}
            stroke=${b.hl ? C.green : isTot ? "rgba(255,255,255,.35)" : NEUTRAL} strokeWidth="1.5" />
          ${next && html`<line x1=${x + bw} x2=${x + bw + (slot - bw) * conn} y1=${yTop} y2=${yTop} stroke="rgba(255,255,255,.4)" strokeWidth="2" strokeDasharray="6 6" />`}
        </g>`;
      })}
    </svg>
    ${bars.map((b, i) => {
      const g = geo[i];
      const d = 16 + i * 11;
      const x = L + slot * i + slot / 2;
      const isTot = b.kind === "total";
      return html`<div key=${i}>
        <div style=${{ position: "absolute", left: x - 150, width: 300, top: y(g.to) - 52, textAlign: "center", opacity: useT(d + 16, 14) }}>
          ${isTot
            ? html`<${Counter} to=${b.value} decimals=${1} prefix=${unit.prefix} suffix=${unit.suffix} delay=${d + 14} dur=${30}
                style=${{ font: `${b.hl ? 700 : 600} ${b.hl ? 40 : 34}px/1 ${HEAD}`, color: b.hl ? C.green : "#fff" }} />`
            : html`<span style=${{ font: `600 30px/1 ${HEAD}`, color: NEUTRAL }}>+${unit.prefix}${fmt(b.value, 1)}${unit.suffix}</span>`}
        </div>
        <${Fade} delay=${d + 4} y=${10} style=${{ position: "absolute", left: x - 120, width: 240, top: bottom + 16, textAlign: "center",
          font: `${isTot ? 600 : 400} 21px/1.25 ${isTot ? HEAD : BODY}`, color: isTot ? "#fff" : muted }}>${b.label}<//>
      </div>`;
    })}
    ${s.axisNote && html`<${Fade} delay=${30} y=${0} style=${{ position: "absolute", left: 120, top: bottom + 74, font: `400 16px/1 ${BODY}`, color: "rgba(255,255,255,.45)" }}>${s.axisNote}<//>`}
    <div style=${{ position: "absolute", left: 120, right: 120, top: 818, display: "grid", gridTemplateColumns: `repeat(${(s.kpis || []).length || 1}, 1fr)`, gap: 22 }}>
      ${(s.kpis || []).map((k, i) => html`<${Pop} key=${i} delay=${96 + i * 7} style=${{ ...glass, padding: "14px 22px", display: "flex", alignItems: "center", gap: 18 }}>
        <${Counter} to=${k.value} decimals=${k.decimals || 0} prefix=${k.prefix || ""} suffix=${k.suffix || ""} delay=${100 + i * 7}
          style=${{ font: `600 42px/1 ${HEAD}`, color: k.color || C.green }} />
        <span style=${{ font: `400 18px/1.3 ${BODY}`, color: "rgba(255,255,255,.8)" }}>${k.label}</span>
      <//>`)}
    </div>
    <${Footer} index=${index} total=${total} title=${meta.title} />
  <//>`;
}

// ---------- c-actions: "our 2027 actions" tablolari ----------
// rows: [{block, items: [{b, t}], kpis: [...], owner, timing}]
function CActions({ s, meta, index, total }) {
  const frame = useCurrentFrame();
  const rows = s.rows || [];
  const W = s.widths || [250, 970, 320, 70, 70];
  const fs = s.fontSize || 17;
  const grid = W.map((w) => w + "px").join(" ");
  const cols = s.columns || ["Building block", "Initiatives", "KPI and 2027 target", "Owner", "Timing"];
  return html`<${Frame} dark=${true}>
    <div style=${pad}><${THead} s=${s} size=${54} /></div>
    <${TopTags} s=${s} />
    <div style=${{ position: "absolute", left: 120, top: s.top || 238, width: 1680 }}>
      <${Fade} delay=${10} y=${8} style=${{ display: "grid", gridTemplateColumns: grid, padding: "0 0 10px", borderBottom: `2px solid ${C.green}55`,
        font: `600 17px/1.2 ${HEAD}`, letterSpacing: "0.08em", textTransform: "uppercase", color: muted }}>
        ${cols.map((c, i) => html`<div key=${i} style=${{ paddingLeft: i ? 18 : 22 }}>${c}</div>`)}
      <//>
      ${rows.map((r, ri) => {
        const d = 16 + ri * 8;
        const col = ROW_COLORS[ri % ROW_COLORS.length];
        const scan = interpolate(frame - d, [4, 34], [-0.1, 1.1], clamp);
        return html`<${Pop} key=${ri} delay=${d} x=${-50} y=${0} style=${{ position: "relative", display: "grid", gridTemplateColumns: grid, marginTop: s.rowGap || 8, minHeight: s.rowMin || 0,
            borderRadius: 14, overflow: "hidden", background: ri % 2 ? ROW_BG[1] : ROW_BG[0], border: "1px solid rgba(255,255,255,.07)" }}>
          <div style=${{ position: "absolute", top: 0, bottom: 0, left: `${scan * 100}%`, width: 160, transform: "translateX(-50%)", pointerEvents: "none",
            background: `linear-gradient(90deg, transparent, ${col}33, transparent)` }} />
          <div style=${{ position: "relative", padding: "12px 14px 12px 22px", display: "flex", alignItems: "flex-start", gap: 12 }}>
            <i style=${{ position: "absolute", left: 0, top: 0, bottom: 0, width: 4, background: col, boxShadow: `0 0 14px ${col}` }} />
            <div style=${{ font: `600 21px/1.25 ${HEAD}` }}>${r.block}</div>
          </div>
          <div style=${{ padding: "11px 16px 11px 18px" }}>
            ${(r.items || []).map((it, k) => html`<div key=${k} style=${{ display: "flex", gap: 10, marginTop: k ? 4 : 0, font: `400 ${fs}px/1.33 ${BODY}`,
                color: "rgba(255,255,255,.84)", opacity: useT(d + 10 + k * 4, 14) }}>
              <span style=${{ color: col, flexShrink: 0 }}>›</span>
              <span>${it.b && html`<b style=${{ color: "#fff", fontWeight: 600 }}>${it.b}: </b>`}<${Rich} text=${it.t} /></span>
            </div>`)}
          </div>
          <div style=${{ padding: "11px 14px 11px 18px", display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 7 }}>
            ${(r.kpis || []).map((k, i) => html`<${Pop} key=${i} delay=${d + 18 + i * 4} y=${8} style=${{ padding: "5px 12px", borderRadius: 10,
                border: `1px solid ${col}66`, background: `${col}12`, font: `500 ${fs - 1}px/1.3 ${BODY}` }}><${Rich} text=${k} /><//>`)}
          </div>
          ${[r.owner, r.timing].map((v, i) => html`<div key=${i} style=${{ padding: "12px 10px 12px 18px", font: `${v && v !== "TBC" ? 500 : 400} 16px/1.3 ${BODY}`,
            color: v && v !== "TBC" ? "#fff" : "rgba(255,255,255,.4)", fontStyle: v && v !== "TBC" ? "normal" : "italic" }}>${v || "TBC"}</div>`)}
        <//>`;
      })}
    </div>
    <${Footer} index=${index} total=${total} title=${meta.title} />
  <//>`;
}

// ---------- c-needs: organizasyon ve yetkinlikler + enabler destegi ----------
// roles: [{role, from, to, how: ["Hire", ...], note}] ; support: [{name, ask, when}]
function CNeeds({ s, meta, index, total }) {
  const roles = s.roles || [];
  const sup = s.support || [];
  const HOW = s.howOptions || ["Hire", "Redeploy", "Train", "Partner"];
  const COLS = [390, 105, 105, 380];
  const grid = COLS.map((c) => c + "px").join(" ");
  const line = useT(18, 34);
  return html`<${Frame} dark=${true}>
    <div style=${pad}><${THead} s=${s} size=${54} /></div>
    <${TopTags} s=${s} />
    <div style=${{ position: "absolute", left: 120, top: 270, width: 980 }}>
      <${Label} style=${{ color: C.green }}>${s.leftLabel || "Organization and capabilities"}<//>
      <div style=${{ marginTop: 10, height: 2, width: `${line * 100}%`, background: `linear-gradient(90deg, ${C.green}, transparent)` }} />
      <${Fade} delay=${14} y=${8} style=${{ display: "grid", gridTemplateColumns: grid, marginTop: 16, font: `600 17px/1.2 ${HEAD}`, letterSpacing: "0.08em", textTransform: "uppercase", color: muted }}>
        ${["Role or capability", "2026", "2027", "How we close the gap"].map((c, i) => html`<div key=${i} style=${{ paddingLeft: 20, textAlign: i === 1 || i === 2 ? "center" : "left", paddingRight: i === 1 || i === 2 ? 20 : 0 }}>${c}</div>`)}
      <//>
      ${roles.map((r, i) => {
        const d = 20 + i * 8;
        return html`<${Pop} key=${i} delay=${d} x=${-40} y=${0} style=${{ display: "grid", gridTemplateColumns: grid, alignItems: "center", minHeight: 86, marginTop: 9,
            borderRadius: 14, background: i % 2 ? ROW_BG[1] : ROW_BG[0], border: "1px solid rgba(255,255,255,.07)" }}>
          <div style=${{ padding: "10px 20px" }}>
            <div style=${{ font: `600 22px/1.2 ${HEAD}` }}>${r.role}</div>
            ${r.note && html`<div style=${{ marginTop: 4, font: `400 16px/1.3 ${BODY}`, color: muted }}>${r.note}</div>`}
          </div>
          ${[r.from, r.to].map((v, k) => html`<div key=${k} style=${{ textAlign: "center", font: `600 26px/1 ${HEAD}`, color: k ? C.green : "rgba(255,255,255,.75)" }}><${Rich} text=${v ?? "[x]"} /></div>`)}
          <div style=${{ padding: "10px 16px 10px 20px", display: "flex", flexWrap: "wrap", gap: 8 }}>
            ${HOW.map((h, k) => {
              const on = (r.how || []).includes(h);
              const p = useSpring(d + 16 + k * 3, { damping: 14, stiffness: 150, mass: 0.6 });
              return html`<span key=${k} style=${{ padding: "6px 12px", borderRadius: 999, font: `${on ? 600 : 400} 16px/1 ${HEAD}`, transform: `scale(${0.7 + 0.3 * p})`, opacity: p,
                color: on ? C.ink : "rgba(255,255,255,.35)", background: on ? C.green : "transparent", border: `1px solid ${on ? C.green : "rgba(255,255,255,.16)"}`,
                boxShadow: on ? `0 0 14px ${C.green}66` : "none" }}>${h}</span>`;
            })}
          </div>
        <//>`;
      })}
    </div>
    <div style=${{ position: "absolute", left: 1160, top: 270, width: 640 }}>
      <${Label} style=${{ color: C.green }}>${s.rightLabel || "Support we need from the enablers"}<//>
      <div style=${{ marginTop: 10, height: 2, width: `${line * 100}%`, background: `linear-gradient(90deg, ${C.green}, transparent)` }} />
      ${sup.map((c, i) => {
        const d = 34 + i * 9;
        const col = ROW_COLORS[(i + 1) % ROW_COLORS.length];
        return html`<${Pop} key=${i} delay=${d} x=${40} y=${0} style=${{ ...glass, position: "relative", overflow: "hidden", marginTop: 16, padding: "18px 24px 18px 28px" }}>
          <i style=${{ position: "absolute", left: 0, top: 0, bottom: 0, width: 4, background: col, boxShadow: `0 0 14px ${col}` }} />
          <div style=${{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 14 }}>
            <div style=${{ font: `600 22px/1.2 ${HEAD}`, color: col }}>${c.name}</div>
            ${c.when && html`<span style=${{ padding: "5px 12px", borderRadius: 999, border: `1px solid ${C.amber}77`, background: "rgba(255,181,71,.1)", color: C.amber, font: `600 16px/1 ${HEAD}`, whiteSpace: "nowrap" }}>${c.when}</span>`}
          </div>
          <div style=${{ marginTop: 8, font: `400 19px/1.38 ${BODY}`, color: "rgba(255,255,255,.86)" }}><${Rich} text=${c.ask} /></div>
        <//>`;
      })}
    </div>
    <${Footer} index=${index} total=${total} title=${meta.title} />
  <//>`;
}

// ---------- c-commit: 5 atilim taahhudu (bugun -> 2029) + ana risk ----------
// items: [{title, text, from, to, impact, owner}] ; risk: {label, text}
function CCommit({ s, meta, index, total }) {
  const frame = useCurrentFrame();
  const items = s.items || [];
  const COLS = [86, 600, 560, 250, 184];
  const grid = COLS.map((c) => c + "px").join(" ");
  return html`<${Frame} dark=${true}>
    <div style=${pad}><${THead} s=${s} size=${54} /></div>
    <${TopTags} s=${s} />
    <div style=${{ position: "absolute", left: 120, top: 236, width: 1680 }}>
      <${Fade} delay=${10} y=${8} style=${{ display: "grid", gridTemplateColumns: grid, paddingBottom: 10, borderBottom: `2px solid ${C.green}55`,
        font: `600 17px/1.2 ${HEAD}`, letterSpacing: "0.08em", textTransform: "uppercase", color: muted }}>
        ${(s.columns || ["#", "Breakthrough commitment", "Step change: today → 2029", "Impact by 2029", "Owner"]).map((c, i) => html`<div key=${i} style=${{ paddingLeft: i ? 18 : 30 }}>${c}</div>`)}
      <//>
      ${items.map((it, i) => {
        const d = 18 + i * 10;
        const arrow = interpolate(frame - d - 14, [0, 26], [0, 1], ease);
        const lit = interpolate(arrow, [0.85, 1], [0, 1], clamp);
        const col = ROW_COLORS[i % ROW_COLORS.length];
        return html`<${Pop} key=${i} delay=${d} x=${-50} y=${0} style=${{ display: "grid", gridTemplateColumns: grid, alignItems: "center", minHeight: 100, marginTop: 9,
            borderRadius: 16, background: i % 2 ? ROW_BG[1] : ROW_BG[0], border: "1px solid rgba(255,255,255,.07)" }}>
          <div style=${{ display: "grid", placeItems: "center" }}>
            <div style=${{ width: 50, height: 50, borderRadius: "50%", display: "grid", placeItems: "center", border: `2px solid ${col}`, color: col,
              font: `700 24px/1 ${HEAD}`, boxShadow: `0 0 ${16 * lit}px ${col}` }}>${i + 1}</div>
          </div>
          <div style=${{ padding: "12px 18px" }}>
            <div style=${{ font: `600 24px/1.2 ${HEAD}` }}><${Rich} text=${it.title} /></div>
            ${it.text && html`<div style=${{ marginTop: 5, font: `400 17px/1.35 ${BODY}`, color: muted }}><${Rich} text=${it.text} /></div>`}
          </div>
          <div style=${{ padding: "12px 18px", display: "flex", alignItems: "center", gap: 0 }}>
            <span style=${{ padding: "8px 14px", borderRadius: 12, border: "1px solid rgba(255,255,255,.2)", font: `500 19px/1.2 ${HEAD}`, color: "rgba(255,255,255,.8)", whiteSpace: "nowrap", maxWidth: 210, overflow: "hidden", textOverflow: "ellipsis" }}><${Rich} text=${it.from} /></span>
            <div style=${{ position: "relative", flex: 1, height: 4, margin: "0 10px", minWidth: 40 }}>
              <div style=${{ position: "absolute", left: 0, top: 0, height: 4, width: `${arrow * 100}%`, borderRadius: 2, background: `linear-gradient(90deg, rgba(255,255,255,.3), ${col})`, boxShadow: `0 0 10px ${col}` }} />
              <div style=${{ position: "absolute", left: `${arrow * 100}%`, top: -7, width: 0, height: 0, borderTop: "9px solid transparent", borderBottom: "9px solid transparent",
                borderLeft: `14px solid ${col}`, transform: "translateX(-4px)", opacity: arrow }} />
            </div>
            <span style=${{ padding: "8px 14px", borderRadius: 12, border: `1px solid ${col}`, background: `${col}${lit > 0.5 ? "26" : "08"}`, font: `600 19px/1.2 ${HEAD}`,
              color: "#fff", whiteSpace: "nowrap", boxShadow: `0 0 ${18 * lit}px ${col}55` }}><${Rich} text=${it.to} /></span>
          </div>
          <div style=${{ padding: "12px 18px", font: `600 22px/1.25 ${HEAD}`, color: col, opacity: useT(d + 34, 16) }}><${Rich} text=${it.impact} /></div>
          <div style=${{ padding: "12px 18px", font: `400 17px/1.3 ${BODY}`, color: it.owner && !/^\[/.test(it.owner) ? "#fff" : "rgba(255,255,255,.45)", fontStyle: "italic" }}>${it.owner || "[Name]"}</div>
        <//>`;
      })}
      ${s.risk && html`<${Pop} delay=${80} y=${20} style=${{ marginTop: 16, padding: "16px 26px", borderRadius: 16, border: `1px solid ${C.amber}66`,
          background: "linear-gradient(90deg, rgba(255,181,71,.14), rgba(255,181,71,.04))", display: "flex", gap: 18, alignItems: "baseline" }}>
        <span style=${{ font: `600 21px/1.3 ${HEAD}`, color: C.amber, whiteSpace: "nowrap" }}>${s.risk.label || "Main risk and how we manage it"}:</span>
        <span style=${{ font: `400 19px/1.4 ${BODY}`, color: "rgba(255,255,255,.9)" }}><${Rich} text=${s.risk.text} /></span>
      <//>`}
    </div>
    <${Footer} index=${index} total=${total} title=${meta.title} />
  <//>`;
}

// ---------- c-blocks: aksiyonlar, yapi tasi basina bir isik karti ----------
// blocks: [{name, sub, icon, items: [{r: ["RoME","TR-RCA"], t}], kpis: [...], owner, timing}]
const REGION = { "RoME": C.teal, "Pakistan": C.teal, "TR-RCA": C.green, "Türkiye": C.green, "Central Asia": C.green, "Caucasus": C.green, "KSA": C.amber, "Africa": "#FF8FA3", "Egypt": "#FF8FA3", "METAP": C.blueLight };
const ICONS = {
  box: ["M5 10 L16 4 L27 10 V22 L16 28 L5 22 Z", "M5 10 L16 16 L27 10", "M16 16 V28"],
  tag: ["M4 16 L16 4 H28 V16 L16 28 Z", "M22 10 m-2.4 0 a2.4 2.4 0 1 0 4.8 0 a2.4 2.4 0 1 0 -4.8 0"],
  pin: ["M16 29 C16 29 7 21 7 14 A9 9 0 0 1 25 14 C25 21 16 29 16 29 Z", "M16 14 m-3 0 a3 3 0 1 0 6 0 a3 3 0 1 0 -6 0"],
  megaphone: ["M4 13 V19 H9 L21 25 V7 L9 13 Z", "M25 12 A5 5 0 0 1 25 20", "M9 19 L11 27 H14 L13 20"],
  people: ["M11 11 m-4 0 a4 4 0 1 0 8 0 a4 4 0 1 0 -8 0", "M22 11 m-4 0 a4 4 0 1 0 8 0 a4 4 0 1 0 -8 0", "M3 27 C3 22 7 19 11 19 S19 22 19 27", "M15 21 C16.5 19.7 19 19 22 19 C26 19 29 22 29 27"],
  target: ["M16 16 m-12 0 a12 12 0 1 0 24 0 a12 12 0 1 0 -24 0", "M16 16 m-6.5 0 a6.5 6.5 0 1 0 13 0 a6.5 6.5 0 1 0 -13 0", "M16 16 L28 4", "M23 4 H28 V9"],
  blueprint: ["M4 6 H28 V26 H4 Z", "M4 13 H28", "M12 6 V26", "M17 18 H24", "M17 22 H21"],
  link: ["M12 16 m-7 0 a7 7 0 1 0 14 0 a7 7 0 1 0 -14 0", "M20 16 m-7 0 a7 7 0 1 0 14 0 a7 7 0 1 0 -14 0"],
  bulb: ["M16 4 A8 8 0 0 0 11 18 C12 19.5 12.5 21 12.5 23 H19.5 C19.5 21 20 19.5 21 18 A8 8 0 0 0 16 4 Z", "M13 27 H19"],
};
function Icon({ name, color, size = 32, p = 1 }) {
  return html`<svg width=${size} height=${size} viewBox="0 0 32 32" fill="none" stroke=${color} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
    ${(ICONS[name] || ICONS.box).map((d, i) => html`<path key=${i} d=${d} pathLength="1" strokeDasharray="1" strokeDashoffset=${1 - p} />`)}
  </svg>`;
}

Object.assign(ICONS, {
  chart: ["M4 26 H28", "M8 22 V16", "M14 22 V11", "M20 22 V14", "M26 22 V7"],
  spark: ["M16 4 L18.5 13.5 L28 16 L18.5 18.5 L16 28 L13.5 18.5 L4 16 L13.5 13.5 Z"],
  shield: ["M16 3 L27 7 V15 C27 22 22 26 16 29 C10 26 5 22 5 15 V7 Z", "M11 16 L15 20 L22 12"],
  globe: ["M16 16 m-12 0 a12 12 0 1 0 24 0 a12 12 0 1 0 -24 0", "M4 16 H28", "M16 4 C12 8 12 24 16 28", "M16 4 C20 8 20 24 16 28"],
  heart: ["M16 27 C6 20 4 15 4 11 A6 6 0 0 1 16 9 A6 6 0 0 1 28 11 C28 15 26 20 16 27 Z"],
});
const SEC = ({ text, color, style }) => html`<div style=${{ font: `600 12.5px/1 ${HEAD}`, letterSpacing: "0.16em", color: color || "rgba(255,255,255,.5)", textTransform: "uppercase", ...style }}>${text}</div>`;
function Chips({ list = [] }) {
  if (!list.length) return null;
  return html`<div style=${{ display: "flex", flexWrap: "wrap", gap: 5, marginBottom: 5 }}>
    ${list.map((r, j) => { const rc = REGION[r] || "rgba(255,255,255,.72)"; return html`<span key=${j} style=${{ padding: "3px 8px", borderRadius: 6, font: `600 12.5px/1.15 ${HEAD}`,
      letterSpacing: "0.06em", textTransform: r === "RoME" ? "none" : "uppercase", color: rc, background: `${rc}1a`, border: `1px solid ${rc}55`, whiteSpace: "nowrap" }}>${r}</span>`; })}
  </div>`;
}

// Kart: { name, sub, icon, color, badge, must, items: [{r, t}], next, kpis, kpiLabel, owner, timing }
function CBlocks({ s, meta, index, total }) {
  const frame = useCurrentFrame();
  const blocks = s.blocks || [];
  const gap = 18;
  const fs = s.fontSize || 15.5;
  const L = { must: "Must-do", moves: "Our moves", next: "Next level", ...(s.labels || {}) };
  const H = s.height || 660;
  return html`<${Frame} dark=${true}>
    <div style=${pad}><${THead} s=${s} size=${54} /></div>
    <${TopTags} s=${s} />
    <div style=${{ position: "absolute", left: 120, top: s.top || 230, width: 1680, height: H, display: "flex", gap }}>
      ${blocks.map((b, i) => {
        const col = b.color || NEUTRAL;
        const d = 12 + i * 7;
        const rise = spring({ frame: frame - d, fps: FPS, config: { damping: 18, stiffness: 80 } });
        const beam = interpolate(frame - d, [8, 48], [0, 1], ease);
        const breathe = 0.75 + 0.25 * Math.sin(frame / 22 + i);
        const showKpi = (b.kpis || []).length > 0;
        const t0 = d + 16;
        return html`<div key=${i} style=${{ position: "relative", flex: b.flex || 1, minWidth: 0, height: "100%", borderRadius: 22, overflow: "hidden",
            background: "linear-gradient(180deg, rgba(26,32,43,.96), rgba(12,15,21,.96))", border: `1px solid ${col}${b.hl ? "aa" : "40"}`,
            boxShadow: b.hl ? `0 0 ${30 * breathe}px ${col}33` : "none",
            opacity: Math.min(1, rise * 1.3), transform: `translateY(${(1 - rise) * 70}px)`, display: "flex", flexDirection: "column", padding: "20px 20px 14px" }}>
          <div style=${{ position: "absolute", left: 0, right: 0, top: 0, height: 210, pointerEvents: "none", opacity: breathe,
            background: `radial-gradient(ellipse 90% 100% at 50% 0%, ${col}${b.hl ? "44" : "2e"}, transparent 72%)` }} />
          <div style=${{ position: "absolute", left: 0, top: 0, width: 3, height: `${beam * 100}%`, background: `linear-gradient(180deg, ${col}, transparent)`, boxShadow: `0 0 14px ${col}` }} />
          <div style=${{ position: "relative", display: "flex", alignItems: "center", gap: 14 }}>
            <div style=${{ width: 56, height: 56, flexShrink: 0, borderRadius: 17, display: "grid", placeItems: "center", background: `${col}17`, border: `1px solid ${col}88`,
              boxShadow: `0 0 ${22 * beam}px ${col}55` }}><${Icon} name=${b.icon} color=${col} p=${interpolate(frame - d, [6, 36], [0, 1], ease)} /></div>
            <div style=${{ minWidth: 0 }}>
              ${!s.noNumbers && html`<div style=${{ font: `600 14px/1 ${HEAD}`, letterSpacing: "0.14em", color: col }}>${String(i + 1).padStart(2, "0")}</div>`}
              <div style=${{ marginTop: s.noNumbers ? 0 : 5, font: `600 ${b.nameSize || 23}px/1.06 ${HEAD}`, letterSpacing: "-0.02em" }}>${b.name}</div>
              ${b.sub && html`<div style=${{ marginTop: 4, font: `400 14.5px/1.2 ${BODY}`, color: muted }}>${b.sub}</div>`}
            </div>
          </div>
          ${b.badge && html`<div style=${{ position: "relative", marginTop: 14, alignSelf: "flex-start", padding: "6px 14px", borderRadius: 999, background: `${col}22`, border: `1px solid ${col}`,
            color: col, font: `700 15px/1 ${HEAD}`, letterSpacing: "0.12em", textTransform: "uppercase", transform: `scale(${useSpring(d + 24, { damping: 12, stiffness: 160, mass: 0.6 })})`, transformOrigin: "left center" }}>${b.badge}</div>`}
          <div style=${{ position: "relative", margin: "14px 0 12px", height: 1, flexShrink: 0, background: `linear-gradient(90deg, ${col}88, transparent)` }} />
          <div style=${{ position: "relative", flex: 1, minHeight: 0, display: "flex", flexDirection: "column", gap: 10 }}>
            ${b.must && html`<div style=${{ opacity: useT(t0, 16) }}>
              <${SEC} text=${L.must} />
              <div style=${{ marginTop: 5, font: `400 ${fs - 1}px/1.32 ${BODY}`, color: "rgba(255,255,255,.7)" }}>${b.must}</div>
            </div>`}
            ${b.must && (b.items || []).length > 0 && html`<${SEC} text=${L.moves} color=${col} style=${{ marginTop: 2 }} />`}
            ${(b.items || []).map((it, k) => html`<div key=${k} style=${{ opacity: useT(t0 + 6 + k * 5, 16), transform: `translateY(${(1 - useT(t0 + 6 + k * 5, 16)) * 10}px)` }}>
              <${Chips} list=${it.r} />
              <div style=${{ font: `${it.b ? 500 : 400} ${fs}px/1.32 ${BODY}`, color: it.b ? "#fff" : "rgba(255,255,255,.9)" }}><${Rich} text=${it.t} /></div>
            </div>`)}
            ${b.next && html`<div style=${{ marginTop: "auto", paddingTop: 4, opacity: useT(t0 + 26, 16) }}>
              <${SEC} text=${L.next} />
              <div style=${{ marginTop: 5, font: `italic 400 ${fs - 1.5}px/1.3 ${BODY}`, color: "rgba(255,255,255,.55)" }}>${b.next}</div>
            </div>`}
          </div>
          ${s.watermark && !b.stats && html`<div style=${{ position: "absolute", right: -18, bottom: -18, opacity: 0.1 + 0.04 * breathe, pointerEvents: "none" }}>
            <${Icon} name=${b.icon} color=${col} size=${230} p=${interpolate(frame - d, [20, 70], [0, 1], ease)} /></div>`}
          ${b.stats && html`<div style=${{ position: "relative", marginTop: 12, flexShrink: 0, borderTop: `1px solid ${col}55`, paddingTop: 14 }}>
            <${SEC} text=${b.statsLabel || ""} color=${col} />
            <div style=${{ marginTop: 12, display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px 14px" }}>
              ${b.stats.map((st, j) => html`<div key=${j} style=${{ opacity: useT(d + 36 + j * 6, 14) }}>
                <${Counter} to=${st.value} decimals=${st.decimals ?? 1} prefix=${st.prefix ?? "+"} suffix=${st.suffix ?? "%"} delay=${d + 36 + j * 6} dur=${40}
                  style=${{ font: `700 42px/1 ${HEAD}`, letterSpacing: "-0.03em", color: col, textShadow: `0 0 24px ${col}66` }} />
                <div style=${{ marginTop: 6, font: `500 15px/1.25 ${BODY}`, color: "rgba(255,255,255,.82)" }}>${st.label}</div>
              </div>`)}
            </div>
          </div>`}
          ${showKpi && html`<div style=${{ position: "relative", borderTop: "1px solid rgba(255,255,255,.1)", paddingTop: 11, marginTop: 12, flexShrink: 0 }}>
            <${SEC} text=${b.kpiLabel || s.kpiLabel || "KPI · 2027 standard / target"} color=${col} />
            <div style=${{ marginTop: 8, display: "flex", flexWrap: "wrap", gap: 6 }}>
              ${(b.kpis || []).map((k, j) => html`<${Pop} key=${j} delay=${d + 40 + j * 4} y=${8} style=${{ padding: "4px 9px", borderRadius: 8, border: `1px solid ${col}66`,
                background: `${col}12`, font: `500 14px/1.25 ${BODY}` }}><${Rich} text=${k} /><//>`)}
            </div>
          </div>`}
          ${b.foot && html`<div style=${{ position: "relative", marginTop: 10, flexShrink: 0, paddingTop: 10, borderTop: "1px solid rgba(255,255,255,.08)", font: `400 13.5px/1.35 ${BODY}`, color: "rgba(255,255,255,.45)", opacity: useT(d + 40, 16) }}>${b.foot}</div>`}
          ${!s.noOwner && html`<div style=${{ position: "relative", marginTop: 9, flexShrink: 0, font: `400 13px/1.25 ${BODY}`, color: "rgba(255,255,255,.5)" }}>
            <span style=${{ color: "rgba(255,255,255,.75)" }}>${b.owner || "Owner TBC"}</span>${b.timing ? html` · ${b.timing}` : ""}</div>`}
        </div>`;
      })}
    </div>
    ${s.note && html`<${Fade} delay=${70} y=${0} style=${{ position: "absolute", left: 120, right: 120, top: (s.top || 230) + H + 12, font: `400 15px/1.3 ${BODY}`, color: "rgba(255,255,255,.45)" }}><${Rich} text=${s.note} /><//>`}
    <${Footer} index=${index} total=${total} title=${meta.title} />
  <//>`;
}

// ---------- medya: yerelde dogrudan, yayinda (.enc) indirilip tarayicida cozulur ----------
const DECK = JSON.parse(document.getElementById("deck-data")?.textContent || "{}");
const MKEY = DECK.mediaKey || "";
const mcache = new Map();
let mcrypto = null;
function loadMedia(src) {
  if (!MKEY || /^data:/.test(src)) return Promise.resolve(src); // sifreleme gorseli sayfaya gomduyse dogrudan kullan
  if (!mcache.has(src)) mcache.set(src, (async () => {
    const r = await fetch(src + ".enc");
    if (!r.ok) throw new Error("medya yok: " + src);
    const buf = await r.arrayBuffer();
    mcrypto = mcrypto || await crypto.subtle.importKey("raw", Uint8Array.from(MKEY.match(/../g).map((b) => parseInt(b, 16))), "AES-GCM", false, ["decrypt"]);
    const plain = await crypto.subtle.decrypt({ name: "AES-GCM", iv: buf.slice(0, 12) }, mcrypto, buf.slice(12));
    return URL.createObjectURL(new Blob([plain], { type: /\.png$/i.test(src) ? "image/png" : "image/jpeg" }));
  })());
  return mcache.get(src);
}
function useMedia(src) {
  const [url, setUrl] = React.useState(() => (src && (!MKEY || /^data:/.test(src)) ? src : null));
  React.useEffect(() => {
    let live = true;
    if (src) loadMedia(src).then((u) => { if (live) setUrl(u); }).catch((e) => console.error(e));
    return () => { live = false; };
  }, [src]);
  return url;
}
if (DECK.style === "corridor") JSON.stringify(DECK.slides || []).replace(/"(medya\/[^"]+)"/g, (_, src) => { loadMedia(src).catch(() => {}); });

// ---------- c-hero: F1 araci ile kapak (isik suzulerek acilir, arac kayarak yerine oturur) ----------
function CHero({ s, meta }) {
  const frame = useCurrentFrame();
  const img = useMedia(s.image);
  const reveal = interpolate(frame, [2, 44], [0, 100], { ...clamp, easing: Easing.inOut(Easing.cubic) });
  const zoom = interpolate(frame, [0, 96], [1.12, 1], { ...clamp, easing: Easing.out(Easing.cubic) }) + interpolate(frame, [96, 900], [0, 0.035], clamp);
  const shift = interpolate(frame, [0, 96], [120, 0], { ...clamp, easing: Easing.out(Easing.cubic) });
  const sweep = interpolate(frame, [50, 120], [-25, 125], clamp);
  const ox = 1056, oy = 648;
  const lp = s.logoSpot || { x: 774, y: 665 };
  const lx = ox + (lp.x - ox) * zoom + shift, ly = oy + (lp.y - oy) * zoom;
  const ring = Math.max(0, frame - 100) % 75 / 75;
  const ringOn = interpolate(frame, [96, 112], [0, 1], clamp);
  const route = s.route || [];
  const line = interpolate(frame, [70, 140], [0, 1], { ...clamp, easing: Easing.inOut(Easing.cubic) });
  return html`<${Frame} dark=${true} ambient=${false}>
    <div style=${{ position: "absolute", inset: 0, background: "#04080a" }} />
    <div style=${{ position: "absolute", inset: 0, overflow: "hidden", clipPath: `inset(0 ${100 - reveal}% 0 0)` }}>
      ${img && html`<img src=${img} style=${{ position: "absolute", left: 0, top: 0, width: 1920, height: 1080, objectFit: "cover",
        transformOrigin: `${ox}px ${oy}px`, transform: `translateX(${shift}px) scale(${zoom})` }} />`}
      <div style=${{ position: "absolute", inset: 0, mixBlendMode: "screen", pointerEvents: "none",
        background: `linear-gradient(104deg, transparent ${sweep - 9}%, rgba(170,255,230,.16) ${sweep}%, transparent ${sweep + 9}%)` }} />
    </div>
    ${reveal < 99.5 && html`<div style=${{ position: "absolute", top: 0, bottom: 0, left: `${reveal}%`, width: 3, transform: "translateX(-1px)",
      background: `linear-gradient(180deg, transparent, ${C.green}, ${C.greenLight}, transparent)`, boxShadow: `0 0 40px 8px ${C.green}88` }} />`}
    <div style=${{ position: "absolute", inset: 0, pointerEvents: "none",
      background: "radial-gradient(ellipse 70% 60% at 18% 22%, rgba(0,0,0,.55), transparent 70%), linear-gradient(0deg, rgba(0,0,0,.78) 0%, rgba(0,0,0,0) 26%)" }} />
    ${[0, 1, 2, 3, 4, 5].map((k) => {
      const sp = 9 + k * 3.2;
      const x = ((frame * sp + k * 410) % 2600) - 400;
      return html`<div key=${k} style=${{ position: "absolute", left: x, top: 772 + k * 19, width: 260 + k * 40, height: 2, borderRadius: 2, opacity: 0.22 * line,
        background: `linear-gradient(90deg, transparent, ${k % 2 ? "#ffffff" : C.green}, transparent)` }} />`;
    })}
    <div style=${{ position: "absolute", left: lx - 80, top: ly - 32, width: 160, height: 64, borderRadius: "50%", pointerEvents: "none",
      border: `2px solid ${C.green}`, opacity: ringOn * (1 - ring) * 0.9, transform: `scale(${0.7 + ring * 0.9})`, boxShadow: `0 0 24px ${C.green}` }} />
    <div style=${{ position: "absolute", left: lx - 70, top: ly - 22, width: 140, height: 44, borderRadius: "50%", pointerEvents: "none",
      background: `radial-gradient(ellipse, ${C.green}55, transparent 70%)`, opacity: ringOn * (0.55 + 0.45 * Math.sin(frame / 9)), mixBlendMode: "screen" }} />

    <div style=${{ position: "absolute", left: 120, top: 70 }}><${Fade} delay=${30} y=${-10}><${Logo} width=${150} /><//></div>
    <div style=${{ position: "absolute", left: 120, top: 158, width: 1700 }}>
      <${Kicker} text=${s.kicker} delay=${34} />
      <div style=${{ position: "relative", marginTop: 24 }}>
        <${RiseText} text=${s.title} delay=${40} stagger=${5} gradientWords=${s.gradientWords ?? 1} style=${{ font: `700 140px/0.95 ${HEAD}`, letterSpacing: "-0.05em" }} />
      </div>
      <${Fade} delay=${58} style=${{ marginTop: 26, font: `italic 400 36px/1.3 ${BODY}`, color: "rgba(255,255,255,.85)" }}>${s.subtitle}<//>
    </div>
    <div style=${{ position: "absolute", left: 120, right: 120, bottom: 148, height: 60 }}>
      <div style=${{ position: "absolute", left: 0, right: 0, top: 9, height: 2, background: "rgba(255,255,255,.12)" }} />
      <div style=${{ position: "absolute", left: 0, top: 8, height: 4, width: `${line * 100}%`, borderRadius: 4, background: `linear-gradient(90deg, ${C.green}, ${C.greenLight})`, boxShadow: `0 0 18px ${C.green}` }} />
      ${route.map((r, i) => {
        const at = route.length > 1 ? i / (route.length - 1) : 0;
        const lit = interpolate(line, [at - 0.04, at], [0, 1], clamp);
        const edge = i === 0 ? "flex-start" : i === route.length - 1 ? "flex-end" : "center";
        return html`<div key=${i} style=${{ position: "absolute", left: `${at * 100}%`, top: 0, transform: `translateX(${i === 0 ? 0 : i === route.length - 1 ? -100 : -50}%)`, display: "flex", flexDirection: "column", alignItems: edge }}>
          <div style=${{ width: 20, height: 20, borderRadius: "50%", display: "grid", placeItems: "center", background: `rgba(0,228,135,${0.18 * lit})` }}>
            <div style=${{ width: 10, height: 10, borderRadius: "50%", background: lit > 0.5 ? "#fff" : "rgba(255,255,255,.3)", boxShadow: `0 0 ${16 * lit}px ${C.green}` }} />
          </div>
          <span style=${{ marginTop: 10, font: `500 21px/1 ${HEAD}`, letterSpacing: "0.04em", color: `rgba(255,255,255,${0.35 + 0.65 * lit})`, whiteSpace: "nowrap" }}>${r}</span>
        </div>`;
      })}
    </div>
    <${Fade} delay=${70} style=${{ position: "absolute", left: 120, right: 120, bottom: 56, display: "flex", gap: 40, alignItems: "baseline", font: `400 23px/1.3 ${BODY}`, color: "rgba(255,255,255,.7)" }}>
      <span><span style=${{ font: `600 25px/1.2 ${HEAD}`, color: "#fff" }}>${s.leadLabel || "Cluster lead"}: </span><span style=${{ font: `500 25px/1.2 ${HEAD}`, color: "#fff" }}>${s.presenter || meta.presenter}</span></span>
      ${s.date && html`<span style=${{ color: C.green }}>${s.date}</span>`}
    <//>
  <//>`;
}

// ---------- c-support: neye ihtiyacimiz var (yetkinlik kartlari + enabler destekleri) ----------
// roles: [{name, icon, need, items: [{r, t}]}] ; support: [{name, ask, when}]
function CSupport({ s, meta, index, total }) {
  const frame = useCurrentFrame();
  const roles = s.roles || [], sup = s.support || [];
  return html`<${Frame} dark=${true}>
    <div style=${pad}><${THead} s=${s} size=${52} /></div>
    <${TopTags} s=${s} />
    <${Fade} delay=${8} y=${6} style=${{ position: "absolute", left: 120, top: 248 }}><${SEC} text=${s.leftLabel || "Organization and capabilities · 2027 need"} color=${C.green} style=${{ fontSize: 15 }} /><//>
    <div style=${{ position: "absolute", left: 120, top: 276, width: 1680, height: 320, display: "flex", gap: 16 }}>
      ${roles.map((b, i) => {
        const col = b.color || NEUTRAL;
        const d = 12 + i * 6;
        const rise = spring({ frame: frame - d, fps: FPS, config: { damping: 18, stiffness: 80 } });
        const beam = interpolate(frame - d, [8, 44], [0, 1], ease);
        return html`<div key=${i} style=${{ position: "relative", flex: 1, minWidth: 0, borderRadius: 20, overflow: "hidden", padding: "18px 18px 14px",
            background: "linear-gradient(180deg, rgba(26,32,43,.96), rgba(12,15,21,.96))", border: `1px solid ${col}44`,
            opacity: Math.min(1, rise * 1.3), transform: `translateY(${(1 - rise) * 60}px)` }}>
          <div style=${{ position: "absolute", left: 0, right: 0, top: 0, height: 150, background: `radial-gradient(ellipse 90% 100% at 50% 0%, ${col}2a, transparent 72%)` }} />
          <div style=${{ position: "absolute", left: 0, top: 0, width: 3, height: `${beam * 100}%`, background: `linear-gradient(180deg, ${col}, transparent)` }} />
          <div style=${{ position: "relative", display: "flex", alignItems: "center", gap: 12 }}>
            <div style=${{ width: 46, height: 46, flexShrink: 0, borderRadius: 14, display: "grid", placeItems: "center", background: `${col}17`, border: `1px solid ${col}88` }}>
              <${Icon} name=${b.icon} color=${col} size=${26} p=${beam} /></div>
            <div style=${{ font: `600 21px/1.1 ${HEAD}` }}>${b.name}</div>
          </div>
          <div style=${{ position: "relative", marginTop: 14, padding: "10px 12px", borderRadius: 12, background: `${col}14`, border: `1px solid ${col}55`, opacity: useT(d + 14, 16) }}>
            <${SEC} text="2027 need" color=${col} />
            <div style=${{ marginTop: 5, font: `600 18px/1.25 ${HEAD}` }}>${b.need}</div>
          </div>
          <div style=${{ position: "relative", marginTop: 12 }}>
            <${SEC} text=${s.itemsLabel || "How we close the gap"} />
            ${(b.items || []).map((it, k) => html`<div key=${k} style=${{ marginTop: 8, opacity: useT(d + 20 + k * 5, 14) }}>
              <${Chips} list=${it.r} /><div style=${{ font: `400 15px/1.3 ${BODY}`, color: "rgba(255,255,255,.88)" }}><${Rich} text=${it.t} /></div></div>`)}
          </div>
        </div>`;
      })}
    </div>
    <${Fade} delay=${40} y=${6} style=${{ position: "absolute", left: 120, top: 616 }}><${SEC} text=${s.rightLabel || "Support we need from the enablers"} color=${NEUTRAL} style=${{ fontSize: 15 }} /><//>
    <div style=${{ position: "absolute", left: 120, top: 644, width: 1680, height: 200, display: "flex", gap: 16 }}>
      ${sup.map((c, i) => {
        const d = 46 + i * 7;
        const sweep = interpolate(frame - d, [6, 40], [0, 1], ease);
        return html`<${Pop} key=${i} delay=${d} style=${{ position: "relative", flex: 1, minWidth: 0, borderRadius: 18, overflow: "hidden", padding: "16px 20px",
            background: "rgba(22,27,36,.94)", border: `1px solid ${NEUTRAL}44` }}>
          <div style=${{ position: "absolute", left: 0, top: 0, height: 3, width: `${sweep * 100}%`, background: `linear-gradient(90deg, transparent, ${NEUTRAL})`, boxShadow: `0 0 16px ${NEUTRAL}` }} />
          <div style=${{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
            <div style=${{ font: `600 19px/1.15 ${HEAD}`, color: NEUTRAL }}>${c.name}</div>
            ${c.when && html`<span style=${{ padding: "5px 11px", borderRadius: 999, background: `${NEUTRAL}22`, border: `1px solid ${NEUTRAL}88`, color: NEUTRAL, font: `700 15px/1 ${HEAD}`, whiteSpace: "nowrap" }}>${c.when}</span>`}
          </div>
          <div style=${{ marginTop: 10, font: `400 16.5px/1.38 ${BODY}`, color: "rgba(255,255,255,.88)" }}><${Rich} text=${c.ask} /></div>
        <//>`;
      })}
    </div>
    ${s.note && html`<${Fade} delay=${70} y=${0} style=${{ position: "absolute", left: 120, right: 120, top: 858, font: `400 15px/1.3 ${BODY}`, color: "rgba(255,255,255,.45)" }}><${Rich} text=${s.note} /><//>`}
    <${Footer} index=${index} total=${total} title=${meta.title} />
  <//>`;
}

// ---------- c-moves: 5 atilim taahhudu, kart basina 2026 -> 2029 ----------
// items: [{title, text, from, fromSub, to, toSub, owner, icon}] ; risk: {label, text} ; note
function CMoves({ s, meta, index, total }) {
  const frame = useCurrentFrame();
  const items = s.items || [];
  return html`<${Frame} dark=${true}>
    <div style=${pad}><${THead} s=${s} size=${52} /></div>
    <${TopTags} s=${s} />
    <div style=${{ position: "absolute", left: 120, top: 232, width: 1680, height: 600, display: "flex", gap: 16 }}>
      ${items.map((it, i) => {
        const col = it.color || NEUTRAL; const acc = it.accent || C.green;
        const d = 12 + i * 8;
        const rise = spring({ frame: frame - d, fps: FPS, config: { damping: 18, stiffness: 80 } });
        const arrow = interpolate(frame - d - 26, [0, 30], [0, 1], ease);
        const lit = interpolate(arrow, [0.85, 1], [0, 1], clamp);
        const breathe = 0.7 + 0.3 * Math.sin(frame / 20 + i);
        return html`<div key=${i} style=${{ position: "relative", flex: 1, minWidth: 0, borderRadius: 22, overflow: "hidden", padding: "20px 20px 16px", display: "flex", flexDirection: "column",
            background: "linear-gradient(180deg, rgba(26,32,43,.96), rgba(12,15,21,.96))", border: `1px solid ${col}44`,
            opacity: Math.min(1, rise * 1.3), transform: `translateY(${(1 - rise) * 70}px)` }}>
          <div style=${{ position: "absolute", left: 0, right: 0, bottom: 0, height: 260, opacity: breathe * lit, background: `radial-gradient(ellipse 90% 100% at 50% 100%, ${acc}26, transparent 72%)` }} />
          <div style=${{ position: "relative", display: "flex", alignItems: "center", gap: 12 }}>
            <div style=${{ width: 48, height: 48, borderRadius: "50%", display: "grid", placeItems: "center", border: `2px solid ${col}`, color: col, font: `700 22px/1 ${HEAD}`, boxShadow: `0 0 ${18 * lit}px ${col}`, flexShrink: 0 }}>${i + 1}</div>
            <div style=${{ font: `600 21px/1.12 ${HEAD}` }}>${it.title}</div>
          </div>
          <div style=${{ position: "relative", marginTop: 10, minHeight: 60, font: `400 15px/1.35 ${BODY}`, color: muted }}><${Rich} text=${it.text} /></div>
          <div style=${{ position: "relative", marginTop: 12, padding: "12px 14px", borderRadius: 14, border: "1px solid rgba(255,255,255,.14)", background: "rgba(255,255,255,.03)", opacity: useT(d + 14, 16) }}>
            <${SEC} text=${it.fromLabel || "2026 baseline"} />
            <div style=${{ marginTop: 6, font: `600 ${it.fromSize || 28}px/1.1 ${HEAD}`, color: "rgba(255,255,255,.82)" }}><${Rich} text=${it.from} /></div>
            ${it.fromSub && html`<div style=${{ marginTop: 4, font: `400 14px/1.3 ${BODY}`, color: muted }}>${it.fromSub}</div>`}
          </div>
          <div style=${{ position: "relative", flex: 1, minHeight: 50, display: "flex", justifyContent: "center" }}>
            <div style=${{ position: "relative", width: 4, height: "100%" }}>
              <div style=${{ position: "absolute", left: 0, top: 0, width: 4, height: `${arrow * 100}%`, borderRadius: 2, background: `linear-gradient(180deg, rgba(255,255,255,.25), ${acc})`, boxShadow: `0 0 12px ${acc}` }} />
              <div style=${{ position: "absolute", left: -7, top: `calc(${arrow * 100}% - 6px)`, width: 0, height: 0, borderLeft: "9px solid transparent", borderRight: "9px solid transparent", borderTop: `13px solid ${acc}`, opacity: arrow }} />
            </div>
          </div>
          <div style=${{ position: "relative", padding: "12px 14px", borderRadius: 14, border: `1px solid ${acc}`, background: `${acc}${lit > 0.5 ? "24" : "08"}`, boxShadow: `0 0 ${24 * lit}px ${acc}44` }}>
            <${SEC} text=${it.toLabel || "2029 ambition"} color=${acc} />
            <div style=${{ marginTop: 6, font: `700 ${it.toSize || 32}px/1.08 ${HEAD}`, color: "#fff" }}><${Rich} text=${it.to} /></div>
            ${it.toSub && html`<div style=${{ marginTop: 4, font: `400 14px/1.3 ${BODY}`, color: "rgba(255,255,255,.75)" }}><${Rich} text=${it.toSub} /></div>`}
          </div>
          <div style=${{ position: "relative", marginTop: 10, font: `400 13.5px/1.3 ${BODY}`, color: "rgba(255,255,255,.55)" }}>Owner: <span style=${{ color: "#fff" }}>${it.owner || "TBC"}</span></div>
        </div>`;
      })}
    </div>
    ${s.risk && html`<${Pop} delay=${90} y=${16} style=${{ position: "absolute", left: 120, right: 120, top: 848, padding: "13px 24px", borderRadius: 16, border: `1px solid ${NEUTRAL}66`,
        background: "linear-gradient(90deg, rgba(201,212,227,.12), rgba(201,212,227,.03))", display: "flex", gap: 16, alignItems: "baseline" }}>
      <span style=${{ font: `600 19px/1.3 ${HEAD}`, color: NEUTRAL, whiteSpace: "nowrap" }}>${s.risk.label || "Main risk"}:</span>
      <span style=${{ font: `400 17.5px/1.4 ${BODY}`, color: "rgba(255,255,255,.9)" }}><${Rich} text=${s.risk.text} /></span>
    <//>`}
    ${s.note && html`<${Fade} delay=${96} y=${0} style=${{ position: "absolute", left: 120, right: 120, top: 916, font: `400 14px/1.3 ${BODY}`, color: "rgba(255,255,255,.42)" }}><${Rich} text=${s.note} /><//>`}
    <${Footer} index=${index} total=${total} title=${meta.title} />
  <//>`;
}

// ---------- c-territory: hareketli bolge haritasi + sayaclar ("wider than the Moon" cevabi) ----------
// Harita: world-atlas (Natural Earth 110m) cizilir; bolgeler sirayla kendi renginde yanar, Dakar-Kamcatka yayi cizilir.
// groups: [{name, color, ids: ["818", ...], names: ["Somaliland"]}] ; stats: [{value, decimals, prefix, suffix, label, sub}] ; arc: {from:[lon,lat], to:[lon,lat], label}
let geoLib = null;
function useWorld() {
  const [w, setW] = React.useState(geoLib);
  React.useEffect(() => {
    if (geoLib) return;
    let live = true;
    (async () => {
      const [d3, tj, topo] = await Promise.all([
        import("https://esm.sh/d3-geo@3.1.1"), import("https://esm.sh/topojson-client@3.1.0"),
        fetch("https://cdn.jsdelivr.net/npm/world-atlas@2.0.2/countries-110m.json").then((r) => r.json()),
      ]);
      geoLib = { d3, features: tj.feature(topo, topo.objects.countries).features };
      if (live) setW(geoLib);
    })().catch((e) => console.error("harita", e));
    return () => { live = false; };
  }, []);
  return w;
}
function CTerritory({ s, meta, index, total }) {
  const frame = useCurrentFrame();
  const world = useWorld();
  const MW = 1160, MH = 600;
  const groups = s.groups || [];
  const geo = React.useMemo(() => {
    if (!world) return null;
    const { d3, features } = world;
    const groupOf = (f) => groups.findIndex((g) => (g.ids || []).includes(String(f.id)) || (g.names || []).includes(f.properties.name));
    const inTerr = features.filter((f) => groupOf(f) >= 0);
    const proj = d3.geoNaturalEarth1().rotate([-62, 0]).fitExtent([[10, 10], [MW - 10, MH - 10]], { type: "FeatureCollection", features: inTerr });
    const path = d3.geoPath(proj);
    const shapes = features.map((f) => ({ d: path(f), g: groupOf(f) })).filter((x) => x.d);
    const arc = s.arc && (() => { const a = proj(s.arc.from), b = proj(s.arc.to); const c = [(a[0] + b[0]) / 2, Math.min(a[1], b[1]) - (s.arc.lift || 110)]; return { d: `M${a[0]},${a[1]} Q${c[0]},${c[1]} ${b[0]},${b[1]}`, a, b, c }; })();
    const pins = (s.pins || []).map((p) => ({ ...p, xy: proj(p.at) }));
    return { shapes, arc, pins };
  }, [world]);
  const mapIn = interpolate(frame, [4, 30], [0, 1], ease);
  const arcP = interpolate(frame, [96, 150], [0, 1], { ...clamp, easing: Easing.inOut(Easing.cubic) });
  const stats = s.stats || [];
  const pinP = (s.pins || []).map((_, k) => useSpring(70 + k * 6, { damping: 14, stiffness: 140, mass: 0.6 })); // kancalar harita yuklenmeden once de ayni sirada
  return html`<${Frame} dark=${true}>
    <div style=${pad}><${THead} s=${s} size=${56} /></div>
    <div style=${{ position: "absolute", left: 80, top: 262, width: MW, height: MH, opacity: mapIn }}>
      ${!geo && html`<div style=${{ position: "absolute", inset: 0, display: "grid", placeItems: "center", color: muted, font: `500 22px ${BODY}` }}>…</div>`}
      ${geo && html`<svg width=${MW} height=${MH} viewBox=${`0 0 ${MW} ${MH}`} style=${{ overflow: "visible" }}>
        <defs><filter id="terrGlow" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="6" result="b" /><feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge></filter></defs>
        ${geo.shapes.map((x, i) => {
          if (x.g < 0) return html`<path key=${i} d=${x.d} fill="rgba(255,255,255,.07)" stroke="rgba(255,255,255,.10)" strokeWidth="0.6" />`;
          const g = groups[x.g];
          const p = interpolate(frame, [22 + x.g * 13, 40 + x.g * 13], [0, 1], ease);
          return html`<path key=${i} d=${x.d} fill=${g.color} fillOpacity=${(g.dim ? 0.42 : 0.8) * p + 0.06} stroke="rgba(10,14,20,.85)" strokeWidth="0.7" />`;
        })}
        ${geo.arc && arcP > 0 && html`<g>
          <path d=${geo.arc.d} fill="none" stroke="#fff" strokeWidth="2.5" strokeDasharray="6 7" pathLength="1000" strokeDashoffset=${0} style=${{ strokeDasharray: `${arcP * 1000} 1000` }} filter="url(#terrGlow)" opacity="0.95" />
          ${[geo.arc.a, geo.arc.b].map((pt, k) => html`<g key=${k} opacity=${k === 0 ? 1 : arcP > 0.98 ? 1 : 0}>
            <circle cx=${pt[0]} cy=${pt[1]} r=${7 + 5 * Math.abs(Math.sin(frame / 12))} fill="none" stroke="#fff" strokeOpacity="0.5" />
            <circle cx=${pt[0]} cy=${pt[1]} r="5" fill="#fff" />
          </g>`)}
        </g>`}
        ${geo.pins.map((p, k) => {
          const pp = pinP[k];
          return html`<g key=${k} opacity=${Math.min(1, pp)} transform=${`translate(${p.xy[0]},${p.xy[1]})`}>
            <circle r="4" fill="#fff" />
            <text x=${p.dx ?? 10} y=${p.dy ?? -8} textAnchor=${p.anchor || "start"} style=${{ font: `600 17px ${HEAD}`, fill: "#fff", paintOrder: "stroke", stroke: "rgba(8,12,18,.85)", strokeWidth: 5 }}>${p.label}</text>
          </g>`;
        })}
      </svg>`}
      ${geo && geo.arc && s.arc.label && html`<div style=${{ position: "absolute", left: geo.arc.c[0], top: geo.arc.c[1] / 2 + Math.min(geo.arc.a[1], geo.arc.b[1]) / 2 - 22, transform: "translateX(-50%)",
        opacity: interpolate(frame, [140, 160], [0, 1], clamp), padding: "8px 16px", borderRadius: 999, background: "rgba(8,12,18,.85)", border: "1px solid rgba(255,255,255,.3)",
        font: `600 20px/1 ${HEAD}`, whiteSpace: "nowrap" }}>${s.arc.label}</div>`}
      <div style=${{ position: "absolute", left: 20, top: MH + 18, display: "flex", gap: 22, flexWrap: "wrap" }}>
        ${groups.filter((g) => !g.hideLegend).map((g, i) => html`<${Fade} key=${i} delay=${24 + i * 13} y=${6} style=${{ display: "flex", alignItems: "center", gap: 9, font: `500 18px/1 ${HEAD}`, color: "rgba(255,255,255,.8)" }}>
          <i style=${{ width: 14, height: 14, borderRadius: 4, background: g.color, opacity: g.dim ? 0.45 : 1 }} />${g.name}<//>`)}
      </div>
    </div>
    <div style=${{ position: "absolute", left: 1300, top: 262, width: 520, display: "flex", flexDirection: "column", gap: 22 }}>
      ${stats.map((st, i) => html`<${Pop} key=${i} delay=${30 + i * 12} x=${40} y=${0} style=${{ ...glass, padding: "18px 26px", position: "relative", overflow: "hidden" }}>
        <div style=${{ position: "absolute", left: 0, top: 0, bottom: 0, width: 4, background: st.color || C.green }} />
        <div style=${{ display: "flex", alignItems: "baseline", gap: 14 }}>
          <${Counter} to=${st.value} decimals=${st.decimals || 0} prefix=${st.prefix || ""} suffix=${st.suffix || ""} delay=${34 + i * 12} dur=${50} style=${{ font: `700 52px/1 ${HEAD}`, letterSpacing: "-0.03em", color: st.color || "#fff" }} />
          <div style=${{ font: `600 22px/1.15 ${HEAD}` }}>${st.label}</div>
        </div>
        ${st.sub && html`<div style=${{ marginTop: 6, font: `400 17px/1.35 ${BODY}`, color: muted }}>${st.sub}</div>`}
      <//>`)}
    </div>
    ${s.punch && html`<${Pop} delay=${165} y=${20} style=${{ position: "absolute", left: 1300, width: 520, bottom: 120, padding: "18px 26px", borderRadius: 18,
      background: `linear-gradient(120deg, ${C.green}26, transparent)`, border: `1px solid ${C.green}66`, font: `600 25px/1.3 ${HEAD}` }}>${s.punch}<//>`}
    ${s.note && html`<${Fade} delay=${90} style=${{ position: "absolute", left: 120, right: 120, bottom: 104, font: `400 15px/1.35 ${BODY}`, color: "rgba(255,255,255,.45)" }}>${s.note}<//>`}
    <${Footer} index=${index} total=${total} title=${meta.title} />
  <//>`;
}

// ---------- c-list: "home of the original innovations" kartlari + bir iglene satiri ----------
// items: [{t, where, when, r}] (r = bolge etiketi, renk REGION'dan) ; jab: string ; columns
function CList({ s, meta, index, total }) {
  const items = s.items || [];
  const cols = s.columns || 4;
  return html`<${Frame} dark=${true}>
    <div style=${pad}><${THead} s=${s} size=${56} /></div>
    ${s.jab && html`<${Fade} delay=${16} y=${10} style=${{ position: "absolute", left: 120, top: 236, right: 120, font: `italic 400 28px/1.35 ${BODY}`, color: "rgba(255,255,255,.85)" }}>${s.jab}<//>`}
    <div style=${{ position: "absolute", left: 120, right: 120, top: s.jab ? 320 : 280, bottom: s.note ? 120 : 90, display: "grid", gridTemplateColumns: `repeat(${cols}, 1fr)`, gridAutoRows: "1fr", gap: 18 }}>
      ${items.map((it, i) => {
        const col = REGION[it.r] || NEUTRAL;
        return html`<${Pop} key=${i} delay=${24 + i * 6} y=${26} style=${{ ...glass, borderRadius: 16, padding: "18px 22px", position: "relative", overflow: "hidden", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
          <div style=${{ position: "absolute", left: 0, top: 0, right: 0, height: 3, background: col }} />
          <div style=${{ font: `600 27px/1.15 ${HEAD}`, letterSpacing: "-0.01em" }}>${it.t}</div>
          <div style=${{ marginTop: 10 }}>
            <div style=${{ font: `500 18px/1.3 ${BODY}`, color: "rgba(255,255,255,.8)" }}>${it.where}</div>
            ${it.when && html`<div style=${{ marginTop: 4, font: `600 15px/1 ${HEAD}`, letterSpacing: "0.12em", textTransform: "uppercase", color: col }}>${it.when}</div>`}
          </div>
        <//>`;
      })}
    </div>
    ${s.note && html`<${Fade} delay=${100} style=${{ position: "absolute", left: 120, right: 120, bottom: 104, font: `400 15px/1.35 ${BODY}`, color: "rgba(255,255,255,.45)" }}>${s.note}<//>`}
    <${Footer} index=${index} total=${total} title=${meta.title} />
  <//>`;
}

// ---------- c-facts: "things the playbook doesn't tell you": buyuk rakam + espri, sirayla ----------
// facts: [{big, unit, text, r}] ; columns
function CFacts({ s, meta, index, total }) {
  const facts = s.facts || [];
  const cols = s.columns || 3;
  return html`<${Frame} dark=${true}>
    <div style=${pad}><${THead} s=${s} size=${56} /></div>
    <div style=${{ position: "absolute", left: 120, right: 120, top: 280, bottom: s.note ? 120 : 90, display: "grid", gridTemplateColumns: `repeat(${cols}, 1fr)`, gridAutoRows: "1fr", gap: 22 }}>
      ${facts.map((f, i) => {
        const col = REGION[f.r] || NEUTRAL;
        return html`<${Pop} key=${i} delay=${20 + i * 12} y=${30} style=${{ ...glass, padding: "24px 28px", position: "relative", overflow: "hidden" }}>
          <div style=${{ position: "absolute", left: 0, top: 0, bottom: 0, width: 4, background: col }} />
          <div style=${{ display: "flex", alignItems: "baseline", gap: 10, flexWrap: "wrap" }}>
            <span style=${{ font: `700 ${f.size || 50}px/1 ${HEAD}`, letterSpacing: "-0.03em", color: col }}>${f.big}</span>
            ${f.unit && html`<span style=${{ font: `600 22px/1.1 ${HEAD}` }}>${f.unit}</span>`}
          </div>
          <div style=${{ marginTop: 14, font: `400 20px/1.42 ${BODY}`, color: "rgba(255,255,255,.86)" }}>${f.text}</div>
        <//>`;
      })}
    </div>
    ${s.note && html`<${Fade} delay=${100} style=${{ position: "absolute", left: 120, right: 120, bottom: 104, font: `400 15px/1.35 ${BODY}`, color: "rgba(255,255,255,.45)" }}>${s.note}<//>`}
    <${Footer} index=${index} total=${total} title=${meta.title} />
  <//>`;
}

// ---------- c-pillar: stratejik sutun (baslik = tercih, 3 hedef, 3 hamle, 4 bolgelik odak seridi) ----------
// kpis: [{value, label}] ; moves: [{title, text}] ; focus: [{r, t}] (r = REGION anahtari) ; owners
function CPillar({ s, meta, index, total }) {
  const kpis = s.kpis || [], moves = s.moves || [], focus = s.focus || [];
  const line = useT(30, 40);
  return html`<${Frame} dark=${true}>
    <div style=${pad}><${THead} s=${{ ...s, titleWidth: s.titleWidth || 1100 }} size=${s.titleSize || 50} /></div>
    <div style=${{ position: "absolute", right: 120, top: 112, display: "flex", gap: 14 }}>
      ${kpis.map((k, i) => html`<${Pop} key=${i} delay=${18 + i * 7} y=${-14} style=${{ ...glass, width: 176, padding: "14px 16px", borderRadius: 16 }}>
        <div style=${{ font: `700 38px/1 ${HEAD}`, letterSpacing: "-0.03em", color: C.green }}>${k.value}</div>
        <div style=${{ marginTop: 8, font: `500 16px/1.3 ${BODY}`, color: muted }}>${k.label}</div>
      <//>`)}
    </div>
    <div style=${{ position: "absolute", left: 120, right: 120, top: 300, display: "grid", gridTemplateColumns: `repeat(${moves.length}, 1fr)`, gap: 24 }}>
      ${moves.map((mv, i) => html`<${Pop} key=${i} delay=${26 + i * 9} y=${30} style=${{ ...glass, padding: "26px 30px 28px", position: "relative", overflow: "hidden", minHeight: 250 }}>
        <div style=${{ position: "absolute", left: 0, top: 0, right: 0, height: 4, background: `linear-gradient(90deg, ${C.green}, ${C.greenLight}55)` }} />
        <div style=${{ font: `700 54px/1 ${HEAD}`, ...gradText(`linear-gradient(120deg, ${C.green}, ${C.greenLight})`) }}>${String(i + 1).padStart(2, "0")}</div>
        <div style=${{ marginTop: 16, font: `600 31px/1.15 ${HEAD}`, letterSpacing: "-0.015em" }}>${mv.title}</div>
        <div style=${{ marginTop: 12, font: `400 21px/1.45 ${BODY}`, color: "rgba(255,255,255,.8)" }}>${mv.text}</div>
      <//>`)}
    </div>
    <${Fade} delay=${44} y=${6} style=${{ position: "absolute", left: 120, top: 612 }}><${SEC} text=${s.focusLabel || "Market focus"} color=${C.green} style=${{ fontSize: 15 }} /><//>
    <div style=${{ position: "absolute", left: 120, top: 640, height: 2, width: (1920 - 240) * line, background: `linear-gradient(90deg, ${C.green}, transparent)` }} />
    <div style=${{ position: "absolute", left: 120, right: 120, top: 664, display: "grid", gridTemplateColumns: `repeat(${focus.length}, 1fr)`, gap: 24 }}>
      ${focus.map((f, i) => {
        const col = REGION[f.r] || NEUTRAL;
        return html`<${Pop} key=${i} delay=${50 + i * 7} y=${20} style=${{ borderTop: `4px solid ${col}`, paddingTop: 16 }}>
          <div style=${{ font: `600 24px/1 ${HEAD}`, color: col }}>${f.r}</div>
          <div style=${{ marginTop: 12, font: `400 20px/1.45 ${BODY}`, color: "rgba(255,255,255,.86)" }}>${f.t}</div>
        <//>`;
      })}
    </div>
    ${s.owners && html`<${Fade} delay=${80} style=${{ position: "absolute", left: 120, right: 120, bottom: 104, font: `400 16px/1.35 ${BODY}`, color: "rgba(255,255,255,.5)" }}>${s.owners}<//>`}
    <${Footer} index=${index} total=${total} title=${meta.title} />
  <//>`;
}

// ---------- c-roadmap: 2027 -> 2029 yol haritasi (fazlar + 2029 taahhutleri + ana risk) ----------
// phases: [{when, title, items: [..]}] ; commitments: [{t, owner}] ; risk: {label, text}
function CRoadmap({ s, meta, index, total }) {
  const ph = s.phases || [], cm = s.commitments || [];
  const line = interpolate(useCurrentFrame(), [10, 70], [0, 1], { ...clamp, easing: Easing.inOut(Easing.cubic) });
  const W = 1920 - 240;
  return html`<${Frame} dark=${true}>
    <div style=${pad}><${THead} s=${s} size=${56} /></div>
    <div style=${{ position: "absolute", left: 120, top: 286, width: W, height: 4, borderRadius: 4, background: "rgba(255,255,255,.12)" }} />
    <div style=${{ position: "absolute", left: 120, top: 286, width: W * line, height: 4, borderRadius: 4, background: `linear-gradient(90deg, rgba(255,255,255,.5), ${C.green})`, boxShadow: `0 0 16px ${C.green}` }} />
    <div style=${{ position: "absolute", left: 120, right: 120, top: 270, display: "grid", gridTemplateColumns: "1fr 1fr 1.6fr", gap: 26 }}>
      ${ph.map((p, i) => {
        const last = i === ph.length - 1;
        const on = interpolate(line, [i / ph.length, i / ph.length + 0.05], [0, 1], clamp);
        return html`<div key=${i}>
          <div style=${{ width: 36, height: 36, borderRadius: "50%", background: on > 0.5 ? (last ? C.green : "#fff") : "rgba(255,255,255,.2)", boxShadow: `0 0 ${18 * on}px ${C.green}`, border: "6px solid #0b0f15" }} />
          <${Pop} delay=${20 + i * 14} y=${24} style=${{ ...glass, marginTop: 22, padding: "22px 26px", minHeight: last ? 470 : 300, border: last ? `1px solid ${C.green}88` : glass.border }}>
            <div style=${{ font: `600 17px/1 ${HEAD}`, letterSpacing: "0.14em", textTransform: "uppercase", color: last ? C.green : muted }}>${p.when}</div>
            <div style=${{ marginTop: 10, font: `600 30px/1.15 ${HEAD}` }}>${p.title}</div>
            ${!last && (p.items || []).map((t, k) => html`<div key=${k} style=${{ marginTop: 14, display: "flex", gap: 12, font: `400 20px/1.4 ${BODY}`, color: "rgba(255,255,255,.84)" }}>
              <i style=${{ width: 8, height: 8, borderRadius: "50%", background: "rgba(255,255,255,.6)", marginTop: 10, flexShrink: 0 }} /><span>${t}</span></div>`)}
            ${last && cm.map((c, k) => html`<${Pop} key=${k} delay=${50 + k * 8} y=${14} style=${{ marginTop: k ? 12 : 18, display: "grid", gridTemplateColumns: "44px 1fr", gap: 8, alignItems: "baseline",
                paddingBottom: 12, borderBottom: k < cm.length - 1 ? "1px solid rgba(255,255,255,.08)" : "none" }}>
              <span style=${{ font: `700 26px/1 ${HEAD}`, color: C.green }}>${k + 1}</span>
              <div><div style=${{ font: `600 22px/1.3 ${HEAD}` }}>${c.t}</div>${c.sub && html`<div style=${{ marginTop: 4, font: `400 17px/1.35 ${BODY}`, color: muted }}>${c.sub}</div>`}</div>
            <//>`)}
          <//>
        </div>`;
      })}
    </div>
    ${s.risk && html`<${Pop} delay=${90} y=${16} style=${{ position: "absolute", left: 120, width: (W - 52) * (2 / 3.6) + 26, top: 690, padding: "18px 24px", borderRadius: 16, background: `${C.amber}14`, border: `1px solid ${C.amber}66` }}>
      <div style=${{ font: `600 15px/1 ${HEAD}`, letterSpacing: "0.14em", textTransform: "uppercase", color: C.amber }}>${s.risk.label || "Main risk"}</div>
      <div style=${{ marginTop: 10, font: `400 20px/1.45 ${BODY}`, color: "rgba(255,255,255,.88)" }}>${s.risk.text}</div>
    <//>`}
    ${s.note && html`<${Fade} delay=${100} style=${{ position: "absolute", left: 120, right: 120, bottom: 104, font: `400 15px/1.35 ${BODY}`, color: "rgba(255,255,255,.45)" }}>${s.note}<//>`}
    <${Footer} index=${index} total=${total} title=${meta.title} />
  <//>`;
}

registerSlideTypes({ "c-pillar": CPillar, "c-roadmap": CRoadmap, "c-territory": CTerritory, "c-list": CList, "c-facts": CFacts, "c-hero": CHero, "c-support": CSupport, "c-moves": CMoves, "c-blocks": CBlocks, "c-onepage": COnePage, "c-bridge": CBridge, "c-actions": CActions, "c-needs": CNeeds, "c-commit": CCommit });
