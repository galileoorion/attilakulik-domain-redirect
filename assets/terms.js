/* Key-term definitions on Core chapter openings.
   build_preview.py turns each key term that has a glossary entry into a
   button with data-defs (indexes into the page's #key-term-glossary JSON).
   Mouse: the bubble opens on hover; a click pins it open.
   Touch: a tap opens it, a second tap or a tap elsewhere closes it.
   Keyboard: focus opens it, Escape closes it.
   Without this script the tags are plain text and nothing is lost. */
(() => {
  const data = document.getElementById('key-term-glossary');
  if (!data) return;
  let entries;
  try { entries = JSON.parse(data.textContent); } catch (e) { return; }
  const glossaryUrl = data.dataset.glossary || '/core/appendices/section-a/';
  const hover = window.matchMedia('(hover: hover) and (pointer: fine)');

  const bubble = document.createElement('div');
  bubble.id = 'key-term-bubble';
  bubble.className = 'key-term-bubble';
  bubble.setAttribute('role', 'tooltip');
  bubble.hidden = true;
  document.body.appendChild(bubble);

  let current = null, pinned = false, hideTimer = 0;

  function render(button) {
    const ids = button.dataset.defs.split(',').map(Number);
    bubble.innerHTML = ids.map(i => entries[i]).filter(Boolean).map(e =>
      `<p><strong>${e.term}</strong> — ${e.html}</p>`).join('') +
      `<a class="key-term-bubble-link" href="${glossaryUrl}">Glossary</a>`;
  }

  function place(button) {
    const margin = 12, gap = 8;
    const r = button.getBoundingClientRect();
    const vw = document.documentElement.clientWidth;
    bubble.style.maxWidth = Math.min(352, vw - 2 * margin) + 'px';
    bubble.style.left = '0px'; bubble.style.top = '0px';
    const w = bubble.offsetWidth, h = bubble.offsetHeight;
    let left = Math.min(Math.max(r.left + r.width / 2 - w / 2, margin), vw - w - margin);
    const below = r.bottom + gap + h <= window.innerHeight || r.top - gap - h < 0;
    const top = below ? r.bottom + gap : r.top - gap - h;
    bubble.dataset.side = below ? 'below' : 'above';
    const arrow = Math.min(Math.max(r.left + r.width / 2 - left, 14), w - 14);
    bubble.style.setProperty('--arrow-x', arrow + 'px');
    bubble.style.left = (left + window.scrollX) + 'px';
    bubble.style.top = (top + window.scrollY) + 'px';
  }

  function open(button, pin) {
    clearTimeout(hideTimer);
    if (current && current !== button) current.setAttribute('aria-expanded', 'false');
    if (current !== button) render(button);
    current = button; pinned = pin || pinned && current === button;
    button.setAttribute('aria-expanded', 'true');
    button.setAttribute('aria-describedby', bubble.id);
    bubble.hidden = false;
    place(button);
  }

  function close() {
    clearTimeout(hideTimer);
    if (!current) return;
    current.setAttribute('aria-expanded', 'false');
    current.removeAttribute('aria-describedby');
    bubble.hidden = true; current = null; pinned = false;
  }

  function closeSoon() {
    clearTimeout(hideTimer);
    hideTimer = setTimeout(() => { if (!pinned) close(); }, 180);
  }

  document.querySelectorAll('.key-term[data-defs]').forEach(button => {
    button.addEventListener('mouseenter', () => { if (hover.matches) open(button, false); });
    button.addEventListener('mouseleave', () => { if (hover.matches) closeSoon(); });
    button.addEventListener('focus', () => { if (button.matches(':focus-visible')) open(button, false); });
    button.addEventListener('blur', () => { if (!pinned) closeSoon(); });
    button.addEventListener('click', event => {
      event.stopPropagation();
      if (current === button && pinned) close();
      else open(button, true);
    });
  });
  bubble.addEventListener('mouseenter', () => clearTimeout(hideTimer));
  bubble.addEventListener('mouseleave', () => { if (hover.matches) closeSoon(); });
  document.addEventListener('click', event => {
    if (current && !bubble.contains(event.target)) close();
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && current) { const b = current; close(); b.focus(); }
  });
  window.addEventListener('resize', () => { if (current) place(current); });
})();
