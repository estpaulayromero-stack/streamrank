// ============================================================
//  StreamRank — cargarPeliculas.js
//  Carga global_top50.json y renderiza index.html completo
//  NOTA: usa window.BACKEND_BASE_URL definido en index.html
// ============================================================

// ── NO redeclarar BACKEND_BASE — lo lee de window ───────────
function getBackend() {
  return (window.BACKEND_BASE_URL || 'http://192.168.101.9/back-streamRank').replace(/\/$/, '');
}

// Estado global de la página
let todasLasCartas = [];
let cartasVisibles = [];

// ============================================================
//  1. FETCH JSON
// ============================================================
async function cargarPeliculas() {
  const contenedor = document.getElementById('contenedorPeliculas');
  if (!contenedor) return;

  contenedor.innerHTML = `
    <div style="color:#aaa;text-align:center;padding:60px 0;width:100%;">
      Cargando contenido...
    </div>`;

  try {
    const url  = `${getBackend()}/json/global_top50.json`;
    const resp = await fetch(url, { cache: 'no-store' });
    if (!resp.ok) throw new Error(`HTTP ${resp.status} al cargar ${url}`);

    const data  = await resp.json();
    const items = Array.isArray(data.peliculas)
      ? data.peliculas
      : Array.isArray(data.contenido)
        ? data.contenido
        : [];

    if (!items.length) throw new Error('El JSON existe pero no tiene ítems');

    todasLasCartas = items;

    renderHero(items[0], data.plataforma || 'GLOBAL');
    aplicarFiltros();
    initModal();

    if (typeof initBotonesBookmark === 'function') initBotonesBookmark();
    if (typeof initBotonesWatch    === 'function') initBotonesWatch();

  } catch (err) {
    console.error('[cargarPeliculas]', err);
    contenedor.innerHTML = `
      <div style="color:#e7000b;text-align:center;padding:60px 0;width:100%;">
        ⚠ No se pudo cargar el contenido.<br>
        <small style="color:#aaa;">${err.message}</small><br><br>
        <small style="color:#aaa;">
          Ejecuta <strong>scraper_global.py</strong> y verifica que
          <code>back-streamRank/json/global_top50.json</code> exista.
        </small>
      </div>`;
  }
}

// ============================================================
//  2. HERO DINÁMICO
// ============================================================
function renderHero(item, plataforma) {
  if (!item) return;

  window.heroActual = {
    titulo:     item.titulo,
    tipo:       item.tipo       || 'pelicula',
    genero:     item.genero     || '',
    plataforma: plataforma,
    imagen_url: item.imagen_url || '',
    rating:     item.rating     || null,
    trailer:    item.trailer    || '',
  };

  const tag        = document.getElementById('heroTag');
  const title      = document.getElementById('heroTitle');
  const desc       = document.getElementById('heroDescription');
  const img        = document.getElementById('heroImage');
  const trailerBtn = document.getElementById('heroTrailerBtn');

  if (tag)   tag.textContent   = `#1 GLOBAL · ${(item.tipo || 'PELÍCULA').toUpperCase()}`;
  if (title) title.textContent = item.titulo;
  if (desc)  desc.textContent  = item.descripcion || '';
  if (img)  { img.src = item.imagen_url || ''; img.alt = item.titulo; }

  if (trailerBtn) trailerBtn.onclick = () => abrirModalPelicula(item, plataforma);

  const btnAdd = document.getElementById('heroAddBtn');
  if (btnAdd) {
    btnAdd.classList.remove('added');
    btnAdd.querySelector('.btn-text').textContent = 'Agregar a la lista';
    btnAdd.querySelector('.icon').innerHTML =
      `<img src="assets/icons/agregar.svg" alt="Agregar" style="width:20px;height:20px;">`;
  }
}

