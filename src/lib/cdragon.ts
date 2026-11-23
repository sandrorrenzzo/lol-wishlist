import "server-only";

import { cacheLife } from "next/cache";

import type { Champion, Chroma, Rarity, Skin } from "@/lib/types";

/**
 * CommunityDragon espelha os arquivos do cliente do LoL.
 * A API oficial da Riot não tem dados de skins/chromas, por isso usamos ele.
 */
const BASE =
  "https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default";

/**
 * Os JSONs apontam para caminhos internos do cliente, ex:
 *   /lol-game-data/assets/ASSETS/Characters/Annie/Skins/Skin13/...jpg
 * No CommunityDragon o mesmo arquivo fica em BASE + caminho, tudo minúsculo.
 */
function assetUrl(path: string | null | undefined): string | null {
  if (!path) return null;
  const relative = path.replace(/^\/lol-game-data\/assets\//i, "");
  return `${BASE}/${relative.toLowerCase()}`;
}

// Formato bruto dos JSONs (só os campos que usamos).
type RawChroma = {
  id: number;
  name: string;
  chromaPath: string | null;
  colors: string[] | null;
};

type RawSkin = {
  id: number;
  name: string;
  isBase: boolean;
  rarity: string;
  isLegacy: boolean;
  tilePath: string | null;
  splashPath: string | null;
  chromas?: RawChroma[];
  skinLines: { id: number }[] | null;
};

type RawChampion = { id: number; name: string };
type RawSkinLine = { id: number; name: string };

const RARITIES: Record<string, Rarity> = {
  kEpic: "epic",
  kLegendary: "legendary",
  kUltimate: "ultimate",
  kMythic: "mythic",
  kTranscendent: "transcendent",
  kExalted: "exalted",
};

/** Campeões jogáveis vão até ~950; ids acima disso são de modos especiais. */
const MAX_CHAMPION_ID = 1000;

async function getJson<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE}/${path}`);
  if (!res.ok) throw new Error(`CommunityDragon ${path}: HTTP ${res.status}`);
  return res.json() as Promise<T>;
}

/**
 * Campeões em ordem alfabética, cada um com suas skins (menos a skin padrão,
 * que todo mundo já tem) e os chromas de cada skin, num formato enxuto.
 *
 * `use cache` + `cacheLife("days")`: o resultado é gerado no build e
 * reaproveitado; o Next refaz a busca no máximo uma vez por dia.
 * O skins.json bruto tem ~6,5 MB; o que guardamos é bem menor.
 */
export async function getCatalog(): Promise<Champion[]> {
  "use cache";
  cacheLife("days");

  const [skins, champions, skinLines] = await Promise.all([
    getJson<Record<string, RawSkin>>("v1/skins.json"),
    getJson<RawChampion[]>("v1/champion-summary.json"),
    getJson<RawSkinLine[]>("v1/skinlines.json"),
  ]);

  const championName = new Map(champions.map((c) => [c.id, c.name]));
  const lineName = new Map(skinLines.map((l) => [l.id, l.name]));

  const allSkins = Object.values(skins)
    // Fora: skins padrão e "campeões" de modos temporários (ex.: Swarm),
    // que têm id de campeão ≥ 1000 (60103 = Ahri do Swarm) e não são vendidos.
    .filter((s) => !s.isBase && Math.floor(s.id / 1000) < MAX_CHAMPION_ID)
    .map((s): Skin => {
      // O id da skin é championId * 1000 + número da skin (ex: 1013 → Annie).
      const championId = Math.floor(s.id / 1000);
      const chromas: Chroma[] = (s.chromas ?? []).map((c) => ({
        id: c.id,
        name: c.name,
        image: assetUrl(c.chromaPath),
        colors: [...new Set(c.colors ?? [])],
      }));
      return {
        id: s.id,
        name: s.name,
        championId,
        championName: championName.get(championId) ?? "?",
        rarity: RARITIES[s.rarity] ?? null,
        isLegacy: s.isLegacy,
        image: assetUrl(s.tilePath),
        splash: assetUrl(s.splashPath),
        skinLines: (s.skinLines ?? [])
          .map((l) => lineName.get(l.id))
          .filter((n): n is string => Boolean(n)),
        chromas,
      };
    });

  // Agrupa por campeão. Os ids das skins já seguem a ordem de lançamento.
  const byChampion = new Map<number, Skin[]>();
  for (const skin of allSkins) {
    const list = byChampion.get(skin.championId) ?? [];
    list.push(skin);
    byChampion.set(skin.championId, list);
  }

  return [...byChampion.entries()]
    .map(([id, champSkins]) => ({
      id,
      name: championName.get(id) ?? "?",
      icon: `${BASE}/v1/champion-icons/${id}.png`,
      skins: champSkins.sort((a, b) => a.id - b.id),
    }))
    .sort((a, b) => a.name.localeCompare(b.name));
}
