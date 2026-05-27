// ============================================================
//  STREAMRANK — tops.js
//  Carga dinámica de categorías desde JSON de scraping
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
  dc_universe:  'DC Universe',
  harry_potter: 'Harry Potter',
  fast_furious: 'Fast & Furious',
  jurassic:     'Jurassic',
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
  dc_universe:  'MAX',
  harry_potter: 'MAX',
  fast_furious: 'PRIME VIDEO',
  jurassic:     'PRIME VIDEO',
};

function parseCategoryFromUrl() {
  const params = new URLSearchParams(window.location.search);
  const cat = params.get('cat')?.trim().toLowerCase();
  return cat && Object.keys(TOP_CATEGORY_LABELS).includes(cat) ? cat : 'marvel';
}

function getCategoryLabel(categoryKey) {
  return TOP_CATEGORY_LABELS[categoryKey] || categoryKey;
}

function getCategoryPlatform(categoryKey) {
  return TOP_CATEGORY_PLATFORM[categoryKey] || categoryKey.toUpperCase();
}

async function fetchCategoryData(categoryKey) {
  const jsonFilename = `${categoryKey}_top50.json`;
  const backendBase = (window.BACKEND_BASE_URL || 'http://192.168.101.9/back-streamRank').replace(/\/$/, '');
  const urlCandidates = [
  `${backendBase}/json/${jsonFilename}`
];
  let response = null;
  let attemptedUrls = [];
  let foundUrl = null;

  for (const candidate of urlCandidates) {
    attemptedUrls.push(candidate);
    try {
      console.debug('[tops] fetch attempt', candidate);
      response = await fetch(candidate, { cache: 'no-store' });
      if (response.ok) {
        foundUrl = candidate;
        break;
      }
    } catch (err) {
      console.debug('[tops] fetch failed', candidate, err);
    }
  }

  if (!response || !response.ok) {
    const statusText = response ? `${response.status} ${response.statusText}` : 'no response';
    throw new Error(`HTTP ${statusText} - intentos: ${attemptedUrls.join(', ')}`);
  }

  const data = await response.json();
  const rawItems = Array.isArray(data.peliculas) ? data.peliculas : [];

  const items = rawItems.map(item => ({
    titulo: item.titulo || item.title || 'Sin título',
    tipo: item.tipo || 'película',
    genero: item.genero || item.genre || 'Desconocido',
    duration: item.duracion || item.duration || item.fecha_estreno || 'Desconocido',
    rating: item.rating != null ? item.rating : item.vote_average || 0,
    image: item.imagen_url || item.image || 'assets/icons/placeholder.png',
    description: item.descripcion || item.description || 'Descripción no disponible.',
    trailer: item.trailer || '',
    position: item.posicion || item.position || 0,
  }));

  return {
    nombre: data.nombre || getCategoryLabel(categoryKey),
    plataforma: data.plataforma || getCategoryPlatform(categoryKey),
    items,
    jsonUrl: foundUrl || urlCandidates[0],
  };
}

function createMovieCard(item, index, platformLabel) {
  return `
    <article class="movie-card" data-duration="${item.duration}" data-description="${item.description}" data-trailer="${item.trailer}">
      <div class="card-number">${index + 1}</div>
      <div class="card-image-wrapper">
        <img src="${item.image}" alt="${item.titulo}" class="card-image" onerror="this.src='assets/icons/placeholder.png'">
      </div>
      <div class="card-info">
        <div class="info-top-tags">
          <span class="tag-type">${item.tipo.toUpperCase()}</span>
          <span class="tag-genre">• ${item.genero}</span>
        </div>
        <h3 class="info-title">${item.titulo}</h3>
        <p class="info-desc">${item.description}</p>
        <div class="info-rating">
          <div class="rating-icon"><img src="assets/icons/Estrella.svg" alt="Star"></div>
          <span class="rating-text">${item.rating}</span>
        </div>
      </div>
      <div class="card-actions">
        <span class="tag-platform">${platformLabel}</span>
        <button class="btn-bookmark"><img src="assets/icons/Agregar.svg" alt="Guardar" class="bookmark-icon"></button>
      </div>
    </article>`;
}

async function renderCategoryPage(categoryKey) {
  const titleElement = document.getElementById('tituloPagina');
  const listaElement = document.querySelector('.top-10-list');
  if (!listaElement) return;

  const data = await fetchCategoryData(categoryKey);
  const categoryName = data?.nombre || getCategoryLabel(categoryKey);
  const platformLabel = data?.plataforma || getCategoryPlatform(categoryKey);

  document.title = `StreamRank - Top 10 ${categoryName}`;
  if (titleElement) titleElement.textContent = `Top 10: ${categoryName}`;

  if (!data || data.error || !data.items.length) {
    const baseMessage = data?.error
      ? `Error cargando datos: ${data.error}`
      : 'No hay datos disponibles para esta categoría.';

    const hint = window.location.protocol === 'file:'
      ? 'Ejecuta el sitio desde un servidor local (http://...) para cargar los archivos JSON correctamente.'
      : 'Regresa a <a href="top10.html">Top 10</a> o prueba otra categoría.';

    listaElement.innerHTML = `
      <div class="listas-vacia" style="display:flex;flex-direction:column;align-items:center;gap:12px;max-width:420px;text-align:center;">
        <div class="listas-vacia-icono">📁</div>
        <p class="listas-vacia-texto">${baseMessage}</p>
        <p class="listas-vacia-subtexto">${hint}</p>
      </div>`;
    return;
  }

  const sortedItems = [...data.items].sort((a, b) => (a.position || 0) - (b.position || 0));
  window.topCategoryFullItems = sortedItems;
  window.topCategoryDisplayedItems = sortedItems.slice(0, 10);

  listaElement.innerHTML = window.topCategoryDisplayedItems
    .map((item, index) => createMovieCard(item, index, platformLabel))
    .join('');

  if (typeof initBotonesBookmark === 'function') initBotonesBookmark();
  if (typeof initBotonesWatch === 'function') initBotonesWatch();

  console.debug('[tops] items cargados:', window.topCategoryDisplayedItems.length, 'Top 10 mostrados de', window.topCategoryFullItems.length, 'items totales');
}

