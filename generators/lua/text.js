/**
 * @license
 * Copyright 2016 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Generating Lua for text blocks.
 */

import * as goog from '../../closure/goog/goog.js';
goog.declareModuleId('Blockly.Lua.texts');

import {NameType} from '../../core/names.js';
import {luaGenerator, Order} from '../lua.js';


luaGenerator.forBlock['text'] = function(block, generator) {
  // Text value.
  const code = luaGenerator.quote_(block.getFieldValue('TEXT'));
  return [code, Order.ATOMIC];
};

luaGenerator.forBlock['text_multiline'] = function(block, generator) {
  // Text value.
  const code = luaGenerator.multiline_quote_(block.getFieldValue('TEXT'));
  const order =
      code.indexOf('..') !== -1 ? Order.CONCATENATION : Order.ATOMIC;
  return [code, order];
};

luaGenerator.forBlock['text_join'] = function(block, generator) {
  // Create a string made up of any number of elements of any type.
  if (block.itemCount_ === 0) {
    return ["''", Order.ATOMIC];
  } else if (block.itemCount_ === 1) {
    const element = luaGenerator.valueToCode(block, 'ADD0', Order.NONE) || "''";
    const code = 'tostring(' + element + ')';
    return [code, Order.HIGH];
  } else if (block.itemCount_ === 2) {
    const element0 =
        luaGenerator.valueToCode(block, 'ADD0', Order.CONCATENATION) || "''";
    const element1 =
        luaGenerator.valueToCode(block, 'ADD1', Order.CONCATENATION) || "''";
    const code = element0 + ' .. ' + element1;
    return [code, Order.CONCATENATION];
  } else {
    const elements = [];
    for (let i = 0; i < block.itemCount_; i++) {
      elements[i] =
          luaGenerator.valueToCode(block, 'ADD' + i, Order.NONE) || "''";
    }
    const code = 'table.concat({' + elements.join(', ') + '})';
    return [code, Order.HIGH];
  }
};

luaGenerator.forBlock['text_append'] = function(block, generator) {
  // Append to a variable in place.
  const varName =
      luaGenerator.nameDB_.getName(
        block.getFieldValue('VAR'), NameType.VARIABLE);
  const value =
      luaGenerator.valueToCode(block, 'TEXT', Order.CONCATENATION) || "''";
  return varName + ' = ' + varName + ' .. ' + value + '\n';
};

luaGenerator.forBlock['text_length'] = function(block, generator) {
  // String or array length.
  const text = luaGenerator.valueToCode(block, 'VALUE', Order.UNARY) || "''";
  return ['#' + text, Order.UNARY];
};

luaGenerator.forBlock['text_isEmpty'] = function(block, generator) {
  // Is the string null or array empty?
  const text = luaGenerator.valueToCode(block, 'VALUE', Order.UNARY) || "''";
  return ['#' + text + ' == 0', Order.RELATIONAL];
};

luaGenerator.forBlock['text_indexOf'] = function(block, generator) {
  // Search the text for a substring.
  const substring = luaGenerator.valueToCode(block, 'FIND', Order.NONE) || "''";
  const text = luaGenerator.valueToCode(block, 'VALUE', Order.NONE) || "''";
  let functionName;
  if (block.getFieldValue('END') === 'FIRST') {
    functionName = luaGenerator.provideFunction_('firstIndexOf', `
function ${luaGenerator.FUNCTION_NAME_PLACEHOLDER_}(str, substr)
  local i = string.find(str, substr, 1, true)
  if i == nil then
    return 0
  end
  return i
end
`);
  } else {
    functionName = luaGenerator.provideFunction_('lastIndexOf', `
function ${luaGenerator.FUNCTION_NAME_PLACEHOLDER_}(str, substr)
  local i = string.find(string.reverse(str), string.reverse(substr), 1, true)
  if i then
    return #str + 2 - i - #substr
  end
  return 0
end
`);
  }
  const code = functionName + '(' + text + ', ' + substring + ')';
  return [code, Order.HIGH];
};

