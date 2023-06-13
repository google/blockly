/**
 * @license
 * Copyright 2012 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Generating JavaScript for list blocks.
 * @suppress {missingRequire}
 */

import * as goog from '../../closure/goog/goog.js';
goog.declareModuleId('Blockly.JavaScript.lists');

import {NameType} from '../../core/names.js';
import {Order, javascriptGenerator} from '../javascript.js';


javascriptGenerator['lists_create_empty'] = function(block) {
  // Create an empty list.
  return ['[]', Order.ATOMIC];
};

javascriptGenerator['lists_create_with'] = function(block) {
  // Create a list with any number of elements of any type.
  const elements = new Array(block.itemCount_);
  for (let i = 0; i < block.itemCount_; i++) {
    elements[i] =
        javascriptGenerator.valueToCode(block, 'ADD' + i, Order.NONE) ||
        'null';
  }
  const code = '[' + elements.join(', ') + ']';
  return [code, Order.ATOMIC];
};

javascriptGenerator['lists_repeat'] = function(block) {
  // Create a list with one element repeated.
  const functionName = javascriptGenerator.provideFunction_('listsRepeat', `
function ${javascriptGenerator.FUNCTION_NAME_PLACEHOLDER_}(value, n) {
  var array = [];
  for (var i = 0; i < n; i++) {
    array[i] = value;
  }
  return array;
}
`);
  const element =
      javascriptGenerator.valueToCode(block, 'ITEM', Order.NONE) || 'null';
  const repeatCount =
      javascriptGenerator.valueToCode(block, 'NUM', Order.NONE) || '0';
  const code = functionName + '(' + element + ', ' + repeatCount + ')';
  return [code, Order.FUNCTION_CALL];
};

javascriptGenerator['lists_length'] = function(block) {
  // String or array length.
  const list =
      javascriptGenerator.valueToCode(block, 'VALUE', Order.MEMBER) || '[]';
  return [list + '.length', Order.MEMBER];
};

javascriptGenerator['lists_isEmpty'] = function(block) {
  // Is the string null or array empty?
  const list =
      javascriptGenerator.valueToCode(block, 'VALUE', Order.MEMBER) || '[]';
  return ['!' + list + '.length', Order.LOGICAL_NOT];
};

javascriptGenerator['lists_indexOf'] = function(block) {
  // Find an item in the list.
  const operator =
      block.getFieldValue('END') === 'FIRST' ? 'indexOf' : 'lastIndexOf';
  const item =
      javascriptGenerator.valueToCode(block, 'FIND', Order.NONE) || "''";
  const list =
      javascriptGenerator.valueToCode(block, 'VALUE', Order.MEMBER) || '[]';
  const code = list + '.' + operator + '(' + item + ')';
  if (block.workspace.options.oneBasedIndex) {
    return [code + ' + 1', Order.ADDITION];
  }
  return [code, Order.FUNCTION_CALL];
};

javascriptGenerator['lists_getIndex'] = function(block) {
  // Get element at index.
  // Note: Until January 2013 this block did not have MODE or WHERE inputs.
  const mode = block.getFieldValue('MODE') || 'GET';
  const where = block.getFieldValue('WHERE') || 'FROM_START';
  const listOrder =
      (where === 'RANDOM') ? Order.NONE : Order.MEMBER;
  const list =
      javascriptGenerator.valueToCode(block, 'VALUE', listOrder) || '[]';

  switch (where) {
    case ('FIRST'):
      if (mode === 'GET') {
        const code = list + '[0]';
        return [code, Order.MEMBER];
      } else if (mode === 'GET_REMOVE') {
        const code = list + '.shift()';
        return [code, Order.MEMBER];
      } else if (mode === 'REMOVE') {
        return list + '.shift();\n';
      }
      break;
    case ('LAST'):
      if (mode === 'GET') {
        const code = list + '.slice(-1)[0]';
        return [code, Order.MEMBER];
      } else if (mode === 'GET_REMOVE') {
        const code = list + '.pop()';
        return [code, Order.MEMBER];
      } else if (mode === 'REMOVE') {
        return list + '.pop();\n';
      }
      break;
    case ('FROM_START'): {
      const at = javascriptGenerator.getAdjusted(block, 'AT');
      if (mode === 'GET') {
        const code = list + '[' + at + ']';
        return [code, Order.MEMBER];
      } else if (mode === 'GET_REMOVE') {
        const code = list + '.splice(' + at + ', 1)[0]';
        return [code, Order.FUNCTION_CALL];
      } else if (mode === 'REMOVE') {
        return list + '.splice(' + at + ', 1);\n';
      }
      break;
    }
    case ('FROM_END'): {
      const at = javascriptGenerator.getAdjusted(block, 'AT', 1, true);
      if (mode === 'GET') {
        const code = list + '.slice(' + at + ')[0]';
        return [code, Order.FUNCTION_CALL];
      } else if (mode === 'GET_REMOVE') {
        const code = list + '.splice(' + at + ', 1)[0]';
        return [code, Order.FUNCTION_CALL];
      } else if (mode === 'REMOVE') {
        return list + '.splice(' + at + ', 1);';
      }
      break;
    }
    case ('RANDOM'): {
      const functionName =
          javascriptGenerator.provideFunction_('listsGetRandomItem', `
function ${javascriptGenerator.FUNCTION_NAME_PLACEHOLDER_}(list, remove) {
  var x = Math.floor(Math.random() * list.length);
  if (remove) {
    return list.splice(x, 1)[0];
  } else {
    return list[x];
  }
}
`);
      const code = functionName + '(' + list + ', ' + (mode !== 'GET') + ')';
      if (mode === 'GET' || mode === 'GET_REMOVE') {
        return [code, Order.FUNCTION_CALL];
      } else if (mode === 'REMOVE') {
        return code + ';\n';
      }
      break;
    }
  }
  throw Error('Unhandled combination (lists_getIndex).');
};

