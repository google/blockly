/**
 * @license
 * Visual Blocks Language
 *
 * Copyright 2014 Google Inc.
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
 * @fileoverview Generating Dart for list blocks.
 * @author fraser@google.com (Neil Fraser)
 */
'use strict';

goog.provide('Blockly.Dart.lists');

goog.require('Blockly.Dart');


Blockly.Dart.addReservedWords('Math');

Blockly.Dart['lists_create_empty'] = function(block) {
  // Create an empty list.
  return ['[]', Blockly.Dart.ORDER_ATOMIC];
};

Blockly.Dart['lists_create_with'] = function(block) {
  // Create a list with any number of elements of any type.
  var code = new Array(block.itemCount_);
  for (var n = 0; n < block.itemCount_; n++) {
    code[n] = Blockly.Dart.valueToCode(block, 'ADD' + n,
        Blockly.Dart.ORDER_NONE) || 'null';
  }
  code = '[' + code.join(', ') + ']';
  return [code, Blockly.Dart.ORDER_ATOMIC];
};

Blockly.Dart['lists_repeat'] = function(block) {
  // Create a list with one element repeated.
  var argument0 = Blockly.Dart.valueToCode(block, 'ITEM',
    Blockly.Dart.ORDER_NONE) || 'null';
  var argument1 = Blockly.Dart.valueToCode(block, 'NUM',
    Blockly.Dart.ORDER_NONE) || '0';
  var code = 'new List.filled(' + argument1 + ', ' + argument0 + ')';
  return [code, Blockly.Dart.ORDER_UNARY_POSTFIX];
};

Blockly.Dart['lists_length'] = function(block) {
  // String or array length.
  var argument0 = Blockly.Dart.valueToCode(block, 'VALUE',
      Blockly.Dart.ORDER_UNARY_POSTFIX) || '[]';
  return [argument0 + '.length', Blockly.Dart.ORDER_UNARY_POSTFIX];
};

Blockly.Dart['lists_isEmpty'] = function(block) {
  // Is the string null or array empty?
  var argument0 = Blockly.Dart.valueToCode(block, 'VALUE',
      Blockly.Dart.ORDER_UNARY_POSTFIX) || '[]';
  return [argument0 + '.isEmpty', Blockly.Dart.ORDER_UNARY_POSTFIX];
};

Blockly.Dart['lists_indexOf'] = function(block) {
  // Find an item in the list.
  var operator = block.getFieldValue('END') == 'FIRST' ?
      'indexOf' : 'lastIndexOf';
  var argument0 = Blockly.Dart.valueToCode(block, 'FIND',
      Blockly.Dart.ORDER_NONE) || '\'\'';
  var argument1 = Blockly.Dart.valueToCode(block, 'VALUE',
      Blockly.Dart.ORDER_UNARY_POSTFIX) || '[]';
  var code = argument1 + '.' + operator + '(' + argument0 + ')';
  if (Blockly.Dart.ONE_BASED_INDEXING) {
    return [code + ' + 1', Blockly.Dart.ORDER_ADDITIVE];
  }
  return [code, Blockly.Dart.ORDER_UNARY_POSTFIX];
};

