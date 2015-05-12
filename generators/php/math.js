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

goog.provide('Blockly.PHP.math');

goog.require('Blockly.PHP');


Blockly.PHP['math_number'] = function(block) {
  // Numeric value.
  var code = parseFloat(block.getFieldValue('NUM'));
  return [code, Blockly.PHP.ORDER_ATOMIC];
};

Blockly.PHP['math_arithmetic'] = function(block) {
  // Basic arithmetic operators, and power.
  var OPERATORS = {
    'ADD': [' + ', Blockly.PHP.ORDER_ADDITION],
    'MINUS': [' - ', Blockly.PHP.ORDER_SUBTRACTION],
    'MULTIPLY': [' * ', Blockly.PHP.ORDER_MULTIPLICATION],
    'DIVIDE': [' / ', Blockly.PHP.ORDER_DIVISION],
    'POWER': [null, Blockly.PHP.ORDER_COMMA]  // Handle power separately.
  };
  var tuple = OPERATORS[block.getFieldValue('OP')];
  var operator = tuple[0];
  var order = tuple[1];
  var argument0 = Blockly.PHP.valueToCode(block, 'A', order) || '0';
  var argument1 = Blockly.PHP.valueToCode(block, 'B', order) || '0';
  var code;
  // Power in PHP requires a special case since it has no operator.
  if (!operator) {
    code = 'Math.pow(' + argument0 + ', ' + argument1 + ')';
    return [code, Blockly.PHP.ORDER_FUNCTION_CALL];
  }
  code = argument0 + operator + argument1;
  return [code, order];
};

Blockly.PHP['math_single'] = function(block) {
  // Math operators with single operand.
  var operator = block.getFieldValue('OP');
  var code;
  var arg;
  if (operator == 'NEG') {
    // Negation is a special case given its different operator precedence.
    arg = Blockly.PHP.valueToCode(block, 'NUM',
        Blockly.PHP.ORDER_UNARY_NEGATION) || '0';
    if (arg[0] == '-') {
      // --3 is not legal in JS.
      arg = ' ' + arg;
    }
    code = '-' + arg;
    return [code, Blockly.PHP.ORDER_UNARY_NEGATION];
  }
  if (operator == 'SIN' || operator == 'COS' || operator == 'TAN') {
    arg = Blockly.PHP.valueToCode(block, 'NUM',
        Blockly.PHP.ORDER_DIVISION) || '0';
  } else {
    arg = Blockly.PHP.valueToCode(block, 'NUM',
        Blockly.PHP.ORDER_NONE) || '0';
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
    return [code, Blockly.PHP.ORDER_FUNCTION_CALL];
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
      throw 'Unknown math operator: ' + operator;
  }
  return [code, Blockly.PHP.ORDER_DIVISION];
};

Blockly.PHP['math_constant'] = function(block) {
  // Constants: PI, E, the Golden Ratio, sqrt(2), 1/sqrt(2), INFINITY.
  var CONSTANTS = {
    'PI': ['pi()', Blockly.PHP.ORDER_FUNCTION_CALL],
    'E': ['exp()', Blockly.PHP.ORDER_FUNCTION_CALL],
    'GOLDEN_RATIO':
        ['(1 + sqrt(5)) / 2', Blockly.PHP.ORDER_DIVISION],
    'SQRT2': ['M_SQRT2', Blockly.PHP.ORDER_ATOMIC],
    'SQRT1_2': ['M_SQRT1_2', Blockly.PHP.ORDER_ATOMIC],
    'INFINITY': ['INF', Blockly.PHP.ORDER_ATOMIC]
  };
  return CONSTANTS[block.getFieldValue('CONSTANT')];
};

