"use client";

import { useDeferredValue, useEffect, useMemo, useState } from "react";
import { SearchIcon } from "lucide-react";
import { toast } from "sonner";

import { CatalogCard, itemTitle } from "@/components/catalog-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useWishlist } from "@/hooks/use-wishlist";
import { buildIndex, search, type KindFilter } from "@/lib/search";
import type { CatalogItem, Skin } from "@/lib/types";

const PAGE_SIZE = 60;

type LoadState =
  | { status: "loading" }
  | { status: "error" }
  | { status: "ready"; skins: Skin[] };

export function SkinCatalog() {
  const [state, setState] = useState<LoadState>({ status: "loading" });
  const [query, setQuery] = useState("");
  const [kind, setKind] = useState<KindFilter>("all");
  const [limit, setLimit] = useState(PAGE_SIZE);
  const wishlist = useWishlist();

  // useDeferredValue: o input atualiza na hora e a filtragem (≈9 mil itens)
  // roda com prioridade menor, então digitar nunca trava.
  const deferredQuery = useDeferredValue(query);

  useEffect(() => {
    fetch("/api/skins")
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json() as Promise<Skin[]>;
      })
      .then((skins) => setState({ status: "ready", skins }))
      .catch(() => setState({ status: "error" }));
  }, []);

  const index = useMemo(
    () => (state.status === "ready" ? buildIndex(state.skins) : []),
    [state],
  );
  const results = useMemo(
    () => search(index, deferredQuery, kind),
    [index, deferredQuery, kind],
  );
  // Converte as chaves salvas ("s1013", "c1014") de volta em itens.
  const wishedItems = useMemo(() => {
    const byKey = new Map(index.map(({ item }) => [item.key, item]));
    return wishlist.entries
      .map((e) => byKey.get(e.key))
      .filter((item): item is CatalogItem => Boolean(item));
  }, [index, wishlist.entries]);

  function handleToggleWish(item: CatalogItem) {
    const added = wishlist.toggle(item.key);
    const title = itemTitle(item);
    toast(added ? `${title} adicionado à wishlist` : `${title} removido da wishlist`);
  }

  if (state.status === "loading") return <GridSkeleton />;
  if (state.status === "error") {
    return (
      <p className="text-sm text-destructive">
        Não foi possível carregar as skins. Recarregue a página para tentar de novo.
      </p>
    );
  }

  return (
    <Tabs defaultValue="search" className="gap-6">
      <TabsList>
        <TabsTrigger value="search">Buscar</TabsTrigger>
        <TabsTrigger value="wishlist">
          Minha wishlist ({wishedItems.length})
        </TabsTrigger>
      </TabsList>

      <TabsContent value="search" className="flex flex-col gap-6">
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <SearchIcon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              autoFocus
              placeholder="Campeão, skin, chroma ou coleção (ex: ahri arcana)"
              aria-label="Buscar skins e chromas"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setLimit(PAGE_SIZE);
              }}
              className="h-10 pl-9"
            />
          </div>
          <Select
            value={kind}
            onValueChange={(value) => {
              setKind(value as KindFilter);
              setLimit(PAGE_SIZE);
            }}
          >
            <SelectTrigger className="h-10 w-full sm:w-48" aria-label="Tipo">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Skins e chromas</SelectItem>
              <SelectItem value="skin">Só skins</SelectItem>
              <SelectItem value="chroma">Só chromas</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <p className="text-sm text-muted-foreground">
          {results.length.toLocaleString("pt-BR")}{" "}
          {results.length === 1 ? "resultado" : "resultados"}
        </p>
        <ItemGrid
          items={results.slice(0, limit)}
          isWished={wishlist.has}
          onToggleWish={handleToggleWish}
        />
        {results.length > limit && (
          <Button
            variant="outline"
            className="self-center"
            onClick={() => setLimit((n) => n + PAGE_SIZE)}
          >
            Mostrar mais
          </Button>
        )}
      </TabsContent>

      <TabsContent value="wishlist">
        {wishedItems.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Sua wishlist está vazia. Busque uma skin ou chroma e toque no ♥.
          </p>
        ) : (
          <ItemGrid
            items={wishedItems}
            isWished={wishlist.has}
            onToggleWish={handleToggleWish}
          />
        )}
      </TabsContent>
    </Tabs>
  );
}

const GRID = "grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6";

function ItemGrid({
  items,
  isWished,
  onToggleWish,
}: {
  items: CatalogItem[];
  isWished: (key: string) => boolean;
  onToggleWish: (item: CatalogItem) => void;
}) {
  return (
    <ul className={GRID}>
      {items.map((item) => (
        <li key={item.key}>
          <CatalogCard
            item={item}
            wished={isWished(item.key)}
            onToggleWish={onToggleWish}
          />
        </li>
      ))}
    </ul>
  );
}

function GridSkeleton() {
  return (
    <ul className={GRID} aria-label="Carregando skins">
      {Array.from({ length: 12 }, (_, i) => (
        <li key={i}>
          <Skeleton className="aspect-[3/4] w-full rounded-xl" />
        </li>
      ))}
    </ul>
  );
}
