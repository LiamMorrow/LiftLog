# TODO — Gym Life RPG

Decisões arquiteturais e tarefas de desenvolvimento priorizadas.
Foco principal: **Dashboard Gamificado** e **Frontend RPG**.

---

## FASE 1 — Fundação do Sistema RPG

### [x] 1.1 — Sistema de XP e Níveis (State + Lógica)

**Decisão arquitetural:** Criada slice Redux dedicada `store/rpg/` separada do domínio de treino.

- [x] `store/rpg/index.ts` com a slice: `xp`, `level`, `title` (Iniciante → Lenda da Academia), `streakDays`, `totalWorkouts`
- [x] `store/rpg/effects.ts` — ouve `addStoredSession` e calcula XP ganho
- [x] Tabela de XP: nível N requer `(N-1)² × 100` XP (level 2 = 100 XP, level 3 = 400 XP…)
- [x] XP por: séries completadas (+10 XP), cardio completado (+15 XP), bônus de sessão (+50 XP)
- [x] Persistência via `preference-service.ts` / `keyValueStore` sob chave `'RpgState'`

---

### [x] 1.2 — Sistema de Conquistas (Achievements)

- [x] `store/rpg/index.ts` — `ACHIEVEMENTS` array com 9 conquistas + `achievements: Record<string, string>` no state
- [x] Conquistas: Primeira Missão, Consistência, Semana Perfeita, Veterano, Guerreiro, Centurião, Força Bruta, Em Ascensão, Veterano de Ferro
- [x] Verificação automática no `addStoredSession` effect

---

### [x] 1.3 — Missões Semanais / Diárias (Quests)

- [x] `store/rpg/index.ts` — interface `Quest` e `weeklyQuests: Quest[]` no state
- [x] 3 quests por semana geradas por `buildWeeklyQuests()` em `effects.ts`:
  - `workouts_this_week` — treinos esta semana
  - `total_sets_this_week` — séries completadas
  - `streak_days` — streak de dias
- [x] Targets escalados por nível (nível 1-4: básico, 5-9: intermediário, 10+: avançado)
- [x] Progress re-calculado após cada sessão salva

---

## FASE 2 — Dashboard Gamificado (Tela Principal)

**Decisão arquitetural:** Nova rota `app/(tabs)/dashboard/` como primeira tab. Tela de treino continua existindo como tab "Treinar".

### [x] 2.1 — Rota e Layout do Dashboard

- [x] `app/(tabs)/dashboard/_layout.tsx` — usa `<StackWithHeader />`
- [x] `app/(tabs)/dashboard/index.tsx` — página principal do dashboard
- [x] `app/(tabs)/_layout.tsx` — "Dashboard" como primeira tab

---

### [x] 2.2 — Hero Section (Ficha do Personagem)

- [x] `components/presentation/rpg/CharacterCard.tsx`
  - Ícone de escudo + nível em destaque + título (Press Start 2P)
  - Pills de stat: TREINOS, STREAK, CONQUISTAS
- [x] `components/presentation/rpg/XpProgressBar.tsx` — barra animada com gradiente dourado (Reanimated + LinearGradient)

---

### [x] 2.3 — Cards de Status (Atributos do Personagem)

- [x] `components/presentation/rpg/StatAttributeCard.tsx` — card com borda lateral colorida
- [x] Cards exibidos:
  - **FOR (Força):** séries completadas esta semana
  - **RES (Resistência):** minutos de treino este mês
  - **VIT (Vitalidade):** streak atual (do RPG state)
  - **DES (Destreza):** exercícios distintos esta semana
- [x] Grid 2×2 no dashboard

---

### [x] 2.4 — Quest Ativa (Missão em Andamento)

- [x] `components/presentation/rpg/ActiveQuestPanel.tsx`
  - Lista das 3 quests semanais com ProgressBar individual
  - Label de XP reward por quest
  - Check visual para quests concluídas

---

### [x] 2.5 — Últimas Conquistas (Achievements Recentes)

- [x] `components/presentation/rpg/AchievementBadge.tsx`
  - Visual desbloqueado (ícone colorido) / bloqueado (grayscale + cadeado)
  - Modal de detalhe ao tocar
