// ============================================================
//  STREAMRANK — tops.js  (v2)
//  Carga dinámica de categorías desde JSON de scraping
//  ✅ Filtros de género, duración, tipo y ordenamiento funcionales
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
  dc_studios:   'DC Studios',
  jamesbond:    'James Bond',
  startrek:     'Star Trek',
  appletv:      'Apple TV+',
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
  dc_studios:   'MAX',
  jamesbond:    'EON PRODUCTIONS',
  startrek:     'PARAMOUNT+',
  appletv:      'APPLE TV+',
};

// ── Estado global de la página ──────────────────────────────
let todasLasCartas   = [];   // todos los ítems cargados del JSON
let platformLabel    = '';   // etiqueta de plataforma actual

// ============================================================
//  UTILS
// ============================================================
function parseCategoryFromUrl() {
  const params = new URLSearchParams(window.location.search);
  const cat = params.get('cat')?.trim().toLowerCase();
  return cat && Object.keys(TOP_CATEGORY_LABELS).includes(cat) ? cat : 'marvel';
}

function getCategoryLabel(k)    { return TOP_CATEGORY_LABELS[k]    || k; }
function getCategoryPlatform(k) { return TOP_CATEGORY_PLATFORM[k]  || k.toUpperCase(); }

function getBackend() {
  return (window.BACKEND_BASE_URL || 'http://192.168.101.9/back-streamRank').replace(/\/$/, '');
}

// ============================================================
//  1. FETCH JSON
// ============================================================
async function fetchCategoryData(categoryKey) {
  const jsonFilename = `${categoryKey}_top50.json`;
  const localBase    = (window.LOCAL_JSON_BASE_URL || 'json').replace(/\/$/, '');
  const backendBase  = getBackend();

  const urlCandidates = [
    `${localBase}/${categoryKey}.json`,
    `${localBase}/${jsonFilename}`,
    `${backendBase}/json/${jsonFilename}`,
  ];

  let response = null;
  let foundUrl = null;

  for (const candidate of urlCandidates) {
    try {
      console.debug('[tops] fetch attempt', candidate);
      response = await fetch(candidate, { cache: 'no-store' });
      if (response.ok) { foundUrl = candidate; break; }
    } catch (err) {
      console.debug('[tops] fetch failed', candidate, err);
    }
  }

  if (!response || !response.ok) {
    const statusText = response ? `${response.status} ${response.statusText}` : 'sin respuesta';
    throw new Error(`HTTP ${statusText} — intentos: ${urlCandidates.join(', ')}`);
  }

  const data     = await response.json();
  const rawItems = Array.isArray(data.peliculas) ? data.peliculas : [];

  const items = rawItems.map(item => ({
    titulo:        item.titulo        || item.title        || 'Sin título',
    tipo:          item.tipo          || 'película',                      // "película" | "serie"
    genero:        item.genero        || item.genre        || 'General',
    duracion:      item.duracion      || '—',
    duracion_min:  item.duracion_min  || 0,
    rating:        item.rating        != null ? item.rating : (item.vote_average || 0),
    votos:         item.votos         || item.vote_count   || 0,
    imagen_url:    item.imagen_url    || item.image        || 'assets/icons/placeholder.png',
    descripcion:   item.descripcion   || item.description  || 'Descripción no disponible.',
    trailer:       item.trailer       || '',
    posicion:      item.posicion      || item.position     || 0,
    fecha_estreno: item.fecha_estreno || '',
  }));

  return {
    nombre:    data.nombre    || getCategoryLabel(categoryKey),
    plataforma: data.plataforma || getCategoryPlatform(categoryKey),
    items,
    jsonUrl:   foundUrl || urlCandidates[0],
  };
}

