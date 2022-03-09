/**
 * @license
 * Copyright 2018 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Generating PHP for dynamic variable blocks.
 */
'use strict';

goog.declareModuleId('Blockly.PHP.variablesDynamic');

import {PHP} from '../php.js';
import './variables.js';


// PHP is dynamically typed.
PHP['variables_get_dynamic'] = PHP['variables_get'];
PHP['variables_set_dynamic'] = PHP['variables_set'];
