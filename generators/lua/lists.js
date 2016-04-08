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
 * @fileoverview Generating Lua for list blocks.
 * @author rodrigoq@google.com (Rodrigo Queiro)
 */
'use strict';

goog.provide('Blockly.Lua.lists');

goog.require('Blockly.Lua');


Blockly.Lua['lists_create_empty'] = function(block) {
  // Create an empty list.
  // List literals must be parenthesized before indexing into.
  return ['({})', Blockly.Lua.ORDER_ATOMIC];
};

Blockly.Lua['lists_create_with'] = function(block) {
  // Create a list with any number of elements of any type.
  var code = new Array(block.itemCount_);
  for (var n = 0; n < block.itemCount_; n++) {
    code[n] = Blockly.Lua.valueToCode(block, 'ADD' + n,
        Blockly.Lua.ORDER_NONE) || 'None';
  }
  code = '({' + code.join(', ') + '})';
  return [code, Blockly.Lua.ORDER_ATOMIC];
};

Blockly.Lua['lists_repeat'] = function(block) {
  // Create a list with one element repeated.
  var functionName = Blockly.Lua.provideFunction_(
      'create_list_repeated',
      ['function ' + Blockly.Lua.FUNCTION_NAME_PLACEHOLDER_ + '(item, count)',
       '  local t = {}',
       '  for i = 1, count do',
       '    table.insert(t, item)',
       '  end',
       '  return t',
       'end']);
  var argument0 = Blockly.Lua.valueToCode(block, 'ITEM',
      Blockly.Lua.ORDER_NONE) || 'None';
  var argument1 = Blockly.Lua.valueToCode(block, 'NUM',
      Blockly.Lua.ORDER_NONE) || '0';
  var code = functionName + '(' + argument0 + ', ' + argument1 + ')';
  return [code, Blockly.Lua.ORDER_HIGH];
};

Blockly.Lua['lists_length'] = function(block) {
  // String or array length.
  var argument0 = Blockly.Lua.valueToCode(block, 'VALUE',
      Blockly.Lua.ORDER_HIGH) || '({})';
  return ['#' + argument0, Blockly.Lua.ORDER_HIGH];
};

Blockly.Lua['lists_isEmpty'] = function(block) {
  // Is the string null or array empty?
  var argument0 = Blockly.Lua.valueToCode(block, 'VALUE',
      Blockly.Lua.ORDER_HIGH) || '({})';
  var code = '#' + argument0 + ' == 0';
  return [code, Blockly.Lua.ORDER_RELATIONAL];
};

Blockly.Lua['lists_indexOf'] = function(block) {
  // Find an item in the list.
  var argument0 = Blockly.Lua.valueToCode(block, 'FIND',
      Blockly.Lua.ORDER_NONE) || '\'\'';
  var argument1 = Blockly.Lua.valueToCode(block, 'VALUE',
      Blockly.Lua.ORDER_NONE) || '({})';
  var functionName;
  if (block.getFieldValue('END') == 'FIRST') {
    functionName = Blockly.Lua.provideFunction_(
        'first_index',
        ['function ' + Blockly.Lua.FUNCTION_NAME_PLACEHOLDER_ + '(t, elem)',
         '  for k, v in ipairs(t) do',
         '    if v == elem then',
         '      return k',
         '    end',
         '  end',
         '  return 0',
         'end']);
  } else {
    functionName = Blockly.Lua.provideFunction_(
        'last_index',
        ['function ' + Blockly.Lua.FUNCTION_NAME_PLACEHOLDER_ + '(t, elem)',
         '  for i = #t, 1, -1 do',
         '    if t[i] == elem then',
         '      return i',
         '    end',
         '  end',
         '  return 0',
         'end']);
  }
  var code = functionName + '(' + argument1 + ', ' + argument0 + ')';
  return [code, Blockly.Lua.ORDER_HIGH];
};

/**
 * Returns an expression calculating the index into a list.
 * @private
 * @param {string} listname Name of the list, used to calculate length.
 * @param {string} where The method of indexing, selected by dropdown in Blockly
 * @param {string=} opt_at The optional offset when indexing from start/end.
 * @return {string} Index expression.
 */
Blockly.Lua.lists.getIndex_ = function(listname, where, opt_at) {
  if (where == 'FIRST') {
    return '1';
  } else if (where == 'FROM_END') {
    return '#' + listname + ' + 1 - ' + opt_at;
  } else if (where == 'LAST') {
    return '#' + listname;
  } else if (where == 'RANDOM') {
    return 'math.random(#' + listname + ')';
  } else {
    return opt_at;
  }
};

/**
 * Counter for generating unique symbols.
 * @private
 * @type {number}
 */
Blockly.Lua.lists.gensym_counter_ = 0;

/**
 * Generate a unique symbol.
 * @private
 * @return {string} unique symbol, eg 'G123'
 */
