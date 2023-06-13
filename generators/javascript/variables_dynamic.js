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

import {javascriptGenerator} from '../javascript.js';
import './variables.js';

// JavaScript is dynamically typed.
javascriptGenerator['variables_get_dynamic'] =
    javascriptGenerator['variables_get'];
javascriptGenerator['variables_set_dynamic'] =
    javascriptGenerator['variables_set'];
