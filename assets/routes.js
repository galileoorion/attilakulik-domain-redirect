/* Reading routes for the Core pages.
   The routes are those of Introduction, "Reading Routes": "With a full draft"
   and "With a plan". The reader picks one behind "Start reading" on /core/;
   the choice is kept in localStorage under "craft-route". On the pages of a
   route's chapters this file shows a route bar and, at chapter boundaries
   only, points the next and previous links along the route.
   The HTML always carries the book-order links, so without this script, or
   without storage, every link still works. */
(() => {
  const KEY = 'craft-route';
  const ch = (n, title) => {
    const d = `/core/chapter-${String(n).padStart(2, '0')}/`;
    return { dir: d, first: d + 'section-00/', last: d + 'section-10/', name: `Chapter ${n} · ${title}` };
  };
  const app = (letter, title) => {
    const d = `/core/appendices/section-${letter}/`;
    return { dir: d, first: d, last: d, name: `Appendix ${letter.toUpperCase()} · ${title}` };
  };
  const ROUTES = {
    draft: {
      name: 'With a full draft',
      stops: [ch(18, 'The Structural Edit'), app('b', 'Symptom Index'), app('c', 'Master Checklist')],
      end: 'Last stop of the route.'
    },
    plan: {
      name: 'With a plan',
      stops: [ch(17, 'Series and Genre'), ch(9, 'The Opening Pages'), ch(13, 'The Viewpoint Shift'),
              ch(8, 'Non-linear and Multi-timeline Architecture'), ch(14, 'The Subplot'), ch(12, 'Arc and Theme'),
              ch(11, 'The Middle'), ch(15, 'The Reveal'), ch(16, 'The Ending')],
      end: 'Last chapter of the route. Parts I and II matter most once there are pages to revise.',
      after: ch(1, 'The Purposes of a Scene')
    }
  };

  function stored() {
    try { const r = localStorage.getItem(KEY); return ROUTES[r] ? r : null; } catch (error) { return null; }
  }
  function store(route) {
    try { if (route) localStorage.setItem(KEY, route); else localStorage.removeItem(KEY); } catch (error) { /* No route this time. */ }
  }

  // The chooser on /core/: each link says which route it starts ("none" clears it).
  document.querySelectorAll('a[data-route]').forEach(link => {
    link.addEventListener('click', () => store(ROUTES[link.dataset.route] ? link.dataset.route : null));
  });

  const path = location.pathname.replace(/index\.html$/, '');
  const steps = document.querySelector('.page-steps');
  const links = steps ? steps.querySelectorAll('a') : [];
  const prev = links.length === 2 ? links[0] : null;
  const next = links.length === 2 ? links[1] : null;
  [prev, next].forEach(a => { if (a) { a.dataset.bookHref = a.getAttribute('href'); a.dataset.bookText = a.textContent; } });

  function reset() {
    [prev, next].forEach(a => { if (a) { a.setAttribute('href', a.dataset.bookHref); a.textContent = a.dataset.bookText; } });
    document.querySelectorAll('.route-bar').forEach(bar => bar.remove());
  }
  function point(a, href, text) { if (a) { a.setAttribute('href', href); a.textContent = text; } }

  function apply() {
    reset();
    const key = stored();
    if (!key) return;
    const route = ROUTES[key];
    const i = route.stops.findIndex(stop => path.startsWith(stop.dir));
    if (i < 0) return;                      // A page outside the route keeps book order.
    const stop = route.stops[i], n = route.stops.length;
    const following = i < n - 1 ? route.stops[i + 1] : route.after;
    if (path === stop.last && following) point(next, following.first, following.name + ' →');
    if (path === stop.first && i > 0) point(prev, route.stops[i - 1].last, '← ' + route.stops[i - 1].name);

    const bar = document.createElement('aside');
    bar.className = 'route-bar';
    bar.setAttribute('aria-label', 'Reading route');
    const where = document.createElement('p');
    where.textContent = `Reading route: ${route.name} · ${i + 1} of ${n}`;
    const ahead = document.createElement('p');
    if (i < n - 1) {
      ahead.append('Next in the route: ');
      const a = document.createElement('a');
      a.href = following.first; a.textContent = following.name;
      ahead.append(a);
    } else {
      ahead.append(route.end);
      if (following) {
        ahead.append(' ');
        const a = document.createElement('a');
        a.href = following.first; a.textContent = following.name;
        ahead.append(a);
      }
    }
    const leave = document.createElement('button');
    leave.type = 'button';
    leave.className = 'route-leave';
    leave.textContent = 'Leave route';
    leave.addEventListener('click', () => { store(null); apply(); });
    bar.append(where, ahead, leave);
    const crumbs = document.querySelector('main .breadcrumbs');
    if (crumbs) crumbs.after(bar); else document.querySelector('main')?.prepend(bar);
  }

  // Keep other open tabs, and pages restored by the Back button, in step.
  window.addEventListener('storage', event => { if (event.key === KEY) apply(); });
  window.addEventListener('pageshow', event => { if (event.persisted) apply(); });
  apply();
})();
