// Ana sayfa: Remotion hero animasyonu, sunum kartlari ve tek tikla tam ekran sunum.
import React from "react";
import { createRoot } from "react-dom/client";
import { Player } from "@remotion/player";
import { HeroComposition, CardComposition, FPS, WIDTH, HEIGHT } from "./slides.js";
import { LOGO_SVG } from "./logo.js";

const decks = JSON.parse(document.getElementById("deck-list").textContent);

document.getElementById("top-logo").innerHTML = LOGO_SVG;
document.getElementById("foot-logo").innerHTML = LOGO_SVG;

// ---------- hero: Remotion animasyonu, ekrani kaplayacak sekilde olceklenir ----------
const heroBg = document.getElementById("hero-bg");
const heroBox = document.createElement("div");
heroBox.style.cssText = `position:absolute;left:50%;top:50%;width:${WIDTH}px;height:${HEIGHT}px;transform-origin:center`;
heroBg.appendChild(heroBox);
function fitHero() {
  const s = Math.max(heroBg.clientWidth / WIDTH, heroBg.clientHeight / HEIGHT);
  heroBox.style.transform = `translate(-50%,-50%) scale(${s})`;
}
new ResizeObserver(fitHero).observe(heroBg);
fitHero();
createRoot(heroBox).render(React.createElement(Player, {
  component: HeroComposition,
  durationInFrames: FPS * 60,
  fps: FPS,
  compositionWidth: WIDTH,
  compositionHeight: HEIGHT,
  autoPlay: true,
  loop: true,
  controls: false,
  clickToPlay: false,
  acknowledgeRemotionLicense: true,
  style: { width: WIDTH, height: HEIGHT },
}));

// ---------- kartlar ----------
const grid = document.getElementById("deck-grid");
document.getElementById("deck-count").textContent = String(decks.length).padStart(2, "0");

const esc = (s) => String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

decks.forEach((d, i) => {
  const card = document.createElement("article");
  card.className = "card";
  card.tabIndex = 0;
  card.setAttribute("role", "button");
  card.setAttribute("aria-label", `Present ${d.title}`);
  card.innerHTML = `
    <div class="card__art"><div class="card__player"></div>
      <span class="card__play" aria-hidden="true"><svg width="18" height="18" viewBox="0 0 24 24"><path d="M7 4l13 8-13 8z" fill="currentColor"/></svg></span>
    </div>
    <div class="card__meta">
      <div><strong>${esc(d.date || "")}</strong>${esc(d.description || "")}</div>
      <a class="open" href="${esc(d.folder)}" target="_blank" rel="noopener">New tab ↗</a>
    </div>`;
  card.querySelector(".open").addEventListener("click", (e) => e.stopPropagation());
  card.addEventListener("click", () => present(d.folder));
  card.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); present(d.folder); } });
  grid.appendChild(card);
  mountCardPlayer(card, d);
});

// Her kartta sunumun kendi stilinde canli Remotion onizlemesi: ekrana girince bir kez oynar,
// fare ustune gelince bastan oynar.
function mountCardPlayer(card, d) {
  const holder = card.querySelector(".card__player");
  const box = document.createElement("div");
  box.style.cssText = `position:absolute;left:0;top:0;width:${WIDTH}px;height:${HEIGHT}px;transform-origin:0 0`;
  holder.appendChild(box);
  const fit = () => { box.style.transform = `scale(${holder.clientWidth / WIDTH})`; };
  new ResizeObserver(fit).observe(holder);
  fit();
  const ref = React.createRef();
  createRoot(box).render(React.createElement(Player, {
    ref,
    component: CardComposition,
    inputProps: { style: d.style || "aurora", title: d.title },
    durationInFrames: FPS * 20,
    fps: FPS,
    compositionWidth: WIDTH,
    compositionHeight: HEIGHT,
    controls: false,
    clickToPlay: false,
    initialFrame: 75,
    acknowledgeRemotionLicense: true,
    style: { width: WIDTH, height: HEIGHT },
  }));
  const replay = () => { const p = ref.current; if (!p) return; p.seekTo(0); p.play(); };
  card.addEventListener("mouseenter", replay);
  card._replay = replay;
}

// Kartlar ekrana girince yumusakca belirsin
const io = new IntersectionObserver((entries) => entries.forEach((en, k) => {
  if (en.isIntersecting) { setTimeout(() => { en.target.classList.add("is-in"); en.target._replay?.(); }, k * 120); io.unobserve(en.target); }
}), { threshold: 0.15 });
grid.querySelectorAll(".card").forEach((c) => io.observe(c));

// ---------- tek tikla tam ekran sunum ----------
let stage = null;
function present(folder) {
  stage = document.createElement("div");
  stage.className = "stage";
  stage.innerHTML = `<iframe src="${esc(folder)}" allow="fullscreen" title="Presentation"></iframe>
    <button class="stage__close" aria-label="Close presentation">×</button>`;
  document.body.appendChild(stage);
  const iframe = stage.querySelector("iframe");
  stage.querySelector(".stage__close").addEventListener("click", closeStage);
  iframe.addEventListener("load", () => { iframe.contentWindow?.focus(); });
  (stage.requestFullscreen || stage.webkitRequestFullscreen)?.call(stage)?.catch?.(() => {});
  requestAnimationFrame(() => stage.classList.add("is-open"));
  document.documentElement.style.overflow = "hidden";
}
function closeStage() {
  if (!stage) return;
  const s = stage;
  stage = null;
  if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
  s.classList.remove("is-open");
  setTimeout(() => s.remove(), 350);
  document.documentElement.style.overflow = "";
}
document.addEventListener("fullscreenchange", () => { if (!document.fullscreenElement && stage) closeStage(); });
document.addEventListener("keydown", (e) => { if (e.key === "Escape" && stage) closeStage(); });
window.addEventListener("message", (e) => { if (e.data?.type === "deck:close") closeStage(); });
