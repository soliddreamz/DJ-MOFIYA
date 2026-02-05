// Base Lyrics Overlay v1 — CUE MODE (Enhanced)
// - No lyrics.json
// - No DJ software dependency
// - You advance text live (SPACE or click/tap)
// - Built for OBS capture: stable, simple, never-freeze

const els = {
  linePrev: document.getElementById("linePrev"),
  lineNow: document.getElementById("lineNow"),
  lineNext: document.getElementById("lineNext"),
  stage: document.getElementById("stage"),
};

const cues = [
  "YO — LISTEN TO THIS",
  "THIS PART RIGHT HERE",
  "DON’T MISS THIS BAR",
  "RUN THAT BACK",
  "WAIT FOR IT…",
  "HOLD UP",
  "TEXT & DECKS",
  "POWERED BY BASE",
];

// Behavior flags (safe defaults)
const LOOP = true;           // keep cycling through cues
const SHOW_HINT = true;      // show quick hint on load
const ADVANCE_KEY = "Space"; // key to advance

let index = 0;
let hintTimeout = null;

function getCue(i) {
  if (!cues.length) return "";
  if (LOOP) {
    const n = cues.length;
    return cues[((i % n) + n) % n];
  }
  // non-loop: clamp
  if (i < 0) return "";
  if (i >= cues.length) return "";
  return cues[i];
}

function render() {
  els.linePrev.textContent = getCue(index - 1);
  els.lineNow.textContent  = getCue(index);
  els.lineNext.textContent = getCue(index + 1);
}

function advance() {
  if (!cues.length) return;

  if (LOOP) {
    index = (index + 1) % cues.length;
  } else {
    index = Math.min(index + 1, cues.length - 1);
  }
  render();
}

function back() {
  if (!cues.length) return;

  if (LOOP) {
    index = (index - 1 + cues.length) % cues.length;
  } else {
    index = Math.max(index - 1, 0);
  }
  render();
}

function showHintOnce() {
  if (!SHOW_HINT) return;

  const hint = document.createElement("div");
  hint.style.position = "absolute";
  hint.style.top = "20px";
  hint.style.left = "20px";
  hint.style.padding = "8px 10px";
  hint.style.borderRadius = "10px";
  hint.style.border = "1px solid rgba(255,255,255,0.18)";
  hint.style.background = "rgba(10,10,10,0.7)";
  hint.style.color = "#fff";
  hint.style.fontFamily = "system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif";
  hint.style.fontSize = "12px";
  hint.style.fontWeight = "800";
  hint.style.letterSpacing = "0.3px";
  hint.style.textShadow = "0 2px 10px rgba(0,0,0,0.8)";
  hint.style.userSelect = "none";
  hint.textContent = "SPACE = next • SHIFT+SPACE = back • click/tap = next";

  els.stage.appendChild(hint);

  hintTimeout = window.setTimeout(() => {
    hint.remove();
  }, 3500);
}

// Key controls
window.addEventListener("keydown", (e) => {
  // prevent page scroll on space
  if (e.code === ADVANCE_KEY) e.preventDefault();

  if (e.code === ADVANCE_KEY && e.shiftKey) {
    back();
    return;
  }

  if (e.code === ADVANCE_KEY) {
    advance();
  }
}, { passive: false });

// Click/tap to advance
els.stage.addEventListener("pointerdown", () => {
  advance();
});

// Init
render();
showHintOnce();
