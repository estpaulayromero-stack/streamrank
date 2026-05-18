// ======================================================
// STREAMRANK AUTH + BASE DE DATOS REAL (FLASK + SQLITE)
// ======================================================

// ==========================
// CONFIG API
// ==========================

const API_URL = "http://127.0.0.1:5000";

// ==========================
// STORAGE
// ==========================

const STORAGE_SESSION_KEY = 'streamrank_session';
const STORAGE_CURRENT_EMAIL_KEY = 'streamrank_currentEmail';

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

// ==========================
// VALIDACIONES
// ==========================

function isValidEmail(email) {

  return email && email.includes('@gmail');
}

function isValidPassword(password) {

  return password && password.length >= 8;
}

// ==========================
// REGISTRO REAL
// ==========================

async function simularRegistro() {

  const emailInput = document.getElementById('regEmail');
  const passwordInput = document.getElementById('regPassword');

  if (!emailInput || !passwordInput) return;

  const email = emailInput.value.trim();
  const password = passwordInput.value.trim();

  // VALIDACIONES

  if (!email || !password) {

    alert('Completa todos los campos');

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

  try {

    const response = await fetch(`${API_URL}/registro`, {

      method: 'POST',

      headers: {
        'Content-Type': 'application/json'
      },

      body: JSON.stringify({
        email: email,
        password: password
      })

    });

    const data = await response.json();

    if (response.ok) {

      alert('Registro exitoso');

      cerrarRegistro();

      abrirModal();

    } else {

      alert(data.error || 'Error al registrar');

    }

  } catch (error) {

    console.error('ERROR REGISTRO:', error);

    alert('No se pudo conectar con el servidor Flask');

  }
}

// ==========================
// LOGIN REAL
// ==========================

async function simularLogin() {

  const emailInput = document.getElementById('loginEmail');
  const passwordInput = document.getElementById('loginPassword');

  if (!emailInput || !passwordInput) return;

  const email = emailInput.value.trim();
  const password = passwordInput.value.trim();

  if (!email || !password) {

    alert('Completa todos los campos');

    return;
  }

  try {

    const response = await fetch(`${API_URL}/login`, {

      method: 'POST',

      headers: {
        'Content-Type': 'application/json'
      },

      body: JSON.stringify({
        email: email,
        password: password
      })

    });

    const data = await response.json();

    if (response.ok) {

      // GUARDAR SESIÓN

      localStorage.setItem(STORAGE_SESSION_KEY, 'activa');

      saveCurrentUserEmail(email);

      alert('Login exitoso');

      cerrarModal();

      actualizarEstadoUsuario();

      // REDIRECCIÓN

      const fromMisListas =
        new URLSearchParams(window.location.search).get('from') === 'mislistas';

      if (fromMisListas) {

        window.location.href = 'mis-listas.html';

      } else {

        window.location.href = 'index.html';

      }

    } else {

      alert(data.error || 'Correo o contraseña incorrectos');

    }

  } catch (error) {

    console.error('ERROR LOGIN:', error);

    alert('No se pudo conectar con el servidor Flask');

  }
}

// ==========================
// ESTADO USUARIO
// ==========================

function actualizarEstadoUsuario() {

  const sessionActive =
    localStorage.getItem(STORAGE_SESSION_KEY) === 'activa';

  const email = getCurrentUserEmail();

  const btnIngresar = document.getElementById('btnIngresar');

  if (sessionActive && email) {

    if (btnIngresar) {

      btnIngresar.textContent = email;

      btnIngresar.onclick = logout;
    }

  } else {

    if (btnIngresar) {

      btnIngresar.textContent = 'Ingresar';

      btnIngresar.onclick = abrirModal;
    }
  }
}

// ==========================
// PROTEGER PÁGINAS
// ==========================

function verificarProteccionPagina() {

  const necesitaProteccion =
    window.location.pathname.endsWith('mis-listas.html');

  const sessionActive =
    localStorage.getItem(STORAGE_SESSION_KEY) === 'activa';

  if (necesitaProteccion && !sessionActive) {

    window.location.href = 'registro.html?from=mislistas';
  }
}

// ==========================
// EVENTOS
// ==========================

function setupEventListeners() {

  const loginEmail = document.getElementById('loginEmail');
  const loginPassword = document.getElementById('loginPassword');

  if (loginEmail) {

    loginEmail.addEventListener('keypress', function(e) {

      if (e.key === 'Enter') {

        simularLogin();
      }
    });
  }

  if (loginPassword) {

    loginPassword.addEventListener('keypress', function(e) {

      if (e.key === 'Enter') {

        simularLogin();
      }
    });
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