luaGenerator.forBlock['text_charAt'] = function(block, generator) {
  // Get letter at index.
  // Note: Until January 2013 this block did not have the WHERE input.
  const where = block.getFieldValue('WHERE') || 'FROM_START';
  const atOrder = (where === 'FROM_END') ? Order.UNARY : Order.NONE;
  const at = luaGenerator.valueToCode(block, 'AT', atOrder) || '1';
  const text = luaGenerator.valueToCode(block, 'VALUE', Order.NONE) || "''";
  let code;
  if (where === 'RANDOM') {
    const functionName = luaGenerator.provideFunction_('text_random_letter', `
function ${luaGenerator.FUNCTION_NAME_PLACEHOLDER_}(str)
  local index = math.random(string.len(str))
  return string.sub(str, index, index)
end
`);
    code = functionName + '(' + text + ')';
  } else {
    let start;
    if (where === 'FIRST') {
      start = '1';
    } else if (where === 'LAST') {
      start = '-1';
    } else {
      if (where === 'FROM_START') {
        start = at;
      } else if (where === 'FROM_END') {
        start = '-' + at;
      } else {
        throw Error('Unhandled option (text_charAt).');
      }
    }
    if (start.match(/^-?\w*$/)) {
      code = 'string.sub(' + text + ', ' + start + ', ' + start + ')';
    } else {
      // use function to avoid reevaluation
      const functionName = luaGenerator.provideFunction_('text_char_at', `
function ${luaGenerator.FUNCTION_NAME_PLACEHOLDER_}(str, index)
  return string.sub(str, index, index)
end
`);
      code = functionName + '(' + text + ', ' + start + ')';
    }
  }
  return [code, Order.HIGH];
};

luaGenerator.forBlock['text_getSubstring'] = function(block, generator) {
  // Get substring.
  const text = luaGenerator.valueToCode(block, 'STRING', Order.NONE) || "''";

  // Get start index.
  const where1 = block.getFieldValue('WHERE1');
  const at1Order = (where1 === 'FROM_END') ? Order.UNARY : Order.NONE;
  const at1 = luaGenerator.valueToCode(block, 'AT1', at1Order) || '1';
  let start;
  if (where1 === 'FIRST') {
    start = 1;
  } else if (where1 === 'FROM_START') {
    start = at1;
  } else if (where1 === 'FROM_END') {
    start = '-' + at1;
  } else {
    throw Error('Unhandled option (text_getSubstring)');
  }

  // Get end index.
  const where2 = block.getFieldValue('WHERE2');
  const at2Order = (where2 === 'FROM_END') ? Order.UNARY : Order.NONE;
  const at2 = luaGenerator.valueToCode(block, 'AT2', at2Order) || '1';
  let end;
  if (where2 === 'LAST') {
    end = -1;
  } else if (where2 === 'FROM_START') {
    end = at2;
  } else if (where2 === 'FROM_END') {
    end = '-' + at2;
  } else {
    throw Error('Unhandled option (text_getSubstring)');
  }
  const code = 'string.sub(' + text + ', ' + start + ', ' + end + ')';
  return [code, Order.HIGH];
};

luaGenerator.forBlock['text_changeCase'] = function(block, generator) {
  // Change capitalization.
  const operator = block.getFieldValue('CASE');
  const text = luaGenerator.valueToCode(block, 'TEXT', Order.NONE) || "''";
  let functionName;
  if (operator === 'UPPERCASE') {
    functionName = 'string.upper';
  } else if (operator === 'LOWERCASE') {
    functionName = 'string.lower';
  } else if (operator === 'TITLECASE') {
    // There are shorter versions at
    // http://lua-users.org/wiki/SciteTitleCase
    // that do not preserve whitespace.
    functionName = luaGenerator.provideFunction_('text_titlecase', `
function ${luaGenerator.FUNCTION_NAME_PLACEHOLDER_}(str)
  local buf = {}
  local inWord = false
  for i = 1, #str do
    local c = string.sub(str, i, i)
    if inWord then
      table.insert(buf, string.lower(c))
      if string.find(c, "%s") then
        inWord = false
      end
    else
      table.insert(buf, string.upper(c))
      inWord = true
    end
  end
  return table.concat(buf)
end
`);
  }
  const code = functionName + '(' + text + ')';
  return [code, Order.HIGH];
};

