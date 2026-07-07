// Minimal service worker. Nothing needs to run in the background today —
// scraping happens in content scripts / on-demand popup injection, and
// saving is a direct fetch from the popup. Kept as a hook for later (e.g. a
// context-menu "Save this page" entry) rather than removed entirely.
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === "install") {
    chrome.runtime.openOptionsPage();
  }
});
