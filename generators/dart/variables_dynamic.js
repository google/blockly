/**
 * @license
 * Copyright 2018 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Generating Dart for dynamic variable blocks.
 */

import * as goog from '../../closure/goog/goog.js';
goog.declareModuleId('Blockly.Dart.variablesDynamic');

import {dartGenerator} from '../dart.js';
import './variables.js';


// generator is dynamically typed.
dartGenerator.forBlock['variables_get_dynamic'] =
    dartGenerator.forBlock['variables_get'];
dartGenerator.forBlock['variables_set_dynamic'] =
    dartGenerator.forBlock['variables_set'];
