# LiftLog Codebase Analysis

## Overview

**LiftLog** is a cross-platform fitness tracking application for logging weightlifting workouts, tracking progress, and interacting with a privacy-focused social feed. Available on Android, iOS, and web platforms.

### Core Features
- Track gym sessions, exercises, sets, reps, and weights
- Create and manage workout programs with customizable exercise blueprints
- Monitor progress through statistics and graphs
- Publish workouts to an end-to-end encrypted social feed
- Follow other users and discover workouts
- AI-powered workout planning using OpenAI GPT
- Remote backup capabilities
- Multi-language support (10+ languages)

---

## Technology Stack

### Frontend (React Native)
| Category | Technology |
|----------|------------|
| Framework | React Native 0.79.5 with Expo 53.0.20 |
| State Management | Redux Toolkit v2.6.1 |
| Navigation | Expo Router v5.1.4 |
| UI Library | React Native Paper (Material Design 3) |
| Date/Time | @js-joda/core |
| Arithmetic | BigNumber.js (precise decimal calculations) |
| Serialization | Protocol Buffers (protobufjs v7.5.0) |
| Testing | Vitest, Cypress (E2E) |

### Backend (.NET/C#)
| Category | Technology |
|----------|------------|
| Framework | ASP.NET Core 9.0 |
| Database | PostgreSQL with Entity Framework Core |
| Real-time | SignalR for AI chat hub |
| Validation | FluentValidation |
| AI Integration | OpenAI SDK |

---

## Architecture

```
LiftLog-Analysis/
├── app/                          # React Native mobile/web app
│   ├── app/                      # Expo Router screens (tabs-based navigation)
│   │   ├── (tabs)/               # Tab structure (session, history, stats, feed, settings)
│   │   ├── (session)/            # Session-specific navigation
│   │   └── _layout.tsx           # Root layout with providers
│   ├── components/               # Reusable UI components
│   │   ├── layout/               # Layout components
│   │   ├── presentation/         # Presentational components (~40 files)
│   │   └── smart/                # Smart components (Redux-connected)
│   ├── store/                    # Redux Toolkit slices and effects
│   │   ├── settings/             # User preferences, backup, remote sync
│   │   ├── current-session/      # Active workout state
│   │   ├── stored-sessions/      # Completed workouts history
│   │   ├── program/              # Workout programs/blueprints
│   │   ├── ai-planner/           # AI workout generation
│   │   ├── feed/                 # Social feed
│   │   └── stats/                # Statistics and analytics
│   ├── services/                 # Business logic services (~25 files)
│   ├── models/                   # TypeScript data models
│   ├── gen/                      # Generated protobuf code
│   ├── android/                  # Android native code
│   └── ios/                      # iOS native code
│
├── backend/                      # .NET backend services
│   ├── LiftLog.Api/              # Main API project
│   │   ├── Controllers/          # API endpoints (8 controllers)
│   │   ├── Service/              # Business logic services
│   │   ├── Hubs/                 # SignalR hubs
│   │   ├── Models/               # EF Core data models
│   │   └── Db/                   # Database contexts
│   ├── LiftLog.Lib/              # Shared library
│   └── RevenueCat/               # Revenue Cat SDK wrapper
│
├── proto/                        # Protocol Buffer definitions
│   ├── SessionHistoryDao/        # Session history serialization
│   ├── SessionBlueprintDao/      # Workout blueprint schema
│   ├── ProgramBlueprintDao/      # Program schema
│   └── SharedItem.proto          # Feed sharing payload
│
├── site/                         # Marketing website (Bootstrap 5)
│
├── tests/                        # Test suites
│   ├── LiftLog.Tests.Api/        # .NET API tests
│   └── cypress-tests/            # E2E tests
│
└── .github/workflows/            # CI/CD pipelines
```

---

## Key Components

### Frontend Tab Structure
- **Session Tab**: Create, edit, and log current workouts
- **History Tab**: Browse past sessions with filtering
- **Stats Tab**: View progress metrics and charts
- **Feed Tab**: Encrypted social feed (opt-in)
- **Settings Tab**: User preferences, backup, languages

### Backend API Controllers
| Controller | Purpose |
|-----------|---------|
| `UserController` | User creation, authentication, profile management |
| `EventsController` | Workout event publishing (requires auth) |
| `GenerateAiWorkout` | GPT-powered workout plan generation |
| `SharedItemController` | Share programs via encrypted links |
| `InboxController` | Private follow inbox messages |
| `FollowSecretController` | Follow secret management |

