async function loadContent() {
  const res = await fetch("content.json", { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to load content.json");
  return await res.json();
}

function esc(s) {
  return String(s ?? "").replace(/[&<>"']/g, (c) => ({
    "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"
  }[c]));
}

function renderLinks(links) {
  if (!Array.isArray(links) || links.length === 0) return "";
  return `
    <div class="card">
      <h3>Links</h3>
      <ul>
        ${links.map(l => `<li><a href="${esc(l.url)}" target="_blank" rel="noopener">${esc(l.label)}</a></li>`).join("")}
      </ul>
    </div>
  `;
}

async function render() {
  const root = document.getElementById("app");
  root.innerHTML = `<div class="card">Loading…</div>`;

  try {
    const content = await loadContent();
    const { app, live } = content;

    if (live?.isLive && live?.streamUrl) {
      root.innerHTML = `
        <div class="card">
          <h1>LIVE NOW</h1>
          <p>${esc(app?.name || "Creator")}</p>
        </div>
        <div class="card">
          <iframe src="${esc(live.streamUrl)}" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen></iframe>
        </div>
        ${renderLinks(app?.links)}
      `;
      return;
    }

    root.innerHTML = `
      <div class="card">
        <h1>${esc(app?.name || "Creator")}</h1>
        <p>${esc(app?.bio || "")}</p>
      </div>
      ${renderLinks(app?.links)}
      <div class="card">
        <p>Status: <strong>OFFLINE</strong></p>
      </div>
    `;
  } catch (e) {
    root.innerHTML = `<div class="card"><strong>Error:</strong> ${esc(e.message)}</div>`;
  }
}

render();
