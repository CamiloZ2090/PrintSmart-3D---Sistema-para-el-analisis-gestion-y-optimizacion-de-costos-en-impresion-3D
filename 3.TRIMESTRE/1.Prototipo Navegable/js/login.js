
// LOGIN.JS — Landing + Modal + Recuperación
// PrintSmart 3D · ML Mecanizados SAS

const rolesDisponibles = {
  Admin:    true,
  Operador: true,
  Cliente:  true
};

const datosRol = {
  Admin: {
    desc: "Acceso total: usuarios, configuración, reportes financieros y control de toda la operación.",
    descBloqueado: null
  },
  Operador: {
    desc: "Gestión de cola de impresión, inventario de materiales y mantenimiento técnico.",
    descBloqueado: "El panel de Operario está en desarrollo. Estará disponible pronto."
  },
  Cliente: {
    desc: "Registra tu cuenta para hacer pedidos, ver cotizaciones y seguimiento en tiempo real.",
    descBloqueado: null
  }
};

let rolModalActual      = "Admin";
let productoActual      = null;
let codigoRecuperacion  = null;

// NAVBAR — scroll + link activo
window.addEventListener("scroll", () => {
  const nav = document.getElementById("lnav");
  if (nav) nav.classList.toggle("scrolled", window.scrollY > 50);
});

window.addEventListener("scroll", () => {
  const secciones = document.querySelectorAll("section[id]");
  let actual = "";
  secciones.forEach(sec => {
    if (window.scrollY >= sec.offsetTop - 120) actual = sec.getAttribute("id");
  });
  document.querySelectorAll(".lnav-links a").forEach(a => {
    a.classList.remove("lnav-active");
    if (a.getAttribute("href") === "#" + actual) a.classList.add("lnav-active");
  });
});

// DOM LISTO
document.addEventListener("DOMContentLoaded", () => {
  // Fade-up observer
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) e.target.classList.add("visible"); });
  }, { threshold: 0.12 });
  document.querySelectorAll(".fade-up").forEach(el => obs.observe(el));

  // Tab Admin activo por defecto
  const tabAdmin = document.getElementById("tab-Admin");
  if (tabAdmin) tabAdmin.classList.add("activo");

  // Inyectar HTML de recuperación en el modal
  _inyectarRecuperacion();
});

// MODAL — ABRIR / CERRAR
function abrirModal(rol) {
  const ov = document.getElementById("modalOv");
  if (!ov) return;
  ov.classList.add("abierto");
  document.body.style.overflow = "hidden";
  const tabEl = document.getElementById("tab-" + rol);
  selectModalRol(rol, tabEl);
}

function cerrarModal() {
  const ov = document.getElementById("modalOv");
  if (!ov) return;
  ov.classList.remove("abierto");
  document.body.style.overflow = "";
  productoActual = null;
  _mostrarSeccion("secLogin");
  _restaurarTabsYRol();
  limpiarFormularios();
}

function cerrarModalClick(event) {
  if (event.target === document.getElementById("modalOv")) cerrarModal();
}

document.addEventListener("keydown", e => {
  if (e.key === "Escape") cerrarModal();
});

