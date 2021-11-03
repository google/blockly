/**
 * @license
 * Copyright 2015 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Generating PHP for text blocks.
 */
'use strict';

goog.provide('Blockly.PHP.texts');

goog.require('Blockly.PHP');


Blockly.PHP['text'] = function(block) {
  // Text value.
  const code = Blockly.PHP.quote_(block.getFieldValue('TEXT'));
  return [code, Blockly.PHP.ORDER_ATOMIC];
};

Blockly.PHP['text_multiline'] = function(block) {
  // Text value.
  const code = Blockly.PHP.multiline_quote_(block.getFieldValue('TEXT'));
  const order = code.indexOf('.') !== -1 ? Blockly.PHP.ORDER_STRING_CONCAT :
      Blockly.PHP.ORDER_ATOMIC;
  return [code, order];
};

Blockly.PHP['text_join'] = function(block) {
  // Create a string made up of any number of elements of any type.
  if (block.itemCount_ === 0) {
    return ['\'\'', Blockly.PHP.ORDER_ATOMIC];
  } else if (block.itemCount_ === 1) {
    const element = Blockly.PHP.valueToCode(block, 'ADD0',
        Blockly.PHP.ORDER_NONE) || '\'\'';
    const code = element;
    return [code, Blockly.PHP.ORDER_NONE];
  } else if (block.itemCount_ === 2) {
    const element0 = Blockly.PHP.valueToCode(block, 'ADD0',
        Blockly.PHP.ORDER_STRING_CONCAT) || '\'\'';
    const element1 = Blockly.PHP.valueToCode(block, 'ADD1',
        Blockly.PHP.ORDER_STRING_CONCAT) || '\'\'';
    const code = element0 + ' . ' + element1;
    return [code, Blockly.PHP.ORDER_STRING_CONCAT];
  } else {
    const elements = new Array(block.itemCount_);
    for (let i = 0; i < block.itemCount_; i++) {
      elements[i] = Blockly.PHP.valueToCode(block, 'ADD' + i,
          Blockly.PHP.ORDER_NONE) || '\'\'';
    }
    const code = 'implode(\'\', array(' + elements.join(',') + '))';
    return [code, Blockly.PHP.ORDER_FUNCTION_CALL];
  }
};

Blockly.PHP['text_append'] = function(block) {
  // Append to a variable in place.
  const varName = Blockly.PHP.nameDB_.getName(
      block.getFieldValue('VAR'), Blockly.VARIABLE_CATEGORY_NAME);
  const value = Blockly.PHP.valueToCode(block, 'TEXT',
      Blockly.PHP.ORDER_ASSIGNMENT) || '\'\'';
  return varName + ' .= ' + value + ';\n';
};

Blockly.PHP['text_length'] = function(block) {
  // String or array length.
  const functionName = Blockly.PHP.provideFunction_(
      'length',
      ['function ' + Blockly.PHP.FUNCTION_NAME_PLACEHOLDER_ + '($value) {',
       '  if (is_string($value)) {',
       '    return strlen($value);',
       '  } else {',
       '    return count($value);',
       '  }',
       '}']);
  const text = Blockly.PHP.valueToCode(block, 'VALUE',
      Blockly.PHP.ORDER_NONE) || '\'\'';
  return [functionName + '(' + text + ')', Blockly.PHP.ORDER_FUNCTION_CALL];
};

Blockly.PHP['text_isEmpty'] = function(block) {
  // Is the string null or array empty?
  const text = Blockly.PHP.valueToCode(block, 'VALUE',
      Blockly.PHP.ORDER_NONE) || '\'\'';
  return ['empty(' + text + ')', Blockly.PHP.ORDER_FUNCTION_CALL];
};

