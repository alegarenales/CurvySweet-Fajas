const CART_KEY = 'curvysweet-cart';

let initialized = false;

const parsePrice = (price) => {
	const match = String(price || '').replace(',', '.').match(/(\d+(?:\.\d+)?)/);
	return match ? Number(match[1]) : 0;
};

const formatPrice = (amount) => `${amount.toFixed(amount % 1 ? 2 : 0)} EUR`;

/**
 * Escapa el texto que se interpola en HTML. Los datos del carrito vienen del
 * catálogo, que edita el panel de administración: si alguien lograse guardar
 * ahí un nombre con etiquetas, sin escapar se ejecutaría en el navegador de
 * todas las clientas.
 */
const escapeHtml = (value) =>
	String(value ?? '')
		.replaceAll('&', '&amp;')
		.replaceAll('<', '&lt;')
		.replaceAll('>', '&gt;')
		.replaceAll('"', '&quot;')
		.replaceAll("'", '&#39;');

/** Solo dejamos pasar rutas de imagen del propio sitio. */
const safeImageUrl = (value) => {
	const url = String(value ?? '');
	return /^\/[A-Za-z0-9/_\-.]*$/.test(url) && !url.includes('..') ? url : '';
};

const getProducts = () => {
	const source = document.getElementById('curvysweet-cart-products');

	if (!source) {
		return [];
	}

	try {
		return JSON.parse(source.textContent || '[]');
	} catch {
		return [];
	}
};

const getCart = () => {
	try {
		const parsed = JSON.parse(localStorage.getItem(CART_KEY) || '[]');
		return Array.isArray(parsed) ? parsed : [];
	} catch {
		return [];
	}
};

const saveCart = (cart) => {
	localStorage.setItem(CART_KEY, JSON.stringify(cart));
};

const getProductMap = () => new Map(getProducts().map((product) => [product.id, product]));

const setError = (message = '') => {
	document.querySelectorAll('[data-cart-error]').forEach((element) => {
		element.textContent = message;
		element.hidden = !message;
	});
};

const openCart = () => {
	document.querySelectorAll('[data-cart-drawer]').forEach((drawer) => {
		drawer.classList.add('is-open');
		drawer.setAttribute('aria-hidden', 'false');
	});
	document.querySelectorAll('[data-cart-overlay]').forEach((overlay) => {
		overlay.hidden = false;
	});
};

const closeCart = () => {
	document.querySelectorAll('[data-cart-drawer]').forEach((drawer) => {
		drawer.classList.remove('is-open');
		drawer.setAttribute('aria-hidden', 'true');
	});
	document.querySelectorAll('[data-cart-overlay]').forEach((overlay) => {
		overlay.hidden = true;
	});
};

const addToCart = (productId) => {
	const product = getProductMap().get(productId);

	if (!product) {
		return;
	}

	const cart = getCart();
	const current = cart.find((item) => item.productId === productId);

	if (current) {
		current.quantity += 1;
	} else {
		cart.push({ productId, quantity: 1 });
	}

	saveCart(cart);
	renderCart();
	openCart();
	setError('');
};

const updateQuantity = (productId, nextQuantity) => {
	const cart = getCart()
		.map((item) => item.productId === productId ? { ...item, quantity: nextQuantity } : item)
		.filter((item) => item.quantity > 0);

	saveCart(cart);
	renderCart();
};

const clearCart = () => {
	saveCart([]);
	renderCart();
	setError('');
};

