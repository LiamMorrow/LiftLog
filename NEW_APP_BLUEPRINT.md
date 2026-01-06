# FitForge - New Workout App Blueprint

## Overview

**FitForge** (working name) is a modern, AI-powered workout tracking app that allows users to:
- Import workout programs from PDFs or text
- Track their gym sessions with intelligent progression
- Get AI-powered workout recommendations
- Monitor progress with detailed statistics

---

## Part 1: User Workflow

### 1.1 First-Time User Journey

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           ONBOARDING FLOW                                    │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐              │
│  │ Welcome  │───▶│ Profile  │───▶│ Goals    │───▶│ First    │              │
│  │ Screen   │    │ Setup    │    │ Selection│    │ Workout  │              │
│  └──────────┘    └──────────┘    └──────────┘    └──────────┘              │
│                                                                              │
│  "Let's build    Name, weight,   Strength,       3 OPTIONS:                 │
│   your perfect   experience      muscle gain,    • Import PDF/Text          │
│   workout"       level           fat loss, etc.  • AI Generate Plan         │
│                                                  • Start from Template      │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 1.2 Core User Workflows

#### Workflow A: Import Workout from PDF/Text

```
User has a workout PDF (e.g., from a coach, fitness influencer, or program they purchased)

┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Select    │     │   Upload    │     │  AI Parses  │     │   Review    │
│   Import    │────▶│   PDF or    │────▶│  & Extracts │────▶│   & Edit    │
│   Option    │     │   Paste Text│     │   Workouts  │     │   Program   │
└─────────────┘     └─────────────┘     └─────────────┘     └─────────────┘
                                                                   │
                                                                   ▼
                                                            ┌─────────────┐
                                                            │   Save &    │
                                                            │   Start     │
                                                            │   Training  │
                                                            └─────────────┘
```

#### Workflow B: AI-Generated Workout Plan

```
User wants AI to create a personalized workout plan

┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Select    │     │   Answer    │     │  AI Creates │     │   Review    │
│   AI Plan   │────▶│   Questions │────▶│  Custom     │────▶│   & Tweak   │
│   Option    │     │   (Chat UI) │     │   Program   │     │   Program   │
└─────────────┘     └─────────────┘     └─────────────┘     └─────────────┘
                          │
                          ▼
                    • Available days
                    • Equipment access
                    • Experience level
                    • Injury history
                    • Time per session
```

#### Workflow C: Daily Workout Session

```
User opens app to work out

┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Today's   │     │   Active    │     │   Log Each  │     │   Session   │
│   Workout   │────▶│   Exercise  │────▶│   Set       │────▶│   Complete  │
│   Preview   │     │   View      │     │   (reps/wt) │     │   Summary   │
└─────────────┘     └─────────────┘     └─────────────┘     └─────────────┘
      │                   │                   │                    │
      ▼                   ▼                   ▼                    ▼
 See exercises      Rest timer          Quick +/- for        Stats, PRs,
 for today,         between sets,       weight & reps,       next workout
 swap if needed     notes per set       skip/fail options    suggestion
```

### 1.3 App Navigation Structure

```
┌─────────────────────────────────────────────────────────────────┐
│                         BOTTOM TAB BAR                          │
├───────────────┬───────────────┬───────────────┬────────────────┤
│    TODAY      │    HISTORY    │     STATS     │    SETTINGS    │
│   (Home)      │   (Calendar)  │   (Charts)    │    (Gear)      │
├───────────────┼───────────────┼───────────────┼────────────────┤
│               │               │               │                │
│ • Current     │ • Past        │ • Progress    │ • Profile      │
│   workout     │   sessions    │   graphs      │ • Programs     │
│ • Quick       │ • Calendar    │ • Personal    │ • Import       │
│   start       │   view        │   records     │ • AI Settings  │
│ • Rest timer  │ • Session     │ • Volume      │ • Backup       │
│               │   details     │   tracking    │ • Subscription │
│               │               │               │                │
└───────────────┴───────────────┴───────────────┴────────────────┘
```

---

## Part 2: AI Integration Points

### 2.1 AI Feature Matrix

| Feature | AI Model | Input | Output | When Used |
|---------|----------|-------|--------|-----------|
| **Workout Import** | GPT-4o | PDF text / raw text | Structured workout JSON | User imports external program |
| **Plan Generation** | GPT-4o | User profile + chat | Complete workout program | User requests AI plan |
| **Exercise Substitution** | GPT-4o | Exercise + constraints | Alternative exercises | User can't do an exercise |
| **Form Tips** | GPT-4o | Exercise name | Technique cues | User taps "How to" |
| **Progress Analysis** | GPT-4o | Historical data | Insights & suggestions | Weekly summary |

