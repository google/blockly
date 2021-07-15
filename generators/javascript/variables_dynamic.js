/**
 * @license
 * Copyright 2018 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Generating JavaScript for dynamic variable blocks.
 * @author fenichel@google.com (Rachel Fenichel)
 */
'use strict';

goog.provide('Blockly.JavaScript.variablesDynamic');

goog.require('Blockly.JavaScript');
goog.require('Blockly.JavaScript.variables');


// JavaScript is dynamically typed.
Blockly.JavaScript['variables_get_dynamic'] =
    Blockly.JavaScript['variables_get'];
Blockly.JavaScript['variables_set_dynamic'] =
    Blockly.JavaScript['variables_set'];
