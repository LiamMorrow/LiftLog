# LiftLog

[![Discord](https://img.shields.io/discord/1267316682737848330?logo=discord&cacheSeconds=3600)](https://discord.gg/YHhKEnEnFa)

<img src="./Assets/play_store_feature_graphic.png"><br/>
<img width="250" src="./Assets/AppScreens-LiftLog-1719652395579 2/android/Android Phones - 169/01.png">
<img width="250" src="./Assets/AppScreens-LiftLog-1719652395579 2/android/Android Phones - 169/02.png">
<img width="250" src="./Assets/AppScreens-LiftLog-1719652395579 2/android/Android Phones - 169/03.png">

<a href='https://play.google.com/store/apps/details?id=com.limajuice.liftlog&pcampaignid=pcampaignidMKT-Other-global-all-co-prtnr-py-PartBadge-Mar2515-1'><img alt='Get it on Google Play'  style="height: 50px;" src='./Assets/google-play-badge.png?'/></a>
<a href="https://apps.apple.com/au/app/liftlog/id6467372581?itsct=apps_box_badge&amp;itscg=30200" ><img src="https://tools.applemediaservices.com/api/badges/download-on-the-app-store/black/en-us?size=250x83&amp;releaseDate=1696550400" alt="Download on the App Store" style="border-radius: 13px; width: 250px; height: 50px "></a>
<a href='https://app.liftlog.online'><img alt='Try demo in your browser'  style="height: 50px;" src='./Assets/web-badge.png?'/></a>

LiftLog aims to be an intuitive, simple gym weight tracking app. It runs on all mobile platforms, and is built as a .NET MAUI Blazor Hybrid app.
It incorporates material design 3, with designs and layout driven by [tailwindcss](https://tailwindcss.com/).

Built into it is an AI planner which will tailor a specific gym plan to your goals and body.

LiftLog also allows users to publish their workouts to their feed, and subscribe to other user's feeds. This data is end to end encrypted and totally opt in. User's have full control over who can follow them. The technical details of how this works are described in [the feed process docs](./Docs/FeedProcess.md).

Checkout [the app website](https://liftlog.online) for screenshots and features. Or checkout https://app.liftlog.online to try it out without installing an app.

## Translations

LiftLog can be translated into different languages by filling out a translations file. If you are interested in translating, please submit an issue or pull request creating or amending a copy of the [UiStrings.resx](./LiftLog.Ui/i18n/UiStrings.resx) file.

LiftLog is currently available in the following languages:

- English (default)
- Italian
- German
- Serbian
- French

## Quickstart

### Prerequisites

Ensure the dotnet sdk is installed and on the latest version. You can do that by following the instructions [here](https://dotnet.microsoft.com/en-us/download).
npm is also required to build some of the web assets.

### Running

Before running, you must build the web assets once, after they are built it is rare to need to build them again.

```bash
cd ./LiftLog.Ui
npm i
npm run build
```

Then, to run the app in the browser simply run:

```bash
cd ../LiftLog.Web
dotnet watch
```

## Project Structure

As mentioned, LiftLog is a MAUI Hybrid Blazor app. What this means for LiftLog is that all of the UI is built with blazor in html, css, and a bit of JS.
Since the entire UI is built this way, rapid development using the browser is possible; without having to develop on real devices or emulators.

LiftLog is split up into a couple of different dotnet projects:

### Frontend

#### [LiftLog.Ui](./LiftLog.Ui/)

LiftLog.Ui is where the majority of the application is developed. It is a blazor class library which contains all of the components and pages for the app.
We use [Fluxor](https://github.com/mrpmorris/Fluxor) to manage state, and attempt to keep many components as dumb presentation components, without direct access to this state.

There are several services which are defined and used by LiftLog.Ui, some of which are platform specific. In these cases an interface is defined for the service for the relevant platform project to implement. [INotificationService](./LiftLog.Ui/Services/INotificationService.cs) is a good example of this, where richer notifications can be created on applications vs the web.

#### [LiftLog.Web](./LiftLog.Web/)

LiftLog.Web is a Blazor Webassembly application which can be used for local development. It implements the required services which are defined in LiftLog.Ui to run in a web environment. While this is useful for development, new features should be tested on emulated and real devices before release, as there are some differences between the webassembly runtime and the MAUI runtime.

#### [LiftLog.Maui](./LiftLog.Maui/)

LiftLog.Maui is a MAUI application utilizing a BlazorWebView to display the UI defined in LiftLog.Ui. It implements the specific services required for running the UI on an iOS or Android device.
This is the application which is published to the relevant app store.

### Backend

#### [LiftLog.Api](./LiftLog.Api/)

This project contains a dotnet webapi backend for LiftLog. It is in charge of storing, and serving feeds to people, however it has no knowledge of the content of feeds, aside from timestamps and user IDs.
Feeds are end to end encrypted using a shared symmetric key via AES.

It also handles the AI generated plans with OpenAI.

### [Site](./site)

The site folder contains the source for the website at liftlog.online, along with the privacy policy etc.

## Stats

[![Star History Chart](https://api.star-history.com/svg?repos=LiamMorrow/LiftLog&type=Date)](https://star-history.com/#LiamMorrow/LiftLog&Date)
