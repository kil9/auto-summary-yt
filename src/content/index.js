const DEFAULT_OPTIONS = {
  showButton: true
};

const BUTTON_ID = "auto-summary-yt-button";

function createButton() {
  if (document.getElementById(BUTTON_ID)) return;

  const button = document.createElement("button");
  button.id = BUTTON_ID;
  button.type = "button";
  button.textContent = "Gemini";
  button.style.position = "fixed";
  button.style.right = "16px";
  button.style.bottom = "16px";
  button.style.zIndex = "2147483647";
  button.style.padding = "8px 12px";
  button.style.borderRadius = "999px";
  button.style.border = "1px solid #e1e3e6";
  button.style.background = "#ffffff";
  button.style.color = "#111111";
  button.style.fontSize = "12px";
  button.style.cursor = "pointer";
  button.style.boxShadow = "0 2px 8px rgba(0, 0, 0, 0.15)";

  button.addEventListener("click", () => {
    chrome.runtime.sendMessage({
      type: "OPEN_GEMINI",
      url: window.location.href
    });
  });

  document.documentElement.appendChild(button);
}

function removeButton() {
  const button = document.getElementById(BUTTON_ID);
  if (button) button.remove();
}

function updateButtonVisibility(showButton) {
  if (showButton) {
    createButton();
  } else {
    removeButton();
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
}

init();