// ============================================================
//  2. TARJETAS
// ============================================================
function crearTarjeta(item, index, plat) {
  const card = document.createElement('article');
  card.className           = 'movie-card';
  card.dataset.duration     = item.duracion      || '';
  card.dataset.description  = item.descripcion   || '';
  card.dataset.trailer      = item.trailer       || '';
  card.dataset.fechaEstreno = item.fecha_estreno || '';

  // Formatear fecha para mostrar solo el año
  const anio = item.fecha_estreno ? item.fecha_estreno.split('-')[0] : '';
  // Etiqueta de duración: películas muestran duración, series muestran "Serie TV"
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
  // ── leer estado activo ───────────────────────────────────
  const tipoActivo   = document.querySelector('.toggle-btn.active')?.dataset.tipo    || 'todos';
  const generoActivo = document.querySelector('.dropdown-btn[data-tipo="genero"]')?.dataset.valor  || 'todos';
  const durActiva    = document.querySelector('.dropdown-btn[data-tipo="duracion"]')?.dataset.valor || 'todos';
  const ordenActivo  = document.querySelector('.sort-btn.active')?.dataset.orden     || 'rating';

  let lista = [...todasLasCartas];

  // ── filtro tipo ──────────────────────────────────────────
  if (tipoActivo === 'peliculas')
    lista = lista.filter(i => (i.tipo || '').toLowerCase().includes('pel'));
  else if (tipoActivo === 'series')
    lista = lista.filter(i => (i.tipo || '').toLowerCase().includes('ser'));

  // ── filtro género ────────────────────────────────────────
  if (generoActivo !== 'todos')
    lista = lista.filter(i =>
      (i.genero || '').toLowerCase().includes(generoActivo.toLowerCase())
    );

  // ── filtro duración ──────────────────────────────────────
  if (durActiva !== 'todos') {
    lista = lista.filter(i => {
      const mins = i.duracion_min || parseInt(i.duracion) || 0;
      if (!mins) return true;          // sin datos → incluir
      if (durActiva === 'corta') return mins < 100;
      if (durActiva === 'media') return mins >= 100 && mins <= 150;
      if (durActiva === 'larga') return mins > 150;
      return true;
    });
  }

  // ── ordenar ──────────────────────────────────────────────
  if (ordenActivo === 'rating')
    lista.sort((a, b) => (b.rating || 0) - (a.rating || 0));
  else
    lista.sort((a, b) => (a.posicion || 0) - (b.posicion || 0));

  renderTarjetas(lista);
}

