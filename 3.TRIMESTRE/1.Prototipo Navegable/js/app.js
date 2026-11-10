"use strict";

const datosRol = {
  Admin: {
    iniciales: "AD",
    color: "#5B21B6",
  },
  Operador: {
    iniciales: "OP",
    color: "#0F766E",
  },
  Cliente: {
    iniciales: "CL",
    color: "#2563EB",
  },
  Tecnico: {
    iniciales: "TC",
    color: "#0369A1",
  },
};

let sesionActual = null;

window.addEventListener("DOMContentLoaded", () => {
  if (!window.Auth) {
    console.error("AUTH ERROR: auth.js no está cargado.");
    window.location.replace("index.html");
    return;
  }

  sesionActual = Auth.obtenerSesion();

  if (!sesionActual) {
    Auth.cerrarSesion();
    return;
  }

  const rol = sesionActual.rol;
  const datos = datosRol[rol];

  if (!datos) {
    console.error("AUTH ERROR: Rol no reconocido:", rol);
    Auth.cerrarSesion();
    return;
  }

  configurarUsuario(sesionActual, datos);
  configurarNavegacion();

  const navInicial =
    document.getElementById("nav-dashboard") ||
    document.querySelector('.nav-item[data-seccion="dashboard"]');

  mostrarSeccion("dashboard", navInicial);
});

function configurarUsuario(sesion, datos) {
  const elNombre = document.getElementById("topbarNombre");
  const elRol = document.getElementById("topbarRol");
  const elAvatar = document.getElementById("topbarAvatar");

  const nombre = sesion.nombre || sesion.email;

  if (elNombre) {
    elNombre.textContent = nombre;
  }

  if (elRol) {
    elRol.textContent = sesion.rol.toUpperCase();
  }

  if (elAvatar) {
    const iniciales = nombre
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((palabra) => palabra.charAt(0).toUpperCase())
      .join("");

    elAvatar.textContent = iniciales || datos.iniciales;
    elAvatar.style.background = datos.color;
  }
}

function configurarNavegacion() {
  document.querySelectorAll(".sidebar-nav .nav-item").forEach((item) => {
    item.addEventListener("click", (event) => {
      event.preventDefault();

      const idSeccion =
        item.getAttribute("data-seccion") || item.id.replace("nav-", "");

      if (!idSeccion) {
        console.warn("NAV: Elemento sin sección definida.");
        return;
      }

      mostrarSeccion(idSeccion, item);
    });
  });
}

let graficosCreados = {};

function mostrarSeccion(idSeccion, navEl) {
  if (!idSeccion) {
    console.warn("NAV: No se recibió una sección.");
    return false;
  }

  const seccionTarget = document.getElementById("sec-" + idSeccion);

  if (!seccionTarget) {
    console.error("NAV ERROR: No existe la sección sec-" + idSeccion);
    return false;
  }

  document.querySelectorAll("[id^='sec-']").forEach((sec) => {
    sec.style.display = "none";
  });

  seccionTarget.style.display = "block";

  document.querySelectorAll(".nav-item").forEach((item) => {
    item.classList.remove("activo");
  });

  if (navEl) {
    navEl.classList.add("activo");
  }

  const textosBuscador = {
    dashboard: "Buscar pedidos, materiales o telemetría...",
    materiales: "Buscar materiales, lotes o proveedores...",
    pedidos: "Buscar pedidos, clientes o ID...",
    calculos: "Buscar proyectos o cálculos...",
    informes: "Buscar reportes, transacciones o datos...",
    reportes: "Buscar reportes, transacciones o datos...",
    usuarios: "Buscar usuarios del sistema...",
    configuracion: "Buscar ajustes...",
  };

  const buscador = document.getElementById("buscadorInput");

  if (buscador) {
    buscador.placeholder = textosBuscador[idSeccion] || "Buscar...";
  }

  if (!graficosCreados[idSeccion]) {
    setTimeout(() => {
      if (typeof iniciarGraficosSeccion === "function") {
        iniciarGraficosSeccion(idSeccion);
        graficosCreados[idSeccion] = true;
      }
    }, 60);
  }

  return true;
}

function cerrarSesion() {
  if (!window.Auth) {
    window.location.replace("index.html");
    return;
  }

  Auth.cerrarSesion();
}

