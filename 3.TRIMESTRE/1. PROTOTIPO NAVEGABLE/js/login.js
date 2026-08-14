
// LOGIN.JS — Lógica de inicio de sesión
// Controla qué roles tienen panel listo
// Cambia a true cuando configures cada rol

const rolesDisponibles = {
  Admin:    true,
  Operador: false,
  Cliente:  false
};

const datosRol = {
  Admin: {
    desc: "Acceso total: usuarios, configuración, reportes financieros y control de toda la operación.",
    descBloqueado: null
  },
  Operador: {
    desc: "Gestión de cola de impresión, inventario de materiales y mantenimiento técnico de equipos.",
    descBloqueado: "El panel de Operador está en desarrollo. Estará disponible cuando se complete su configuración."
  },
  Cliente: {
    desc: "Seguimiento de pedidos, visualización de cotizaciones y comunicación con producción.",
    descBloqueado: "El portal de Cliente está en desarrollo. Estará disponible cuando se complete su configuración."
  }
};

let rolActual = "Admin";

function selectRole(rol, boton) {
  rolActual = rol;
  const disponible = rolesDisponibles[rol];

  document.querySelectorAll(".tab-rol").forEach(b => b.classList.remove("activo"));
  boton.classList.add("activo");

  const roleDescBox  = document.querySelector(".role-desc");
  const roleDescIcon = document.getElementById("roleDescIcono");
  const roleDescText = document.getElementById("roleDescTexto");
  const formulario   = document.getElementById("formularioLogin");
  const btnLogin     = document.getElementById("btnLogin");
  const msgError     = document.getElementById("mensajeError");

  if (msgError) msgError.style.display = "none";

  if (disponible) {
    roleDescBox.classList.remove("bloqueado");
    roleDescIcon.className = "bi bi-info-circle";
    roleDescText.textContent = datosRol[rol].desc;
    formulario.classList.remove("formulario-bloqueado");
    btnLogin.disabled = false;
    btnLogin.innerHTML = 'Iniciar Sesión &nbsp;<i class="bi bi-arrow-right"></i>';
  } else {
    roleDescBox.classList.add("bloqueado");
    roleDescIcon.className = "bi bi-lock-fill";
    roleDescText.textContent = datosRol[rol].descBloqueado;
    formulario.classList.add("formulario-bloqueado");
    btnLogin.disabled = true;
    btnLogin.innerHTML = '<i class="bi bi-lock-fill"></i> &nbsp;Acceso No Disponible';
  }
}

function toggleContrasena() {
  const input = document.getElementById("passInput");
  const icono = document.getElementById("iconoOjo");
  if (input.type === "password") {
    input.type = "text";
    icono.className = "bi bi-eye-slash";
  } else {
    input.type = "password";
    icono.className = "bi bi-eye";
  }
}

function iniciarSesion() {
  const email    = document.getElementById("emailInput").value.trim();
  const pass     = document.getElementById("passInput").value.trim();
  const msgError = document.getElementById("mensajeError");

  // Bloqueo de seguridad
  if (!rolesDisponibles[rolActual]) {
    msgError.textContent = "Este rol aún no está configurado. Selecciona el rol Admin.";
    msgError.style.display = "block";
    return;
  }

  if (!email || !pass) {
    msgError.textContent = "Por favor completa el correo y la contraseña.";
    msgError.style.display = "block";
    return;
  }

  msgError.style.display = "none";
  sessionStorage.setItem("rolActual", rolActual);
  window.location.href = "admin.html";
}
