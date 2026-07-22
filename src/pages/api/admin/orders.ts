import type { APIRoute } from "astro";
import { getAdminSession } from "../../../lib/admin";
import { OrderRepository } from "../../../repositories/OrderRepository";

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
        return json({
            ok: false,
            message: "No autorizado."
        }, 401);
    }

    try {

        const orders = await OrderRepository.getAllOrders();

        return json({
            ok: true,
            orders,
        });

    } catch (error) {

        console.error(error);

        return json({
            ok: false,
            error: String(error)
        }, 500);
    }

};