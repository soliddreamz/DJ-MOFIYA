async function loadContent() {
  const res = await fetch("../content.json", { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to load content.json");
  return await res.json();
}

function pretty(v) {
  return JSON.stringify(v, null, 2);
}

function safeJsonParse(text, fallback) {
  try { return JSON.parse(text); } catch { return fallback; }
}

function buildIssueBody(payload) {
  // Machine-parseable block for the action script
  return [
    "DASHBOARD_UPDATE",
    "```json",
    pretty(payload),
    "```"
  ].join("\n");
}

function openPrefilledIssue({ title, body, labels }) {
  const params = new URLSearchParams();
  params.set("title", title);
  params.set("body", body);
  if (labels && labels.length) params.set("labels", labels.join(","));
  // Relative link to GitHub issue chooser (works on Pages)
  window.location.href = `../.github/ISSUE_TEMPLATE/dashboard-update.yml?${params.toString()}`;
}

async function init() {
  const content = await loadContent();

  document.getElementById("name").value = content.app?.name ?? "";
  document.getElementById("bio").value = content.app?.bio ?? "";
  document.getElementById("links").value = pretty(content.app?.links ?? []);
  document.getElementById("isLive").checked = !!content.live?.isLive;
  document.getElementById("archive").checked = !!content.live?.archive;
  document.getElementById("streamUrl").value = content.live?.streamUrl ?? "";

  document.getElementById("debug").textContent = pretty(content);

  document.getElementById("openIssue").onclick = () => {
    const payload = {
      app: {
        name: document.getElementById("name").value.trim(),
        bio: document.getElementById("bio").value.trim(),
        links: safeJsonParse(document.getElementById("links").value.trim(), [])
      },
      live: {
        isLive: document.getElementById("isLive").checked,
        archive: document.getElementById("archive").checked,
        streamUrl: document.getElementById("streamUrl").value.trim()
      }
    };

    const title = `Dashboard Update: ${payload.app.name || "Creator"}`;
    const body = buildIssueBody(payload);

    // This works once the repo is live on GitHub Pages because the dashboard is in the same repo.
    // We route to "new issue" using GitHub UI instead of secrets.
    const repoPath = window.location.pathname.split("/").filter(Boolean)[0]; // e.g. dj-mofiya
    // NOTE: GitHub Pages path could include username; we detect it by hostname.
    // We’ll use a robust target: open GitHub new issue directly:
    const owner = (window.location.hostname.includes("github.io")) ? window.location.pathname.split("/").filter(Boolean)[0] : "";
    // Best approach: hard link to GitHub new issue relative cannot be derived reliably on Pages.
    // So we use an instruction-less URL pattern by reading from a meta tag is overkill.
    // Instead: open a link the user will set once using Pages; to avoid manual edits, we use relative repository link:
    // When viewing dashboard in GitHub (not Pages), this will work.
    // On Pages, creator can use the Repo Issues tab; still no copy/paste.

    const githubNewIssue = "https://github.com/soliddreamz/dj-mofiya/issues/new?template=dashboard-update.yml";
    const url = new URL(githubNewIssue);
    url.searchParams.set("title", title);
    url.searchParams.set("body", body);
    url.searchParams.set("labels", "dashboard-update");

    window.location.href = url.toString();
  };
}

init().catch((e) => {
  document.body.innerHTML = `<pre style="white-space:pre-wrap;color:#b00">${e.message}</pre>`;
});
