import { SkinCatalog } from "@/components/skin-catalog";

export default function Home() {
  return (
    <div className="flex min-h-full flex-col">
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-10">
        <header className="mb-8 flex flex-col gap-2">
          <h1 className="text-3xl font-semibold tracking-tight">LoL Wishlist</h1>
          <p className="text-muted-foreground">
            Encontre as skins e chromas que você quer ter e salve na sua lista.
          </p>
        </header>
        <SkinCatalog />
      </main>
      {/* Aviso exigido pela política de projetos de fãs da Riot. */}
      <footer className="border-t px-4 py-6 text-center text-xs text-muted-foreground">
        LoL Wishlist não é endossado pela Riot Games e não reflete as opiniões
        da Riot Games nem de ninguém oficialmente envolvido na produção ou
        gestão das propriedades da Riot Games. Riot Games e todas as
        propriedades associadas são marcas comerciais ou registradas da Riot
        Games, Inc. Dados e imagens via CommunityDragon.
      </footer>
    </div>
  );
}
