async function loadContent() {
  const res = await fetch('../app/content.json');
  return await res.json();
}

async function saveContent(data) {
  // for now: manual save / local dev
  console.log("SAVE THIS JSON:", JSON.stringify(data, null, 2));
}

document.getElementById('save').onclick = async () => {
  const content = await loadContent();
  content.live.streamUrl = document.getElementById('streamUrl').value;
  await saveContent(content);
};

document.getElementById('goLive').onclick = async () => {
  const content = await loadContent();
  content.live.isLive = true;
  await saveContent(content);
};

document.getElementById('endLive').onclick = async () => {
  const content = await loadContent();
  content.live.isLive = false;
  content.live.streamUrl = "";
  await saveContent(content);
};
