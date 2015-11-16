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
 * @fileoverview Generating Java for text blocks.
 * @author q.neutron@gmail.com (Quynh Neutron)
 */
'use strict';

goog.provide('Blockly.Java.texts');

goog.require('Blockly.Java');


Blockly.Java['text'] = function(block) {
  // Text value.
  var code = Blockly.Java.quote_(block.getFieldValue('TEXT'));
  return [code, Blockly.Java.ORDER_ATOMIC];
};

Blockly.Java['text_join'] = function(block) {
  // Create a string made up of any number of elements of any type.
  // Should we allow joining by '-' or ',' or any other characters?
  var code = '';
  var extra = '';
  for (var n = 0; n < block.itemCount_; n++) {
    var item = Blockly.Java.toStringCode(block, 'ADD' + n);
    if (item) {
      code += extra + (item);
      extra = ' + ';
    }
  }
  if (code === '') {
    code = '""';
  }
  return [code, Blockly.Java.ORDER_ADDITIVE];
};

Blockly.Java['text_append'] = function(block) {
  // Append to a variable in place.
  var varName = Blockly.Java.variableDB_.getName(block.getFieldValue('VAR'),
      Blockly.Variables.NAME_TYPE);
  var argument0 = Blockly.Java.toStringCode(block, 'TEXT')  || '""';

  var code = varName + ' = ';
  var extra = '';
  if (Blockly.Java.GetVariableType(block.getFieldValue('VAR')) === 'Var') {
    varName = 'new Var(' + varName + '.getObjectAsString()';
    extra = ')';
  }
  code += varName + ' + ' + argument0 + extra + ';\n';
  return code;
};

Blockly.Java['text_length'] = function(block) {
  // String length.
  var argument0 = Blockly.Java.valueToCode(block, 'VALUE',
      Blockly.Java.ORDER_NONE) || '""';
  return [argument0 + '.length()', Blockly.Java.ORDER_FUNCTION_CALL];
};

Blockly.Java['text_isEmpty'] = function(block) {
  // Is the string null?
  var argument0 = Blockly.Java.valueToCode(block, 'VALUE',
      Blockly.Java.ORDER_NONE) || '""';
  var code = argument0 + '.isEmpty()';
  return [code, Blockly.Java.ORDER_LOGICAL_NOT];
};

Blockly.Java['text_indexOf'] = function(block) {
  // Search the text for a substring.
  // Should we allow for non-case sensitive???
  var operator = block.getFieldValue('END') == 'FIRST' ?
      'indexOf' : 'lastIndexOf';
  var argument0 = Blockly.Java.valueToCode(block, 'FIND',
      Blockly.Java.ORDER_NONE) || '""';
  var argument1 = Blockly.Java.valueToCode(block, 'VALUE',
      Blockly.Java.ORDER_MEMBER) || '""';
  var code = argument1 + '.' + operator + '(' + argument0 + ') + 1';
  return [code, Blockly.Java.ORDER_MEMBER];
};

Blockly.Java['text_charAt'] = function(block) {
  // Get letter at index.
  // Note: Until January 2013 this block did not have the WHERE input.
  var where = block.getFieldValue('WHERE') || 'FROM_START';
  var at = Blockly.Java.valueToCode(block, 'AT',
      Blockly.Java.ORDER_UNARY_SIGN) || '1';
  var text = Blockly.Java.valueToCode(block, 'VALUE',
      Blockly.Java.ORDER_MEMBER) || '""';
  switch (where) {
    case 'FIRST':
      var code = text + '.substring(0,1)';
      return [code, Blockly.Java.ORDER_MEMBER];
    case 'LAST':
      var code = text + '.substring(' + text + '.length()-1)';
      return [code, Blockly.Java.ORDER_MEMBER];
    case 'FROM_START':
      // Blockly uses one-based indicies.
      var at2;
      if (Blockly.isNumber(at)) {
        // If the index is a naked number, decrement it right now.
        at2 = parseInt(at, 10);
        at = at2 - 1;
      } else {
        // If the index is dynamic, decrement it in code.
        at = '(int)' + at + ' - 1';
        at2 = '(int)' + at;
      }
      var code = text + '.substring(' + at + ',' + at2 + ')';
      return [code, Blockly.Java.ORDER_MEMBER];
    case 'FROM_END':
      var at2;
      if (Blockly.isNumber(at)) {
        at2 = parseInt(at, 10);
        at = text + '.length()-' + at2;
        at2 = text + '.length()-' + (at2-1);
      } else {
        at2 = text + '.length()-(int)' + at;
        at = text + '.length()-((int)' + at + '-1)';
      }
      var code = text + '.substring(' + at + ',' + at2 + ')';
      return [code, Blockly.Java.ORDER_MEMBER];
    case 'RANDOM':
      Blockly.Java.addImport('java.lang.Math');
      var functionName = Blockly.Java.provideFunction_(
          'text_random_letter',
          ['public static int ' + Blockly.Java.FUNCTION_NAME_PLACEHOLDER_ +
             '(String text) {',
           '  int x = (int)(Math.random() * text.length());',
           '  return text.charAt(x);',
           '}']);
      code = functionName + '(' + text + ')';
      return [code, Blockly.Java.ORDER_FUNCTION_CALL];
  }
  throw 'Unhandled option (text_charAt).';
};

