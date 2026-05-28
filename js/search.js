// ============================================================
//  StreamRank — search.js
//  Lee TODOS los JSONs del backend y muestra coincidencias
//  en la barra de búsqueda superior en tiempo real
// ============================================================

const SEARCH_RESULT_LIMIT = 15;
// BACKEND_BASE viene de window.BACKEND_BASE_URL definido en el HTML
function getBackendUrl() { return (window.BACKEND_BASE_URL || "http://192.168.101.9/back-streamRank").replace(/\/$/, ""); }

// Todos los JSONs que existen en el backend
const JSON_SOURCES = [
  { file: 'global_top50.json',       categoria: 'Global'           },
  { file: 'netflix_top50.json',      categoria: 'Netflix'          },
  { file: 'amazon_top50.json',       categoria: 'Amazon Prime'     },
  { file: 'hbo_top50.json',          categoria: 'HBO Max'          },
  { file: 'disney_top50.json',       categoria: 'Disney+'          },
  { file: 'warner_top50.json',       categoria: 'Warner Bros.'     },
  { file: 'universal_top50.json',    categoria: 'Universal'        },
  { file: 'marvel_top50.json',       categoria: 'Marvel'           },
  { file: 'starwars_top50.json',     categoria: 'Star Wars'        },
  { file: 'lucasfilm_top50.json',    categoria: 'Lucasfilm'        },
  { file: 'pixar_top50.json',        categoria: 'Pixar'            },
  { file: 'dreamworks_top50.json',   categoria: 'DreamWorks'       },
  { file: 'ghibli_top50.json',       categoria: 'Studio Ghibli'    },
  { file: 'dc_studios_top50.json',   categoria: 'DC Studios'       },
  { file: 'dc_universe_top50.json',  categoria: 'DC Universe'      },
  { file: 'harry_potter_top50.json', categoria: 'Harry Potter'     },
  { file: 'fast_furious_top50.json', categoria: 'Fast & Furious'   },
  { file: 'jurassic_top50.json',     categoria: 'Jurassic Park'    },
  { file: 'hunger_games_top50.json', categoria: 'Hunger Games'     },
];

// ── Estado global del índice ─────────────────────────────────
const searchState = {
  index:   [],      // array plano de todos los items de todos los JSONs
  loaded:  false,
  loading: false,
};

// ============================================================
//  UTILIDADES
// ============================================================
function escapeRegex(text) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function normalize(text) {
  return (text || '')
    .normalize('NFD')                        // descompone acentos
    .replace(/[\u0300-\u036f]/g, '')         // elimina diacríticos
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
}

// ============================================================
//  CARGA DE ÍNDICE DESDE LOS JSONs
// ============================================================
async function loadAllJsons() {
  if (searchState.loaded || searchState.loading) return;
  searchState.loading = true;

  const tasks = JSON_SOURCES.map(async ({ file, categoria }) => {
    try {
      const url = `${getBackendUrl()}/json/${file}`;
      const resp = await fetch(url, { cache: 'default' });
      if (!resp.ok) return [];

      const data = await resp.json();
      const items = Array.isArray(data.peliculas)
        ? data.peliculas
        : Array.isArray(data.contenido)
          ? data.contenido
          : [];

      return items.map(item => ({
        titulo:      item.titulo      || item.title || 'Sin título',
        tipo:        item.tipo        || 'película',
        genero:      item.genero      || '',
        plataforma:  item.plataforma  || data.plataforma || '',
        rating:      item.rating      || item.vote_average || 0,
        descripcion: item.descripcion || item.overview || '',
        imagen_url:  item.imagen_url  || item.image  || '',
        trailer:     item.trailer     || '',
        duracion:    item.duracion    || item.fecha  || '',
        categoria,
        // campo unificado para búsqueda
        _busqueda: normalize(
          `${item.titulo || ''} ${item.genero || ''} ${item.descripcion || ''} ${categoria}`
        ),
      }));

    } catch {
      return [];   // si un JSON no existe aún, simplemente lo ignora
    }
  });

  const resultados = await Promise.all(tasks);

  // Aplanar y deduplicar por título + tipo
  const vistos = new Set();
  const indice = [];

  for (const lista of resultados) {
    for (const item of lista) {
      const key = `${normalize(item.titulo)}|${item.tipo}`;
      if (vistos.has(key)) continue;
      vistos.add(key);
      indice.push(item);
    }
  }

  searchState.index  = indice;
  searchState.loaded = true;
  searchState.loading = false;
}