// ── Crea un dropdown accesible con menú flotante ─────────────
function crearDropdownFiltro(btnEl, tipo, opciones) {
  btnEl.dataset.tipo  = tipo;
  btnEl.dataset.valor = 'todos';

  // Envuelve el botón en un wrapper relativo
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

  // Toggle tipo (Todos / Películas / Series)
  document.querySelectorAll('.toggle-btn').forEach(btn => {
    btn.dataset.tipo = tipoMap[btn.querySelector('.btn-text')?.textContent.trim()] || 'todos';
    btn.addEventListener('click', () => {
      document.querySelectorAll('.toggle-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      aplicarFiltros();
    });
  });

  // Sort (Rating / Popularidad)
  document.querySelectorAll('.sort-btn').forEach(btn => {
    btn.dataset.orden = ordenMap[btn.querySelector('.btn-text')?.textContent.trim()] || 'rating';
    btn.addEventListener('click', () => {
      document.querySelectorAll('.sort-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      aplicarFiltros();
    });
  });

  // Dropdowns de género y duración
  const dropdowns = document.querySelectorAll('.dropdown-btn');
  if (dropdowns.length >= 2) {
    crearDropdownFiltro(dropdowns[0], 'genero', [
      { valor: 'todos',           label: 'Todos los géneros'  },
      { valor: 'acción',          label: 'Acción'             },
      { valor: 'aventura',        label: 'Aventura'           },
      { valor: 'animación',       label: 'Animación'          },
      { valor: 'comedia',         label: 'Comedia'            },
      { valor: 'crimen',          label: 'Crimen'             },
      { valor: 'drama',           label: 'Drama'              },
      { valor: 'fantasía',        label: 'Fantasía'           },
      { valor: 'terror',          label: 'Terror'             },
      { valor: 'ciencia ficción', label: 'Ciencia Ficción'    },
      { valor: 'suspense',        label: 'Suspense'           },
    ]);

    crearDropdownFiltro(dropdowns[1], 'duracion', [
      { valor: 'todos', label: 'Cualquier duración'  },
      { valor: 'corta', label: 'Corta (< 100 min)'   },
      { valor: 'media', label: 'Media (100–150 min)' },
      { valor: 'larga', label: 'Larga (> 150 min)'   },
    ]);
  }

  // Cierra dropdowns al hacer clic fuera
  document.addEventListener('click', () => {
    document.querySelectorAll('.dropdown-menu.open').forEach(m => m.classList.remove('open'));
  });
}

// ============================================================
//  4. MODAL PELÍCULA
// ============================================================
function abrirModalPelicula(item, plat = '') {
  const overlay = document.getElementById('modalOverlayMovie');
  if (!overlay) return;

  // Formatear fecha_estreno → "15 de enero de 2022"
  let fechaFormateada = '—';
  if (item.fecha_estreno) {
    try {
      const d = new Date(item.fecha_estreno + 'T00:00:00');
      fechaFormateada = d.toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' });
    } catch { fechaFormateada = item.fecha_estreno; }
  }

  // Duración: películas → "1h 45min · 12 de marzo de 2021"
  //           series    → "Serie TV · 5 de octubre de 2019"
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
//  5. RENDER DE PÁGINA DE CATEGORÍA
// ============================================================
async function renderCategoryPage(categoryKey) {
  const titleElement = document.getElementById('tituloPagina');
  const lista        = document.querySelector('.top-10-list');
  if (!lista) return;

  lista.innerHTML = `
    <div style="color:#aaa;text-align:center;padding:60px 0;width:100%;">
      Cargando contenido...
    </div>`;

  try {
    const data = await fetchCategoryData(categoryKey);

    platformLabel = data.plataforma || getCategoryPlatform(categoryKey);
    const categoryName = data.nombre || getCategoryLabel(categoryKey);

    document.title = `StreamRank - Top 10 ${categoryName}`;
    if (titleElement) titleElement.textContent = `Top 10: ${categoryName}`;

    todasLasCartas = data.items || [];

    if (!todasLasCartas.length) throw new Error('El JSON existe pero no tiene ítems.');

    aplicarFiltros();
    initModal();

    console.debug('[tops] cargados:', todasLasCartas.length, 'ítems →', categoryKey);

  } catch (err) {
    console.error('[tops] Error:', err);

    const hint = window.location.protocol === 'file:'
      ? 'Ejecuta el sitio desde un servidor local (http://...) para cargar JSON correctamente.'
      : 'Regresa a <a href="top10.html">Top 10</a> o prueba otra categoría.';

    lista.innerHTML = `
      <div class="listas-vacia" style="display:flex;flex-direction:column;align-items:center;gap:12px;max-width:420px;text-align:center;">
        <div class="listas-vacia-icono">📁</div>
        <p class="listas-vacia-texto">Error cargando datos: ${err.message}</p>
        <p class="listas-vacia-subtexto">${hint}</p>
      </div>`;
  }
}

// ============================================================
//  6. BOTÓN ACTUALIZAR DATOS
// ============================================================
function injectRefreshButton(categoryKey) {
  const heroInfo = document.querySelector('.hero-plataforma-info');
  if (!heroInfo) return;

  let container = heroInfo.querySelector('.refresh-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'refresh-container';
    container.style.cssText = 'display:flex;flex-direction:column;gap:8px;align-items:flex-start;margin-top:16px;';
    heroInfo.appendChild(container);
  }

  let button = container.querySelector('.btn-secondary');
  if (!button) {
    button = document.createElement('button');
    button.type      = 'button';
    button.className = 'btn-secondary';
    button.style.cssText = 'display:flex;align-items:center;gap:8px;';
    container.appendChild(button);
  }

  let loaderContainer = container.querySelector('.loader-container');
  if (!loaderContainer) {
    loaderContainer = document.createElement('div');
    loaderContainer.className = 'loader-container';
    loaderContainer.style.cssText = 'display:none;align-items:center;gap:8px;font-size:14px;color:#666;';
    loaderContainer.innerHTML = `
      <div class="spinner" style="width:16px;height:16px;border:2px solid #e0e0e0;border-top:2px solid #2196F3;border-radius:50%;animation:spin 0.8s linear infinite;"></div>
      <span class="loader-text">Actualizando datos...</span>`;
    container.appendChild(loaderContainer);
  }

  if (!document.getElementById('spinner-styles')) {
    const style = document.createElement('style');
    style.id = 'spinner-styles';
    style.textContent = `
      @keyframes spin { to { transform: rotate(360deg); } }
      .refresh-info { font-size:12px;color:#999;margin:0;line-height:1.4; }
      .refresh-info.success { color:#4caf50; }
      .refresh-info.error   { color:#f44336; }
    `;
    document.head.appendChild(style);
  }

  let infoElement = container.querySelector('.refresh-info');
  if (!infoElement) {
    infoElement = document.createElement('p');
    infoElement.className = 'refresh-info';
    container.appendChild(infoElement);
  }

  const lastUpdateKey = `lastUpdate_${categoryKey}`;
  function displayLastUpdate() {
    const lastUpdate  = localStorage.getItem(lastUpdateKey);
    const totalMovies = localStorage.getItem(`totalMovies_${categoryKey}`) || '50';
    infoElement.textContent = lastUpdate
      ? `Última actualización: ${lastUpdate} (${totalMovies} películas)`
      : 'Última actualización: No disponible';
    infoElement.className = lastUpdate ? 'refresh-info success' : 'refresh-info';
  }
  displayLastUpdate();

  button.textContent = 'Actualizar datos';
  button.addEventListener('click', async () => {
    button.disabled = true;
    button.style.display = 'none';
    loaderContainer.style.display = 'flex';
    infoElement.textContent = '';

    try {
      const refreshUrl = `${getBackend()}/api/refresh_data.php`;
      const response   = await fetch(refreshUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category: categoryKey }),
      });

      const rawText = await response.text();
      console.log('RESPUESTA CRUDA:', rawText);

      let result = null;
      if (!rawText?.trim()) {
        result = { success: false, error: 'Respuesta vacía del servidor' };
      } else {
        try { result = JSON.parse(rawText); }
        catch { result = { success: false, error: 'Respuesta no es JSON', raw: rawText }; }
      }

      if (!response.ok || !result?.success) {
        throw new Error(result?.error || `HTTP ${response.status}`);
      }

      await renderCategoryPage(categoryKey);

      const updateTime  = result.update_time  || new Date().toLocaleString('es-ES', { day:'2-digit',month:'2-digit',year:'numeric',hour:'2-digit',minute:'2-digit' });
      const totalMovies = result.total_movies || 50;

      localStorage.setItem(lastUpdateKey, updateTime);
      localStorage.setItem(`totalMovies_${categoryKey}`, totalMovies);
      displayLastUpdate();

      loaderContainer.style.display = 'none';
      infoElement.textContent = `✓ ${result.category_name || 'Datos'} actualizado: ${totalMovies} películas`;
      infoElement.className   = 'refresh-info success';

    } catch (error) {
      console.error('[tops] Error actualizando datos:', error);
      loaderContainer.style.display = 'none';
      infoElement.textContent = `✗ Error: ${error.message}`;
      infoElement.className   = 'refresh-info error';
    } finally {
      setTimeout(() => { button.style.display = 'flex'; button.disabled = false; }, 2000);
    }
  });
}

// ============================================================
//  7. INIT
// ============================================================
async function initializeTopsPage() {
  const categoryKey = typeof window.TOP_CATEGORIA === 'string'
    ? window.TOP_CATEGORIA
    : parseCategoryFromUrl();

  initFiltros();                       // ← primero los filtros
  await renderCategoryPage(categoryKey);
  injectRefreshButton(categoryKey);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeTopsPage);
} else {
  initializeTopsPage();
}