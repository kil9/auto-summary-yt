const GEMINI_URL = "https://gemini.google.com/";
const DEFAULT_OPTIONS = {
  showButton: true,
  autoInject: true,
  openInBackgroundTab: true
};

async function getOptions() {
  return new Promise((resolve) => {
    chrome.storage.sync.get(DEFAULT_OPTIONS, (items) => {
      resolve(items);
    });
  });
}

function waitForTabComplete(tabId) {
  return new Promise((resolve) => {
    const listener = (updatedTabId, info) => {
      if (updatedTabId === tabId && info.status === "complete") {
        chrome.tabs.onUpdated.removeListener(listener);
        resolve();
      }
    };
    chrome.tabs.onUpdated.addListener(listener);
  });
}

async function injectUrlIntoGemini(tabId, url) {
  await chrome.scripting.executeScript({
    target: { tabId },
    func: (value) => {
      const candidateSelectors = [
        "textarea",
        "input[type='text']",
        "[contenteditable='true']"
      ];
      let input = null;
      for (const selector of candidateSelectors) {
        input = document.querySelector(selector);
        if (input) break;
      }
      if (!input) return;

      const setValue = () => {
        if (input.isContentEditable) {
          input.focus();
          input.textContent = value;
        } else {
          input.focus();
          input.value = value;
        }
        const event = new Event("input", { bubbles: true });
        input.dispatchEvent(event);
      };

      const clickSendIfReady = () => {
        const sendButtonSelectors = [
          "button[aria-label*='Send']",
          "button[aria-label*='전송']",
          "button[data-testid='send-button']",
          "button[type='submit']"
        ];
        let button = null;
        for (const selector of sendButtonSelectors) {
          button = document.querySelector(selector);
          if (button) break;
        }
        if (button && !button.disabled) {
          button.click();
          return true;
        }
        return false;
      };

      setValue();

      let attempts = 0;
      const maxAttempts = 12;
      const timer = setInterval(() => {
        attempts += 1;
        if (clickSendIfReady() || attempts >= maxAttempts) {
          clearInterval(timer);
        }
      }, 250);
    },
    args: [url]
  });
}

async function openGeminiWithUrl(sourceTab) {
  const { autoInject, openInBackgroundTab } = await getOptions();
  const currentWindow = await chrome.windows.getCurrent();

  const width = currentWindow.width || 1200;
  const height = currentWindow.height || 800;
  const left = currentWindow.left || 0;
  const top = currentWindow.top || 0;
  const leftWidth = Math.max(480, Math.floor(width / 2));
  const rightWidth = Math.max(480, width - leftWidth);

  let geminiTabId = null;
  if (openInBackgroundTab) {
    const geminiTab = await chrome.tabs.create({
      url: GEMINI_URL,
      active: false,
      windowId: currentWindow.id
    });
    geminiTabId = geminiTab?.id ?? null;
  } else {
    await chrome.windows.update(currentWindow.id, {
      left,
      top,
      width: leftWidth,
      height
    });

    const geminiWindow = await chrome.windows.create({
      url: GEMINI_URL,
      left: left + leftWidth,
      top,
      width: rightWidth,
      height,
      type: "popup",
      focused: true
    });

    geminiTabId = geminiWindow.tabs?.[0]?.id ?? null;
  }

  if (!autoInject || !geminiTabId || !sourceTab?.url) return;

  await waitForTabComplete(geminiTabId);
  await injectUrlIntoGemini(geminiTabId, sourceTab.url);
}

chrome.runtime.onMessage.addListener((message, sender) => {
  if (message?.type !== "OPEN_GEMINI") return;
  openGeminiWithUrl(sender.tab || { url: message.url });
});

chrome.commands.onCommand.addListener(async (command) => {
  if (command !== "open-gemini") return;
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab) return;
  openGeminiWithUrl(tab);
});
