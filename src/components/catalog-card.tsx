import Image from "next/image";
import { HeartIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { RARITY_LABEL, type CatalogItem } from "@/lib/types";

export function itemTitle(item: CatalogItem): string {
  return item.kind === "chroma" ? item.chroma.name : item.skin.name;
}

type Props = {
  item: CatalogItem;
  wished: boolean;
  onToggleWish: (item: CatalogItem) => void;
  /** Se passado, clicar no card abre os detalhes (modal de chromas). */
  onOpen?: () => void;
};

export function CatalogCard({ item, wished, onToggleWish, onOpen }: Props) {
  const { skin } = item;
  const isChroma = item.kind === "chroma";
  const image = isChroma ? item.chroma.image : skin.image;
  const title = itemTitle(item);

  return (
    <Card
      className={cn(
        "relative gap-0 overflow-hidden py-0",
        onOpen && "transition-colors hover:ring-2 hover:ring-primary/60",
      )}
    >
      {/*
        Botão invisível cobrindo o card inteiro: o card todo fica clicável
        sem colocar um <button> dentro de outro (o ♥ fica por cima com z-10).
      */}
      {onOpen && (
        <button
          type="button"
          onClick={onOpen}
          aria-label={`Ver chromas de ${title}`}
          className="absolute inset-0 z-[1] rounded-xl focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
        />
      )}
      <div className="relative aspect-square bg-muted">
        {image && (
          <Image
            src={image}
            alt={title}
            fill
            // As imagens já vêm do CDN do CommunityDragon no tamanho certo;
            // não precisamos que o Next as reprocesse.
            unoptimized
            sizes="(max-width: 640px) 50vw, 200px"
            className={isChroma ? "object-contain p-2" : "object-cover"}
          />
        )}
        <div className="absolute top-2 left-2">
          {isChroma ? (
            <Badge variant="secondary">Chroma</Badge>
          ) : (
            skin.rarity && <Badge>{RARITY_LABEL[skin.rarity]}</Badge>
          )}
        </div>
        <Button
          size="icon"
          variant="secondary"
          className="absolute top-2 right-2 z-10 rounded-full"
          aria-pressed={wished}
          aria-label={
            wished ? `Remover ${title} da wishlist` : `Adicionar ${title} à wishlist`
          }
          onClick={() => onToggleWish(item)}
        >
          <HeartIcon className={cn(wished && "fill-red-500 text-red-500")} />
        </Button>
      </div>
      <CardContent className="flex flex-col gap-1 p-3">
        <p className="line-clamp-2 text-sm leading-tight font-medium">{title}</p>
        <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
          <span className="truncate">{skin.championName}</span>
          {isChroma ? (
            <span className="flex shrink-0 gap-0.5" aria-hidden>
              {item.chroma.colors.map((color) => (
                <span
                  key={color}
                  className="size-3 rounded-full border border-border"
                  style={{ backgroundColor: color }}
                />
              ))}
            </span>
          ) : (
            skin.chromas.length > 0 && (
              <span className="shrink-0">
                {skin.chromas.length} {skin.chromas.length === 1 ? "chroma" : "chromas"}
              </span>
            )
          )}
        </div>
      </CardContent>
    </Card>
  );
}
