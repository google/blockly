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

import {pythonGenerator as Python} from '../python.js';
import './variables.js';


// Python is dynamically typed.
Python.forBlock['variables_get_dynamic'] = Python.forBlock['variables_get'];
Python.forBlock['variables_set_dynamic'] = Python.forBlock['variables_set'];
