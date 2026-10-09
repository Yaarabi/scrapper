// Background Service Worker for FB Group Member Exporter Pro

chrome.runtime.onInstalled.addListener(() => {
  console.log('[FB Exporter] Extension installed.');
});

// Handle file downloads from content script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'DOWNLOAD_FILE') {
    const { filename, content, mimeType } = message.data;
    
    // Create base64 or URI encoded data URL for download
    const encodedData = 'data:' + mimeType + ',' + encodeURIComponent(content);
    
    chrome.downloads.download({
      url: encodedData,
      filename: filename,
      saveAs: false // Save automatically in user's default downloads folder
    }, (downloadId) => {
      if (chrome.runtime.lastError) {
        console.error('[FB Exporter] Download error:', chrome.runtime.lastError);
        sendResponse({ success: false, error: chrome.runtime.lastError.message });
      } else {
        console.log('[FB Exporter] Download initiated with ID:', downloadId);
        sendResponse({ success: true, downloadId });
      }
    });
    return true; // Asynchronous sendResponse
  }
});
