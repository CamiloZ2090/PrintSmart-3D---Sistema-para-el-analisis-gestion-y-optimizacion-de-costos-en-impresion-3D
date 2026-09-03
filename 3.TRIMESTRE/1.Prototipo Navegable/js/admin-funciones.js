// ADMIN-FUNCIONES.JS
// Implementa todas las funciones del panel admin que estaban
// sin conectar. Depende de: app.js (mostrarToast, mostrarSeccion)
/* CSS DINÁMICO: Paneles flotantes y modales*/
(function inyectarCSS() {
  const style = document.createElement("style");
  style.textContent = `
    /* Panel flotante genérico (notificaciones, historial, filtros) */
    .panel-flotante {
      background: white;
      border: 1px solid var(--border);
      border-radius: 12px;
      box-shadow: 0 8px 32px rgba(0,0,0,0.13);
      overflow: hidden;
      animation: entrarPanel 0.18s ease;
    }
    @keyframes entrarPanel {
      from { opacity:0; transform:translateY(-8px); }
      to   { opacity:1; transform:translateY(0); }
    }
    .panel-cabecera {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 16px;
      border-bottom: 1px solid var(--border);
      font-size: 14px;
    }
    /* Ítem dentro de paneles (notificaciones / historial) */
    .notif-item {
      display: flex;
      align-items: flex-start;
      gap: 10px;
      padding: 10px 16px;
      border-bottom: 1px solid #F9FAFB;
      cursor: pointer;
      transition: background 0.15s;
    }
    .notif-item:hover { background: var(--purple-50); }
    .notif-item:last-child { border-bottom: none; }
    /* Ícono morado para paneles */
    .act-icono.morado { background: var(--purple-50); color: var(--purple-700); }
    /* Fondo oscuro del modal */
    .modal-overlay {
      position: fixed; inset: 0;
      background: rgba(0,0,0,0.45);
      z-index: 10000;
      display: none;
      align-items: center;
      justify-content: center;
    }
    /* Menú contextual */
    .menu-contextual {
      background: white;
      border-radius: 10px;
      box-shadow: 0 8px 30px rgba(0,0,0,0.15);
      border: 1px solid var(--border);
      overflow: hidden;
      animation: entrarPanel 0.15s ease;
    }
    .menu-item {
      padding: 9px 14px;
      cursor: pointer;
      font-size: 13.5px;
      display: flex;
      align-items: center;
      gap: 8px;
      transition: background 0.12s;
    }
    .menu-item:hover { background: var(--purple-50); color: var(--purple-700); }
  `;
  document.head.appendChild(style);
})();


/*1. TOPBAR — PANEL DE NOTIFICACIONES (campana)*/
function toggleNotificaciones() {
  let panel = document.getElementById("panelNotificaciones");
  if (!panel) {
    panel = document.createElement("div");
    panel.id = "panelNotificaciones";
    panel.className = "panel-flotante";
    panel.style.cssText =
      "display:none;position:fixed;top:62px;right:96px;width:310px;z-index:9500;";
    panel.innerHTML = `
      <div class="panel-cabecera">
        <span class="fw-700">Notificaciones</span>
        <span class="badge-critico" style="font-size:10px;padding:2px 8px;">3 Nuevas</span>
      </div>
      <div class="notif-item" onclick="mostrarToast('Stock crítico: Nylon 12 — solo 12 kg restantes','error')">
        <div class="act-icono rojo"><i class="bi bi-exclamation-triangle"></i></div>
        <div>
          <div class="act-titulo">Stock Crítico: Nylon 12 CF</div>
          <div class="act-sub">Solo 12 kg restantes (límite: 15 kg)</div>
          <div class="act-tiempo">HACE 10 MINUTOS</div>
        </div>
      </div>
      <div class="notif-item" onclick="mostrarToast('Pedido PP-9385 recibido de MedTech Solutions','info')">
        <div class="act-icono azul"><i class="bi bi-bag-plus"></i></div>
        <div>
          <div class="act-titulo">Nuevo Pedido #PP-9385</div>
          <div class="act-sub">MedTech Solutions • $3,800.00</div>
          <div class="act-tiempo">HACE 32 MINUTOS</div>
        </div>
      </div>
      <div class="notif-item" onclick="mostrarToast('Trabajo Unidad 02 completado exitosamente','success')">
        <div class="act-icono verde"><i class="bi bi-check-circle"></i></div>
        <div>
          <div class="act-titulo">Trabajo completado: Unidad 02</div>
          <div class="act-sub">Prototipo V2 — 45 piezas OK</div>
          <div class="act-tiempo">HACE 1 HORA</div>
        </div>
      </div>
      <div style="padding:10px 16px;">
        <button class="btn-outline w-100 justify-content-center"
                style="font-size:12px;padding:6px;"
                onclick="mostrarToast('Todas las notificaciones marcadas como leídas','info');
                         document.getElementById('panelNotificaciones').style.display='none';
                         document.querySelector('.punto-rojo').style.display='none';">
          Marcar todas como leídas
        </button>
      </div>`;
    document.body.appendChild(panel);
  }
  _alternarPanel(panel);
}


