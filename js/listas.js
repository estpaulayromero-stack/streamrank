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
const TOPS_API   = "http://localhost/streamrank/api/Tops.php";
const HISTORIAL_API = "http://localhost/streamrank/api/historial.php";

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
        mostrarToast('Está en tu lista', 'info');
      } else {
        mostrarToast(data.error || 'Error al agregar', 'error');
      }
    }

  } catch (error) {
    console.error('ERROR AGREGAR LISTA:', error);
    mostrarToast('Agregado', 'error');
  }
}

// ==========================
// OBTENER LISTA DEL USUARIO
// ==========================

async function obtenerLista() {
  const email = getCurrentUserEmail();
  if (!email) {
    console.warn('obtenerLista: no hay email de usuario actual en localStorage');
    return [];
  }

  try {
    const response = await fetch(`${LISTAS_API}?email=${encodeURIComponent(email)}`);
    const data     = await response.json();
    if (!response.ok) {
      console.error('obtenerLista: error API', data);
      return [];
    }
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error('ERROR OBTENER LISTA:', error);
    return [];
  }
}

// ==========================
// TOPS PERSONALIZADOS
// ==========================

async function crearTopPersonalizado(nombre, descripcion = '') {
  const email = getCurrentUserEmail();
  if (!email) {
    abrirModal();
    return null;
  }

  try {
    const response = await fetch(TOPS_API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, nombre, descripcion })
    });

    const data = await response.json();
    if (!response.ok) {
      console.error('Error crear top:', data);
      return null;
    }

    return data.top_id ?? null;
  } catch (error) {
    console.error('ERROR CREAR TOP:', error);
    return null;
  }
}

async function obtenerTopsPersonales() {
  const email = getCurrentUserEmail();
  if (!email) return [];

  try {
    const response = await fetch(`${TOPS_API}?email=${encodeURIComponent(email)}`);
    const data     = await response.json();
    if (!response.ok) {
      console.error('Error obtener tops personales:', data);
      return [];
    }
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error('ERROR OBTENER TOPS PERSONALES:', error);
    return [];
  }
}

async function obtenerTopDetalle(topId) {
  if (!topId) return null;

  try {
    const response = await fetch(`${TOPS_API}?id=${encodeURIComponent(topId)}`);
    const data     = await response.json();
    if (!response.ok) {
      console.error('Error obtener detalle de top:', data);
      return null;
    }
    return data;
  } catch (error) {
    console.error('ERROR OBTENER DETALLE TOP:', error);
    return null;
  }
}

async function cargarTopsPersonalizados() {
  const contenedor = document.getElementById('contenedorTopsResultados');
  if (!contenedor) return;

  const tops = await obtenerTopsPersonales();
  contenedor.innerHTML = '';

  if (!tops.length) {
    contenedor.innerHTML = `
      <div class="listas-vacia" style="display:flex;flex-direction:column;align-items:center;gap:12px;">
        <div class="listas-vacia-icono">📁</div>
        <p class="listas-vacia-texto">Aún no tienes tops personalizados.</p>
        <p class="listas-vacia-subtexto">Crea uno nuevo y agrega tus películas favoritas aquí.</p>
      </div>`;
    return;
  }

  const detalles = await Promise.all(tops.map(top => obtenerTopDetalle(top.id)));
  detalles.forEach((detalle, index) => {
    crearTarjetaTop(detalle || tops[index]);
  });
}

async function agregarItemATop(topId, titulo, imagen_url) {
  if (!topId || !titulo) return false;

  try {
    const response = await fetch(`${TOPS_API}?id=${encodeURIComponent(topId)}&action=add_item`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ titulo, imagen_url })
    });

    const data = await response.json();
    if (!response.ok) {
      console.error('Error agregar item a top:', data);
      return false;
    }
    return data.item_id ?? false;
  } catch (error) {
    console.error('ERROR AGREGAR ITEM A TOP:', error);
    return false;
  }
}

// ==========================
// HISTORIAL
// ==========================

async function agregarAHistorial(titulo, tipo = 'pelicula', genero = '', plataforma = '', imagen_url = '', rating = null) {
  const email = getCurrentUserEmail();
  if (!email) {
    abrirModal();
    return false;
  }

  try {
    const response = await fetch(HISTORIAL_API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, titulo, tipo, genero, plataforma, imagen_url, rating })
    });
    const data = await response.json();
    if (!response.ok) {
      console.error('Error agregar al historial:', data);
      mostrarToast(data.error || 'Error al guardar en historial', 'error');
      return false;
    }
    mostrarToast('Agregado al historial', 'success');
    // refrescar vista de historial si está abierta
    renderizarHistorial();
    return true;
  } catch (error) {
    console.error('ERROR AGREGAR A HISTORIAL:', error);
    mostrarToast('No se pudo conectar con el servidor', 'error');
    return false;
  }
}