javascriptGenerator['lists_setIndex'] = function(block) {
  // Set element at index.
  // Note: Until February 2013 this block did not have MODE or WHERE inputs.
  let list =
      javascriptGenerator.valueToCode(block, 'LIST', Order.MEMBER) || '[]';
  const mode = block.getFieldValue('MODE') || 'GET';
  const where = block.getFieldValue('WHERE') || 'FROM_START';
  const value =
      javascriptGenerator.valueToCode(block, 'TO', Order.ASSIGNMENT) ||
      'null';
  // Cache non-trivial values to variables to prevent repeated look-ups.
  // Closure, which accesses and modifies 'list'.
  function cacheList() {
    if (list.match(/^\w+$/)) {
      return '';
    }
    const listVar =
        javascriptGenerator.nameDB_.getDistinctName(
          'tmpList', NameType.VARIABLE);
    const code = 'var ' + listVar + ' = ' + list + ';\n';
    list = listVar;
    return code;
  }
  switch (where) {
    case ('FIRST'):
      if (mode === 'SET') {
        return list + '[0] = ' + value + ';\n';
      } else if (mode === 'INSERT') {
        return list + '.unshift(' + value + ');\n';
      }
      break;
    case ('LAST'):
      if (mode === 'SET') {
        let code = cacheList();
        code += list + '[' + list + '.length - 1] = ' + value + ';\n';
        return code;
      } else if (mode === 'INSERT') {
        return list + '.push(' + value + ');\n';
      }
      break;
    case ('FROM_START'): {
      const at = javascriptGenerator.getAdjusted(block, 'AT');
      if (mode === 'SET') {
        return list + '[' + at + '] = ' + value + ';\n';
      } else if (mode === 'INSERT') {
        return list + '.splice(' + at + ', 0, ' + value + ');\n';
      }
      break;
    }
    case ('FROM_END'): {
      const at = javascriptGenerator.getAdjusted(
          block, 'AT', 1, false, Order.SUBTRACTION);
      let code = cacheList();
      if (mode === 'SET') {
        code += list + '[' + list + '.length - ' + at + '] = ' + value + ';\n';
        return code;
      } else if (mode === 'INSERT') {
        code += list + '.splice(' + list + '.length - ' + at + ', 0, ' + value +
            ');\n';
        return code;
      }
      break;
    }
    case ('RANDOM'): {
      let code = cacheList();
      const xVar =
          javascriptGenerator.nameDB_.getDistinctName(
            'tmpX', NameType.VARIABLE);
      code += 'var ' + xVar + ' = Math.floor(Math.random() * ' + list +
          '.length);\n';
      if (mode === 'SET') {
        code += list + '[' + xVar + '] = ' + value + ';\n';
        return code;
      } else if (mode === 'INSERT') {
        code += list + '.splice(' + xVar + ', 0, ' + value + ');\n';
        return code;
      }
      break;
    }
  }
  throw Error('Unhandled combination (lists_setIndex).');
};

/**
 * Returns an expression calculating the index into a list.
 * @param {string} listName Name of the list, used to calculate length.
 * @param {string} where The method of indexing, selected by dropdown in Blockly
 * @param {string=} opt_at The optional offset when indexing from start/end.
 * @return {string|undefined} Index expression.
 */
const getSubstringIndex = function(listName, where, opt_at) {
  if (where === 'FIRST') {
    return '0';
  } else if (where === 'FROM_END') {
    return listName + '.length - 1 - ' + opt_at;
  } else if (where === 'LAST') {
    return listName + '.length - 1';
  } else {
    return opt_at;
  }
};

