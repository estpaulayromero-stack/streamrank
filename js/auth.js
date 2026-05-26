// ============================================================
//  STREAMRANK — auth.js
//  Backend: PHP/XAMPP + MariaDB
// ============================================================

const API_URL = "http://localhost/back-streamRank/api";

// ==========================
// STORAGE KEYS
// ==========================

const STORAGE_SESSION_KEY       = 'streamrank_session';
const STORAGE_CURRENT_EMAIL_KEY = 'streamrank_currentEmail';
const STORAGE_USERNAME_KEY      = 'streamrank_username';
const STORAGE_FOTO_KEY          = 'streamrank_foto';

// ==========================
// SESIÓN
// ==========================

function saveCurrentUserEmail(email) {
  localStorage.setItem(STORAGE_CURRENT_EMAIL_KEY, email);
}

function getCurrentUserEmail() {
  return localStorage.getItem(STORAGE_CURRENT_EMAIL_KEY);
}

function clearCurrentSession() {
  localStorage.removeItem(STORAGE_SESSION_KEY);
  localStorage.removeItem(STORAGE_CURRENT_EMAIL_KEY);
  localStorage.removeItem(STORAGE_USERNAME_KEY);
  localStorage.removeItem(STORAGE_FOTO_KEY);
}

function isSessionActive() {
  return localStorage.getItem(STORAGE_SESSION_KEY) === 'activa';
}

function logout() {
  clearCurrentSession();
  location.reload();
}

// ==========================
// MODALES
// ==========================

function openModal(modalId) {
  const overlay = document.getElementById('modalOverlay');
  const modal   = document.getElementById(modalId);
  if (!overlay || !modal) return;
  overlay.style.display = 'block';
  modal.style.display   = 'flex';
  document.body.style.overflow = 'hidden';
}

function closeModal(modalId) {
  const overlay = document.getElementById('modalOverlay');
  const modal   = document.getElementById(modalId);
  if (!overlay || !modal) return;
  overlay.style.display = 'none';
  modal.style.display   = 'none';
  document.body.style.overflow = '';
}

function abrirModal()     { resetLoginErrors(); openModal('modalLogin'); }
function cerrarModal()    { closeModal('modalLogin'); }
function abrirRegistro()  { cerrarModal(); openModal('modalRegistro'); }
function cerrarRegistro() { closeModal('modalRegistro'); }
function irALogin()       { cerrarRegistro(); abrirModal(); }

// ==========================
// VALIDACIONES
// ==========================

function isValidEmail(email) {
  return email && email.toLowerCase().includes('@gmail.com');
}

function isValidPassword(password) {
  return password && password.length >= 8;
}

function resetLoginErrors() {
  const emailError = document.getElementById('loginEmailError');
  const passError  = document.getElementById('loginPassError');
  if (emailError) emailError.style.display = 'none';
  if (passError)  passError.style.display  = 'none';
}

function showLoginError(type, message) {
  const target = type === 'email'
    ? document.getElementById('loginEmailError')
    : document.getElementById('loginPassError');
  if (target) {
    target.textContent   = message;
    target.style.display = 'block';
  }
}

// ==========================
// REGISTRO
// ==========================

async function simularRegistro() {
  const emailInput    = document.getElementById('regEmail');
  const passwordInput = document.getElementById('regPassword');
  if (!emailInput || !passwordInput) return;

  const email    = emailInput.value.trim();
  const password = passwordInput.value.trim();

  if (!email || !password) {
    alert('Completa todos los campos');
    return;
  }
  if (!isValidEmail(email)) {
    alert('Debe ser un correo @gmail.com');
    return;
  }
  if (!isValidPassword(password)) {
    alert('La contraseña debe tener mínimo 8 caracteres');
    return;
  }

  try {
    const response = await fetch(`${API_URL}/registro.php`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ email, password })
    });

    const data = await response.json();

    if (response.ok) {
      alert('Registro exitoso. Ahora ingresa con tu cuenta.');
      emailInput.value    = '';
      passwordInput.value = '';
      cerrarRegistro();
      abrirModal();
    } else {
      alert(data.error || 'Error al registrar');
    }

  } catch (error) {
    console.error('ERROR REGISTRO:', error);
    alert('No se pudo conectar con el servidor. Verifica que XAMPP esté activo.');
  }
}