// MODAL — SELECCIONAR ROL
function selectModalRol(rol, tabEl) {
  rolModalActual = rol;

  document.querySelectorAll(".mtab").forEach(t => t.classList.remove("activo"));
  if (tabEl) tabEl.classList.add("activo");

  const rolBox  = document.getElementById("mRolBox");
  const rolIco  = document.getElementById("mRolIcono");
  const rolTxt  = document.getElementById("mRolTexto");
  const titulo  = document.getElementById("mTitulo");
  const subtit  = document.getElementById("mSubtitulo");
  const errLog  = document.getElementById("mErr");

  if (errLog) errLog.style.display = "none";

  if (rol === "Cliente") {
    _mostrarSeccion("secLogin");
    titulo.textContent  = "Bienvenido, Cliente";
    subtit.textContent  = "Inicia sesión en tu cuenta";
    rolBox.classList.remove("bloqueado");
    rolIco.className = "bi bi-person-check";
    rolTxt.textContent = datosRol.Cliente.desc;
    const btn = document.getElementById("btnLogin");
    if (btn) {
      btn.disabled = false;
      btn.innerHTML = 'Iniciar Sesión &nbsp;<i class="bi bi-arrow-right"></i>';
    }

  } else if (!rolesDisponibles[rol]) {
    _mostrarSeccion("secLogin");
    titulo.textContent = "PrintSmart 3D";
    subtit.textContent = "Selecciona tu perfil de acceso";
    rolBox.classList.add("bloqueado");
    rolIco.className = "bi bi-lock-fill";
    rolTxt.textContent = datosRol[rol].descBloqueado;
    const btn = document.getElementById("btnLogin");
    if (btn) { btn.disabled = true; btn.innerHTML = '<i class="bi bi-lock-fill"></i> Acceso No Disponible'; }

  } else {
    _mostrarSeccion("secLogin");
    titulo.textContent = "PrintSmart 3D";
    subtit.textContent = "Selecciona tu perfil de acceso";
    rolBox.classList.remove("bloqueado");
    rolIco.className = "bi bi-info-circle";
    rolTxt.textContent = datosRol[rol].desc;
    const btn = document.getElementById("btnLogin");
    if (btn) { btn.disabled = false; btn.innerHTML = 'Iniciar Sesión &nbsp;<i class="bi bi-arrow-right"></i>'; }
  }
}

// TOGGLE CONTRASEÑAS
function togglePassLogin() {
  const i = document.getElementById("mPass");
  const ico = document.getElementById("mOjoLogin");
  if (!i) return;
  i.type = i.type === "password" ? "text" : "password";
  ico.className = i.type === "password" ? "bi bi-eye" : "bi bi-eye-slash";
}

function togglePassReg() {
  const i = document.getElementById("rPass");
  const ico = document.getElementById("mOjoReg");
  if (!i) return;
  i.type = i.type === "password" ? "text" : "password";
  ico.className = i.type === "password" ? "bi bi-eye" : "bi bi-eye-slash";
}

// INICIAR SESIÓN (Admin / Operario)
function iniciarSesionModal() {
  const email = document.getElementById("mEmail")?.value.trim();
  const pass  = document.getElementById("mPass")?.value.trim();
  const mErr  = document.getElementById("mErr");
  const btn   = document.getElementById("btnLogin");

  if (!rolesDisponibles[rolModalActual]) {
    _mostrarError(mErr, "Este rol aún no está configurado.");
    return;
  }
  if (!email || !pass) {
    _mostrarError(mErr, "Completa el correo y la contraseña.");
    return;
  }

  mErr.style.display = "none";
  btn.disabled = true;
  btn.innerHTML = '<i class="bi bi-arrow-repeat spin-icon"></i>&nbsp; Ingresando...';

  setTimeout(() => {
    // Guardar sesión
    sessionStorage.setItem("rolActual", rolModalActual);
    sessionStorage.setItem("clienteEmail", email);

    // Nombre desde el email
    const partes = email.split("@")[0].split(/[._]/);
    const nombre = partes.map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(" ");
    sessionStorage.setItem("clienteNombre", nombre);

    // Redirigir según rol
    if (rolModalActual === "Cliente") {
        window.location.href = "cliente.html";
      } else if (rolModalActual === "Operador") {
        window.location.href = "operador.html";
      } else {
        window.location.href = "admin.html";
      }
  }, 900);
}

// REGISTRAR CLIENTE
function registrarCliente() {
  const nombre  = document.getElementById("rNombre")?.value.trim();
  const email   = document.getElementById("rEmail")?.value.trim();
  const pass    = document.getElementById("rPass")?.value.trim();
  const term    = document.getElementById("terminos")?.checked;
  const mErrReg = document.getElementById("mErrReg");

  if (!nombre)              { _mostrarError(mErrReg, "⚠️ Ingresa tu nombre completo."); return; }
  if (!email?.includes("@"))  { _mostrarError(mErrReg, "⚠️ Ingresa un correo válido."); return; }
  if (!pass || pass.length < 6) { _mostrarError(mErrReg, "⚠️ La contraseña debe tener al menos 6 caracteres."); return; }
  if (!term)                { _mostrarError(mErrReg, "⚠️ Acepta los términos y condiciones."); return; }

  mErrReg.style.display = "none";

  // Guardar en sessionStorage
  sessionStorage.setItem("clienteNombre", nombre);
  sessionStorage.setItem("clienteEmail", email);
  sessionStorage.setItem("rolActual", "Cliente");

  _mostrarSeccion("secExito");
  mostrarToast("✅ ¡Bienvenido, " + nombre.split(" ")[0] + "!", "success");

  // Redirigir al portal del cliente
  setTimeout(() => { window.location.href = "cliente.html"; }, 2000);
}

