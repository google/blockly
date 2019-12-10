/**
 * @license
 * Copyright 2016 Google LLC
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
  return ['{}', Blockly.Lua.ORDER_ATOMIC];
};

Blockly.Lua['lists_create_with'] = function(block) {
  // Create a list with any number of elements of any type.
  var elements = new Array(block.itemCount_);
  for (var i = 0; i < block.itemCount_; i++) {
    elements[i] = Blockly.Lua.valueToCode(block, 'ADD' + i,
        Blockly.Lua.ORDER_NONE) || 'None';
  }
  var code = '{' + elements.join(', ') + '}';
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
  var element = Blockly.Lua.valueToCode(block, 'ITEM',
      Blockly.Lua.ORDER_NONE) || 'None';
  var repeatCount = Blockly.Lua.valueToCode(block, 'NUM',
      Blockly.Lua.ORDER_NONE) || '0';
  var code = functionName + '(' + element + ', ' + repeatCount + ')';
  return [code, Blockly.Lua.ORDER_HIGH];
};

Blockly.Lua['lists_length'] = function(block) {
  // String or array length.
  var list = Blockly.Lua.valueToCode(block, 'VALUE',
      Blockly.Lua.ORDER_UNARY) || '{}';
  return ['#' + list, Blockly.Lua.ORDER_UNARY];
};

Blockly.Lua['lists_isEmpty'] = function(block) {
  // Is the string null or array empty?
  var list = Blockly.Lua.valueToCode(block, 'VALUE',
      Blockly.Lua.ORDER_UNARY) || '{}';
  var code = '#' + list + ' == 0';
  return [code, Blockly.Lua.ORDER_RELATIONAL];
};

Blockly.Lua['lists_indexOf'] = function(block) {
  // Find an item in the list.
  var item = Blockly.Lua.valueToCode(block, 'FIND',
      Blockly.Lua.ORDER_NONE) || '\'\'';
  var list = Blockly.Lua.valueToCode(block, 'VALUE',
      Blockly.Lua.ORDER_NONE) || '{}';
  if (block.getFieldValue('END') == 'FIRST') {
    var functionName = Blockly.Lua.provideFunction_(
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
    var functionName = Blockly.Lua.provideFunction_(
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
  var code = functionName + '(' + list + ', ' + item + ')';
  return [code, Blockly.Lua.ORDER_HIGH];
};

/**
 * Returns an expression calculating the index into a list.
 * @param {string} listName Name of the list, used to calculate length.
 * @param {string} where The method of indexing, selected by dropdown in Blockly
 * @param {string=} opt_at The optional offset when indexing from start/end.
 * @return {string} Index expression.
 * @private
 */
Blockly.Lua.lists.getIndex_ = function(listName, where, opt_at) {
  if (where == 'FIRST') {
    return '1';
  } else if (where == 'FROM_END') {
    return '#' + listName + ' + 1 - ' + opt_at;
  } else if (where == 'LAST') {
    return '#' + listName;
  } else if (where == 'RANDOM') {
    return 'math.random(#' + listName + ')';
  } else {
    return opt_at;
  }
};

