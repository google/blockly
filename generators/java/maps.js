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
 * @fileoverview Generating Java for maps blocks.
 * @author toebes@extremenetworks.com (John Toebes)
 */
'use strict';

goog.provide('Blockly.Java.maps');

goog.require('Blockly.Java');

Blockly.Java['maps_create_empty'] = function(block) {
  // Create an empty list.
  return ['new HashMap()', Blockly.Java.ORDER_ATOMIC];
};

Blockly.Java['maps_create_with'] = function(block) {
  // Create a list with any number of elements of any type.
  var declVar = Blockly.Java.variableDB_.getDistinctName(
      'hashMap', Blockly.Variables.NAME_TYPE);
  var declCode = 'HashMap ' + declVar + ' = new HashMap();\n';
  Blockly.Java.addImport('java.util.HashMap');
  Blockly.Java.stashStatement(declCode);
  for (var n = 0; n < block.itemCount_; n++) {
    var inputName = 'ADD' + n;
    var inputBlock = block.getInputTargetBlock(inputName);
    if (inputBlock) {
      if (inputBlock.type === 'maps_create') {
        var val = Blockly.Java.valueToCode(inputBlock, 'VAL',
            Blockly.Java.ORDER_NONE) || 'null';
        var key = Blockly.Java.valueToCode(inputBlock, 'KEY',
            Blockly.Java.ORDER_NONE) || '""';
        declCode = declVar + '.put(' + key + ', ' + val + ');\n';
        Blockly.Java.stashStatement(declCode);
      } else {
        var itemCode = Blockly.Java.valueToCode(block, inputName,
            Blockly.Java.ORDER_NONE);
        if (itemCode) {
          declCode = declVar + '.putAll(' + itemCode + ');\n';
          Blockly.Java.stashStatement(declCode);
        }
      }
    }
  }
  return [declVar, Blockly.Java.ORDER_ATOMIC];
};

Blockly.Java['maps_length'] = function(block) {
  // List length.
  var argument0 = Blockly.Java.valueToCode(block, 'MAP',
      Blockly.Java.ORDER_NONE) || 'new HashMap()';
  if (argument0.slice(-14) === '.cloneObject()' ) {
    argument0 = argument0.slice(0,-14) + '.getObjectAsList()';
  }
  return [argument0 + '.size()', Blockly.Java.ORDER_FUNCTION_CALL];
};


Blockly.Java['maps_isempty'] = function(block) {
  // Is the list empty?
  var argument0 = Blockly.Java.valueToCode(block, 'MAP',
      Blockly.Java.ORDER_NONE) || '';
  var code = argument0 + '.size() == 0';
  if (argument0 === '') {
    code = 'true';
  }
  return [code, Blockly.Java.ORDER_LOGICAL_NOT];
};

Blockly.Java['maps_create'] = function(block) {
  var val = Blockly.Java.valueToCode(block, 'VAL',
      Blockly.Java.ORDER_NONE) || 'null';
  var key = Blockly.Java.valueToCode(block, 'KEY',
      Blockly.Java.ORDER_NONE) || '""';
  var declVar = Blockly.Java.variableDB_.getDistinctName(
      'hashMap', Blockly.Variables.NAME_TYPE);

  var declCode = 'HashMap ' + declVar + ' = new HashMap();\n' +
      declVar + '.put(' + key + ', ' + val + ');\n';
  Blockly.Java.stashStatement(declCode);
  return [declVar, Blockly.Java.ORDER_LOGICAL_NOT];
};

Blockly.Java['maps_getIndex'] = function(block) {
  var mode = block.getFieldValue('MODE') || 'GET';
  var key = Blockly.Java.valueToCode(block, 'KEY',
      Blockly.Java.ORDER_NONE) || '""';
  var map = Blockly.Java.valueToCode(block, 'MAP',
      Blockly.Java.ORDER_MEMBER) || '';
  if (map.slice(-14) === '.cloneObject()' ) {
    map = map.slice(0,-14) + '.getObjectAsMap()';
  }

  if (mode == 'GET') {
    var code = map + '.get(' + key + ')';
    return [code, Blockly.Java.ORDER_MEMBER];
  } else {
    var code = map + '.remove(' + key + ')';
    if (mode == 'GET_REMOVE') {
      return [code, Blockly.Java.ORDER_FUNCTION_CALL];
    } else if (mode == 'REMOVE') {
      return code + ';\n';
    }
  }
  throw 'Unhandled combination (maps_getIndex).';
};

Blockly.Java['maps_setIndex'] = function(block) {
  // Is the list empty?
  var map = Blockly.Java.valueToCode(block, 'MAP',
      Blockly.Java.ORDER_MEMBER) || 'new HashMap()';
  var val = Blockly.Java.valueToCode(block, 'VAL',
      Blockly.Java.ORDER_NONE) || 'null';
  var key = Blockly.Java.valueToCode(block, 'KEY',
      Blockly.Java.ORDER_NONE) || '""';
  var code = map + '.put(' + key + ', '+ val + ');\n';
  return code;
};

Blockly.Java['maps_keys'] = function(block) {
  // Is the list empty?
  var argument0 = Blockly.Java.valueToCode(block, 'MAP',
      Blockly.Java.ORDER_NONE) || 'new HashMap()';
  var code = argument0 + '.keySet()';
  return [code, Blockly.Java.ORDER_LOGICAL_NOT];
};

Blockly.Java['controls_forEachKey'] = Blockly.Java['controls_forEach'] ;
