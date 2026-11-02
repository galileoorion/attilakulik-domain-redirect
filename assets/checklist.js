/* Master Checklist ticks (Core, Appendix C). checklist_page.py gives each
   question a checkbox with a stable data-check id; this script keeps the
   ticks in localStorage under "craft-checklist-v1", shows how many are
   ticked overall and per chapter, and offers to clear them. Without
   storage the boxes still work, for as long as the page is open. */
(function () {
  var KEY = 'craft-checklist-v1';
  var boxes = Array.prototype.slice.call(document.querySelectorAll('input[data-check]'));
  if (!boxes.length) return;
  var bar = document.querySelector('.checklist-bar');
  var note = document.querySelector('.checklist-note');
  var doneEl = document.querySelector('[data-check-done]');
  var stored = true;
  var state = {};

  function load() {
    try { state = JSON.parse(localStorage.getItem(KEY) || '{}') || {}; }
    catch (e) { stored = false; state = {}; }
  }
  function save() {
    if (!stored) return;
    try { localStorage.setItem(KEY, JSON.stringify(state)); }
    catch (e) { stored = false; showNote(); }
  }
  function showNote() {
    if (!note) return;
    if (!stored) note.textContent = 'This browser is not letting the page save, so ticks last only while the page is open.';
    note.hidden = false;
  }

  // One count per chapter, shown after the chapter heading.
  var groups = {};
  boxes.forEach(function (box) {
    var g = box.getAttribute('data-group');
    if (!groups[g]) {
      var heading = document.getElementById(g);
      var count = document.createElement('span');
      count.className = 'check-count';
      if (heading) heading.appendChild(count);
      groups[g] = { boxes: [], count: count };
    }
    groups[g].boxes.push(box);
  });

  function render() {
    var done = 0;
    boxes.forEach(function (box) {
      box.checked = !!state[box.getAttribute('data-check')];
      var item = box.closest('li');
      if (item) item.classList.toggle('done', box.checked);
      if (box.checked) done++;
    });
    if (doneEl) doneEl.textContent = done;
    Object.keys(groups).forEach(function (g) {
      var n = groups[g].boxes.filter(function (b) { return b.checked; }).length;
      var all = groups[g].boxes.length;
      groups[g].count.textContent = n + ' of ' + all;
      groups[g].count.classList.toggle('complete', n === all);
    });
  }

  load();
  render();
  if (bar) bar.hidden = false;
  showNote();

  document.addEventListener('change', function (e) {
    var box = e.target;
    if (!box.matches || !box.matches('input[data-check]')) return;
    var id = box.getAttribute('data-check');
    if (box.checked) state[id] = 1; else delete state[id];
    save();
    render();
  });

  var clear = document.querySelector('.checklist-clear');
  if (clear) clear.addEventListener('click', function () {
    var done = boxes.filter(function (b) { return b.checked; }).length;
    if (!done || !window.confirm('Clear all ' + done + ' ticks on this checklist?')) return;
    state = {};
    save();
    render();
  });

  // Keep several open tabs in step.
  window.addEventListener('storage', function (e) {
    if (e.key === KEY) { load(); render(); }
  });
})();
