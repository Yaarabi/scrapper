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
  btnClearHistory.addEventListener('click', async () => {
    let group = null;
    const inputVal = directGroupInput.value.trim();
    if (inputVal) {
      const g = extractGroupInfo(inputVal);
      if (g) group = g.slug;
    }
    if (!group && tab && tab.url) {
      const g = extractGroupInfo(tab.url);
      if (g) group = g.slug;
    }
    if (!group) return;

    if (confirm(`Clear saved history for group "${group}"? Next export will re-collect members from the beginning.`)) {
      await chrome.storage.local.remove([`fb_history_${group}`]);
      historyCount.textContent = '0';
      groupHistoryCard.classList.add('hidden');
      if (activeTabId) {
        chrome.tabs.sendMessage(activeTabId, { action: 'CLEAR_HISTORY' }, () => {});
      }
    }
  });

  // Direct Group URL Parser & Navigation
  const directGroupInput = document.getElementById('directGroupInput');
  const btnGoGroup = document.getElementById('btnGoGroup');

  function extractGroupInfo(input) {
    if (!input || typeof input !== 'string') return null;
    const str = input.trim();
    if (!str) return null;

    // 1. Direct group ID or clean slug (e.g. "1151260842804020" or "reactdevelopers")
    if (/^[A-Za-z0-9._-]+$/.test(str) && !str.includes('/') && !str.includes('?')) {
      return {
        slug: str,
        isMembers: true,
        membersUrl: `https://www.facebook.com/groups/${str}/members/`
      };
    }

    // 2. Full or partial URL
    try {
      const rawUrl = str.startsWith('http') ? str : `https://${str}`;
      const parsed = new URL(rawUrl);
      if (parsed.hostname.includes('facebook.com')) {
        const parts = parsed.pathname.split('/').filter(Boolean);
        const groupIdx = parts.indexOf('groups');
        if (groupIdx !== -1 && parts.length > groupIdx + 1) {
          const slug = parts[groupIdx + 1];
          const isMembers = parts.includes('members') || parts.includes('people') || parts.includes('user') ||
                            parsed.search.includes('members') || parsed.search.includes('people');
          return {
            slug,
            isMembers,
            membersUrl: `https://www.facebook.com/groups/${slug}/members/`,
            originalUrl: parsed.href
          };
        }
      }
    } catch (e) {}

    return null;
  }

  async function refreshHistoryCount(slug) {
    if (!slug) return;
    try {
      const histKey = `fb_history_${slug}`;
      const res = await chrome.storage.local.get([histKey]);
      const list = res[histKey] || [];
      if (list.length > 0) {
        historyCount.textContent = list.length.toLocaleString();
        groupHistoryCard.classList.remove('hidden');
      } else {
        groupHistoryCard.classList.add('hidden');
      }
    } catch (e) {}
  }

  function waitForTabComplete(tabId) {
    return new Promise((resolve) => {
      let resolved = false;
      const timer = setTimeout(() => {
        if (!resolved) {
          resolved = true;
          chrome.tabs.onUpdated.removeListener(onUpdated);
          resolve();
        }
      }, 5000);

      function onUpdated(tId, changeInfo) {
        if (tId === tabId && changeInfo.status === 'complete') {
          if (!resolved) {
            resolved = true;
            clearTimeout(timer);
            chrome.tabs.onUpdated.removeListener(onUpdated);
            setTimeout(resolve, 1500); // Wait for Facebook SPA rendering
          }
        }
      }
      chrome.tabs.onUpdated.addListener(onUpdated);
    });
  }

  async function ensureContentScriptInjected(tabId) {
    try {
      await chrome.scripting.executeScript({
        target: { tabId },
        files: ['content.js']
      });
    } catch (e) {}
  }

  async function navigateToGroupMembers() {
    const raw = directGroupInput.value.trim();
    const group = extractGroupInfo(raw);
    if (!group) {
      alert('Please enter a valid Facebook Group URL or Group ID.');
      directGroupInput.focus();
      return;
    }

    statusDot.className = 'status-dot dot-green';
    pageStatusHeading.textContent = `Loading: ${group.slug}`;
    pageStatusDetail.textContent = 'Navigating to group members tab...';
    isPageValid = true;
    updateStartButtonState();
    refreshHistoryCount(group.slug);

    if (activeTabId) {
      await chrome.tabs.update(activeTabId, { url: group.membersUrl });
    } else {
      const newTab = await chrome.tabs.create({ url: group.membersUrl });
      activeTabId = newTab.id;
    }
  }

  btnGoGroup.addEventListener('click', navigateToGroupMembers);
  directGroupInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') navigateToGroupMembers();
  });

  // 5. Detect active tab and Facebook page
  let currentTabGroup = null;
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  activeTabId = tab?.id;

  if (tab && tab.url) {
    currentTabGroup = extractGroupInfo(tab.url);
  }

  if (currentTabGroup) {
    isPageValid = true;
    directGroupInput.value = tab.url;
    statusDot.className = 'status-dot dot-green';
    pageStatusHeading.textContent = `Group: ${currentTabGroup.slug}`;

    if (currentTabGroup.isMembers) {
      pageStatusDetail.textContent = 'Ready on Members tab';
      btnOpenFb.classList.add('hidden');
    } else {
      pageStatusDetail.textContent = 'Group detected! Ready (will open Members on Start)';
      btnOpenFb.textContent = 'Switch to Members Tab';
      btnOpenFb.classList.remove('hidden');
      btnOpenFb.onclick = () => {
        chrome.tabs.update(activeTabId, { url: currentTabGroup.membersUrl });
      };
    }

    refreshHistoryCount(currentTabGroup.slug);

    chrome.tabs.sendMessage(activeTabId, { action: 'CHECK_PAGE' }, (response) => {
      if (chrome.runtime.lastError || !response) {
        chrome.scripting.executeScript({
          target: { tabId: activeTabId },
          files: ['content.js']
        }).catch(() => {});
      } else {
        if (response.isScraping) {
          setRunningState(true);
        }
        if (response.existingCount > 0) {
          modeResume.click();
        }
      }
    });
  } else {
    isPageValid = false;
    statusDot.className = 'status-dot dot-gray';
    pageStatusHeading.textContent = 'Enter Group or Open Facebook';
    pageStatusDetail.textContent = 'Paste a group link above or open Facebook';
    btnOpenFb.textContent = 'Open Facebook Groups';
    btnOpenFb.classList.remove('hidden');
    btnOpenFb.onclick = () => {
      chrome.tabs.create({ url: 'https://www.facebook.com/groups/' });
    };
  }

  directGroupInput.addEventListener('input', () => {
    const val = directGroupInput.value.trim();
    const group = extractGroupInfo(val);
    if (group) {
      isPageValid = true;
      statusDot.className = 'status-dot dot-green';
      pageStatusHeading.textContent = `Group: ${group.slug}`;
      pageStatusDetail.textContent = 'Group detected! Click "Start Extraction" to scrape.';
      btnOpenFb.classList.add('hidden');
      updateStartButtonState();
      refreshHistoryCount(group.slug);
    } else if (!currentTabGroup) {
      isPageValid = false;
      statusDot.className = 'status-dot dot-gray';
      pageStatusHeading.textContent = 'Paste Group Link Above';
      pageStatusDetail.textContent = 'Enter a valid group URL or numeric ID';
      updateStartButtonState();
    }
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
  btnStart.addEventListener('click', async () => {
    if (!isLicenseValid) {
      alert('Please activate a valid license first.');
      return;
    }

    // 1. Determine target group
    let targetGroup = extractGroupInfo(directGroupInput.value.trim());
    if (!targetGroup && activeTabId) {
      try {
        const curTab = await chrome.tabs.get(activeTabId);
        if (curTab && curTab.url) {
          targetGroup = extractGroupInfo(curTab.url);
        }
      } catch (e) {}
    }

    if (!targetGroup) {
      alert('Please paste a Facebook Group URL or ID in the input box above.');
      directGroupInput.focus();
      return;
    }

    setRunningState(true);
    liveStatusText.textContent = `Connecting to ${targetGroup.slug}...`;

    // 2. Ensure active tab is on members page
    let tabToUse = null;
    if (activeTabId) {
      try {
        tabToUse = await chrome.tabs.get(activeTabId);
      } catch (e) {
        tabToUse = null;
      }
    }

    if (!tabToUse) {
      tabToUse = await chrome.tabs.create({ url: targetGroup.membersUrl });
      activeTabId = tabToUse.id;
      await waitForTabComplete(activeTabId);
    } else {
      const tabGroup = tabToUse.url ? extractGroupInfo(tabToUse.url) : null;
      const isAlreadyOnMembers = tabGroup && tabGroup.slug === targetGroup.slug && tabGroup.isMembers;

      if (!isAlreadyOnMembers) {
        liveStatusText.textContent = `Navigating to members tab...`;
        await chrome.tabs.update(activeTabId, { url: targetGroup.membersUrl });
        await waitForTabComplete(activeTabId);
      }
    }

    // 3. Inject content script
    await ensureContentScriptInjected(activeTabId);

    // 4. Send START_SCRAPING
    const options = {
      maxMembers: parseInt(maxMembers.value, 10) || 1000,
      scrollDelay: parseFloat(scrollDelay.value) || 2.5,
      exportFormat: exportFormat.value,
      idsOnly: idsOnly.checked,
      resumeMode: currentMode === 'resume',
      skipPrevious: skipPrevious.checked,
      batchSize: parseInt(batchSize.value, 10) || 0,
    };

    chrome.tabs.sendMessage(activeTabId, { action: 'START_SCRAPING', options }, (res) => {
      if (chrome.runtime.lastError || !res) {
        setTimeout(() => {
          chrome.tabs.sendMessage(activeTabId, { action: 'START_SCRAPING', options });
        }, 1000);
      }
    });

    if (currentMode !== 'resume') {
      statCollected.textContent = '0';
      statWithIds.textContent = '0';
      statScrolls.textContent = '0';
      progressBar.style.width = '0%';
    }
    liveStatusText.textContent = 'Extraction started! Scrolling members...';
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
