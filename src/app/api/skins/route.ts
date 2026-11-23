import { getCatalog } from "@/lib/cdragon";

/**
 * GET /api/skins → campeões, cada um com suas skins e chromas.
 * Como getCatalog usa `use cache`, esta rota é pré-renderizada no build
 * e servida como arquivo estático até o cache expirar.
 */
export async function GET() {
  const champions = await getCatalog();
  return Response.json(champions);
}
