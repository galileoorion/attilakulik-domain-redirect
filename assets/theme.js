/* Light/dark switch for the Core, Reference and search pages.
   Light is the default. The reader's choice is kept in localStorage under
   "craft-theme"; a small inline script in <head> applies a stored "dark"
   before the page is drawn, and this file runs the button. */
(() => {
  const KEY = 'craft-theme';
  const root = document.documentElement;
  const button = document.getElementById('theme-toggle');
  if (!button) return;

  function stored() {
    try { return localStorage.getItem(KEY) === 'dark' ? 'dark' : 'light'; } catch (error) { return 'light'; }
  }
  function current() {
    return root.dataset.theme === 'dark' ? 'dark' : 'light';
  }
  function render() {
    const dark = current() === 'dark';
    button.textContent = dark ? 'Light mode' : 'Dark mode';
    button.title = dark ? 'Switch to light mode' : 'Switch to dark mode';
  }
  function apply(theme) {
    if (theme === 'dark') root.dataset.theme = 'dark';
    else delete root.dataset.theme;
    render();
  }

  button.addEventListener('click', () => {
    const next = current() === 'dark' ? 'light' : 'dark';
    apply(next);
    try { localStorage.setItem(KEY, next); } catch (error) { /* The choice lasts for this page only. */ }
  });
  // Keep other open tabs, and pages restored by the Back button, in step.
  window.addEventListener('storage', event => { if (event.key === KEY) apply(stored()); });
  window.addEventListener('pageshow', event => { if (event.persisted) apply(stored()); });
  render();
  button.hidden = false;
})();
