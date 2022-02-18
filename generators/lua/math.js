/**
 * @license
 * Copyright 2016 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Generating Lua for math blocks.
 */
'use strict';

goog.module('Blockly.Lua.math');

const Lua = goog.require('Blockly.Lua');
const {NameType} = goog.require('Blockly.Names');


Lua['math_number'] = function(block) {
  // Numeric value.
  const code = Number(block.getFieldValue('NUM'));
  const order = code < 0 ? Lua.ORDER_UNARY : Lua.ORDER_ATOMIC;
  return [code, order];
};

Lua['math_arithmetic'] = function(block) {
  // Basic arithmetic operators, and power.
  const OPERATORS = {
    'ADD': [' + ', Lua.ORDER_ADDITIVE],
    'MINUS': [' - ', Lua.ORDER_ADDITIVE],
    'MULTIPLY': [' * ', Lua.ORDER_MULTIPLICATIVE],
    'DIVIDE': [' / ', Lua.ORDER_MULTIPLICATIVE],
    'POWER': [' ^ ', Lua.ORDER_EXPONENTIATION],
  };
  const tuple = OPERATORS[block.getFieldValue('OP')];
  const operator = tuple[0];
  const order = tuple[1];
  const argument0 = Lua.valueToCode(block, 'A', order) || '0';
  const argument1 = Lua.valueToCode(block, 'B', order) || '0';
  const code = argument0 + operator + argument1;
  return [code, order];
};

Lua['math_single'] = function(block) {
  // Math operators with single operand.
  const operator = block.getFieldValue('OP');
  let arg;
  if (operator === 'NEG') {
    // Negation is a special case given its different operator precedence.
    arg = Lua.valueToCode(block, 'NUM', Lua.ORDER_UNARY) || '0';
    return ['-' + arg, Lua.ORDER_UNARY];
  }
  if (operator === 'POW10') {
    arg = Lua.valueToCode(block, 'NUM', Lua.ORDER_EXPONENTIATION) || '0';
    return ['10 ^ ' + arg, Lua.ORDER_EXPONENTIATION];
  }
  if (operator === 'ROUND') {
    arg = Lua.valueToCode(block, 'NUM', Lua.ORDER_ADDITIVE) || '0';
  } else {
    arg = Lua.valueToCode(block, 'NUM', Lua.ORDER_NONE) || '0';
  }

  let code;
  switch (operator) {
    case 'ABS':
      code = 'math.abs(' + arg + ')';
      break;
    case 'ROOT':
      code = 'math.sqrt(' + arg + ')';
      break;
    case 'LN':
      code = 'math.log(' + arg + ')';
      break;
    case 'LOG10':
      code = 'math.log(' + arg + ', 10)';
      break;
    case 'EXP':
      code = 'math.exp(' + arg + ')';
      break;
    case 'ROUND':
      // This rounds up.  Blockly does not specify rounding direction.
      code = 'math.floor(' + arg + ' + .5)';
      break;
    case 'ROUNDUP':
      code = 'math.ceil(' + arg + ')';
      break;
    case 'ROUNDDOWN':
      code = 'math.floor(' + arg + ')';
      break;
    case 'SIN':
      code = 'math.sin(math.rad(' + arg + '))';
      break;
    case 'COS':
      code = 'math.cos(math.rad(' + arg + '))';
      break;
    case 'TAN':
      code = 'math.tan(math.rad(' + arg + '))';
      break;
    case 'ASIN':
      code = 'math.deg(math.asin(' + arg + '))';
      break;
    case 'ACOS':
      code = 'math.deg(math.acos(' + arg + '))';
      break;
    case 'ATAN':
      code = 'math.deg(math.atan(' + arg + '))';
      break;
    default:
      throw Error('Unknown math operator: ' + operator);
  }
  return [code, Lua.ORDER_HIGH];
};

Lua['math_constant'] = function(block) {
  // Constants: PI, E, the Golden Ratio, sqrt(2), 1/sqrt(2), INFINITY.
  const CONSTANTS = {
    'PI': ['math.pi', Lua.ORDER_HIGH],
    'E': ['math.exp(1)', Lua.ORDER_HIGH],
    'GOLDEN_RATIO': ['(1 + math.sqrt(5)) / 2', Lua.ORDER_MULTIPLICATIVE],
    'SQRT2': ['math.sqrt(2)', Lua.ORDER_HIGH],
    'SQRT1_2': ['math.sqrt(1 / 2)', Lua.ORDER_HIGH],
    'INFINITY': ['math.huge', Lua.ORDER_HIGH],
  };
  return CONSTANTS[block.getFieldValue('CONSTANT')];
};

