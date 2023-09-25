/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Complete helper functions for generating Lua for
 *     blocks.  This is the entrypoint for lua_compressed.js.
 * @suppress {extraRequire}
 */

// Former goog.module ID: Blockly.Lua.all

import {LuaGenerator} from './lua/lua_generator.js';
import * as colour from './lua/colour.js';
import * as lists from './lua/lists.js';
import * as logic from './lua/logic.js';
import * as loops from './lua/loops.js';
import * as math from './lua/math.js';
import * as procedures from './lua/procedures.js';
import * as text from './lua/text.js';
import * as variables from './lua/variables.js';
import * as variablesDynamic from './lua/variables_dynamic.js';

export * from './lua/lua_generator.js';

/**
 * Lua code generator instance.
 * @type {!LuaGenerator}
 */
export const luaGenerator = new LuaGenerator();

// Install per-block-type generator functions:
Object.assign(
  luaGenerator.forBlock,
  colour, lists, logic, loops, math, procedures,
  text, variables, variablesDynamic
);
