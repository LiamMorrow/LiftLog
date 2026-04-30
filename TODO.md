# TODO — Gym Life RPG

Decisões arquiteturais e tarefas de desenvolvimento priorizadas.
Foco principal: **Dashboard Gamificado** e **Frontend RPG**.

---

## FASE 1 — Fundação do Sistema RPG

### [ ] 1.1 — Sistema de XP e Níveis (State + Lógica)

**Decisão arquitetural:** Criar uma slice Redux dedicada `store/rpg/` separada do estado de sessão existente. Não misturar lógica de gamificação com o domínio de treino.

- [ ] Criar `store/rpg/index.ts` com a slice: `xp`, `level`, `title` (ex: "Aprendiz de Ferro", "Guerreiro do Ferro", "Lenda da Academia")
- [ ] Criar `store/rpg/effects.ts` — side effects que ouvem ações de `current-session` e `stored-sessions` para calcular e despachar XP ganho
- [ ] Definir tabela de XP por nível (ex: nível N requer `N² × 100` XP)
- [ ] Calcular XP por: séries completadas, peso total levantado, tempo de treino, PRs batidos, streak de dias
- [ ] Persistir estado RPG via `preference-service.ts` (já existe no projeto)

**Referência:** `app/store/current-session/` para padrão existente de slice + effects.

---

### [ ] 1.2 — Sistema de Conquistas (Achievements)

**Decisão arquitetural:** Conquistas são eventos, não estado contínuo. Modelar como lista de IDs desbloqueados + timestamp.

- [ ] Criar `store/rpg/achievements.ts` com lista de conquistas disponíveis e desbloqueadas
- [ ] Tipos de conquistas: primeiro treino, X treinos seguidos (streak), PR em exercício, levantar X kg total acumulado, completar X missões
- [ ] Criar hook `useAchievementCheck()` que dispara ao salvar sessão
- [ ] Integrar com notificações locais (Expo Notifications já configurado)

---

### [ ] 1.3 — Missões Semanais / Diárias (Quests)

**Decisão arquitetural:** Quests são geradas programaticamente com base no histórico, não hardcoded. Usar o padrão de `effects.ts` para geração semanal.

- [ ] Criar `store/rpg/quests.ts` — slice com quests ativas e histórico de concluídas
- [ ] Gerar 3 quests por semana (ex: "Complete 3 treinos", "Faça supino acima do seu PR", "Treine 2 dias seguidos")
- [ ] UI de progresso de quest na tela de treino ativo

---

## FASE 2 — Dashboard Gamificado (Tela Principal)

**Decisão arquitetural:** Criar uma nova rota `app/(tabs)/dashboard/` e torná-la a primeira tab, substituindo `(session)` como home. A tela de treino ativo continua existindo mas é acessada via botão CTA no dashboard.

### [ ] 2.1 — Rota e Layout do Dashboard

- [ ] Criar `app/(tabs)/dashboard/_layout.tsx`
- [ ] Criar `app/(tabs)/dashboard/index.tsx` — página principal
- [ ] Atualizar `app/(tabs)/_layout.tsx`: adicionar tab "Dashboard" (ícone: `shieldFill` / `shield`) como primeira tab
- [ ] Renomear label da tab `(session)` para "Quest" ou "Treinar"

---

### [ ] 2.2 — Hero Section (Ficha do Personagem)

Componente no topo do dashboard que exibe o status do herói/personagem do usuário.

- [ ] Criar `components/presentation/rpg/CharacterCard.tsx`
  - Avatar placeholder (ícone de guerreiro ou símbolo de classe)
  - Nome do usuário + Título atual (ex: "Aprendiz de Ferro")
  - Nível atual em destaque com tipografia `PressStart2P`
  - Barra de XP animada (progresso até próximo nível) — usar `react-native-reanimated` (já instalado)
- [ ] Criar `components/presentation/rpg/XpProgressBar.tsx` — barra animada com gradiente dourado/âmbar usando `expo-linear-gradient` (já instalado)

---

### [ ] 2.3 — Cards de Status (Atributos do Personagem)

Grid de cards estilo "ficha de D&D" mostrando métricas da semana/mês.

- [ ] Criar `components/presentation/rpg/StatAttributeCard.tsx`
  - Props: `icon`, `label`, `value`, `subtitle`, `color`
  - Visual: borda angular, fundo escuro, valor em destaque
- [ ] Cards a exibir:
  - **FOR (Força):** peso total levantado esta semana
  - **RES (Resistência):** minutos de treino este mês
  - **VIT (Vitalidade):** streak atual de dias de treino
  - **DES (Destreza):** número de exercícios diferentes realizados
- [ ] Usar `react-native-super-grid` (já instalado) para layout responsivo em grid 2×2

---

### [ ] 2.4 — Quest Ativa (Missão em Andamento)

Painel central do dashboard mostrando a quest semanal atual e progresso.

- [ ] Criar `components/presentation/rpg/ActiveQuestPanel.tsx`
  - Título da quest com ícone de pergaminho
  - Barra de progresso (ex: "2 de 3 treinos concluídos")
  - Recompensa de XP ao completar
  - CTA para iniciar treino vinculado à quest
