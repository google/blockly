/**
 * @license
 * Visual Blocks Language
 *
 * Copyright 2016 Google Inc.
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
 * @fileoverview Generating Lua for text blocks.
 * @author rodrigoq@google.com (Rodrigo Queiro)
 */
'use strict';

goog.provide('Blockly.Lua.texts');

goog.require('Blockly.Lua');


Blockly.Lua['text'] = function(block) {
  // Text value.
  var code = Blockly.Lua.quote_(block.getFieldValue('TEXT'));
  return [code, Blockly.Lua.ORDER_ATOMIC];
};

Blockly.Lua['text_join'] = function(block) {
  // Create a string made up of any number of elements of any type.
  if (block.itemCount_ == 0) {
    return ['\'\'', Blockly.Lua.ORDER_ATOMIC];
  } else if (block.itemCount_ == 1) {
    var argument0 = Blockly.Lua.valueToCode(block, 'ADD0',
        Blockly.Lua.ORDER_NONE) || '\'\'';
    var code = argument0;
    return [code, Blockly.Lua.ORDER_HIGH];
  } else if (block.itemCount_ == 2) {
    var argument0 = Blockly.Lua.valueToCode(block, 'ADD0',
        Blockly.Lua.ORDER_NONE) || '\'\'';
    var argument1 = Blockly.Lua.valueToCode(block, 'ADD1',
        Blockly.Lua.ORDER_NONE) || '\'\'';
    var code = argument0 + ' .. ' + argument1;
    return [code, Blockly.Lua.ORDER_UNARY];
  } else {
    var code = [];
    for (var n = 0; n < block.itemCount_; n++) {
      code[n] = Blockly.Lua.valueToCode(block, 'ADD' + n,
          Blockly.Lua.ORDER_NONE) || '\'\'';
    }
    code = 'table.concat({' + code.join(', ') + '})';
    return [code, Blockly.Lua.ORDER_HIGH];
  }
};

Blockly.Lua['text_append'] = function(block) {
  // Append to a variable in place.
  var varName = Blockly.Lua.variableDB_.getName(
      block.getFieldValue('VAR'), Blockly.Variables.NAME_TYPE);
  var argument0 = Blockly.Lua.valueToCode(block, 'TEXT',
      Blockly.Lua.ORDER_NONE) || '\'\'';
  return varName + ' = ' + varName + ' .. ' + argument0 + '\n';
};

Blockly.Lua['text_length'] = function(block) {
  // String or array length.
  var argument0 = Blockly.Lua.valueToCode(block, 'VALUE',
      Blockly.Lua.ORDER_HIGH) || '\'\'';
  return ['#' + argument0, Blockly.Lua.ORDER_HIGH];
};

Blockly.Lua['text_isEmpty'] = function(block) {
  // Is the string null or array empty?
  var argument0 = Blockly.Lua.valueToCode(block, 'VALUE',
      Blockly.Lua.ORDER_HIGH) || '\'\'';
  return ['#' + argument0 + ' == 0', Blockly.Lua.ORDER_RELATIONAL];
};

Blockly.Lua['text_indexOf'] = function(block) {
  // Search the text for a substring.
  var operator = block.getFieldValue('END') == 'FIRST' ?
      'indexOf' : 'lastIndexOf';
  var substr = Blockly.Lua.valueToCode(block, 'FIND',
      Blockly.Lua.ORDER_NONE) || '\'\'';
  var str = Blockly.Lua.valueToCode(block, 'VALUE',
      Blockly.Lua.ORDER_NONE) || '\'\'';
  if (block.getFieldValue('END') == 'FIRST') {
    var functionName = Blockly.Lua.provideFunction_(
        'firstIndexOf',
        ['function ' + Blockly.Lua.FUNCTION_NAME_PLACEHOLDER_ +
             '(str, substr) ',
         '  local i = string.find(str, substr, 1, true)',
         '  if i == nil then',
         '    return 0',
         '  else',
         '    return i',
         '  end',
         'end']);
  } else {
    var functionName = Blockly.Lua.provideFunction_(
        'lastIndexOf',
        ['function ' + Blockly.Lua.FUNCTION_NAME_PLACEHOLDER_ +
             '(str, substr)',
         '  local i = string.find(string.reverse(str), ' +
             'string.reverse(substr), 1, true)',
         '  if i then',
         '    return #str + 2 - i - #substr',
         '  end',
         '  return 0',
         'end']);
  }
  var code = functionName + '(' + str + ', ' + substr + ')';
  return [code, Blockly.Lua.ORDER_HIGH];
};

Blockly.Lua['text_charAt'] = function(block) {
  // Get letter at index.
  // Note: Until January 2013 this block did not have the WHERE input.
  var where = block.getFieldValue('WHERE') || 'FROM_START';
  var at = Blockly.Lua.valueToCode(block, 'AT',
      Blockly.Lua.ORDER_UNARY) || '1';
  var text = Blockly.Lua.valueToCode(block, 'VALUE',
      Blockly.Lua.ORDER_NONE) || '\'\'';
  var code;
  if (where == 'RANDOM') {
    var functionName = Blockly.Lua.provideFunction_(
        'text_random_letter',
        ['function ' + Blockly.Lua.FUNCTION_NAME_PLACEHOLDER_ + '(str)',
         '  local index = math.random(string.len(str))',
         '  return string.sub(str, index, index)',
         'end']);
    code = functionName + '(' + text + ')';
  } else {
    if (where == 'FIRST') {
      var start = '1';
    } else if (where == 'LAST') {
      var start = '-1';
    } else {
      if (where == 'FROM_START') {
        var start = at;
      } else if (where == 'FROM_END') {
        var start = '-' + at;
      } else {
        throw 'Unhandled option (text_charAt).';
      }
    }
    if (start.match(/^-?\w*$/)) {
      code = 'string.sub(' + text + ', ' + start + ', ' + start + ')';
    } else {
      // use function to avoid reevaluation
      var functionName = Blockly.Lua.provideFunction_(
          'text_char_at',
          ['function ' + Blockly.Lua.FUNCTION_NAME_PLACEHOLDER_ +
               '(str, index)',
           '  return string.sub(str, index, index)',
           'end']);
      code = functionName + '(' + text + ', ' + start + ')';
    }
  }
  return [code, Blockly.Lua.ORDER_HIGH];
};

