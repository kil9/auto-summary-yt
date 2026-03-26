const DEFAULT_OPTIONS = {
  showButton: true
};

const BUTTON_ID = "auto-summary-yt-button";
let observer = null;

function getTitleElement() {
  return (
    document.querySelector("ytd-watch-metadata h1") ||
    document.querySelector("#title h1")
  );
}

function insertAfter(target, node) {
  const parent = target.parentNode;
  if (!parent) return;
  if (target.nextSibling) {
    parent.insertBefore(node, target.nextSibling);
  } else {
    parent.appendChild(node);
  }
}

function createButton() {
  if (document.getElementById(BUTTON_ID)) return true;

  const titleElement = getTitleElement();
  if (!titleElement) return false;

  const button = document.createElement("button");
  button.id = BUTTON_ID;
  button.type = "button";
  button.style.display = "inline-flex";
  button.style.alignItems = "center";
  button.style.height = "36px";
  button.style.padding = "0 16px";
  button.style.borderRadius = "18px";
  button.style.border = "none";
  button.style.background = "var(--yt-spec-badge-chip-background, rgba(0,0,0,0.05))";
  button.style.color = "var(--yt-spec-text-primary, #0f0f0f)";
  button.style.fontFamily = "Roboto, Arial, sans-serif";
  button.style.fontSize = "14px";
  button.style.fontWeight = "500";
  button.style.cursor = "pointer";
  button.style.marginLeft = "8px";
  button.style.verticalAlign = "middle";
  button.style.whiteSpace = "nowrap";
  button.style.gap = "6px";

  const icon = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  icon.setAttribute("viewBox", "0 0 28 28");
  icon.setAttribute("width", "18");
  icon.setAttribute("height", "18");
  icon.setAttribute("aria-hidden", "true");
  icon.style.flexShrink = "0";
  const defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");
  const grad = document.createElementNS("http://www.w3.org/2000/svg", "linearGradient");
  grad.setAttribute("id", "asy-gemini-grad");
  grad.setAttribute("x1", "0%");
  grad.setAttribute("y1", "0%");
  grad.setAttribute("x2", "100%");
  grad.setAttribute("y2", "100%");
  [["0%", "#4285f4"], ["50%", "#9c59d1"], ["100%", "#ea4335"]].forEach(([offset, color]) => {
    const stop = document.createElementNS("http://www.w3.org/2000/svg", "stop");
    stop.setAttribute("offset", offset);
    stop.setAttribute("stop-color", color);
    grad.appendChild(stop);
  });
  defs.appendChild(grad);
  icon.appendChild(defs);
  const star = document.createElementNS("http://www.w3.org/2000/svg", "path");
  star.setAttribute("d", "M14 2C14 8.627 8.627 14 2 14C8.627 14 14 19.373 14 26C14 19.373 19.373 14 26 14C19.373 14 14 8.627 14 2Z");
  star.setAttribute("fill", "url(#asy-gemini-grad)");
  icon.appendChild(star);

  const label = document.createElement("span");
  label.textContent = "요약";

  button.appendChild(icon);
  button.appendChild(label);

  button.addEventListener("mouseover", () => {
    button.style.background = "var(--yt-spec-10-percent-layer, rgba(0,0,0,0.1))";
  });
  button.addEventListener("mouseout", () => {
    button.style.background = "var(--yt-spec-badge-chip-background, rgba(0,0,0,0.05))";
  });

  button.addEventListener("click", () => {
    chrome.runtime.sendMessage({
      type: "OPEN_GEMINI",
      url: window.location.href
    });
  });

  insertAfter(titleElement, button);
  return true;
}

function removeButton() {
  const button = document.getElementById(BUTTON_ID);
  if (button) button.remove();
}

function startObserver() {
  if (observer || !document.body) return;
  observer = new MutationObserver(() => {
    if (document.getElementById(BUTTON_ID)) return;
    createButton();
  });
  observer.observe(document.body, { childList: true, subtree: true });
}

function stopObserver() {
  if (!observer) return;
  observer.disconnect();
  observer = null;
}

function updateButtonVisibility(showButton) {
  if (showButton) {
    const created = createButton();
    if (!created) startObserver();
  } else {
    removeButton();
    stopObserver();
  }
}

function init() {
  chrome.storage.sync.get(DEFAULT_OPTIONS, (items) => {
    updateButtonVisibility(items.showButton);
  });

  chrome.storage.onChanged.addListener((changes, area) => {
    if (area !== "sync" || !changes.showButton) return;
    updateButtonVisibility(changes.showButton.newValue);
  });

  document.addEventListener("yt-navigate-finish", () => {
    if (document.getElementById(BUTTON_ID)) return;
    chrome.storage.sync.get(DEFAULT_OPTIONS, (items) => {
      if (items.showButton) updateButtonVisibility(true);
    });
  });
}

init();
