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

import * as goog from '../closure/goog/goog.js';
goog.declareModuleId('Blockly.Dart.all');

import './dart/colour.js';
import './dart/lists.js';
import './dart/logic.js';
import './dart/loops.js';
import './dart/math.js';
import './dart/procedures.js';
import './dart/text.js';
import './dart/variables.js';
import './dart/variables_dynamic.js';

export * from './dart/dart_generator.js';
