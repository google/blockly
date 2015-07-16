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
 * @fileoverview Generating Java for list blocks.
 * @author q.neutron@gmail.com (Quynh Neutron)
 */
'use strict';

goog.provide('Blockly.Java.lists');

goog.require('Blockly.Java');


Blockly.Java['lists_create_empty'] = function(block) {
  // Create an empty list.
  return ['new LinkedList()', Blockly.Java.ORDER_ATOMIC];
};

Blockly.Java['lists_create_with'] = function(block) {
  // Create a list with any number of elements of any type.
  var code = new Array(block.itemCount_['items']);
  for (var n = 0; n < block.itemCount_['items']; n++) {
    code[n] = Blockly.Java.valueToCode(block, 'ADD' + n,
        Blockly.Java.ORDER_NONE) || 'None';
  }
  Blockly.Java.addImport('java.util.Arrays');

  code = 'Arrays.asList(' + code.join(', ') + ')';
  return [code, Blockly.Java.ORDER_ATOMIC];
};

Blockly.Java['lists_repeat'] = function(block) {
  // Create a list with one element repeated.
  var argument0 = Blockly.Java.valueToCode(block, 'ITEM',
      Blockly.Java.ORDER_NONE) || 'None';
  var argument1 = Blockly.Java.valueToCode(block, 'NUM',
      Blockly.Java.ORDER_MULTIPLICATIVE) || '0';
  var functionName = Blockly.Java.provideFunction_(
       'lists_repeat',
      ['public static LinkedList ' + Blockly.Java.FUNCTION_NAME_PLACEHOLDER_ +
          '(Object item, int torepeat) {',
           '  LinkedList<Object> result = new LinkedList<>();',
           '  for(int x = 0; x < torepeat; x++) {',
           '    result.add(item);',
           '  }',
           '  return result;',
           '}']);
  var code = functionName + '(' + argument0 + ',' + argument1 + ')';
  return [code, Blockly.Java.ORDER_FUNCTION_CALL];
};

Blockly.Java['lists_length'] = function(block) {
  // List length.
  var argument0 = Blockly.Java.valueToCode(block, 'VALUE',
      Blockly.Java.ORDER_NONE) || '[]';
  return [argument0 + '.size()', Blockly.Java.ORDER_FUNCTION_CALL];
};

Blockly.Java['lists_isEmpty'] = function(block) {
  // Is the list empty?
  var argument0 = Blockly.Java.valueToCode(block, 'VALUE',
      Blockly.Java.ORDER_NONE) || '[]';
  var code = argument0 + '.size() == 0';
  return [code, Blockly.Java.ORDER_LOGICAL_NOT];
};

Blockly.Java['lists_indexOf'] = function(block) {
  // Find an item in the list.
  var operator = block.getFieldValue('END') == 'FIRST' ?
      'indexOf' : 'lastIndexOf';
  var argument0 = Blockly.Java.valueToCode(block, 'FIND',
      Blockly.Java.ORDER_NONE) || '[]';
  var argument1 = Blockly.Java.valueToCode(block, 'VALUE',
      Blockly.Java.ORDER_MEMBER) || '\'\'';
  var code = argument1 + '.' + operator + '(' + argument0 + ') + 1';
  return [code, Blockly.Java.ORDER_FUNCTION_CALL];
};

