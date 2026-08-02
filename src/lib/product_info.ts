import { ProductRepository } from '../repositories/ProductRepository';

type CatalogProduct = Awaited<
	ReturnType<typeof ProductRepository.getProducts>
>[number];

export type ProductFeature = {
	title: string;
	description: string;
};

export type ProductReview = {
	author: string;
	role: string;
	comment: string;
};

export type ProductFaq = {
	question: string;
	answer: string;
};

export type ProductContent = {
	heroLabel: string;
	headline: string;
	intro: string;
	longDescription: string;
	benefits: string[];
	features: ProductFeature[];
	sizes: string[];
	colors: string[];
	care: string[];
	gallery: string[];
	reviews: ProductReview[];
	faqs: ProductFaq[];
	relatedProductIds: string[];
};

export type ProductPageData = CatalogProduct & ProductContent;

const normalizeImagePath = (path?: string) => {
	if (!path) return '';
	return path.startsWith('/') ? path : `/${path}`;
};

const productContentMap: Record<string, ProductContent> = {
	faja_chaleco_cinturilla: {
		heroLabel: 'Compresión media - alta',
		headline: 'Faja chaleco cinturilla para estilizar con soporte y comodidad.',
		intro:
			'Una prenda pensada para abrazar el torso, definir la silueta y mantener una sensación de ajuste agradable durante el día.',
		longDescription:
			'Esta faja chaleco cinturilla combina estructura y suavidad para que puedas realzar cintura, abdomen y espalda sin renunciar a la comodidad visual y corporal. Su diseño busca ofrecer una base firme para looks diarios o momentos especiales.',
		benefits: [
			'Define cintura y abdomen con una compresión visualmente equilibrada.',
			'Aporta sensación de soporte en espalda media y alta.',
			'Se adapta bien a rutinas diarias y estilismos más ajustados.',
		],
		features: [
			{
				title: 'Moldeo uniforme',
				description: 'Distribuye la compresión para estilizar la silueta de forma armoniosa.',
			},
			{
				title: 'Ajuste cómodo',
				description: 'Pensada para sentirse firme sin endurecer la experiencia de uso.',
			},
			{
				title: 'Diseño versátil',
				description: 'Funciona como capa interior para looks cotidianos o prendas más ceñidas.',
			},
		],
		sizes: ['XS', 'S', 'M', 'L', 'XL', '2XL'],
		colors: ['Negro'],
		care: [
			'Lavar a mano con agua fría.',
			'No usar secadora.',
			'Secar a la sombra para conservar elasticidad y forma.',
		],
		gallery: [
			'/products/faja chaleco cinturilla/faja_chaleco_cinturilla_1.jpg',
			'/products/faja chaleco cinturilla/faja_chaleco_cinturilla_2.jpg',
			'/products/faja chaleco cinturilla/faja_chaleco_cinturilla_3.jpg',
		],
		reviews: [
			{
				author: 'Laura M.',
				role: 'Cliente verificada',
				comment: 'Se siente firme, bonita y mucho más cómoda de lo que esperaba.',
			},
			{
				author: 'Paula R.',
				role: 'Compra recurrente',
				comment: 'Me gusta como estiliza la zona del abdomen sin marcar demasiado la ropa.',
			},
		],
		faqs: [
			{
				question: '¿Se puede usar varias horas seguidas?',
				answer: 'Sí, esta planteada para un uso progresivo y cómodo dentro de tu rutina.',
			},
			{
				question: '¿Sirve para llevar debajo de vestidos o camisetas ajustadas?',
				answer: 'Sí, su perfil esta pensado para acompañar prendas más ceñidas.',
			},
		],
		relatedProductIds: ['cinturilla_reloj_arena', 'faja_latex'],
	},
	cinturilla_reloj_arena: {
		heroLabel: 'Silueta reloj de arena',
		headline: 'Una cinturilla pensada para remarcar cintura con presencia.',
		intro:
			'Ideal para quienes buscan una prenda más centrada en la zona media y un look estilizado.',
		longDescription:
			'Su estructura prioriza la definición de cintura y una presencia visual más marcada, manteniendo una estética limpia y fácil de integrar en el catálogo.',
		benefits: [
			'Enfatiza la cintura de forma más directa.',
			'Fácil de combinar bajo prendas de uso diario.',
			'Base lista para ampliar información cuando este producto crezca.',
		],
		features: [
			{
				title: 'Enfoque en cintura',
				description: 'Compresión orientada a remarcar la zona central.',
			},
			{
				title: 'Ajuste por niveles',
				description: 'Permite adaptar la sensación de firmeza según el momento de uso.',
			},
			{
				title: 'Perfil discreto',
				description: 'Pensada para llevar bajo prendas sin sumar volumen innecesario.',
			},
		],
		sizes: ['XS', 'S', 'M', 'L', 'XL', '2XL'],
		colors: ['Negro'],
		care: [
			'Lavar a mano con agua fría.',
			'No usar lejía ni secadora.',
			'Guardar cerrada para conservar la forma de los broches.',
		],
		gallery: [
			'/products/faja cinturilla efecto reloj de arena/faja_cinturilla_efecto_reloj_de_arena_1.jpg',
			'/products/faja cinturilla efecto reloj de arena/faja_cinturilla_efecto_reloj_de_arena_2.jpg',
			'/products/faja cinturilla efecto reloj de arena/faja_cinturilla_efecto_reloj_de_arena_3.jpg',
			'/products/faja cinturilla efecto reloj de arena/faja_cinturilla_efecto_reloj_de_arena_4.jpg',
			'/products/faja cinturilla efecto reloj de arena/faja_cinturilla_efecto_reloj_de_arena_5.jpg',
		],
		reviews: [
			{
				author: 'Marta G.',
				role: 'Cliente verificada',
				comment: 'Me ayuda a marcar la cintura y se mantiene bien en su sitio.',
			},
			{
				author: 'Claudía S.',
				role: 'Compra online',
				comment: 'La uso debajo de vestidos y queda bastante discreta.',
			},
		],
		faqs: [
			{
				question: '¿Qué talla debo elegir si estoy entre dos tallas?',
				answer: 'Si buscas comodidad diaria, elige la talla superior. Si prefieres más firmeza, revisa bien la tabla antes de elegir.',
			},
			{
				question: '¿Es adecuada para uso diario?',
				answer: 'Sí, recomendamos empezar con pocas horas y aumentar el tiempo según tu comodidad.',
			},
		],
		relatedProductIds: ['faja_chaleco_cinturilla', 'faja_latex'],
	},
	faja_control_abdominal:{
		heroLabel: 'Control abdominal',
		headline: 'Faja moldeadora reductora para una silueta firme y definida.',
		intro: 'Diseñada para aportar soporte en abdomen, cintura y espalda con una compresión estable.',
		longDescription: 'La faja moldeadora reductora ofrece una sensación de control más envolvente para looks ajustados o momentos en los que buscas una base firme. Su estructura ayuda a suavizar visualmente la zona media y acompaña el movimiento con un ajuste seguro.',
		benefits: [
			'Ayuda a suavizar visualmente abdomen y cintura.',
			'Ofrece soporte firme sin perder movilidad.',
			'Ideal como base interior para prendas entalladas.',
		],
		features: [
			{
				title: 'Compresión firme',
				description: 'Pensada para un ajuste estable en la zona abdominal.',
			},
			{
				title: 'Cobertura completa',
				description: 'Acompaña cintura, abdomen y espalda baja para una línea más continua.',
			},
			{
				title: 'Acabado versátil',
				description: 'Se integra bajo vestidos, pantalones y prendas de uso diario.',
			},
		],
		sizes: ['XS', 'S', 'M', 'L', 'XL', '2XL'],
		colors: ['Negro'],
		care: [
			'Lavar a mano con agua fría.',
			'No planchar.',
			'Secar en plano o colgada a la sombra.',
		],
		gallery: [
			'/products/faja moldeadora reductora - control total/faja_moldeadora-reductora_1.jpg',
			'/products/faja moldeadora reductora - control total/faja_moldeadora-reductora_2.jpg',
			'/products/faja moldeadora reductora - control total/faja_moldeadora-reductora_3.jpg',
			'/products/faja moldeadora reductora - control total/faja_moldeadora-reductora_4.jpg',
			'/products/faja moldeadora reductora - control total/faja_moldeadora-reductora_5.jpg',
		],
		reviews: [
			{
				author: 'Andrea V.',
				role: 'Cliente verificada',
				comment: 'Tiene buen soporte en abdomen y queda muy bien debajo de ropa ajustada.',
			},
			{
				author: 'Rocío L.',
				role: 'Compra recurrente',
				comment: 'La compresión se siente firme, pero no me limita al moverme.',
			},
		],
		faqs: [
			{
				question: '¿Esta faja está disponible ahora?',
				answer: 'Actualmente aparece sin stock en la tienda; puedes revisar la ficha para ver sus detalles mientras vuelve a estar disponible.',
			},
			{
				question: '¿Qué tipo de compresión ofrece?',
				answer: 'Está pensada para una compresión firme, especialmente enfocada en abdomen y cintura.',
			},
		],
		relatedProductIds: ['faja_chaleco_cinturilla', 'cinturilla_reloj_arena'],
	},
	faja_latex:{
		heroLabel: 'Latex y ajuste flexible',
		headline: 'Faja de látex para moldear con firmeza y acabado limpio.',
		intro: 'Una opción clásica para definir la zona media con una sensación elástica y segura.',
		longDescription: 'La faja de látex combina elasticidad y soporte para acompañar la silueta con un ajuste cenido. Es una pieza pensada para quienes buscan una prenda firme, fácil de combinar y con presencia discreta bajo la ropa.',
		benefits: [
			'Moldea cintura y abdomen con sensación elástica.',
			'Aporta soporte sin sumar demasiado volumen.',
			'Funciona bien como prenda interior para looks diarios.',
		],
		features: [
			{
				title: 'Material elástico',
				description: 'El látex ayuda a mantener un ajuste firme y flexible.',
			},
			{
				title: 'Diseño ajustado',
				description: 'Se adapta al contorno para una apariencia más estilizada.',
			},
			{
				title: 'Uso versátil',
				description: 'Adecuada para combinar con diferentes prendas y rutinas.',
			},
		],
		sizes: ['XS', 'S', 'M', 'L', 'XL', '2XL'],
		colors: ['Negro'],
		care: [
			'Lavar a mano con jabón suave.',
			'Evitar calor directo para proteger el látex.',
			'Secar completamente antes de guardar.',
		],
		gallery: [
			'/products/faja de latex/faja_de_latex_1.jpg',
			'/products/faja de latex/faja_de_latex_2.jpg',
			'/products/faja de latex/faja_de_latex_3.jpg',
		],
		reviews: [
			{
				author: 'Nerea P.',
				role: 'Cliente verificada',
				comment: 'Se nota firme y me gusta que no abulta bajo la ropa.',
			},
			{
				author: 'Elena C.',
				role: 'Compra online',
				comment: 'Buena opción para marcar cintura en conjuntos ajustados.',
			},
		],
		faqs: [
			{
				question: '¿Cómo debo cuidar el látex?',
				answer: 'Lávalo a mano, evita la secadora y no lo expongas a calor directo.',
			},
			{
				question: '¿Es una faja de compresión alta?',
				answer: 'Ofrece una sensación firme y elástica; si dudas entre tallas, revisa la tabla antes de comprar.',
			},
		],
		relatedProductIds: ['faja_chaleco_cinturilla', 'cinturilla_reloj_arena'],

	},
	faja_moldeadora: {
		heroLabel: 'Short moldeador',
		headline: 'Faja short moldeadora para cintura, cadera y muslos.',
		intro: 'Una prenda de cobertura extendida para suavizar la silueta y moverse con comodidad.',
		longDescription:
			'La faja short moldeadora está pensada para acompañar abdomen, cintura, cadera y muslos con una compresión equilibrada. Su formato tipo short ayuda a crear una línea continua bajo vestidos, faldas o pantalones.',
		benefits: [
			'Moldea cintura, cadera y muslos en una sola prenda.',
			'Ayuda a evitar cortes visibles bajo ropa ajustada.',
			'Ofrece soporte cómodo para uso diario o eventos.',
		],
		features: [
			{
				title: 'Cobertura tipo short',
				description: 'Extiende el moldeo hacia cadera y muslos para un acabado más uniforme.',
			},
			{
				title: 'Tela elástica',
				description: 'Acompaña el movimiento y mantiene una sensación de ajuste estable.',
			},
			{
				title: 'Acabado discreto',
				description: 'Pensada para llevar como base interior en prendas entalladas.',
			},
		],
		sizes: ['XS', 'S', 'M', 'L', 'XL', '2XL'],
		colors: ['Negro'],
		care: [
			'Lavar a mano con agua fría.',
			'No usar secadora.',
			'Secar a la sombra para conservar la elasticidad.',
		],
		gallery: [
			'/products/faja short moldeadora/faja_short_moldeadora_4.jpg',
			'/products/faja short moldeadora/faja_short_moldeadora_2.jpg',
			'/products/faja short moldeadora/faja_short_moldeadora_3.jpg',
			'/products/faja short moldeadora/faja_short_moldeadora_1.jpg',
			'/products/faja short moldeadora/faja_short_moldeadora_5.jpg',
			'/products/faja short moldeadora/faja_short_moldeadora_6.jpg',
		],
		reviews: [
			{
				author: 'Sara D.',
				role: 'Cliente verificada',
				comment: 'El formato short me da más seguridad con vestidos ajustados.',
			},
			{
				author: 'Irene A.',
				role: 'Compra online',
				comment: 'Moldea sin sentirse rígida y queda bastante discreta.',
			},
		],
		faqs: [
			{
				question: '¿Marca debajo de vestidos?',
				answer: 'Su diseño tipo short ayuda a crear una línea más continua, aunque dependerá del tejido de la prenda exterior.',
			},
			{
				question: '¿Cubre también la zona de muslos?',
				answer: 'Sí, está pensada para acompañar cintura, cadera y parte de los muslos.',
			},
		],
		relatedProductIds: ['faja_control_abdominal', 'faja_latex'],
	},
};

