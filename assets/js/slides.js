// Remotion slayt tasarimlari. Her slayt tipi bir Remotion bileseni.
// Her sunum kendi "style" (stil) secimine gore farkli arka plan, hareket dili ve gecis kullanir:
//   aurora    - isik kureleri, huzmeler, cizilen halka; kelimeler bulaniktan netlesip yukselir
//   blueprint - Signify mavisi, cizilen izgara, donen kareler; kelimeler soldan saga silinerek acilir
//   spotlight - siyah sahne, gezinen spot isigi, toz zerreleri; harfler tek tek parlayarak gelir
//   wave      - akan dalgalar, yayilan halkalar; kelimeler yaylanarak buyur
// Slayt metinleri bu dosyada DEGIL, her sunumun kendi index.html dosyasinda durur.
import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring, Easing } from "remotion";
import htm from "htm";
import { LOGO_SVG } from "./logo.js";

const html = htm.bind(React.createElement);

export const FPS = 30;
export const WIDTH = 1920;
export const HEIGHT = 1080;
export const DURATION = FPS * 120; // giris animasyonu ilk saniyelerde, ortam animasyonu 2 dk surer

// Renkler Signify kurumsal sablonundan
const C = {
  green: "#00E487", greenLight: "#66EFB7", teal: "#1ECBD0", blue: "#1432FF", blueLight: "#A1ADFF",
  dark: "#3C3C41", grey: "#969696", greyLight: "#D5D5D5", ink: "#0B0B0E", white: "#FFFFFF",
};
const HEAD = '"Space Grotesk", "Segoe UI", system-ui, sans-serif';
const BODY = '"Inter", "Segoe UI", system-ui, sans-serif';
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" };
const lg = (a, b) => `linear-gradient(120deg, ${a} 0%, ${b} 100%)`;

export const THEMES = {
  aurora: {
    id: "aurora", darkBg: C.ink, lightBg: C.white,
    gradDark: lg(C.green, C.teal), gradLight: lg(C.green, C.teal),
    kickerDark: C.green, kickerLight: C.blue, accentLight: C.blue, glow: "0,228,135",
    bar: "linear-gradient(180deg, rgba(161,173,255,.9), rgba(20,50,255,.85))", text: "rise",
  },
  blueprint: {
    id: "blueprint", darkBg: C.blue, lightBg: C.white,
    gradDark: lg(C.green, C.greenLight), gradLight: lg(C.blue, C.blueLight),
    kickerDark: C.greenLight, kickerLight: C.blue, accentLight: C.blue, glow: "102,239,183",
    bar: "linear-gradient(180deg, rgba(255,255,255,.95), rgba(255,255,255,.55))", text: "wipe",
  },
  spotlight: {
    id: "spotlight", darkBg: "#000000", lightBg: "#F4F4F5",
    gradDark: lg(C.greenLight, C.green), gradLight: lg(C.green, C.teal),
    kickerDark: C.green, kickerLight: C.dark, accentLight: C.green, glow: "0,228,135",
    bar: "linear-gradient(180deg, rgba(213,213,213,.9), rgba(150,150,150,.6))", text: "letters",
  },
  wave: {
    id: "wave", darkBg: C.ink, lightBg: C.white,
    gradDark: lg(C.teal, C.blueLight), gradLight: lg(C.teal, C.blue),
    kickerDark: C.teal, kickerLight: C.teal, accentLight: C.teal, glow: "30,203,208",
    bar: "linear-gradient(180deg, rgba(161,173,255,.95), rgba(30,203,208,.7))", text: "pop",
  },
};
const ThemeCtx = React.createContext(THEMES.aurora);
const DarkCtx = React.createContext(true);
function useLook() {
  const T = React.useContext(ThemeCtx);
  const dark = React.useContext(DarkCtx);
  return { T, dark, grad: dark ? T.gradDark : T.gradLight };
}
export function themeOf(name) { return THEMES[name] || THEMES.aurora; }

