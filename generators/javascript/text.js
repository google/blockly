/**
 * @license
 * Copyright 2012 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Generating JavaScript for text blocks.
 */
'use strict';

goog.module('Blockly.JavaScript.texts');

const JavaScript = goog.require('Blockly.JavaScript');
const {NameType} = goog.require('Blockly.Names');


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
    return [value, JavaScript.ORDER_ATOMIC];
  }
  return ['String(' + value + ')', JavaScript.ORDER_FUNCTION_CALL];
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

JavaScript['text'] = function(block) {
  // Text value.
  const code = JavaScript.quote_(block.getFieldValue('TEXT'));
  return [code, JavaScript.ORDER_ATOMIC];
};

JavaScript['text_multiline'] = function(block) {
  // Text value.
  const code = JavaScript.multiline_quote_(block.getFieldValue('TEXT'));
  const order = code.indexOf('+') !== -1 ? JavaScript.ORDER_ADDITION :
      JavaScript.ORDER_ATOMIC;
  return [code, order];
};

JavaScript['text_join'] = function(block) {
  // Create a string made up of any number of elements of any type.
  switch (block.itemCount_) {
    case 0:
      return ["''", JavaScript.ORDER_ATOMIC];
    case 1: {
      const element = JavaScript.valueToCode(block, 'ADD0',
          JavaScript.ORDER_NONE) || "''";
      const codeAndOrder = forceString(element);
      return codeAndOrder;
    }
    case 2: {
      const element0 = JavaScript.valueToCode(block, 'ADD0',
          JavaScript.ORDER_NONE) || "''";
      const element1 = JavaScript.valueToCode(block, 'ADD1',
          JavaScript.ORDER_NONE) || "''";
      const code = forceString(element0)[0] +
          ' + ' + forceString(element1)[0];
      return [code, JavaScript.ORDER_ADDITION];
    }
    default: {
      const elements = new Array(block.itemCount_);
      for (let i = 0; i < block.itemCount_; i++) {
        elements[i] = JavaScript.valueToCode(block, 'ADD' + i,
            JavaScript.ORDER_NONE) || "''";
      }
      const code = '[' + elements.join(',') + '].join(\'\')';
      return [code, JavaScript.ORDER_FUNCTION_CALL];
    }
  }
};

JavaScript['text_append'] = function(block) {
  // Append to a variable in place.
  const varName = JavaScript.nameDB_.getName(
      block.getFieldValue('VAR'), NameType.VARIABLE);
  const value = JavaScript.valueToCode(block, 'TEXT',
      JavaScript.ORDER_NONE) || "''";
  const code = varName + ' += ' +
      forceString(value)[0] + ';\n';
  return code;
};

JavaScript['text_length'] = function(block) {
  // String or array length.
  const text = JavaScript.valueToCode(block, 'VALUE',
      JavaScript.ORDER_MEMBER) || "''";
  return [text + '.length', JavaScript.ORDER_MEMBER];
};

JavaScript['text_isEmpty'] = function(block) {
  // Is the string null or array empty?
  const text = JavaScript.valueToCode(block, 'VALUE',
      JavaScript.ORDER_MEMBER) || "''";
  return ['!' + text + '.length', JavaScript.ORDER_LOGICAL_NOT];
};

JavaScript['text_indexOf'] = function(block) {
  // Search the text for a substring.
  const operator = block.getFieldValue('END') === 'FIRST' ?
      'indexOf' : 'lastIndexOf';
  const substring = JavaScript.valueToCode(block, 'FIND',
      JavaScript.ORDER_NONE) || "''";
  const text = JavaScript.valueToCode(block, 'VALUE',
      JavaScript.ORDER_MEMBER) || "''";
  const code = text + '.' + operator + '(' + substring + ')';
  // Adjust index if using one-based indices.
  if (block.workspace.options.oneBasedIndex) {
    return [code + ' + 1', JavaScript.ORDER_ADDITION];
  }
  return [code, JavaScript.ORDER_FUNCTION_CALL];
};

