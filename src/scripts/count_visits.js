export async function countVisits() {
	const visitsValue = document.getElementById('visits-value');
	if (!visitsValue) return;

	try {
		const response = await fetch('/api/visits');
		if (!response.ok) throw new Error('No se pudo consultar visitas.');

		const data = await response.json();
		visitsValue.textContent = String(data?.visits ?? 0);
	} catch {
		visitsValue.textContent = '0';
	}
}
