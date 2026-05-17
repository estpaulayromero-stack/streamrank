// Auth shared logic for StreamRank
const STORAGE_USERS_KEY = 'streamrank_users';
const STORAGE_SESSION_KEY = 'streamrank_session';
const STORAGE_CURRENT_EMAIL_KEY = 'streamrank_currentEmail';
const STORAGE_LISTS_KEY = 'streamrank_lists';

function getUsers() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_USERS_KEY)) || [];
  } catch (error) {
    console.error('Error reading users from storage:', error);
    return [];
  }
}

function saveUsers(users) {
  localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(users));
}

function getSavedLists() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_LISTS_KEY)) || {};
  } catch (error) {
    console.error('Error reading lists from storage:', error);
    return {};
  }
}

function saveLists(lists) {
  localStorage.setItem(STORAGE_LISTS_KEY, JSON.stringify(lists));
}

function getUserLists(email) {
  if (!email) return null;
  const allLists = getSavedLists();
  if (!allLists[email]) {
    allLists[email] = { agregados: [], historial: [], topsPersonalizados: [] };
    saveLists(allLists);
  }
  return allLists[email];
}

function saveUserLists(email, lists) {
  if (!email) return;
  const allLists = getSavedLists();
  allLists[email] = lists;
  saveLists(allLists);
}

function getCurrentUserEmail() {
  return localStorage.getItem(STORAGE_CURRENT_EMAIL_KEY);
}

function saveCurrentUserEmail(email) {
  localStorage.setItem(STORAGE_CURRENT_EMAIL_KEY, email);
}

function clearCurrentSession() {
  localStorage.removeItem(STORAGE_SESSION_KEY);
  localStorage.removeItem(STORAGE_CURRENT_EMAIL_KEY);
}

function getCurrentUser() {
  const email = getCurrentUserEmail();
  if (!email) return null;
  return getUsers().find(u => u.email === email) || null;
}

function getCurrentUserLists() {
  const user = getCurrentUser();
  if (!user) return null;
  return getUserLists(user.email);
}

function findUserByEmail(email) {
  return getUsers().find(u => u.email === email) || null;
}

function openModal(modalId) {
  const overlay = document.getElementById('modalOverlay');
  const modal = document.getElementById(modalId);
  if (!overlay || !modal) return;

  overlay.style.display = 'block';
  modal.style.display = 'flex';
  document.body.style.overflow = 'hidden';
}

function closeModal(modalId) {
  const overlay = document.getElementById('modalOverlay');
  const modal = document.getElementById(modalId);
  if (!overlay || !modal) return;

  overlay.style.display = 'none';
  modal.style.display = 'none';
  document.body.style.overflow = '';
}

function abrirModal() {
  openModal('modalLogin');
}

function cerrarModal() {
  closeModal('modalLogin');
}

function abrirRegistro() {
  cerrarModal();
  openModal('modalRegistro');
}

function cerrarRegistro() {
  closeModal('modalRegistro');
}

function irALogin() {
  cerrarRegistro();
  abrirModal();
}

function isValidEmail(email) {
  return email && email.includes('@gmail');
}

function isValidPassword(password) {
  return password && password.length >= 8;
}

function simularLogin() {
  const emailInput = document.getElementById('loginEmail');
  const passwordInput = document.getElementById('loginPassword');
  const emailError = document.getElementById('loginEmailError');
  const passError = document.getElementById('loginPassError');

  if (!emailInput || !passwordInput) return;

  const email = emailInput.value.trim();
  const password = passwordInput.value.trim();

  if (emailError) emailError.style.display = 'none';
  if (passError) passError.style.display = 'none';

  if (!isValidEmail(email)) {
    if (emailError) emailError.style.display = 'block';
    return;
  }

  if (!isValidPassword(password)) {
    if (passError) passError.style.display = 'block';
    return;
  }

  const user = findUserByEmail(email);
  if (!user) {
    alert('Este correo no está registrado. Debes crear una cuenta.');
    return;
  }

  if (user.password !== password) {
    alert('Contraseña incorrecta');
    return;
  }

  localStorage.setItem(STORAGE_SESSION_KEY, 'activa');
  saveCurrentUserEmail(email);

  cerrarModal();
  actualizarEstadoUsuario();
  renderMisListasPage();
  redirectAfterLogin();
}