Lua['math_number_property'] = function(block) {
  // Check if a number is even, odd, prime, whole, positive, or negative
  // or if it is divisible by certain number. Returns true or false.
  const PROPERTIES = {
    'EVEN': [' % 2 == 0', Lua.ORDER_MULTIPLICATIVE, Lua.ORDER_RELATIONAL],
    'ODD': [' % 2 == 1', Lua.ORDER_MULTIPLICATIVE, Lua.ORDER_RELATIONAL],
    'WHOLE': [' % 1 == 0', Lua.ORDER_MULTIPLICATIVE, Lua.ORDER_RELATIONAL],
    'POSITIVE': [' > 0', Lua.ORDER_RELATIONAL, Lua.ORDER_RELATIONAL],
    'NEGATIVE': [' < 0', Lua.ORDER_RELATIONAL, Lua.ORDER_RELATIONAL],
    'DIVISIBLE_BY': [null, Lua.ORDER_MULTIPLICATIVE, Lua.ORDER_RELATIONAL],
    'PRIME': [null, Lua.ORDER_NONE, Lua.ORDER_HIGH],
  };
  const dropdownProperty = block.getFieldValue('PROPERTY');
  const [suffix, inputOrder, outputOrder] = PROPERTIES[dropdownProperty];
  const numberToCheck = Lua.valueToCode(block, 'NUMBER_TO_CHECK',
      inputOrder) || '0';
  let code;
  if (dropdownProperty === 'PRIME') {
    // Prime is a special case as it is not a one-liner test.
    const functionName = Lua.provideFunction_('math_isPrime', `
function ${Lua.FUNCTION_NAME_PLACEHOLDER_}(n)
  -- https://en.wikipedia.org/wiki/Primality_test#Naive_methods
  if n == 2 or n == 3 then
    return true
  end
  -- False if n is NaN, negative, is 1, or not whole.
  -- And false if n is divisible by 2 or 3.
  if not(n > 1) or n % 1 ~= 0 or n % 2 == 0 or n % 3 == 0 then
    return false
  end
  -- Check all the numbers of form 6k +/- 1, up to sqrt(n).
  for x = 6, math.sqrt(n) + 1.5, 6 do
    if n % (x - 1) == 0 or n % (x + 1) == 0 then
      return false
    end
  end
  return true
end
`);
    code = functionName + '(' + numberToCheck + ')';
  } else if (dropdownProperty === 'DIVISIBLE_BY') {
    const divisor = Lua.valueToCode(block, 'DIVISOR',
        Lua.ORDER_MULTIPLICATIVE) || '0';
    // If 'divisor' is some code that evals to 0, Lua will produce a nan.
    // Let's produce nil if we can determine this at compile-time.
    if (divisor === '0') {
      return ['nil', Lua.ORDER_ATOMIC];
    }
    // The normal trick to implement ?: with and/or doesn't work here:
    //   divisor == 0 and nil or number_to_check % divisor == 0
    // because nil is false, so allow a runtime failure. :-(
    code = numberToCheck + ' % ' + divisor + ' == 0';
  } else {
    code = numberToCheck + suffix;
  }
  return [code, outputOrder];
};

Lua['math_change'] = function(block) {
  // Add to a variable in place.
  const argument0 = Lua.valueToCode(block, 'DELTA', Lua.ORDER_ADDITIVE) || '0';
  const varName =
      Lua.nameDB_.getName(block.getFieldValue('VAR'), NameType.VARIABLE);
  return varName + ' = ' + varName + ' + ' + argument0 + '\n';
};

// Rounding functions have a single operand.
Lua['math_round'] = Lua['math_single'];
// Trigonometry functions have a single operand.
Lua['math_trig'] = Lua['math_single'];

