// 404 page: a DNA strand of the brand's 0s and 1s, snapped in the middle ("404 · strand broken"). The
// cursor (or a finger) lights the digits near it and turns the strand's twist; the ends fray at the break.
// With reduced motion it's drawn once, still. Also fills the trace card with the address that was asked for.
(() => {
  const nf = document.querySelector('.nf'), stage = document.querySelector('.nf__stage');
  if (!nf || !stage) return;
  const asked = (() => { try { return decodeURIComponent(location.pathname + location.search) || '/'; } catch (e) { return location.pathname || '/'; } })();
  const path = document.getElementById('nfPath');
  if (path) path.textContent = asked;
  const still = matchMedia('(prefers-reduced-motion: reduce)').matches;
  // light strand on the page; when the browser forces a dark theme (html.forced-dark) the digits turn light on dark,
  // switching live if forced dark is turned on or off (the page head announces it as `forceddarkchange`)
  let DARK, NAVY, BLUE, INK;
  const palette = () => {
    DARK = document.documentElement.classList.contains('forced-dark');
    NAVY = DARK ? '#c9d7ff' : '#14246b'; BLUE = DARK ? '#6f9bff' : '#3b6cf0'; INK = DARK ? '#ffffff' : '#062150';
  };
  palette();
  addEventListener('forceddarkchange', palette);
  const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
  const lerp = (a, b, t) => a + (b - a) * t;
  const mix = (a, b, t) => { const p = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16)); const x = p(a), y = p(b); return `rgb(${x.map((v, i) => Math.round(lerp(v, y[i], t))).join(',')})`; };
  const fontsReady = document.fonts ? Promise.all([document.fonts.load('500 200px "Google Sans"'), document.fonts.load('500 12px "Google Sans Code"')]).catch(() => {}) : Promise.resolve();

  // ---------- shared helpers ----------
  // a canvas that fills the stage, redrawn by `draw(t)` each frame while on screen
  function canvasLoop(host, setup, draw) {
    const c = document.createElement('canvas'), g = c.getContext('2d');
    host.appendChild(c);
    let W = 0, H = 0, dpr = 1, raf = 0, alive = true, vis = true;
    const size = () => { dpr = Math.min(2, devicePixelRatio || 1); W = host.clientWidth; H = host.clientHeight; c.width = Math.round(W * dpr); c.height = Math.round(H * dpr); setup(W, H, dpr); };
    const tick = (t) => { if (!alive) return; g.setTransform(dpr, 0, 0, dpr, 0, 0); g.clearRect(0, 0, W, H); draw(g, t, W, H); if (!still && vis) raf = requestAnimationFrame(tick); };
    const ro = new ResizeObserver(() => { size(); if (still) tick(0); });
    const io = new IntersectionObserver(([e]) => { vis = e.isIntersecting; if (vis && !still) { cancelAnimationFrame(raf); raf = requestAnimationFrame(tick); } });
    fontsReady.then(() => { if (!alive) return; size(); ro.observe(host); io.observe(host); raf = requestAnimationFrame(tick); });
    return { canvas: c, destroy() { alive = false; cancelAnimationFrame(raf); ro.disconnect(); io.disconnect(); c.remove(); } };
  }
  // the pointer, relative to the stage (eased), for any style
  const ptr = { x: -1e4, y: -1e4, tx: -1e4, ty: -1e4, on: false };
  const local = (e) => { const r = stage.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top]; };
  stage.addEventListener('pointermove', (e) => { const [x, y] = local(e); ptr.tx = x; ptr.ty = y; if (!ptr.on) { ptr.x = x; ptr.y = y; } ptr.on = true; nf.classList.add('is-touched'); });
  stage.addEventListener('pointerdown', (e) => { const [x, y] = local(e); ptr.tx = ptr.x = x; ptr.ty = ptr.y = y; ptr.on = true; nf.classList.add('is-touched'); });
  stage.addEventListener('pointerleave', () => { ptr.on = false; });
  const easePtr = () => { ptr.x = lerp(ptr.x, ptr.tx, 0.25); ptr.y = lerp(ptr.y, ptr.ty, 0.25); };
  const digitFont = (s) => `500 ${s}px "Google Sans Code", ui-monospace, Menlo, monospace`;

  // ---------- the helix: a strand of digits, snapped in the middle ----------
  function helix(host) {
    let spin = 0, W = 0, H = 0;
    return canvasLoop(host, (w, h) => { W = w; H = h; }, (g, t, w, h) => {
      easePtr();
      const target = ptr.on ? (ptr.x / w - 0.5) * 3 : 0;
      spin = lerp(spin, target, 0.06);
      const ph = (still ? 0 : t * 0.0009) + spin, cy = h / 2, amp = Math.min(h * 0.3, 110), cell = w < 600 ? 9 : 12;
      const gap = Math.max(46, w * 0.07), mid = w / 2, R = Math.max(80, h * 0.35);
      g.font = digitFont(cell * 0.95); g.textAlign = 'center'; g.textBaseline = 'middle';
      for (let x = 24; x < w - 24; x += cell * 0.75) {
        const dg = Math.abs(x - mid);
        if (dg < gap) continue; // the break
        const fray = clamp(1 - (dg - gap) / 70, 0, 1); // the ends loosen near the break
        const k = (x / w) * Math.PI * 4 + ph;
        for (const s of [1, -1]) {
          const z = Math.cos(k) * s, y = cy + Math.sin(k) * amp * s + fray * Math.sin(t * 0.004 + x) * 6 * s;
          const d = ptr.on ? Math.hypot(x - ptr.x, y - ptr.y) : 1e9, lit = d < R ? (1 - d / R) ** 1.5 : 0;
          g.globalAlpha = (0.25 + 0.5 * (z + 1) / 2) * (1 - fray * 0.55) + lit * 0.5;
          g.fillStyle = lit > 0.05 ? mix(BLUE, INK, lit) : mix(BLUE, NAVY, x / w);
          g.fillText(((x * 7 + (s > 0 ? 3 : 5)) | 0) % 2 ? '1' : '0', x, y);
        }
        // rungs every few columns
        if (((x / (cell * 0.75)) | 0) % 4 === 0 && fray < 0.5) {
          const y1 = cy + Math.sin(k) * amp, y2 = cy - Math.sin(k) * amp;
          g.globalAlpha = 0.14; g.strokeStyle = NAVY; g.setLineDash([2, 4]); g.beginPath(); g.moveTo(x, y1); g.lineTo(x, y2); g.stroke(); g.setLineDash([]);
        }
      }
      // the break, marked
      g.globalAlpha = 1; g.font = '500 12px "Google Sans Code", monospace'; g.fillStyle = DARK ? '#ff8a80' : '#c62828';
      g.fillText('404 · strand broken', mid, cy - amp - 26); // above the strand, clear of the hint below
      g.strokeStyle = 'rgba(198,40,40,.35)'; g.setLineDash([3, 5]); g.beginPath(); g.moveTo(mid, cy - amp - 14); g.lineTo(mid, cy + amp + 10); g.stroke(); g.setLineDash([]);
    });
  }



  document.getElementById('nfHint').textContent = matchMedia('(hover: none)').matches ? 'Drag across the strand' : 'Move across the strand';
  helix(stage);
})();
