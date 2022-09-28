/**
 * @license
 * Copyright 2016 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Generating Lua for text blocks.
 */
'use strict';

goog.module('Blockly.Lua.texts');

const Lua = goog.require('Blockly.Lua');
const {NameType} = goog.require('Blockly.Names');


Lua['text'] = function(block) {
  // Text value.
  const code = Lua.quote_(block.getFieldValue('TEXT'));
  return [code, Lua.ORDER_ATOMIC];
};

Lua['text_multiline'] = function(block) {
  // Text value.
  const code = Lua.multiline_quote_(block.getFieldValue('TEXT'));
  const order =
      code.indexOf('..') !== -1 ? Lua.ORDER_CONCATENATION : Lua.ORDER_ATOMIC;
  return [code, order];
};

Lua['text_join'] = function(block) {
  // Create a string made up of any number of elements of any type.
  if (block.itemCount_ === 0) {
    return ["''", Lua.ORDER_ATOMIC];
  } else if (block.itemCount_ === 1) {
    const element = Lua.valueToCode(block, 'ADD0', Lua.ORDER_NONE) || "''";
    const code = 'tostring(' + element + ')';
    return [code, Lua.ORDER_HIGH];
  } else if (block.itemCount_ === 2) {
    const element0 =
        Lua.valueToCode(block, 'ADD0', Lua.ORDER_CONCATENATION) || "''";
    const element1 =
        Lua.valueToCode(block, 'ADD1', Lua.ORDER_CONCATENATION) || "''";
    const code = element0 + ' .. ' + element1;
    return [code, Lua.ORDER_CONCATENATION];
  } else {
    const elements = [];
    for (let i = 0; i < block.itemCount_; i++) {
      elements[i] = Lua.valueToCode(block, 'ADD' + i, Lua.ORDER_NONE) || "''";
    }
    const code = 'table.concat({' + elements.join(', ') + '})';
    return [code, Lua.ORDER_HIGH];
  }
};

Lua['text_append'] = function(block) {
  // Append to a variable in place.
  const varName =
      Lua.nameDB_.getName(block.getFieldValue('VAR'), NameType.VARIABLE);
  const value =
      Lua.valueToCode(block, 'TEXT', Lua.ORDER_CONCATENATION) || "''";
  return varName + ' = ' + varName + ' .. ' + value + '\n';
};

Lua['text_length'] = function(block) {
  // String or array length.
  const text = Lua.valueToCode(block, 'VALUE', Lua.ORDER_UNARY) || "''";
  return ['#' + text, Lua.ORDER_UNARY];
};

Lua['text_isEmpty'] = function(block) {
  // Is the string null or array empty?
  const text = Lua.valueToCode(block, 'VALUE', Lua.ORDER_UNARY) || "''";
  return ['#' + text + ' == 0', Lua.ORDER_RELATIONAL];
};

Lua['text_indexOf'] = function(block) {
  // Search the text for a substring.
  const substring = Lua.valueToCode(block, 'FIND', Lua.ORDER_NONE) || "''";
  const text = Lua.valueToCode(block, 'VALUE', Lua.ORDER_NONE) || "''";
  let functionName;
  if (block.getFieldValue('END') === 'FIRST') {
    functionName = Lua.provideFunction_('firstIndexOf', `
function ${Lua.FUNCTION_NAME_PLACEHOLDER_}(str, substr)
  local i = string.find(str, substr, 1, true)
  if i == nil then
    return 0
  end
  return i
end
`);
  } else {
    functionName = Lua.provideFunction_('lastIndexOf', `
function ${Lua.FUNCTION_NAME_PLACEHOLDER_}(str, substr)
  local i = string.find(string.reverse(str), string.reverse(substr), 1, true)
  if i then
    return #str + 2 - i - #substr
  end
  return 0
end
`);
  }
  const code = functionName + '(' + text + ', ' + substring + ')';
  return [code, Lua.ORDER_HIGH];
};

