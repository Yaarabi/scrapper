# Local Facebook group member exporter

Runs a visible browser on your computer. Log in yourself, open a group's Members tab, and export the entries rendered there. Fields: `id`, `username`, `name`, `profile_url`, `group_url`, `collected_at` (UTC).

Numeric IDs are the priority. The tool reads them from visible group-member links (`/groups/GROUP/user/ID/`) and profile links (`profile.php?id=ID`). If a link only contains a username, `id` stays blank. A numeric link often does not expose a username, so that field can also be blank. IDs are stored as strings in JSON; import the CSV's ID column as **Text** in Excel to preserve long IDs exactly.

## Setup on Windows (PowerShell)


## to run the script
.\.venv\Scripts\python.exe fb_group_extractor.py "https://www.facebook.com/groups/YOUR_GROUP/" --channel msedge --format both

Use Python 3.10 or newer. From this folder:

```powershell
python -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
.\.venv\Scripts\python.exe -m playwright install chromium
```

If `python` is unavailable but you have `uv`, replace the first command with `uv venv .venv`.

## Run

```powershell
.\.venv\Scripts\python.exe fb_group_extractor.py "https://www.facebook.com/groups/YOUR_GROUP/" --format both
```

1. Log in to Facebook in the browser that opens. The script never asks for your password in the terminal.
2. Open the requested group's Members/People tab in that same browser tab. The URL must end with `/groups/YOUR_GROUP/members/`.
3. Once the list is visible, return to the terminal and press Enter.
4. Keep the page on the member list. The script scrolls and saves progress to `exports/`. Press Ctrl+C in the terminal to stop early and save collected entries.

Only export records with numeric IDs, and save a CSV with a chosen filename:

```powershell
.\.venv\Scripts\python.exe fb_group_extractor.py YOUR_GROUP --ids-only --format csv --output exports/member_ids
```

JSON export, a higher collection limit, and installed Edge instead of downloaded Chromium:

```powershell
.\.venv\Scripts\python.exe fb_group_extractor.py YOUR_GROUP --format json --max-members 5000 --channel msedge
```

`--channel chrome` is also supported. When using installed Edge/Chrome, the Chromium download step is unnecessary. The browser still uses a separate local profile.

## Limits and troubleshooting

- Only entries your account can view on the member list are collected. Use this for data you have permission to collect and use.
- Facebook can limit the list, change its layout, or interrupt browsing. The tool cannot guarantee all members or IDs. It does not resolve usernames through hidden APIs or visit individual profiles.
- Collection stops after 1,000 distinct profile links, 500 scrolls, or 10 rounds without new entries by default. Adjust `--max-members`, `--max-scrolls`, `--idle-rounds`, or `--delay` as needed. The member limit counts all collected entries even with `--ids-only`.
- The extractor scopes itself to `[role="main"]`, excludes navigation and post articles, and accepts group-member links plus direct profile links inside list items. If Facebook changes its layout, the extractor may need adjustment. `--container "CSS_SELECTOR"` can narrow the member-list area.
- Duplicate canonical profile links are removed. An ID link and a username link for the same person may remain separate; matching people by name would be unreliable.
- CSV output escapes formula-like text in member names. JSON preserves original strings. Neither format converts IDs to numbers.
- Existing output files are not overwritten at startup. Choose a new `--output` name. Partial results are saved during collection; an interrupted run does not resume an earlier export.
- The `.facebook-profile/` directory stores your browser login session locally. Keep it private. Close the browser before deleting this folder to forget the session. Do not point `--profile-dir` at your everyday browser profile or run two copies with the same profile.
- Live Facebook behavior requires testing with your own account; local fixture tests do not establish compatibility with every Facebook layout.

## Tests

```powershell
.\.venv\Scripts\python.exe -m unittest discover -s tests -v
```

The browser fixture test uses installed Edge when available, otherwise Playwright Chromium. It uses synthetic member data and does not connect to Facebook.

Browser automation uses [Playwright's Python library](https://playwright.dev/python/docs/library).
