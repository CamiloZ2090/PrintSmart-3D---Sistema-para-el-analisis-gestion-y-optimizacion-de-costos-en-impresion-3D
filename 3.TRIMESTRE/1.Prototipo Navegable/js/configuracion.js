
// CONFIGURACION.JS — Ajustes del sistema


// Toggle especial para el Modo Mantenimiento
function alternarMantenimiento(el) {
  el.classList.toggle("on");
  const activado = el.classList.contains("on");

  if (activado) {
    mostrarToast("🔧 Modo Mantenimiento ACTIVADO — usuarios no-admin serán redirigidos", "error");
  } else {
    mostrarToast("✅ Sistema accesible para todos los usuarios", "success");
  }
}