/**
 * @license
 * Copyright 2012 Google LLC
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
 * @fileoverview Generating Python for text blocks.
 * @author q.neutron@gmail.com (Quynh Neutron)
 */
'use strict';

goog.provide('Blockly.Python.texts');

goog.require('Blockly.Python');


Blockly.Python['text'] = function(block) {
  // Text value.
  var code = Blockly.Python.quote_(block.getFieldValue('TEXT'));
  return [code, Blockly.Python.ORDER_ATOMIC];
};

Blockly.Python['text_multiline'] = function(block) {
  // Text value.
  var code = Blockly.Python.multiline_quote_(block.getFieldValue('TEXT'));
  return [code, Blockly.Python.ORDER_ATOMIC];
};

/**
 * Enclose the provided value in 'str(...)' function.
 * Leave string literals alone.
 * @param {string} value Code evaluating to a value.
 * @return {string} Code evaluating to a string.
 * @private
 */
Blockly.Python.text.forceString_ = function(value) {
  if (Blockly.Python.text.forceString_.strRegExp.test(value)) {
    return value;
  }
  return 'str(' + value + ')';
};

/**
 * Regular expression to detect a single-quoted string literal.
 */
Blockly.Python.text.forceString_.strRegExp = /^\s*'([^']|\\')*'\s*$/;

Blockly.Python['text_join'] = function(block) {
  // Create a string made up of any number of elements of any type.
  //Should we allow joining by '-' or ',' or any other characters?
  switch (block.itemCount_) {
    case 0:
      return ['\'\'', Blockly.Python.ORDER_ATOMIC];
      break;
    case 1:
      var element = Blockly.Python.valueToCode(block, 'ADD0',
              Blockly.Python.ORDER_NONE) || '\'\'';
      var code = Blockly.Python.text.forceString_(element);
      return [code, Blockly.Python.ORDER_FUNCTION_CALL];
      break;
    case 2:
      var element0 = Blockly.Python.valueToCode(block, 'ADD0',
          Blockly.Python.ORDER_NONE) || '\'\'';
      var element1 = Blockly.Python.valueToCode(block, 'ADD1',
          Blockly.Python.ORDER_NONE) || '\'\'';
      var code = Blockly.Python.text.forceString_(element0) + ' + ' +
          Blockly.Python.text.forceString_(element1);
      return [code, Blockly.Python.ORDER_ADDITIVE];
      break;
    default:
      var elements = [];
      for (var i = 0; i < block.itemCount_; i++) {
        elements[i] = Blockly.Python.valueToCode(block, 'ADD' + i,
                Blockly.Python.ORDER_NONE) || '\'\'';
      }
      var tempVar = Blockly.Python.variableDB_.getDistinctName('x',
          Blockly.VARIABLE_CATEGORY_NAME);
      var code = '\'\'.join([str(' + tempVar + ') for ' + tempVar + ' in [' +
          elements.join(', ') + ']])';
      return [code, Blockly.Python.ORDER_FUNCTION_CALL];
  }
};

Blockly.Python['text_append'] = function(block) {
  // Append to a variable in place.
  var varName = Blockly.Python.variableDB_.getName(block.getFieldValue('VAR'),
      Blockly.VARIABLE_CATEGORY_NAME);
  var value = Blockly.Python.valueToCode(block, 'TEXT',
      Blockly.Python.ORDER_NONE) || '\'\'';
  return varName + ' = str(' + varName + ') + ' +
      Blockly.Python.text.forceString_(value) + '\n';
};

Blockly.Python['text_length'] = function(block) {
  // Is the string null or array empty?
  var text = Blockly.Python.valueToCode(block, 'VALUE',
      Blockly.Python.ORDER_NONE) || '\'\'';
  return ['len(' + text + ')', Blockly.Python.ORDER_FUNCTION_CALL];
};

