// ============================================================
//  StreamRank — tops.js  (v3 — botón actualizar unificado)
// ============================================================

const TOP_CATEGORY_LABELS = {
  marvel:       'El Universo Marvel',
  netflix:      'Netflix',
  warner:       'Warner Bros',
  disney:       'Disney+',
  hbo:          'HBO Max',
  amazon:       'Amazon Prime',
  universal:    'Universal Studios',
  starwars:     'Star Wars',
  lucasfilm:    'Lucasfilm',
  pixar:        'Pixar',
  dreamworks:   'DreamWorks',
  ghibli:       'Studio Ghibli',
  dcestudios:   'DC Studios',
  appletv:      'Apple TV+',
  jamesbond:    'James Bond',
  startrek:     'Star Trek',
};

const TOP_CATEGORY_PLATFORM = {
  marvel:       'MARVEL',
  netflix:      'NETFLIX',
  warner:       'WARNER BROS',
  disney:       'DISNEY+',
  hbo:          'HBO MAX',
  amazon:       'PRIME VIDEO',
  universal:    'UNIVERSAL',
  starwars:     'STAR WARS',
  lucasfilm:    'DISNEY+',
  pixar:        'DISNEY+',
  dreamworks:   'PRIME VIDEO',
  ghibli:       'NETFLIX',
  dcestudios:   'MAX',
  appletv:      'APPLE TV+',
  jamesbond:    'EON PRODUCTIONS',
  startrek:     'PARAMOUNT+',
};

// ── Estado global ────────────────────────────────────────────
let todasLasCartas = [];
let platformLabel  = '';

// ============================================================
//  UTILS
// ============================================================
function parseCategoryFromUrl() {
  const params = new URLSearchParams(window.location.search);
  const cat    = params.get('cat')?.trim().toLowerCase();
  return cat && TOP_CATEGORY_LABELS[cat] ? cat : 'marvel';
}
function getCategoryLabel(k)    { return TOP_CATEGORY_LABELS[k]   || k; }
function getCategoryPlatform(k) { return TOP_CATEGORY_PLATFORM[k] || k.toUpperCase(); }
function getBackend() {
  return (window.BACKEND_BASE_URL || 'http://192.168.101.9/back-streamRank').replace(/\/$/, '');
}

// ============================================================
//  1. FETCH JSON
// ============================================================
async function fetchCategoryData(categoryKey) {
  const jsonFilename = `${categoryKey}_top50.json`;
  const backendBase  = getBackend();

  const urlCandidates = [
    `${backendBase}/json/${jsonFilename}`,
  ];

  let response = null;
  let foundUrl = null;

  for (const candidate of urlCandidates) {
    try {
      response = await fetch(candidate, { cache: 'no-store' });
      if (response.ok) { foundUrl = candidate; break; }
    } catch (err) {
      console.debug('[tops] fetch failed', candidate, err);
    }
  }

  if (!response || !response.ok) {
    throw new Error(`No se pudo cargar ${jsonFilename}`);
  }

  const data     = await response.json();
  const rawItems = Array.isArray(data.peliculas) ? data.peliculas : [];

  const items = rawItems.slice(0, 10).map(item => ({
    titulo:        item.titulo        || item.title       || 'Sin título',
    tipo:          item.tipo          || 'película',
    genero:        item.genero        || item.genre       || 'General',
    duracion:      item.duracion      || '—',
    duracion_min:  item.duracion_min  || 0,
    rating:        item.rating        != null ? item.rating : (item.vote_average || 0),
    votos:         item.votos         || item.vote_count  || 0,
    imagen_url:    item.imagen_url    || item.image       || 'assets/icons/placeholder.png',
    descripcion:   item.descripcion   || item.description || 'Descripción no disponible.',
    trailer:       item.trailer       || '',
    posicion:      item.posicion      || item.position    || 0,
    fecha_estreno: item.fecha_estreno || '',
  }));

  return {
    nombre:     data.nombre     || getCategoryLabel(categoryKey),
    plataforma: data.plataforma || getCategoryPlatform(categoryKey),
    fecha_actualizacion: data.fecha_actualizacion || '',
    items,
  };
}

