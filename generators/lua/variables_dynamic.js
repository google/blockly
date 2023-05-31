/**
 * @license
 * Copyright 2018 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Generating Lua for dynamic variable blocks.
 */

import * as goog from '../../closure/goog/goog.js';
goog.declareModuleId('Blockly.Lua.variablesDynamic');

import {luaGenerator as Lua} from '../lua.js';
import './variables.js';


// Lua is dynamically typed.
Lua['variables_get_dynamic'] = Lua['variables_get'];
Lua['variables_set_dynamic'] = Lua['variables_set'];
