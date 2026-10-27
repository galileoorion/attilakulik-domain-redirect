(() => {
  const input = document.getElementById('query');
  const filter = document.getElementById('book-filter');
  const status = document.getElementById('search-status');
  const output = document.getElementById('search-results');
  let recordsPromise;
  let timer;

  function escapeHTML(value) {
    return value.replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
  }
  function normalized(value) {
    return value.normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase();
  }
  function words(value) {
    return normalized(value).match(/[\p{L}\p{N}]+/gu) || [];
  }
  function getRecords() {
    if (!recordsPromise) recordsPromise = fetch('/search-index.json').then(response => {
      if (!response.ok) throw new Error('Search index could not be loaded');
      return response.json();
    });
    return recordsPromise;
  }
  function snippet(text, terms) {
    const lower = normalized(text);
    let pos = Math.min(...terms.map(term => {
      const found = lower.indexOf(term);
      return found < 0 ? Infinity : found;
    }));
    if (!Number.isFinite(pos)) pos = 0;
    const from = Math.max(0, pos - 90), to = Math.min(text.length, pos + 220);
    return `${from ? '…' : ''}${text.slice(from, to).trim()}${to < text.length ? '…' : ''}`;
  }
  function score(record, terms) {
    const title = normalized(`${record.chapter} ${record.title} ${record.section}`);
    const body = normalized(record.text);
    if (!terms.every(term => title.includes(term) || body.includes(term))) return 0;
    return terms.reduce((sum, term) => {
      const titleHits = title.split(term).length - 1;
      const bodyHits = body.split(term).length - 1;
      return sum + titleHits * 25 + Math.min(bodyHits, 20);
    }, 0);
  }
  async function search() {
    const terms = [...new Set(words(input.value))];
    if (!terms.length) {
      status.textContent = 'Enter a word or phrase to search.';
      output.replaceChildren();
      return;
    }
    status.textContent = 'Searching…';
    try {
      const records = await getRecords();
      const hits = records.filter(record => filter.value === 'all' || filter.value === record.book)
        .map(record => ({record, rank: score(record, terms)}))
        .filter(hit => hit.rank > 0)
        .sort((a, b) => b.rank - a.rank || a.record.url.localeCompare(b.record.url));
      status.textContent = `${hits.length} ${hits.length === 1 ? 'result' : 'results'}${hits.length > 50 ? ' · showing the first 50' : ''}`;
      output.innerHTML = hits.slice(0, 50).map(({record}) =>
        `<article class="search-hit"><p class="hit-meta">${escapeHTML(record.book)} · ${escapeHTML(record.chapter)}</p>`+
        `<h2><a href="${escapeHTML(record.url)}">${escapeHTML(record.title)}</a></h2>`+
        `<p>${escapeHTML(snippet(record.text, terms))}</p></article>`).join('');
    } catch (error) {
      status.textContent = error.message;
      output.replaceChildren();
    }
  }
  input.addEventListener('input', () => { clearTimeout(timer); timer = setTimeout(search, 170); });
  filter.addEventListener('change', search);
  const url = new URL(location.href);
  if (url.searchParams.has('q')) { input.value = url.searchParams.get('q'); search(); }
})();
