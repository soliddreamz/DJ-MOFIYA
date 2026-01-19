const fs = require("fs");

function extractJson(issueBody) {
  if (!issueBody) throw new Error("ISSUE_BODY missing");

  const marker = "DASHBOARD_UPDATE";
  const i = issueBody.indexOf(marker);
  if (i === -1) throw new Error("Marker not found in issue body");

  const fenceStart = issueBody.indexOf("```json", i);
  const fenceEnd = issueBody.indexOf("```", fenceStart + 6);
  if (fenceStart === -1 || fenceEnd === -1) throw new Error("JSON fence not found");

  const jsonText = issueBody.slice(fenceStart + "```json".length, fenceEnd).trim();
  return JSON.parse(jsonText);
}

function validate(payload) {
  if (!payload || typeof payload !== "object") throw new Error("Invalid payload");
  if (!payload.app || typeof payload.app !== "object") throw new Error("Missing app");
  if (!payload.live || typeof payload.live !== "object") throw new Error("Missing live");
  if (!Array.isArray(payload.app.links)) payload.app.links = [];
  if (typeof payload.live.isLive !== "boolean") payload.live.isLive = false;
  if (typeof payload.live.archive !== "boolean") payload.live.archive = false;
  if (typeof payload.live.streamUrl !== "string") payload.live.streamUrl = "";
  if (typeof payload.app.name !== "string") payload.app.name = "Creator";
  if (typeof payload.app.bio !== "string") payload.app.bio = "";
  return payload;
}

function main() {
  const issueBody = process.env.ISSUE_BODY || "";
  const payload = validate(extractJson(issueBody));

  const out = {
    app: {
      name: payload.app.name.trim(),
      bio: payload.app.bio.trim(),
      links: payload.app.links.map((l) => ({
        label: String(l.label ?? "").trim(),
        url: String(l.url ?? "").trim()
      })).filter((l) => l.label && l.url)
    },
    live: {
      isLive: !!payload.live.isLive,
      streamUrl: String(payload.live.streamUrl ?? "").trim(),
      archive: !!payload.live.archive
    }
  };

  fs.writeFileSync("content.json", JSON.stringify(out, null, 2) + "\n", "utf8");
  console.log("Applied payload to content.json");
}

main();
