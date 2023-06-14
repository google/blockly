/**
 * @license
 * Copyright 2012 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Generating Python for text blocks.
 */

import * as goog from '../../closure/goog/goog.js';
goog.declareModuleId('Blockly.Python.texts');

import * as stringUtils from '../../core/utils/string.js';
import {NameType} from '../../core/names.js';
import {pythonGenerator as Python, Order} from '../python.js';


Python.forBlock['text'] = function(block) {
  // Text value.
  const code = Python.quote_(block.getFieldValue('TEXT'));
  return [code, Order.ATOMIC];
};

Python.forBlock['text_multiline'] = function(block) {
  // Text value.
  const code = Python.multiline_quote_(block.getFieldValue('TEXT'));
  const order =
      code.indexOf('+') !== -1 ? Order.ADDITIVE : Order.ATOMIC;
  return [code, order];
};

/**
 * Regular expression to detect a single-quoted string literal.
 */
const strRegExp = /^\s*'([^']|\\')*'\s*$/;

/**
 * Enclose the provided value in 'str(...)' function.
 * Leave string literals alone.
 * @param {string} value Code evaluating to a value.
 * @return {Array<string|number>} Array containing code evaluating to a string
 *     and
 *    the order of the returned code.[string, number]
 */
const forceString = function(value) {
  if (strRegExp.test(value)) {
    return [value, Order.ATOMIC];
  }
  return ['str(' + value + ')', Order.FUNCTION_CALL];
};

Python.forBlock['text_join'] = function(block) {
  // Create a string made up of any number of elements of any type.
  // Should we allow joining by '-' or ',' or any other characters?
  switch (block.itemCount_) {
    case 0:
      return ["''", Order.ATOMIC];
    case 1: {
      const element =
          Python.valueToCode(block, 'ADD0', Order.NONE) || "''";
      const codeAndOrder = forceString(element);
      return codeAndOrder;
    }
    case 2: {
      const element0 =
          Python.valueToCode(block, 'ADD0', Order.NONE) || "''";
      const element1 =
          Python.valueToCode(block, 'ADD1', Order.NONE) || "''";
      const code = forceString(element0)[0] + ' + ' + forceString(element1)[0];
      return [code, Order.ADDITIVE];
    }
    default: {
      const elements = [];
      for (let i = 0; i < block.itemCount_; i++) {
        elements[i] =
            Python.valueToCode(block, 'ADD' + i, Order.NONE) || "''";
      }
      const tempVar = Python.nameDB_.getDistinctName('x', NameType.VARIABLE);
      const code = '\'\'.join([str(' + tempVar + ') for ' + tempVar + ' in [' +
          elements.join(', ') + ']])';
      return [code, Order.FUNCTION_CALL];
    }
  }
};

Python.forBlock['text_append'] = function(block) {
  // Append to a variable in place.
  const varName =
      Python.nameDB_.getName(block.getFieldValue('VAR'), NameType.VARIABLE);
  const value = Python.valueToCode(block, 'TEXT', Order.NONE) || "''";
  return varName + ' = str(' + varName + ') + ' + forceString(value)[0] + '\n';
};

Python.forBlock['text_length'] = function(block) {
  // Is the string null or array empty?
  const text = Python.valueToCode(block, 'VALUE', Order.NONE) || "''";
  return ['len(' + text + ')', Order.FUNCTION_CALL];
};

Python.forBlock['text_isEmpty'] = function(block) {
  // Is the string null or array empty?
  const text = Python.valueToCode(block, 'VALUE', Order.NONE) || "''";
  const code = 'not len(' + text + ')';
  return [code, Order.LOGICAL_NOT];
};

Python.forBlock['text_indexOf'] = function(block) {
  // Search the text for a substring.
  // Should we allow for non-case sensitive???
  const operator = block.getFieldValue('END') === 'FIRST' ? 'find' : 'rfind';
  const substring =
      Python.valueToCode(block, 'FIND', Order.NONE) || "''";
  const text =
      Python.valueToCode(block, 'VALUE', Order.MEMBER) || "''";
  const code = text + '.' + operator + '(' + substring + ')';
  if (block.workspace.options.oneBasedIndex) {
    return [code + ' + 1', Order.ADDITIVE];
  }
  return [code, Order.FUNCTION_CALL];
};

