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

goog.provide('Blockly.SQL.texts');

goog.require('Blockly.SQL');


Blockly.SQL['text'] = function(block) {
  // Text value.
  var code = Blockly.SQL.quote_(block.getFieldValue('TEXT'));
  return [code, Blockly.SQL.ORDER_ATOMIC];
};

Blockly.SQL['text_join'] = function(block) {
  // Create a string made up of any number of elements of any type.
  var code;
  if (block.itemCount_ == 0) {
    return ['\'\'', Blockly.SQL.ORDER_ATOMIC];
  } else if (block.itemCount_ == 1) {
    var argument0 = Blockly.SQL.valueToCode(block, 'ADD0',
        Blockly.SQL.ORDER_NONE) || '\'\'';
    code = argument0;
    return [code, Blockly.SQL.ORDER_FUNCTION_CALL];
  } else if (block.itemCount_ == 2) {
    var argument0 = Blockly.SQL.valueToCode(block, 'ADD0',
        Blockly.SQL.ORDER_NONE) || '\'\'';
    var argument1 = Blockly.SQL.valueToCode(block, 'ADD1',
        Blockly.SQL.ORDER_NONE) || '\'\'';
    code = argument0 + ' . ' + argument1;
    return [code, Blockly.SQL.ORDER_ADDITION];
  } else {
    code = new Array(block.itemCount_);
    for (var n = 0; n < block.itemCount_; n++) {
      code[n] = Blockly.SQL.valueToCode(block, 'ADD' + n,
          Blockly.SQL.ORDER_COMMA) || '\'\'';
    }
    code = 'implode(\'\', array(' + code.join(',') + '))';
    return [code, Blockly.SQL.ORDER_FUNCTION_CALL];
  }
};

Blockly.SQL['text_append'] = function(block) {
  // Append to a variable in place.
  var varName = Blockly.SQL.variableDB_.getName(
      block.getFieldValue('VAR'), Blockly.Variables.NAME_TYPE);
  var argument0 = Blockly.SQL.valueToCode(block, 'TEXT',
      Blockly.SQL.ORDER_NONE) || '\'\'';
  return varName + ' .= ' + argument0 + ';\n';
};

Blockly.SQL['text_length'] = function(block) {
  // String or array length.
  var functionName = Blockly.SQL.provideFunction_(
      'length',
      [ 'function ' + Blockly.SQL.FUNCTION_NAME_PLACEHOLDER_ + '($value) {',
        '  if (is_string($value)) {',
        '    return strlen($value);',
        '  } else {',
        '    return count($value);',
        '  }',
        '}']);
  var argument0 = Blockly.SQL.valueToCode(block, 'VALUE',
      Blockly.SQL.ORDER_FUNCTION_CALL) || '\'\'';
  return [functionName  + '(' + argument0 + ')', Blockly.SQL.ORDER_FUNCTION_CALL];
};

Blockly.SQL['text_isEmpty'] = function(block) {
  // Is the string null or array empty?
  var argument0 = Blockly.SQL.valueToCode(block, 'VALUE',
      Blockly.SQL.ORDER_FUNCTION_CALL) || '\'\'';
  return ['empty(' + argument0 + ')', Blockly.SQL.ORDER_FUNCTION_CALL];
};

Blockly.SQL['text_indexOf'] = function(block) {
  // Search the text for a substring.
  var operator = block.getFieldValue('END') == 'FIRST' ?
      'strpos' : 'strrpos';
  var argument0 = Blockly.SQL.valueToCode(block, 'FIND',
      Blockly.SQL.ORDER_FUNCTION_CALL) || '\'\'';
  var argument1 = Blockly.SQL.valueToCode(block, 'VALUE',
      Blockly.SQL.ORDER_FUNCTION_CALL) || '\'\'';
  var code = operator + '(' + argument1 + ', ' + argument0 + ') + 1';

  var functionName = Blockly.SQL.provideFunction_(
      block.getFieldValue('END') == 'FIRST' ?
          'text_indexOf' : 'text_lastIndexOf',
      [ 'function ' + Blockly.SQL.FUNCTION_NAME_PLACEHOLDER_ +
          '($text, $search) {',
        '  $pos = ' + operator + '($text, $search);',
        '  return $pos === false ? 0 : $pos + 1;',
        '}']);
  code = functionName + '(' + argument1 + ', ' + argument0 + ')';
  return [code, Blockly.SQL.ORDER_FUNCTION_CALL];
};

Blockly.SQL['text_charAt'] = function(block) {
  // Get letter at index.
  var where = block.getFieldValue('WHERE') || 'FROM_START';
  var at = Blockly.SQL.valueToCode(block, 'AT',
      Blockly.SQL.ORDER_FUNCTION_CALL) || '0';
  var text = Blockly.SQL.valueToCode(block, 'VALUE',
      Blockly.SQL.ORDER_FUNCTION_CALL) || '\'\'';
  switch (where) {
    case 'FIRST':
      var code = text + '[0]';
      return [code, Blockly.SQL.ORDER_FUNCTION_CALL];
    case 'LAST':
      var code = 'substr(' + text + ', -1, 1)';
      return [code, Blockly.SQL.ORDER_FUNCTION_CALL];
    case 'FROM_START':
      // Blockly uses one-based indicies.
      if (Blockly.isNumber(at)) {
        // If the index is a naked number, decrement it right now.
        at = parseFloat(at) - 1;
      } else {
        // If the index is dynamic, decrement it in code.
        at += ' - 1';
      }
      var code = 'substr(' + text + ', ' + at + ', 1)';
      return [code, Blockly.SQL.ORDER_FUNCTION_CALL];
    case 'FROM_END':
      var code = 'substr(' + text + ', -' + at + ', 1)';
      return [code, Blockly.SQL.ORDER_FUNCTION_CALL];
    case 'RANDOM':
      var functionName = Blockly.SQL.provideFunction_(
          'text_random_letter',
          [ 'function ' + Blockly.SQL.FUNCTION_NAME_PLACEHOLDER_ + '($text) {',
            '  return $text[rand(0, strlen($text) - 1)];',
            '}']);
      code = functionName + '(' + text + ')';
      return [code, Blockly.SQL.ORDER_FUNCTION_CALL];
  }
  throw 'Unhandled option (text_charAt).';
};

