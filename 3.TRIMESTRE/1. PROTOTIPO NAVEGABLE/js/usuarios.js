
// USUARIOS.JS — Filtros y gestión de usuarios


// Filtrar la lista de usuarios por rol
function filtrarUsuarios(filtro, tabEl) {
  // Actualizar tab activo
  document.querySelectorAll(".tab-filtro").forEach(t => t.classList.remove("activo"));
  tabEl.classList.add("activo");

  // Mostrar u ocultar filas según el filtro
  const filas = document.querySelectorAll("#listaUsuarios [data-rol]");

  filas.forEach(fila => {
    if (filtro === "all") {
      fila.style.display = "grid"; // Mostrar todas
    } else {
      // Mostrar solo las que coinciden con el filtro
      fila.style.display = (fila.dataset.rol === filtro) ? "grid" : "none";
    }
  });
}