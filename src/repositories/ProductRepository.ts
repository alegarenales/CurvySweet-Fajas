import { getPool } from "../lib/db";

export class ProductRepository {

    static async getProducts() {

        const pool = await getPool();

        const productsResult = await pool.request().query(`
            EXEC sp_products_get
        `);

        const imagesResult = await pool.request().query(`
            EXEC sp_product_images_get
        `);

        return productsResult.recordset.map(product => {

            const images = imagesResult.recordset
                .filter(img => img.ProductoId === product.Id)
                .sort((a, b) => a.Orden - b.Orden)
                .map(img => img.Ruta);

            return {
                id: product.Id,
                name: product.Nombre,
                description: product.Descripción,
                displayPrice: `${Number(product.Precio)} EUR`,
                image: images[0] ?? "",
                images,
                stripePriceId: product.StripePriceId,
                tag: product.Etiqueta,
                inStock: Boolean(product.EnStock),
                link: product.Link,
                stock: Number(product.Stock)
            };

        });

    }

    static async getProductById(id: string) {

        const products = await this.getProducts();

        return products.find(product => product.id === id) ?? null;

    }

    static async updateProduct(
        id: string,
        data: {
            name: string;
            price: string;
            image: string;
            stock: number;
            inStock: boolean;
        }
    ) {

        const pool = await getPool();

        const price = Number(
            data.price
                .replace("EUR", "")
                .replace(",", ".")
                .trim()
        );

        console.log("==================================");
        console.log("Actualizando producto:", id);
        console.log("Datos:", data);
        console.log("Precio convertido:", price);
        console.log("==================================");

        const result = await pool.request()
            .input("Id", id)
            .input("Nombre", data.name)
            .input("Precio", price)
            .input("Stock", data.stock)
            .input("EnStock", data.inStock)
            .execute("sp_product_update");

        console.log("ReturnValue:", result.returnValue);
        console.log("RowsAffected:", result.rowsAffected);

    }

}