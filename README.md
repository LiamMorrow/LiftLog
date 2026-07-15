# LiftLog

<p align="center">
  <img width="250" src="./assets/AppScreens-LiftLog-1782275372989.render/apple/English (en-US)/iPhones  6.9/01.png" alt="App home page screenshot">
  <img width="250" src="./assets/AppScreens-LiftLog-1782275372989.render/apple/English (en-US)/iPhones  6.9/02.png" alt="Workout page screenshot">
  <img width="250" src="./assets/AppScreens-LiftLog-1782275372989.render/apple/English (en-US)/iPhones  6.9/03.png" alt="Stats page screenshot">
</p>

<p align="center">
  <a href='https://play.google.com/store/apps/details?id=com.limajuice.liftlog&pcampaignid=pcampaignidMKT-Other-global-all-co-prtnr-py-PartBadge-Mar2515-1'><img alt='Get it on Google Play' style="height: 50px;" src='./assets/google-play-badge.png'/></a>
  <a href="https://apps.apple.com/au/app/liftlog/id6467372581?itsct=apps_box_badge&amp;itscg=30200"><img src="https://tools.applemediaservices.com/api/badges/download-on-the-app-store/black/en-us?size=250x83&amp;releaseDate=1696550400" alt="Download on the App Store" style="border-radius: 13px; width: 250px; height: 50px"></a>
  <a href="https://apps.obtainium.imranr.dev/redirect?r=obtainium://app/{%22id%22:%22com.limajuice.liftlog%22,%22url%22:%22https://github.com/LiamMorrow/LiftLog%22,%22author%22:%22LiamMorrow%22,%22name%22:%22LiftLog%22}"><img alt="Get it on Obtainium" style="height: 50px;" src="./site/assets/img/badge_obtainium.png"/></a>
</p>

---

## 🚀 Overview

**LiftLog** is an intuitive, cross-platform gym weight tracking app built with React Native and Expo. It features Material Design 3, AI-powered workout planning, and secure, end-to-end encrypted social feeds. Available on Android and iOS.

### Key Features

