import { getPool } from "../lib/db";

export class OrderRepository {

    static async createOrder(data: {
        stripeSessionId: string;
        usuarioId?: string | null;
        nombre: string;
        email: string;
        teléfono?: string | null;
        importeTotal: number;
        estado?: string;
    }) {

        const pool = await getPool();

        const result = await pool.request()
            .input("StripeSessionId", data.stripeSessionId)
            .input("UsuarioId", data.usuarioId ?? null)
            .input("Nombre", data.nombre)
            .input("Email", data.email)
            .input("Teléfono", data.teléfono ?? null)
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
    static async getOrderById(id: string, usuarioId?: string) {

        const pool = await getPool();

        const request = pool.request()
            .input("Id", id);

        let query = `
            SELECT
                P.Id,
                P.Fecha,
                P.Estado,
                P.ImporteTotal,
                P.Transportista,
                P.NumeroSeguimiento,
                U.Name,
                U.Mail
            FROM Pedidos P
            INNER JOIN USERS U
                ON U.ID = P.UsuarioId
            WHERE P.Id = @Id
        `;

        if (usuarioId) {
            request.input("UsuarioId", usuarioId);

            query += `
                AND P.UsuarioId = @UsuarioId
            `;
        }

        const result = await request.query(query);

        const order = result.recordset[0];

        if (!order) {
            return null;
        }

        order.Productos = await this.getProductsByOrder(id);
        order.Historial = await this.getHistory(id);

        return order;

    }
    static async updateOrderStatus(
        id: string,
        estado: string,
        transportista?: string | null,
        numeroSeguimiento?: string | null
    ) {

        const pool = await getPool();

        await pool.request()
            .input("Id", id)
            .input("Estado", estado)
            .input("Transportista", transportista ?? null)
            .input("NumeroSeguimiento", numeroSeguimiento ?? null)
            .query(`
                UPDATE Pedidos
                SET
                    Estado = @Estado,
                    Transportista = @Transportista,
                    NumeroSeguimiento = @NumeroSeguimiento
                WHERE Id = @Id
            `);

    }
    static async addHistory(
        pedidoId: string,
        estado: string
    ) {

        const pool = await getPool();

        await pool.request()
            .input("PedidoId", pedidoId)
            .input("Estado", estado)
            .query(`
                INSERT INTO PedidoHistorial
                (
                    PedidoId,
                    Estado
                )
                VALUES
                (
                    @PedidoId,
                    @Estado
                )
            `);

    }
    static async getHistory(
        pedidoId: string
    ) {

        const pool = await getPool();

        const result = await pool.request()
            .input("PedidoId", pedidoId)
            .query(`
                SELECT
                    Estado,
                    Fecha
                FROM PedidoHistorial
                WHERE PedidoId = @PedidoId
                ORDER BY Fecha ASC
            `);

        return result.recordset;

    }
    static async getAllOrders() {
        const pool = await getPool();

        const result = await pool.request().query(`
            SELECT
                p.Id,
                p.Fecha,
                p.Estado,
                p.ImporteTotal,
                p.Transportista,
                p.NumeroSeguimiento,
                u.ID AS UsuarioId,
                u.Name,
                u.Mail
            FROM Pedidos p
            INNER JOIN USERS u
                ON p.UsuarioId = u.ID
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