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
 * @fileoverview Generating Dart for maps blocks.
 * @author toebes@extremenetworks.com (John Toebes)
 */
'use strict';

goog.provide('Blockly.Dart.maps');

goog.require('Blockly.Dart');

Blockly.Dart['maps_create_empty'] = function(block) {
  // Create an empty list.
  return ['{}', Blockly.Dart.ORDER_ATOMIC];
};

Blockly.Dart['maps_create_with'] = function(block) {
  var declVar = null;
  var code = '';
  var addCode = '';

  // Create a list with any number of elements of any type.

  var extra = '{';
  for (var n = 0; n < block.itemCount_; n++) {
    var inputName = 'ADD' + n;
    var inputBlock = block.getInputTargetBlock(inputName);
    if (inputBlock) {
      if (inputBlock.type === 'maps_create') {
        var val = Blockly.Dart.valueToCode(inputBlock, 'VAL',
            Blockly.Dart.ORDER_NONE) || 'null';
        var key = Blockly.Dart.valueToCode(inputBlock, 'KEY',
            Blockly.Dart.ORDER_NONE) || '""';
        code += extra + key + ': ' + val;
        extra = ', ';
      } else {
        if (!declVar) {
          declVar = Blockly.Dart.variableDB_.getDistinctName(
            'map', Blockly.Variables.NAME_TYPE);
          if (code != '') {
            code = 'var ' + declVar + ' = ' + code + '};\n';
            Blockly.Dart.stashStatement(code);
            code = '';
            extra = '{';
          }
        }
        if (code != '') {
          Blockly.Dart.stashStatement(declVar + '.addAll(' + code + '});\n');
          code = '';
          extra = '{';
        }
        var itemCode = Blockly.Dart.valueToCode(block, inputName,
            Blockly.Dart.ORDER_NONE);
        if (itemCode) {
          declCode = declVar + '.addAll(' + itemCode + ');\n';
          Blockly.Dart.stashStatement(declCode);
        }
      }
    }
  }
  if (declVar) {
    if (code != '') {
      Blockly.Dart.stashStatement(declVar + '.addAll(' + code + '});\n');
    }
    code = declVar;
  }
  return [code, Blockly.Dart.ORDER_ATOMIC];
};

Blockly.Dart['maps_length'] = function(block) {
  // List length.
  var argument0 = Blockly.Dart.valueToCode(block, 'MAP',
      Blockly.Dart.ORDER_NONE) || '[]';
  return [argument0 + '.length()', Blockly.Dart.ORDER_FUNCTION_CALL];
};


Blockly.Dart['maps_isempty'] = function(block) {
  // Is the list empty?
  var argument0 = Blockly.Dart.valueToCode(block, 'MAP',
      Blockly.Dart.ORDER_NONE) || '';
  var code = argument0 + '.isempty';
  if (argument0 === '') {
    code = 'true';
  }
  return [code, Blockly.Dart.ORDER_LOGICAL_NOT];
};

Blockly.Dart['maps_create'] = function(block) {
  var val = Blockly.Dart.valueToCode(block, 'VAL',
      Blockly.Dart.ORDER_NONE) || 'null';
  var key = Blockly.Dart.valueToCode(block, 'KEY',
      Blockly.Dart.ORDER_NONE) || '""';
  var code = '{' + key + ': ' + val + '}';
  return [code, Blockly.Dart.ORDER_ATOMIC];
};

Blockly.Dart['maps_getIndex'] = function(block) {
  var mode = block.getFieldValue('MODE') || 'GET';
  var key = Blockly.Dart.valueToCode(block, 'KEY',
      Blockly.Dart.ORDER_NONE) || '""';
  var map = Blockly.Dart.valueToCode(block, 'MAP',
      Blockly.Dart.ORDER_MEMBER) || '';

  if (mode == 'GET') {
    var code = map + '[' + key + ']';
    return [code, Blockly.Dart.ORDER_MEMBER];
  } else {
    var code = map + '.remove(' + key + ')';
    if (mode == 'GET_REMOVE') {
      return [code, Blockly.Dart.ORDER_FUNCTION_CALL];
    } else if (mode == 'REMOVE') {
      return code + ';\n';
    }
  }
  throw 'Unhandled combination (maps_getIndex).';
};

Blockly.Dart['maps_setIndex'] = function(block) {
  // Is the list empty?
  var map = Blockly.Dart.valueToCode(block, 'MAP',
      Blockly.Dart.ORDER_MEMBER) || '[]';
  var val = Blockly.Dart.valueToCode(block, 'VAL',
      Blockly.Dart.ORDER_NONE) || 'null';
  var key = Blockly.Dart.valueToCode(block, 'KEY',
      Blockly.Dart.ORDER_NONE) || '""';
  var code = map + '[' + key + '] = '+ val + ';\n';
  return code;
};

Blockly.Dart['maps_keys'] = function(block) {
  // Is the list empty?
  var argument0 = Blockly.Dart.valueToCode(block, 'MAP',
      Blockly.Dart.ORDER_NONE) || '[]';
  var code = argument0 + '.keys()';
  return [code, Blockly.Dart.ORDER_LOGICAL_NOT];
};

Blockly.Dart['controls_forEachKey'] = Blockly.Dart['controls_forEach'] ;