Blockly.SQL['text_getSubstring'] = function(block) {
  // Get substring.
  var text = Blockly.SQL.valueToCode(block, 'STRING',
      Blockly.SQL.ORDER_FUNCTION_CALL) || '\'\'';
  var where1 = block.getFieldValue('WHERE1');
  var where2 = block.getFieldValue('WHERE2');
  var at1 = Blockly.SQL.valueToCode(block, 'AT1',
      Blockly.SQL.ORDER_FUNCTION_CALL) || '0';
  var at2 = Blockly.SQL.valueToCode(block, 'AT2',
      Blockly.SQL.ORDER_FUNCTION_CALL) || '0';
  if (where1 == 'FIRST' && where2 == 'LAST') {
    var code = text;
  } else {
    var functionName = Blockly.SQL.provideFunction_(
        'text_get_substring',
        [ 'function ' + Blockly.SQL.FUNCTION_NAME_PLACEHOLDER_ +
            '($text, $where1, $at1, $where2, $at2) {',
          '    if ($where2 == \'FROM_START\') {',
          '      $at2--;',
          '    } else if ($where2 == \'FROM_END\') {',
          '      $at2 = $at2 - $at1;',
          '    } else if ($where2 == \'FIRST\') {',
          '      $at2 = 0;',
          '    } else if ($where2 == \'LAST\') {',
          '      $at2 = strlen($text);',
          '    } else { $at2 = 0; }',
          '    if ($where1 == \'FROM_START\') {',
          '      $at1--;',
          '    } else if ($where1 == \'FROM_END\') {',
          '      $at1 = strlen($text) - $at1;',
          '    } else if ($where1 == \'FIRST\') {',
          '      $at1 = 0;',
          '    } else if ($where1 == \'LAST\') {',
          '      $at1 = strlen($text) - 1;',
          '    } else { $at1 = 0; }',
          '  return substr($text, $at1, $at2);',
          '}']);
    var code = functionName + '(' + text + ', \'' +
        where1 + '\', ' + at1 + ', \'' + where2 + '\', ' + at2 + ')';
  }
  return [code, Blockly.SQL.ORDER_FUNCTION_CALL];
};

Blockly.SQL['text_changeCase'] = function(block) {
  // Change capitalization.
  var code;
  if (block.getFieldValue('CASE') == 'UPPERCASE') {
    var argument0 = Blockly.SQL.valueToCode(block, 'TEXT',
            Blockly.SQL.ORDER_FUNCTION_CALL) || '\'\'';
    code = 'strtoupper(' + argument0 + ')';
  } else if (block.getFieldValue('CASE') == 'LOWERCASE') {
    var argument0 = Blockly.SQL.valueToCode(block, 'TEXT',
            Blockly.SQL.ORDER_FUNCTION_CALL) || '\'\'';
    code = 'strtolower(' + argument0 + ')';
  } else if (block.getFieldValue('CASE') == 'TITLECASE') {
    var argument0 = Blockly.SQL.valueToCode(block, 'TEXT',
            Blockly.SQL.ORDER_FUNCTION_CALL) || '\'\'';
    code = 'ucwords(strtolower(' + argument0 + '))';
  }
  return [code, Blockly.SQL.ORDER_FUNCTION_CALL];
};

Blockly.SQL['text_trim'] = function(block) {
  // Trim spaces.
  var OPERATORS = {
    'LEFT': 'ltrim',
    'RIGHT': 'rtrim',
    'BOTH': 'trim'
  };
  var operator = OPERATORS[block.getFieldValue('MODE')];
  var argument0 = Blockly.SQL.valueToCode(block, 'TEXT',
      Blockly.SQL.ORDER_NONE) || '\'\'';
  return [ operator + '(' + argument0 + ')', Blockly.SQL.ORDER_FUNCTION_CALL];
};

Blockly.SQL['text_print'] = function(block) {
  // Print statement.
  var argument0 = Blockly.SQL.valueToCode(block, 'TEXT',
      Blockly.SQL.ORDER_NONE) || '\'\'';
  return 'print(' + argument0 + ');\n';
};

Blockly.SQL['text_prompt_ext'] = function(block) {
  // Prompt function.
  if (block.getField('TEXT')) {
    // Internal message.
    var msg = Blockly.SQL.quote_(block.getFieldValue('TEXT'));
  } else {
    // External message.
    var msg = Blockly.SQL.valueToCode(block, 'TEXT',
        Blockly.SQL.ORDER_NONE) || '\'\'';
  }
  var code = 'readline(' + msg + ')';
  var toNumber = block.getFieldValue('TYPE') == 'NUMBER';
  if (toNumber) {
    code = 'floatval(' + code + ')';
  }
  return [code, Blockly.SQL.ORDER_FUNCTION_CALL];
};

Blockly.SQL['text_prompt'] = Blockly.SQL['text_prompt_ext'];
