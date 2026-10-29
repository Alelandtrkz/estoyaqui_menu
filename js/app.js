(() => {
  "use strict";
  const menu = window.MENU_DATA;
  if (!Array.isArray(menu) || menu.length === 0) throw new Error("No se encontraron datos del menú en js/menu-data.js.");
  const categories = document.getElementById("categories");
  const menuList = document.getElementById("menuList");
  const categoryTitle = document.getElementById("categoryTitle");
  const sectionCount = document.getElementById("sectionCount");
  const dialog = document.getElementById("productDialog");
  const cartDialog = document.getElementById("cartDialog");
  const cartItems = document.getElementById("cartItems");
  const cartToggle = document.getElementById("cartToggle");
  const products = new Map(menu.flatMap(section => section.items).map(item => [item.image, item]));
  const cart = new Map();
  const storageKey = "estoy-aqui-cart-v1";
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  let categoryIndex = 0;
  let selectedItem;
  let statusTimeout;

  function priceInCents(item) {
    const [whole, fraction = ""] = item.price.replace(",", ".").split(".");
    return Number(whole) * 100 + Number(fraction.padEnd(2, "0"));
  }

  const money = cents => `$${(cents / 100).toFixed(2).replace(".", ",")}`;

  function announce(message) {
    const status = document.getElementById("cartStatus");
    clearTimeout(statusTimeout);
    status.textContent = message;
    statusTimeout = setTimeout(() => { status.textContent = ""; }, 2600);
  }

  function saveCart() {
    // El pedido sigue funcionando si el navegador no permite almacenamiento local.
    try { localStorage.setItem(storageKey, JSON.stringify([...cart])); } catch { /* Sin persistencia. */ }
  }

  function changeQuantity(id, change) {
    if (!products.has(id)) return;
    const quantity = (cart.get(id) || 0) + change;
    if (quantity > 99) {
      announce("Puedes agregar hasta 99 unidades de cada producto.");
      return;
    }
    if (quantity <= 0) cart.delete(id);
    else cart.set(id, quantity);
    saveCart();
    renderCart();
  }

  function addToCart(item) {
    if ((cart.get(item.image) || 0) >= 99) {
      announce("Puedes agregar hasta 99 unidades de cada producto.");
      return;
    }
    changeQuantity(item.image, 1);
    announce(`${item.name} agregado al carrito`);
  }

  function quantityButton(label, symbol, action) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "quantity-button";
    button.setAttribute("aria-label", label);
    button.textContent = symbol;
    button.addEventListener("click", action);
    return button;
  }

  function renderCart() {
    // Conservar el foco del control al actualizar cantidades o quitar una fila.
    const active = document.activeElement;
    const focusedRow = active?.closest(".cart-row");
    const focusedId = focusedRow?.dataset.id;
    const focusedIndex = focusedRow ? [...cartItems.children].indexOf(focusedRow) : -1;
    const focusedAction = active?.dataset.action;
    let total = 0;
    let count = 0;
    const rows = [];
    const lines = ["Hola, quiero hacer este pedido en Estoy Aquí:", ""];
    for (const [id, quantity] of cart) {
      const item = products.get(id);
      const unitPrice = priceInCents(item);
      const subtotal = unitPrice * quantity;
      total += subtotal;
      count += quantity;
      lines.push(`${quantity} × ${item.name} — ${money(unitPrice)} c/u — ${money(subtotal)}`);
      const row = document.createElement("li");
      row.className = "cart-row";
      row.dataset.id = id;
      const photo = createPhoto(item, "cart-photo");
      const copy = document.createElement("div");
      copy.className = "cart-row-copy";
      const name = document.createElement("h3");
      name.textContent = item.name;
      const price = document.createElement("p");
      price.className = "cart-unit-price";
      price.textContent = `${money(unitPrice)} c/u`;
      const controls = document.createElement("div");
      controls.className = "quantity-controls";
      const decrease = quantityButton(`Reducir cantidad de ${item.name}`, "−", () => changeQuantity(id, -1));
      decrease.dataset.action = "decrease";
      const amount = document.createElement("span");
      amount.className = "quantity-value";
      amount.textContent = quantity;
      amount.setAttribute("aria-label", `${quantity} unidades`);
      const increase = quantityButton(`Aumentar cantidad de ${item.name}`, "+", () => changeQuantity(id, 1));
      increase.dataset.action = "increase";
      const remove = quantityButton(`Quitar ${item.name} del carrito`, "Quitar", () => {
        cart.delete(id);
        saveCart();
        renderCart();
        announce(`${item.name} eliminado del carrito`);
      });
      remove.className = "remove-item";
      remove.dataset.action = "remove";
      controls.append(decrease, amount, increase, remove);
      copy.append(name, price, controls);
      const lineTotal = document.createElement("strong");
      lineTotal.className = "cart-line-total";
      lineTotal.textContent = money(subtotal);
      row.append(photo, copy, lineTotal);
      rows.push(row);
    }
    cartItems.replaceChildren(...rows);
    const badge = document.getElementById("cartBadge");
    badge.textContent = count;
    badge.hidden = count === 0;
    cartToggle.setAttribute("aria-label", `Ver carrito, ${count} ${count === 1 ? "producto" : "productos"}`);
    document.getElementById("cartEmpty").hidden = count > 0;
    document.getElementById("cartSummary").hidden = count === 0;
    document.getElementById("cartTotal").textContent = money(total);
    const order = document.getElementById("cartOrder");
    if (count > 0) {
      lines.push("", `Total: ${money(total)}`);
      order.href = `https://wa.me/593963267781?text=${encodeURIComponent(lines.join("\n"))}`;
    } else order.removeAttribute("href");
    if (focusedId && cartDialog.open) {
      const targetRow = rows.find(row => row.dataset.id === focusedId) || rows[Math.min(focusedIndex, rows.length - 1)];
      const target = targetRow?.querySelector(`[data-action="${focusedAction}"]`) || document.getElementById("browseMenu");
      target.focus({ preventScroll: true });
    }
  }

  function openCart() {
    renderCart();
    if (!cartDialog.open) cartDialog.showModal();
  }

  function createPhoto(item, className) {
    const visual = document.createElement("div");
    visual.className = className;
    const image = document.createElement("img");
    image.alt = item.name;
    image.loading = className === "detail-visual" ? "eager" : "lazy";
    image.decoding = "async";
    image.width = 600;
    image.height = 600;
    const placeholder = document.createElement("span");
    placeholder.className = "photo-placeholder";
    placeholder.innerHTML = '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><circle cx="32" cy="32" r="24"/><circle cx="32" cy="32" r="17"/><path d="M8 10v15m-4-15v10c0 7 8 7 8 0V10M8 27v27m47-44c-6 5-6 17 0 20v24m0-44v20"/></svg><span>Foto próximamente</span>';
    image.addEventListener("error", () => {
      visual.classList.add("is-placeholder");
      image.hidden = true;
      image.removeAttribute("src");
    }, { once: true });
    image.src = `img/${encodeURIComponent(item.image)}`;
    visual.append(image, placeholder);
    return visual;
  }

  function showDetail(item) {
    selectedItem = item;
    const visual = document.getElementById("detailVisual");
    const replacement = createPhoto(item, "detail-visual");
    replacement.id = "detailVisual";
    visual.replaceWith(replacement);
    document.getElementById("detailName").textContent = item.name;
    document.getElementById("detailPrice").textContent = `$${item.price}`;
    document.getElementById("detailDesc").textContent = item.description;
    const tag = document.getElementById("detailTag");
    tag.textContent = item.tag || "";
    tag.hidden = !item.tag;
    dialog.showModal();
  }

  function createMenuItem(item) {
    const card = document.createElement("article");
    card.className = `menu-item${categoryIndex > 1 ? " menu-item--drink" : ""}`;
    card.append(createPhoto(item, "product-visual"));
    const preview = document.createElement("button");
    preview.type = "button";
    preview.className = "item-preview";
    preview.setAttribute("aria-label", `Ver foto de ${item.name}`);
    preview.setAttribute("aria-haspopup", "dialog");
    preview.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/></svg>';
    preview.addEventListener("click", () => showDetail(item));
    card.append(preview);
    if (item.tag) {
      const tag = document.createElement("span");
      tag.className = "item-tag";
      tag.textContent = item.tag;
      card.append(tag);
    }
    const name = document.createElement("h3");
    name.className = "item-name";
    name.textContent = item.name;
    const description = document.createElement("p");
    description.className = "item-desc";
    description.textContent = item.description;
    const bottom = document.createElement("div");
    bottom.className = "item-bottom";
    const price = document.createElement("span");
    price.className = "item-price";
    price.textContent = `$${item.price}`;
    const add = document.createElement("button");
    add.type = "button";
    add.className = "item-add";
    add.textContent = "+";
    add.setAttribute("aria-label", `Agregar ${item.name} al carrito`);
    add.addEventListener("click", () => addToCart(item));
    bottom.append(price, add);
    card.append(name, description, bottom);
    return card;
  }

  function renderCategory() {
    const section = menu[categoryIndex];
    categoryTitle.textContent = section.category;
    sectionCount.textContent = `${section.items.length} ${section.items.length === 1 ? "producto" : "productos"}`;
    menuList.replaceChildren(...section.items.map(createMenuItem));
  }

  function selectCategory(index, { focus = false } = {}) {
    categoryIndex = index;
    [...categories.children].forEach((button, buttonIndex) => button.setAttribute("aria-current", String(buttonIndex === index)));
    const button = categories.children[index];
    // Desplazar solo las etiquetas; no saltar la página al cambiar de categoría.
    categories.scrollTo({
      left: button.offsetLeft - categories.offsetLeft - (categories.clientWidth - button.offsetWidth) / 2,
      behavior: reducedMotion.matches ? "auto" : "smooth"
    });
    if (focus) button.focus({ preventScroll: true });
    renderCategory();
  }

  menu.forEach((section, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "category";
    button.textContent = section.category;
    button.setAttribute("aria-current", String(index === 0));
    button.setAttribute("aria-controls", "menuPanel");
    button.addEventListener("click", () => selectCategory(index));
    categories.append(button);
  });
  categories.addEventListener("keydown", (event) => {
    let nextIndex;
    if (event.key === "ArrowLeft") nextIndex = (categoryIndex - 1 + menu.length) % menu.length;
    if (event.key === "ArrowRight") nextIndex = (categoryIndex + 1) % menu.length;
    if (event.key === "Home") nextIndex = 0;
    if (event.key === "End") nextIndex = menu.length - 1;
    if (nextIndex === undefined) return;
    event.preventDefault();
    selectCategory(nextIndex, { focus: true });
  });
  document.getElementById("closeDetail").addEventListener("click", () => dialog.close());
  document.getElementById("detailAdd").addEventListener("click", () => {
    addToCart(selectedItem);
    dialog.close();
  });
  document.getElementById("openOrder").addEventListener("click", openCart);
  cartToggle.addEventListener("click", openCart);
  document.getElementById("closeCart").addEventListener("click", () => cartDialog.close());
  document.getElementById("browseMenu").addEventListener("click", () => cartDialog.close());
  [dialog, cartDialog].forEach(modal => {
    modal.addEventListener("click", event => {
      if (event.target !== modal) return;
      const bounds = modal.getBoundingClientRect();
      if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) modal.close();
    });
  });
  const logo = document.querySelector("[data-logo]");
  function showLogoPlaceholder() {
    logo.closest(".logo-shell").classList.add("is-placeholder");
    logo.removeAttribute("src");
  }
  logo.addEventListener("error", showLogoPlaceholder, { once: true });
  if (logo.complete && logo.naturalWidth === 0) showLogoPlaceholder();
  try {
    const saved = JSON.parse(localStorage.getItem(storageKey));
    if (Array.isArray(saved)) {
      for (const entry of saved) {
        if (!Array.isArray(entry) || entry.length !== 2) continue;
        const [id, quantity] = entry;
        if (products.has(id) && Number.isSafeInteger(quantity) && quantity > 0 && quantity <= 99) cart.set(id, quantity);
      }
    }
  } catch { /* Ignorar pedidos guardados inválidos o almacenamiento bloqueado. */ }
  renderCategory();
  renderCart();
})();
