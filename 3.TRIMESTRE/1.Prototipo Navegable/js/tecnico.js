// TECNICO.JS — Lógica del panel Técnico

// DATOS SIMULADOS DEL HISTORIAL 
let historialData = [
  { id:"MNT-089", impresora:"Impresora #5", tipo:"preventivo",  tecnico:"Juan Rodríguez", fecha:"27/08/2026", duracion:"2h",   resultado:"ok",      fotos:3 },
  { id:"MNT-088", impresora:"Impresora #2", tipo:"correctivo",  tecnico:"Juan Rodríguez", fecha:"25/08/2026", duracion:"3.5h", resultado:"reparado", fotos:5 },
  { id:"MNT-087", impresora:"Impresora #7", tipo:"diagnostico", tecnico:"Juan Rodríguez", fecha:"24/08/2026", duracion:"1h",   resultado:"parcial",  fotos:2 },
  { id:"MNT-086", impresora:"Impresora #1", tipo:"preventivo",  tecnico:"Juan Rodríguez", fecha:"22/08/2026", duracion:"2h",   resultado:"ok",      fotos:0 },
  { id:"MNT-085", impresora:"Impresora #8", tipo:"preventivo",  tecnico:"Juan Rodríguez", fecha:"20/08/2026", duracion:"1.5h", resultado:"ok",      fotos:1 },
  { id:"MNT-084", impresora:"Impresora #3", tipo:"correctivo",  tecnico:"Juan Rodríguez", fecha:"15/08/2026", duracion:"4h",   resultado:"reparado", fotos:7 },
];

let fotosRegistro = [];
let tipoMantActual = "preventivo";
let impDiagActual  = null;

// FILTROS DEL HISTORIAL (texto + tipo + fecha; se combinan entre sí)
let filtroTexto = "";
let filtroTipo  = "all";
let filtroRango = "mes";           // debe coincidir con la 1ª opción del <select> de fecha
let historialVisible = historialData; // último resultado filtrado (lo usa Exportar)

// NOTIFICACIONES SIMULADAS (panel de la campana) 
let notificacionesData = [
  { icono:"bi-thermometer-high", tipo:"err",  texto:"Impresora #7 — temperatura del hotend inestable, requiere diagnóstico", tiempo:"Hace 20 min",     seccion:"impresoras", leida:false },
  { icono:"bi-tools",            tipo:"warn", texto:"Mantenimiento correctivo pendiente — Impresora #3 (falla en extrusor)",   tiempo:"Hace 1 h",        seccion:"registro",   leida:false },
  { icono:"bi-shield-check",     tipo:"ok",   texto:"Mantenimiento preventivo completado — Impresoras #1 y #2",               tiempo:"Ayer, 4:30 p.m.", seccion:"historial",  leida:true  },
];

// INIT 
document.addEventListener("DOMContentLoaded", () => {
  // Fecha/hora por defecto en el formulario
  const ahora = new Date();
  const inp = document.getElementById("regFecha");
  if (inp) inp.value = ahora.toISOString().slice(0, 16);

  // Prellenar nombre del técnico desde sesión si está guardado
  const nombreGuardado = sessionStorage.getItem("tecnicoNombre");
  if (nombreGuardado) {
    const el = document.getElementById("regTecnico");
    if (el) el.value = nombreGuardado;
  }

  aplicarFiltrosHistorial();
  renderizarNotificaciones();
  actualizarBadgeNotif();
});

// NAVEGACIÓN 
function irASeccion(id) {
  const nav = document.getElementById("nav-" + id) || document.querySelector(`[data-seccion="${id}"]`);
  mostrarSeccion(id, nav);
}

function irARegistro(tipo, impresora) {
  irASeccion("registro");
  setTimeout(() => {
    const tab = document.getElementById("tab-" + tipo);
    if (tab) setTipoMant(tipo, tab);
    if (impresora) {
      const sel = document.getElementById("regImpresora");
      if (sel) { sel.value = impresora; actualizarPreview(); }
    }
  }, 80);
}

// TIPO DE MANTENIMIENTO
function setTipoMant(tipo, boton) {
  tipoMantActual = tipo;
  document.querySelectorAll(".tipo-tab").forEach(b => b.classList.remove("activo"));
  boton.classList.add("activo");

  const checklist = document.getElementById("checklistWrap");
  if (checklist) checklist.style.display = tipo === "preventivo" ? "block" : "none";

  actualizarPreview();
}

