import type { APIRoute } from "astro";
import { existsSync, readFileSync } from "node:fs";

export const GET: APIRoute = async () => {
  try {
    if (!existsSync("access.log")) {
      return new Response(JSON.stringify({ visits: 0 }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    const content = readFileSync("access.log", "utf-8");
    const visits = content
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean).length;

    return new Response(JSON.stringify({ visits }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error leyendo visitas:", error);
    return new Response(JSON.stringify({ visits: 0 }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
