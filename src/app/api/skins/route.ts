import { getSkins } from "@/lib/cdragon";

/**
 * GET /api/skins → lista de skins com chromas.
 * Como getSkins usa `use cache`, esta rota é pré-renderizada no build
 * e servida como arquivo estático até o cache expirar.
 */
export async function GET() {
  const skins = await getSkins();
  return Response.json(skins);
}
