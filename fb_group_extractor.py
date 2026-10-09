"""Export the Facebook member entries rendered in your browser to CSV/JSON."""
from __future__ import annotations

import argparse
import csv
import json
import math
import re
import sys
from datetime import datetime, timezone
from pathlib import Path
from urllib.parse import parse_qs, urlparse

BASE = Path(__file__).resolve().parent
FIELDS = ['id', 'username', 'name', 'profile_url', 'group_url', 'collected_at']
HOSTS = {'facebook.com', 'www.facebook.com', 'm.facebook.com'}
RESERVED = {
    'groups', 'home', 'watch', 'reel', 'reels', 'stories', 'friends', 'notifications',
    'marketplace', 'gaming', 'messages', 'login', 'logout', 'help', 'settings',
    'privacy', 'policies', 'events', 'pages', 'share', 'photo', 'photos', 'videos',
    'search', 'me', 'checkpoint', 'recover', 'about', 'people', 'bookmarks',
}


def group_url(value: str) -> str:
    value = value.strip()
    if re.fullmatch(r'[A-Za-z0-9.]+', value):
        return f'https://www.facebook.com/groups/{value}/members/'
    parsed = urlparse(value)
    match = re.fullmatch(r'/groups/([A-Za-z0-9.]+)(?:/members)?/?', parsed.path)
    if parsed.scheme not in {'http', 'https'} or parsed.hostname not in HOSTS or not match:
        raise argparse.ArgumentTypeError('Use a Facebook group URL, numeric group ID, or group slug.')
    return f'https://www.facebook.com/groups/{match[1]}/members/'


def profile_identity(href: str, group: str) -> dict[str, str] | None:
    parsed = urlparse(href)
    if parsed.scheme not in {'http', 'https'} or parsed.hostname not in HOSTS:
        return None
    path = parsed.path.strip('/')
    match = re.fullmatch(r'groups/([^/]+)/user/(\d+)', path)
    member_id, username = '', ''
    if match:
        if match[1] != group:
            return None
        member_id = match[2]
    elif path == 'profile.php':
        member_id = parse_qs(parsed.query).get('id', [''])[0]
        if not re.fullmatch(r'\d+', member_id):
            return None
    elif re.fullmatch(r'\d+', path):
        member_id = path
    elif re.fullmatch(r'[A-Za-z0-9.]+', path) and path.lower() not in RESERVED:
        username = path
    else:
        return None
    canonical = f'https://www.facebook.com/profile.php?id={member_id}' if member_id else f'https://www.facebook.com/{username}'
    return {'id': member_id, 'username': username, 'profile_url': canonical}


def add_entries(records: dict, entries: list, target: str, limit: int) -> None:
    group = urlparse(target).path.split('/')[2]
    for entry in entries:
        identity = profile_identity(entry['href'], group)
        name = ' '.join(entry.get('name', '').split())
        if not identity or not name:
            continue
        key = identity['profile_url'].lower()
        if key not in records:
            if len(records) >= limit:
                break
            records[key] = {
                **identity, 'name': name, 'group_url': target,
                'collected_at': datetime.now(timezone.utc).isoformat(timespec='seconds'),
            }


def csv_value(value: str) -> str:
    # Prevent member-supplied names becoming spreadsheet formulas.
    return "'" + value if value.lstrip().startswith(('=', '+', '-', '@')) or value.startswith(('\t', '\r', '\n')) else value


