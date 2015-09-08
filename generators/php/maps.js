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
 * @fileoverview Generating PHP for maps blocks.
 * @author toebes@extremenetworks.com (John Toebes)
 */
'use strict';

goog.provide('Blockly.PHP.maps');

goog.require('Blockly.PHP');

Blockly.PHP['maps_create_empty'] = function(block) {
  // Create an empty list.
  return ['array()', Blockly.PHP.ORDER_ATOMIC];
};

Blockly.PHP['maps_create_with'] = function(block) {
  // Create a map with any number of elements of any type.
  var declVar = Blockly.PHP.variableDB_.getDistinctName(
      'hashMap', Blockly.Variables.NAME_TYPE);
  var declCode = declVar + ' = array();\n';
  Blockly.PHP.stashStatement(declCode);
  for (var n = 0; n < block.itemCount_; n++) {
    var inputName = 'ADD' + n;
    var inputBlock = block.getInputTargetBlock(inputName);
    if (inputBlock) {
      if (inputBlock.type === 'maps_create') {
        var val = Blockly.PHP.valueToCode(inputBlock, 'VAL',
            Blockly.PHP.ORDER_NONE) || 'null';
        var key = Blockly.PHP.valueToCode(inputBlock, 'KEY',
            Blockly.PHP.ORDER_NONE) || '""';
        declCode = declVar + "[" + key + "] = " + val + ";\n";
        Blockly.PHP.stashStatement(declCode);
      } else {
        var itemCode = Blockly.PHP.valueToCode(block, inputName,
            Blockly.PHP.ORDER_NONE);
        if (itemCode) {
          declCode = 'array_merge('+declVar + ',' + itemCode + ');\n';
          Blockly.PHP.stashStatement(declCode);
        }
      }
    }
  }
  return [declVar, Blockly.PHP.ORDER_ATOMIC];
};

Blockly.PHP['maps_length'] = function(block) {
  // List length.
  var argument0 = Blockly.PHP.valueToCode(block, 'MAP',
	      Blockly.PHP.ORDER_NONE) || 'array()';
  return ['count(' + argument0 + ')', Blockly.PHP.ORDER_FUNCTION_CALL];
};


Blockly.PHP['maps_isempty'] = function(block) {
  // Is the list empty?
  var argument0 = Blockly.PHP.valueToCode(block, 'MAP',
      Blockly.PHP.ORDER_NONE) || '';
  var code = 'count(' + argument0 + ') == 0';
  if (argument0 === '') {
    code = 'true';
  }
  return [code, Blockly.PHP.ORDER_LOGICAL_NOT];
};

Blockly.PHP['maps_create'] = function(block) {
  var val = Blockly.PHP.valueToCode(block, 'VAL',
      Blockly.PHP.ORDER_NONE) || 'null';
  var key = Blockly.PHP.valueToCode(block, 'KEY',
      Blockly.PHP.ORDER_NONE) || '""';
  var declVar = Blockly.PHP.variableDB_.getDistinctName(
      'hashMap', Blockly.Variables.NAME_TYPE);

  var declCode = declVar + ' = array();\n' +
      declVar + '[' + key + '] = ' + val + ';\n';
  Blockly.PHP.stashStatement(declCode);
  return [declVar, Blockly.PHP.ORDER_LOGICAL_NOT];
};

Blockly.PHP['maps_getIndex'] = function(block) {
  var mode = block.getFieldValue('MODE') || 'GET';
  var key = Blockly.PHP.valueToCode(block, 'KEY',
      Blockly.PHP.ORDER_NONE) || '""';
  var map = Blockly.PHP.valueToCode(block, 'MAP',
      Blockly.PHP.ORDER_MEMBER) || '';

  if (mode == 'GET') {
    var code = map + '[' + key + ']';
    return [code, Blockly.PHP.ORDER_MEMBER];
  } else {
    if (mode == 'GET_REMOVE') {
      var code = map + '[' + key + '];\n';
      code += 'unset(' + map + '[' + key + '])';
      return [code, Blockly.PHP.ORDER_FUNCTION_CALL];
    } else if (mode == 'REMOVE') {
      var code = 'unset(' + map + '[' + key + '])';
      return code + ';\n';
    }
  }
  throw 'Unhandled combination (maps_getIndex).';
};

Blockly.PHP['maps_setIndex'] = function(block) {
	  // Is the list empty?
	  var map = Blockly.PHP.valueToCode(block, 'MAP',
	      Blockly.PHP.ORDER_MEMBER) || 'array()';
	  var val = Blockly.PHP.valueToCode(block, 'VAL',
	      Blockly.PHP.ORDER_NONE) || 'null';
	  var key = Blockly.PHP.valueToCode(block, 'KEY',
	      Blockly.PHP.ORDER_NONE) || '""';
	  var code = map + '[' + key + '] = '+ val + ';\n';
	  return code;
};

Blockly.PHP['maps_keys'] = function(block) {
  // Is the list empty?
  var argument0 = Blockly.PHP.valueToCode(block, 'MAP',
      Blockly.PHP.ORDER_NONE) || 'array()';
  var code = 'array_keys(' + argument0 + ')';
  return [code, Blockly.PHP.ORDER_LOGICAL_NOT];
};

Blockly.PHP['controls_forEachKey'] = Blockly.PHP['controls_forEach'] ;
