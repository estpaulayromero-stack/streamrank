// ============================================================
//  STREAMRANK — listas.js
//  Maneja: agregar, obtener y eliminar ítems de la lista
//  Backend: PHP/XAMPP + MariaDB
//  Páginas: index.html, top10.html, mis-listas.html
// ============================================================

// ==========================
// CONFIG API
// ==========================

const LISTAS_API = "http://localhost/streamrank/api/listas.php";

// ==========================
// AGREGAR ÍTEM A LA LISTA
// ==========================

async function agregarALista(titulo, tipo, genero, plataforma, imagen_url, rating) {
  const email = getCurrentUserEmail();

  if (!email) {
    abrirModal();
    return;
  }

  try {
    const response = await fetch(LISTAS_API, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ email, titulo, tipo, genero, plataforma, imagen_url, rating })
    });

    const data = await response.json();

    if (response.ok) {
      mostrarToast('✓ Agregado a tu lista');
    } else {
      if (data.error === 'Ya está en tu lista') {
        mostrarToast('Ya está en tu lista', 'info');
      } else {
        mostrarToast(data.error || 'Error al agregar', 'error');
      }
    }

  } catch (error) {
    console.error('ERROR AGREGAR LISTA:', error);
    mostrarToast('No se pudo conectar con el servidor', 'error');
  }
}

// ==========================
// OBTENER LISTA DEL USUARIO
// ==========================

async function obtenerLista() {
  const email = getCurrentUserEmail();
  if (!email) return [];

  try {
    const response = await fetch(`${LISTAS_API}?email=${encodeURIComponent(email)}`);
    const data     = await response.json();
    return (response.ok && Array.isArray(data)) ? data : [];
  } catch (error) {
    console.error('ERROR OBTENER LISTA:', error);
    return [];
  }
}

// ==========================
// ELIMINAR ÍTEM DE LA LISTA
// ==========================

async function eliminarDeLista(itemId, cardElement) {
  const email = getCurrentUserEmail();
  if (!email) return;

  try {
    const response = await fetch(`${LISTAS_API}?id=${itemId}`, {
      method:  'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ email })
    });

    const data = await response.json();

    if (response.ok) {
      if (cardElement) {
        cardElement.style.transition = 'opacity 0.3s ease';
        cardElement.style.opacity    = '0';
        setTimeout(() => {
          cardElement.remove();
          verificarListaVacia();
        }, 300);
      }
      mostrarToast('Eliminado de tu lista');
    } else {
      mostrarToast(data.error || 'Error al eliminar', 'error');
    }

  } catch (error) {
    console.error('ERROR ELIMINAR LISTA:', error);
    mostrarToast('No se pudo conectar con el servidor', 'error');
  }
}

// ==========================
// RENDERIZAR LISTA EN MIS-LISTAS.HTML
// ==========================

async function renderizarMisListas() {
  const contenedor  = document.getElementById('agregadosContenedor');
  const estadoVacio = document.getElementById('agregadosVacio');
  if (!contenedor) return;

  // Loading
  contenedor.style.display = 'block';
  contenedor.innerHTML = `
    <div style="text-align:center;color:#aaa;padding:40px;">
      Cargando tu lista...
    </div>`;
  if (estadoVacio) estadoVacio.style.display = 'none';

  const items = await obtenerLista();

  if (!items.length) {
    contenedor.style.display = 'none';
    if (estadoVacio) estadoVacio.style.display = 'flex';
    return;
  }

  contenedor.style.display = 'block';
  if (estadoVacio) estadoVacio.style.display = 'none';

  contenedor.innerHTML = items.map(item => `
    <article class="movie-card" data-id="${item.id}">
      <div class="card-image-wrapper">
        <img
          src="${item.imagen_url || ''}"
          alt="${item.titulo}"
          class="card-image"
          onerror="this.src='assets/icons/placeholder.png'">
      </div>
      <div class="card-info">
        <div class="info-top-tags">
          <span class="tag-type">${item.tipo === 'serie' ? 'SERIE' : 'PELÍCULA'}</span>
          <span class="tag-genre">• ${item.genero || ''}</span>
        </div>
        <h3 class="info-title">${item.titulo}</h3>
        <div class="info-rating">
          <div class="rating-icon">
            <img src="assets/icons/Estrella.svg" alt="Star">
          </div>
          <span class="rating-text">${item.rating || '—'}</span>
        </div>
      </div>
      <div class="card-actions">
        <span class="tag-platform">${item.plataforma || ''}</span>
        <button
          class="btn-bookmark active"
          title="Eliminar de la lista"
          onclick="eliminarDeLista(${item.id}, this.closest('.movie-card'))">
          <img src="assets/icons/agregada.svg" alt="Eliminar" class="bookmark-icon">
        </button>
      </div>
    </article>
  `).join('');
}

