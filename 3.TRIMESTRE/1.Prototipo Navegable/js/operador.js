
// OPERADOR.JS — Panel del Operario
// PrintSmart 3D · ML Mecanizados SAS

// ESTADO GLOBAL
let opPedidoActual = null;   // Pedido abierto en modal
let opColorActual  = "Morado";
let opNotifOpen    = false;

// Estados posibles de un pedido (en orden)
const ESTADOS_FLUJO = ["pendiente", "en-proceso", "terminado", "entregado"];

const LABELS_ESTADO = {
  "pendiente":  "Pendiente",
  "en-proceso": "En Proceso",
  "terminado":  "Terminado",
  "entregado":  "Entregado"
};

// INICIO — Verificar sesión y cargar datos
document.addEventListener("DOMContentLoaded", () => {
  const rol    = sessionStorage.getItem("rolActual");
  const nombre = sessionStorage.getItem("clienteNombre");
  const email  = sessionStorage.getItem("clienteEmail");

  // Redirigir si no hay sesión o el rol no es Operador
  if (!rol || rol !== "Operador") {
    window.location.href = "index.html";
    return;
  }

  // Cargar nombre en la UI
  if (nombre) {
    const primerNombre = nombre.split(" ")[0];
    const iniciales    = nombre.split(" ")
      .map(p => p[0]).join("").toUpperCase().slice(0, 2);

    const topNombre   = document.getElementById("opNombreTopbar");
    const avatar      = document.getElementById("opAvatar");
    const avatarInner = document.getElementById("opAvatarInner");
    const cfgNombre   = document.getElementById("cfgOpNombre");
    const cfgEmail    = document.getElementById("cfgOpEmail");

    if (topNombre)   topNombre.textContent   = nombre;
    if (avatar)      avatar.textContent      = iniciales;
    if (avatarInner) avatarInner.childNodes[0]
      ? (avatarInner.childNodes[0].textContent = iniciales)
      : (avatarInner.textContent = iniciales);
    if (cfgNombre)   cfgNombre.value         = nombre;
    if (cfgEmail && email) cfgEmail.value    = email;
  }

  // Mostrar sección inicial
  opMostrarSeccion("dashboard");
  opMarcarNav(document.getElementById("nav-dashboard"));

  // Calcular precio inicial
  opCalcular();
});

// NAVEGACIÓN
function opIrA(seccion, navEl) {
  opMostrarSeccion(seccion);
  opMarcarNav(navEl);

  const placeholders = {
    dashboard:  "Buscar pedidos o materiales...",
    materiales: "Buscar materiales, lotes o proveedores...",
    pedidos:    "Buscar pedidos por ID o nombre...",
    calculos:   "Buscar proyectos o cálculos...",
    config:     "Buscar ajustes..."
  };

  const buscador = document.getElementById("opBuscador");
  if (buscador) buscador.placeholder = placeholders[seccion] || "Buscar...";

  window.scrollTo({ top: 0, behavior: "smooth" });
}

function opMostrarSeccion(id) {
  document.querySelectorAll(".contenido-principal > section").forEach(sec => {
    sec.style.display = "none";
  });
  const target = document.getElementById("sec-" + id);
  if (target) target.style.display = "block";
}

function opMarcarNav(navEl) {
  document.querySelectorAll(".nav-item").forEach(n => n.classList.remove("activo"));
  if (navEl) navEl.classList.add("activo");
}

// CERRAR SESIÓN
function cerrarSesionOp() {
  mostrarToastOp("Sesión cerrada correctamente", "info");
  setTimeout(() => {
    sessionStorage.clear();
    window.location.href = "index.html";
  }, 1200);
}

// BUSCADOR GLOBAL
function opBuscar(termino) {
  const term = termino.toLowerCase().trim();

  // Si estamos en materiales — filtrar tabla
  const secMat = document.getElementById("sec-materiales");
  if (secMat?.style.display !== "none") {
    opFiltrarMateriales(term);
    return;
  }

  // Si estamos en pedidos — filtrar cards
  const secPed = document.getElementById("sec-pedidos");
  if (secPed?.style.display !== "none") {
    document.querySelectorAll(".op-pedido-card").forEach(card => {
      const txt = card.textContent.toLowerCase();
      card.style.display = (!term || txt.includes(term)) ? "" : "none";
    });
  }
}

