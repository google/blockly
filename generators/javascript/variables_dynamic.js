/**
 * @license
 * Copyright 2018 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Generating JavaScript for dynamic variable blocks.
 */

import * as goog from '../../closure/goog/goog.js';
goog.declareModuleId('Blockly.JavaScript.variablesDynamic');


// JavaScript is dynamically typed.
export {
  variables_get as variables_get_dynamic,
  variables_set as variables_set_dynamic,
} from './variables.js';
