// =============================================
// CHARTS.JS — Todos los gráficos con Chart.js
// =============================================

// Guardamos las instancias de gráficos para no duplicarlos
const instanciasGraficos = {};

// Destruye un gráfico si ya existe (para evitar errores)
function destruirGrafico(id) {
  if (instanciasGraficos[id]) {
    instanciasGraficos[id].destroy();
    delete instanciasGraficos[id];
  }
}

// Función llamada desde app.js para inicializar según sección
function iniciarGraficosSeccion(seccion) {
  if (seccion === "dashboard") crearGraficoIngresos();
  if (seccion === "materiales") {
    crearGraficoMiniMat();
    crearGraficoConsumo();
  }
  if (seccion === "reportes") {
    crearGraficoReporte();
    crearGraficoDesp();
  }
}

// -----------------------------------------------
// GRÁFICO: Ingresos (Dashboard)
// -----------------------------------------------
function crearGraficoIngresos() {
  const canvas = document.getElementById("graficoIngresos");
  if (!canvas) return;
  destruirGrafico("graficoIngresos");

  instanciasGraficos["graficoIngresos"] = new Chart(canvas, {
    type: "bar",
    data: {
      labels: ["ENE", "FEB", "MAR", "ABR", "MAY", "JUN"],
      datasets: [
        {
          label: "Ingresos 2024",
          data: [38000, 52000, 95000, 72000, 110000, 142000],
          backgroundColor: "#3B0764",
          borderRadius: 6
        },
        {
          label: "Proyección",
          data: [42000, 58000, 88000, 80000, 125000, 155000],
          backgroundColor: "#C4B5FD",
          borderRadius: 6
        }
      ]
    },
    options: {
      responsive: true,
      plugins: { legend: { display: false } },
      scales: {
        y: {
          grid: { color: "#F3F4F6" },
          ticks: { color: "#9CA3AF", font: { size: 11 } }
        },
        x: {
          grid: { display: false },
          ticks: { color: "#9CA3AF", font: { size: 11 } }
        }
      }
    }
  });
}

// -----------------------------------------------
// GRÁFICO: Mini barras de consumo (Materiales KPI)
// -----------------------------------------------
function crearGraficoMiniMat() {
  const canvas = document.getElementById("graficoMiniMat");
  if (!canvas) return;
  destruirGrafico("graficoMiniMat");

  instanciasGraficos["graficoMiniMat"] = new Chart(canvas, {
    type: "bar",
    data: {
      labels: ["", "", "", ""],
      datasets: [{
        data: [60, 75, 85, 70],
        backgroundColor: ["#C4B5FD", "#8B5CF6", "#5B21B6", "#8B5CF6"],
        borderRadius: 3
      }]
    },
    options: {
      responsive: true,
      plugins: { legend: { display: false }, tooltip: { enabled: false } },
      scales: { y: { display: false }, x: { display: false } }
    }
  });
}

// -----------------------------------------------
// GRÁFICO: Consumo vs Stock Real (Materiales)
// -----------------------------------------------
function crearGraficoConsumo() {
  const canvas = document.getElementById("graficoConsumo");
  if (!canvas) return;
  destruirGrafico("graficoConsumo");

  instanciasGraficos["graficoConsumo"] = new Chart(canvas, {
    type: "bar",
    data: {
      labels: ["SEM 01", "SEM 02", "SEM 03", "SEM 04"],
      datasets: [
        {
          label: "Stock Real",
          data: [20, 35, 55, 40],
          backgroundColor: "#3B0764",
          borderRadius: 4
        },
        {
          label: "Proyección",
          data: [25, 40, 60, 50],
          backgroundColor: "#C4B5FD",
          borderRadius: 4
        }
      ]
    },
    options: {
      responsive: true,
      plugins: { legend: { display: false } },
      scales: {
        y: { grid: { color: "#F9FAFB" }, ticks: { color: "#9CA3AF", font: { size: 10 } } },
        x: { grid: { display: false }, ticks: { color: "#9CA3AF", font: { size: 10 } } }
      }
    }
  });
}

// -----------------------------------------------
// GRÁFICO: Ingresos vs Gastos (Reportes)
// -----------------------------------------------
function crearGraficoReporte() {
  const canvas = document.getElementById("graficoReporte");
  if (!canvas) return;
  destruirGrafico("graficoReporte");

  instanciasGraficos["graficoReporte"] = new Chart(canvas, {
    type: "bar",
    data: {
      labels: ["Jul", "Ago", "Sep", "Oct"],
      datasets: [
        {
          label: "Ingresos",
          data: [120000, 145000, 98000, 189000],
          backgroundColor: "#1E0A3C",
          borderRadius: 6
        },
        {
          label: "Gastos",
          data: [45000, 58000, 38000, 72000],
          backgroundColor: "#8B5CF6",
          borderRadius: 6
        }
      ]
    },
    options: {
      responsive: true,
      plugins: { legend: { display: false } },
      scales: {
        y: { grid: { color: "#F3F4F6" }, ticks: { color: "#9CA3AF", font: { size: 11 } } },
        x: { grid: { display: false }, ticks: { color: "#9CA3AF", font: { size: 11 } } }
      }
    }
  });
}

// -----------------------------------------------
// GRÁFICO: Desperdicio (Doughnut) (Reportes)
// -----------------------------------------------
function crearGraficoDesp() {
  const canvas = document.getElementById("graficoDesp");
  if (!canvas) return;
  destruirGrafico("graficoDesp");

  instanciasGraficos["graficoDesp"] = new Chart(canvas, {
    type: "doughnut",
    data: {
      labels: ["Calibración", "Errores", "Corte"],
      datasets: [{
        data: [65, 25, 10],
        backgroundColor: ["#3B0764", "#8B5CF6", "#C4B5FD"],
        borderWidth: 0
      }]
    },
    options: {
      responsive: false,
      plugins: { legend: { display: false } },
      cutout: "65%"
    }
  });
}