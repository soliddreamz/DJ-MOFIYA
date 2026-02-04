// Base Lyrics Overlay v1 (Auto Demo)
// - No lyrics.json
// - No manual typing
// - Runs automatically forever
// - Built to prove: "OBS can capture a never-freeze text layer"

const els = {
  linePrev: document.getElementById("linePrev"),
  lineNow: document.getElementById("lineNow"),
  lineNext: document.getElementById("lineNext"),

  controls: document.getElementById("controls"),
  toggleControls: document.getElementById("toggleControls"),
  reset: document.getElementById("reset"),

  offsetMs: document.getElementById("offsetMs"),
  offsetOut: document.getElementById("offsetOut"),
  nudgeMinus: document.getElementById("nudgeMinus"),
  nudgePlus: document.getElementById("nudgePlus"),
};

function setOffsetLabel() {
  const v = parseInt(els.offsetMs.value, 10);
  els.offsetOut.textContent = `${v} ms`;
}

let running = true;
let rafId = null;

let t0 = performance.now();
let seconds = 0;

// Auto demo “lyrics”
const demoLines = [
  "TEXT & DECKS — LIVE TEST",
  "BASE LYRICS OVERLAY (AUTO DEMO)",
  "IF THIS NEVER FREEZES, THE PATH IS CLEAN",
  "OBS CAPTURE SHOULD STAY MOVING",
  "NO DJ SOFTWARE LYRICS INVOLVED",
  "NO HDMI OUTPUT INVOLVED",
  "THIS IS PURE BASE-SIDE RENDER",
  "CONTROL LATER — STABILITY FIRST",
  "KEEP WATCHING… IT SHOULD NEVER STOP",
];

function nowSeconds() {
  const offset = parseInt(els.offsetMs.value, 10) / 1000;
  return seconds + offset;
}

function render() {
  // advance “lyric index” every 2.5 seconds, forever
  const t = nowSeconds();
  const idx = Math.floor(t / 2.5);

  const prev = demoLines[(idx - 1 + demoLines.length) % demoLines.length];
  const now  = demoLines[idx % demoLines.length];
  const next = demoLines[(idx + 1) % demoLines.length];

  els.linePrev.textContent = prev;
  els.lineNow.textContent  = now;
  els.lineNext.textContent = next;
}

function tick() {
  if (!running) return;

  const tNow = performance.now();
  seconds = (tNow - t0) / 1000;

  render();
  rafId = requestAnimationFrame(tick);
}

function resetRun() {
  if (rafId) cancelAnimationFrame(rafId);
  t0 = performance.now();
  seconds = 0;
  running = true;
  tick();
}

// Controls (hidden by default)
if (els.toggleControls) {
  els.toggleControls.addEventListener("click", () => {
    els.controls.classList.toggle("hidden");
  });
}
if (els.reset) els.reset.addEventListener("click", resetRun);

if (els.offsetMs) {
  els.offsetMs.addEventListener("input", () => {
    setOffsetLabel();
    render();
  });
}
if (els.nudgeMinus) {
  els.nudgeMinus.addEventListener("click", () => {
    els.offsetMs.value = String(parseInt(els.offsetMs.value, 10) - 100);
    setOffsetLabel();
    render();
  });
}
if (els.nudgePlus) {
  els.nudgePlus.addEventListener("click", () => {
    els.offsetMs.value = String(parseInt(els.offsetMs.value, 10) + 100);
    setOffsetLabel();
    render();
  });
}

setOffsetLabel();
render();
tick();
