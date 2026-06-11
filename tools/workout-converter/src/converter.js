const CARDIO_KEYWORDS = [
  "plank",
  "jump rope",
  "bike",
  "rower",
  "rowing",
  "run",
  "jog",
  "walk",
  "cycle",
  "elliptical",
  "stair",
  "burpee",
  "sprint"
];

const DEFAULT_REST = {
  minRest: "PT90S",
  maxRest: "PT180S",
  failureRest: "PT300S"
};

function asObject(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : null;
}

function asArray(value) {
  return Array.isArray(value) ? value : [];
}

function valueFromKeys(obj, keys) {
  if (!obj || typeof obj !== "object") {
    return undefined;
  }

  for (const key of keys) {
    if (Object.prototype.hasOwnProperty.call(obj, key) && obj[key] !== undefined) {
      return obj[key];
    }
  }
  return undefined;
}

function sanitizeText(value, fallback = "") {
  if (typeof value !== "string") {
    if (value === null || value === undefined) {
      return fallback;
    }
    return String(value).trim() || fallback;
  }
  const trimmed = value.trim();
  return trimmed || fallback;
}

function parsePositiveInt(value, fallback) {
  const numeric = typeof value === "number" ? value : Number.parseInt(String(value), 10);
  if (Number.isFinite(numeric) && numeric > 0) {
    return Math.floor(numeric);
  }
  return fallback;
}

function hasTimeToken(text) {
  return /(sec|secs|second|seconds|min|mins|minute|minutes|hr|hrs|hour|hours|\d+:\d+)/i.test(text);
}

function parseIsoDurationFromText(text) {
  const lower = text.toLowerCase();

  const rangedMatch = lower.match(
    /(\d+(?:\.\d+)?)\s*(?:-|to)\s*(\d+(?:\.\d+)?)\s*(sec|secs|second|seconds|min|mins|minute|minutes|hr|hrs|hour|hours|s|m|h)\b/
  );
  if (rangedMatch) {
    const amount = Number.parseFloat(rangedMatch[1]);
    const unit = rangedMatch[3];
    if (Number.isFinite(amount) && amount > 0) {
      if (["hr", "hrs", "hour", "hours", "h"].includes(unit)) {
        return `PT${Math.round(amount)}H`;
      }
      if (["min", "mins", "minute", "minutes", "m"].includes(unit)) {
        return `PT${Math.round(amount)}M`;
      }
      return `PT${Math.round(amount)}S`;
    }
  }

  const hmsMatch = lower.match(/^(\d{1,2}):(\d{1,2})(?::(\d{1,2}))?$/);
  if (hmsMatch) {
    const hh = Number(hmsMatch[1]);
    const mm = Number(hmsMatch[2]);
    const ss = Number(hmsMatch[3] ?? "0");
    let iso = "PT";
    if (hh > 0) iso += `${hh}H`;
    if (mm > 0) iso += `${mm}M`;
    if (ss > 0 || iso === "PT") iso += `${ss}S`;
    return iso;
  }

  const valueMatch = lower.match(/(\d+(?:\.\d+)?)\s*(sec|secs|second|seconds|min|mins|minute|minutes|hr|hrs|hour|hours|s|m|h)\b/);
  if (!valueMatch) {
    return null;
  }

  const amount = Number.parseFloat(valueMatch[1]);
  if (!Number.isFinite(amount) || amount <= 0) {
    return null;
  }

  const unit = valueMatch[2];
  if (["hr", "hrs", "hour", "hours", "h"].includes(unit)) {
    return `PT${Math.round(amount)}H`;
  }
  if (["min", "mins", "minute", "minutes", "m"].includes(unit)) {
    return `PT${Math.round(amount)}M`;
  }
  return `PT${Math.round(amount)}S`;
}

function parseRepsPerSet(value) {
  if (typeof value === "number" && Number.isFinite(value) && value > 0) {
    return Math.floor(value);
  }

  const text = sanitizeText(value, "").toLowerCase();
  if (!text) {
    return 8;
  }

  if (hasTimeToken(text)) {
    return null;
  }

  const firstNumber = text.match(/\d+/);
  if (!firstNumber) {
    return 8;
  }
  return Number.parseInt(firstNumber[0], 10);
}

function detectCardio(exercise, repsText) {
  const explicitType = sanitizeText(valueFromKeys(exercise, ["type", "exerciseType"]), "").toLowerCase();
  if (explicitType.includes("cardio")) {
    return true;
  }

  if (hasTimeToken(repsText)) {
    return true;
  }

  const name = sanitizeText(valueFromKeys(exercise, ["name", "title", "exercise_name"]), "").toLowerCase();
  return CARDIO_KEYWORDS.some((keyword) => name.includes(keyword));
}

function buildCardioSets(setCount, targetDurationIso) {
  const count = parsePositiveInt(setCount, 1);
  const duration = targetDurationIso || "PT60S";
  const oneSet = {
    target: {
      type: "time",
      value: duration
    },
    trackDuration: true,
    trackDistance: false,
    trackResistance: false,
    trackIncline: false,
    trackWeight: false,
    trackSteps: false
  };
  return Array.from({ length: count }, () => ({ ...oneSet, target: { ...oneSet.target } }));
}