// ============================================================
//  2. TARJETAS
// ============================================================
function crearTarjeta(item, index, plat) {
  const card = document.createElement('article');
  card.className          = 'movie-card';
  card.dataset.duration   = item.duracion      || '';
  card.dataset.description= item.descripcion   || '';
  card.dataset.trailer    = item.trailer       || '';

  const anio     = item.fecha_estreno ? item.fecha_estreno.split('-')[0] : '';
  const durLabel = item.tipo === 'serie'
    ? 'Serie TV'
    : (item.duracion && item.duracion !== '—' ? item.duracion : (anio || '—'));

  card.innerHTML = `
    <div class="card-number">${index + 1}</div>
    <div class="card-image-wrapper">
      <img src="${item.imagen_url}" alt="${item.titulo}" class="card-image"
           onerror="this.src='assets/icons/placeholder.png'">
    </div>
    <div class="card-info">
      <div class="info-top-tags">
        <span class="tag-type">${(item.tipo || 'PELÍCULA').toUpperCase()}</span>
        <span class="tag-genre">• ${item.genero}</span>
        ${anio ? `<span class="tag-year">• ${anio}</span>` : ''}
      </div>
      <h3 class="info-title">${item.titulo}</h3>
      <p class="info-desc">${(item.descripcion || '').slice(0, 90)}…</p>
      <div class="info-rating">
        <div class="rating-icon"><img src="assets/icons/Estrella.svg" alt="Star"></div>
        <span class="rating-text">${item.rating}</span>
      </div>
    </div>
    <div class="card-actions">
      <span class="tag-platform">${plat}</span>
      <button class="btn-bookmark" title="Agregar a mi lista">
        <img src="assets/icons/Agregar.svg" alt="Guardar" class="bookmark-icon">
      </button>
    </div>`;

  card.addEventListener('click', e => {
    if (e.target.closest('.btn-bookmark')) return;
    abrirModalPelicula(item, plat);
  });

  return card;
}

function renderTarjetas(items) {
  const lista = document.querySelector('.top-10-list');
  if (!lista) return;
  lista.innerHTML = '';

  if (!items.length) {
    lista.innerHTML = `
      <div style="color:#aaa;text-align:center;padding:60px 0;width:100%;">
        No hay resultados para este filtro.
      </div>`;
    return;
  }

  items.forEach((item, i) => lista.appendChild(crearTarjeta(item, i, platformLabel)));

  if (typeof initBotonesBookmark === 'function') initBotonesBookmark();
  if (typeof initBotonesWatch    === 'function') initBotonesWatch();
}

// ============================================================
//  3. FILTROS
// ============================================================
function aplicarFiltros() {
  const tipoActivo   = document.querySelector('.toggle-btn.active')?.dataset.tipo           || 'todos';
  const generoActivo = document.querySelector('.dropdown-btn[data-tipo="genero"]')?.dataset.valor   || 'todos';
  const durActiva    = document.querySelector('.dropdown-btn[data-tipo="duracion"]')?.dataset.valor  || 'todos';
  const ordenActivo  = document.querySelector('.sort-btn.active')?.dataset.orden            || 'rating';

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

  renderTarjetas(lista);
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
    document.querySelectorAll('.dropdown-menu.open')
      .forEach(m => { if (m !== menu) m.classList.remove('open'); });
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
      { valor: 'todos',           label: 'Todos los géneros' },
      { valor: 'acción',          label: 'Acción'            },
      { valor: 'aventura',        label: 'Aventura'          },
      { valor: 'animación',       label: 'Animación'         },
      { valor: 'comedia',         label: 'Comedia'           },
      { valor: 'crimen',          label: 'Crimen'            },
      { valor: 'drama',           label: 'Drama'             },
      { valor: 'fantasía',        label: 'Fantasía'          },
      { valor: 'terror',          label: 'Terror'            },
      { valor: 'ciencia ficción', label: 'Ciencia Ficción'   },
      { valor: 'suspense',        label: 'Suspense'          },
    ]);
    crearDropdownFiltro(dropdowns[1], 'duracion', [
      { valor: 'todos', label: 'Cualquier duración'  },
      { valor: 'corta', label: 'Corta (< 90 min)'    },
      { valor: 'media', label: 'Media (90–130 min)'  },
      { valor: 'larga', label: 'Larga (> 130 min)'   },
    ]);
  }

  document.addEventListener('click', () => {
    document.querySelectorAll('.dropdown-menu.open').forEach(m => m.classList.remove('open'));
  });
}

