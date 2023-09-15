chrome.tabs.onUpdated.addListener((tabId, tab) => {
  if (
    tab.url &&
    tab.url.includes(
      "bildung.ihk.de/webcomponent/dibe/AUSZUBILDENDER/berichtsheft/wochenansicht"
    )
  ) {
    chrome.tabs.sendMessage(tabId, {
      loaded: true,
    });
  }
});
