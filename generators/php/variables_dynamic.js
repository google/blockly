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

import {phpGenerator} from '../php.js';
import './variables.js';


// generator is dynamically typed.
phpGenerator.forBlock['variables_get_dynamic'] =
    phpGenerator.forBlock['variables_get'];
phpGenerator.forBlock['variables_set_dynamic'] =
    phpGenerator.forBlock['variables_set'];
