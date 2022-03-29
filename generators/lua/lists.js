/**
 * @license
 * Copyright 2016 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Generating Lua for list blocks.
 */
'use strict';

goog.module('Blockly.Lua.lists');

const Lua = goog.require('Blockly.Lua');
const {NameType} = goog.require('Blockly.Names');


Lua['lists_create_empty'] = function(block) {
  // Create an empty list.
  return ['{}', Lua.ORDER_HIGH];
};

Lua['lists_create_with'] = function(block) {
  // Create a list with any number of elements of any type.
  const elements = new Array(block.itemCount_);
  for (let i = 0; i < block.itemCount_; i++) {
    elements[i] = Lua.valueToCode(block, 'ADD' + i, Lua.ORDER_NONE) || 'None';
  }
  const code = '{' + elements.join(', ') + '}';
  return [code, Lua.ORDER_HIGH];
};

Lua['lists_repeat'] = function(block) {
  // Create a list with one element repeated.
  const functionName = Lua.provideFunction_('create_list_repeated', `
function ${Lua.FUNCTION_NAME_PLACEHOLDER_}(item, count)
  local t = {}
  for i = 1, count do
    table.insert(t, item)
  end
  return t
end
  `);
  const element = Lua.valueToCode(block, 'ITEM', Lua.ORDER_NONE) || 'None';
  const repeatCount = Lua.valueToCode(block, 'NUM', Lua.ORDER_NONE) || '0';
  const code = functionName + '(' + element + ', ' + repeatCount + ')';
  return [code, Lua.ORDER_HIGH];
};

Lua['lists_length'] = function(block) {
  // String or array length.
  const list = Lua.valueToCode(block, 'VALUE', Lua.ORDER_UNARY) || '{}';
  return ['#' + list, Lua.ORDER_UNARY];
};

Lua['lists_isEmpty'] = function(block) {
  // Is the string null or array empty?
  const list = Lua.valueToCode(block, 'VALUE', Lua.ORDER_UNARY) || '{}';
  const code = '#' + list + ' == 0';
  return [code, Lua.ORDER_RELATIONAL];
};

Lua['lists_indexOf'] = function(block) {
  // Find an item in the list.
  const item = Lua.valueToCode(block, 'FIND', Lua.ORDER_NONE) || "''";
  const list = Lua.valueToCode(block, 'VALUE', Lua.ORDER_NONE) || '{}';
  let functionName;
  if (block.getFieldValue('END') === 'FIRST') {
    functionName = Lua.provideFunction_('first_index', `
function ${Lua.FUNCTION_NAME_PLACEHOLDER_}(t, elem)
  for k, v in ipairs(t) do
    if v == elem then
      return k
    end
  end
  return 0
end
`);
  } else {
    functionName = Lua.provideFunction_('last_index', `
function ${Lua.FUNCTION_NAME_PLACEHOLDER_}(t, elem)
  for i = #t, 1, -1 do
    if t[i] == elem then
      return i
    end
  end
  return 0
end
`);
  }
  const code = functionName + '(' + list + ', ' + item + ')';
  return [code, Lua.ORDER_HIGH];
};

/**
 * Returns an expression calculating the index into a list.
 * @param {string} listName Name of the list, used to calculate length.
 * @param {string} where The method of indexing, selected by dropdown in Blockly
 * @param {string=} opt_at The optional offset when indexing from start/end.
 * @return {string|undefined} Index expression.
 */
const getListIndex = function(listName, where, opt_at) {
  if (where === 'FIRST') {
    return '1';
  } else if (where === 'FROM_END') {
    return '#' + listName + ' + 1 - ' + opt_at;
  } else if (where === 'LAST') {
    return '#' + listName;
  } else if (where === 'RANDOM') {
    return 'math.random(#' + listName + ')';
  } else {
    return opt_at;
  }
};