- [ ] Animar conclusão de quest com confete ou flash de tela (usar `react-native-reanimated`)

---

### [ ] 2.5 — Últimas Conquistas (Achievements Recentes)

Linha horizontal com scroll mostrando os últimos badges desbloqueados.

- [ ] Criar `components/presentation/rpg/AchievementBadge.tsx`
  - Ícone temático (shield, sword, flame, star)
  - Nome da conquista
  - Estado: desbloqueado / bloqueado (grayscale + cadeado)
- [ ] Criar `components/presentation/rpg/AchievementsRow.tsx` — FlatList horizontal
- [ ] Modal de detalhe ao tocar num badge

---

### [ ] 2.6 — Quest Log (Histórico como Missões)

**Decisão arquitetural:** Não criar nova tela. Adaptar `app/(tabs)/history/` para apresentar o histórico com linguagem e visual de RPG, mantendo os dados existentes do `stored-sessions` store.

- [ ] Atualizar `app/(tabs)/history/index.tsx` — adicionar header "Quest Log" com tipografia RPG
- [ ] Criar `components/presentation/rpg/QuestLogItem.tsx` — wrapper visual para `session-summary.tsx` com bordas RPG e ícone de missão
- [ ] Adicionar badge de XP ganho em cada sessão registrada

---

## FASE 3 — Polimento Visual e Animações

### [ ] 3.1 — Animação de Level Up

- [ ] Criar `components/presentation/rpg/LevelUpOverlay.tsx` — overlay full-screen com animação de level up
- [ ] Disparar via Redux action `rpg/leveledUp` ouvida no root layout
- [ ] Sequência: flash de tela → texto "LEVEL UP!" → novo nível → novo título → dismiss

---

### [ ] 3.2 — Efeitos de Conclusão de Treino

- [ ] Ao salvar sessão, exibir tela de resultado estilo RPG: XP ganho, conquistas desbloqueadas, progresso de quest
- [ ] Criar `components/presentation/rpg/SessionRewardScreen.tsx`
- [ ] Integrar com o fluxo existente em `components/smart/session-component.tsx`

---

### [ ] 3.3 — Refinamento de Tipografia

**Decisão arquitetural:** `PressStart2P` é muito grande para textos corridos em mobile — manter apenas em títulos H1/H2 e valores numéricos de destaque. `VT323` é adequado para listas, descrições e labels.

- [ ] Auditar todos os usos de `headlineLarge`, `headlineMedium`, `headlineSmall` no app — verificar se não quebram layout em telas pequenas
- [ ] Criar utilitário `hooks/useRpgFontSize.ts` que ajusta `fontSize` de `PressStart2P` por breakpoint de tela

---

### [ ] 3.4 — Tema Escuro como Padrão

- [ ] Forçar dark mode como padrão para o tema RPG (a paleta dark fantasy não faz sentido em light mode)
- [ ] Adicionar opção "modo clarity" (light mode alternativo) nas Settings
- [ ] Testar acessibilidade de contraste da paleta vermelho/preto em dark mode (WCAG AA)

---

## FASE 4 — Navegação e UX

### [ ] 4.1 — Redesign das Tabs

**Decisão arquitetural:** 5 tabs é o limite razoável para mobile. Ordem proposta:

| Posição | Tab         | Rota          | Ícone RPG sugerido |
|---------|-------------|---------------|--------------------|
| 1       | Dashboard   | `dashboard/`  | `shieldFill`       |
| 2       | Treinar     | `(session)/`  | `fitnessCenterFill`|
| 3       | Quest Log   | `history/`    | `menuBookFill`     |
| 4       | Guilda      | `feed/`       | `groupsFill`       |
| 5       | Herói       | `settings/`   | `personFill`       |

- [ ] Atualizar labels e ícones das tabs em `app/(tabs)/_layout.tsx`
- [ ] Verificar se ícones existem em `@material-symbols-react-native/outlined-400`

---

### [ ] 4.2 — Onboarding RPG

- [ ] Criar wizard de onboarding com narrativa RPG para novos usuários (substituir/estender `welcome-wizard.tsx`)
- [ ] Fluxo: "Escolha sua classe" (Força / Resistência / Equilíbrio) → personaliza plano inicial de treino via IA

---

## Débito Técnico a Resolver

- [ ] **Fontes muito grandes em mobile:** `PressStart2P` em `headlineLarge` (32px) quebra layout em telas < 375px — reduzir ou usar apenas para displays
- [ ] **RpgCard e RpgIcon:** componentes criados no PR #2 precisam ser documentados e integrados consistentemente — atualmente usados apenas em StatsPage
- [ ] **I18n das strings RPG:** "Quest", "XP", "Level Up" precisam ser adicionados ao arquivo de traduções Tolgee para não ficarem hardcoded
- [ ] **Testes:** criar testes unitários para a lógica de cálculo de XP e geração de quests antes de shippar

---

## Referências de Inspiração

- Habitica (gamificação de hábitos)
- Final Fantasy (ficha de personagem, barra de XP)
- Dark Souls (visual dark fantasy, progressão de stats)
- Pokémon GO (conquistas, streaks diários)