/*2. TOPBAR — HISTORIAL DE ACCIONES (reloj)*/
function toggleHistorial() {
  let panel = document.getElementById("panelHistorial");
  if (!panel) {
    panel = document.createElement("div");
    panel.id = "panelHistorial";
    panel.className = "panel-flotante";
    panel.style.cssText =
      "display:none;position:fixed;top:62px;right:52px;width:285px;z-index:9500;";
    panel.innerHTML = `
      <div class="panel-cabecera">
        <span class="fw-700">Historial Reciente</span>
      </div>
      <div class="notif-item">
        <div class="act-icono morado"><i class="bi bi-file-earmark-text"></i></div>
        <div>
          <div class="act-titulo">Cotización PP-9382 generada</div>
          <div class="act-tiempo">HOY 10:24</div>
        </div>
      </div>
      <div class="notif-item">
        <div class="act-icono azul"><i class="bi bi-person-check"></i></div>
        <div>
          <div class="act-titulo">Usuario Sarah Kovac modificado</div>
          <div class="act-tiempo">AYER 18:45</div>
        </div>
      </div>
      <div class="notif-item">
        <div class="act-icono verde"><i class="bi bi-box-seam"></i></div>
        <div>
          <div class="act-titulo">Material PLA+ Carbon registrado</div>
          <div class="act-tiempo">AYER 14:10</div>
        </div>
      </div>
      <div class="notif-item">
        <div class="act-icono amarillo"><i class="bi bi-download"></i></div>
        <div>
          <div class="act-titulo">Dashboard PDF exportado</div>
          <div class="act-tiempo">12 MAY 09:00</div>
        </div>
      </div>`;
    document.body.appendChild(panel);
  }
  _alternarPanel(panel);
}


