# Gym Life RPG — CLAUDE.md

## Sobre o Projeto

**Gym Life RPG** é um fork gamificado do [LiftLog](https://github.com/LiamMorrow/LiftLog), um aplicativo open-source de rastreamento de treinos na academia. A ideia central é transformar cada sessão de treino numa **jornada de RPG**: o usuário não apenas registra séries e pesos — ele ganha XP, sobe de nível, completa missões e evolui um personagem à medida que se torna mais forte de verdade.

---

## Repositório Oficial (Upstream)

| Campo        | Valor                                          |
|--------------|------------------------------------------------|
| Repositório  | https://github.com/LiamMorrow/LiftLog          |
| Autor        | Liam Morrow                                    |
| Licença      | MIT                                            |
| Stack        | React Native + Expo + Redux Toolkit + .NET API |
| Design       | Material Design 3 via React Native Paper       |
| Plataformas  | Android, iOS, Web                              |

### Funcionalidades herdadas do LiftLog

- Rastreamento de treinos (séries, repetições, peso, cardio)
- Planejador de treinos com IA (OpenAI integration)
- Feed social com criptografia ponta-a-ponta (opt-in)
- Histórico de sessões e estatísticas com gráficos
- Internacionalização em 10+ idiomas via Tolgee/Weblate
- Backup remoto e exportação de dados (CSV, JSON, plaintext)
- Progressive overload automático

---

## Nosso Fork

| Campo        | Valor                                                      |
|--------------|------------------------------------------------------------|
| Repositório  | https://github.com/Thedocwhocode/Gym-life-rpg              |
| Branch ativa | `claude/setup-docs-and-tasks-wDjD8`                        |
| Autor        | Thedocwhocode (luizrodolfocc@gmail.com)                    |
| Objetivo     | Transformar o LiftLog num app gamificado de academia + RPG |

### O que já foi feito no fork

#### PR #1 — RPG Typography
- Adicionadas as fontes `Press Start 2P` (títulos/headlines, estilo pixel art retro) e `VT323` (corpo de texto, estilo terminal)
- Configurado `fontConfig` completo no `useAppTheme.tsx` para todos os tokens MD3 (`displayLarge` → `bodySmall`)

#### PR #2 — RPG Theme Overhaul
- Paleta de cores alterada para preto/vermelho/cinza (tom dark fantasy)
- Adicionados componentes `RpgCard` e `RpgIcon` (blocos estilo dashboard com visual de RPG)
- Atualizado `StatsPage` e cards de gráfico para usar os novos componentes RPG
- Fixado crash do `I18nManager` no web no root layout

---

## Visão de UI/UX — Academia como Jornada de RPG

O objetivo não é um skin superficial: é repensar cada tela como um elemento narrativo de um jogo de RPG.

### Princípios de Design

| Princípio               | Aplicação prática                                                               |
|-------------------------|---------------------------------------------------------------------------------|
| **Progressão visível**  | Barra de XP sempre presente, nível do personagem em destaque                   |
| **Recompensa imediata** | Animação de level-up ao completar treino, badge de conquista ao bater PR        |
| **Narrativa de jornada**| Histórico de treinos como "log de missões", não como tabela de dados            |
| **Dark fantasy**        | Paleta escura, bordas angulares, tipografia pixel art, ícones temáticos         |
| **Legibilidade RPG**    | VT323 para texto corrido (leitura fluida com estética retro), Press Start 2P para títulos impactantes |

### Mapeamento Academia → RPG

| Academia (LiftLog original) | RPG (Gym Life RPG)                    |
|-----------------------------|---------------------------------------|
| Sessão de treino            | Missão / Quest                        |
| Exercício concluído         | Habilidade usada                      |
| Série/repetição             | Ataque ou ação de combate             |
| Peso levantado              | Poder do personagem                   |
| Histórico de treinos        | Livro de Missões (Quest Log)          |
| Estatísticas                | Ficha de personagem (Character Sheet) |
| Progressão de carga         | Level up de atributo                  |
| Feed social                 | Guilda / Party                        |
| Settings                    | Taverna / Menu do herói               |
| Streak de treinos           | Combo / Streak de batalhas            |

---

## Estrutura do Projeto

```
Gym-life-rpg/
├── app/                        # Frontend React Native (Expo)
│   ├── app/(tabs)/             # Rotas de navegação por abas
│   │   ├── (session)/          # Tela de treino ativo
│   │   ├── feed/               # Feed social (Guilda)
│   │   ├── stats/              # Estatísticas (Ficha de personagem)
│   │   ├── history/            # Histórico (Quest Log)
│   │   └── settings/           # Configurações (Taverna)
│   ├── components/
│   │   ├── layout/             # Componentes estruturais
│   │   ├── presentation/       # Componentes visuais (dumb)
│   │   └── smart/              # Componentes conectados ao store
│   ├── hooks/
│   │   └── useAppTheme.tsx     # Tema RPG (fontes + cores + tokens)
│   ├── store/                  # Redux Toolkit (state global)
│   └── services/               # APIs, serviços externos
├── backend/                    # .NET WebAPI (feeds, IA, criptografia)
├── proto/                      # Protobuf schemas
├── docs/                       # Documentação técnica
└── site/                       # Site liftlog.online
```

---

## Tech Stack

| Camada          | Tecnologia                                         |
|-----------------|---------------------------------------------------|
| Framework       | React Native 0.81 + Expo 54                       |
| Navegação       | Expo Router (file-based)                          |
| Estado          | Redux Toolkit + react-redux                       |
| UI Base         | React Native Paper (MD3) + Material3 Theme        |
| Tipografia RPG  | Press Start 2P (títulos) + VT323 (corpo)          |
| Gráficos        | react-native-gifted-charts + @shopify/react-native-skia |
| Backend         | .NET 9 WebAPI                                     |
| IA              | OpenAI (planejador de treinos)                    |
| Pagamentos      | RevenueCat                                        |
| i18n            | Tolgee                                            |
| Testes          | Vitest                                            |

---

## Comandos de Desenvolvimento

```bash
cd app
npm install

npm run android   # Android
npm run ios       # iOS (macOS)
npm run web       # Web

npm test          # Rodar testes
npm run typecheck # Checar tipos TypeScript
npm run lint      # ESLint
```

---

## Branch de Trabalho

Sempre desenvolver na branch: `claude/setup-docs-and-tasks-wDjD8`

```bash
git checkout claude/setup-docs-and-tasks-wDjD8
git push -u origin claude/setup-docs-and-tasks-wDjD8
```
