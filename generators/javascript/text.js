/**
 * @license
 * Visual Blocks Language
 *
 * Copyright 2012 Google Inc.
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
 * @fileoverview Generating JavaScript for text blocks.
 * @author fraser@google.com (Neil Fraser)
 */
'use strict';

goog.provide('Blockly.JavaScript.texts');

goog.require('Blockly.JavaScript');


Blockly.JavaScript['text'] = function(block) {
  // Text value.
  var code = Blockly.JavaScript.quote_(block.getFieldValue('TEXT'));
  return [code, Blockly.JavaScript.ORDER_ATOMIC];
};

Blockly.JavaScript['text_join'] = function(block) {
  // Create a string made up of any number of elements of any type.
  switch (block.itemCount_) {
    case 0:
      return ['\'\'', Blockly.JavaScript.ORDER_ATOMIC];
    case 1:
      var argument0 = Blockly.JavaScript.valueToCode(block, 'ADD0',
              Blockly.JavaScript.ORDER_NONE) || '\'\'';
      var code = 'String(' + argument0 + ')';
      return [code, Blockly.JavaScript.ORDER_FUNCTION_CALL];
    case 2:
      var argument0 = Blockly.JavaScript.valueToCode(block, 'ADD0',
              Blockly.JavaScript.ORDER_NONE) || '\'\'';
      var argument1 = Blockly.JavaScript.valueToCode(block, 'ADD1',
              Blockly.JavaScript.ORDER_NONE) || '\'\'';
      var code = 'String(' + argument0 + ') + String(' + argument1 + ')';
      return [code, Blockly.JavaScript.ORDER_ADDITION];
    default:
      var code = new Array(block.itemCount_);
      for (var n = 0; n < block.itemCount_; n++) {
        code[n] = Blockly.JavaScript.valueToCode(block, 'ADD' + n,
                Blockly.JavaScript.ORDER_COMMA) || '\'\'';
      }
      code = '[' + code.join(',') + '].join(\'\')';
      return [code, Blockly.JavaScript.ORDER_FUNCTION_CALL];
  }
};

Blockly.JavaScript['text_append'] = function(block) {
  // Append to a variable in place.
  var varName = Blockly.JavaScript.variableDB_.getName(
      block.getFieldValue('VAR'), Blockly.Variables.NAME_TYPE);
  var argument0 = Blockly.JavaScript.valueToCode(block, 'TEXT',
      Blockly.JavaScript.ORDER_NONE) || '\'\'';
  return varName + ' = String(' + varName + ') + String(' + argument0 + ');\n';
};

Blockly.JavaScript['text_length'] = function(block) {
  // String or array length.
  var argument0 = Blockly.JavaScript.valueToCode(block, 'VALUE',
      Blockly.JavaScript.ORDER_FUNCTION_CALL) || '\'\'';
  return [argument0 + '.length', Blockly.JavaScript.ORDER_MEMBER];
};

Blockly.JavaScript['text_isEmpty'] = function(block) {
  // Is the string null or array empty?
  var argument0 = Blockly.JavaScript.valueToCode(block, 'VALUE',
      Blockly.JavaScript.ORDER_MEMBER) || '\'\'';
  return ['!' + argument0 + '.length', Blockly.JavaScript.ORDER_LOGICAL_NOT];
};

Blockly.JavaScript['text_indexOf'] = function(block) {
  // Search the text for a substring.
  var operator = block.getFieldValue('END') == 'FIRST' ?
      'indexOf' : 'lastIndexOf';
  var argument0 = Blockly.JavaScript.valueToCode(block, 'FIND',
      Blockly.JavaScript.ORDER_NONE) || '\'\'';
  var argument1 = Blockly.JavaScript.valueToCode(block, 'VALUE',
      Blockly.JavaScript.ORDER_MEMBER) || '\'\'';
  var code = argument1 + '.' + operator + '(' + argument0 + ')';
  // Adjust index if using one-based indices.
  if (Blockly.JavaScript.ONE_BASED_INDEXING) {
    return [code + ' + 1', Blockly.JavaScript.ORDER_ADDITION];
  }
  return [code, Blockly.JavaScript.ORDER_FUNCTION_CALL];
};