function injectRefreshButton(categoryKey) {
  const heroInfo = document.querySelector('.hero-plataforma-info');
  if (!heroInfo) return;

  // Contenedor principal para el botón y la información
  let container = heroInfo.querySelector('.refresh-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'refresh-container';
    container.style.cssText = `
      display: flex; 
      flex-direction: column; 
      gap: 8px; 
      align-items: flex-start;
      margin-top: 16px;
    `;
    heroInfo.appendChild(container);
  }

  // Botón de actualizar
  let button = container.querySelector('.btn-secondary');
  if (!button) {
    button = document.createElement('button');
    button.type = 'button';
    button.className = 'btn-secondary';
    button.style.cssText = 'display: flex; align-items: center; gap: 8px;';
    container.appendChild(button);
  }

  // Contenedor para el loader (inicialmente oculto)
  let loaderContainer = container.querySelector('.loader-container');
  if (!loaderContainer) {
    loaderContainer = document.createElement('div');
    loaderContainer.className = 'loader-container';
    loaderContainer.style.cssText = `
      display: none;
      align-items: center;
      gap: 8px;
      font-size: 14px;
      color: #666;
    `;
    loaderContainer.innerHTML = `
      <div class="spinner" style="
        width: 16px;
        height: 16px;
        border: 2px solid #e0e0e0;
        border-top: 2px solid #2196F3;
        border-radius: 50%;
        animation: spin 0.8s linear infinite;
      "></div>
      <span class="loader-text">Actualizando datos...</span>
    `;
    container.appendChild(loaderContainer);
  }

  // Agregar estilos para la animación del spinner si no existe
  if (!document.getElementById('spinner-styles')) {
    const style = document.createElement('style');
    style.id = 'spinner-styles';
    style.textContent = `
      @keyframes spin {
        to { transform: rotate(360deg); }
      }
      .refresh-info {
        font-size: 12px;
        color: #999;
        margin: 0;
        line-height: 1.4;
      }
      .refresh-info.success {
        color: #4caf50;
      }
      .refresh-info.error {
        color: #f44336;
      }
    `;
    document.head.appendChild(style);
  }

  // Elemento para mostrar información
  let infoElement = container.querySelector('.refresh-info');
  if (!infoElement) {
    infoElement = document.createElement('p');
    infoElement.className = 'refresh-info';
    container.appendChild(infoElement);
  }

  // Cargar fecha de última actualización desde localStorage
  const lastUpdateKey = `lastUpdate_${categoryKey}`;
  function displayLastUpdate() {
    const lastUpdate = localStorage.getItem(lastUpdateKey);
    const totalMovies = localStorage.getItem(`totalMovies_${categoryKey}`) || '50';
    
    if (lastUpdate) {
      infoElement.textContent = `Última actualización: ${lastUpdate} (${totalMovies} películas)`;
      infoElement.className = 'refresh-info success';
    } else {
      infoElement.textContent = 'Última actualización: No disponible';
      infoElement.className = 'refresh-info';
    }
  }
  displayLastUpdate();

  button.textContent = 'Actualizar datos';
  button.addEventListener('click', async () => {
    button.disabled = true;
    button.style.display = 'none';
    loaderContainer.style.display = 'flex';
    infoElement.textContent = '';

    try {
      // Llamar al endpoint PHP para ejecutar el script Python
      const refreshUrl = `${window.BACKEND_BASE_URL}/api/refresh_data.php`;

      const response = await fetch(refreshUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category: categoryKey })
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || `Error ${response.status}`);
      }

      // Recargar datos del JSON
      await renderCategoryPage(categoryKey);
      
      // Actualizar información desde el resultado del servidor
      const updateTime = result.update_time || new Date().toLocaleString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
      
      const totalMovies = result.total_movies || 50;
      const categoryName = result.category_name || 'Datos';
      
      localStorage.setItem(lastUpdateKey, updateTime);
      localStorage.setItem(`totalMovies_${categoryKey}`, totalMovies);
      displayLastUpdate();
      
      // Mostrar mensaje de éxito
      loaderContainer.style.display = 'none';
      infoElement.textContent = `✓ ${categoryName} actualizado: ${totalMovies} películas`;
      infoElement.className = 'refresh-info success';
      
      // Volver a mostrar el botón después de 2 segundos
      setTimeout(() => {
        button.style.display = 'flex';
        button.disabled = false;
      }, 2000);
      
    } catch (error) {
      console.error('[tops] Error actualizando datos:', error);
      loaderContainer.style.display = 'none';
      infoElement.textContent = `✗ Error: ${error.message}`;
      infoElement.className = 'refresh-info error';
      
      setTimeout(() => {
        button.style.display = 'flex';
        button.disabled = false;
      }, 2000);
    }
  });
}

async function initializeTopsPage() {
  const categoryKey = typeof window.TOP_CATEGORIA === 'string' ? window.TOP_CATEGORIA : parseCategoryFromUrl();
  await renderCategoryPage(categoryKey);
  injectRefreshButton(categoryKey);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeTopsPage);
} else {
  initializeTopsPage();
}
