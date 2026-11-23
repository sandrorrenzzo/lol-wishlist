# LoL Wishlist

Wishlist de skins e chromas do League of Legends. Busque qualquer skin ou chroma específico e salve na sua lista para não esquecer o que você quer comprar.

<img src="docs/tela.jpg" alt="Skins do LoL Wishlist separadas por campeão" width="400"> <img src="docs/chromas.jpg" alt="Modal com os chromas da Arcana Ahri" width="400">

## Uso

1. Na aba **Skins**, as skins aparecem separadas por campeão, em ordem alfabética.
2. Para filtrar, digite campeão, skin, chroma ou coleção, em qualquer ordem (ex.: `ahri arcana`, `kaisa emerald`). Acentos e apóstrofos não importam.
3. Clique numa skin para ver a splash art e todos os chromas dela.
4. Toque no ♥ de uma skin ou de um chroma para adicionar ou remover da wishlist.
5. Veja tudo na aba **Minha wishlist**, também agrupado por campeão.

Por enquanto a wishlist fica salva no navegador (`localStorage`). Login e sincronização entre dispositivos estão no plano.

## Como funciona

- A API oficial da Riot não tem dados de skins nem chromas. Os dados e as imagens vêm do [CommunityDragon](https://www.communitydragon.org/), que espelha os arquivos do client do LoL.
- A rota `GET /api/skins` junta `skins.json`, `champion-summary.json` e `skinlines.json` num formato enxuto. O resultado é gerado no build e atualizado no máximo uma vez por dia (`use cache` + `cacheLife("days")`).
- A busca roda no navegador, sobre cerca de 2 mil skins de 173 campeões (com os nomes dos chromas incluídos).

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