Python.forBlock['text_charAt'] = function(block) {
  // Get letter at index.
  // Note: Until January 2013 this block did not have the WHERE input.
  const where = block.getFieldValue('WHERE') || 'FROM_START';
  const textOrder =
      (where === 'RANDOM') ? Order.NONE : Order.MEMBER;
  const text = Python.valueToCode(block, 'VALUE', textOrder) || "''";
  switch (where) {
    case 'FIRST': {
      const code = text + '[0]';
      return [code, Order.MEMBER];
    }
    case 'LAST': {
      const code = text + '[-1]';
      return [code, Order.MEMBER];
    }
    case 'FROM_START': {
      const at = Python.getAdjustedInt(block, 'AT');
      const code = text + '[' + at + ']';
      return [code, Order.MEMBER];
    }
    case 'FROM_END': {
      const at = Python.getAdjustedInt(block, 'AT', 1, true);
      const code = text + '[' + at + ']';
      return [code, Order.MEMBER];
    }
    case 'RANDOM': {
      Python.definitions_['import_random'] = 'import random';
      const functionName = Python.provideFunction_('text_random_letter', `
def ${Python.FUNCTION_NAME_PLACEHOLDER_}(text):
  x = int(random.random() * len(text))
  return text[x]
`);
      const code = functionName + '(' + text + ')';
      return [code, Order.FUNCTION_CALL];
    }
  }
  throw Error('Unhandled option (text_charAt).');
};

Python.forBlock['text_getSubstring'] = function(block) {
  // Get substring.
  const where1 = block.getFieldValue('WHERE1');
  const where2 = block.getFieldValue('WHERE2');
  const text =
      Python.valueToCode(block, 'STRING', Order.MEMBER) || "''";
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
      throw Error('Unhandled option (text_getSubstring)');
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
      throw Error('Unhandled option (text_getSubstring)');
  }
  const code = text + '[' + at1 + ' : ' + at2 + ']';
  return [code, Order.MEMBER];
};

Python.forBlock['text_changeCase'] = function(block) {
  // Change capitalization.
  const OPERATORS = {
    'UPPERCASE': '.upper()',
    'LOWERCASE': '.lower()',
    'TITLECASE': '.title()'
  };
  const operator = OPERATORS[block.getFieldValue('CASE')];
  const text = Python.valueToCode(block, 'TEXT', Order.MEMBER) || "''";
  const code = text + operator;
  return [code, Order.FUNCTION_CALL];
};

Python.forBlock['text_trim'] = function(block) {
  // Trim spaces.
  const OPERATORS = {
    'LEFT': '.lstrip()',
    'RIGHT': '.rstrip()',
    'BOTH': '.strip()'
  };
  const operator = OPERATORS[block.getFieldValue('MODE')];
  const text = Python.valueToCode(block, 'TEXT', Order.MEMBER) || "''";
  const code = text + operator;
  return [code, Order.FUNCTION_CALL];
};

Python.forBlock['text_print'] = function(block) {
  // Print statement.
  const msg = Python.valueToCode(block, 'TEXT', Order.NONE) || "''";
  return 'print(' + msg + ')\n';
};

Python.forBlock['text_prompt_ext'] = function(block) {
  // Prompt function.
  const functionName = Python.provideFunction_('text_prompt', `
def ${Python.FUNCTION_NAME_PLACEHOLDER_}(msg):
  try:
    return raw_input(msg)
  except NameError:
    return input(msg)
`);
  let msg;
  if (block.getField('TEXT')) {
    // Internal message.
    msg = Python.quote_(block.getFieldValue('TEXT'));
  } else {
    // External message.
    msg = Python.valueToCode(block, 'TEXT', Order.NONE) || "''";
  }
  let code = functionName + '(' + msg + ')';
  const toNumber = block.getFieldValue('TYPE') === 'NUMBER';
  if (toNumber) {
    code = 'float(' + code + ')';
  }
  return [code, Order.FUNCTION_CALL];
};

Python.forBlock['text_prompt'] = Python.forBlock['text_prompt_ext'];

Python.forBlock['text_count'] = function(block) {
  const text = Python.valueToCode(block, 'TEXT', Order.MEMBER) || "''";
  const sub = Python.valueToCode(block, 'SUB', Order.NONE) || "''";
  const code = text + '.count(' + sub + ')';
  return [code, Order.FUNCTION_CALL];
};

Python.forBlock['text_replace'] = function(block) {
  const text = Python.valueToCode(block, 'TEXT', Order.MEMBER) || "''";
  const from = Python.valueToCode(block, 'FROM', Order.NONE) || "''";
  const to = Python.valueToCode(block, 'TO', Order.NONE) || "''";
  const code = text + '.replace(' + from + ', ' + to + ')';
  return [code, Order.MEMBER];
};

Python.forBlock['text_reverse'] = function(block) {
  const text = Python.valueToCode(block, 'TEXT', Order.MEMBER) || "''";
  const code = text + '[::-1]';
  return [code, Order.MEMBER];
};
