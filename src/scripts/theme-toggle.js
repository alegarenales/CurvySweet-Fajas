const STORAGE_KEY = 'curvysweet-theme';
const DARK_CLASS = 'theme-dark';

function applyTheme(theme) {
	document.documentElement.classList.toggle(DARK_CLASS, theme === 'dark');
}

export function initThemeToggle() {
	const button = document.getElementById('theme-toggle');
	const savedTheme = localStorage.getItem(STORAGE_KEY) || 'light';

	applyTheme(savedTheme);

	if (!button) return;

	button.textContent = savedTheme === 'dark' ? 'Modo claro' : 'Modo oscuro';

	button.addEventListener('click', () => {
		const isDark = document.documentElement.classList.contains(DARK_CLASS);
		const nextTheme = isDark ? 'light' : 'dark';
		applyTheme(nextTheme);
		localStorage.setItem(STORAGE_KEY, nextTheme);
		button.textContent = nextTheme === 'dark' ? 'Modo claro' : 'Modo oscuro';
	});
}
