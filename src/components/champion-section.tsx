import Image from "next/image";
import type { ReactNode } from "react";

type Props = {
  name: string;
  icon: string;
  count: number;
  children: ReactNode;
};

export const CARD_GRID =
  "grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6";

/**
 * Uma seção por campeão. `content-visibility: auto` faz o navegador pular
 * a renderização das seções fora da tela (são ~170 campeões, ~2 mil cards).
 */
export function ChampionSection({ name, icon, count, children }: Props) {
  return (
    <section
      aria-label={name}
      className="flex flex-col gap-3 [contain-intrinsic-size:auto_420px] [content-visibility:auto]"
    >
      <h2 className="flex items-center gap-3 text-lg font-semibold">
        <Image
          src={icon}
          alt=""
          width={36}
          height={36}
          unoptimized
          className="rounded-full border border-border"
        />
        {name}
        <span className="text-sm font-normal text-muted-foreground">{count}</span>
      </h2>
      {children}
    </section>
  );
}
