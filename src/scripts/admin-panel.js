const PRODUCT_STORAGE_KEY = "curvysweetAdminProductDrafts";
const USER_STORAGE_KEY = "curvysweetUser";
const orderModal = document.getElementById("order-modal");
const orderModalBody = document.getElementById("order-modal-body");
const closeOrderModal = document.getElementById("close-order-modal");
const orderModalTitle = document.getElementById("order-modal-title");
const orderStatusBadge = document.getElementById("order-status-badge");

const toast = document.getElementById("toast");
const toastMessage = document.getElementById("toast-message");

let toastTimeout;

/**
 * Escapa el texto antes de interpolarlo en HTML.
 *
 * Los pedidos llevan datos escritos por las clientas (nombre y correo, tanto de
 * la tabla USERS como de los datos de facturación que devuelve Stripe). Sin
 * escapar, alguien podría registrarse con un nombre que contenga etiquetas y
 * ejecutar código en el navegador de la administradora justo donde se gestionan
 * todos los pedidos.
 */
function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

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
async function publishCatalogDrafts(catalog) {
  const response = await fetch("/api/admin/catalog", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ catalog }),
  });
  const result = await response.json();

  if (!response.ok || !result.ok) {
    throw new Error(result.message || "No se pudo publicar el catálogo.");
  }

  return catalog;
}

