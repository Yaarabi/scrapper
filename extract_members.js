// Read rendered member entries only. No private endpoints or profile lookups.
({group, selector}) => {
  const roots = [...document.querySelectorAll(selector)];
  const entries = [];
  for (const root of roots) {
    for (const a of root.querySelectorAll('a[href]')) {
      if (!a.getClientRects().length) continue;
      if (a.closest('[role="navigation"], [role="banner"], [role="article"]')) continue;
      const url = new URL(a.href, location.href);
      if (!['www.facebook.com', 'facebook.com', 'm.facebook.com'].includes(url.hostname)) continue;
      const path = url.pathname.split('/').filter(Boolean);
      const isGroupUser = path.length === 4 && path[0] === 'groups' &&
        path[1] === group && path[2] === 'user' && /^\d+$/.test(path[3]);
      // Direct profile links must be inside an explicit list item to avoid
      // mistaking unrelated links in the page header for members.
      const row = a.closest('[role="listitem"], li');
      const isDirect = row && (url.pathname === '/profile.php' ||
        (path.length === 1 && /^[A-Za-z0-9.]+$/.test(path[0])));
      if (!isGroupUser && !isDirect) continue;
      const name = (a.innerText || '').replace(/\s+/g, ' ').trim();
      if (!name) continue; // Avatar links usually have no name.
      entries.push({name, href: url.href});
    }
  }
  return entries;
}
