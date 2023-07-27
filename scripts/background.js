chrome.runtime.onInstalled.addListener(function(details) {
    if (details.reason === "install") {
// default option params
        chrome.storage.sync.set({
        "api-key": "",
        "api-secret": "",
        "add-people-endpoint": "",
        "check-people-endpoint": "",
        "fetch-people-info-endpoint": ""
      });
    }
  });
  