function mostrarToast(mensaje, tipo = "info") {
  const contenedor = document.getElementById("toastContainer");

  if (!contenedor) {
    console.warn("No existe el contenedor de notificaciones.");
    return;
  }

  const toast = document.createElement("div");

  toast.className = "toast-item " + tipo;

  const texto = document.createElement("span");
  texto.textContent = String(mensaje);

  toast.appendChild(texto);
  contenedor.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transition = "opacity 0.3s";

    setTimeout(() => {
      toast.remove();
    }, 300);
  }, 3500);
}

function alternarToggle(el) {
  if (!el) return;

  el.classList.toggle("on");

  const estaOn = el.classList.contains("on");

  mostrarToast(estaOn ? "Opción activada" : "Opción desactivada", "info");
}

async function exportarPDF() {
  mostrarToast("Preparando exportación...", "info");

  try {
    if (!window.jspdf || !window.jspdf.jsPDF) {
      throw new Error("La biblioteca jsPDF no está cargada.");
    }

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    doc.setFillColor(91, 33, 182);
    doc.rect(0, 0, 210, 30, "F");

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(20);

    doc.text("PrintSmart 3D", 105, 14, {
      align: "center",
    });

    doc.setFontSize(11);

    doc.text("Dashboard Ejecutivo", 105, 23, {
      align: "center",
    });

    doc.setTextColor(31, 41, 55);
    doc.setFontSize(13);

    doc.text("Indicadores Clave (KPI)", 14, 45);

    doc.setFontSize(10);
    doc.setTextColor(100);

    doc.text("Ingresos Totales: $142,384 (+12.5%)", 14, 55);
    doc.text("Pedidos Activos: 28 Trabajos (+4)", 14, 63);
    doc.text("Stock de Material: 428.5 kg (-8.2%)", 14, 71);
    doc.text("Salud del Sistema: 99.8% Optimo", 14, 79);

    doc.setDrawColor(200);
    doc.line(14, 85, 196, 85);

    doc.setFontSize(9);
    doc.setTextColor(150);

    doc.text("Generado: " + new Date().toLocaleString("es-CO"), 14, 92);

    doc.setFontSize(8);

    doc.text("PrintSmart 3D - Sistemas de Impresión de Precisión", 105, 285, {
      align: "center",
    });

    const pdfBlob = doc.output("blob");

    const guardado = await descargarBlob(
      pdfBlob,
      "PrintSmart_Dashboard.pdf",
      "application/pdf",
      ".pdf",
      "Documento PDF",
    );

    if (guardado) {
      mostrarToast("PDF exportado correctamente.", "success");
    }
  } catch (error) {
    console.error("ERROR EXPORTANDO PDF:", error);

    mostrarToast("No fue posible exportar el PDF: " + error.message, "error");
  }
}

async function descargarBlob(
  blob,
  nombreSugerido,
  mimeType,
  extension,
  descripcion = "Archivo",
) {
  if ("showSaveFilePicker" in window && window.isSecureContext) {
    try {
      const fileHandle = await window.showSaveFilePicker({
        suggestedName: nombreSugerido,
        types: [
          {
            description: descripcion,
            accept: {
              [mimeType]: [extension],
            },
          },
        ],
      });

      const writable = await fileHandle.createWritable();

      await writable.write(blob);
      await writable.close();

      return true;
    } catch (error) {
      if (error.name === "AbortError") {
        return false;
      }

      console.error("Error guardando archivo:", error);
    }
  }

  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");

  a.href = url;
  a.download = nombreSugerido;

  document.body.appendChild(a);

  a.click();
  a.remove();

  setTimeout(() => {
    URL.revokeObjectURL(url);
  }, 1000);

  return true;
}

function toggleNotificaciones(event) {
  if (event) {
    event.stopPropagation();
  }

  const panel = document.getElementById("notifPanel");

  if (!panel) return;

  panel.style.display = panel.style.display === "block" ? "none" : "block";
}

document.addEventListener("click", () => {
  const panel = document.getElementById("notifPanel");

  if (panel) {
    panel.style.display = "none";
  }
});

function irAPerfil() {
  const seccionPerfil = document.getElementById("sec-perfil");

  if (!seccionPerfil) {
    console.warn("Esta página no tiene sección de perfil.");
    return;
  }

  const nav = document.getElementById("nav-perfil");

  mostrarSeccion("perfil", nav);
}
