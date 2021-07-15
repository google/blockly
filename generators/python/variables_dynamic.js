/**
 * @license
 * Copyright 2018 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Generating Python for dynamic variable blocks.
 * @author fenichel@google.com (Rachel Fenichel)
 */
'use strict';

goog.provide('Blockly.Python.variablesDynamic');

goog.require('Blockly.Python');
goog.require('Blockly.Python.variables');


// Python is dynamically typed.
Blockly.Python['variables_get_dynamic'] = Blockly.Python['variables_get'];
Blockly.Python['variables_set_dynamic'] = Blockly.Python['variables_set'];
