#!/usr/bin/env python3
"""Build sitemap.xml from the site's canonical, indexable HTML pages."""

from pathlib import Path
import re
import xml.etree.ElementTree as ET


ROOT = Path(__file__).resolve().parent.parent
SITE = "https://attilakulik.com/"
CANONICAL = re.compile(r'<link rel="canonical" href="([^"]+)"')
NOINDEX = re.compile(r'<meta\s+name="robots"\s+content="[^"]*noindex', re.I)
NAMESPACE = "http://www.sitemaps.org/schemas/sitemap/0.9"


def main() -> None:
    urls = set()
    for page in ROOT.rglob("index.html"):
        html = page.read_text(encoding="utf-8")
        if NOINDEX.search(html):
            continue
        canonical = CANONICAL.search(html)
        if not canonical:
            raise ValueError(f"Missing canonical URL: {page.relative_to(ROOT)}")
        url = canonical.group(1)
        if not url.startswith(SITE):
            raise ValueError(f"Unexpected canonical URL: {url}")
        urls.add(url)

    ET.register_namespace("", NAMESPACE)
    sitemap = ET.Element(f"{{{NAMESPACE}}}urlset")
    for url in sorted(urls):
        entry = ET.SubElement(sitemap, f"{{{NAMESPACE}}}url")
        ET.SubElement(entry, f"{{{NAMESPACE}}}loc").text = url

    ET.indent(sitemap, space="  ")
    ET.ElementTree(sitemap).write(
        ROOT / "sitemap.xml", encoding="utf-8", xml_declaration=True
    )
    print(f"Wrote {len(urls)} URLs to sitemap.xml")


if __name__ == "__main__":
    main()
