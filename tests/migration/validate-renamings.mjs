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

/* global process */

import JSON5 from 'json5';
import * as fs from 'fs';
import {posixPath} from '../../scripts/helpers.js';
import {validate} from '@hyperjump/json-schema/draft-2020-12';
import {DETAILED} from '@hyperjump/json-schema/experimental';

/**
 * Renaming schema filename.
 * @type {URL}
 */
const SCHEMA_URL = new URL('renamings.schema.json', import.meta.url);

/**
 * Renamings filename.
 * @type {URL}
 */
const RENAMINGS_URL =
    new URL('../../scripts/migration/renamings.json5', import.meta.url);

// Can't use top-level await outside a module, and can't use require
// in a module, so use an IIAFE.
(async function () {
  const renamingsJson5 = fs.readFileSync(RENAMINGS_URL);
  const renamings = JSON5.parse(renamingsJson5);

  const output = await validate(
    SCHEMA_URL,
    renamings,
    DETAILED
  );

  if (!output.valid) {
    console.log('Renamings file is invalid.');
    console.log('Maybe this validator output will help you find the problem:');
    console.log(JSON5.stringify(output, undefined, '  '));
    process.exit(1);
  }

  // File passed schema validation.  Do some additional checks.
  let ok = true;
  Object.entries(renamings).forEach(([version, modules]) => {
    // Scan through modules and check for duplicates.
    const seen = new Set();
    for (const {oldName} of modules) {
      if (seen.has(oldName)) {
        console.log(
          `Duplicate entry for module ${oldName} ` + `in version ${version}.`
        );
        ok = false;
      }
      seen.add(oldName);
    }
  });
  if (!ok) {
    console.log('Renamings file is invalid.');
    process.exit(1);
  }
  // Default is a successful exit 0.
})();
