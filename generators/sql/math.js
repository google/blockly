/**
 * @license
 * Visual Blocks Language
 *
 * Copyright 2015 Google Inc.
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
 * @fileoverview Generating PHP for math blocks.
 * @author daarond@gmail.com (Daaron Dwyer)
 */
'use strict';

goog.provide('Blockly.SQL.math');

goog.require('Blockly.SQL');


Blockly.SQL['math_number'] = function(block) {
  // Numeric value.
  var code = parseFloat(block.getFieldValue('NUM'));
  if (code == Infinity) {
    code = 'INF';
  } else if (code == -Infinity) {
    code = '-INF';
  }
  return [code, Blockly.SQL.ORDER_ATOMIC];
};

Blockly.SQL['math_arithmetic'] = function(block) {
  // Basic arithmetic operators, and power.
  var OPERATORS = {
    'ADD': [' + ', Blockly.SQL.ORDER_ADDITION],
    'MINUS': [' - ', Blockly.SQL.ORDER_SUBTRACTION],
    'MULTIPLY': [' * ', Blockly.SQL.ORDER_MULTIPLICATION],
    'DIVIDE': [' / ', Blockly.SQL.ORDER_DIVISION],
    'POWER': [null, Blockly.SQL.ORDER_COMMA]  // Handle power separately.
  };
  var tuple = OPERATORS[block.getFieldValue('OP')];
  var operator = tuple[0];
  var order = tuple[1];
  var argument0 = Blockly.SQL.valueToCode(block, 'A', order) || '0';
  var argument1 = Blockly.SQL.valueToCode(block, 'B', order) || '0';
  var code;
  // Power in SQL requires a special case since it has no operator.
  if (!operator) {
    code = 'POW(' + argument0 + ', ' + argument1 + ')';
    return [code, Blockly.SQL.ORDER_FUNCTION_CALL];
  }
  code = argument0 + operator + argument1;
  return [code, order];
};

Blockly.SQL['math_single'] = function(block) {
  // Math operators with single operand.
  var operator = block.getFieldValue('OP');
  var code;
  var arg;
  if (operator == 'NEG') {
    // Negation is a special case given its different operator precedence.
    arg = Blockly.SQL.valueToCode(block, 'NUM',
        Blockly.SQL.ORDER_UNARY_NEGATION) || '0';
    if (arg[0] == '-') {
      // --3 is not legal in JS.
      arg = ' ' + arg;
    }
    code = '-' + arg;
    return [code, Blockly.SQL.ORDER_UNARY_NEGATION];
  }
  if (operator == 'SIN' || operator == 'COS' || operator == 'TAN') {
    arg = Blockly.SQL.valueToCode(block, 'NUM',
        Blockly.SQL.ORDER_DIVISION) || '0';
  } else {
    arg = Blockly.SQL.valueToCode(block, 'NUM',
        Blockly.SQL.ORDER_NONE) || '0';
  }
  // First, handle cases which generate values that don't need parentheses
  // wrapping the code.
  switch (operator) {
    case 'ABS':
      code = 'ABS(' + arg + ')';
      break;
    case 'ROOT':
      code = 'SQRT(' + arg + ')';
      break;
    case 'LN':
      code = 'LN(' + arg + ')';
      break;
    case 'EXP':
      code = 'EXP(' + arg + ')';
      break;
    case 'POW10':
      code = 'POW(10,' + arg + ')';
      break;
    case 'ROUND':
      code = 'ROUND(' + arg + ')';
      break;
    case 'ROUNDUP':
      code = 'CEIL(' + arg + ')';
      break;
    case 'ROUNDDOWN':
      code = 'FLOOR(' + arg + ')';
      break;
    case 'SIN':
      code = 'SIN(' + arg + ' / 180 * pi())';
      break;
    case 'COS':
      code = 'COS(' + arg + ' / 180 * pi())';
      break;
    case 'TAN':
      code = 'TAN(' + arg + ' / 180 * pi())';
      break;
    case 'LOG10':
      code = 'LOG10(' + arg + ')';
      break;
  }
  if (code) {
    return [code, Blockly.SQL.ORDER_FUNCTION_CALL];
  }
  // Second, handle cases which generate values that may need parentheses
  // wrapping the code.
  switch (operator) {
    case 'ASIN':
      code = 'ASIN(' + arg + ') / pi() * 180';
      break;
    case 'ACOS':
      code = 'ACOS(' + arg + ') / pi() * 180';
      break;
    case 'ATAN':
      code = 'ATAN(' + arg + ') / pi() * 180';
      break;
    default:
      throw 'Unknown math operator: ' + operator;
  }
  return [code, Blockly.SQL.ORDER_DIVISION];
};

