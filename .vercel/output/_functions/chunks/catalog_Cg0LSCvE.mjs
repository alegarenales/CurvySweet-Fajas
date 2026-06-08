import { existsSync, readFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';

const catalogDraftsPath = join(process.cwd(), ".curvysweet", "catalog-drafts.json");
const products = [
  {
    id: "faja_chaleco_cinturilla",
    name: "Faja Chaleco Cinturilla",
    description: "Moldea torso y espalda con diseno sin mangas.",
    displayPrice: "55 EUR",
    image: "/products/faja chaleco cinturilla/faja_chaleco_cinturilla_1.jpg",
    images: [
      "/products/faja chaleco cinturilla/faja_chaleco_cinturilla_1.jpg",
      "/products/faja chaleco cinturilla/faja_chaleco_cinturilla_2.jpg",
      "/products/faja chaleco cinturilla/faja_chaleco_cinturilla_3.jpg",
      "/products/faja chaleco cinturilla/faja_chaleco_cinturilla_4.jpg"
    ],
    stripePriceId: "",
    tag: "Nuevo",
    inStock: true,
    link: "/producto/faja_chaleco_cinturilla"
  },
  {
    id: "cinturilla_reloj_arena",
    name: "Cinturilla Reloj Arena",
    description: "Define cintura y realza curvas con compresion media.",
    displayPrice: "50 EUR",
    image: "/products/faja cinturilla efecto reloj de arena/faja_cinturilla_efecto_reloj_de_arena_1.jpg",
    images: [
      "/products/faja cinturilla efecto reloj de arena/faja_cinturilla_efecto_reloj_de_arena_1.jpg",
      "/products/faja cinturilla efecto reloj de arena/faja_cinturilla_efecto_reloj_de_arena_2.jpg",
      "/products/faja cinturilla efecto reloj de arena/faja_cinturilla_efecto_reloj_de_arena_3.jpg",
      "/products/faja cinturilla efecto reloj de arena/faja_cinturilla_efecto_reloj_de_arena_4.jpg",
      "/products/faja cinturilla efecto reloj de arena/faja_cinturilla_efecto_reloj_de_arena_5.jpg"
    ],
    stripePriceId: "",
    tag: "Oferta",
    inStock: true,
    link: "/producto/cinturilla_reloj_arena"
  },
  {
    id: "faja_control_abdominal",
    name: "Faja Moldeadora Reductora",
    description: "Control firme para abdomen con diseno de alta compresion.",
    displayPrice: "48 EUR",
    image: "/products/faja moldeadora reductora - control total/faja_moldeadora-reductora_1.jpg",
    images: [
      "/products/faja moldeadora reductora - control total/faja_moldeadora-reductora_1.jpg",
      "/products/faja moldeadora reductora - control total/faja_moldeadora-reductora_2.jpg",
      "/products/faja moldeadora reductora - control total/faja_moldeadora-reductora_3.jpg",
      "/products/faja moldeadora reductora - control total/faja_moldeadora-reductora_4.jpg",
      "/products/faja moldeadora reductora - control total/faja_moldeadora-reductora_5.jpg"
    ],
    stripePriceId: "",
    tag: "Best Seller",
    inStock: false,
    link: "/producto/faja_control_abdominal"
  },
  {
    id: "faja_latex",
    name: "Faja Látex",
    description: "Diseno ajustado con tela elastica premium.",
    displayPrice: "45 EUR",
    image: "/products/faja de latex/faja_de_latex_1.jpg",
    images: [
      "/products/faja de latex/faja_de_latex_1.jpg",
      "/products/faja de latex/faja_de_latex_2.jpg",
      "/products/faja de latex/faja_de_latex_3.jpg"
    ],
    stripePriceId: "",
    tag: "Nuevo",
    inStock: true,
    link: "/producto/faja_latex"
  },
  {
    id: "faja_moldeadora",
    name: "Faja Short Moldeadora",
    description: "Moldea cintura y cadera con tela elastica premium.",
    displayPrice: "45 EUR",
    image: "/products/faja short moldeadora/faja_short_moldeadora_4.jpg",
    images: [
      "/products/faja short moldeadora/faja_short_moldeadora_4.jpg",
      "/products/faja short moldeadora/faja_short_moldeadora_2.jpg",
      "/products/faja short moldeadora/faja_short_moldeadora_3.jpg",
      "/products/faja short moldeadora/faja_short_moldeadora_1.jpg",
      "/products/faja short moldeadora/faja_short_moldeadora_5.jpg",
      "/products/faja short moldeadora/faja_short_moldeadora_6.jpg"
    ],
    stripePriceId: "",
    tag: "Oferta",
    inStock: true,
    link: "/producto/faja_moldeadora"
  }
];
function getProductById(id) {
  return getProducts().find((product) => product.id === id);
}
function readCatalogDrafts() {
  if (!existsSync(catalogDraftsPath)) {
    return {};
  }
  try {
    return JSON.parse(readFileSync(catalogDraftsPath, "utf-8"));
  } catch {
    return {};
  }
}
function writeCatalogDrafts(nextDrafts) {
  mkdirSync(dirname(catalogDraftsPath), { recursive: true });
  writeFileSync(catalogDraftsPath, JSON.stringify(nextDrafts, null, 2));
  return nextDrafts;
}
function getProducts() {
  const drafts = readCatalogDrafts();
  return products.map((product) => {
    const draft = drafts[product.id] ?? {};
    const image = draft.image?.trim() || product.image;
    const stock = draft.stock?.trim();
    return {
      ...product,
      name: draft.name?.trim() || product.name,
      displayPrice: draft.price?.trim() || product.displayPrice,
      image,
      images: image ? [image, ...(product.images ?? []).filter((item) => item !== image)] : product.images,
      inStock: stock === "out" ? false : stock === "in" ? true : product.inStock
    };
  });
}

export { getProductById as a, getProducts as g, readCatalogDrafts as r, writeCatalogDrafts as w };
