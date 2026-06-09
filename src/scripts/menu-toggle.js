export function initMenuToggle() {
	const barMenu = document.getElementById('bar-menu');
	const toggleBtn = document.getElementById('menu-toggle-btn');

	if (!barMenu || !toggleBtn || toggleBtn.dataset.initialized) {
		return;
	}

	toggleBtn.dataset.initialized = 'true';

	toggleBtn.addEventListener('click', () => {
		barMenu.classList.toggle('menu-collapsed');
	});

	const navLinks = barMenu.querySelectorAll('a');

	navLinks.forEach((link) => {
		link.addEventListener('click', () => {
			barMenu.classList.add('menu-collapsed');
		});
	});
}