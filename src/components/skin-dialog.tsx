"use client";

import Image from "next/image";
import { HeartIcon } from "lucide-react";

import { CatalogCard } from "@/components/catalog-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { skinKey } from "@/lib/search";
import { RARITY_LABEL, type CatalogItem, type Skin } from "@/lib/types";
import { cn } from "@/lib/utils";

type Props = {
  skin: Skin | null;
  onClose: () => void;
  isWished: (key: string) => boolean;
  onToggleWish: (item: CatalogItem) => void;
};

/** Detalhes da skin: splash art + todos os chromas, cada um com seu ♥. */
export function SkinDialog({ skin, onClose, isWished, onToggleWish }: Props) {
  return (
    <Dialog open={skin !== null} onOpenChange={(open) => !open && onClose()}>
      {/*
        `block` em vez do `grid` padrão: com altura máxima + scroll, o grid
        encolhia a linha da splash art e os chromas ficavam por cima dela.
      */}
      <DialogContent className="block max-h-[90vh] overflow-y-auto sm:max-w-3xl">
        {skin && (
          <SkinDetails skin={skin} isWished={isWished} onToggleWish={onToggleWish} />
        )}
      </DialogContent>
    </Dialog>
  );
}

function SkinDetails({
  skin,
  isWished,
  onToggleWish,
}: {
  skin: Skin;
  isWished: (key: string) => boolean;
  onToggleWish: (item: CatalogItem) => void;
}) {
  const skinItem: CatalogItem = { kind: "skin", key: skinKey(skin), skin };
  const wished = isWished(skinItem.key);

  return (
    <div className="flex flex-col gap-4">
      <DialogHeader>
        <DialogTitle className="text-xl">{skin.name}</DialogTitle>
        <DialogDescription className="flex flex-wrap items-center gap-2">
          <span>{skin.championName}</span>
          {skin.rarity && <Badge>{RARITY_LABEL[skin.rarity]}</Badge>}
          {skin.isLegacy && <Badge variant="outline">Legado</Badge>}
          {skin.skinLines.map((line) => (
            <Badge key={line} variant="secondary">
              {line}
            </Badge>
          ))}
        </DialogDescription>
      </DialogHeader>

      {skin.splash && (
        <div className="relative aspect-[16/9] overflow-hidden rounded-lg bg-muted">
          <Image
            src={skin.splash}
            alt={skin.name}
            fill
            unoptimized
            sizes="(max-width: 768px) 100vw, 768px"
            className="object-cover"
          />
        </div>
      )}

      <Button
        variant={wished ? "secondary" : "default"}
        className="self-start"
        onClick={() => onToggleWish(skinItem)}
      >
        <HeartIcon className={cn(wished && "fill-red-500 text-red-500")} />
        {wished ? "Na wishlist" : "Adicionar skin à wishlist"}
      </Button>

      <section className="flex flex-col gap-3">
        <h3 className="font-medium">
          Chromas{" "}
          <span className="text-muted-foreground">({skin.chromas.length})</span>
        </h3>
        {skin.chromas.length === 0 ? (
          <p className="text-sm text-muted-foreground">Esta skin não tem chromas.</p>
        ) : (
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {skin.chromas.map((chroma) => {
              const item: CatalogItem = {
                kind: "chroma",
                key: `c${chroma.id}`,
                skin,
                chroma,
              };
              return (
                <li key={item.key}>
                  <CatalogCard
                    item={item}
                    wished={isWished(item.key)}
                    onToggleWish={onToggleWish}
                  />
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
