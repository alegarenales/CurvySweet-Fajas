import type { APIRoute } from "astro";
import { FavoriteRepository } from "../../lib/server/FavoriteRepository";
import { getUserSession } from "../../lib/userSession";


export const GET: APIRoute = async ({ cookies }) => {

    const session = getUserSession(cookies);


    console.log(session);

    if (!session) {
        return Response.json([], { status: 200 });
    }

    const favorites = await FavoriteRepository.getFavorites(session.id);

    return Response.json(favorites);

};

export const POST: APIRoute = async ({ request, cookies }) => {
    console.log("POST /api/favorites");

    const session = getUserSession(cookies);

    if (!session) {
        return Response.json(
            { ok: false, message: "No autorizado" },
            { status: 401 }
        );
    }

    const { productId } = await request.json();

    await FavoriteRepository.addFavorite(
        session.id,
        productId
    );
    return Response.json({ ok: true });

};

export const DELETE: APIRoute = async ({ request, cookies }) => {

    const session = getUserSession(cookies);

    if (!session) {
        return Response.json(
            { ok: false, message: "No autorizado" },
            { status: 401 }
        );
    }

    const { productId } = await request.json();

    await FavoriteRepository.removeFavorite(
        session.id,
        productId
    );

    return Response.json({ ok: true });

};