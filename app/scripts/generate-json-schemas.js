#!/usr/bin/env node

const tsj = require('ts-json-schema-generator');
const fs = require('fs');
const { join } = require('node:path');

const storageVersionsDir = join(__dirname, '../src/models/storage/versions');

for (const currentVersionVal of fs
  .readdirSync(storageVersionsDir)
  .filter((f) => /^v\d+/.test(f))) {
  /** @type {import('ts-json-schema-generator/dist/src/Config').Config} */
  const config = {
    path: join(storageVersionsDir, currentVersionVal, 'index.ts'),
    tsconfig: join(__dirname, '../tsconfig.json'),
    type: '*',
    additionalProperties: true,
  };

  const outputPath = join(
    __dirname,
    '../../docs/schemas/',
    currentVersionVal,
    'schema.json',
  );

  // ---- Generate ----

  const schema = tsj.createGenerator(config).createSchema(config.type);

  // ---- Transform ----

  const defs = schema.definitions;

  // Step 1: Build rename map (oldKey -> newKey)
  //   "FooJSON"                    -> "Foo"
  //   'Branded<string,"Foo">'      -> "Foo"  (will be inlined, not kept)
  const renameMap = {};

  for (const key of Object.keys(defs)) {
    if (key.endsWith('JSON')) {
      renameMap[key] = key.slice(0, -4);
    } else if (key.startsWith('Branded<')) {
      // Extract the brand name: Branded<string,"LocalDate"> -> LocalDate
      const match = key.match(/Branded<[^,]+,"([^"]+)">/);
      if (match) {
        renameMap[key] = match[1];
      }
    }
  }

  // Step 2: Identify Branded wrapper definitions to drop.
  // These are "FooJSON" definitions whose only content is a $ref to a Branded<...> key.
  // After renaming, both map to the same name, so we collapse them:
  //   LocalDateJSON -> { $ref: Branded<string,"LocalDate">, format: "date" }
  //   Branded<string,"LocalDate"> -> { type: "string" }
  // becomes just:
  //   LocalDate -> { type: "string", format: "date" }
  //
  // Any extra keys on the wrapper (e.g. from @format JSDoc) are collected and merged
  // into the target definition after the main loop.
  const brandedWrappers = new Set();
  const brandedWrapperExtras = {}; // newTargetKey -> extra props to merge

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
    // Handles both encoded (Branded%3Cstring%2C%22Foo%22%3E) and unencoded refs
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
    // Drop branded wrapper stubs (FooJSON that just re-ref Branded<...>)
    if (brandedWrappers.has(key)) continue;
    // Branded<...> definitions become the canonical entry under their brand name
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

  // Merge any extras from branded wrappers (e.g. @format annotations) into their target defs
  for (const [targetKey, extras] of Object.entries(brandedWrapperExtras)) {
    if (newDefs[targetKey]) {
      Object.assign(newDefs[targetKey], extras);
    }
  }

  const { definitions: _dropped, ...rest } = schema;
  const newSchema = {
    ...transformNode(rest),
    definitions: newDefs,
  };

  // ---- Write ----
  fs.mkdirSync(require('path').dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, JSON.stringify(newSchema, null, 2));
  console.log(`Wrote schema to ${outputPath}`);
}