Blockly.Dart['lists_getIndex'] = function(block) {
  // Get element at index.
  // Note: Until January 2013 this block did not have MODE or WHERE inputs.
  var mode = block.getFieldValue('MODE') || 'GET';
  var where = block.getFieldValue('WHERE') || 'FROM_START';
  var list = Blockly.Dart.valueToCode(block, 'VALUE',
      Blockly.Dart.ORDER_UNARY_POSTFIX) || '[]';

  switch (where) {
    case 'FIRST':
      if (mode == 'GET') {
        var code = list + '.first';
        return [code, Blockly.Dart.ORDER_UNARY_POSTFIX];
      } else if (mode == 'GET_REMOVE') {
        var code = list + '.removeAt(0)';
        return [code, Blockly.Dart.ORDER_UNARY_POSTFIX];
      } else if (mode == 'REMOVE') {
        return list + '.removeAt(0);\n';
      }
      break;
    case 'LAST':
      if (mode == 'GET') {
        var code = list + '.last';
        return [code, Blockly.Dart.ORDER_UNARY_POSTFIX];
      } else if (mode == 'GET_REMOVE') {
        var code = list + '.removeLast()';
        return [code, Blockly.Dart.ORDER_UNARY_POSTFIX];
      } else if (mode == 'REMOVE') {
        return list + '.removeLast();\n';
      }
      break;
    case 'FROM_START':
      var at = Blockly.Dart.getAdjusted(block, 'AT');
      if (mode == 'GET') {
        var code = list + '[' + at + ']';
        return [code, Blockly.Dart.ORDER_UNARY_POSTFIX];
      } else if (mode == 'GET_REMOVE') {
        var code = list + '.removeAt(' + at + ')';
        return [code, Blockly.Dart.ORDER_UNARY_POSTFIX];
      } else if (mode == 'REMOVE') {
        return list + '.removeAt(' + at + ');\n';
      }
      break;
    case 'FROM_END':
      var at = Blockly.Dart.getAdjusted(block, 'AT', 1);
      if (mode == 'GET') {
        var functionName = Blockly.Dart.provideFunction_(
            'lists_get_from_end',
            ['dynamic ' + Blockly.Dart.FUNCTION_NAME_PLACEHOLDER_ +
            '(List myList, num x) {',
              '  x = myList.length - x;',
              '  return myList[x];',
              '}']);
        code = functionName + '(' + list + ', ' + at + ')';
        return [code, Blockly.Dart.ORDER_UNARY_POSTFIX];
      } else if (mode == 'GET_REMOVE' || mode == 'REMOVE') {
        var functionName = Blockly.Dart.provideFunction_(
            'lists_remove_from_end',
            ['dynamic ' + Blockly.Dart.FUNCTION_NAME_PLACEHOLDER_ +
            '(List myList, num x) {',
              '  x = myList.length - x;',
              '  return myList.removeAt(x);',
              '}']);
        code = functionName + '(' + list + ', ' + at + ')';
        if (mode == 'GET_REMOVE') {
          return [code, Blockly.Dart.ORDER_UNARY_POSTFIX];
        } else if (mode == 'REMOVE') {
          return code + ';\n';
        }
      }
      break;
    case 'RANDOM':
      Blockly.Dart.definitions_['import_dart_math'] =
          'import \'dart:math\' as Math;';
      var functionName = Blockly.Dart.provideFunction_(
          'lists_get_random_item',
          ['dynamic ' + Blockly.Dart.FUNCTION_NAME_PLACEHOLDER_ +
          '(List myList, bool remove) {',
            '  int x = new Math.Random().nextInt(myList.length);',
            '  if (remove) {',
            '    return myList.removeAt(x);',
            '  } else {',
            '    return myList[x];',
            '  }',
            '}']);
      code = functionName + '(' + list + ', ' + (mode != 'GET') + ')';
      if (mode == 'GET' || mode == 'GET_REMOVE') {
        return [code, Blockly.Dart.ORDER_UNARY_POSTFIX];
      } else if (mode == 'REMOVE') {
        return code + ';\n';
      }
      break;
  }
  throw 'Unhandled combination (lists_getIndex).';
};

