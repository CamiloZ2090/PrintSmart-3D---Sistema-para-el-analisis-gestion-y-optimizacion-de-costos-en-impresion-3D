// CLIENTE.JS — Portal del Cliente
// PrintSmart 3D · ML Mecanizados SAS



// INICIO — Verificar sesión y cargar datos

document.addEventListener("DOMContentLoaded", () => {
  // Verificar que haya sesión activa
  const rol    = sessionStorage.getItem("rolActual");
  const nombre = sessionStorage.getItem("clienteNombre");
  const email  = sessionStorage.getItem("clienteEmail");

  if (!rol) {
    window.location.href = "index.html";
    return;
  }

  // Cargar datos del usuario en la UI
  if (nombre) {
    const primerNombre = nombre.split(" ")[0];
    const iniciales    = nombre.split(" ")
      .map(p => p[0]).join("").toUpperCase().slice(0, 2);

    // Topbar
    const topNombre = document.getElementById("clNombreTopbar");
    if (topNombre) topNombre.textContent = nombre;

    // Avatar
    const avatar = document.getElementById("clAvatar");
    if (avatar) avatar.textContent = iniciales;

    // Dashboard saludo
    const saludo = document.getElementById("dashSaludo");
    if (saludo) saludo.textContent = "¡Hola, " + primerNombre + "!";

    // Configuración — nombre y email
    const cfgNombre = document.getElementById("cfgNombre");
    const cfgEmail  = document.getElementById("cfgEmail");
    const cnNombre  = document.getElementById("configNombre");
    const cnEmail   = document.getElementById("configEmail");
    const avatarBig = document.getElementById("avatarBig");

    if (cfgNombre) cfgNombre.value     = nombre;
    if (cfgEmail  && email) cfgEmail.value = email;
    if (cnNombre) cnNombre.textContent = nombre;
    if (cnEmail   && email) cnEmail.textContent = email;
    if (avatarBig) avatarBig.childNodes[0].textContent = iniciales;

    // Dirección de envío en Estado del Pedido
    const dir = document.getElementById("estadoDireccion");
    if (dir) dir.innerHTML =
      `<strong>${nombre}</strong><br/>Calle de la Innovación, 42<br/>Bogotá, Colombia`;

    // Rellenar campos de envío con nombre y email
    const envNombre = document.getElementById("envNombre");
    const envEmail  = document.getElementById("envEmail");
    if (envNombre) envNombre.value = nombre;
    if (envEmail  && email) envEmail.value = email;
  }

  // Mostrar sección inicial
  mostrarSeccion("dashboard");
  marcarNavActivo(document.getElementById("nav-dashboard"));
});

