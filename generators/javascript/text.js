/**
 * @license
 * Copyright 2012 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Generating JavaScript for text blocks.
 */

import * as goog from '../../closure/goog/goog.js';
goog.declareModuleId('Blockly.JavaScript.texts');

import {NameType} from '../../core/names.js';
import {Order, javascriptGenerator} from '../javascript.js';


/**
 * Regular expression to detect a single-quoted string literal.
 */
const strRegExp = /^\s*'([^']|\\')*'\s*$/;

/**
 * Enclose the provided value in 'String(...)' function.
 * Leave string literals alone.
 * @param {string} value Code evaluating to a value.
 * @return {Array<string|number>} Array containing code evaluating to a string
 *     and the order of the returned code.[string, number]
 */
const forceString = function(value) {
  if (strRegExp.test(value)) {
    return [value, Order.ATOMIC];
  }
  return ['String(' + value + ')', Order.FUNCTION_CALL];
};

/**
 * Returns an expression calculating the index into a string.
 * @param {string} stringName Name of the string, used to calculate length.
 * @param {string} where The method of indexing, selected by dropdown in Blockly
 * @param {string=} opt_at The optional offset when indexing from start/end.
 * @return {string|undefined} Index expression.
 */
const getSubstringIndex = function(stringName, where, opt_at) {
  if (where === 'FIRST') {
    return '0';
  } else if (where === 'FROM_END') {
    return stringName + '.length - 1 - ' + opt_at;
  } else if (where === 'LAST') {
    return stringName + '.length - 1';
  } else {
    return opt_at;
  }
};

javascriptGenerator.forBlock['text'] = function(block, generator) {
  // Text value.
  const code = javascriptGenerator.quote_(block.getFieldValue('TEXT'));
  return [code, Order.ATOMIC];
};

javascriptGenerator.forBlock['text_multiline'] = function(block, generator) {
  // Text value.
  const code =
      javascriptGenerator.multiline_quote_(block.getFieldValue('TEXT'));
  const order = code.indexOf('+') !== -1 ? Order.ADDITION :
      Order.ATOMIC;
  return [code, order];
};

javascriptGenerator.forBlock['text_join'] = function(block, generator) {
  // Create a string made up of any number of elements of any type.
  switch (block.itemCount_) {
    case 0:
      return ["''", Order.ATOMIC];
    case 1: {
      const element = javascriptGenerator.valueToCode(block, 'ADD0',
          Order.NONE) || "''";
      const codeAndOrder = forceString(element);
      return codeAndOrder;
    }
    case 2: {
      const element0 = javascriptGenerator.valueToCode(block, 'ADD0',
          Order.NONE) || "''";
      const element1 = javascriptGenerator.valueToCode(block, 'ADD1',
          Order.NONE) || "''";
      const code = forceString(element0)[0] +
          ' + ' + forceString(element1)[0];
      return [code, Order.ADDITION];
    }
    default: {
      const elements = new Array(block.itemCount_);
      for (let i = 0; i < block.itemCount_; i++) {
        elements[i] = javascriptGenerator.valueToCode(block, 'ADD' + i,
            Order.NONE) || "''";
      }
      const code = '[' + elements.join(',') + '].join(\'\')';
      return [code, Order.FUNCTION_CALL];
    }
  }
};

javascriptGenerator.forBlock['text_append'] = function(block, generator) {
  // Append to a variable in place.
  const varName = javascriptGenerator.nameDB_.getName(
      block.getFieldValue('VAR'), NameType.VARIABLE);
  const value = javascriptGenerator.valueToCode(block, 'TEXT',
      Order.NONE) || "''";
  const code = varName + ' += ' +
      forceString(value)[0] + ';\n';
  return code;
};

javascriptGenerator.forBlock['text_length'] = function(block, generator) {
  // String or array length.
  const text = javascriptGenerator.valueToCode(block, 'VALUE',
      Order.MEMBER) || "''";
  return [text + '.length', Order.MEMBER];
};

javascriptGenerator.forBlock['text_isEmpty'] = function(block, generator) {
  // Is the string null or array empty?
  const text = javascriptGenerator.valueToCode(block, 'VALUE',
      Order.MEMBER) || "''";
  return ['!' + text + '.length', Order.LOGICAL_NOT];
};

javascriptGenerator.forBlock['text_indexOf'] = function(block, generator) {
  // Search the text for a substring.
  const operator = block.getFieldValue('END') === 'FIRST' ?
      'indexOf' : 'lastIndexOf';
  const substring = javascriptGenerator.valueToCode(block, 'FIND',
      Order.NONE) || "''";
  const text = javascriptGenerator.valueToCode(block, 'VALUE',
      Order.MEMBER) || "''";
  const code = text + '.' + operator + '(' + substring + ')';
  // Adjust index if using one-based indices.
  if (block.workspace.options.oneBasedIndex) {
    return [code + ' + 1', Order.ADDITION];
  }
  return [code, Order.FUNCTION_CALL];
};

