export function initSupportMenu() {
	const supportMenu = document.querySelector("[data-support-menu]");
	const supportButton = document.querySelector("[data-support-menu-button]");
	const supportPanel = document.querySelector("[data-support-menu-panel]");

	if (!supportMenu || !supportButton || !supportPanel) {
		return;
	}

	// Evitar registrar eventos varias veces
	if (supportMenu.dataset.ready === "true") {
		return;
	}

	supportMenu.dataset.ready = "true";

	supportButton.addEventListener("click", () => {
		const isOpen =
			supportButton.getAttribute("aria-expanded") === "true";

		// Cerrar el menú de usuario si está abierto
		const userButton = document.querySelector("[data-user-menu-button]");
		const userPanel = document.querySelector("[data-user-menu-panel]");

		if (userButton && userPanel) {
			userButton.setAttribute("aria-expanded", "false");
			userPanel.hidden = true;
		}

		supportButton.setAttribute(
			"aria-expanded",
			String(!isOpen)
		);

		supportPanel.hidden = isOpen;
	});

	document.addEventListener("click", (event) => {
		if (supportMenu.contains(event.target)) {
			return;
		}

		supportButton.setAttribute("aria-expanded", "false");
		supportPanel.hidden = true;
	});

	document.addEventListener("keydown", (event) => {
		if (event.key !== "Escape") {
			return;
		}

		supportButton.setAttribute("aria-expanded", "false");
		supportPanel.hidden = true;
	});
}