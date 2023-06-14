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

import * as goog from '../../closure/goog/goog.js';
goog.declareModuleId('Blockly.Dart.all');

import './colour.js';
import './lists.js';
import './logic.js';
import './loops.js';
import './math.js';
import './procedures.js';
import './text.js';
import './variables.js';
import './variables_dynamic.js';

export * from './dart_generator.js';
