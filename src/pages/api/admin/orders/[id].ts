import type { APIRoute } from "astro";
import { OrderRepository } from "../../../../repositories/OrderRepository";
import { getAdminSession } from "../../../../lib/admin";
import { sendOrderStatusEmail } from "../../../../lib/mail";

export const GET: APIRoute = async ({ cookies, params }) => {

    const admin = getAdminSession(cookies);

    if (!admin) {
        return new Response(
            JSON.stringify({ error: "No autorizado" }),
            { status: 401 }
        );
    }

    const order = await OrderRepository.getOrderById(params.id!);

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
            headers: {
                "Content-Type": "application/json",
            },
        }
    );
};

export const PATCH: APIRoute = async ({ cookies, params, request }) => {

    const admin = getAdminSession(cookies);

    if (!admin) {
        return new Response(
            JSON.stringify({
                ok: false,
                message: "No autorizado",
            }),
            { status: 401 }
        );
    }

    const {
        estado,
        transportista,
        numeroSeguimiento
    } = await request.json();

    await OrderRepository.updateOrderStatus(
        params.id!,
        estado,
        transportista,
        numeroSeguimiento
    );
    await OrderRepository.addHistory(
        params.id!,
        estado
    );

    // Volvemos a obtener el pedido para conocer el nombre y el email
    const order = await OrderRepository.getOrderById(params.id!);

    if (order) {
        await sendOrderStatusEmail({
            to: order.Mail,
            name: order.Name,
            status: estado,
        });
    }

    return new Response(
        JSON.stringify({
            ok: true,
            message: "Estado actualizado correctamente",
        })
    );
};