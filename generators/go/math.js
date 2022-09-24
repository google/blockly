/**
 * @license
 * Copyright 2015 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Generating Go for math blocks.
 * @author daarond@gmail.com (Daaron Dwyer)
 */
'use strict';

goog.provide('Blockly.Go.math');

goog.require('Blockly.Go');


Blockly.Go['math_number'] = function(block) {
  // Numeric value.
  var code = Number(block.getFieldValue('NUM'));
  var order = code >= 0 ? Blockly.Go.ORDER_ATOMIC :
              Blockly.Go.ORDER_UNARY_NEGATION;
  if (code == Infinity) {
    code = 'INF';
  } else if (code == -Infinity) {
    code = '-INF';
  }
  return [code, order];
};

Blockly.Go['math_arithmetic'] = function(block) {
  // Basic arithmetic operators, and power.
  var OPERATORS = {
    'ADD': [' + ', Blockly.Go.ORDER_ADDITION],
    'MINUS': [' - ', Blockly.Go.ORDER_SUBTRACTION],
    'MULTIPLY': [' * ', Blockly.Go.ORDER_MULTIPLICATION],
    'DIVIDE': [' / ', Blockly.Go.ORDER_DIVISION],
    'POWER': [' ^ ', Blockly.Go.ORDER_POWER]
  };
  var tuple = OPERATORS[block.getFieldValue('OP')];
  var operator = tuple[0];
  var order = tuple[1];
  var argument0 = Blockly.Go.valueToCode(block, 'A', order) || '0';
  var argument1 = Blockly.Go.valueToCode(block, 'B', order) || '0';
  var code = argument0 + operator + argument1;
  return [code, order];
};

Blockly.Go['math_single'] = function(block) {
  // Math operators with single operand.
  var operator = block.getFieldValue('OP');
  var code;
  var arg;
  if (operator == 'NEG') {
    // Negation is a special case given its different operator precedence.
    arg = Blockly.Go.valueToCode(block, 'NUM',
        Blockly.Go.ORDER_UNARY_NEGATION) || '0';
    if (arg[0] == '-') {
      // --3 is not legal in JS.
      arg = ' ' + arg;
    }
    code = '-' + arg;
    return [code, Blockly.Go.ORDER_UNARY_NEGATION];
  }
  if (operator == 'SIN' || operator == 'COS' || operator == 'TAN') {
    arg = Blockly.Go.valueToCode(block, 'NUM',
        Blockly.Go.ORDER_DIVISION) || '0';
  } else {
    arg = Blockly.Go.valueToCode(block, 'NUM',
        Blockly.Go.ORDER_NONE) || '0';
  }
  // First, handle cases which generate values that don't need parentheses
  // wrapping the code.
  switch (operator) {
    case 'ABS':
      code = 'math.Abs(' + arg + ')';
      break;
    case 'ROOT':
      code = 'math.Sqrt(' + arg + ')';
      break;
    case 'LN':
      code = 'math.Log(' + arg + ')';
      break;
    case 'EXP':
      code = 'math.Exp(' + arg + ')';
      break;
    case 'POW10':
      code = 'math.Pow(10,' + arg + ')';
      break;
    case 'ROUND':
      code = 'math.Round(' + arg + ')';
      break;
    case 'ROUNDUP':
      code = 'math.Ceil(' + arg + ')';
      break;
    case 'ROUNDDOWN':
      code = 'math.Floor(' + arg + ')';
      break;
    case 'SIN':
      code = 'math.Sin(' + arg + ' / 180 * pi())';
      break;
    case 'COS':
      code = 'math.Cos(' + arg + ' / 180 * pi())';
      break;
    case 'TAN':
      code = 'math.Tan(' + arg + ' / 180 * pi())';
      break;
  }
  if (code) {
    return [code, Blockly.Go.ORDER_FUNCTION_CALL];
  }
  // Second, handle cases which generate values that may need parentheses
  // wrapping the code.
  switch (operator) {
    case 'LOG10':
      code = 'math.Log10(' + arg + ') / log(10)';
      break;
    case 'ASIN':
      code = 'math.Asin(' + arg + ') / pi() * 180';
      break;
    case 'ACOS':
      code = 'math.Acos(' + arg + ') / pi() * 180';
      break;
    case 'ATAN':
      code = 'math.Atan(' + arg + ') / pi() * 180';
      break;
    default:
      throw Error('Unknown math operator: ' + operator);
  }
  return [code, Blockly.Go.ORDER_DIVISION];
};