/*3. SIDEBAR — MODAL NUEVO TRABAJO DE IMPRESIÓN*/
function abrirNuevoTrabajo() {
  let overlay = document.getElementById("modalNuevoTrabajo");
  if (!overlay) {
    overlay = document.createElement("div");
    overlay.id = "modalNuevoTrabajo";
    overlay.className = "modal-overlay";
    overlay.innerHTML = `
      <div class="card-custom" style="width:480px;max-height:88vh;overflow-y:auto;position:relative;">
        <div class="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h5 class="fw-800 mb-0">Nuevo Trabajo de Impresión</h5>
            <div class="texto-muted" style="font-size:13px;">Complete los datos para registrar el trabajo</div>
          </div>
          <button onclick="cerrarNuevoTrabajo()" class="btn-cerrar"><i class="bi bi-x"></i></button>
        </div>
        <label class="campo-label">Cliente / Empresa</label>
        <input class="campo-form mb-3" type="text" id="ntCliente" placeholder="Ej: Industrial Tech S.A."/>

        <label class="campo-label">Descripción del Modelo</label>
        <input class="campo-form mb-3" type="text" id="ntModelo" placeholder="Ej: Engranaje Helicoidal v3"/>

        <div class="row g-2 mb-3">
          <div class="col-6">
            <label class="campo-label">Material</label>
            <select class="select-form" id="ntMaterial">
              <option>PLA Carbon Fiber</option>
              <option>PETG Neon Orange</option>
              <option>Tough Resin V4</option>
              <option>Nylon 12 CF</option>
              <option>PEEK Engineering</option>
            </select>
          </div>
          <div class="col-6">
            <label class="campo-label">Prioridad</label>
            <select class="select-form" id="ntPrioridad">
              <option>Normal</option>
              <option>Alta</option>
              <option>Urgente</option>
            </select>
          </div>
        </div>

        <label class="campo-label">Máquina Asignada</label>
        <select class="select-form mb-3" id="ntMaquina">
          <option>Unidad 01 — Formlabs 3L (en uso)</option>
          <option>Unidad 02 — Stratasys F370 (en uso)</option>
          <option>Unidad 03 — Markforged X7 (en uso)</option>
          <option>✅ Unidad 04 — HP MultiJet (libre)</option>
        </select>

        <label class="campo-label">Notas / Instrucciones especiales</label>
        <textarea class="campo-form mb-4" id="ntNotas" rows="3"
                  placeholder="Tolerancias, densidad de relleno, acabados, etc."
                  style="resize:vertical;"></textarea>

        <button class="btn-primario w-100 justify-content-center mb-2"
                onclick="confirmarNuevoTrabajo()">
          <i class="bi bi-plus-circle"></i> Crear Trabajo de Impresión
        </button>
        <button class="btn-outline w-100 justify-content-center"
                onclick="cerrarNuevoTrabajo()">Cancelar</button>
      </div>`;
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) cerrarNuevoTrabajo();
    });
    document.body.appendChild(overlay);
  }
  overlay.style.display = "flex";
}

function cerrarNuevoTrabajo() {
  const el = document.getElementById("modalNuevoTrabajo");
  if (el) el.style.display = "none";
}

function confirmarNuevoTrabajo() {
  const cliente = (document.getElementById("ntCliente").value || "").trim();
  const modelo  = (document.getElementById("ntModelo").value  || "").trim();
  if (!cliente) {
    mostrarToast("El nombre del cliente es obligatorio", "error");
    return;
  }
  mostrarToast(
    `✅ Trabajo "${modelo || "Sin título"}" creado para ${cliente}`,
    "success"
  );
  cerrarNuevoTrabajo();
  document.getElementById("ntCliente").value = "";
  document.getElementById("ntModelo").value  = "";
  document.getElementById("ntNotas").value   = "";
}


/*4. SIDEBAR — CENTRO DE AYUDA*/
function mostrarCentroAyuda() {
  mostrarToast("📖 Redirigiendo al Centro de Ayuda...", "info");
}


/*5. DASHBOARD — CAMBIAR PERÍODO (Últimos 30 Días)*/
const _periodos = ["Últimos 7 Días", "Últimos 30 Días", "Últimos 90 Días", "Este Año"];
let _indicePeriodo = 1;

function cambiarPeriodo(btn) {
  _indicePeriodo = (_indicePeriodo + 1) % _periodos.length;
  btn.innerHTML = `<i class="bi bi-calendar3"></i> ${_periodos[_indicePeriodo]}`;
  mostrarToast(`Período actualizado: ${_periodos[_indicePeriodo]}`, "info");
}


/* 6. DASHBOARD — FILTRAR INVENTARIO RÁPIDO (embudo)*/
let _filtroInvEstado = 0; // 0=todos, 1=Óptimo, 2=Crítico

function filtrarInventarioRapido() {
  const estados = ["todos", "Óptimo", "Crítico"];
  _filtroInvEstado = (_filtroInvEstado + 1) % estados.length;

  // Actúa sobre la tabla del dashboard (sec-dashboard)
  const filas = document.querySelectorAll(
    "#sec-dashboard .tabla-custom tbody tr"
  );
  filas.forEach((fila) => {
    if (estados[_filtroInvEstado] === "todos") {
      fila.style.display = "";
    } else {
      const badge = fila.querySelector('[class*="badge-"]');
      const txt = badge ? badge.textContent.trim() : "";
      fila.style.display = txt.includes(estados[_filtroInvEstado]) ? "" : "none";
    }
  });

  const etiquetas = [
    "Mostrando: Todos los materiales",
    "Mostrando: Solo Óptimos",
    "Mostrando: Solo Críticos",
  ];
  mostrarToast(etiquetas[_filtroInvEstado], "info");
}


