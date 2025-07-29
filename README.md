# LiftLog

[![Discord](https://img.shields.io/discord/1267316682737848330?logo=discord&cacheSeconds=3600)](https://discord.gg/YHhKEnEnFa)

<p align="center">
  <img src="./assets/play_store_feature_graphic.png" alt="LiftLog Play Store Graphic"><br/>
  <img width="250" src="./assets/AppScreens-LiftLog-1719652395579 2/android/Android Phones - 169/01.png" alt="App Screenshot 1">
  <img width="250" src="./assets/AppScreens-LiftLog-1719652395579 2/android/Android Phones - 169/02.png" alt="App Screenshot 2">
  <img width="250" src="./assets/AppScreens-LiftLog-1719652395579 2/android/Android Phones - 169/03.png" alt="App Screenshot 3">
</p>

<p align="center">
  <a href='https://play.google.com/store/apps/details?id=com.limajuice.liftlog&pcampaignid=pcampaignidMKT-Other-global-all-co-prtnr-py-PartBadge-Mar2515-1'><img alt='Get it on Google Play' style="height: 50px;" src='./assets/google-play-badge.png'/></a>
  <a href="https://apps.apple.com/au/app/liftlog/id6467372581?itsct=apps_box_badge&amp;itscg=30200"><img src="https://tools.applemediaservices.com/api/badges/download-on-the-app-store/black/en-us?size=250x83&amp;releaseDate=1696550400" alt="Download on the App Store" style="border-radius: 13px; width: 250px; height: 50px"></a>
  <a href='https://app.liftlog.online'><img alt='Try demo in your browser' style="height: 50px;" src='./assets/web-badge.png'/></a>
</p>

---

## 🚀 Overview

**LiftLog** is an intuitive, cross-platform gym weight tracking app built with React Native and Expo. It features Material Design 3, AI-powered workout planning, and secure, end-to-end encrypted social feeds. Available on Android, iOS, and the web.

### Key Features

- 📱 Runs on Android, iOS, and web
- 🧠 AI planner tailors gym plans to your goals and body
- 🔒 End-to-end encrypted social feeds (opt-in, privacy-first)
- 🎨 Material Design 3 via React Native Paper
- 🌐 Internationalization with Tolgee (10+ languages)
- 🏋️‍♂️ Publish workouts, follow other users, and control your feed privacy
- ⚡ Fast, modern UI with Expo Router and Redux Toolkit

---

## 🌍 Translations

LiftLog uses [Tolgee](https://tolgee.io/) for internationalization and translation management. Translation files are in [`app/i18n/`](./app/i18n/). A huge thanks to them providing an open source license to LiftLog ❤️.

Available languages:

- 🇦🇺 English (default)
- 🇮🇹 Italian
- 🇩🇪 German
- 🇷🇸 Serbian
- 🇫🇷 French
- 🇳🇱 Dutch
- 🇫🇮 Finnish
- 🇪🇸 Spanish
- 🇷🇺 Russian

Want to help translate? [Open an issue or PR](https://github.com/LiamMorrow/LiftLog/issues).

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
npm run web       # For web
```

### Run the Backend API

```bash
cd LiftLog.Api
dotnet run
```

See [`backend/LiftLog.Api/README.md`](./backend/LiftLog.Api/README.md) for backend details.

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

### Backend ([LiftLog.Api/](./backend/LiftLog.Api/))

- **Dotnet WebAPI** for feeds, AI plans, and secure data
- **End-to-end encrypted feeds** (AES)
- **OpenAI integration** for workout plans

### RevenueCat ([RevenueCat/](./backend/RevenueCat/))

- **Client library** for in-app purchases/subscriptions

### Website ([site/](./site))

- **Source for liftlog.online** and privacy policy

---

## 📊 Stats

[![Star History Chart](https://api.star-history.com/svg?repos=LiamMorrow/LiftLog&type=Date)](https://star-history.com/#LiamMorrow/LiftLog&Date)

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! See [CONTRIBUTING.md](./CONTRIBUTING.md) (or open an issue/PR).

## 📚 Documentation

- [Feed Process](./docs/FeedProcess.md)
- [Remote Backup](./docs/RemoteBackup.md)
- [Plaintext Export](./docs/PlaintextExport.md)

## 💬 Support & Community

- [Discord](https://discord.gg/YHhKEnEnFa)
- [App Website](https://liftlog.online)
- [Try Demo](https://app.liftlog.online)

---

> **Note:** LiftLog was rewritten from the ground up in React Native. The previous .NET MAUI Blazor implementation is in the `dotnet` branch.
