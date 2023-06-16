/**
 * @license
 * Copyright 2018 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Generating Python for dynamic variable blocks.
 */

import * as goog from '../../closure/goog/goog.js';
goog.declareModuleId('Blockly.Python.variablesDynamic');

import {pythonGenerator} from '../python.js';
import './variables.js';


// generator is dynamically typed.
pythonGenerator.forBlock['variables_get_dynamic'] = pythonGenerator.forBlock['variables_get'];
pythonGenerator.forBlock['variables_set_dynamic'] = pythonGenerator.forBlock['variables_set'];