Blockly.SQL['math_constant'] = function(block) {
  // Constants: PI, E, the Golden Ratio, sqrt(2), 1/sqrt(2), INFINITY.
  var CONSTANTS = {
    'PI': ['PI()', Blockly.SQL.ORDER_ATOMIC],
    'E': ['EXP(1)', Blockly.SQL.ORDER_ATOMIC],
    'GOLDEN_RATIO': ['(1 + SQRT(5)) / 2', Blockly.SQL.ORDER_DIVISION],
    'SQRT2': ['SQRT(2)', Blockly.SQL.ORDER_ATOMIC],
    'SQRT1_2': ['1/SQRT(2)', Blockly.SQL.ORDER_ATOMIC],
    'INFINITY': ['INF', Blockly.SQL.ORDER_ATOMIC]
  };
  return CONSTANTS[block.getFieldValue('CONSTANT')];
};

Blockly.SQL['math_number_property'] = function(block) {
  // Check if a number is even, odd, prime, whole, positive, or negative
  // or if it is divisible by certain number. Returns true or false.
  var number_to_check = Blockly.SQL.valueToCode(block, 'NUMBER_TO_CHECK',
      Blockly.SQL.ORDER_MODULUS) || '0';
  var dropdown_property = block.getFieldValue('PROPERTY');
  var code;
  if (dropdown_property == 'PRIME') {
    // Prime is a special case as it is not a one-liner test.
    var functionName = Blockly.SQL.provideFunction_(
        'math_isPrime',
        [ 'function ' + Blockly.SQL.FUNCTION_NAME_PLACEHOLDER_ + '($n) {',
          '  // https://en.wikipedia.org/wiki/Primality_test#Naive_methods',
          '  if ($n == 2 || $n == 3) {',
          '    return true;',
          '  }',
          '  // False if n is NaN, negative, is 1, or not whole.',
          '  // And false if n is divisible by 2 or 3.',
          '  if (!is_numeric($n) || $n <= 1 || $n % 1 != 0 || $n % 2 == 0 ||' +
          ' $n % 3 == 0) {',
          '    return false;',
          '  }',
          '  // Check all the numbers of form 6k +/- 1, up to sqrt(n).',
          '  for ($x = 6; $x <= sqrt($n) + 1; $x += 6) {',
          '    if ($n % ($x - 1) == 0 || $n % ($x + 1) == 0) {',
          '      return false;',
          '    }',
          '  }',
          '  return true;',
          '}']);
    code = functionName + '(' + number_to_check + ')';
    return [code, Blockly.JavaScript.ORDER_FUNCTION_CALL];
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
      var divisor = Blockly.SQL.valueToCode(block, 'DIVISOR',
          Blockly.SQL.ORDER_MODULUS) || '0';
      code = number_to_check + ' % ' + divisor + ' == 0';
      break;
  }
  return [code, Blockly.SQL.ORDER_EQUALITY];
};

Blockly.SQL['math_change'] = function(block) {
  // Add to a variable in place.
  var argument0 = Blockly.SQL.valueToCode(block, 'DELTA',
      Blockly.SQL.ORDER_ADDITION) || '0';
  var varName = Blockly.SQL.variableDB_.getName(
      block.getFieldValue('VAR'), Blockly.Variables.NAME_TYPE);
  return 'SET ' + varName + ' = ' + varName + '+' + argument0 + ';\n';
};

// Rounding functions have a single operand.
Blockly.SQL['math_round'] = Blockly.SQL['math_single'];
// Trigonometry functions have a single operand.
Blockly.SQL['math_trig'] = Blockly.SQL['math_single'];

