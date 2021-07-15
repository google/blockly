/**
 * @license
 * Copyright 2018 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Generating Dart for dynamic variable blocks.
 * @author fenichel@google.com (Rachel Fenichel)
 */
'use strict';

goog.provide('Blockly.Dart.variablesDynamic');

goog.require('Blockly.Dart');
goog.require('Blockly.Dart.variables');


// Dart is dynamically typed.
Blockly.Dart['variables_get_dynamic'] = Blockly.Dart['variables_get'];
Blockly.Dart['variables_set_dynamic'] = Blockly.Dart['variables_set'];
