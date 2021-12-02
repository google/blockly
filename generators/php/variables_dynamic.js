/**
 * @license
 * Copyright 2018 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Generating PHP for dynamic variable blocks.
 * @suppress {extraRequire}
 */
'use strict';

goog.module('Blockly.PHP.variablesDynamic');

goog.require('Blockly.PHP');
goog.require('Blockly.PHP.variables');


// PHP is dynamically typed.
Blockly.PHP['variables_get_dynamic'] = Blockly.PHP['variables_get'];
Blockly.PHP['variables_set_dynamic'] = Blockly.PHP['variables_set'];
