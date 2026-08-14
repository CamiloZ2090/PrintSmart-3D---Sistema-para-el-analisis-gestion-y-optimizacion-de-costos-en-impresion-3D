// LOGIN.JS — Landing page + Modal de acceso
// PrintSmart 3D · ML Mecanizados SAS

// ── Roles disponibles ──
// Cambia a true cuando configures cada panel
const rolesDisponibles = {
  Admin:    true,
  Operador: false,
  Cliente:  true
};

const datosRol = {
  Admin: {
    desc:         "Acceso total: usuarios, configuración, reportes financieros y control de toda la operación.",
    descBloqueado: null
  },
  Operador: {
    desc:         "Gestión de cola de impresión, inventario de materiales y mantenimiento técnico.",
    descBloqueado: "El panel de Operario está en desarrollo. Estará disponible pronto."
  },
  Cliente: {
    desc:         "Registra tu cuenta para hacer pedidos, ver cotizaciones y seguimiento en tiempo real.",
    descBloqueado: null
  }
};

// Variable de estado
let rolModalActual    = "Admin";
let productoActual    = null;

// NAVBAR — efecto scroll
window.addEventListener("scroll", () => {
  const nav = document.getElementById("lnav");
  if (!nav) return;
  nav.classList.toggle("scrolled", window.scrollY > 50);
});

// NAVBAR — link activo según sección visible

window.addEventListener("scroll", () => {
  const secciones = document.querySelectorAll("section[id]");
  let actual = "";

  secciones.forEach(sec => {
    if (window.scrollY >= sec.offsetTop - 120) {
      actual = sec.getAttribute("id");
    }
  });

  document.querySelectorAll(".lnav-links a").forEach(a => {
    a.classList.remove("lnav-active");
    if (a.getAttribute("href") === "#" + actual) {
      a.classList.add("lnav-active");
    }
  });
});

// ANIMACIONES FADE-UP — Intersection Observer

document.addEventListener("DOMContentLoaded", () => {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
      }
    });
  }, { threshold: 0.12 });

  document.querySelectorAll(".fade-up").forEach(el => observer.observe(el));

  // Tab Admin activo por defecto al cargar
  const tabAdmin = document.getElementById("tab-Admin");
  if (tabAdmin) tabAdmin.classList.add("activo");
});

// MODAL — ABRIR
function abrirModal(rol) {
  const ov = document.getElementById("modalOv");
  if (!ov) return;

  ov.classList.add("abierto");
  document.body.style.overflow = "hidden";

  // Seleccionar tab del rol recibido
  const tabEl = document.getElementById("tab-" + rol);
  selectModalRol(rol, tabEl);
}

// MODAL — CERRAR
function cerrarModal() {
  const ov = document.getElementById("modalOv");
  if (!ov) return;

  ov.classList.remove("abierto");
  document.body.style.overflow = "";
  productoActual = null;

  // Restaurar vistas
  _mostrarSeccion("secLogin");
  limpiarFormularios();
}

// Cierra solo si se hizo click en el fondo oscuro
function cerrarModalClick(event) {
  if (event.target === document.getElementById("modalOv")) {
    cerrarModal();
  }
}

// Cerrar con tecla ESC
document.addEventListener("keydown", e => {
  if (e.key === "Escape") cerrarModal();
});

// MODAL — SELECCIONAR ROL
function selectModalRol(rol, tabEl) {
  rolModalActual = rol;

  // Actualizar tabs visuales
  document.querySelectorAll(".mtab").forEach(t => t.classList.remove("activo"));
  if (tabEl) tabEl.classList.add("activo");

  const rolBox  = document.getElementById("mRolBox");
  const rolIco  = document.getElementById("mRolIcono");
  const rolTxt  = document.getElementById("mRolTexto");
  const titulo  = document.getElementById("mTitulo");
  const subtit  = document.getElementById("mSubtitulo");
  const errLogin = document.getElementById("mErr");

  // Ocultar errores previos
  if (errLogin) errLogin.style.display = "none";

  if (rol === "Cliente") {
    // ── Vista de registro ──
    _mostrarSeccion("secRegistro");

    titulo.textContent  = "Crear cuenta de Cliente";
    subtit.textContent  = "Accede a todo el catálogo y realiza pedidos";

    rolBox.classList.remove("bloqueado");
    rolIco.className = "bi bi-person-plus";
    rolTxt.textContent = datosRol.Cliente.desc;

  } else if (!rolesDisponibles[rol]) {
    // ── Rol bloqueado ──
    _mostrarSeccion("secLogin");

    titulo.textContent  = "PrintSmart 3D";
    subtit.textContent  = "Selecciona tu perfil de acceso";

    rolBox.classList.add("bloqueado");
    rolIco.className = "bi bi-lock-fill";
    rolTxt.textContent = datosRol[rol].descBloqueado;

    const btn = document.getElementById("btnLogin");
    if (btn) {
      btn.disabled = true;
      btn.innerHTML = '<i class="bi bi-lock-fill"></i> Acceso No Disponible';
    }

  } else {
    // ── Login normal (Admin) ──
    _mostrarSeccion("secLogin");

    titulo.textContent  = "PrintSmart 3D";
    subtit.textContent  = "Selecciona tu perfil de acceso";

    rolBox.classList.remove("bloqueado");
    rolIco.className = "bi bi-info-circle";
    rolTxt.textContent = datosRol[rol].desc;

    const btn = document.getElementById("btnLogin");
    if (btn) {
      btn.disabled = false;
      btn.innerHTML = 'Iniciar Sesión &nbsp;<i class="bi bi-arrow-right"></i>';
    }
  }
}

