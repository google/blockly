/**
 * @license
 * Copyright 2015 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Generating PHP for text blocks.
 */
'use strict';

goog.module('Blockly.PHP.texts');

const PHP = goog.require('Blockly.PHP');
const {NameType} = goog.require('Blockly.Names');


PHP['text'] = function(block) {
  // Text value.
  const code = PHP.quote_(block.getFieldValue('TEXT'));
  return [code, PHP.ORDER_ATOMIC];
};

PHP['text_multiline'] = function(block) {
  // Text value.
  const code = PHP.multiline_quote_(block.getFieldValue('TEXT'));
  const order =
      code.indexOf('.') !== -1 ? PHP.ORDER_STRING_CONCAT : PHP.ORDER_ATOMIC;
  return [code, order];
};

PHP['text_join'] = function(block) {
  // Create a string made up of any number of elements of any type.
  if (block.itemCount_ === 0) {
    return ["''", PHP.ORDER_ATOMIC];
  } else if (block.itemCount_ === 1) {
    const element = PHP.valueToCode(block, 'ADD0', PHP.ORDER_NONE) || "''";
    const code = element;
    return [code, PHP.ORDER_NONE];
  } else if (block.itemCount_ === 2) {
    const element0 =
        PHP.valueToCode(block, 'ADD0', PHP.ORDER_STRING_CONCAT) || "''";
    const element1 =
        PHP.valueToCode(block, 'ADD1', PHP.ORDER_STRING_CONCAT) || "''";
    const code = element0 + ' . ' + element1;
    return [code, PHP.ORDER_STRING_CONCAT];
  } else {
    const elements = new Array(block.itemCount_);
    for (let i = 0; i < block.itemCount_; i++) {
      elements[i] = PHP.valueToCode(block, 'ADD' + i, PHP.ORDER_NONE) || "''";
    }
    const code = 'implode(\'\', array(' + elements.join(',') + '))';
    return [code, PHP.ORDER_FUNCTION_CALL];
  }
};

PHP['text_append'] = function(block) {
  // Append to a variable in place.
  const varName =
      PHP.nameDB_.getName(block.getFieldValue('VAR'), NameType.VARIABLE);
  const value = PHP.valueToCode(block, 'TEXT', PHP.ORDER_ASSIGNMENT) || "''";
  return varName + ' .= ' + value + ';\n';
};

PHP['text_length'] = function(block) {
  // String or array length.
  const functionName = PHP.provideFunction_('length', `
function ${PHP.FUNCTION_NAME_PLACEHOLDER_}($value) {
  if (is_string($value)) {
    return strlen($value);
  }
  return count($value);
}
`);
  const text = PHP.valueToCode(block, 'VALUE', PHP.ORDER_NONE) || "''";
  return [functionName + '(' + text + ')', PHP.ORDER_FUNCTION_CALL];
};

PHP['text_isEmpty'] = function(block) {
  // Is the string null or array empty?
  const text = PHP.valueToCode(block, 'VALUE', PHP.ORDER_NONE) || "''";
  return ['empty(' + text + ')', PHP.ORDER_FUNCTION_CALL];
};

PHP['text_indexOf'] = function(block) {
  // Search the text for a substring.
  const operator =
      block.getFieldValue('END') === 'FIRST' ? 'strpos' : 'strrpos';
  const substring = PHP.valueToCode(block, 'FIND', PHP.ORDER_NONE) || "''";
  const text = PHP.valueToCode(block, 'VALUE', PHP.ORDER_NONE) || "''";
  let errorIndex = ' -1';
  let indexAdjustment = '';
  if (block.workspace.options.oneBasedIndex) {
    errorIndex = ' 0';
    indexAdjustment = ' + 1';
  }
  const functionName = PHP.provideFunction_(
      block.getFieldValue('END') === 'FIRST' ? 'text_indexOf' :
                                               'text_lastIndexOf',
      `
function ${PHP.FUNCTION_NAME_PLACEHOLDER_}($text, $search) {
  $pos = ${operator}($text, $search);
  return $pos === false ? ${errorIndex} : $pos${indexAdjustment};
}
`);
  const code = functionName + '(' + text + ', ' + substring + ')';
  return [code, PHP.ORDER_FUNCTION_CALL];
};

PHP['text_charAt'] = function(block) {
  // Get letter at index.
  const where = block.getFieldValue('WHERE') || 'FROM_START';
  const textOrder = (where === 'RANDOM') ? PHP.ORDER_NONE : PHP.ORDER_NONE;
  const text = PHP.valueToCode(block, 'VALUE', textOrder) || "''";
  switch (where) {
    case 'FIRST': {
      const code = 'substr(' + text + ', 0, 1)';
      return [code, PHP.ORDER_FUNCTION_CALL];
    }
    case 'LAST': {
      const code = 'substr(' + text + ', -1)';
      return [code, PHP.ORDER_FUNCTION_CALL];
    }
    case 'FROM_START': {
      const at = PHP.getAdjusted(block, 'AT');
      const code = 'substr(' + text + ', ' + at + ', 1)';
      return [code, PHP.ORDER_FUNCTION_CALL];
    }
    case 'FROM_END': {
      const at = PHP.getAdjusted(block, 'AT', 1, true);
      const code = 'substr(' + text + ', ' + at + ', 1)';
      return [code, PHP.ORDER_FUNCTION_CALL];
    }
    case 'RANDOM': {
      const functionName = PHP.provideFunction_('text_random_letter', `
function ${PHP.FUNCTION_NAME_PLACEHOLDER_}($text) {
  return $text[rand(0, strlen($text) - 1)];
}
`);
      const code = functionName + '(' + text + ')';
      return [code, PHP.ORDER_FUNCTION_CALL];
    }
  }
  throw Error('Unhandled option (text_charAt).');
};

