import type { CatalogItem, Skin } from "@/lib/types";

export type KindFilter = "all" | "skin" | "chroma";

/** Minúsculas, sem acentos e sem pontuação: "Kai'Sa" → "kaisa". */
export function normalize(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9 ]/g, "");
}

export type SearchIndex = { item: CatalogItem; haystack: string }[];

/** Achata skins + chromas numa lista pesquisável. Feito uma vez só. */
export function buildIndex(skins: Skin[]): SearchIndex {
  const index: SearchIndex = [];
  for (const skin of skins) {
    const base = [skin.name, skin.championName, ...skin.skinLines].join(" ");
    index.push({
      item: { kind: "skin", key: `s${skin.id}`, skin },
      haystack: normalize(base),
    });
    for (const chroma of skin.chromas) {
      index.push({
        item: { kind: "chroma", key: `c${chroma.id}`, skin, chroma },
        haystack: normalize(`${base} ${chroma.name} chroma`),
      });
    }
  }
  return index;
}

/** Todas as palavras digitadas precisam aparecer, em qualquer ordem. */
export function search(
  index: SearchIndex,
  query: string,
  kind: KindFilter,
): CatalogItem[] {
  const terms = normalize(query).split(" ").filter(Boolean);
  return index
    .filter(
      ({ item, haystack }) =>
        (kind === "all" || item.kind === kind) &&
        terms.every((t) => haystack.includes(t)),
    )
    .map(({ item }) => item);
}
