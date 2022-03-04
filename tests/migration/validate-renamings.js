#!/usr/bin/env node
/**
 * @license
 * Copyright 2022 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview A script to validate the renamings file
 * (scripts/migration/renamings.json5) agaist the schema
 * (renamings-schema.json).
 */

/* global require __dirname process */

const JsonSchema = require('@hyperjump/json-schema');
const JSON5 = require('json5');
const fs = require('fs/promises');
const path = require('path');


/**
 * Renaming schema filename.
 * @type {string}
 */
const SCHEMA_FILENAME = path.join(__dirname, 'renamings-schema.json');

/**
 * Renamings filename.
 * @type {string}
 */
const RENAMINGS_FILENAME =
    path.resolve(__dirname, '../../scripts/migration/renamings.json5');

// Can't use top-level await outside a module, and can't use require
// in a module, so use an IIAFE.
(async function() {
  const schemaUrl = 'file://' + path.resolve(SCHEMA_FILENAME);
  const schema = await JsonSchema.get(schemaUrl);

  const renamingsJson5 = await fs.readFile(RENAMINGS_FILENAME);
  const renamings = JSON5.parse(renamingsJson5);

  const output =
      await JsonSchema.validate(schema, renamings, JsonSchema.DETAILED);

  if (output.valid) {
    console.log('Renamings file is valid');
    process.exit(0);
  } else {
    console.log('Renamings file is invalid.');
    console.log('Maybe this validator output will help you find the problem:');
    console.log(JSON5.stringify(output, undefined, '  '));
    process.exit(1);
  }
})();