// ============================================================
//  4. MODAL
// ============================================================
function abrirModalPelicula(item, plat = '') {
  const overlay = document.getElementById('modalOverlayMovie');
  if (!overlay) return;

  let fechaFormateada = '—';
  if (item.fecha_estreno) {
    try {
      const d = new Date(item.fecha_estreno + 'T00:00:00');
      fechaFormateada = d.toLocaleDateString('es-ES', { day:'numeric', month:'long', year:'numeric' });
    } catch { fechaFormateada = item.fecha_estreno; }
  }

  const durDisplay = item.tipo === 'serie'
    ? `Serie TV · ${fechaFormateada}`
    : (item.duracion && item.duracion !== '—'
        ? `${item.duracion} · ${fechaFormateada}`
        : fechaFormateada);

  document.getElementById('modalType').textContent     = (item.tipo || 'PELÍCULA').toUpperCase();
  document.getElementById('modalGenre').textContent    = `• ${item.genero || ''}`;
  document.getElementById('modalTitle').textContent    = item.titulo;
  document.getElementById('modalRating').textContent   = item.rating || '—';
  document.getElementById('modalDuration').textContent = durDisplay;
  document.getElementById('modalDesc').textContent     = item.descripcion || '';

  const iframe = document.getElementById('trailerIframe');
  if (iframe) iframe.src = item.trailer || '';

  overlay.classList.add('active');
  document.body.classList.add('modal-open');
}

function cerrarModalPelicula() {
  const overlay = document.getElementById('modalOverlayMovie');
  if (!overlay) return;
  overlay.classList.remove('active');
  document.body.classList.remove('modal-open');
  const iframe = document.getElementById('trailerIframe');
  if (iframe) iframe.src = '';
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

// ============================================================
//  5. RENDER PÁGINA
// ============================================================
async function renderCategoryPage(categoryKey) {
  const titleEl = document.getElementById('tituloPagina');
  const lista   = document.querySelector('.top-10-list');
  if (!lista) return;

  lista.innerHTML = `
    <div style="color:#aaa;text-align:center;padding:60px 0;width:100%;">
      Cargando contenido...
    </div>`;

  try {
    const data = await fetchCategoryData(categoryKey);

    platformLabel = data.plataforma || getCategoryPlatform(categoryKey);
    const nombre  = data.nombre     || getCategoryLabel(categoryKey);

    document.title = `StreamRank - Top 10 ${nombre}`;
    if (titleEl) titleEl.textContent = `Top 10: ${nombre}`;

    todasLasCartas = data.items || [];
    if (!todasLasCartas.length) throw new Error('El JSON existe pero no tiene ítems.');

    // ── Fecha de última actualización — debajo del título ────────
    // Busca el span en el HTML; si no existe lo crea junto al h1
    let fechaEl = document.getElementById('ultimaActualizacion');
    if (!fechaEl && titleEl) {
      fechaEl = document.createElement('p');
      fechaEl.id = 'ultimaActualizacion';
      titleEl.insertAdjacentElement('afterend', fechaEl);
    }
    if (fechaEl) {
      if (data.fecha_actualizacion) {
        let fechaTexto = data.fecha_actualizacion;
        try {
          const d = new Date(data.fecha_actualizacion.replace(' ', 'T'));
          if (!isNaN(d)) {
            const dia  = String(d.getDate()).padStart(2, '0');
            const mes  = String(d.getMonth() + 1).padStart(2, '0');
            const anio = d.getFullYear();
            const hora = String(d.getHours()).padStart(2, '0');
            const min  = String(d.getMinutes()).padStart(2, '0');
            fechaTexto = `${dia}/${mes}/${anio} · ${hora}:${min}`;
          }
        } catch { /* usar texto tal cual */ }

        fechaEl.textContent = `🕐 Actualizado: ${fechaTexto}  ·  Top 10`;
        fechaEl.style.cssText = `
          font-size: 12px;
          color: #888;
          margin: 4px 0 0 0;
          letter-spacing: 0.02em;
        `;
      } else {
        fechaEl.textContent = '';
      }
    }

    aplicarFiltros();
    initModal();

  } catch (err) {
    console.error('[tops]', err);
    lista.innerHTML = `
      <div class="listas-vacia" style="display:flex;flex-direction:column;align-items:center;gap:12px;max-width:420px;text-align:center;">
        <div class="listas-vacia-icono">📁</div>
        <p class="listas-vacia-texto">Error: ${err.message}</p>
        <p class="listas-vacia-subtexto">Regresa a <a href="top10.html">Top 10</a> o prueba otra categoría.</p>
      </div>`;
  }
}

// ============================================================
//  7. INIT
// ============================================================
async function initializeTopsPage() {
  const categoryKey = typeof window.TOP_CATEGORIA === 'string'
    ? window.TOP_CATEGORIA
    : parseCategoryFromUrl();

  initFiltros();
  await renderCategoryPage(categoryKey);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeTopsPage);
} else {
  initializeTopsPage();
}