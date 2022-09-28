/**
 * @license
 * Copyright 2018 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Generating Python for dynamic variable blocks.
 */
'use strict';

goog.module('Blockly.Python.variablesDynamic');

const Python = goog.require('Blockly.Python');
/** @suppress {extraRequire} */
goog.require('Blockly.Python.variables');


// Python is dynamically typed.
Python['variables_get_dynamic'] = Python['variables_get'];
Python['variables_set_dynamic'] = Python['variables_set'];
