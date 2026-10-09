// Content script for Facebook Group Member Exporter Pro with Smart Large Group Support
(() => {
  // Prevent multiple injections
  if (window.__fbExporterLoaded) return;
  window.__fbExporterLoaded = true;

  const HOSTS = ['facebook.com', 'www.facebook.com', 'm.facebook.com'];
  const RESERVED = new Set([
    'groups', 'home', 'watch', 'reel', 'reels', 'stories', 'friends', 'notifications',
    'marketplace', 'gaming', 'messages', 'login', 'logout', 'help', 'settings',
    'privacy', 'policies', 'events', 'pages', 'share', 'photo', 'photos', 'videos',
    'search', 'me', 'checkpoint', 'recover', 'about', 'people', 'bookmarks',
  ]);

  let isScraping = false;
  let shouldStop = false;
  let scrapedRecords = new Map();
  let scrollCount = 0;
  let idleCount = 0;
  let currentGroupSlug = '';
  let batchNumber = 1;
  let lastBatchExportedCount = 0;

  function getGroupSlug() {
    try {
      const url = new URL(window.location.href);
      if (!HOSTS.includes(url.hostname)) return null;
      const parts = url.pathname.split('/').filter(Boolean);
      if (parts[0] === 'groups' && parts.length >= 2) {
        return parts[1];
      }
    } catch (e) {}
    return null;
  }

  function isMembersPage() {
    try {
      const url = new URL(window.location.href);
      if (!HOSTS.includes(url.hostname)) return false;
      const parts = url.pathname.split('/').filter(Boolean);
      return parts[0] === 'groups' && parts.length >= 3 && parts[2] === 'members';
    } catch (e) {
      return false;
    }
  }

  async function getSavedGroupHistory(group) {
    try {
      const key = `fb_history_${group}`;
      const res = await chrome.storage.local.get([key]);
      return new Set(res[key] || []);
    } catch (e) {
      return new Set();
    }
  }

  async function updateSavedGroupHistory(group, newKeys) {
    try {
      const key = `fb_history_${group}`;
      const res = await chrome.storage.local.get([key]);
      const existing = new Set(res[key] || []);
      for (const k of newKeys) existing.add(k);
      await chrome.storage.local.set({ [key]: Array.from(existing) });
      return existing.size;
    } catch (e) {
      return 0;
    }
  }

  function extractIdentity(href, group) {
    try {
      const url = new URL(href, window.location.href);
      if (!HOSTS.includes(url.hostname)) return null;
      const path = url.pathname.replace(/^\/|\/$/g, '');
      const parts = path.split('/');

      let memberId = '';
      let username = '';

      if (parts.length === 4 && parts[0] === 'groups' && parts[1] === group && parts[2] === 'user' && /^\d+$/.test(parts[3])) {
        memberId = parts[3];
      } else if (url.pathname === '/profile.php') {
        const idParam = url.searchParams.get('id') || '';
        if (/^\d+$/.test(idParam)) {
          memberId = idParam;
        } else {
          return null;
        }
      } else if (/^\d+$/.test(path)) {
        memberId = path;
      } else if (/^[A-Za-z0-9.]+$/.test(path) && !RESERVED.has(path.toLowerCase())) {
        username = path;
      } else {
        return null;
      }

      const canonical = memberId ? `https://www.facebook.com/profile.php?id=${memberId}` : `https://www.facebook.com/${username}`;
      return { id: memberId, username, profile_url: canonical };
    } catch (e) {
      return null;
    }
  }

  function extractVisibleEntries(group, selector = '[role="main"]') {
    const roots = [...document.querySelectorAll(selector)];
    const entries = [];
    for (const root of roots) {
      for (const a of root.querySelectorAll('a[href]')) {
        if (!a.getClientRects().length) continue;
        if (a.closest('[role="navigation"], [role="banner"], [role="article"]')) continue;
        const identity = extractIdentity(a.href, group);
        if (!identity) continue;

        // Verify if direct profile link is inside an explicit row/list item
        const row = a.closest('[role="listitem"], li');
        if (!identity.id && !row) continue;

        const name = (a.innerText || '').replace(/\s+/g, ' ').trim();
        if (!name || name.length > 100) continue; // Skip avatars or long links

        entries.push({
          ...identity,
          name,
          group_url: `https://www.facebook.com/groups/${group}/members/`,
          collected_at: new Date().toISOString()
        });
      }
    }
    return entries;
  }

  function scrollPage(selector = '[role="main"]') {
    const roots = [...document.querySelectorAll(selector)];
    for (const root of roots) {
      const anchor = root.querySelector('a[href*="/user/"], [role="listitem"]');
      for (let el = anchor || root; el; el = el.parentElement) {
        if (el === document.body || el === document.documentElement) break;
        const style = window.getComputedStyle(el);
        if (/(auto|scroll)/.test(style.overflowY) && el.scrollHeight > el.clientHeight + 10) {
          el.scrollBy(0, Math.max(350, el.clientHeight * 0.75));
          return;
        }
      }
    }
    window.scrollBy(0, window.innerHeight * 0.75);
  }

  function formatCSVValue(val) {
    if (val === null || val === undefined) return '""';
    const str = String(val).replace(/"/g, '""');
    const sanitized = /^[=+\-@]/.test(str) ? "'" + str : str;
    return `"${sanitized}"`;
  }

  function generateCSV(recordsMap, idsOnly) {
    const fields = ['id', 'username', 'name', 'profile_url', 'group_url', 'collected_at'];
    let rows = Array.from(recordsMap.values());
    if (idsOnly) {
      rows = rows.filter(r => Boolean(r.id));
    }
    rows.sort((a, b) => (b.id ? 1 : 0) - (a.id ? 1 : 0) || a.name.localeCompare(b.name));

    let csv = '\uFEFF' + fields.map(f => `"${f}"`).join(',') + '\r\n';
    for (const row of rows) {
      csv += fields.map(f => formatCSVValue(row[f] || '')).join(',') + '\r\n';
    }
    return { data: csv, count: rows.length };
  }

  function generateJSON(recordsMap, idsOnly) {
    let rows = Array.from(recordsMap.values());
    if (idsOnly) {
      rows = rows.filter(r => Boolean(r.id));
    }
    rows.sort((a, b) => (b.id ? 1 : 0) - (a.id ? 1 : 0) || a.name.localeCompare(b.name));
    return { data: JSON.stringify(rows, null, 2), count: rows.length };
  }

  function downloadBatch(group, format, idsOnly, batchIdx, recordsToSave) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    const baseName = `fb_members_${group}_part${batchIdx}_${timestamp}`;

    if (format === 'csv' || format === 'both') {
      const csvResult = generateCSV(recordsToSave, idsOnly);
      chrome.runtime.sendMessage({
        type: 'DOWNLOAD_FILE',
        data: {
          filename: `${baseName}.csv`,
          content: csvResult.data,
          mimeType: 'text/csv;charset=utf-8;'
        }
      }).catch(() => {});
    }

    if (format === 'json' || format === 'both') {
      const jsonResult = generateJSON(recordsToSave, idsOnly);
      chrome.runtime.sendMessage({
        type: 'DOWNLOAD_FILE',
        data: {
          filename: `${baseName}.json`,
          content: jsonResult.data,
          mimeType: 'application/json;charset=utf-8;'
        }
      }).catch(() => {});
    }
  }

  async function startScrapingLoop(options) {
    if (isScraping) return;
    const group = getGroupSlug();
    if (!group) return;

    isScraping = true;
    shouldStop = false;
    currentGroupSlug = group;

    const resumeMode = Boolean(options.resumeMode);
    const skipPrevious = Boolean(options.skipPrevious);
    const batchSize = parseInt(options.batchSize, 10) || 0;
    const maxMembers = options.maxMembers || 1000;
    const delay = (options.scrollDelay || 2.5) * 1000;
    const idsOnly = Boolean(options.idsOnly);
    const format = options.exportFormat || 'both';

    if (!resumeMode) {
      scrapedRecords.clear();
      scrollCount = 0;
      idleCount = 0;
      batchNumber = 1;
      lastBatchExportedCount = 0;
    }

    // Load previously exported member history for this group
    const savedHistory = skipPrevious ? await getSavedGroupHistory(group) : new Set();

    try {
      while (!shouldStop && scrapedRecords.size < maxMembers && scrollCount < 2000) {
        if (!isMembersPage()) {
          console.warn('[FB Exporter] Browser left members page.');
          break;
        }

        // Check for captcha/checkpoint challenges
        if (document.querySelector('input[type="password"], iframe[src*="captcha"]')) {
          console.warn('[FB Exporter] Facebook verification checkpoint detected.');
          break;
        }

        const beforeCount = scrapedRecords.size;
        const visible = extractVisibleEntries(group);

        for (const entry of visible) {
          const key = entry.profile_url.toLowerCase();

          // Skip previously exported history if enabled
          if (skipPrevious && savedHistory.has(key)) {
            continue;
          }

          if (!scrapedRecords.has(key)) {
            if (scrapedRecords.size >= maxMembers) break;
            scrapedRecords.set(key, entry);
          }
        }

        const currentCount = scrapedRecords.size;
        let withIds = 0;
        for (const item of scrapedRecords.values()) {
          if (item.id) withIds++;
        }

        if (currentCount === beforeCount) {
          idleCount++;
        } else {
          idleCount = 0;
        }

        // Batch auto-saving check
        if (batchSize > 0 && (currentCount - lastBatchExportedCount) >= batchSize) {
          const batchRecords = new Map();
          let i = 0;
          for (const [k, v] of scrapedRecords.entries()) {
            if (i >= lastBatchExportedCount && i < currentCount) {
              batchRecords.set(k, v);
            }
            i++;
          }

          if (batchRecords.size > 0) {
            downloadBatch(group, format, idsOnly, batchNumber, batchRecords);
            // Save to history
            updateSavedGroupHistory(group, Array.from(batchRecords.keys()));
            batchNumber++;
            lastBatchExportedCount = currentCount;
          }
        }

        // Send progress message to extension popup
        chrome.runtime.sendMessage({
          type: 'PROGRESS_UPDATE',
          data: {
            collected: currentCount,
            withIds,
            scrolls: scrollCount,
            status: `Extracting... (${currentCount}/${maxMembers})`
          }
        }).catch(() => {});

        if (currentCount >= maxMembers) {
          console.log('[FB Exporter] Target member count reached.');
          break;
        }

        if (idleCount >= 10) {
          console.log('[FB Exporter] No new entries found after 10 scrolls.');
          break;
        }

        scrollCount++;
        scrollPage();

        // Introduce organic randomized delay (±15% variance)
        const jitter = (Math.random() - 0.5) * 600;
        await new Promise(resolve => setTimeout(resolve, Math.max(1000, delay + jitter)));
      }
    } finally {
      isScraping = false;
      exportAndFinish(group, format, idsOnly, batchSize > 0 && lastBatchExportedCount > 0);
    }
  }

  async function exportAndFinish(group, format, idsOnly, hasBatched) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    
    // Determine records to export (if batched, only export remaining)
    let recordsToExport = scrapedRecords;
    if (hasBatched && lastBatchExportedCount < scrapedRecords.size) {
      recordsToExport = new Map();
      let i = 0;
      for (const [k, v] of scrapedRecords.entries()) {
        if (i >= lastBatchExportedCount) {
          recordsToExport.set(k, v);
        }
        i++;
      }
    }

    if (recordsToExport.size > 0) {
      const suffix = hasBatched ? `_final` : ``;
      const baseName = `fb_members_${group}${suffix}_${timestamp}`;

      if (format === 'csv' || format === 'both') {
        const csvResult = generateCSV(recordsToExport, idsOnly);
        chrome.runtime.sendMessage({
          type: 'DOWNLOAD_FILE',
          data: {
            filename: `${baseName}.csv`,
            content: csvResult.data,
            mimeType: 'text/csv;charset=utf-8;'
          }
        }).catch(() => {});
      }

      if (format === 'json' || format === 'both') {
        const jsonResult = generateJSON(recordsToExport, idsOnly);
        chrome.runtime.sendMessage({
          type: 'DOWNLOAD_FILE',
          data: {
            filename: `${baseName}.json`,
            content: jsonResult.data,
            mimeType: 'application/json;charset=utf-8;'
          }
        }).catch(() => {});
      }
    }

    // Save all newly scraped keys to history
    const totalHistory = await updateSavedGroupHistory(group, Array.from(scrapedRecords.keys()));

    let withIds = 0;
    for (const item of scrapedRecords.values()) {
      if (item.id) withIds++;
    }

    chrome.runtime.sendMessage({
      type: 'SCRAPING_COMPLETE',
      data: {
        total: scrapedRecords.size,
        withIds,
        scrolls: scrollCount,
        group,
        totalHistory
      }
    }).catch(() => {});
  }

  // Listener for actions from Popup
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'CHECK_PAGE') {
      const valid = isMembersPage();
      const slug = getGroupSlug();
      sendResponse({
        isMembersPage: valid,
        groupSlug: slug,
        url: window.location.href,
        isScraping,
        existingCount: scrapedRecords.size
      });
      return true;
    }

    if (message.action === 'START_SCRAPING') {
      startScrapingLoop(message.options || {});
      sendResponse({ success: true, started: true });
      return true;
    }

    if (message.action === 'STOP_SCRAPING') {
      shouldStop = true;
      sendResponse({ success: true, stopping: true });
      return true;
    }

    if (message.action === 'GET_STATUS') {
      let withIds = 0;
      for (const item of scrapedRecords.values()) {
        if (item.id) withIds++;
      }
      sendResponse({
        isScraping,
        collected: scrapedRecords.size,
        withIds,
        scrolls: scrollCount,
        group: currentGroupSlug
      });
      return true;
    }

    if (message.action === 'CLEAR_HISTORY') {
      const group = getGroupSlug();
      if (group) {
        chrome.storage.local.remove([`fb_history_${group}`], () => {
          sendResponse({ success: true });
        });
        return true;
      }
      sendResponse({ success: false });
      return true;
    }

    if (message.action === 'GET_HISTORY_COUNT') {
      const group = getGroupSlug();
      if (group) {
        getSavedGroupHistory(group).then(set => {
          sendResponse({ count: set.size });
        });
        return true;
      }
      sendResponse({ count: 0 });
      return true;
    }
  });
})();
