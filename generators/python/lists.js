/**
 * @license
 * Copyright 2012 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Generating Python for list blocks.
 */
'use strict';

goog.module('Blockly.Python.lists');

const Python = goog.require('Blockly.Python');
const stringUtils = goog.require('Blockly.utils.string');
const {NameType} = goog.require('Blockly.Names');


Python['lists_create_empty'] = function(block) {
  // Create an empty list.
  return ['[]', Python.ORDER_ATOMIC];
};

Python['lists_create_with'] = function(block) {
  // Create a list with any number of elements of any type.
  const elements = new Array(block.itemCount_);
  for (let i = 0; i < block.itemCount_; i++) {
    elements[i] =
        Python.valueToCode(block, 'ADD' + i, Python.ORDER_NONE) || 'None';
  }
  const code = '[' + elements.join(', ') + ']';
  return [code, Python.ORDER_ATOMIC];
};

Python['lists_repeat'] = function(block) {
  // Create a list with one element repeated.
  const item = Python.valueToCode(block, 'ITEM', Python.ORDER_NONE) || 'None';
  const times =
      Python.valueToCode(block, 'NUM', Python.ORDER_MULTIPLICATIVE) || '0';
  const code = '[' + item + '] * ' + times;
  return [code, Python.ORDER_MULTIPLICATIVE];
};

Python['lists_length'] = function(block) {
  // String or array length.
  const list = Python.valueToCode(block, 'VALUE', Python.ORDER_NONE) || '[]';
  return ['len(' + list + ')', Python.ORDER_FUNCTION_CALL];
};

Python['lists_isEmpty'] = function(block) {
  // Is the string null or array empty?
  const list = Python.valueToCode(block, 'VALUE', Python.ORDER_NONE) || '[]';
  const code = 'not len(' + list + ')';
  return [code, Python.ORDER_LOGICAL_NOT];
};

Python['lists_indexOf'] = function(block) {
  // Find an item in the list.
  const item = Python.valueToCode(block, 'FIND', Python.ORDER_NONE) || '[]';
  const list = Python.valueToCode(block, 'VALUE', Python.ORDER_NONE) || "''";
  let errorIndex = ' -1';
  let firstIndexAdjustment = '';
  let lastIndexAdjustment = ' - 1';

  if (block.workspace.options.oneBasedIndex) {
    errorIndex = ' 0';
    firstIndexAdjustment = ' + 1';
    lastIndexAdjustment = '';
  }

  let functionName;
  if (block.getFieldValue('END') === 'FIRST') {
    functionName = Python.provideFunction_('first_index', `
def ${Python.FUNCTION_NAME_PLACEHOLDER_}(my_list, elem):
  try: index = my_list.index(elem)${firstIndexAdjustment}
  except: index =${errorIndex}
  return index
`);
  } else {
    functionName = Python.provideFunction_('last_index', `
def ${Python.FUNCTION_NAME_PLACEHOLDER_}(my_list, elem):
  try: index = len(my_list) - my_list[::-1].index(elem)${lastIndexAdjustment}
  except: index =${errorIndex}
  return index
`);
  }
  const code = functionName + '(' + list + ', ' + item + ')';
  return [code, Python.ORDER_FUNCTION_CALL];
};

