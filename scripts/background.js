chrome.webRequest.onBeforeSendHeaders.addListener(
  function(details) {
    modifyRequestHeaders(details, getHeaders());

    return {requestHeaders: details.requestHeaders};
  },
  {urls: []},
  ['requestHeaders', 'blocking']
);

function getHeaders() {
  headers = []

  storedHeaders = localStorage['Headers']
  if (storedHeaders) 
  {
    storedHeaders = JSON.parse(localStorage.Headers)
    for (h in storedHeaders) {
      if (storedHeaders.hasOwnProperty(h)) {
        headers.push({name: h, enabled: storedHeaders[h].enabled, value: storedHeaders[h].value})
      }
    }
  }

  return headers;
}

function modifyRequestHeaders(details, headers) {
  if (!headers) {
    return;
  }
  
  var modified = false

  for (var i = 0, length = headers.length; i < length; ++i) {
    var currHeader = headers[i];
    // Overrides the header if it is enabled and its value is not empty.
    if (currHeader.enabled && currHeader.value) {
      details.requestHeaders.push({name: currHeader.name, value: currHeader.value})
      modified = true
    }
  }

  if (modified) {
    chrome.browserAction.setBadgeText({text: "H", tabId: details.tabId})
  }
};