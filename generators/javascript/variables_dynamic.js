/**
 * @license
 * Copyright 2018 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Generating JavaScript for dynamic variable blocks.
 */
'use strict';

goog.module('Blockly.JavaScript.variablesDynamic');

const JavaScript = goog.require('Blockly.JavaScript');
/** @suppress {extraRequire} */
goog.require('Blockly.JavaScript.variables');


// JavaScript is dynamically typed.
JavaScript['variables_get_dynamic'] = JavaScript['variables_get'];
JavaScript['variables_set_dynamic'] = JavaScript['variables_set'];
