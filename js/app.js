(() => {
  "use strict";

  const menu = window.MENU_DATA;

  if (!Array.isArray(menu) || menu.length === 0) {
    throw new Error("No se encontraron datos del menú en js/menu-data.js.");
  }

  const elements = {
    categories: document.getElementById("categories"),
    categoryTitle: document.getElementById("categoryTitle"),
    sectionCount: document.getElementById("sectionCount"),
    menuList: document.getElementById("menuList"),
    thumbs: document.getElementById("thumbs"),
    heroImage: document.getElementById("heroImage"),
    media: document.getElementById("media"),
    mediaBadge: document.getElementById("mediaBadge"),
    placeholderName: document.getElementById("placeholderName"),
    galleryTitle: document.getElementById("galleryTitle"),
    galleryPrice: document.getElementById("galleryPrice"),
    galleryDesc: document.getElementById("galleryDesc"),
    counter: document.getElementById("counter"),
    previous: document.getElementById("prev"),
    next: document.getElementById("next")
  };

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const localPhoto = (item) => `img/${encodeURIComponent(item.image)}`;
  let categoryIndex = 0;
  let itemIndex = 0;
  let heroRequestId = 0;
  let pointerStart = null;

  function scrollBehavior() {
    return prefersReducedMotion.matches ? "auto" : "smooth";
  }

  function showHeroPlaceholder(item, requestId) {
    if (requestId !== heroRequestId) return;

    elements.heroImage.removeAttribute("src");
    elements.heroImage.alt = "";
    elements.heroImage.style.opacity = "0";
    elements.media.classList.add("is-placeholder");
    elements.mediaBadge.textContent = "Foto pendiente";
    elements.placeholderName.textContent = item.name;
  }

  function loadHeroPhoto(item) {
    const requestId = ++heroRequestId;
    const image = elements.heroImage;

    image.onload = () => {
      if (requestId !== heroRequestId) return;

      elements.media.classList.remove("is-placeholder");
      elements.mediaBadge.textContent = "Imagen del producto";
      image.style.opacity = "1";
    };

    image.onerror = () => showHeroPlaceholder(item, requestId);
    elements.media.classList.remove("is-placeholder");
    elements.mediaBadge.textContent = "Cargando imagen";
    elements.placeholderName.textContent = item.name;
    image.style.opacity = "0";
    image.alt = item.name;
    image.src = localPhoto(item);
  }

  function createThumbnail(item, index) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "thumb";
    button.setAttribute("aria-current", String(index === itemIndex));
    button.setAttribute("aria-label", `Ver ${item.name}`);

    const mediaBox = document.createElement("span");
    mediaBox.className = "thumb-media";

    const image = document.createElement("img");
    image.loading = "lazy";
    image.decoding = "async";
    image.alt = "";
    image.onload = () => {
      image.hidden = false;
      mediaBox.classList.remove("is-placeholder");
    };
    image.onerror = () => {
      image.hidden = true;
      image.removeAttribute("src");
      mediaBox.classList.add("is-placeholder");
    };
    image.src = localPhoto(item);

    const name = document.createElement("span");
    name.className = "thumb-name";
    name.textContent = item.name;

    mediaBox.append(image);
    button.append(mediaBox, name);
    button.addEventListener("click", () => selectItem(index));
    return button;
  }

  function buildThumbnails() {
    const fragment = document.createDocumentFragment();
    menu[categoryIndex].items.forEach((item, index) => {
      fragment.append(createThumbnail(item, index));
    });
    elements.thumbs.replaceChildren(fragment);
  }

  function createMenuItem(item, index) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "menu-item";
    button.setAttribute("aria-current", String(index === itemIndex));
    button.setAttribute("aria-label", `${item.name}, $${item.price}`);

    const name = document.createElement("h3");
    name.className = "item-name";
    name.textContent = item.name;

    const price = document.createElement("span");
    price.className = "item-price";
    price.textContent = `$${item.price}`;

    const description = document.createElement("p");
    description.className = "item-desc";
    description.textContent = item.description;

    if (item.tag) {
      const lineBreak = document.createElement("br");
      const tag = document.createElement("span");
      tag.className = "item-tag";
      tag.textContent = item.tag;
      description.append(lineBreak, tag);
    }

    button.append(name, price, description);
    button.addEventListener("click", () => selectItem(index));
    return button;
  }

  function renderSelectedItem({ scrollThumbnail = true } = {}) {
    const items = menu[categoryIndex].items;
    const item = items[itemIndex];

    [...elements.menuList.children].forEach((element, index) => {
      element.setAttribute("aria-current", String(index === itemIndex));
    });
    [...elements.thumbs.children].forEach((element, index) => {
      element.setAttribute("aria-current", String(index === itemIndex));
    });

    elements.galleryTitle.textContent = item.name;
    elements.galleryPrice.textContent = `$${item.price}`;
    elements.galleryDesc.textContent = item.description;
    elements.placeholderName.textContent = item.name;
    elements.counter.innerHTML = `<strong>${String(itemIndex + 1).padStart(2, "0")}</strong> / ${String(items.length).padStart(2, "0")}`;
    loadHeroPhoto(item);

    const activeThumbnail = elements.thumbs.children[itemIndex];
    if (activeThumbnail && scrollThumbnail) {
      activeThumbnail.scrollIntoView({
        behavior: scrollBehavior(),
        block: "nearest",
        inline: "center"
      });
    }
  }

  function renderCategory() {
    const section = menu[categoryIndex];
    const fragment = document.createDocumentFragment();

    elements.categoryTitle.textContent = section.category;
    elements.sectionCount.textContent = `${section.items.length} ${section.items.length === 1 ? "producto" : "productos"}`;

    section.items.forEach((item, index) => {
      fragment.append(createMenuItem(item, index));
    });
    elements.menuList.replaceChildren(fragment);

    buildThumbnails();
    renderSelectedItem({ scrollThumbnail: false });
  }

  function selectItem(index) {
    itemIndex = index;
    renderSelectedItem();
  }

  function selectCategory(index, button, { focus = false } = {}) {
    categoryIndex = index;
    itemIndex = 0;

    [...elements.categories.children].forEach((element) => {
      element.setAttribute("aria-current", "false");
    });
    button.setAttribute("aria-current", "true");
    button.scrollIntoView({
      behavior: scrollBehavior(),
      block: "nearest",
      inline: "center"
    });
    if (focus) button.focus();
    renderCategory();
  }

  function moveCategory(step) {
    const nextIndex = (categoryIndex + step + menu.length) % menu.length;
    selectCategory(nextIndex, elements.categories.children[nextIndex], { focus: true });
  }

  function buildCategories() {
    const fragment = document.createDocumentFragment();

    menu.forEach((section, index) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "category";
      button.setAttribute("aria-current", String(index === categoryIndex));
      button.setAttribute("aria-controls", "menuPanel");
      button.textContent = section.category;
      button.addEventListener("click", () => selectCategory(index, button));
      fragment.append(button);
    });

    elements.categories.replaceChildren(fragment);
  }

  function moveItem(step) {
    const items = menu[categoryIndex].items;
    itemIndex = (itemIndex + step + items.length) % items.length;
    renderSelectedItem();
  }

  elements.categories.addEventListener("keydown", (event) => {
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      moveCategory(-1);
    } else if (event.key === "ArrowRight") {
      event.preventDefault();
      moveCategory(1);
    } else if (event.key === "Home") {
      event.preventDefault();
      selectCategory(0, elements.categories.children[0], { focus: true });
    } else if (event.key === "End") {
      event.preventDefault();
      const lastIndex = menu.length - 1;
      selectCategory(lastIndex, elements.categories.children[lastIndex], { focus: true });
    }
  });

  elements.previous.addEventListener("click", () => moveItem(-1));
  elements.next.addEventListener("click", () => moveItem(1));

  document.addEventListener("keydown", (event) => {
    const target = event.target;
    const isInteractive = target instanceof Element && target.closest("button, a, input, select, textarea");
    if (isInteractive || event.altKey || event.ctrlKey || event.metaKey) return;

    if (event.key === "ArrowLeft") {
      event.preventDefault();
      moveItem(-1);
    } else if (event.key === "ArrowRight") {
      event.preventDefault();
      moveItem(1);
    }
  });

  elements.media.addEventListener("pointerdown", (event) => {
    if (!event.isPrimary) return;
    pointerStart = { id: event.pointerId, x: event.clientX };
    elements.media.setPointerCapture(event.pointerId);
  });

  elements.media.addEventListener("pointerup", (event) => {
    if (!pointerStart || pointerStart.id !== event.pointerId) return;

    const distance = event.clientX - pointerStart.x;
    pointerStart = null;
    if (Math.abs(distance) > 45) moveItem(distance < 0 ? 1 : -1);
  });

  elements.media.addEventListener("pointercancel", () => {
    pointerStart = null;
  });

  const logo = document.querySelector("[data-logo]");
  function showLogoPlaceholder() {
    logo.closest(".logo-shell").classList.add("is-placeholder");
    logo.removeAttribute("src");
  }

  logo.addEventListener("error", showLogoPlaceholder);
  if (logo.complete && logo.naturalWidth === 0) showLogoPlaceholder();

  buildCategories();
  renderCategory();
})();