Blockly.PHP['math_number_property'] = function(block) {
  // Check if a number is even, odd, prime, whole, positive, or negative
  // or if it is divisible by certain number. Returns true or false.
  var number_to_check = Blockly.PHP.valueToCode(block, 'NUMBER_TO_CHECK',
      Blockly.PHP.ORDER_MODULUS) || '0';
  var dropdown_property = block.getFieldValue('PROPERTY');
  var code;

  switch (dropdown_property) {
    case 'EVEN':
      code = number_to_check + ' % 2 == 0';
      break;
    case 'ODD':
      code = number_to_check + ' % 2 == 1';
      break;
    case 'PRIME':
      code = 'mp_prob_prime('+number_to_check + ')';
      break;
    case 'WHOLE':
      code = number_to_check + ' % 1 == 0';
      break;
    case 'POSITIVE':
      code = number_to_check + ' > 0';
      break;
    case 'NEGATIVE':
      code = number_to_check + ' < 0';
      break;
    case 'DIVISIBLE_BY':
      var divisor = Blockly.PHP.valueToCode(block, 'DIVISOR',
          Blockly.PHP.ORDER_MODULUS) || '0';
      code = number_to_check + ' % ' + divisor + ' == 0';
      break;
  }
  return [code, Blockly.PHP.ORDER_EQUALITY];
};

Blockly.PHP['math_change'] = function(block) {
  // Add to a variable in place.
  var argument0 = Blockly.PHP.valueToCode(block, 'DELTA',
      Blockly.PHP.ORDER_ADDITION) || '0';
  var varName = Blockly.PHP.getName(
      block.getFieldValue('VAR'), Blockly.Variables.NAME_TYPE);
  return varName + ' += ' + argument0 + ';\n';
};

// Rounding functions have a single operand.
Blockly.PHP['math_round'] = Blockly.PHP['math_single'];
// Trigonometry functions have a single operand.
Blockly.PHP['math_trig'] = Blockly.PHP['math_single'];

Blockly.PHP['math_on_list'] = function(block) {
  // Math functions for lists.
  var func = block.getFieldValue('OP');
  var list, code;
  switch (func) {
    case 'SUM':
      list = Blockly.PHP.valueToCode(block, 'LIST',
          Blockly.PHP.ORDER_FUNCTION_CALL) || 'array()';
      code = 'array_sum(' + list + ')';
      break;
    case 'MIN':
      list = Blockly.PHP.valueToCode(block, 'LIST',
          Blockly.PHP.ORDER_FUNCTION_CALL) || 'array()';
      code = 'min(' + list + ')';
      break;
    case 'MAX':
      list = Blockly.PHP.valueToCode(block, 'LIST',
          Blockly.PHP.ORDER_FUNCTION_CALL) || 'array()';
      code = 'max(' + list + ')';
      break;
    case 'AVERAGE':
      // math_median([null,null,1,3]) == 2.0.
      var functionName = Blockly.PHP.provideFunction_(
          'math_mean',
          [ 'function ' + Blockly.PHP.FUNCTION_NAME_PLACEHOLDER_ +
              '($myList) {',
            '  return array_sum($myList) / count($myList);',
            '}']);
      list = Blockly.PHP.valueToCode(block, 'LIST',
          Blockly.PHP.ORDER_NONE) || 'array()';
      code = functionName + '(' + list + ')';
      break;
    case 'MEDIAN':
      // math_median([null,null,1,3]) == 2.0.
      var functionName = Blockly.PHP.provideFunction_(
          'math_median',
          [ 'function ' + Blockly.PHP.FUNCTION_NAME_PLACEHOLDER_ +
              '($myList) {',
            '  rsort($myList);',
            '  $middle = round(count($myList) / 2);',
            '  return $myList[$middle-1]; ',
            '}']);
      list = Blockly.PHP.valueToCode(block, 'LIST',
          Blockly.PHP.ORDER_NONE) || '[]';
      code = functionName + '(' + list + ')';
      break;
    case 'MODE':
      // As a list of numbers can contain more than one mode,
      // the returned result is provided as an array.
      // Mode of [3, 'x', 'x', 1, 1, 2, '3'] -> ['x', 1].
      var functionName = Blockly.PHP.provideFunction_(
          'math_modes',
          [ 'function ' + Blockly.PHP.FUNCTION_NAME_PLACEHOLDER_ +
              '($values) {',
            '  $v = array_count_values($values);',
            '  arsort($v);',
            '  foreach($v as $k => $v){$total = $k; break;}',
            '  return $total;',
            '}']);
      list = Blockly.PHP.valueToCode(block, 'LIST',
          Blockly.PHP.ORDER_NONE) || '[]';
      code = functionName + '(' + list + ')';
      break;
    case 'STD_DEV':
      list = Blockly.PHP.valueToCode(block, 'LIST',
              Blockly.PHP.ORDER_MEMBER) || 'array()';
      code = 'stats_standard_deviation(' + list + ')';
      break;
    case 'RANDOM':
      var functionName = Blockly.PHP.provideFunction_(
          'math_random_list',
          [ 'function ' + Blockly.PHP.FUNCTION_NAME_PLACEHOLDER_ +
              '($list) {',
            '  $x = floor(rand() * count($list));',
            '  return $list[$x];',
            '}']);
      list = Blockly.PHP.valueToCode(block, 'LIST',
          Blockly.PHP.ORDER_NONE) || '[]';
      code = functionName + '(' + list + ')';
      break;
    default:
      throw 'Unknown operator: ' + func;
  }
  return [code, Blockly.PHP.ORDER_FUNCTION_CALL];
};

