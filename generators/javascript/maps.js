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
 * @fileoverview Generating JavaScript for maps blocks.
 * @author toebes@extremenetworks.com (John Toebes)
 */
'use strict';

goog.provide('Blockly.JavaScript.maps');

goog.require('Blockly.JavaScript');

Blockly.JavaScript['maps_create_empty'] = function(block) {
  // Create an empty map.
  return ['{}', Blockly.JavaScript.ORDER_ATOMIC];
};

Blockly.JavaScript['maps_create_with'] = function(block) {
  // Create a map with any number of elements of any type.
  var declVar = Blockly.JavaScript.variableDB_.getDistinctName(
      'hashMap', Blockly.Variables.NAME_TYPE);
  var declCode = declVar + ' = {};\n';
  Blockly.JavaScript.stashStatement(declCode);
  for (var n = 0; n < block.itemCount_; n++) {
    var inputName = 'ADD' + n;
    var inputBlock = block.getInputTargetBlock(inputName);
    if (inputBlock) {
      if (inputBlock.type === 'maps_create') {
        var val = Blockly.JavaScript.valueToCode(inputBlock, 'VAL',
            Blockly.JavaScript.ORDER_NONE) || 'null';
        var key = Blockly.JavaScript.valueToCode(inputBlock, 'KEY',
            Blockly.JavaScript.ORDER_NONE) || '""';
        declCode = declVar + "[" + key + "] = " + val + ";\n";
        Blockly.JavaScript.stashStatement(declCode);
      } else {
        var itemCode = Blockly.JavaScript.valueToCode(block, inputName,
            Blockly.JavaScript.ORDER_NONE);
        if (itemCode) { //this is assuming jquery is available
          declCode = '$.extend({}, '+declVar + ', ' + itemCode + ');\n';
          Blockly.JavaScript.stashStatement(declCode);
        }
      }
    }
  }
  return [declVar, Blockly.JavaScript.ORDER_ATOMIC];
};

Blockly.JavaScript['maps_length'] = function(block) {
  // List length.
  var argument0 = Blockly.JavaScript.valueToCode(block, 'MAP',
      Blockly.JavaScript.ORDER_NONE) || '{}';
  return [argument0 + '.length', Blockly.JavaScript.ORDER_FUNCTION_CALL];
};


Blockly.JavaScript['maps_isempty'] = function(block) {
  // Is the list empty?
  var argument0 = Blockly.JavaScript.valueToCode(block, 'MAP',
      Blockly.JavaScript.ORDER_NONE) || '';
  var code = argument0 + '.length == 0';
  if (argument0 === '') {
    code = 'true';
  }
  return [code, Blockly.JavaScript.ORDER_LOGICAL_NOT];
};

Blockly.JavaScript['maps_create'] = function(block) {
  var val = Blockly.JavaScript.valueToCode(block, 'VAL',
      Blockly.JavaScript.ORDER_NONE) || 'null';
  var key = Blockly.JavaScript.valueToCode(block, 'KEY',
      Blockly.JavaScript.ORDER_NONE) || '""';
  var declVar = Blockly.JavaScript.variableDB_.getDistinctName(
      'hashMap', Blockly.Variables.NAME_TYPE);

  var declCode = declVar + ' = {};\n' +
      declVar + '[' + key + '] = ' + val + ';\n';
  Blockly.JavaScript.stashStatement(declCode);
  return [declVar, Blockly.JavaScript.ORDER_LOGICAL_NOT];
};

Blockly.JavaScript['maps_getIndex'] = function(block) {
  var mode = block.getFieldValue('MODE') || 'GET';
  var key = Blockly.JavaScript.valueToCode(block, 'KEY',
      Blockly.JavaScript.ORDER_NONE) || '""';
  var map = Blockly.JavaScript.valueToCode(block, 'MAP',
      Blockly.JavaScript.ORDER_MEMBER) || '';

  if (mode == 'GET') {
    var code = map + '[' + key + ']';
    return [code, Blockly.JavaScript.ORDER_MEMBER];
  } else {
    if (mode == 'GET_REMOVE') {
      var code = map + '[' + key + '];\n';
      code += 'delete ' + map + '[' + key + ']';
      return [code, Blockly.JavaScript.ORDER_FUNCTION_CALL];
    } else if (mode == 'REMOVE') {
      var code = 'delete ' + map + '[' + key + ']';
      return code + ';\n';
    }
  }
  throw 'Unhandled combination (maps_getIndex).';
};

Blockly.JavaScript['maps_setIndex'] = function(block) {
  // Is the list empty?
  var map = Blockly.JavaScript.valueToCode(block, 'MAP',
      Blockly.JavaScript.ORDER_MEMBER) || '{}';
  var val = Blockly.JavaScript.valueToCode(block, 'VAL',
      Blockly.JavaScript.ORDER_NONE) || 'null';
  var key = Blockly.JavaScript.valueToCode(block, 'KEY',
      Blockly.JavaScript.ORDER_NONE) || '""';
  var code = map + '[' + key + '] = '+ val + ';\n';
  return code;
};

Blockly.JavaScript['maps_keys'] = function(block) {
  // Is the list empty?
  var argument0 = Blockly.JavaScript.valueToCode(block, 'MAP',
      Blockly.JavaScript.ORDER_NONE) || '{}';
  var code = 'Object.keys(' + argument0 + ')';
  return [code, Blockly.JavaScript.ORDER_LOGICAL_NOT];
};

Blockly.JavaScript['controls_forEachKey'] = Blockly.JavaScript['controls_forEach'] ;