Lua['lists_getIndex'] = function(block) {
  // Get element at index.
  // Note: Until January 2013 this block did not have MODE or WHERE inputs.
  const mode = block.getFieldValue('MODE') || 'GET';
  const where = block.getFieldValue('WHERE') || 'FROM_START';
  const list = Lua.valueToCode(block, 'VALUE', Lua.ORDER_HIGH) || '({})';

  // If `list` would be evaluated more than once (which is the case for LAST,
  // FROM_END, and RANDOM) and is non-trivial, make sure to access it only once.
  if ((where === 'LAST' || where === 'FROM_END' || where === 'RANDOM') &&
      !list.match(/^\w+$/)) {
    // `list` is an expression, so we may not evaluate it more than once.
    if (mode === 'REMOVE') {
      // We can use multiple statements.
      const atOrder =
          (where === 'FROM_END') ? Lua.ORDER_ADDITIVE : Lua.ORDER_NONE;
      let at = Lua.valueToCode(block, 'AT', atOrder) || '1';
      const listVar =
          Lua.nameDB_.getDistinctName('tmp_list', NameType.VARIABLE);
      at = getListIndex(listVar, where, at);
      const code = listVar + ' = ' + list + '\n' +
          'table.remove(' + listVar + ', ' + at + ')\n';
      return code;
    } else {
      // We need to create a procedure to avoid reevaluating values.
      const at = Lua.valueToCode(block, 'AT', Lua.ORDER_NONE) || '1';
      let functionName;
      if (mode === 'GET') {
        functionName = Lua.provideFunction_('list_get_' + where.toLowerCase(), [
          'function ' + Lua.FUNCTION_NAME_PLACEHOLDER_ + '(t' +
              // The value for 'FROM_END' and'FROM_START' depends on `at` so
              // we add it as a parameter.
              ((where === 'FROM_END' || where === 'FROM_START') ? ', at)' :
                                                                  ')'),
          '  return t[' + getListIndex('t', where, 'at') + ']', 'end'
        ]);
      } else {  // `mode` === 'GET_REMOVE'
        functionName =
            Lua.provideFunction_('list_remove_' + where.toLowerCase(), [
              'function ' + Lua.FUNCTION_NAME_PLACEHOLDER_ + '(t' +
                  // The value for 'FROM_END' and'FROM_START' depends on `at` so
                  // we add it as a parameter.
                  ((where === 'FROM_END' || where === 'FROM_START') ? ', at)' :
                                                                      ')'),
              '  return table.remove(t, ' + getListIndex('t', where, 'at') +
                  ')',
              'end'
            ]);
      }
      const code = functionName + '(' + list +
          // The value for 'FROM_END' and 'FROM_START' depends on `at` so we
          // pass it.
          ((where === 'FROM_END' || where === 'FROM_START') ? ', ' + at : '') +
          ')';
      return [code, Lua.ORDER_HIGH];
    }
  } else {
    // Either `list` is a simple variable, or we only need to refer to `list`
    // once.
    const atOrder = (mode === 'GET' && where === 'FROM_END') ?
        Lua.ORDER_ADDITIVE :
        Lua.ORDER_NONE;
    let at = Lua.valueToCode(block, 'AT', atOrder) || '1';
    at = getListIndex(list, where, at);
    if (mode === 'GET') {
      const code = list + '[' + at + ']';
      return [code, Lua.ORDER_HIGH];
    } else {
      const code = 'table.remove(' + list + ', ' + at + ')';
      if (mode === 'GET_REMOVE') {
        return [code, Lua.ORDER_HIGH];
      } else {  // `mode` === 'REMOVE'
        return code + '\n';
      }
    }
  }
};

Lua['lists_setIndex'] = function(block) {
  // Set element at index.
  // Note: Until February 2013 this block did not have MODE or WHERE inputs.
  let list = Lua.valueToCode(block, 'LIST', Lua.ORDER_HIGH) || '{}';
  const mode = block.getFieldValue('MODE') || 'SET';
  const where = block.getFieldValue('WHERE') || 'FROM_START';
  const at = Lua.valueToCode(block, 'AT', Lua.ORDER_ADDITIVE) || '1';
  const value = Lua.valueToCode(block, 'TO', Lua.ORDER_NONE) || 'None';

  let code = '';
  // If `list` would be evaluated more than once (which is the case for LAST,
  // FROM_END, and RANDOM) and is non-trivial, make sure to access it only once.
  if ((where === 'LAST' || where === 'FROM_END' || where === 'RANDOM') &&
      !list.match(/^\w+$/)) {
    // `list` is an expression, so we may not evaluate it more than once.
    // We can use multiple statements.
    const listVar = Lua.nameDB_.getDistinctName('tmp_list', NameType.VARIABLE);
    code = listVar + ' = ' + list + '\n';
    list = listVar;
  }
  if (mode === 'SET') {
    code += list + '[' + getListIndex(list, where, at) + '] = ' + value;
  } else {  // `mode` === 'INSERT'
    // LAST is a special case, because we want to insert
    // *after* not *before*, the existing last element.
    code += 'table.insert(' + list + ', ' +
        (getListIndex(list, where, at) + (where === 'LAST' ? ' + 1' : '')) +
        ', ' + value + ')';
  }
  return code + '\n';
};