/*7. DASHBOARD — MENÚ OPCIONES INVENTARIO (tres puntos)*/
function opcionesInventario() {
  _mostrarMenuContextual([
    {
      icono: "bi-sort-down-alt",
      texto: "Ordenar por Estado",
      fn: () => mostrarToast("Tabla ordenada por estado", "info"),
    },
    {
      icono: "bi-download",
      texto: "Exportar a CSV",
      fn: () => {
        const datos = [
          ["Material", "Cantidad", "Estado", "Consumo Diario", "Previsión"],
          ["Resina Industrial Gris V4", "142 L", "Óptimo", "4.2 L/día", "34 Días"],
          ["Nylon 12 Fibra Carbono", "12 kg", "Crítico", "1.5 kg/día", "8 Días"],
          ["Polvo Titanio Gr5", "850 kg", "Óptimo", "12 kg/día", "71 Días"],
        ];
        _descargarCSV(datos, "inventario_dashboard.csv");
        mostrarToast("📥 Inventario exportado", "success");
      },
    },
    {
      icono: "bi-arrow-clockwise",
      texto: "Actualizar datos",
      fn: () => mostrarToast("✅ Datos actualizados", "success"),
    },
    {
      icono: "bi-printer",
      texto: "Imprimir tabla",
      fn: () => { mostrarToast("🖨 Enviando a impresora...", "info"); },
    },
  ]);
}


/* 8. DASHBOARD — APLICAR OPTIMIZACIÓN*/
function aplicarOptimizacion(btn) {
  btn.disabled = true;
  btn.innerHTML = "⏳ Aplicando optimización...";

  setTimeout(() => {
    // Actualizar visualmente la Unidad 04 en el dashboard
    const cards = document.querySelectorAll("#sec-dashboard .maquina-card");
    if (cards[3]) {
      const pct  = cards[3].querySelector(".maquina-pct");
      const fill = cards[3].querySelector(".barra-fill");
      const info = cards[3].querySelector(".maquina-info");
      if (pct)  { pct.textContent = "35%"; pct.className = "maquina-pct amarillo"; }
      if (fill) { fill.style.width = "35%"; fill.classList.add("amarillo"); }
      if (info) info.innerHTML =
        '<i class="bi bi-clock me-1"></i>Asignada • Pedido Aeroespacial A8';
    }
    mostrarToast("✅ Unidad 04 redirigida a pedidos aeroespaciales de alta prioridad", "success");
    btn.innerHTML = "✅ Optimización Aplicada";
  }, 1600);
}


/*9. DASHBOARD — VER TODA LA ACTIVIDAD*/
function verTodaActividad() {
  mostrarSeccion("pedidos", document.getElementById("nav-pedidos"));
}


