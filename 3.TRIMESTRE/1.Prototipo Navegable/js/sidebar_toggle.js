// SIDEBAR-TOGGLE.JS — Botón para ocultar/mostrar el menú lateral
//
// Este mismo archivo funciona en Admin, Operador, Cliente y Técnico:
// busca el sidebar/topbar por las distintas clases que usa cada rol
// (.sidebar / .cl-sidebar, .topbar / .cl-topbar), así que no hace
// falta tocar nada según la página donde se incluya.
//
// Guarda la preferencia del usuario (oculto o visible) en localStorage,
// así que se mantiene aunque recargue la página o cierre el navegador.

const PS3D_CLAVE_SIDEBAR = "ps3d_sidebar_oculto";

let ps3dSidebar      = null;
let ps3dTopbar       = null;
let ps3dBoton        = null;
let ps3dAnchoSidebar = null; // se mide una sola vez, mientras está visible

window.addEventListener("DOMContentLoaded", inicializarToggleSidebar);
window.addEventListener("resize", posicionarBotonToggle);

function inicializarToggleSidebar() {
  ps3dSidebar = document.querySelector(".sidebar, .cl-sidebar");
  if (!ps3dSidebar) return; // Esta página no tiene sidebar (ej. index.html)

  ps3dTopbar = document.querySelector(".topbar, .cl-topbar");

  crearBotonToggleSidebar();

  // Restaurar la preferencia guardada por el usuario
  const ocultoGuardado = localStorage.getItem(PS3D_CLAVE_SIDEBAR) === "1";
  aplicarEstadoSidebar(ocultoGuardado);
}

function crearBotonToggleSidebar() {
  ps3dBoton = document.createElement("button");
  ps3dBoton.type = "button";
  ps3dBoton.id = "btnToggleSidebar";
  ps3dBoton.className = "btn-toggle-sidebar";
  ps3dBoton.title = "Ocultar/mostrar menú";
  ps3dBoton.setAttribute("aria-label", "Ocultar o mostrar el menú lateral");
  ps3dBoton.innerHTML = '<i class="bi bi-chevron-left"></i>';
  ps3dBoton.onclick = toggleSidebar;
  document.body.appendChild(ps3dBoton);
}

// Función global (por si alguna vez se quiere disparar desde otro botón,
// por ejemplo uno dentro del propio topbar de un rol)
function toggleSidebar() {
  const ocultoActual = document.body.classList.contains("sidebar-oculto");
  aplicarEstadoSidebar(!ocultoActual);
}

function aplicarEstadoSidebar(ocultar) {
  document.body.classList.toggle("sidebar-oculto", ocultar);
  localStorage.setItem(PS3D_CLAVE_SIDEBAR, ocultar ? "1" : "0");

  // Si el sidebar de este rol NO usa position fixed/absolute/sticky,
  // ocultarlo solo con transform dejaría un hueco en blanco (el
  // transform no libera el espacio reservado en el flujo normal).
  // En ese caso lo ocultamos también con display.
  const posicion   = getComputedStyle(ps3dSidebar).position;
  const esFlotante = posicion === "fixed" || posicion === "absolute" || posicion === "sticky";
  if (!esFlotante) {
    ps3dSidebar.style.display = ocultar ? "none" : "";
  }

  if (ps3dBoton) {
    ps3dBoton.innerHTML = ocultar
      ? '<i class="bi bi-chevron-right"></i>'
      : '<i class="bi bi-chevron-left"></i>';
  }

  requestAnimationFrame(posicionarBotonToggle);
}

function posicionarBotonToggle() {
  if (!ps3dBoton || !ps3dSidebar) return;

  const oculto = document.body.classList.contains("sidebar-oculto");

  // El ancho real del sidebar sólo se puede medir mientras está visible
  if (!oculto) {
    ps3dAnchoSidebar = ps3dSidebar.getBoundingClientRect().width;
  }

  ps3dBoton.style.left = (oculto ? 0 : (ps3dAnchoSidebar || 260)) + "px";

  if (ps3dTopbar) {
    const rect = ps3dTopbar.getBoundingClientRect();
    ps3dBoton.style.top = (rect.top + rect.height / 2) + "px";
  } else {
    ps3dBoton.style.top = "32px";
  }
}