// CARGA DE FOTOS
function cargarFotos(input) {
  const archivos = Array.from(input.files);
  if (!archivos.length) return;

  let cargadas = 0;
  archivos.forEach(archivo => {
    if (!archivo.type.startsWith("image/")) {
      mostrarToast("Solo se permiten imágenes (JPG, PNG, WEBP)", "error");
      return;
    }
    if (archivo.size > 10 * 1024 * 1024) {
      mostrarToast(`${archivo.name} supera los 10 MB`, "error");
      return;
    }
    const reader = new FileReader();
    reader.onload = e => {
      fotosRegistro.push({ nombre: archivo.name, src: e.target.result });
      cargadas++;
      renderizarGaleria();
      actualizarPreview();
      if (cargadas === archivos.length) {
        mostrarToast(`${cargadas} foto(s) cargada(s)`, "success");
      }
    };
    reader.readAsDataURL(archivo);
  });
}

function renderizarGaleria() {
  const galeria = document.getElementById("galeriaFotos");
  const lbl     = document.getElementById("lblConteoFotos");
  if (!galeria) return;

  galeria.innerHTML = fotosRegistro.map((foto, i) => `
    <div class="foto-mini">
      <img src="${foto.src}" alt="${foto.nombre}" title="${foto.nombre}"/>
      <button class="foto-del" onclick="eliminarFoto(${i})"><i class="bi bi-x"></i></button>
    </div>
  `).join("");

  if (lbl) lbl.textContent = fotosRegistro.length
    ? `${fotosRegistro.length} foto(s) cargada(s)`
    : "Sin fotos aún";
}

function eliminarFoto(idx) {
  fotosRegistro.splice(idx, 1);
  renderizarGaleria();
  actualizarPreview();
}

function dragSobre(e) {
  e.preventDefault();
  document.getElementById("zonaImg")?.classList.add("sobre");
}
function dragFuera(e) {
  document.getElementById("zonaImg")?.classList.remove("sobre");
}
function soltarFotos(e) {
  e.preventDefault();
  document.getElementById("zonaImg")?.classList.remove("sobre");
  const dt    = new DataTransfer();
  const files = Array.from(e.dataTransfer.files);
  files.forEach(f => dt.items.add(f));
  const input = document.getElementById("inputFotos");
  input.files = dt.files;
  cargarFotos(input);
}

// PREVIEW EN TIEMPO REAL 
function actualizarPreview() {
  const tecnico  = document.getElementById("regTecnico")?.value || "—";
  const sel      = document.getElementById("regImpresora");
  const imp      = sel ? (sel.options[sel.selectedIndex]?.text || "—") : "—";
  const resultado = document.getElementById("regResultado")?.value || "ok";

  const mapRes = {
    ok:      "Funcionando",
    parcial: "Requiere seguimiento",
    falla:   "Falla grave",
    reparado:"Reparado"
  };

  const set = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };

  set("prev-tecnico",   tecnico || "—");
  set("prev-impresora", imp === "— Seleccionar impresora —" ? "—" : imp);
  set("prev-tipo",      tipoMantActual.charAt(0).toUpperCase() + tipoMantActual.slice(1));
  set("prev-resultado", mapRes[resultado] || "—");
  set("prev-fotos",     fotosRegistro.length + " imagen(es)");
}

// GUARDAR MANTENIMIENTO
function guardarMantenimiento() {
  const tecnico     = document.getElementById("regTecnico")?.value.trim();
  const impresora   = document.getElementById("regImpresora")?.value;
  const descripcion = document.getElementById("regDescripcion")?.value.trim();

  if (!tecnico)     { mostrarToast("El nombre del técnico es obligatorio", "error"); return; }
  if (!impresora)   { mostrarToast("Debes seleccionar una impresora", "error"); return; }
  if (!descripcion) { mostrarToast("La descripción es obligatoria", "error"); return; }

  // Guardar nombre del técnico en sesión para auto-rellenar
  sessionStorage.setItem("tecnicoNombre", tecnico);

  const sel   = document.getElementById("regImpresora");
  const impNombre = sel.options[sel.selectedIndex].text.split(" —")[0];
  const nuevoId   = "MNT-0" + String(historialData.length + 90).padStart(2, "0");

  historialData.unshift({
    id:        nuevoId,
    impresora: impNombre,
    tipo:      tipoMantActual,
    tecnico:   tecnico,
    fecha:     new Date().toLocaleDateString("es-CO"),
    duracion:  document.getElementById("regDuracion")?.value + "h",
    resultado: document.getElementById("regResultado")?.value || "ok",
    fotos:     fotosRegistro.length,
  });

  mostrarToast(`${nuevoId} registrado correctamente`, "success");
  limpiarFormMant();

  setTimeout(() => {
    irASeccion("historial");
    aplicarFiltrosHistorial();
  }, 1400);
}