// ==========================
// LOGIN
// ==========================

async function simularLogin() {
  const emailInput    = document.getElementById('loginEmail');
  const passwordInput = document.getElementById('loginPassword');
  if (!emailInput || !passwordInput) return;

  const email    = emailInput.value.trim();
  const password = passwordInput.value.trim();

  resetLoginErrors();

  if (!email) { showLoginError('email', 'Ingresa tu correo @gmail.com'); return; }
  if (!password) { showLoginError('password', 'Ingresa tu contraseña'); return; }
  if (!isValidEmail(email)) { showLoginError('email', 'El correo debe contener "@gmail.com"'); return; }
  if (!isValidPassword(password)) { showLoginError('password', 'Mínimo 8 caracteres'); return; }

  try {
    const response = await fetch(`${API_URL}/login.php`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ email, password })
    });

    const data = await response.json();

    if (response.ok) {
      localStorage.setItem(STORAGE_SESSION_KEY, 'activa');
      saveCurrentUserEmail(email);
      localStorage.setItem(STORAGE_USERNAME_KEY, data.username || '');
      localStorage.setItem(STORAGE_FOTO_KEY,     data.foto_url || '');

      emailInput.value    = '';
      passwordInput.value = '';

      cerrarModal();
      actualizarEstadoUsuario();

      const fromMisListas   = new URLSearchParams(window.location.search).get('from') === 'mislistas';
      const isMisListasPage = window.location.pathname.endsWith('mis-listas.html');

      if (fromMisListas || isMisListasPage) {
        window.location.href = 'mis-listas.html';
      } else {
        location.reload();
      }

    } else {
      const msg = data.error || 'Correo o contraseña incorrectos';
      if (msg.toLowerCase().includes('registr') || msg.toLowerCase().includes('existe')) {
        showLoginError('email', msg);
      } else {
        showLoginError('password', msg);
      }
    }

  } catch (error) {
    console.error('ERROR LOGIN:', error);
    alert('No se pudo conectar con el servidor. Verifica que XAMPP esté activo.');
  }
}

// ==========================
// ESTADO USUARIO EN HEADER
// ==========================

function actualizarEstadoUsuario() {
  const sessionActive = isSessionActive();
  const email         = getCurrentUserEmail();
  const username      = localStorage.getItem(STORAGE_USERNAME_KEY);
  const foto          = localStorage.getItem(STORAGE_FOTO_KEY);
  const btnIngresar   = document.getElementById('btnIngresar');

  if (sessionActive && email) {
    const nombre = username || email.split('@')[0];

    if (btnIngresar) {
      // Mostrar nombre/foto y al hacer clic → logout
      if (foto) {
        btnIngresar.innerHTML = `
          <img src="${foto}" alt="Perfil"
               style="width:28px;height:28px;border-radius:50%;
                      object-fit:cover;margin-right:6px;vertical-align:middle;">
          ${nombre}`;
      } else {
        btnIngresar.textContent = nombre;
      }
      // CORRECCIÓN: onclick siempre es logout cuando hay sesión
      btnIngresar.onclick = (e) => { e.preventDefault(); logout(); };
    }

    // Mostrar link Mis Listas
    const linkMisListas = document.getElementById('linkMisListas');
    if (linkMisListas) linkMisListas.style.display = '';

    // Página ajustes: rellenar campos
    const ajustesEmail = document.getElementById('ajustes-email');
    if (ajustesEmail) {
      ajustesEmail.value = email;
      const ajustesUsername = document.getElementById('ajustes-username');
      const ajustesFoto     = document.getElementById('ajustes-foto-url');
      const ajustesInicial  = document.getElementById('ajustes-inicial');
      if (ajustesUsername) ajustesUsername.value = username || '';
      if (ajustesFoto)     ajustesFoto.value     = foto    || '';
      if (ajustesInicial)  ajustesInicial.textContent = (username || email)[0].toUpperCase();
    }

    // Página ajustes: mostrar sección
    const ajustesCuenta = document.getElementById('ajustes-cuenta');
    const ajustesTitulo = document.getElementById('ajustes-titulo');
    const noSesionView  = document.getElementById('noSesionView');
    if (ajustesCuenta) ajustesCuenta.style.display = 'flex';
    if (ajustesTitulo) ajustesTitulo.style.display  = 'block';
    if (noSesionView)  noSesionView.style.display   = 'none';

    // Refrescar mis listas si estamos en esa página
    if (window.location.pathname.endsWith('mis-listas.html') && typeof renderizarMisListas === 'function') {
      renderizarMisListas();
    }

  } else {
    if (btnIngresar) {
      btnIngresar.textContent = 'Ingresar';
      btnIngresar.onclick     = (e) => { e.preventDefault(); abrirModal(); };
    }

    const ajustesCuenta = document.getElementById('ajustes-cuenta');
    const ajustesTitulo = document.getElementById('ajustes-titulo');
    const noSesionView  = document.getElementById('noSesionView');
    if (ajustesCuenta) ajustesCuenta.style.display = 'none';
    if (ajustesTitulo) ajustesTitulo.style.display  = 'none';
    if (noSesionView)  noSesionView.style.display   = 'flex';
  }
}

