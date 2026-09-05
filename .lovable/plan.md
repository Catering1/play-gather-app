# MatchFind — interface para encontrar e organizar jogos

Plataforma visual (sem backend) em português, mobile-first, na direção "Frosted pitch" escolhida, mas invertida para um registo noturno mais profundo: fundo escuro azulado, cartões em vidro fosco, verde energético como única cor de destaque.

## Identidade visual

- Fundo: azul-noite profundo com halos suaves de verde e azul ao fundo do ecrã
- Cartões: cantos muito arredondados, vidro fosco translúcido com contorno subtil
- Destaque: verde vivo (botões principais, estados ativos, números)
- Tipografia: Inter Tight nos títulos (forte, compacta), Inter no texto, mono para horas, preços e vagas
- Movimento contido: entradas suaves ao aparecer, resposta ao toque nos cartões e botões
- Navegação inferior fixa com botão central "+" para criar jogo

## Páginas

**Início** — cabeçalho com nome e cidade, campo de pesquisa, título "Encontra o teu próximo jogo.", chips das 6 modalidades (Futebol, Ping Pong, Ténis, Basquetebol, Badminton, Voleibol), pesquisa por desporto/localização/data, jogos recomendados em cartões com foto, e secção "Como funciona" em 3 passos.

**Explorar** — lista de jogos em cartões com filtros por desporto, data, localização, nível e preço; contagem de resultados e estado vazio.

**Detalhe do jogo** — foto de topo, modalidade, data, hora, local, preço, nível, lista de jogadores inscritos com avatares, cartão do organizador e botão fixo "Juntar-me" (confirmação visual, sem backend).

**Criar jogo** — formulário simples: desporto, data, hora, local, número de jogadores, nível e preço, com resumo e botão de publicar (mostra confirmação).

**Perfil** — avatar, nome e cidade, estatísticas (jogos, desporto favorito, avaliação, presenças), próximos jogos e histórico.

## Dados

Todos os jogos, jogadores e estatísticas são fictícios, guardados num ficheiro de dados na aplicação. Sem base de dados, contas, pagamentos ou serviços externos.

## Notas técnicas

- Rotas: `/` (Início), `/explorar`, `/jogo/$id`, `/criar`, `/perfil`
- Mocks tipados em `src/data/games.ts` e `src/data/user.ts`; componentes partilhados em `src/components/` (GameCard, FilterChips, BottomNav, AppHeader, SectionTitle)
- Tokens da direção escolhida (variante escura) escritos em `src/styles.css` via `@theme inline`; fontes carregadas por `<link>` no `__root.tsx`
- Cada rota com `head()` próprio (título e descrição em PT)
- Imagens dos cartões geradas para as modalidades e guardadas em `src/assets/`
- Filtros, pesquisa e "Juntar-me" funcionam apenas em estado local no ecrã