Blockly.PHP['text_indexOf'] = function(block) {
  // Search the text for a substring.
  const operator = block.getFieldValue('END') === 'FIRST' ?
      'strpos' : 'strrpos';
  const substring = Blockly.PHP.valueToCode(block, 'FIND',
      Blockly.PHP.ORDER_NONE) || '\'\'';
  const text = Blockly.PHP.valueToCode(block, 'VALUE',
      Blockly.PHP.ORDER_NONE) || '\'\'';
  let errorIndex = ' -1';
  let indexAdjustment = '';
  if (block.workspace.options.oneBasedIndex) {
    errorIndex = ' 0';
    indexAdjustment = ' + 1';
  }
  const functionName = Blockly.PHP.provideFunction_(
      block.getFieldValue('END') === 'FIRST' ?
          'text_indexOf' : 'text_lastIndexOf',
      ['function ' + Blockly.PHP.FUNCTION_NAME_PLACEHOLDER_ +
          '($text, $search) {',
       '  $pos = ' + operator + '($text, $search);',
       '  return $pos === false ? ' + errorIndex + ' : $pos' +
          indexAdjustment + ';',
       '}']);
  const code = functionName + '(' + text + ', ' + substring + ')';
  return [code, Blockly.PHP.ORDER_FUNCTION_CALL];
};

Blockly.PHP['text_charAt'] = function(block) {
  // Get letter at index.
  const where = block.getFieldValue('WHERE') || 'FROM_START';
  const textOrder = (where === 'RANDOM') ? Blockly.PHP.ORDER_NONE :
      Blockly.PHP.ORDER_NONE;
  const text = Blockly.PHP.valueToCode(block, 'VALUE', textOrder) || '\'\'';
  switch (where) {
    case 'FIRST': {
      const code = 'substr(' + text + ', 0, 1)';
      return [code, Blockly.PHP.ORDER_FUNCTION_CALL];
    }
    case 'LAST': {
      const code = 'substr(' + text + ', -1)';
      return [code, Blockly.PHP.ORDER_FUNCTION_CALL];
    }
    case 'FROM_START': {
      const at = Blockly.PHP.getAdjusted(block, 'AT');
      const code = 'substr(' + text + ', ' + at + ', 1)';
      return [code, Blockly.PHP.ORDER_FUNCTION_CALL];
    }
    case 'FROM_END': {
      const at = Blockly.PHP.getAdjusted(block, 'AT', 1, true);
      const code = 'substr(' + text + ', ' + at + ', 1)';
      return [code, Blockly.PHP.ORDER_FUNCTION_CALL];
    }
    case 'RANDOM': {
      const functionName = Blockly.PHP.provideFunction_(
          'text_random_letter',
          ['function ' + Blockly.PHP.FUNCTION_NAME_PLACEHOLDER_ + '($text) {',
           '  return $text[rand(0, strlen($text) - 1)];',
           '}']);
      const code = functionName + '(' + text + ')';
      return [code, Blockly.PHP.ORDER_FUNCTION_CALL];
    }
  }
  throw Error('Unhandled option (text_charAt).');
};

Blockly.PHP['text_getSubstring'] = function(block) {
  // Get substring.
  const where1 = block.getFieldValue('WHERE1');
  const where2 = block.getFieldValue('WHERE2');
  const text = Blockly.PHP.valueToCode(block, 'STRING',
      Blockly.PHP.ORDER_NONE) || '\'\'';
  if (where1 === 'FIRST' && where2 === 'LAST') {
    const code = text;
    return [code, Blockly.PHP.ORDER_NONE];
  } else {
    const at1 = Blockly.PHP.getAdjusted(block, 'AT1');
    const at2 = Blockly.PHP.getAdjusted(block, 'AT2');
    const functionName = Blockly.PHP.provideFunction_(
        'text_get_substring',
        ['function ' + Blockly.PHP.FUNCTION_NAME_PLACEHOLDER_ +
            '($text, $where1, $at1, $where2, $at2) {',
         '  if ($where1 == \'FROM_END\') {',
         '    $at1 = strlen($text) - 1 - $at1;',
         '  } else if ($where1 == \'FIRST\') {',
         '    $at1 = 0;',
         '  } else if ($where1 != \'FROM_START\') {',
         '    throw new Exception(\'Unhandled option (text_get_substring).\');',
         '  }',
         '  $length = 0;',
         '  if ($where2 == \'FROM_START\') {',
         '    $length = $at2 - $at1 + 1;',
         '  } else if ($where2 == \'FROM_END\') {',
         '    $length = strlen($text) - $at1 - $at2;',
         '  } else if ($where2 == \'LAST\') {',
         '    $length = strlen($text) - $at1;',
         '  } else {',
         '    throw new Exception(\'Unhandled option (text_get_substring).\');',
         '  }',
         '  return substr($text, $at1, $length);',
         '}']);
    const code = functionName + '(' + text + ', \'' +
        where1 + '\', ' + at1 + ', \'' + where2 + '\', ' + at2 + ')';
    return [code, Blockly.PHP.ORDER_FUNCTION_CALL];
  }
};

