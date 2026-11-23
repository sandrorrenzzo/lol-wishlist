"use client";

import { useEffect, useRef } from "react";

import { Skeleton } from "@/components/ui/skeleton";

/**
 * Elemento invisível no fim da lista. Quando ele chega a ~800px da área
 * visível, o IntersectionObserver avisa e carregamos a próxima página.
 * É mais barato que ouvir o evento de scroll: o navegador faz a conta.
 */
export function LoadMoreSentinel({ onVisible }: { onVisible: () => void }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) onVisible();
      },
      { rootMargin: "800px 0px" },
    );
    observer.observe(element);
    // Quando `onVisible` muda (página nova carregada), o observer é recriado.
    // Se o sentinela ainda estiver perto da tela, ele dispara de novo na
    // hora, e assim a tela vai se enchendo até passar do fim.
    return () => observer.disconnect();
  }, [onVisible]);

  return (
    <div ref={ref} className="flex flex-col gap-3" aria-label="Carregando mais campeões">
      <Skeleton className="h-9 w-48" />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
        {Array.from({ length: 6 }, (_, i) => (
          <Skeleton key={i} className="aspect-[3/4] w-full rounded-xl" />
        ))}
      </div>
    </div>
  );
}