PHP['text_getSubstring'] = function(block) {
  // Get substring.
  const where1 = block.getFieldValue('WHERE1');
  const where2 = block.getFieldValue('WHERE2');
  const text = PHP.valueToCode(block, 'STRING', PHP.ORDER_NONE) || "''";
  if (where1 === 'FIRST' && where2 === 'LAST') {
    const code = text;
    return [code, PHP.ORDER_NONE];
  } else {
    const at1 = PHP.getAdjusted(block, 'AT1');
    const at2 = PHP.getAdjusted(block, 'AT2');
    const functionName = PHP.provideFunction_('text_get_substring', `
function ${PHP.FUNCTION_NAME_PLACEHOLDER_}($text, $where1, $at1, $where2, $at2) {
  if ($where1 == 'FROM_END') {
    $at1 = strlen($text) - 1 - $at1;
  } else if ($where1 == 'FIRST') {
    $at1 = 0;
  } else if ($where1 != 'FROM_START') {
    throw new Exception('Unhandled option (text_get_substring).');
  }
  $length = 0;
  if ($where2 == 'FROM_START') {
    $length = $at2 - $at1 + 1;
  } else if ($where2 == 'FROM_END') {
    $length = strlen($text) - $at1 - $at2;
  } else if ($where2 == 'LAST') {
    $length = strlen($text) - $at1;
  } else {
    throw new Exception('Unhandled option (text_get_substring).');
  }
  return substr($text, $at1, $length);
}
`);
    const code = functionName + '(' + text + ', \'' + where1 + '\', ' + at1 +
        ', \'' + where2 + '\', ' + at2 + ')';
    return [code, PHP.ORDER_FUNCTION_CALL];
  }
};

PHP['text_changeCase'] = function(block) {
  // Change capitalization.
  const text = PHP.valueToCode(block, 'TEXT', PHP.ORDER_NONE) || "''";
  let code;
  if (block.getFieldValue('CASE') === 'UPPERCASE') {
    code = 'strtoupper(' + text + ')';
  } else if (block.getFieldValue('CASE') === 'LOWERCASE') {
    code = 'strtolower(' + text + ')';
  } else if (block.getFieldValue('CASE') === 'TITLECASE') {
    code = 'ucwords(strtolower(' + text + '))';
  }
  return [code, PHP.ORDER_FUNCTION_CALL];
};

PHP['text_trim'] = function(block) {
  // Trim spaces.
  const OPERATORS = {'LEFT': 'ltrim', 'RIGHT': 'rtrim', 'BOTH': 'trim'};
  const operator = OPERATORS[block.getFieldValue('MODE')];
  const text = PHP.valueToCode(block, 'TEXT', PHP.ORDER_NONE) || "''";
  return [operator + '(' + text + ')', PHP.ORDER_FUNCTION_CALL];
};

PHP['text_print'] = function(block) {
  // Print statement.
  const msg = PHP.valueToCode(block, 'TEXT', PHP.ORDER_NONE) || "''";
  return 'print(' + msg + ');\n';
};

PHP['text_prompt_ext'] = function(block) {
  // Prompt function.
  let msg;
  if (block.getField('TEXT')) {
    // Internal message.
    msg = PHP.quote_(block.getFieldValue('TEXT'));
  } else {
    // External message.
    msg = PHP.valueToCode(block, 'TEXT', PHP.ORDER_NONE) || "''";
  }
  let code = 'readline(' + msg + ')';
  const toNumber = block.getFieldValue('TYPE') === 'NUMBER';
  if (toNumber) {
    code = 'floatval(' + code + ')';
  }
  return [code, PHP.ORDER_FUNCTION_CALL];
};

PHP['text_prompt'] = PHP['text_prompt_ext'];

PHP['text_count'] = function(block) {
  const text = PHP.valueToCode(block, 'TEXT', PHP.ORDER_NONE) || "''";
  const sub = PHP.valueToCode(block, 'SUB', PHP.ORDER_NONE) || "''";
  const code = 'strlen(' + sub + ') === 0' +
      ' ? strlen(' + text + ') + 1' +
      ' : substr_count(' + text + ', ' + sub + ')';
  return [code, PHP.ORDER_CONDITIONAL];
};

PHP['text_replace'] = function(block) {
  const text = PHP.valueToCode(block, 'TEXT', PHP.ORDER_NONE) || "''";
  const from = PHP.valueToCode(block, 'FROM', PHP.ORDER_NONE) || "''";
  const to = PHP.valueToCode(block, 'TO', PHP.ORDER_NONE) || "''";
  const code = 'str_replace(' + from + ', ' + to + ', ' + text + ')';
  return [code, PHP.ORDER_FUNCTION_CALL];
};

PHP['text_reverse'] = function(block) {
  const text = PHP.valueToCode(block, 'TEXT', PHP.ORDER_NONE) || "''";
  const code = 'strrev(' + text + ')';
  return [code, PHP.ORDER_FUNCTION_CALL];
};
