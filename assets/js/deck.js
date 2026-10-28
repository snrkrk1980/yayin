// Sunum motoru: slaytlari Remotion Player ile oynatir, ok tuslariyla ilerler.
// Slayt metinleri sunumun index.html dosyasindaki <script id="deck-data"> blogundan okunur.
import React from "react";
import { createRoot } from "react-dom/client";
import { Player } from "@remotion/player";
import { SlideComposition, FPS, WIDTH, HEIGHT, DURATION } from "./slides.js";
import "./corridor.js?v=20261028c"; // "c-..." slayt tiplerini ekler; ?v= tarayici onbellegini asar, corridor.js degisince artirin

const data = JSON.parse(document.getElementById("deck-data").textContent);
const slides = data.slides || [];
const meta = { title: data.title, presenter: data.presenter, role: data.role };
const style = data.style || "aurora"; // her sunumun kendi gorunumu: aurora, blueprint, spotlight, wave, corridor
const total = slides.length;
// ?still=90 : animasyonu oynatmadan belirli bir karede durdurur (kontrol ve ekran goruntusu icin)
const still = parseInt(new URLSearchParams(location.search).get("still"), 10);
const isStill = Number.isFinite(still);

const deck = document.createElement("div");
deck.className = "deck deck--" + style;
deck.innerHTML = `
  <div class="deck__layers"></div>
  <div class="deck__ui">
    <div class="deck__progress"><i></i></div>
    <button class="deck__btn deck__prev" aria-label="Previous slide">&#8592;</button>
    <button class="deck__btn deck__next" aria-label="Next slide">&#8594;</button>
    <button class="deck__btn deck__fs" aria-label="Full screen">&#x26F6;</button>
  </div>
  <div class="deck__rotate">Rotate your phone for the best view</div>`;
document.body.appendChild(deck);
const layers = deck.querySelector(".deck__layers");
const bar = deck.querySelector(".deck__progress i");

let current = -1;
let active = null;

function show(i) {
  i = Math.max(0, Math.min(total - 1, i));
  if (i === current) return;
  const dir = i > current ? 1 : -1;
  current = i;
  history.replaceState(null, "", "#" + (i + 1));
  bar.style.width = ((i + 1) / total) * 100 + "%";

  const el = document.createElement("div");
  el.className = isStill ? "deck__layer" : "deck__layer is-entering";
  el.style.setProperty("--dir", dir);
  layers.appendChild(el);
  const box = document.createElement("div");
  box.className = "deck__box";
  el.appendChild(box);
  const root = createRoot(box);
  root.render(React.createElement(Player, {
    component: SlideComposition,
    inputProps: { slide: slides[i], meta, index: i, total, style },
    durationInFrames: DURATION,
    fps: FPS,
    compositionWidth: WIDTH,
    compositionHeight: HEIGHT,
    autoPlay: !isStill,
    initialFrame: isStill ? still : 0,
    controls: false,
    clickToPlay: false,
    doubleClickToFullscreen: false,
    spaceKeyToPlayOrPause: false,
    acknowledgeRemotionLicense: true,
    style: { width: WIDTH, height: HEIGHT },
  }));
  el.getBoundingClientRect();
  setTimeout(() => el.classList.remove("is-entering"), 30);

  const prev = active;
  active = { el, root };
  if (prev) {
    prev.el.classList.add("is-leaving");
    setTimeout(() => { prev.root.unmount(); prev.el.remove(); }, isStill ? 0 : 650);
  }
}

const next = () => show(current + 1);
const back = () => show(current - 1);

function toggleFullscreen() {
  const d = document;
  if (d.fullscreenElement || d.webkitFullscreenElement) (d.exitFullscreen || d.webkitExitFullscreen).call(d);
  else (deck.requestFullscreen || deck.webkitRequestFullscreen)?.call(deck);
}

document.addEventListener("keydown", (e) => {
  if (e.metaKey || e.ctrlKey || e.altKey) return;
  switch (e.key) {
    case "ArrowRight": case "ArrowDown": case "PageDown": case " ": case "Enter":
      e.preventDefault(); next(); break;
    case "ArrowLeft": case "ArrowUp": case "PageUp": case "Backspace":
      e.preventDefault(); back(); break;
    case "Home": show(0); break;
    case "End": show(total - 1); break;
    case "f": case "F": toggleFullscreen(); break;
    case "Escape":
      // Ana sayfadaki tam ekran katmanindan acildiysa kapat
      if (window.parent !== window) window.parent.postMessage({ type: "deck:close" }, "*");
      break;
  }
});

// Tiklama / dokunma: sag taraf ileri, sol taraf geri; mobilde kaydirma
deck.querySelector(".deck__prev").addEventListener("click", (e) => { e.stopPropagation(); back(); });
deck.querySelector(".deck__next").addEventListener("click", (e) => { e.stopPropagation(); next(); });
deck.querySelector(".deck__fs").addEventListener("click", (e) => { e.stopPropagation(); toggleFullscreen(); });
layers.addEventListener("click", (e) => { (e.clientX > window.innerWidth * 0.3 ? next : back)(); });
let tx = null, ty = null;
deck.addEventListener("touchstart", (e) => { tx = e.touches[0].clientX; ty = e.touches[0].clientY; }, { passive: true });
deck.addEventListener("touchend", (e) => {
  if (tx == null) return;
  const dx = e.changedTouches[0].clientX - tx, dy = e.changedTouches[0].clientY - ty;
  if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) (dx < 0 ? next : back)();
  tx = null;
});

// Fare hareket etmeyince arayuzu gizle
let idle;
function wake() {
  deck.classList.add("is-awake");
  clearTimeout(idle);
  idle = setTimeout(() => deck.classList.remove("is-awake"), 2200);
}
document.addEventListener("mousemove", wake);
wake();

window.addEventListener("message", (e) => { if (e.data?.type === "deck:focus") window.focus(); });

// Slayti ekrana sigdir (1920x1080 tuvali olcekler)
function fit() {
  const s = Math.min(window.innerWidth / WIDTH, window.innerHeight / HEIGHT);
  deck.style.setProperty("--scale", s);
}
window.addEventListener("resize", fit);
fit();

const start = parseInt(location.hash.slice(1), 10);
show(Number.isFinite(start) ? start - 1 : 0);
document.fonts?.ready.then(() => document.documentElement.classList.add("fonts-ready"));
