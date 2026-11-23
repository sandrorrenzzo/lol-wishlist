import type { NextRequest } from "next/server";

import { getCatalog } from "@/lib/cdragon";
import { paginate, searchCatalog } from "@/lib/search";

const DEFAULT_LIMIT = 8;
const MAX_LIMIT = 20;

/**
 * GET /api/skins?cursor=0&limit=8&q=ahri
 *
 * Devolve uma página de campeões (com skins e chromas), já filtrada pela
 * busca. O front pede a próxima página (`nextCursor`) conforme o usuário
 * rola a tela.
 *
 * Ler `request.nextUrl` torna a rota dinâmica (roda a cada request), mas o
 * catálogo em si vem do cache de getCatalog: só o filtro e o recorte rodam.
 */
export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const cursor = Math.max(0, Number.parseInt(params.get("cursor") ?? "0", 10) || 0);
  const limit = Math.min(
    MAX_LIMIT,
    Math.max(1, Number.parseInt(params.get("limit") ?? "", 10) || DEFAULT_LIMIT),
  );
  const query = (params.get("q") ?? "").slice(0, 100);

  const champions = searchCatalog(await getCatalog(), query);
  return Response.json(paginate(champions, cursor, limit));
}