function limpiarFormMant() {
  const ids = ["regTecnico","regDescripcion"];
  ids.forEach(id => { const el = document.getElementById(id); if (el) el.value = ""; });
  const sel = document.getElementById("regImpresora"); if (sel) sel.value = "";
  const dur = document.getElementById("regDuracion");  if (dur) dur.value = "1";
  const res = document.getElementById("regResultado"); if (res) res.value = "ok";
  document.querySelectorAll("#checklistWrap input[type=checkbox]").forEach(c => c.checked = false);
  fotosRegistro = [];
  renderizarGaleria();
  actualizarPreview();
}

// HISTORIAL 
function renderizarHistorial(datos) {
  const tbody = document.getElementById("cuerpoHistorial");
  if (!tbody) return;

  const mapTipo = {
    preventivo:  '<span class="badge-tipo preventivo">Preventivo</span>',
    correctivo:  '<span class="badge-tipo correctivo">Correctivo</span>',
    diagnostico: '<span class="badge-tipo diagnostico">Diagnóstico</span>'
  };
  const mapRes = {
    ok:      '<span class="badge-est ok">OK</span>',
    reparado:'<span class="badge-est ok">Reparado</span>',
    parcial: '<span class="badge-est pend">Seguimiento</span>',
    falla:   '<span class="badge-est err">Falla</span>'
  };

  if (!datos.length) {
    tbody.innerHTML = `<tr><td colspan="9" style="text-align:center;padding:30px;color:var(--text-muted)">No se encontraron registros</td></tr>`;
    return;
  }

  tbody.innerHTML = datos.map(r => `
    <tr>
      <td><strong>${r.id}</strong></td>
      <td>${r.impresora}</td>
      <td>${mapTipo[r.tipo] || r.tipo}</td>
      <td>${r.tecnico}</td>
      <td>${r.fecha}</td>
      <td>${r.duracion}</td>
      <td>${mapRes[r.resultado] || r.resultado}</td>
      <td>${r.fotos > 0 ? `<span style="color:var(--purple-600)"><i class="bi bi-images"></i> ${r.fotos}</span>` : "—"}</td>
      <td>
        <button class="btn-acc" title="Ver detalle" onclick="mostrarToast('Detalle de ${r.id}','info')">
          <i class="bi bi-eye"></i>
        </button>
      </td>
    </tr>
  `).join("");
}

// Convierte "DD/MM/YYYY" (formato usado en historialData) a un objeto Date
function parsearFechaES(str) {
  const [d, m, y] = str.split("/").map(Number);
  return new Date(y, m - 1, d);
}

// Se usa el registro más reciente como "hoy" de referencia para los rangos
// de fecha, así "Este mes" siempre muestra los datos vigentes del prototipo
// aunque el reloj real del equipo esté en un mes distinto al de los datos.
function obtenerFechaReferencia() {
  const fechas = historialData.map(r => parsearFechaES(r.fecha));
  return new Date(Math.max(...fechas));
}

// Aplica los 3 filtros juntos (texto + tipo + fecha) sobre historialData
function aplicarFiltrosHistorial() {
  const q = filtroTexto.toLowerCase();
  let datos = historialData.filter(r =>
    r.id.toLowerCase().includes(q) ||
    r.impresora.toLowerCase().includes(q) ||
    r.tecnico.toLowerCase().includes(q)
  );

  if (filtroTipo !== "all") {
    datos = datos.filter(r => r.tipo === filtroTipo);
  }

  if (filtroRango !== "todo") {
    const ref = obtenerFechaReferencia();
    datos = datos.filter(r => {
      const f = parsearFechaES(r.fecha);
      if (filtroRango === "mes")    return f.getFullYear() === ref.getFullYear() && f.getMonth() === ref.getMonth();
      if (filtroRango === "3meses") return f >= new Date(ref.getFullYear(), ref.getMonth() - 2, 1) && f <= ref;
      if (filtroRango === "anio")   return f.getFullYear() === ref.getFullYear();
      return true;
    });
  }

  historialVisible = datos;
  renderizarHistorial(datos);
}

function filtrarHistorial(texto) {
  filtroTexto = texto;
  aplicarFiltrosHistorial();
}

function filtrarHistorialTipo(tipo) {
  filtroTipo = tipo;
  aplicarFiltrosHistorial();
}

function filtrarHistorialFecha(rango) {
  filtroRango = rango;
  aplicarFiltrosHistorial();
}