function simularRegistro() {
  const emailInput = document.getElementById('regEmail');
  const passwordInput = document.getElementById('regPassword');

  if (!emailInput || !passwordInput) return;

  const email = emailInput.value.trim();
  const password = passwordInput.value.trim();

  if (!email || !password) {
    alert('Completa los datos');
    return;
  }

  if (!isValidEmail(email)) {
    alert('Debe ser un correo @gmail');
    return;
  }

  if (!isValidPassword(password)) {
    alert('La contraseña debe tener mínimo 8 caracteres');
    return;
  }

  const users = getUsers();
  if (findUserByEmail(email)) {
    alert('Este correo ya está registrado. Inicia sesión.');
    return;
  }

  users.push({
    email,
    password,
    username: '',
    photoUrl: ''
  });

  saveUsers(users);
  alert('Registro exitoso. Ahora inicia sesión.');
  cerrarRegistro();
}

function guardarAjustes() {
  const usernameInput = document.getElementById('ajustes-username');
  const photoUrlInput = document.getElementById('ajustes-foto-url');
  const passwordInput = document.getElementById('ajustes-password');
  const aviso = document.getElementById('ajustes-aviso');
  const ajustesEmail = document.getElementById('ajustes-email');

  const currentUser = getCurrentUser();
  if (!currentUser) return;

  if (usernameInput) currentUser.username = usernameInput.value.trim();
  if (photoUrlInput) currentUser.photoUrl = photoUrlInput.value.trim();
  if (passwordInput && passwordInput.value.trim()) {
    if (!isValidPassword(passwordInput.value.trim())) {
      alert('La nueva contraseña debe tener mínimo 8 caracteres');
      return;
    }
    currentUser.password = passwordInput.value.trim();
  }

  const users = getUsers().map(user => {
    return user.email === currentUser.email ? currentUser : user;
  });

  saveUsers(users);

  if (aviso) {
    aviso.style.display = 'flex';
    setTimeout(() => { aviso.style.display = 'none'; }, 2200);
  }

  actualizarEstadoUsuario();
}

function logout() {
  clearCurrentSession();
  location.reload();
}

function redirectAfterLogin() {
  const fromMisListas = new URLSearchParams(window.location.search).get('from') === 'mislistas';
  if (fromMisListas && !window.location.pathname.endsWith('mis-listas.html')) {
    window.location.href = 'mis-listas.html';
  }
}

function parseMovieCard(card) {
  if (!card) return null;
  const title = card.querySelector('.info-title')?.textContent.trim() || card.dataset.title || '';
  const platform = card.querySelector('.tag-platform')?.textContent.trim() || card.dataset.type || 'General';
  const genre = (card.querySelector('.tag-genre')?.textContent || card.dataset.genre || '').replace('•', '').trim();
  const rating = card.querySelector('.rating-text')?.textContent.trim() || card.dataset.rating || '';
  const duration = card.dataset.duration || '';
  const description = card.querySelector('.info-desc')?.textContent.trim() || card.dataset.description || '';
  const trailer = card.dataset.trailer || '';
  const poster = card.querySelector('img')?.src || '';
  if (!title) return null;

  return {
    id: `${platform}|${title}`,
    title,
    platform,
    genre,
    rating,
    duration,
    description,
    trailer,
    poster
  };
}

function parseHeroItem(button) {
  if (!button) return null;
  const section = button.closest('main');
  if (!section) return null;
  const title = section.querySelector('.hero-title')?.textContent.trim() || section.querySelector('.hero-title')?.textContent.trim();
  if (!title) return null;
  const platform = section.querySelector('.tag-platform')?.textContent.trim() || 'Principal';
  const genre = (section.querySelector('.tag-genre')?.textContent || '').replace('•', '').trim();
  const rating = section.querySelector('.rating-text')?.textContent.trim() || '';
  const duration = section.querySelector('[data-duration]')?.dataset.duration || '';
  const description = section.querySelector('.hero-description')?.textContent.trim() || '';
  const trailer = section.querySelector('iframe')?.src || '';
  const poster = section.querySelector('img')?.src || '';

  return {
    id: `hero|${title}`,
    title,
    platform,
    genre,
    rating,
    duration,
    description,
    trailer,
    poster
  };
}

function isItemSaved(item) {
  const lists = getCurrentUserLists();
  if (!lists || !item) return false;
  return lists.agregados.some(entry => entry.id === item.id);
}

function saveAgregadoItem(item) {
  const user = getCurrentUser();
  if (!user) {
    abrirModal();
    return false;
  }

  const lists = getUserLists(user.email);
  if (!lists.agregados.some(entry => entry.id === item.id)) {
    lists.agregados.unshift(item);
    saveUserLists(user.email, lists);
  }
  return true;
}

function removeAgregadoItem(itemId) {
  const user = getCurrentUser();
  if (!user || !itemId) return;

  const lists = getUserLists(user.email);
  lists.agregados = lists.agregados.filter(item => item.id !== itemId);
  saveUserLists(user.email, lists);
}

