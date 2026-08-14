
// MATERIALES.JS — Formulario de materiales

// Sincronizar el selector de color con el campo de texto
document.addEventListener("DOMContentLoaded", () => {
  const colorPicker = document.getElementById("matColor");
  const colorHex    = document.getElementById("matColorHex");

  if (colorPicker && colorHex) {
    // Al mover el picker → actualizar el campo de texto
    colorPicker.addEventListener("input", (e) => {
      colorHex.value = e.target.value;
    });
    // Al escribir en el campo → actualizar el picker
    colorHex.addEventListener("input", (e) => {
      const val = e.target.value;
      if (/^#[0-9A-Fa-f]{6}$/.test(val)) {
        colorPicker.value = val;
      }
    });
  }
});

// Guardar material (simulado)
function guardarMaterial() {
  const nombre    = document.getElementById("matNombre").value.trim();
  const proveedor = document.getElementById("matProveedor").value.trim();
  const precio    = document.getElementById("matPrecio").value;

  // Validación
  if (!nombre) {
    mostrarToast("El nombre del material es obligatorio", "error");
    return;
  }

  // Simular guardado exitoso
  mostrarToast(`Material "${nombre}" guardado correctamente`, "success");
  limpiarFormMaterial();
}

// Limpiar el formulario
function limpiarFormMaterial() {
  document.getElementById("matNombre").value    = "";
  document.getElementById("matProveedor").value = "";
  document.getElementById("matPeso").value      = "1.0";
  document.getElementById("matPrecio").value    = "24.90";
  document.getElementById("matRepedido").value  = "2.0";
  document.getElementById("matColor").value     = "#500088";
  document.getElementById("matColorHex").value  = "#500088";
}