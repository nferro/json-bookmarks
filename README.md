# json-bookmarks 

A Google Chrome extension that allows you to import / export bookmarks in JSON format.

## JSON format
The expected / generated format is as follows:
```
[
  {
    "title": "JSON Bookmarks on Web store",
    "url": "https://chrome.google.com/webstore/detail/js-bookmark-importer/fcagljipfanjdjphdfhfehfdjkpiefbd/related?utm_source=chrome-ntp-icon"
  },
  {
    "title": "JSON Bookmarks on GitHub",
    "url": "https://github.com/nferro/json-bookmarks"
  },
  {
    "title": "Sub folder",
    "items": [
      {
        "title": "Google",
        "url": "http://www.google.com/"
      },
      {
        "title": "Trial Website",
        "url": "http://trial.local.skystore.com/"
      }
  }
]
```