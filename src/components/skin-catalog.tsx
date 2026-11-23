"use client";

import { useState } from "react";
import { SearchIcon } from "lucide-react";
import { toast } from "sonner";

import { CatalogCard, itemTitle } from "@/components/catalog-card";
import { CARD_GRID, ChampionSection } from "@/components/champion-section";
import { LoadMoreSentinel } from "@/components/load-more-sentinel";
import { SkinDialog } from "@/components/skin-dialog";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCatalog } from "@/hooks/use-catalog";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { useWishlist } from "@/hooks/use-wishlist";
import { useWishlistItems } from "@/hooks/use-wishlist-items";
import { skinKey } from "@/lib/search";
import type { CatalogItem, Skin } from "@/lib/types";

/** Espera depois da última tecla antes de buscar no servidor. */
const SEARCH_DEBOUNCE_MS = 300;

export function SkinCatalog() {
  const [openSkin, setOpenSkin] = useState<Skin | null>(null);
  const wishlist = useWishlist();

  function handleToggleWish(item: CatalogItem) {
    const added = wishlist.toggle(item.key);
    const title = itemTitle(item);
    toast(added ? `${title} adicionado à wishlist` : `${title} removido da wishlist`);
  }

  return (
    <>
      <Tabs defaultValue="search" className="gap-6">
        <TabsList>
          <TabsTrigger value="search">Skins</TabsTrigger>
          <TabsTrigger value="wishlist">
            Minha wishlist ({wishlist.entries.length})
          </TabsTrigger>
        </TabsList>

        {/* O Radix só monta a aba ativa: cada aba só busca dados quando é aberta. */}
        <TabsContent value="search">
          <CatalogTab
            isWished={wishlist.has}
            onToggleWish={handleToggleWish}
            onOpenSkin={setOpenSkin}
          />
        </TabsContent>

        <TabsContent value="wishlist">
          <WishlistTab
            keys={wishlist.entries.map((e) => e.key)}
            onToggleWish={handleToggleWish}
            onOpenSkin={setOpenSkin}
          />
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

type TabProps = {
  onToggleWish: (item: CatalogItem) => void;
  onOpenSkin: (skin: Skin) => void;
};

function CatalogTab({
  isWished,
  onToggleWish,
  onOpenSkin,
}: TabProps & { isWished: (key: string) => boolean }) {
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebouncedValue(query.trim(), SEARCH_DEBOUNCE_MS);
  const catalog = useCatalog(debouncedQuery);

  return (
    <div className="flex flex-col gap-6">
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

      {catalog.status === "loading" && <SectionsSkeleton />}

      {catalog.status === "error" && (
        <p className="text-sm text-destructive">
          Não foi possível carregar as skins. Recarregue a página para tentar de novo.
        </p>
      )}

      {catalog.status === "ready" && (
        <>
          <p className="text-sm text-muted-foreground">
            {catalog.totalSkins.toLocaleString("pt-BR")}{" "}
            {catalog.totalSkins === 1 ? "skin" : "skins"} em {catalog.totalChampions}{" "}
            {catalog.totalChampions === 1 ? "campeão" : "campeões"}. Clique em uma skin
            para ver os chromas.
          </p>

          {catalog.champions.map((champ) => (
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
                        wished={isWished(item.key)}
                        onToggleWish={onToggleWish}
                        onOpen={() => onOpenSkin(skin)}
                      />
                    </li>
                  );
                })}
              </ul>
            </ChampionSection>
          ))}

          {catalog.hasMore && <LoadMoreSentinel onVisible={catalog.loadMore} />}
        </>
      )}
    </div>
  );
}

function WishlistTab({ keys, onToggleWish, onOpenSkin }: TabProps & { keys: string[] }) {
  const { groups, loading } = useWishlistItems(keys);

  if (keys.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Sua wishlist está vazia. Toque no ♥ de uma skin ou chroma para adicionar.
      </p>
    );
  }
  if (loading) return <SectionsSkeleton />;

  return (
    <div className="flex flex-col gap-6">
      {groups.map(({ champion, items }) => (
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
                  onToggleWish={onToggleWish}
                  onOpen={() => onOpenSkin(item.skin)}
                />
              </li>
            ))}
          </ul>
        </ChampionSection>
      ))}
    </div>
  );
}

function SectionsSkeleton() {
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
