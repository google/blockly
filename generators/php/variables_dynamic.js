/**
 * @license
 * Copyright 2018 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Generating PHP for dynamic variable blocks.
 */
'use strict';

goog.module('Blockly.PHP.variablesDynamic');

const PHP = goog.require('Blockly.PHP');
/** @suppress {extraRequire} */
goog.require('Blockly.PHP.variables');


// PHP is dynamically typed.
PHP['variables_get_dynamic'] = PHP['variables_get'];
PHP['variables_set_dynamic'] = PHP['variables_set'];
