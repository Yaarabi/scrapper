// Popup logic for FB Group Member Exporter Pro

document.addEventListener('DOMContentLoaded', async () => {
  // Elements
  const licenseBadge = document.getElementById('licenseBadge');
  const licenseInputView = document.getElementById('licenseInputView');
  const licenseActiveView = document.getElementById('licenseActiveView');
  const licenseKeyInput = document.getElementById('licenseKeyInput');
  const apiUrlInput = document.getElementById('apiUrlInput');
  const serverUrlGroup = document.getElementById('serverUrlGroup');
  const toggleLicenseSettings = document.getElementById('toggleLicenseSettings');
  const btnActivate = document.getElementById('btnActivate');
  const btnChangeLicense = document.getElementById('btnChangeLicense');
  const licenseError = document.getElementById('licenseError');
  const subscriberName = document.getElementById('subscriberName');
  const subscriberExpiry = document.getElementById('subscriberExpiry');
  const subscriberDays = document.getElementById('subscriberDays');

  const statusDot = document.getElementById('statusDot');
  const pageStatusHeading = document.getElementById('pageStatusHeading');
  const pageStatusDetail = document.getElementById('pageStatusDetail');
  const btnOpenFb = document.getElementById('btnOpenFb');

  // Mode & Large Group Controls
  const modeFresh = document.getElementById('modeFresh');
  const modeResume = document.getElementById('modeResume');
  const batchSize = document.getElementById('batchSize');
  const skipPrevious = document.getElementById('skipPrevious');
  const groupHistoryCard = document.getElementById('groupHistoryCard');
  const historyCount = document.getElementById('historyCount');
  const btnClearHistory = document.getElementById('btnClearHistory');

  const maxMembers = document.getElementById('maxMembers');
  const scrollDelay = document.getElementById('scrollDelay');
  const exportFormat = document.getElementById('exportFormat');
  const idsOnly = document.getElementById('idsOnly');

  const statsSection = document.getElementById('statsSection');
  const statCollected = document.getElementById('statCollected');
  const statWithIds = document.getElementById('statWithIds');
  const statScrolls = document.getElementById('statScrolls');
  const progressBar = document.getElementById('progressBar');
  const liveStatusText = document.getElementById('liveStatusText');

  const btnStart = document.getElementById('btnStart');
  const btnStop = document.getElementById('btnStop');
  const portalLink = document.getElementById('portalLink');

  let activeTabId = null;
  let isPageValid = false;
  let isLicenseValid = false;
  let currentMode = 'fresh'; // 'fresh' or 'resume'

  // 1. Settings toggle for API Server URL
  toggleLicenseSettings.addEventListener('click', () => {
    serverUrlGroup.classList.toggle('hidden');
  });

  // Mode Selection Handlers
  modeFresh.addEventListener('click', () => {
    currentMode = 'fresh';
    modeFresh.classList.add('active');
    modeResume.classList.remove('active');
  });

  modeResume.addEventListener('click', () => {
    currentMode = 'resume';
    modeResume.classList.add('active');
    modeFresh.classList.remove('active');
  });

  // 2. Load stored license & settings
  const storage = await chrome.storage.local.get([
    'licenseKey', 'apiUrl', 'maxMembers', 'scrollDelay', 'exportFormat', 'idsOnly',
    'batchSize', 'skipPrevious', 'extractionMode'
  ]);

  const defaultApiUrl = 'https://exporter.yurafy.com';
  const apiUrl = storage.apiUrl || defaultApiUrl;
  apiUrlInput.value = apiUrl;
  portalLink.href = `${apiUrl}/dashboard`;

  if (storage.maxMembers) maxMembers.value = storage.maxMembers;
  if (storage.scrollDelay) scrollDelay.value = storage.scrollDelay;
  if (storage.exportFormat) exportFormat.value = storage.exportFormat;
  if (storage.idsOnly !== undefined) idsOnly.checked = storage.idsOnly;
  if (storage.batchSize !== undefined) batchSize.value = storage.batchSize;
  if (storage.skipPrevious !== undefined) skipPrevious.checked = storage.skipPrevious;

  if (storage.extractionMode === 'resume') {
    currentMode = 'resume';
    modeResume.classList.add('active');
    modeFresh.classList.remove('active');
  }

  if (storage.licenseKey) {
    licenseKeyInput.value = storage.licenseKey;
    await checkLicense(storage.licenseKey, apiUrl);
  } else {
    showLicenseInactive('No License Key');
  }

  // 3. License verification
  async function checkLicense(key, url) {
    licenseBadge.textContent = 'Verifying...';
    licenseBadge.className = 'status-badge badge-pending';
    licenseError.classList.add('hidden');

    try {
      const response = await fetch(`${url}/api/license/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ licenseKey: key.trim() }),
      });

      const data = await response.json();

      if (response.ok && data.valid) {
        isLicenseValid = true;
        licenseBadge.textContent = 'Active';
        licenseBadge.className = 'status-badge badge-active';

        const expiresAt = new Date(data.expiresAt);
        const now = new Date();
        const diffMs = expiresAt - now;
        const diffDays = Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));

        subscriberName.textContent = data.name || 'Licensed User';
        subscriberExpiry.textContent = expiresAt.toLocaleDateString(undefined, {
          year: 'numeric', month: 'short', day: 'numeric'
        });
        subscriberDays.textContent = `${diffDays} days left`;

        licenseInputView.classList.add('hidden');
        licenseActiveView.classList.remove('hidden');

        await chrome.storage.local.set({ licenseKey: key.trim(), apiUrl: url });
      } else {
        isLicenseValid = false;
        showLicenseInactive(data.message || 'Subscription Expired / Invalid');
      }
    } catch (err) {
      isLicenseValid = false;
      showLicenseInactive('Cannot reach SaaS server');
      licenseError.textContent = `Error connecting to ${url}. Make sure your internet connection or server is active.`;
      licenseError.classList.remove('hidden');
    }

    updateStartButtonState();
  }

  function showLicenseInactive(reason) {
    licenseBadge.textContent = 'Inactive';
    licenseBadge.className = 'status-badge badge-expired';
    licenseInputView.classList.remove('hidden');
    licenseActiveView.classList.add('hidden');
    licenseError.textContent = reason;
    licenseError.classList.remove('hidden');
  }

  btnActivate.addEventListener('click', async () => {
    const key = licenseKeyInput.value.trim();
    const url = apiUrlInput.value.trim() || defaultApiUrl;
    if (!key) {
      licenseError.textContent = 'Please enter your license key.';
      licenseError.classList.remove('hidden');
      return;
    }
    await checkLicense(key, url);
  });

  btnChangeLicense.addEventListener('click', () => {
    licenseInputView.classList.remove('hidden');
    licenseActiveView.classList.add('hidden');
  });

  // 4. Save form settings on change
  [maxMembers, scrollDelay, exportFormat, idsOnly, batchSize, skipPrevious].forEach(elem => {
    elem.addEventListener('change', () => {
      chrome.storage.local.set({
        maxMembers: parseInt(maxMembers.value, 10),
        scrollDelay: parseFloat(scrollDelay.value),
        exportFormat: exportFormat.value,
        idsOnly: idsOnly.checked,
        batchSize: batchSize.value,
        skipPrevious: skipPrevious.checked,
        extractionMode: currentMode,
      });
    });
  });

  // Clear Group History button
  btnClearHistory.addEventListener('click', () => {
    if (!activeTabId) return;
    if (confirm('Clear saved history for this group? Next export will re-collect members from the beginning.')) {
      chrome.tabs.sendMessage(activeTabId, { action: 'CLEAR_HISTORY' }, (res) => {
        if (res && res.success) {
          historyCount.textContent = '0';
          groupHistoryCard.classList.add('hidden');
        }
      });
    }
  });

  // Direct Group URL Navigation
  const directGroupInput = document.getElementById('directGroupInput');
  const btnGoGroup = document.getElementById('btnGoGroup');

  function navigateToGroupMembers() {
    const raw = directGroupInput.value.trim();
    if (!raw) return;

    let targetUrl = '';
    if (/^[A-Za-z0-9.]+$/.test(raw)) {
      targetUrl = `https://www.facebook.com/groups/${raw}/members/`;
    } else {
      try {
        const parsed = new URL(raw.startsWith('http') ? raw : `https://${raw}`);
        const parts = parsed.pathname.split('/').filter(Boolean);
        const groupIdx = parts.indexOf('groups');
        if (groupIdx !== -1 && parts.length > groupIdx + 1) {
          const slug = parts[groupIdx + 1];
          targetUrl = `https://www.facebook.com/groups/${slug}/members/`;
        } else {
          targetUrl = raw;
        }
      } catch (e) {
        targetUrl = `https://www.facebook.com/groups/${raw}/members/`;
      }
    }

    if (activeTabId) {
      chrome.tabs.update(activeTabId, { url: targetUrl });
    } else {
      chrome.tabs.create({ url: targetUrl });
    }
  }

  btnGoGroup.addEventListener('click', navigateToGroupMembers);
  directGroupInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') navigateToGroupMembers();
  });

  // 5. Detect active tab and Facebook page
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  activeTabId = tab?.id;

  if (tab && tab.url) {
    try {
      const url = new URL(tab.url);
      const isFb = url.hostname.includes('facebook.com');

      if (isFb) {
        chrome.tabs.sendMessage(activeTabId, { action: 'CHECK_PAGE' }, (response) => {
          if (chrome.runtime.lastError || !response) {
            chrome.scripting.executeScript({
              target: { tabId: activeTabId },
              files: ['content.js']
            }, () => {
              chrome.tabs.sendMessage(activeTabId, { action: 'CHECK_PAGE' }, (res2) => {
                handlePageCheck(res2);
              });
            });
          } else {
            handlePageCheck(response);
          }
        });
      } else {
        handleNonFbPage();
      }
    } catch (e) {
      handleNonFbPage();
    }
  }

  function handlePageCheck(response) {
    if (response && response.isMembersPage) {
      isPageValid = true;
      statusDot.className = 'status-dot dot-green';
      pageStatusHeading.textContent = `Group: ${response.groupSlug || 'Members'}`;
      pageStatusDetail.textContent = 'Ready to extract member list';
      btnOpenFb.classList.add('hidden');

      // Check saved history count
      chrome.tabs.sendMessage(activeTabId, { action: 'GET_HISTORY_COUNT' }, (histRes) => {
        if (histRes && histRes.count > 0) {
          historyCount.textContent = histRes.count.toLocaleString();
          groupHistoryCard.classList.remove('hidden');
        } else {
          groupHistoryCard.classList.add('hidden');
        }
      });

      // If already has items in session, suggest resume
      if (response.existingCount > 0) {
        modeResume.click();
      }

      if (response.isScraping) {
        setRunningState(true);
      }
    } else {
      isPageValid = false;
      statusDot.className = 'status-dot dot-red';
      pageStatusHeading.textContent = 'Not on Members Tab';
      pageStatusDetail.textContent = 'Open the group and click on "Members" or "People" tab';
      btnOpenFb.classList.remove('hidden');
      groupHistoryCard.classList.add('hidden');
    }
    updateStartButtonState();
  }

  function handleNonFbPage() {
    isPageValid = false;
    statusDot.className = 'status-dot dot-gray';
    pageStatusHeading.textContent = 'Facebook Not Active';
    pageStatusDetail.textContent = 'Open a Facebook Group members page';
    btnOpenFb.classList.remove('hidden');
    groupHistoryCard.classList.add('hidden');
    updateStartButtonState();
  }

  btnOpenFb.addEventListener('click', () => {
    chrome.tabs.create({ url: 'https://www.facebook.com/groups/' });
  });

  function updateStartButtonState() {
    btnStart.disabled = !(isLicenseValid && isPageValid);
  }

  function setRunningState(running) {
    if (running) {
      btnStart.classList.add('hidden');
      btnStop.classList.remove('hidden');
      statsSection.classList.remove('hidden');
      liveStatusText.textContent = 'Scrolling and collecting rendered members...';
    } else {
      btnStart.classList.remove('hidden');
      btnStop.classList.add('hidden');
      liveStatusText.textContent = 'Extraction finished or stopped.';
    }
  }

  // 6. Start extraction
  btnStart.addEventListener('click', () => {
    if (!activeTabId || !isLicenseValid || !isPageValid) return;

    const options = {
      maxMembers: parseInt(maxMembers.value, 10) || 1000,
      scrollDelay: parseFloat(scrollDelay.value) || 2.5,
      exportFormat: exportFormat.value,
      idsOnly: idsOnly.checked,
      resumeMode: currentMode === 'resume',
      skipPrevious: skipPrevious.checked,
      batchSize: parseInt(batchSize.value, 10) || 0,
    };

    chrome.tabs.sendMessage(activeTabId, {
      action: 'START_SCRAPING',
      options
    }, () => {
      setRunningState(true);
      if (currentMode !== 'resume') {
        statCollected.textContent = '0';
        statWithIds.textContent = '0';
        statScrolls.textContent = '0';
        progressBar.style.width = '0%';
      }
    });
  });

  // 7. Stop extraction
  btnStop.addEventListener('click', () => {
    if (!activeTabId) return;
    liveStatusText.textContent = 'Stopping and saving export...';
    btnStop.disabled = true;

    chrome.tabs.sendMessage(activeTabId, { action: 'STOP_SCRAPING' }, () => {
      setTimeout(() => {
        setRunningState(false);
        btnStop.disabled = false;
      }, 1000);
    });
  });

  // 8. Listen for progress updates
  chrome.runtime.onMessage.addListener((message) => {
    if (message.type === 'PROGRESS_UPDATE') {
      const data = message.data;
      statCollected.textContent = data.collected || 0;
      statWithIds.textContent = data.withIds || 0;
      statScrolls.textContent = data.scrolls || 0;
      liveStatusText.textContent = data.status || 'Extracting...';

      const max = parseInt(maxMembers.value, 10) || 1000;
      const pct = Math.min(100, Math.round(((data.collected || 0) / max) * 100));
      progressBar.style.width = `${pct}%`;
    } else if (message.type === 'SCRAPING_COMPLETE') {
      const data = message.data;
      setRunningState(false);
      statCollected.textContent = data.total;
      statWithIds.textContent = data.withIds;
      liveStatusText.textContent = `Completed! ${data.total} members exported.`;
      progressBar.style.width = '100%';

      if (data.totalHistory) {
        historyCount.textContent = data.totalHistory.toLocaleString();
        groupHistoryCard.classList.remove('hidden');
      }
    }
  });
});