javascriptGenerator['lists_getSublist'] = function(block) {
  // Get sublist.
  const list =
      javascriptGenerator.valueToCode(block, 'LIST', Order.MEMBER) || '[]';
  const where1 = block.getFieldValue('WHERE1');
  const where2 = block.getFieldValue('WHERE2');
  let code;
  if (where1 === 'FIRST' && where2 === 'LAST') {
    code = list + '.slice(0)';
  } else if (
      list.match(/^\w+$/) ||
      (where1 !== 'FROM_END' && where2 === 'FROM_START')) {
    // If the list is a variable or doesn't require a call for length, don't
    // generate a helper function.
    let at1;
    switch (where1) {
      case 'FROM_START':
        at1 = javascriptGenerator.getAdjusted(block, 'AT1');
        break;
      case 'FROM_END':
        at1 = javascriptGenerator.getAdjusted(
            block, 'AT1', 1, false, Order.SUBTRACTION);
        at1 = list + '.length - ' + at1;
        break;
      case 'FIRST':
        at1 = '0';
        break;
      default:
        throw Error('Unhandled option (lists_getSublist).');
    }
    let at2;
    switch (where2) {
      case 'FROM_START':
        at2 = javascriptGenerator.getAdjusted(block, 'AT2', 1);
        break;
      case 'FROM_END':
        at2 = javascriptGenerator.getAdjusted(
            block, 'AT2', 0, false, Order.SUBTRACTION);
        at2 = list + '.length - ' + at2;
        break;
      case 'LAST':
        at2 = list + '.length';
        break;
      default:
        throw Error('Unhandled option (lists_getSublist).');
    }
    code = list + '.slice(' + at1 + ', ' + at2 + ')';
  } else {
    const at1 = javascriptGenerator.getAdjusted(block, 'AT1');
    const at2 = javascriptGenerator.getAdjusted(block, 'AT2');
    const wherePascalCase = {
      'FIRST': 'First',
      'LAST': 'Last',
      'FROM_START': 'FromStart',
      'FROM_END': 'FromEnd',
    };
    // The value for 'FROM_END' and'FROM_START' depends on `at` so
    // we add it as a parameter.
    const at1Param =
        (where1 === 'FROM_END' || where1 === 'FROM_START') ? ', at1' : '';
    const at2Param =
        (where2 === 'FROM_END' || where2 === 'FROM_START') ? ', at2' : '';
    const functionName = javascriptGenerator.provideFunction_(
        'subsequence' + wherePascalCase[where1] + wherePascalCase[where2], `
function ${javascriptGenerator.FUNCTION_NAME_PLACEHOLDER_}(sequence${at1Param}${at2Param}) {
  var start = ${getSubstringIndex('sequence', where1, 'at1')};
  var end = ${getSubstringIndex('sequence', where2, 'at2')} + 1;
  return sequence.slice(start, end);
}
`);
    code = functionName + '(' + list +
        // The value for 'FROM_END' and 'FROM_START' depends on `at` so we
        // pass it.
        ((where1 === 'FROM_END' || where1 === 'FROM_START') ? ', ' + at1 : '') +
        ((where2 === 'FROM_END' || where2 === 'FROM_START') ? ', ' + at2 : '') +
        ')';
  }
  return [code, Order.FUNCTION_CALL];
};

javascriptGenerator['lists_sort'] = function(block) {
  // Block for sorting a list.
  const list =
      javascriptGenerator.valueToCode(block, 'LIST', Order.FUNCTION_CALL) ||
      '[]';
  const direction = block.getFieldValue('DIRECTION') === '1' ? 1 : -1;
  const type = block.getFieldValue('TYPE');
  const getCompareFunctionName =
      javascriptGenerator.provideFunction_('listsGetSortCompare', `
function ${javascriptGenerator.FUNCTION_NAME_PLACEHOLDER_}(type, direction) {
  var compareFuncs = {
    'NUMERIC': function(a, b) {
        return Number(a) - Number(b); },
    'TEXT': function(a, b) {
        return String(a) > String(b) ? 1 : -1; },
    'IGNORE_CASE': function(a, b) {
        return String(a).toLowerCase() > String(b).toLowerCase() ? 1 : -1; },
  };
  var compare = compareFuncs[type];
  return function(a, b) { return compare(a, b) * direction; };
}
      `);
  return [
    list + '.slice().sort(' + getCompareFunctionName + '("' + type + '", ' +
        direction + '))',
    Order.FUNCTION_CALL
  ];
};

javascriptGenerator['lists_split'] = function(block) {
  // Block for splitting text into a list, or joining a list into text.
  let input = javascriptGenerator.valueToCode(block, 'INPUT', Order.MEMBER);
  const delimiter =
      javascriptGenerator.valueToCode(block, 'DELIM', Order.NONE) || "''";
  const mode = block.getFieldValue('MODE');
  let functionName;
  if (mode === 'SPLIT') {
    if (!input) {
      input = "''";
    }
    functionName = 'split';
  } else if (mode === 'JOIN') {
    if (!input) {
      input = '[]';
    }
    functionName = 'join';
  } else {
    throw Error('Unknown mode: ' + mode);
  }
  const code = input + '.' + functionName + '(' + delimiter + ')';
  return [code, Order.FUNCTION_CALL];
};

javascriptGenerator['lists_reverse'] = function(block) {
  // Block for reversing a list.
  const list =
      javascriptGenerator.valueToCode(block, 'LIST', Order.FUNCTION_CALL) ||
      '[]';
  const code = list + '.slice().reverse()';
  return [code, Order.FUNCTION_CALL];
};
