import csv
import json
import tempfile
import unittest
from pathlib import Path

from fb_group_extractor import BASE, add_entries, group_url, profile_identity, save


class ExportTests(unittest.TestCase):
    def test_identity_and_group_validation(self):
        self.assertEqual(group_url('123'), 'https://www.facebook.com/groups/123/members/')
        item = profile_identity('https://www.facebook.com/groups/123/user/100012345678901/?x=1', '123')
        self.assertEqual(item['id'], '100012345678901')
        self.assertEqual(item['username'], '')
        self.assertIsNone(profile_identity('https://www.facebook.com/groups/456/user/99/', '123'))
        self.assertIsNone(profile_identity('https://facebook.com.evil.test/alice', '123'))
        self.assertIsNone(profile_identity('https://www.facebook.com/settings', '123'))
        self.assertIsNone(profile_identity('https://www.facebook.com/profile.php?id=abc', '123'))
        self.assertEqual(profile_identity('https://www.facebook.com/alice.example', '123')['id'], '')

    def test_dedup_export_precision_and_formula_protection(self):
        records = {}
        entries = [
            {'name': '=SUM(1,1)', 'href': 'https://www.facebook.com/groups/123/user/100012345678901/'},
            {'name': 'Duplicate', 'href': 'https://www.facebook.com/profile.php?id=100012345678901'},
            {'name': 'Alice Example', 'href': 'https://www.facebook.com/alice.example'},
        ]
        add_entries(records, entries, group_url('123'), 100)
        self.assertEqual(len(records), 2)
        test_root = BASE / 'test-results'
        test_root.mkdir(exist_ok=True)
        with tempfile.TemporaryDirectory(dir=test_root) as directory:
            output = Path(directory) / 'members'
            self.assertEqual(save(records, output, 'both', True), 1)
            data = json.loads(output.with_suffix('.json').read_text(encoding='utf-8'))
            self.assertEqual(data[0]['id'], '100012345678901')
            self.assertEqual(data[0]['name'], '=SUM(1,1)')
            with output.with_suffix('.csv').open(encoding='utf-8-sig', newline='') as handle:
                rows = list(csv.DictReader(handle))
            self.assertEqual(rows[0]['name'], "'=SUM(1,1)")
            self.assertEqual(rows[0]['id'], data[0]['id'])

    def test_member_limit(self):
        records = {}
        add_entries(records, [{'name': str(i), 'href': f'https://www.facebook.com/profile.php?id={i}'} for i in range(10)], group_url('123'), 3)
        self.assertEqual(len(records), 3)

    def test_rendered_member_fixture(self):
        from playwright.sync_api import sync_playwright
        with sync_playwright() as pw:
            edge = Path('C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe')
            browser = pw.chromium.launch(headless=True, channel='msedge' if edge.exists() else None)
            try:
                page = browser.new_page()
                page.set_content('''
                    <nav><a href="https://www.facebook.com/groups/123/user/999/">Navigation</a></nav>
                    <div role="main">
                      <div><a href="https://www.facebook.com/groups/123/user/101/">Alice Example</a></div>
                      <div role="listitem"><a href="https://www.facebook.com/bob.example">Bob Example</a></div>
                      <div role="listitem"><a href="https://www.facebook.com/profile.php?id=102">Carol Example</a></div>
                      <div style="display:none"><a href="https://www.facebook.com/groups/123/user/103/">Hidden</a></div>
                      <div role="article"><a href="https://www.facebook.com/groups/123/user/104/">Post author</a></div>
                      <a href="https://www.facebook.com/groups/456/user/105/">Other group</a>
                      <a href="https://www.facebook.com/unrelated">Unrelated</a>
                    </div>
                ''')
                entries = page.evaluate((BASE / 'extract_members.js').read_text(), {'group': '123', 'selector': '[role="main"]'})
                records = {}
                add_entries(records, entries, group_url('123'), 100)
                self.assertEqual({r['name'] for r in records.values()}, {'Alice Example', 'Bob Example', 'Carol Example'})
                self.assertEqual({r['id'] for r in records.values()}, {'101', '102', ''})
            finally:
                browser.close()


if __name__ == '__main__':
    unittest.main()
