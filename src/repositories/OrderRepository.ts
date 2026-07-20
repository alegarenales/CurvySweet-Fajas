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
    static async getProductsByOrder(pedidoId: string) {

        const pool = await getPool();

        const result = await pool.request()
            .input("PedidoId", pedidoId)
            .query(`
                SELECT
                    ProductoId,
                    NombreProducto,
                    Cantidad,
                    PrecioUnitario
                FROM PedidoProductos
                WHERE PedidoId = @PedidoId
            `);

        return result.recordset;

    }
    static async getOrderById(id: string, usuarioId: string) {

        const pool = await getPool();

        const result = await pool.request()
            .input("Id", id)
            .input("UsuarioId", usuarioId)
            .query(`
                SELECT
                    Id,
                    Fecha,
                    Estado,
                    ImporteTotal
                FROM Pedidos
                WHERE Id = @Id
                AND UsuarioId = @UsuarioId
            `);

        return result.recordset[0] ?? null;

    }
    static async getAllOrders() {
        const pool = await getPool();

        const result = await pool.request().query(`
            SELECT
                p.Id,
                p.Fecha,
                p.Estado,
                p.ImporteTotal,
                u.Id AS UsuarioId,
                u.Nombre,
                u.Apellidos,
                u.Email
            FROM Pedidos p
            INNER JOIN Usuarios u
                ON p.UsuarioId = u.Id
            ORDER BY p.Fecha DESC
        `);

        return result.recordset;
    }
    static async getOrdersByUser(usuarioId: string) {

        const pool = await getPool();

        const result = await pool
            .request()
            .input("UsuarioId", usuarioId)
            .query(`
                SELECT
                    Id,
                    Fecha,
                    Estado,
                    ImporteTotal
                FROM Pedidos
                WHERE UsuarioId = @UsuarioId
                ORDER BY Fecha DESC
            `);

        return result.recordset;

    }

}