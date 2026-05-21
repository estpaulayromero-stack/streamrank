// ============================================================
//  MARVEL TOP 10 — Carga dinámica desde JSON
//  Archivo: js/marvel.js
//  Reemplaza las tarjetas hardcodeadas con datos del scraper
// ============================================================

const MARVEL_JSON_URL = 'marvel_top10.json';

async function cargarTopMarvel() {
  const contenedor = document.querySelector('.top-10-list');
  
  if (!contenedor) {
    console.warn('No se encontró el contenedor .top-10-list');
    return;
  }

  try {
    const isFileProtocol = window.location.protocol === 'file:';

    if (isFileProtocol) {
      contenedor.innerHTML = `
        <div style="text-align:center; padding:40px; color:#f87171;">
          No se puede cargar el JSON desde <code>file://</code>. Abre el proyecto con un servidor local, por ejemplo:<br>
          <code>python -m http.server 8000</code>
        </div>
      `;
      return;
    }

    // Mostrar loading
    contenedor.innerHTML = `
      <div style="text-align:center; padding:40px; color:#aaa;">
        Cargando Top 10 Marvel...
      </div>
    `;

    console.log('Cargando JSON desde:', MARVEL_JSON_URL, 'en', window.location.href);

    const response = await fetch(MARVEL_JSON_URL);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();
    const peliculas = data.peliculas || [];

    if (peliculas.length === 0) {
      contenedor.innerHTML = `
        <div style="text-align:center; padding:40px; color:#aaa;">
          No hay películas disponibles
        </div>
      `;
      return;
    }

    // Generar HTML de las tarjetas
    contenedor.innerHTML = peliculas.map(peli => crearTarjeta(peli)).join('');

    console.log(`✅ Cargadas ${peliculas.length} películas de Marvel`);

  } catch (error) {
    console.error('❌ Error al cargar Marvel JSON:', error);
    contenedor.innerHTML = `
      <div style="text-align:center; padding:40px; color:#f87171;">
        Error al cargar las películas. Verifica que el archivo JSON exista en <code>marvel_top10.json</code>.<br>
        <small style="display:block; margin-top:10px; color:#ffd6d6;">${error.message}</small>
      </div>
    `;
  }
}

function crearTarjeta(peli) {
  const {
    posicion,
    titulo,
    rating,
    imagen_url,
    descripcion,
    fecha_estreno,
    generos
  } = peli;

  // Manejar imagen por defecto
  const imgSrc = imagen_url || 'assets/icons/placeholder.png';

  // Genero por defecto (TMDb retorna IDs, no nombres)
  const generoTexto = 'Acción'; // Puedes hacer un map de IDs a nombres si quieres

  return `
    <article class="movie-card"
             data-duration="120min"
             data-description="${descripcion || ''}"
             data-trailer="">
      <div class="card-number">${posicion}</div>
      <div class="card-image-wrapper">
        <img src="${imgSrc}" 
             alt="${titulo}" 
             class="card-image"
             onerror="this.src='assets/icons/placeholder.png'">
      </div>
      <div class="card-info">
        <div class="info-top-tags">
          <span class="tag-type">PELÍCULA</span>
          <span class="tag-genre">• ${generoTexto}</span>
        </div>
        <h3 class="info-title">${titulo}</h3>
        <p class="info-desc">${(descripcion || '').substring(0, 100)}...</p>
        <div class="info-rating">
          <div class="rating-icon">
            <img src="assets/icons/Estrella.svg" alt="Star">
          </div>
          <span class="rating-text">${rating}</span>
        </div>
      </div>
      <div class="card-actions">
        <span class="tag-platform">DISNEY+</span>
        <button class="btn-bookmark">
          <img src="assets/icons/Agregar.svg" alt="Guardar" class="bookmark-icon">
        </button>
      </div>
    </article>
  `;
}

// Ejecutar al cargar la página
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', cargarTopMarvel);
} else {
  cargarTopMarvel();
}