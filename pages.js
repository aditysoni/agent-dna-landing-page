// Inner pages: the legal contents list follows the section in view, and the cookie preferences save.
(() => {
  // contents: mark the section being read, the last one whose heading has passed 30% down the screen. The closing
  // sections are too short to ever reach that line, so at the bottom of the page the last one is marked, and a
  // clicked entry stays marked until you scroll yourself.
  const links = [...document.querySelectorAll('.lg__toc a')];
  const secs = [...document.querySelectorAll('.lg__doc section[id]')];
  if (links.length && secs.length) {
    const byId = new Map(links.map((a) => [a.getAttribute('href').slice(1), a]));
    let pinned = null, raf = 0;
    const mark = (id) => links.forEach((a) => a.classList.toggle('is-on', a === byId.get(id)));
    const update = () => {
      raf = 0;
      if (pinned) return mark(pinned);
      const line = innerHeight * 0.3;
      let cur = secs[0];
      for (const s of secs) if (s.getBoundingClientRect().top <= line) cur = s;
      if (innerHeight + scrollY >= document.documentElement.scrollHeight - 4) cur = secs[secs.length - 1];
      mark(cur.id);
    };
    const queue = () => { if (!raf) raf = requestAnimationFrame(update); };
    addEventListener('scroll', queue, { passive: true });
    addEventListener('resize', queue);
    links.forEach((a) => a.addEventListener('click', () => { pinned = a.getAttribute('href').slice(1); mark(pinned); }));
    ['wheel', 'touchstart', 'keydown'].forEach((t) => addEventListener(t, () => { if (pinned) { pinned = null; queue(); } }, { passive: true }));
    update();
  }

  // cookie preferences: kept in this browser only
  const form = document.getElementById('ckForm');
  if (!form) return;
  const KEY = 'agentdna-consent';
  const saved = form.querySelector('.ck__saved');
  let prefs = {};
  try { prefs = JSON.parse(localStorage.getItem(KEY)) || {}; } catch (e) {}
  form.querySelectorAll('input[name]').forEach((i) => { if (!i.disabled && i.name in prefs) i.checked = !!prefs[i.name]; });
  const save = (all) => {
    const out = { necessary: true, updated: new Date().toISOString() };
    form.querySelectorAll('input[name]:not(:disabled)').forEach((i) => { if (all !== undefined) i.checked = all; out[i.name] = i.checked; });
    try { localStorage.setItem(KEY, JSON.stringify(out)); } catch (e) {}
    saved.classList.add('is-on');
    clearTimeout(save.t); save.t = setTimeout(() => saved.classList.remove('is-on'), 2400);
  };
  form.addEventListener('submit', (e) => { e.preventDefault(); save(); });
  form.querySelector('[data-all="on"]').addEventListener('click', () => save(true));
  form.querySelector('[data-all="off"]').addEventListener('click', () => save(false));
})();
