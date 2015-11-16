/**
 * @license
 * Visual Blocks Language
 *
 * Copyright 2012 Google Inc.
 * https://developers.google.com/blockly/
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * @fileoverview Generating Python for maps blocks.
 * @author toebes@extremenetworks.com (John Toebes)
 */
'use strict';

goog.provide('Blockly.Python.maps');

goog.require('Blockly.Python');

Blockly.Python['maps_create_empty'] = function(block) {
  // Create an empty map.
  return ['{}', Blockly.Python.ORDER_ATOMIC];
};

Blockly.Python['maps_create_with'] = function(block) {
  // Create a map with any number of elements of any type.
  var declVar = Blockly.Python.variableDB_.getDistinctName(
      'hashMap', Blockly.Variables.NAME_TYPE);
  var declCode = declVar + ' = {}\n';
  Blockly.Python.addImport('Python.util.HashMap');
  Blockly.Python.stashStatement(declCode);
  for (var n = 0; n < block.itemCount_; n++) {
    var inputName = 'ADD' + n;
    var inputBlock = block.getInputTargetBlock(inputName);
    if (inputBlock) {
      if (inputBlock.type === 'maps_create') {
        var val = Blockly.Python.valueToCode(inputBlock, 'VAL',
            Blockly.Python.ORDER_NONE) || 'null';
        var key = Blockly.Python.valueToCode(inputBlock, 'KEY',
            Blockly.Python.ORDER_NONE) || '""';
        declCode = declVar + "[" + key + "] = " + val + "\n";
        Blockly.Python.stashStatement(declCode);
      } else {
        var itemCode = Blockly.Python.valueToCode(block, inputName,
            Blockly.Python.ORDER_NONE);
        if (itemCode) {
          declCode = declVar + '.update(' + itemCode + ')\n';
          Blockly.Python.stashStatement(declCode);
        }
      }
    }
  }
  return [declVar, Blockly.Python.ORDER_ATOMIC];
};

Blockly.Python['maps_length'] = function(block) {
  // List length.
  var argument0 = Blockly.Python.valueToCode(block, 'MAP',
      Blockly.Python.ORDER_NONE) || '{}';
  return ['len(' + argument0 + ')', Blockly.Python.ORDER_FUNCTION_CALL];
};


Blockly.Python['maps_isempty'] = function(block) {
  // Is the list empty?
  var argument0 = Blockly.Python.valueToCode(block, 'MAP',
      Blockly.Python.ORDER_NONE) || '';
  var code = 'len(' + argument0 + ') == 0';
  if (argument0 === '') {
    code = 'true';
  }
  return [code, Blockly.Python.ORDER_LOGICAL_NOT];
};

Blockly.Python['maps_create'] = function(block) {
  var val = Blockly.Python.valueToCode(block, 'VAL',
      Blockly.Python.ORDER_NONE) || 'null';
  var key = Blockly.Python.valueToCode(block, 'KEY',
      Blockly.Python.ORDER_NONE) || '""';
  var declVar = Blockly.Python.variableDB_.getDistinctName(
      'hashMap', Blockly.Variables.NAME_TYPE);

  var declCode = declVar + ' = {}\n' +
      declVar + '[' + key + '] = ' + val + '\n';
  Blockly.Python.stashStatement(declCode);
  return [declVar, Blockly.Python.ORDER_LOGICAL_NOT];
};

Blockly.Python['maps_getIndex'] = function(block) {
  var mode = block.getFieldValue('MODE') || 'GET';
  var key = Blockly.Python.valueToCode(block, 'KEY',
      Blockly.Python.ORDER_NONE) || '""';
  var map = Blockly.Python.valueToCode(block, 'MAP',
      Blockly.Python.ORDER_MEMBER) || '';

  if (mode == 'GET') {
    var code = map + '[' + key + ']';
    return [code, Blockly.Python.ORDER_MEMBER];
  } else {
    if (mode == 'GET_REMOVE') {
      var code = map + '[' + key + ']\n';
      code += 'del ' + map + '[' + key + ']';
      return [code, Blockly.Python.ORDER_FUNCTION_CALL];
    } else if (mode == 'REMOVE') {
      var code = 'del ' + map + '[' + key + ']';
      return code + '\n';
    }
  }
  throw 'Unhandled combination (maps_getIndex).';
};

Blockly.Python['maps_setIndex'] = function(block) {
  // Is the list empty?
  var map = Blockly.Python.valueToCode(block, 'MAP',
      Blockly.Python.ORDER_MEMBER) || '{}';
  var val = Blockly.Python.valueToCode(block, 'VAL',
      Blockly.Python.ORDER_NONE) || 'null';
  var key = Blockly.Python.valueToCode(block, 'KEY',
      Blockly.Python.ORDER_NONE) || '""';
  var code = map + '[' + key + '] = '+ val + '\n';
  return code;
};

Blockly.Python['maps_keys'] = function(block) {
  // Is the list empty?
  var argument0 = Blockly.Python.valueToCode(block, 'MAP',
      Blockly.Python.ORDER_NONE) || '{}';
  var code = ' list(' + argument0 + '.keys())';
  return [code, Blockly.Python.ORDER_LOGICAL_NOT];
};

Blockly.Python['controls_forEachKey'] = Blockly.Python['controls_forEach'] ;
