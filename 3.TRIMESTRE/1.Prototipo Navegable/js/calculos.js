
// CALCULOS.JS — Calculadora de costos

// Variables internas
let alturaCapa = "0.10";

// Actualizar el valor del slider de densidad
function actualizarDensidad(valor) {
  document.getElementById("lblDensidad").textContent = valor + "%";
  calcularCosto();
}

// Seleccionar altura de capa (botones 0.05 / 0.10 / 0.20)
function setAlturaCapa(valor, boton) {
  alturaCapa = valor;

  // Quitar 'activo' de todos los botones
  document.querySelectorAll(".btn-toggle").forEach(b => b.classList.remove("activo"));
  boton.classList.add("activo");

  calcularCosto();
}

// Recalcular el costo total según los parámetros
function calcularCosto() {
  // Leer valores de los controles
  const precioPorG  = parseFloat(document.getElementById("calcMaterial").value) || 0.42;
  const densidad    = parseInt(document.getElementById("sliderDensidad").value) || 45;
  const horasMobra  = parseFloat(document.getElementById("horasMobra").value) || 0;

  // Cálculos
  const gramajeBase    = 124.5;
  const gramajeAjust   = gramajeBase * (densidad / 45);
  const costeMaterial  = (gramajeAjust * precioPorG).toFixed(2);
  const costeMaquina   = 18.50;
  const costeElec      = 3.12;
  const costeMobra     = (horasMobra * 35).toFixed(2);

  const subtotal = parseFloat(costeMaterial) + costeMaquina + costeElec + parseFloat(costeMobra);
  const margen   = (subtotal * 0.25).toFixed(2);
  const total    = (subtotal + parseFloat(margen)).toFixed(2);

  // Actualizar la interfaz
  document.getElementById("valMaterial").textContent = "$" + parseFloat(costeMaterial).toFixed(2);
  document.getElementById("subMaterial").textContent = Math.round(gramajeAjust) + "g @ $" + precioPorG.toFixed(2) + "/g";
  document.getElementById("valMobra").textContent    = "$" + parseFloat(costeMobra).toFixed(2);
  document.getElementById("subMobra").textContent    = horasMobra + "h Nivel Técnico 2";
  document.getElementById("valMargen").textContent   = "+$" + margen;
  document.getElementById("valorTotal").textContent  = "$" + total;
}

// Simular carga de un archivo STL
function cargarArchivoSTL(input) {
  const archivo = input.files[0];
  if (!archivo) return;

  // Validar que sea .stl
  if (!archivo.name.toLowerCase().endsWith(".stl")) {
    mostrarToast("Solo se permiten archivos .STL", "error");
    return;
  }

  // Validar tamaño máximo (500MB)
  const tamañoMB = (archivo.size / (1024 * 1024)).toFixed(2);
  if (tamañoMB > 500) {
    mostrarToast("El archivo supera los 500MB", "error");
    return;
  }

  mostrarToast("📁 Cargando archivo STL...", "info");

  setTimeout(() => {
    // Actualizar el texto de la zona de carga
    document.getElementById("textoZonaCarga").innerHTML =
      `<i class="bi bi-check-circle text-success"></i>
       <strong>${archivo.name}</strong> — ${tamañoMB} MB`;

    mostrarToast(`Archivo cargado: ${archivo.name}`, "success");
    calcularCosto(); // Recalcula con el archivo cargado
  }, 800);
}

// Generar cotización oficial
function generarCotizacion() {
  mostrarToast("📄 Generando cotización en PDF...", "info");
  setTimeout(() => {
    mostrarToast("Cotización enviada al cliente por email", "success");
  }, 2000);
}