luaGenerator.forBlock['text_trim'] = function(block, generator) {
  // Trim spaces.
  const OPERATORS = {LEFT: '^%s*(,-)', RIGHT: '(.-)%s*$', BOTH: '^%s*(.-)%s*$'};
  const operator = OPERATORS[block.getFieldValue('MODE')];
  const text = luaGenerator.valueToCode(block, 'TEXT', Order.NONE) || "''";
  const code = 'string.gsub(' + text + ', "' + operator + '", "%1")';
  return [code, Order.HIGH];
};

luaGenerator.forBlock['text_print'] = function(block, generator) {
  // Print statement.
  const msg = luaGenerator.valueToCode(block, 'TEXT', Order.NONE) || "''";
  return 'print(' + msg + ')\n';
};

luaGenerator.forBlock['text_prompt_ext'] = function(block, generator) {
  // Prompt function.
  let msg;
  if (block.getField('TEXT')) {
    // Internal message.
    msg = luaGenerator.quote_(block.getFieldValue('TEXT'));
  } else {
    // External message.
    msg = luaGenerator.valueToCode(block, 'TEXT', Order.NONE) || "''";
  }

  const functionName = luaGenerator.provideFunction_('text_prompt', `
function ${luaGenerator.FUNCTION_NAME_PLACEHOLDER_}(msg)
  io.write(msg)
  io.flush()
  return io.read()
end
`);
  let code = functionName + '(' + msg + ')';

  const toNumber = block.getFieldValue('TYPE') === 'NUMBER';
  if (toNumber) {
    code = 'tonumber(' + code + ', 10)';
  }
  return [code, Order.HIGH];
};

luaGenerator.forBlock['text_prompt'] = luaGenerator.forBlock['text_prompt_ext'];

luaGenerator.forBlock['text_count'] = function(block, generator) {
  const text = luaGenerator.valueToCode(block, 'TEXT', Order.NONE) || "''";
  const sub = luaGenerator.valueToCode(block, 'SUB', Order.NONE) || "''";
  const functionName = luaGenerator.provideFunction_('text_count', `
function ${luaGenerator.FUNCTION_NAME_PLACEHOLDER_}(haystack, needle)
  if #needle == 0 then
    return #haystack + 1
  end
  local i = 1
  local count = 0
  while true do
    i = string.find(haystack, needle, i, true)
    if i == nil then
      break
    end
    count = count + 1
    i = i + #needle
  end
  return count
end
`);
  const code = functionName + '(' + text + ', ' + sub + ')';
  return [code, Order.HIGH];
};

luaGenerator.forBlock['text_replace'] = function(block, generator) {
  const text = luaGenerator.valueToCode(block, 'TEXT', Order.NONE) || "''";
  const from = luaGenerator.valueToCode(block, 'FROM', Order.NONE) || "''";
  const to = luaGenerator.valueToCode(block, 'TO', Order.NONE) || "''";
  const functionName = luaGenerator.provideFunction_('text_replace', `
function ${luaGenerator.FUNCTION_NAME_PLACEHOLDER_}(haystack, needle, replacement)
  local buf = {}
  local i = 1
  while i <= #haystack do
    if string.sub(haystack, i, i + #needle - 1) == needle then
      for j = 1, #replacement do
        table.insert(buf, string.sub(replacement, j, j))
      end
      i = i + #needle
    else
      table.insert(buf, string.sub(haystack, i, i))
      i = i + 1
    end
  end
  return table.concat(buf)
end
`);
  const code = functionName + '(' + text + ', ' + from + ', ' + to + ')';
  return [code, Order.HIGH];
};

luaGenerator.forBlock['text_reverse'] = function(block, generator) {
  const text = luaGenerator.valueToCode(block, 'TEXT', Order.NONE) || "''";
  const code = 'string.reverse(' + text + ')';
  return [code, Order.HIGH];
};
