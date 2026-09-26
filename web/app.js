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
  let index = 0;
  const show = (i) => {
    index = (i + photos.length) % photos.length;
    img.src = `/${enc(folder)}/${enc(photos[index])}`;
  };
  const prev = el('button', { className: 'prev', textContent: '‹', onclick: () => show(index - 1) });
  const next = el('button', { className: 'next', textContent: '›', onclick: () => show(index + 1) });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') show(index - 1);
    if (e.key === 'ArrowRight') show(index + 1);
  });

  app.replaceChildren(el('div', { className: 'slideshow' }, [img, back, prev, next]));
  show(0);
}

// Pages: "/" lists folders, "/<folder>/" shows that folder's slideshow.
const folder = decodeURIComponent(location.pathname.slice(1, -1));
(folder ? showSlideshow(folder) : showIndex()).catch((err) => {
  app.textContent = `Error: ${err.message}`;
});
