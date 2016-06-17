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
 * @fileoverview Generating Python for list blocks.
 * @author q.neutron@gmail.com (Quynh Neutron)
 */
'use strict';

goog.provide('Blockly.Python.lists');

goog.require('Blockly.Python');


Blockly.Python['lists_create_empty'] = function(block) {
  // Create an empty list.
  return ['[]', Blockly.Python.ORDER_ATOMIC];
};

Blockly.Python['lists_create_with'] = function(block) {
  // Create a list with any number of elements of any type.
  var code = new Array(block.itemCount_);
  for (var n = 0; n < block.itemCount_; n++) {
    code[n] = Blockly.Python.valueToCode(block, 'ADD' + n,
        Blockly.Python.ORDER_NONE) || 'None';
  }
  code = '[' + code.join(', ') + ']';
  return [code, Blockly.Python.ORDER_ATOMIC];
};

Blockly.Python['lists_repeat'] = function(block) {
  // Create a list with one element repeated.
  var item = Blockly.Python.valueToCode(block, 'ITEM',
      Blockly.Python.ORDER_NONE) || 'None';
  var times = Blockly.Python.valueToCode(block, 'NUM',
      Blockly.Python.ORDER_MULTIPLICATIVE) || '0';
  var code = '[' + item + '] * ' + times;
  return [code, Blockly.Python.ORDER_MULTIPLICATIVE];
};

Blockly.Python['lists_length'] = function(block) {
  // String or array length.
  var list = Blockly.Python.valueToCode(block, 'VALUE',
      Blockly.Python.ORDER_NONE) || '[]';
  return ['len(' + list + ')', Blockly.Python.ORDER_FUNCTION_CALL];
};

Blockly.Python['lists_isEmpty'] = function(block) {
  // Is the string null or array empty?
  var list = Blockly.Python.valueToCode(block, 'VALUE',
      Blockly.Python.ORDER_NONE) || '[]';
  var code = 'not len(' + list + ')';
  return [code, Blockly.Python.ORDER_LOGICAL_NOT];
};

Blockly.Python['lists_indexOf'] = function(block) {
  // Find an item in the list.
  var item = Blockly.Python.valueToCode(block, 'FIND',
      Blockly.Python.ORDER_NONE) || '[]';
  var list = Blockly.Python.valueToCode(block, 'VALUE',
      Blockly.Python.ORDER_MEMBER) || '\'\'';
  if (Blockly.Python.ONE_BASED_INDEXING) {
    var exceptionIndex = ' 0';
    var firstIndexAdjustment = ' + 1';
    var lastIndexAdjustment = '';
  } else {
    var exceptionIndex = ' -1';
    var firstIndexAdjustment = '';
    var lastIndexAdjustment = ' - 1';
  }
  if (block.getFieldValue('END') == 'FIRST') {
    var functionName = Blockly.Python.provideFunction_(
        'first_index',
        ['def ' + Blockly.Python.FUNCTION_NAME_PLACEHOLDER_ + '(myList, elem):',
         '  try: theIndex = myList.index(elem)' + firstIndexAdjustment,
         '  except: theIndex =' + exceptionIndex,
         '  return theIndex']);
    var code = functionName + '(' + list + ', ' + item + ')';
    return [code, Blockly.Python.ORDER_FUNCTION_CALL];
  }
  var functionName = Blockly.Python.provideFunction_(
      'last_index',
      ['def ' + Blockly.Python.FUNCTION_NAME_PLACEHOLDER_ + '(myList, elem):',
       '  try: theIndex = len(myList) - myList[::-1].index(elem)' +
         lastIndexAdjustment,
       '  except: theIndex =' + exceptionIndex,
       '  return theIndex']);
  var code = functionName + '(' + list + ', ' + item + ')';
  return [code, Blockly.Python.ORDER_FUNCTION_CALL];
};

/**
 *
 * @param {string} at The index to adjust
 * @param {number} opt_delta
 * @param {boolean} opt_negate
 * @returns {string|number}
 */
Blockly.Python.castInt = function(at, opt_delta, opt_negate) {
  var delta = opt_delta || 0;
  if (Blockly.isNumber(at)) {
    // If the index is a naked number, adjust it right now.
    at = parseInt(at, 10) + delta;
    if (opt_negate) {
      at = -at;
    }
  } else {
    // If the index is dynamic, adjust it in code.
    if (delta > 0) {
      at = 'int(' + at + ' + ' + delta + ')';
    } else if (delta < 0) {
      at = 'int(' + at + ' - ' + -delta + ')';
    } else {
      at = 'int(' + at + ')';
    }
    if (opt_negate) {
      at = '-' + at;
    }
  }
  return at;
};


