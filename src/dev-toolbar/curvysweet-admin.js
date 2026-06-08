import { defineToolbarApp } from "astro/toolbar";

const CATALOG_STORAGE_KEY = "curvysweetAdminCatalogDrafts";
const PRODUCT_STORAGE_KEY = "curvysweetAdminProductDrafts";
const USER_STORAGE_KEY = "curvysweetUser";
const DASHBOARD_VIEW_KEY = "curvysweetDashboardView";

const products = [
  {
    id: "faja_chaleco_cinturilla",
    name: "Faja Chaleco Cinturilla",
    price: "55 EUR",
    image: "/products/faja chaleco cinturilla/faja_chaleco_cinturilla_1.jpg",
    inStock: true,
  },
  {
    id: "cinturilla_reloj_arena",
    name: "Cinturilla Reloj Arena",
    price: "50 EUR",
    image: "/products/faja cinturilla efecto reloj de arena/faja_cinturilla_efecto_reloj_de_arena_1.jpg",
    inStock: true,
  },
  {
    id: "faja_control_abdominal",
    name: "Faja Moldeadora Reductora",
    price: "48 EUR",
    image: "/products/faja moldeadora reductora - control total/faja_moldeadora-reductora_1.jpg",
    inStock: false,
  },
  {
    id: "faja_latex",
    name: "Faja Latex",
    price: "45 EUR",
    image: "/products/faja de latex/faja_de_latex_1.jpg",
    inStock: true,
  },
  {
    id: "faja_moldeadora",
    name: "Faja Short Moldeadora",
    price: "45 EUR",
    image: "/products/faja short moldeadora/faja_short_moldeadora_4.jpg",
    inStock: true,
  },
];

function readJson(key, fallback) {
  try {
    return JSON.parse(localStorage.getItem(key) || "") ?? fallback;
  } catch {
    return fallback;
  }
}

