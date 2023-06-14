/**
 * @license
 * Copyright 2012 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Generating Python for math blocks.
 */

import * as goog from '../../closure/goog/goog.js';
goog.declareModuleId('Blockly.Python.math');

import {NameType} from '../../core/names.js';
import {pythonGenerator, Order} from '../python.js';


// If any new block imports any library, add that library name here.
pythonGenerator.addReservedWords('math,random,Number');

pythonGenerator.forBlock['math_number'] = function(block) {
  // Numeric value.
  let code = Number(block.getFieldValue('NUM'));
  let order;
  if (code === Infinity) {
    code = 'float("inf")';
    order = Order.FUNCTION_CALL;
  } else if (code === -Infinity) {
    code = '-float("inf")';
    order = Order.UNARY_SIGN;
  } else {
    order = code < 0 ? Order.UNARY_SIGN : Order.ATOMIC;
  }
  return [code, order];
};

pythonGenerator.forBlock['math_arithmetic'] = function(block) {
  // Basic arithmetic operators, and power.
  const OPERATORS = {
    'ADD': [' + ', Order.ADDITIVE],
    'MINUS': [' - ', Order.ADDITIVE],
    'MULTIPLY': [' * ', Order.MULTIPLICATIVE],
    'DIVIDE': [' / ', Order.MULTIPLICATIVE],
    'POWER': [' ** ', Order.EXPONENTIATION],
  };
  const tuple = OPERATORS[block.getFieldValue('OP')];
  const operator = tuple[0];
  const order = tuple[1];
  const argument0 = pythonGenerator.valueToCode(block, 'A', order) || '0';
  const argument1 = pythonGenerator.valueToCode(block, 'B', order) || '0';
  const code = argument0 + operator + argument1;
  return [code, order];
  // In case of 'DIVIDE', division between integers returns different results
  // in pythonGenerator 2 and 3. However, is not an issue since Blockly does not
  // guarantee identical results in all languages.  To do otherwise would
  // require every operator to be wrapped in a function call.  This would kill
  // legibility of the generated code.
};

