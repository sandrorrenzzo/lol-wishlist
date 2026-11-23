import type { NextRequest } from "next/server";

import { getCatalog } from "@/lib/cdragon";
import { groupWishlist } from "@/lib/search";

/** Limite de segurança para o tamanho da URL / trabalho por request. */
const MAX_KEYS = 500;

/**
 * GET /api/skins/items?keys=s1013,c1014
 *
 * Como o catálogo agora chega em páginas, o front pode não ter carregado
 * as skins que estão na wishlist. Esta rota resolve as chaves salvas e
 * devolve os itens agrupados por campeão.
 */
export async function GET(request: NextRequest) {
  const keys = (request.nextUrl.searchParams.get("keys") ?? "")
    .split(",")
    .filter((k) => /^[sc]\d+$/.test(k))
    .slice(0, MAX_KEYS);

  if (keys.length === 0) return Response.json([]);
  return Response.json(groupWishlist(await getCatalog(), keys));
}
