// ============================================================
//  STREAMRANK — auth.js
//  Backend: PHP/XAMPP + MariaDB
// ============================================================

// ==========================
// CONFIG API
// ==========================

const API_URL = "http://localhost/streamrank/api";

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
  return localStorage.getItem(STORAGE_SESSION_KEY) === 'activa' || !!getCurrentUserEmail();
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
  if (emailError) {
    emailError.style.display = 'none';
    emailError.textContent = 'El correo debe contener "@gmail.com"';
  }
  if (passError) {
    passError.style.display = 'none';
    passError.textContent = 'La contraseña debe tener mínimo 8 caracteres';
  }
}

function showLoginError(type, message) {
  const target = type === 'email'
    ? document.getElementById('loginEmailError')
    : document.getElementById('loginPassError');
  if (target) {
    target.textContent = message;
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

  if (!email || !password) {
    if (!email) showLoginError('email', 'Ingresa tu correo @gmail.com');
    if (!password) showLoginError('password', 'Ingresa tu contraseña de al menos 8 caracteres');
    return;
  }

  if (!isValidEmail(email)) {
    showLoginError('email', 'El correo debe contener "@gmail.com"');
    return;
  }

  if (!isValidPassword(password)) {
    showLoginError('password', 'La contraseña debe tener mínimo 8 caracteres');
    return;
  }

  try {
    const response = await fetch(`${API_URL}/login.php`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ email, password })
    });

    const data = await response.json();

    if (response.ok) {
      // Guardar sesión en localStorage
      localStorage.setItem(STORAGE_SESSION_KEY, 'activa');
      saveCurrentUserEmail(email);
      localStorage.setItem(STORAGE_USERNAME_KEY, data.username || '');
      localStorage.setItem(STORAGE_FOTO_KEY,     data.foto_url || '');

      emailInput.value    = '';
      passwordInput.value = '';

      cerrarModal();
      actualizarEstadoUsuario();

      // Redirección
      const fromMisListas =
        new URLSearchParams(window.location.search).get('from') === 'mislistas';

      if (fromMisListas) {
        window.location.href = 'mis-listas.html';
      } else {
        location.reload();
      }

    } else {
      const errorMessage = data.error || 'Correo o contraseña incorrectos';
      if (errorMessage.toLowerCase().includes('registr')) {
        showLoginError('email', errorMessage);
      } else {
        showLoginError('password', errorMessage);
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
      if (foto) {
        btnIngresar.innerHTML = `
          <img src="${foto}" alt="Perfil"
               style="width:28px;height:28px;border-radius:50%;
                      object-fit:cover;margin-right:6px;vertical-align:middle;">
          ${nombre}`;
      } else {
        btnIngresar.textContent = nombre;
      }
      if (window.location.pathname.endsWith('registro.html')) {
        btnIngresar.onclick = () => window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        btnIngresar.onclick = () => window.location.href = 'registro.html';
      }
    }

    // Mostrar link Mis Listas si estaba oculto
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
      if (ajustesFoto)     ajustesFoto.value     = foto || '';
      if (ajustesInicial)  ajustesInicial.textContent =
        (username || email)[0].toUpperCase();
    }

    // Página ajustes: mostrar sección
    const ajustesCuenta = document.getElementById('ajustes-cuenta');
    const ajustesTitulo = document.getElementById('ajustes-titulo');
    const noSesionView  = document.getElementById('noSesionView');
    if (ajustesCuenta) ajustesCuenta.style.display = 'flex';
    if (ajustesTitulo) ajustesTitulo.style.display  = 'block';
    if (noSesionView)  noSesionView.style.display   = 'none';

    // Refrescar mis listas si estamos en la página correspondiente
    if (window.location.pathname.endsWith('mis-listas.html') && typeof renderizarMisListas === 'function') {
      renderizarMisListas();
    }

  } else {
    if (btnIngresar) {
      btnIngresar.textContent = 'Ingresar';
      btnIngresar.onclick     = abrirModal;
    }

    // Página ajustes: mostrar aviso sin sesión
    const ajustesCuenta = document.getElementById('ajustes-cuenta');
    const ajustesTitulo = document.getElementById('ajustes-titulo');
    const noSesionView  = document.getElementById('noSesionView');
    if (ajustesCuenta) ajustesCuenta.style.display = 'none';
    if (ajustesTitulo) ajustesTitulo.style.display  = 'none';
    if (noSesionView)  noSesionView.style.display   = 'flex';
  }
}

// ==========================
// PROTEGER PÁGINAS
// ==========================

function verificarProteccionPagina() {
  const necesitaProteccion = window.location.pathname.endsWith('mis-listas.html');
  const sessionActive      = isSessionActive();

  if (necesitaProteccion && !sessionActive) {
    window.location.href = 'index.html?from=mislistas';
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

  if (!email) {
    alert('No hay sesión activa');
    return;
  }

  try {
    const response = await fetch(`${API_URL}/perfil.php`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ email, username, foto_url, password })
    });

    const data = await response.json();

    if (response.ok) {
      // Actualizar localStorage con nuevos datos
      localStorage.setItem(STORAGE_USERNAME_KEY, username);
      localStorage.setItem(STORAGE_FOTO_KEY,     foto_url);

      // Limpiar campo contraseña
      const passField = document.getElementById('ajustes-password');
      if (passField) passField.value = '';

      // Mostrar aviso de éxito
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
// EVENTOS TECLADO Y BOTONES
// ==========================

function setupEventListeners() {
  // Enter en campos de login
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

  // Botón guardar ajustes de perfil
  const btnGuardar = document.getElementById('btnGuardarAjustes');
  if (btnGuardar) {
    btnGuardar.addEventListener('click', guardarAjustesPerfil);
  }

  // Botón cerrar sesión en página de ajustes
  const btnCerrarSesion = document.getElementById('btnCerrarSesionAjustes');
  if (btnCerrarSesion) {
    btnCerrarSesion.addEventListener('click', logout);
  }
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