// RESPONSIVE-INIT.JS — PrintSmart 3D
//
// Script chiquito y aparte: NO modifica sidebar_toggle.js.
// Su único trabajo es evitar que, la PRIMERA vez que alguien entra desde
// un celular, el sidebar (que hoy siempre arranca visible) tape toda la
// pantalla. Si el usuario ya guardó una preferencia (la abrió o cerró
// alguna vez, en cualquier tamaño de pantalla), esa elección se respeta
// tal cual funciona hoy — este script no la toca.
//
// Se apoya en la MISMA clave de localStorage que ya usa sidebar_toggle.js,
// así que no crea ningún mecanismo nuevo.
(function () {
  var CLAVE = "ps3d_sidebar_oculto";
  var yaHayPreferencia = localStorage.getItem(CLAVE) !== null;

  if (!yaHayPreferencia && window.innerWidth <= 991) {
    localStorage.setItem(CLAVE, "1");
  }
})();