Blockly.PHP['text_changeCase'] = function(block) {
  // Change capitalization.
  const text = Blockly.PHP.valueToCode(block, 'TEXT',
          Blockly.PHP.ORDER_NONE) || '\'\'';
  let code;
  if (block.getFieldValue('CASE') === 'UPPERCASE') {
    code = 'strtoupper(' + text + ')';
  } else if (block.getFieldValue('CASE') === 'LOWERCASE') {
    code = 'strtolower(' + text + ')';
  } else if (block.getFieldValue('CASE') === 'TITLECASE') {
    code = 'ucwords(strtolower(' + text + '))';
  }
  return [code, Blockly.PHP.ORDER_FUNCTION_CALL];
};

Blockly.PHP['text_trim'] = function(block) {
  // Trim spaces.
  const OPERATORS = {
    'LEFT': 'ltrim',
    'RIGHT': 'rtrim',
    'BOTH': 'trim'
  };
  const operator = OPERATORS[block.getFieldValue('MODE')];
  const text = Blockly.PHP.valueToCode(block, 'TEXT',
      Blockly.PHP.ORDER_NONE) || '\'\'';
  return [operator + '(' + text + ')', Blockly.PHP.ORDER_FUNCTION_CALL];
};

Blockly.PHP['text_print'] = function(block) {
  // Print statement.
  const msg = Blockly.PHP.valueToCode(block, 'TEXT',
      Blockly.PHP.ORDER_NONE) || '\'\'';
  return 'print(' + msg + ');\n';
};

Blockly.PHP['text_prompt_ext'] = function(block) {
  // Prompt function.
  let msg;
  if (block.getField('TEXT')) {
    // Internal message.
    msg = Blockly.PHP.quote_(block.getFieldValue('TEXT'));
  } else {
    // External message.
    msg = Blockly.PHP.valueToCode(block, 'TEXT',
        Blockly.PHP.ORDER_NONE) || '\'\'';
  }
  let code = 'readline(' + msg + ')';
  const toNumber = block.getFieldValue('TYPE') === 'NUMBER';
  if (toNumber) {
    code = 'floatval(' + code + ')';
  }
  return [code, Blockly.PHP.ORDER_FUNCTION_CALL];
};

Blockly.PHP['text_prompt'] = Blockly.PHP['text_prompt_ext'];

Blockly.PHP['text_count'] = function(block) {
  const text = Blockly.PHP.valueToCode(block, 'TEXT',
      Blockly.PHP.ORDER_NONE) || '\'\'';
  const sub = Blockly.PHP.valueToCode(block, 'SUB',
      Blockly.PHP.ORDER_NONE) || '\'\'';
  const code = 'strlen(' + sub + ') === 0'
    + ' ? strlen(' + text + ') + 1'
    + ' : substr_count(' + text + ', ' + sub + ')';
  return [code, Blockly.PHP.ORDER_CONDITIONAL];
};

Blockly.PHP['text_replace'] = function(block) {
  const text = Blockly.PHP.valueToCode(block, 'TEXT',
      Blockly.PHP.ORDER_NONE) || '\'\'';
  const from = Blockly.PHP.valueToCode(block, 'FROM',
      Blockly.PHP.ORDER_NONE) || '\'\'';
  const to = Blockly.PHP.valueToCode(block, 'TO',
      Blockly.PHP.ORDER_NONE) || '\'\'';
  const code = 'str_replace(' + from + ', ' + to + ', ' + text + ')';
  return [code, Blockly.PHP.ORDER_FUNCTION_CALL];
};

Blockly.PHP['text_reverse'] = function(block) {
  const text = Blockly.PHP.valueToCode(block, 'TEXT',
      Blockly.PHP.ORDER_NONE) || '\'\'';
  const code = 'strrev(' + text + ')';
  return [code, Blockly.PHP.ORDER_FUNCTION_CALL];
};
