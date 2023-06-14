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

import * as goog from '../closure/goog/goog.js';
goog.declareModuleId('Blockly.JavaScript.all');

import './javascript/colour.js';
import './javascript/lists.js';
import './javascript/logic.js';
import './javascript/loops.js';
import './javascript/math.js';
import './javascript/procedures.js';
import './javascript/text.js';
import './javascript/variables.js';
import './javascript/variables_dynamic.js';

export * from './javascript/javascript_generator.js';
