/**
 * @license
 * Copyright 2012 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Generating Python for math blocks.
 */
'use strict';

goog.module('Blockly.Python.math');

const Python = goog.require('Blockly.Python');
const {NameType} = goog.require('Blockly.Names');


// If any new block imports any library, add that library name here.
Python.addReservedWords('math,random,Number');

Python['math_number'] = function(block) {
  // Numeric value.
  let code = Number(block.getFieldValue('NUM'));
  let order;
  if (code === Infinity) {
    code = 'float("inf")';
    order = Python.ORDER_FUNCTION_CALL;
  } else if (code === -Infinity) {
    code = '-float("inf")';
    order = Python.ORDER_UNARY_SIGN;
  } else {
    order = code < 0 ? Python.ORDER_UNARY_SIGN : Python.ORDER_ATOMIC;
  }
  return [code, order];
};

Python['math_arithmetic'] = function(block) {
  // Basic arithmetic operators, and power.
  const OPERATORS = {
    'ADD': [' + ', Python.ORDER_ADDITIVE],
    'MINUS': [' - ', Python.ORDER_ADDITIVE],
    'MULTIPLY': [' * ', Python.ORDER_MULTIPLICATIVE],
    'DIVIDE': [' / ', Python.ORDER_MULTIPLICATIVE],
    'POWER': [' ** ', Python.ORDER_EXPONENTIATION],
  };
  const tuple = OPERATORS[block.getFieldValue('OP')];
  const operator = tuple[0];
  const order = tuple[1];
  const argument0 = Python.valueToCode(block, 'A', order) || '0';
  const argument1 = Python.valueToCode(block, 'B', order) || '0';
  const code = argument0 + operator + argument1;
  return [code, order];
  // In case of 'DIVIDE', division between integers returns different results
  // in Python 2 and 3. However, is not an issue since Blockly does not
  // guarantee identical results in all languages.  To do otherwise would
  // require every operator to be wrapped in a function call.  This would kill
  // legibility of the generated code.
};

Python['math_single'] = function(block) {
  // Math operators with single operand.
  const operator = block.getFieldValue('OP');
  let code;
  let arg;
  if (operator === 'NEG') {
    // Negation is a special case given its different operator precedence.
    code = Python.valueToCode(block, 'NUM', Python.ORDER_UNARY_SIGN) || '0';
    return ['-' + code, Python.ORDER_UNARY_SIGN];
  }
  Python.definitions_['import_math'] = 'import math';
  if (operator === 'SIN' || operator === 'COS' || operator === 'TAN') {
    arg = Python.valueToCode(block, 'NUM', Python.ORDER_MULTIPLICATIVE) || '0';
  } else {
    arg = Python.valueToCode(block, 'NUM', Python.ORDER_NONE) || '0';
  }
  // First, handle cases which generate values that don't need parentheses
  // wrapping the code.
  switch (operator) {
    case 'ABS':
      code = 'math.fabs(' + arg + ')';
      break;
    case 'ROOT':
      code = 'math.sqrt(' + arg + ')';
      break;
    case 'LN':
      code = 'math.log(' + arg + ')';
      break;
    case 'LOG10':
      code = 'math.log10(' + arg + ')';
      break;
    case 'EXP':
      code = 'math.exp(' + arg + ')';
      break;
    case 'POW10':
      code = 'math.pow(10,' + arg + ')';
      break;
    case 'ROUND':
      code = 'round(' + arg + ')';
      break;
    case 'ROUNDUP':
      code = 'math.ceil(' + arg + ')';
      break;
    case 'ROUNDDOWN':
      code = 'math.floor(' + arg + ')';
      break;
    case 'SIN':
      code = 'math.sin(' + arg + ' / 180.0 * math.pi)';
      break;
    case 'COS':
      code = 'math.cos(' + arg + ' / 180.0 * math.pi)';
      break;
    case 'TAN':
      code = 'math.tan(' + arg + ' / 180.0 * math.pi)';
      break;
  }
  if (code) {
    return [code, Python.ORDER_FUNCTION_CALL];
  }
  // Second, handle cases which generate values that may need parentheses
  // wrapping the code.
  switch (operator) {
    case 'ASIN':
      code = 'math.asin(' + arg + ') / math.pi * 180';
      break;
    case 'ACOS':
      code = 'math.acos(' + arg + ') / math.pi * 180';
      break;
    case 'ATAN':
      code = 'math.atan(' + arg + ') / math.pi * 180';
      break;
    default:
      throw Error('Unknown math operator: ' + operator);
  }
  return [code, Python.ORDER_MULTIPLICATIVE];
};