Blockly.Java['text_getSubstring'] = function(block) {
  // Get substring.
  var text = Blockly.Java.valueToCode(block, 'STRING',
      Blockly.Java.ORDER_MEMBER) || '""';
  var where1 = block.getFieldValue('WHERE1');
  var where2 = block.getFieldValue('WHERE2');
  var at1 = Blockly.Java.valueToCode(block, 'AT1',
      Blockly.Java.ORDER_ADDITIVE) || '1';
  var at2 = Blockly.Java.valueToCode(block, 'AT2',
      Blockly.Java.ORDER_ADDITIVE) || '1';
  if (where1 == 'FIRST' || (where1 == 'FROM_START' && at1 == '1')) {
    at1 = '0';
  } else if (where1 == 'FROM_START') {
    // Blockly uses one-based indicies.
    if (Blockly.isNumber(at1)) {
      // If the index is a naked number, decrement it right now.
      at1 = parseInt(at1, 10) - 1;
    } else {
      // If the index is dynamic, decrement it in code.
      at1 = '((int)' + at1 + ' - 1)';
    }
  } else if (where1 == 'FROM_END') {
    if (Blockly.isNumber(at1)) {
      at1 = text + '.length() -' + parseInt(at1, 10);
    } else {
      at1 = text + '.length() - ((int)' + at1 + ')';
    }
  }
  if (where2 == 'LAST' || (where2 == 'FROM_END' && at2 == '1')) {
    at2 = '';
  } else if (where2 == 'FROM_START') {
    if (Blockly.isNumber(at2)) {
      at2 = parseInt(at2, 10);
    } else {
      at2 = '((int)' + at2 + ')';
    }
  } else if (where2 == 'FROM_END') {
    if (Blockly.isNumber(at2)) {
      at2 = parseInt(at2, 10) - 1;
      if (at2 == 0) {
        at2 = '';
      } else {
        at2 = text + '.length() -' + at2;
      }
    } else {
      // If the index is dynamic, increment it in code.
      // Add special case for -0.
      at2 = text + '.length() - ((int)' + at2 + '-1)';
    }
  }
  if (at2 !== '') {
    at2 = ', ' + at2;
  }
  var code = text + '.substring(' + at1 + at2 + ')';
  return [code, Blockly.Java.ORDER_MEMBER];
};

Blockly.Java['text_changeCase'] = function(block) {
  // Change capitalization.
  var OPERATORS = {
    'UPPERCASE': '.toUpperCase()',
    'LOWERCASE': '.toLowerCase()',
    'TITLECASE': 'TITLECASE'
  };
  var operator = OPERATORS[block.getFieldValue('CASE')];
  var argument0 = Blockly.Java.valueToCode(block, 'TEXT',
      Blockly.Java.ORDER_MEMBER) || '""';
  var code = '';
  if (operator === 'TITLECASE') {
    Blockly.Java.addImport('java.lang.StringBuilder');
    var functionName = Blockly.Java.provideFunction_(
        'toTitleCase',
        [ 'public static String ' + Blockly.Java.FUNCTION_NAME_PLACEHOLDER_ +
            '(String input) {',
          '  StringBuilder titleCase = new StringBuilder();',
          '  boolean nextTitleCase = true;',
          '',
          '  for (char c : input.toLowerCase().toCharArray()) {',
          '    if (Character.isSpaceChar(c)) {',
          '       nextTitleCase = true;',
          '     } else if (nextTitleCase) {',
          '       c = Character.toTitleCase(c);',
          '       nextTitleCase = false;',
          '     }',
          '',
          '     titleCase.append(c);',
          '   }',
          '',
          '  return titleCase.toString();',
          '}']);
    code = functionName + '(' + argument0 + ')';
  } else {
    code = argument0 + operator;
  }
  return [code, Blockly.Java.ORDER_MEMBER];
};