Blockly.Go['math_constant'] = function(block) {
  // Constants: PI, E, the Golden Ratio, sqrt(2), 1/sqrt(2), INFINITY.
  var CONSTANTS = {
    'PI': ['math.Pi', Blockly.Go.ORDER_ATOMIC],
    'E': ['math.E', Blockly.Go.ORDER_ATOMIC],
    'GOLDEN_RATIO': ['(1 + math.Sqrt(5)) / 2', Blockly.Go.ORDER_DIVISION],
    'SQRT2': ['M_SQRT2', Blockly.Go.ORDER_ATOMIC],
    'SQRT1_2': ['M_SQRT1_2', Blockly.Go.ORDER_ATOMIC],
    'INFINITY': ['INF', Blockly.Go.ORDER_ATOMIC]
  };
  return CONSTANTS[block.getFieldValue('CONSTANT')];
};

Blockly.Go['math_number_property'] = function(block) {
  // Check if a number is even, odd, prime, whole, positive, or negative
  // or if it is divisible by certain number. Returns true or false.
  var number_to_check = Blockly.Go.valueToCode(block, 'NUMBER_TO_CHECK',
      Blockly.Go.ORDER_MODULUS) || '0';
  var dropdown_property = block.getFieldValue('PROPERTY');
  var code;
  if (dropdown_property == 'PRIME') {
    // Prime is a special case as it is not a one-liner test.
    var functionName = Blockly.Go.provideFunction_(
        'math_isPrime',
        ['func ' + Blockly.Go.FUNCTION_NAME_PLACEHOLDER_ + '($n) {',
         '  // https://en.wikipedia.org/wiki/Primality_test#Naive_methods',
         '  if ($n == 2 || $n == 3) {',
         '    return true',
         '  }',
         '  // False if n is NaN, negative, is 1, or not whole.',
         '  // And false if n is divisible by 2 or 3.',
         '  if (!is_numeric($n) || $n <= 1 || $n % 1 != 0 || $n % 2 == 0 ||' +
            ' $n % 3 == 0) {',
         '    return false',
         '  }',
         '  // Check all the numbers of form 6k +/- 1, up to sqrt(n).',
         '  for ($x = 6; $x <= sqrt($n) + 1; $x += 6) {',
         '    if ($n % ($x - 1) == 0 || $n % ($x + 1) == 0) {',
         '      return false',
         '    }',
         '  }',
         '  return true',
         '}']);
    code = functionName + '(' + number_to_check + ')';
    return [code, Blockly.Go.ORDER_FUNCTION_CALL];
  }
  switch (dropdown_property) {
    case 'EVEN':
      code = number_to_check + ' % 2 == 0';
      break;
    case 'ODD':
      code = number_to_check + ' % 2 == 1';
      break;
    case 'WHOLE':
      code = 'is_int(' + number_to_check + ')';
      break;
    case 'POSITIVE':
      code = number_to_check + ' > 0';
      break;
    case 'NEGATIVE':
      code = number_to_check + ' < 0';
      break;
    case 'DIVISIBLE_BY':
      var divisor = Blockly.Go.valueToCode(block, 'DIVISOR',
          Blockly.Go.ORDER_MODULUS) || '0';
      code = number_to_check + ' % ' + divisor + ' == 0';
      break;
  }
  return [code, Blockly.Go.ORDER_EQUALITY];
};