/*10. MATERIALES — PANEL DE FILTROS*/
function filtrarMateriales() {
  let panel = document.getElementById("panelFiltroMateriales");
  if (!panel) {
    panel = document.createElement("div");
    panel.id = "panelFiltroMateriales";
    panel.className = "panel-flotante";
    panel.style.cssText =
      "display:none;position:fixed;top:200px;right:28px;width:230px;z-index:9500;padding:14px 16px;";
    panel.innerHTML = `
      <div class="fw-700 mb-3" style="font-size:14px;">Filtrar Materiales</div>
      <div class="etiqueta-seccion mb-2">ESTADO</div>
      ${["Todos","Óptimo","Suficiente","Crítico"].map((e) => `
        <label style="cursor:pointer;font-size:13px;display:flex;gap:6px;margin-bottom:6px;align-items:center;">
          <input type="radio" name="rfMat" value="${e}" ${e==="Todos"?"checked":""}
                 onchange="aplicarFiltroMateriales('${e}')"> ${e}
        </label>`).join("")}
      <div class="etiqueta-seccion mb-2 mt-3">TIPO</div>
      ${["Todos","PLA","PETG","Resina SLA","Nylon"].map((t) => `
        <label style="cursor:pointer;font-size:13px;display:flex;gap:6px;margin-bottom:6px;align-items:center;">
          <input type="radio" name="rfTipo" value="${t}" ${t==="Todos"?"checked":""}
                 onchange="mostrarToast('Tipo: ${t}','info')"> ${t}
        </label>`).join("")}
      <button class="btn-outline w-100 justify-content-center mt-3"
              style="font-size:12px;padding:6px;"
              onclick="aplicarFiltroMateriales('Todos');
                       document.getElementById('panelFiltroMateriales').style.display='none';">
        Limpiar filtros
      </button>`;
    document.body.appendChild(panel);
  }
  _alternarPanel(panel);
}

function aplicarFiltroMateriales(estado) {
  const filas = document.querySelectorAll("#sec-materiales .tabla-custom tbody tr");
  filas.forEach((fila) => {
    if (estado === "Todos") { fila.style.display = ""; return; }
    const badge = fila.querySelector('[class*="badge-"]');
    const txt = badge ? badge.textContent.trim() : "";
    fila.style.display = txt.toLowerCase().includes(estado.toLowerCase()) ? "" : "none";
  });
  if (estado !== "Todos") mostrarToast(`Filtro aplicado: ${estado}`, "info");
}


/* 11. MATERIALES — EXPORTAR CSV*/
function exportarMateriales() {
  mostrarToast("📥 Generando CSV de inventario...", "info");
  const datos = [
    ["Material", "Tipo", "Proveedor", "Stock", "Punto Re-pedido", "Precio/Kg", "Estado"],
    ["PLA Carbon Fiber 1.75mm", "PLA",      "Proto-Pasta Inc.", "12.5 kg", "5.0 kg", "$45.00",  "Óptimo"],
    ["PETG Neon Orange 2.85mm", "PETG",     "Filamentum",       "2.1 kg",  "3.0 kg", "$32.50",  "Crítico"],
    ["Tough Resin V4 SLA",      "Resina",   "Formlabs",         "5.0 L",   "2.0 L",  "$175.00", "Suficiente"],
  ];
  setTimeout(() => {
    _descargarCSV(datos, "inventario_maestro.csv");
    mostrarToast("✅ Inventario exportado correctamente", "success");
  }, 600);
}


/* 12. MATERIALES — CLIC EN FILA (ver detalle) */
function verDetalleMaterial(nombre, proveedor, stock, precio, estado) {
  mostrarToast(`📦 ${nombre} · ${stock} · ${precio}/kg · Estado: ${estado}`, "info");
}


/* 13. PEDIDOS — PANEL DE FILTROS */
function filtrarPedidos(btn) {
  let panel = document.getElementById("panelFiltrosPedidos");
  if (!panel) {
    panel = document.createElement("div");
    panel.id = "panelFiltrosPedidos";
    panel.className = "panel-flotante";
    panel.style.cssText =
      "display:none;position:fixed;top:200px;right:28px;width:220px;z-index:9500;padding:14px 16px;";
    panel.innerHTML = `
      <div class="fw-700 mb-3" style="font-size:14px;">Filtrar Pedidos</div>
      <div class="etiqueta-seccion mb-2">ESTADO</div>
      ${["Todos","Pendiente Técnico","Pendiente Finanzas"].map((e) => `
        <label style="cursor:pointer;font-size:13px;display:flex;gap:6px;margin-bottom:6px;align-items:center;">
          <input type="radio" name="rfPed" value="${e}" ${e==="Todos"?"checked":""}
                 onchange="aplicarFiltroPedidos('${e}')"> ${e}
        </label>`).join("")}
      <div class="etiqueta-seccion mb-2 mt-3">MARGEN</div>
      ${["Todos","Alto >30%","Bajo ≤30%"].map((m) => `
        <label style="cursor:pointer;font-size:13px;display:flex;gap:6px;margin-bottom:6px;align-items:center;">
          <input type="radio" name="rfMargen" value="${m}" ${m==="Todos"?"checked":""}
                 onchange="mostrarToast('Filtro margen: ${m}','info')"> ${m}
        </label>`).join("")}
      <button class="btn-outline w-100 justify-content-center mt-3"
              style="font-size:12px;padding:6px;"
              onclick="aplicarFiltroPedidos('Todos');
                       document.getElementById('panelFiltrosPedidos').style.display='none';">
        Limpiar filtros
      </button>`;
    document.body.appendChild(panel);
  }
  _alternarPanel(panel);
}

