"""Static route/content checks. Run with python3 tests/site_contract.py (BeautifulSoup)."""
import json
import unittest
from pathlib import Path
from urllib.parse import urlsplit, unquote
from bs4 import BeautifulSoup

ROOT = Path(__file__).resolve().parents[1]
PAGES = {p.name: BeautifulSoup(p.read_text(), 'html.parser') for p in ROOT.glob('*.html')}
ROUTES = sorted(PAGES)

class SiteContract(unittest.TestCase):
    def test_routes_and_navigation(self):
        self.assertEqual(len(PAGES), 16)
        for name, soup in PAGES.items():
            with self.subTest(page=name):
                self.assertEqual(len(soup.select('main#main')), 1)
                self.assertEqual(len(soup.select('h1')), 1)
                self.assertIsNotNone(soup.select_one('nav#site-nav'))
                self.assertEqual(len(soup.select('script[src="js/main.js"]')), 1)
                self.assertFalse(soup.select('main script'))
                ids = [x['id'] for x in soup.select('[id]')]
                self.assertEqual(len(ids), len(set(ids)))

    def test_local_destinations_and_assets(self):
        for name, soup in PAGES.items():
            for el in soup.select('a[href], img[src], script[src], link[rel="stylesheet"]'):
                value = el.get('href', el.get('src', ''))
                url = urlsplit(value)
                if url.scheme or url.netloc: continue
                path = unquote(url.path) or name
                with self.subTest(page=name, destination=value):
                    self.assertTrue((ROOT / path).exists())
                    if url.fragment and path in PAGES:
                        self.assertIsNotNone(PAGES[path].find(id=unquote(url.fragment)))

    def test_learning_material_preserved(self):
        fixtures = json.loads((ROOT/'tests/content-contract.json').read_text())
        for name, expected in fixtures.items():
            main = PAGES[name+'.html'].main
            with self.subTest(page=name):
                self.assertEqual([x.get_text() for x in main.select('pre')], expected['code'])
                self.assertEqual([x.get_text(' ',strip=True) for x in main.select('table')], expected['tables'])
                for anchor in expected['ids']: self.assertIsNotNone(main.find(id=anchor))

    def test_contact_has_one_real_form(self):
        for name in ['register.html','student-signup.html','volunteer-signup.html']:
            self.assertFalse(PAGES[name].select('form'))
            self.assertIsNotNone(PAGES[name].select_one('#form a[href="faq.html#contact"]'))
        faq = PAGES['faq.html']
        form = faq.select_one('#contact-form')
        self.assertEqual(form['action'], 'https://api.web3forms.com/submit')
        self.assertNotIn('novalidate', form.attrs)
        self.assertIsNotNone(faq.select_one('#contact-status[role="status"]'))
        self.assertIn('hidden', faq.select_one('#form-success-msg').attrs)

    def test_registration_handoffs_are_explicit_and_audience_specific(self):
        register = PAGES['register.html']
        expected_routes = {
            'Student registration': 'student-signup.html',
            'School registration': 'schools.html',
            'Volunteer or judge registration': 'volunteer-signup.html',
        }
        for label, destination in expected_routes.items():
            with self.subTest(label=label):
                link = register.find('a', href=destination)
                self.assertIsNotNone(link)
                self.assertEqual(link.get_text(' ', strip=True), label)

        for name in ['schools.html', 'student-signup.html', 'volunteer-signup.html']:
            with self.subTest(page=name):
                notes = PAGES[name].select('.external-form-note')
                self.assertGreaterEqual(len(notes), 1)
                self.assertTrue(all('Google Forms' in note.get_text(' ', strip=True) for note in notes))

    def test_event_date_is_not_claimed_as_confirmed(self):
        rendered = '\n'.join(soup.get_text(' ', strip=True) for soup in PAGES.values())
        self.assertNotIn('May 15, 2027', rendered)
        self.assertNotIn('Thursday, May 15', rendered)
        self.assertIn('April 24th, 2027', PAGES['schedule.html'].get_text(' ', strip=True))

    def test_built_output_preserves_direct_routes_when_present(self):
        dist = ROOT / 'dist'
        if not dist.exists():
            self.skipTest('production output not built')
        for route in ROUTES:
            with self.subTest(route=route):
                output = dist / route
                self.assertTrue(output.exists())
                soup = BeautifulSoup(output.read_text(), 'html.parser')
                self.assertIsNotNone(soup.select_one('#root'))
                self.assertTrue(soup.select_one('script[type="module"][src]'))
        built = '\n'.join(p.read_text() for p in dist.glob('*.html'))
        self.assertIn('assets/', built)

if __name__ == '__main__': unittest.main()
