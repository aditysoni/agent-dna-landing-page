// Shared by the inner pages (demo, about, legal, 404): the nav's phone and tablet menu, and where the forms send to.

// The Apps Script web app that writes form submissions to the Google Sheet (see sheets/README.md). Used by demo.js
// and vuln.js. Empty = nothing is sent (the forms still show their thank-you).
const SHEET_URL = 'https://script.google.com/macros/s/AKfycby8hWCkM7x84VkC2Kk4P1o8Ei5V_EEczG2twwXDO_1lCgDIGn5VUllNLTvBBt6lo0TiuA/exec';

// Sends one form to the sheet. `note` is the form's small print: on failure it shows the error until the next try,
// then gets its own text back. Resolves once sent; rejects on a network failure or after 15s. text/plain + no-cors
// skips the CORS preflight Apps Script can't answer, so the reply can't be read.
const sendToSheet = (payload, note) => {
  if (!note.dataset.own) note.dataset.own = note.innerHTML;
  note.innerHTML = note.dataset.own;
  note.removeAttribute('role');
  if (!SHEET_URL) return new Promise((ok) => setTimeout(ok, 500));
  const stop = new AbortController(), timer = setTimeout(() => stop.abort(), 15000);
  return fetch(SHEET_URL, {
    method: 'POST', mode: 'no-cors', headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify(payload), signal: stop.signal,
  }).catch((err) => {
    note.setAttribute('role', 'alert');
    note.textContent = 'That didn’t send. Check your connection and try again.';
    throw err;
  }).finally(() => clearTimeout(timer));
};

(() => {
  // phones and tablets: the menu button opens and closes the nav links
  const nav = document.querySelector('.nav'), menu = document.querySelector('.nav__menu');
  if (nav && menu) {
    const set = (o) => { nav.classList.toggle('is-open', o); menu.setAttribute('aria-expanded', o); menu.setAttribute('aria-label', o ? 'Close menu' : 'Menu'); };
    menu.addEventListener('click', (e) => { e.stopPropagation(); set(!nav.classList.contains('is-open')); });
    nav.querySelectorAll('.nav__links a').forEach((a) => a.addEventListener('click', () => set(false)));
    document.addEventListener('click', (e) => { if (!e.target.closest('.nav')) set(false); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && nav.classList.contains('is-open')) { set(false); menu.focus(); } });
  }

})();
