#!/usr/bin/env -S node --experimental-strip-types
import { $, sleep, argv } from "zx";

const screenshotId = argv._[0] as string | undefined;
const platform = argv.platform as string | undefined;
const dryRun = argv["dry-run"] as boolean | undefined;

async function collectIosScreenshot(fileName: string, simulatorId: string) {
  if (dryRun) {
    console.log(
      `[dry-run] xcrun simctl io ${simulatorId} screenshot ${fileName}`,
    );
    return;
  }
  await $`xcrun simctl io ${simulatorId} screenshot ${fileName}`;
}

async function collectAndroidScreenshot(fileName: string) {
  if (dryRun) {
    console.log(`[dry-run] adb exec-out screencap -p > ${fileName}`);
    return;
  }
  await $`adb exec-out screencap -p > ${fileName}`;
}

function getDeviceFolder(device: string) {
  return `./screenshots/${device}`;
}

function getFileName(coords: string, device: string) {
  return `${getDeviceFolder(device)}/${coords}.png`;
}

function getScreenshotUrl(coords: string) {
  return `liftlog://screenshot-collection\?type=${coords}`;
}

async function goToScreenshotUrlIos(coords: string, simulatorId: string) {
  await $`xcrun simctl openurl ${simulatorId} ${getScreenshotUrl(coords)}`;
}

async function goToScreenshotUrlAndroid(coords: string) {
  await $`adb shell am start -a android.intent.action.VIEW -d ${getScreenshotUrl(
    coords,
  )}`;
}

async function startSimulator(device: string) {
  const result = await $`xcrun simctl boot ${device}`.nothrow();
  if (result.exitCode === 0) {
    await sleep(5000);
  }
  await $`open -a Simulator`;
}

async function isEmulatorRunning(): Promise<boolean> {
  const devices = await $`adb devices`.text();
  return devices
    .split("\n")
    .slice(1)
    .some((line) => line.includes("emulator") && line.includes("device"));
}

function startEmulator(device: string) {
  return $`emulator -avd ${device}`;
}

async function getIosSimulatorId(device: string) {
  const json = await $`xcrun simctl list devices --json`.text();
  const data = JSON.parse(json);
  for (const devices of Object.values(data.devices) as any[]) {
    const found = (devices as any[]).find((d: any) => d.name === device);
    if (found) return found.udid as string;
  }
  throw new Error(`Simulator not found: ${device}`);
}

const allScreenshotCoords = [
  "workoutpage",
  "exerciseeditor",
  "ai-planner",
  "home",
  "stats",
  "exercise-stats",
  "history",
];

const screenshotCoords = screenshotId ? [screenshotId] : allScreenshotCoords;

const allIosDevices = [
  "iPad Pro 13-inch (M5)",
  "iPhone 17 Pro Max",
  "iPhone 17",
  "iPhone 16e",
];

const allAndroidDevices = ["Pixel_9"];

const iosDevices =
  platform === "android"
    ? []
    : platform === "ios"
      ? [allIosDevices[0]!]
      : allIosDevices;
const androidDevices = platform === "ios" ? [] : [allAndroidDevices[0]!];

for (const device of iosDevices) {
  if (dryRun) {
    console.log(`[dry-run] Would start simulator: ${device}`);
  } else {
    await $`mkdir -p ${getDeviceFolder(device)}`;
    await startSimulator(device);
  }
  const simulatorId = dryRun ? device : await getIosSimulatorId(device);
  for (const coords of screenshotCoords) {
    goToScreenshotUrlIos(coords, simulatorId);
    await sleep(10000);
    collectIosScreenshot(getFileName(coords, device), simulatorId);
  }
}

for (const device of androidDevices) {
  if (dryRun) {
    console.log(`[dry-run] Would start emulator: ${device}`);
  } else {
    await $`mkdir -p ${getDeviceFolder(device)}`;
    if (!(await isEmulatorRunning())) {
      startEmulator(device);
      await $`echo Press enter when emulator loaded`;
      await $`read`;
      await sleep(5000);
    }
  }

  for (const coords of screenshotCoords) {
    goToScreenshotUrlAndroid(coords);
    await sleep(10000);
    collectAndroidScreenshot(getFileName(coords, device));
  }
}