Python['lists_getIndex'] = function(block) {
  // Get element at index.
  // Note: Until January 2013 this block did not have MODE or WHERE inputs.
  const mode = block.getFieldValue('MODE') || 'GET';
  const where = block.getFieldValue('WHERE') || 'FROM_START';
  const listOrder =
      (where === 'RANDOM') ? Python.ORDER_NONE : Python.ORDER_MEMBER;
  const list = Python.valueToCode(block, 'VALUE', listOrder) || '[]';

  switch (where) {
    case 'FIRST':
      if (mode === 'GET') {
        const code = list + '[0]';
        return [code, Python.ORDER_MEMBER];
      } else if (mode === 'GET_REMOVE') {
        const code = list + '.pop(0)';
        return [code, Python.ORDER_FUNCTION_CALL];
      } else if (mode === 'REMOVE') {
        return list + '.pop(0)\n';
      }
      break;
    case 'LAST':
      if (mode === 'GET') {
        const code = list + '[-1]';
        return [code, Python.ORDER_MEMBER];
      } else if (mode === 'GET_REMOVE') {
        const code = list + '.pop()';
        return [code, Python.ORDER_FUNCTION_CALL];
      } else if (mode === 'REMOVE') {
        return list + '.pop()\n';
      }
      break;
    case 'FROM_START': {
      const at = Python.getAdjustedInt(block, 'AT');
      if (mode === 'GET') {
        const code = list + '[' + at + ']';
        return [code, Python.ORDER_MEMBER];
      } else if (mode === 'GET_REMOVE') {
        const code = list + '.pop(' + at + ')';
        return [code, Python.ORDER_FUNCTION_CALL];
      } else if (mode === 'REMOVE') {
        return list + '.pop(' + at + ')\n';
      }
      break;
    }
    case 'FROM_END': {
      const at = Python.getAdjustedInt(block, 'AT', 1, true);
      if (mode === 'GET') {
        const code = list + '[' + at + ']';
        return [code, Python.ORDER_MEMBER];
      } else if (mode === 'GET_REMOVE') {
        const code = list + '.pop(' + at + ')';
        return [code, Python.ORDER_FUNCTION_CALL];
      } else if (mode === 'REMOVE') {
        return list + '.pop(' + at + ')\n';
      }
      break;
    }
    case 'RANDOM':
      Python.definitions_['import_random'] = 'import random';
      if (mode === 'GET') {
        const code = 'random.choice(' + list + ')';
        return [code, Python.ORDER_FUNCTION_CALL];
      } else {
        const functionName =
            Python.provideFunction_('lists_remove_random_item', `
def ${Python.FUNCTION_NAME_PLACEHOLDER_}(myList):
  x = int(random.random() * len(myList))
  return myList.pop(x)
`);
        const code = functionName + '(' + list + ')';
        if (mode === 'GET_REMOVE') {
          return [code, Python.ORDER_FUNCTION_CALL];
        } else if (mode === 'REMOVE') {
          return code + '\n';
        }
      }
      break;
  }
  throw Error('Unhandled combination (lists_getIndex).');
};

Python['lists_setIndex'] = function(block) {
  // Set element at index.
  // Note: Until February 2013 this block did not have MODE or WHERE inputs.
  let list = Python.valueToCode(block, 'LIST', Python.ORDER_MEMBER) || '[]';
  const mode = block.getFieldValue('MODE') || 'GET';
  const where = block.getFieldValue('WHERE') || 'FROM_START';
  const value = Python.valueToCode(block, 'TO', Python.ORDER_NONE) || 'None';
  // Cache non-trivial values to variables to prevent repeated look-ups.
  // Closure, which accesses and modifies 'list'.
  function cacheList() {
    if (list.match(/^\w+$/)) {
      return '';
    }
    const listVar =
        Python.nameDB_.getDistinctName('tmp_list', NameType.VARIABLE);
    const code = listVar + ' = ' + list + '\n';
    list = listVar;
    return code;
  }

  switch (where) {
    case 'FIRST':
      if (mode === 'SET') {
        return list + '[0] = ' + value + '\n';
      } else if (mode === 'INSERT') {
        return list + '.insert(0, ' + value + ')\n';
      }
      break;
    case 'LAST':
      if (mode === 'SET') {
        return list + '[-1] = ' + value + '\n';
      } else if (mode === 'INSERT') {
        return list + '.append(' + value + ')\n';
      }
      break;
    case 'FROM_START': {
      const at = Python.getAdjustedInt(block, 'AT');
      if (mode === 'SET') {
        return list + '[' + at + '] = ' + value + '\n';
      } else if (mode === 'INSERT') {
        return list + '.insert(' + at + ', ' + value + ')\n';
      }
      break;
    }
    case 'FROM_END': {
      const at = Python.getAdjustedInt(block, 'AT', 1, true);
      if (mode === 'SET') {
        return list + '[' + at + '] = ' + value + '\n';
      } else if (mode === 'INSERT') {
        return list + '.insert(' + at + ', ' + value + ')\n';
      }
      break;
    }
    case 'RANDOM': {
      Python.definitions_['import_random'] = 'import random';
      let code = cacheList();
      const xVar = Python.nameDB_.getDistinctName('tmp_x', NameType.VARIABLE);
      code += xVar + ' = int(random.random() * len(' + list + '))\n';
      if (mode === 'SET') {
        code += list + '[' + xVar + '] = ' + value + '\n';
        return code;
      } else if (mode === 'INSERT') {
        code += list + '.insert(' + xVar + ', ' + value + ')\n';
        return code;
      }
      break;
    }
  }
  throw Error('Unhandled combination (lists_setIndex).');
};

