import sql from "mssql";
import { getPool } from "../lib/db";

export class ReviewRepository {

    static async hasPurchased(userId: string, productId: string): Promise<boolean> {
        const pool = await getPool();

        const result = await pool.request()
            .input("UsuarioId", sql.VarChar(50), userId)
            .input("ProductoId", sql.NVarChar(100), productId)
            .query(`
                SELECT TOP 1 1
                FROM Pedidos p
                INNER JOIN PedidoProductos pp
                    ON p.Id = pp.PedidoId
                WHERE p.UsuarioId = @UsuarioId
                  AND pp.ProductoId = @ProductoId
                  AND p.Estado <> 'Cancelado'
            `);

        return result.recordset.length > 0;
    }

    static async addReview(
        userId: string,
        productId: string,
        rating: number,
        comment: string
    ): Promise<void> {

        const pool = await getPool();

        await pool.request()
            .input("UsuarioId", sql.VarChar(50), userId)
            .input("ProductoId", sql.NVarChar(100), productId)
            .input("Puntuacion", sql.TinyInt, rating)
            .input("Comentario", sql.NVarChar(sql.MAX), comment)
            .query(`
                INSERT INTO Valoraciones
                (
                    UsuarioId,
                    ProductoId,
                    Puntuacion,
                    Comentario
                )
                VALUES
                (
                    @UsuarioId,
                    @ProductoId,
                    @Puntuacion,
                    @Comentario
                )
            `);
    }

    static async getReviews(productId: string) {
        const pool = await getPool();

        const result = await pool.request()
            .input("ProductoId", sql.NVarChar(100), productId)
            .query(`
                SELECT
                    v.ValoracionId,
                    u.Name AS Nombre,
                    v.Puntuacion,
                    v.Comentario,
                    v.Fecha
                FROM Valoraciones v
                INNER JOIN USERS u
                    ON u.ID = v.UsuarioId
                WHERE v.ProductoId = @ProductoId
                ORDER BY v.Fecha DESC
            `);

        return result.recordset;
    }

    static async getAverageRating(productId: string) {
        const pool = await getPool();

        const result = await pool.request()
            .input("ProductoId", sql.NVarChar(100), productId)
            .query(`
                SELECT
                    AVG(CAST(Puntuacion AS FLOAT)) AS Media,
                    COUNT(*) AS Total
                FROM Valoraciones
                WHERE ProductoId = @ProductoId
            `);

        return result.recordset[0];
    }

    static async hasReviewed(userId: string, productId: string): Promise<boolean> {
        const pool = await getPool();

        const result = await pool.request()
            .input("UsuarioId", sql.VarChar(50), userId)
            .input("ProductoId", sql.NVarChar(100), productId)
            .query(`
                SELECT TOP 1 1
                FROM Valoraciones
                WHERE UsuarioId = @UsuarioId
                  AND ProductoId = @ProductoId
            `);

        return result.recordset.length > 0;
    }

    static async updateReview(
        userId: string,
        productId: string,
        rating: number,
        comment: string
    ): Promise<void> {

        const pool = await getPool();

        await pool.request()
            .input("UsuarioId", sql.VarChar(50), userId)
            .input("ProductoId", sql.NVarChar(100), productId)
            .input("Puntuacion", sql.TinyInt, rating)
            .input("Comentario", sql.NVarChar(sql.MAX), comment)
            .query(`
                UPDATE Valoraciones
                SET
                    Puntuacion = @Puntuacion,
                    Comentario = @Comentario,
                    Fecha = GETDATE()
                WHERE UsuarioId = @UsuarioId
                  AND ProductoId = @ProductoId
            `);
    }
}
