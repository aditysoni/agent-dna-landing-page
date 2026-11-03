// Report a vulnerability (security.html): the report form, one step at a time (Affected → Details → Impact →
// Contact) with a progress bar. Each step is checked before moving on; sending shows a thank-you with a reference.
(() => {
  const form = document.getElementById('vulnForm'), done = document.getElementById('vulnDone');
  if (!form || !done) return;
  const steps = [...form.querySelectorAll('.vf__step')];
  let step = 0;

  // ---------- checks ----------
  const MSG = { product: 'Choose the product.', kind: 'Choose the type of issue.', severity: 'Choose a severity.', title: 'Add a one-line summary.', description: 'Describe what you found.', steps: 'Add the steps to reproduce it.', email: 'Enter a valid email, or leave it blank.', agree: 'Please confirm you followed the testing rules.' };
  const fieldOf = (el) => el.closest('.field') || el.closest('.vf__agree');
  const show = (el) => {
    const f = fieldOf(el), group = el.type === 'radio' ? form.querySelectorAll(`[name="${el.name}"]`) : [el];
    const bad = el.type === 'radio' ? ![...group].some((r) => r.checked) : !el.checkValidity();
    let err = f.querySelector('.field__err');
    f.classList.toggle('is-bad', bad);
    if (bad) { if (!err) { err = document.createElement('span'); err.className = 'field__err'; f.appendChild(err); } err.textContent = MSG[el.name] || 'Fill in this field.'; }
    else if (err) err.remove();
    return !bad;
  };
  const check = (scope) => {
    const els = [...scope.querySelectorAll('[required], [name="email"]')].filter((el, i, a) => el.type !== 'radio' || a.findIndex((x) => x.name === el.name) === i);
    const ok = els.map(show).every(Boolean);
    if (!ok) { const first = els.find((el) => fieldOf(el).classList.contains('is-bad')); if (first) first.focus(); }
    return ok;
  };
  const recheck = (e) => { const f = fieldOf(e.target); if (f && f.classList.contains('is-bad')) show(e.target); };
  form.addEventListener('change', recheck);
  form.addEventListener('input', recheck);

  // ---------- steps ----------
  const go = (i) => {
    step = Math.max(0, Math.min(steps.length - 1, i));
    steps.forEach((s, n) => s.classList.toggle('is-on', n === step));
    form.style.setProperty('--p', ((step + 1) / steps.length).toFixed(3));
    form.querySelectorAll('.vf__steps li').forEach((li, n) => { li.classList.toggle('is-on', n === step); li.classList.toggle('is-done', n < step); });
    form.classList.toggle('is-first', step === 0);
    form.classList.toggle('is-last', step === steps.length - 1);
  };
  // a new step starts at the top of the card (on phones the button sits below the fold)
  const turn = (i) => { go(i); if (form.getBoundingClientRect().top < 80) form.scrollIntoView({ block: 'start', behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' }); };
  form.querySelector('.vf__next').addEventListener('click', () => { if (check(steps[step])) turn(step + 1); });
  form.querySelector('.vf__back').addEventListener('click', () => turn(step - 1));

  // ---------- send ----------
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!check(form)) {
      // back to the first step with a problem, then focus the field (it can't take focus while its step is hidden)
      const i = steps.findIndex((s) => s.querySelector('.is-bad')); go(i);
      const el = steps[i].querySelector('.is-bad input, .is-bad select, .is-bad textarea'); if (el) el.focus();
      return;
    }
    const data = Object.fromEntries(new FormData(form));
    const btn = form.querySelector('.vf__send'), note = form.querySelector('.vf__note');
    btn.disabled = true;
    // the reference goes into the sheet row too, so a reporter quoting it can be matched to their report
    // (6 random base36 characters, same look as before, but no repeats every 25 days like a clipped timestamp)
    const ref = 'ADNA-VR-' + [...crypto.getRandomValues(new Uint8Array(6))].map((b) => (b % 36).toString(36)).join('').toUpperCase();
    const thanks = () => {
      document.getElementById('vulnRef').textContent = ref;
      document.getElementById('vulnFollow').textContent = data.email ? `We'll follow up at ${data.email}.` : 'You reported anonymously, so we won’t be able to reply.';
      form.hidden = true; done.hidden = false; done.focus();
      btn.disabled = false;
    };
    // sendToSheet is in site.js; if that's an old cached copy, give the button back rather than freeze it
    const sent = typeof sendToSheet === 'function' ? sendToSheet({ ...data, ref, form: 'vulnerability' }, note) : Promise.reject();
    sent.then(thanks, () => { btn.disabled = false; });
  });
  document.getElementById('vulnAgain').addEventListener('click', () => {
    form.reset(); form.querySelectorAll('.is-bad').forEach((f) => f.classList.remove('is-bad')); form.querySelectorAll('.field__err').forEach((e) => e.remove());
    done.hidden = true; form.hidden = false; go(0);
  });

  go(0);
})();
