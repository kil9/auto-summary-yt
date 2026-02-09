const DEFAULT_OPTIONS = {
  showButton: true,
  autoInject: true,
  openInBackgroundTab: true
};

const showButton = document.getElementById("showButton");
const autoInject = document.getElementById("autoInject");
const openInBackgroundTab = document.getElementById("openInBackgroundTab");

function loadOptions() {
  chrome.storage.sync.get(DEFAULT_OPTIONS, (items) => {
    showButton.checked = Boolean(items.showButton);
    autoInject.checked = Boolean(items.autoInject);
    openInBackgroundTab.checked = Boolean(items.openInBackgroundTab);
  });
}

function saveOptions() {
  chrome.storage.sync.set({
    showButton: showButton.checked,
    autoInject: autoInject.checked,
    openInBackgroundTab: openInBackgroundTab.checked
  });
}

showButton.addEventListener("change", saveOptions);
autoInject.addEventListener("change", saveOptions);
openInBackgroundTab.addEventListener("change", saveOptions);

loadOptions();
