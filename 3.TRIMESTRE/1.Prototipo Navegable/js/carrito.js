/*CARRITO.JS — Carrito de compras PrintSmart 3D (estilo Mercado Libre)
   Se incluye en index.html y cliente.html; inyecta su propio HTML.
   localStorage: ps3d_carrito (carrito) · ps3d_pedidos_tienda (pedidos)*/
const Carrito = (() => {
  const KEY = "ps3d_carrito", KPED = "ps3d_pedidos_tienda", KFLAG = "ps3d_checkout_pendiente";
  const ENVIO_GRATIS = 100000;  // compra desde la cual el envío es gratis (COP)
  const ENVIO = 8000;           // costo de envío por debajo de ese valor (COP)
  const MAX = 10;               // unidades máximas por producto

  const $ = (s, r = document) => r.querySelector(s);
  const cop = n => "$" + String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ".") + " COP";
  const esc = t => String(t ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const logueado = () => sessionStorage.getItem("rolActual") === "Cliente";

  let st = { items: [], guardados: [] }, modo = "carrito", ultimo = null, tSnack;
  try { st = { ...st, ...JSON.parse(localStorage.getItem(KEY)) }; } catch (e) {}
  if (!Array.isArray(st.items)) st.items = [];
  if (!Array.isArray(st.guardados)) st.guardados = [];

  /* Estado */
  const buscar = (lista, id) => st[lista].find(i => i.id === id);
  const unidades = () => st.items.reduce((a, i) => a + i.qty, 0);
  const totales = () => {
    const sub = st.items.reduce((a, i) => a + i.precio * i.qty, 0);
    const envio = !sub || sub >= ENVIO_GRATIS ? 0 : ENVIO;
    return { sub, envio, total: sub + envio, falta: Math.max(0, ENVIO_GRATIS - sub) };
  };
  function guardar() {
    try { localStorage.setItem(KEY, JSON.stringify(st)); } catch (e) {}
    pintar();
  }
  function add(p, qty = 1) {
    const g = buscar("guardados", p.id), it = buscar("items", p.id);
    if (g) st.guardados = st.guardados.filter(i => i !== g);
    if (it) it.qty = Math.min(MAX, it.qty + qty);
    else st.items.push({ ...p, qty: Math.min(MAX, qty) });
    guardar();
    snack(p.nombre);
  }
  const setQty = (id, q) => { const it = buscar("items", id); if (it) { it.qty = Math.max(1, Math.min(MAX, q)); guardar(); } };
  const quitar = (lista, id) => { st[lista] = st[lista].filter(i => i.id !== id); guardar(); };
  function mover(de, a, id) {
    const it = buscar(de, id); if (!it) return;
    st[de] = st[de].filter(i => i !== it);
    const ex = buscar(a, id);
    if (ex) ex.qty = Math.min(MAX, ex.qty + it.qty); else st[a].push(it);
    guardar();
  }

  /* Vistas */
  function pintar() {
    const n = unidades();
    document.querySelectorAll(".cart-badge").forEach(b => { b.textContent = n; b.style.display = n ? "flex" : "none"; });
    if ($("#cartView")?.classList.contains("abierto")) vista();
  }

  const fila = (i, g) => {
    const id = esc(i.id);
    return `<div class="ci${g ? " g" : ""}">
      <img src="${esc(i.img)}" alt="${esc(i.nombre)}"/>
      <div class="ci-info">
        <div class="ci-n">${esc(i.nombre)}</div>
        <div class="ci-c">${esc(i.cat)}</div>
        <div class="ci-acts">
          <button data-a="${g ? "delG" : "del"}" data-id="${id}">Eliminar</button>
          <button data-a="${g ? "back" : "save"}" data-id="${id}">${g ? "Mover al carrito" : "Guardar para después"}</button>
        </div>
      </div>
      ${g ? "" : `<div class="ci-qty">
        <button data-a="menos" data-id="${id}" ${i.qty <= 1 ? "disabled" : ""} aria-label="Quitar una unidad">−</button>
        <span>${i.qty}</span>
        <button data-a="mas" data-id="${id}" ${i.qty >= MAX ? "disabled" : ""} aria-label="Agregar una unidad">+</button>
      </div>`}
      <div class="ci-pr">${i.desde ? "Desde " : ""}${cop(i.precio * (g ? 1 : i.qty))}${!g && i.qty > 1 ? `<small>${cop(i.precio)} c/u</small>` : ""}</div>
    </div>`;
  };

  function resumen(botones) {
    const t = totales(), n = unidades(), desde = st.items.some(i => i.desde);
    const pct = Math.min(100, Math.round(t.sub / ENVIO_GRATIS * 100));
    return `<aside class="cs">
      <h3>Resumen de compra</h3>
      <div class="cs-r"><span>Productos (${n})</span><span>${cop(t.sub)}</span></div>
      <div class="cs-r"><span>Envío</span>${t.envio ? `<span>${cop(t.envio)}</span>` : `<span class="ok">Gratis</span>`}</div>
      <div class="cs-ship"><div class="cs-bar"><i style="width:${pct}%"></i></div>
        <small>${t.falta ? `Agrega ${cop(t.falta)} más y tu envío es gratis` : "¡Tienes envío gratis!"}</small></div>
      <div class="cs-r tot"><span>Total</span><span>${cop(t.total)}</span></div>
      ${botones}
      ${desde ? `<p class="cs-n">Los precios marcados como desde pueden variar según material y tamaño; te confirmamos el valor final antes de producir.</p>` : ""}
    </aside>`;
  }

  const PAGOS = [["tarjeta", "bi-credit-card", "Tarjeta crédito / débito"], ["pse", "bi-bank", "PSE"], ["contra", "bi-cash-coin", "Pago contra entrega"]];

  function vista() {
    const v = $("#cartView"), n = unidades();
    let izq = "", der = "";
    if (modo === "ok" && ultimo) {
      izq = `<div class="cv-card cv-ok"><div class="cv-okic">✓</div><h2>¡Compra confirmada!</h2>
        <p>Tu pedido <strong>${esc(ultimo.id)}</strong> fue recibido. Te avisaremos cuando entre a producción.</p>
        <button class="btn-cv" data-a="mis">Ver mis pedidos</button></div>`;
    } else if (modo === "pago" && n) {
      izq = `<div class="cv-card cv-form"><h2>Datos de entrega</h2>
        <p class="cv-who">Comprando como <b>${esc(sessionStorage.getItem("clienteNombre") || "cliente")}</b></p>
        <div class="cv-g2"><label>Dirección<input id="pgDir" placeholder="Calle, número, barrio"/></label>
          <label>Ciudad<input id="pgCiu" placeholder="Ciudad"/></label></div>
        <label>Teléfono de contacto<input id="pgTel" type="tel" placeholder="300 000 0000"/></label>
        <h2>Método de pago</h2>
        <div class="cv-pays">${PAGOS.map((p, i) => `<label><input type="radio" name="pgPago" value="${p[0]}" ${i ? "" : "checked"}/><i class="bi ${p[1]}"></i> ${p[2]}</label>`).join("")}</div>
        <div class="cv-err" id="pgErr"></div></div>`;
      der = resumen(`<button class="btn-cv" data-a="pagar">Confirmar compra</button><button class="btn-cv-sec" data-a="volver">Volver al carrito</button>`);
    } else {
      modo = "carrito";
      izq = (n ? `<div class="cv-card">${st.items.map(i => fila(i)).join("")}</div>`
               : `<div class="cv-card cv-vacio"><i class="bi bi-cart-x"></i><h2>Tu carrito está vacío</h2>
                  <p>Explora el catálogo y agrega tus modelos favoritos.</p><button class="btn-cv" data-a="cat">Ver catálogo</button></div>`)
          + (st.guardados.length ? `<h3 class="cv-h">Guardados para después (${st.guardados.length})</h3><div class="cv-card">${st.guardados.map(i => fila(i, 1)).join("")}</div>` : "");
      if (n) der = resumen(logueado()
        ? `<button class="btn-cv" data-a="ir">Continuar compra</button>`
        : `<button class="btn-cv" data-a="ir"><i class="bi bi-person-plus"></i> Continuar</button>
           <p class="cs-n">Para pagar necesitas una cuenta de cliente. Tu carrito se conserva al registrarte.</p>
           <p class="cs-n">¿Ya tienes cuenta? <button data-a="login">Inicia sesión</button></p>`);
    }
    v.innerHTML = `<div class="cv-top"><button data-a="seguir"><i class="bi bi-arrow-left"></i> Seguir comprando</button>
      <b>${modo === "pago" ? "Finalizar compra" : modo === "ok" ? "Pedido realizado" : "Carrito" + (n ? ` (${n})` : "")}</b></div>
      <div class="cv-wrap"><div>${izq}</div>${der}</div>`;
  }

  function abrir(m) {
    modo = m || "carrito";
    vista();
    $("#cartView").classList.add("abierto");
    document.body.style.overflow = "hidden";
  }
  function cerrar() {
    $("#cartView")?.classList.remove("abierto");
    document.body.style.overflow = "";
    if (modo === "ok") modo = "carrito";
  }

  function snack(nombre) {
    const s = $("#cartSnack"); if (!s) return;
    s.innerHTML = `<i class="bi bi-check-circle-fill"></i><span>${esc(nombre)} se agregó al carrito</span><button onclick="Carrito.abrir()">Ver carrito</button>`;
    s.classList.add("on");
    clearTimeout(tSnack);
    tSnack = setTimeout(() => s.classList.remove("on"), 3800);
    document.querySelectorAll(".cart-badge").forEach(b => { b.classList.remove("bump"); void b.offsetWidth; b.classList.add("bump"); });
  }

  /* Compra: registro o confirmación */
  // Visitante: abre el registro (o el login) y, al volver logueado, retoma la compra
  function pedirCuenta(registro) {
    try { localStorage.setItem(KFLAG, "1"); } catch (e) {}
    cerrar();
    if (typeof abrirModal !== "function") { location.href = "index.html"; return; }
    abrirModal("Cliente");                        // login del cliente
    if (!registro) return;
    _mostrarSeccion("secRegistro");               // formulario de registro del modal
    const n = unidades(), box = $("#prodInteresBox");
    if ($("#mTitulo")) $("#mTitulo").textContent = "Crea tu cuenta";
    if ($("#mSubtitulo")) $("#mSubtitulo").textContent = "Regístrate para finalizar tu compra";
    if (box) {
      box.innerHTML = `<i class="bi bi-cart-check" style="margin-right:6px;"></i>Tu carrito: <strong>${n} producto${n > 1 ? "s" : ""} · ${cop(totales().sub)}</strong>`;
      box.style.display = "block";
    }
  }

  function continuar() {
    if (!st.items.length) return;
    if (logueado()) { modo = "pago"; vista(); } else pedirCuenta(true);
  }

  function confirmar() {
    const v = id => $("#" + id)?.value.trim(), err = $("#pgErr");
    const dir = v("pgDir"), ciu = v("pgCiu"), tel = v("pgTel");
    const falla = !dir || !ciu ? "Completa la dirección y la ciudad de entrega."
      : !/^[\d\s+()-]{7,}$/.test(tel || "") ? "Ingresa un teléfono de contacto válido." : "";
    if (falla) { err.textContent = falla; err.style.display = "block"; return; }
    const t = totales();
    ultimo = {
      id: "PS-" + String(Date.now()).slice(-6), fecha: new Date().toISOString(),
      cliente: sessionStorage.getItem("clienteEmail"), items: st.items,
      envio: t.envio, total: t.total, direccion: dir + ", " + ciu, telefono: tel,
      pago: $("input[name=pgPago]:checked")?.value, estado: "Recibido"
    };
    try {
      const l = JSON.parse(localStorage.getItem(KPED) || "[]");
      l.unshift(ultimo);
      localStorage.setItem(KPED, JSON.stringify(l));
    } catch (e) {}
    st.items = [];
    guardar();
    modo = "ok";
    vista();
  }

  /* Navegación auxiliar */
  const irCatalogo = () => {
    if ($("#catalogo")) $("#catalogo").scrollIntoView({ behavior: "smooth" });
    else if (typeof irA === "function") irA("catalogo", $("#nav-catalogo"));
  };
  const misPedidos = () => {
    if (typeof irA === "function") irA("pedidos", $("#nav-pedidos")); else location.href = "cliente.html";
  };

  document.addEventListener("click", e => {
    const b = e.target.closest("[data-a]");
    if (!b || !b.closest("#cartView")) return;
    const id = b.dataset.id, it = buscar("items", id);
    const acc = {
      mas: () => it && setQty(id, it.qty + 1), menos: () => it && setQty(id, it.qty - 1),
      del: () => quitar("items", id), delG: () => quitar("guardados", id),
      save: () => mover("items", "guardados", id), back: () => mover("guardados", "items", id),
      seguir: cerrar, cat: () => { cerrar(); irCatalogo(); }, ir: continuar, login: () => pedirCuenta(false), pagar: confirmar,
      volver: () => { modo = "carrito"; vista(); }, mis: () => { cerrar(); misPedidos(); }
    };
    acc[b.dataset.a]?.();
  });

  /* Montaje en la página */
  function catalogo() {
    document.querySelectorAll(".pcard").forEach(c => {
      const nombre = $(".pnombre", c)?.textContent.trim();
      const txt = $(".pprecio", c)?.textContent || "";
      const precio = parseInt(((txt.match(/\$\s*([\d.]+)/) || [])[1] || "").replace(/\./g, ""), 10);
      if (!nombre || !precio) return;
      const p = {
        id: nombre.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-"),
        nombre, precio, desde: /desde/i.test(txt),
        img: $(".pimg img", c)?.getAttribute("src") || "assets/logo2.jpeg",
        cat: $(".pcategoria", c)?.textContent.trim() || ""
      };
      const old = $(".btn-interes", c), conTexto = old && old.textContent.trim().length > 0;
      const b = document.createElement("button");
      b.type = "button";
      b.className = "btn-interes btn-addcart";
      b.innerHTML = `<i class="bi bi-cart-plus"></i>${conTexto ? " Agregar al carrito" : ""}`;
      b.setAttribute("aria-label", "Agregar " + nombre + " al carrito");
      b.onclick = e => { e.stopPropagation(); add(p); b.classList.add("ok"); setTimeout(() => b.classList.remove("ok"), 900); };
      if (old) old.replaceWith(b); else ($(".pfooter", c) || $(".pbody", c))?.appendChild(b);
      c.removeAttribute("onclick");
      c.style.cursor = "default";
    });
  }

  function iniciar() {
    document.body.insertAdjacentHTML("beforeend",
      `<div class="cv" id="cartView" role="dialog" aria-modal="true" aria-label="Carrito de compras"></div>
       <div class="cart-snack" id="cartSnack" role="status"></div>`);
    const btn = `<button class="btn-cart" aria-label="Abrir carrito" onclick="Carrito.abrir()"><i class="bi bi-cart3"></i><span class="cart-badge">0</span></button>`;
    const login = $(".lnav-inner .btn-lnav-login");
    if (login) login.insertAdjacentHTML("beforebegin", btn);
    else document.body.insertAdjacentHTML("beforeend", btn.replace("btn-cart", "btn-cart flotante"));
    catalogo();
    pintar();
    document.addEventListener("keydown", e => { if (e.key === "Escape") cerrar(); });
    // Recién registrado o logueado con carrito pendiente → retoma la compra
    if (logueado() && st.items.length && localStorage.getItem(KFLAG)) {
      try { localStorage.removeItem(KFLAG); } catch (e) {}
      setTimeout(() => abrir("pago"), 600);
    }
  }
  document.readyState === "loading" ? document.addEventListener("DOMContentLoaded", iniciar) : iniciar();

  return { add, abrir, cerrar };
})();