Blockly.Python['text_isEmpty'] = function(block) {
  // Is the string null or array empty?
  var text = Blockly.Python.valueToCode(block, 'VALUE',
      Blockly.Python.ORDER_NONE) || '\'\'';
  var code = 'not len(' + text + ')';
  return [code, Blockly.Python.ORDER_LOGICAL_NOT];
};

Blockly.Python['text_indexOf'] = function(block) {
  // Search the text for a substring.
  // Should we allow for non-case sensitive???
  var operator = block.getFieldValue('END') == 'FIRST' ? 'find' : 'rfind';
  var substring = Blockly.Python.valueToCode(block, 'FIND',
      Blockly.Python.ORDER_NONE) || '\'\'';
  var text = Blockly.Python.valueToCode(block, 'VALUE',
      Blockly.Python.ORDER_MEMBER) || '\'\'';
  var code = text + '.' + operator + '(' + substring + ')';
  if (block.workspace.options.oneBasedIndex) {
    return [code + ' + 1', Blockly.Python.ORDER_ADDITIVE];
  }
  return [code, Blockly.Python.ORDER_FUNCTION_CALL];
};

Blockly.Python['text_charAt'] = function(block) {
  // Get letter at index.
  // Note: Until January 2013 this block did not have the WHERE input.
  var where = block.getFieldValue('WHERE') || 'FROM_START';
  var text = Blockly.Python.valueToCode(block, 'VALUE',
      Blockly.Python.ORDER_MEMBER) || '\'\'';
  switch (where) {
    case 'FIRST':
      var code = text + '[0]';
      return [code, Blockly.Python.ORDER_MEMBER];
    case 'LAST':
      var code = text + '[-1]';
      return [code, Blockly.Python.ORDER_MEMBER];
    case 'FROM_START':
      var at = Blockly.Python.getAdjustedInt(block, 'AT');
      var code = text + '[' + at + ']';
      return [code, Blockly.Python.ORDER_MEMBER];
    case 'FROM_END':
      var at = Blockly.Python.getAdjustedInt(block, 'AT', 1, true);
      var code = text + '[' + at + ']';
      return [code, Blockly.Python.ORDER_MEMBER];
    case 'RANDOM':
      Blockly.Python.definitions_['import_random'] = 'import random';
      var functionName = Blockly.Python.provideFunction_(
          'text_random_letter',
          ['def ' + Blockly.Python.FUNCTION_NAME_PLACEHOLDER_ + '(text):',
           '  x = int(random.random() * len(text))',
           '  return text[x];']);
      code = functionName + '(' + text + ')';
      return [code, Blockly.Python.ORDER_FUNCTION_CALL];
  }
  throw Error('Unhandled option (text_charAt).');
};

Blockly.Python['text_getSubstring'] = function(block) {
  // Get substring.
  var where1 = block.getFieldValue('WHERE1');
  var where2 = block.getFieldValue('WHERE2');
  var text = Blockly.Python.valueToCode(block, 'STRING',
      Blockly.Python.ORDER_MEMBER) || '\'\'';
  switch (where1) {
    case 'FROM_START':
      var at1 = Blockly.Python.getAdjustedInt(block, 'AT1');
      if (at1 == '0') {
        at1 = '';
      }
      break;
    case 'FROM_END':
      var at1 = Blockly.Python.getAdjustedInt(block, 'AT1', 1, true);
      break;
    case 'FIRST':
      var at1 = '';
      break;
    default:
      throw Error('Unhandled option (text_getSubstring)');
  }
  switch (where2) {
    case 'FROM_START':
      var at2 = Blockly.Python.getAdjustedInt(block, 'AT2', 1);
      break;
    case 'FROM_END':
      var at2 = Blockly.Python.getAdjustedInt(block, 'AT2', 0, true);
      // Ensure that if the result calculated is 0 that sub-sequence will
      // include all elements as expected.
      if (!Blockly.isNumber(String(at2))) {
        Blockly.Python.definitions_['import_sys'] = 'import sys';
        at2 += ' or sys.maxsize';
      } else if (at2 == '0') {
        at2 = '';
      }
      break;
    case 'LAST':
      var at2 = '';
      break;
    default:
      throw Error('Unhandled option (text_getSubstring)');
  }
  var code = text + '[' + at1 + ' : ' + at2 + ']';
  return [code, Blockly.Python.ORDER_MEMBER];
};

