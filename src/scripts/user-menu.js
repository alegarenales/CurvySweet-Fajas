const USER_STORAGE_KEY = "curvysweetUser";

function readStoredUser() {
  try {
    return JSON.parse(localStorage.getItem(USER_STORAGE_KEY) || "null");
  } catch {
    return null;
  }
}

function closeUserMenu(userMenuButton, userMenuPanel) {
  userMenuButton?.setAttribute("aria-expanded", "false");

  if (userMenuPanel) {
    userMenuPanel.hidden = true;
  }
}

export function initUserMenu() {
  const user = readStoredUser();
  const guestLinks = document.querySelectorAll("[data-guest-link]");
  const userMenu = document.querySelector("[data-user-menu]");
  const userMenuButton = document.querySelector("[data-user-menu-button]");
  const userMenuPanel = document.querySelector("[data-user-menu-panel]");
  const userName = document.querySelector("[data-user-name]");
  const userAvatar = document.querySelector("[data-user-avatar]");
  const logoutButton = document.querySelector("[data-logout-button]");

  if (!userMenu || userMenu.dataset.userMenuReady === "true") {
    return;
  }

  userMenu.dataset.userMenuReady = "true";

  if (user) {
    guestLinks.forEach((link) => {
      link.hidden = true;
    });

    userMenu.hidden = false;

    if (userName) {
      userName.textContent = user.name || user.username || "Mi cuenta";
    }

    if (userAvatar) {
      userAvatar.textContent = user.avatarSymbol || (user.name || user.username || "U").trim().charAt(0).toUpperCase();
      userAvatar.dataset.avatarStyle = user.avatarStyle || "berry";
    }
  }

  userMenuButton?.addEventListener("click", () => {
    const isOpen = userMenuButton.getAttribute("aria-expanded") === "true";

    userMenuButton.setAttribute("aria-expanded", String(!isOpen));

    if (userMenuPanel) {
      userMenuPanel.hidden = isOpen;
    }
  });

  document.addEventListener("click", (event) => {
    if (userMenu.hidden || userMenu.contains(event.target)) {
      return;
    }

    closeUserMenu(userMenuButton, userMenuPanel);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") {
      return;
    }

    closeUserMenu(userMenuButton, userMenuPanel);
  });

  logoutButton?.addEventListener("click", async () => {
    localStorage.removeItem(USER_STORAGE_KEY);
    await fetch("/api/logout", { method: "POST" }).catch(() => {});
    window.location.href = "/";
  });
}