### 2.2 AI Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              MOBILE APP                                      │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                         AI Service Layer                             │   │
│  │  ┌───────────────┐  ┌───────────────┐  ┌───────────────┐           │   │
│  │  │ Import        │  │ Chat          │  │ Analysis      │           │   │
│  │  │ Service       │  │ Service       │  │ Service       │           │   │
│  │  └───────┬───────┘  └───────┬───────┘  └───────┬───────┘           │   │
│  └──────────┼──────────────────┼──────────────────┼─────────────────────┘   │
└─────────────┼──────────────────┼──────────────────┼─────────────────────────┘
              │                  │                  │
              ▼                  ▼                  ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                              BACKEND API                                     │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                      AI Orchestration Layer                          │   │
│  │                                                                      │   │
│  │  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐             │   │
│  │  │ PDF Parser  │    │ Prompt      │    │ Response    │             │   │
│  │  │ (PdfPig)    │    │ Templates   │    │ Validator   │             │   │
│  │  └─────────────┘    └─────────────┘    └─────────────┘             │   │
│  │                            │                                        │   │
│  │                            ▼                                        │   │
│  │                     ┌─────────────┐                                 │   │
│  │                     │   OpenAI    │                                 │   │
│  │                     │   GPT-4o    │                                 │   │
│  │                     └─────────────┘                                 │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 2.3 Detailed AI Workflows

#### Workflow: PDF/Text Import

```
INPUT                           PROCESSING                        OUTPUT
─────                           ──────────                        ──────

┌──────────────┐               ┌──────────────┐               ┌──────────────┐
│ User uploads │               │ Extract text │               │ Structured   │
│ PDF file     │──────────────▶│ from PDF     │               │ Program:     │
└──────────────┘               └──────┬───────┘               │              │
                                      │                        │ • Name       │
       OR                             │                        │ • Sessions[] │
                                      │                        │   • Name     │
┌──────────────┐                      │                        │   • Exercise │
│ User pastes  │──────────────────────┤                        │     • Sets   │
│ text         │                      │                        │     • Reps   │
└──────────────┘                      │                        │     • Rest   │
                                      ▼                        │     • Notes  │
                               ┌──────────────┐               └──────────────┘
                               │ GPT-4o with  │                      ▲
                               │ structured   │──────────────────────┘
                               │ output JSON  │
                               └──────────────┘

GPT System Prompt:
"You are a workout program parser. Extract structured workout data from
the provided text. Identify workout days/sessions, exercises, sets, reps,
rest periods, and any notes. Standardize exercise names. Handle common
abbreviations (BB=Barbell, DB=Dumbbell, etc.). Return valid JSON matching
the provided schema."
```

#### Workflow: AI Chat for Plan Generation

```
USER                            AI AGENT                         SYSTEM
────                            ────────                         ──────

"I want to build                    │
 muscle, 4 days/week"               │
        │                           │
        ▼                           ▼
┌──────────────┐            ┌──────────────┐            ┌──────────────┐
│ User Message │───────────▶│ Context      │───────────▶│ GPT-4o       │
└──────────────┘            │ Enrichment   │            │ + Functions  │
                            │ (user profile│            └──────┬───────┘
        ▲                   │  + history)  │                   │
        │                   └──────────────┘                   │
        │                                                      ▼
┌──────────────┐                                       ┌──────────────┐
│ Follow-up    │◀──────────────────────────────────────│ "What equip- │
│ Answers      │                                       │  ment do you │
└──────────────┘                                       │  have access │
                                                       │  to?"        │
        │                                              └──────────────┘
        │              ... conversation continues ...
        ▼
┌──────────────┐            ┌──────────────┐
│ "Generate    │───────────▶│ GPT calls    │──────────▶ Program JSON
│  my plan"    │            │ createPlan() │            returned to app
└──────────────┘            │ function     │
                            └──────────────┘
```

### 2.4 AI Cost Management

| Feature | Estimated Tokens | Cost per Use (GPT-4o) |
|---------|------------------|----------------------|
| PDF Import (avg 3 pages) | ~2,000 input + 500 output | ~$0.015 |
| Plan Generation Chat (5 turns) | ~3,000 input + 1,000 output | ~$0.025 |
| Exercise Substitution | ~500 input + 200 output | ~$0.004 |

**Strategy:** Include AI features in Pro tier to offset costs.

---

## Part 3: Technical Architecture (Inspired by LiftLog)

### 3.1 What We Learn from LiftLog (Patterns, Not Code)