Blockly.PHP['math_modulo'] = function(block) {
  // Remainder computation.
  var argument0 = Blockly.PHP.valueToCode(block, 'DIVIDEND',
      Blockly.PHP.ORDER_MODULUS) || '0';
  var argument1 = Blockly.PHP.valueToCode(block, 'DIVISOR',
      Blockly.PHP.ORDER_MODULUS) || '0';
  var code = argument0 + ' % ' + argument1;
  return [code, Blockly.PHP.ORDER_MODULUS];
};

Blockly.PHP['math_constrain'] = function(block) {
  // Constrain a number between two limits.
  var argument0 = Blockly.PHP.valueToCode(block, 'VALUE',
      Blockly.PHP.ORDER_COMMA) || '0';
  var argument1 = Blockly.PHP.valueToCode(block, 'LOW',
      Blockly.PHP.ORDER_COMMA) || '0';
  var argument2 = Blockly.PHP.valueToCode(block, 'HIGH',
      Blockly.PHP.ORDER_COMMA) || 'Infinity';
  var code = 'min(max(' + argument0 + ', ' + argument1 + '), ' +
      argument2 + ')';
  return [code, Blockly.PHP.ORDER_FUNCTION_CALL];
};

Blockly.PHP['math_random_int'] = function(block) {
  // Random integer between [X] and [Y].
  var argument0 = Blockly.PHP.valueToCode(block, 'FROM',
      Blockly.PHP.ORDER_COMMA) || '0';
  var argument1 = Blockly.PHP.valueToCode(block, 'TO',
      Blockly.PHP.ORDER_COMMA) || '0';
  var functionName = Blockly.PHP.provideFunction_(
      'math_random_int',
      [ 'function ' + Blockly.PHP.FUNCTION_NAME_PLACEHOLDER_ +
          '($a, $b) {',
        '  if ($a > $b) {',
        '    return rand($b, $a);',
        '  }',
        '  return rand($a, $b);',
        '}']);
  var code = functionName + '(' + argument0 + ', ' + argument1 + ')';
  return [code, Blockly.PHP.ORDER_FUNCTION_CALL];
};

Blockly.PHP['math_random_float'] = function(block) {
  // Random fraction between 0 and 1.
  return ['(float)rand()/(float)getrandmax()', Blockly.PHP.ORDER_FUNCTION_CALL];
};
