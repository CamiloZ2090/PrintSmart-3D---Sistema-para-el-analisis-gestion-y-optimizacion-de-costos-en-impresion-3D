
// APP.JS — Navegación y utilidades globales

// Al cargar la página, configurar el nombre del usuario y la navegación
window.addEventListener("DOMContentLoaded", () => {
  const rol = sessionStorage.getItem("rolActual") || "Admin";

  const datosRol = {
    Admin:    { nombre: "Camilo Zambrano",  iniciales: "CZ", color: "#5B21B6" },
    Operador: { nombre: "Moises Stredel", iniciales: "MS", color: "#0F766E" },
    Cliente:  { nombre: "Yesenia Montoya", iniciales: "YM", color: "#2563EB" },
    Tecnico:  { nombre: "Eilin Loaiza", iniciales: "EL", color: "#0369A1" }
  };

  const datos = datosRol[rol] || datosRol["Admin"];

  const elNombre = document.getElementById("topbarNombre");
  const elRol    = document.getElementById("topbarRol");
  const elAvatar = document.getElementById("topbarAvatar");

  if (elNombre) elNombre.textContent = datos.nombre;
  if (elRol)    elRol.textContent    = rol.toUpperCase();
  if (elAvatar) {
    elAvatar.textContent = datos.iniciales;
    elAvatar.style.background = datos.color;
  }

  // CONECTAR CLICS DEL MENÚ AUTOMÁTICAMENTE
  document.querySelectorAll(".sidebar-nav .nav-item").forEach(item => {
    item.addEventListener("click", (e) => {
      e.preventDefault();
      // Lee el atributo data-seccion o extrae el ID del elemento
      const idSeccion = item.getAttribute("data-seccion") || item.id.replace("nav-", "");
      if (idSeccion) {
        mostrarSeccion(idSeccion, item);
      }
    });
  });

  // Mostrar sección inicial
  const navInicial = document.getElementById("nav-dashboard") || document.querySelector('.nav-item[data-seccion="dashboard"]');
  mostrarSeccion("dashboard", navInicial);
});

// NAVEGACIÓN: muestra una sección y oculta el resto

let graficosCreados = {};  // Para no crear gráficos duplicados

function mostrarSeccion(idSeccion, navEl) {
  // 1. Ocultar TODAS las secciones
  document.querySelectorAll("[id^='sec-']").forEach(sec => {
    sec.style.display = "none";
  });

  // 2. Mostrar SOLO la sección elegida
  const seccionTarget = document.getElementById("sec-" + idSeccion);
  if (seccionTarget) seccionTarget.style.display = "block";

  // 3. Actualizar qué ítem del menú está activo
  document.querySelectorAll(".nav-item").forEach(item => {
    item.classList.remove("activo");
  });
  if (navEl) navEl.classList.add("activo");

  // 4. Actualizar el placeholder del buscador
  const textosBuscador = {
    dashboard:     "Buscar pedidos, materiales o telemetría...",
    materiales:    "Buscar materiales, lotes o proveedores...",
    pedidos:       "Buscar pedidos, clientes o ID...",
    calculos:      "Buscar proyectos o cálculos...",
    informes:      "Buscar reportes, transacciones o datos...",
    reportes:      "Buscar reportes, transacciones o datos...",
    usuarios:      "Buscar usuarios del sistema...",
    configuracion: "Buscar ajustes..."
  };
  const buscador = document.getElementById("buscadorInput");
  if (buscador) buscador.placeholder = textosBuscador[idSeccion] || "Buscar...";

  // 5. Crear los gráficos de esa sección (solo la primera vez)
  setTimeout(() => {
    if (!graficosCreados[idSeccion]) {
      graficosCreados[idSeccion] = true;
      if (typeof iniciarGraficosSeccion === "function") {
        iniciarGraficosSeccion(idSeccion);
      }
    }
  }, 60);
}

// CERRAR SESIÓN

function cerrarSesion() {
  sessionStorage.clear();
  window.location.href = "index.html";
}

// SISTEMA DE NOTIFICACIONES (Toasts)

function mostrarToast(mensaje, tipo = "info") {
  const contenedor = document.getElementById("toastContainer");
  if (!contenedor) return;

  const toast = document.createElement("div");
  toast.className = "toast-item " + tipo;

  const iconos = { success: "✅", error: "❌", info: "ℹ️" };
  toast.innerHTML = `<span>${iconos[tipo] || "ℹ️"}</span><span>${mensaje}</span>`;

  contenedor.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transition = "opacity 0.3s";
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

// TOGGLE GENÉRICO (Interruptor on/off)
function alternarToggle(el) {
  el.classList.toggle("on");
  const estaOn = el.classList.contains("on");
  mostrarToast(estaOn ? "Opción activada" : "Opción desactivada", "info");
}
// Exportar PDF
async function exportarPDF() {
  mostrarToast("📄 Preparando exportación...", "info");

  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  // Encabezado
  doc.setFillColor(91, 33, 182);
  doc.rect(0, 0, 210, 30, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.text("PrintSmart 3D", 105, 14, { align: "center" });
  doc.setFontSize(11);
  doc.text("Dashboard Ejecutivo", 105, 23, { align: "center" });

  // KPIs
  doc.setTextColor(31, 41, 55);
  doc.setFontSize(13);
  doc.text("Indicadores Clave (KPI)", 14, 45);
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text("Ingresos Totales:       $142,384     (+12.5%)", 14, 55);
  doc.text("Pedidos Activos:        28 Trabajos  (+4)", 14, 63);
  doc.text("Stock de Material:      428.5 kg     (-8.2%)", 14, 71);
  doc.text("Salud del Sistema:      99.8%        Óptimo", 14, 79);

  // Separador
  doc.setDrawColor(200);
  doc.line(14, 85, 196, 85);

  // Fecha
  doc.setFontSize(9);
  doc.setTextColor(150);
  doc.text("Generado: " + new Date().toLocaleString("es-CO"), 14, 92);

  // Pie de página
  doc.setFontSize(8);
  doc.text("PrintSmart 3D — Sistemas de Impresión de Precisión", 105, 285, { align: "center" });

  const pdfBlob = doc.output("blob");

  try {
    // Abre el explorador de archivos para elegir dónde guardar
    if ("showSaveFilePicker" in window) {
      const fileHandle = await window.showSaveFilePicker({
        suggestedName: "PrintSmart_Dashboard.pdf",
        types: [{
          description: "Documento PDF",
          accept: { "application/pdf": [".pdf"] }
        }]
      });
      const writable = await fileHandle.createWritable();
      await writable.write(pdfBlob);
      await writable.close();
      mostrarToast(" PDF guardado correctamente", "success");
    } else {
      // Fallback por si el navegador no soporta showSaveFilePicker
      doc.save("PrintSmart_Dashboard.pdf");
      mostrarToast("PDF descargado", "success");
    }
  } catch (e) {
    if (e.name !== "AbortError") {
      doc.save("PrintSmart_Dashboard.pdf");
      mostrarToast("PDF descargado", "success");
    }
  }
}