function renderCart() {
	const productMap = getProductMap();
	const cart = getCart().filter((item) => productMap.has(item.productId));
	const count = cart.reduce((total, item) => total + item.quantity, 0);
	const hasOutOfStock = cart.some((item) => !productMap.get(item.productId)?.inStock);
	const total = cart.reduce((sum, item) => {
		const product = productMap.get(item.productId);
		return sum + parsePrice(product?.price) * item.quantity;
	}, 0);

	document.querySelectorAll('[data-cart-count]').forEach((element) => {
		element.textContent = String(count);
	});

	document.querySelectorAll('[data-cart-empty]').forEach((element) => {
		element.hidden = cart.length > 0;
	});

	document.querySelectorAll('[data-cart-total]').forEach((element) => {
		element.textContent = formatPrice(total);
	});

	document.querySelectorAll('[data-cart-stock-warning]').forEach((element) => {
		element.hidden = !hasOutOfStock;
	});

	document.querySelectorAll('[data-cart-checkout]').forEach((button) => {
		button.disabled = cart.length === 0 || hasOutOfStock;
	});

	document.querySelectorAll('[data-cart-clear]').forEach((button) => {
		button.disabled = cart.length === 0;
	});

	document.querySelectorAll('[data-cart-items]').forEach((container) => {
		container.innerHTML = cart.map((item) => {
			const product = productMap.get(item.productId);
			const imageUrl = safeImageUrl(product.image);
			const image = imageUrl ? `style="background-image: url('${imageUrl}');"` : '';
			const stock = product.inStock ? '' : '<span class="cart-stock-pill">Sin stock</span>';
			const link = safeImageUrl(product.link) || '#';

			return `
				<article class="cart-line">
					<div class="cart-line-image" ${image}></div>
					<div class="cart-line-copy">
						<a href="${escapeHtml(link)}">${escapeHtml(product.name)}</a>
						<div class="cart-line-meta">
							<span>${escapeHtml(product.price)}</span>
							${stock}
						</div>
						<div class="cart-line-controls">
							<div class="cart-qty-control" aria-label="Cantidad">
								<button class="cart-qty-button" type="button" data-cart-decrease="${escapeHtml(product.id)}" aria-label="Restar">-</button>
								<span class="cart-qty-value">${Number(item.quantity) || 1}</span>
								<button class="cart-qty-button" type="button" data-cart-increase="${escapeHtml(product.id)}" aria-label="Sumar">+</button>
							</div>
							<button class="cart-line-remove" type="button" data-cart-remove="${escapeHtml(product.id)}">Quitar</button>
						</div>
					</div>
				</article>
			`;
		}).join('');
	});
}

const checkout = async () => {
	const cart = getCart();

	if (!cart.length) {
		return;
	}

	setError('');

	document.querySelectorAll('[data-cart-checkout]').forEach((button) => {
		button.disabled = true;
		button.textContent = 'Preparando...';
	});

	try {
		const response = await fetch('/api/checkout', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ items: cart }),
		});
		const payload = await response.json();

		if (!response.ok || !payload.url) {
			throw new Error(payload.error || 'No se pudo iniciar el pago.');
		}

		window.location.href = payload.url;
	} catch (error) {
		setError(error.message || 'No se pudo iniciar el pago.');
		document.querySelectorAll('[data-cart-checkout]').forEach((button) => {
			button.disabled = false;
			button.textContent = 'Finalizar compra';
		});
	}
};

export function initCurvySweetCart() {
	if (initialized) {
		renderCart();
		return;
	}

	initialized = true;

	document.addEventListener('click', (event) => {
		const target = event.target;

		if (!(target instanceof HTMLElement)) {
			return;
		}

		const addButton = target.closest('[data-cart-add]');
		if (addButton) {
			event.preventDefault();
			event.stopPropagation();
			addToCart(addButton.dataset.productId);
			return;
		}

		const increaseButton = target.closest('[data-cart-increase]');
		if (increaseButton) {
			const productId = increaseButton.dataset.cartIncrease;
			const item = getCart().find((cartItem) => cartItem.productId === productId);
			updateQuantity(productId, (item?.quantity || 0) + 1);
			return;
		}

		const decreaseButton = target.closest('[data-cart-decrease]');
		if (decreaseButton) {
			const productId = decreaseButton.dataset.cartDecrease;
			const item = getCart().find((cartItem) => cartItem.productId === productId);
			updateQuantity(productId, (item?.quantity || 1) - 1);
			return;
		}

		const removeButton = target.closest('[data-cart-remove]');
		if (removeButton) {
			updateQuantity(removeButton.dataset.cartRemove, 0);
			return;
		}

		if (target.closest('[data-cart-open]')) {
			openCart();
			return;
		}

		if (target.closest('[data-cart-close]') || target.closest('[data-cart-overlay]')) {
			closeCart();
			return;
		}

		if (target.closest('[data-cart-clear]')) {
			clearCart();
			return;
		}

		if (target.closest('[data-cart-checkout]')) {
			checkout();
		}
	});

	document.addEventListener('keydown', (event) => {
		if (event.key === 'Escape') {
			closeCart();
		}
	});

	window.handleAddToCart = (event) => {
		const button = event?.target?.closest?.('[data-product-id]');
		addToCart(button?.dataset.productId);
	};

	renderCart();
}
