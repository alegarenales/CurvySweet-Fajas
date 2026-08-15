import type { APIRoute } from "astro";
import { getAdminSession } from "../../../lib/admin";
import { ProductRepository } from "../../../repositories/ProductRepository";
import { json, readJsonBody } from "../../../lib/security/http";
import { RATE_LIMITS, checkRateLimit } from "../../../lib/security/rateLimit";
import { cleanText, isSafeImagePath, isValidIdentifier } from "../../../lib/security/validation";

/** Como mucho, una publicación del catálogo entero de una vez. */
const MAX_PRODUCTS_PER_REQUEST = 100;
const MAX_PRICE = 100_000;
const MAX_STOCK = 1_000_000;

type CatalogEntry = {
    name: string;
    price: string;
    image: string;
    stock: number;
    inStock: boolean;
};

/**
 * Valida una entrada del catálogo antes de enviarla a la base de datos.
 * Aunque quien llama es una administradora autenticada, la petición sigue
 * llegando desde un navegador: si le robasen la sesión, esto limita el daño a
 * valores con sentido y evita guardar rutas de imagen apuntando a otro dominio.
 */
function parseEntry(value: unknown): CatalogEntry | null {
    if (typeof value !== "object" || value === null) {
        return null;
    }

    const raw = value as Record<string, unknown>;

    const name = cleanText(raw.name, 100);

    if (!name) {
        return null;
    }

    const price = Number(String(raw.price ?? "").replace("EUR", "").replace(",", ".").trim());

    if (!Number.isFinite(price) || price < 0 || price > MAX_PRICE) {
        return null;
    }

    const stock = Number(raw.stock);

    if (!Number.isInteger(stock) || stock < 0 || stock > MAX_STOCK) {
        return null;
    }

    const image = raw.image === undefined || raw.image === "" ? "" : raw.image;

    if (image !== "" && !isSafeImagePath(image)) {
        return null;
    }

    return {
        name,
        price: String(price),
        image: image as string,
        stock,
        inStock: Boolean(raw.inStock),
    };
}

export const GET: APIRoute = async ({ cookies }) => {

    if (!getAdminSession(cookies)) {
        return json({ ok: false, message: "No autorizado." }, 401);
    }

    const products = await ProductRepository.getProducts();

    return json({
        ok: true,
        catalog: products,
    });

};

export const POST: APIRoute = async ({ request, cookies }) => {

    const admin = getAdminSession(cookies);

    if (!admin) {
        return json({ ok: false, message: "No autorizado." }, 401);
    }

    const limit = checkRateLimit(admin.email, RATE_LIMITS.adminWrite);

    if (!limit.allowed) {
        return json({ ok: false, message: "Demasiadas peticiones." }, 429, {
            "Retry-After": String(limit.retryAfterSeconds),
        });
    }

    const body = await readJsonBody<{ catalog?: unknown }>(request, 512 * 1024);

    if (!body || typeof body.catalog !== "object" || body.catalog === null) {
        return json({ ok: false, message: "Catálogo no válido." }, 400);
    }

    const entries = Object.entries(body.catalog as Record<string, unknown>);

    if (entries.length > MAX_PRODUCTS_PER_REQUEST) {
        return json({ ok: false, message: "Demasiados productos en una sola petición." }, 400);
    }

    // Validamos todo antes de escribir nada: así una entrada mal formada no
    // deja el catálogo actualizado a medias.
    const updates: [string, CatalogEntry][] = [];

    for (const [id, value] of entries) {
        if (!isValidIdentifier(id)) {
            return json({ ok: false, message: `Identificador de producto no válido: ${id}` }, 400);
        }

        const entry = parseEntry(value);

        if (!entry) {
            return json({ ok: false, message: `Datos no válidos para el producto ${id}.` }, 400);
        }

        updates.push([id, entry]);
    }

    try {
        for (const [id, entry] of updates) {
            await ProductRepository.updateProduct(id, entry);
        }
    } catch (error) {
        console.error("Error actualizando el catálogo:", error);
        return json({ ok: false, message: "No se pudo actualizar el catálogo." }, 500);
    }

    return json({
        ok: true,
        message: "Productos actualizados correctamente.",
    });

};
