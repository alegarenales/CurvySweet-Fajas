export function initBarMenuScroll() {
	const barMenu = document.getElementById('bar-menu');
	if (!barMenu) return;

	const onScroll = () => {
		barMenu.classList.toggle('scrolled', window.scrollY > 20);
	};

	window.addEventListener('scroll', onScroll, { passive: true });
	onScroll();
}