Python['math_constant'] = function(block) {
  // Constants: PI, E, the Golden Ratio, sqrt(2), 1/sqrt(2), INFINITY.
  const CONSTANTS = {
    'PI': ['math.pi', Python.ORDER_MEMBER],
    'E': ['math.e', Python.ORDER_MEMBER],
    'GOLDEN_RATIO': ['(1 + math.sqrt(5)) / 2', Python.ORDER_MULTIPLICATIVE],
    'SQRT2': ['math.sqrt(2)', Python.ORDER_MEMBER],
    'SQRT1_2': ['math.sqrt(1.0 / 2)', Python.ORDER_MEMBER],
    'INFINITY': ['float(\'inf\')', Python.ORDER_ATOMIC],
  };
  const constant = block.getFieldValue('CONSTANT');
  if (constant !== 'INFINITY') {
    Python.definitions_['import_math'] = 'import math';
  }
  return CONSTANTS[constant];
};

Python['math_number_property'] = function(block) {
   // Check if a number is even, odd, prime, whole, positive, or negative
   // or if it is divisible by certain number. Returns true or false.
  const PROPERTIES = {
    'EVEN': [' % 2 == 0', Python.ORDER_MULTIPLICATIVE, Python.ORDER_RELATIONAL],
    'ODD': [' % 2 == 1', Python.ORDER_MULTIPLICATIVE, Python.ORDER_RELATIONAL],
    'WHOLE': [' % 1 == 0', Python.ORDER_MULTIPLICATIVE,
        Python.ORDER_RELATIONAL],
    'POSITIVE': [' > 0', Python.ORDER_RELATIONAL, Python.ORDER_RELATIONAL],
    'NEGATIVE': [' < 0', Python.ORDER_RELATIONAL, Python.ORDER_RELATIONAL],
    'DIVISIBLE_BY': [null, Python.ORDER_MULTIPLICATIVE,
        Python.ORDER_RELATIONAL],
    'PRIME': [null, Python.ORDER_NONE, Python.ORDER_FUNCTION_CALL],
  }
  const dropdownProperty = block.getFieldValue('PROPERTY');
  const [suffix, inputOrder, outputOrder] = PROPERTIES[dropdownProperty];
  const numberToCheck = Python.valueToCode(block, 'NUMBER_TO_CHECK',
      inputOrder) || '0';
  let code;
  if (dropdownProperty === 'PRIME') {
    // Prime is a special case as it is not a one-liner test.
    Python.definitions_['import_math'] = 'import math';
    Python.definitions_['from_numbers_import_Number'] =
        'from numbers import Number';
    const functionName = Python.provideFunction_('math_isPrime', `
def ${Python.FUNCTION_NAME_PLACEHOLDER_}(n):
  # https://en.wikipedia.org/wiki/Primality_test#Naive_methods
  # If n is not a number but a string, try parsing it.
  if not isinstance(n, Number):
    try:
      n = float(n)
    except:
      return False
  if n == 2 or n == 3:
    return True
  # False if n is negative, is 1, or not whole, or if n is divisible by 2 or 3.
  if n <= 1 or n % 1 != 0 or n % 2 == 0 or n % 3 == 0:
    return False
  # Check all the numbers of form 6k +/- 1, up to sqrt(n).
  for x in range(6, int(math.sqrt(n)) + 2, 6):
    if n % (x - 1) == 0 or n % (x + 1) == 0:
      return False
  return True
`);
       code = functionName + '(' + numberToCheck + ')';
  } else if (dropdownProperty === 'DIVISIBLE_BY') {
    const divisor = Python.valueToCode(block, 'DIVISOR',
        Python.ORDER_MULTIPLICATIVE) || '0';
    // If 'divisor' is some code that evals to 0, Python will raise an error.
    if (divisor === '0') {
      return ['False', Python.ORDER_ATOMIC];
    }
    code = numberToCheck + ' % ' + divisor + ' == 0';
  } else {
    code = numberToCheck + suffix;
  };
  return [code, outputOrder];
};

Python['math_change'] = function(block) {
  // Add to a variable in place.
  Python.definitions_['from_numbers_import_Number'] =
      'from numbers import Number';
  const argument0 =
      Python.valueToCode(block, 'DELTA', Python.ORDER_ADDITIVE) || '0';
  const varName =
      Python.nameDB_.getName(block.getFieldValue('VAR'), NameType.VARIABLE);
  return varName + ' = (' + varName + ' if isinstance(' + varName +
      ', Number) else 0) + ' + argument0 + '\n';
};

// Rounding functions have a single operand.
Python['math_round'] = Python['math_single'];
// Trigonometry functions have a single operand.
Python['math_trig'] = Python['math_single'];

