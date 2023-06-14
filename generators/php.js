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

import * as goog from '../closure/goog/goog.js';
goog.declareModuleId('Blockly.PHP.all');

import './php/colour.js';
import './php/lists.js';
import './php/logic.js';
import './php/loops.js';
import './php/math.js';
import './php/procedures.js';
import './php/text.js';
import './php/variables.js';
import './php/variables_dynamic.js';

export * from './php/php_generator.js';