javascriptGenerator.forBlock['text_charAt'] = function(block, generator) {
  // Get letter at index.
  // Note: Until January 2013 this block did not have the WHERE input.
  const where = block.getFieldValue('WHERE') || 'FROM_START';
  const textOrder = (where === 'RANDOM') ? Order.NONE :
      Order.MEMBER;
  const text =
      javascriptGenerator.valueToCode(block, 'VALUE', textOrder) || "''";
  switch (where) {
    case 'FIRST': {
      const code = text + '.charAt(0)';
      return [code, Order.FUNCTION_CALL];
    }
    case 'LAST': {
      const code = text + '.slice(-1)';
      return [code, Order.FUNCTION_CALL];
    }
    case 'FROM_START': {
      const at = javascriptGenerator.getAdjusted(block, 'AT');
      // Adjust index if using one-based indices.
      const code = text + '.charAt(' + at + ')';
      return [code, Order.FUNCTION_CALL];
    }
    case 'FROM_END': {
      const at = javascriptGenerator.getAdjusted(block, 'AT', 1, true);
      const code = text + '.slice(' + at + ').charAt(0)';
      return [code, Order.FUNCTION_CALL];
    }
    case 'RANDOM': {
      const functionName =
          javascriptGenerator.provideFunction_('textRandomLetter', `
function ${javascriptGenerator.FUNCTION_NAME_PLACEHOLDER_}(text) {
  var x = Math.floor(Math.random() * text.length);
  return text[x];
}
`);
      const code = functionName + '(' + text + ')';
      return [code, Order.FUNCTION_CALL];
    }
  }
  throw Error('Unhandled option (text_charAt).');
};

javascriptGenerator.forBlock['text_getSubstring'] = function(block, generator) {
  // Get substring.
  const where1 = block.getFieldValue('WHERE1');
  const where2 = block.getFieldValue('WHERE2');
  const requiresLengthCall = (where1 !== 'FROM_END' && where1 !== 'LAST' &&
      where2 !== 'FROM_END' && where2 !== 'LAST');
  const textOrder = requiresLengthCall ? Order.MEMBER :
      Order.NONE;
  const text =
      javascriptGenerator.valueToCode(block, 'STRING', textOrder) || "''";
  let code;
  if (where1 === 'FIRST' && where2 === 'LAST') {
    code = text;
    return [code, Order.NONE];
  } else if (text.match(/^'?\w+'?$/) || requiresLengthCall) {
    // If the text is a variable or literal or doesn't require a call for
    // length, don't generate a helper function.
    let at1;
    switch (where1) {
      case 'FROM_START':
        at1 = javascriptGenerator.getAdjusted(block, 'AT1');
        break;
      case 'FROM_END':
        at1 = javascriptGenerator.getAdjusted(block, 'AT1', 1, false,
            Order.SUBTRACTION);
        at1 = text + '.length - ' + at1;
        break;
      case 'FIRST':
        at1 = '0';
        break;
      default:
        throw Error('Unhandled option (text_getSubstring).');
    }
    let at2;
    switch (where2) {
      case 'FROM_START':
        at2 = javascriptGenerator.getAdjusted(block, 'AT2', 1);
        break;
      case 'FROM_END':
        at2 = javascriptGenerator.getAdjusted(block, 'AT2', 0, false,
            Order.SUBTRACTION);
        at2 = text + '.length - ' + at2;
        break;
      case 'LAST':
        at2 = text + '.length';
        break;
      default:
        throw Error('Unhandled option (text_getSubstring).');
    }
    code = text + '.slice(' + at1 + ', ' + at2 + ')';
  } else {
    const at1 = javascriptGenerator.getAdjusted(block, 'AT1');
    const at2 = javascriptGenerator.getAdjusted(block, 'AT2');
    const wherePascalCase = {'FIRST': 'First', 'LAST': 'Last',
      'FROM_START': 'FromStart', 'FROM_END': 'FromEnd'};
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
    code = functionName + '(' + text +
        // The value for 'FROM_END' and 'FROM_START' depends on `at` so we
        // pass it.
        ((where1 === 'FROM_END' || where1 === 'FROM_START') ? ', ' + at1 : '') +
        ((where2 === 'FROM_END' || where2 === 'FROM_START') ? ', ' + at2 : '') +
        ')';
  }
  return [code, Order.FUNCTION_CALL];
};