// ============================================================
//  3. TARJETAS
// ============================================================
function crearTarjeta(item, index, plataforma) {
  const card = document.createElement('article');
  card.className           = 'movie-card';
  card.dataset.duration    = item.fecha       || item.duracion || '';
  card.dataset.description = item.descripcion || '';
  card.dataset.trailer     = item.trailer     || '';

  card.innerHTML = `
    <div class="card-number">${index + 1}</div>
    <div class="card-image-wrapper">
      <img src="${item.imagen_url || 'assets/icons/placeholder.png'}"
           alt="${item.titulo}" class="card-image"
           onerror="this.src='assets/icons/placeholder.png'">
    </div>
    <div class="card-info">
      <div class="info-top-tags">
        <span class="tag-type">${(item.tipo || 'película').toUpperCase()}</span>
        <span class="tag-genre">• ${item.genero || ''}</span>
      </div>
      <h3 class="info-title">${item.titulo}</h3>
      <p class="info-desc">${(item.descripcion || '').slice(0, 90)}…</p>
      <div class="info-rating">
        <div class="rating-icon"><img src="assets/icons/Estrella.svg" alt="Star"></div>
        <span class="rating-text">${item.rating || '—'}</span>
      </div>
    </div>
    <div class="card-actions">
      <span class="tag-platform">${plataforma}</span>
      <button class="btn-bookmark" title="Agregar a mi lista">
        <img src="assets/icons/Agregar.svg" alt="Guardar" class="bookmark-icon">
      </button>
    </div>`;

  card.addEventListener('click', e => {
    if (e.target.closest('.btn-bookmark')) return;
    abrirModalPelicula(item, plataforma);
  });

  return card;
}

function renderTarjetas(items, plataforma = 'GLOBAL') {
  const contenedor = document.getElementById('contenedorPeliculas');
  if (!contenedor) return;
  contenedor.innerHTML = '';

  if (!items.length) {
    contenedor.innerHTML = `
      <div style="color:#aaa;text-align:center;padding:60px 0;width:100%;">
        No hay resultados para este filtro.
      </div>`;
    return;
  }

  items.forEach((item, i) => contenedor.appendChild(crearTarjeta(item, i, plataforma)));

  if (typeof initBotonesBookmark === 'function') initBotonesBookmark();
  if (typeof initBotonesWatch    === 'function') initBotonesWatch();
}

// ============================================================
//  4. FILTROS
// ============================================================
function aplicarFiltros() {
  const tipoActivo  = document.querySelector('.toggle-btn.active')?.dataset.tipo    || 'todos';
  const generoActivo= document.querySelector('.dropdown-btn[data-tipo="genero"]')?.dataset.valor  || 'todos';
  const durActiva   = document.querySelector('.dropdown-btn[data-tipo="duracion"]')?.dataset.valor || 'todos';
  const ordenActivo = document.querySelector('.sort-btn.active')?.dataset.orden     || 'rating';

  let lista = [...todasLasCartas];

  if (tipoActivo === 'peliculas')
    lista = lista.filter(i => (i.tipo || '').toLowerCase().includes('pel'));
  else if (tipoActivo === 'series')
    lista = lista.filter(i => (i.tipo || '').toLowerCase().includes('ser'));

  if (generoActivo !== 'todos')
    lista = lista.filter(i => (i.genero || '').toLowerCase().includes(generoActivo.toLowerCase()));

  if (durActiva !== 'todos') {
    lista = lista.filter(i => {
      const mins = i.duracion_min || parseInt(i.duracion) || 0;
      if (!mins) return true;
      if (durActiva === 'corta') return mins < 90;
      if (durActiva === 'media') return mins >= 90 && mins <= 130;
      if (durActiva === 'larga') return mins > 130;
      return true;
    });
  }

  if (ordenActivo === 'rating')
    lista.sort((a, b) => (b.rating || 0) - (a.rating || 0));
  else
    lista.sort((a, b) => (a.posicion || 0) - (b.posicion || 0));

  cartasVisibles = lista;
  renderTarjetas(lista, 'GLOBAL');
}

