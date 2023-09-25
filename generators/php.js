/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Complete helper functions for generating PHP for
 *     blocks.  This is the entrypoint for php_compressed.js.
 * @suppress {extraRequire}
 */

// Former goog.module ID: Blockly.PHP.all

import {PhpGenerator} from './php/php_generator.js';
import * as colour from './php/colour.js';
import * as lists from './php/lists.js';
import * as logic from './php/logic.js';
import * as loops from './php/loops.js';
import * as math from './php/math.js';
import * as procedures from './php/procedures.js';
import * as text from './php/text.js';
import * as variables from './php/variables.js';
import * as variablesDynamic from './php/variables_dynamic.js';

export * from './php/php_generator.js';

/**
 * Php code generator instance.
 * @type {!PhpGenerator}
 */
export const phpGenerator = new PhpGenerator();

// Install per-block-type generator functions:
Object.assign(
  phpGenerator.forBlock,
  colour, lists, logic, loops, math, procedures,
  text, variables, variablesDynamic
);
