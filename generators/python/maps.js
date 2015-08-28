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
  // Create an empty list.
  return ['new HashMap()', Blockly.Python.ORDER_ATOMIC];
};

Blockly.Python['maps_create_with'] = function(block) {
  // Create a list with any number of elements of any type.
  var declVar = Blockly.Python.variableDB_.getDistinctName(
      'hashMap', Blockly.Variables.NAME_TYPE);
  var declCode = 'HashMap ' + declVar + ' = new HashMap();\n';
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
        declCode = declVar + '.put(' + key + ', ' + val + ');\n';
        Blockly.Python.stashStatement(declCode);
      } else {
        var itemCode = Blockly.Python.valueToCode(block, inputName,
            Blockly.Python.ORDER_NONE);
        if (itemCode) {
          declCode = declVar + '.putAll(' + itemCode + ');\n';
          Blockly.Python.stashStatement(declCode);
        }
      }
    }
  }
  return [declVar, Blockly.Python.ORDER_ATOMIC];
};

Blockly.Python['maps_length'] = function(block) {
  // List length.
  var argument0 = Blockly.Python.valueToCode(block, 'VALUE',
      Blockly.Python.ORDER_NONE) || '[]';
  if (argument0.slice(-14) === '.cloneObject()' ) {
    argument0 = argument0.slice(0,-14) + '.getObjectAsList()';
  }
  return [argument0 + '.size()', Blockly.Python.ORDER_FUNCTION_CALL];
};


Blockly.Python['maps_isempty'] = function(block) {
  // Is the list empty?
  var argument0 = Blockly.Python.valueToCode(block, 'MAP',
      Blockly.Python.ORDER_NONE) || '';
  var code = argument0 + '.size() == 0';
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

  var declCode = 'HashMap ' + declVar + ' = new HashMap();\n' +
      declVar + '.put(' + key + ', ' + val + ');\n';
  Blockly.Python.stashStatement(declCode);
  return [declVar, Blockly.Python.ORDER_LOGICAL_NOT];
};

Blockly.Python['maps_getIndex'] = function(block) {
  var mode = block.getFieldValue('MODE') || 'GET';
  var key = Blockly.Python.valueToCode(block, 'KEY',
      Blockly.Python.ORDER_NONE) || '""';
  var map = Blockly.Python.valueToCode(block, 'MAP',
      Blockly.Python.ORDER_MEMBER) || '';
  if (map.slice(-14) === '.cloneObject()' ) {
    map = map.slice(0,-14) + '.getObjectAsMap()';
  }

  if (mode == 'GET') {
    var code = map + '.get(' + key + ')';
    return [code, Blockly.Python.ORDER_MEMBER];
  } else {
    var code = map + '.remove(' + key + ')';
    if (mode == 'GET_REMOVE') {
      return [code, Blockly.Python.ORDER_FUNCTION_CALL];
    } else if (mode == 'REMOVE') {
      return code + ';\n';
    }
  }
  throw 'Unhandled combination (maps_getIndex).';
};

Blockly.Python['maps_setIndex'] = function(block) {
  // Is the list empty?
  var map = Blockly.Python.valueToCode(block, 'MAP',
      Blockly.Python.ORDER_MEMBER) || '[]';
  var val = Blockly.Python.valueToCode(block, 'VAL',
      Blockly.Python.ORDER_NONE) || 'null';
  var key = Blockly.Python.valueToCode(block, 'KEY',
      Blockly.Python.ORDER_NONE) || '""';
  var code = map + '.put(' + key + ', '+ val + ');\n';
  return code;
};

Blockly.Python['maps_keys'] = function(block) {
  // Is the list empty?
  var argument0 = Blockly.Python.valueToCode(block, 'VALUE',
      Blockly.Python.ORDER_NONE) || '[]';
  var code = argument0 + '.size() == 0';
  return [code, Blockly.Python.ORDER_LOGICAL_NOT];
};

Blockly.Python['controls_forEachKey'] = Blockly.Python['controls_forEach'] ;
