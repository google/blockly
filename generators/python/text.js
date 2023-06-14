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
import {pythonGenerator, Order} from '../python.js';


pythonGenerator.forBlock['text'] = function(block) {
  // Text value.
  const code = pythonGenerator.quote_(block.getFieldValue('TEXT'));
  return [code, Order.ATOMIC];
};

pythonGenerator.forBlock['text_multiline'] = function(block) {
  // Text value.
  const code = pythonGenerator.multiline_quote_(block.getFieldValue('TEXT'));
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

pythonGenerator.forBlock['text_join'] = function(block) {
  // Create a string made up of any number of elements of any type.
  // Should we allow joining by '-' or ',' or any other characters?
  switch (block.itemCount_) {
    case 0:
      return ["''", Order.ATOMIC];
    case 1: {
      const element =
          pythonGenerator.valueToCode(block, 'ADD0', Order.NONE) || "''";
      const codeAndOrder = forceString(element);
      return codeAndOrder;
    }
    case 2: {
      const element0 =
          pythonGenerator.valueToCode(block, 'ADD0', Order.NONE) || "''";
      const element1 =
          pythonGenerator.valueToCode(block, 'ADD1', Order.NONE) || "''";
      const code = forceString(element0)[0] + ' + ' + forceString(element1)[0];
      return [code, Order.ADDITIVE];
    }
    default: {
      const elements = [];
      for (let i = 0; i < block.itemCount_; i++) {
        elements[i] =
            pythonGenerator.valueToCode(block, 'ADD' + i, Order.NONE) || "''";
      }
      const tempVar =
          pythonGenerator.nameDB_.getDistinctName('x', NameType.VARIABLE);
      const code = '\'\'.join([str(' + tempVar + ') for ' + tempVar + ' in [' +
          elements.join(', ') + ']])';
      return [code, Order.FUNCTION_CALL];
    }
  }
};

pythonGenerator.forBlock['text_append'] = function(block) {
  // Append to a variable in place.
  const varName =
      pythonGenerator.nameDB_.getName(
        block.getFieldValue('VAR'), NameType.VARIABLE);
  const value = pythonGenerator.valueToCode(block, 'TEXT', Order.NONE) || "''";
  return varName + ' = str(' + varName + ') + ' + forceString(value)[0] + '\n';
};

pythonGenerator.forBlock['text_length'] = function(block) {
  // Is the string null or array empty?
  const text = pythonGenerator.valueToCode(block, 'VALUE', Order.NONE) || "''";
  return ['len(' + text + ')', Order.FUNCTION_CALL];
};

pythonGenerator.forBlock['text_isEmpty'] = function(block) {
  // Is the string null or array empty?
  const text = pythonGenerator.valueToCode(block, 'VALUE', Order.NONE) || "''";
  const code = 'not len(' + text + ')';
  return [code, Order.LOGICAL_NOT];
};

pythonGenerator.forBlock['text_indexOf'] = function(block) {
  // Search the text for a substring.
  // Should we allow for non-case sensitive???
  const operator = block.getFieldValue('END') === 'FIRST' ? 'find' : 'rfind';
  const substring =
      pythonGenerator.valueToCode(block, 'FIND', Order.NONE) || "''";
  const text =
      pythonGenerator.valueToCode(block, 'VALUE', Order.MEMBER) || "''";
  const code = text + '.' + operator + '(' + substring + ')';
  if (block.workspace.options.oneBasedIndex) {
    return [code + ' + 1', Order.ADDITIVE];
  }
  return [code, Order.FUNCTION_CALL];
};

pythonGenerator.forBlock['text_charAt'] = function(block) {
  // Get letter at index.
  // Note: Until January 2013 this block did not have the WHERE input.
  const where = block.getFieldValue('WHERE') || 'FROM_START';
  const textOrder =
      (where === 'RANDOM') ? Order.NONE : Order.MEMBER;
  const text = pythonGenerator.valueToCode(block, 'VALUE', textOrder) || "''";
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
      const at = pythonGenerator.getAdjustedInt(block, 'AT');
      const code = text + '[' + at + ']';
      return [code, Order.MEMBER];
    }
    case 'FROM_END': {
      const at = pythonGenerator.getAdjustedInt(block, 'AT', 1, true);
      const code = text + '[' + at + ']';
      return [code, Order.MEMBER];
    }
    case 'RANDOM': {
      pythonGenerator.definitions_['import_random'] = 'import random';
      const functionName =
          pythonGenerator.provideFunction_('text_random_letter', `
def ${pythonGenerator.FUNCTION_NAME_PLACEHOLDER_}(text):
  x = int(random.random() * len(text))
  return text[x]
`);
      const code = functionName + '(' + text + ')';
      return [code, Order.FUNCTION_CALL];
    }
  }
  throw Error('Unhandled option (text_charAt).');
};