- 🗿 Intuitive UI which lets you log your progression, without getting in your way
- Entirely device local workouts, no waiting for sign in or downloads
- 📱 Runs on Android and iOS. Web support was removed in [this commit](https://github.com/LiamMorrow/LiftLog/commit/d77d94e5eeffd3a9a81af6f61f47e9c57fb91738)
- 🔒 End-to-end encrypted social feeds (opt-in, privacy-first)
- 🎨 Material Design 3 via React Native Paper
- 🌐 Internationalization with Tolgee/Weblate (10+ languages)
- 🏋️‍♂️ Publish workouts, follow other users, and control your feed privacy
- 🧠 AI planner tailors gym plans to your goals and body
- ⚡ Fast, modern UI with Expo Router and Redux Toolkit

---

## 🌍 Translations

LiftLog uses [Weblate](https://translate.liftlog.online/) for internationalization and translation management. Anyone can create an account and start translating!

[![Translation status](https://translate.liftlog.online/widget/liftlog/multi-auto.svg)](https://translate.liftlog.online/engage/liftlog/)

Want to help translate? [Create an account on Weblate!](https://translate.liftlog.online/)

---

## ⚡ Quickstart

### Prerequisites

1. **Node.js** (v18+): [Download here](https://nodejs.org/)
2. **Expo CLI**: `npm install -g expo-cli` ([Guide](https://docs.expo.dev/get-started/set-up-your-environment/))
3. **Android Studio** (for Android) ([Setup](https://reactnative.dev/docs/environment-setup))
4. **Xcode** (for iOS, macOS only) ([Setup](https://reactnative.dev/docs/environment-setup?os=macos&platform=ios))

### Run the App

```bash
cd app
npm install
npm run android   # For Android
npm run ios       # For iOS (macOS only)
```

### Run the Backend API

See [`backend/README.md`](./backend/README.md) for more information on running the backend.

---

## 🗂️ Project Structure

LiftLog is organized into several projects:

### Frontend ([app/](./app/))

- **Main React Native app** (Expo)
- **Components**: `components/` (layout, presentation, smart)
- **State**: `store/` (Redux Toolkit)
- **Services**: `services/` (API, business logic)
- **Hooks**: `hooks/` (custom React hooks)
- **Translations**: `i18n/` (Tolgee)
- **Navigation**: Expo Router

### Backend ([LiftLog.Api/](./backend/))

For documentation on running the backend for local development, see [the README](./backend/README.md)

- **Dotnet WebAPI** for feeds, AI plans, and secure data
- **End-to-end encrypted feeds** (AES)
- **Claude integration** for workout plans

### RevenueCat ([RevenueCat/](./backend/RevenueCat/))

- **Client library** for in-app purchases/subscriptions

### Website ([site/](./site))

- **Source for liftlog.online** and privacy policy

---

## 📊 Stats


<a href="https://www.star-history.com/?type=date&repos=LiamMorrow%2FLiftLog">
 <picture>
   <source media="(prefers-color-scheme: dark)" srcset="https://api.star-history.com/chart?repos=LiamMorrow/LiftLog&type=date&theme=dark&legend=top-left&sealed_token=4B9Ugtb3Kc7qXvqb65ZwPsxrnDwQPgGjYfiEGm3y0xNgxLObO-TJGQ5DetyZbtH0rGUZ5fvEje57YH4ip5m1O0DmxI32HHOUPNzIaSYXpCA3nzMEhe1-M08DlvXm5CtQLXpbTgpVSdIssFhbmwbM0obLXqglZFXYNrz-skEA7FJgI-tkP0t3ez3gJHnp" />
   <source media="(prefers-color-scheme: light)" srcset="https://api.star-history.com/chart?repos=LiamMorrow/LiftLog&type=date&legend=top-left&sealed_token=4B9Ugtb3Kc7qXvqb65ZwPsxrnDwQPgGjYfiEGm3y0xNgxLObO-TJGQ5DetyZbtH0rGUZ5fvEje57YH4ip5m1O0DmxI32HHOUPNzIaSYXpCA3nzMEhe1-M08DlvXm5CtQLXpbTgpVSdIssFhbmwbM0obLXqglZFXYNrz-skEA7FJgI-tkP0t3ez3gJHnp" />
   <img alt="Star History Chart" src="https://api.star-history.com/chart?repos=LiamMorrow/LiftLog&type=date&legend=top-left&sealed_token=4B9Ugtb3Kc7qXvqb65ZwPsxrnDwQPgGjYfiEGm3y0xNgxLObO-TJGQ5DetyZbtH0rGUZ5fvEje57YH4ip5m1O0DmxI32HHOUPNzIaSYXpCA3nzMEhe1-M08DlvXm5CtQLXpbTgpVSdIssFhbmwbM0obLXqglZFXYNrz-skEA7FJgI-tkP0t3ez3gJHnp" />
 </picture>
</a>

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! See [CONTRIBUTING.md](./CONTRIBUTING.md) (or open an issue/PR).

AI/LLM-assisted contributions are welcome, but issues and feature requests should be written in your own words - see the [AI Usage Policy](./CONTRIBUTING.md#ai-usage-policy).

## 📚 Documentation

- [Plan Files](./docs/PlanFileFormat.md) - Documents the `.liftlogplan` file format, and how to generate plans with an AI for import into the app.
- [Feed Process](./docs/FeedProcess.md) - Documents how the feed and sharing works, especially around e2e encryption.
- [Remote Backup](./docs/RemoteBackup.md) - Documents how to connect LiftLog to a remote backup server.
- [Plaintext Export](./docs/PlaintextExport.md) - Documents how to export your data as plaintext.
- [Workout Worker](./docs/WorkoutWorker.md) - Documents the WorkoutWorker, an event based bridge between native and JS which powers the Android persistent notifications.
- [Storage Migrations](./docs/Migrations.md) - Documents how on-device data is versioned and migrated, and what to do when changing a stored model.

## 💬 Support & Community

- [Discord](https://discord.gg/YHhKEnEnFa)
- [App Website](https://liftlog.online)

---

> **Note:** LiftLog was rewritten from the ground up in React Native. The previous .NET MAUI Blazor implementation is in the `dotnet` branch.