// ==========================
// PROTEGER MIS LISTAS
// ==========================

function verificarProteccionPagina() {
  if (!window.location.pathname.endsWith('mis-listas.html')) return;

  const sessionActive = isSessionActive();
  const notice        = document.getElementById('misListasAuthNotice');
  const tabs          = document.querySelector('.listas-tabs');
  const tabContents   = document.querySelectorAll('.tab-content');

  if (!notice || !tabs) return;

  if (sessionActive) {
    notice.style.display = 'none';
    tabs.style.display   = 'flex';
    tabContents.forEach((c, i) => {
      c.style.display = i === 0 ? 'block' : 'none';
    });
  } else {
    notice.style.display = 'flex';
    tabs.style.display   = 'none';
    tabContents.forEach(c => c.style.display = 'none');
  }
}

// ==========================
// GUARDAR AJUSTES DE PERFIL
// ==========================

async function guardarAjustesPerfil() {
  const email    = getCurrentUserEmail();
  const username = document.getElementById('ajustes-username')?.value.trim() || '';
  const foto_url = document.getElementById('ajustes-foto-url')?.value.trim() || '';
  const password = document.getElementById('ajustes-password')?.value.trim() || '';

  if (!email) { alert('No hay sesión activa'); return; }

  try {
    const response = await fetch(`${API_URL}/perfil.php`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ email, username, foto_url, password })
    });

    const data = await response.json();

    if (response.ok) {
      localStorage.setItem(STORAGE_USERNAME_KEY, username);
      localStorage.setItem(STORAGE_FOTO_KEY,     foto_url);

      const passField = document.getElementById('ajustes-password');
      if (passField) passField.value = '';

      const aviso = document.getElementById('ajustes-aviso');
      if (aviso) {
        aviso.style.display = 'flex';
        setTimeout(() => aviso.style.display = 'none', 3000);
      }

      actualizarEstadoUsuario();
    } else {
      alert(data.error || 'Error al guardar cambios');
    }

  } catch (error) {
    console.error('ERROR PERFIL:', error);
    alert('No se pudo conectar con el servidor. Verifica que XAMPP esté activo.');
  }
}

// ==========================
// EVENTOS
// ==========================

function setupEventListeners() {
  const loginEmail    = document.getElementById('loginEmail');
  const loginPassword = document.getElementById('loginPassword');

  if (loginEmail) {
    loginEmail.addEventListener('keypress', e => {
      if (e.key === 'Enter') simularLogin();
    });
  }
  if (loginPassword) {
    loginPassword.addEventListener('keypress', e => {
      if (e.key === 'Enter') simularLogin();
    });
  }

  const btnGuardar = document.getElementById('btnGuardarAjustes');
  if (btnGuardar) btnGuardar.addEventListener('click', guardarAjustesPerfil);

  const btnCerrarSesion = document.getElementById('btnCerrarSesionAjustes');
  if (btnCerrarSesion) btnCerrarSesion.addEventListener('click', logout);

  const btnLoginDesdeMisListas = document.getElementById('btnLoginDesdeMisListas');
  if (btnLoginDesdeMisListas) btnLoginDesdeMisListas.addEventListener('click', abrirModal);
}

// ==========================
// INIT
// ==========================

function initAuth() {
  verificarProteccionPagina();
  setupEventListeners();
  actualizarEstadoUsuario();
}

document.addEventListener('DOMContentLoaded', initAuth);