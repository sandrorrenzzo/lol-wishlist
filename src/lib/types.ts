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
  skinLines: string[];
  chromas: Chroma[];
};

/**
 * Item exibido na tela: uma skin ou um chroma específico.
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
