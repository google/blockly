/**
 * @license
 * Visual Blocks Language
 *
 * Copyright 2015 Google Inc.
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
 * @fileoverview Generating PHP for text blocks.
 * @author daarond@gmail.com (Daaron Dwyer)
 */
'use strict';

goog.provide('Blockly.PHP.texts');

goog.require('Blockly.PHP');


Blockly.PHP['text'] = function(block) {
  // Text value.
  var code = Blockly.PHP.quote_(block.getFieldValue('TEXT'));
  return [code, Blockly.PHP.ORDER_ATOMIC];
};

Blockly.PHP['text_join'] = function(block) {
  // Create a string made up of any number of elements of any type.
  var code;
  if (block.itemCount_ == 0) {
    return ['\'\'', Blockly.PHP.ORDER_ATOMIC];
  } else if (block.itemCount_ == 1) {
    var argument0 = Blockly.PHP.valueToCode(block, 'ADD0',
        Blockly.PHP.ORDER_NONE) || '\'\'';
    code = argument0;
    return [code, Blockly.PHP.ORDER_FUNCTION_CALL];
  } else if (block.itemCount_ == 2) {
    var argument0 = Blockly.PHP.valueToCode(block, 'ADD0',
        Blockly.PHP.ORDER_NONE) || '\'\'';
    var argument1 = Blockly.PHP.valueToCode(block, 'ADD1',
        Blockly.PHP.ORDER_NONE) || '\'\'';
    code = argument0 + ' . ' + argument1;
    return [code, Blockly.PHP.ORDER_ADDITION];
  } else {
    code = new Array(block.itemCount_);
    for (var n = 0; n < block.itemCount_; n++) {
      code[n] = Blockly.PHP.valueToCode(block, 'ADD' + n,
          Blockly.PHP.ORDER_COMMA) || '\'\'';
    }
    code = 'implode(\'\', array(' + code.join(',') + '))';
    return [code, Blockly.PHP.ORDER_FUNCTION_CALL];
  }
};

Blockly.PHP['text_append'] = function(block) {
  // Append to a variable in place.
  var varName = Blockly.PHP.variableDB_.getName(
      block.getFieldValue('VAR'), Blockly.Variables.NAME_TYPE);
  var argument0 = Blockly.PHP.valueToCode(block, 'TEXT',
      Blockly.PHP.ORDER_NONE) || '\'\'';
  return varName + ' .= ' + argument0 + ';\n';
};

Blockly.PHP['text_length'] = function(block) {
  // String or array length.
  var functionName = Blockly.PHP.provideFunction_(
      'length',
      [ 'function ' + Blockly.PHP.FUNCTION_NAME_PLACEHOLDER_ + '($value) {',
        '  if (is_string($value)) {',
        '    return strlen($value);',
        '  } else {',
        '    return count($value);',
        '  }',
        '}']);
  var argument0 = Blockly.PHP.valueToCode(block, 'VALUE',
      Blockly.PHP.ORDER_FUNCTION_CALL) || '\'\'';
  return [functionName  + '(' + argument0 + ')', Blockly.PHP.ORDER_FUNCTION_CALL];
};

Blockly.PHP['text_isEmpty'] = function(block) {
  // Is the string null or array empty?
  var argument0 = Blockly.PHP.valueToCode(block, 'VALUE',
      Blockly.PHP.ORDER_FUNCTION_CALL) || '\'\'';
  return ['empty(' + argument0 + ')', Blockly.PHP.ORDER_FUNCTION_CALL];
};

Blockly.PHP['text_indexOf'] = function(block) {
  // Search the text for a substring.
  var operator = block.getFieldValue('END') == 'FIRST' ?
      'strpos' : 'strrpos';
  var argument0 = Blockly.PHP.valueToCode(block, 'FIND',
      Blockly.PHP.ORDER_FUNCTION_CALL) || '\'\'';
  var argument1 = Blockly.PHP.valueToCode(block, 'VALUE',
      Blockly.PHP.ORDER_FUNCTION_CALL) || '\'\'';
  if (Blockly.PHP.ONE_BASED_INDEXING) {
    var errorIndex = ' 0';
    var indexAdjustment = ' + 1';
  } else {
    var errorIndex = ' -1';
    var indexAdjustment = '';
  }
  var functionName = Blockly.PHP.provideFunction_(
      block.getFieldValue('END') == 'FIRST' ?
          'text_indexOf' : 'text_lastIndexOf',
      [ 'function ' + Blockly.PHP.FUNCTION_NAME_PLACEHOLDER_ +
          '($text, $search) {',
        '  $pos = ' + operator + '($text, $search);',
        '  return $pos === false ? ' + errorIndex + ' : $pos' +
            indexAdjustment + ';',
        '}']);
  var code = functionName + '(' + argument1 + ', ' + argument0 + ')';
  return [code, Blockly.PHP.ORDER_FUNCTION_CALL];
};

