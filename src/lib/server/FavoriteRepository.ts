import { getPool } from "../db";

export class FavoriteRepository {

    static async addFavorite(
        usuarioId: string,
        productoId: string
    ) {
console.log("ADD FAVORITE", { usuarioId, productoId });
        const pool = await getPool();

        await pool.request()
            .input("UsuarioId", usuarioId)
            .input("ProductoId", productoId)
            .execute("sp_favorite_add");

    }

    static async removeFavorite(
        usuarioId: string,
        productoId: string
    ) {

        const pool = await getPool();

        await pool.request()
            .input("UsuarioId", usuarioId)
            .input("ProductoId", productoId)
            .execute("sp_favorite_remove");

    }

    static async getFavorites(
        usuarioId: string
    ) {

        const pool = await getPool();

        const result = await pool.request()
            .input("UsuarioId", usuarioId)
            .execute("sp_favorites_get");

        return result.recordset;

    }

    static async isFavorite(
        usuarioId: string,
        productoId: string
    ) {

        const pool = await getPool();

        const result = await pool.request()
            .input("UsuarioId", usuarioId)
            .input("ProductoId", productoId)
            .execute("sp_favorite_exists");

        return result.recordset[0]?.Existe > 0;

    }

}