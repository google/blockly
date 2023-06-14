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

import {luaGenerator} from './lua_generator.js';
import './variables.js';


// Lua is dynamically typed.
luaGenerator.forBlock['variables_get_dynamic'] =
    luaGenerator.forBlock['variables_get'];
luaGenerator.forBlock['variables_set_dynamic'] =
    luaGenerator.forBlock['variables_set'];
