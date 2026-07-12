#!/usr/bin/env node

/**
 * Builds the `.liftlogplan` validator that ships inside the plan-builder skill.
 *
 * The skill is installed standalone — into `~/.claude` by the plugin, or into a
 * claude.ai container as an uploaded zip — so the validator cannot import from
 * the app, and cannot assume `npm install` will work: the claude.ai sandbox has
 * no network egress by default on Team/Enterprise plans. Ajv is therefore
 * compiled ahead of time into standalone code and bundled with its runtime into
 * a single dependency-free file that runs on plain `node`.
 *
 * Unlike the app's own validator, this one enforces `format` keywords. The app
 * runs Ajv with `validateFormats: false`, so a numeric weight or a `"90"` rest
 * survives import and only fails later inside `Duration.parse`. Catching those
 * here is the point of the exercise.
 */

import Ajv, { _ } from 'ajv';
import addFormats from 'ajv-formats';
import standaloneCode from 'ajv/dist/standalone/index.js';
import * as esbuild from 'esbuild';
import fs from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = dirname(fileURLToPath(import.meta.url));
const schemaPath = join(scriptDir, '../src/models/generated/program-blueprint.schema.json');
const outputPath = join(
  scriptDir,
  '../../plugins/liftlog-plan-builder/skills/create-liftlog-plan/scripts/validate-plan.mjs',
);

/** Matches the `BigNumber` decimal strings the app parses with `BigNumber(...)`. */
const DECIMAL_PATTERN = '^-?\\d+(\\.\\d+)?$';

/**
 * `decimal` is not a format Ajv or ajv-formats knows, and custom formats added
 * with `addFormat` cannot be serialized into standalone code. Expressing it as a
 * `pattern` keeps the check while keeping the generated module self-contained.
 */
function replaceDecimalFormatWithPattern(node) {
  if (Array.isArray(node)) {
    return node.map(replaceDecimalFormatWithPattern);
  }
  if (node && typeof node === 'object') {
    const out = {};
    for (const [key, value] of Object.entries(node)) {
      if (key === 'format' && value === 'decimal') {
        out.pattern = DECIMAL_PATTERN;
      } else {
        out[key] = replaceDecimalFormatWithPattern(value);
      }
    }
    return out;
  }
  return node;
}

const schema = replaceDecimalFormatWithPattern(JSON.parse(fs.readFileSync(schemaPath, 'utf8')));

const ajv = new Ajv({
  // The schema uses OpenAPI-style discriminators, as the app's validator does.
  discriminator: true,
  // Report every problem in one run so a generated plan can be fixed in one pass.
  allErrors: true,
  code: {
    source: true,
    // Tells the standalone code where to find ajv-formats' implementations;
    // esbuild inlines them into the bundle below.
    formats: _`require("ajv-formats/dist/formats").fullFormats`,
  },
});
addFormats(ajv);

// `$schema` would make Ajv look for a draft-07 meta-schema at runtime.
delete schema.$schema;

const validateModule = standaloneCode(ajv, ajv.compile(schema));

const cli = `
import { readFileSync } from 'node:fs';
import validate from './__validate-schema.js';

const file = process.argv[2];
if (!file) {
  console.error('usage: node validate-plan.mjs <plan.liftlogplan>');
  process.exit(2);
}

let plan;
try {
  plan = JSON.parse(readFileSync(file, 'utf8'));
} catch (e) {
  console.error(\`\${file} is not valid JSON: \${e.message}\`);
  process.exit(1);
}

if (validate(plan)) {
  console.log(\`\${file} is a valid LiftLog plan.\`);
  process.exit(0);
}

console.error(\`\${file} is not a valid LiftLog plan:\\n\`);
for (const error of validate.errors) {
  const path = error.instancePath || '/';
  const allowed = error.params?.allowedValues ? \` (\${error.params.allowedValues.join(', ')})\` : '';
  console.error(\`  plan\${path} \${error.message}\${allowed}\`);
}
console.error('\\nSee reference/format.md for the field reference.');
process.exit(1);
`;

const tmpDir = fs.mkdtempSync(join(scriptDir, '.plan-validator-'));
try {
  fs.writeFileSync(join(tmpDir, '__validate-schema.js'), validateModule);
  fs.writeFileSync(join(tmpDir, 'cli.mjs'), cli);

  fs.mkdirSync(dirname(outputPath), { recursive: true });
  await esbuild.build({
    // esbuild annotates each bundled module with its path relative to the working
    // directory. Anchoring that to the temp directory keeps the random `mkdtemp`
    // suffix out of the output, so rebuilds are byte-for-byte reproducible.
    absWorkingDir: tmpDir,
    entryPoints: ['cli.mjs'],
    outfile: outputPath,
    bundle: true,
    format: 'esm',
    platform: 'node',
    target: 'node18',
    banner: {
      js: [
        '// GENERATED FILE - DO NOT EDIT.',
        '// Regenerate with `npm run json-schema` from the app directory.',
        '// Source: app/scripts/build-plan-validator.mjs',
      ].join('\n'),
    },
  });
  console.log(`Wrote validator to ${outputPath}`);
} finally {
  fs.rmSync(tmpDir, { recursive: true, force: true });
}