// ============================================================
//  BÚSQUEDA Y SCORING
// ============================================================
function buscar(query) {
  const q = normalize(query);
  if (!q) return [];

  const palabras = q.split(' ').filter(Boolean);

  return searchState.index
    .map(item => {
      const haystack = item._busqueda;
      const titulo   = normalize(item.titulo);

      // Scoring
      let score = 0;
      for (const palabra of palabras) {
        if (!haystack.includes(palabra)) { score = -1; break; }
        score += (haystack.match(new RegExp(escapeRegex(palabra), 'g')) || []).length * 10;
      }
      if (score < 0) return null;

      // Bonuses
      if (titulo.startsWith(q))    score += 500;
      if (titulo.includes(q))      score += 300;
      if (palabras.every(p => titulo.includes(p))) score += 150;

      return { ...item, _score: score };
    })
    .filter(Boolean)
    .sort((a, b) => b._score - a._score)
    .slice(0, SEARCH_RESULT_LIMIT);
}

// ============================================================
//  HIGHLIGHT DE COINCIDENCIAS
// ============================================================
function highlight(text, query) {
  if (!query.trim()) return escapeHtml(text);
  const palabras = normalize(query).split(' ').filter(Boolean);
  let resultado = escapeHtml(text);
  for (const palabra of palabras) {
    const regex = new RegExp(`(${escapeRegex(escapeHtml(palabra))})`, 'ig');
    resultado = resultado.replace(regex, '<strong>$1</strong>');
  }
  return resultado;
}

function escapeHtml(str) {
  return (str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// ============================================================
//  MODAL DE DETALLE (se crea una sola vez en el DOM)
// ============================================================
function ensureDetailModal() {
  if (document.getElementById('searchDetailOverlay')) {
    return document.getElementById('searchDetailOverlay');
  }

  const overlay = document.createElement('div');
  overlay.id        = 'searchDetailOverlay';
  overlay.className = 'search-detail-overlay';
  overlay.innerHTML = `
    <div class="search-detail-shell">
      <div class="search-detail-header">
        <div>
          <p class="search-detail-eyebrow" id="searchDetailCategoria">Categoría</p>
          <h2 class="search-detail-title"  id="searchDetailTitle">Título</h2>
        </div>
        <button class="search-detail-close" id="searchDetailClose" type="button">✕</button>
      </div>
      <div class="search-detail-body">
        <img id="searchDetailImg" src="" alt="" class="search-detail-img">
        <div class="search-detail-content">
          <div class="search-detail-meta" id="searchDetailMeta"></div>
          <p class="search-detail-description" id="searchDetailDesc"></p>
          <div class="search-detail-trailer-wrapper">
            <iframe id="searchDetailTrailer" title="Trailer" frameborder="0" allowfullscreen></iframe>
          </div>
        </div>
      </div>
    </div>
  `;
  document.body.appendChild(overlay);

  const cerrar = () => {
    overlay.classList.remove('active');
    document.body.classList.remove('modal-open');
    document.getElementById('searchDetailTrailer').src = '';
  };

  document.getElementById('searchDetailClose').addEventListener('click', cerrar);
  overlay.addEventListener('click', e => { if (e.target === overlay) cerrar(); });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && overlay.classList.contains('active')) cerrar();
  });

  return overlay;
}

function abrirDetalle(item) {
  const overlay = ensureDetailModal();

  document.getElementById('searchDetailCategoria').textContent = item.categoria || '';
  document.getElementById('searchDetailTitle').textContent     = item.titulo;
  document.getElementById('searchDetailDesc').textContent      = item.descripcion || 'Descripción no disponible.';

  const img = document.getElementById('searchDetailImg');
  img.src = item.imagen_url || '';
  img.alt = item.titulo;
  img.style.display = item.imagen_url ? 'block' : 'none';

  document.getElementById('searchDetailMeta').innerHTML = `
    <span class="search-detail-pill">${(item.tipo || 'Contenido').toUpperCase()}</span>
    ${item.genero     ? `<span class="search-detail-pill">${item.genero}</span>`        : ''}
    ${item.rating     ? `<span class="search-detail-pill">⭐ ${item.rating}</span>`     : ''}
    ${item.plataforma ? `<span class="search-detail-pill">${item.plataforma}</span>`    : ''}
    ${item.categoria  ? `<span class="search-detail-pill">📂 ${item.categoria}</span>` : ''}
  `;

  document.getElementById('searchDetailTrailer').src = item.trailer || '';

  overlay.classList.add('active');
  document.body.classList.add('modal-open');
}