Lua['text_charAt'] = function(block) {
  // Get letter at index.
  // Note: Until January 2013 this block did not have the WHERE input.
  const where = block.getFieldValue('WHERE') || 'FROM_START';
  const atOrder = (where === 'FROM_END') ? Lua.ORDER_UNARY : Lua.ORDER_NONE;
  const at = Lua.valueToCode(block, 'AT', atOrder) || '1';
  const text = Lua.valueToCode(block, 'VALUE', Lua.ORDER_NONE) || "''";
  let code;
  if (where === 'RANDOM') {
    const functionName = Lua.provideFunction_('text_random_letter', `
function ${Lua.FUNCTION_NAME_PLACEHOLDER_}(str)
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
      const functionName = Lua.provideFunction_('text_char_at', `
function ${Lua.FUNCTION_NAME_PLACEHOLDER_}(str, index)
  return string.sub(str, index, index)
end
`);
      code = functionName + '(' + text + ', ' + start + ')';
    }
  }
  return [code, Lua.ORDER_HIGH];
};

Lua['text_getSubstring'] = function(block) {
  // Get substring.
  const text = Lua.valueToCode(block, 'STRING', Lua.ORDER_NONE) || "''";

  // Get start index.
  const where1 = block.getFieldValue('WHERE1');
  const at1Order = (where1 === 'FROM_END') ? Lua.ORDER_UNARY : Lua.ORDER_NONE;
  const at1 = Lua.valueToCode(block, 'AT1', at1Order) || '1';
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
  const at2Order = (where2 === 'FROM_END') ? Lua.ORDER_UNARY : Lua.ORDER_NONE;
  const at2 = Lua.valueToCode(block, 'AT2', at2Order) || '1';
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
  return [code, Lua.ORDER_HIGH];
};

Lua['text_changeCase'] = function(block) {
  // Change capitalization.
  const operator = block.getFieldValue('CASE');
  const text = Lua.valueToCode(block, 'TEXT', Lua.ORDER_NONE) || "''";
  let functionName;
  if (operator === 'UPPERCASE') {
    functionName = 'string.upper';
  } else if (operator === 'LOWERCASE') {
    functionName = 'string.lower';
  } else if (operator === 'TITLECASE') {
    // There are shorter versions at
    // http://lua-users.org/wiki/SciteTitleCase
    // that do not preserve whitespace.
    functionName = Lua.provideFunction_('text_titlecase', `
function ${Lua.FUNCTION_NAME_PLACEHOLDER_}(str)
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
  return [code, Lua.ORDER_HIGH];
};

Lua['text_trim'] = function(block) {
  // Trim spaces.
  const OPERATORS = {LEFT: '^%s*(,-)', RIGHT: '(.-)%s*$', BOTH: '^%s*(.-)%s*$'};
  const operator = OPERATORS[block.getFieldValue('MODE')];
  const text = Lua.valueToCode(block, 'TEXT', Lua.ORDER_NONE) || "''";
  const code = 'string.gsub(' + text + ', "' + operator + '", "%1")';
  return [code, Lua.ORDER_HIGH];
};

Lua['text_print'] = function(block) {
  // Print statement.
  const msg = Lua.valueToCode(block, 'TEXT', Lua.ORDER_NONE) || "''";
  return 'print(' + msg + ')\n';
};

Lua['text_prompt_ext'] = function(block) {
  // Prompt function.
  let msg;
  if (block.getField('TEXT')) {
    // Internal message.
    msg = Lua.quote_(block.getFieldValue('TEXT'));
  } else {
    // External message.
    msg = Lua.valueToCode(block, 'TEXT', Lua.ORDER_NONE) || "''";
  }

  const functionName = Lua.provideFunction_('text_prompt', `
function ${Lua.FUNCTION_NAME_PLACEHOLDER_}(msg)
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
  return [code, Lua.ORDER_HIGH];
};

Lua['text_prompt'] = Lua['text_prompt_ext'];

Lua['text_count'] = function(block) {
  const text = Lua.valueToCode(block, 'TEXT', Lua.ORDER_NONE) || "''";
  const sub = Lua.valueToCode(block, 'SUB', Lua.ORDER_NONE) || "''";
  const functionName = Lua.provideFunction_('text_count', `
function ${Lua.FUNCTION_NAME_PLACEHOLDER_}(haystack, needle)
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
  return [code, Lua.ORDER_HIGH];
};

Lua['text_replace'] = function(block) {
  const text = Lua.valueToCode(block, 'TEXT', Lua.ORDER_NONE) || "''";
  const from = Lua.valueToCode(block, 'FROM', Lua.ORDER_NONE) || "''";
  const to = Lua.valueToCode(block, 'TO', Lua.ORDER_NONE) || "''";
  const functionName = Lua.provideFunction_('text_replace', `
function ${Lua.FUNCTION_NAME_PLACEHOLDER_}(haystack, needle, replacement)
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
  return [code, Lua.ORDER_HIGH];
};

Lua['text_reverse'] = function(block) {
  const text = Lua.valueToCode(block, 'TEXT', Lua.ORDER_NONE) || "''";
  const code = 'string.reverse(' + text + ')';
  return [code, Lua.ORDER_HIGH];
};
