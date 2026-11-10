/**
 * Control centralizado de sesiones y roles.
 */

(function (window) {
  "use strict";

  const ROLES = Object.freeze(["Admin", "Cliente", "Operador", "Tecnico"]);

  const RUTAS = Object.freeze({
    Admin: "admin.html",
    Cliente: "cliente.html",
    Operador: "operador.html",
    Tecnico: "tecnico.html",
  });

  const CLAVES = Object.freeze({
    rol: "rolActual",
    nombre: "clienteNombre",
    email: "clienteEmail",
  });

  /**
   * Comprueba que el rol sea válido.
   */
  function rolValido(rol) {
    return ROLES.includes(rol);
  }

  /**
   * Obtiene los datos de la sesión actual.
   */
  function obtenerSesion() {
    const rol = sessionStorage.getItem(CLAVES.rol);
    const nombre = sessionStorage.getItem(CLAVES.nombre);
    const email = sessionStorage.getItem(CLAVES.email);

    if (!rolValido(rol) || !email) {
      return null;
    }

    return {
      rol,
      nombre: nombre || email.split("@")[0],
      email,
    };
  }

  /**
   * Crea una sesión de demostración.
   */
  function crearSesionDemo({ rol, nombre, email }) {
    if (!rolValido(rol)) {
      throw new Error("El rol seleccionado no es válido.");
    }

    if (!email || !email.includes("@")) {
      throw new Error("El correo electrónico no es válido.");
    }

    sessionStorage.setItem(CLAVES.rol, rol);
    sessionStorage.setItem(CLAVES.nombre, nombre || "");
    sessionStorage.setItem(CLAVES.email, email.trim().toLowerCase());

    return obtenerSesion();
  }

  /**
   * Comprueba si existe una sesión.
   */
  function sesionActiva() {
    return obtenerSesion() !== null;
  }

  /**
   * Protege una página según el rol requerido.
   */
  function protegerRuta(rolEsperado) {
    const sesion = obtenerSesion();

    if (!sesion) {
      sessionStorage.clear();
      window.location.replace("index.html");
      return false;
    }

    if (sesion.rol !== rolEsperado) {
      const rutaCorrecta = RUTAS[sesion.rol] || "index.html";

      window.location.replace(rutaCorrecta);
      return false;
    }

    return true;
  }

  /**
   * Cierra la sesión actual.
   */
  function cerrarSesion() {
    sessionStorage.clear();
    window.location.replace("index.html");
  }

  window.Auth = Object.freeze({
    ROLES,
    RUTAS,
    rolValido,
    obtenerSesion,
    crearSesionDemo,
    sesionActiva,
    protegerRuta,
    cerrarSesion,
  });
})(window);