Blockly.Go['math_change'] = function(block) {
  // Add to a variable in place.
  var argument0 = Blockly.Go.valueToCode(block, 'DELTA',
      Blockly.Go.ORDER_ADDITION) || '0';
  var varName = Blockly.Go.variableDB_.getName(
      block.getFieldValue('VAR'), Blockly.VARIABLE_CATEGORY_NAME);
  return varName + ' += ' + argument0 + '\n';
};

// Rounding functions have a single operand.
Blockly.Go['math_round'] = Blockly.Go['math_single'];
// Trigonometry functions have a single operand.
Blockly.Go['math_trig'] = Blockly.Go['math_single'];

Blockly.Go['math_on_list'] = function(block) {
  // Math functions for lists.
  var func = block.getFieldValue('OP');
  var list, code;
  switch (func) {
    case 'SUM':
      list = Blockly.Go.valueToCode(block, 'LIST',
          Blockly.Go.ORDER_FUNCTION_CALL) || 'array()';
      code = 'array_sum(' + list + ')';
      break;
    case 'MIN':
      list = Blockly.Go.valueToCode(block, 'LIST',
          Blockly.Go.ORDER_FUNCTION_CALL) || 'array()';
      code = 'min(' + list + ')';
      break;
    case 'MAX':
      list = Blockly.Go.valueToCode(block, 'LIST',
          Blockly.Go.ORDER_FUNCTION_CALL) || 'array()';
      code = 'max(' + list + ')';
      break;
    case 'AVERAGE':
      var functionName = Blockly.Go.provideFunction_(
          'math_mean',
          ['func ' + Blockly.Go.FUNCTION_NAME_PLACEHOLDER_ +
              '($myList) {',
           '  return array_sum($myList) / count($myList)',
           '}']);
      list = Blockly.Go.valueToCode(block, 'LIST',
          Blockly.Go.ORDER_NONE) || 'array()';
      code = functionName + '(' + list + ')';
      break;
    case 'MEDIAN':
      var functionName = Blockly.Go.provideFunction_(
          'math_median',
          ['func ' + Blockly.Go.FUNCTION_NAME_PLACEHOLDER_ +
              '($arr) {',
           '  sort($arr,SORT_NUMERIC)',
           '  return (count($arr) % 2) ? $arr[floor(count($arr)/2)] : ',
           '      ($arr[floor(count($arr)/2)] + $arr[floor(count($arr)/2)' +
              ' - 1]) / 2',
           '}']);
      list = Blockly.Go.valueToCode(block, 'LIST',
          Blockly.Go.ORDER_NONE) || '[]';
      code = functionName + '(' + list + ')';
      break;
    case 'MODE':
      // As a list of numbers can contain more than one mode,
      // the returned result is provided as an array.
      // Mode of [3, 'x', 'x', 1, 1, 2, '3'] -> ['x', 1].
      var functionName = Blockly.Go.provideFunction_(
          'math_modes',
          ['func ' + Blockly.Go.FUNCTION_NAME_PLACEHOLDER_ +
              '($values) {',
           '  if (empty($values)) return array()',
           '  $counts = array_count_values($values)',
           '  arsort($counts); // Sort counts in descending order',
           '  $modes = array_keys($counts, current($counts), true)',
           '  return $modes',
           '}']);
      list = Blockly.Go.valueToCode(block, 'LIST',
          Blockly.Go.ORDER_NONE) || '[]';
      code = functionName + '(' + list + ')';
      break;
    case 'STD_DEV':
      var functionName = Blockly.Go.provideFunction_(
          'math_standard_deviation',
          ['func ' + Blockly.Go.FUNCTION_NAME_PLACEHOLDER_ +
              '($numbers) {',
           '  $n = count($numbers)',
           '  if (!$n) return null',
           '  $mean = array_sum($numbers) / count($numbers)',
           '  foreach($numbers as $key => $num) $devs[$key] = ' +
              'pow($num - $mean, 2)',
           '  return sqrt(array_sum($devs) / (count($devs) - 1))',
           '}']);
      list = Blockly.Go.valueToCode(block, 'LIST',
              Blockly.Go.ORDER_NONE) || '[]';
      code = functionName + '(' + list + ')';
      break;
    case 'RANDOM':
      var functionName = Blockly.Go.provideFunction_(
          'math_random_list',
          ['func ' + Blockly.Go.FUNCTION_NAME_PLACEHOLDER_ +
              '($list) {',
           '  $x = rand(0, count($list)-1)',
           '  return $list[$x]',
           '}']);
      list = Blockly.Go.valueToCode(block, 'LIST',
          Blockly.Go.ORDER_NONE) || '[]';
      code = functionName + '(' + list + ')';
      break;
    default:
      throw Error('Unknown operator: ' + func);
  }
  return [code, Blockly.Go.ORDER_FUNCTION_CALL];
};

