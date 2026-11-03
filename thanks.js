// The thank-you on Get a demo, Contact and Security Health Check: a drawn check, the page's own thanks, then three
// "what happens next" steps (the first done, the second next). demo.js calls Thanks.show(data) once a form is sent.
(() => {
  const form = document.getElementById('demoForm'), done = document.getElementById('demoDone');
  if (!form || !done) return;
  const panel = done.closest('.demo__panel');
  const page = location.pathname.replace(/\/$/, '').split('/').pop().replace(/\.html$/, '') || 'demo';
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  // the page's own thank-you words, written per page by build_forms.py
  const TITLE = done.querySelector('.demo__done-title').innerHTML;
  const BODY = done.querySelector('.demo__done-body').innerHTML;
  const title = (d) => TITLE.replace(/<span id="demoName"><\/span>/, d.firstName && d.firstName.trim() ? ', ' + esc(d.firstName.trim()) : '');
  const body = (d) => BODY.replace(/<b id="demoEmail"><\/b>/, '<b>' + esc(d.email.trim()) + '</b>');

  // what happens next, per page (nothing here promises a time we can't keep)
  const STEPS = {
    demo: [['Request received', '{ago}'], ['We email you to find a time', 'A short note to {email} from the AgentDNA team.'], ['Your walkthrough', 'One of your agent flows, mapped from user to output.']],
    contact: [['Message received', '{ago}'], ['It reaches the right person', 'Product, sales, partnerships or press.'], ['We reply', 'To {email}.']],
    'health-check': [['Details received', '{ago}'], ['We look at your agents', 'The agents you run and the tools they reach.'], ['Your customised report', 'A health score and prioritised next steps, sent to {email}.']],
  }[page] || [['Request received', '{ago}'], ['We email you', 'At {email}.'], ['We follow up', 'With what you asked for.']];

  const TICK = '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3.5 8.4 6.6 11.4 12.5 5"/></svg>';
  const ago = (t) => {
    const m = Math.round((Date.now() - t) / 60000);
    if (m < 1) return 'Sent just now.';
    if (m < 60) return `Sent ${m} minute${m === 1 ? '' : 's'} ago.`;
    return 'Sent at ' + new Date(t).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }) + '.';
  };
  const fill = (s, d, t) => s.replace('{email}', '<b>' + esc(d.email.trim()) + '</b>').replace('{ago}', `<span data-ago>${ago(t)}</span>`);

  let timer = 0;
  const show = (d) => {
    const t = Date.now();
    // keep the panel the form's height on desktop, so the card doesn't collapse around a shorter message
    panel.style.setProperty('--tk-h', form.offsetHeight + 'px');
    done.className = 'demo__done tk';
    done.innerHTML = `
      <svg class="tk-check" viewBox="0 0 48 48" aria-hidden="true"><circle cx="24" cy="24" r="22"/><path d="M15 24.5 21 30.5 33 17.5"/></svg>
      <p class="tk-title">${title(d)}</p>
      <p class="tk-body">${body(d)}</p>
      <ol class="tk-steps">${STEPS.map(([b, s], i) => `
        <li class="tk-step ${i === 0 ? 'is-done' : i === 1 ? 'is-next' : ''}" style="--i:${i}">
          <span class="tk-dot">${i === 0 ? TICK : '<i></i>'}</span>
          <div><b>${b}</b><span>${fill(s, d, t)}</span></div>
        </li>`).join('')}
      </ol>
      <div class="tk-actions"><a class="btn btn--outline" href="index.html">Back to AgentDNA</a></div>`;
    form.hidden = true; done.hidden = false;
    done.focus(); // scrolls it into view on phones, where the form sits below the pitch
    // the "sent … ago" line keeps itself current
    const el = done.querySelector('[data-ago]');
    clearInterval(timer); timer = setInterval(() => { el.textContent = ago(t); }, 20000);
  };
  window.Thanks = { show };
})();
