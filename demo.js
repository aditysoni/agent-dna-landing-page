// The form on Get a demo, Contact and Security Health Check (same markup and ids): checks each field, sends it to
// the Google Sheet (sendToSheet, in site.js), then shows the thank-you state. The menu is in site.js.
(() => {
  const form = document.getElementById('demoForm'), done = document.getElementById('demoDone');
  if (!form) return;
  const MSG = {
    firstName: 'Enter your first name.', lastName: 'Enter your last name.',
    email: 'Enter a work email, like name@company.com.', company: 'Enter your company.',
    companySize: 'Choose your company size.', role: 'Choose your role.',
    agentCount: 'Choose how many agents you run.', topic: 'Choose a topic.', message: 'Add a short message.',
  };
  // one message under a field, shown after it's been left or on submit
  const show = (el) => {
    const field = el.closest('.field');
    let err = field.querySelector('.field__err');
    const bad = !el.checkValidity();
    field.classList.toggle('is-bad', bad);
    el.setAttribute('aria-invalid', bad);
    if (bad) {
      if (!err) { err = document.createElement('span'); err.className = 'field__err'; err.id = el.name + 'Err'; field.appendChild(err); el.setAttribute('aria-describedby', err.id); }
      err.textContent = MSG[el.name] || 'Fill in this field.';
    } else if (err) err.remove();
    return !bad;
  };
  form.querySelectorAll('[required]').forEach((el) => {
    el.addEventListener('blur', () => { if (el.value) show(el); });
    el.addEventListener('input', () => { if (el.closest('.field').classList.contains('is-bad')) show(el); });
    el.addEventListener('change', () => { if (el.tagName === 'SELECT') show(el); });
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const fields = [...form.querySelectorAll('[required]')];
    const ok = fields.map(show).every(Boolean);
    if (!ok) { fields.find((f) => !f.checkValidity()).focus(); return; }
    const data = Object.fromEntries(new FormData(form));
    const btn = form.querySelector('button[type=submit]');
    const note = form.querySelector('.demo__note');
    btn.disabled = true;
    const thanks = () => {
      document.getElementById('demoName').textContent = data.firstName ? ', ' + data.firstName.trim() : '';
      document.getElementById('demoEmail').textContent = data.email.trim();
      form.hidden = true;
      done.hidden = false;
      done.focus();
    };
    // the page name picks the sheet tab (demo, contact, health-check); works for /contact.html and /contact/
    const page = location.pathname.replace(/\/$/, '').split('/').pop().replace(/\.html$/, '') || 'demo';
    // sendToSheet is in site.js; if that's an old cached copy, give the button back rather than freeze it
    const sent = typeof sendToSheet === 'function' ? sendToSheet({ ...data, form: page }, note) : Promise.reject();
    sent.then(thanks, () => { btn.disabled = false; });
  });
})();
