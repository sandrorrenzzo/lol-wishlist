"use client";

import { useEffect, useMemo, useState } from "react";

import type { WishlistGroup } from "@/lib/types";

/**
 * Busca no servidor os dados das skins/chromas salvos na wishlist
 * (o catálogo paginado pode não ter carregado essas skins ainda).
 */
export function useWishlistItems(keys: string[]) {
  const keyList = keys.join(",");
  const [data, setData] = useState<{ keyList: string; groups: WishlistGroup[] } | null>(
    null,
  );

  useEffect(() => {
    if (!keyList) return;
    const controller = new AbortController();
    fetch(`/api/skins/items?keys=${encodeURIComponent(keyList)}`, {
      signal: controller.signal,
    })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json() as Promise<WishlistGroup[]>;
      })
      .then((groups) => setData({ keyList, groups }))
      .catch(() => {
        // Request cancelada ou falhou: mantém o que já estava na tela.
      });
    return () => controller.abort();
  }, [keyList]);

  // Enquanto a resposta nova não chega, mostra a anterior sem os itens
  // removidos: tirar um ♥ some da tela na hora.
  const groups = useMemo(() => {
    if (!keyList || !data) return [];
    const current = new Set(keyList.split(","));
    return data.groups
      .map((g) => ({ ...g, items: g.items.filter((item) => current.has(item.key)) }))
      .filter((g) => g.items.length > 0);
  }, [data, keyList]);

  return {
    groups,
    // Só mostra "carregando" na primeira vez; depois atualiza em silêncio.
    loading: keyList !== "" && data === null,
  };
}