function writeJson(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function isAdminUser() {
  return Boolean(readJson(USER_STORAGE_KEY, null)?.isAdmin);
}

function animateTextChange(element, nextText) {
  if (element.textContent === nextText) return;

  if (!element.animate) {
    element.textContent = nextText;
    return;
  }

  element.animate(
    [
      { opacity: 1, transform: "translateY(0) scale(1)" },
      { opacity: 0, transform: "translateY(-8px) scale(.98)" },
    ],
    { duration: 140, easing: "cubic-bezier(.2,.8,.2,1)" },
  ).finished.then(() => {
    element.textContent = nextText;
    element.animate(
      [
        { opacity: 0, transform: "translateY(10px) scale(.98)" },
        { opacity: 1, transform: "translateY(0) scale(1)" },
      ],
      { duration: 240, easing: "cubic-bezier(.16,1,.3,1)" },
    );
  });
}

function setImageSource(element, image) {
  if (element instanceof HTMLImageElement) {
    element.src = image;
    return;
  }

  element.style.backgroundImage = `url('${image}')`;
}

function animateImageChange(element, image) {
  const currentImage = element instanceof HTMLImageElement ? element.src : element.style.backgroundImage;

  if (currentImage.includes(image)) return;

  const container = element.closest("[data-product-images]");

  if (container) {
    container.dataset.productImages = image;
  }

  if (!element.animate) {
    setImageSource(element, image);
    return;
  }

  element.animate(
    [
      { opacity: 1, filter: "saturate(1)", transform: "scale(1)" },
      { opacity: .24, filter: "saturate(.6)", transform: "scale(.985)" },
    ],
    { duration: 160, easing: "cubic-bezier(.2,.8,.2,1)" },
  ).finished.then(() => {
    setImageSource(element, image);
    element.animate(
      [
        { opacity: .2, filter: "saturate(.75)", transform: "scale(1.015)" },
        { opacity: 1, filter: "saturate(1)", transform: "scale(1)" },
      ],
      { duration: 300, easing: "cubic-bezier(.16,1,.3,1)" },
    );
  });
}

function applyCatalogDrafts(catalogDrafts) {
  Object.entries(catalogDrafts).forEach(([productId, productDraft]) => {
    if (productDraft.price) {
      document.querySelectorAll(`[data-product-price="${productId}"]`).forEach((element) => {
        animateTextChange(element, productDraft.price);
      });
    }

    if (productDraft.name) {
      document.querySelectorAll(`[data-product-name="${productId}"]`).forEach((element) => {
        animateTextChange(element, productDraft.name);
      });
    }

    if (productDraft.image) {
      document.querySelectorAll(`[data-product-image="${productId}"]`).forEach((element) => {
        animateImageChange(element, productDraft.image);
      });
    }

    if (productDraft.stock) {
      const inStock = productDraft.stock === "in";

      document.querySelectorAll(`[data-product-stock="${productId}"]`).forEach((element) => {
        element.classList.toggle("is-in-stock", inStock);
        element.classList.toggle("is-out-of-stock", !inStock);
        element.setAttribute("aria-label", inStock ? "Producto en stock" : "Producto sin stock");
        element.setAttribute("title", inStock ? "Producto en stock" : "Producto sin stock");

        const stockText = element.querySelector("[data-stock-text]") ?? element.querySelector(".stock-text") ?? element.querySelector("span:last-child");
        if (stockText) {
          animateTextChange(stockText, inStock ? "En stock" : "Sin stock");
        }
      });

      document.querySelectorAll(`[data-product-id="${productId}"]`).forEach((element) => {
        if ("inStock" in element.dataset) {
          element.dataset.inStock = String(inStock);
        }
      });
    }
  });
}

function setStatus(root, message) {
  const status = root.querySelector("[data-status]");

  if (status) {
    status.textContent = message;
  }
}

function getScoreLabel(value) {
  if (value >= 70) return "Alto";
  if (value >= 35) return "Medio";
  if (value >= 15) return "Bajo";
  return "Nuevo";
}

function renderChart(container, items, colorClass) {
  if (!container) return;

  const maxValue = Math.max(...items.map((item) => item.value), 1);
  container.innerHTML = items
    .slice(0, 4)
    .map(
      (item, index) => {
        const percent = Math.min(Math.round((item.value / maxValue) * 100), 99);
        const segmentCount = 5;
        const activeSegments = Math.max(Math.ceil((percent / 100) * segmentCount), 1);

        return `
          <article class="stat-card ${index > 1 ? "compact" : ""}">
            <div class="stat-card-top">
              <span class="stat-icon">${["V", "C", "D", "S"][index] ?? "P"}</span>
              <span class="stat-name">${item.label}</span>
              <span class="stat-help">?</span>
            </div>
            <div class="stat-value">${percent}<small>%</small></div>
            <div class="segment-track">
              ${Array.from({ length: segmentCount })
                .map((_, segmentIndex) => `<span class="${segmentIndex < activeSegments ? colorClass : ""}"></span>`)
                .join("")}
            </div>
            <strong class="stat-label">${getScoreLabel(percent)}</strong>
          </article>
        `;
      },
    )
    .join("");
}

function renderWaveStats(container, items) {
  if (!container) return;

  const maxValue = Math.max(...items.map((item) => item.value), 1);
  const labels = ["WTSD", "WSD", "WWSF", "AGG"];
  const icons = ["L", "H", "O", "A"];

  container.innerHTML = items
    .slice(0, 4)
    .map((item, index) => {
      const percent = Math.min(Math.round((item.value / maxValue) * 100), 99);
      const waveOffset = 38 + (index % 3) * 8;

      return `
        <article class="wave-stat">
          <div class="wave-top">
            <span class="wave-icon">${icons[index] ?? "S"}</span>
            <strong>${labels[index] ?? "STAT"}</strong>
            <span class="stat-help">?</span>
          </div>
          <div class="wave-fill" style="--wave-y: ${waveOffset}%;"></div>
          <div class="wave-value">${percent}<small>%</small></div>
        </article>
      `;
    })
    .join("");
}

function renderBarGraph(container, items, colorClass) {
  if (!container) return;

  const maxValue = Math.max(...items.map((item) => item.value), 1);

  container.innerHTML = items
    .slice(0, 5)
    .map((item) => {
      const percent = Math.min(Math.round((item.value / maxValue) * 100), 100);

      return `
        <div class="bar-row">
          <div class="bar-copy">
            <strong>${item.label}</strong>
            <span>${percent}%</span>
          </div>
          <div class="bar-track">
            <span class="${colorClass}" style="width: ${percent}%;"></span>
          </div>
        </div>
      `;
    })
    .join("");
}

function renderDrafts(root) {
  const drafts = readJson(PRODUCT_STORAGE_KEY, []);
  const list = root.querySelector("[data-draft-list]");
  const draftCount = root.querySelector("[data-draft-count]");

  if (draftCount) {
    draftCount.textContent = String(drafts.length);
  }

  if (!list) return;

  list.innerHTML = drafts
    .map((draft) => `<div class="soft-row"><strong>${draft.name}</strong><span>${[draft.price, draft.tag].filter(Boolean).join(" - ")}</span></div>`)
    .join("");
}

function renderUsers(root, users) {
  const select = root.querySelector("[data-user-select]");
  const list = root.querySelector("[data-user-list]");

  if (select) {
    select.innerHTML = users
      .map((user) => `<option value="${user.id}">${user.mail || user.username || user.id} - ${user.stateLabel}</option>`)
      .join("");
  }

  if (list) {
    list.innerHTML = users
      .map((user) => `<div class="soft-row"><strong>${user.mail || user.username || user.id}</strong><span>${user.stateLabel}</span></div>`)
      .join("");
  }
}

async function loadMetrics(root) {
  const response = await fetch("/api/admin/metrics");
  const result = await response.json();

  if (!response.ok || !result.ok) {
    throw new Error(result.message || "No se pudieron cargar las graficas.");
  }

  renderChart(root.querySelector("[data-chart-views]"), result.views, "red");
  renderChart(root.querySelector("[data-chart-purchases]"), result.purchases, "green");
  renderChart(root.querySelector("[data-chart-demand]"), result.demand, "orange");
  renderWaveStats(root.querySelector("[data-wave-stats]"), result.demand);
  renderBarGraph(root.querySelector("[data-graph-views]"), result.views, "red");
  renderBarGraph(root.querySelector("[data-graph-purchases]"), result.purchases, "green");
  renderBarGraph(root.querySelector("[data-graph-demand]"), result.demand, "orange");
}

async function loadUsers(root) {
  const response = await fetch("/api/admin/users");
  const result = await response.json();

  if (!response.ok || !result.ok) {
    throw new Error(result.message || "No se pudieron cargar los usuarios.");
  }

  renderUsers(root, result.users);
}

async function loadMaintenance(root) {
  const response = await fetch("/api/admin/maintenance");
  const result = await response.json();
  const toggle = root.querySelector("[data-maintenance]");

  if (toggle && result.ok) {
    toggle.checked = Boolean(result.enabled);
  }
}

function activateView(root, target) {
  root.querySelectorAll("[data-tab]").forEach((item) => item.classList.toggle("active", item.dataset.tab === target));
  root.querySelectorAll("[data-view]").forEach((view) => view.classList.toggle("active", view.dataset.view === target));

  if (target === "users") {
    loadUsers(root).catch((error) => setStatus(root, error.message));
  }
}

function syncCatalogInputs(root, catalogDrafts) {
  Object.entries(catalogDrafts).forEach(([productId, draft]) => {
    root.querySelectorAll(`[data-name-input="${productId}"]`).forEach((input) => {
      if (draft.name) input.value = draft.name;
    });
    root.querySelectorAll(`[data-price-input="${productId}"]`).forEach((input) => {
      if (draft.price) input.value = draft.price;
    });
    root.querySelectorAll(`[data-image-input="${productId}"]`).forEach((input) => {
      if (draft.image) input.value = draft.image;
    });
    root.querySelectorAll(`[data-stock-input="${productId}"]`).forEach((input) => {
      if (draft.stock) {
        input.value = draft.stock;
      }
    });
    root.querySelectorAll(`[data-stock-toggle="${productId}"]`).forEach((button) => {
      if (draft.stock) {
        setStockToggleState(root, productId, draft.stock);
      }
    });
    root.querySelectorAll(`[data-image-preview="${productId}"]`).forEach((preview) => {
      if (draft.image) preview.style.backgroundImage = `url('${draft.image}')`;
    });
  });
}

function setStockToggleState(root, productId, stock) {
  const nextStock = stock === "out" ? "out" : "in";
  const inStock = nextStock === "in";

  root.querySelectorAll(`[data-stock-input="${productId}"]`).forEach((input) => {
    input.value = nextStock;
  });

  root.querySelectorAll(`[data-stock-toggle="${productId}"]`).forEach((button) => {
    button.dataset.stockState = nextStock;
    button.textContent = inStock ? "En stock" : "Sin stock";
    button.setAttribute("aria-pressed", String(inStock));
  });
}

function setDashboardCardMode(root, mode) {
  const nextMode = mode === "wave" ? "wave" : "cards";
  const grid = root.querySelector("[data-dashboard-grid]");

  if (grid) {
    grid.dataset.cardMode = nextMode;
  }

  root.querySelectorAll("[data-card-view]").forEach((button) => {
    button.classList.toggle("active", button.dataset.cardView === nextMode);
  });

  localStorage.setItem(DASHBOARD_VIEW_KEY, nextMode);
}

async function loadCatalogDrafts(root) {
  const response = await fetch("/api/admin/catalog");
  const result = await response.json();

  if (!response.ok || !result.ok) {
    throw new Error(result.message || "No se pudo cargar el catalogo publicado.");
  }

  writeJson(CATALOG_STORAGE_KEY, result.catalog);
  syncCatalogInputs(root, result.catalog);
  applyCatalogDrafts(result.catalog);
}

async function publishCatalogDrafts(catalog) {
  const response = await fetch("/api/admin/catalog", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ catalog }),
  });
  const result = await response.json();

  if (!response.ok || !result.ok) {
    throw new Error(result.message || "No se pudo publicar el catalogo.");
  }

  return result.catalog;
}