JavaScript['text_charAt'] = function(block) {
  // Get letter at index.
  // Note: Until January 2013 this block did not have the WHERE input.
  const where = block.getFieldValue('WHERE') || 'FROM_START';
  const textOrder = (where === 'RANDOM') ? JavaScript.ORDER_NONE :
      JavaScript.ORDER_MEMBER;
  const text = JavaScript.valueToCode(block, 'VALUE', textOrder) || "''";
  switch (where) {
    case 'FIRST': {
      const code = text + '.charAt(0)';
      return [code, JavaScript.ORDER_FUNCTION_CALL];
    }
    case 'LAST': {
      const code = text + '.slice(-1)';
      return [code, JavaScript.ORDER_FUNCTION_CALL];
    }
    case 'FROM_START': {
      const at = JavaScript.getAdjusted(block, 'AT');
      // Adjust index if using one-based indices.
      const code = text + '.charAt(' + at + ')';
      return [code, JavaScript.ORDER_FUNCTION_CALL];
    }
    case 'FROM_END': {
      const at = JavaScript.getAdjusted(block, 'AT', 1, true);
      const code = text + '.slice(' + at + ').charAt(0)';
      return [code, JavaScript.ORDER_FUNCTION_CALL];
    }
    case 'RANDOM': {
      const functionName = JavaScript.provideFunction_('textRandomLetter', `
function ${JavaScript.FUNCTION_NAME_PLACEHOLDER_}(text) {
  var x = Math.floor(Math.random() * text.length);
  return text[x];
}
`);
      const code = functionName + '(' + text + ')';
      return [code, JavaScript.ORDER_FUNCTION_CALL];
    }
  }
  throw Error('Unhandled option (text_charAt).');
};