function aplicarFiltroPedidos(estado) {
  const mapa = {
    "Pendiente Técnico":  "PENDIENTE TÉCNICO",
    "Pendiente Finanzas": "PENDIENTE FINANZAS",
  };
  const filas = document.querySelectorAll("#sec-pedidos .tabla-custom tbody tr");
  filas.forEach((fila) => {
    if (estado === "Todos") { fila.style.display = ""; return; }
    const badge = fila.querySelector('[class*="badge-pend"]');
    const txt = badge ? badge.textContent.trim() : "";
    fila.style.display = txt === (mapa[estado] || estado) ? "" : "none";
  });
  if (estado !== "Todos") mostrarToast(`Filtro activo: ${estado}`, "info");
}


/*14. PEDIDOS — EXPORTAR CSV*/
function exportarPedidosCSV() {
  mostrarToast("📥 Generando CSV de pedidos...", "info");
  const datos = [
    ["ID Pedido","Cliente","Contacto","Modelo","Material","Costo","Precio","Margen","Estado"],
    ["#PP-9382","Industrial Tech S.A.","Juan Pérez","Engranaje Helicoidal v2","PEEK Carbon-Filled","$1,240.00","$1,760.00","42.5%","Pendiente Técnico"],
    ["#PP-9383","BioLab Medical","Laura Gómez","Soporte Micro-fluídico","Resina Biocompatible","$890.00","$1,050.00","18.2%","Pendiente Finanzas"],
    ["#PP-9384","AutoParts Nord","Roberto Díaz","Prototipo Carcasa E1","Nylon 12 CF","$1,100.00","$1,485.00","35.0%","Pendiente Técnico"],
  ];
  setTimeout(() => {
    _descargarCSV(datos, "pedidos_pendientes.csv");
    mostrarToast("✅ CSV descargado: pedidos_pendientes.csv", "success");
  }, 500);
}


/* 15. REPORTES — CAMBIAR PERÍODO */
const _periodosRep = [
  "01 Ene – 31 Mar", "01 Abr – 30 Jun",
  "01 Jul – 30 Sep", "01 Oct – 31 Dic",
];
let _idxPeriodoRep = 2;

function cambiarPeriodoReporte(btn) {
  _idxPeriodoRep = (_idxPeriodoRep + 1) % _periodosRep.length;
  btn.innerHTML = `<i class="bi bi-calendar3"></i> ${_periodosRep[_idxPeriodoRep]}`;
  mostrarToast(`Período de reporte: ${_periodosRep[_idxPeriodoRep]}`, "info");
}


/*16. REPORTES — EXPORTAR EXCEL (CSV)*/
function exportarExcel() {
  mostrarToast("📊 Generando hoja Excel...", "info");
  const datos = [
    ["Mes","Ingresos","Gastos","Beneficio Neto","Margen %"],
    ["Julio 2023",   "$120,000","$45,000","$75,000","62.5%"],
    ["Agosto 2023",  "$145,000","$58,000","$87,000","60.0%"],
    ["Septiembre 2023","$98,000","$38,000","$60,000","61.2%"],
    ["Octubre 2023", "$189,000","$72,000","$117,000","61.9%"],
    ["TOTAL Q3/Q4",  "$552,000","$213,000","$339,000","61.4%"],
  ];
  setTimeout(() => {
    _descargarCSV(datos, "reporte_financiero_q3.csv");
    mostrarToast("✅ Reporte Excel descargado", "success");
  }, 600);
}


