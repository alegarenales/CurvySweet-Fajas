import type { APIRoute } from "astro";
import { getAdminSession } from "../../../lib/admin";
import { ProductRepository } from "../../../repositories/ProductRepository";

function json(body: unknown, status = 200) {
    return new Response(JSON.stringify(body), {
        status,
        headers: {
            "Content-Type": "application/json",
        },
    });
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

    if (!getAdminSession(cookies)) {
        return json({ ok: false, message: "No autorizado." }, 401);
    }

    const body = await request.json();
    console.log(body);
    const catalog = body.catalog ?? {};
    console.log(catalog);

    for (const [id, product] of Object.entries(catalog)) {

    await ProductRepository.updateProduct(
        id,
        product as {
            name: string;
            price: string;
            image: string;
            stock: number;
            inStock: boolean;
        }
    );
    console.log(product);

    }

    return json({
        ok: true,
        message: "Productos actualizados correctamente.",
    });

};