function markAgregadoAsVisto(itemId) {
  const user = getCurrentUser();
  if (!user || !itemId) return;

  const lists = getUserLists(user.email);
  const index = lists.agregados.findIndex(item => item.id === itemId);
  if (index === -1) return;

  const item = lists.agregados.splice(index, 1)[0];
  if (!lists.historial.some(entry => entry.id === item.id)) {
    lists.historial.unshift(item);
  }
  saveUserLists(user.email, lists);
}

function createTop(name) {
  const user = getCurrentUser();
  if (!user || !name) return false;

  const lists = getUserLists(user.email);
  const trimmed = name.trim();
  if (!trimmed) return false;
  if (lists.topsPersonalizados.some(top => top.name.toLowerCase() === trimmed.toLowerCase())) return false;

  lists.topsPersonalizados.unshift({
    id: `top-${Date.now()}`,
    name: trimmed,
    createdAt: new Date().toISOString()
  });
  saveUserLists(user.email, lists);
  return true;
}

function renderBookmarkButtonsState() {
  const cards = document.querySelectorAll('.movie-card');
  cards.forEach(card => {
    const button = card.querySelector('.btn-bookmark');
    if (!button) return;
    const item = parseMovieCard(card);
    if (!item) return;

    if (isItemSaved(item)) {
      button.classList.add('active');
      const icon = button.querySelector('img');
      if (icon) icon.src = 'assets/icons/agregada.svg';
    } else {
      button.classList.remove('active');
      const icon = button.querySelector('img');
      if (icon) icon.src = 'assets/icons/agregar.svg';
    }
  });
}

function updateHeroButtonState() {
  const heroButton = document.querySelector('.btn-secondary');
  if (!heroButton) return;
  const item = parseHeroItem(heroButton);
  if (!item) return;

  if (isItemSaved(item)) {
    heroButton.classList.add('added');
    const icon = heroButton.querySelector('.icon');
    const text = heroButton.querySelector('.btn-text');
    if (icon) icon.innerHTML = '<img src="assets/icons/agregada.svg" alt="Agregado" style="width: 20px; height: 20px; object-fit: contain;" />';
    if (text) text.textContent = 'Agregado';
  } else {
    heroButton.classList.remove('added');
    const icon = heroButton.querySelector('.icon');
    const text = heroButton.querySelector('.btn-text');
    if (icon) icon.innerHTML = '<img src="assets/icons/agregar.svg" alt="Agregar" style="width: 20px; height: 20px; object-fit: contain;" />';
    if (text) text.textContent = 'Agregar a la lista';
  }
}

function renderMisListasPage() {
  if (!window.location.pathname.endsWith('mis-listas.html')) return;
  const lists = getCurrentUserLists();
  if (!lists) return;

  const agregadosContenedor = document.getElementById('agregadosContenedor');
  const agregadosVacio = document.getElementById('agregadosVacio');
  const historialContenedor = document.getElementById('historialContenedor');
  const historialVacio = document.getElementById('historialVacio');
  const contenedorTops = document.getElementById('contenedorTopsResultados');

  if (agregadosContenedor) {
    if (lists.agregados.length === 0) {
      agregadosContenedor.innerHTML = '';
      if (agregadosVacio) agregadosVacio.style.display = 'flex';
    } else {
      if (agregadosVacio) agregadosVacio.style.display = 'none';
      agregadosContenedor.innerHTML = lists.agregados.map(item => `
        <div class="lista-card-agregados">
          <img src="${item.poster || 'assets/icons/Clapperboard.svg'}" alt="${item.title}" class="agregados-img" />
          <div class="agregados-info">
            <div class="agregados-tag">${item.platform} · ${item.genre || 'General'}</div>
            <h3 class="agregados-title">${item.title}</h3>
            <div class="pildora-rating">
              <span class="estrella">★</span>
              <span class="valor">${item.rating || '—'}</span>
            </div>
            <p class="agregados-desc">${item.description || 'Sin descripción disponible.'}</p>
            <div class="agregados-acciones">
              <button data-action="marcar-visto" data-item-id="${item.id}" class="btn-status-visto" type="button">✓ Vista</button>
              <button data-action="eliminar" data-item-id="${item.id}" class="btn-status-eliminar" type="button">Eliminar</button>
            </div>
          </div>
          <div class="plataforma-badge">${item.platform}</div>
        </div>
      `).join('');
    }
  }

  if (historialContenedor) {
    if (lists.historial.length === 0) {
      historialContenedor.style.display = 'none';
      if (historialVacio) historialVacio.style.display = 'flex';
    } else {
      if (historialVacio) historialVacio.style.display = 'none';
      historialContenedor.style.display = 'block';
      historialContenedor.innerHTML = lists.historial.map(item => `
        <div class="lista-card-agregados">
          <img src="${item.poster || 'assets/icons/Clapperboard.svg'}" alt="${item.title}" class="agregados-img" />
          <div class="agregados-info">
            <div class="agregados-tag">${item.platform} · ${item.genre || 'General'}</div>
            <h3 class="agregados-title">${item.title}</h3>
            <div class="pildora-rating">
              <span class="estrella">★</span>
              <span class="valor">${item.rating || '—'}</span>
            </div>
            <p class="agregados-desc">${item.description || 'Sin descripción disponible.'}</p>
          </div>
          <div class="plataforma-badge">${item.platform}</div>
        </div>
      `).join('');
    }
  }

  if (contenedorTops) {
    if (lists.topsPersonalizados.length === 0) {
      contenedorTops.innerHTML = `
        <div class="listas-vacia">
          <div class="listas-vacia-icono">💾</div>
          <p class="listas-vacia-texto">Aún no tienes tops personalizados</p>
          <p class="listas-vacia-subtexto">Crea un top nuevo para guardar tus selecciones favoritas.</p>
        </div>
      `;
    } else {
      contenedorTops.innerHTML = lists.topsPersonalizados.map(top => `
        <div class="lista-top-card">
          <div>
            <h3>${top.name}</h3>
            <p class="listas-top-meta">Creado el ${new Date(top.createdAt).toLocaleDateString('es-ES')}</p>
          </div>
          <button data-action="eliminar-top" data-top-id="${top.id}" class="btn-status-eliminar" type="button">Eliminar</button>
        </div>
      `).join('');
    }
  }

  renderBookmarkButtonsState();
  updateHeroButtonState();
}