// RECUPERACIÓN — Paso 1: pedir email
function mostrarRecuperacion() {
  // Ocultar tabs y caja de rol
  document.querySelector(".modal-tabs").style.display = "none";
  document.getElementById("mRolBox").style.display   = "none";

  _mostrarSeccion("secRecuperar");

  document.getElementById("mTitulo").textContent  = "Recuperar contraseña";
  document.getElementById("mSubtitulo").textContent = "Te enviaremos un código a tu correo";
}

// RECUPERACIÓN — Paso 2: enviar código
function enviarCodigoRecuperacion() {
  const emailRec = document.getElementById("emailRecuperar")?.value.trim();
  const errRec   = document.getElementById("mErrRec");

  if (!emailRec?.includes("@")) {
    _mostrarError(errRec, "Ingresa un correo válido.");
    return;
  }

  // Código de 6 dígitos simulado
  codigoRecuperacion = Math.floor(100000 + Math.random() * 900000).toString();
  errRec.style.display = "none";

  mostrarToast("📧 Código enviado a " + emailRec, "info");
  setTimeout(() => mostrarToast("Código de prueba: " + codigoRecuperacion, "success"), 1200);

  // Pasar al paso 2
  document.getElementById("rec-paso1").style.display = "none";
  document.getElementById("rec-paso2").style.display = "block";
}

// RECUPERACIÓN — Paso 3: verificar código
function verificarCodigo() {
  const codigo  = document.getElementById("codigoIngresado")?.value.trim();
  const pass1   = document.getElementById("nuevaPass")?.value.trim();
  const pass2   = document.getElementById("confirmarPass")?.value.trim();
  const errRec2 = document.getElementById("mErrRec2");

  if (codigo !== codigoRecuperacion) {
    _mostrarError(errRec2, "El código es incorrecto. Revisa el toast.");
    return;
  }
  if (!pass1 || pass1.length < 6) {
    _mostrarError(errRec2, "La contraseña debe tener al menos 6 caracteres.");
    return;
  }
  if (pass1 !== pass2) {
    _mostrarError(errRec2, "Las contraseñas no coinciden.");
    return;
  }

  errRec2.style.display = "none";
  document.getElementById("rec-paso2").style.display = "none";
  document.getElementById("rec-paso3").style.display = "block";
  mostrarToast("Contraseña actualizada correctamente", "success");
}

// RECUPERACIÓN — Volver al login
function volverAlLogin() {
  _restaurarTabsYRol();
  codigoRecuperacion = null;
  _mostrarSeccion("secLogin");
  document.getElementById("mTitulo").textContent  = "PrintSmart 3D";
  document.getElementById("mSubtitulo").textContent = "Selecciona tu perfil de acceso";
  // Reset pasos
  const p1 = document.getElementById("rec-paso1");
  const p2 = document.getElementById("rec-paso2");
  const p3 = document.getElementById("rec-paso3");
  if (p1) p1.style.display = "block";
  if (p2) p2.style.display = "none";
  if (p3) p3.style.display = "none";
}

// INTERÉS EN PRODUCTO DEL CATÁLOGO
function mostrarInteres(nombreProducto) {
  productoActual = nombreProducto;
  abrirModal("Cliente");
  const box    = document.getElementById("prodInteresBox");
  const nombre = document.getElementById("prodInteresNombre");
  if (box && nombre) { nombre.textContent = nombreProducto; box.style.display = "block"; }
}

