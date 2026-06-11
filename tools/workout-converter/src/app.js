import { convertWorkoutPlanJson } from "./converter.js";

const sourceJsonEl = document.querySelector("#sourceJson");
const outputJsonEl = document.querySelector("#outputJson");
const warningsEl = document.querySelector("#warnings");
const statusEl = document.querySelector("#status");
const fileInputEl = document.querySelector("#fileInput");
const convertButtonEl = document.querySelector("#convertButton");
const copyButtonEl = document.querySelector("#copyButton");
const downloadButtonEl = document.querySelector("#downloadButton");
const clearButtonEl = document.querySelector("#clearButton");

let lastOutput = "";

function setStatus(message, isError = false) {
  statusEl.textContent = message;
  statusEl.classList.toggle("error", isError);
}

function renderWarnings(warnings) {
  warningsEl.innerHTML = "";
  for (const warning of warnings) {
    const li = document.createElement("li");
    li.textContent = warning;
    warningsEl.append(li);
  }
}

function convert() {
  try {
    const result = convertWorkoutPlanJson(sourceJsonEl.value);
    outputJsonEl.value = result.output;
    renderWarnings(result.warnings);
    setStatus(
      `Converted ${result.value.program.sessions.length} sessions for \"${result.value.program.name}\".`
    );
    lastOutput = result.output;
  } catch (error) {
    setStatus(error instanceof Error ? error.message : "Conversion failed.", true);
    renderWarnings([]);
  }
}

function clearAll() {
  sourceJsonEl.value = "";
  outputJsonEl.value = "";
  renderWarnings([]);
  setStatus("Cleared.");
  fileInputEl.value = "";
  lastOutput = "";
}

function toDownloadFileName() {
  return `liftlog-plan-import-${new Date().toISOString().slice(0, 10)}.json`;
}

async function copyOutput() {
  if (!outputJsonEl.value) {
    setStatus("Nothing to copy.", true);
    return;
  }

  await navigator.clipboard.writeText(outputJsonEl.value);
  setStatus("Converted JSON copied to clipboard.");
}

function downloadOutput() {
  if (!outputJsonEl.value) {
    setStatus("Nothing to download.", true);
    return;
  }

  const blob = new Blob([outputJsonEl.value], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = toDownloadFileName();
  anchor.click();
  URL.revokeObjectURL(url);
  setStatus("Download started.");
}

async function readUploadedFile(file) {
  if (!file) {
    return;
  }

  const text = await file.text();
  sourceJsonEl.value = text;
  setStatus(`Loaded ${file.name}.`);
}

convertButtonEl.addEventListener("click", convert);
clearButtonEl.addEventListener("click", clearAll);
copyButtonEl.addEventListener("click", () => {
  copyOutput().catch(() => setStatus("Could not copy to clipboard.", true));
});
downloadButtonEl.addEventListener("click", downloadOutput);
fileInputEl.addEventListener("change", () => {
  const [file] = fileInputEl.files || [];
  readUploadedFile(file).catch(() => setStatus("Could not read uploaded file.", true));
});

sourceJsonEl.addEventListener("keydown", (event) => {
  if ((event.ctrlKey || event.metaKey) && event.key === "Enter") {
    convert();
  }
});

if (!lastOutput) {
  setStatus("Ready.");
}