function setupEventListeners() {
  const btnGuardarAjustes = document.getElementById('btnGuardarAjustes');
  const btnCerrarSesionAjustes = document.getElementById('btnCerrarSesionAjustes');
  const loginEmail = document.getElementById('loginEmail');
  const loginPassword = document.getElementById('loginPassword');
  const linkMisListas = document.getElementById('linkMisListas');
  const btnCrearTop = document.getElementById('btnCrearTop');
  const btnCancelarTop = document.getElementById('btnCancelarTop');
  const btnGuardarTop = document.getElementById('btnGuardarTop');
  const formCrearTop = document.getElementById('formCrearTop');
  const nombreTop = document.getElementById('nombreTop');

  if (btnGuardarAjustes) {
    btnGuardarAjustes.addEventListener('click', guardarAjustes);
  }

  if (btnCerrarSesionAjustes) {
    btnCerrarSesionAjustes.addEventListener('click', logout);
  }

  if (loginEmail) {
    loginEmail.addEventListener('input', () => {
      const emailError = document.getElementById('loginEmailError');
      if (emailError) emailError.style.display = 'none';
    });
  }

  if (loginPassword) {
    loginPassword.addEventListener('input', () => {
      const passError = document.getElementById('loginPassError');
      if (passError) passError.style.display = 'none';
    });
  }

  if (linkMisListas) {
    linkMisListas.addEventListener('click', function (e) {
      e.preventDefault();
      const sessionActive = localStorage.getItem(STORAGE_SESSION_KEY) === 'activa';
      if (sessionActive) {
        window.location.href = 'mis-listas.html';
      } else {
        window.location.href = 'registro.html?from=mislistas';
      }
    });
  }

  if (btnCrearTop) {
    btnCrearTop.addEventListener('click', function () {
      if (formCrearTop) formCrearTop.style.display = 'block';
      this.style.display = 'none';
      if (nombreTop) nombreTop.focus();
    });
  }

  if (btnCancelarTop) {
    btnCancelarTop.addEventListener('click', function () {
      if (formCrearTop) formCrearTop.style.display = 'none';
      if (btnCrearTop) btnCrearTop.style.display = 'flex';
      if (nombreTop) nombreTop.value = '';
    });
  }

  if (btnGuardarTop) {
    btnGuardarTop.addEventListener('click', function () {
      if (!nombreTop || !nombreTop.value.trim()) {
        alert('Ingresa el nombre del top');
        return;
      }

      const saved = createTop(nombreTop.value);
      if (!saved) {
        alert('Ya existe un top con ese nombre o el nombre no es válido');
        return;
      }

      if (formCrearTop) formCrearTop.style.display = 'none';
      if (btnCrearTop) btnCrearTop.style.display = 'flex';
      if (nombreTop) nombreTop.value = '';
      renderMisListasPage();
    });
  }

  document.addEventListener('click', function (e) {
    const bookBtn = e.target.closest('.btn-bookmark');
    if (bookBtn) {
      e.stopImmediatePropagation();
      e.preventDefault();
      const card = bookBtn.closest('.movie-card');
      const item = parseMovieCard(card);
      if (!item) return;
      if (!getCurrentUser()) return;
      if (isItemSaved(item)) {
        removeAgregadoItem(item.id);
      } else {
        saveAgregadoItem(item);
      }
      renderMisListasPage();
      return;
    }

    const heroBtn = e.target.closest('.btn-secondary');
    if (heroBtn) {
      e.stopImmediatePropagation();
      e.preventDefault();
      const item = parseHeroItem(heroBtn);
      if (!item) return;
      if (!getCurrentUser()) return;
      saveAgregadoItem(item);
      renderMisListasPage();
      return;
    }

    const actionBtn = e.target.closest('button[data-action]');
    if (actionBtn) {
      const action = actionBtn.dataset.action;
      const itemId = actionBtn.dataset.itemId;
      const topId = actionBtn.dataset.topId;

      if (action === 'eliminar' && itemId) {
        removeAgregadoItem(itemId);
        renderMisListasPage();
        return;
      }

      if (action === 'marcar-visto' && itemId) {
        markAgregadoAsVisto(itemId);
        renderMisListasPage();
        return;
      }

      if (action === 'eliminar-top' && topId) {
        const user = getCurrentUser();
        if (!user) return;
        const lists = getUserLists(user.email);
        lists.topsPersonalizados = lists.topsPersonalizados.filter(top => top.id !== topId);
        saveUserLists(user.email, lists);
        renderMisListasPage();
        return;
      }
    }
  }, true);
}