Lua['lists_getSublist'] = function(block) {
  // Get sublist.
  const list = Lua.valueToCode(block, 'LIST', Lua.ORDER_NONE) || '{}';
  const where1 = block.getFieldValue('WHERE1');
  const where2 = block.getFieldValue('WHERE2');
  const at1 = Lua.valueToCode(block, 'AT1', Lua.ORDER_NONE) || '1';
  const at2 = Lua.valueToCode(block, 'AT2', Lua.ORDER_NONE) || '1';

  // The value for 'FROM_END' and'FROM_START' depends on `at` so
  // we add it as a parameter.
  const at1Param =
      (where1 === 'FROM_END' || where1 === 'FROM_START') ? ', at1' : '';
  const at2Param =
      (where2 === 'FROM_END' || where2 === 'FROM_START') ? ', at2' : '';
  const functionName = Lua.provideFunction_(
      'list_sublist_' + where1.toLowerCase() + '_' + where2.toLowerCase(), `
function ${Lua.FUNCTION_NAME_PLACEHOLDER_}(source${at1Param}${at2Param})
  local t = {}
  local start = ${getListIndex('source', where1, 'at1')}
  local finish = ${getListIndex('source', where2, 'at2')}
  for i = start, finish do
    table.insert(t, source[i])
  end
  return t
end
`);
  const code = functionName + '(' + list +
      // The value for 'FROM_END' and 'FROM_START' depends on `at` so we
      // pass it.
      ((where1 === 'FROM_END' || where1 === 'FROM_START') ? ', ' + at1 : '') +
      ((where2 === 'FROM_END' || where2 === 'FROM_START') ? ', ' + at2 : '') +
      ')';
  return [code, Lua.ORDER_HIGH];
};

Lua['lists_sort'] = function(block) {
  // Block for sorting a list.
  const list = Lua.valueToCode(block, 'LIST', Lua.ORDER_NONE) || '{}';
  const direction = block.getFieldValue('DIRECTION') === '1' ? 1 : -1;
  const type = block.getFieldValue('TYPE');

  const functionName = Lua.provideFunction_('list_sort', `
function ${Lua.FUNCTION_NAME_PLACEHOLDER_}(list, typev, direction)
  local t = {}
  for n,v in pairs(list) do table.insert(t, v) end
  local compareFuncs = {
    NUMERIC = function(a, b)
      return (tonumber(tostring(a)) or 0)
          < (tonumber(tostring(b)) or 0) end,
    TEXT = function(a, b)
      return tostring(a) < tostring(b) end,
    IGNORE_CASE = function(a, b)
      return string.lower(tostring(a)) < string.lower(tostring(b)) end
  }
  local compareTemp = compareFuncs[typev]
  local compare = compareTemp
  if direction == -1
  then compare = function(a, b) return compareTemp(b, a) end
  end
  table.sort(t, compare)
  return t
end
`);

  const code =
      functionName + '(' + list + ',"' + type + '", ' + direction + ')';
  return [code, Lua.ORDER_HIGH];
};

Lua['lists_split'] = function(block) {
  // Block for splitting text into a list, or joining a list into text.
  let input = Lua.valueToCode(block, 'INPUT', Lua.ORDER_NONE);
  const delimiter = Lua.valueToCode(block, 'DELIM', Lua.ORDER_NONE) || "''";
  const mode = block.getFieldValue('MODE');
  let functionName;
  if (mode === 'SPLIT') {
    if (!input) {
      input = "''";
    }
    functionName = Lua.provideFunction_('list_string_split', `
function ${Lua.FUNCTION_NAME_PLACEHOLDER_}(input, delim)
  local t = {}
  local pos = 1
  while true do
    next_delim = string.find(input, delim, pos)
    if next_delim == nil then
      table.insert(t, string.sub(input, pos))
      break
    else
      table.insert(t, string.sub(input, pos, next_delim-1))
      pos = next_delim + #delim
    end
  end
  return t
end
`);
  } else if (mode === 'JOIN') {
    if (!input) {
      input = '{}';
    }
    functionName = 'table.concat';
  } else {
    throw Error('Unknown mode: ' + mode);
  }
  const code = functionName + '(' + input + ', ' + delimiter + ')';
  return [code, Lua.ORDER_HIGH];
};

Lua['lists_reverse'] = function(block) {
  // Block for reversing a list.
  const list = Lua.valueToCode(block, 'LIST', Lua.ORDER_NONE) || '{}';
  const functionName = Lua.provideFunction_('list_reverse', `
function ${Lua.FUNCTION_NAME_PLACEHOLDER_}(input)
  local reversed = {}
  for i = #input, 1, -1 do
    table.insert(reversed, input[i])
  end
  return reversed
end
`);
  const code = functionName + '(' + list + ')';
  return [code, Lua.ORDER_HIGH];
};