function normalizeWeightedExercise(exercise, warnings, contextLabel) {
  const sets = parsePositiveInt(valueFromKeys(exercise, ["sets", "setCount", "numSets", "rounds"]), 3);
  const repsSource = valueFromKeys(exercise, ["repsPerSet", "reps", "repRange", "targetReps"]);
  const repsPerSet = parseRepsPerSet(repsSource);

  if (repsPerSet === null) {
    warnings.push(`${contextLabel}: time-based reps detected, converted to cardio exercise.`);
    return normalizeCardioExercise(exercise, warnings, contextLabel);
  }

  return {
    type: "WeightedExerciseBlueprint",
    name: sanitizeText(valueFromKeys(exercise, ["name", "title", "exercise_name"]), "Unnamed Exercise"),
    sets,
    repsPerSet,
    weightIncreaseOnSuccess: sanitizeText(
      valueFromKeys(exercise, ["weightIncreaseOnSuccess", "progression", "incrementKg"]),
      "2.5"
    ),
    restBetweenSets: {
      ...DEFAULT_REST,
      ...asObject(valueFromKeys(exercise, ["restBetweenSets", "rest", "restTimes"]))
    },
    supersetWithNext: Boolean(valueFromKeys(exercise, ["supersetWithNext", "superset", "isSuperset"])),
    notes: sanitizeText(valueFromKeys(exercise, ["notes", "note", "description"]), ""),
    link: sanitizeText(valueFromKeys(exercise, ["link", "url", "video"]), "")
  };
}

function normalizeCardioExercise(exercise, warnings, contextLabel) {
  const sets = parsePositiveInt(valueFromKeys(exercise, ["sets", "setCount", "numSets", "rounds"]), 1);
  const repsText = sanitizeText(valueFromKeys(exercise, ["reps", "duration", "target", "targetText"]), "");
  const parsedDuration = parseIsoDurationFromText(repsText);

  if (!parsedDuration && repsText) {
    warnings.push(`${contextLabel}: could not parse duration \"${repsText}\", defaulted to 60s.`);
  }

  return {
    type: "CardioExerciseBlueprint",
    name: sanitizeText(valueFromKeys(exercise, ["name", "title", "exercise_name"]), "Unnamed Exercise"),
    sets: buildCardioSets(sets, parsedDuration),
    notes: sanitizeText(valueFromKeys(exercise, ["notes", "note", "description"]), ""),
    link: sanitizeText(valueFromKeys(exercise, ["link", "url", "video"]), "")
  };
}

function normalizeExercise(exercise, warnings, sessionName, exerciseIndex) {
  const exerciseObj = asObject(exercise) || {};
  const repsText = sanitizeText(valueFromKeys(exerciseObj, ["reps", "duration", "target", "targetText"]), "");
  const explicitType = sanitizeText(valueFromKeys(exerciseObj, ["type", "exerciseType"]), "");
  const contextLabel = `${sessionName} / exercise ${exerciseIndex + 1}`;

  if (explicitType === "WeightedExerciseBlueprint") {
    return normalizeWeightedExercise(exerciseObj, warnings, contextLabel);
  }
  if (explicitType === "CardioExerciseBlueprint") {
    return normalizeCardioExercise(exerciseObj, warnings, contextLabel);
  }

  if (detectCardio(exerciseObj, repsText)) {
    return normalizeCardioExercise(exerciseObj, warnings, contextLabel);
  }

  return normalizeWeightedExercise(exerciseObj, warnings, contextLabel);
}

function normalizeSession(session, warnings, index) {
  const sessionObj = asObject(session) || {};
  const name = sanitizeText(valueFromKeys(sessionObj, ["name", "title", "day", "session_name"]), `Session ${index + 1}`);

  const exerciseList =
    asArray(valueFromKeys(sessionObj, ["exercises", "exerciseList", "work", "movements", "items"]))
      .map((exercise, exerciseIndex) => normalizeExercise(exercise, warnings, name, exerciseIndex))
      .filter(Boolean);

  if (exerciseList.length === 0) {
    warnings.push(`${name}: no exercises found, inserted placeholder exercise.`);
    exerciseList.push({
      type: "WeightedExerciseBlueprint",
      name: "Placeholder Exercise",
      sets: 3,
      repsPerSet: 8,
      weightIncreaseOnSuccess: "2.5",
      restBetweenSets: { ...DEFAULT_REST },
      supersetWithNext: false,
      notes: "",
      link: ""
    });
  }

  return {
    name,
    notes: sanitizeText(valueFromKeys(sessionObj, ["notes", "note", "description"]), ""),
    exercises: exerciseList
  };
}

function normalizeProgram(raw) {
  const root = asObject(raw) || {};
  const isWrapper = root.type === "LiftLogPlanExport";

  if (isWrapper && root.formatVersion !== 1) {
    throw new Error(`Unsupported LiftLog formatVersion: ${String(root.formatVersion)}`);
  }

  const sourceProgram = isWrapper ? asObject(root.program) || {} : root;
  const warnings = [];

  const programName = sanitizeText(
    valueFromKeys(sourceProgram, ["name", "program_name", "programName", "title"]),
    "Imported Program"
  );

  const sourceSessions = asArray(
    valueFromKeys(sourceProgram, ["sessions", "days", "workouts", "schedule", "program"])
  );

  if (sourceSessions.length === 0) {
    throw new Error("No sessions/days/workouts found in source JSON.");
  }

  const sessions = sourceSessions.map((session, index) => normalizeSession(session, warnings, index));

  return {
    warnings,
    value: {
      type: "LiftLogPlanExport",
      formatVersion: 1,
      program: {
        name: programName,
        lastEdited: new Date().toISOString().slice(0, 10),
        sessions
      }
    }
  };
}

export function convertWorkoutPlanObject(input) {
  return normalizeProgram(input);
}

export function convertWorkoutPlanJson(inputText) {
  const text = sanitizeText(inputText, "");
  if (!text) {
    throw new Error("Input JSON is empty.");
  }

  let parsed;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new Error("Input is not valid JSON.");
  }

  const result = convertWorkoutPlanObject(parsed);
  return {
    warnings: result.warnings,
    value: result.value,
    output: JSON.stringify(result.value, null, 2)
  };
}