Blockly.Lua['lists_getIndex'] = function(block) {
  // Get element at index.
  // Note: Until January 2013 this block did not have MODE or WHERE inputs.
  var mode = block.getFieldValue('MODE') || 'GET';
  var where = block.getFieldValue('WHERE') || 'FROM_START';
  var list = Blockly.Lua.valueToCode(block, 'VALUE', Blockly.Lua.ORDER_HIGH) ||
      '{}';
  var getIndex_ = Blockly.Lua.lists.getIndex_;

  // If `list` would be evaluated more than once (which is the case for LAST,
  // FROM_END, and RANDOM) and is non-trivial, make sure to access it only once.
  if ((where == 'LAST' || where == 'FROM_END' || where == 'RANDOM') &&
      !list.match(/^\w+$/)) {
    // `list` is an expression, so we may not evaluate it more than once.
    if (mode == 'REMOVE') {
      // We can use multiple statements.
      var atOrder = (where == 'FROM_END') ? Blockly.Lua.ORDER_ADDITIVE :
          Blockly.Lua.ORDER_NONE;
      var at = Blockly.Lua.valueToCode(block, 'AT', atOrder) || '1';
      var listVar = Blockly.Lua.variableDB_.getDistinctName(
          'tmp_list', Blockly.Variables.NAME_TYPE);
      at = getIndex_(listVar, where, at);
      var code = listVar + ' = ' + list + '\n' +
          'table.remove(' + listVar + ', ' + at + ')\n';
      return code;
    } else {
      // We need to create a procedure to avoid reevaluating values.
      var at = Blockly.Lua.valueToCode(block, 'AT', Blockly.Lua.ORDER_NONE) ||
          '1';
      if (mode == 'GET') {
        var functionName = Blockly.Lua.provideFunction_(
            'list_get_' + where.toLowerCase(),
            ['function ' + Blockly.Lua.FUNCTION_NAME_PLACEHOLDER_ + '(t' +
                // The value for 'FROM_END' and'FROM_START' depends on `at` so
                // we add it as a parameter.
                ((where == 'FROM_END' || where == 'FROM_START') ?
                    ', at)' : ')'),
             '  return t[' + getIndex_('t', where, 'at') + ']',
             'end']);
      } else {  //  mode == 'GET_REMOVE'
        var functionName = Blockly.Lua.provideFunction_(
            'list_remove_' + where.toLowerCase(),
            ['function ' + Blockly.Lua.FUNCTION_NAME_PLACEHOLDER_ + '(t' +
                // The value for 'FROM_END' and'FROM_START' depends on `at` so
                // we add it as a parameter.
                ((where == 'FROM_END' || where == 'FROM_START') ?
                    ', at)' : ')'),
             '  return table.remove(t, ' + getIndex_('t', where, 'at') + ')',
             'end']);
      }
      var code = functionName + '(' + list +
          // The value for 'FROM_END' and 'FROM_START' depends on `at` so we
          // pass it.
          ((where == 'FROM_END' || where == 'FROM_START') ? ', ' + at : '') +
          ')';
      return [code, Blockly.Lua.ORDER_HIGH];
    }
  } else {
    // Either `list` is a simple variable, or we only need to refer to `list`
    // once.
    var atOrder = (mode == 'GET' && where == 'FROM_END') ?
        Blockly.Lua.ORDER_ADDITIVE : Blockly.Lua.ORDER_NONE;
    var at = Blockly.Lua.valueToCode(block, 'AT', atOrder) || '1';
    at = getIndex_(list, where, at);
    if (mode == 'GET') {
      var code = list + '[' + at + ']';
      return [code, Blockly.Lua.ORDER_HIGH];
    } else {
      var code = 'table.remove(' + list + ', ' + at + ')';
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
      Blockly.Lua.ORDER_HIGH) || '{}';
  var mode = block.getFieldValue('MODE') || 'SET';
  var where = block.getFieldValue('WHERE') || 'FROM_START';
  var at = Blockly.Lua.valueToCode(block, 'AT',
      Blockly.Lua.ORDER_ADDITIVE) || '1';
  var value = Blockly.Lua.valueToCode(block, 'TO',
      Blockly.Lua.ORDER_NONE) || 'None';
  var getIndex_ = Blockly.Lua.lists.getIndex_;

  var code = '';
  // If `list` would be evaluated more than once (which is the case for LAST,
  // FROM_END, and RANDOM) and is non-trivial, make sure to access it only once.
  if ((where == 'LAST' || where == 'FROM_END' || where == 'RANDOM') &&
      !list.match(/^\w+$/)) {
    // `list` is an expression, so we may not evaluate it more than once.
    // We can use multiple statements.
    var listVar = Blockly.Lua.variableDB_.getDistinctName(
        'tmp_list', Blockly.Variables.NAME_TYPE);
    code = listVar + ' = ' + list + '\n';
    list = listVar;
  }
  if (mode == 'SET') {
    code += list + '[' + getIndex_(list, where, at) + '] = ' + value;
  } else {  // `mode` == 'INSERT'
    // LAST is a special case, because we want to insert
    // *after* not *before*, the existing last element.
    code += 'table.insert(' + list + ', ' +
        (getIndex_(list, where, at) + (where == 'LAST' ? ' + 1' : '')) +
        ', ' + value + ')';
  }
  return code + '\n';
};

Blockly.Lua['lists_getSublist'] = function(block) {
  // Get sublist.
  var list = Blockly.Lua.valueToCode(block, 'LIST',
      Blockly.Lua.ORDER_NONE) || '{}';
  var where1 = block.getFieldValue('WHERE1');
  var where2 = block.getFieldValue('WHERE2');
  var at1 = Blockly.Lua.valueToCode(block, 'AT1',
      Blockly.Lua.ORDER_NONE) || '1';
  var at2 = Blockly.Lua.valueToCode(block, 'AT2',
      Blockly.Lua.ORDER_NONE) || '1';
  var getIndex_ = Blockly.Lua.lists.getIndex_;

  var functionName = Blockly.Lua.provideFunction_(
      'list_sublist_' + where1.toLowerCase() + '_' + where2.toLowerCase(),
      ['function ' + Blockly.Lua.FUNCTION_NAME_PLACEHOLDER_ + '(source' +
          // The value for 'FROM_END' and'FROM_START' depends on `at` so
          // we add it as a parameter.
          ((where1 == 'FROM_END' || where1 == 'FROM_START') ? ', at1' : '') +
          ((where2 == 'FROM_END' || where2 == 'FROM_START') ? ', at2' : '') +
          ')',
       '  local t = {}',
       '  local start = ' + getIndex_('source', where1, 'at1'),
       '  local finish = ' + getIndex_('source', where2, 'at2'),
       '  for i = start, finish do',
       '    table.insert(t, source[i])',
       '  end',
       '  return t',
       'end']);
  var code = functionName + '(' + list +
      // The value for 'FROM_END' and 'FROM_START' depends on `at` so we
      // pass it.
      ((where1 == 'FROM_END' || where1 == 'FROM_START') ? ', ' + at1 : '') +
      ((where2 == 'FROM_END' || where2 == 'FROM_START') ? ', ' + at2 : '') +
      ')';
  return [code, Blockly.Lua.ORDER_HIGH];
};

Blockly.Lua['lists_sort'] = function(block) {
  // Block for sorting a list.
  var list = Blockly.Lua.valueToCode(
      block, 'LIST', Blockly.Lua.ORDER_NONE) || '{}';
  var direction = block.getFieldValue('DIRECTION') === '1' ? 1 : -1;
  var type = block.getFieldValue('TYPE');

  var functionName = Blockly.Lua.provideFunction_(
      'list_sort',
      ['function ' + Blockly.Lua.FUNCTION_NAME_PLACEHOLDER_ +
          '(list, typev, direction)',
       '  local t = {}',
       '  for n,v in pairs(list) do table.insert(t, v) end', // Shallow-copy.
       '  local compareFuncs = {',
       '    NUMERIC = function(a, b)',
       '      return (tonumber(tostring(a)) or 0)',
       '          < (tonumber(tostring(b)) or 0) end,',
       '    TEXT = function(a, b)',
       '      return tostring(a) < tostring(b) end,',
       '    IGNORE_CASE = function(a, b)',
       '      return string.lower(tostring(a)) < string.lower(tostring(b)) end',
       '  }',
       '  local compareTemp = compareFuncs[typev]',
       '  local compare = compareTemp',
       '  if direction == -1',
       '  then compare = function(a, b) return compareTemp(b, a) end',
       '  end',
       '  table.sort(t, compare)',
       '  return t',
       'end']);

  var code = functionName +
      '(' + list + ',"' + type + '", ' + direction + ')';
  return [code, Blockly.Lua.ORDER_HIGH];
};

Blockly.Lua['lists_split'] = function(block) {
  // Block for splitting text into a list, or joining a list into text.
  var input = Blockly.Lua.valueToCode(block, 'INPUT',
      Blockly.Lua.ORDER_NONE);
  var delimiter = Blockly.Lua.valueToCode(block, 'DELIM',
      Blockly.Lua.ORDER_NONE) || '\'\'';
  var mode = block.getFieldValue('MODE');
  var functionName;
  if (mode == 'SPLIT') {
    if (!input) {
      input = '\'\'';
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
    if (!input) {
      input = '{}';
    }
    functionName = 'table.concat';
  } else {
    throw Error('Unknown mode: ' + mode);
  }
  var code = functionName + '(' + input + ', ' + delimiter + ')';
  return [code, Blockly.Lua.ORDER_HIGH];
};

Blockly.Lua['lists_reverse'] = function(block) {
  // Block for reversing a list.
  var list = Blockly.Lua.valueToCode(block, 'LIST',
      Blockly.Lua.ORDER_NONE) || '{}';
  var functionName = Blockly.Lua.provideFunction_(
      'list_reverse',
      ['function ' + Blockly.Lua.FUNCTION_NAME_PLACEHOLDER_ + '(input)',
       '  local reversed = {}',
       '  for i = #input, 1, -1 do',
       '    table.insert(reversed, input[i])',
       '  end',
       '  return reversed',
       'end']);
  var code = 'list_reverse(' + list + ')';
  return [code, Blockly.Lua.ORDER_HIGH];
};
