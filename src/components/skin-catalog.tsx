"use client";

import { useDeferredValue, useEffect, useMemo, useState } from "react";
import { SearchIcon } from "lucide-react";
import { toast } from "sonner";

import { CatalogCard, itemTitle } from "@/components/catalog-card";
import { CARD_GRID, ChampionSection } from "@/components/champion-section";
import { SkinDialog } from "@/components/skin-dialog";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useWishlist } from "@/hooks/use-wishlist";
import { buildItemMap, searchCatalog, skinKey } from "@/lib/search";
import type { CatalogItem, Champion, Skin } from "@/lib/types";

type LoadState =
  | { status: "loading" }
  | { status: "error" }
  | { status: "ready"; champions: Champion[] };

export function SkinCatalog() {
  const [state, setState] = useState<LoadState>({ status: "loading" });
  const [query, setQuery] = useState("");
  const [openSkin, setOpenSkin] = useState<Skin | null>(null);
  const wishlist = useWishlist();

  // useDeferredValue: o input atualiza na hora e a filtragem (~2 mil skins)
  // roda com prioridade menor, então digitar nunca trava.
  const deferredQuery = useDeferredValue(query);

  useEffect(() => {
    fetch("/api/skins")
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json() as Promise<Champion[]>;
      })
      .then((champions) => setState({ status: "ready", champions }))
      .catch(() => setState({ status: "error" }));
  }, []);

  const champions = useMemo(
    () => (state.status === "ready" ? state.champions : []),
    [state],
  );
  const results = useMemo(
    () => searchCatalog(champions, deferredQuery),
    [champions, deferredQuery],
  );
  const resultCount = results.reduce((n, c) => n + c.skins.length, 0);

  // Wishlist agrupada por campeão (mesma ordem alfabética da busca).
  const itemMap = useMemo(() => buildItemMap(champions), [champions]);
  const wishedByChampion = useMemo(() => {
    const groups = new Map<number, CatalogItem[]>();
    for (const entry of wishlist.entries) {
      const item = itemMap.get(entry.key);
      if (!item) continue;
      const list = groups.get(item.skin.championId) ?? [];
      list.push(item);
      groups.set(item.skin.championId, list);
    }
    return champions
      .filter((c) => groups.has(c.id))
      .map((c) => ({ champion: c, items: groups.get(c.id)! }));
  }, [champions, itemMap, wishlist.entries]);
  const wishedCount = wishedByChampion.reduce((n, g) => n + g.items.length, 0);

  function handleToggleWish(item: CatalogItem) {
    const added = wishlist.toggle(item.key);
    const title = itemTitle(item);
    toast(added ? `${title} adicionado à wishlist` : `${title} removido da wishlist`);
  }

  if (state.status === "loading") return <LoadingSkeleton />;
  if (state.status === "error") {
    return (
      <p className="text-sm text-destructive">
        Não foi possível carregar as skins. Recarregue a página para tentar de novo.
      </p>
    );
  }

  return (
    <>
      <Tabs defaultValue="search" className="gap-6">
        <TabsList>
          <TabsTrigger value="search">Skins</TabsTrigger>
          <TabsTrigger value="wishlist">Minha wishlist ({wishedCount})</TabsTrigger>
        </TabsList>

        <TabsContent value="search" className="flex flex-col gap-6">
          <div className="relative">
            <SearchIcon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              autoFocus
              placeholder="Campeão, skin, chroma ou coleção (ex: ahri arcana)"
              aria-label="Buscar skins e chromas"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="h-10 pl-9"
            />
          </div>

          <p className="text-sm text-muted-foreground">
            {resultCount.toLocaleString("pt-BR")} {resultCount === 1 ? "skin" : "skins"} em{" "}
            {results.length} {results.length === 1 ? "campeão" : "campeões"}. Clique em
            uma skin para ver os chromas.
          </p>

          {results.map((champ) => (
            <ChampionSection
              key={champ.id}
              name={champ.name}
              icon={champ.icon}
              count={champ.skins.length}
            >
              <ul className={CARD_GRID}>
                {champ.skins.map((skin) => {
                  const item: CatalogItem = { kind: "skin", key: skinKey(skin), skin };
                  return (
                    <li key={item.key}>
                      <CatalogCard
                        item={item}
                        wished={wishlist.has(item.key)}
                        onToggleWish={handleToggleWish}
                        onOpen={() => setOpenSkin(skin)}
                      />
                    </li>
                  );
                })}
              </ul>
            </ChampionSection>
          ))}
        </TabsContent>

        <TabsContent value="wishlist" className="flex flex-col gap-6">
          {wishedByChampion.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Sua wishlist está vazia. Toque no ♥ de uma skin ou chroma para adicionar.
            </p>
          ) : (
            wishedByChampion.map(({ champion, items }) => (
              <ChampionSection
                key={champion.id}
                name={champion.name}
                icon={champion.icon}
                count={items.length}
              >
                <ul className={CARD_GRID}>
                  {items.map((item) => (
                    <li key={item.key}>
                      <CatalogCard
                        item={item}
                        wished
                        onToggleWish={handleToggleWish}
                        onOpen={() => setOpenSkin(item.skin)}
                      />
                    </li>
                  ))}
                </ul>
              </ChampionSection>
            ))
          )}
        </TabsContent>
      </Tabs>

      <SkinDialog
        skin={openSkin}
        onClose={() => setOpenSkin(null)}
        isWished={wishlist.has}
        onToggleWish={handleToggleWish}
      />
    </>
  );
}

function LoadingSkeleton() {
  return (
    <div className="flex flex-col gap-3" aria-label="Carregando skins">
      <Skeleton className="h-9 w-48" />
      <ul className={CARD_GRID}>
        {Array.from({ length: 12 }, (_, i) => (
          <li key={i}>
            <Skeleton className="aspect-[3/4] w-full rounded-xl" />
          </li>
        ))}
      </ul>
    </div>
  );
}
