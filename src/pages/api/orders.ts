import type { APIRoute } from "astro";
import { getUserSession } from "../../lib/userSession";
import { OrderRepository } from "../../repositories/OrderRepository";

export const GET: APIRoute = async ({ cookies }) => {

    const user = getUserSession(cookies);

    if (!user) {
        return new Response(
            JSON.stringify({ error: "No autorizado" }),
            { status: 401 }
        );
    }

    const orders = await OrderRepository.getOrdersByUser(user.id);

    const ordersWithProducts = await Promise.all(

        orders.map(async (order) => ({

            ...order,

            Productos: await OrderRepository.getProductsByOrder(order.Id),

        }))

    );

    return new Response(
        JSON.stringify(ordersWithProducts),
        {
            status: 200,
            headers: {
                "Content-Type": "application/json",
            },
        }
    );
};