pythonGenerator.forBlock['math_single'] = function(block) {
  // Math operators with single operand.
  const operator = block.getFieldValue('OP');
  let code;
  let arg;
  if (operator === 'NEG') {
    // Negation is a special case given its different operator precedence.
    code = pythonGenerator.valueToCode(block, 'NUM', Order.UNARY_SIGN) || '0';
    return ['-' + code, Order.UNARY_SIGN];
  }
  pythonGenerator.definitions_['import_math'] = 'import math';
  if (operator === 'SIN' || operator === 'COS' || operator === 'TAN') {
    arg =
        pythonGenerator.valueToCode(block, 'NUM', Order.MULTIPLICATIVE) || '0';
  } else {
    arg = pythonGenerator.valueToCode(block, 'NUM', Order.NONE) || '0';
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
    return [code, Order.FUNCTION_CALL];
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
  return [code, Order.MULTIPLICATIVE];
};

pythonGenerator.forBlock['math_constant'] = function(block) {
  // Constants: PI, E, the Golden Ratio, sqrt(2), 1/sqrt(2), INFINITY.
  const CONSTANTS = {
    'PI': ['math.pi', Order.MEMBER],
    'E': ['math.e', Order.MEMBER],
    'GOLDEN_RATIO': ['(1 + math.sqrt(5)) / 2', Order.MULTIPLICATIVE],
    'SQRT2': ['math.sqrt(2)', Order.MEMBER],
    'SQRT1_2': ['math.sqrt(1.0 / 2)', Order.MEMBER],
    'INFINITY': ['float(\'inf\')', Order.ATOMIC],
  };
  const constant = block.getFieldValue('CONSTANT');
  if (constant !== 'INFINITY') {
    pythonGenerator.definitions_['import_math'] = 'import math';
  }
  return CONSTANTS[constant];
};

pythonGenerator.forBlock['math_number_property'] = function(block) {
   // Check if a number is even, odd, prime, whole, positive, or negative
   // or if it is divisible by certain number. Returns true or false.
  const PROPERTIES = {
    'EVEN': [' % 2 == 0', Order.MULTIPLICATIVE, Order.RELATIONAL],
    'ODD': [' % 2 == 1', Order.MULTIPLICATIVE, Order.RELATIONAL],
    'WHOLE': [' % 1 == 0', Order.MULTIPLICATIVE,
        Order.RELATIONAL],
    'POSITIVE': [' > 0', Order.RELATIONAL, Order.RELATIONAL],
    'NEGATIVE': [' < 0', Order.RELATIONAL, Order.RELATIONAL],
    'DIVISIBLE_BY': [null, Order.MULTIPLICATIVE,
        Order.RELATIONAL],
    'PRIME': [null, Order.NONE, Order.FUNCTION_CALL],
  }
  const dropdownProperty = block.getFieldValue('PROPERTY');
  const [suffix, inputOrder, outputOrder] = PROPERTIES[dropdownProperty];
  const numberToCheck = pythonGenerator.valueToCode(block, 'NUMBER_TO_CHECK',
      inputOrder) || '0';
  let code;
  if (dropdownProperty === 'PRIME') {
    // Prime is a special case as it is not a one-liner test.
    pythonGenerator.definitions_['import_math'] = 'import math';
    pythonGenerator.definitions_['from_numbers_import_Number'] =
        'from numbers import Number';
    const functionName = pythonGenerator.provideFunction_('math_isPrime', `
def ${pythonGenerator.FUNCTION_NAME_PLACEHOLDER_}(n):
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
    const divisor = pythonGenerator.valueToCode(block, 'DIVISOR',
        Order.MULTIPLICATIVE) || '0';
    // If 'divisor' is some code that evals to 0, pythonGenerator will raise an error.
    if (divisor === '0') {
      return ['False', Order.ATOMIC];
    }
    code = numberToCheck + ' % ' + divisor + ' == 0';
  } else {
    code = numberToCheck + suffix;
  };
  return [code, outputOrder];
};

pythonGenerator.forBlock['math_change'] = function(block) {
  // Add to a variable in place.
  pythonGenerator.definitions_['from_numbers_import_Number'] =
      'from numbers import Number';
  const argument0 =
      pythonGenerator.valueToCode(block, 'DELTA', Order.ADDITIVE) || '0';
  const varName =
      pythonGenerator.nameDB_.getName(
        block.getFieldValue('VAR'), NameType.VARIABLE);
  return varName + ' = (' + varName + ' if isinstance(' + varName +
      ', Number) else 0) + ' + argument0 + '\n';
};

// Rounding functions have a single operand.
pythonGenerator.forBlock['math_round'] =
    pythonGenerator.forBlock['math_single'];
// Trigonometry functions have a single operand.
pythonGenerator.forBlock['math_trig'] =
    pythonGenerator.forBlock['math_single'];

pythonGenerator.forBlock['math_on_list'] = function(block) {
  // Math functions for lists.
  const func = block.getFieldValue('OP');
  const list = pythonGenerator.valueToCode(block, 'LIST', Order.NONE) || '[]';
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
      pythonGenerator.definitions_['from_numbers_import_Number'] =
          'from numbers import Number';
      // This operation excludes null and values that aren't int or float:
      // math_mean([null, null, "aString", 1, 9]) -> 5.0
      const functionName = pythonGenerator.provideFunction_('math_mean', `
def ${pythonGenerator.FUNCTION_NAME_PLACEHOLDER_}(myList):
  localList = [e for e in myList if isinstance(e, Number)]
  if not localList: return
  return float(sum(localList)) / len(localList)
`);
      code = functionName + '(' + list + ')';
      break;
    }
    case 'MEDIAN': {
      pythonGenerator.definitions_['from_numbers_import_Number'] =
          'from numbers import Number';
      // This operation excludes null values:
      // math_median([null, null, 1, 3]) -> 2.0
      const functionName = pythonGenerator.provideFunction_( 'math_median', `
def ${pythonGenerator.FUNCTION_NAME_PLACEHOLDER_}(myList):
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
      const functionName = pythonGenerator.provideFunction_('math_modes', `
def ${pythonGenerator.FUNCTION_NAME_PLACEHOLDER_}(some_list):
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
      pythonGenerator.definitions_['import_math'] = 'import math';
      const functionName =
          pythonGenerator.provideFunction_('math_standard_deviation', `
def ${pythonGenerator.FUNCTION_NAME_PLACEHOLDER_}(numbers):
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
      pythonGenerator.definitions_['import_random'] = 'import random';
      code = 'random.choice(' + list + ')';
      break;
    default:
      throw Error('Unknown operator: ' + func);
  }
  return [code, Order.FUNCTION_CALL];
};

pythonGenerator.forBlock['math_modulo'] = function(block) {
  // Remainder computation.
  const argument0 =
      pythonGenerator.valueToCode(block, 'DIVIDEND', Order.MULTIPLICATIVE) ||
      '0';
  const argument1 =
      pythonGenerator.valueToCode(block, 'DIVISOR', Order.MULTIPLICATIVE) ||
      '0';
  const code = argument0 + ' % ' + argument1;
  return [code, Order.MULTIPLICATIVE];
};

pythonGenerator.forBlock['math_constrain'] = function(block) {
  // Constrain a number between two limits.
  const argument0 =
      pythonGenerator.valueToCode(block, 'VALUE', Order.NONE) || '0';
  const argument1 =
      pythonGenerator.valueToCode(block, 'LOW', Order.NONE) || '0';
  const argument2 =
      pythonGenerator.valueToCode(block, 'HIGH', Order.NONE) ||
      'float(\'inf\')';
  const code =
      'min(max(' + argument0 + ', ' + argument1 + '), ' + argument2 + ')';
  return [code, Order.FUNCTION_CALL];
};

pythonGenerator.forBlock['math_random_int'] = function(block) {
  // Random integer between [X] and [Y].
  pythonGenerator.definitions_['import_random'] = 'import random';
  const argument0 =
      pythonGenerator.valueToCode(block, 'FROM', Order.NONE) || '0';
  const argument1 =
      pythonGenerator.valueToCode(block, 'TO', Order.NONE) || '0';
  const code = 'random.randint(' + argument0 + ', ' + argument1 + ')';
  return [code, Order.FUNCTION_CALL];
};

pythonGenerator.forBlock['math_random_float'] = function(block) {
  // Random fraction between 0 and 1.
  pythonGenerator.definitions_['import_random'] = 'import random';
  return ['random.random()', Order.FUNCTION_CALL];
};

pythonGenerator.forBlock['math_atan2'] = function(block) {
  // Arctangent of point (X, Y) in degrees from -180 to 180.
  pythonGenerator.definitions_['import_math'] = 'import math';
  const argument0 = pythonGenerator.valueToCode(block, 'X', Order.NONE) || '0';
  const argument1 = pythonGenerator.valueToCode(block, 'Y', Order.NONE) || '0';
  return [
    'math.atan2(' + argument1 + ', ' + argument0 + ') / math.pi * 180',
    Order.MULTIPLICATIVE
  ];
};