function setStockToggleState(panel, productId, stock) {
  const nextStock = stock === "out" ? "out" : "in";
  const inStock = nextStock === "in";
  const input = panel.querySelector(`[data-admin-stock-input="${productId}"]`);
  const button = panel.querySelector(`[data-admin-stock-toggle="${productId}"]`);

  if (input) {
    input.value = nextStock;
  }

  if (button) {
    button.dataset.stockState = nextStock;
    button.textContent = inStock ? "En stock" : "Sin stock";
    button.setAttribute("aria-pressed", String(inStock));
  }
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
    throw new Error(result.message || "No se pudieron cargar las gráficas.");
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

function renderOrders(panel, orders) {

    const list = panel.querySelector("[data-admin-orders-list]");

    if (!list) return;

    list.innerHTML = "";

    orders.forEach((order) => {

        const row = document.createElement("tr");

        row.innerHTML = `
            <td>${escapeHtml(order.Id)}</td>
            <td>${escapeHtml(order.Name)}</td>
            <td>${escapeHtml(order.Mail)}</td>
            <td>${escapeHtml(new Date(order.Fecha).toLocaleDateString("es-ES"))}</td>
            <td>${escapeHtml(order.ImporteTotal)} €</td>
            <td data-order-state="${escapeHtml(order.Id)}">
                ${escapeHtml(order.Estado)}
            </td>
            <td>
                <button
                    type="button"
                    class="admin-primary-button"
                    data-order-id="${escapeHtml(order.Id)}">
                    Ver
                </button>
            </td>
        `;

        list.appendChild(row);

    });
    list.querySelectorAll("[data-order-id]").forEach((button) => {

      button.addEventListener("click", async () => {

          const orderId = button.dataset.orderId;

          const response = await fetch(`/api/admin/orders/${orderId}`);
          const result = await response.json();

          const order = result;

          orderModal.dataset.orderId = order.Id;

          orderModalTitle.textContent = `Pedido #${order.Id.substring(0, 8)}`;
          orderStatusBadge.textContent = order.Estado;
          orderStatusBadge.className = `order-status-badge ${order.Estado.toLowerCase()}`;

          orderModalBody.innerHTML = `
              <div class="order-info">

                  <strong>ID</strong>
                  <span>${escapeHtml(order.Id)}</span>

                  <strong>Cliente</strong>
                  <span>${escapeHtml(order.Name)}</span>

                  <strong>Email</strong>
                  <span>${escapeHtml(order.Mail)}</span>

                  <strong>Fecha</strong>
                  <span>${escapeHtml(new Date(order.Fecha).toLocaleString())}</span>

                  <strong>Estado</strong>

                  <select id="order-status-select">

                      <option value="Pendiente" ${order.Estado === "Pendiente" ? "selected" : ""}>
                          Pendiente
                      </option>

                      <option value="Preparando" ${order.Estado === "Preparando" ? "selected" : ""}>
                          Preparando
                      </option>

                      <option value="Enviado" ${order.Estado === "Enviado" ? "selected" : ""}>
                          Enviado
                      </option>

                      <option value="Entregado" ${order.Estado === "Entregado" ? "selected" : ""}>
                          Entregado
                      </option>

                      <option value="Cancelado" ${order.Estado === "Cancelado" ? "selected" : ""}>
                          Cancelado
                      </option>

                  </select>
                  <div id="shipping-fields">

                      <strong>Transportista</strong>

                      <select id="shipping-company">

                          <option value="">Selecciona...</option>

                          <option value="Correos Express" ${order.Transportista === "Correos Express" ? "selected" : ""}>
                              Correos Express
                          </option>

                          <option value="GLS" ${order.Transportista === "GLS" ? "selected" : ""}>
                              GLS
                          </option>

                          <option value="MRW" ${order.Transportista === "MRW" ? "selected" : ""}>
                              MRW
                          </option>

                          <option value="SEUR" ${order.Transportista === "SEUR" ? "selected" : ""}>
                              SEUR
                          </option>

                          <option value="DHL" ${order.Transportista === "DHL" ? "selected" : ""}>
                              DHL
                          </option>

                      </select>

                      <strong>Número de seguimiento</strong>

                      <input
                          id="tracking-number"
                          type="text"
                          value="${escapeHtml(order.NumeroSeguimiento ?? "")}"
                          placeholder="Ej. PQ123456789ES"
                      />

                  </div>
                  <strong>Total</strong>
                  <span>${order.ImporteTotal.toFixed(2)} €</span>

              </div>

              <h3 style="margin-top:30px;">Productos</h3>

              <table class="order-products">

                  <thead>
                      <tr>
                          <th>Producto</th>
                          <th>Cantidad</th>
                          <th>Precio</th>
                      </tr>
                  </thead>

                  <tbody>

                      ${order.Productos.map(product => `
                          <tr>
                              <td>${escapeHtml(product.NombreProducto)}</td>
                              <td>${Number(product.Cantidad) || 0}</td>
                              <td>${(Number(product.PrecioUnitario) || 0).toFixed(2)} €</td>
                          </tr>
                      `).join("")}

                  </tbody>

              </table>
              <h3 style="margin-top:30px;">Historial</h3>

              <div class="order-history">

                  ${order.Historial.map(item => {

                      let icon = "⚪";

                      switch (item.Estado) {
                          case "Pendiente":
                              icon = "🟢";
                              break;

                          case "Preparando":
                              icon = "🟡";
                              break;

                          case "Enviado":
                              icon = "🚚";
                              break;

                          case "Entregado":
                              icon = "📦";
                              break;

                          case "Cancelado":
                              icon = "❌";
                              break;
                      }

                      return `
                          <div class="history-item">

                              <div class="history-icon">
                                  ${icon}
                              </div>

                              <div class="history-content">

                                  <strong>${escapeHtml(item.Estado)}</strong>

                                  <span>
                                      ${escapeHtml(new Date(item.Fecha).toLocaleString("es-ES"))}
                                  </span>

                              </div>

                          </div>
                      `;

                  }).join("")}

              </div>
              <div class="order-actions">

                  <button
                      id="save-order-status"
                      class="admin-primary-button">

                      Guardar cambios

                  </button>

              </div>
          `;
          console.log(orderModal);
          console.log(orderModalBody);
          orderModal.classList.remove("hidden");
          const saveButton = document.getElementById("save-order-status");
          const statusSelect = document.getElementById("order-status-select");
          const shippingCompany = document.getElementById("shipping-company");
          const trackingNumber = document.getElementById("tracking-number");

          const shippingFields = document.getElementById("shipping-fields");

          function toggleShippingFields() {
            if (!shippingFields) return;

            shippingFields.style.display =
                statusSelect.value === "Enviado"
                    ? ""
                    : "none";
          }
          statusSelect.addEventListener("change", toggleShippingFields);

          toggleShippingFields();
          saveButton.onclick = async () => {

              const response = await fetch(
                  `/api/admin/orders/${orderModal.dataset.orderId}`,
                  {
                      method: "PATCH",
                      headers: {
                          "Content-Type": "application/json"
                      },
                      body: JSON.stringify({
                          estado: statusSelect.value,
                          transportista: shippingCompany.value,
                          numeroSeguimiento: trackingNumber.value
                      })
                  }
              );

              const result = await response.json();

              if (!response.ok || !result.ok) {
                  showToast(result.message, "error");
                  return;
              }

              orderStatusBadge.textContent = statusSelect.value;
              orderStatusBadge.className =
                  `order-status-badge ${statusSelect.value.toLowerCase()}`;


              const stateCell = document.querySelector(
                  `[data-order-state="${orderModal.dataset.orderId}"]`
              );

              if (stateCell) {
                  stateCell.textContent = statusSelect.value;
              }

              showToast("Estado actualizado correctamente");
              orderStatusBadge.textContent = statusSelect.value;
              orderStatusBadge.className =
                  `order-status-badge ${statusSelect.value.toLowerCase()}`;
          };
        });
    });
}
async function loadUsers(panel) {
  const response = await fetch("/api/admin/users");
  const result = await response.json();

  if (!response.ok || !result.ok) {
    throw new Error(result.message || "No se pudieron cargar los usuarios.");
  }

  renderUsers(panel, result.users);
}
async function loadOrders(panel) {

  const response = await fetch("/api/admin/orders");
  const result = await response.json();

  if (!response.ok || !result.ok) {
    throw new Error(result.message || "No se pudieron cargar los pedidos.");
  }

  renderOrders(panel, result.orders);

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

  panel.hidden = false;

  // const catalogDrafts = readJson(CATALOG_STORAGE_KEY, {});
  const productDrafts = readJson(PRODUCT_STORAGE_KEY, []);
  const productForm = panel.querySelector("[data-admin-product-form]");
  const draftForm = panel.querySelector("[data-admin-draft-form]");
  const clearCatalogButton = panel.querySelector("[data-admin-clear-catalog]");
  const clearDraftsButton = panel.querySelector("[data-admin-clear-drafts]");
  const logoutButton = panel.querySelector("[data-admin-logout]");
  const refreshMetricsButton = panel.querySelector("[data-admin-refresh-metrics]");
  const refreshUsersButton = panel.querySelector("[data-admin-refresh-users]");
  const refreshOrdersButton = panel.querySelector("[data-admin-refresh-orders]");
  const userForm = panel.querySelector("[data-admin-user-form]");
  const maintenanceToggle = panel.querySelector("[data-maintenance-toggle]");

  // syncCatalogInputs(panel, catalogDrafts);
  // applyCatalogDrafts(catalogDrafts);
  renderDrafts(panel, productDrafts);
  // loadCatalogDrafts(panel).catch((error) => setStatus(panel, error.message));
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

      if (target === "orders") {
          loadOrders(panel).catch((error) => setStatus(panel, error.message));
      }
    });
  });

  panel.querySelectorAll("[data-admin-stock-toggle]").forEach((button) => {
    button.addEventListener("click", () => {
      const productId = button.dataset.adminStockToggle;
      const nextStock = button.dataset.stockState === "in" ? "out" : "in";

      setStockToggleState(panel, productId, nextStock);
    });
  });
  panel.querySelectorAll("[data-admin-quantity-input]").forEach((input) => {

      input.addEventListener("input", () => {

          const productId = input.dataset.adminQuantityInput;

          const stockInput = panel.querySelector(
              `[data-admin-stock-input="${productId}"]`
          );

          const toggle = panel.querySelector(
              `[data-admin-stock-toggle="${productId}"]`
          );

          const inStock = Number(input.value) > 0;

          stockInput.value = inStock ? "in" : "out";

          toggle.dataset.stockState = inStock ? "in" : "out";
          toggle.setAttribute("aria-pressed", String(inStock));
          toggle.textContent = inStock ? "En stock" : "Sin stock";

      });

  });
  panel.querySelectorAll("[data-admin-quantity-input]").forEach((input) => {
      input.addEventListener("input", () => {
          const productId = input.dataset.adminQuantityInput;

          const stock = Number(input.value);

          setStockToggleState(
              panel,
              productId,
              stock > 0 ? "in" : "out"
          );
      });
  });

  panel.querySelectorAll("[data-admin-image-input]").forEach((input) => {
    input.addEventListener("input", () => {
      const productId = input.dataset.adminImageInput;
      const preview = panel.querySelector(`[data-admin-image-preview="${productId}"]`);

      if (preview) {
        preview.style.backgroundImage = input.value.trim() ? `url('${input.value.trim()}')` : "none";
      }
    });
  });

  productForm?.addEventListener("submit", async (event) => {
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
    Object.values(nextCatalog).forEach((product) => {
      product.stock = Number(product.stock);
      product.inStock = product.inStock === "in";
    });

    try {
        await publishCatalogDrafts(nextCatalog);

        setStatus(panel, "Productos actualizados correctamente.");
    } catch (error) {
      setStatus(panel, error.message);
    }
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

  clearCatalogButton?.addEventListener("click", async () => {
    try {
      window.location.reload();
    } catch (error) {
      setStatus(panel, error.message);
    }
  });

  clearDraftsButton?.addEventListener("click", () => {
    localStorage.removeItem(PRODUCT_STORAGE_KEY);
    renderDrafts(panel, []);
    setStatus(panel, "Borradores limpiados.");
  });

  refreshMetricsButton?.addEventListener("click", () => {
    loadMetrics(panel)
      .then(() => setStatus(panel, "Gráficas actualizadas."))
      .catch((error) => setStatus(panel, error.message));
  });

  refreshUsersButton?.addEventListener("click", () => {
    loadUsers(panel)
      .then(() => setStatus(panel, "Usuarios cargados."))
      .catch((error) => setStatus(panel, error.message));
  });
  refreshOrdersButton?.addEventListener("click", () => {

      loadOrders(panel)
          .then(() => setStatus(panel, "Pedidos cargados."))
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

    setStatus(panel, maintenanceToggle.checked ? "Página en mantenimiento activada." : "Página en mantenimiento desactivada.");
  });

  logoutButton?.addEventListener("click", async () => {
    localStorage.removeItem(USER_STORAGE_KEY);
    await fetch("/api/logout", { method: "POST" }).catch(() => {});
    window.location.href = "/login";
  });
}

closeOrderModal.addEventListener("click", () => {
    orderModal.classList.add("hidden");
});

orderModal.addEventListener("click", (e) => {

    if(e.target === orderModal){
        orderModal.classList.add("hidden");
    }

});

function showToast(message, type = "success") {

    clearTimeout(toastTimeout);

    toast.className = "toast";
    toastMessage.textContent = message;

    if (type !== "success") {
        toast.classList.add(type);
    }

    toast.classList.remove("hidden");

    toastTimeout = setTimeout(() => {
        toast.classList.add("hidden");
    }, 3000);

}