Blockly.SQL['math_on_list'] = function(block) {
  // Math functions for lists.
  var func = block.getFieldValue('OP');
  var list, code;
  switch (func) {
    case 'SUM':
      list = Blockly.SQL.valueToCode(block, 'LIST',
          Blockly.SQL.ORDER_FUNCTION_CALL) || 'array()';
      code = 'array_sum(' + list + ')';
      break;
    case 'MIN':
      list = Blockly.SQL.valueToCode(block, 'LIST',
          Blockly.SQL.ORDER_FUNCTION_CALL) || 'array()';
      code = 'min(' + list + ')';
      break;
    case 'MAX':
      list = Blockly.SQL.valueToCode(block, 'LIST',
          Blockly.SQL.ORDER_FUNCTION_CALL) || 'array()';
      code = 'max(' + list + ')';
      break;
    case 'AVERAGE':
      var functionName = Blockly.SQL.provideFunction_(
          'math_mean',
          [ 'function ' + Blockly.SQL.FUNCTION_NAME_PLACEHOLDER_ +
              '($myList) {',
            '  return array_sum($myList) / count($myList);',
            '}']);
      list = Blockly.SQL.valueToCode(block, 'LIST',
          Blockly.SQL.ORDER_NONE) || 'array()';
      code = functionName + '(' + list + ')';
      break;
    case 'MEDIAN':
      var functionName = Blockly.SQL.provideFunction_(
          'math_median',
          [ 'function ' + Blockly.SQL.FUNCTION_NAME_PLACEHOLDER_ +
              '($arr) {',
            '  sort($arr,SORT_NUMERIC);',
            '  return (count($arr) % 2) ? $arr[floor(count($arr)/2)] : ',
            '      ($arr[floor(count($arr)/2)] + $arr[floor(count($arr)/2) - 1]) / 2;',
            '}']);
      list = Blockly.SQL.valueToCode(block, 'LIST',
          Blockly.SQL.ORDER_NONE) || '[]';
      code = functionName + '(' + list + ')';
      break;
    case 'MODE':
      // As a list of numbers can contain more than one mode,
      // the returned result is provided as an array.
      // Mode of [3, 'x', 'x', 1, 1, 2, '3'] -> ['x', 1].
      var functionName = Blockly.SQL.provideFunction_(
          'math_modes',
          [ 'function ' + Blockly.SQL.FUNCTION_NAME_PLACEHOLDER_ +
              '($values) {',
            '  $v = array_count_values($values);',
            '  arsort($v);',
            '  foreach($v as $k => $v){$total = $k; break;}',
            '  return array($total);',
            '}']);
      list = Blockly.SQL.valueToCode(block, 'LIST',
          Blockly.SQL.ORDER_NONE) || '[]';
      code = functionName + '(' + list + ')';
      break;
    case 'STD_DEV':
      var functionName = Blockly.SQL.provideFunction_(
          'math_standard_deviation',
          [ 'function ' + Blockly.SQL.FUNCTION_NAME_PLACEHOLDER_ +
          '($numbers) {',
            '  $n = count($numbers);',
            '  if (!$n) return null;',
            '  $mean = array_sum($numbers) / count($numbers);',
            '  foreach($numbers as $key => $num) $devs[$key] = pow($num - $mean, 2);',
            '  return sqrt(array_sum($devs) / (count($devs) - 1));',
            '}']);
      list = Blockly.SQL.valueToCode(block, 'LIST',
              Blockly.SQL.ORDER_NONE) || '[]';
      code = functionName + '(' + list + ')';
      break;
    case 'RANDOM':
      var functionName = Blockly.SQL.provideFunction_(
          'math_random_list',
          [ 'function ' + Blockly.SQL.FUNCTION_NAME_PLACEHOLDER_ +
              '($list) {',
            '  $x = rand(0, count($list)-1);',
            '  return $list[$x];',
            '}']);
      list = Blockly.SQL.valueToCode(block, 'LIST',
          Blockly.SQL.ORDER_NONE) || '[]';
      code = functionName + '(' + list + ')';
      break;
    default:
      throw 'Unknown operator: ' + func;
  }
  return [code, Blockly.SQL.ORDER_FUNCTION_CALL];
};

Blockly.SQL['math_modulo'] = function(block) {
  // Remainder computation.
  var argument0 = Blockly.SQL.valueToCode(block, 'DIVIDEND',
      Blockly.SQL.ORDER_MODULUS) || '0';
  var argument1 = Blockly.SQL.valueToCode(block, 'DIVISOR',
      Blockly.SQL.ORDER_MODULUS) || '0';
  var code = argument0 + ' % ' + argument1;
  return [code, Blockly.SQL.ORDER_MODULUS];
};

Blockly.SQL['math_constrain'] = function(block) {
  // Constrain a number between two limits.
  var argument0 = Blockly.SQL.valueToCode(block, 'VALUE',
      Blockly.SQL.ORDER_COMMA) || '0';
  var argument1 = Blockly.SQL.valueToCode(block, 'LOW',
      Blockly.SQL.ORDER_COMMA) || '0';
  var argument2 = Blockly.SQL.valueToCode(block, 'HIGH',
      Blockly.SQL.ORDER_COMMA) || 'Infinity';
  var code = 'min(max(' + argument0 + ', ' + argument1 + '), ' +
      argument2 + ')';
  return [code, Blockly.SQL.ORDER_FUNCTION_CALL];
};

Blockly.SQL['math_random_int'] = function(block) {
  // Random integer between [X] and [Y].
  var argument0 = Blockly.SQL.valueToCode(block, 'FROM',
      Blockly.SQL.ORDER_COMMA) || '0';
  var argument1 = Blockly.SQL.valueToCode(block, 'TO',
      Blockly.SQL.ORDER_COMMA) || '0';
  var functionName = Blockly.SQL.provideFunction_(
      'math_random_int',
      [ 'function ' + Blockly.SQL.FUNCTION_NAME_PLACEHOLDER_ +
          '($a, $b) {',
        '  if ($a > $b) {',
        '    return rand($b, $a);',
        '  }',
        '  return rand($a, $b);',
        '}']);
  var code = functionName + '(' + argument0 + ', ' + argument1 + ')';
  return [code, Blockly.SQL.ORDER_FUNCTION_CALL];
};

Blockly.SQL['math_random_float'] = function(block) {
  // Random fraction between 0 and 1.
  return ['(float)rand()/(float)getrandmax()', Blockly.SQL.ORDER_FUNCTION_CALL];
};