// NAVEGACIÓN ENTRE SECCIONES
function irA(seccion, navEl) {
  mostrarSeccion(seccion);
  marcarNavActivo(navEl);

  // Actualizar placeholder del buscador
  const placeholders = {
    dashboard: "Buscar pedidos o facturas...",
    catalogo:  "Buscar productos del catálogo...",
    realizar:  "Buscar materiales o modelos...",
    pedidos:   "Buscar por ID o nombre de pedido...",
    estado:    "Buscar pedido por ID...",
    config:    "Buscar ajustes..."
  };
  const buscador = document.getElementById("clBuscador");
  if (buscador) buscador.placeholder = placeholders[seccion] || "Buscar...";

  // Scroll al inicio
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function mostrarSeccion(id) {
  document.querySelectorAll(".cl-main > section").forEach(sec => {
    sec.style.display = "none";
  });
  const target = document.getElementById("sec-" + id);
  if (target) target.style.display = "block";
}

function marcarNavActivo(navEl) {
  document.querySelectorAll(".cl-nav-item").forEach(btn => {
    btn.classList.remove("activo");
  });
  if (navEl) navEl.classList.add("activo");
}

// CERRAR SESIÓN
function cerrarSesionCliente() {
  sessionStorage.clear();
  mostrarToastCliente("👋 Sesión cerrada correctamente", "info");
  setTimeout(() => { window.location.href = "index.html"; }, 1200);
}

// CATÁLOGO — Filtrar por categoría
function filtrarCatalogo(categoria, btnEl) {
  // Actualizar botones de filtro
  document.querySelectorAll("#sec-catalogo .cl-btn-p, #sec-catalogo .cl-btn-o")
    .forEach(btn => {
      btn.className = "cl-btn-o cl-btn-sm";
    });

  if (btnEl) {
    btnEl.className = "cl-btn-p cl-btn-sm";
  }

  // Mostrar u ocultar tarjetas
  document.querySelectorAll(".cl-cat-card").forEach(card => {
    if (categoria === "todos") {
      card.style.display = "";
    } else {
      card.style.display =
        card.dataset.cat === categoria ? "" : "none";
    }
  });

  const total = document.querySelectorAll(
    categoria === "todos"
      ? ".cl-cat-card"
      : `.cl-cat-card[data-cat="${categoria}"]`
  ).length;

  mostrarToastCliente(
    `🔍 Mostrando ${total} producto${total !== 1 ? "s" : ""}`, "info"
  );
}
// CATÁLOGO — Pedir producto desde catálogo
function pedirProducto(nombre, precio) {
  // Pasar datos al formulario de pedido
  const pedNombre = document.getElementById("pedNombre");
  if (pedNombre) pedNombre.value = nombre;

  // Actualizar precio estimado
  const precioNum = parseInt(precio.replace(/\D/g, "")) / 1000;
  const precioEl  = document.getElementById("precioEstimado");
  if (precioEl) precioEl.textContent = "$" + precioNum.toFixed(2);

  // Actualizar resumen
  const resNombre = document.getElementById("resumenNombreItem");
  const resPrecio = document.getElementById("resumenPrecioItem");
  if (resNombre) resNombre.textContent = nombre;
  if (resPrecio) resPrecio.textContent = precio;

  // Ir a realizar pedido
  irA("realizar", document.getElementById("nav-realizar"));

  // Asegurarse de estar en paso 1
  resetearPasos();

  mostrarToastCliente("🛒 Producto añadido al formulario de pedido", "success");
}

// REALIZAR PEDIDO — Cálculo de precio
const preciosMaterial = {
  pla:    45000,
  petg:   58000,
  abs:    52000,
  tpu:    65000,
  resina: 95000,
  nylon:  120000
};

function calcularPrecio() {
  const material  = document.getElementById("pedMaterial")?.value || "pla";
  const densidad  = parseInt(document.getElementById("pedDensidad")?.value || "50");
  const cantidad  = parseInt(document.getElementById("pedCantidad")?.value || "1");

  const base      = preciosMaterial[material] || 45000;
  const factorDen = densidad / 50;
  const precio    = Math.round(base * factorDen * cantidad);

  const precioEl = document.getElementById("precioEstimado");
  if (precioEl) precioEl.textContent = _formatCOP(precio);

  actualizarResumen();
}

function actualizarResumen() {
  const nombre   = document.getElementById("pedNombre")?.value || "Mi Pedido 3D";
  const material = document.getElementById("pedMaterial");
  const matTexto = material?.options[material.selectedIndex]?.text || "PLA — Estándar";

  // Leer precio directamente del texto ya formateado en COP
  const precioTxt = document.getElementById("precioEstimado")?.textContent || "$45.000";
  const num       = parseInt(precioTxt.replace(/\D/g, "")) || 45000;
  const iva       = Math.round(num * 0.19);
  const total     = num + iva;

  const rNombre   = document.getElementById("resumenNombreItem");
  const rMat      = document.getElementById("resumenMatItem");
  const rSubtotal = document.getElementById("resumenSubtotal");
  const rIva      = document.getElementById("resumenIva");
  const rTotal    = document.getElementById("resumenTotal");
  const rPrecio   = document.getElementById("resumenPrecioItem");

  if (rNombre)   rNombre.textContent   = nombre || "Mi Pedido 3D";
  if (rMat)      rMat.textContent      = matTexto;
  if (rSubtotal) rSubtotal.textContent = _formatCOP(num);
  if (rIva)      rIva.textContent      = _formatCOP(iva);
  if (rTotal)    rTotal.textContent    = _formatCOP(total);
  if (rPrecio)   rPrecio.textContent   = _formatCOP(num);
}

// REALIZAR PEDIDO — Carga de archivo
function cargarArchivo(input) {
  const archivo = input.files[0];
  if (!archivo) return;

  const extension = archivo.name.split(".").pop().toLowerCase();
  const permitidos = ["png", "jpg", "jpeg", "stl"];

  if (!permitidos.includes(extension)) {
    mostrarToastCliente("Solo se permiten PNG, JPG o STL", "error");
    return;
  }

  const tamañoMB = (archivo.size / (1024 * 1024)).toFixed(2);
  if (tamañoMB > 500) {
    mostrarToastCliente("El archivo supera los 500MB", "error");
    return;
  }

  // Mostrar nombre en el preview
  const previewNombre = document.getElementById("previewNombre");
  if (previewNombre) previewNombre.textContent = archivo.name;

  // Si es imagen, mostrar preview
  if (["png", "jpg", "jpeg"].includes(extension)) {
    const reader = new FileReader();
    reader.onload = (e) => {
      // Preview en zona de carga
      const previewImg = document.getElementById("previewImg");
      if (previewImg) previewImg.src = e.target.result;

      const uploadPreview = document.getElementById("uploadPreview");
      if (uploadPreview) uploadPreview.style.display = "block";

      const uploadZone = document.getElementById("uploadZone");
      if (uploadZone) uploadZone.style.display = "none";

      // Preview en panel derecho
      const previewRefBody = document.getElementById("previewRefBody");
      const previewRefImg  = document.getElementById("previewRefImg");
      if (previewRefBody) {
        previewRefBody.innerHTML = "";
        const img = document.createElement("img");
        img.src   = e.target.result;
        img.style.cssText =
          "width:100%;max-height:200px;object-fit:contain;display:block;";
        previewRefBody.appendChild(img);
      }
    };
    reader.readAsDataURL(archivo);
  } else {
    // STL — solo mostrar nombre
    const uploadPreview = document.getElementById("uploadPreview");
    const uploadZone    = document.getElementById("uploadZone");
    const previewImg    = document.getElementById("previewImg");

    if (uploadPreview) uploadPreview.style.display = "block";
    if (uploadZone)    uploadZone.style.display    = "none";
    if (previewImg)    previewImg.style.display     = "none";

    const previewRefBody = document.getElementById("previewRefBody");
    if (previewRefBody) {
      previewRefBody.innerHTML =
        `<i class="bi bi-file-earmark-code" style="font-size:40px;color:#8B5CF6;opacity:0.7;"></i>
         <span style="font-size:13px;color:#374151;font-weight:600;">${archivo.name}</span>
         <span style="font-size:11px;color:#9CA3AF;">${tamañoMB} MB · Archivo STL</span>`;
    }
  }

  mostrarToastCliente(`Archivo cargado: ${archivo.name}`, "success");
}

// Drag & drop
function dragOver(e) {
  e.preventDefault();
  document.getElementById("uploadZone")?.classList.add("dragover");
}

function dragLeave(e) {
  e.preventDefault();
  document.getElementById("uploadZone")?.classList.remove("dragover");
}

function dropArchivo(e) {
  e.preventDefault();
  document.getElementById("uploadZone")?.classList.remove("dragover");
  const archivo = e.dataTransfer.files[0];
  if (archivo) {
    const dt = new DataTransfer();
    dt.items.add(archivo);
    const input = document.getElementById("fileInput");
    if (input) {
      input.files = dt.files;
      cargarArchivo(input);
    }
  }
}

function eliminarArchivo() {
  const fileInput     = document.getElementById("fileInput");
  const uploadPreview = document.getElementById("uploadPreview");
  const uploadZone    = document.getElementById("uploadZone");
  const previewRefBody = document.getElementById("previewRefBody");
  const previewImg    = document.getElementById("previewImg");

  if (fileInput)      fileInput.value = "";
  if (uploadPreview)  uploadPreview.style.display = "none";
  if (uploadZone)     uploadZone.style.display    = "";
  if (previewImg)     previewImg.src = "";
  if (previewRefBody) {
    previewRefBody.innerHTML =
      `<i class="bi bi-image-fill"></i><span>Sin imagen cargada</span>`;
  }

  mostrarToastCliente("🗑️ Archivo eliminado", "info");
}

// REALIZAR PEDIDO — Navegación entre pasos
let pasoActual = 1;

function siguientePaso() {
  const nombre = document.getElementById("pedNombre")?.value.trim();

  if (!nombre) {
    mostrarToastCliente("Ingresa un nombre para el pedido", "error");
    document.getElementById("pedNombre")?.focus();
    return;
  }

  // Actualizar resumen antes de pasar
  actualizarResumen();

  pasoActual = 2;
  _renderizarPasos();
  mostrarToastCliente("Proyecto guardado. Completa el envío.", "success");
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function anteriorPaso() {
  pasoActual = 1;
  _renderizarPasos();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function finalizarPedido() {
  // Validaciones básicas
  const nombre    = document.getElementById("envNombre")?.value.trim();
  const email     = document.getElementById("envEmail")?.value.trim();
  const direccion = document.getElementById("envDireccion")?.value.trim();

  if (!nombre) {
    mostrarToastCliente("⚠️ Ingresa tu nombre completo", "error");
    return;
  }
  if (!email?.includes("@")) {
    mostrarToastCliente("⚠️ Ingresa un correo válido", "error");
    return;
  }
  if (!direccion) {
    mostrarToastCliente("⚠️ Ingresa tu dirección de entrega", "error");
    return;
  }

  // Generar ID de pedido
  const idPedido = "#SP-" + Math.floor(1000 + Math.random() * 9000);
  const confirmNombre = document.getElementById("confirmNombre");
  if (confirmNombre) confirmNombre.textContent = idPedido;

  pasoActual = 3;
  _renderizarPasos();
  mostrarToastCliente("🎉 ¡Pedido confirmado! " + idPedido, "success");
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function resetearPasos() {
  pasoActual = 1;
  _renderizarPasos();
}

function _renderizarPasos() {
  // Mostrar u ocultar divs de paso
  for (let i = 1; i <= 3; i++) {
    const div = document.getElementById("paso" + i);
    if (div) div.style.display = (i === pasoActual ? "block" : "none");
  }

  // Actualizar clases del stepper
  for (let i = 1; i <= 3; i++) {
    const stepEl = document.getElementById("step" + i);
    if (!stepEl) continue;
    stepEl.classList.remove("activo", "completado");
    if (i < pasoActual)      stepEl.classList.add("completado");
    else if (i === pasoActual) stepEl.classList.add("activo");
  }
}

// PAGO — Método de pago
function selectMetodo(tipo) {
  // Resetear botones
  ["tarjeta", "transferencia"].forEach(t => {
    const btn = document.getElementById("metodoPago-" + t);
    if (btn) btn.classList.remove("activo");
  });

  // Activar el seleccionado
  const btnActivo = document.getElementById("metodoPago-" + tipo);
  if (btnActivo) btnActivo.classList.add("activo");

  // Mostrar campos correspondientes
  const camposTarjeta       = document.getElementById("camposTarjeta");
  const camposTransferencia = document.getElementById("camposTransferencia");

  if (tipo === "tarjeta") {
    if (camposTarjeta)       camposTarjeta.style.display       = "block";
    if (camposTransferencia) camposTransferencia.style.display  = "none";
  } else {
    if (camposTarjeta)       camposTarjeta.style.display       = "none";
    if (camposTransferencia) camposTransferencia.style.display  = "block";
  }
}

// Formatear número de tarjeta
function formatearTarjeta(input) {
  let v = input.value.replace(/\D/g, "").slice(0, 16);
  input.value = v.replace(/(.{4})/g, "$1 ").trim();
}

// Formatear vencimiento
function formatearVenc(input) {
  let v = input.value.replace(/\D/g, "").slice(0, 4);
  if (v.length >= 2) v = v.slice(0, 2) + "/" + v.slice(2);
  input.value = v;
}

// BUSCADOR — Filtrar contenido visible
function buscarEnSeccion(termino) {
  const term = termino.toLowerCase().trim();

  // En catálogo: filtrar por nombre
  const esCatalogo = document.getElementById("sec-catalogo")?.style.display !== "none";
  if (esCatalogo) {
    document.querySelectorAll(".cl-cat-card").forEach(card => {
      const nombre = card.querySelector(".cl-cat-nombre")?.textContent.toLowerCase() || "";
      card.style.display = (!term || nombre.includes(term)) ? "" : "none";
    });
    return;
  }

  // En mis pedidos: filtrar filas de tabla
  const esPedidos = document.getElementById("sec-pedidos")?.style.display !== "none";
  if (esPedidos) {
    document.querySelectorAll("#sec-pedidos .cl-tabla tbody tr").forEach(fila => {
      const texto = fila.textContent.toLowerCase();
      fila.style.display = (!term || texto.includes(term)) ? "" : "none";
    });
  }
}

// NOTIFICACIONES — Panel de notificaciones
let notifAbiertas = false;

function toggleNotificaciones() {
  notifAbiertas = !notifAbiertas;

  // Buscar panel existente o crearlo
  let panel = document.getElementById("notifPanel");

  if (notifAbiertas) {
    if (!panel) {
      panel = document.createElement("div");
      panel.id = "notifPanel";
      panel.style.cssText = `
        position:fixed; top:66px; right:16px; width:320px;
        background:white; border:1px solid #E5E7EB;
        border-radius:14px; box-shadow:0 10px 40px rgba(0,0,0,0.12);
        z-index:500; overflow:hidden;
        animation:cl-toast-in 0.2s ease;
      `;
      panel.innerHTML = `
        <div style="padding:16px 18px;border-bottom:1px solid #F3F4F6;
                    display:flex;justify-content:space-between;align-items:center;">
          <span style="font-size:14px;font-weight:800;color:#1F2937;">Notificaciones</span>
          <button onclick="toggleNotificaciones()"
                  style="background:none;border:none;font-size:18px;
                         color:#9CA3AF;cursor:pointer;line-height:1;">×</button>
        </div>
        ${_notifItem("bi-printer","Pedido #SP-9824 al 68% de impresión","Hace 2 min","#EDE9FE","#5B21B6")}
        ${_notifItem("bi-check-circle","Pedido #SP-9412 entregado exitosamente","Hace 1 hora","#DCFCE7","#16A34A")}
        ${_notifItem("bi-star","¡Evalúa tu último pedido y obtén 5% de descuento!","Hace 3 horas","#FEF3C7","#D97706")}
        ${_notifItem("bi-info-circle","Nuevo material disponible: Carbono SLS","Hace 1 día","#EFF6FF","#2563EB")}
        <div style="padding:12px 18px;border-top:1px solid #F3F4F6;text-align:center;">
          <span style="font-size:12.5px;color:#5B21B6;font-weight:600;cursor:pointer;"
                onclick="mostrarToastCliente('📬 Abriendo todas las notificaciones...','info')">
            Ver todas las notificaciones →
          </span>
        </div>
      `;
      document.body.appendChild(panel);
    } else {
      panel.style.display = "block";
    }
  } else {
    if (panel) panel.style.display = "none";
  }
}

function _notifItem(ico, texto, tiempo, bgColor, color) {
  return `
    <div style="padding:12px 18px;display:flex;align-items:flex-start;gap:12px;
                border-bottom:1px solid #F9FAFB;cursor:pointer;transition:background 0.15s;"
         onmouseover="this.style.background='#F9FAFB'"
         onmouseout="this.style.background=''">
      <div style="width:36px;height:36px;border-radius:9px;background:${bgColor};
                  display:flex;align-items:center;justify-content:center;
                  font-size:16px;color:${color};flex-shrink:0;">
        <i class="bi ${ico}"></i>
      </div>
      <div>
        <div style="font-size:12.5px;font-weight:600;color:#1F2937;
                    line-height:1.4;margin-bottom:3px;">${texto}</div>
        <div style="font-size:11px;color:#9CA3AF;">${tiempo}</div>
      </div>
    </div>
  `;
}

// Cerrar notificaciones al hacer clic fuera
document.addEventListener("click", (e) => {
  const panel = document.getElementById("notifPanel");
  const btn   = e.target.closest(".cl-topbar-btn");
  if (panel && !panel.contains(e.target) && !btn) {
    panel.style.display = "none";
    notifAbiertas = false;
  }
});

// EVALUACIÓN — Modal
function abrirEvaluacion(nombreProducto, idPedido) {
  const modal = document.getElementById("modalEval");
  if (!modal) return;

  // Rellenar datos
  const evalId     = document.getElementById("evalIdPedido");
  const evalNombre = document.getElementById("evalNombreProd");
  if (evalId)     evalId.textContent     = idPedido;
  if (evalNombre) evalNombre.textContent = nombreProducto;

  // Resetear estrellas
  [1, 2].forEach(g => resetStars(g));

  // Limpiar comentario
  const comentario = document.getElementById("evalComentario");
  if (comentario) comentario.value = "";

  modal.classList.add("abierto");
  document.body.style.overflow = "hidden";
}

function cerrarModalEval(event) {
  const modal = document.getElementById("modalEval");
  if (!modal) return;
  if (event && event.target !== modal) return;
  modal.classList.remove("abierto");
  document.body.style.overflow = "";
}

// Estrellas interactivas
const puntajesEstrellas = { 1: 0, 2: 0 };

function setStars(grupo, valor) {
  puntajesEstrellas[grupo] = valor;
  const container = document.getElementById("stars" + grupo);
  if (!container) return;

  container.querySelectorAll(".cl-star").forEach((star, idx) => {
    star.classList.toggle("activa", idx < valor);
  });
}

function resetStars(grupo) {
  puntajesEstrellas[grupo] = 0;
  const container = document.getElementById("stars" + grupo);
  if (!container) return;
  container.querySelectorAll(".cl-star").forEach(s => s.classList.remove("activa"));
}

// Hover preview de estrellas
document.addEventListener("DOMContentLoaded", () => {
  [1, 2].forEach(grupo => {
    const container = document.getElementById("stars" + grupo);
    if (!container) return;

    container.querySelectorAll(".cl-star").forEach((star, idx) => {
      star.addEventListener("mouseover", () => {
        container.querySelectorAll(".cl-star").forEach((s, i) => {
          s.style.color = i <= idx ? "#F59E0B" : "#E5E7EB";
        });
      });
      star.addEventListener("mouseout", () => {
        container.querySelectorAll(".cl-star").forEach((s, i) => {
          s.style.color = i < puntajesEstrellas[grupo] ? "#F59E0B" : "#E5E7EB";
        });
      });
    });
  });
});

function enviarEvaluacion() {
  if (puntajesEstrellas[1] === 0 || puntajesEstrellas[2] === 0) {
    mostrarToastCliente("⚠️ Por favor califica ambos criterios", "error");
    return;
  }

  const comentario = document.getElementById("evalComentario")?.value.trim();
  const promedio   = ((puntajesEstrellas[1] + puntajesEstrellas[2]) / 2).toFixed(1);

  mostrarToastCliente(
    `⭐ Evaluación enviada. Promedio: ${promedio}/5 — ¡Gracias!`,
    "success"
  );

  setTimeout(() => {
    const modal = document.getElementById("modalEval");
    if (modal) {
      modal.classList.remove("abierto");
      document.body.style.overflow = "";
    }
  }, 1500);
}

// CONFIGURACIÓN — Guardar perfil
function guardarPerfil() {
  const nombre = document.getElementById("cfgNombre")?.value.trim();
  const email  = document.getElementById("cfgEmail")?.value.trim();

  if (!nombre) {
    mostrarToastCliente("El nombre es obligatorio", "error");
    return;
  }
  if (!email?.includes("@")) {
    mostrarToastCliente("Ingresa un correo válido", "error");
    return;
  }

  // Actualizar sessionStorage
  sessionStorage.setItem("clienteNombre", nombre);
  sessionStorage.setItem("clienteEmail",  email);

  // Actualizar UI en tiempo real
  const primerNombre = nombre.split(" ")[0];
  const iniciales    = nombre.split(" ")
    .map(p => p[0]).join("").toUpperCase().slice(0, 2);

  const topNombre = document.getElementById("clNombreTopbar");
  const avatar    = document.getElementById("clAvatar");
  const saludo    = document.getElementById("dashSaludo");
  const cnNombre  = document.getElementById("configNombre");
  const cnEmail   = document.getElementById("configEmail");

  if (topNombre) topNombre.textContent = nombre;
  if (avatar)    avatar.textContent    = iniciales;
  if (saludo)    saludo.textContent    = "¡Hola, " + primerNombre + "!";
  if (cnNombre)  cnNombre.textContent  = nombre;
  if (cnEmail)   cnEmail.textContent   = email;

  mostrarToastCliente("Perfil actualizado correctamente", "success");
}

// CONFIGURACIÓN — Cambiar avatar
function cambiarAvatar(input) {
  const archivo = input.files[0];
  if (!archivo) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    const avatarBig = document.getElementById("avatarBig");
    const clAvatar  = document.getElementById("clAvatar");

    if (avatarBig) {
      // Conservar el overlay pero cambiar el fondo
      const overlay = avatarBig.querySelector(".cl-avatar-overlay");
      avatarBig.innerHTML = "";
      const img = document.createElement("img");
      img.src = e.target.result;
      avatarBig.appendChild(img);
      if (overlay) avatarBig.appendChild(overlay);
    }

    if (clAvatar) {
      clAvatar.innerHTML = "";
      const img = document.createElement("img");
      img.src = e.target.result;
      clAvatar.appendChild(img);
    }

    mostrarToastCliente("🖼️ Foto de perfil actualizada", "success");
  };
  reader.readAsDataURL(archivo);
}

// TOASTS
function mostrarToastCliente(mensaje, tipo = "info") {
  const contenedor = document.getElementById("clToastContainer");
  if (!contenedor) return;

  const toast = document.createElement("div");
  toast.className = "cl-toast " + tipo;

  const iconos = { success: "✅", error: "❌", info: "ℹ️" };
  toast.innerHTML =
    `<span>${iconos[tipo] || "ℹ️"}</span><span>${mensaje}</span>`;

  contenedor.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity    = "0";
    toast.style.transition = "opacity 0.35s";
    setTimeout(() => toast.remove(), 350);
  }, 3500);
}

// =============================================
// TECLA ESC — Cerrar modales internos
// =============================================
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    const modalEval = document.getElementById("modalEval");
    if (modalEval?.classList.contains("abierto")) {
      modalEval.classList.remove("abierto");
      document.body.style.overflow = "";
    }
    const notifPanel = document.getElementById("notifPanel");
    if (notifPanel) {
      notifPanel.style.display = "none";
      notifAbiertas = false;
    }
  }
  // HELPER — Formatear precio en pesos colombianos
  function _formatCOP(valor) {
    return "$" + valor.toLocaleString("es-CO") + " COP";
  }
});