Blockly.JavaScript['text_charAt'] = function(block) {
  // Get letter at index.
  // Note: Until January 2013 this block did not have the WHERE input.
  var where = block.getFieldValue('WHERE') || 'FROM_START';
  var text = Blockly.JavaScript.valueToCode(block, 'VALUE',
      Blockly.JavaScript.ORDER_MEMBER) || '\'\'';
  switch (where) {
    case 'FIRST':
      var code = text + '.charAt(0)';
      return [code, Blockly.JavaScript.ORDER_FUNCTION_CALL];
    case 'LAST':
      var code = text + '.slice(-1)';
      return [code, Blockly.JavaScript.ORDER_FUNCTION_CALL];
    case 'FROM_START':
      var at = Blockly.JavaScript.getAdjusted(block, 'AT');
      // Adjust index if using one-based indices.
      var code = text + '.charAt(' + at + ')';
      return [code, Blockly.JavaScript.ORDER_FUNCTION_CALL];
    case 'FROM_END':
      var at = Blockly.JavaScript.getAdjusted(block, 'AT', 1, true);
      var code = text + '.slice(' + at + ').charAt(0)';
      return [code, Blockly.JavaScript.ORDER_FUNCTION_CALL];
    case 'RANDOM':
      var functionName = Blockly.JavaScript.provideFunction_(
          'textRandomLetter',
          ['function ' + Blockly.JavaScript.FUNCTION_NAME_PLACEHOLDER_ +
             '(text) {',
           '  var x = Math.floor(Math.random() * text.length);',
           '  return text[x];',
           '}']);
      code = functionName + '(' + text + ')';
      return [code, Blockly.JavaScript.ORDER_FUNCTION_CALL];
  }
  throw 'Unhandled option (text_charAt).';
};

Blockly.JavaScript['text_getSubstring'] = function(block) {
  // Get substring.
  var text = Blockly.JavaScript.valueToCode(block, 'STRING',
      Blockly.JavaScript.ORDER_MEMBER) || '\'\'';
  var where1 = block.getFieldValue('WHERE1');
  var where2 = block.getFieldValue('WHERE2');

  if (where1 == 'FIRST' && where2 == 'LAST') {
    var code = text;
  } else if (text.match(/^\w+$/) ||
      (where1 != 'FROM_END' && where1 != 'LAST' &&
      where2 != 'FROM_END' && where2 != 'LAST')) {
    // If the text is a simple value or doesn't require a call for length, don't
    // generate a helper function.
    switch (where1) {
      case 'FROM_START':
        var at1 = Blockly.JavaScript.getAdjusted(block, 'AT1');
        break;
      case 'FROM_END':
        var at1 = Blockly.JavaScript.getAdjusted(block, 'AT1', 1, false,
            Blockly.JavaScript.ORDER_SUBTRACTION);
        at1 = text + '.length - ' + at1;
        break;
      case 'FIRST':
        var at1 = '0';
        break;
      default:
        throw 'Unhandled option (text_getSubstring).';
    }
    switch (where2) {
      case 'FROM_START':
        var at2 = Blockly.JavaScript.getAdjusted(block, 'AT2', 1);
        break;
      case 'FROM_END':
        var at2 = Blockly.JavaScript.getAdjusted(block, 'AT2', 0, false,
            Blockly.JavaScript.ORDER_SUBTRACTION);
        at2 = text + '.length - ' + at2;
        break;
      case 'LAST':
        var at2 = text + '.length';
        break;
      default:
        throw 'Unhandled option (text_getSubstring).';
    }
    code = text + '.slice(' + at1 + ', ' + at2 + ')';
  } else {
    var at1 = Blockly.JavaScript.getAdjusted(block, 'AT1');
    var at2 = Blockly.JavaScript.getAdjusted(block, 'AT2');
    var functionName = Blockly.JavaScript.provideFunction_(
        'getSubsequence',
        [
          'function ' + Blockly.JavaScript.FUNCTION_NAME_PLACEHOLDER_ +
            '(sequence, where1, at1, where2, at2) {',
          '  function getAt(where, at) {',
          '    if (where == \'FROM_END\') {',
          '      at = sequence.length - 1 - at;',
          '    } else if (where == \'FIRST\') {',
          '      at = 0;',
          '    } else if (where == \'LAST\') {',
          '      at = sequence.length - 1;',
          '    } else if (where != \'FROM_START\') {',
          '      throw \'Unhandled option (getSubsequence).\';',
          '    }',
          '    return at;',
          '  }',
          '  at1 = getAt(where1, at1);',
          '  at2 = getAt(where2, at2) + 1;',
          '  return sequence.slice(at1, at2);',
          '}']);
    var code = functionName + '(' + text + ', \'' +
        where1 + '\', ' + at1 + ', \'' + where2 + '\', ' + at2 + ')';
  }
  return [code, Blockly.JavaScript.ORDER_FUNCTION_CALL];
};