javascriptGenerator.forBlock['text_changeCase'] = function(block, generator) {
  // Change capitalization.
  const OPERATORS = {
    'UPPERCASE': '.toUpperCase()',
    'LOWERCASE': '.toLowerCase()',
    'TITLECASE': null,
  };
  const operator = OPERATORS[block.getFieldValue('CASE')];
  const textOrder = operator ? Order.MEMBER : Order.NONE;
  const text =
      javascriptGenerator.valueToCode(block, 'TEXT', textOrder) || "''";
  let code;
  if (operator) {
    // Upper and lower case are functions built into javascriptGenerator.
    code = text + operator;
  } else {
    // Title case is not a native JavaScript function.  Define one.
    const functionName =
        javascriptGenerator.provideFunction_('textToTitleCase', `
function ${javascriptGenerator.FUNCTION_NAME_PLACEHOLDER_}(str) {
  return str.replace(/\\S+/g,
      function(txt) {return txt[0].toUpperCase() + txt.substring(1).toLowerCase();});
}
`);
    code = functionName + '(' + text + ')';
  }
  return [code, Order.FUNCTION_CALL];
};

javascriptGenerator.forBlock['text_trim'] = function(block, generator) {
  // Trim spaces.
  const OPERATORS = {
    'LEFT': ".replace(/^[\\s\\xa0]+/, '')",
    'RIGHT': ".replace(/[\\s\\xa0]+$/, '')",
    'BOTH': '.trim()',
  };
  const operator = OPERATORS[block.getFieldValue('MODE')];
  const text = javascriptGenerator.valueToCode(block, 'TEXT',
      Order.MEMBER) || "''";
  return [text + operator, Order.FUNCTION_CALL];
};

javascriptGenerator.forBlock['text_print'] = function(block, generator) {
  // Print statement.
  const msg = javascriptGenerator.valueToCode(block, 'TEXT',
      Order.NONE) || "''";
  return 'window.alert(' + msg + ');\n';
};

javascriptGenerator.forBlock['text_prompt_ext'] = function(block, generator) {
  // Prompt function.
  let msg;
  if (block.getField('TEXT')) {
    // Internal message.
    msg = javascriptGenerator.quote_(block.getFieldValue('TEXT'));
  } else {
    // External message.
    msg = javascriptGenerator.valueToCode(block, 'TEXT', Order.NONE) || "''";
  }
  let code = 'window.prompt(' + msg + ')';
  const toNumber = block.getFieldValue('TYPE') === 'NUMBER';
  if (toNumber) {
    code = 'Number(' + code + ')';
  }
  return [code, Order.FUNCTION_CALL];
};

javascriptGenerator.forBlock['text_prompt'] =
    javascriptGenerator.forBlock['text_prompt_ext'];

javascriptGenerator.forBlock['text_count'] = function(block, generator) {
  const text = javascriptGenerator.valueToCode(block, 'TEXT',
      Order.NONE) || "''";
  const sub = javascriptGenerator.valueToCode(block, 'SUB',
      Order.NONE) || "''";
  const functionName = javascriptGenerator.provideFunction_('textCount', `
function ${javascriptGenerator.FUNCTION_NAME_PLACEHOLDER_}(haystack, needle) {
  if (needle.length === 0) {
    return haystack.length + 1;
  } else {
    return haystack.split(needle).length - 1;
  }
}
`);
  const code = functionName + '(' + text + ', ' + sub + ')';
  return [code, Order.FUNCTION_CALL];
};

javascriptGenerator.forBlock['text_replace'] = function(block, generator) {
  const text = javascriptGenerator.valueToCode(block, 'TEXT',
      Order.NONE) || "''";
  const from = javascriptGenerator.valueToCode(block, 'FROM',
      Order.NONE) || "''";
  const to = javascriptGenerator.valueToCode(block, 'TO', Order.NONE) || "''";
  // The regex escaping code below is taken from the implementation of
  // goog.string.regExpEscape.
  const functionName = javascriptGenerator.provideFunction_('textReplace', `
function ${javascriptGenerator.FUNCTION_NAME_PLACEHOLDER_}(haystack, needle, replacement) {
  needle = needle.replace(/([-()\\[\\]{}+?*.$\\^|,:#<!\\\\])/g, '\\\\$1')
                 .replace(/\\x08/g, '\\\\x08');
  return haystack.replace(new RegExp(needle, 'g'), replacement);
}
`);
  const code = functionName + '(' + text + ', ' + from + ', ' + to + ')';
  return [code, Order.FUNCTION_CALL];
};

javascriptGenerator.forBlock['text_reverse'] = function(block, generator) {
  const text = javascriptGenerator.valueToCode(block, 'TEXT',
      Order.MEMBER) || "''";
  const code = text + ".split('').reverse().join('')";
  return [code, Order.FUNCTION_CALL];
};