| LiftLog Pattern | Our Implementation | Why It Works |
|-----------------|-------------------|--------------|
| **Immutable data models** with POJO conversion | Create typed models with serialization helpers | Prevents state bugs, enables easy persistence |
| **Redux Toolkit** with effects pattern | Same - RTK with listener middleware | Clean separation of state and side effects |
| **Protocol Buffers** for compact storage | Consider Protobuf or just JSON with compression | Efficient storage for workout history |
| **Service layer abstraction** | Create services for API, storage, AI | Testable, swappable implementations |
| **Smart/Presentation component split** | Adopt same pattern | Reusable UI, easier testing |
| **Material Design 3 theming** | Use but heavily customize | Modern look with customization |

### 3.2 Our Tech Stack

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              MOBILE APP                                      │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  Framework:        React Native + Expo (SDK 53+)                            │
│  Navigation:       Expo Router (file-based routing)                         │
│  State:            Redux Toolkit + RTK Query                                │
│  UI Library:       React Native Paper (MD3) + Custom components             │
│  Styling:          Styled Components or Tamagui (for better theming)        │
│  Storage:          expo-sqlite + expo-secure-store                          │
│  Charts:           Victory Native or react-native-gifted-charts             │
│  Animations:       React Native Reanimated 3                                │
│  Forms:            React Hook Form + Zod validation                         │
│                                                                              │
├─────────────────────────────────────────────────────────────────────────────┤
│                              BACKEND API                                     │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  OPTION A: Node.js/TypeScript                                               │
│  ─────────────────────────────                                              │
│  Framework:        Fastify or Express                                       │
│  Database:         PostgreSQL + Prisma ORM                                  │
│  Auth:             Clerk or Supabase Auth                                   │
│  AI:               OpenAI SDK                                               │
│  PDF Parsing:      pdf-parse or pdf.js                                      │
│  Hosting:          Railway, Render, or Vercel                               │
│                                                                              │
│  OPTION B: Serverless                                                       │
│  ─────────────────────                                                      │
│  Platform:         Supabase (Postgres + Auth + Edge Functions)              │
│  AI:               OpenAI via Edge Functions                                │
│  PDF:              Client-side extraction + server AI parsing               │
│                                                                              │
│  OPTION C: Backend-as-a-Service                                             │
│  ───────────────────────────────                                            │
│  Platform:         Firebase + Cloud Functions                               │
│  Database:         Firestore                                                │
│  Auth:             Firebase Auth                                            │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 3.3 Data Models

```typescript
// ============================================
// CORE DOMAIN MODELS
// ============================================

// Program = Collection of workout sessions
interface Program {
  id: string;
  name: string;
  description?: string;
  sessions: Session[];
  createdAt: Date;
  updatedAt: Date;
  source: 'ai_generated' | 'imported' | 'manual' | 'template';
}

// Session = A single workout day (e.g., "Push Day", "Day 1")
interface Session {
  id: string;
  name: string;
  exercises: Exercise[];
  notes?: string;
  estimatedDuration?: number; // minutes
}

// Exercise = Definition of an exercise in a session
interface Exercise {
  id: string;
  name: string;
  sets: number;
  repsMin: number;
  repsMax: number;          // Support rep ranges (8-12)
  restSeconds: number;
  notes?: string;
  videoUrl?: string;        // Link to demo video
  muscleGroups: MuscleGroup[];
}

// WorkoutLog = A completed workout instance
interface WorkoutLog {
  id: string;
  sessionId: string;
  programId: string;
  date: Date;
  duration: number;         // actual time in minutes
  exercises: ExerciseLog[];
  notes?: string;
  rating?: 1 | 2 | 3 | 4 | 5;  // How did it feel?
  bodyweight?: number;
}

// ExerciseLog = What the user actually did
interface ExerciseLog {
  exerciseId: string;
  exerciseName: string;     // Denormalized for history
  sets: SetLog[];
}

// SetLog = A single set performed
interface SetLog {
  setNumber: number;
  weight: number;
  weightUnit: 'kg' | 'lbs';
  reps: number;
  rpe?: number;             // Rate of Perceived Exertion (1-10)
  isWarmup: boolean;
  isDropset: boolean;
  completedAt: Date;
}

// ============================================
// USER & SETTINGS
// ============================================

interface UserProfile {
  id: string;
  email: string;
  name?: string;

  // Fitness profile
  experienceLevel: 'beginner' | 'intermediate' | 'advanced';
  primaryGoal: 'strength' | 'muscle' | 'endurance' | 'weight_loss';
  bodyweight?: number;
  weightUnit: 'kg' | 'lbs';

  // Preferences
  restTimerEnabled: boolean;
  defaultRestSeconds: number;
  notifications: NotificationPreferences;

  // Subscription
  subscriptionTier: 'free' | 'pro';
  subscriptionExpiresAt?: Date;
}

// ============================================
// AI-SPECIFIC MODELS
// ============================================

// Request to import a workout
interface ImportRequest {
  type: 'pdf' | 'text';
  content: string;          // Base64 for PDF, raw text otherwise
  programName?: string;
}

// AI-parsed workout (before user confirmation)
interface ParsedProgram {
  program: Program;
  confidence: number;       // 0-1 how confident AI is
  warnings: string[];       // Things AI wasn't sure about
  originalText: string;     // For reference
}

// AI chat message
interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  attachedProgram?: Program; // If AI generated a plan
}
```

