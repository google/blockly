/**
 * @license
 * Copyright 2015 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Generating PHP for math blocks.
 */
'use strict';

goog.module('Blockly.PHP.math');

const PHP = goog.require('Blockly.PHP');
const {NameType} = goog.require('Blockly.Names');


PHP['math_number'] = function(block) {
  // Numeric value.
  let code = Number(block.getFieldValue('NUM'));
  const order = code >= 0 ? PHP.ORDER_ATOMIC : PHP.ORDER_UNARY_NEGATION;
  if (code === Infinity) {
    code = 'INF';
  } else if (code === -Infinity) {
    code = '-INF';
  }
  return [code, order];
};

PHP['math_arithmetic'] = function(block) {
  // Basic arithmetic operators, and power.
  const OPERATORS = {
    'ADD': [' + ', PHP.ORDER_ADDITION],
    'MINUS': [' - ', PHP.ORDER_SUBTRACTION],
    'MULTIPLY': [' * ', PHP.ORDER_MULTIPLICATION],
    'DIVIDE': [' / ', PHP.ORDER_DIVISION],
    'POWER': [' ** ', PHP.ORDER_POWER],
  };
  const tuple = OPERATORS[block.getFieldValue('OP')];
  const operator = tuple[0];
  const order = tuple[1];
  const argument0 = PHP.valueToCode(block, 'A', order) || '0';
  const argument1 = PHP.valueToCode(block, 'B', order) || '0';
  const code = argument0 + operator + argument1;
  return [code, order];
};

PHP['math_single'] = function(block) {
  // Math operators with single operand.
  const operator = block.getFieldValue('OP');
  let code;
  let arg;
  if (operator === 'NEG') {
    // Negation is a special case given its different operator precedence.
    arg = PHP.valueToCode(block, 'NUM', PHP.ORDER_UNARY_NEGATION) || '0';
    if (arg[0] === '-') {
      // --3 is not legal in JS.
      arg = ' ' + arg;
    }
    code = '-' + arg;
    return [code, PHP.ORDER_UNARY_NEGATION];
  }
  if (operator === 'SIN' || operator === 'COS' || operator === 'TAN') {
    arg = PHP.valueToCode(block, 'NUM', PHP.ORDER_DIVISION) || '0';
  } else {
    arg = PHP.valueToCode(block, 'NUM', PHP.ORDER_NONE) || '0';
  }
  // First, handle cases which generate values that don't need parentheses
  // wrapping the code.
  switch (operator) {
    case 'ABS':
      code = 'abs(' + arg + ')';
      break;
    case 'ROOT':
      code = 'sqrt(' + arg + ')';
      break;
    case 'LN':
      code = 'log(' + arg + ')';
      break;
    case 'EXP':
      code = 'exp(' + arg + ')';
      break;
    case 'POW10':
      code = 'pow(10,' + arg + ')';
      break;
    case 'ROUND':
      code = 'round(' + arg + ')';
      break;
    case 'ROUNDUP':
      code = 'ceil(' + arg + ')';
      break;
    case 'ROUNDDOWN':
      code = 'floor(' + arg + ')';
      break;
    case 'SIN':
      code = 'sin(' + arg + ' / 180 * pi())';
      break;
    case 'COS':
      code = 'cos(' + arg + ' / 180 * pi())';
      break;
    case 'TAN':
      code = 'tan(' + arg + ' / 180 * pi())';
      break;
  }
  if (code) {
    return [code, PHP.ORDER_FUNCTION_CALL];
  }
  // Second, handle cases which generate values that may need parentheses
  // wrapping the code.
  switch (operator) {
    case 'LOG10':
      code = 'log(' + arg + ') / log(10)';
      break;
    case 'ASIN':
      code = 'asin(' + arg + ') / pi() * 180';
      break;
    case 'ACOS':
      code = 'acos(' + arg + ') / pi() * 180';
      break;
    case 'ATAN':
      code = 'atan(' + arg + ') / pi() * 180';
      break;
    default:
      throw Error('Unknown math operator: ' + operator);
  }
  return [code, PHP.ORDER_DIVISION];
};

PHP['math_constant'] = function(block) {
  // Constants: PI, E, the Golden Ratio, sqrt(2), 1/sqrt(2), INFINITY.
  const CONSTANTS = {
    'PI': ['M_PI', PHP.ORDER_ATOMIC],
    'E': ['M_E', PHP.ORDER_ATOMIC],
    'GOLDEN_RATIO': ['(1 + sqrt(5)) / 2', PHP.ORDER_DIVISION],
    'SQRT2': ['M_SQRT2', PHP.ORDER_ATOMIC],
    'SQRT1_2': ['M_SQRT1_2', PHP.ORDER_ATOMIC],
    'INFINITY': ['INF', PHP.ORDER_ATOMIC],
  };
  return CONSTANTS[block.getFieldValue('CONSTANT')];
};