// Exporta a CSV real los registros actualmente visibles (respeta los filtros activos)
function exportarHistorial() {
  const datos = historialVisible.length ? historialVisible : historialData;

  if (!datos.length) {
    mostrarToast("No hay registros para exportar con los filtros actuales", "error");
    return;
  }

  mostrarToast("Preparando exportación...", "info");

  const encabezados = ["ID","Impresora","Tipo","Técnico","Fecha","Duración","Resultado","Fotos"];
  const filas = datos.map(r => [r.id, r.impresora, r.tipo, r.tecnico, r.fecha, r.duracion, r.resultado, r.fotos]);
  const csv = [encabezados, ...filas]
    .map(fila => fila.map(campo => `"${String(campo).replace(/"/g, '""')}"`).join(","))
    .join("\r\n");

  // BOM al inicio para que Excel muestre bien tildes y "ñ"
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });

  descargarBlob(blob, "Historial_Mantenimientos.csv", "text/csv", ".csv", "Archivo CSV").then(exportado => {
    if (exportado) mostrarToast(`${datos.length} registro(s) exportado(s)`, "success");
  });
}

// NOTIFICACIONES (panel de la campana en el topbar)
function renderizarNotificaciones() {
  const cont = document.getElementById("notifLista");
  if (!cont) return;

  if (!notificacionesData.length) {
    cont.innerHTML = `<div style="padding:24px;text-align:center;color:var(--text-muted);font-size:12.5px">Sin notificaciones</div>`;
    return;
  }

  cont.innerHTML = notificacionesData.map((n, i) => `
    <div class="notif-item ${n.leida ? '' : 'sin-leer'}" onclick="irNotificacion(${i})">
      <div class="notif-item-ico ${n.tipo}"><i class="bi ${n.icono}"></i></div>
      <div>
        <div class="notif-item-texto">${n.texto}</div>
        <div class="notif-item-tiempo">${n.tiempo}</div>
      </div>
    </div>
  `).join("");
}

function actualizarBadgeNotif() {
  const dot = document.getElementById("notifDot");
  if (!dot) return;
  const sinLeer = notificacionesData.filter(n => !n.leida).length;
  if (sinLeer > 0) {
    dot.textContent = sinLeer;
    dot.style.display = "flex";
  } else {
    dot.style.display = "none";
  }
}

function irNotificacion(i) {
  const n = notificacionesData[i];
  if (!n) return;
  n.leida = true;
  const panel = document.getElementById("notifPanel");
  if (panel) panel.style.display = "none";
  renderizarNotificaciones();
  actualizarBadgeNotif();
  if (n.seccion) irASeccion(n.seccion);
}

function marcarTodasNotifsLeidas() {
  notificacionesData.forEach(n => n.leida = true);
  renderizarNotificaciones();
  actualizarBadgeNotif();
  mostrarToast("Notificaciones marcadas como leídas", "success");
}

// GESTIONAR IMPRESORAS
function abrirDiagnostico(num, modelo) {
  impDiagActual = num;
  const titulo = document.getElementById("modalDiagTitulo");
  if (titulo) titulo.textContent = `Diagnóstico — Impresora #${num} (${modelo})`;
  const modal = document.getElementById("modalDiag");
  if (modal) modal.style.display = "flex";
}

function guardarDiagnostico() {
  const sintoma = document.getElementById("diagSintoma")?.value.trim();
  if (!sintoma) { mostrarToast("Describe el síntoma observado", "error"); return; }
  mostrarToast(`Diagnóstico guardado para Impresora #${impDiagActual}`, "success");
  cerrarModal("modalDiag");
  // Limpiar campos del modal
  ["diagSintoma","diagCausa"].forEach(id => { const el = document.getElementById(id); if (el) el.value = ""; 
  });
}

function probarFuncionamiento(num) {
  mostrarToast(`Iniciando prueba de funcionamiento — Impresora #${num}`, "info");
  setTimeout(() => mostrarToast(`Impresora #${num} funcionando correctamente`, "success"), 2000);
}

function cerrarModal(id) {
  const el = document.getElementById(id);
  if (el) el.style.display = "none";
}

// PERFIL
function guardarPerfil() {
  const nombre   = document.getElementById("perfilNombre")?.value.trim();
  const apellido = document.getElementById("perfilApellido")?.value.trim();

  if (!nombre || !apellido) { mostrarToast("El nombre es obligatorio", "error"); return; }

  const nombreCompleto = `${nombre} ${apellido}`;
  const iniciales      = (nombre[0] + apellido[0]).toUpperCase();

  // Actualizar elementos del DOM
  const set = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
  set("perfilNombreDisplay", nombreCompleto);
  set("topbarNombre", nombreCompleto);

  const av1 = document.getElementById("perfilAvatar");
  const av2 = document.getElementById("topbarAvatar");
  if (av1) av1.textContent = iniciales;
  if (av2) av2.textContent = iniciales;

  // Guardar en sesión
  sessionStorage.setItem("tecnicoNombre", nombre);

  mostrarToast("Perfil actualizado correctamente", "success");
}