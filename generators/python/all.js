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

import * as goog from '../../closure/goog/goog.js';
goog.declareModuleId('Blockly.Python.all');

import './colour.js';
import './lists.js';
import './logic.js';
import './loops.js';
import './math.js';
import './procedures.js';
import './text.js';
import './variables.js';
import './variables_dynamic.js';

export * from '../python.js';
