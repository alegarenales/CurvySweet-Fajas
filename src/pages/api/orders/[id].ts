import type { APIRoute } from "astro";
import { getUserSession } from "../../../lib/userSession";
import { OrderRepository } from "../../../repositories/OrderRepository";

export const GET: APIRoute = async ({ cookies, params }) => {

    const user = getUserSession(cookies);

    if (!user) {
        return new Response(
            JSON.stringify({ error: "No autorizado" }),
            { status: 401 }
        );
    }

    const order = await OrderRepository.getOrderById(
        params.id!,
        user.id
    );

    if (!order) {
        return new Response(
            JSON.stringify({ error: "Pedido no encontrado" }),
            { status: 404 }
        );
    }

    const productos = await OrderRepository.getProductsByOrder(order.Id);

    return new Response(
        JSON.stringify({
            ...order,
            Productos: productos,
        }),
        {
            status: 200,
            headers: {
                "Content-Type": "application/json",
            },
        }
    );

};