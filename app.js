// Pilot 7 — minimal UI renderer (no drift)
// Manual toggle for verification. Later you can wire to a real status endpoint/API.
const PILOT = {
  title: "DJ Mo Fiya",
  tagline: "Live DJ sets. Culture first.",
  isLive: true, // <-- for verification: set true when testing live, false when offline
  watchText: "Watch live",
  watchHref: "live.html",
  links: [
    { label: "Home", href: "./" },
  ],
};

function h(tag, attrs = {}, children = []) {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (k === "class") el.className = v;
    else if (k === "html") el.innerHTML = v;
    else el.setAttribute(k, v);
  }
  for (const child of children) {
    if (child == null) continue;
    if (typeof child === "string") el.appendChild(document.createTextNode(child));
    else el.appendChild(child);
  }
  return el;
}

function card(children = []) {
  return h("div", { class: "card" }, children);
}

function render() {
  const mount = document.getElementById("app");
  if (!mount) return;

  mount.innerHTML = "";

  // Title card
  mount.appendChild(
    card([
      h("div", { html: `<div style="font-size:44px;font-weight:800;letter-spacing:-.02em;">${PILOT.title}</div>` }),
      h("div", { html: `<div style="font-size:28px;font-weight:700;margin-top:10px;">${PILOT.tagline}</div>` }),
    ])
  );

  // Live card (only if isLive)
  if (PILOT.isLive) {
    mount.appendChild(
      card([
        h("div", { html: `<div style="font-size:34px;font-weight:800;letter-spacing:-.02em;">${PILOT.title} is live now.</div>` }),
        h("div", { style: "margin-top:10px;" }, [
          h("a", { href: PILOT.watchHref, style: "font-size:30px;font-weight:800;text-decoration:underline;" }, [PILOT.watchText]),
        ]),
      ])
    );
  }

  // Links card
  const ul = h("ul", { style: "margin:10px 0 0 28px; font-size:34px; font-weight:800;" });
  for (const item of PILOT.links) {
    ul.appendChild(h("li", {}, [h("a", { href: item.href, style: "text-decoration:underline;" }, [item.label])]));
  }

  mount.appendChild(
    card([
      h("div", { html: `<div style="font-size:44px;font-weight:900;letter-spacing:-.02em;">Links</div>` }),
      ul,
    ])
  );
}

render();