Blockly.Dart['lists_setIndex'] = function(block) {
  // Set element at index.
  // Note: Until February 2013 this block did not have MODE or WHERE inputs.
  var list = Blockly.Dart.valueToCode(block, 'LIST',
      Blockly.Dart.ORDER_UNARY_POSTFIX) || '[]';
  var mode = block.getFieldValue('MODE') || 'GET';
  var at = Blockly.Dart.valueToCode(block, 'AT',
      Blockly.Dart.ORDER_ADDITIVE) || '1';
  var value = Blockly.Dart.valueToCode(block, 'TO',
      Blockly.Dart.ORDER_ASSIGNMENT) || 'null';
  // Cache non-trivial values to variables to prevent repeated look-ups.
  // Closure, which accesses and modifies 'list'.
  function cacheList() {
    if (list.match(/^\w+$/)) {
      return '';
    }
    var listVar = Blockly.Dart.variableDB_.getDistinctName(
        'tmp_list', Blockly.Variables.NAME_TYPE);
    var code = 'List ' + listVar + ' = ' + list + ';\n';
    list = listVar;
    return code;
  }
  switch (block.getFieldValue('WHERE') || 'FROM_START') {
    case 'FIRST':
      if (mode == 'SET') {
        return list + '[0] = ' + value + ';\n';
      } else if (mode == 'INSERT') {
        return list + '.insert(0, ' + value + ');\n';
      }
      break;
    case 'LAST':
      if (mode == 'SET') {
        var code = cacheList();
        code += list + '[' + list + '.length - 1] = ' + value + ';\n';
        return code;
      } else if (mode == 'INSERT') {
        return list + '.add(' + value + ');\n';
      }
      break;
    case 'FROM_START':
      var at = Blockly.Dart.getAdjusted(block, 'AT');
      if (mode == 'SET') {
        return list + '[' + at + '] = ' + value + ';\n';
      } else if (mode == 'INSERT') {
        return list + '.insert(' + at + ', ' + value + ');\n';
      }
      break;
    case 'FROM_END':
      var at = Blockly.Dart.getAdjusted(block, 'AT', 1, false,
          Blockly.Dart.ORDER_ADDITIVE);
      var code = cacheList();
      if (mode == 'SET') {
        code += list + '[' + list + '.length - ' + at + '] = ' + value +
            ';\n';
        return code;
      } else if (mode == 'INSERT') {
        code += list + '.insert(' + list + '.length - ' + at + ', ' +
            value + ');\n';
        return code;
      }
      break;
    case 'RANDOM':
      Blockly.Dart.definitions_['import_dart_math'] =
          'import \'dart:math\' as Math;';
      var code = cacheList();
      var xVar = Blockly.Dart.variableDB_.getDistinctName(
          'tmp_x', Blockly.Variables.NAME_TYPE);
      code += 'int ' + xVar +
          ' = new Math.Random().nextInt(' + list + '.length);\n';
      if (mode == 'SET') {
        code += list + '[' + xVar + '] = ' + value + ';\n';
        return code;
      } else if (mode == 'INSERT') {
        code += list + '.insert(' + xVar + ', ' + value + ');\n';
        return code;
      }
      break;
  }
  throw 'Unhandled combination (lists_setIndex).';
};