- [x] `components/presentation/rpg/AchievementsRow.tsx` — FlatList horizontal com contador

---

### [x] 2.6 — Quest Log (Histórico como Missões)

- [x] `app/(tabs)/history/index.tsx` — título alterado para "Quest Log"
- [x] `components/presentation/rpg/QuestLogItem.tsx` — wrapper com badge "MISSÃO COMPLETA" e XP ganho calculado por sessão

---

## FASE 3 — Polimento Visual e Animações

### [x] 3.1 — Animação de Level Up

- [x] `components/presentation/rpg/LevelUpOverlay.tsx` — overlay full-screen com animação (Portal + Reanimated)
- [x] Disparado via `state.rpg.pendingLevelUp` observado no root layout
- [x] Auto-dismiss após 3.3s com fade-out animado

---

### [x] 3.2 — Efeitos de Conclusão de Treino

- [x] `components/presentation/rpg/SessionRewardScreen.tsx` — tela de recompensa pós-sessão (Portal)
- [x] Exibe XP ganho + conquistas desbloqueadas naquela sessão
- [x] Integrado via `state.rpg.lastSessionReward` no root layout

---

### [x] 3.3 — Refinamento de Tipografia

- [x] `hooks/useRpgFontSize.ts` — hook que ajusta `fontSize` de PressStart2P por breakpoint de tela

> **Pendente:** Auditoria de todos os usos de `headlineLarge` etc. para verificar quebra em telas < 375px

---

### [ ] 3.4 — Tema Escuro como Padrão

- [ ] Forçar dark mode como padrão para o tema RPG
- [ ] Adicionar opção "modo clarity" (light mode alternativo) nas Settings
- [ ] Testar acessibilidade WCAG AA da paleta vermelho/preto

> **Nota arquitetural:** requer nova preference em `settingsSlice` + override do `colorScheme` em `useAppTheme.tsx`. Não causa regressão se o usuário não alterou o tema.

---

## FASE 4 — Navegação e UX

### [x] 4.1 — Redesign das Tabs

| Posição | Tab         | Rota          | Ícone RPG              |
|---------|-------------|---------------|------------------------|
| 1       | Dashboard   | `dashboard/`  | `shield` / `shieldFill`|
| 2       | Treinar     | `(session)/`  | `fitnessCenter` + Fill |
| 3       | Quest Log   | `history/`    | `menuBook` + Fill      |
| 4       | Guilda      | `feed/`       | `groups` + Fill        |
| 5       | Stats       | `stats/`      | `analytics` + Fill     |
| 6       | Herói       | `settings/`   | `person` + Fill        |

- [x] Tabs atualizadas em `app/(tabs)/_layout.tsx`
- [x] Novos ícones registrados em `ms-icon-source.tsx` (shield, menuBook, groups, localFireDepartment, checkCircle, lock, militaryTech, workspacePremium, trendingUp, diamond)

---

### [ ] 4.2 — Onboarding RPG

- [ ] Wizard de onboarding com narrativa RPG (substituir/estender `welcome-wizard.tsx`)
- [ ] Fluxo: "Escolha sua classe" (Força / Resistência / Equilíbrio) → personaliza plano inicial via IA

> **Nota:** Requer novas páginas e integração com o AI planner. Escopo maior — fase futura.

---

## Débito Técnico a Resolver

- [ ] **Fontes grandes em mobile:** `PressStart2P` em `headlineLarge` (32px) pode quebrar em telas < 375px — auditar e usar `useRpgFontSize` onde necessário
- [ ] **i18n das strings RPG:** "Quest", "XP", "Level Up", "MISSÃO COMPLETA" estão hardcoded — adicionar ao Tolgee
- [ ] **Testes unitários:** criar testes para `xpForLevel`, `levelFromXp`, `titleForLevel`, `xpProgress`, cálculo de streak em `store/rpg/index.ts`
- [ ] **Tema escuro forçado:** ver item 3.4 acima
- [ ] **Onboarding RPG:** ver item 4.2 acima

---

## Referências de Inspiração

- Habitica (gamificação de hábitos)
- Final Fantasy (ficha de personagem, barra de XP)
- Dark Souls (visual dark fantasy, progressão de stats)
- Pokémon GO (conquistas, streaks diários)