def save(records: dict, output: Path, format_: str, ids_only: bool) -> int:
    rows = sorted((r for r in records.values() if not ids_only or r['id']),
                  key=lambda r: (not bool(r['id']), r['name'].casefold()))
    output.parent.mkdir(parents=True, exist_ok=True)
    formats = ('csv', 'json') if format_ == 'both' else (format_,)
    for kind in formats:
        path = Path(str(output) + '.' + kind)
        temp = path.with_name(path.name + '.tmp')
        if kind == 'json':
            temp.write_text(json.dumps(rows, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
        else:
            with temp.open('w', newline='', encoding='utf-8-sig') as handle:
                writer = csv.DictWriter(handle, fieldnames=FIELDS)
                writer.writeheader()
                writer.writerows({k: csv_value(r[k]) for k in FIELDS} for r in rows)
        temp.replace(path)
    return len(rows)


SCROLL = """selector => {
  const roots = [...document.querySelectorAll(selector)];
  for (const root of roots) {
    const anchor = root.querySelector('a[href*="/user/"], [role="listitem"]');
    for (let el = anchor || root; el; el = el.parentElement) {
      if (/(auto|scroll)/.test(getComputedStyle(el).overflowY) && el.scrollHeight > el.clientHeight + 10) {
        el.scrollBy(0, Math.max(300, el.clientHeight * 0.7)); return;
      }
    }
  }
  window.scrollBy(0, window.innerHeight * 0.7);
}"""


def positive_int(value: str) -> int:
    number = int(value)
    if number < 1:
        raise argparse.ArgumentTypeError('Must be at least 1.')
    return number


def delay_seconds(value: str) -> float:
    number = float(value)
    if not math.isfinite(number) or number < 1:
        raise argparse.ArgumentTypeError('Must be a finite number of at least 1 second.')
    return number


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('group', type=group_url, help='Group URL, ID, or slug')
    parser.add_argument('--format', choices=['csv', 'json', 'both'], default='both')
    parser.add_argument('--output', type=Path, help='Output base path, without extension')
    parser.add_argument('--ids-only', action='store_true', help='Export only members with an exposed numeric ID')
    parser.add_argument('--max-members', type=positive_int, default=1000)
    parser.add_argument('--max-scrolls', type=positive_int, default=500)
    parser.add_argument('--idle-rounds', type=positive_int, default=10)
    parser.add_argument('--delay', type=delay_seconds, default=3, help='Seconds between scrolls (default: 3)')
    parser.add_argument('--profile-dir', type=Path, default=BASE / '.facebook-profile')
    parser.add_argument('--channel', choices=['chrome', 'msedge'], help='Use an installed Chrome or Edge browser')
    parser.add_argument('--container', default='[role="main"]', help='CSS selector enclosing the members list')
    args = parser.parse_args()
    try:
        from playwright.sync_api import Error, sync_playwright
    except ImportError:
        print('Install dependencies: python -m pip install -r requirements.txt', file=sys.stderr)
        return 1

    group = urlparse(args.group).path.split('/')[2]
    output = args.output or BASE / 'exports' / f'{group}_{datetime.now():%Y%m%d_%H%M%S}'
    if output.suffix.lower() in {'.csv', '.json'}:
        output = output.with_suffix('')
    # Avoid silently overwriting an earlier collection.
    formats = ('csv', 'json') if args.format == 'both' else (args.format,)
    if any(Path(str(output) + '.' + kind).exists() for kind in formats):
        parser.error('Output already exists. Choose another --output base path.')
    extract = (BASE / 'extract_members.js').read_text(encoding='utf-8')
    records = {}
    reason = 'scroll limit reached'
    status = 0
    try:
        with sync_playwright() as pw:
            context = pw.chromium.launch_persistent_context(
                str(args.profile_dir.resolve()), headless=False,
                channel=args.channel, viewport={'width': 1280, 'height': 900},
            )
            try:
                page = context.pages[0] if context.pages else context.new_page()
                page.goto(args.group, wait_until='domcontentloaded', timeout=60000)
                print('Log in directly in the browser, then open this group\'s Members/People tab.')
                print('Keep the member list open in the same tab. Press Ctrl+C here to stop and save.')
                input('Once the member list is visible, press Enter here: ')
                current = urlparse(page.url)
                if current.hostname not in HOSTS or current.path.rstrip('/') != f'/groups/{group}/members':
                    raise ValueError('The browser must be on the requested group\'s /members/ page.')
                idle = 0
                for step in range(args.max_scrolls + 1):
                    current = urlparse(page.url)
                    if current.hostname not in HOSTS or current.path.rstrip('/') != f'/groups/{group}/members':
                        raise ValueError('The browser left the requested members page. Partial results saved.')
                    if page.locator('input[type="password"], iframe[src*="captcha"]').count():
                        raise ValueError('Facebook requested login or verification. Partial results saved.')
                    before = len(records)
                    add_entries(records, page.evaluate(extract, {'group': group, 'selector': args.container}), args.group, args.max_members)
                    count = save(records, output, args.format, args.ids_only)
                    with_ids = sum(bool(r['id']) for r in records.values())
                    print(f'Found {len(records)} entries | {with_ids} with IDs | {count} exported', flush=True)
                    idle = idle + 1 if len(records) == before else 0
                    if len(records) >= args.max_members:
                        reason = 'member limit reached'
                        break
                    if idle >= args.idle_rounds:
                        reason = 'no new entries appeared; this does not prove the list is complete'
                        break
                    if step < args.max_scrolls:
                        page.evaluate(SCROLL, args.container)
                        page.wait_for_timeout(args.delay * 1000)
            finally:
                context.close()
    except (KeyboardInterrupt, EOFError):
        reason = 'stopped by user'
        status = 130
    except (Error, ValueError, OSError) as exc:
        reason = str(exc)
        status = 1
    finally:
        if records:
            save(records, output, args.format, args.ids_only)
    print(f'Stopped: {reason}.')
    if records:
        print(f'Export: {output} ({args.format})')
    else:
        print('No members collected. Check access, the Members tab, and the container selector.')
        status = status or 2
    return status


if __name__ == '__main__':
    raise SystemExit(main())