function mergeGallery(product: CatalogProduct, fallbackGallery: string[]) {

	const databaseGallery = (product.images ?? [])
		.map((image) => normalizeImagePath(image))
		.filter(Boolean);

	if (databaseGallery.length > 0) {
		return databaseGallery;
	}

	const normalizedGallery = fallbackGallery.map((image) =>
		normalizeImagePath(image)
	);

	const normalizedImage = normalizeImagePath(product.image);

	if (!normalizedImage) {
		return normalizedGallery;
	}

	return [
		normalizedImage,
		...normalizedGallery.filter((image) => image !== normalizedImage),
	];
}

export async function getProductPageById(
    id: string
): Promise<ProductPageData | undefined> {
	const baseProduct = await ProductRepository.getProductById(id);
	const productContent = productContentMap[id];

	if (!baseProduct || !productContent) {
		return undefined;
	}

	return {
		...baseProduct,
		...productContent,
		image: normalizeImagePath(baseProduct.image),
		gallery: mergeGallery(baseProduct, productContent.gallery),
	};
}



export async function getRelatedProducts(productId: string) {
	const pageData = await getProductPageById(productId);

	if (!pageData) {
		return [];
	}

	const products = await ProductRepository.getProducts();

	return pageData.relatedProductIds
		.map((id) => products.find((product) => product.id === id))
		.filter((product): product is CatalogProduct => Boolean(product))
		.map((product) => ({
			...product,
			image: normalizeImagePath(product.image),
		}));
	}

// export const productPageEntries = Object.keys(productContentMap)
// 	.map((id) => getProductPageById(id))
// 	.filter((product): product is ProductPageData => Boolean(product));