pythonGenerator.forBlock['text_getSubstring'] = function(block) {
  // Get substring.
  const where1 = block.getFieldValue('WHERE1');
  const where2 = block.getFieldValue('WHERE2');
  const text =
      pythonGenerator.valueToCode(block, 'STRING', Order.MEMBER) || "''";
  let at1;
  switch (where1) {
    case 'FROM_START':
      at1 = pythonGenerator.getAdjustedInt(block, 'AT1');
      if (at1 === 0) {
        at1 = '';
      }
      break;
    case 'FROM_END':
      at1 = pythonGenerator.getAdjustedInt(block, 'AT1', 1, true);
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
      at2 = pythonGenerator.getAdjustedInt(block, 'AT2', 1);
      break;
    case 'FROM_END':
      at2 = pythonGenerator.getAdjustedInt(block, 'AT2', 0, true);
      // Ensure that if the result calculated is 0 that sub-sequence will
      // include all elements as expected.
      if (!stringUtils.isNumber(String(at2))) {
        pythonGenerator.definitions_['import_sys'] = 'import sys';
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

pythonGenerator.forBlock['text_changeCase'] = function(block) {
  // Change capitalization.
  const OPERATORS = {
    'UPPERCASE': '.upper()',
    'LOWERCASE': '.lower()',
    'TITLECASE': '.title()'
  };
  const operator = OPERATORS[block.getFieldValue('CASE')];
  const text = pythonGenerator.valueToCode(block, 'TEXT', Order.MEMBER) || "''";
  const code = text + operator;
  return [code, Order.FUNCTION_CALL];
};

pythonGenerator.forBlock['text_trim'] = function(block) {
  // Trim spaces.
  const OPERATORS = {
    'LEFT': '.lstrip()',
    'RIGHT': '.rstrip()',
    'BOTH': '.strip()'
  };
  const operator = OPERATORS[block.getFieldValue('MODE')];
  const text = pythonGenerator.valueToCode(block, 'TEXT', Order.MEMBER) || "''";
  const code = text + operator;
  return [code, Order.FUNCTION_CALL];
};

pythonGenerator.forBlock['text_print'] = function(block) {
  // Print statement.
  const msg = pythonGenerator.valueToCode(block, 'TEXT', Order.NONE) || "''";
  return 'print(' + msg + ')\n';
};

pythonGenerator.forBlock['text_prompt_ext'] = function(block) {
  // Prompt function.
  const functionName = pythonGenerator.provideFunction_('text_prompt', `
def ${pythonGenerator.FUNCTION_NAME_PLACEHOLDER_}(msg):
  try:
    return raw_input(msg)
  except NameError:
    return input(msg)
`);
  let msg;
  if (block.getField('TEXT')) {
    // Internal message.
    msg = pythonGenerator.quote_(block.getFieldValue('TEXT'));
  } else {
    // External message.
    msg = pythonGenerator.valueToCode(block, 'TEXT', Order.NONE) || "''";
  }
  let code = functionName + '(' + msg + ')';
  const toNumber = block.getFieldValue('TYPE') === 'NUMBER';
  if (toNumber) {
    code = 'float(' + code + ')';
  }
  return [code, Order.FUNCTION_CALL];
};

pythonGenerator.forBlock['text_prompt'] =
    pythonGenerator.forBlock['text_prompt_ext'];

pythonGenerator.forBlock['text_count'] = function(block) {
  const text = pythonGenerator.valueToCode(block, 'TEXT', Order.MEMBER) || "''";
  const sub = pythonGenerator.valueToCode(block, 'SUB', Order.NONE) || "''";
  const code = text + '.count(' + sub + ')';
  return [code, Order.FUNCTION_CALL];
};

pythonGenerator.forBlock['text_replace'] = function(block) {
  const text = pythonGenerator.valueToCode(block, 'TEXT', Order.MEMBER) || "''";
  const from = pythonGenerator.valueToCode(block, 'FROM', Order.NONE) || "''";
  const to = pythonGenerator.valueToCode(block, 'TO', Order.NONE) || "''";
  const code = text + '.replace(' + from + ', ' + to + ')';
  return [code, Order.MEMBER];
};

pythonGenerator.forBlock['text_reverse'] = function(block) {
  const text = pythonGenerator.valueToCode(block, 'TEXT', Order.MEMBER) || "''";
  const code = text + '[::-1]';
  return [code, Order.MEMBER];
};