Blockly.Java['text_trim'] = function(block) {
  // Trim spaces.
  var OPERATORS = {
    'LEFT': '.replaceAll("^\\\\s+", "")',
    'RIGHT': '.replaceAll("\\\\s+$", "")',
    'BOTH': '.trim()'
  };
  var operator = OPERATORS[block.getFieldValue('MODE')];
  var argument0 = Blockly.Java.valueToCode(block, 'TEXT',
      Blockly.Java.ORDER_MEMBER) || '""';
  var code = argument0 + operator;
  return [code, Blockly.Java.ORDER_MEMBER];
};

Blockly.Java['text_print'] = function(block) {
  // Print statement.
  var argument0 = Blockly.Java.valueToCode(block, 'TEXT',
      Blockly.Java.ORDER_NONE) || '""';
  return 'System.out.println(' + argument0 + '.toString());\n';
};

Blockly.Java['text_printf'] = function(block) {
  // Print statement.
  var argument0 = Blockly.Java.valueToCode(block, 'TEXT',
      Blockly.Java.ORDER_NONE) || '""';
  return 'System.out.println(' + argument0 + '.toString());\n';
};

Blockly.Java['text_printf'] = function(block) {
  // Create a string made up of any number of elements of any type.
  // Should we allow joining by '-' or ',' or any other characters?
  var argument0 = Blockly.Java.valueToCode(block, 'TEXT',
    Blockly.Java.ORDER_NONE) || '""';
  var code = 'System.out.format(' + argument0;
  for (var n = 0; n < block.itemCount_; n++) {
    var item = Blockly.Java.toStringCode(block, 'ADD' + n);
    if (item) {
      code += ', ' + item;
    }
  }
  code += ');\n';
  return code;
};

Blockly.Java['text_sprintf'] = function(block) {
  // Create a string made up of any number of elements of any type.
  // Should we allow joining by '-' or ',' or any other characters?
  var argument0 = Blockly.Java.valueToCode(block, 'TEXT',
    Blockly.Java.ORDER_NONE) || '""';
  if (block.itemCount_ == 0) {
    return [argument0, Blockly.Java.ORDER_ATOMIC];
  } else {
    var code = 'String.format(' + argument0;
    for (var n = 0; n < block.itemCount_; n++) {
      var item = Blockly.Java.toStringCode(block, 'ADD' + n);
      if (item) {
        code += ', ' + item;
      }
    }
    code += ')';
    return [code, Blockly.Java.ORDER_FUNCTION_CALL];
  }
};

Blockly.Java['text_prompt_ext'] = function(block) {
  // Prompt function.
  if (block.getField('TEXT')) {
    // Internal message.
    var msg = Blockly.Java.quote_(block.getFieldValue('TEXT'));
  } else {
    // External message.
    var msg = Blockly.Java.valueToCode(block, 'TEXT',
        Blockly.Java.ORDER_NONE) || '\'\'';
  }
  var code = 'window.prompt(' + msg + ')';
  var toNumber = block.getFieldValue('TYPE') == 'NUMBER';
  if (toNumber) {
    code = 'parseFloat(' + code + ')';
  }
  return [code, Blockly.Java.ORDER_FUNCTION_CALL];
};

Blockly.Java['text_prompt'] = Blockly.Java['text_prompt_ext'];

Blockly.Java['text_comment'] = function(block) {
  // Display comment
  
  var comment = block.getFieldValue('COMMENT') || '';
  var code = '/*\n' + comment + '\n*/\n';
  
  return code;
};


Blockly.Java['text_code_insert'] = function(block) {
  // Display code
  var type = block.getFieldValue('TYPE') || '';
  var code = '';
  if (type == 'Java')
  {
    var comment = block.getFieldValue('CODE') || '';
    code = '//Arbitrary Java code insert block';
    if (comment != '')
    {
      code += '\n';
      code += comment +'\n';
    } else {
      code += ' is empty\n';
    }
  }
  return code;
};
