#!bun run
import { $, sleep } from "bun";

async function collectIosScreenshot(fileName: string, simulatorId: string) {
  await $`xcrun simctl io ${simulatorId} screenshot ${fileName}`;
}

async function collectAndroidScreenshot(fileName: string) {
  await $`adb exec-out screencap -p > ${fileName}`;
}

function getDeviceFolder(device: string) {
  return `./screenshots/${device}`;
}

function getFileName(coords: string, device: string) {
  return `${getDeviceFolder(device)}/${coords}.png`;
}

function getScreenshotUrl(coords: string) {
  return `liftlog://app.liftlog.online/screenshot-collection?type=${coords}`;
}

async function goToScreenshotUrlIos(coords: string, simulatorId: string) {
  await $`xcrun simctl openurl ${simulatorId} ${getScreenshotUrl(coords)}`;
}

async function goToScreenshotUrlAndroid(coords: string, emulator: string) {
  await $`adb shell am start -a android.intent.action.VIEW -d ${getScreenshotUrl(
    coords
  )}`;
}

async function startSimulator(device: string) {
  const boot = (await $`xcrun simctl boot ${device}`).stderr.toString();
  if (boot.includes("Unable to boot device in current state: Booted")) {
    return;
  }
  await sleep(5000);
}

function startEmulator(device: string) {
  return $`emulator -avd ${device}`;
}

async function getIosSimulatorId(device: string) {
  const deviceStr =
    await $`xcrun simctl list devices | grep "${device}" | head -n 1`.text();
  return deviceStr.split("(")[1].split(")")[0];
}

function getAndroidEmulatorIpAndPort(device: string) {
  return $`adb devices | grep "${device}" | awk '{print $1}'`.text();
}
const screenshotCoords = [
  //
  "workoutpage",
  "exerciseeditor",
  "ai",
  "home",
  "stats",
  "history",
  "ai-session",
];
const iosDevices = [
  //
  "iPhone SE 2nd generation",
  "iPhone 14 Plus",
  "iPad Pro 13-inch",
  "iPhone 15 Pro Max",
];

const androidDevices = [
  //
  "Pixel_5_API_34",
];

await $`dotnet clean ../LiftLog.Maui -f net10.0-android`;
for (const device of androidDevices) {
  await $`mkdir -p ${getDeviceFolder(device)}`;
  const emulator = startEmulator(device).text();
  await $`echo Press enter when emulator loaded`;
  await $`read`;
  // await $`dotnet build ../LiftLog.Maui -t:Run -c Debug -f net10.0-android -p:TargetFramework=net10.0-android -p:BuildFor=android -p:Device=${device}`;
  await sleep(5000);

  for (const coords of screenshotCoords) {
    goToScreenshotUrlAndroid(coords, await getAndroidEmulatorIpAndPort(device));
    await sleep(2000);
    collectAndroidScreenshot(getFileName(coords, device));
  }
}

for (const device of iosDevices) {
  await $`mkdir -p ${getDeviceFolder(device)}`;
  await startSimulator(device);
  const simulatorId = await getIosSimulatorId(device);
  // $`dotnet build ../LiftLog.Maui -t:Run -f net10.0-ios -p:RuntimeIdentifiers=iossimulator-x64 -c Debug -p:ExtraDefineConstants=DEBUG_IOSSIM -p:_DeviceName=:v2:udid=${simulatorId}`.text();
  // await sleep(25000);
  for (const coords of screenshotCoords) {
    goToScreenshotUrlIos(coords, simulatorId);
    await sleep(10000);
    collectIosScreenshot(getFileName(coords, device), simulatorId);
  }
}
