const baseUrlInput = document.getElementById("apiBaseUrl");
const tokenInput = document.getElementById("apiToken");
const statusEl = document.getElementById("status");

chrome.storage.sync.get(["apiBaseUrl", "apiToken"], (stored) => {
  if (stored.apiBaseUrl) baseUrlInput.value = stored.apiBaseUrl;
  if (stored.apiToken) tokenInput.value = stored.apiToken;
});

document.getElementById("save").addEventListener("click", () => {
  const apiBaseUrl = baseUrlInput.value.trim().replace(/\/$/, "");
  const apiToken = tokenInput.value.trim();

  chrome.storage.sync.set({ apiBaseUrl, apiToken }, () => {
    statusEl.textContent = "Saved.";
    setTimeout(() => (statusEl.textContent = ""), 2000);
  });
});