// TOASTS
function mostrarToast(mensaje, tipo = "info") {
  const c = document.getElementById("ltoastContainer");
  if (!c) return;
  const t = document.createElement("div");
  t.className = "ltoast " + tipo;
  const ico = { success: "✅", error: "❌", info: "ℹ️" };
  t.innerHTML = `<span>${ico[tipo] || "ℹ️"}</span><span>${mensaje}</span>`;
  c.appendChild(t);
  setTimeout(() => {
    t.style.opacity = "0"; t.style.transition = "opacity 0.35s";
    setTimeout(() => t.remove(), 350);
  }, 3500);
}

// HELPERS PRIVADOS
function _mostrarSeccion(idVisible) {
  ["secLogin", "secRegistro", "secExito", "secRecuperar"].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.style.display = (id === idVisible) ? "block" : "none";
  });
}

function _mostrarError(el, msg) {
  if (!el) return;
  el.textContent = msg;
  el.style.display = "block";
}

function _restaurarTabsYRol() {
  const tabs   = document.querySelector(".modal-tabs");
  const rolBox = document.getElementById("mRolBox");
  if (tabs)   tabs.style.display   = "";
  if (rolBox) rolBox.style.display = "";
  document.querySelectorAll(".mtab").forEach(t => t.classList.remove("activo"));
  const tabAdmin = document.getElementById("tab-Admin");
  if (tabAdmin) tabAdmin.classList.add("activo");
}

function limpiarFormularios() {
  ["mEmail","mPass","rNombre","rEmail","rTelefono","rPass",
   "emailRecuperar","codigoIngresado","nuevaPass","confirmarPass"
  ].forEach(id => { const el = document.getElementById(id); if (el) el.value = ""; });

  const term = document.getElementById("terminos");
  if (term) term.checked = false;

  const pbox = document.getElementById("prodInteresBox");
  if (pbox) pbox.style.display = "none";

  ["mErr","mErrReg","mErrRec","mErrRec2"].forEach(id => {
    const el = document.getElementById(id); if (el) el.style.display = "none";
  });
}

// INYECTAR HTML DE RECUPERACIÓN EN EL MODAL
// (Se agrega dinámicamente para no tocar index.html)
function _inyectarRecuperacion() {
  const modalBox = document.getElementById("modalBox");
  if (!modalBox || document.getElementById("secRecuperar")) return;

  modalBox.insertAdjacentHTML("beforeend", `
    <div id="secRecuperar" style="display:none;">

      <!-- PASO 1: Email -->
      <div id="rec-paso1">
        <div class="modal-err" id="mErrRec"></div>
        <label class="mlbl">Tu correo registrado</label>
        <div class="mfield-wrap" style="margin-bottom:18px;">
          <i class="bi bi-envelope mfield-ico"></i>
          <input type="email" class="mfield" id="emailRecuperar"
                 placeholder="tu@correo.com"/>
        </div>
        <button class="btn-modal-accion" onclick="enviarCodigoRecuperacion()">
          <i class="bi bi-send"></i> Enviar Código
        </button>
        <div class="modal-div">
          <div class="modal-div-line"></div><span>o</span><div class="modal-div-line"></div>
        </div>
        <div class="modal-link-txt">
          <span onclick="volverAlLogin()">← Volver al inicio de sesión</span>
        </div>
      </div>

      <!-- PASO 2: Código + nueva contraseña -->
      <div id="rec-paso2" style="display:none;">
        <div class="modal-err" id="mErrRec2"></div>
        <div style="background:rgba(91,33,182,0.1);border:1px solid rgba(139,92,246,0.2);
                    border-radius:10px;padding:12px 14px;margin-bottom:16px;
                    font-size:12.5px;color:#A78BFA;">
          <i class="bi bi-info-circle" style="margin-right:6px;"></i>
          Revisa el toast en pantalla — ahí aparece el código de demo.
        </div>
        <label class="mlbl">Código de 6 dígitos</label>
        <div class="mfield-wrap">
          <i class="bi bi-key mfield-ico"></i>
          <input type="text" class="mfield" id="codigoIngresado" placeholder="000000"
                 maxlength="6"
                 style="letter-spacing:8px;font-size:20px;font-weight:800;text-align:center;"/>
        </div>
        <label class="mlbl">Nueva contraseña</label>
        <div class="mfield-wrap">
          <i class="bi bi-lock mfield-ico"></i>
          <input type="password" class="mfield" id="nuevaPass" placeholder="Mínimo 6 caracteres"/>
        </div>
        <label class="mlbl">Confirmar contraseña</label>
        <div class="mfield-wrap" style="margin-bottom:18px;">
          <i class="bi bi-lock-fill mfield-ico"></i>
          <input type="password" class="mfield" id="confirmarPass" placeholder="Repite tu contraseña"/>
        </div>
        <button class="btn-modal-accion" onclick="verificarCodigo()">
          <i class="bi bi-shield-check"></i> Verificar y Cambiar Contraseña
        </button>
        <div class="modal-link-txt" style="margin-top:14px;">
          <span onclick="volverAlLogin()">← Volver al inicio de sesión</span>
        </div>
      </div>

      <!-- PASO 3: Éxito -->
      <div id="rec-paso3" style="display:none;text-align:center;padding:16px 0;">
        <div style="width:72px;height:72px;background:rgba(34,197,94,0.14);
                    border:2px solid rgba(34,197,94,0.3);border-radius:50%;
                    display:flex;align-items:center;justify-content:center;
                    font-size:32px;margin:0 auto 18px;color:#22C55E;">✓</div>
        <h3 style="color:white;font-size:18px;font-weight:800;margin-bottom:8px;">
          ¡Contraseña actualizada!
        </h3>
        <p style="color:#9D78E0;font-size:13px;margin-bottom:22px;">
          Tu contraseña ha sido cambiada exitosamente.
        </p>
        <button class="btn-modal-accion" onclick="volverAlLogin()">
          Ir al inicio de sesión
        </button>
      </div>

    </div>
  `);
}
// REGISTRO DESDE LA SECCIÓN INFERIOR

