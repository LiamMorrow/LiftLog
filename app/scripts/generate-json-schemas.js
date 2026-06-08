#!/usr/bin/env node

const tsj = require('ts-json-schema-generator');
const fs = require('fs');
const { join } = require('node:path');

const modelsDir = join(__dirname, '../src/models');
const docsSchemasPath = join(__dirname, '../../docs/schemas/');
// Create schemas for storage

// Create schema for workout-worker — one file per definition
createSplitSchemas(
  join(modelsDir, 'workout-worker-messages.ts'),
  join(docsSchemasPath, 'workout-worker'),
);

/**
 * Write one JSON Schema file per top-level definition.
 * Each file is named `<DefinitionName>.json` and lives in `outputDir`.
 * Cross-definition $refs are rewritten from `#/definitions/Foo` to `./Foo.json`.
 */
function createSplitSchemas(inputFile, outputDir) {
  const schema = buildSchema(inputFile);
  const { definitions } = schema;

  if (!definitions || Object.keys(definitions).length === 0) {
    console.warn(`No definitions found in schema for ${inputFile}`);
    return;
  }

  const definitionNames = new Set(Object.keys(definitions));

  /**
   * Rewrite $ref values:
   *   #/definitions/Foo  ->  ./Foo.json
   * Any ref that doesn't point at a known definition is left untouched.
   */
  function rewriteRefs(node) {
    if (Array.isArray(node)) {
      return node.map(rewriteRefs);
    }
    if (node && typeof node === 'object') {
      const out = {};
      for (const [k, v] of Object.entries(node)) {
        if (k === '$ref' && typeof v === 'string') {
          const defName = v.replace('#/definitions/', '');
          out.$ref = definitionNames.has(defName) ? `./${defName}.json` : v;
        } else {
          out[k] = rewriteRefs(v);
        }
      }
      return out;
    }
    return node;
  }

  if (fs.existsSync(outputDir)) {
    fs.rmSync(outputDir, { recursive: true });
  }
  fs.mkdirSync(outputDir, { recursive: true });

  for (const [name, def] of Object.entries(definitions)) {
    // Build a self-contained schema for this definition.
    // We keep $schema and any top-level metadata, drop `definitions` (replaced
    // by file-level refs), and set the definition body as the root.
    const { definitions: _dropped, ...topLevel } = schema;
    const fileSchema = {
      ...rewriteRefs(topLevel),
      ...rewriteRefs(def),
    };

    const outputPath = join(outputDir, `${name}.json`);
    fs.writeFileSync(outputPath, JSON.stringify(fileSchema, null, 2));
    console.log(`Wrote schema to ${outputPath}`);
  }
}

/**
 * Shared logic: compile TypeScript -> JSON Schema, then apply the
 * FooJSON / Branded<...> rename + collapse transforms.
 */
function buildSchema(inputFile) {
  /** @type {import('ts-json-schema-generator/dist/src/Config').Config} */
  const config = {
    path: inputFile,
    tsconfig: join(__dirname, '../tsconfig.json'),
    type: '*',
    additionalProperties: true,
    discriminatorType: 'open-api',
    skipTypeCheck: true,
  };

  const schema = tsj.createGenerator(config).createSchema(config.type);

  const defs = schema.definitions;

  // Step 1: Build rename map (oldKey -> newKey)
  //   "FooJSON"                    -> "Foo"
  //   'Branded<string,"Foo">'      -> "Foo"  (will be inlined, not kept)
  const renameMap = {};

  for (const key of Object.keys(defs)) {
    if (key.endsWith('JSON')) {
      renameMap[key] = key.slice(0, -4);
    } else if (key.startsWith('Branded<')) {
      const match = key.match(/Branded<[^,]+,"([^"]+)">/);
      if (match) {
        renameMap[key] = match[1];
      }
    }
  }

  // Step 2: Identify Branded wrapper definitions to drop.
  const brandedWrappers = new Set();
  const brandedWrapperExtras = {};

  for (const [key, def] of Object.entries(defs)) {
    if (!key.endsWith('JSON')) continue;
    if (def.$ref) {
      const target = def.$ref.replace('#/definitions/', '');
      if (target.startsWith('Branded<') || target.startsWith('Branded%3C')) {
        brandedWrappers.add(key);
        const { $ref, ...extras } = def;
        if (Object.keys(extras).length > 0) {
          brandedWrapperExtras[renameMap[key]] = extras;
        }
      }
    }
  }

  function renameRef(ref) {
    const key = decodeURIComponent(ref.replace('#/definitions/', ''));
    const newKey = renameMap[key] ?? key;
    return `#/definitions/${newKey}`;
  }

  function transformNode(node) {
    if (Array.isArray(node)) {
      return node.map(transformNode);
    }
    if (node && typeof node === 'object') {
      const out = {};
      for (const [k, v] of Object.entries(node)) {
        if (k === '$ref' && typeof v === 'string') {
          out.$ref = renameRef(v);
        } else {
          out[k] = transformNode(v);
        }
      }
      return out;
    }
    return node;
  }

  const newDefs = {};

  for (const [key, def] of Object.entries(defs)) {
    if (brandedWrappers.has(key)) continue;
    if (key.startsWith('Branded<')) {
      const newKey = renameMap[key];
      if (newKey) {
        newDefs[newKey] = transformNode(def);
      }
      continue;
    }

    const newKey = renameMap[key] ?? key;
    newDefs[newKey] = transformNode(def);
  }

  for (const [targetKey, extras] of Object.entries(brandedWrapperExtras)) {
    if (newDefs[targetKey]) {
      Object.assign(newDefs[targetKey], extras);
    }
  }

  const { definitions: _dropped, ...rest } = schema;
  return {
    ...transformNode(rest),
    definitions: newDefs,
  };
}