PHP['math_number_property'] = function(block) {
  // Check if a number is even, odd, prime, whole, positive, or negative
  // or if it is divisible by certain number. Returns true or false.
  const PROPERTIES = {
    'EVEN': ['', ' % 2 == 0', PHP.ORDER_MODULUS, PHP.ORDER_EQUALITY],
    'ODD': ['', ' % 2 == 1', PHP.ORDER_MODULUS, PHP.ORDER_EQUALITY],
    'WHOLE': ['is_int(', ')', PHP.ORDER_NONE, PHP.ORDER_FUNCTION_CALL],
    'POSITIVE': ['', ' > 0', PHP.ORDER_RELATIONAL, PHP.ORDER_RELATIONAL],
    'NEGATIVE': ['', ' < 0', PHP.ORDER_RELATIONAL, PHP.ORDER_RELATIONAL],
    'DIVISIBLE_BY': [null, null, PHP.ORDER_MODULUS, PHP.ORDER_EQUALITY],
    'PRIME': [null, null, PHP.ORDER_NONE, PHP.ORDER_FUNCTION_CALL],
  };
  const dropdownProperty = block.getFieldValue('PROPERTY');
  const [prefix, suffix, inputOrder, outputOrder] = PROPERTIES[dropdownProperty];
  const numberToCheck = PHP.valueToCode(block, 'NUMBER_TO_CHECK',
      inputOrder) || '0';
  let code;
  if (dropdownProperty === 'PRIME') {
    // Prime is a special case as it is not a one-liner test.
    const functionName = PHP.provideFunction_('math_isPrime', `
function ${PHP.FUNCTION_NAME_PLACEHOLDER_}($n) {
  // https://en.wikipedia.org/wiki/Primality_test#Naive_methods
  if ($n == 2 || $n == 3) {
    return true;
  }
  // False if n is NaN, negative, is 1, or not whole.
  // And false if n is divisible by 2 or 3.
  if (!is_numeric($n) || $n <= 1 || $n % 1 != 0 || $n % 2 == 0 || $n % 3 == 0) {
    return false;
  }
  // Check all the numbers of form 6k +/- 1, up to sqrt(n).
  for ($x = 6; $x <= sqrt($n) + 1; $x += 6) {
    if ($n % ($x - 1) == 0 || $n % ($x + 1) == 0) {
      return false;
    }
  }
  return true;
}
`);
    code = functionName + '(' + numberToCheck + ')';
  } else if (dropdownProperty === 'DIVISIBLE_BY') {
    const divisor = PHP.valueToCode(block, 'DIVISOR',
        PHP.ORDER_MODULUS) || '0';
    if (divisor === '0') {
      return ['false', PHP.ORDER_ATOMIC];

    }
    code = numberToCheck + ' % ' + divisor + ' == 0';
  } else {
    code = prefix + numberToCheck + suffix;
  }
  return [code, outputOrder];
};

PHP['math_change'] = function(block) {
  // Add to a variable in place.
  const argument0 = PHP.valueToCode(block, 'DELTA', PHP.ORDER_ADDITION) || '0';
  const varName =
      PHP.nameDB_.getName(block.getFieldValue('VAR'), NameType.VARIABLE);
  return varName + ' += ' + argument0 + ';\n';
};

// Rounding functions have a single operand.
PHP['math_round'] = PHP['math_single'];
// Trigonometry functions have a single operand.
PHP['math_trig'] = PHP['math_single'];

