/**
 * @license
 * Copyright 2018 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Generating Go for dynamic variable blocks.
 * @author fenichel@google.com (Rachel Fenichel)
 */
'use strict';

goog.provide('Blockly.Go.variablesDynamic');

goog.require('Blockly.Go');
goog.require('Blockly.Go.variables');


// Go is dynamically typed.
Blockly.Go['variables_get_dynamic'] = Blockly.Go['variables_get'];
Blockly.Go['variables_set_dynamic'] = Blockly.Go['variables_set'];
