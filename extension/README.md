# FB Group Member Exporter Pro - Chrome Extension

Manifest V3 browser extension to scrape and export members from Facebook Groups.

## Features
- **SaaS License Protected**: Validates subscription status against your Next.js licensing portal.
- **Excel & JSON Ready**: Exports numerical Facebook IDs formatted properly for spreadsheets.
- **Safe Organic Scrolling**: Injects jitter delays and detects verification challenges.
- **Deduplication**: Automatically canonicalizes profile links and avoids duplicate records.

## Installation in Chrome / Brave / Edge
1. Open Chrome or Edge and go to:
   - Chrome: `chrome://extensions`
   - Edge: `edge://extensions`
2. Enable **Developer mode** (toggle switch in the top-right corner).
3. Click **Load unpacked** (top-left).
4. Select the `extension` folder from this repository.
5. Pin the extension icon in your browser toolbar!

## How to Use
1. Open the extension popup.
2. Enter your **License Key** (generated from the Admin Portal) and click **Activate License**.
3. Go to Facebook and open any group's **Members** or **People** tab:
   - Example: `https://www.facebook.com/groups/YOUR_GROUP_NAME/members`
4. Click the extension icon.
5. Select your export preferences (Max members, delay, CSV/JSON, IDs only).
6. Click **Start Extraction**. The page will auto-scroll, and when finished (or when you click **Stop & Export**), the CSV / JSON file will automatically download to your computer.
