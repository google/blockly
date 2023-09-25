/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Complete helper functions for generating Dart for
 *     blocks.  This is the entrypoint for dart_compressed.js.
 * @suppress {extraRequire}
 */

// Former goog.module ID: Blockly.Dart.all

import {DartGenerator} from './dart/dart_generator.js';
import * as colour from './dart/colour.js';
import * as lists from './dart/lists.js';
import * as logic from './dart/logic.js';
import * as loops from './dart/loops.js';
import * as math from './dart/math.js';
import * as procedures from './dart/procedures.js';
import * as text from './dart/text.js';
import * as variables from './dart/variables.js';
import * as variablesDynamic from './dart/variables_dynamic.js';

export * from './dart/dart_generator.js';

/**
 * Dart code generator instance.
 * @type {!DartGenerator}
 */
export const dartGenerator = new DartGenerator();

// Add reserved words.  This list should include all words mentioned
// in RESERVED WORDS: comments in the imports above.
dartGenerator.addReservedWords('Html,Math');

// Install per-block-type generator functions:
Object.assign(
  dartGenerator.forBlock,
  colour, lists, logic, loops, math, procedures,
  text, variables, variablesDynamic
);
