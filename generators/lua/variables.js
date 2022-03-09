/**
 * @license
 * Copyright 2016 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Generating Lua for variable blocks.
 */
'use strict';

goog.declareModuleId('Blockly.Lua.variables');

import {Lua} from '../lua.js';
import {NameType} from '../../core/names.js';


Lua['variables_get'] = function(block) {
  // Variable getter.
  const code =
      Lua.nameDB_.getName(block.getFieldValue('VAR'), NameType.VARIABLE);
  return [code, Lua.ORDER_ATOMIC];
};

Lua['variables_set'] = function(block) {
  // Variable setter.
  const argument0 = Lua.valueToCode(block, 'VALUE', Lua.ORDER_NONE) || '0';
  const varName =
      Lua.nameDB_.getName(block.getFieldValue('VAR'), NameType.VARIABLE);
  return varName + ' = ' + argument0 + '\n';
};
