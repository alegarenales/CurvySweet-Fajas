import type { APIRoute } from "astro";
import { OrderRepository } from "../../../../repositories/OrderRepository";
import { getAdminSession } from "../../../../lib/admin";
import { sendOrderStatusEmail } from "../../../../lib/mail";
import { json, readJsonBody } from "../../../../lib/security/http";
import { RATE_LIMITS, checkRateLimit } from "../../../../lib/security/rateLimit";
import { cleanText, isValidIdentifier, isValidOrderState } from "../../../../lib/security/validation";

/** Transportistas admitidos; coincide con el desplegable del panel. */
const CARRIERS = ["", "Correos Express", "GLS", "MRW", "SEUR", "DHL"];

export const GET: APIRoute = async ({ cookies, params }) => {

    const admin = getAdminSession(cookies);

    if (!admin) {
        return json({ error: "No autorizado" }, 401);
    }

    if (!isValidIdentifier(params.id)) {
        return json({ error: "Pedido no válido" }, 400);
    }

    const order = await OrderRepository.getOrderById(params.id);

    if (!order) {
        return json({ error: "Pedido no encontrado" }, 404);
    }

    const productos = await OrderRepository.getProductsByOrder(order.Id);

    return json({
        ...order,
        Productos: productos,
    });
};

export const PATCH: APIRoute = async ({ cookies, params, request }) => {

    const admin = getAdminSession(cookies);

    if (!admin) {
        return json({ ok: false, message: "No autorizado" }, 401);
    }

    const limit = checkRateLimit(admin.email, RATE_LIMITS.adminWrite);

    if (!limit.allowed) {
        return json({ ok: false, message: "Demasiadas peticiones." }, 429, {
            "Retry-After": String(limit.retryAfterSeconds),
        });
    }

    if (!isValidIdentifier(params.id)) {
        return json({ ok: false, message: "Pedido no válido" }, 400);
    }

    const body = await readJsonBody<{
        estado?: unknown;
        transportista?: unknown;
        numeroSeguimiento?: unknown;
    }>(request);

    if (!body) {
        return json({ ok: false, message: "Petición inválida" }, 400);
    }

    // El estado acaba en la base de datos, en un correo al cliente y en el
    // historial: solo aceptamos los valores previstos, nunca texto libre.
    if (!isValidOrderState(body.estado)) {
        return json({ ok: false, message: "Estado de pedido no válido" }, 400);
    }

    const estado = body.estado;
    const transportista = cleanText(body.transportista ?? "", 40);

    if (!CARRIERS.includes(transportista)) {
        return json({ ok: false, message: "Transportista no válido" }, 400);
    }

    const numeroSeguimiento = cleanText(body.numeroSeguimiento ?? "", 50);

    if (numeroSeguimiento && !/^[A-Za-z0-9-]{1,50}$/.test(numeroSeguimiento)) {
        return json({ ok: false, message: "Número de seguimiento no válido" }, 400);
    }

    await OrderRepository.updateOrderStatus(
        params.id,
        estado,
        transportista || null,
        numeroSeguimiento || null
    );
    await OrderRepository.addHistory(
        params.id,
        estado
    );

    // Volvemos a obtener el pedido para conocer el nombre y el email
    const order = await OrderRepository.getOrderById(params.id);

    if (order) {
        try {
            await sendOrderStatusEmail({
                to: order.Mail,
                name: order.Name,
                status: estado,
            });
        } catch (error) {
            // Que falle el correo no debe deshacer el cambio de estado.
            console.error("Error enviando correo de estado de pedido.", error);
        }
    }

    return json({
        ok: true,
        message: "Estado actualizado correctamente",
    });
};