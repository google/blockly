/**
 * Visual Blocks Language
 *
 * Copyright 2012 Google Inc.
 * http://blockly.googlecode.com/
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

Blockly.Dart.lists_create_empty = function() {
  // Create an empty list.
  return ['[]', Blockly.Dart.ORDER_ATOMIC];
};

Blockly.Dart.lists_create_with = function() {
  // Create a list with any number of elements of any type.
  var code = new Array(this.itemCount_);
  for (var n = 0; n < this.itemCount_; n++) {
    code[n] = Blockly.Dart.valueToCode(this, 'ADD' + n,
        Blockly.Dart.ORDER_NONE) || 'null';
  }
  var code = '[' + code.join(', ') + ']';
  return [code, Blockly.Dart.ORDER_ATOMIC];
};

Blockly.Dart.lists_repeat = function() {
  // Create a list with one element repeated.
  if (!Blockly.Dart.definitions_['lists_repeat']) {
    // Function adapted from Closure's goog.array.repeat.
    var functionName = Blockly.Dart.variableDB_.getDistinctName('lists_repeat',
        Blockly.Generator.NAME_TYPE);
    Blockly.Dart.lists_repeat.repeat = functionName;
    var func = [];
    func.push('List ' + functionName + '(value, n) {');
    func.push('  var array = new List(n);');
    func.push('  for (int i = 0; i < n; i++) {');
    func.push('    array[i] = value;');
    func.push('  }');
    func.push('  return array;');
    func.push('}');
    Blockly.Dart.definitions_['lists_repeat'] = func.join('\n');
  }
  var argument0 = Blockly.Dart.valueToCode(this, 'ITEM',
    Blockly.Dart.ORDER_NONE) || 'null';
  var argument1 = Blockly.Dart.valueToCode(this, 'NUM',
    Blockly.Dart.ORDER_NONE) || '0';
  var code = Blockly.Dart.lists_repeat.repeat +
      '(' + argument0 + ', ' + argument1 + ')';
  return [code, Blockly.Dart.ORDER_UNARY_POSTFIX];
};

Blockly.Dart.lists_length = function() {
  // List length.
  var argument0 = Blockly.Dart.valueToCode(this, 'VALUE',
      Blockly.Dart.ORDER_UNARY_POSTFIX) || '[]';
  return [argument0 + '.length', Blockly.Dart.ORDER_UNARY_POSTFIX];
};

Blockly.Dart.lists_isEmpty = function() {
  // Is the list empty?
  var argument0 = Blockly.Dart.valueToCode(this, 'VALUE',
      Blockly.Dart.ORDER_UNARY_POSTFIX) || '[]';
  return [argument0 + '.isEmpty', Blockly.Dart.ORDER_UNARY_POSTFIX];
};

Blockly.Dart.lists_indexOf = function() {
  // Find an item in the list.
  var operator = this.getTitleValue('END') == 'FIRST' ?
      'indexOf' : 'lastIndexOf';
  var argument0 = Blockly.Dart.valueToCode(this, 'FIND',
      Blockly.Dart.ORDER_NONE) || '\'\'';
  var argument1 = Blockly.Dart.valueToCode(this, 'VALUE',
      Blockly.Dart.ORDER_UNARY_POSTFIX) || '[]';
  var code = argument1 + '.' + operator + '(' + argument0 + ') + 1';
  return [code, Blockly.Dart.ORDER_UNARY_POSTFIX];
};

Blockly.Dart.lists_getIndex = function() {
  // Get element at index.
  // Note: Until January 2013 this block did not have MODE or WHERE inputs.
  var mode = this.getTitleValue('MODE') || 'GET';
  var where = this.getTitleValue('WHERE') || 'FROM_START';
  var at = Blockly.Dart.valueToCode(this, 'AT',
      Blockly.Dart.ORDER_UNARY_PREFIX) || '1';
  var list = Blockly.Dart.valueToCode(this, 'VALUE',
      Blockly.Dart.ORDER_UNARY_POSTFIX) || '[]';

  if (where == 'FIRST') {
    if (mode == 'GET') {
      var code = list + '.first';
      return [code, Blockly.Dart.ORDER_UNARY_POSTFIX];
    } else if (mode == 'GET_REMOVE') {
      var code = list + '.removeAt(0)';
      return [code, Blockly.Dart.ORDER_UNARY_POSTFIX];
    } else if (mode == 'REMOVE') {
      return list + '.removeAt(0);\n';
    }
  } else if (where == 'LAST') {
    if (mode == 'GET') {
      var code = list + '.last';
      return [code, Blockly.Dart.ORDER_UNARY_POSTFIX];
    } else if (mode == 'GET_REMOVE') {
      var code = list + '.removeLast()';
      return [code, Blockly.Dart.ORDER_UNARY_POSTFIX];
    } else if (mode == 'REMOVE') {
      return list + '.removeLast();\n';
    }
  } else if (where == 'FROM_START') {
    // Blockly uses one-based indicies.
    if (at.match(/^-?\d+$/)) {
      // If the index is a naked number, decrement it right now.
      at = parseInt(at, 10) - 1;
    } else {
      // If the index is dynamic, decrement it in code.
      at += ' - 1';
    }
    if (mode == 'GET') {
      var code = list + '[' + at + ']';
      return [code, Blockly.Dart.ORDER_UNARY_POSTFIX];
    } else if (mode == 'GET_REMOVE') {
      var code = list + '.removeAt(' + at + ')';
      return [code, Blockly.Dart.ORDER_UNARY_POSTFIX];
    } else if (mode == 'REMOVE') {
      return list + '.removeAt(' + at + ');\n';
    }
  } else if (where == 'FROM_END') {
    if (mode == 'GET') {
      if (!Blockly.Dart.definitions_['lists_get_from_end']) {
        var functionName = Blockly.Dart.variableDB_.getDistinctName(
            'lists_get_from_end', Blockly.Generator.NAME_TYPE);
        Blockly.Dart.lists_getIndex.lists_get_from_end = functionName;
        var func = [];
        func.push('dynamic ' + functionName + '(List myList, num x) {');
        func.push('  x = myList.length - x;');
        func.push('  return myList.removeAt(x);');
        func.push('}');
        Blockly.Dart.definitions_['lists_get_from_end'] = func.join('\n');
      }
      code = Blockly.Dart.lists_getIndex.lists_get_from_end +
          '(' + list + ', ' + at + ')';
      return [code, Blockly.Dart.ORDER_UNARY_POSTFIX];
    } else if (mode == 'GET_REMOVE' || mode == 'REMOVE') {
      if (!Blockly.Dart.definitions_['lists_remove_from_end']) {
        var functionName = Blockly.Dart.variableDB_.getDistinctName(
            'lists_remove_from_end', Blockly.Generator.NAME_TYPE);
        Blockly.Dart.lists_getIndex.lists_remove_from_end = functionName;
        var func = [];
        func.push('dynamic ' + functionName + '(List myList, num x) {');
        func.push('  x = myList.length - x;');
        func.push('  return myList.removeAt(x);');
        func.push('}');
        Blockly.Dart.definitions_['lists_remove_from_end'] = func.join('\n');
      }
      code = Blockly.Dart.lists_getIndex.lists_remove_from_end +
          '(' + list + ', ' + at + ')';
      if (mode == 'GET_REMOVE') {
        return [code, Blockly.Dart.ORDER_UNARY_POSTFIX];
      } else if (mode == 'REMOVE') {
        return code + ';\n';
      }
    }
  } else if (where == 'RANDOM') {
    if (!Blockly.Dart.definitions_['lists_get_random_item']) {
      Blockly.Dart.definitions_['import_dart_math'] =
          'import \'dart:math\' as Math;';
      var functionName = Blockly.Dart.variableDB_.getDistinctName(
          'lists_get_random_item', Blockly.Generator.NAME_TYPE);
      Blockly.Dart.lists_getIndex.random = functionName;
      var func = [];
      func.push('dynamic ' + functionName + '(List myList, bool remove) {');
      func.push('  int x = new Math.Random().nextInt(myList.length);');
      func.push('  if (remove) {');
      func.push('    return myList.removeAt(x);');
      func.push('  } else {');
      func.push('    return myList[x];');
      func.push('  }');
      func.push('}');
      Blockly.Dart.definitions_['lists_get_random_item'] = func.join('\n');
    }
    code = Blockly.Dart.lists_getIndex.random +
        '(' + list + ', ' + (mode != 'GET') + ')';
    if (mode == 'GET' || mode == 'GET_REMOVE') {
      return [code, Blockly.Dart.ORDER_UNARY_POSTFIX];
    } else if (mode == 'REMOVE') {
      return code + ';\n';
    }
  }
  throw 'Unhandled combination (lists_getIndex).';
};

Blockly.Dart.lists_setIndex = function() {
  // Set element at index.
  // Note: Until February 2013 this block did not have MODE or WHERE inputs.
  var list = Blockly.Dart.valueToCode(this, 'LIST',
      Blockly.Dart.ORDER_UNARY_POSTFIX) || '[]';
  var mode = this.getTitleValue('MODE') || 'GET';
  var where = this.getTitleValue('WHERE') || 'FROM_START';
  var at = Blockly.Dart.valueToCode(this, 'AT',
      Blockly.Dart.ORDER_ADDITIVE) || '1';
  var value = Blockly.Dart.valueToCode(this, 'TO',
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
  if (where == 'FIRST') {
    if (mode == 'SET') {
      return list + '[0] = ' + value + ';\n';
    } else if (mode == 'INSERT') {
      return list + '.insertRange(0, 1, ' + value + ');\n';
    }
  } else if (where == 'LAST') {
    if (mode == 'SET') {
      var code = cacheList();
      code += list + '[' + list + '.length - 1] = ' + value + ';\n';
      return code;
    } else if (mode == 'INSERT') {
      return list + '.addLast(' + value + ');\n';
    }
  } else if (where == 'FROM_START') {
    // Blockly uses one-based indicies.
    if (at.match(/^\d+$/)) {
      // If the index is a naked number, decrement it right now.
      at = parseInt(at, 10) - 1;
    } else {
      // If the index is dynamic, decrement it in code.
      at += ' - 1';
    }
    if (mode == 'SET') {
      return list + '[' + at + '] = ' + value + ';\n';
    } else if (mode == 'INSERT') {
      return list + '.insertRange(' + at + ', 1, ' + value + ');\n';
    }
  } else if (where == 'FROM_END') {
    var code = cacheList();
    if (mode == 'SET') {
      code += list + '[' + list + '.length - ' + at + '] = ' + value + ';\n';
      return code;
    } else if (mode == 'INSERT') {
      code += list + '.insertRange(' + list + '.length - ' + at + ', 1, ' +
          value + ');\n';
      return code;
    }
  } else if (where == 'RANDOM') {
    Blockly.Dart.definitions_['import_dart_math'] =
        'import \'dart:math\' as Math;';
    var code = cacheList();
    var xVar = Blockly.Dart.variableDB_.getDistinctName(
        'tmp_x', Blockly.Variables.NAME_TYPE);
    code += 'int ' + xVar + ' = new Math.Random().nextInt(' + list + '.length);';
    if (mode == 'SET') {
      code += list + '[' + xVar + '] = ' + value + ';\n';
      return code;
    } else if (mode == 'INSERT') {
      code += list + '.insertRange(' + xVar + ', 1, ' + value + ');\n';
      return code;
    }
  }
  throw 'Unhandled combination (lists_setIndex).';
};
