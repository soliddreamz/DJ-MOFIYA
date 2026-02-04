/* Base Lyrics Overlay v1
   - Loads timed lyrics from lyrics.json
   - Renders prev/now/next
   - Uses either:
     A) Audio element currentTime (if you load an audio URL), OR
     B) Manual clock started by Start button (if no audio is loaded)
   - Has a sync offset slider in milliseconds
*/

const els = {
  linePrev: document.getElementById("linePrev"),
  lineNow: document.getElementById("lineNow"),
  lineNext: document.getElementById("lineNext"),

  controls: document.getElementById("controls"),
  toggleControls: document.getElementById("toggleControls"),

  audio: document.getElementById("audio"),
  audioUrl: document.getElementById("audioUrl"),
  loadAudio: document.getElementById("loadAudio"),

  start: document.getElementById("start"),
  pause: document.getElementById("pause"),
  reset: document.getElementById("reset"),

  offsetMs: document.getElementById("offsetMs"),
  offsetOut: document.getElementById("offsetOut"),
  nudgeMinus: document.getElementById("nudgeMinus"),
  nudgePlus: document.getElementById("nudgePlus"),

  lyricsFile: document.getElementById("lyricsFile"),
  reloadLyrics: document.getElementById("reloadLyrics"),
};

let lyrics = [];
let running = false;
let rafId = null;

// Manual clock (when no audio is loaded)
let t0 = 0;           // performance.now() at start
let pausedAt = 0;     // seconds into manual clock at pause
let manualSeconds = 0;

function nowSeconds() {
  const offset = parseInt(els.offsetMs.value, 10) / 1000;

  // If audio is playing or at least loaded, use its clock
  if (els.audio && els.audio.src && !Number.isNaN(els.audio.currentTime)) {
    return (els.audio.currentTime + offset);
  }

  // Otherwise use manual clock
  return (manualSeconds + offset);
}

function setOffsetLabel() {
  const v = parseInt(els.offsetMs.value, 10);
  els.offsetOut.textContent = `${v} ms`;
}

function clampIndex(i) {
  if (i < 0) return 0;
  if (i >= lyrics.length) return lyrics.length - 1;
  return i;
}

function findLyricIndex(t) {
  // lyrics entries must be sorted by t ascending
  // returns last entry with t <= current time
  let lo = 0, hi = lyrics.length - 1, ans = -1;
  while (lo <= hi) {
    const mid = (lo + hi) >> 1;
    if (lyrics[mid].t <= t) {
      ans = mid;
      lo = mid + 1;
    } else {
      hi = mid - 1;
    }
  }
  return ans;
}

function render() {
  if (!lyrics.length) {
    els.linePrev.textContent = "";
    els.lineNow.textContent = "Load lyrics.json";
    els.lineNext.textContent = "";
    return;
  }

  const t = nowSeconds();
  const idx = findLyricIndex(t);

  if (idx < 0) {
    els.linePrev.textContent = "";
    els.lineNow.textContent = "";
    els.lineNext.textContent = lyrics[0].text || "";
    return;
  }

  const prev = lyrics[clampIndex(idx - 1)]?.text || "";
  const now = lyrics[idx]?.text || "";
  const next = lyrics[clampIndex(idx + 1)]?.text || "";

  els.linePrev.textContent = prev;
  els.lineNow.textContent = now;
  els.lineNext.textContent = next;
}

function tick() {
  if (!running) return;

  // advance manual clock if we’re in manual mode
  if (!(els.audio && els.audio.src)) {
    const tNow = performance.now();
    manualSeconds = pausedAt + ((tNow - t0) / 1000);
  }

  render();
  rafId = requestAnimationFrame(tick);
}

function startRun() {
  if (running) return;
  running = true;

  // If audio exists and is loaded, try to play (user gesture required)
  if (els.audio && els.audio.src) {
    els.audio.play().catch(() => {
      // If browser blocks autoplay, manual start still works for text timing.
    });
  } else {
    // Manual clock start
    t0 = performance.now();
  }

  tick();
}

function pauseRun() {
  if (!running) return;
  running = false;

  if (rafId) cancelAnimationFrame(rafId);
  rafId = null;

  if (els.audio && els.audio.src) {
    els.audio.pause();
  } else {
    // capture manual time so we can resume
    pausedAt = manualSeconds;
  }
}

function resetRun() {
  pauseRun();

  if (els.audio && els.audio.src) {
    try { els.audio.currentTime = 0; } catch {}
  }

  t0 = 0;
  pausedAt = 0;
  manualSeconds = 0;

  render();
}

async function loadLyrics() {
  const file = els.lyricsFile.value || "lyrics.json";
  const res = await fetch(file, { cache: "no-store" });
  if (!res.ok) throw new Error(`Failed to load ${file}`);
  const data = await res.json();

  // Expect: [{t: number(seconds), text: string}, ...]
  lyrics = (Array.isArray(data) ? data : [])
    .filter(x => typeof x?.t === "number" && typeof x?.text === "string")
    .sort((a,b) => a.t - b.t);

  render();
}

function loadAudioUrl(url) {
  if (!url) {
    els.audio.removeAttribute("src");
    els.audio.load();
    return;
  }
  els.audio.src = url;
  els.audio.load();
}

// UI wires
els.toggleControls.addEventListener("click", () => {
  els.controls.classList.toggle("hidden");
});

els.loadAudio.addEventListener("click", () => {
  const url = (els.audioUrl.value || "").trim();
  loadAudioUrl(url);
});

els.start.addEventListener("click", startRun);
els.pause.addEventListener("click", pauseRun);
els.reset.addEventListener("click", resetRun);

els.offsetMs.addEventListener("input", () => {
  setOffsetLabel();
  render();
});
els.nudgeMinus.addEventListener("click", () => {
  els.offsetMs.value = String(parseInt(els.offsetMs.value, 10) - 100);
  setOffsetLabel(); render();
});
els.nudgePlus.addEventListener("click", () => {
  els.offsetMs.value = String(parseInt(els.offsetMs.value, 10) + 100);
  setOffsetLabel(); render();
});

els.reloadLyrics.addEventListener("click", async () => {
  try { await loadLyrics(); } catch (e) {
    els.lineNow.textContent = String(e?.message || e);
  }
});

// Init
setOffsetLabel();
loadLyrics().catch(() => {
  els.lineNow.textContent = "Missing lyrics.json (create it next)";
});
render();
