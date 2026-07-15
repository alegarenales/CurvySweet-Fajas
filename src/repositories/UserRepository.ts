import { getPool } from "../lib/db";

export class UserRepository {

    static async getById(id: string) {

        const pool = await getPool();

        const result = await pool
            .request()
            .input("ID", id)
            .query(`
                SELECT
                    ID,
                    Username,
                    Name,
                    Last_name,
                    Mail,
                    Rol
                FROM USERS
                WHERE ID = @ID
            `);

        return result.recordset[0] ?? null;

    }

}