/*17. REPORTES — EXPORTAR PDF */
function exportarPDFReporte() {
  mostrarToast("⏳ Generando reporte PDF...", "info");

  if (!window.jspdf) {
    setTimeout(() => mostrarToast("✅ Reporte PDF descargado", "success"), 1800);
    return;
  }

  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  // Encabezado morado
  doc.setFillColor(91, 33, 182);
  doc.rect(0, 0, 210, 32, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(17);
  doc.text("PrintSmart 3D — Análisis de Desempeño", 105, 14, { align: "center" });
  doc.setFontSize(10);
  doc.text("Período: 01 Jul – 30 Sep 2023", 105, 24, { align: "center" });

  // KPIs
  doc.setTextColor(31, 41, 55);
  doc.setFontSize(13);
  doc.text("Indicadores Clave del Período", 14, 46);
  doc.setFontSize(10);
  doc.setTextColor(80);
  const kpis = [
    ["Ingresos Totales",        "$452,800",  "+12.5%"],
    ["ROI Promedio Impresoras", "2.4x",       "Estable"],
    ["Tasa de Desperdicio",     "3.15%",      "-4.2%"],
    ["Eficiencia Operativa",    "94.2%",      "+8.1%"],
  ];
  let y = 56;
  kpis.forEach(([k, v, b]) => {
    doc.text(`${k}: ${v}  (${b})`, 14, y);
    y += 8;
  });

  doc.setDrawColor(200);
  doc.line(14, y + 3, 196, y + 3);

  // Operadores
  doc.setFontSize(13);
  doc.setTextColor(31, 41, 55);
  doc.text("Eficiencia de Operadores", 14, y + 14);
  doc.setFontSize(10);
  doc.setTextColor(80);
  const ops = [
    ["Roberto Castillo", "Mañana", "1,240 pzs", "99.2%", "98.5%"],
    ["Marta López",      "Tarde",  "1,105 pzs", "98.8%", "96.2%"],
    ["Samuel Jiménez",   "Noche",  "980 pzs",   "94.5%", "89.4%"],
  ];
  y += 24;
  ops.forEach(([n, t, p, c, e]) => {
    doc.text(`${n} (${t}): ${p} · Calidad ${c} · Eficiencia ${e}`, 14, y);
    y += 8;
  });

  // Pie
  doc.setFontSize(8);
  doc.setTextColor(150);
  doc.text(
    "PrintSmart 3D · Generado: " + new Date().toLocaleString("es-CO"),
    105, 285, { align: "center" }
  );

  doc.save("reporte_desempeno_q3_2023.pdf");
  setTimeout(() => mostrarToast("✅ Reporte PDF descargado", "success"), 400);
}


/*18. REPORTES — CLIC EN FILA DE OPERADORES*/
function verDetalleOperador(nombre, turno, produccion, calidad, eficiencia) {
  mostrarToast(
    `👷 ${nombre} (${turno}) — ${produccion} · Calidad: ${calidad} · Eficiencia: ${eficiencia}`,
    "info"
  );
}


/*19. USUARIOS — PAGINACIÓN*/
let _paginaActual  = 1;
const _totalUsers  = 1284;
const _usersPagina = 4;

function paginaAnterior() {
  if (_paginaActual <= 1) {
    mostrarToast("Ya estás en la primera página", "info");
    return;
  }
  _paginaActual--;
  _actualizarFooterUsuarios();
}

function paginaSiguiente() {
  const totalPags = Math.ceil(_totalUsers / _usersPagina);
  if (_paginaActual >= totalPags) {
    mostrarToast("Ya estás en la última página", "info");
    return;
  }
  _paginaActual++;
  _actualizarFooterUsuarios();
}

function _actualizarFooterUsuarios() {
  const footer = document.querySelector(".tabla-footer-usuarios span");
  if (!footer) return;
  const inicio = (_paginaActual - 1) * _usersPagina + 1;
  const fin    = Math.min(_paginaActual * _usersPagina, _totalUsers);
  footer.textContent = `Mostrando ${inicio}–${fin} de ${_totalUsers.toLocaleString("es-CO")} usuarios`;
  mostrarToast(`Página ${_paginaActual}`, "info");
}


/*20. CONFIGURACIÓN — GUARDAR PREFERENCIAS REGIONALES*/
function guardarRegionales() {
  const idioma = document.getElementById("selectIdioma")?.value || "Español (Colombia)";
  const zona   = document.getElementById("selectZona")?.value   || "UTC-05:00 Bogotá";
  mostrarToast(`✅ Preferencias guardadas · ${idioma} · ${zona}`, "success");
}


/*21. CÁLCULOS — VER MATERIALES ALTERNATIVOS*/
function verMaterialesAlternativos() {
  mostrarSeccion("materiales", document.getElementById("nav-materiales"));
}


/*UTILIDADES PRIVADAS */

/** Alterna visibilidad de un panel y cierra los demás */
function _alternarPanel(panel) {
  const abierto = panel.style.display === "block";
  _cerrarTodosLosPaneles();
  panel.style.display = abierto ? "none" : "block";
}

/** Cierra todos los paneles flotantes */
function _cerrarTodosLosPaneles() {
  [
    "panelNotificaciones", "panelHistorial",
    "panelFiltroMateriales", "panelFiltrosPedidos",
  ].forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.style.display = "none";
  });
}

