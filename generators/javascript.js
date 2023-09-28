/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Complete helper functions for generating JavaScript for
 *     blocks.  This is the entrypoint for javascript_compressed.js.
 * @suppress {extraRequire}
 */

// Former goog.module ID: Blockly.JavaScript.all

import {JavascriptGenerator} from './javascript/javascript_generator.js';
import * as colour from './javascript/colour.js';
import * as lists from './javascript/lists.js';
import * as logic from './javascript/logic.js';
import * as loops from './javascript/loops.js';
import * as math from './javascript/math.js';
import * as procedures from './javascript/procedures.js';
import * as text from './javascript/text.js';
import * as variables from './javascript/variables.js';
import * as variablesDynamic from './javascript/variables_dynamic.js';

export * from './javascript/javascript_generator.js';

/**
 * JavaScript code generator instance.
 * @type {!JavascriptGenerator}
 */
export const javascriptGenerator = new JavascriptGenerator();

// Install per-block-type generator functions:
Object.assign(
  javascriptGenerator.forBlock,
  colour, lists, logic, loops, math, procedures,
  text, variables, variablesDynamic
);