Blockly.Java['lists_getIndex'] = function(block) {
  // Get element at index.
  // Note: Until January 2013 this block did not have MODE or WHERE inputs.
  var mode = block.getFieldValue('MODE') || 'GET';
  var where = block.getFieldValue('WHERE') || 'FROM_START';
  var at = Blockly.Java.valueToCode(block, 'AT',
      Blockly.Java.ORDER_UNARY_SIGN) || '1';
  var list = Blockly.Java.valueToCode(block, 'VALUE',
      Blockly.Java.ORDER_MEMBER) || '[]';

  if (where == 'FIRST') {
    if (mode == 'GET') {
      var code = list + '.getJsonObject(0)';
      return [code, Blockly.Java.ORDER_MEMBER];
    } else {
      var code = list + '.pop(0)';
      if (mode == 'GET_REMOVE') {
        return [code, Blockly.Java.ORDER_FUNCTION_CALL];
      } else if (mode == 'REMOVE') {
        return code + '\n';
      }
    }
  } else if (where == 'LAST') {
    if (mode == 'GET') {
      var code = list + '[-1]';
      return [code, Blockly.Java.ORDER_MEMBER];
    } else {
      var code = list + '.pop()';
      if (mode == 'GET_REMOVE') {
        return [code, Blockly.Java.ORDER_FUNCTION_CALL];
      } else if (mode == 'REMOVE') {
        return code + '\n';
      }
    }
  } else if (where == 'FROM_START') {
    // Blockly uses one-based indicies.
    if (Blockly.isNumber(at)) {
      // If the index is a naked number, decrement it right now.
      at = parseInt(at, 10) - 1;
    } else {
      // If the index is dynamic, decrement it in code.
      at = '(' + at + ' - 1)';
    }
    if (mode == 'GET') {
      var code = list + '.get(' + at + ')';
      return [code, Blockly.Java.ORDER_MEMBER];
    } else {
      var code = list + '.pop(' + at + ')';
      if (mode == 'GET_REMOVE') {
        return [code, Blockly.Java.ORDER_FUNCTION_CALL];
      } else if (mode == 'REMOVE') {
        return code + '\n';
      }
    }
  } else if (where == 'FROM_END') {
    if (mode == 'GET') {
      var code = list + '[-' + at + ']';
      return [code, Blockly.Java.ORDER_MEMBER];
    } else {
      var code = list + '.pop(-' + at + ')';
      if (mode == 'GET_REMOVE') {
        return [code, Blockly.Java.ORDER_FUNCTION_CALL];
      } else if (mode == 'REMOVE') {
        return code + '\n';
      }
    }
  } else if (where == 'RANDOM') {
    Blockly.Java.addImport('java.lang.Math');
    if (mode == 'GET') {
      code = list +'.get(Math.random() * ' + list + '.size())';
      return [code, Blockly.Java.ORDER_FUNCTION_CALL];
    } else {
      var functionName = Blockly.Java.provideFunction_(
          'lists_remove_random_item',
          ['public static Object ' + Blockly.Java.FUNCTION_NAME_PLACEHOLDER_ +
            '(LinkedList myList) {',
           '  int x = (int)(Math.random() * myList.size());',
           '  return myList.remove(x);',
           '}']);
      code = functionName + '(' + list + ')';
      if (mode == 'GET_REMOVE') {
        return [code, Blockly.Java.ORDER_FUNCTION_CALL];
      } else if (mode == 'REMOVE') {
        return code + ';\n';
      }
    }
  }
  throw 'Unhandled combination (lists_getIndex).';
};

Blockly.Java['lists_setIndex'] = function(block) {
  // Set element at index.
  // Note: Until February 2013 this block did not have MODE or WHERE inputs.
  var list = Blockly.Java.valueToCode(block, 'LIST',
      Blockly.Java.ORDER_MEMBER) || '[]';
  var mode = block.getFieldValue('MODE') || 'GET';
  var where = block.getFieldValue('WHERE') || 'FROM_START';
  var at = Blockly.Java.valueToCode(block, 'AT',
      Blockly.Java.ORDER_NONE) || '1';
  var value = Blockly.Java.valueToCode(block, 'TO',
      Blockly.Java.ORDER_NONE) || 'None';
  // Cache non-trivial values to variables to prevent repeated look-ups.
  // Closure, which accesses and modifies 'list'.
  function cacheList() {
    if (list.match(/^\w+$/)) {
      return '';
    }
    var listVar = Blockly.Java.variableDB_.getDistinctName(
        'tmp_list', Blockly.Variables.NAME_TYPE);
    var code = listVar + ' = ' + list + '\n';
    list = listVar;
    return code;
  }
  if (where == 'FIRST') {
    if (mode == 'SET') {
      return list + '[0] = ' + value + '\n';
    } else if (mode == 'INSERT') {
      return list + '.insert(0, ' + value + ')\n';
    }
  } else if (where == 'LAST') {
    if (mode == 'SET') {
      return list + '[-1] = ' + value + '\n';
    } else if (mode == 'INSERT') {
      return list + '.add(' + value + ');\n';
    }
  } else if (where == 'FROM_START') {
    // Blockly uses one-based indicies.
    if (Blockly.isNumber(at)) {
      // If the index is a naked number, decrement it right now.
      at = parseInt(at, 10) - 1;
    } else {
      // If the index is dynamic, decrement it in code.
      at = 'int(' + at + ' - 1)';
    }
    if (mode == 'SET') {
      return list + '[' + at + '] = ' + value + '\n';
    } else if (mode == 'INSERT') {
      return list + '.insert(' + at + ', ' + value + ')\n';
    }
  } else if (where == 'FROM_END') {
    if (mode == 'SET') {
      return list + '[-' + at + '] = ' + value + '\n';
    } else if (mode == 'INSERT') {
      return list + '.insert(-' + at + ', ' + value + ')\n';
    }
  } else if (where == 'RANDOM') {
    Blockly.Java.addImport('java.util.Random');
    var code = cacheList();
    var xVar = Blockly.Java.variableDB_.getDistinctName(
        'tmp_x', Blockly.Variables.NAME_TYPE);
    code += xVar + ' = int(random.random() * ' + list + '.size())\n';
    if (mode == 'SET') {
      code += list + '[' + xVar + '] = ' + value + '\n';
      return code;
    } else if (mode == 'INSERT') {
      code += list + '.insert(' + xVar + ', ' + value + ')\n';
      return code;
    }
  }
  throw 'Unhandled combination (lists_setIndex).';
};

