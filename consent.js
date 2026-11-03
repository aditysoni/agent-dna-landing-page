// Cookie banner, on every page until a choice is made (not on Cookie Settings, which is the full version of the
// same choice). It saves the same record as that page (`agentdna-consent`: necessary, preferences, analytics), so
// either place can change it. It never takes focus or blocks the page. Styles: .consent in styles.css.
(() => {
  const KEY = 'agentdna-consent';
  let saved = null;
  try { saved = JSON.parse(localStorage.getItem(KEY)); } catch (e) { return; } // storage blocked: nothing to remember
  if (saved || document.getElementById('ckForm')) return;

  const box = document.createElement('section');
  box.className = 'consent';
  box.setAttribute('aria-label', 'Cookie choices');
  box.innerHTML = `
    <p class="consent__title">Cookies on AgentDNA</p>
    <p class="consent__body">We keep a few preferences in your browser, like the layout you last viewed. No advertising or tracking cookies. <a href="cookies.html">Manage settings</a></p>
    <div class="consent__actions">
      <button class="btn btn--outline" type="button" data-consent="off">Reject optional</button>
      <button class="btn btn--primary" type="button" data-consent="on">Accept all</button>
    </div>`;

  const choose = (all) => {
    try { localStorage.setItem(KEY, JSON.stringify({ necessary: true, preferences: all, analytics: all, updated: new Date().toISOString() })); } catch (e) {}
    box.classList.remove('is-in');
    setTimeout(() => box.remove(), 300);
  };
  box.querySelector('[data-consent="on"]').addEventListener('click', () => choose(true));
  box.querySelector('[data-consent="off"]').addEventListener('click', () => choose(false));

  const show = () => { document.body.appendChild(box); requestAnimationFrame(() => requestAnimationFrame(() => box.classList.add('is-in'))); };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => setTimeout(show, 600));
  else setTimeout(show, 600);
})();
