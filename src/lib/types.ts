export type Rarity =
  | "epic"
  | "legendary"
  | "ultimate"
  | "mythic"
  | "transcendent"
  | "exalted";

export type Chroma = {
  id: number;
  name: string;
  image: string | null;
  colors: string[];
};

export type Skin = {
  id: number;
  name: string;
  championId: number;
  championName: string;
  rarity: Rarity | null;
  isLegacy: boolean;
  image: string | null;
  /** Splash art grande, usada no modal da skin. */
  splash: string | null;
  skinLines: string[];
  chromas: Chroma[];
  /** Nomes em inglês (skin + chromas), usados só na busca. */
  searchAliases: string;
};

export type Champion = {
  id: number;
  name: string;
  icon: string;
  skins: Skin[];
};

/**
 * Item que pode ir para a wishlist: uma skin ou um chroma específico.
 * `key` é único entre os dois tipos ("s1013" = skin, "c1014" = chroma)
 * e é o que salvamos na wishlist.
 */
export type CatalogItem =
  | { kind: "skin"; key: string; skin: Skin }
  | { kind: "chroma"; key: string; skin: Skin; chroma: Chroma };

export const RARITY_LABEL: Record<Rarity, string> = {
  epic: "Épica",
  legendary: "Lendária",
  ultimate: "Suprema",
  mythic: "Mítica",
  transcendent: "Transcendental",
  exalted: "Exaltada",
};

/** Resposta de GET /api/skins (uma página do scroll infinito). */
export type CatalogPage = {
  champions: Champion[];
  nextCursor: number | null;
  totalChampions: number;
  totalSkins: number;
};

/** Resposta de GET /api/skins/items: itens da wishlist agrupados por campeão. */
export type WishlistGroup = {
  champion: Pick<Champion, "id" | "name" | "icon">;
  items: CatalogItem[];
};
