const USER_KEY = "curvysweetUser";
const CARDS_KEY = "curvysweetPaymentMethods";
const ORDERS_KEY = "curvysweetOrders";
const PREFERENCES_KEY = "curvysweetPreferences";
let currentUser = null;

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

function userKey(key) {
  const identity = String(currentUser?.mail || currentUser?.username || "guest").trim().toLowerCase();
  return `${key}:${identity}`;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function setStatus(message) {
  const status = document.querySelector("[data-account-status]");
  if (status) status.textContent = message;
}

function setAvatar(style, symbol) {
  document.querySelectorAll("[data-account-avatar], [data-user-avatar]").forEach((avatar) => {
    avatar.dataset.avatarStyle = style;
    avatar.textContent = symbol;
  });

  document.querySelectorAll("[data-avatar-option]").forEach((option) => {
    option.classList.toggle("active", option.dataset.avatarOption === style);
  });
}

function activateTab(tabName) {
  const nextTab = ["profile", "payments", "orders", "preferences"].includes(tabName) ? tabName : "profile";

  document.querySelectorAll("[data-account-tab]").forEach((tab) => {
    tab.classList.toggle("active", tab.dataset.accountTab === nextTab);
  });
  document.querySelectorAll("[data-account-view]").forEach((view) => {
    view.classList.toggle("active", view.dataset.accountView === nextTab);
  });

  const url = new URL(window.location.href);
  url.searchParams.set("tab", nextTab);
  history.replaceState({}, "", url);
}

function renderCards() {
  const cards = readJson(userKey(CARDS_KEY), []);
  const list = document.querySelector("[data-payment-list]");
  const count = document.querySelector("[data-card-count]");

  if (count) count.textContent = `${cards.length} guardada${cards.length === 1 ? "" : "s"}`;
  if (!list) return;

  if (!cards.length) {
    list.innerHTML = `<div class="empty-state"><strong>No tienes tarjetas añadidas</strong><span>Añade una referencia segura para identificar tus métodos de pago.</span></div>`;
    return;
  }

  list.innerHTML = cards
    .map(
      (card) => `
        <article class="payment-card">
          <div><span>${escapeHtml(card.brand)}</span><strong>•••• ${escapeHtml(card.last4)}</strong><small>${escapeHtml(card.label)}</small></div>
          <button type="button" data-remove-card="${escapeHtml(card.id)}" aria-label="Quitar ${escapeHtml(card.label)}">Quitar</button>
        </article>
      `,
    )
    .join("");
}

async function renderOrders() {

  const list = document.querySelector("[data-order-list]");
  if (!list) return;

  try {

    const response = await fetch("/api/orders");

    if (!response.ok) {
      throw new Error();
    }

    const orders = await response.json();

    if (!orders.length) {
      list.innerHTML = `
        <section class="empty-state order-empty">
          <span class="empty-icon">0</span>
          <strong>Todavía no has realizado ningún pedido</strong>
          <span>Cuando completes una compra aparecerá aquí con su estado y referencia.</span>
          <a href="/shop">Explorar tienda</a>
        </section>
      `;
      return;
    }

    list.innerHTML = orders
      .map(order => `
        <a href="/pedido/${order.Id}" class="order-card-link">

          <article class="order-card">

            <div class="order-header">
              <div>
                <span>Pedido ${escapeHtml(order.Id.slice(0, 8))}</span>
                <strong>${Number(order.ImporteTotal).toFixed(2)} €</strong>
              </div>

              <div>
                <span>${new Date(order.Fecha).toLocaleDateString("es-ES")}</span>
                <strong class="order-status">${escapeHtml(order.Estado)}</strong>
              </div>
            </div>

            <div class="order-products">

              ${(order.Productos || []).map(product => `
                <div class="order-product">
                  <span>${escapeHtml(product.NombreProducto)}</span>
                  <span>x${product.Cantidad}</span>
                  <strong>${Number(product.PrecioUnitario).toFixed(2)} €</strong>
                </div>
              `).join("")}

            </div>

          </article>

        </a>
      `)
      .join("");

  } catch {

    list.innerHTML = `
      <section class="empty-state order-empty">
        <strong>No se pudieron cargar los pedidos.</strong>
      </section>
    `;

  }

}

function init() {
  const user = readJson(USER_KEY, null);

  if (!user) {
    window.location.href = "/login";
    return;
  }

  currentUser = user;

  const profileForm = document.querySelector("[data-profile-form]");
  const preferencesForm = document.querySelector("[data-preferences-form]");
  const preferences = readJson(userKey(PREFERENCES_KEY), {});

  document.querySelector("[data-account-name]").textContent = user.name || user.username || "Mi cuenta";
  document.querySelector("[data-account-mail]").textContent = user.mail || "";
  setAvatar(user.avatarStyle || "berry", user.avatarSymbol || (user.name || "C").charAt(0).toUpperCase());

  if (profileForm) {
    profileForm.elements.name.value = user.name || "";
    profileForm.elements.username.value = user.username || "";
    profileForm.elements.mail.value = user.mail || "";
    profileForm.elements.phone.value = user.phone || "";
    profileForm.elements.birthday.value = user.birthday || "";
  }

  if (preferencesForm) {
    preferencesForm.elements.marketing.checked = Boolean(preferences.marketing);
    preferencesForm.elements.stockAlerts.checked = Boolean(preferences.stockAlerts);
    preferencesForm.elements.cartReminders.checked = Boolean(preferences.cartReminders);
  }

  document.querySelectorAll("[data-account-tab]").forEach((tab) => {
    tab.addEventListener("click", () => activateTab(tab.dataset.accountTab));
  });

  document.querySelectorAll("[data-avatar-option]").forEach((option) => {
    option.addEventListener("click", () => {
      const nextUser = {
        ...readJson(USER_KEY, {}),
        avatarStyle: option.dataset.avatarOption,
        avatarSymbol: option.dataset.avatarSymbol,
      };
      writeJson(USER_KEY, nextUser);
      setAvatar(nextUser.avatarStyle, nextUser.avatarSymbol);
      setStatus("Avatar actualizado.");
    });
  });

  profileForm?.addEventListener("submit", (event) => {
    event.preventDefault();
    const data = new FormData(profileForm);
    const nextUser = {
      ...readJson(USER_KEY, {}),
      name: String(data.get("name") || ""),
      username: String(data.get("username") || ""),
      phone: String(data.get("phone") || ""),
      birthday: String(data.get("birthday") || ""),
    };
    writeJson(USER_KEY, nextUser);
    document.querySelector("[data-account-name]").textContent = nextUser.name;
    document.querySelectorAll("[data-user-name]").forEach((name) => (name.textContent = nextUser.name));
    setStatus("Perfil guardado.");
  });

  document.querySelector("[data-payment-form]")?.addEventListener("submit", (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const cards = readJson(userKey(CARDS_KEY), []);
    cards.push({
      id: crypto.randomUUID?.() || String(Date.now()),
      label: String(data.get("label") || ""),
      brand: String(data.get("brand") || ""),
      last4: String(data.get("last4") || ""),
    });
    writeJson(userKey(CARDS_KEY), cards);
    form.reset();
    renderCards();
    setStatus("Tarjeta añadida.");
  });

  document.querySelector("[data-payment-list]")?.addEventListener("click", (event) => {
    const button = event.target.closest("[data-remove-card]");
    if (!button) return;
    writeJson(userKey(CARDS_KEY), readJson(userKey(CARDS_KEY), []).filter((card) => card.id !== button.dataset.removeCard));
    renderCards();
    setStatus("Tarjeta eliminada.");
  });

  preferencesForm?.addEventListener("submit", (event) => {
    event.preventDefault();
    writeJson(userKey(PREFERENCES_KEY), {
      marketing: preferencesForm.elements.marketing.checked,
      stockAlerts: preferencesForm.elements.stockAlerts.checked,
      cartReminders: preferencesForm.elements.cartReminders.checked,
    });
    setStatus("Preferencias guardadas.");
  });

  document.querySelector("[data-account-logout]")?.addEventListener("click", async () => {
    localStorage.removeItem(USER_KEY);
    await fetch("/api/logout", { method: "POST" }).catch(() => {});
    window.location.href = "/";
  });

  renderCards();
  renderOrders();
  activateTab(new URLSearchParams(window.location.search).get("tab") || "profile");
}

init();
