/**
 * @license
 * Copyright 2016 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Generating Lua for variable blocks.
 */

import * as goog from '../../closure/goog/goog.js';
goog.declareModuleId('Blockly.Lua.variables');

import {NameType} from '../../core/names.js';
import {luaGenerator as Lua, Order} from '../lua.js';


Lua.forBlock['variables_get'] = function(block) {
  // Variable getter.
  const code =
      Lua.nameDB_.getName(block.getFieldValue('VAR'), NameType.VARIABLE);
  return [code, Order.ATOMIC];
};

Lua.forBlock['variables_set'] = function(block) {
  // Variable setter.
  const argument0 = Lua.valueToCode(block, 'VALUE', Order.NONE) || '0';
  const varName =
      Lua.nameDB_.getName(block.getFieldValue('VAR'), NameType.VARIABLE);
  return varName + ' = ' + argument0 + '\n';
};