// ============================================================
//  PANEL DE RESULTADOS DESPLEGABLE
// ============================================================
function renderPanel(panel, resultados, query) {
  panel.innerHTML = '';

  if (!query.trim()) {
    panel.hidden = true;
    return;
  }

  panel.hidden = false;

  if (!resultados.length) {
    panel.innerHTML = `
      <div class="search-results-empty">
        No se encontraron resultados para "<strong>${escapeHtml(query)}</strong>"
      </div>`;
    return;
  }

  // Indicador de cuántos JSONs están cargados
  const total = searchState.index.length;
  const contador = document.createElement('div');
  contador.className = 'search-results-count';
  contador.textContent = `${resultados.length} resultado${resultados.length !== 1 ? 's' : ''} de ${total} títulos`;
  panel.appendChild(contador);

  resultados.forEach(item => {
    const btn = document.createElement('button');
    btn.type      = 'button';
    btn.className = 'search-result-link';
    btn.innerHTML = `
      <img
        class="search-result-img"
        src="${escapeHtml(item.imagen_url || '')}"
        alt="${escapeHtml(item.titulo)}"
        onerror="this.style.display='none'"
      >
      <div class="search-result-info">
        <div class="search-result-title">
          ${highlight(item.titulo, query)}
        </div>
        <div class="search-result-meta">
          <span class="search-result-pill">${escapeHtml((item.tipo || '').toUpperCase())}</span>
          ${item.genero ? `<span class="search-result-pill">${escapeHtml(item.genero)}</span>` : ''}
          ${item.rating ? `<span class="search-result-pill">⭐ ${item.rating}</span>` : ''}
          <span class="search-result-source">${escapeHtml(item.categoria)}</span>
        </div>
      </div>
    `;

    btn.addEventListener('click', () => {
      panel.hidden = true;
      abrirDetalle(item);
    });

    panel.appendChild(btn);
  });
}

// ============================================================
//  SETUP DEL FORMULARIO DE BÚSQUEDA
// ============================================================
function setupSearchForm(form) {
  const input = form.querySelector('input[type="search"]');
  if (!input) return;

  // Panel desplegable
  let panel = form.querySelector('.search-results-panel');
  if (!panel) {
    panel = document.createElement('div');
    panel.className = 'search-results-panel';
    panel.hidden    = true;
    form.appendChild(panel);
  }

  // Indicador de carga en el input
  let debounceTimer = null;

  input.addEventListener('input', () => {
    clearTimeout(debounceTimer);
    const query = input.value.trim();

    if (!query) {
      panel.hidden = true;
      panel.innerHTML = '';
      return;
    }

    // Mostrar "buscando..." mientras carga el índice
    if (!searchState.loaded) {
      panel.hidden   = false;
      panel.innerHTML = `<div class="search-results-empty">Cargando índice...</div>`;
    }

    debounceTimer = setTimeout(async () => {
      await loadAllJsons();
      const resultados = buscar(query);
      renderPanel(panel, resultados, query);
    }, 220);   // debounce 220ms
  });

  input.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      panel.hidden = true;
      panel.innerHTML = '';
      input.blur();
    }
  });

  form.addEventListener('submit', e => {
    e.preventDefault();
    clearTimeout(debounceTimer);
    loadAllJsons().then(() => {
      renderPanel(panel, buscar(input.value.trim()), input.value.trim());
    });
  });

  // Cerrar al hacer clic fuera
  document.addEventListener('click', e => {
    if (!form.contains(e.target)) {
      panel.hidden = true;
    }
  });
}