// MODAL — TOGGLE CONTRASEÑA (Login)
function togglePassLogin() {
  const input = document.getElementById("mPass");
  const ico   = document.getElementById("mOjoLogin");
  if (!input) return;
  input.type  = input.type === "password" ? "text" : "password";
  ico.className = input.type === "password" ? "bi bi-eye" : "bi bi-eye-slash";
}

// MODAL — TOGGLE CONTRASEÑA (Registro)
function togglePassReg() {
  const input = document.getElementById("rPass");
  const ico   = document.getElementById("mOjoReg");
  if (!input) return;
  input.type  = input.type === "password" ? "text" : "password";
  ico.className = input.type === "password" ? "bi bi-eye" : "bi bi-eye-slash";
}

// MODAL — INICIAR SESIÓN (Admin / Operario)
function iniciarSesionModal() {
  const email    = document.getElementById("mEmail")?.value.trim();
  const pass     = document.getElementById("mPass")?.value.trim();
  const mErr     = document.getElementById("mErr");
  const btnLogin = document.getElementById("btnLogin");

  // Verificar si el rol está disponible
  if (!rolesDisponibles[rolModalActual]) {
    _mostrarError(mErr, "🔒 Este rol aún no está configurado.");
    return;
  }

  // Validar campos
  if (!email || !pass) {
    _mostrarError(mErr, "⚠️ Por favor completa el correo y la contraseña.");
    return;
  }

  mErr.style.display = "none";

  // Loading en el botón
  btnLogin.disabled = true;
  btnLogin.innerHTML = '<i class="bi bi-arrow-repeat spin-icon"></i>&nbsp; Ingresando...';

  setTimeout(() => {
    sessionStorage.setItem("rolActual", rolModalActual);
    window.location.href = "admin.html";
  }, 900);
}

// MODAL — REGISTRAR CLIENTE

function registrarCliente() {
  const nombre   = document.getElementById("rNombre")?.value.trim();
  const email    = document.getElementById("rEmail")?.value.trim();
  const pass     = document.getElementById("rPass")?.value.trim();
  const terminos = document.getElementById("terminos")?.checked;
  const mErrReg  = document.getElementById("mErrReg");

  // Validaciones
  if (!nombre) {
    _mostrarError(mErrReg, "⚠️ Ingresa tu nombre completo.");
    return;
  }
  if (!email || !email.includes("@")) {
    _mostrarError(mErrReg, "⚠️ Ingresa un correo electrónico válido.");
    return;
  }
  if (!pass || pass.length < 6) {
    _mostrarError(mErrReg, "⚠️ La contraseña debe tener al menos 6 caracteres.");
    return;
  }
  if (!terminos) {
    _mostrarError(mErrReg, "⚠️ Debes aceptar los términos y condiciones.");
    return;
  }

  mErrReg.style.display = "none";

  // Mostrar pantalla de éxito
  _mostrarSeccion("secExito");
  mostrarToast("✅ ¡Bienvenido a PrintSmart 3D!", "success");
}

// CATÁLOGO — Mostrar interés en un producto

function mostrarInteres(nombreProducto) {
  productoActual = nombreProducto;

  // Abrir modal en tab Cliente
  abrirModal("Cliente");

  // Mostrar el box del producto de interés
  const box    = document.getElementById("prodInteresBox");
  const nombre = document.getElementById("prodInteresNombre");
  if (box && nombre) {
    nombre.textContent = nombreProducto;
    box.style.display  = "block";
  }
}

// TOASTS — Sistema de notificaciones
function mostrarToast(mensaje, tipo = "info") {
  const contenedor = document.getElementById("ltoastContainer");
  if (!contenedor) return;

  const toast = document.createElement("div");
  toast.className = "ltoast " + tipo;

  const iconos = { success: "✅", error: "❌", info: "ℹ️" };
  toast.innerHTML = `<span>${iconos[tipo] || "ℹ️"}</span><span>${mensaje}</span>`;

  contenedor.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity    = "0";
    toast.style.transition = "opacity 0.35s";
    setTimeout(() => toast.remove(), 350);
  }, 3500);
}

// HELPERS INTERNOS
// Muestra solo una sección del modal y oculta el resto
function _mostrarSeccion(idVisible) {
  ["secLogin", "secRegistro", "secExito"].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.style.display = id === idVisible ? "block" : "none";
  });
}

// Muestra un mensaje de error en un contenedor dado
function _mostrarError(el, mensaje) {
  if (!el) return;
  el.textContent    = mensaje;
  el.style.display  = "block";
}

// Limpia todos los campos del formulario
function limpiarFormularios() {
  ["mEmail", "mPass", "rNombre", "rEmail", "rTelefono", "rPass"].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = "";
  });
  const terminos = document.getElementById("terminos");
  if (terminos) terminos.checked = false;

  const prodBox = document.getElementById("prodInteresBox");
  if (prodBox) prodBox.style.display = "none";

  ["mErr", "mErrReg"].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.style.display = "none";
  });
}

// Animación de spin para el botón de carga
const spinCSS = document.createElement("style");
spinCSS.textContent = `
  .spin-icon {
    display: inline-block;
    animation: spin 0.8s linear infinite;
  }
  @keyframes spin {
    from { transform: rotate(0deg); }
    to   { transform: rotate(360deg); }
  }
`;
document.head.appendChild(spinCSS);