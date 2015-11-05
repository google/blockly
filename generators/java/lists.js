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
  Blockly.Java.addImport('java.util.LinkedList');
  return ['new LinkedList()', Blockly.Java.ORDER_ATOMIC];
};

Blockly.Java['lists_create_with'] = function(block) {
  // Create a list with any number of elements of any type.
  var code = new Array(block.itemCount_);

  var types = block.getOutput();
  if (!types.length) {
    types = ['Array'];
  }
  var typeArray = Blockly.Variables.Intersection(types,types);
  // Resolve the array of types down to a single type
  var argType0 = Blockly.Variables.resolveTypes(typeArray);
  var subType = null;
  if (argType0 && argType0.indexOf(':') > 0) {
    subType = argType0.substring(argType0.indexOf(':') + 1);
    subType = Blockly.Java.mapType(subType);
  }

  if (subType === 'double') {
    subType = 'Double';
  }
  var oldType = Blockly.Java.setTargetType(subType);
  for (var n = 0; n < block.itemCount_; n++) {
    code[n] = Blockly.Java.valueToCode(block, 'ADD' + n,
        Blockly.Java.ORDER_NONE) || 'null';
    if (subType === 'Var') {
      code[n] = 'Var.valueOf('+code[n]+')';
    }
  }
  Blockly.Java.setTargetType(oldType);

  Blockly.Java.addImport('java.util.Arrays');
  Blockly.Java.addImport('java.util.LinkedList');

  code = 'new LinkedList<>(Arrays.asList(' + code.join(', ') + '))';

  return [code, Blockly.Java.ORDER_ATOMIC];
};