Blockly.Lua.lists.gensym_ = function() {
  return 'G' + Blockly.Lua.lists.gensym_counter_++;
};

Blockly.Lua['lists_getIndex'] = function(block) {
  // Get element at index.
  // Note: Until January 2013 this block did not have MODE or WHERE inputs.
  var mode = block.getFieldValue('MODE') || 'GET';
  var where = block.getFieldValue('WHERE') || 'FROM_START';
  var at = Blockly.Lua.valueToCode(block, 'AT',
      Blockly.Lua.ORDER_ADDITIVE) || '1';
  var list = Blockly.Lua.valueToCode(block, 'VALUE',
      Blockly.Lua.ORDER_HIGH) || '({})';
  var getIndex_ = Blockly.Lua.lists.getIndex_;
  var gensym_ = Blockly.Lua.lists.gensym_;

  // If `list` would be evaluated more than once (which is the case for LAST,
  // FROM_END, and RANDOM) and is non-trivial, make sure to access it only once.
  if ((where == 'LAST' || where == 'FROM_END' || where == 'RANDOM') &&
      !list.match(/^\w+$/)) {
    // `list` is an expression, so we may not evaluate it more than once.
    if (mode == 'REMOVE') {
      // We can use multiple statements.
      var listVar = Blockly.Lua.variableDB_.getDistinctName(
          'tmp_list', Blockly.Variables.NAME_TYPE);
      var code = listVar + ' = ' + list + '\n' +
          'table.remove(' + listVar + ', ' + getIndex_(listVar, where, at) +
              ')\n';
      return code;
    } else {
      // We need to create a procedure to avoid reevaluating values.
      if (mode == 'GET') {
        // Note that getIndex_() ignores `at` when `where` == 'LAST' or
        // 'RANDOM', so we only need one procedure for each of those 'where'
        // values.  The value for 'FROM_END' depends on `at`, so we will
        // generate a unique procedure (name) each time.
        var functionName = Blockly.Lua.provideFunction_(
            'list_get_' + where.toLowerCase() +
                (where == 'FROM_END' ? '_' + gensym_() : ''),
            ['function ' + Blockly.Lua.FUNCTION_NAME_PLACEHOLDER_ + '(t)',
             '  return t[' + getIndex_('t', where, at) + ']',
             'end']);
      } else {  // mode == 'GET_REMOVE'
        // We need to create a procedure.
        var functionName = Blockly.Lua.provideFunction_(
            'list_remove_' + where.toLowerCase() +
                (where == 'FROM_END' ? '_' + gensym_() : ''),
            ['function ' + Blockly.Lua.FUNCTION_NAME_PLACEHOLDER_ + '(t)',
             '  return table.remove(t, ' + getIndex_('t', where, at) + ')',
             'end']);
      }
      var code = functionName + '(' + list + ')';
      return [code, Blockly.Lua.ORDER_HIGH];
    }
  } else {
    // Either `list` is a simple variable, or we only need to refer to `list`
    // once.
    if (mode == 'GET') {
      var code = list + '[' + getIndex_(list, where, at) + ']';
      return [code, Blockly.Lua.ORDER_HIGH];
    } else {
      var code = 'table.remove(' + list + ', ' + getIndex_(list, where, at) +
          ')';
      if (mode == 'GET_REMOVE') {
        return [code, Blockly.Lua.ORDER_HIGH];
      } else {  // `mode` == 'REMOVE'
        return code + '\n';
      }
    }
  }
};