### 3.4 API Endpoints

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              API ENDPOINTS                                   │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  AUTH                                                                        │
│  ────                                                                        │
│  POST   /auth/register          Create account                              │
│  POST   /auth/login             Login                                       │
│  POST   /auth/refresh           Refresh token                               │
│                                                                              │
│  USER                                                                        │
│  ────                                                                        │
│  GET    /user/profile           Get user profile                            │
│  PATCH  /user/profile           Update profile                              │
│  GET    /user/subscription      Get subscription status                     │
│                                                                              │
│  PROGRAMS                                                                    │
│  ────────                                                                    │
│  GET    /programs               List user's programs                        │
│  POST   /programs               Create program                              │
│  GET    /programs/:id           Get program details                         │
│  PATCH  /programs/:id           Update program                              │
│  DELETE /programs/:id           Delete program                              │
│                                                                              │
│  WORKOUTS                                                                    │
│  ────────                                                                    │
│  GET    /workouts               List workout logs                           │
│  POST   /workouts               Save completed workout                      │
│  GET    /workouts/:id           Get workout details                         │
│                                                                              │
│  AI (Pro Feature)                                                            │
│  ──                                                                          │
│  POST   /ai/import              Parse PDF/text to program                   │
│  POST   /ai/chat                Send message, get response                  │
│  POST   /ai/substitute          Get exercise alternatives                   │
│                                                                              │
│  STATS                                                                       │
│  ─────                                                                       │
│  GET    /stats/progress         Progress over time                          │
│  GET    /stats/records          Personal records                            │
│  GET    /stats/volume           Training volume                             │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 3.5 Project Structure

```
fitforge/
├── apps/
│   ├── mobile/                      # React Native app
│   │   ├── app/                     # Expo Router screens
│   │   │   ├── (tabs)/
│   │   │   │   ├── index.tsx        # Today tab
│   │   │   │   ├── history.tsx      # History tab
│   │   │   │   ├── stats.tsx        # Stats tab
│   │   │   │   └── settings/        # Settings stack
│   │   │   ├── onboarding/          # Onboarding flow
│   │   │   ├── workout/             # Active workout screens
│   │   │   └── _layout.tsx          # Root layout
│   │   │
│   │   ├── components/
│   │   │   ├── ui/                  # Base UI components
│   │   │   │   ├── Button.tsx
│   │   │   │   ├── Card.tsx
│   │   │   │   ├── Input.tsx
│   │   │   │   └── ...
│   │   │   ├── workout/             # Workout-specific components
│   │   │   │   ├── ExerciseCard.tsx
│   │   │   │   ├── SetRow.tsx
│   │   │   │   ├── RestTimer.tsx
│   │   │   │   └── ...
│   │   │   ├── stats/               # Statistics components
│   │   │   │   ├── ProgressChart.tsx
│   │   │   │   ├── RecordCard.tsx
│   │   │   │   └── ...
│   │   │   └── ai/                  # AI-related components
│   │   │       ├── ChatBubble.tsx
│   │   │       ├── ImportPreview.tsx
│   │   │       └── ...
│   │   │
│   │   ├── features/                # Feature-based modules
│   │   │   ├── auth/
│   │   │   │   ├── authSlice.ts
│   │   │   │   └── authApi.ts
│   │   │   ├── programs/
│   │   │   │   ├── programSlice.ts
│   │   │   │   └── programApi.ts
│   │   │   ├── workouts/
│   │   │   │   ├── workoutSlice.ts
│   │   │   │   └── workoutApi.ts
│   │   │   └── ai/
│   │   │       ├── aiSlice.ts
│   │   │       └── aiApi.ts
│   │   │
│   │   ├── services/                # Business logic
│   │   │   ├── storage.ts           # Local storage
│   │   │   ├── notifications.ts     # Push notifications
│   │   │   └── analytics.ts         # Usage tracking
│   │   │
│   │   ├── hooks/                   # Custom React hooks
│   │   │   ├── useTimer.ts
│   │   │   ├── useWorkout.ts
│   │   │   └── useTheme.ts
│   │   │
│   │   ├── utils/                   # Utility functions
│   │   ├── types/                   # TypeScript types
│   │   ├── constants/               # App constants
│   │   └── theme/                   # Theme configuration
│   │
│   └── api/                         # Backend API
│       ├── src/
│       │   ├── routes/              # API routes
│       │   │   ├── auth.ts
│       │   │   ├── programs.ts
│       │   │   ├── workouts.ts
│       │   │   └── ai.ts
│       │   ├── services/            # Business logic
│       │   │   ├── ai/
│       │   │   │   ├── openai.ts
│       │   │   │   ├── pdfParser.ts
│       │   │   │   └── prompts.ts
│       │   │   ├── auth.ts
│       │   │   └── subscription.ts
│       │   ├── db/                  # Database
│       │   │   ├── schema.prisma
│       │   │   └── migrations/
│       │   ├── middleware/          # Express/Fastify middleware
│       │   └── utils/               # Utilities
│       │
│       └── package.json
│
├── packages/                        # Shared code
│   └── shared/
│       ├── types/                   # Shared TypeScript types
│       └── utils/                   # Shared utilities
│
├── package.json                     # Root package.json (monorepo)
├── turbo.json                       # Turborepo config (if using)
└── README.md
```