// ============================================================
//  CSS ADICIONAL para el panel enriquecido
//  (inyectado una sola vez para no depender de styles.css)
// ============================================================
function injectSearchStyles() {
  if (document.getElementById('search-js-styles')) return;
  const style = document.createElement('style');
  style.id = 'search-js-styles';
  style.textContent = `
    /* ── Panel desplegable ── */
    .search-results-panel {
      position: absolute;
      top: calc(100% + 6px);
      left: 0;
      right: 0;
      background: #1a1a2e;
      border: 1px solid rgba(255,255,255,0.1);
      border-radius: 12px;
      max-height: 420px;
      overflow-y: auto;
      z-index: 9000;
      box-shadow: 0 16px 40px rgba(0,0,0,0.6);
    }
    .search-form { position: relative; }

    .search-results-count {
      padding: 8px 14px 4px;
      font-size: 11px;
      color: #888;
      border-bottom: 1px solid rgba(255,255,255,0.06);
    }

    .search-result-link {
      display: flex;
      align-items: center;
      gap: 12px;
      width: 100%;
      padding: 10px 14px;
      background: none;
      border: none;
      color: #fff;
      cursor: pointer;
      text-align: left;
      transition: background 0.15s;
    }
    .search-result-link:hover { background: rgba(255,255,255,0.07); }

    .search-result-img {
      width: 38px;
      height: 54px;
      object-fit: cover;
      border-radius: 4px;
      flex-shrink: 0;
      background: #2a2a3e;
    }

    .search-result-info { flex: 1; min-width: 0; }

    .search-result-title {
      font-size: 14px;
      font-weight: 600;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .search-result-title strong { color: #e7000b; font-weight: 700; }

    .search-result-meta {
      display: flex;
      flex-wrap: wrap;
      gap: 4px;
      margin-top: 4px;
    }

    .search-result-pill {
      font-size: 10px;
      padding: 2px 7px;
      border-radius: 20px;
      background: rgba(255,255,255,0.1);
      color: #ccc;
    }

    .search-result-source {
      font-size: 10px;
      color: #e7000b;
      margin-left: auto;
    }

    .search-results-empty {
      padding: 20px 14px;
      color: #888;
      font-size: 13px;
      text-align: center;
    }

    /* ── Modal de detalle ── */
    .search-detail-overlay {
      display: none;
      position: fixed;
      inset: 0;
      background: rgba(0,0,0,0.75);
      z-index: 9999;
      align-items: center;
      justify-content: center;
    }
    .search-detail-overlay.active { display: flex; }

    .search-detail-shell {
      background: #1a1a2e;
      border-radius: 16px;
      width: min(680px, 94vw);
      max-height: 90vh;
      overflow-y: auto;
      padding: 28px;
      position: relative;
    }

    .search-detail-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 20px;
    }

    .search-detail-eyebrow {
      font-size: 11px;
      color: #e7000b;
      text-transform: uppercase;
      letter-spacing: .08em;
      margin: 0 0 4px;
    }

    .search-detail-title {
      font-size: 22px;
      font-weight: 700;
      color: #fff;
      margin: 0;
    }

    .search-detail-close {
      background: rgba(255,255,255,0.1);
      border: none;
      color: #fff;
      width: 32px;
      height: 32px;
      border-radius: 50%;
      cursor: pointer;
      font-size: 14px;
      flex-shrink: 0;
    }
    .search-detail-close:hover { background: rgba(255,255,255,0.2); }

    .search-detail-body {
      display: flex;
      gap: 20px;
    }

    .search-detail-img {
      width: 120px;
      height: 180px;
      object-fit: cover;
      border-radius: 8px;
      flex-shrink: 0;
    }

    .search-detail-content { flex: 1; min-width: 0; }

    .search-detail-meta {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
      margin-bottom: 12px;
    }

    .search-detail-pill {
      font-size: 11px;
      padding: 3px 10px;
      border-radius: 20px;
      background: rgba(255,255,255,0.1);
      color: #ddd;
    }

    .search-detail-description {
      font-size: 13px;
      color: #bbb;
      line-height: 1.6;
      margin-bottom: 16px;
    }

    .search-detail-trailer-wrapper {
      position: relative;
      padding-bottom: 56.25%;
      height: 0;
      border-radius: 8px;
      overflow: hidden;
    }
    .search-detail-trailer-wrapper iframe {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
    }

    @media (max-width: 520px) {
      .search-detail-body { flex-direction: column; }
      .search-detail-img  { width: 100%; height: 200px; }
    }
  `;
  document.head.appendChild(style);
}

// ============================================================
//  INIT
// ============================================================
function initSearchEngine() {
  injectSearchStyles();
  ensureDetailModal();
  document.querySelectorAll('.search-form').forEach(setupSearchForm);
  // Pre-cargar el índice en segundo plano para que la primera búsqueda sea rápida
  loadAllJsons();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initSearchEngine);
} else {
  initSearchEngine();
}