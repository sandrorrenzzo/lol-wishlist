import type {
  CatalogItem,
  CatalogPage,
  Champion,
  Skin,
  WishlistGroup,
} from "@/lib/types";

/** Minúsculas, sem acentos e sem pontuação: "Kai'Sa" → "kaisa". */
export function normalize(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9 ]/g, "");
}

/**
 * Texto pesquisável de cada skin: nome, campeão, coleções, nomes dos
 * chromas e os mesmos nomes em inglês. Assim "ahri esmeralda" e
 * "ahri emerald" encontram a skin que tem esse chroma.
 * Calculado uma vez só (WeakMap evita recalcular a cada tecla).
 */
const haystacks = new WeakMap<Skin, string>();
function haystack(skin: Skin): string {
  let text = haystacks.get(skin);
  if (text === undefined) {
    text = normalize(
      [
        skin.name,
        skin.championName,
        ...skin.skinLines,
        ...skin.chromas.map((c) => c.name),
        skin.searchAliases,
      ].join(" "),
    );
    haystacks.set(skin, text);
  }
  return text;
}

/**
 * Filtra mantendo o agrupamento por campeão. Todas as palavras digitadas
 * precisam aparecer, em qualquer ordem. Campeões sem skin restante somem.
 */
export function searchCatalog(champions: Champion[], query: string): Champion[] {
  const terms = normalize(query).split(" ").filter(Boolean);
  if (terms.length === 0) return champions;
  return champions
    .map((champ) => ({
      ...champ,
      skins: champ.skins.filter((skin) => terms.every((t) => haystack(skin).includes(t))),
    }))
    .filter((champ) => champ.skins.length > 0);
}

/**
 * Uma "página" do catálogo: um pedaço dos campeões já filtrados.
 * `nextCursor` é o índice do próximo campeão (null = acabou).
 */
export function paginate(
  champions: Champion[],
  cursor: number,
  limit: number,
): CatalogPage {
  const end = cursor + limit;
  return {
    champions: champions.slice(cursor, end),
    nextCursor: end < champions.length ? end : null,
    totalChampions: champions.length,
    totalSkins: champions.reduce((n, c) => n + c.skins.length, 0),
  };
}

/**
 * Resolve as chaves salvas na wishlist ("s1013", "c1014") e agrupa por
 * campeão, em ordem alfabética. Dentro do campeão, mantém a ordem das chaves.
 */
export function groupWishlist(champions: Champion[], keys: string[]): WishlistGroup[] {
  const items = buildItemMap(champions);
  const groups = new Map<number, CatalogItem[]>();
  for (const key of keys) {
    const item = items.get(key);
    if (!item) continue;
    const list = groups.get(item.skin.championId) ?? [];
    list.push(item);
    groups.set(item.skin.championId, list);
  }
  return champions
    .filter((c) => groups.has(c.id))
    .map((c) => ({
      champion: { id: c.id, name: c.name, icon: c.icon },
      items: groups.get(c.id)!,
    }));
}

/** Mapa chave → item (skins e chromas), para resolver a wishlist salva. */
function buildItemMap(champions: Champion[]): Map<string, CatalogItem> {
  const map = new Map<string, CatalogItem>();
  for (const champ of champions) {
    for (const skin of champ.skins) {
      map.set(skinKey(skin), { kind: "skin", key: skinKey(skin), skin });
      for (const chroma of skin.chromas) {
        const key = `c${chroma.id}`;
        map.set(key, { kind: "chroma", key, skin, chroma });
      }
    }
  }
  return map;
}

export function skinKey(skin: Skin): string {
  return `s${skin.id}`;
}