function createWindow() {
  const windowElement = document.createElement("astro-dev-toolbar-window");
  windowElement.style.width = "min(1180px, calc(100vw - 24px))";
  windowElement.style.height = "min(760px, calc(100vh - 84px))";
  windowElement.style.maxHeight = "min(760px, calc(100vh - 84px))";
  windowElement.style.padding = "0";
  windowElement.style.borderRadius = "26px";
  windowElement.style.border = "1px solid #18191e";
  windowElement.style.background = "#000";
  windowElement.style.overflow = "hidden";
  windowElement.style.pointerEvents = "auto";

  windowElement.innerHTML = `
    <style>
      :host astro-dev-toolbar-window {
        width: min(1180px, calc(100vw - 28px));
        height: min(760px, calc(100vh - 88px));
        overflow: auto;
        color-scheme: dark;
        background: #000;
        border-color: #202024;
      }

      * { box-sizing: border-box; }

      .shell {
        height: 100%;
        overflow: auto;
        display: grid;
        align-content: start;
        gap: 14px;
        padding: 20px 18px 26px;
        color: #f8f8fb;
        background: #000;
        font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      }

      header {
        display: grid;
        grid-template-columns: 48px 1fr 48px;
        align-items: center;
        gap: 14px;
        padding: 2px 0 0;
      }

      h1, h2, h3, p { margin: 0; }

      h1 {
        text-align: center;
        font-size: 28px;
        line-height: 1;
        font-weight: 650;
        letter-spacing: .01em;
      }

      .icon-button {
        width: 48px;
        height: 48px;
        border: 0;
        padding: 0;
        background: transparent;
        color: #fff;
        font-size: 36px;
        line-height: 1;
      }

      .tabs {
        display: flex;
        gap: 26px;
        overflow-x: auto;
        margin: 0 -18px;
        padding: 10px 18px 14px;
        scrollbar-width: none;
      }

      .tabs::-webkit-scrollbar { display: none; }

      button, input, select {
        font: inherit;
      }

      button {
        cursor: pointer;
      }

      button, input, select {
        transition: border-color .2s ease, background .2s ease, color .2s ease, transform .2s ease, opacity .2s ease;
      }

      button:hover {
        transform: translateY(-1px);
      }

      button:active {
        transform: translateY(0);
      }

      .tabs button {
        flex: 0 0 auto;
        border: 0;
        border-radius: 999px;
        padding: 13px 22px;
        background: transparent;
        color: #f5f5f5;
        font-size: 22px;
        font-weight: 600;
      }

      .tabs button.active {
        background: #242429;
      }

      .view {
        display: none;
        gap: 18px;
      }

      .view.active {
        display: grid;
      }

      .analytics-layout {
        display: grid;
        grid-template-columns: minmax(620px, 1.45fr) minmax(360px, .9fr);
        gap: 16px;
        align-items: start;
      }

      .grid {
        grid-template-columns: 1fr;
      }

      .dashboard-grid {
        display: grid;
        grid-template-columns: repeat(4, minmax(145px, 1fr));
        gap: 12px;
      }

      .stat-cluster {
        display: contents;
      }

      section, .stat-card, .panel-card {
        border: 2px solid #1f2025;
        border-radius: 24px;
        background: #000;
      }

      section {
        padding: 16px;
      }

      .section-head {
        display: grid;
        gap: 12px;
        margin-bottom: 2px;
      }

      .section-head h2 {
        color: #fff;
        font-size: 22px;
        line-height: 1.1;
      }

      .section-actions {
        display: flex;
        flex-wrap: wrap;
        gap: 10px;
      }

      .view-toggle {
        display: inline-flex;
        width: fit-content;
        gap: 4px;
        padding: 4px;
        border: 2px solid #1f2025;
        border-radius: 999px;
        background: #050505;
      }

      .view-toggle button {
        border: 0;
        border-radius: 999px;
        padding: 9px 14px;
        background: transparent;
        color: #9da0aa;
        font-weight: 800;
      }

      .view-toggle button.active {
        background: #242429;
        color: #fff;
      }

      .panel-card {
        padding: 26px;
      }

      .stat-card {
        min-height: 150px;
        display: grid;
        align-content: space-between;
        gap: 10px;
        padding: 16px;
      }

      .stat-card.compact {
        min-height: 144px;
      }

      .dashboard-grid[data-card-mode="wave"] .stat-cluster {
        display: none;
      }

      .dashboard-grid[data-card-mode="cards"] .wave-strip {
        display: none;
      }

      .wave-strip {
        grid-column: 1 / -1;
        display: grid;
        grid-template-columns: repeat(4, minmax(0, 1fr));
        gap: 12px;
      }

      .wave-stat {
        position: relative;
        min-height: 202px;
        overflow: hidden;
        border: 2px solid #24252b;
        border-radius: 28px;
        background: #000;
      }

      .wave-top {
        position: relative;
        z-index: 2;
        display: grid;
        grid-template-columns: auto 1fr auto;
        align-items: center;
        gap: 10px;
        padding: 22px 22px 0;
        color: #aeb5bf;
      }

      .wave-icon {
        color: #c6ced7;
        font-size: 22px;
        font-weight: 900;
      }

      .wave-top strong {
        font-size: 22px;
        letter-spacing: .02em;
      }

      .wave-fill {
        --wave-y: 48%;
        position: absolute;
        left: -2px;
        right: -2px;
        bottom: -2px;
        height: calc(100% - var(--wave-y));
        background: #29292e;
        border-radius: 0 0 24px 24px;
        animation: curvysweetWaterLevel 6.4s ease-in-out infinite;
      }

      .wave-fill::before,
      .wave-fill::after {
        content: "";
        position: absolute;
        left: -140px;
        right: -140px;
        pointer-events: none;
        will-change: transform;
      }

      .wave-fill::before {
        top: -62px;
        height: 78px;
        background:
          url("data:image/svg+xml,%3Csvg width='360' height='78' viewBox='0 0 360 78' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 43 C35 16 72 16 108 43 C144 70 180 70 216 43 C252 16 288 16 324 43 C342 56 351 62 360 62 L360 78 L0 78 Z' fill='%2329292e'/%3E%3C/svg%3E")
          repeat-x bottom left / 360px 78px;
        animation: curvysweetWaveDrift 7.2s linear infinite;
      }

      .wave-fill::after {
        top: -66px;
        height: 78px;
        background:
          url("data:image/svg+xml,%3Csvg width='360' height='78' viewBox='0 0 360 78' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 43 C35 16 72 16 108 43 C144 70 180 70 216 43 C252 16 288 16 324 43 C342 56 351 62 360 62' fill='none' stroke='%233b3c44' stroke-width='5' stroke-linecap='round'/%3E%3C/svg%3E")
          repeat-x bottom left / 360px 78px;
        opacity: .95;
        animation: curvysweetWaveDriftReverse 9.4s linear infinite;
      }

      .wave-stat:nth-child(2) .wave-fill::before {
        animation-duration: 8.4s;
        animation-delay: -.9s;
      }

      .wave-stat:nth-child(2) .wave-fill::after {
        animation-duration: 10.2s;
        animation-delay: -.9s;
      }

      .wave-stat:nth-child(3) .wave-fill::before {
        animation-duration: 6.8s;
        animation-delay: -1.6s;
      }

      .wave-stat:nth-child(3) .wave-fill::after {
        animation-duration: 8.8s;
        animation-delay: -1.6s;
      }

      @keyframes curvysweetWaterLevel {
        0% {
          transform: translateY(0);
        }
        50% {
          transform: translateY(-6px);
        }
        100% {
          transform: translateY(0);
        }
      }

      @keyframes curvysweetWaveDrift {
        0% {
          transform: translate3d(0, 0, 0);
        }
        100% {
          transform: translate3d(-360px, 0, 0);
        }
      }

      @keyframes curvysweetWaveDriftReverse {
        0% {
          transform: translate3d(-360px, -2px, 0);
        }
        100% {
          transform: translate3d(0, -2px, 0);
        }
      }

      @media (prefers-reduced-motion: reduce) {
        .wave-fill::before,
        .wave-fill::after {
          animation: none;
        }
      }

      .wave-value {
        position: absolute;
        z-index: 2;
        left: 26px;
        bottom: 38px;
        color: #fff;
        font-size: 76px;
        line-height: .85;
        letter-spacing: -.05em;
      }

      .wave-value small {
        font-size: .33em;
        margin-left: 4px;
        letter-spacing: 0;
      }

      .stat-card-top {
        display: grid;
        grid-template-columns: auto 1fr auto;
        align-items: center;
        gap: 10px;
        color: #a4a8b2;
        font-size: 15px;
        font-weight: 650;
      }

      .stat-icon {
        color: #c6ced7;
      }

      .stat-help {
        width: 22px;
        height: 22px;
        display: inline-grid;
        place-items: center;
        border: 2px solid #26272d;
        border-radius: 50%;
        color: #7d808a;
        font-size: 13px;
      }

      .stat-value {
        color: #fff;
        font-size: 48px;
        line-height: .9;
        font-weight: 400;
        letter-spacing: -.05em;
      }

      .stat-value small {
        font-size: .34em;
        letter-spacing: 0;
        margin-left: 4px;
      }

      .segment-track {
        display: grid;
        grid-template-columns: repeat(5, 1fr);
        gap: 4px;
      }

      .segment-track span {
        height: 9px;
        border-radius: 999px;
        background: #1f2024;
      }

      .segment-track .red { background: #ff5b72; }
      .segment-track .green { background: #52f0a7; }
      .segment-track .orange { background: #ff9d3c; }

      .stat-label {
        color: #f3f3f5;
        font-size: 18px;
      }

      .wide-card {
        grid-column: 1 / -1;
        display: grid;
        gap: 18px;
      }

      .graph-strip {
        grid-column: 1 / -1;
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: 12px;
      }

      .graph-card {
        display: grid;
        gap: 12px;
      }

      .bar-list {
        display: grid;
        gap: 12px;
      }

      .bar-row {
        display: grid;
        gap: 7px;
      }

      .bar-copy {
        display: flex;
        justify-content: space-between;
        gap: 12px;
        color: #f7f7f8;
        font-size: 13px;
      }

      .bar-copy span {
        color: #9da0aa;
      }

      .bar-track {
        height: 10px;
        overflow: hidden;
        border-radius: 999px;
        background: #1f2024;
      }

      .bar-track span {
        display: block;
        height: 100%;
        border-radius: inherit;
      }

      .bar-track .red { background: linear-gradient(90deg, #ff5b72, #ff8fcb); }
      .bar-track .green { background: linear-gradient(90deg, #52f0a7, #b6ffcf); }
      .bar-track .orange { background: linear-gradient(90deg, #ff9d3c, #ffd166); }

      .quick-editor {
        position: sticky;
        top: 0;
        max-height: calc(100vh - 138px);
        overflow: auto;
      }

      .quick-editor form {
        margin-top: 12px;
      }

      .quick-price-list {
        display: grid;
        gap: 10px;
      }

      .quick-product {
        display: grid;
        grid-template-columns: 58px minmax(0, 1fr);
        gap: 10px;
        align-items: center;
        border: 2px solid #1f2025;
        border-radius: 20px;
        padding: 10px;
        background: #050505;
      }

      .quick-product .image-preview {
        width: 58px;
        min-height: 70px;
        border-radius: 16px;
      }

      .quick-product strong {
        color: #fff;
        font-size: 14px;
      }

      .quick-fields {
        display: grid;
        grid-template-columns: minmax(0, 1fr) 118px;
        gap: 8px;
      }

      .stock-field {
        display: flex;
        align-items: center;
        justify-content: flex-start;
        margin-top: -4px;
      }

      .stock-toggle {
        min-width: 128px;
        border: 0;
        border-radius: 999px;
        padding: 10px 14px;
        color: #06150d;
        background: #52f0a7;
        font-size: 13px;
        font-weight: 800;
        box-shadow: inset 0 0 0 2px rgba(255,255,255,.16);
      }

      .stock-toggle[data-stock-state="out"] {
        color: #fff;
        background: #ff4f63;
      }

      .stock-toggle::before {
        content: "";
        display: inline-block;
        width: 8px;
        height: 8px;
        margin-right: 8px;
        border-radius: 50%;
        background: currentColor;
        vertical-align: 1px;
      }

      .card-title {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 10px;
        color: #a4a8b2;
        font-size: 18px;
        font-weight: 650;
      }

      .gauge-row {
        display: grid;
        grid-template-columns: repeat(4, minmax(0, 1fr));
        gap: 10px;
      }

      .gauge {
        display: grid;
        justify-items: center;
        gap: 12px;
      }

      .ring {
        --value: 25%;
        width: 72px;
        aspect-ratio: 1;
        display: grid;
        place-items: center;
        border-radius: 50%;
        background:
          radial-gradient(circle at center, #000 56%, transparent 57%),
          conic-gradient(#fff 0 var(--value), #202126 var(--value) 78%, transparent 78% 100%);
      }

      .ring.green {
        background:
          radial-gradient(circle at center, #000 56%, transparent 57%),
          conic-gradient(#52f0a7 0 var(--value), #202126 var(--value) 78%, transparent 78% 100%);
      }

      .ring.split {
        background:
          radial-gradient(circle at center, #000 56%, transparent 57%),
          conic-gradient(#ff5b72 0 42%, transparent 42% 47%, #52f0a7 47% var(--value), #202126 var(--value) 78%, transparent 78% 100%);
      }

      .ring strong {
        font-size: 18px;
      }

      .gauge span {
        color: #9da0aa;
        font-size: 14px;
        font-weight: 650;
      }

      .stat-detail-card {
        grid-column: 1 / -1;
        display: grid;
        grid-template-columns: minmax(130px, .85fr) 1px minmax(150px, 1fr);
        gap: 18px;
        align-items: center;
      }

      .divider {
        width: 1px;
        height: 100%;
        min-height: 170px;
        background: #25262b;
      }

      .detail-list {
        display: grid;
      }

      .detail-list div {
        display: flex;
        justify-content: space-between;
        gap: 18px;
        padding: 14px 0;
        border-bottom: 2px solid #202126;
        color: #9da0aa;
        font-size: 17px;
        font-weight: 650;
      }

      .detail-list div:last-child {
        border-bottom: 0;
      }

      .detail-list strong {
        color: #fff;
        font-weight: 650;
      }

      form {
        display: grid;
        gap: 14px;
        margin-top: 18px;
      }

      .product-grid {
        grid-template-columns: 1fr;
      }

      fieldset {
        display: grid;
        grid-template-columns: 96px minmax(0, 1fr);
        gap: 12px;
        border: 2px solid #1f2025;
        border-radius: 22px;
        padding: 18px;
        margin: 0;
        background:
          linear-gradient(145deg, rgba(255, 91, 114, .08), transparent 32%),
          #050505;
      }

      legend {
        padding: 0 8px;
      }

      .image-preview {
        width: 96px;
        min-height: 144px;
        border: 2px solid #202126;
        border-radius: 20px;
        background-color: #111216;
        background-size: cover;
        background-position: center;
        box-shadow: inset 0 0 0 1px rgba(255,255,255,.03);
      }

      .field-stack {
        display: grid;
        gap: 12px;
      }

      .image-row {
        display: grid;
        grid-template-columns: minmax(0, 1fr);
        gap: 8px;
      }

      .form-actions {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 10px;
      }

      legend, label span, .muted, [data-status] {
        color: #9da0aa;
        font-size: 14px;
      }

      label {
        display: grid;
        gap: 8px;
      }

      input, select {
        width: 100%;
        border: 2px solid #26272d;
        border-radius: 16px;
        padding: 13px 14px;
        background: #000;
        color: #fff;
      }

      input:focus, select:focus {
        outline: 0;
        border-color: #52f0a7;
        box-shadow: 0 0 0 4px rgba(82, 240, 167, .1);
      }

      .primary, .secondary {
        border: 0;
        border-radius: 999px;
        padding: 14px 18px;
        color: #000;
        background: #52f0a7;
        font-weight: 800;
      }

      .secondary {
        background: #242429;
        color: #fff;
      }

      .danger {
        background: #33171c;
        color: #ff8a9b;
      }

      .soft-list {
        display: grid;
        gap: 10px;
        margin-top: 16px;
      }

      .soft-row {
        display: flex;
        justify-content: space-between;
        gap: 14px;
        border: 2px solid #1f2025;
        border-radius: 24px;
        padding: 14px 16px;
        background: #050505;
      }

      .soft-row span {
        color: #9da0aa;
      }

      .user-form {
        grid-template-columns: 1fr;
        align-items: end;
      }

      .switch {
        display: flex;
        align-items: center;
        gap: 12px;
        margin-top: 18px;
        color: #fff;
        font-size: 20px;
      }

      .switch input {
        width: auto;
        accent-color: #ff5b72;
      }

      [data-status] {
        min-height: 20px;
        padding: 0 4px 8px;
      }

      @media (max-width: 860px) {
        .analytics-layout, .grid, .dashboard-grid, .product-grid, fieldset, .user-form, .stat-detail-card, .form-actions, .graph-strip, .quick-fields, .wave-strip {
          grid-template-columns: 1fr;
        }

        .image-preview {
          width: 100%;
          min-height: 210px;
        }

        header {
          grid-template-columns: 40px 1fr 40px;
        }

        .gauge-row {
          grid-template-columns: repeat(2, minmax(120px, 1fr));
        }

        .divider {
          display: none;
        }
      }
    </style>
    <div class="shell">
      <header>
        <button class="icon-button" type="button" data-statistics-mode aria-label="Ver estadisticas">&lt;</button>
        <div>
          <h1>Statistics</h1>
        </div>
        <button class="icon-button" type="button" data-refresh-metrics aria-label="Actualizar">R</button>
      </header>

      <nav class="tabs">
        <button class="active" type="button" data-tab="analytics">Total</button>
        <button type="button" data-tab="catalog">Catalogo</button>
        <button type="button" data-tab="users">Usuarios</button>
        <button type="button" data-tab="site">Sitio</button>
      </nav>

      <div class="view active" data-view="analytics">
        <div class="analytics-layout">
          <div class="dashboard-grid" data-dashboard-grid data-card-mode="cards">
            <div class="wide-card" style="border: 0; padding: 0;">
              <div class="view-toggle" aria-label="Tipo de tarjetas">
                <button class="active" type="button" data-card-view="cards">Barras</button>
                <button type="button" data-card-view="wave">Onda</button>
              </div>
            </div>
            <div class="stat-cluster" data-chart-views></div>
            <div class="wave-strip" data-wave-stats></div>

            <section class="graph-strip">
              <div class="graph-card">
                <div class="card-title"><span>Mas visto</span><span class="stat-help">?</span></div>
                <div class="bar-list" data-graph-views></div>
              </div>
              <div class="graph-card">
                <div class="card-title"><span>Comprado</span><span class="stat-help">?</span></div>
                <div class="bar-list" data-graph-purchases></div>
              </div>
              <div class="graph-card">
                <div class="card-title"><span>Demandado</span><span class="stat-help">?</span></div>
                <div class="bar-list" data-graph-demand></div>
              </div>
            </section>

            <section class="wide-card">
              <div class="card-title">
                <span>Demanda por etapa</span>
                <span class="stat-help">?</span>
              </div>
              <div class="gauge-row">
                <div class="gauge"><div class="ring green" style="--value: 19%;"><strong>19%</strong></div><span>Vistas</span></div>
                <div class="gauge"><div class="ring" style="--value: 20%;"><strong>20%</strong></div><span>Carritos</span></div>
                <div class="gauge"><div class="ring" style="--value: 14%;"><strong>14%</strong></div><span>Wishlist</span></div>
                <div class="gauge"><div class="ring" style="--value: 23%;"><strong>23%</strong></div><span>Stock</span></div>
              </div>
            </section>
          </div>

          <section class="quick-editor">
            <div class="section-head">
              <h2>Editar precios</h2>
              <p class="muted">Panel rapido: cambia precio, nombre e imagen sin salir de estadisticas.</p>
            </div>
            <form data-quick-product-form>
              <div class="quick-price-list">
                ${products
                  .map(
                    (product) => `
                      <div class="quick-product">
                        <div class="image-preview" data-image-preview="${product.id}" style="background-image: url('${product.image}');"></div>
                        <div class="field-stack">
                          <strong>${product.name}</strong>
                          <div class="quick-fields">
                            <input name="${product.id}:name" data-name-input="${product.id}" value="${product.name}" aria-label="Nombre ${product.name}" />
                            <input name="${product.id}:price" data-price-input="${product.id}" value="${product.price}" aria-label="Precio ${product.name}" />
                          </div>
                          <label class="stock-field">
                            <input type="hidden" name="${product.id}:stock" data-stock-input="${product.id}" value="${product.inStock ? "in" : "out"}" />
                            <button class="stock-toggle" type="button" data-stock-toggle="${product.id}" data-stock-state="${product.inStock ? "in" : "out"}" aria-pressed="${product.inStock ? "true" : "false"}">
                              ${product.inStock ? "En stock" : "Sin stock"}
                            </button>
                          </label>
                          <input name="${product.id}:image" data-image-input="${product.id}" value="${product.image}" aria-label="Imagen ${product.name}" />
                        </div>
                      </div>
                    `,
                  )
                  .join("")}
              </div>
              <div class="form-actions">
                <button class="primary" type="submit">Aplicar cambios</button>
                <button class="secondary danger" type="button" data-clear-catalog>Restaurar</button>
              </div>
            </form>
          </section>
        </div>
      </div>

      <div class="view grid" data-view="catalog">
        <section>
          <div class="section-head">
            <h2>Editar catalogo</h2>
            <p class="muted">Cambia nombre, precio e imagen y se actualiza en la tienda con una transicion suave.</p>
            <div class="section-actions">
              <button class="secondary" type="button" data-statistics-mode>Ver modo estadisticas</button>
            </div>
          </div>
          <form class="product-grid" data-product-form>
            ${products
              .map(
                (product) => `
                  <fieldset>
                    <legend>${product.name}</legend>
                    <div class="image-preview" data-image-preview="${product.id}" style="background-image: url('${product.image}');"></div>
                    <div class="field-stack">
                      <label>
                        <span>Nombre</span>
                        <input name="${product.id}:name" data-name-input="${product.id}" value="${product.name}" />
                      </label>
                      <label>
                        <span>Precio</span>
                        <input name="${product.id}:price" data-price-input="${product.id}" value="${product.price}" />
                      </label>
                      <label class="image-row">
                        <span>Imagen</span>
                        <input name="${product.id}:image" data-image-input="${product.id}" value="${product.image}" placeholder="/products/imagen.jpg" />
                      </label>
                      <label>
                        <span>Estado</span>
                        <select name="${product.id}:stock" data-stock-input="${product.id}">
                          <option value="in" ${product.inStock ? "selected" : ""}>En stock</option>
                          <option value="out" ${product.inStock ? "" : "selected"}>Sin stock</option>
                        </select>
                      </label>
                    </div>
                  </fieldset>
                `,
              )
              .join("")}
            <div class="form-actions">
              <button class="primary" type="submit">Guardar cambios visibles</button>
              <button class="secondary danger" type="button" data-clear-catalog>Restaurar vista</button>
            </div>
          </form>
        </section>

        <section>
          <h2>Anadir productos</h2>
          <form data-draft-form>
            <label><span>Nombre</span><input name="name" placeholder="Faja nueva" required /></label>
            <label><span>Precio</span><input name="price" placeholder="49 EUR" required /></label>
            <label><span>Etiqueta</span><input name="tag" placeholder="Nuevo" /></label>
            <button class="primary" type="submit">Crear borrador</button>
            <button class="secondary" type="button" data-clear-drafts>Limpiar</button>
          </form>
          <div class="soft-list" data-draft-list></div>
        </section>
      </div>

      <div class="view" data-view="users">
        <section>
          <h2>Bloqueo de usuarios</h2>
          <button class="secondary" type="button" data-refresh-users>Cargar usuarios</button>
          <form class="user-form" data-user-form>
            <label><span>Usuario</span><select name="userId" data-user-select><option value="">Carga usuarios para seleccionar</option></select></label>
            <label><span>Accion</span><select name="state"><option value="1">Bloquear</option><option value="3">Activar</option></select></label>
            <button class="primary" type="submit">Aplicar</button>
          </form>
          <div class="soft-list" data-user-list></div>
        </section>
      </div>

      <div class="view" data-view="site">
        <section>
          <h2>Pagina en mantenimiento</h2>
          <p class="muted">Los visitantes veran una pantalla de mantenimiento; el admin puede seguir navegando.</p>
          <label class="switch"><input type="checkbox" data-maintenance /> Pagina en mantenimiento</label>
        </section>
      </div>

      <p data-status></p>
    </div>
  `;

  return windowElement;
}