Python['lists_getSublist'] = function(block) {
  // Get sublist.
  const list = Python.valueToCode(block, 'LIST', Python.ORDER_MEMBER) || '[]';
  const where1 = block.getFieldValue('WHERE1');
  const where2 = block.getFieldValue('WHERE2');
  let at1;
  switch (where1) {
    case 'FROM_START':
      at1 = Python.getAdjustedInt(block, 'AT1');
      if (at1 === 0) {
        at1 = '';
      }
      break;
    case 'FROM_END':
      at1 = Python.getAdjustedInt(block, 'AT1', 1, true);
      break;
    case 'FIRST':
      at1 = '';
      break;
    default:
      throw Error('Unhandled option (lists_getSublist)');
  }

  let at2;
  switch (where2) {
    case 'FROM_START':
      at2 = Python.getAdjustedInt(block, 'AT2', 1);
      break;
    case 'FROM_END':
      at2 = Python.getAdjustedInt(block, 'AT2', 0, true);
      // Ensure that if the result calculated is 0 that sub-sequence will
      // include all elements as expected.
      if (!stringUtils.isNumber(String(at2))) {
        Python.definitions_['import_sys'] = 'import sys';
        at2 += ' or sys.maxsize';
      } else if (at2 === 0) {
        at2 = '';
      }
      break;
    case 'LAST':
      at2 = '';
      break;
    default:
      throw Error('Unhandled option (lists_getSublist)');
  }
  const code = list + '[' + at1 + ' : ' + at2 + ']';
  return [code, Python.ORDER_MEMBER];
};

Python['lists_sort'] = function(block) {
  // Block for sorting a list.
  const list = (Python.valueToCode(block, 'LIST', Python.ORDER_NONE) || '[]');
  const type = block.getFieldValue('TYPE');
  const reverse = block.getFieldValue('DIRECTION') === '1' ? 'False' : 'True';
  const sortFunctionName = Python.provideFunction_('lists_sort', `
def ${Python.FUNCTION_NAME_PLACEHOLDER_}(my_list, type, reverse):
  def try_float(s):
    try:
      return float(s)
    except:
      return 0
  key_funcs = {
    "NUMERIC": try_float,
    "TEXT": str,
    "IGNORE_CASE": lambda s: str(s).lower()
  }
  key_func = key_funcs[type]
  list_cpy = list(my_list)
  return sorted(list_cpy, key=key_func, reverse=reverse)
`);

  const code =
      sortFunctionName + '(' + list + ', "' + type + '", ' + reverse + ')';
  return [code, Python.ORDER_FUNCTION_CALL];
};

Python['lists_split'] = function(block) {
  // Block for splitting text into a list, or joining a list into text.
  const mode = block.getFieldValue('MODE');
  let code;
  if (mode === 'SPLIT') {
    const value_input =
        Python.valueToCode(block, 'INPUT', Python.ORDER_MEMBER) || "''";
    const value_delim = Python.valueToCode(block, 'DELIM', Python.ORDER_NONE);
    code = value_input + '.split(' + value_delim + ')';
  } else if (mode === 'JOIN') {
    const value_input =
        Python.valueToCode(block, 'INPUT', Python.ORDER_NONE) || '[]';
    const value_delim =
        Python.valueToCode(block, 'DELIM', Python.ORDER_MEMBER) || "''";
    code = value_delim + '.join(' + value_input + ')';
  } else {
    throw Error('Unknown mode: ' + mode);
  }
  return [code, Python.ORDER_FUNCTION_CALL];
};

Python['lists_reverse'] = function(block) {
  // Block for reversing a list.
  const list = Python.valueToCode(block, 'LIST', Python.ORDER_NONE) || '[]';
  const code = 'list(reversed(' + list + '))';
  return [code, Python.ORDER_FUNCTION_CALL];
};