async function renderizarHistorial() {
  const contenedor = document.getElementById('tab-historial');
  if (!contenedor) return;

  const email = getCurrentUserEmail();
  if (!email) {
    contenedor.innerHTML = `
      <div class="listas-vacia">
        <div class="listas-vacia-icono">⭐</div>
        <p class="listas-vacia-texto">Tu historial está vacío</p>
        <p class="listas-vacia-subtexto">Aquí aparecerán las películas y series que hayas marcado como vistas.</p>
      </div>`;
    return;
  }

  try {
    const response = await fetch(`${HISTORIAL_API}?email=${encodeURIComponent(email)}`);
    const data = await response.json();
    if (!response.ok) {
      console.error('Error obtener historial:', data);
      return;
    }

    if (!Array.isArray(data) || data.length === 0) {
      contenedor.innerHTML = `
        <div class="listas-vacia">
          <div class="listas-vacia-icono">⭐</div>
          <p class="listas-vacia-texto">Tu historial está vacío</p>
          <p class="listas-vacia-subtexto">Aquí aparecerán las películas y series que hayas marcado como vistas.</p>
        </div>`;
      return;
    }

    contenedor.innerHTML = data.map(item => `
      <article class="movie-card">
        <div class="card-image-wrapper">
          <img src="${item.imagen_url || ''}" alt="${item.titulo}" class="card-image" onerror="this.src='assets/icons/placeholder.png'">
        </div>
        <div class="card-info">
          <div class="info-top-tags">
            <span class="tag-type">${item.tipo === 'serie' ? 'SERIE' : 'PELÍCULA'}</span>
            <span class="tag-genre">• ${item.genero || ''}</span>
          </div>
          <h3 class="info-title">${item.titulo}</h3>
        </div>
      </article>
    `).join('');

  } catch (error) {
    console.error('ERROR RENDERIZAR HISTORIAL:', error);
  }
}

async function eliminarItemDeTop(itemId) {
  if (!itemId) return false;

  try {
    const response = await fetch(`${TOPS_API}?item_id=${encodeURIComponent(itemId)}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' }
    });

    const data = await response.json();
    if (!response.ok) {
      console.error('Error eliminar item:', data);
      return false;
    }
    return true;
  } catch (error) {
    console.error('ERROR ELIMINAR ITEM DE TOP:', error);
    return false;
  }
}

async function eliminarTopPersonalizado(topId) {
  if (!topId) return false;

  const email = getCurrentUserEmail();
  if (!email) {
    abrirModal();
    return false;
  }

  try {
    const response = await fetch(`${TOPS_API}?id=${encodeURIComponent(topId)}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });

    const data = await response.json();
    if (!response.ok) {
      console.error('Error eliminar top:', data);
      return false;
    }
    return true;
  } catch (error) {
    console.error('ERROR ELIMINAR TOP:', error);
    return false;
  }
}

function crearTarjetaTop(top) {
  const contenedor = document.getElementById('contenedorTopsResultados');
  if (!contenedor) return;

  const tarjeta = document.createElement('div');
  tarjeta.className = 'top-card-diseno';
  tarjeta.dataset.topId = top.id;
  tarjeta.innerHTML = `
    <div class="top-card-header">
      <div style="display:flex;align-items:center;gap:12px;">
        <h3 class="lista-card-nombre">${top.nombre}</h3>
        <p class="lista-card-meta" style="margin:0;"><span class="top-count">${top.items?.length ?? top.items_count ?? 0}</span> elementos</p>
      </div>
      <div>
        <button class="top-delete-button" title="Eliminar top" style="background:transparent;border:none;color:#c00;cursor:pointer;">Eliminar</button>
      </div>
    </div>
    <div class="top-lista-items" data-lista></div>
    <div class="top-agregar-campo">
      <div class="top-search-wrap">
        <span class="top-search-icon">🔍</span>
        <input type="text" class="top-search-input" placeholder="Agregar más..." />
      </div>
      <div class="top-search-resultados" style="display:none;"></div>
    </div>
  `;

  contenedor.appendChild(tarjeta);
  initTop(tarjeta);

  const deleteBtn = tarjeta.querySelector('.top-delete-button');
  if (deleteBtn && top.id) {
    deleteBtn.addEventListener('click', async () => {
      if (!confirm('¿Eliminar este top personalizado?')) return;
      const success = await eliminarTopPersonalizado(top.id);
      if (success) {
        tarjeta.remove();
        mostrarToast('Top eliminado correctamente', 'success');
      } else {
        mostrarToast('No se pudo eliminar el top', 'error');
      }
    });
  }

  if (Array.isArray(top.items) && top.items.length) {
    const lista = tarjeta.querySelector('[data-lista]');
    const contador = tarjeta.querySelector('.top-count');
    top.items.forEach(item => {
      agregarItemALaLista(lista, contador, item.titulo, item.imagen_url, top.id, false, item.id);
    });
  }
}