Blockly.Java['lists_repeat'] = function(block) {
  // Create a list with one element repeated.
  var argument0 = Blockly.Java.valueToCode(block, 'ITEM',
      Blockly.Java.ORDER_NONE) || 'None';
  var argument1 = Blockly.Java.valueToCode(block, 'NUM',
      Blockly.Java.ORDER_MULTIPLICATIVE) || '0';
  Blockly.Java.addImport('java.util.LinkedList');
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
  if (argument0.slice(-14) === '.cloneObject()' ) {
    argument0 = argument0.slice(0,-14) + '.getObjectAsList()';
  }
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
  if (argument1.slice(-14) === '.cloneObject()' ) {
    argument1 = argument1.slice(0,-14) + '.getObjectAsList()';
  }
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
  if (list.slice(-14) === '.cloneObject()' ) {
    list = list.slice(0,-14) + '.getObjectAsList()';
  }

  if (where == 'FIRST') {
    if (mode == 'GET') {
      var code = list + '.getFirst()';
      return [code, Blockly.Java.ORDER_MEMBER];
    } else {
      var code = list + '.removeFirst()';
      if (mode == 'GET_REMOVE') {
        return [code, Blockly.Java.ORDER_FUNCTION_CALL];
      } else if (mode == 'REMOVE') {
        return code + ';\n';
      }
    }
  } else if (where == 'LAST') {
    if (mode == 'GET') {
      var code = list + '.getLast()';
      return [code, Blockly.Java.ORDER_MEMBER];
    } else {
      var code = list + '.removeLast()';
      if (mode == 'GET_REMOVE') {
        return [code, Blockly.Java.ORDER_FUNCTION_CALL];
      } else if (mode == 'REMOVE') {
        return code + ';\n';
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
      var code = list + '.get((int)' + at + ')';
      return [code, Blockly.Java.ORDER_MEMBER];
    } else {
      var code = list + '.remove((int)' + at + ')';
      if (mode == 'GET_REMOVE') {
        return [code, Blockly.Java.ORDER_FUNCTION_CALL];
      } else if (mode == 'REMOVE') {
        return code + ';\n';
      }
    }
  } else if (where == 'FROM_END') {
    if (mode == 'GET') {
      var code = list + '.get(' + list + '.size() - (int)' + at + ')';
      return [code, Blockly.Java.ORDER_MEMBER];
    } else {
      var code = list + '.remove(' + list + '.size() - (int)' + at + ')';
      if (mode == 'GET_REMOVE') {
        return [code, Blockly.Java.ORDER_FUNCTION_CALL];
      } else if (mode == 'REMOVE') {
        return code + ';\n';
      }
    }
  } else if (where == 'RANDOM') {
    Blockly.Java.addImport('java.lang.Math');
    if (mode == 'GET') {
      code = list +'.get((int)(Math.random() * ' + list + '.size()))';
      return [code, Blockly.Java.ORDER_FUNCTION_CALL];
    } else {
      Blockly.Java.addImport('java.util.LinkedList');
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
  if (list.slice(-14) === '.cloneObject()' ) {
    list = list.slice(0,-14) + '.getObjectAsList()';
  }
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
      return list + '.set(0, ' + value + ');\n';
    } else if (mode == 'INSERT') {
      return list + '.addFirst(' + value + ');\n';
    }
  } else if (where == 'LAST') {
    if (mode == 'SET') {
      return list + '.set(' + list + '.size()-1, ' + value + ');\n';
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
      at = '((int)' + at + ' - 1)';
    }
    if (mode == 'SET') {
      return list + '.set(' + at + ', ' + value + ');\n';
    } else if (mode == 'INSERT') {
      return list + '.add(' + at + ', ' + value + ');\n';
    }
  } else if (where == 'FROM_END') {
    // Blockly uses one-based indicies.
    if (Blockly.isNumber(at)) {
      // If the index is a naked number, decrement it right now.
      at = parseInt(at, 10);
    } else {
      // If the index is dynamic, decrement it in code.
      at = '((int)' + at + ')';
    }
    if (mode == 'SET') {
      return list + '.set(' + list + '.size() -'+ at + ', ' + value + ');\n';
    } else if (mode == 'INSERT') {
      return list + '.add(' + list + '.size() -'+ at + ', ' + value + ');\n';
    }
  } else if (where == 'RANDOM') {
    Blockly.Java.addImport('java.util.Random');
    var code = cacheList();
    var xVar = Blockly.Java.variableDB_.getDistinctName(
        'tmp_x', Blockly.Variables.NAME_TYPE);
    code += 'int ' + xVar + ' = (int)(Math.random() * ' + list + '.size());\n';
    if (mode == 'SET') {
      code += list + '.set(' + xVar + ', ' + value + ');\n';
      return code;
    } else if (mode == 'INSERT') {
      code += list + '.add(' + xVar + ', ' + value + ');\n';
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
  if (list.slice(-14) === '.cloneObject()' ) {
    list = list.slice(0,-14) + '.getObjectAsList()';
  }
  if (where1 == 'FIRST' || (where1 == 'FROM_START' && at1 == '1')) {
    at1 = '0';
  } else if (where1 == 'FROM_START') {
    // Blockly uses one-based indicies.
    if (Blockly.isNumber(at1)) {
      // If the index is a naked number, decrement it right now.
      at1 = parseInt(at1, 10) - 1;
    } else {
      // If the index is dynamic, decrement it in code.
      at1 = '((int)' + at1 + ' - 1)';
    }
  } else if (where1 == 'FROM_END') {
    if (Blockly.isNumber(at1)) {
      at1 = parseInt(at1, 10);
    } else {
      at1 = '((int)' + at1 + ')';
    }
    at1 = list + '.size() - ' + at1;
  }
  if (where2 == 'LAST' || (where2 == 'FROM_END' && at2 == '1')) {
    at2 = list + '.size()-1';
  } else if (where2 == 'FROM_START') {
    if (Blockly.isNumber(at2)) {
      at2 = parseInt(at2, 10) - 1;
    } else {
      at2 = '((int)' + at2 + '-1)';
    }
  } else if (where2 == 'FROM_END') {
    if (Blockly.isNumber(at2)) {
      // If the index is a naked number, increment it right now.
      at2 = parseInt(at2, 10);
      at2 = list + '.size() - ' + at2;
    } else {
      // If the index is dynamic, increment it in code.
      at2 = list + '.size() - ((int)' + at2 + '-1)';
    }
  }
  Blockly.Java.addImport('java.util.LinkedList');
  var functionName = Blockly.Java.provideFunction_(
       'lists_sublist',
      ['public static LinkedList ' + Blockly.Java.FUNCTION_NAME_PLACEHOLDER_ +
          '(List list, int startIndex, int endIndex) {',
           '  LinkedList<Object> result = new LinkedList<>();',
           '  int sizeList = list.size();',
           '  for(int x = startIndex; x <= endIndex && x < sizeList; x++) {',
           '    result.add(list.get(x));',
           '  }',
           '  return result;',
           '}']);
  var code = functionName + '(' + list + ', ' + at1 + ', ' + at2 + ')';
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
    Blockly.Java.addImport('java.util.LinkedList');
    var code = 'new LinkedList(Arrays.asList(' + value_input +
                  '.split(' + value_delim + ')))';
  } else if (mode == 'JOIN') {
    var value_input = Blockly.Java.valueToCode(block, 'INPUT',
        Blockly.Java.ORDER_NONE) || '[]';
    var value_delim = Blockly.Java.valueToCode(block, 'DELIM',
        Blockly.Java.ORDER_MEMBER) || '\'\'';
    if (value_input.slice(-14) === '.cloneObject()' ) {
      value_input = value_input.slice(0,-14) + '.getObjectAsList()';
    }
    Blockly.Java.addImport('java.lang.StringBuilder');
    Blockly.Java.provideVarClass();
    var functionName = Blockly.Java.provideFunction_(
         'lists_join',
        ['public static String ' + Blockly.Java.FUNCTION_NAME_PLACEHOLDER_ +
            '(List list, String separator) {',
            '  StringBuilder result = new StringBuilder();',
            '  String extra = "";',
            '  for (Object elem : list) {',
            '     result.append(extra);',
            '     result.append(new Var(elem).getObjectAsString());',
            '     extra = separator;',
            '  }',
            '  return result.toString();',
            '}']);
    var code = functionName + '(' + value_input + ', ' + value_delim + ')';
  } else {
    throw 'Unknown mode: ' + mode;
  }
  return [code, Blockly.Java.ORDER_FUNCTION_CALL];
};