Blockly.Python['lists_getIndex'] = function(block) {
  // Get element at index.
  // Note: Until January 2013 this block did not have MODE or WHERE inputs.
  var mode = block.getFieldValue('MODE') || 'GET';
  var defaultAtIndex = (Blockly.Python.ONE_BASED_INDEXING) ? '1' : '0';
  // Special case to avoid wrapping function calls in unneeded parenthesis.
  // func()[0] is prefered over (func())[0]
  var valueBlock = this.getInputTargetBlock('VALUE');
  var order = (valueBlock && valueBlock.type == 'procedures_callreturn') ?
      Blockly.Python.ORDER_NONE : Blockly.Python.ORDER_MEMBER;
  var list = Blockly.Python.valueToCode(block, 'VALUE', order) || '[]';

  switch (block.getFieldValue('WHERE') || 'FROM_START') {
    case 'FIRST':
      if (mode == 'GET') {
        var code = list + '[0]';
        return [code, Blockly.Python.ORDER_MEMBER];
      } else if (mode == 'GET_REMOVE') {
        var code = list + '.pop(0)';
        return [code, Blockly.Python.ORDER_FUNCTION_CALL];
      } else if (mode == 'REMOVE') {
        return code + '.pop(0)\n';
      }
      break;
    case 'LAST':
        if (mode == 'GET') {
          var code = list + '[-1]';
          return [code, Blockly.Python.ORDER_MEMBER];
        } else if (mode == 'GET_REMOVE') {
          var code = list + '.pop()';
          return [code, Blockly.Python.ORDER_FUNCTION_CALL];
        } else if (mode == 'REMOVE') {
          return code + '.pop()\n';
        }
      break;
    case 'FROM_START':
        if (Blockly.Python.ONE_BASED_INDEXING) {
          var at = Blockly.Python.valueToCode(block, 'AT',
              Blockly.Python.ORDER_ADDITIVE) || defaultAtIndex;
          at = Blockly.Python.castInt(at, -1);
        } else {
          var at = Blockly.Python.valueToCode(block, 'AT',
              Blockly.Python.ORDER_NONE) || defaultAtIndex;
          at = Blockly.Python.castInt(at);
        }
        if (mode == 'GET') {
          var code = list + '[' + at + ']';
          return [code, Blockly.Python.ORDER_MEMBER];
        } else if (mode == 'GET_REMOVE') {
          var code = list + '.pop(' + at + ')';
          return [code, Blockly.Python.ORDER_FUNCTION_CALL];
        } else if (mode == 'REMOVE') {
          return list + '.pop(' + at + ')\n';
        }
      break;
    case'FROM_END':
        if (Blockly.Python.ONE_BASED_INDEXING) {
          var at = Blockly.Python.valueToCode(block, 'AT',
                  Blockly.Python.ORDER_NONE) || defaultAtIndex;
          at = Blockly.Python.castInt(at, 0, true);
        } else {
          var at = Blockly.Python.valueToCode(block, 'AT',
                  Blockly.Python.ORDER_ADDITIVE) || defaultAtIndex;
          at = Blockly.Python.castInt(at, 1, true);
        }
        if (mode == 'GET') {
          var code = list + '[-' + at + ']';
          return [code, Blockly.Python.ORDER_MEMBER];
        } else if (mode == 'GET_REMOVE') {
          var code = list + '.pop(-' + at + ')';
          return [code, Blockly.Python.ORDER_FUNCTION_CALL];
        } else if (mode == 'REMOVE') {
          return list + '.pop(-' + at + ')\n';
        }
      break;
    case 'RANDOM':
        Blockly.Python.definitions_['import_random'] = 'import random';
        if (mode == 'GET') {
          code = 'random.choice(' + list + ')';
          return [code, Blockly.Python.ORDER_FUNCTION_CALL];
        } else {
          var functionName = Blockly.Python.provideFunction_(
              'lists_remove_random_item',
              ['def ' + Blockly.Python.FUNCTION_NAME_PLACEHOLDER_ + '(myList):',
                '  x = int(random.random() * len(myList))',
                '  return myList.pop(x)']);
          code = functionName + '(' + list + ')';
          if (mode == 'GET_REMOVE') {
            return [code, Blockly.Python.ORDER_FUNCTION_CALL];
          } else if (mode == 'REMOVE') {
            return code + '\n';
          }
        }
      break;
  }
  throw 'Unhandled combination (lists_getIndex).';
};

