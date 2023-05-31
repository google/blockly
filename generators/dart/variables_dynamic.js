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

import {dartGenerator as Dart} from '../dart.js';
import './variables.js';


// Dart is dynamically typed.
Dart['variables_get_dynamic'] = Dart['variables_get'];
Dart['variables_set_dynamic'] = Dart['variables_set'];
