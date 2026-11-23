import type { CatalogItem, Champion, Skin } from "@/lib/types";

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

/** Mapa chave → item (skins e chromas), para resolver a wishlist salva. */
export function buildItemMap(champions: Champion[]): Map<string, CatalogItem> {
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