Blockly.JavaScript['text_changeCase'] = function(block) {
  // Change capitalization.
  var OPERATORS = {
    'UPPERCASE': '.toUpperCase()',
    'LOWERCASE': '.toLowerCase()',
    'TITLECASE': null
  };
  var operator = OPERATORS[block.getFieldValue('CASE')];

  if (operator) {
    // Upper and lower case are functions built into JavaScript.
    var argument0 = Blockly.JavaScript.valueToCode(block, 'TEXT',
        Blockly.JavaScript.ORDER_MEMBER) || '\'\'';
    var code = argument0 + operator;
  } else {
    // Title case is not a native JavaScript function.  Define one.
    var functionName = Blockly.JavaScript.provideFunction_(
        'textToTitleCase',
        ['function ' + Blockly.JavaScript.FUNCTION_NAME_PLACEHOLDER_ +
           '(str) {',
         '  return str.replace(/\\S+/g,',
         '      function(txt) {return txt[0].toUpperCase() + ' +
             'txt.substring(1).toLowerCase();});',
         '}']);
    var argument0 = Blockly.JavaScript.valueToCode(block, 'TEXT',
        Blockly.JavaScript.ORDER_NONE) || '\'\'';
    var code = functionName + '(' + argument0 + ')';
  }
  return [code, Blockly.JavaScript.ORDER_FUNCTION_CALL];
};

Blockly.JavaScript['text_trim'] = function(block) {
  // Trim spaces.
  var OPERATORS = {
    'LEFT': ".replace(/^[\\s\\xa0]+/, '')",
    'RIGHT': ".replace(/[\\s\\xa0]+$/, '')",
    'BOTH': '.trim()'
  };
  var operator = OPERATORS[block.getFieldValue('MODE')];
  var argument0 = Blockly.JavaScript.valueToCode(block, 'TEXT',
      Blockly.JavaScript.ORDER_MEMBER) || '\'\'';
  return [argument0 + operator, Blockly.JavaScript.ORDER_FUNCTION_CALL];
};

Blockly.JavaScript['text_print'] = function(block) {
  // Print statement.
  var argument0 = Blockly.JavaScript.valueToCode(block, 'TEXT',
      Blockly.JavaScript.ORDER_NONE) || '\'\'';
  return 'window.alert(' + argument0 + ');\n';
};

Blockly.JavaScript['text_prompt_ext'] = function(block) {
  // Prompt function.
  if (block.getField('TEXT')) {
    // Internal message.
    var msg = Blockly.JavaScript.quote_(block.getFieldValue('TEXT'));
  } else {
    // External message.
    var msg = Blockly.JavaScript.valueToCode(block, 'TEXT',
        Blockly.JavaScript.ORDER_NONE) || '\'\'';
  }
  var code = 'window.prompt(' + msg + ')';
  var toNumber = block.getFieldValue('TYPE') == 'NUMBER';
  if (toNumber) {
    code = 'parseFloat(' + code + ')';
  }
  return [code, Blockly.JavaScript.ORDER_FUNCTION_CALL];
};

Blockly.JavaScript['text_prompt'] = Blockly.JavaScript['text_prompt_ext'];