Blockly.Lua['lists_setIndex'] = function(block) {
  // Set element at index.
  // Note: Until February 2013 this block did not have MODE or WHERE inputs.
  var list = Blockly.Lua.valueToCode(block, 'LIST',
      Blockly.Lua.ORDER_HIGH) || '({})';
  var mode = block.getFieldValue('MODE') || 'SET';
  var where = block.getFieldValue('WHERE') || 'FROM_START';
  var at = Blockly.Lua.valueToCode(block, 'AT',
      Blockly.Lua.ORDER_ADDITIVE) || '1';
  var value = Blockly.Lua.valueToCode(block, 'TO',
      Blockly.Lua.ORDER_NONE) || 'None';
  var getIndex_ = Blockly.Lua.lists.getIndex_;

  // If `list` would be evaluated more than once (which is the case for LAST,
  // FROM_END, and RANDOM) and is non-trivial, make sure to access it only once.
  if ((where == 'LAST' || where == 'FROM_END' || where == 'RANDOM') &&
      !list.match(/^\w+$/)) {
    // `list` is an expression, so we may not evaluate it more than once.
    if (where == 'RANDOM' || where == 'LAST') {
      // In these cases, `at` is implicit.  getIndex_() ignores its value.
      if (mode == 'SET') {
        var functionName = Blockly.Lua.provideFunction_(
            'list_set_' + where.toLowerCase(),
            ['function ' + Blockly.Lua.FUNCTION_NAME_PLACEHOLDER_ + '(t, val)',
             '  t[' + getIndex_('t', where, at) + '] = val',
             'end']);
      } else {  // `mode` == 'INSERT'
        var functionName = Blockly.Lua.provideFunction_(
            'list_insert_' + where.toLowerCase(),
            ['function ' + Blockly.Lua.FUNCTION_NAME_PLACEHOLDER_ + '(t, val)',
             '  table.insert(t, ' +
                 // LAST is a special case, because we want to insert
                 // *after* not *before*, the existing last element.
                 getIndex_('t', where, at) + (where == 'LAST' ? ' + 1' : '') +
                 ', val)',
             'end']);
      }
      var code = functionName + '(' + list + ', ' + value + ')\n';
      return code;
    } else {  // `where` = 'FROM_END'
      if (mode == 'SET') {
        var functionName = Blockly.Lua.provideFunction_(
            'list_set_from_end',
            ['function ' + Blockly.Lua.FUNCTION_NAME_PLACEHOLDER_ +
                 '(t, index, val)',
             '  t[#t + 1 - index] = val',
             'end']);
      } else {  // `mode` == 'INSERT'
        var functionName = Blockly.Lua.provideFunction_(
            'list_insert_from_end',
            ['function ' + Blockly.Lua.FUNCTION_NAME_PLACEHOLDER_ +
                 '(t, index, val)',
             '  table.insert(t, #t + 1 - index, val)',
             'end']);
      }
      var code = functionName + '(' + list + ', ' + at + ', ' + value + ')\n';
      return code;
    }
  } else {
    // It's okay to have multiple references to the list.
    if (mode == 'SET') {
      var code = list + '[' + getIndex_(list, where, at) + '] = ' + value;
    } else {  // `mode` == 'INSERT'
      // LAST is a special case, because we want to insert
      // *after* not *before*, the existing last element.
      var code = 'table.insert(' + list + ', ' +
          (getIndex_(list, where, at) + (where == 'LAST' ? ' + 1' : '')) +
          ', ' + value + ')';
    }
    return code + '\n';
  }
};

Blockly.Lua['lists_getSublist'] = function(block) {
  // Get sublist.
  var list = Blockly.Lua.valueToCode(block, 'LIST',
      Blockly.Lua.ORDER_HIGH) || '({})';
  var where1 = block.getFieldValue('WHERE1');
  var where2 = block.getFieldValue('WHERE2');
  var at1 = Blockly.Lua.valueToCode(block, 'AT1',
      Blockly.Lua.ORDER_ADDITIVE) || '1';
  var at2 = Blockly.Lua.valueToCode(block, 'AT2',
      Blockly.Lua.ORDER_ADDITIVE) || '1';
  var getIndex_ = Blockly.Lua.lists.getIndex_;

  var functionName = Blockly.Lua.provideFunction_(
      'list_sublist_' + Blockly.Lua.lists.gensym_(),
      ['function ' + Blockly.Lua.FUNCTION_NAME_PLACEHOLDER_ + '(source)',
       '  local t = {}',
       '  local start = ' + getIndex_('source', where1, at1),
       '  local finish = ' + getIndex_('source', where2, at2),
       '  for i = start, finish do',
       '    table.insert(t, source[i])',
       '  end',
       '  return t',
       'end']);
  var code = functionName + '(' + list + ')';
  return [code, Blockly.Lua.ORDER_HIGH];
};

Blockly.Lua['lists_split'] = function(block) {
  // Block for splitting text into a list, or joining a list into text.
  var value_input = Blockly.Lua.valueToCode(block, 'INPUT',
      Blockly.Lua.ORDER_NONE);
  var value_delim = Blockly.Lua.valueToCode(block, 'DELIM',
      Blockly.Lua.ORDER_NONE) || '\'\'';
  var mode = block.getFieldValue('MODE');
  var functionName;
  if (mode == 'SPLIT') {
    if (!value_input) {
      value_input = '\'\'';
    }
    functionName = Blockly.Lua.provideFunction_(
        'list_string_split',
        ['function ' + Blockly.Lua.FUNCTION_NAME_PLACEHOLDER_ +
             '(input, delim)',
         '  local t = {}',
         '  local pos = 1',
         '  while true do',
         '    next_delim = string.find(input, delim, pos)',
         '    if next_delim == nil then',
         '      table.insert(t, string.sub(input, pos))',
         '      break',
         '    else',
         '      table.insert(t, string.sub(input, pos, next_delim-1))',
         '      pos = next_delim + #delim',
         '    end',
         '  end',
         '  return t',
         'end']);
  } else if (mode == 'JOIN') {
    if (!value_input) {
      value_input = '({})';
    }
    functionName = 'table.concat';
  } else {
    throw 'Unknown mode: ' + mode;
  }
  var code = functionName + '(' + value_input + ', ' + value_delim + ')';
  return [code, Blockly.Lua.ORDER_HIGH];
};