// NOTIFICACIONES
function opToggleNotif() {
  opNotifOpen = !opNotifOpen;
  let panel = document.getElementById("opNotifPanel");

  if (opNotifOpen) {
    if (!panel) {
      panel = document.createElement("div");
      panel.id = "opNotifPanel";
      panel.style.cssText = `
        position:fixed; top:66px; right:16px; width:320px;
        background:white; border:1px solid #E5E7EB;
        border-radius:14px; box-shadow:0 10px 40px rgba(0,0,0,0.12);
        z-index:500; overflow:hidden;
        animation:entrarToast 0.2s ease;
      `;
      panel.innerHTML = `
        <div style="padding:14px 18px;border-bottom:1px solid #F3F4F6;
                    display:flex;justify-content:space-between;align-items:center;">
          <span style="font-size:14px;font-weight:800;color:#1F2937;">Notificaciones</span>
          <button onclick="opToggleNotif()"
                  style="background:none;border:none;font-size:18px;
                         color:#9CA3AF;cursor:pointer;line-height:1;">×</button>
        </div>
        ${_opNotifItem("bi-exclamation-circle","PLA Premium Jet Black — Stock crítico (80g)","Hace 5 min","#FEE2E2","#EF4444")}
        ${_opNotifItem("bi-printer","PED-0025 Dragon_Rex_V2 al 65% de impresión","Hace 12 min","#EDE9FE","#5B21B6")}
        ${_opNotifItem("bi-check-circle","PED-0020 Industrial_Cap_X1 finalizado","Hace 28 min","#DCFCE7","#16A34A")}
        ${_opNotifItem("bi-thermometer-half","Cama B4 sobre temperatura objetivo (62°C)","Hace 1h","#FEF3C7","#F59E0B")}
        <div style="padding:12px 18px;border-top:1px solid #F3F4F6;text-align:center;">
          <span style="font-size:12.5px;color:#5B21B6;font-weight:600;cursor:pointer;"
                onclick="mostrarToastOp('📬 Cargando todas las notificaciones...','info')">
            Ver todas →
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

function _opNotifItem(ico, texto, tiempo, bg, color) {
  return `
    <div style="padding:12px 18px;display:flex;align-items:flex-start;gap:12px;
                border-bottom:1px solid #F9FAFB;cursor:pointer;transition:background 0.15s;"
         onmouseover="this.style.background='#F9FAFB'"
         onmouseout="this.style.background=''">
      <div style="width:36px;height:36px;border-radius:9px;background:${bg};
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
document.addEventListener("click", e => {
  const panel = document.getElementById("opNotifPanel");
  const btn   = e.target.closest(".topbar-btn");
  if (panel && !panel.contains(e.target) && !btn) {
    panel.style.display = "none";
    opNotifOpen = false;
  }
});

// MATERIALES — Filtrar tabla
function opFiltrarMateriales(termino) {
  const term = termino.toLowerCase().trim();
  document.querySelectorAll("#tablaMateriales tbody tr").forEach(fila => {
    const txt = fila.textContent.toLowerCase();
    fila.style.display = (!term || txt.includes(term)) ? "" : "none";
  });
}

function opFiltrarEstadoMat(estado) {
  document.querySelectorAll("#tablaMateriales tbody tr").forEach(fila => {
    if (estado === "todos") {
      fila.style.display = "";
    } else {
      fila.style.display = fila.dataset.estado === estado ? "" : "none";
    }
  });
  mostrarToastOp(
    estado === "todos"
      ? "Mostrando todos los materiales"
      : `Filtrando por: ${estado}`,
    "info"
  );
}

// MATERIALES — Reponer
function opReponer(nombre) {
  mostrarToastOp(`🔄 Solicitud de reposición enviada: ${nombre}`, "success");
}

// MATERIALES — Eliminar fila
function opEliminarMaterial(btn, nombre) {
  if (!confirm(`¿Eliminar "${nombre}" del inventario?`)) return;
  const fila = btn.closest("tr");
  if (fila) {
    fila.style.transition = "opacity 0.3s, transform 0.3s";
    fila.style.opacity    = "0";
    fila.style.transform  = "translateX(20px)";
    setTimeout(() => fila.remove(), 320);
  }
  mostrarToastOp(`Material "${nombre}" eliminado`, "error");
}

// MATERIALES — Modal Agregar / Editar
function abrirModalMaterial() {
  // Limpiar formulario
  document.getElementById("opModalMatTitulo").textContent = "Agregar Material";
  document.getElementById("matFormNombre").value    = "";
  document.getElementById("matFormStock").value     = "1000";
  document.getElementById("matFormPrecio").value    = "0.045";
  document.getElementById("matFormMin").value       = "200";
  document.getElementById("matFormProveedor").value = "";
  document.getElementById("matFormColor").value     = "#500088";
  document.getElementById("matFormColorHex").value  = "#500088";

  document.getElementById("opModalMat").classList.add("abierto");
  document.body.style.overflow = "hidden";
}

function opEditarMaterial(nombre, color, stock, precio, min) {
  document.getElementById("opModalMatTitulo").textContent = "Editar Material";
  document.getElementById("matFormNombre").value  = nombre;
  document.getElementById("matFormStock").value   = stock;
  document.getElementById("matFormPrecio").value  = precio;
  document.getElementById("matFormMin").value     = min;

  document.getElementById("opModalMat").classList.add("abierto");
  document.body.style.overflow = "hidden";
}

function opCerrarModalMat(event) {
  const ov = document.getElementById("opModalMat");
  if (event && event.target !== ov) return;
  ov.classList.remove("abierto");
  document.body.style.overflow = "";
}

function opGuardarMaterial() {
  const nombre    = document.getElementById("matFormNombre").value.trim();
  const stock     = document.getElementById("matFormStock").value;
  const precio    = document.getElementById("matFormPrecio").value;
  const min       = document.getElementById("matFormMin").value;
  const proveedor = document.getElementById("matFormProveedor").value.trim();

  if (!nombre) {
    mostrarToastOp("El nombre del material es obligatorio", "error");
    document.getElementById("matFormNombre").focus();
    return;
  }

  if (!stock || parseFloat(stock) < 0) {
    mostrarToastOp("Ingresa un stock válido", "error");
    return;
  }

  // Determinar estado según stock vs mínimo
  const stockNum = parseFloat(stock);
  const minNum   = parseFloat(min) || 200;
  let estado, badgeClass, badgeLabel;

  if (stockNum <= minNum * 0.5) {
    estado = "critico"; badgeClass = "badge-critico"; badgeLabel = "● Crítico";
  } else if (stockNum <= minNum) {
    estado = "bajo"; badgeClass = "badge-suficiente"; badgeLabel = "● Bajo";
  } else {
    estado = "optimo"; badgeClass = "badge-optimo"; badgeLabel = "● Óptimo";
  }

  // Agregar fila a la tabla
  const tbody = document.querySelector("#tablaMateriales tbody");
  const colorHex = document.getElementById("matFormColor").value;
  const colorLbl = document.getElementById("matFormColorHex").value;

  const nuevaFila = document.createElement("tr");
  nuevaFila.dataset.nombre = nombre;
  nuevaFila.dataset.estado = estado;
  nuevaFila.innerHTML = `
    <td>
      <div style="font-weight:700;color:var(--text-dark);">${nombre}</div>
      <div style="font-size:11px;color:var(--text-muted);">
        Proveedor: ${proveedor || "—"}
      </div>
    </td>
    <td>
      <div style="display:flex;align-items:center;gap:8px;">
        <div style="width:13px;height:13px;border-radius:50%;
                    background:${colorHex};border:1px solid #E5E7EB;
                    flex-shrink:0;"></div>
        ${colorLbl}
      </div>
    </td>
    <td>
      <div style="font-weight:800;color:${estado === 'critico' ? 'var(--danger)' : estado === 'bajo' ? 'var(--warning)' : 'var(--text-dark)'};">
        ${parseFloat(stock).toLocaleString("es-CO")}g
      </div>
      ${estado !== 'optimo' ? `<div style="font-size:10px;color:var(--text-muted);">MIN: ${minNum}G</div>` : ''}
    </td>
    <td style="font-weight:600;">$${parseFloat(precio).toFixed(3)}</td>
    <td><span class="${badgeClass}">${badgeLabel}</span></td>
    <td>
      <div style="display:flex;gap:6px;justify-content:center;">
        <button class="op-btn-accion" title="Editar"
                onclick="opEditarMaterial('${nombre}','${colorLbl}','${stock}','${precio}','${min}')">
          <i class="bi bi-pencil"></i>
        </button>
        <button class="op-btn-accion" title="Reponer"
                onclick="opReponer('${nombre}')">
          <i class="bi bi-arrow-repeat"></i>
        </button>
        <button class="op-btn-accion rojo" title="Eliminar"
                onclick="opEliminarMaterial(this,'${nombre}')">
          <i class="bi bi-trash"></i>
        </button>
      </div>
    </td>
  `;

  // Animación de entrada
  nuevaFila.style.opacity   = "0";
  nuevaFila.style.transform = "translateY(-10px)";
  nuevaFila.style.transition= "opacity 0.3s, transform 0.3s";
  tbody.prepend(nuevaFila);
  requestAnimationFrame(() => {
    nuevaFila.style.opacity   = "1";
    nuevaFila.style.transform = "translateY(0)";
  });

  opCerrarModalMat();
  mostrarToastOp(`Material "${nombre}" guardado correctamente`, "success");
}

// PEDIDOS — Filtrar por estado
function opFiltrarPedidos(filtro, btnEl) {
  document.querySelectorAll(".op-filtro-btn").forEach(b => b.classList.remove("activo"));
  if (btnEl) btnEl.classList.add("activo");

  document.querySelectorAll(".op-pedido-card").forEach(card => {
    if (filtro === "todos") {
      card.style.display = "";
    } else {
      card.style.display = card.dataset.estado === filtro ? "" : "none";
    }
  });

  const total = filtro === "todos"
    ? document.querySelectorAll(".op-pedido-card").length
    : document.querySelectorAll(`.op-pedido-card[data-estado="${filtro}"]`).length;

  mostrarToastOp(
    ` ${total} pedido${total !== 1 ? "s" : ""} — ${LABELS_ESTADO[filtro] || "Todos"}`,
    "info"
  );
}

// PEDIDOS — Abrir modal de detalle
function abrirDetallePedido(id, nombre, estado, pct, material) {
  opPedidoActual = { id, nombre, estado, pct, material };

  // Rellenar modal
  document.getElementById("opModalId").textContent     = id;
  document.getElementById("opModalNombre").textContent  = nombre;
  document.getElementById("opModalPct").textContent     = pct + "%";
  document.getElementById("opModalBarra").style.width  = pct + "%";
  document.getElementById("opModalMat").textContent     = material;

  // Badge de estado
  const badge = document.getElementById("opModalEstadoBadge");
  badge.className  = "op-badge-estado " + estado;
  badge.textContent = LABELS_ESTADO[estado] || estado;

  // Flujo de pasos
  _opActualizarFlujoModal(estado);

  document.getElementById("opModalPedido").classList.add("abierto");
  document.body.style.overflow = "hidden";
}

function _opActualizarFlujoModal(estadoActual) {
  const pasos = [
    { id: "opPaso1", estados: ["en-proceso","terminado","entregado"], label: "Recibido" },
    { id: "opPaso2", estados: ["en-proceso"],                         label: "Imprimiendo" },
    { id: "opPaso3", estados: ["terminado"],                           label: "Finalizado" },
    { id: "opPaso4", estados: ["entregado"],                           label: "Entregado" }
  ];

  const idx = ESTADOS_FLUJO.indexOf(estadoActual);

  pasos.forEach((paso, i) => {
    const el = document.getElementById(paso.id);
    if (!el) return;
    el.classList.remove("done", "activo");

    if (i < idx)      el.classList.add("done");
    else if (i === idx) el.classList.add("activo");
  });
}

function opCerrarModalPedido(event) {
  const ov = document.getElementById("opModalPedido");
  if (event && event.target !== ov) return;
  ov.classList.remove("abierto");
  document.body.style.overflow = "";
  opPedidoActual = null;
}

// PEDIDOS — Avanzar estado
function opAvanzarEstado() {
  if (!opPedidoActual) return;

  const idxActual = ESTADOS_FLUJO.indexOf(opPedidoActual.estado);

  if (idxActual >= ESTADOS_FLUJO.length - 1) {
    mostrarToastOp("El pedido ya está en el estado final", "info");
    opCerrarModalPedido();
    return;
  }

  const nuevoEstado  = ESTADOS_FLUJO[idxActual + 1];
  const nuevoLabel   = LABELS_ESTADO[nuevoEstado];
  opPedidoActual.estado = nuevoEstado;

  // Actualizar badge dentro del modal
  const badge = document.getElementById("opModalEstadoBadge");
  badge.className   = "op-badge-estado " + nuevoEstado;
  badge.textContent = nuevoLabel;

  // Actualizar flujo visual
  _opActualizarFlujoModal(nuevoEstado);

  // Si termina → pct 100
  if (nuevoEstado === "terminado" || nuevoEstado === "entregado") {
    document.getElementById("opModalPct").textContent    = "100%";
    document.getElementById("opModalBarra").style.width = "100%";
  }

  // Actualizar la tarjeta en la lista de pedidos
  const card = document.querySelector(
    `.op-pedido-card[data-estado="${ESTADOS_FLUJO[idxActual]}"]`
  );
  if (card) {
    card.dataset.estado = nuevoEstado;
    const badgeCard = card.querySelector(".op-badge-estado");
    if (badgeCard) {
      badgeCard.className   = "op-badge-estado " + nuevoEstado;
      badgeCard.textContent = nuevoLabel;
    }
  }

  // También actualizar la cola en el dashboard
  const colaItem = document.querySelector(
    `.op-cola-item .op-badge-estado`
  );

  mostrarToastOp(
    `"${opPedidoActual.nombre}" avanzó a: ${nuevoLabel}`,
    "success"
  );

  setTimeout(() => opCerrarModalPedido(), 1200);
}

// PEDIDOS — Cancelar pedido
function opCancelarPedido() {
  if (!opPedidoActual) return;

  if (!confirm(`¿Cancelar el pedido "${opPedidoActual.id}"?`)) return;

  // Quitar la tarjeta de la lista
  const cards = document.querySelectorAll(".op-pedido-card");
  cards.forEach(card => {
    if (card.textContent.includes(opPedidoActual.id)) {
      card.style.transition = "opacity 0.3s";
      card.style.opacity    = "0";
      setTimeout(() => card.remove(), 320);
    }
  });

  mostrarToastOp(
    `Pedido ${opPedidoActual.id} cancelado. Se notificará al cliente.`,
    "error"
  );
  opCerrarModalPedido();
}

// CALCULADORA — Calcular precio
function opCalcular() {
  const precioPorG = parseInt(
    document.getElementById("calcMatOp")
      ?.selectedOptions[0]?.value || "450"
  );
  const peso       = parseFloat(document.getElementById("calcPesoOp")?.value   || "150");
  const tiempo     = parseFloat(document.getElementById("calcTiempoOp")?.value  || "12");
  const kwh        = parseFloat(document.getElementById("calcKwhOp")?.value     || "350");
  const watts      = parseFloat(document.getElementById("calcWattsOp")?.value   || "350");
  const manoHora   = parseFloat(document.getElementById("calcManoObraOp")?.value || "15000");
  const margenPct  = parseFloat(document.getElementById("calcMargenOp")?.value  || "30");

  // Cálculos base
  const costeMat    = Math.round(precioPorG * peso);
  const costeEnerg  = Math.round((watts / 1000) * tiempo * kwh);
  const costeMano   = Math.round(manoHora * tiempo);
  const amort       = Math.round(5000 * tiempo / 8); // $5000/h base amortización
  const subtotal    = costeMat + costeEnerg + costeMano + amort;
  const margen      = Math.round(subtotal * (margenPct / 100));
  const total       = subtotal + margen;

  // Totales
  const fmt = v => "$" + v.toLocaleString("es-CO");

  _setText("opPrecioTotal",    fmt(total));
  _setText("opDesgloseMat",    fmt(costeMat));
  _setText("opDesgloseEnerg",  fmt(costeEnerg));
  _setText("opDesgloseMano",   fmt(costeMano));
  _setText("opDesgloseAmort",  fmt(amort));

  // Barras de distribución
  const totalBase = costeMat + costeEnerg + costeMano + amort || 1;
  _setWidth("distMat",   (costeMat   / totalBase) * 100);
  _setWidth("distEnerg", (costeEnerg / totalBase) * 100);
  _setWidth("distMano",  (costeMano  / totalBase) * 100);
  _setWidth("distAmort", (amort      / totalBase) * 100);
}

function opReiniciarCalc() {
  document.getElementById("calcPesoOp").value     = "150";
  document.getElementById("calcTiempoOp").value   = "12";
  document.getElementById("calcKwhOp").value      = "350";
  document.getElementById("calcWattsOp").value    = "350";
  document.getElementById("calcManoObraOp").value = "15000";
  document.getElementById("calcMargenOp").value   = "30";
  document.getElementById("calcMatOp").selectedIndex = 0;

  // Resetear colores
  document.querySelectorAll(".op-color-swatch").forEach((s, i) => {
    s.classList.toggle("activo", i === 0);
  });
  opColorActual = "Morado";
  _setText("colorSeleccionadoLbl", "Morado");

  opCalcular();
  mostrarToastOp("Calculadora reiniciada", "info");
}

function opGuardarCalculo() {
  const total   = document.getElementById("opPrecioTotal")?.textContent || "$0";
  const material = document.getElementById("calcMatOp")
    ?.selectedOptions[0]?.text || "PLA";

  mostrarToastOp(
    `Estimación guardada: ${material} — ${total}`,
    "success"
  );
}

function opGenerarCotizacion() {
  mostrarToastOp("Generando cotización PDF...", "info");
  setTimeout(() => {
    mostrarToastOp("Cotización enviada al cliente por email", "success");
  }, 1800);
}

// CALCULADORA — Selección de color
function opSelectColor(el, nombre) {
  document.querySelectorAll(".op-color-swatch").forEach(s => {
    s.classList.remove("activo");
  });
  el.classList.add("activo");
  opColorActual = nombre;
  _setText("colorSeleccionadoLbl", nombre);
}

// CONFIGURACIÓN — Guardar
function opGuardarConfig() {
  const nombre = document.getElementById("cfgOpNombre")?.value.trim();
  const email  = document.getElementById("cfgOpEmail")?.value.trim();

  if (!nombre) {
    mostrarToastOp("El nombre es obligatorio", "error");
    return;
  }
  if (!email?.includes("@")) {
    mostrarToastOp("Ingresa un correo válido", "error");
    return;
  }

  // Actualizar sessionStorage
  sessionStorage.setItem("clienteNombre", nombre);
  sessionStorage.setItem("clienteEmail",  email);

  // Actualizar UI
  const iniciales = nombre.split(" ")
    .map(p => p[0]).join("").toUpperCase().slice(0, 2);

  const topNombre = document.getElementById("opNombreTopbar");
  const avatar    = document.getElementById("opAvatar");

  if (topNombre)   topNombre.textContent = nombre;
  if (avatar)      avatar.textContent    = iniciales;

  mostrarToastOp("Configuración guardada correctamente", "success");
}

function opDescartarConfig() {
  const nombre = sessionStorage.getItem("clienteNombre") || "";
  const email  = sessionStorage.getItem("clienteEmail")  || "";

  const cfgNombre = document.getElementById("cfgOpNombre");
  const cfgEmail  = document.getElementById("cfgOpEmail");

  if (cfgNombre) cfgNombre.value = nombre;
  if (cfgEmail)  cfgEmail.value  = email;

  mostrarToastOp("↩Cambios descartados", "info");
}

// CONFIGURACIÓN — Avatar
function opCambiarAvatar(input) {
  const archivo = input.files[0];
  if (!archivo) return;

  const reader = new FileReader();
  reader.onload = e => {
    const src = e.target.result;

    // Avatar topbar
    const av = document.getElementById("opAvatar");
    if (av) { av.innerHTML = ""; const img = new Image(); img.src = src; img.style.cssText = "width:100%;height:100%;object-fit:cover;border-radius:50%;"; av.appendChild(img); }

    // Avatar perfil (grande)
    const inner = document.getElementById("opAvatarInner");
    if (inner) { inner.innerHTML = ""; const img2 = new Image(); img2.src = src; img2.style.cssText = "width:100%;height:100%;object-fit:cover;"; inner.appendChild(img2); }

    mostrarToastOp("🖼️ Foto de perfil actualizada", "success");
  };
  reader.readAsDataURL(archivo);
}

function opEliminarAvatar() {
  const nombre = sessionStorage.getItem("clienteNombre") || "JP";
  const iniciales = nombre.split(" ").map(p => p[0]).join("").toUpperCase().slice(0, 2);

  const av    = document.getElementById("opAvatar");
  const inner = document.getElementById("opAvatarInner");

  if (av)    { av.innerHTML = iniciales; }
  if (inner) { inner.innerHTML = iniciales; }

  mostrarToastOp("Foto eliminada", "info");
}

// CONFIGURACIÓN — Tema
function opSelectTema(tema) {
  const temaClaro  = document.getElementById("temaClaro");
  const temaOscuro = document.getElementById("temaOscuro");
  const claroLbl   = document.getElementById("temaClaroLbl");
  const oscuroLbl  = document.getElementById("temaOscuroLbl");

  temaClaro?.classList.toggle("activo",  tema === "claro");
  temaOscuro?.classList.toggle("activo", tema === "oscuro");

  if (claroLbl)  { claroLbl.classList.toggle("activo",  tema === "claro"); }
  if (oscuroLbl) { oscuroLbl.classList.toggle("activo", tema === "oscuro"); }

  mostrarToastOp(
    tema === "claro" ? "Modo Claro activado" : "Modo Oscuro activado",
    "info"
  );
}

// TOASTS
function mostrarToastOp(mensaje, tipo = "info") {
  const c = document.getElementById("toastContainer");
  if (!c) return;

  const t = document.createElement("div");
  t.className = "toast-item " + tipo;
  const ico   = { success: "✅", error: "❌", info: "ℹ️" };
  t.innerHTML = `<span>${ico[tipo] || "ℹ️"}</span><span>${mensaje}</span>`;

  c.appendChild(t);
  setTimeout(() => {
    t.style.opacity    = "0";
    t.style.transition = "opacity 0.35s";
    setTimeout(() => t.remove(), 350);
  }, 3500);
}

// HELPERS INTERNOS
function _setText(id, val) {
  const el = document.getElementById(id);
  if (el) el.textContent = val;
}

function _setWidth(id, pct) {
  const el = document.getElementById(id);
  if (el) el.style.width = Math.max(0, Math.min(100, pct)) + "%";
}

// TECLA ESC — Cerrar modales
document.addEventListener("keydown", e => {
  if (e.key !== "Escape") return;

  const modales = ["opModalPedido", "opModalMat"];
  modales.forEach(id => {
    const m = document.getElementById(id);
    if (m?.classList.contains("abierto")) {
      m.classList.remove("abierto");
      document.body.style.overflow = "";
    }
  });

  const notif = document.getElementById("opNotifPanel");
  if (notif) { notif.style.display = "none"; opNotifOpen = false; }
});