/** Descarga un array de arrays como archivo CSV */
function _descargarCSV(filas, nombreArchivo) {
  const contenido = filas
    .map((f) => f.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(","))
    .join("\n");
  const blob = new Blob(["\uFEFF" + contenido], {
    type: "text/csv;charset=utf-8;",
  });
  const url = URL.createObjectURL(blob);
  const a   = document.createElement("a");
  a.href     = url;
  a.download = nombreArchivo;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/** Coordenadas del último clic (para posicionar el menú contextual) */
let _lastClick = { x: 300, y: 200 };
document.addEventListener("click", (e) => {
  _lastClick = { x: e.clientX, y: e.clientY };
});

/** Muestra un menú contextual con opciones */
function _mostrarMenuContextual(opciones) {
  const prev = document.getElementById("_menuCtx");
  if (prev) prev.remove();

  const menu = document.createElement("div");
  menu.id = "_menuCtx";
  menu.className = "menu-contextual";
  menu.style.cssText = `position:fixed;z-index:10000;min-width:190px;`;

  opciones.forEach((op) => {
    const item = document.createElement("div");
    item.className = "menu-item";
    item.innerHTML = `<i class="bi ${op.icono}"></i> ${op.texto}`;
    item.addEventListener("click", () => { op.fn(); menu.remove(); });
    menu.appendChild(item);
  });

  // Posicionar cerca del clic sin salirse de la ventana
  const x = Math.min(_lastClick.x, window.innerWidth  - 200);
  const y = Math.min(_lastClick.y, window.innerHeight - opciones.length * 38 - 10);
  menu.style.left = x + "px";
  menu.style.top  = y + "px";
  document.body.appendChild(menu);

  setTimeout(() => {
    document.addEventListener("click", () => menu.remove(), { once: true });
  }, 50);
}

/** Cierra paneles al hacer clic fuera de ellos */
document.addEventListener("click", (e) => {
  const paneles = ["panelNotificaciones", "panelHistorial"];
  paneles.forEach((id) => {
    const panel = document.getElementById(id);
    if (panel && panel.style.display === "block") {
      if (!panel.contains(e.target) && !e.target.closest(".topbar-btn")) {
        panel.style.display = "none";
      }
    }
  });

  const filtros = ["panelFiltroMateriales", "panelFiltrosPedidos"];
  filtros.forEach((id) => {
    const panel = document.getElementById(id);
    if (panel && panel.style.display === "block") {
      if (!panel.contains(e.target) && !e.target.closest(".btn-outline")) {
        panel.style.display = "none";
      }
    }
  });
});