Blockly.Lua['text_getSubstring'] = function(block) {
  // Get substring.
  var text = Blockly.Lua.valueToCode(block, 'STRING',
      Blockly.Lua.ORDER_NONE) || '\'\'';

  // Get start index.
  var where1 = block.getFieldValue('WHERE1');
  var at1 = Blockly.Lua.valueToCode(block, 'AT1',
      Blockly.Lua.ORDER_UNARY) || '1';
  if (where1 == 'FIRST') {
    var start = 1;
  } else if (where1 == 'FROM_START') {
    var start = at1;
  } else if (where1 == 'FROM_END') {
    var start = '-' + at1;
  } else {
    throw 'Unhandled option (text_getSubstring)';
  }

  // Get end index.
  var where2 = block.getFieldValue('WHERE2');
  var at2 = Blockly.Lua.valueToCode(block, 'AT2',
      Blockly.Lua.ORDER_UNARY) || '1';
  if (where2 == 'LAST') {
    var end = -1;
  } else if (where2 == 'FROM_START') {
    var end = at2;
  } else if (where2 == 'FROM_END') {
    var end = '-' + at2;
  } else {
    throw 'Unhandled option (text_getSubstring)';
  }
  var code = 'string.sub(' + text + ', ' + start + ', ' + end + ')';
  return [code, Blockly.Lua.ORDER_HIGH];
};

Blockly.Lua['text_changeCase'] = function(block) {
  // Change capitalization.
  var operator = block.getFieldValue('CASE');
  var argument0 = Blockly.Lua.valueToCode(block, 'TEXT',
      Blockly.Lua.ORDER_NONE) || '\'\'';
  if (operator == 'UPPERCASE') {
    var functionName = 'string.upper';
  } else if (operator == 'LOWERCASE') {
    var functionName = 'string.lower';
  } else if (operator == 'TITLECASE') {
    var functionName = Blockly.Lua.provideFunction_(
        'text_titlecase',
        // There are shorter versions at
        // http://lua-users.org/wiki/SciteTitleCase
        // that do not preserve whitespace.
        ['function ' + Blockly.Lua.FUNCTION_NAME_PLACEHOLDER_ + '(str)',
         '  local buf = {}',
         '  local inWord = false',
         '  for i = 1, #str do',
         '    local c = string.sub(str, i, i)',
         '    if inWord then',
         '      table.insert(buf, string.lower(c))',
         '      if string.find(c, "%s") then',
         '        inWord = false',
         '      end',
         '    else',
         '      table.insert(buf, string.upper(c))',
         '      inWord = true',
         '    end',
         '  end',
         '  return table.concat(buf)',
         'end']);
  }
  var code = functionName + '(' + argument0 + ')';
  return [code, Blockly.Lua.ORDER_HIGH];
};

Blockly.Lua['text_trim'] = function(block) {
  // Trim spaces.
  var OPERATORS = {
    LEFT: '^%s*(,-)',
    RIGHT: '(.-)%s*$',
    BOTH: '^%s*(.-)%s*$'
  };
  var operator = OPERATORS[block.getFieldValue('MODE')];
  var text = Blockly.Lua.valueToCode(block, 'TEXT',
      Blockly.Lua.ORDER_NONE) || '\'\'';
  var code = 'string.gsub(' + text + ', "' + operator + '", "%1")';
  return [code, Blockly.Lua.ORDER_HIGH];
};

Blockly.Lua['text_print'] = function(block) {
  // Print statement.
  var argument0 = Blockly.Lua.valueToCode(block, 'TEXT',
      Blockly.Lua.ORDER_NONE) || '\'\'';
  return 'print(' + argument0 + ')\n';
};

Blockly.Lua['text_prompt_ext'] = function(block) {
  // Prompt function.
  if (block.getField('TEXT')) {
    // Internal message.
    var msg = Blockly.Lua.quote_(block.getFieldValue('TEXT'));
  } else {
    // External message.
    var msg = Blockly.Lua.valueToCode(block, 'TEXT',
        Blockly.Lua.ORDER_NONE) || '\'\'';
  }

  var functionName = Blockly.Lua.provideFunction_(
      'text_prompt',
      ['function ' + Blockly.Lua.FUNCTION_NAME_PLACEHOLDER_ + '(msg)',
       '  io.write(msg)',
       '  io.flush()',
       '  return io.read()',
       'end']);
  var code = functionName + '(' + msg + ')';

  var toNumber = block.getFieldValue('TYPE') == 'NUMBER';
  if (toNumber) {
    code = 'tonumber(' + code + ', 10)';
  }
  return [code, Blockly.Lua.ORDER_HIGH];
};

Blockly.Lua['text_prompt'] = Blockly.Lua['text_prompt_ext'];