Blockly.Java['lists_getSublist'] = function(block) {
  // Get sublist.
  var list = Blockly.Java.valueToCode(block, 'LIST',
      Blockly.Java.ORDER_MEMBER) || '[]';
  var where1 = block.getFieldValue('WHERE1');
  var where2 = block.getFieldValue('WHERE2');
  var at1 = Blockly.Java.valueToCode(block, 'AT1',
      Blockly.Java.ORDER_ADDITIVE) || '1';
  var at2 = Blockly.Java.valueToCode(block, 'AT2',
      Blockly.Java.ORDER_ADDITIVE) || '1';
  if (where1 == 'FIRST' || (where1 == 'FROM_START' && at1 == '1')) {
    at1 = '';
  } else if (where1 == 'FROM_START') {
    // Blockly uses one-based indicies.
    if (Blockly.isNumber(at1)) {
      // If the index is a naked number, decrement it right now.
      at1 = parseInt(at1, 10) - 1;
    } else {
      // If the index is dynamic, decrement it in code.
      at1 = 'int(' + at1 + ' - 1)';
    }
  } else if (where1 == 'FROM_END') {
    if (Blockly.isNumber(at1)) {
      at1 = -parseInt(at1, 10);
    } else {
      at1 = '-int(' + at1 + ')';
    }
  }
  if (where2 == 'LAST' || (where2 == 'FROM_END' && at2 == '1')) {
    at2 = '';
  } else if (where1 == 'FROM_START') {
    if (Blockly.isNumber(at2)) {
      at2 = parseInt(at2, 10);
    } else {
      at2 = 'int(' + at2 + ')';
    }
  } else if (where1 == 'FROM_END') {
    if (Blockly.isNumber(at2)) {
      // If the index is a naked number, increment it right now.
      // Add special case for -0.
      at2 = 1 - parseInt(at2, 10);
      if (at2 == 0) {
        at2 = '';
      }
    } else {
      // If the index is dynamic, increment it in code.
      Blockly.Java.definitions_['import_sys'] = 'import sys';
      at2 = 'int(1 - ' + at2 + ') or sys.maxsize';
    }
  }
  var code = list + '[' + at1 + ' : ' + at2 + ']';
  return [code, Blockly.Java.ORDER_MEMBER];
};

Blockly.Java['lists_split'] = function(block) {
  // Block for splitting text into a list, or joining a list into text.
  var mode = block.getFieldValue('MODE');
  if (mode == 'SPLIT') {
    var value_input = Blockly.Java.valueToCode(block, 'INPUT',
        Blockly.Java.ORDER_MEMBER) || '\'\'';
    var value_delim = Blockly.Java.valueToCode(block, 'DELIM',
        Blockly.Java.ORDER_NONE);
    var code = value_input + '.split(' + value_delim + ')';
  } else if (mode == 'JOIN') {
    var value_input = Blockly.Java.valueToCode(block, 'INPUT',
        Blockly.Java.ORDER_NONE) || '[]';
    var value_delim = Blockly.Java.valueToCode(block, 'DELIM',
        Blockly.Java.ORDER_MEMBER) || '\'\'';
    var code = value_delim + '.join(' + value_input + ')';
  } else {
    throw 'Unknown mode: ' + mode;
  }
  return [code, Blockly.Java.ORDER_FUNCTION_CALL];
};