Blockly.Python['text_changeCase'] = function(block) {
  // Change capitalization.
  var OPERATORS = {
    'UPPERCASE': '.upper()',
    'LOWERCASE': '.lower()',
    'TITLECASE': '.title()'
  };
  var operator = OPERATORS[block.getFieldValue('CASE')];
  var text = Blockly.Python.valueToCode(block, 'TEXT',
      Blockly.Python.ORDER_MEMBER) || '\'\'';
  var code = text + operator;
  return [code, Blockly.Python.ORDER_FUNCTION_CALL];
};

Blockly.Python['text_trim'] = function(block) {
  // Trim spaces.
  var OPERATORS = {
    'LEFT': '.lstrip()',
    'RIGHT': '.rstrip()',
    'BOTH': '.strip()'
  };
  var operator = OPERATORS[block.getFieldValue('MODE')];
  var text = Blockly.Python.valueToCode(block, 'TEXT',
      Blockly.Python.ORDER_MEMBER) || '\'\'';
  var code = text + operator;
  return [code, Blockly.Python.ORDER_FUNCTION_CALL];
};

Blockly.Python['text_print'] = function(block) {
  // Print statement.
  var msg = Blockly.Python.valueToCode(block, 'TEXT',
      Blockly.Python.ORDER_NONE) || '\'\'';
  return 'print(' + msg + ')\n';
};

Blockly.Python['text_prompt_ext'] = function(block) {
  // Prompt function.
  var functionName = Blockly.Python.provideFunction_(
      'text_prompt',
      ['def ' + Blockly.Python.FUNCTION_NAME_PLACEHOLDER_ + '(msg):',
       '  try:',
       '    return raw_input(msg)',
       '  except NameError:',
       '    return input(msg)']);
  if (block.getField('TEXT')) {
    // Internal message.
    var msg = Blockly.Python.quote_(block.getFieldValue('TEXT'));
  } else {
    // External message.
    var msg = Blockly.Python.valueToCode(block, 'TEXT',
        Blockly.Python.ORDER_NONE) || '\'\'';
  }
  var code = functionName + '(' + msg + ')';
  var toNumber = block.getFieldValue('TYPE') == 'NUMBER';
  if (toNumber) {
    code = 'float(' + code + ')';
  }
  return [code, Blockly.Python.ORDER_FUNCTION_CALL];
};

Blockly.Python['text_prompt'] = Blockly.Python['text_prompt_ext'];

Blockly.Python['text_count'] = function(block) {
  var text = Blockly.Python.valueToCode(block, 'TEXT',
      Blockly.Python.ORDER_MEMBER) || '\'\'';
  var sub = Blockly.Python.valueToCode(block, 'SUB',
      Blockly.Python.ORDER_NONE) || '\'\'';
  var code = text + '.count(' + sub + ')';
  return [code, Blockly.Python.ORDER_MEMBER];
};

Blockly.Python['text_replace'] = function(block) {
  var text = Blockly.Python.valueToCode(block, 'TEXT',
      Blockly.Python.ORDER_MEMBER) || '\'\'';
  var from = Blockly.Python.valueToCode(block, 'FROM',
      Blockly.Python.ORDER_NONE) || '\'\'';
  var to = Blockly.Python.valueToCode(block, 'TO',
      Blockly.Python.ORDER_NONE) || '\'\'';
  var code = text + '.replace(' + from + ', ' + to + ')';
  return [code, Blockly.Python.ORDER_MEMBER];
};

Blockly.Python['text_reverse'] = function(block) {
  var text = Blockly.Python.valueToCode(block, 'TEXT',
      Blockly.Python.ORDER_MEMBER) || '\'\'';
  var code = text + '[::-1]';
  return [code, Blockly.Python.ORDER_MEMBER];
};
