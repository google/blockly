/**
 * @license
 * Copyright 2022 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Lightweight conversion from tsc to Closure Compiler.
 */
'use strict';

const fs = require('fs');

const DIR = '../../build/src/core/';

function spider(dir) {
  const data = fs.readdirSync(dir, {withFileTypes: true});
  for (const datum of data) {
    if (datum.isDirectory()) {
      spider(dir + datum.name + '/')
    } else if (datum.name.endsWith('.js')) {
      rewriteFile(dir + datum.name);
    }
  }
}

function rewriteFile(path) {
  const oldCode = fs.readFileSync(path, 'utf8');
  const newCode = rewriteEnum(oldCode);
  if (newCode !== oldCode) {
    console.log('Rewrote: ' + path);
    fs.writeFileSync(path, newCode);
  }
}

function rewriteEnum(code) {
  while (true) {
    // Extract the entire enum structure.
    const m = code.match(/\s+\(function \((\w+)\) \{\n[^\}]*\}\)\(\1 [^)]+\1 = \{\}\)\);/);
    if (!m) {
      break;
    }
    // m[0] looks like a bunch of lines in one of these two formats:
    //   ScopeType["BLOCK"] = "block";
    //   KeyCodes[KeyCodes["TAB"] = 9] = "TAB";
    // We need to unquote them to look like one of these two formats:
    //   ScopeType.BLOCK = "block";
    //   KeyCodes[KeyCodes.TAB = 9] = "TAB";
    const oldSnippet = m[0];
    let newSnippet = oldSnippet.replace(/\["(\w+)"\]/g, '.$1');
    // Add a comment so we don't keep trying to modify this enum.
    newSnippet = newSnippet.replace(') {', ') {  // Converted by tsick.');
    code = code.replace(oldSnippet, newSnippet);
  }
  return code;
}

spider(DIR);
