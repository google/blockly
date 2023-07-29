/**
 * @license
 * Copyright 2022 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Lightweight conversion from tsc ouptut to Closure Compiler
 * compatible input.
 */
'use strict';

// eslint-disable-next-line no-undef
const fs = require('fs');

// eslint-disable-next-line no-undef
const DIR = process.argv[2];

// Number of files rewritten.
let fileCount = 0;

/**
 * Recursively spider the given directory and rewrite any JS files found.
 * @param {string} dir Directory path to start from.
 */
function spider(dir) {
  if (!dir.endsWith('/')) {
    dir += '/';
  }
  const entries = fs.readdirSync(dir, {withFileTypes: true});
  for (const entry of entries) {
    if (entry.isDirectory()) {
      spider(dir + entry.name + '/');
    } else if (entry.name.endsWith('.js')) {
      rewriteFile(dir + entry.name);
    }
  }
}

/**
 * Given a file, rewrite it if it contains problematic patterns.
 * @param {string} path Path of file to potentially rewrite.
 */
function rewriteFile(path) {
  const oldCode = fs.readFileSync(path, 'utf8');
  const newCode = rewriteEnum(oldCode);
  if (newCode !== oldCode) {
    fileCount++;
    fs.writeFileSync(path, newCode);
  }
}

/**
 * Unquote enum definitions in the given code string.
 * @param {string} code Original code generated by tsc.
 * @return {string} Rewritten code for Closure Compiler.
 */
function rewriteEnum(code) {
  // Find all enum definitions.  They look like this:
  // (function (names) {
  //   ...
  // })(names || (names = {}));
  const enumDefs =
    code.match(
      /\s+\(function \((\w+)\) \{\n[^}]*\}\)\(\1 [^)]+\1 = \{\}\)\);/g,
    ) || [];
  for (const oldEnumDef of enumDefs) {
    // enumDef looks like a bunch of lines in one of these two formats:
    //   ScopeType["BLOCK"] = "block";
    //   KeyCodes[KeyCodes["TAB"] = 9] = "TAB";
    // We need to unquote them to look like one of these two formats:
    //   ScopeType.BLOCK = "block";
    //   KeyCodes[KeyCodes.TAB = 9] = "TAB";
    let newEnumDef = oldEnumDef.replace(/\["(\w+)"\]/g, '.$1');
    newEnumDef = newEnumDef.replace(') {', ') {  // Converted by tsick.');
    code = code.replace(oldEnumDef, newEnumDef);
  }
  return code;
}

if (DIR) {
  spider(DIR);
  console.log(`Unquoted enums in ${fileCount} files.`);
} else {
  throw Error('No source directory specified');
}
