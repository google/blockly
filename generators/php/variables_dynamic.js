/**
 * @license
 * Copyright 2018 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Generating PHP for dynamic variable blocks.
 */

import * as goog from '../../closure/goog/goog.js';
goog.declareModuleId('Blockly.PHP.variablesDynamic');

import {phpGenerator as PHP} from '../php.js';
import './variables.js';


// PHP is dynamically typed.
PHP.forBlock['variables_get_dynamic'] = PHP.forBlock['variables_get'];
PHP.forBlock['variables_set_dynamic'] = PHP.forBlock['variables_set'];