Lua['math_on_list'] = function(block) {
  // Math functions for lists.
  const func = block.getFieldValue('OP');
  const list = Lua.valueToCode(block, 'LIST', Lua.ORDER_NONE) || '{}';
  let functionName;

  // Functions needed in more than one case.
  function provideSum() {
    return Lua.provideFunction_('math_sum', `
function ${Lua.FUNCTION_NAME_PLACEHOLDER_}(t)
  local result = 0
  for _, v in ipairs(t) do
    result = result + v
  end
  return result
end
`);
  }

  switch (func) {
    case 'SUM':
      functionName = provideSum();
      break;

    case 'MIN':
      // Returns 0 for the empty list.
      functionName = Lua.provideFunction_('math_min', `
function ${Lua.FUNCTION_NAME_PLACEHOLDER_}(t)
  if #t == 0 then
    return 0
  end
  local result = math.huge
  for _, v in ipairs(t) do
    if v < result then
      result = v
    end
  end
  return result
end
`);
      break;

    case 'AVERAGE':
      // Returns 0 for the empty list.
      functionName = Lua.provideFunction_('math_average', `
function ${Lua.FUNCTION_NAME_PLACEHOLDER_}(t)
  if #t == 0 then
    return 0
  end
  return ${provideSum()}(t) / #t
end
`);
      break;

    case 'MAX':
      // Returns 0 for the empty list.
      functionName = Lua.provideFunction_('math_max', `
function ${Lua.FUNCTION_NAME_PLACEHOLDER_}(t)
  if #t == 0 then
    return 0
  end
  local result = -math.huge
  for _, v in ipairs(t) do
    if v > result then
      result = v
    end
  end
  return result
end
`);
      break;

    case 'MEDIAN':
      // This operation excludes non-numbers.
      functionName = Lua.provideFunction_('math_median', `
function ${Lua.FUNCTION_NAME_PLACEHOLDER_}(t)
  -- Source: http://lua-users.org/wiki/SimpleStats
  if #t == 0 then
    return 0
  end
  local temp = {}
  for _, v in ipairs(t) do
    if type(v) == 'number' then
      table.insert(temp, v)
    end
  end
  table.sort(temp)
  if #temp % 2 == 0 then
    return (temp[#temp / 2] + temp[(#temp / 2) + 1]) / 2
  else
    return temp[math.ceil(#temp / 2)]
  end
end
`);
      break;

    case 'MODE':
      // As a list of numbers can contain more than one mode,
      // the returned result is provided as an array.
      // The Lua version includes non-numbers.
      functionName = Lua.provideFunction_('math_modes', `
function ${Lua.FUNCTION_NAME_PLACEHOLDER_}(t)
  -- Source: http://lua-users.org/wiki/SimpleStats
  local counts = {}
  for _, v in ipairs(t) do
    if counts[v] == nil then
      counts[v] = 1
    else
      counts[v] = counts[v] + 1
    end
  end
  local biggestCount = 0
  for _, v  in pairs(counts) do
    if v > biggestCount then
      biggestCount = v
    end
  end
  local temp = {}
  for k, v in pairs(counts) do
    if v == biggestCount then
      table.insert(temp, k)
    end
  end
  return temp
end
`);
      break;

    case 'STD_DEV':
      functionName = Lua.provideFunction_('math_standard_deviation', `
function ${Lua.FUNCTION_NAME_PLACEHOLDER_}(t)
  local m
  local vm
  local total = 0
  local count = 0
  local result
  m = #t == 0 and 0 or ${provideSum()}(t) / #t
  for _, v in ipairs(t) do
    if type(v) == 'number' then
      vm = v - m
      total = total + (vm * vm)
      count = count + 1
    end
  end
  result = math.sqrt(total / (count-1))
  return result
end
`);
      break;

    case 'RANDOM':
      functionName = Lua.provideFunction_('math_random_list', `
function ${Lua.FUNCTION_NAME_PLACEHOLDER_}(t)
  if #t == 0 then
    return nil
  end
  return t[math.random(#t)]
end
`);
      break;

    default:
      throw Error('Unknown operator: ' + func);
  }
  return [functionName + '(' + list + ')', Lua.ORDER_HIGH];
};

Lua['math_modulo'] = function(block) {
  // Remainder computation.
  const argument0 =
      Lua.valueToCode(block, 'DIVIDEND', Lua.ORDER_MULTIPLICATIVE) || '0';
  const argument1 =
      Lua.valueToCode(block, 'DIVISOR', Lua.ORDER_MULTIPLICATIVE) || '0';
  const code = argument0 + ' % ' + argument1;
  return [code, Lua.ORDER_MULTIPLICATIVE];
};

Lua['math_constrain'] = function(block) {
  // Constrain a number between two limits.
  const argument0 = Lua.valueToCode(block, 'VALUE', Lua.ORDER_NONE) || '0';
  const argument1 =
      Lua.valueToCode(block, 'LOW', Lua.ORDER_NONE) || '-math.huge';
  const argument2 =
      Lua.valueToCode(block, 'HIGH', Lua.ORDER_NONE) || 'math.huge';
  const code = 'math.min(math.max(' + argument0 + ', ' + argument1 + '), ' +
      argument2 + ')';
  return [code, Lua.ORDER_HIGH];
};

Lua['math_random_int'] = function(block) {
  // Random integer between [X] and [Y].
  const argument0 = Lua.valueToCode(block, 'FROM', Lua.ORDER_NONE) || '0';
  const argument1 = Lua.valueToCode(block, 'TO', Lua.ORDER_NONE) || '0';
  const code = 'math.random(' + argument0 + ', ' + argument1 + ')';
  return [code, Lua.ORDER_HIGH];
};

Lua['math_random_float'] = function(block) {
  // Random fraction between 0 and 1.
  return ['math.random()', Lua.ORDER_HIGH];
};

Lua['math_atan2'] = function(block) {
  // Arctangent of point (X, Y) in degrees from -180 to 180.
  const argument0 = Lua.valueToCode(block, 'X', Lua.ORDER_NONE) || '0';
  const argument1 = Lua.valueToCode(block, 'Y', Lua.ORDER_NONE) || '0';
  return [
    'math.deg(math.atan2(' + argument1 + ', ' + argument0 + '))', Lua.ORDER_HIGH
  ];
};
