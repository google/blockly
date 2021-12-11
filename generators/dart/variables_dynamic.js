/**
 * @license
 * Copyright 2018 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Generating Dart for dynamic variable blocks.
 */
'use strict';

goog.module('Blockly.Dart.variablesDynamic');

const Dart = goog.require('Blockly.Dart');
/** @suppress {extraRequire} */
goog.require('Blockly.Dart.variables');


// Dart is dynamically typed.
Dart['variables_get_dynamic'] = Dart['variables_get'];
Dart['variables_set_dynamic'] = Dart['variables_set'];