### Core Services
- **GptAiWorkoutPlanner**: Uses OpenAI function calling for personalized workout plans
- **PurchaseVerificationService**: Validates in-app purchases (Google Play, App Store, RevenueCat)
- **RateLimitService**: Prevents API abuse
- **EncryptionService**: RSA + AES for E2E encrypted social feeds

---

## Data Models

### Core Domain Models (TypeScript)

```typescript
Session {
  id: string
  blueprint: SessionBlueprint
  recordedExercises: RecordedExercise[]
  date: LocalDate
  bodyweight?: BigNumber
}

SessionBlueprint {
  name: string
  exercises: ExerciseBlueprint[]
  notes: string
}

ExerciseBlueprint {
  name: string
  sets: number
  repsPerSet: number
  weightIncreaseOnSuccess: BigNumber
  restBetweenSets: Rest
  supersetWithNext: boolean
  notes: string
}

ProgramBlueprint {
  name: string
  sessions: SessionBlueprint[]
  lastEdited: LocalDate
}
```

### Feed Models (E2E Encrypted)
```typescript
FeedIdentity {
  id: string
  aesKey: AesKey          // For decrypting received events
  rsaKeyPair: RsaKeyPair
  name?: string
  profilePicture?: Uint8Array
  publishBodyweight: boolean
  publishPlan: boolean
  publishWorkouts: boolean
}
```

---

## Notable Patterns

### Frontend
1. **Redux Effects Pattern**: Side-effect handlers separate from reducers
2. **Service Layer Abstraction**: Business logic in services, not components
3. **Smart/Presentation Separation**: Connected vs pure UI components
4. **Protocol Buffers**: Binary serialization (~80-90% smaller than JSON)
5. **Branded Types**: `_BRAND` property prevents type misuse

### Backend
1. **Layered Architecture**: Controllers → Services → DbContext → Models
2. **Custom Authentication**: `PurchaseTokenAuthenticationHandler` for in-app purchases
3. **FluentValidation**: Declarative validation rules
4. **SignalR for Real-time AI Chat**: Streaming responses from GPT

### Security
1. **End-to-End Encryption**: RSA + AES for feed content
2. **Rate Limiting**: Per-user per-endpoint limits
3. **Password Hashing**: Salted hashing via PasswordService
4. **Purchase Token Auth**: Multiple provider verification

---

## Build & Development

### Frontend
```bash
cd app
npm install
npm run android    # Android
npm run ios        # iOS simulator
npm run web        # Web dev server
npm run proto      # Generate protobuf types
npm test           # Unit tests
```

### Backend
```bash
cd backend/LiftLog.Api
docker compose up -d    # Start PostgreSQL
dotnet run              # Start API server
dotnet test             # Run tests
```

### CI/CD Workflows
- `api-test.yml`: Backend tests with PostgreSQL 17
- `ui-unit-test.yml`: TypeScript linting, type checking, unit tests
- `android-build.yml` / `ios-build.yml`: Mobile builds
- `web-publish.yml`: Web deployment

---

## Testing

### Frontend
- **Unit Tests**: Vitest (`services/*.spec.ts`, `models/*.spec.ts`)
- **E2E Tests**: Cypress (`cypress-tests/cypress/e2e/`)
  - `creating-a-plan.cy.js`
  - `completing-a-session.cy.js`
  - `feed.cy.js`

### Backend
- **Integration Tests**: `AuthenticationIntegrationTests.cs`, `SharedItemIntegrationTests.cs`
- **Unit Tests**: `AppleAppStorePurchaseVerificationServiceTests.cs`

---

## Deployment

| Platform | Package ID | Deployment |
|----------|------------|------------|
| Android | `com.limajuice.liftlog` | Google Play via `android-publish.yml` |
| iOS | `com.limajuice.liftlog` | App Store via `ios-publish.yml` |
| Web | N/A | `https://app.liftlog.online` via `web-publish.yml` |
| API | N/A | `https://api.liftlog.online` (Docker) |

---

## Summary

LiftLog is a well-architected, production-grade fitness application demonstrating:

- **Clean Architecture**: Clear separation of concerns across layers
- **Cross-platform**: Single codebase (React Native) for Android/iOS/Web
- **Security**: E2E encryption, OAuth, secure authentication
- **Performance**: Binary serialization, virtualized lists, Hermes engine
- **Maintainability**: Strong typing (TypeScript, C#), comprehensive testing
- **AI Integration**: GPT-powered workout planning via OpenAI
- **User Privacy**: Opt-in encrypted feeds, local-first data model
