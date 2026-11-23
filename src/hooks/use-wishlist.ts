"use client";

import { useCallback, useSyncExternalStore } from "react";

/**
 * Wishlist salva no localStorage do navegador (fase 2).
 * Na fase 3 isso vira uma tabela no Supabase; a interface do hook fica igual.
 */

export type WishlistEntry = { key: string; addedAt: number };

const STORAGE_KEY = "lol-wishlist:v1";
const EMPTY: WishlistEntry[] = [];

// Cache em memória: useSyncExternalStore exige que getSnapshot devolva
// o MESMO objeto enquanto nada mudar, senão o React entra em loop.
let cachedRaw: string | null = null;
let cachedEntries: WishlistEntry[] = EMPTY;
const listeners = new Set<() => void>();

function read(): WishlistEntry[] {
  let raw: string | null = null;
  try {
    raw = localStorage.getItem(STORAGE_KEY);
  } catch {
    // Modo privado ou storage bloqueado: segue com lista vazia.
  }
  if (raw !== cachedRaw) {
    cachedRaw = raw;
    try {
      const parsed = raw ? JSON.parse(raw) : [];
      cachedEntries = Array.isArray(parsed) ? parsed : EMPTY;
    } catch {
      cachedEntries = EMPTY;
    }
  }
  return cachedEntries;
}

function write(entries: WishlistEntry[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  } catch {
    // Sem storage: a mudança vale só até recarregar a página.
    cachedRaw = null;
    cachedEntries = entries;
  }
  listeners.forEach((notify) => notify());
}

function subscribe(notify: () => void) {
  listeners.add(notify);
  // Evento "storage" = a wishlist mudou em OUTRA aba.
  const onStorage = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY) notify();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(notify);
    window.removeEventListener("storage", onStorage);
  };
}

export function useWishlist() {
  // No servidor não existe localStorage: a lista começa vazia.
  const entries = useSyncExternalStore(subscribe, read, () => EMPTY);

  const has = useCallback(
    (key: string) => entries.some((e) => e.key === key),
    [entries],
  );

  /** Adiciona se não estiver na lista, remove se estiver. Devolve o novo estado. */
  const toggle = useCallback((key: string): boolean => {
    const current = read();
    const exists = current.some((e) => e.key === key);
    write(
      exists
        ? current.filter((e) => e.key !== key)
        : [{ key, addedAt: Date.now() }, ...current],
    );
    return !exists;
  }, []);

  return { entries, has, toggle };
}
