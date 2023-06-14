/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Complete helper functions for generating Python for
 *     blocks.  This is the entrypoint for python_compressed.js.
 * @suppress {extraRequire}
 */

import * as goog from '../closure/goog/goog.js';
goog.declareModuleId('Blockly.Python.all');

import './python/colour.js';
import './python/lists.js';
import './python/logic.js';
import './python/loops.js';
import './python/math.js';
import './python/procedures.js';
import './python/text.js';
import './python/variables.js';
import './python/variables_dynamic.js';

export * from './python/python_generator.js';