PHP['math_on_list'] = function(block) {
  // Math functions for lists.
  const func = block.getFieldValue('OP');
  let list;
  let code;
  switch (func) {
    case 'SUM':
      list =
          PHP.valueToCode(block, 'LIST', PHP.ORDER_FUNCTION_CALL) || 'array()';
      code = 'array_sum(' + list + ')';
      break;
    case 'MIN':
      list =
          PHP.valueToCode(block, 'LIST', PHP.ORDER_FUNCTION_CALL) || 'array()';
      code = 'min(' + list + ')';
      break;
    case 'MAX':
      list =
          PHP.valueToCode(block, 'LIST', PHP.ORDER_FUNCTION_CALL) || 'array()';
      code = 'max(' + list + ')';
      break;
    case 'AVERAGE': {
      const functionName = PHP.provideFunction_('math_mean', `
function ${PHP.FUNCTION_NAME_PLACEHOLDER_}($myList) {
  return array_sum($myList) / count($myList);
}
`);
      list = PHP.valueToCode(block, 'LIST', PHP.ORDER_NONE) || 'array()';
      code = functionName + '(' + list + ')';
      break;
    }
    case 'MEDIAN': {
      const functionName = PHP.provideFunction_('math_median', `
function ${PHP.FUNCTION_NAME_PLACEHOLDER_}($arr) {
  sort($arr,SORT_NUMERIC);
  return (count($arr) % 2) ? $arr[floor(count($arr) / 2)] :
      ($arr[floor(count($arr) / 2)] + $arr[floor(count($arr) / 2) - 1]) / 2;
}
`);
      list = PHP.valueToCode(block, 'LIST', PHP.ORDER_NONE) || '[]';
      code = functionName + '(' + list + ')';
      break;
    }
    case 'MODE': {
      // As a list of numbers can contain more than one mode,
      // the returned result is provided as an array.
      // Mode of [3, 'x', 'x', 1, 1, 2, '3'] -> ['x', 1].
      const functionName = PHP.provideFunction_('math_modes', `
function ${PHP.FUNCTION_NAME_PLACEHOLDER_}($values) {
  if (empty($values)) return array();
  $counts = array_count_values($values);
  arsort($counts); // Sort counts in descending order
  $modes = array_keys($counts, current($counts), true);
  return $modes;
}
`);
      list = PHP.valueToCode(block, 'LIST', PHP.ORDER_NONE) || '[]';
      code = functionName + '(' + list + ')';
      break;
    }
    case 'STD_DEV': {
      const functionName = PHP.provideFunction_('math_standard_deviation', `
function ${PHP.FUNCTION_NAME_PLACEHOLDER_}($numbers) {
  $n = count($numbers);
  if (!$n) return null;
  $mean = array_sum($numbers) / count($numbers);
  foreach($numbers as $key => $num) $devs[$key] = pow($num - $mean, 2);
  return sqrt(array_sum($devs) / (count($devs) - 1));
}
`);
      list = PHP.valueToCode(block, 'LIST', PHP.ORDER_NONE) || '[]';
      code = functionName + '(' + list + ')';
      break;
    }
    case 'RANDOM': {
      const functionName = PHP.provideFunction_('math_random_list', `
function ${PHP.FUNCTION_NAME_PLACEHOLDER_}($list) {
  $x = rand(0, count($list)-1);
  return $list[$x];
}
`);
      list = PHP.valueToCode(block, 'LIST', PHP.ORDER_NONE) || '[]';
      code = functionName + '(' + list + ')';
      break;
    }
    default:
      throw Error('Unknown operator: ' + func);
  }
  return [code, PHP.ORDER_FUNCTION_CALL];
};

PHP['math_modulo'] = function(block) {
  // Remainder computation.
  const argument0 =
      PHP.valueToCode(block, 'DIVIDEND', PHP.ORDER_MODULUS) || '0';
  const argument1 = PHP.valueToCode(block, 'DIVISOR', PHP.ORDER_MODULUS) || '0';
  const code = argument0 + ' % ' + argument1;
  return [code, PHP.ORDER_MODULUS];
};

PHP['math_constrain'] = function(block) {
  // Constrain a number between two limits.
  const argument0 = PHP.valueToCode(block, 'VALUE', PHP.ORDER_NONE) || '0';
  const argument1 = PHP.valueToCode(block, 'LOW', PHP.ORDER_NONE) || '0';
  const argument2 =
      PHP.valueToCode(block, 'HIGH', PHP.ORDER_NONE) || 'Infinity';
  const code =
      'min(max(' + argument0 + ', ' + argument1 + '), ' + argument2 + ')';
  return [code, PHP.ORDER_FUNCTION_CALL];
};

PHP['math_random_int'] = function(block) {
  // Random integer between [X] and [Y].
  const argument0 = PHP.valueToCode(block, 'FROM', PHP.ORDER_NONE) || '0';
  const argument1 = PHP.valueToCode(block, 'TO', PHP.ORDER_NONE) || '0';
  const functionName = PHP.provideFunction_('math_random_int', `
function ${PHP.FUNCTION_NAME_PLACEHOLDER_}($a, $b) {
  if ($a > $b) {
    return rand($b, $a);
  }
  return rand($a, $b);
}
`);
  const code = functionName + '(' + argument0 + ', ' + argument1 + ')';
  return [code, PHP.ORDER_FUNCTION_CALL];
};

PHP['math_random_float'] = function(block) {
  // Random fraction between 0 and 1.
  return ['(float)rand()/(float)getrandmax()', PHP.ORDER_FUNCTION_CALL];
};

PHP['math_atan2'] = function(block) {
  // Arctangent of point (X, Y) in degrees from -180 to 180.
  const argument0 = PHP.valueToCode(block, 'X', PHP.ORDER_NONE) || '0';
  const argument1 = PHP.valueToCode(block, 'Y', PHP.ORDER_NONE) || '0';
  return [
    'atan2(' + argument1 + ', ' + argument0 + ') / pi() * 180',
    PHP.ORDER_DIVISION
  ];
};