Blockly.Python['lists_setIndex'] = function(block) {
  // Set element at index.
  // Note: Until February 2013 this block did not have MODE or WHERE inputs.
  var list = Blockly.Python.valueToCode(block, 'LIST',
      Blockly.Python.ORDER_MEMBER) || '[]';
  var mode = block.getFieldValue('MODE') || 'GET';
  var defaultAtIndex = (Blockly.Python.ONE_BASED_INDEXING) ? '1' : '0';
  var value = Blockly.Python.valueToCode(block, 'TO',
      Blockly.Python.ORDER_NONE) || 'None';
  // Cache non-trivial values to variables to prevent repeated look-ups.
  // Closure, which accesses and modifies 'list'.
  function cacheList() {
    if (list.match(/^\w+$/)) {
      return '';
    }
    var listVar = Blockly.Python.variableDB_.getDistinctName(
        'tmp_list', Blockly.Variables.NAME_TYPE);
    var code = listVar + ' = ' + list + '\n';
    list = listVar;
    return code;
  }

  switch (block.getFieldValue('WHERE') || 'FROM_START') {
    case 'FIRST':
      if (mode == 'SET') {
        return list + '[0] = ' + value + '\n';
      } else if (mode == 'INSERT') {
        return list + '.insert(0, ' + value + ')\n';
      }
      break;
    case 'LAST':
        if (mode == 'SET') {
          return list + '[-1] = ' + value + '\n';
        } else if (mode == 'INSERT') {
          return list + '.append(' + value + ')\n';
        }
      break;
    case 'FROM_START':
        if (Blockly.Python.ONE_BASED_INDEXING) {
          var at = Blockly.Python.valueToCode(block, 'AT',
              Blockly.Python.ORDER_ADDITIVE) || defaultAtIndex;
          at = Blockly.Python.castInt(at, -1);
        } else {
          var at = Blockly.Python.valueToCode(block, 'AT',
              Blockly.Python.ORDER_NONE) || defaultAtIndex;
          at = Blockly.Python.castInt(at);
        }
        if (mode == 'SET') {
          return list + '[' + at + '] = ' + value + '\n';
        } else if (mode == 'INSERT') {
          return list + '.insert(' + at + ', ' + value + ')\n';
        }
      break;
    case 'FROM_END':
        if (Blockly.Python.ONE_BASED_INDEXING) {
          var at = Blockly.Python.valueToCode(block, 'AT',
                  Blockly.Python.ORDER_NONE) || defaultAtIndex;
          at = Blockly.Python.castInt(at, 0, true);
        } else {
          var at = Blockly.Python.valueToCode(block, 'AT',
                  Blockly.Python.ORDER_ADDITIVE) || defaultAtIndex;
          at = Blockly.Python.castInt(at, 1, true);
        }
        if (mode == 'SET') {
          return list + '[' + at + '] = ' + value + '\n';
        } else if (mode == 'INSERT') {
          return list + '.insert(' + at + ', ' + value + ')\n';
        }
      break;
    case 'RANDOM':
        Blockly.Python.definitions_['import_random'] = 'import random';
        var code = cacheList();
        var xVar = Blockly.Python.variableDB_.getDistinctName(
            'tmp_x', Blockly.Variables.NAME_TYPE);
        code += xVar + ' = int(random.random() * len(' + list + '))\n';
        if (mode == 'SET') {
          code += list + '[' + xVar + '] = ' + value + '\n';
          return code;
        } else if (mode == 'INSERT') {
          code += list + '.insert(' + xVar + ', ' + value + ')\n';
          return code;
        }
      break;
  }
  throw 'Unhandled combination (lists_setIndex).';
};