Blockly.Go['math_modulo'] = function(block) {
  // Remainder computation.
  var argument0 = Blockly.Go.valueToCode(block, 'DIVIDEND',
      Blockly.Go.ORDER_MODULUS) || '0';
  var argument1 = Blockly.Go.valueToCode(block, 'DIVISOR',
      Blockly.Go.ORDER_MODULUS) || '0';
  var code = argument0 + ' % ' + argument1;
  return [code, Blockly.Go.ORDER_MODULUS];
};

Blockly.Go['math_constrain'] = function(block) {
  // Constrain a number between two limits.
  var argument0 = Blockly.Go.valueToCode(block, 'VALUE',
      Blockly.Go.ORDER_COMMA) || '0';
  var argument1 = Blockly.Go.valueToCode(block, 'LOW',
      Blockly.Go.ORDER_COMMA) || '0';
  var argument2 = Blockly.Go.valueToCode(block, 'HIGH',
      Blockly.Go.ORDER_COMMA) || 'Infinity';
  var code = 'min(max(' + argument0 + ', ' + argument1 + '), ' +
      argument2 + ')';
  return [code, Blockly.Go.ORDER_FUNCTION_CALL];
};

Blockly.Go['math_random_int'] = function(block) {
  // Random integer between [X] and [Y].
  var argument0 = Blockly.Go.valueToCode(block, 'FROM',
      Blockly.Go.ORDER_COMMA) || '0';
  var argument1 = Blockly.Go.valueToCode(block, 'TO',
      Blockly.Go.ORDER_COMMA) || '0';
  var functionName = Blockly.Go.provideFunction_(
      'math_random_int',
      ['func ' + Blockly.Go.FUNCTION_NAME_PLACEHOLDER_ +
          '($a, $b) {',
       '  if ($a > $b) {',
       '    return rand($b, $a)',
       '  }',
       '  return rand($a, $b)',
       '}']);
  var code = functionName + '(' + argument0 + ', ' + argument1 + ')';
  return [code, Blockly.Go.ORDER_FUNCTION_CALL];
};

Blockly.Go['math_random_float'] = function(block) {
  // Random fraction between 0 and 1.
  return ['(float)rand()/(float)getrandmax()', Blockly.Go.ORDER_FUNCTION_CALL];
};

Blockly.Go['math_atan2'] = function(block) {
  // Arctangent of point (X, Y) in degrees from -180 to 180.
  var argument0 = Blockly.Go.valueToCode(block, 'X',
      Blockly.Go.ORDER_COMMA) || '0';
  var argument1 = Blockly.Go.valueToCode(block, 'Y',
      Blockly.Go.ORDER_COMMA) || '0';
  return ['atan2(' + argument1 + ', ' + argument0 + ') / pi() * 180',
      Blockly.Go.ORDER_DIVISION];
};