function hydrate(root) {
  root.addEventListener("click", (event) => event.stopPropagation());
  root.addEventListener("pointerdown", (event) => event.stopPropagation());
  root.addEventListener("keydown", (event) => event.stopPropagation());

  if (!isAdminUser()) {
    root.innerHTML = `
      <style>
        :host astro-dev-toolbar-window { color-scheme: dark; }
        div { color: white; font-family: Arial, sans-serif; padding: 18px; }
        a { color: #f97316; }
      </style>
      <div>
        <h2>CurvySweet Admin</h2>
        <p>Inicia sesion con el usuario administrador para usar estas herramientas.</p>
        <a href="/login">Ir al login</a>
      </div>
    `;
    return;
  }

  const catalogDrafts = readJson(CATALOG_STORAGE_KEY, {});
  applyCatalogDrafts(catalogDrafts);
  syncCatalogInputs(root, catalogDrafts);
  renderDrafts(root);
  setDashboardCardMode(root, localStorage.getItem(DASHBOARD_VIEW_KEY) || "cards");
  loadCatalogDrafts(root).catch((error) => setStatus(root, error.message));
  loadMetrics(root).catch((error) => setStatus(root, error.message));
  loadMaintenance(root).catch(() => {});

  root.querySelectorAll("[data-tab]").forEach((tab) => {
    tab.addEventListener("click", () => {
      activateView(root, tab.dataset.tab);
    });
  });

  root.querySelectorAll("[data-statistics-mode]").forEach((button) => {
    button.addEventListener("click", () => activateView(root, "analytics"));
  });

  root.querySelectorAll("[data-card-view]").forEach((button) => {
    button.addEventListener("click", () => setDashboardCardMode(root, button.dataset.cardView));
  });

  root.querySelectorAll("[data-image-input]").forEach((input) => {
    input.addEventListener("input", () => {
      root.querySelectorAll(`[data-image-preview="${input.dataset.imageInput}"]`).forEach((preview) => {
        preview.style.backgroundImage = input.value ? `url('${input.value}')` : "none";
      });
    });
  });

  root.querySelectorAll("[data-stock-toggle]").forEach((button) => {
    button.addEventListener("click", () => {
      const productId = button.dataset.stockToggle;
      const nextStock = button.dataset.stockState === "in" ? "out" : "in";

      setStockToggleState(root, productId, nextStock);
    });
  });

  root.querySelectorAll("[data-product-form], [data-quick-product-form]").forEach((form) => {
    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      const nextCatalog = {};
      const formData = new FormData(event.currentTarget);

      formData.forEach((value, key) => {
        const [productId, field] = String(key).split(":");
        nextCatalog[productId] = { ...nextCatalog[productId], [field]: String(value) };
      });

      try {
        const publishedCatalog = await publishCatalogDrafts(nextCatalog);

        writeJson(CATALOG_STORAGE_KEY, publishedCatalog);
        syncCatalogInputs(root, publishedCatalog);
        applyCatalogDrafts(publishedCatalog);
        setStatus(root, "Catalogo publicado. El cambio se mantiene al cerrar sesion.");
      } catch (error) {
        setStatus(root, error.message);
      }
    });
  });

  root.querySelectorAll("[data-clear-catalog]").forEach((button) => {
    button.addEventListener("click", async () => {
      try {
        await publishCatalogDrafts({});
        localStorage.removeItem(CATALOG_STORAGE_KEY);
        window.location.reload();
      } catch (error) {
        setStatus(root, error.message);
      }
    });
  });

  root.querySelector("[data-draft-form]")?.addEventListener("submit", (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const nextDrafts = [
      ...readJson(PRODUCT_STORAGE_KEY, []),
      {
        name: String(formData.get("name") ?? ""),
        price: String(formData.get("price") ?? ""),
        tag: String(formData.get("tag") ?? ""),
      },
    ];

    writeJson(PRODUCT_STORAGE_KEY, nextDrafts);
    renderDrafts(root);
    event.currentTarget.reset();
    setStatus(root, "Borrador de producto creado.");
  });

  root.querySelector("[data-clear-drafts]")?.addEventListener("click", () => {
    localStorage.removeItem(PRODUCT_STORAGE_KEY);
    renderDrafts(root);
  });

  root.querySelector("[data-refresh-metrics]")?.addEventListener("click", () => {
    loadMetrics(root)
      .then(() => setStatus(root, "Graficas actualizadas."))
      .catch((error) => setStatus(root, error.message));
  });

  root.querySelector("[data-refresh-users]")?.addEventListener("click", () => {
    loadUsers(root)
      .then(() => setStatus(root, "Usuarios cargados."))
      .catch((error) => setStatus(root, error.message));
  });

  root.querySelector("[data-user-form]")?.addEventListener("submit", async (event) => {
    event.preventDefault();
    const response = await fetch("/api/admin/users", {
      method: "POST",
      body: new FormData(event.currentTarget),
    });
    const result = await response.json();

    if (!response.ok || !result.ok) {
      setStatus(root, result.message || "No se pudo actualizar el usuario.");
      return;
    }

    renderUsers(root, result.users);
    setStatus(root, result.message);
  });

  root.querySelector("[data-maintenance]")?.addEventListener("change", async (event) => {
    const toggle = event.currentTarget;
    const response = await fetch("/api/admin/maintenance", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ enabled: toggle.checked }),
    });
    const result = await response.json();

    if (!response.ok || !result.ok) {
      toggle.checked = !toggle.checked;
      setStatus(root, result.message || "No se pudo cambiar mantenimiento.");
      return;
    }

    setStatus(root, toggle.checked ? "Pagina en mantenimiento activada." : "Pagina en mantenimiento desactivada.");
  });
}

export default defineToolbarApp({
  init(canvas) {
    const render = () => {
      canvas.innerHTML = "";
      const windowElement = createWindow();
      canvas.append(windowElement);
      hydrate(windowElement);
    };

    render();
    document.addEventListener("astro:after-swap", render);
  },
});