Blockly.PHP['text_charAt'] = function(block) {
  // Get letter at index.
  var where = block.getFieldValue('WHERE') || 'FROM_START';
  switch (where) {
    case 'FIRST':
      var text = Blockly.PHP.valueToCode(block, 'VALUE',
          Blockly.PHP.ORDER_MEMBER) || '\'\'';
      var code = text + '[0]';
      return [code, Blockly.PHP.ORDER_FUNCTION_CALL];
    case 'LAST':
      var text = Blockly.PHP.valueToCode(block, 'VALUE',
          Blockly.PHP.ORDER_COMMA) || '\'\'';
      var code = 'substr(' + text + ', -1, 1)';
      return [code, Blockly.PHP.ORDER_FUNCTION_CALL];
    case 'FROM_START':
      var text = Blockly.PHP.valueToCode(block, 'VALUE',
          Blockly.PHP.ORDER_COMMA) || '\'\'';
      var at = Blockly.PHP.getAdjusted(block, 'AT');
      var code = 'substr(' + text + ', ' + at + ', 1)';
      return [code, Blockly.PHP.ORDER_FUNCTION_CALL];
    case 'FROM_END':
      var text = Blockly.PHP.valueToCode(block, 'VALUE',
          Blockly.PHP.ORDER_COMMA) || '\'\'';
      var at = Blockly.PHP.getAdjusted(block, 'AT', 1, true);
      var code = 'substr(' + text + ', ' + at + ', 1)';
      return [code, Blockly.PHP.ORDER_FUNCTION_CALL];
    case 'RANDOM':
      var text = Blockly.PHP.valueToCode(block, 'VALUE',
          Blockly.PHP.ORDER_NONE) || '\'\'';
      var functionName = Blockly.PHP.provideFunction_(
          'text_random_letter',
          [ 'function ' + Blockly.PHP.FUNCTION_NAME_PLACEHOLDER_ + '($text) {',
            '  return $text[rand(0, strlen($text) - 1)];',
            '}']);
      code = functionName + '(' + text + ')';
      return [code, Blockly.PHP.ORDER_FUNCTION_CALL];
  }
  throw 'Unhandled option (text_charAt).';
};

Blockly.PHP['text_getSubstring'] = function(block) {
  // Get substring.
  var text = Blockly.PHP.valueToCode(block, 'STRING',
      Blockly.PHP.ORDER_FUNCTION_CALL) || '\'\'';
  var where1 = block.getFieldValue('WHERE1');
  var where2 = block.getFieldValue('WHERE2');
  var at1 = Blockly.PHP.valueToCode(block, 'AT1',
      Blockly.PHP.ORDER_FUNCTION_CALL) || '0';
  var at2 = Blockly.PHP.valueToCode(block, 'AT2',
      Blockly.PHP.ORDER_FUNCTION_CALL) || '0';
  if (where1 == 'FIRST' && where2 == 'LAST') {
    var code = text;
  } else {
    var at1 = Blockly.PHP.getAdjusted(block, 'AT1');
    var at2 = Blockly.PHP.getAdjusted(block, 'AT2');
    var functionName = Blockly.PHP.provideFunction_(
        'text_get_substring',
        [ 'function ' + Blockly.PHP.FUNCTION_NAME_PLACEHOLDER_ +
            '($text, $where1, $at1, $where2, $at2) {',
          '  if ($where1 == \'FROM_END\') {',
          '    $at1 = strlen($text) - 1 - $at1;',
          '  } else if ($where1 == \'FIRST\') {',
          '    $at1 = 0;',
          '  } else if ($where1 != \'FROM_START\'){',
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
    var code = functionName + '(' + text + ', \'' +
        where1 + '\', ' + at1 + ', \'' + where2 + '\', ' + at2 + ')';
  }
  return [code, Blockly.PHP.ORDER_FUNCTION_CALL];
};

Blockly.PHP['text_changeCase'] = function(block) {
  // Change capitalization.
  var code;
  if (block.getFieldValue('CASE') == 'UPPERCASE') {
    var argument0 = Blockly.PHP.valueToCode(block, 'TEXT',
            Blockly.PHP.ORDER_FUNCTION_CALL) || '\'\'';
    code = 'strtoupper(' + argument0 + ')';
  } else if (block.getFieldValue('CASE') == 'LOWERCASE') {
    var argument0 = Blockly.PHP.valueToCode(block, 'TEXT',
            Blockly.PHP.ORDER_FUNCTION_CALL) || '\'\'';
    code = 'strtolower(' + argument0 + ')';
  } else if (block.getFieldValue('CASE') == 'TITLECASE') {
    var argument0 = Blockly.PHP.valueToCode(block, 'TEXT',
            Blockly.PHP.ORDER_FUNCTION_CALL) || '\'\'';
    code = 'ucwords(strtolower(' + argument0 + '))';
  }
  return [code, Blockly.PHP.ORDER_FUNCTION_CALL];
};

Blockly.PHP['text_trim'] = function(block) {
  // Trim spaces.
  var OPERATORS = {
    'LEFT': 'ltrim',
    'RIGHT': 'rtrim',
    'BOTH': 'trim'
  };
  var operator = OPERATORS[block.getFieldValue('MODE')];
  var argument0 = Blockly.PHP.valueToCode(block, 'TEXT',
      Blockly.PHP.ORDER_NONE) || '\'\'';
  return [ operator + '(' + argument0 + ')', Blockly.PHP.ORDER_FUNCTION_CALL];
};

Blockly.PHP['text_print'] = function(block) {
  // Print statement.
  var argument0 = Blockly.PHP.valueToCode(block, 'TEXT',
      Blockly.PHP.ORDER_NONE) || '\'\'';
  return 'print(' + argument0 + ');\n';
};

Blockly.PHP['text_prompt_ext'] = function(block) {
  // Prompt function.
  if (block.getField('TEXT')) {
    // Internal message.
    var msg = Blockly.PHP.quote_(block.getFieldValue('TEXT'));
  } else {
    // External message.
    var msg = Blockly.PHP.valueToCode(block, 'TEXT',
        Blockly.PHP.ORDER_NONE) || '\'\'';
  }
  var code = 'readline(' + msg + ')';
  var toNumber = block.getFieldValue('TYPE') == 'NUMBER';
  if (toNumber) {
    code = 'floatval(' + code + ')';
  }
  return [code, Blockly.PHP.ORDER_FUNCTION_CALL];
};

Blockly.PHP['text_prompt'] = Blockly.PHP['text_prompt_ext'];
