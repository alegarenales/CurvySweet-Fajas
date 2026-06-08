const CATALOG_STORAGE_KEY = "curvysweetAdminCatalogDrafts";
const PRODUCT_STORAGE_KEY = "curvysweetAdminProductDrafts";
const USER_STORAGE_KEY = "curvysweetUser";

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

function setStatus(panel, message) {
  const status = panel.querySelector("[data-admin-panel-status]");

  if (status) {
    status.textContent = message;
  }
}

function applyCatalogDrafts(catalogDrafts) {
  Object.entries(catalogDrafts).forEach(([productId, productDraft]) => {
    if (productDraft.price) {
      document.querySelectorAll(`[data-product-price="${productId}"]`).forEach((priceElement) => {
        priceElement.textContent = productDraft.price;
      });
    }

    if (productDraft.name) {
      document.querySelectorAll(`[data-product-name="${productId}"]`).forEach((nameElement) => {
        nameElement.textContent = productDraft.name;
      });
    }
  });
}

function renderDrafts(panel, drafts) {
  const list = panel.querySelector("[data-admin-draft-list]");

  if (!list) {
    return;
  }

  list.innerHTML = "";

  drafts.forEach((draft) => {
    const item = document.createElement("div");
    item.className = "admin-draft";

    const name = document.createElement("strong");
    name.textContent = draft.name;

    const meta = document.createElement("span");
    meta.textContent = [draft.price, draft.tag].filter(Boolean).join(" - ");

    item.append(name, meta);
    list.append(item);
  });
}

function renderChart(container, items, colorClass) {
  if (!container) {
    return;
  }

  const maxValue = Math.max(...items.map((item) => item.value), 1);
  container.innerHTML = "";

  items.forEach((item) => {
    const row = document.createElement("div");
    row.className = "admin-bar-row";

    const label = document.createElement("div");
    label.className = "admin-bar-label";

    const name = document.createElement("span");
    name.textContent = item.label;

    const value = document.createElement("span");
    value.textContent = String(item.value);

    const track = document.createElement("div");
    track.className = "admin-bar-track";

    const fill = document.createElement("div");
    fill.className = `admin-bar-fill ${colorClass}`;
    fill.style.width = `${Math.max((item.value / maxValue) * 100, 3)}%`;

    label.append(name, value);
    track.append(fill);
    row.append(label, track);
    container.append(row);
  });
}

async function loadMetrics(panel) {
  const response = await fetch("/api/admin/metrics");
  const result = await response.json();

  if (!response.ok || !result.ok) {
    throw new Error(result.message || "No se pudieron cargar las graficas.");
  }

  renderChart(panel.querySelector("[data-chart-views]"), result.views, "is-red");
  renderChart(panel.querySelector("[data-chart-purchases]"), result.purchases, "is-green");
  renderChart(panel.querySelector("[data-chart-demand]"), result.demand, "is-orange");
}

function renderUsers(panel, users) {
  const select = panel.querySelector("[data-admin-user-select]");
  const list = panel.querySelector("[data-admin-user-list]");

  if (select) {
    select.innerHTML = "";

    users.forEach((user) => {
      const option = document.createElement("option");
      option.value = user.id;
      option.textContent = `${user.mail || user.username || user.id} - ${user.stateLabel}`;
      select.append(option);
    });
  }

  if (list) {
    list.innerHTML = "";

    users.forEach((user) => {
      const item = document.createElement("div");
      item.className = "admin-user-item";

      const identity = document.createElement("strong");
      identity.textContent = user.mail || user.username || user.id;

      const state = document.createElement("span");
      state.textContent = user.stateLabel;

      item.append(identity, state);
      list.append(item);
    });
  }
}

async function loadUsers(panel) {
  const response = await fetch("/api/admin/users");
  const result = await response.json();

  if (!response.ok || !result.ok) {
    throw new Error(result.message || "No se pudieron cargar los usuarios.");
  }

  renderUsers(panel, result.users);
}

async function loadMaintenanceState(panel) {
  const response = await fetch("/api/admin/maintenance");
  const result = await response.json();
  const toggle = panel.querySelector("[data-maintenance-toggle]");

  if (toggle && result.ok) {
    toggle.checked = Boolean(result.enabled);
  }
}

