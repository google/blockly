/**
 * @license
 * Copyright 2018 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Generating JavaScript for dynamic variable blocks.
 */

import * as goog from '../../closure/goog/goog.js';
goog.declareModuleId('Blockly.JavaScript.variablesDynamic');

import {javascriptGenerator as JavaScript} from '../javascript.js';
import './variables.js';

// JavaScript is dynamically typed.
JavaScript['variables_get_dynamic'] = JavaScript['variables_get'];
JavaScript['variables_set_dynamic'] = JavaScript['variables_set'];
