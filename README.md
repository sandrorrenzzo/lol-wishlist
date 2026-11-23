# LoL Wishlist

Wishlist de skins e chromas do League of Legends. Busque qualquer skin ou chroma específico e salve na sua lista para não esquecer o que você quer comprar.

<img src="docs/tela.jpg" alt="Tela do LoL Wishlist buscando Star Guardian Kai'Sa e seus chromas" width="600">

## Uso

1. Na aba **Buscar**, digite campeão, skin, chroma ou coleção, em qualquer ordem (ex.: `ahri arcana`, `kaisa emerald`). Acentos e apóstrofos não importam.
2. Use o filtro para ver só skins ou só chromas.
3. Toque no ♥ de um card para adicionar ou remover da wishlist.
4. Veja tudo na aba **Minha wishlist**.

Por enquanto a wishlist fica salva no navegador (`localStorage`). Login e sincronização entre dispositivos estão no plano.

## Como funciona

- A API oficial da Riot não tem dados de skins nem chromas. Os dados e as imagens vêm do [CommunityDragon](https://www.communitydragon.org/), que espelha os arquivos do client do LoL.
- A rota `GET /api/skins` junta `skins.json`, `champion-summary.json` e `skinlines.json` num formato enxuto. O resultado é gerado no build e atualizado no máximo uma vez por dia (`use cache` + `cacheLife("days")`).
- A busca roda no navegador, sobre cerca de 9 mil itens (skins + chromas).

## Stack

- [Next.js 16](https://nextjs.org/) (App Router) + TypeScript
- [Tailwind CSS](https://tailwindcss.com/) + [shadcn/ui](https://ui.shadcn.com/)
- Próximos passos: [Supabase](https://supabase.com/) (login + banco) e deploy na [Vercel](https://vercel.com/)

## Build

Requer Node.js. Para rodar em modo de desenvolvimento (abre em `http://localhost:3000`):

```bash
npm install && npm run dev
```

Para gerar e rodar a versão de produção:

```bash
npm run build && npm start
```

---

LoL Wishlist não é endossado pela Riot Games e não reflete as opiniões da Riot Games nem de ninguém oficialmente envolvido na produção ou gestão das propriedades da Riot Games. Riot Games e todas as propriedades associadas são marcas comerciais ou registradas da Riot Games, Inc.
