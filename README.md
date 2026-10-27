# attilakulik.com

GitHub Pages source for the main domain. The homepage sends visitors to
[`/the-craft-behind-the-story/`](https://attilakulik.com/the-craft-behind-the-story/).
Unknown paths show a 404 page with links to the book and the separate
philosophy blog at `philosophy.attilakulik.com`.

After adding or removing a page, run `python3 scripts/generate_sitemap.py` to
refresh `sitemap.xml`. The generator lists canonical pages and skips pages
marked `noindex`.