Python['math_on_list'] = function(block) {
  // Math functions for lists.
  const func = block.getFieldValue('OP');
  const list = Python.valueToCode(block, 'LIST', Python.ORDER_NONE) || '[]';
  let code;
  switch (func) {
    case 'SUM':
      code = 'sum(' + list + ')';
      break;
    case 'MIN':
      code = 'min(' + list + ')';
      break;
    case 'MAX':
      code = 'max(' + list + ')';
      break;
    case 'AVERAGE': {
      Python.definitions_['from_numbers_import_Number'] =
          'from numbers import Number';
      // This operation excludes null and values that aren't int or float:
      // math_mean([null, null, "aString", 1, 9]) -> 5.0
      const functionName = Python.provideFunction_('math_mean', `
def ${Python.FUNCTION_NAME_PLACEHOLDER_}(myList):
  localList = [e for e in myList if isinstance(e, Number)]
  if not localList: return
  return float(sum(localList)) / len(localList)
`);
      code = functionName + '(' + list + ')';
      break;
    }
    case 'MEDIAN': {
      Python.definitions_['from_numbers_import_Number'] =
          'from numbers import Number';
      // This operation excludes null values:
      // math_median([null, null, 1, 3]) -> 2.0
      const functionName = Python.provideFunction_( 'math_median', `
def ${Python.FUNCTION_NAME_PLACEHOLDER_}(myList):
  localList = sorted([e for e in myList if isinstance(e, Number)])
  if not localList: return
  if len(localList) % 2 == 0:
    return (localList[len(localList) // 2 - 1] + localList[len(localList) // 2]) / 2.0
  else:
    return localList[(len(localList) - 1) // 2]
`);
      code = functionName + '(' + list + ')';
      break;
    }
    case 'MODE': {
      // As a list of numbers can contain more than one mode,
      // the returned result is provided as an array.
      // Mode of [3, 'x', 'x', 1, 1, 2, '3'] -> ['x', 1]
      const functionName = Python.provideFunction_('math_modes', `
def ${Python.FUNCTION_NAME_PLACEHOLDER_}(some_list):
  modes = []
  # Using a lists of [item, count] to keep count rather than dict
  # to avoid "unhashable" errors when the counted item is itself a list or dict.
  counts = []
  maxCount = 1
  for item in some_list:
    found = False
    for count in counts:
      if count[0] == item:
        count[1] += 1
        maxCount = max(maxCount, count[1])
        found = True
    if not found:
      counts.append([item, 1])
  for counted_item, item_count in counts:
    if item_count == maxCount:
      modes.append(counted_item)
  return modes
`);
      code = functionName + '(' + list + ')';
      break;
    }
    case 'STD_DEV': {
      Python.definitions_['import_math'] = 'import math';
      const functionName = Python.provideFunction_('math_standard_deviation', `
def ${Python.FUNCTION_NAME_PLACEHOLDER_}(numbers):
  n = len(numbers)
  if n == 0: return
  mean = float(sum(numbers)) / n
  variance = sum((x - mean) ** 2 for x in numbers) / n
  return math.sqrt(variance)
`);
      code = functionName + '(' + list + ')';
      break;
    }
    case 'RANDOM':
      Python.definitions_['import_random'] = 'import random';
      code = 'random.choice(' + list + ')';
      break;
    default:
      throw Error('Unknown operator: ' + func);
  }
  return [code, Python.ORDER_FUNCTION_CALL];
};

Python['math_modulo'] = function(block) {
  // Remainder computation.
  const argument0 =
      Python.valueToCode(block, 'DIVIDEND', Python.ORDER_MULTIPLICATIVE) || '0';
  const argument1 =
      Python.valueToCode(block, 'DIVISOR', Python.ORDER_MULTIPLICATIVE) || '0';
  const code = argument0 + ' % ' + argument1;
  return [code, Python.ORDER_MULTIPLICATIVE];
};

Python['math_constrain'] = function(block) {
  // Constrain a number between two limits.
  const argument0 =
      Python.valueToCode(block, 'VALUE', Python.ORDER_NONE) || '0';
  const argument1 = Python.valueToCode(block, 'LOW', Python.ORDER_NONE) || '0';
  const argument2 =
      Python.valueToCode(block, 'HIGH', Python.ORDER_NONE) || 'float(\'inf\')';
  const code =
      'min(max(' + argument0 + ', ' + argument1 + '), ' + argument2 + ')';
  return [code, Python.ORDER_FUNCTION_CALL];
};

Python['math_random_int'] = function(block) {
  // Random integer between [X] and [Y].
  Python.definitions_['import_random'] = 'import random';
  const argument0 = Python.valueToCode(block, 'FROM', Python.ORDER_NONE) || '0';
  const argument1 = Python.valueToCode(block, 'TO', Python.ORDER_NONE) || '0';
  const code = 'random.randint(' + argument0 + ', ' + argument1 + ')';
  return [code, Python.ORDER_FUNCTION_CALL];
};

Python['math_random_float'] = function(block) {
  // Random fraction between 0 and 1.
  Python.definitions_['import_random'] = 'import random';
  return ['random.random()', Python.ORDER_FUNCTION_CALL];
};

Python['math_atan2'] = function(block) {
  // Arctangent of point (X, Y) in degrees from -180 to 180.
  Python.definitions_['import_math'] = 'import math';
  const argument0 = Python.valueToCode(block, 'X', Python.ORDER_NONE) || '0';
  const argument1 = Python.valueToCode(block, 'Y', Python.ORDER_NONE) || '0';
  return [
    'math.atan2(' + argument1 + ', ' + argument0 + ') / math.pi * 180',
    Python.ORDER_MULTIPLICATIVE
  ];
};