export function initAdminPanel() {
  const panel = document.querySelector("[data-admin-panel]");

  if (!panel) {
    return;
  }

  const storedUser = readJson(USER_STORAGE_KEY, null);
  const adminEmail = panel.dataset.adminEmail?.toLowerCase();
  const storedEmail = storedUser?.mail?.toLowerCase();

  if (!storedUser?.isAdmin || storedEmail !== adminEmail) {
    fetch("/api/logout", { method: "POST" }).catch(() => {});
    panel.remove();
    return;
  }

  panel.hidden = false;

  const catalogDrafts = readJson(CATALOG_STORAGE_KEY, {});
  const productDrafts = readJson(PRODUCT_STORAGE_KEY, []);
  const productForm = panel.querySelector("[data-admin-product-form]");
  const draftForm = panel.querySelector("[data-admin-draft-form]");
  const clearCatalogButton = panel.querySelector("[data-admin-clear-catalog]");
  const clearDraftsButton = panel.querySelector("[data-admin-clear-drafts]");
  const logoutButton = panel.querySelector("[data-admin-logout]");
  const refreshMetricsButton = panel.querySelector("[data-admin-refresh-metrics]");
  const refreshUsersButton = panel.querySelector("[data-admin-refresh-users]");
  const userForm = panel.querySelector("[data-admin-user-form]");
  const maintenanceToggle = panel.querySelector("[data-maintenance-toggle]");

  Object.entries(catalogDrafts).forEach(([productId, productDraft]) => {
    const nameInput = panel.querySelector(`[data-admin-name-input="${productId}"]`);
    const priceInput = panel.querySelector(`[data-admin-price-input="${productId}"]`);

    if (nameInput && productDraft.name) {
      nameInput.value = productDraft.name;
    }

    if (priceInput && productDraft.price) {
      priceInput.value = productDraft.price;
    }
  });

  applyCatalogDrafts(catalogDrafts);
  renderDrafts(panel, productDrafts);
  loadMetrics(panel).catch((error) => setStatus(panel, error.message));
  loadMaintenanceState(panel).catch(() => {});

  panel.querySelectorAll("[data-admin-tab]").forEach((tab) => {
    tab.addEventListener("click", () => {
      const target = tab.dataset.adminTab;

      panel.querySelectorAll("[data-admin-tab]").forEach((item) => {
        item.classList.toggle("is-active", item === tab);
      });

      panel.querySelectorAll("[data-admin-view]").forEach((view) => {
        view.classList.toggle("is-active", view.dataset.adminView === target);
      });

      if (target === "users") {
        loadUsers(panel).catch((error) => setStatus(panel, error.message));
      }
    });
  });

  productForm?.addEventListener("submit", (event) => {
    event.preventDefault();

    const formData = new FormData(productForm);
    const nextCatalog = {};

    formData.forEach((value, key) => {
      const [productId, field] = String(key).split(":");

      if (!productId || !field) {
        return;
      }

      nextCatalog[productId] = {
        ...nextCatalog[productId],
        [field]: String(value),
      };
    });

    writeJson(CATALOG_STORAGE_KEY, nextCatalog);
    applyCatalogDrafts(nextCatalog);
    setStatus(panel, "Nombres y precios guardados para esta vista.");
  });

  draftForm?.addEventListener("submit", (event) => {
    event.preventDefault();

    const formData = new FormData(draftForm);
    const nextDrafts = [
      ...readJson(PRODUCT_STORAGE_KEY, []),
      {
        name: String(formData.get("name") ?? ""),
        price: String(formData.get("price") ?? ""),
        tag: String(formData.get("tag") ?? ""),
      },
    ];

    writeJson(PRODUCT_STORAGE_KEY, nextDrafts);
    renderDrafts(panel, nextDrafts);
    draftForm.reset();
    setStatus(panel, "Borrador de producto creado.");
  });

  clearCatalogButton?.addEventListener("click", () => {
    localStorage.removeItem(CATALOG_STORAGE_KEY);
    setStatus(panel, "Vista de catalogo restaurada.");
    window.location.reload();
  });

  clearDraftsButton?.addEventListener("click", () => {
    localStorage.removeItem(PRODUCT_STORAGE_KEY);
    renderDrafts(panel, []);
    setStatus(panel, "Borradores limpiados.");
  });

  refreshMetricsButton?.addEventListener("click", () => {
    loadMetrics(panel)
      .then(() => setStatus(panel, "Graficas actualizadas."))
      .catch((error) => setStatus(panel, error.message));
  });

  refreshUsersButton?.addEventListener("click", () => {
    loadUsers(panel)
      .then(() => setStatus(panel, "Usuarios cargados."))
      .catch((error) => setStatus(panel, error.message));
  });

  userForm?.addEventListener("submit", async (event) => {
    event.preventDefault();

    const formData = new FormData(userForm);
    const response = await fetch("/api/admin/users", {
      method: "POST",
      body: formData,
    });
    const result = await response.json();

    if (!response.ok || !result.ok) {
      setStatus(panel, result.message || "No se pudo actualizar el usuario.");
      return;
    }

    renderUsers(panel, result.users);
    setStatus(panel, result.message);
  });

  maintenanceToggle?.addEventListener("change", async () => {
    const response = await fetch("/api/admin/maintenance", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ enabled: maintenanceToggle.checked }),
    });
    const result = await response.json();

    if (!response.ok || !result.ok) {
      maintenanceToggle.checked = !maintenanceToggle.checked;
      setStatus(panel, result.message || "No se pudo cambiar mantenimiento.");
      return;
    }

    setStatus(panel, maintenanceToggle.checked ? "Pagina en mantenimiento activada." : "Pagina en mantenimiento desactivada.");
  });

  logoutButton?.addEventListener("click", async () => {
    localStorage.removeItem(USER_STORAGE_KEY);
    await fetch("/api/logout", { method: "POST" }).catch(() => {});
    window.location.href = "/login";
  });
}
