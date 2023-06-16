/**
 * @license
 * Copyright 2015 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Generating PHP for text blocks.
 */

import * as goog from '../../closure/goog/goog.js';
goog.declareModuleId('Blockly.PHP.texts');

import {NameType} from '../../core/names.js';
import {phpGenerator, Order} from '../php.js';


phpGenerator.forBlock['text'] = function(block, generator) {
  // Text value.
  const code = generator.quote_(block.getFieldValue('TEXT'));
  return [code, Order.ATOMIC];
};

phpGenerator.forBlock['text_multiline'] = function(block, generator) {
  // Text value.
  const code = generator.multiline_quote_(block.getFieldValue('TEXT'));
  const order =
      code.indexOf('.') !== -1 ? Order.STRING_CONCAT : Order.ATOMIC;
  return [code, order];
};

phpGenerator.forBlock['text_join'] = function(block, generator) {
  // Create a string made up of any number of elements of any type.
  if (block.itemCount_ === 0) {
    return ["''", Order.ATOMIC];
  } else if (block.itemCount_ === 1) {
    const element = generator.valueToCode(block, 'ADD0', Order.NONE) || "''";
    const code = element;
    return [code, Order.NONE];
  } else if (block.itemCount_ === 2) {
    const element0 =
        generator.valueToCode(block, 'ADD0', Order.STRING_CONCAT) || "''";
    const element1 =
        generator.valueToCode(block, 'ADD1', Order.STRING_CONCAT) || "''";
    const code = element0 + ' . ' + element1;
    return [code, Order.STRING_CONCAT];
  } else {
    const elements = new Array(block.itemCount_);
    for (let i = 0; i < block.itemCount_; i++) {
      elements[i] =
          generator.valueToCode(block, 'ADD' + i, Order.NONE) || "''";
    }
    const code = 'implode(\'\', array(' + elements.join(',') + '))';
    return [code, Order.FUNCTION_CALL];
  }
};

phpGenerator.forBlock['text_append'] = function(block, generator) {
  // Append to a variable in place.
  const varName =
      generator.nameDB_.getName(
        block.getFieldValue('VAR'), NameType.VARIABLE);
  const value =
      generator.valueToCode(block, 'TEXT', Order.ASSIGNMENT) || "''";
  return varName + ' .= ' + value + ';\n';
};

phpGenerator.forBlock['text_length'] = function(block, generator) {
  // String or array length.
  const functionName = generator.provideFunction_('length', `
function ${generator.FUNCTION_NAME_PLACEHOLDER_}($value) {
  if (is_string($value)) {
    return strlen($value);
  }
  return count($value);
}
`);
  const text = generator.valueToCode(block, 'VALUE', Order.NONE) || "''";
  return [functionName + '(' + text + ')', Order.FUNCTION_CALL];
};

phpGenerator.forBlock['text_isEmpty'] = function(block, generator) {
  // Is the string null or array empty?
  const text = generator.valueToCode(block, 'VALUE', Order.NONE) || "''";
  return ['empty(' + text + ')', Order.FUNCTION_CALL];
};

phpGenerator.forBlock['text_indexOf'] = function(block, generator) {
  // Search the text for a substring.
  const operator =
      block.getFieldValue('END') === 'FIRST' ? 'strpos' : 'strrpos';
  const substring = generator.valueToCode(block, 'FIND', Order.NONE) || "''";
  const text = generator.valueToCode(block, 'VALUE', Order.NONE) || "''";
  let errorIndex = ' -1';
  let indexAdjustment = '';
  if (block.workspace.options.oneBasedIndex) {
    errorIndex = ' 0';
    indexAdjustment = ' + 1';
  }
  const functionName = generator.provideFunction_(
      block.getFieldValue('END') === 'FIRST' ? 'text_indexOf' :
                                               'text_lastIndexOf',
      `
function ${generator.FUNCTION_NAME_PLACEHOLDER_}($text, $search) {
  $pos = ${operator}($text, $search);
  return $pos === false ? ${errorIndex} : $pos${indexAdjustment};
}
`);
  const code = functionName + '(' + text + ', ' + substring + ')';
  return [code, Order.FUNCTION_CALL];
};