JavaScript['text_getSubstring'] = function(block) {
  // Get substring.
  const where1 = block.getFieldValue('WHERE1');
  const where2 = block.getFieldValue('WHERE2');
  const requiresLengthCall = (where1 !== 'FROM_END' && where1 !== 'LAST' &&
      where2 !== 'FROM_END' && where2 !== 'LAST');
  const textOrder = requiresLengthCall ? JavaScript.ORDER_MEMBER :
      JavaScript.ORDER_NONE;
  const text = JavaScript.valueToCode(block, 'STRING', textOrder) || "''";
  let code;
  if (where1 === 'FIRST' && where2 === 'LAST') {
    code = text;
    return [code, JavaScript.ORDER_NONE];
  } else if (text.match(/^'?\w+'?$/) || requiresLengthCall) {
    // If the text is a variable or literal or doesn't require a call for
    // length, don't generate a helper function.
    let at1;
    switch (where1) {
      case 'FROM_START':
        at1 = JavaScript.getAdjusted(block, 'AT1');
        break;
      case 'FROM_END':
        at1 = JavaScript.getAdjusted(block, 'AT1', 1, false,
            JavaScript.ORDER_SUBTRACTION);
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
        at2 = JavaScript.getAdjusted(block, 'AT2', 1);
        break;
      case 'FROM_END':
        at2 = JavaScript.getAdjusted(block, 'AT2', 0, false,
            JavaScript.ORDER_SUBTRACTION);
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
    const at1 = JavaScript.getAdjusted(block, 'AT1');
    const at2 = JavaScript.getAdjusted(block, 'AT2');
    const wherePascalCase = {'FIRST': 'First', 'LAST': 'Last',
      'FROM_START': 'FromStart', 'FROM_END': 'FromEnd'};
    // The value for 'FROM_END' and'FROM_START' depends on `at` so
    // we add it as a parameter.
    const at1Param =
        (where1 === 'FROM_END' || where1 === 'FROM_START') ? ', at1' : '';
    const at2Param =
        (where2 === 'FROM_END' || where2 === 'FROM_START') ? ', at2' : '';
    const functionName = JavaScript.provideFunction_(
        'subsequence' + wherePascalCase[where1] + wherePascalCase[where2], `
function ${JavaScript.FUNCTION_NAME_PLACEHOLDER_}(sequence${at1Param}${at2Param}) {
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
  return [code, JavaScript.ORDER_FUNCTION_CALL];
};

JavaScript['text_changeCase'] = function(block) {
  // Change capitalization.
  const OPERATORS = {
    'UPPERCASE': '.toUpperCase()',
    'LOWERCASE': '.toLowerCase()',
    'TITLECASE': null,
  };
  const operator = OPERATORS[block.getFieldValue('CASE')];
  const textOrder = operator ? JavaScript.ORDER_MEMBER : JavaScript.ORDER_NONE;
  const text = JavaScript.valueToCode(block, 'TEXT', textOrder) || "''";
  let code;
  if (operator) {
    // Upper and lower case are functions built into JavaScript.
    code = text + operator;
  } else {
    // Title case is not a native JavaScript function.  Define one.
    const functionName = JavaScript.provideFunction_('textToTitleCase', `
function ${JavaScript.FUNCTION_NAME_PLACEHOLDER_}(str) {
  return str.replace(/\\S+/g,
      function(txt) {return txt[0].toUpperCase() + txt.substring(1).toLowerCase();});
}
`);
    code = functionName + '(' + text + ')';
  }
  return [code, JavaScript.ORDER_FUNCTION_CALL];
};

JavaScript['text_trim'] = function(block) {
  // Trim spaces.
  const OPERATORS = {
    'LEFT': ".replace(/^[\\s\\xa0]+/, '')",
    'RIGHT': ".replace(/[\\s\\xa0]+$/, '')",
    'BOTH': '.trim()',
  };
  const operator = OPERATORS[block.getFieldValue('MODE')];
  const text = JavaScript.valueToCode(block, 'TEXT',
      JavaScript.ORDER_MEMBER) || "''";
  return [text + operator, JavaScript.ORDER_FUNCTION_CALL];
};

JavaScript['text_print'] = function(block) {
  // Print statement.
  const msg = JavaScript.valueToCode(block, 'TEXT',
      JavaScript.ORDER_NONE) || "''";
  return 'window.alert(' + msg + ');\n';
};

JavaScript['text_prompt_ext'] = function(block) {
  // Prompt function.
  let msg;
  if (block.getField('TEXT')) {
    // Internal message.
    msg = JavaScript.quote_(block.getFieldValue('TEXT'));
  } else {
    // External message.
    msg = JavaScript.valueToCode(block, 'TEXT', JavaScript.ORDER_NONE) || "''";
  }
  let code = 'window.prompt(' + msg + ')';
  const toNumber = block.getFieldValue('TYPE') === 'NUMBER';
  if (toNumber) {
    code = 'Number(' + code + ')';
  }
  return [code, JavaScript.ORDER_FUNCTION_CALL];
};

JavaScript['text_prompt'] = JavaScript['text_prompt_ext'];

JavaScript['text_count'] = function(block) {
  const text = JavaScript.valueToCode(block, 'TEXT',
      JavaScript.ORDER_NONE) || "''";
  const sub = JavaScript.valueToCode(block, 'SUB',
      JavaScript.ORDER_NONE) || "''";
  const functionName = JavaScript.provideFunction_('textCount', `
function ${JavaScript.FUNCTION_NAME_PLACEHOLDER_}(haystack, needle) {
  if (needle.length === 0) {
    return haystack.length + 1;
  } else {
    return haystack.split(needle).length - 1;
  }
}
`);
  const code = functionName + '(' + text + ', ' + sub + ')';
  return [code, JavaScript.ORDER_FUNCTION_CALL];
};

JavaScript['text_replace'] = function(block) {
  const text = JavaScript.valueToCode(block, 'TEXT',
      JavaScript.ORDER_NONE) || "''";
  const from = JavaScript.valueToCode(block, 'FROM',
      JavaScript.ORDER_NONE) || "''";
  const to = JavaScript.valueToCode(block, 'TO', JavaScript.ORDER_NONE) || "''";
  // The regex escaping code below is taken from the implementation of
  // goog.string.regExpEscape.
  const functionName = JavaScript.provideFunction_('textReplace', `
function ${JavaScript.FUNCTION_NAME_PLACEHOLDER_}(haystack, needle, replacement) {
  needle = needle.replace(/([-()\\[\\]{}+?*.$\\^|,:#<!\\\\])/g, '\\\\$1')
                 .replace(/\\x08/g, '\\\\x08');
  return haystack.replace(new RegExp(needle, \'g\'), replacement);
}
`);
  const code = functionName + '(' + text + ', ' + from + ', ' + to + ')';
  return [code, JavaScript.ORDER_FUNCTION_CALL];
};

JavaScript['text_reverse'] = function(block) {
  const text = JavaScript.valueToCode(block, 'TEXT',
      JavaScript.ORDER_MEMBER) || "''";
  const code = text + ".split('').reverse().join('')";
  return [code, JavaScript.ORDER_FUNCTION_CALL];
};