Blockly.Python['lists_getSublist'] = function(block) {
  // Get sublist.
  var list = Blockly.Python.valueToCode(block, 'LIST',
      Blockly.Python.ORDER_MEMBER) || '[]';
  var defaultAtIndex = (Blockly.Python.ONE_BASED_INDEXING) ? '1' : '0';
  switch (block.getFieldValue('WHERE1')) {
    case 'FIRST':
        var at1 = '';
      break;
    case 'FROM_START':
      if (Blockly.Python.ONE_BASED_INDEXING) {
        var at1 = Blockly.Python.valueToCode(block, 'AT1',
            Blockly.Python.ORDER_ADDITIVE) || defaultAtIndex;
        at1 = Blockly.Python.castInt(at1, -1);
      } else {
        var at1 = Blockly.Python.valueToCode(block, 'AT1',
            Blockly.Python.ORDER_NONE) || defaultAtIndex;
        at1 = Blockly.Python.castInt(at1);
      }
      if (at1 == '0') {
        at1 = '';
      }
      break;
    case 'FROM_END':
      if (Blockly.Python.ONE_BASED_INDEXING) {
        var at1 = Blockly.Python.valueToCode(block, 'AT1',
                Blockly.Python.ORDER_NONE) || defaultAtIndex;
        at1 = Blockly.Python.castInt(at1, 0, true);
      } else {
        var at1 = Blockly.Python.valueToCode(block, 'AT1',
                Blockly.Python.ORDER_ADDITIVE) || defaultAtIndex;
        at1 = Blockly.Python.castInt(at1, 1, true);
      }
      break;
    default:
      throw 'Unhandled option (lists_getSublist)';
  }
  switch (block.getFieldValue('WHERE2')) {
    case 'LAST':
      var at2 = '';
      break;
    case 'FROM_END':
      if (Blockly.Python.ONE_BASED_INDEXING) {
        var at2 = Blockly.Python.valueToCode(block, 'AT2',
                Blockly.Python.ORDER_ADDITIVE) || defaultAtIndex;
        at2 = Blockly.Python.castInt(at2, -1, true);
      } else {
        var at2 = Blockly.Python.valueToCode(block, 'AT2',
                Blockly.Python.ORDER_NONE) || defaultAtIndex;
        at2 = Blockly.Python.castInt(at2, 0, true);
      }
      // Ensure that if the result calculated is 0 that sub-sequence will
      // include all elements
      if (!Blockly.isNumber(String(at2))) {
        Blockly.Python.definitions_['import_sys'] = 'import sys';
        at2 += ' or sys.maxsize';
      }
      else if (at2 == '0') {
        at2 = '';
      }
      break;
    case 'FROM_START':
      if (Blockly.Python.ONE_BASED_INDEXING) {
        var at2 = Blockly.Python.valueToCode(block, 'AT2',
            Blockly.Python.ORDER_NONE) || defaultAtIndex;
        at2 = Blockly.Python.castInt(at2);
      } else {
        var at2 = Blockly.Python.valueToCode(block, 'AT2',
            Blockly.Python.ORDER_ADDITIVE) || defaultAtIndex;
        at2 = Blockly.Python.castInt(at2, 1);
      }
      break;
    default:
      throw 'Unhandled option (lists_getSublist)';
  }
  var code = list + '[' + at1 + ' : ' + at2 + ']';
  return [code, Blockly.Python.ORDER_MEMBER];
};

Blockly.Python['lists_sort'] = function(block) {
  // Block for sorting a list.
  var listCode = (Blockly.Python.valueToCode(block, 'LIST',
      Blockly.Python.ORDER_MEMBER) || '[]');
  var type = block.getFieldValue('TYPE');
  var reverse = block.getFieldValue('DIRECTION') === '1' ? 'False' : 'True';
  var sortFunctionName = Blockly.Python.provideFunction_('lists_sort',
  ['def ' + Blockly.Python.FUNCTION_NAME_PLACEHOLDER_ +
      '(listv, type, reversev):',
    '  def try_float(s):',
    '    try:',
    '      return float(s)',
    '    except:',
    '      return 0',
    '  keyFuncts = {',
    '    "NUMERIC": try_float,',
    '    "TEXT": str,',
    '    "IGNORE_CASE": lambda s: str(s).lower()',
    '  }',
    '  keyv = keyFuncts[type]',
    '  tmp_list = list(listv)', // Clone the list.
    '  return sorted(tmp_list, key=keyv, reverse=reversev)'
  ]);

  var code = sortFunctionName +
      '(' + listCode + ', "' + type + '", ' + reverse + ')';
  return [code, Blockly.Python.ORDER_FUNCTION_CALL];
};

Blockly.Python['lists_split'] = function(block) {
  // Block for splitting text into a list, or joining a list into text.
  switch (block.getFieldValue('MODE')) {
    case 'SPLIT':
      var value_input = Blockly.Python.valueToCode(block, 'INPUT',
              Blockly.Python.ORDER_MEMBER) || '\'\'';
      var value_delim = Blockly.Python.valueToCode(block, 'DELIM',
          Blockly.Python.ORDER_NONE);
      var code = value_input + '.split(' + value_delim + ')';
      break;
    case 'JOIN':
      var value_input = Blockly.Python.valueToCode(block, 'INPUT',
              Blockly.Python.ORDER_NONE) || '[]';
      var value_delim = Blockly.Python.valueToCode(block, 'DELIM',
              Blockly.Python.ORDER_MEMBER) || '\'\'';
      var code = value_delim + '.join(' + value_input + ')';
      break;
    default:
        throw 'Unknown mode: ' + mode;
  }
  return [code, Blockly.Python.ORDER_FUNCTION_CALL];
};
