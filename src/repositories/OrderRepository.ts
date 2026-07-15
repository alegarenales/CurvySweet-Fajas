import { getPool } from "../lib/db";

export class OrderRepository {

    static async createOrder(data: {
        stripeSessionId: string;
        usuarioId?: string | null;
        nombre: string;
        email: string;
        telefono?: string | null;
        importeTotal: number;
        estado?: string;
    }) {

        const pool = await getPool();

        const result = await pool.request()
            .input("StripeSessionId", data.stripeSessionId)
            .input("UsuarioId", data.usuarioId ?? null)
            .input("Nombre", data.nombre)
            .input("Email", data.email)
            .input("Telefono", data.telefono ?? null)
            .input("ImporteTotal", data.importeTotal)
            .input("Estado", data.estado ?? "Pendiente")
            .execute("sp_order_create");

        return result.recordset[0].PedidoId;
    }

    static async addProduct(data: {
        pedidoId: string;
        productoId: string;
        nombreProducto: string;
        cantidad: number;
        precioUnitario: number;
    }) {

        const pool = await getPool();

        await pool.request()
            .input("PedidoId", data.pedidoId)
            .input("ProductoId", data.productoId)
            .input("NombreProducto", data.nombreProducto)
            .input("Cantidad", data.cantidad)
            .input("PrecioUnitario", data.precioUnitario)
            .execute("sp_order_product_create");

    }

}