phpGenerator.forBlock['text_charAt'] = function(block, generator) {
  // Get letter at index.
  const where = block.getFieldValue('WHERE') || 'FROM_START';
  const textOrder = (where === 'RANDOM') ? Order.NONE : Order.NONE;
  const text = generator.valueToCode(block, 'VALUE', textOrder) || "''";
  switch (where) {
    case 'FIRST': {
      const code = 'substr(' + text + ', 0, 1)';
      return [code, Order.FUNCTION_CALL];
    }
    case 'LAST': {
      const code = 'substr(' + text + ', -1)';
      return [code, Order.FUNCTION_CALL];
    }
    case 'FROM_START': {
      const at = generator.getAdjusted(block, 'AT');
      const code = 'substr(' + text + ', ' + at + ', 1)';
      return [code, Order.FUNCTION_CALL];
    }
    case 'FROM_END': {
      const at = generator.getAdjusted(block, 'AT', 1, true);
      const code = 'substr(' + text + ', ' + at + ', 1)';
      return [code, Order.FUNCTION_CALL];
    }
    case 'RANDOM': {
      const functionName = generator.provideFunction_('text_random_letter', `
function ${generator.FUNCTION_NAME_PLACEHOLDER_}($text) {
  return $text[rand(0, strlen($text) - 1)];
}
`);
      const code = functionName + '(' + text + ')';
      return [code, Order.FUNCTION_CALL];
    }
  }
  throw Error('Unhandled option (text_charAt).');
};

phpGenerator.forBlock['text_getSubstring'] = function(block, generator) {
  // Get substring.
  const where1 = block.getFieldValue('WHERE1');
  const where2 = block.getFieldValue('WHERE2');
  const text = generator.valueToCode(block, 'STRING', Order.NONE) || "''";
  if (where1 === 'FIRST' && where2 === 'LAST') {
    const code = text;
    return [code, Order.NONE];
  } else {
    const at1 = generator.getAdjusted(block, 'AT1');
    const at2 = generator.getAdjusted(block, 'AT2');
    const functionName = generator.provideFunction_('text_get_substring', `
function ${generator.FUNCTION_NAME_PLACEHOLDER_}($text, $where1, $at1, $where2, $at2) {
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
    return [code, Order.FUNCTION_CALL];
  }
};

phpGenerator.forBlock['text_changeCase'] = function(block, generator) {
  // Change capitalization.
  const text = generator.valueToCode(block, 'TEXT', Order.NONE) || "''";
  let code;
  if (block.getFieldValue('CASE') === 'UPPERCASE') {
    code = 'strtoupper(' + text + ')';
  } else if (block.getFieldValue('CASE') === 'LOWERCASE') {
    code = 'strtolower(' + text + ')';
  } else if (block.getFieldValue('CASE') === 'TITLECASE') {
    code = 'ucwords(strtolower(' + text + '))';
  }
  return [code, Order.FUNCTION_CALL];
};

phpGenerator.forBlock['text_trim'] = function(block, generator) {
  // Trim spaces.
  const OPERATORS = {'LEFT': 'ltrim', 'RIGHT': 'rtrim', 'BOTH': 'trim'};
  const operator = OPERATORS[block.getFieldValue('MODE')];
  const text = generator.valueToCode(block, 'TEXT', Order.NONE) || "''";
  return [operator + '(' + text + ')', Order.FUNCTION_CALL];
};

phpGenerator.forBlock['text_print'] = function(block, generator) {
  // Print statement.
  const msg = generator.valueToCode(block, 'TEXT', Order.NONE) || "''";
  return 'print(' + msg + ');\n';
};

phpGenerator.forBlock['text_prompt_ext'] = function(block, generator) {
  // Prompt function.
  let msg;
  if (block.getField('TEXT')) {
    // Internal message.
    msg = generator.quote_(block.getFieldValue('TEXT'));
  } else {
    // External message.
    msg = generator.valueToCode(block, 'TEXT', Order.NONE) || "''";
  }
  let code = 'readline(' + msg + ')';
  const toNumber = block.getFieldValue('TYPE') === 'NUMBER';
  if (toNumber) {
    code = 'floatval(' + code + ')';
  }
  return [code, Order.FUNCTION_CALL];
};

phpGenerator.forBlock['text_prompt'] = phpGenerator.forBlock['text_prompt_ext'];

phpGenerator.forBlock['text_count'] = function(block, generator) {
  const text = generator.valueToCode(block, 'TEXT', Order.NONE) || "''";
  const sub = generator.valueToCode(block, 'SUB', Order.NONE) || "''";
  const code = 'strlen(' + sub + ') === 0' +
      ' ? strlen(' + text + ') + 1' +
      ' : substr_count(' + text + ', ' + sub + ')';
  return [code, Order.CONDITIONAL];
};

phpGenerator.forBlock['text_replace'] = function(block, generator) {
  const text = generator.valueToCode(block, 'TEXT', Order.NONE) || "''";
  const from = generator.valueToCode(block, 'FROM', Order.NONE) || "''";
  const to = generator.valueToCode(block, 'TO', Order.NONE) || "''";
  const code = 'str_replace(' + from + ', ' + to + ', ' + text + ')';
  return [code, Order.FUNCTION_CALL];
};

phpGenerator.forBlock['text_reverse'] = function(block, generator) {
  const text = generator.valueToCode(block, 'TEXT', Order.NONE) || "''";
  const code = 'strrev(' + text + ')';
  return [code, Order.FUNCTION_CALL];
};
