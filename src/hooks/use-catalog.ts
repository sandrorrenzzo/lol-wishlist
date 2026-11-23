"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import type { CatalogPage, Champion } from "@/lib/types";

type State = {
  /** Busca a que estes dados pertencem. Se for diferente da atual, estão velhos. */
  query: string;
  champions: Champion[];
  nextCursor: number | null;
  totalChampions: number;
  totalSkins: number;
  error: boolean;
};

async function fetchPage(
  query: string,
  cursor: number,
  signal?: AbortSignal,
): Promise<CatalogPage> {
  const params = new URLSearchParams({ cursor: String(cursor) });
  if (query) params.set("q", query);
  const res = await fetch(`/api/skins?${params}`, { signal });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

/**
 * Catálogo paginado para scroll infinito.
 * - Ao mudar `query`, busca a primeira página do zero.
 * - `loadMore()` busca a próxima página e junta com as anteriores.
 */
export function useCatalog(query: string) {
  const [state, setState] = useState<State | null>(null);
  const loadingMore = useRef(false);

  // Primeira página sempre que a busca muda. O AbortController cancela a
  // request anterior se o usuário mudar a busca antes da resposta chegar.
  useEffect(() => {
    const controller = new AbortController();
    fetchPage(query, 0, controller.signal)
      .then((page) => setState({ query, error: false, ...page }))
      .catch(() => {
        if (!controller.signal.aborted) {
          setState({
            query,
            champions: [],
            nextCursor: null,
            totalChampions: 0,
            totalSkins: 0,
            error: true,
          });
        }
      });
    return () => controller.abort();
  }, [query]);

  // Enquanto a primeira página da nova busca não chega, os dados antigos
  // não valem: a tela mostra "carregando".
  const current = state?.query === query ? state : null;

  const loadMore = useCallback(() => {
    if (!current || current.nextCursor === null || loadingMore.current) return;
    loadingMore.current = true;
    fetchPage(query, current.nextCursor)
      .then((page) =>
        setState((prev) =>
          // Ignora a resposta se a busca mudou enquanto ela vinha.
          prev && prev.query === query
            ? {
                ...prev,
                champions: [...prev.champions, ...page.champions],
                nextCursor: page.nextCursor,
              }
            : prev,
        ),
      )
      .catch(() =>
        setState((prev) => (prev && prev.query === query ? { ...prev, error: true } : prev)),
      )
      .finally(() => {
        loadingMore.current = false;
      });
  }, [current, query]);

  return {
    status: !current ? "loading" : current.error && current.champions.length === 0 ? "error" : "ready",
    champions: current?.champions ?? [],
    hasMore: current?.nextCursor != null && !current.error,
    totalChampions: current?.totalChampions ?? 0,
    totalSkins: current?.totalSkins ?? 0,
    loadMore,
  } as const;
}