Blockly.Dart['lists_getSublist'] = function(block) {
  // Get sublist.
  var list = Blockly.Dart.valueToCode(block, 'LIST',
      Blockly.Dart.ORDER_UNARY_POSTFIX) || '[]';
  var where1 = block.getFieldValue('WHERE1');
  var where2 = block.getFieldValue('WHERE2');
  if (list.match(/^\w+$/) || (where1 != 'FROM_END' && where2 == 'FROM_START')) {
    // If the list is a simple value or doesn't require a call for length, don't
    // generate a helper function.
    switch (where1) {
      case 'FROM_START':
        var at1 = Blockly.Dart.getAdjusted(block, 'AT1');
        break;
      case 'FROM_END':
        var at1 = Blockly.Dart.getAdjusted(block, 'AT1', 1, false,
            Blockly.Dart.ORDER_ADDITIVE);
        at1 = list + '.length - ' + at1;
        break;
      case 'FIRST':
        var at1 = '0';
        break;
      default:
        throw 'Unhandled option (lists_getSublist).';
    }
    switch (where2) {
      case 'FROM_START':
        var at2 = Blockly.Dart.getAdjusted(block, 'AT2', 1);
        break;
      case 'FROM_END':
        var at2 = Blockly.Dart.getAdjusted(block, 'AT2', 0, false,
            Blockly.Dart.ORDER_ADDITIVE);
        at2 = list + '.length - ' + at2;
        break;
      case 'LAST':
        break;
      default:
        throw 'Unhandled option (lists_getSublist).';
    }
    if (where2 == 'LAST') {
      var code = list + '.sublist(' + at1 + ')';
    } else {
      var code = list + '.sublist(' + at1 + ', ' + at2 + ')';
    }
  } else {
    var defaultAtIndex = (Blockly.Dart.ONE_BASED_INDEXING) ? '1' : '0';
    var at1 = Blockly.Dart.valueToCode(block, 'AT1',
            Blockly.Dart.ORDER_NONE) || defaultAtIndex;
    var at2 = Blockly.Dart.valueToCode(block, 'AT2',
            Blockly.Dart.ORDER_NONE) || defaultAtIndex;
    var sublistFunction = ['List ' + Blockly.Dart.FUNCTION_NAME_PLACEHOLDER_ +
    '(list, where1, at1, where2, at2) {',
      '  int getAt(where, at) {'];

    if (Blockly.Dart.ONE_BASED_INDEXING) {
      sublistFunction = sublistFunction.concat([
        '    if (where == \'FROM_START\') {',
        '      at--;',
        '    } else if (where == \'FROM_END\') {',
        '      at = list.length - at;']);
    } else {
      sublistFunction = sublistFunction.concat([
        '    if (where == \'FROM_END\') {',
        '      at = list.length - 1 - at;']);
    }

    sublistFunction = sublistFunction.concat([
        '    } else if (where == \'FIRST\') {',
        '      at = 0;',
        '    } else if (where == \'LAST\') {',
        '      at = list.length - 1;',
        '    } else {',
        '      throw \'Unhandled option (lists_getSublist).\';',
        '    }',
        '    return at;',
        '  }',
        '  at1 = getAt(where1, at1);',
        '  at2 = getAt(where2, at2) + 1;',
        '  return list.sublist(at1, at2);',
        '}']);
    var functionName = Blockly.Dart.provideFunction_(
        'lists_get_sublist', sublistFunction);
    var code = functionName + '(' + list + ', \'' +
        where1 + '\', ' + at1 + ', \'' + where2 + '\', ' + at2 + ')';
  }
  return [code, Blockly.Dart.ORDER_UNARY_POSTFIX];
};

Blockly.Dart['lists_sort'] = function(block) {
  // Block for sorting a list.
  var listCode = Blockly.Dart.valueToCode(block, 'LIST',
      Blockly.Dart.ORDER_UNARY_POSTFIX) || '[]';
  var direction = block.getFieldValue('DIRECTION') === '1' ? 1 : -1;
  var type = block.getFieldValue('TYPE');
  var sortFunctionName = Blockly.Dart.provideFunction_(
          'lists_sort',
  ['List ' + Blockly.Dart.FUNCTION_NAME_PLACEHOLDER_ +
      '(list, type, direction) {',
      '  var compareFuncs = {',
      '    "NUMERIC": (a, b) => direction * a.compareTo(b),',
      '    "TEXT": (a, b) => direction * a.toString().compareTo(b.toString()),',
      '    "IGNORE_CASE": ',
      '       (a, b) => direction * ',
      '      a.toString().toLowerCase().compareTo(b.toString().toLowerCase())',
      '  };',
      '  list = new List.from(list);', // Clone the list.
      '  var compare = compareFuncs[type];',
      '  list.sort(compare);',
      '  return list;',
    '}']);
  return [sortFunctionName + '(' + listCode + ', ' +
      '"' + type + '", ' + direction + ')',
      Blockly.Dart.ORDER_UNARY_POSTFIX];
};

Blockly.Dart['lists_split'] = function(block) {
  // Block for splitting text into a list, or joining a list into text.
  var value_input = Blockly.Dart.valueToCode(block, 'INPUT',
      Blockly.Dart.ORDER_UNARY_POSTFIX);
  var value_delim = Blockly.Dart.valueToCode(block, 'DELIM',
      Blockly.Dart.ORDER_NONE) || '\'\'';
  var mode = block.getFieldValue('MODE');
  if (mode == 'SPLIT') {
    if (!value_input) {
      value_input = '\'\'';
    }
    var functionName = 'split';
  } else if (mode == 'JOIN') {
    if (!value_input) {
      value_input = '[]';
    }
    var functionName = 'join';
  } else {
    throw 'Unknown mode: ' + mode;
  }
  var code = value_input + '.' + functionName + '(' + value_delim + ')';
  return [code, Blockly.Dart.ORDER_UNARY_POSTFIX];
};