function actualizarEstadoUsuario() {
  const sessionActive = localStorage.getItem(STORAGE_SESSION_KEY) === 'activa';
  const user = getCurrentUser();
  const btnIngresar = document.getElementById('btnIngresar');
  const noSesionView = document.getElementById('noSesionView');
  const ajustes = document.getElementById('ajustes-cuenta');
  const titulo = document.getElementById('ajustes-titulo');
  const ajustesEmail = document.getElementById('ajustes-email');
  const ajustesUsername = document.getElementById('ajustes-username');
  const ajustesFoto = document.getElementById('ajustes-foto-url');
  const ajustesInicial = document.getElementById('ajustes-inicial');

  if (sessionActive && user) {
    if (btnIngresar) {
      btnIngresar.textContent = user.username || user.email;
      btnIngresar.onclick = function () {
        if (ajustes) {
          ajustes.style.display = 'flex';
          if (titulo) titulo.style.display = 'block';
          ajustes.scrollIntoView({ behavior: 'smooth' });
        } else {
          abrirModal();
        }
      };
    }

    if (noSesionView) noSesionView.style.display = 'none';

    if (ajustes) {
      ajustes.style.display = 'flex';
      if (titulo) titulo.style.display = 'block';
      if (ajustesEmail) ajustesEmail.value = user.email;
      if (ajustesUsername) ajustesUsername.value = user.username || '';
      if (ajustesFoto) ajustesFoto.value = user.photoUrl || '';
      if (ajustesInicial) ajustesInicial.textContent = user.username ? user.username.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase();
    }
  } else {
    if (btnIngresar) {
      btnIngresar.textContent = 'Ingresar';
      btnIngresar.onclick = abrirModal;
    }

    if (noSesionView) {
      const esMisListas = window.location.pathname.includes('mis-listas.html');
      const vieneDeMisListas = window.location.search.includes('from=mislistas');
      noSesionView.style.display = (esMisListas || vieneDeMisListas) ? 'flex' : 'none';
    }

    if (ajustes) {
      ajustes.style.display = 'none';
      if (titulo) titulo.style.display = 'none';
    }
  }

  renderMisListasPage();
  renderBookmarkButtonsState();
  updateHeroButtonState();
}

function verificarProteccionPagina() {
  const necesitaProteccion = window.location.pathname.endsWith('mis-listas.html');
  const sessionActive = localStorage.getItem(STORAGE_SESSION_KEY) === 'activa';
  if (necesitaProteccion && !sessionActive) {
    window.location.href = 'registro.html?from=mislistas';
  }
}

function initAuth() {
  verificarProteccionPagina();
  setupEventListeners();
  actualizarEstadoUsuario();
}

document.addEventListener('DOMContentLoaded', initAuth);