// Cierra el modal y baja al formulario de registro
function irARegistro() {
  cerrarModal();
  setTimeout(() => {
    const sec = document.getElementById("sec-registro");
    if (sec) sec.scrollIntoView({ behavior: "smooth", block: "start" });
  }, 350);
}

// Toggle contraseña del formulario inferior
function toggleRegfPass() {
  const input = document.getElementById("regfPass");
  const ico   = document.getElementById("regfOjo");
  if (!input) return;
  input.type    = input.type === "password" ? "text" : "password";
  ico.className = input.type === "password" ? "bi bi-eye" : "bi bi-eye-slash";
}

// Registrar cliente desde el formulario de la sección
function registrarClienteForm() {
  const nombre   = document.getElementById("regfNombre")?.value.trim();
  const email    = document.getElementById("regfEmail")?.value.trim();
  const pass     = document.getElementById("regfPass")?.value.trim();
  const terminos = document.getElementById("regfTerminos")?.checked;
  const mErr     = document.getElementById("regFormError");

  if (!nombre) {
    _mostrarError(mErr, "Ingresa tu nombre completo.");
    return;
  }
  if (!email?.includes("@")) {
    _mostrarError(mErr, "Ingresa un correo electrónico válido.");
    return;
  }
  if (!pass || pass.length < 6) {
    _mostrarError(mErr, "La contraseña debe tener al menos 6 caracteres.");
    return;
  }
  if (!terminos) {
    _mostrarError(mErr, "Debes aceptar los términos y condiciones.");
    return;
  }

  mErr.style.display = "none";

  // Guardar sesión
  sessionStorage.setItem("clienteNombre", nombre);
  sessionStorage.setItem("clienteEmail",  email);
  sessionStorage.setItem("rolActual",     "Cliente");

  // Cambiar botón a loading
  const btn = document.querySelector(".reg-btn");
  if (btn) {
    btn.disabled   = true;
    btn.innerHTML  = '<i class="bi bi-arrow-repeat spin-icon"></i>&nbsp; Creando cuenta...';
  }

  mostrarToast(
    "¡Cuenta creada! Bienvenido, " + nombre.split(" ")[0] + "!",
    "success"
  );

  setTimeout(() => { window.location.href = "cliente.html"; }, 1600);
}

// CSS del spinner
const spinCSS = document.createElement("style");
spinCSS.textContent = `
  .spin-icon { display:inline-block; animation:spin .8s linear infinite; }
  @keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
`;
document.head.appendChild(spinCSS);