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

import * as goog from '../closure/goog/goog.js';
goog.declareModuleId('Blockly.Lua.all');

import './lua/colour.js';
import './lua/lists.js';
import './lua/logic.js';
import './lua/loops.js';
import './lua/math.js';
import './lua/procedures.js';
import './lua/text.js';
import './lua/variables.js';
import './lua/variables_dynamic.js';

export * from './lua/lua_generator.js';
