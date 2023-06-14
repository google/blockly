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
import {luaGenerator, Order} from '../lua.js';


luaGenerator.forBlock['variables_get'] = function(block, generator) {
  // Variable getter.
  const code =
      luaGenerator.nameDB_.getName(
        block.getFieldValue('VAR'), NameType.VARIABLE);
  return [code, Order.ATOMIC];
};

luaGenerator.forBlock['variables_set'] = function(block, generator) {
  // Variable setter.
  const argument0 = luaGenerator.valueToCode(block, 'VALUE', Order.NONE) || '0';
  const varName =
      luaGenerator.nameDB_.getName(
        block.getFieldValue('VAR'), NameType.VARIABLE);
  return varName + ' = ' + argument0 + '\n';
};
