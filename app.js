// app.js (DJ-MOFIYA) — Pilot 7: Live Presence v1 (Reflection only)
// Source of truth: content.dashboard.live + content.dashboard.app
// Fan-side: text-only indicator + optional link (no iframe, no autoplay)

async function loadContent() {
  const res = await fetch("content.json", { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to load content.json");
  return await res.json();
}

function esc(s) {
  return String(s ?? "").replace(/[&<>"']/g, (c) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  }[c]));
}

function renderLinks(links) {
  if (!Array.isArray(links) || links.length === 0) return "";
  return `
    <div class="card">
      <h3>Links</h3>
      <ul>
        ${links
          .map(
            (l) =>
              `<li><a href="${esc(l.url)}" target="_blank" rel="noopener noreferrer">${esc(l.label)}</a></li>`
          )
          .join("")}
      </ul>
    </div>
  `;
}

async function render() {
  const root = document.getElementById("app");
  if (!root) return;

  root.innerHTML = `<div class="card">Loading…</div>`;

  try {
    const content = await loadContent();

    // Source of truth (Pilot 7): dashboard.*
    const dashboard = content?.dashboard || {};
    const app = dashboard?.app || content?.app || {};
    const live = dashboard?.live || content?.live || {};

    const isLive = live?.isLive === true;
    const streamUrl = typeof live?.streamUrl === "string" ? live.streamUrl.trim() : "";

    // Base app header (always)
    let html = `
      <div class="card">
        <h1>${esc(app?.name || "Creator")}</h1>
        <p>${esc(app?.bio || "")}</p>
      </div>
    `;

    // Live Presence v1 (fan-safe, text-only)
    if (isLive && streamUrl) {
      html += `
        <div class="card">
          <p><strong>${esc(app?.name || "Creator")} is live now.</strong></p>
          <p><a href="${esc(streamUrl)}" target="_blank" rel="noopener noreferrer">Watch live</a></p>
        </div>
      `;
    }

    // Links (optional)
    html += renderLinks(app?.links);

    root.innerHTML = html;
  } catch (e) {
    root.innerHTML = `<div class="card"><strong>Error:</strong> ${esc(e.message)}</div>`;
  }
}

render();