function initFiltros() {
  const tipoMap  = { 'Todos': 'todos', 'Películas': 'peliculas', 'Series': 'series' };
  const ordenMap = { 'Rating': 'rating', 'Popularidad': 'popularidad' };

  document.querySelectorAll('.toggle-btn').forEach(btn => {
    btn.dataset.tipo = tipoMap[btn.querySelector('.btn-text')?.textContent.trim()] || 'todos';
    btn.addEventListener('click', () => {
      document.querySelectorAll('.toggle-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      aplicarFiltros();
    });
  });

  document.querySelectorAll('.sort-btn').forEach(btn => {
    btn.dataset.orden = ordenMap[btn.querySelector('.btn-text')?.textContent.trim()] || 'rating';
    btn.addEventListener('click', () => {
      document.querySelectorAll('.sort-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      aplicarFiltros();
    });
  });

  const dropdowns = document.querySelectorAll('.dropdown-btn');
  if (dropdowns.length >= 2) {
    crearDropdownFiltro(dropdowns[0], 'genero', [
      { valor: 'todos',           label: 'Todos los géneros'  },
      { valor: 'acción',          label: 'Acción'             },
      { valor: 'drama',           label: 'Drama'              },
      { valor: 'comedia',         label: 'Comedia'            },
      { valor: 'crimen',          label: 'Crimen'             },
      { valor: 'ciencia ficción', label: 'Ciencia Ficción'    },
      { valor: 'fantasía',        label: 'Fantasía'           },
      { valor: 'terror',          label: 'Terror'             },
      { valor: 'animación',       label: 'Animación'          },
      { valor: 'suspense',        label: 'Suspense'           },
    ]);
    crearDropdownFiltro(dropdowns[1], 'duracion', [
      { valor: 'todos', label: 'Cualquier duración'   },
      { valor: 'corta', label: 'Corta (< 100 min)'    },
      { valor: 'media', label: 'Media (100–150 min)'  },
      { valor: 'larga', label: 'Larga (> 150 min)'    },
    ]);
  }

  document.addEventListener('click', () => {
    document.querySelectorAll('.dropdown-menu.open').forEach(m => m.classList.remove('open'));
  });
}

function crearDropdownFiltro(btnEl, tipo, opciones) {
  btnEl.dataset.tipo  = tipo;
  btnEl.dataset.valor = 'todos';

  const wrapper = document.createElement('div');
  wrapper.className = 'dropdown-wrapper';
  btnEl.parentNode.insertBefore(wrapper, btnEl);
  wrapper.appendChild(btnEl);

  const menu = document.createElement('div');
  menu.className = 'dropdown-menu';
  menu.innerHTML  = opciones
    .map(o => `<button class="dropdown-option" data-valor="${o.valor}" type="button">${o.label}</button>`)
    .join('');
  wrapper.appendChild(menu);

  btnEl.addEventListener('click', e => {
    e.stopPropagation();
    document.querySelectorAll('.dropdown-menu.open').forEach(m => { if (m !== menu) m.classList.remove('open'); });
    menu.classList.toggle('open');
  });

  menu.querySelectorAll('.dropdown-option').forEach(opt => {
    opt.addEventListener('click', () => {
      btnEl.dataset.valor = opt.dataset.valor;
      btnEl.querySelector('.btn-text').textContent = opt.textContent;
      menu.classList.remove('open');
      aplicarFiltros();
    });
  });
}

// ============================================================
//  5. MODAL PELÍCULA
// ============================================================
function abrirModalPelicula(item, plataforma = 'GLOBAL') {
  const overlay = document.getElementById('modalOverlayMovie');
  if (!overlay) return;

  document.getElementById('modalType').textContent     = (item.tipo || 'PELÍCULA').toUpperCase();
  document.getElementById('modalGenre').textContent    = `• ${item.genero || ''}`;
  document.getElementById('modalTitle').textContent    = item.titulo;
  document.getElementById('modalRating').textContent   = item.rating || '—';
  document.getElementById('modalDuration').textContent = item.fecha || item.duracion || '—';
  document.getElementById('modalDesc').textContent     = item.descripcion || '';

  const iframe = document.getElementById('trailerIframe');
  if (iframe) iframe.src = item.trailer || '';

  overlay.classList.add('active');
  document.body.classList.add('modal-open');
}

function initModal() {
  const overlay  = document.getElementById('modalOverlayMovie');
  const closeBtn = document.getElementById('closeModalBtn');
  if (!overlay) return;

  closeBtn?.addEventListener('click', cerrarModalPelicula);
  overlay.addEventListener('click', e => { if (e.target === overlay) cerrarModalPelicula(); });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && overlay.classList.contains('active')) cerrarModalPelicula();
  });
}

function cerrarModalPelicula() {
  const overlay = document.getElementById('modalOverlayMovie');
  if (!overlay) return;
  overlay.classList.remove('active');
  document.body.classList.remove('modal-open');
  const iframe = document.getElementById('trailerIframe');
  if (iframe) iframe.src = '';
}

// ============================================================
//  6. INIT
// ============================================================
document.addEventListener('DOMContentLoaded', () => {
  initFiltros();
  cargarPeliculas();
});