function agregarItemALaLista(lista, contador, titulo, img, topId = null, saveOnServer = true, itemId = null) {
  const pos  = lista.children.length + 1;
  const item = document.createElement('div');
  item.className = 'top-item';
  item.draggable = true;
  item.innerHTML = `
    <span class="top-item-pos">${pos}</span>
    <img src="${img}" alt="${titulo}" class="top-item-img" />
    <span class="top-item-titulo">${titulo}</span>
    <button class="top-item-history" type="button" title="Agregar a historial">📜</button>
    <button class="top-item-delete" type="button" title="Eliminar">🗑</button>
  `;

  if (itemId) {
    item.dataset.itemId = itemId;
  }

  item.querySelector('.top-item-delete').addEventListener('click', async () => {
    if (item.dataset.itemId) {
      const deleted = await eliminarItemDeTop(item.dataset.itemId);
      if (!deleted) {
        mostrarToast('Hecho', 'Bien');
        return;
      }
    }
    item.remove();
    actualizarPosiciones(lista, contador);
  });

  const histBtn = item.querySelector('.top-item-history');
  if (histBtn) {
    histBtn.addEventListener('click', async () => {
      const saved = await agregarAHistorial(titulo, 'pelicula', '', '', img, null);
      if (saved) histBtn.textContent = '✓';
    });
  }

  item.addEventListener('dragstart', () => item.classList.add('dragging'));
  item.addEventListener('dragend', () => {
    item.classList.remove('dragging');
    actualizarPosiciones(lista, contador);
  });

  lista.addEventListener('dragover', e => {
    e.preventDefault();
    const dragging  = lista.querySelector('.dragging');
    const siblings  = [...lista.querySelectorAll('.top-item:not(.dragging)')];
    const siguiente = siblings.find(s => {
      const rect = s.getBoundingClientRect();
      return e.clientY < rect.top + rect.height / 2;
    });
    lista.insertBefore(dragging, siguiente || null);
  });

  lista.appendChild(item);
  actualizarPosiciones(lista, contador);

  if (saveOnServer && topId) {
    agregarItemATop(topId, titulo, img).then(newItemId => {
      if (!newItemId) {
        mostrarToast('Hecho', 'bien');
        return;
      }
      item.dataset.itemId = newItemId;
    });
  }
}

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
    mostrarToast('Hecho', 'error');
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
        <button
          class="btn-watch"
          type="button"
          title="Marcar como visto"
          data-titulo="${item.titulo}"
          data-tipo="${item.tipo}"
          data-genero="${item.genero || ''}"
          data-plataforma="${item.plataforma || ''}"
          data-imagen="${item.imagen_url || ''}"
          data-rating="${item.rating || ''}">
          ✓
        </button>
      </div>
    </article>
  `).join('');

  contenedor.querySelectorAll('.btn-watch').forEach(btn => {
    btn.addEventListener('click', async function (e) {
      e.stopPropagation();
      const titulo = this.dataset.titulo || '';
      const tipo = this.dataset.tipo || 'pelicula';
      const genero = this.dataset.genero || '';
      const plataforma = this.dataset.plataforma || '';
      const imagen_url = this.dataset.imagen || '';
      const rating = this.dataset.rating || null;

      const saved = await agregarAHistorial(titulo, tipo, genero, plataforma, imagen_url, rating);
      if (saved) {
        this.classList.add('btn-watch--saved');
        this.textContent = '✔';
        this.title = 'Visto';
      }
    });
  });
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
    renderizarMisListas();
    cargarTopsPersonalizados();
    renderizarHistorial();
  } else {
    initBotonesBookmark();
    initBotonHero();
  }
});