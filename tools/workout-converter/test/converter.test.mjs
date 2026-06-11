import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { convertWorkoutPlanJson, convertWorkoutPlanObject } from "../src/converter.js";

const fixtureStrength = readFileSync(
  join(process.cwd(), "..", "..", "docs", "strength.json"),
  "utf8"
);

test("converts strength.json style source into LiftLog import format", () => {
  const result = convertWorkoutPlanJson(fixtureStrength);

  assert.equal(result.value.type, "LiftLogPlanExport");
  assert.equal(result.value.formatVersion, 1);
  assert.equal(result.value.program.name, "Home 4-Day Strength & Muscle (Weekdays)");
  assert.equal(result.value.program.sessions.length, 4);

  const day1Bench = result.value.program.sessions[0].exercises[0];
  assert.equal(day1Bench.type, "WeightedExerciseBlueprint");
  assert.equal(day1Bench.repsPerSet, 6);

  const day2Plank = result.value.program.sessions[1].exercises[4];
  assert.equal(day2Plank.type, "CardioExerciseBlueprint");
  assert.equal(day2Plank.sets.length, 3);
  assert.equal(day2Plank.sets[0].target.value, "PT30S");
});

test("accepts wrapper format and normalizes output", () => {
  const wrapper = {
    type: "LiftLogPlanExport",
    formatVersion: 1,
    program: {
      name: "My Plan",
      sessions: [
        {
          name: "Session A",
          exercises: [{ name: "Bench Press", sets: 5, repsPerSet: 5, type: "WeightedExerciseBlueprint" }]
        }
      ]
    }
  };

  const result = convertWorkoutPlanObject(wrapper);
  assert.equal(result.value.program.name, "My Plan");
  assert.equal(result.value.program.sessions[0].exercises[0].type, "WeightedExerciseBlueprint");
  assert.equal(result.value.program.sessions[0].exercises[0].sets, 5);
});

test("handles loose external schema key names", () => {
  const source = {
    title: "External Plan",
    workouts: [
      {
        title: "Conditioning",
        movements: [
          { title: "Jump Rope", rounds: "4", target: "45 sec" },
          { title: "Goblet Squat", rounds: "3", repRange: "10-12" }
        ]
      }
    ]
  };

  const result = convertWorkoutPlanObject(source);
  const [rope, squat] = result.value.program.sessions[0].exercises;

  assert.equal(result.value.program.name, "External Plan");
  assert.equal(rope.type, "CardioExerciseBlueprint");
  assert.equal(rope.sets.length, 4);
  assert.equal(rope.sets[0].target.value, "PT45S");
  assert.equal(squat.type, "WeightedExerciseBlueprint");
  assert.equal(squat.repsPerSet, 10);
});

test("throws for invalid JSON", () => {
  assert.throws(() => convertWorkoutPlanJson("{invalid json}"), /not valid JSON/);
});

test("throws if source contains no sessions", () => {
  assert.throws(() => convertWorkoutPlanObject({ name: "No sessions" }), /No sessions/);
});