---

## Part 4: Monetization Strategy

### 4.1 Pricing Tiers

| Feature | Free | Pro ($5.99/mo or $49.99/yr) |
|---------|------|----------------------------|
| Manual workout tracking | ✅ | ✅ |
| 1 active program | ✅ | ✅ |
| Basic statistics | ✅ | ✅ |
| Template workouts | 3 | Unlimited |
| **AI Workout Import** | ❌ | ✅ |
| **AI Plan Generation** | ❌ | ✅ |
| **AI Exercise Suggestions** | ❌ | ✅ |
| Unlimited programs | ❌ | ✅ |
| Cloud backup | ❌ | ✅ |
| Advanced analytics | ❌ | ✅ |
| Export data | ❌ | ✅ |

### 4.2 Implementation

- **RevenueCat** for subscription management (handles iOS/Android/Web)
- **Free trial**: 7-day Pro trial for new users
- **Paywall**: Show when user tries Pro feature

---

## Part 5: Development Phases

### Phase 1: Foundation (Weeks 1-3)
- [ ] Set up monorepo structure
- [ ] Create React Native app scaffold with Expo
- [ ] Set up backend API (choose Option A, B, or C)
- [ ] Implement authentication
- [ ] Design and implement base UI components
- [ ] Set up database schema

### Phase 2: Core Workout Features (Weeks 4-6)
- [ ] Program CRUD (create, read, update, delete)
- [ ] Session/Exercise management
- [ ] Active workout tracking screen
- [ ] Rest timer
- [ ] Workout logging and history

### Phase 3: AI Integration (Weeks 7-9)
- [ ] Backend: OpenAI integration
- [ ] Backend: PDF text extraction
- [ ] AI Import feature (PDF/text → program)
- [ ] AI Chat for plan generation
- [ ] Exercise substitution

### Phase 4: Statistics & Polish (Weeks 10-11)
- [ ] Progress charts
- [ ] Personal records tracking
- [ ] Volume analytics
- [ ] Onboarding flow
- [ ] UI animations and polish

### Phase 5: Monetization & Launch (Week 12+)
- [ ] RevenueCat integration
- [ ] Paywall implementation
- [ ] App Store assets (screenshots, description)
- [ ] Beta testing
- [ ] Launch!

---

## Part 6: Next Steps

1. **Create GitHub repository** with the structure outlined above
2. **Choose backend approach** (Node.js vs Supabase vs Firebase)
3. **Set up development environment**:
   ```bash
   npx create-expo-app@latest fitforge-mobile --template tabs
   ```
4. **Begin Phase 1 implementation**

---

## Appendix: Key Decisions to Make

| Decision | Options | Recommendation |
|----------|---------|----------------|
| **Monorepo tool** | Turborepo, Nx, or none | Turborepo (simple, fast) |
| **Backend** | Node.js, Supabase, Firebase | Supabase (fastest to start) |
| **UI Library** | React Native Paper, Tamagui, Gluestack | Paper (mature, MD3 support) |
| **State Management** | Redux Toolkit, Zustand, Jotai | RTK (scalable, good tooling) |
| **App Name** | FitForge, LiftTrack, GymBuddy, etc. | TBD - check trademark availability |
