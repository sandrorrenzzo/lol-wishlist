"use client";

import { useEffect, useState } from "react";

/**
 * Devolve `value` só depois que ele para de mudar por `delayMs`.
 * Ex.: digitar "ahri" dispara 1 busca no servidor em vez de 4.
 */
export function useDebouncedValue<T>(value: T, delayMs: number): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delayMs);
    // Se o valor mudar antes do tempo, o timer anterior é cancelado.
    return () => clearTimeout(timer);
  }, [value, delayMs]);

  return debounced;
}