// ==========================
// VERIFICAR LISTA VACÍA
// ==========================

function verificarListaVacia() {
  const contenedor  = document.getElementById('agregadosContenedor');
  const estadoVacio = document.getElementById('agregadosVacio');
  if (!contenedor) return;

  if (contenedor.querySelectorAll('.movie-card').length === 0) {
    contenedor.style.display = 'none';
    if (estadoVacio) estadoVacio.style.display = 'flex';
  }
}

// ==========================
// BOTONES BOOKMARK
// index.html y top10.html
// ==========================

function initBotonesBookmark() {
  document.querySelectorAll('.btn-bookmark').forEach(btn => {
    btn.addEventListener('click', function (e) {
      e.stopPropagation();

      const card = this.closest('.movie-card');
      if (!card) return;

      const titulo     = card.querySelector('.info-title')?.textContent.trim()            || '';
      const tipoRaw    = card.querySelector('.tag-type')?.textContent.trim()              || '';
      const genero     = card.querySelector('.tag-genre')?.textContent.replace('•','').trim() || '';
      const plataforma = card.querySelector('.tag-platform')?.textContent.trim()          || '';
      const imagen_url = card.querySelector('.card-image')?.src                           || '';
      const rating     = card.querySelector('.rating-text')?.textContent.trim()           || '';
      const tipo       = tipoRaw.toLowerCase().includes('serie') ? 'serie' : 'pelicula';

      agregarALista(titulo, tipo, genero, plataforma, imagen_url, rating);

      // Feedback visual
      const icon = this.querySelector('img');
      this.classList.add('active');
      if (icon) icon.src = 'assets/icons/agregada.svg';
    });
  });
}

// ==========================
// BOTÓN HERO
// "Agregar a la lista" en index.html
// ==========================

function initBotonHero() {
  const btnHero = document.querySelector('.btn-secondary');
  if (!btnHero) return;

  btnHero.addEventListener('click', function () {
    const titulo     = document.querySelector('.hero-title')?.textContent.trim() || '';
    const imagen_url = document.querySelector('.hero-image')?.src                || '';

    agregarALista(titulo, 'serie', 'Drama', 'NETFLIX', imagen_url, '9.5');

    this.classList.add('added');
    const icon = this.querySelector('.icon');
    const text = this.querySelector('.btn-text');
    if (icon) icon.innerHTML = '<img src="assets/icons/agregada.svg" alt="Agregado" style="width:20px;height:20px;object-fit:contain;">';
    if (text) text.textContent = 'Agregado';
  });
}

// ==========================
// TOAST
// ==========================

function mostrarToast(mensaje, tipo = 'success') {
  let toast = document.getElementById('streamrank-toast');

  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'streamrank-toast';
    toast.style.cssText = `
      position: fixed;
      bottom: 32px;
      left: 50%;
      transform: translateX(-50%) translateY(20px);
      background: #1e293b;
      color: #fff;
      padding: 12px 28px;
      border-radius: 30px;
      font-size: 15px;
      font-weight: 600;
      z-index: 9999;
      opacity: 0;
      transition: opacity 0.3s ease, transform 0.3s ease;
      pointer-events: none;
      border: 1px solid rgba(255,255,255,0.1);
    `;
    document.body.appendChild(toast);
  }

  const colores = { success: '#22c55e', error: '#e7000b', info: '#3b82f6' };
  toast.style.borderColor = colores[tipo] || colores.success;
  toast.textContent = mensaje;

  requestAnimationFrame(() => {
    toast.style.opacity   = '1';
    toast.style.transform = 'translateX(-50%) translateY(0)';
  });

  clearTimeout(toast._timeout);
  toast._timeout = setTimeout(() => {
    toast.style.opacity   = '0';
    toast.style.transform = 'translateX(-50%) translateY(20px)';
  }, 2500);
}

// ==========================
// INIT
// ==========================

document.addEventListener('DOMContentLoaded', () => {
  const enMisListas   = window.location.pathname.endsWith('mis-listas.html');
  const sessionActive = localStorage.getItem('streamrank_session') === 'activa';

  if (enMisListas) {
    if (sessionActive) renderizarMisListas();
  } else {
    initBotonesBookmark();
    initBotonHero();
  }
});