const app = document.getElementById('app');
const enc = encodeURIComponent;

async function api(query = '') {
  const res = await fetch(`/_api/list${query}`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

function el(tag, props = {}, children = []) {
  const node = Object.assign(document.createElement(tag), props);
  node.append(...children);
  return node;
}

async function showIndex() {
  const folders = await api();
  app.replaceChildren(
    el('ul', { className: 'folders' },
      folders.map((f) => el('li', {}, [el('a', { href: `/${enc(f)}/`, textContent: f })]))),
  );
}

async function showSlideshow(folder) {
  document.title = folder;
  const photos = await api(`?folder=${enc(folder)}`);
  const back = el('a', { className: 'back', href: '/', textContent: '←' });
  if (!photos.length) {
    app.replaceChildren(back, el('p', { textContent: 'no photos' }));
    return;
  }

  const img = el('img', { alt: '' });

  // pinch-zoom & pan state (custom, since fullscreen blocks native browser zoom)
  const MAX_SCALE = 4;
  let scale = 1, tx = 0, ty = 0;
  const applyTransform = () => { img.style.transform = `translate(${tx}px, ${ty}px) scale(${scale})`; };
  const resetZoom = () => { scale = 1; tx = 0; ty = 0; applyTransform(); };

  let index = 0;
  const show = (i) => {
    index = (i + photos.length) % photos.length;
    img.src = `/${enc(folder)}/${enc(photos[index])}`;
    resetZoom();
  };
  const prev = el('button', { className: 'prev', textContent: '‹', onclick: () => show(index - 1) });
  const next = el('button', { className: 'next', textContent: '›', onclick: () => show(index + 1) });

  const container = el('div', { className: 'slideshow' }, [img, back, prev, next]);

  const fullscreen = el('button', {
    className: 'fullscreen',
    textContent: '⛶',
    onclick: () => (document.fullscreenElement ? document.exitFullscreen() : container.requestFullscreen()),
  });
  document.addEventListener('fullscreenchange', () => {
    fullscreen.textContent = document.fullscreenElement ? '⤬' : '⛶';
  });
  container.append(fullscreen);

  let idleTimer;
  const resetIdle = () => {
    container.classList.remove('idle');
    clearTimeout(idleTimer);
    idleTimer = setTimeout(() => container.classList.add('idle'), 2000);
  };
  container.addEventListener('pointerdown', resetIdle);
  container.addEventListener('pointermove', resetIdle);

  // swipe to navigate, pinch to zoom, drag to pan when zoomed
  const clamp = (v, min, max) => Math.min(max, Math.max(min, v));
  const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
  const midpoint = (a, b) => ({ x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 });
  const clampTranslate = () => {
    const w = container.clientWidth, h = container.clientHeight;
    tx = clamp(tx, w - w * scale, 0);
    ty = clamp(ty, h - h * scale, 0);
  };

  const pointers = new Map();
  let pinch = null; // { prevDist, prevMid }
  let pan = null; // { startX, startY, startTx, startTy }

  container.addEventListener('touchmove', (e) => e.preventDefault(), { passive: false });

  container.addEventListener('pointerdown', (e) => {
    pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pointers.size === 2) {
      const [a, b] = pointers.values();
      pinch = { prevDist: dist(a, b), prevMid: midpoint(a, b) };
      pan = null;
    } else if (pointers.size === 1) {
      const p = pointers.values().next().value;
      pan = { startX: p.x, startY: p.y, startTx: tx, startTy: ty };
    }
  });

  container.addEventListener('pointermove', (e) => {
    if (!pointers.has(e.pointerId)) return;
    pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });

    if (pointers.size === 2 && pinch) {
      const [a, b] = pointers.values();
      const d = dist(a, b);
      const m = midpoint(a, b);
      const lx = (pinch.prevMid.x - tx) / scale;
      const ly = (pinch.prevMid.y - ty) / scale;
      scale = clamp(scale * (d / pinch.prevDist), 1, MAX_SCALE);
      tx = m.x - scale * lx;
      ty = m.y - scale * ly;
      pinch = { prevDist: d, prevMid: m };
      clampTranslate();
      applyTransform();
    } else if (pointers.size === 1 && pan && scale > 1) {
      const p = pointers.values().next().value;
      tx = pan.startTx + (p.x - pan.startX);
      ty = pan.startTy + (p.y - pan.startY);
      clampTranslate();
      applyTransform();
    }
  });

  const endPointer = (e) => {
    const p = pointers.get(e.pointerId);
    pointers.delete(e.pointerId);

    if (pointers.size === 1) {
      const remaining = pointers.values().next().value;
      pan = { startX: remaining.x, startY: remaining.y, startTx: tx, startTy: ty };
      pinch = null;
    } else if (pointers.size === 0) {
      if (scale <= 1 && pan && p) {
        const dx = p.x - pan.startX;
        if (Math.abs(dx) >= 50) show(dx < 0 ? index + 1 : index - 1);
      }
      if (scale <= 1) resetZoom();
      pinch = null;
      pan = null;
    }
  };
  container.addEventListener('pointerup', endPointer);
  container.addEventListener('pointercancel', endPointer);

  document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') show(index - 1);
    if (e.key === 'ArrowRight') show(index + 1);
    resetIdle();
  });

  app.replaceChildren(container);
  show(0);
  resetIdle();
}

// Pages: "/" lists folders, "/<folder>/" shows that folder's slideshow.
const folder = decodeURIComponent(location.pathname.slice(1, -1));
(folder ? showSlideshow(folder) : showIndex()).catch((err) => {
  app.textContent = `Error: ${err.message}`;
});
