
// PEDIDOS.JS — Gestión de pedidos


// Mostrar el detalle de un pedido al hacer clic en la fila
function mostrarDetallePedido(id, cliente, margen, tipo) {
  // Ocultar estado vacío y mostrar el panel de detalle
  document.getElementById("pedidoVacio").style.display   = "none";
  document.getElementById("pedidoDetalle").style.display = "block";

  // Rellenar los datos del pedido seleccionado
  document.getElementById("detallePedidoId").textContent = "#" + id;

  // Según el tipo de pendiente, mostrar diferentes datos
  if (tipo === "tech") {
    document.getElementById("detalleMaterial").textContent = "PEEK Carbon-Filled";
    document.getElementById("detalleCosto").textContent   = "$1,240.00";
    document.getElementById("detallePrecio").textContent  = "$1,760.00";
  } else {
    document.getElementById("detalleMaterial").textContent = "Resina Biocompatible";
    document.getElementById("detalleCosto").textContent   = "$890.00";
    document.getElementById("detallePrecio").textContent  = "$1,050.00";
  }
}

// Cerrar el panel de detalle
function cerrarDetallePedido() {
  document.getElementById("pedidoDetalle").style.display = "none";
  document.getElementById("pedidoVacio").style.display   = "flex";
}

// Aprobar pedido
function aprobarPedido() {
  mostrarToast("Pedido aprobado y enviado a producción", "success");
  cerrarDetallePedido();
}

// Rechazar pedido
function rechazarPedido() {
  mostrarToast("Pedido rechazado. Se notificará al cliente.", "error");
  cerrarDetallePedido();
}