// ---------- yardimcilar ----------
function useSpring(delay = 0, config = { damping: 200, mass: 0.9 }) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return spring({ frame: frame - delay, fps, config });
}
const gradText = (g) => ({ backgroundImage: g, WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" });

function Logo({ width = 170, color = C.white, style }) {
  return html`<div style=${{ width, color, lineHeight: 0, ...style }}
    dangerouslySetInnerHTML=${{ __html: LOGO_SVG.replace("<svg ", '<svg style="width:100%;height:auto;display:block" ') }} />`;
}

// Baslik animasyonu: stile gore farkli hareket
function RiseText({ text = "", delay = 0, stagger = 3, style, gradientWords = 0 }) {
  const { T } = useLook();
  const words = String(text).split(/\s+/).filter(Boolean);
  let charIndex = 0;
  return html`<div style=${{ display: "flex", flexWrap: "wrap", columnGap: "0.24em", ...style }}>
    ${words.map((w, i) => {
      const grad = gradientWords > 0 && i >= words.length - gradientWords;
      const start = charIndex; charIndex += w.length;
      if (T.text === "letters") return html`<${Letters} key=${i} word=${w} delay=${delay + start * 0.9} grad=${grad} />`;
      const Comp = T.text === "wipe" ? WipeWord : T.text === "pop" ? PopWord : Word;
      return html`<${Comp} key=${i} word=${w} delay=${delay + i * stagger} grad=${grad} />`;
    })}
  </div>`;
}
function Word({ word, delay, grad }) {
  const { grad: g } = useLook();
  const p = useSpring(delay, { damping: 18, mass: 0.7, stiffness: 120 });
  const y = interpolate(p, [0, 1], [110, 0]);
  const blur = interpolate(p, [0, 1], [8, 0], clamp);
  return html`<span style=${{ display: "inline-block", overflow: "hidden", paddingBottom: "0.08em", marginBottom: "-0.08em" }}>
    <span style=${{ display: "inline-block", transform: `translateY(${y}%)`, filter: `blur(${blur}px)`, ...(grad ? gradText(g) : {}) }}>${word}</span>
  </span>`;
}
function WipeWord({ word, delay, grad }) {
  const { grad: g, dark } = useLook();
  const p = useSpring(delay, { damping: 200, mass: 0.8 });
  const bar = interpolate(p, [0, 0.5, 1], [0, 1, 0], clamp);
  return html`<span style=${{ position: "relative", display: "inline-block", paddingBottom: "0.08em", marginBottom: "-0.08em" }}>
    <span style=${{ display: "inline-block", clipPath: `inset(0 ${100 - p * 100}% 0 0)`, transform: `translateX(${interpolate(p, [0, 1], [-24, 0])}px)`, ...(grad ? gradText(g) : {}) }}>${word}</span>
    <span style=${{ position: "absolute", top: "8%", bottom: "12%", left: `${p * 100}%`, width: 6, background: dark ? C.greenLight : C.blue, opacity: bar }} />
  </span>`;
}
function Letters({ word, delay, grad }) {
  const { T, dark } = useLook();
  const frame = useCurrentFrame();
  // background-clip:text tek tek harflerde calismadigi icin vurgulu kelime duz vurgu rengi alir
  return html`<span style=${{ display: "inline-block", whiteSpace: "nowrap", paddingBottom: "0.08em", marginBottom: "-0.08em", ...(grad ? { color: dark ? T.kickerDark : T.accentLight } : {}) }}>
    ${[...word].map((ch, i) => {
      const t = interpolate(frame - delay - i * 0.9, [0, 14], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) });
      return html`<span key=${i} style=${{ display: "inline-block", opacity: t, transform: `translateY(${(1 - t) * 18}px)`, filter: `blur(${(1 - t) * 10}px)`,
        textShadow: `0 0 ${grad ? 30 : (1 - t) * 40}px rgba(${T.glow},${grad ? 0.45 : 0.9})` }}>${ch}</span>`;
    })}
  </span>`;
}
function PopWord({ word, delay, grad }) {
  const { grad: g } = useLook();
  const p = useSpring(delay, { damping: 9, stiffness: 140, mass: 0.6 });
  const o = useSpring(delay, { damping: 200 });
  return html`<span style=${{ display: "inline-block", paddingBottom: "0.08em", marginBottom: "-0.08em", opacity: o,
      transform: `translateY(${interpolate(p, [0, 1], [50, 0])}px) scale(${interpolate(p, [0, 1], [0.6, 1])}) rotate(${interpolate(p, [0, 1], [-6, 0])}deg)`,
      transformOrigin: "50% 100%", ...(grad ? gradText(g) : {}) }}>${word}</span>`;
}

function Fade({ delay = 0, y = 30, children, style }) {
  const p = useSpring(delay);
  return html`<div style=${{ opacity: p, transform: `translateY(${interpolate(p, [0, 1], [y, 0])}px)`, ...style }}>${children}</div>`;
}

function Kicker({ text, delay = 0, color }) {
  const { T, dark, grad } = useLook();
  const p = useSpring(delay);
  if (!text) return null;
  const marker = T.id === "blueprint"
    ? html`<div style=${{ width: 18, height: 18, border: `3px solid ${dark ? C.greenLight : C.blue}`, transform: `rotate(${p * 225}deg) scale(${p})` }} />`
    : T.id === "wave"
      ? html`<svg width=${interpolate(p, [0, 1], [0, 80])} height="20" viewBox="0 0 80 20" preserveAspectRatio="none"><path d="M0 10 Q10 0 20 10 T40 10 T60 10 T80 10" fill="none" stroke=${dark ? C.teal : C.teal} strokeWidth="3" /></svg>`
      : html`<div style=${{ height: 3, width: interpolate(p, [0, 1], [0, 64]), background: grad }} />`;
  return html`<div style=${{ display: "flex", alignItems: "center", gap: 22, opacity: p,
      font: `500 26px/1 ${BODY}`, letterSpacing: "0.22em", textTransform: "uppercase", color: color || (dark ? T.kickerDark : T.kickerLight) }}>
    ${marker}
    <span style=${{ transform: `translateX(${interpolate(p, [0, 1], [-20, 0])}px)` }}>${text}</span>
  </div>`;
}

// ---------- arka planlar ----------
// aurora: yavasca dolasan isik kureleri + ince isik huzmeleri
function Ambient({ dark = true, intensity = 1 }) {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  const orbs = [
    { c: C.green, x: 78 + Math.sin(t * 0.35) * 8, y: 22 + Math.cos(t * 0.3) * 10, s: 900, o: 0.55 },
    { c: C.teal, x: 92 + Math.cos(t * 0.27) * 6, y: 70 + Math.sin(t * 0.33) * 8, s: 760, o: 0.45 },
    { c: C.blue, x: 8 + Math.sin(t * 0.22) * 6, y: 95 + Math.cos(t * 0.25) * 6, s: 1000, o: dark ? 0.55 : 0.18 },
  ];
  const fadeIn = interpolate(frame, [0, 40], [0, 1], clamp);
  return html`<${AbsoluteFill} style=${{ overflow: "hidden", opacity: fadeIn * intensity }}>
    ${orbs.map((o, i) => html`<div key=${i} style=${{
      position: "absolute", left: `${o.x}%`, top: `${o.y}%`, width: o.s, height: o.s,
      transform: "translate(-50%,-50%)", borderRadius: "50%",
      background: `radial-gradient(circle, ${o.c} 0%, transparent 65%)`,
      opacity: dark ? o.o : o.o * 0.45, filter: "blur(40px)",
    }} />`)}
    <${Rays} dark=${dark} />
    <div style=${{ position: "absolute", inset: 0,
      backgroundImage: `radial-gradient(${dark ? "rgba(255,255,255,.07)" : "rgba(0,0,0,.06)"} 1.5px, transparent 1.5px)`,
      backgroundSize: "36px 36px", maskImage: "linear-gradient(90deg, transparent 0%, #000 70%)",
      WebkitMaskImage: "linear-gradient(90deg, transparent 0%, #000 70%)" }} />
  <//>`;
}
function Rays({ dark }) {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  return html`<svg width=${WIDTH} height=${HEIGHT} style=${{ position: "absolute", inset: 0, mixBlendMode: dark ? "screen" : "multiply" }}>
    <defs>
      <linearGradient id="ray" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stopColor=${dark ? "#fff" : C.teal} stopOpacity="0" />
        <stop offset=".5" stopColor=${dark ? "#fff" : C.teal} stopOpacity=${dark ? 0.16 : 0.12} />
        <stop offset="1" stopColor=${dark ? "#fff" : C.teal} stopOpacity="0" />
      </linearGradient>
    </defs>
    ${[0, 1, 2, 3, 4].map((i) => {
      const a = -28 + i * 9 + Math.sin(t * 0.4 + i) * 3;
      return html`<rect key=${i} x=${1200 - i * 60} y=${-400} width=${70 + i * 30} height=${2200}
        fill="url(#ray)" opacity=${0.5 + 0.5 * Math.sin(t * 0.8 + i * 1.7)}
        transform=${`rotate(${a} 1500 0)`} />`;
    })}
  </svg>`;
}

// blueprint: kendini cizen izgara, arti isaretleri ve tarayan cizgi
function Blueprint({ dark }) {
  const frame = useCurrentFrame();
  const line = dark ? "rgba(255,255,255,.16)" : "rgba(20,50,255,.10)";
  const strong = dark ? "rgba(255,255,255,.35)" : "rgba(20,50,255,.25)";
  const cols = Array.from({ length: 13 }, (_, i) => i * 160);
  const rows = Array.from({ length: 8 }, (_, i) => i * 160);
  const scan = (frame * 4) % (WIDTH + 400) - 200;
  return html`<${AbsoluteFill} style=${{ overflow: "hidden" }}>
    ${cols.map((x, i) => {
      const p = interpolate(frame - i * 1.5, [0, 30], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) });
      return html`<div key=${"c" + i} style=${{ position: "absolute", left: x, top: 0, width: 1, height: HEIGHT, background: line, transformOrigin: "top", transform: `scaleY(${p})` }} />`;
    })}
    ${rows.map((y, i) => {
      const p = interpolate(frame - 6 - i * 2, [0, 30], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) });
      return html`<div key=${"r" + i} style=${{ position: "absolute", top: y, left: 0, height: 1, width: WIDTH, background: line, transformOrigin: "left", transform: `scaleX(${p})` }} />`;
    })}
    ${[[3, 1], [9, 2], [6, 5], [11, 6], [1, 6]].map(([cx, cy], i) => {
      const p = interpolate(frame - 30 - i * 5, [0, 12], [0, 1], clamp);
      return html`<div key=${"x" + i} style=${{ position: "absolute", left: cx * 160 - 14, top: cy * 160 - 14, width: 28, height: 28, opacity: p, transform: `rotate(${(1 - p) * 90}deg)` }}>
        <div style=${{ position: "absolute", left: 13, top: 0, width: 2, height: 28, background: strong }} />
        <div style=${{ position: "absolute", top: 13, left: 0, height: 2, width: 28, background: strong }} />
      </div>`;
    })}
    <div style=${{ position: "absolute", top: 0, bottom: 0, left: scan, width: 220,
      background: `linear-gradient(90deg, transparent, ${dark ? "rgba(255,255,255,.10)" : "rgba(20,50,255,.06)"}, transparent)` }} />
    ${dark && html`<div style=${{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 80% 20%, rgba(0,228,135,.18), transparent 55%), radial-gradient(ellipse at 0% 100%, rgba(0,0,0,.35), transparent 60%)" }} />`}
  <//>`;
}

// spotlight: gezinen spot isigi ve isikta suzulen toz zerreleri
function Spotlight({ dark }) {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  const sx = interpolate(frame, [0, 45], [-10, 68], { ...clamp, easing: Easing.inOut(Easing.cubic) }) + Math.sin(t * 0.3) * 6;
  const sy = 40 + Math.cos(t * 0.25) * 6;
  const on = interpolate(frame, [0, 20], [0, 1], clamp);
  return html`<${AbsoluteFill} style=${{ overflow: "hidden" }}>
    <div style=${{ position: "absolute", inset: 0, opacity: on,
      background: dark
        ? `radial-gradient(ellipse 34% 60% at ${sx}% ${sy}%, rgba(255,255,255,.16), rgba(0,228,135,.06) 45%, transparent 70%)`
        : `radial-gradient(ellipse 34% 60% at ${sx}% ${sy}%, rgba(0,228,135,.16), transparent 70%)` }} />
    <div style=${{ position: "absolute", left: `${sx}%`, top: -200, width: 900, height: 1500, transform: `translateX(-50%) rotate(${Math.sin(t * 0.3) * 4}deg)`, transformOrigin: "50% 0",
      background: `linear-gradient(180deg, ${dark ? "rgba(255,255,255,.10)" : "rgba(0,228,135,.08)"}, transparent 80%)`,
      clipPath: "polygon(44% 0, 56% 0, 100% 100%, 0 100%)", opacity: on, filter: "blur(6px)" }} />
    ${Array.from({ length: 40 }).map((_, i) => {
      const px = ((i * 97) % 100);
      const py = ((i * 53 + t * (8 + (i % 5) * 3)) % 110) - 5;
      const near = Math.max(0, 1 - Math.abs(px - sx) / 22);
      const sz = 2 + (i % 3);
      return html`<div key=${i} style=${{ position: "absolute", left: `${px}%`, top: `${py}%`, width: sz, height: sz, borderRadius: "50%",
        background: dark ? "#fff" : C.green, opacity: on * near * (0.25 + 0.5 * Math.abs(Math.sin(t + i))) }} />`;
    })}
    <div style=${{ position: "absolute", inset: 0, background: dark ? "radial-gradient(ellipse at 50% 50%, transparent 40%, rgba(0,0,0,.6) 100%)" : "none" }} />
  <//>`;
}

// wave: alttan akan katmanli dalgalar
function Waves({ dark }) {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  const rise = interpolate(frame, [0, 50], [200, 0], { ...clamp, easing: Easing.out(Easing.cubic) });
  const layers = [
    { c: C.blue, o: dark ? 0.55 : 0.12, amp: 46, len: 900, sp: 0.35, y: 860 },
    { c: C.teal, o: dark ? 0.45 : 0.16, amp: 38, len: 700, sp: -0.5, y: 900 },
    { c: C.green, o: dark ? 0.35 : 0.14, amp: 30, len: 520, sp: 0.7, y: 950 },
  ];
  const path = (L) => {
    let d = `M0 ${HEIGHT} L0 ${L.y}`;
    for (let x = 0; x <= WIDTH; x += 40) d += ` L${x} ${L.y + Math.sin((x / L.len) * Math.PI * 2 + t * L.sp * 2) * L.amp}`;
    return d + ` L${WIDTH} ${HEIGHT} Z`;
  };
  return html`<${AbsoluteFill} style=${{ overflow: "hidden" }}>
    ${dark && html`<div style=${{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 15% 10%, rgba(20,50,255,.35), transparent 50%), radial-gradient(ellipse at 90% 30%, rgba(30,203,208,.18), transparent 50%)" }} />`}
    <svg width=${WIDTH} height=${HEIGHT} style=${{ position: "absolute", inset: 0, transform: `translateY(${rise}px)` }}>
      ${layers.map((L, i) => html`<path key=${i} d=${path(L)} fill=${L.c} opacity=${L.o} />`)}
      ${layers.map((L, i) => {
        let d = `M0 ${L.y - 120}`;
        for (let x = 0; x <= WIDTH; x += 40) d += ` L${x} ${L.y - 120 + Math.sin((x / L.len) * Math.PI * 2 - t * L.sp * 2) * L.amp * 0.6}`;
        return html`<path key=${"l" + i} d=${d} fill="none" stroke=${L.c} strokeWidth="1.5" opacity=${dark ? 0.5 : 0.3} />`;
      })}
    </svg>
  <//>`;
}

function Background({ dark }) {
  const { T } = useLook();
  if (T.id === "blueprint") return html`<${Blueprint} dark=${dark} />`;
  if (T.id === "spotlight") return html`<${Spotlight} dark=${dark} />`;
  if (T.id === "wave") return html`<${Waves} dark=${dark} />`;
  return html`<${Ambient} dark=${dark} />`;
}

// ---------- motifler (kapak / kapanis / gorsel alani) ----------
// aurora: cizilerek gelen halka (Signify "S" logosundaki daireden esinlenildi)
function Ring({ size = 760, delay = 0, x = "72%", y = "50%", stroke = 10 }) {
  const frame = useCurrentFrame();
  const p = useSpring(delay, { damping: 200, mass: 2.4 });
  const r = size / 2 - stroke;
  const len = 2 * Math.PI * r;
  const rot = frame * 0.25;
  return html`<svg width=${size} height=${size} style=${{ position: "absolute", left: x, top: y, transform: `translate(-50%,-50%) rotate(${rot - 90}deg)`, overflow: "visible" }}>
    <defs>
      <linearGradient id="ringg" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor=${C.green} /><stop offset="1" stopColor=${C.teal} />
      </linearGradient>
      <filter id="glow" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="18" /></filter>
    </defs>
    <circle cx=${size / 2} cy=${size / 2} r=${r} fill="none" stroke="url(#ringg)" strokeWidth=${stroke * 2.6}
      strokeDasharray=${len} strokeDashoffset=${len * (1 - p * 0.86)} strokeLinecap="round" filter="url(#glow)" opacity="0.6" />
    <circle cx=${size / 2} cy=${size / 2} r=${r} fill="none" stroke="url(#ringg)" strokeWidth=${stroke}
      strokeDasharray=${len} strokeDashoffset=${len * (1 - p * 0.86)} strokeLinecap="round" />
    <circle cx=${size / 2} cy=${size / 2} r=${r - 70} fill="none" stroke="rgba(255,255,255,.12)" strokeWidth="1.5"
      strokeDasharray="4 14" opacity=${p} />
  </svg>`;
}
// blueprint: zit yonde donen, cizilerek gelen kareler
function Squares({ size = 760, delay = 0, x = "72%", y = "50%" }) {
  const frame = useCurrentFrame();
  const p = useSpring(delay, { damping: 200, mass: 2.2 });
  const sq = (s, rot, color, w, k) => {
    const len = s * 4;
    return html`<rect key=${k} x=${(size - s) / 2} y=${(size - s) / 2} width=${s} height=${s} fill="none" stroke=${color} strokeWidth=${w}
      strokeDasharray=${len} strokeDashoffset=${len * (1 - p)} transform=${`rotate(${rot} ${size / 2} ${size / 2})`} />`;
  };
  return html`<svg width=${size} height=${size} style=${{ position: "absolute", left: x, top: y, transform: "translate(-50%,-50%)", overflow: "visible" }}>
    ${sq(size * 0.7, 45 + frame * 0.2, C.greenLight, 8, "a")}
    ${sq(size * 0.5, -frame * 0.35, "rgba(255,255,255,.7)", 3, "b")}
    ${sq(size * 0.86, 12 + frame * 0.1, "rgba(255,255,255,.18)", 1.5, "c")}
    <circle cx=${size / 2} cy=${size / 2} r=${10 * p} fill=${C.greenLight} />
  </svg>`;
}
// spotlight: nefes alan isik diski
function Sun({ size = 760, delay = 0, x = "72%", y = "50%" }) {
  const frame = useCurrentFrame();
  const p = useSpring(delay, { damping: 200, mass: 2.6 });
  const pulse = 1 + Math.sin(frame / 20) * 0.03;
  return html`<div style=${{ position: "absolute", left: x, top: y, width: size, height: size, transform: `translate(-50%,-50%) scale(${p * pulse})` }}>
    <div style=${{ position: "absolute", inset: "-20%", borderRadius: "50%", background: "radial-gradient(circle, rgba(0,228,135,.35), transparent 62%)", filter: "blur(20px)" }} />
    <div style=${{ position: "absolute", inset: "18%", borderRadius: "50%", background: "radial-gradient(circle at 35% 30%, #ffffff, #66EFB7 35%, #00E487 60%, rgba(0,228,135,0) 72%)", opacity: 0.9 }} />
    <div style=${{ position: "absolute", inset: "6%", borderRadius: "50%", border: "1.5px solid rgba(255,255,255,.25)", transform: `rotate(${frame * 0.4}deg)`, borderTopColor: "rgba(255,255,255,.8)" }} />
  </div>`;
}
// wave: merkezden yayilan halkalar
function Ripples({ size = 760, delay = 0, x = "72%", y = "50%" }) {
  const frame = useCurrentFrame();
  const p = useSpring(delay, { damping: 200 });
  return html`<div style=${{ position: "absolute", left: x, top: y, width: size, height: size, transform: "translate(-50%,-50%)", opacity: p }}>
    ${[0, 1, 2, 3].map((i) => {
      const k = ((frame - delay + i * 30) % 120) / 120;
      return html`<div key=${i} style=${{ position: "absolute", inset: 0, borderRadius: "50%", border: `${3 - k * 2}px solid ${i % 2 ? C.teal : C.blueLight}`,
        transform: `scale(${0.15 + k * 0.85})`, opacity: (1 - k) * 0.9 }} />`;
    })}
    <div style=${{ position: "absolute", inset: "42%", borderRadius: "50%", background: lg(C.teal, C.blue), boxShadow: `0 0 80px ${C.teal}` }} />
  </div>`;
}
function Motif(props) {
  const { T } = useLook();
  if (T.id === "blueprint") return html`<${Squares} ...${props} />`;
  if (T.id === "spotlight") return html`<${Sun} ...${props} />`;
  if (T.id === "wave") return html`<${Ripples} ...${props} />`;
  return html`<${Ring} ...${props} />`;
}

function Frame({ dark = true, children, ambient = true }) {
  const { T } = useLook();
  return html`<${DarkCtx.Provider} value=${dark}>
    <${AbsoluteFill} style=${{ background: dark ? T.darkBg : T.lightBg, color: dark ? C.white : C.ink, fontFamily: BODY }}>
      ${ambient && html`<${Background} dark=${dark} />`}
      ${children}
    <//>
  <//>`;
}

function Footer({ index, total, title }) {
  const { dark } = useLook();
  const p = useSpring(18);
  return html`<div style=${{ position: "absolute", left: 120, right: 120, bottom: 64, display: "flex", alignItems: "center",
      justifyContent: "space-between", opacity: p * 0.9, font: `400 20px/1 ${BODY}`, color: dark ? "rgba(255,255,255,.62)" : "#77777e" }}>
    <span>${title || ""}</span>
    <div style=${{ display: "flex", alignItems: "center", gap: 36 }}>
      ${index != null && html`<span style=${{ fontVariantNumeric: "tabular-nums" }}>${String(index + 1).padStart(2, "0")} / ${String(total).padStart(2, "0")}</span>`}
      <${Logo} width=${120} color=${dark ? C.white : C.ink} />
    </div>
  </div>`;
}

const pad = { position: "absolute", left: 120, right: 120, top: 120, bottom: 170 };

// ---------- slayt tipleri ----------
function Cover({ s, meta }) {
  const frame = useCurrentFrame();
  const sweep = interpolate(frame, [20, 70], [-30, 130], clamp);
  return html`<${Frame} dark=${true}>
    <${Motif} size=${880} x="74%" y="48%" delay=${4} />
    <div style=${{ ...pad, display: "flex", flexDirection: "column", justifyContent: "center" }}>
      <${Logo} width=${200} style=${{ position: "absolute", top: 0, left: 0 }} />
      <${Kicker} text=${s.kicker} delay=${8} />
      <div style=${{ position: "relative", marginTop: 40, maxWidth: 1250 }}>
        <${RiseText} text=${s.title} delay=${12} stagger=${4} gradientWords=${1}
          style=${{ font: `600 132px/0.98 ${HEAD}`, letterSpacing: "-0.045em" }} />
        <div style=${{ position: "absolute", inset: "-10px -40px", pointerEvents: "none",
          background: `linear-gradient(100deg, transparent ${sweep - 12}%, rgba(255,255,255,.35) ${sweep}%, transparent ${sweep + 12}%)`,
          mixBlendMode: "overlay" }} />
      </div>
      <${Fade} delay=${30} style=${{ marginTop: 40, font: `400 40px/1.35 ${BODY}`, color: "rgba(255,255,255,.78)", maxWidth: 1100 }}>${s.subtitle}<//>
      <${Fade} delay=${42} style=${{ position: "absolute", bottom: -40, left: 0, display: "flex", gap: 48, alignItems: "baseline", font: `400 24px/1.3 ${BODY}`, color: "rgba(255,255,255,.7)" }}>
        <span style=${{ font: `600 28px/1.2 ${HEAD}`, color: C.white }}>${s.presenter || meta.presenter}</span>
        <span>${s.role || meta.role}</span>
        ${s.date && html`<${KickerColor} text=${s.date} />`}
      <//>
    </div>
  <//>`;
}
function KickerColor({ text }) {
  const { T } = useLook();
  return html`<span style=${{ color: T.kickerDark }}>${text}</span>`;
}

function Agenda({ s, meta, index, total }) {
  const items = s.items || [];
  return html`<${Frame} dark=${false}>
    <div style=${{ ...pad, display: "grid", gridTemplateColumns: "0.9fr 1.1fr", gap: 120 }}>
      <div>
        <${Kicker} text=${s.kicker} delay=${2} />
        <${RiseText} text=${s.title} delay=${6} style=${{ marginTop: 34, font: `600 120px/1 ${HEAD}`, letterSpacing: "-0.045em" }} />
      </div>
      <div style=${{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
        ${items.map((it, i) => html`<${AgendaItem} key=${i} n=${i + 1} text=${it} delay=${14 + i * 6} last=${i === items.length - 1} />`)}
      </div>
    </div>
    <${Footer} index=${index} total=${total} title=${meta.title} />
  <//>`;
}
function AgendaItem({ n, text, delay, last }) {
  const { T } = useLook();
  const p = useSpring(delay, { damping: 20, mass: 0.8, stiffness: 110 });
  const line = useSpring(delay + 2, { damping: 200 });
  return html`<div style=${{ position: "relative", display: "flex", alignItems: "center", gap: 48, padding: "34px 0" }}>
    <div style=${{ position: "absolute", left: 0, right: 0, top: 0, height: 1.5, background: "#E2E2E5", transformOrigin: "left", transform: `scaleX(${line})` }} />
    ${last && html`<div style=${{ position: "absolute", left: 0, right: 0, bottom: 0, height: 1.5, background: "#E2E2E5", transformOrigin: "left", transform: `scaleX(${line})` }} />`}
    <span style=${{ font: `500 30px/1 ${HEAD}`, color: T.accentLight, width: 60, opacity: p, fontVariantNumeric: "tabular-nums" }}>${String(n).padStart(2, "0")}</span>
    <span style=${{ font: `500 50px/1.15 ${HEAD}`, letterSpacing: "-0.02em", opacity: p, transform: `translateX(${interpolate(p, [0, 1], [60, 0])}px)` }}>${text}</span>
  </div>`;
}

function Statement({ s, meta, index, total }) {
  const pts = s.points || [];
  return html`<${Frame} dark=${true}>
    <div style=${{ ...pad, display: "flex", flexDirection: "column" }}>
      <${Kicker} text=${s.kicker} delay=${2} />
      <${RiseText} text=${s.title} delay=${6} stagger=${2} gradientWords=${s.gradientWords ?? 2}
        style=${{ marginTop: 40, font: `600 96px/1.04 ${HEAD}`, letterSpacing: "-0.04em", maxWidth: 1550 }} />
      <div style=${{ marginTop: "auto", display: "grid", gridTemplateColumns: `repeat(${Math.max(pts.length, 1)}, 1fr)`, gap: 36 }}>
        ${pts.map((p, i) => html`<${PointCard} key=${i} p=${p} i=${i} delay=${30 + i * 7} />`)}
      </div>
    </div>
    <${Footer} index=${index} total=${total} title=${meta.title} />
  <//>`;
}
function PointCard({ p, i, delay }) {
  const { grad, T } = useLook();
  const s = useSpring(delay, { damping: 18, stiffness: 100 });
  const square = T.id === "blueprint";
  return html`<div style=${{ position: "relative", padding: "44px 44px 48px", borderRadius: square ? 4 : 28,
      background: square ? "rgba(255,255,255,.08)" : "rgba(255,255,255,.05)", border: "1px solid rgba(255,255,255,.16)", backdropFilter: "blur(10px)",
      opacity: s, transform: `translateY(${interpolate(s, [0, 1], [80, 0])}px)` }}>
    <div style=${{ width: 56, height: 56, borderRadius: square ? 2 : 16, background: grad, display: "grid", placeItems: "center",
      font: `600 26px/1 ${HEAD}`, color: C.ink }}>${i + 1}</div>
    <div style=${{ marginTop: 34, font: `600 40px/1.15 ${HEAD}`, letterSpacing: "-0.02em" }}>${p.title}</div>
    <div style=${{ marginTop: 16, font: `400 27px/1.45 ${BODY}`, color: "rgba(255,255,255,.72)" }}>${p.text}</div>
  </div>`;
}

function Feature({ s, meta, index, total }) {
  const frame = useCurrentFrame();
  const { T } = useLook();
  const reveal = useSpring(10, { damping: 200, mass: 1.6 });
  const zoom = interpolate(frame, [0, 600], [1.12, 1], { ...clamp, easing: Easing.out(Easing.cubic) });
  const bullets = s.bullets || [];
  // Gorsel alani her stilde farkli acilir
  const clip = T.id === "blueprint" ? `inset(0 ${(1 - reveal) * 100}% 0 0 round 6px)`
    : T.id === "spotlight" ? `circle(${reveal * 75}% at 50% 50%)`
    : T.id === "wave" ? `inset(${(1 - reveal) * 50}% 0 ${(1 - reveal) * 50}% 0 round 36px)`
    : `inset(${(1 - reveal) * 100}% 0 0 0 round 36px)`;
  return html`<${Frame} dark=${false}>
    <div style=${{ ...pad, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 110, alignItems: "center" }}>
      <div>
        <${Kicker} text=${s.kicker} delay=${2} />
        <${RiseText} text=${s.title} delay=${6} style=${{ marginTop: 34, font: `600 100px/1.0 ${HEAD}`, letterSpacing: "-0.045em" }} />
        <${Fade} delay=${20} style=${{ marginTop: 34, font: `400 32px/1.5 ${BODY}`, color: "#55555c" }}>${s.text}<//>
        <div style=${{ marginTop: 40 }}>
          ${bullets.map((b, i) => html`<${Bullet} key=${i} text=${b} delay=${28 + i * 5} />`)}
        </div>
      </div>
      <div style=${{ position: "relative", height: 760, borderRadius: T.id === "blueprint" ? 6 : 36, overflow: "hidden", clipPath: clip, background: T.darkBg }}>
        ${s.image
          ? html`<img src=${s.image} style=${{ width: "100%", height: "100%", objectFit: "cover", transform: `scale(${zoom})` }} />`
          : html`<${ImagePlaceholder} zoom=${zoom} />`}
      </div>
    </div>
    <${Footer} index=${index} total=${total} title=${meta.title} />
  <//>`;
}
function ImagePlaceholder({ zoom }) {
  return html`<${DarkCtx.Provider} value=${true}>
    <div style=${{ position: "absolute", inset: 0, transform: `scale(${zoom})` }}>
      <${Background} dark=${true} />
      <${Motif} size=${520} x="50%" y="50%" delay=${14} stroke=${8} />
      <div style=${{ position: "absolute", inset: 0, display: "grid", placeItems: "center", font: `500 24px/1 ${BODY}`,
        letterSpacing: "0.2em", textTransform: "uppercase", color: "rgba(255,255,255,.8)" }}>Image placeholder</div>
    </div>
  <//>`;
}
function Bullet({ text, delay }) {
  const { grad, T } = useLook();
  const p = useSpring(delay);
  return html`<div style=${{ display: "flex", gap: 24, alignItems: "flex-start", padding: "14px 0", opacity: p,
      transform: `translateX(${interpolate(p, [0, 1], [40, 0])}px)` }}>
    <div style=${{ marginTop: 14, width: 14, height: 14, borderRadius: T.id === "blueprint" ? 2 : "50%", background: grad, flexShrink: 0, transform: `scale(${p}) rotate(${T.id === "blueprint" ? 45 : 0}deg)` }} />
    <span style=${{ font: `500 32px/1.4 ${BODY}` }}>${text}</span>
  </div>`;
}

function Numbers({ s, meta, index, total }) {
  const kpis = s.kpis || [];
  const ch = s.chart || { values: [] };
  return html`<${Frame} dark=${true}>
    <div style=${{ ...pad, display: "flex", flexDirection: "column" }}>
      <${Kicker} text=${s.kicker} delay=${2} />
      <${RiseText} text=${s.title} delay=${6} gradientWords=${1} style=${{ marginTop: 30, font: `600 76px/1.02 ${HEAD}`, letterSpacing: "-0.04em", maxWidth: 1500 }} />
      <div style=${{ marginTop: "auto", display: "grid", gridTemplateColumns: "1fr 1.15fr", gap: 100, alignItems: "end" }}>
        <div style=${{ display: "grid", gridTemplateColumns: "1fr", gap: 26 }}>
          ${kpis.map((k, i) => html`<${Kpi} key=${i} k=${k} delay=${18 + i * 7} />`)}
        </div>
        <${Bars} chart=${ch} delay=${24} />
      </div>
    </div>
    <${Footer} index=${index} total=${total} title=${meta.title} />
  <//>`;
}
function Kpi({ k, delay }) {
  const { grad } = useLook();
  const p = useSpring(delay, { damping: 200, mass: 2 });
  const line = useSpring(delay);
  const raw = String(k.value ?? "");
  const num = parseFloat(raw.replace(",", "."));
  const isNum = /^[\d.,]+$/.test(raw) && !isNaN(num);
  const decimals = isNum && raw.includes(".") ? raw.split(".")[1].length : 0;
  const shown = isNum ? (num * p).toFixed(decimals).padStart(raw.length, "0") : raw;
  return html`<div style=${{ display: "flex", alignItems: "baseline", gap: 34, paddingBottom: 26, position: "relative" }}>
    <div style=${{ position: "absolute", left: 0, right: 0, bottom: 0, height: 1.5, background: "rgba(255,255,255,.2)", transformOrigin: "left", transform: `scaleX(${line})` }} />
    <span style=${{ font: `600 92px/0.9 ${HEAD}`, letterSpacing: "-0.04em", fontVariantNumeric: "tabular-nums", ...gradText(grad), opacity: line }}>
      ${k.prefix || ""}${shown}${k.suffix || ""}</span>
    <span style=${{ font: `400 28px/1.3 ${BODY}`, color: "rgba(255,255,255,.75)", opacity: line }}>${k.label}</span>
  </div>`;
}
function Bars({ chart, delay }) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { grad, T } = useLook();
  const vals = chart.values || [];
  const max = Math.max(...vals, 1);
  const H = 340;
  return html`<div style=${{ position: "relative", padding: "40px 44px 30px", borderRadius: T.id === "blueprint" ? 6 : 32, background: "rgba(255,255,255,.05)", border: "1px solid rgba(255,255,255,.14)" }}>
    <div style=${{ display: "flex", justifyContent: "space-between", alignItems: "center", font: `500 26px/1.2 ${HEAD}` }}>
      <span>${chart.title}</span>
      ${chart.note && html`<span style=${{ font: `500 18px/1 ${BODY}`, letterSpacing: "0.12em", textTransform: "uppercase", color: T.kickerDark,
        border: `1px solid ${T.kickerDark}66`, borderRadius: 999, padding: "10px 16px" }}>${chart.note}</span>`}
    </div>
    <div style=${{ position: "relative", height: H, marginTop: 34, display: "flex", alignItems: "flex-end", gap: 28 }}>
      ${[0.25, 0.5, 0.75, 1].map((g) => html`<div key=${g} style=${{ position: "absolute", left: 0, right: 0, bottom: H * g, height: 1, background: "rgba(255,255,255,.1)" }} />`)}
      ${vals.map((v, i) => {
        const p = spring({ frame: frame - delay - i * 4, fps, config: { damping: 15, stiffness: 90, mass: 0.9 } });
        const hl = i === vals.length - 1;
        return html`<div key=${i} style=${{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 18 }}>
          <div style=${{ width: "100%", height: Math.max(0, (v / max) * (H - 50) * p), borderRadius: T.id === "blueprint" ? 2 : "16px 16px 6px 6px",
            background: hl ? grad : T.bar, boxShadow: hl ? `0 0 60px rgba(${T.glow},.4)` : "none" }} />
        </div>`;
      })}
    </div>
    <div style=${{ display: "flex", gap: 28, marginTop: 18 }}>
      ${(chart.labels || []).map((l, i) => html`<span key=${i} style=${{ flex: 1, textAlign: "center", font: `400 22px/1.2 ${BODY}`, color: "rgba(255,255,255,.7)" }}>${l}</span>`)}
    </div>
  </div>`;
}

function Roadmap({ s, meta, index, total }) {
  const { grad, T } = useLook();
  const steps = s.steps || [];
  const line = useSpring(14, { damping: 200, mass: 3 });
  return html`<${Frame} dark=${false}>
    <div style=${{ ...pad, display: "flex", flexDirection: "column" }}>
      <${Kicker} text=${s.kicker} delay=${2} />
      <${RiseText} text=${s.title} delay=${6} style=${{ marginTop: 30, font: `600 100px/1 ${HEAD}`, letterSpacing: "-0.045em" }} />
      <div style=${{ position: "relative", marginTop: "auto", paddingTop: 70 }}>
        <div style=${{ position: "absolute", left: 0, right: 0, top: 26, height: 4, borderRadius: 4, background: "#E8E8EB" }} />
        <div style=${{ position: "absolute", left: 0, top: 26, height: 4, borderRadius: 4, width: `${line * 100}%`, background: grad, boxShadow: `0 0 24px rgba(${T.glow},.8)` }} />
        <div style=${{ display: "grid", gridTemplateColumns: `repeat(${Math.max(steps.length, 1)}, 1fr)`, gap: 40 }}>
          ${steps.map((st, i) => html`<${Milestone} key=${i} st=${st} delay=${18 + i * 9} />`)}
        </div>
      </div>
    </div>
    <${Footer} index=${index} total=${total} title=${meta.title} />
  <//>`;
}
function Milestone({ st, delay }) {
  const { T } = useLook();
  const p = useSpring(delay, { damping: 12, stiffness: 140, mass: 0.6 });
  const t = useSpring(delay + 4);
  const square = T.id === "blueprint";
  return html`<div style=${{ position: "relative" }}>
    <div style=${{ position: "absolute", top: -58, left: 0, width: 32, height: 32, borderRadius: square ? 3 : "50%", background: C.white,
      border: `6px solid ${T.accentLight}`, transform: `scale(${p}) rotate(${square ? 45 * p : 0}deg)`, boxShadow: `0 0 0 ${10 * t}px rgba(${T.glow},.15)` }} />
    <div style=${{ opacity: t, transform: `translateY(${interpolate(t, [0, 1], [40, 0])}px)` }}>
      <div style=${{ font: `500 26px/1 ${HEAD}`, color: T.accentLight, letterSpacing: "0.04em" }}>${st.when}</div>
      <div style=${{ marginTop: 22, font: `600 44px/1.1 ${HEAD}`, letterSpacing: "-0.02em" }}>${st.title}</div>
      <div style=${{ marginTop: 16, font: `400 27px/1.45 ${BODY}`, color: "#5c5c63" }}>${st.text}</div>
    </div>
  </div>`;
}

function Closing({ s, meta }) {
  const { T } = useLook();
  const frame = useCurrentFrame();
  const p = useSpring(6, { damping: 200, mass: 2 });
  const glow = 0.6 + 0.4 * Math.sin(frame / 18);
  return html`<${Frame} dark=${true}>
    <${Motif} size=${1100} x="50%" y="50%" delay=${2} stroke=${8} />
    <div style=${{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center" }}>
      <${RiseText} text=${s.title} delay=${10} stagger=${5} gradientWords=${1}
        style=${{ justifyContent: "center", font: `600 190px/0.95 ${HEAD}`, letterSpacing: "-0.05em", textShadow: `0 0 ${80 * glow}px rgba(${T.glow},.25)` }} />
      <${Fade} delay=${24} style=${{ marginTop: 40, font: `400 42px/1.35 ${BODY}`, color: "rgba(255,255,255,.8)" }}>${s.subtitle}<//>
      <${Fade} delay=${34} style=${{ marginTop: 60, display: "flex", gap: 40, alignItems: "center", font: `400 26px/1.3 ${BODY}`, color: "rgba(255,255,255,.7)" }}>
        <span style=${{ font: `600 28px/1.2 ${HEAD}`, color: C.white }}>${s.presenter || meta.presenter}</span>
        ${s.contact && html`<span>${s.contact}</span>`}
      <//>
    </div>
    <div style=${{ position: "absolute", bottom: 80, left: "50%", transform: `translateX(-50%) scale(${interpolate(p, [0, 1], [0.8, 1])})`, opacity: p }}>
      <${Logo} width=${220} />
    </div>
  <//>`;
}

export const SLIDE_TYPES = { cover: Cover, agenda: Agenda, statement: Statement, feature: Feature, numbers: Numbers, roadmap: Roadmap, closing: Closing };

// Slayt tipini secip dogru bileseni, sunumun stiliyle cizen kapsayici
export function SlideComposition({ slide, meta, index, total, style }) {
  const Comp = SLIDE_TYPES[slide.type] || Statement;
  return html`<${ThemeCtx.Provider} value=${themeOf(style)}>
    <${Comp} s=${slide} meta=${meta || {}} index=${index} total=${total} />
  <//>`;
}

// ---------- ana sayfa kart onizlemesi: her sunum kendi stilinde ----------
export function CardComposition({ style, title }) {
  const T = themeOf(style);
  return html`<${ThemeCtx.Provider} value=${T}>
    <${Frame} dark=${true}>
      <${Motif} size=${820} x="74%" y="46%" delay=${0} />
      <div style=${{ position: "absolute", left: 110, bottom: 120, right: 640 }}>
        <${RiseText} text=${title} delay=${8} stagger=${4} gradientWords=${1} style=${{ font: `600 120px/0.98 ${HEAD}`, letterSpacing: "-0.045em" }} />
      </div>
      <${Logo} width=${170} style=${{ position: "absolute", left: 110, top: 100 }} />
    <//>
  <//>`;
}

// ---------- ana sayfa hero animasyonu ----------
export function HeroComposition() {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  return html`<${AbsoluteFill} style=${{ background: C.ink }}>
    <${Ambient} dark=${true} />
    <${Ring} size=${1250} x="76%" y="40%" delay=${0} stroke=${9} />
    <${Ring} size=${640} x="76%" y="40%" delay=${16} stroke=${3} />
    ${Array.from({ length: 26 }).map((_, i) => {
      const sp = 0.15 + ((i * 37) % 10) / 30;
      const x = (i * 211) % WIDTH;
      const y = (HEIGHT + 60) - (((t * 60 * sp + i * 97) % (HEIGHT + 120)));
      const sz = 2 + (i % 4);
      return html`<div key=${i} style=${{ position: "absolute", left: x, top: y, width: sz, height: sz, borderRadius: "50%",
        background: i % 3 ? C.green : C.teal, boxShadow: `0 0 ${sz * 6}px ${C.green}`, opacity: 0.35 + (i % 5) / 10 }} />`;
    })}
  <//>`;
}
