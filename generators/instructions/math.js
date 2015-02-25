/**
 * @license
 * Visual Blocks Language
 *
 * Copyright 2014 Google Inc.
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
 * @fileoverview Generating Instructions for math blocks.
 * @author q.neutron@gmail.com (Quynh Neutron)
 */
'use strict';

goog.provide('Blockly.Instructions.math');

goog.require('Blockly.Instructions');


Blockly.Instructions.addReservedWords('Math');

Blockly.Instructions['math_number'] = function(block) {
  // Numeric value.
  var code = window.parseFloat(block.getFieldValue('NUM'));
  // -4.abs() returns -4 in Instructions due to strange order of operation choices.
  // -4 is actually an operator and a number.  Reflect this in the order.
  var order = code < 0 ?
      Blockly.Instructions.ORDER_UNARY_PREFIX : Blockly.Instructions.ORDER_ATOMIC;
  return [code, order];
};

Blockly.Instructions['math_arithmetic'] = function(block) {
    // Basic arithmetic operators, and power.
  var OPERATORS = {
    'ADD': ['add ', Blockly.Instructions.ORDER_ADDITIVE],
    'MINUS': ['sub ', Blockly.Instructions.ORDER_ADDITIVE],
    'MULTIPLY': ['mult ', Blockly.Instructions.ORDER_MULTIPLICATIVE],
    'DIVIDE': ['div ', Blockly.Instructions.ORDER_MULTIPLICATIVE],
    'POWER': [null, Blockly.Instructions.ORDER_NONE]  // Handle power separately.
  };
  var tuple = OPERATORS[block.getFieldValue('OP')];
  var operator = tuple[0];
  var order = tuple[1];

  var argument0 = ''; 
  var valueBlock0 = block.getInputTargetBlock('A');
  var value0;
  if (valueBlock0 == '0') {
    value0 = '0';
  } else if (valueBlock0.type == 'math_number') {
    value0 = valueBlock0.getFieldValue('NUM');
  } else if (valueBlock0.type == 'variables_get') {
    var varName = Blockly.Instructions.variableDB_.getName(valueBlock0.getFieldValue('VAR'),
      Blockly.Variables.NAME_TYPE);
    value0 = Blockly.Instructions.mapping_[varName];
  } else {
    argument0 = Blockly.Instructions.valueToCode(block, 'A', order) + '\n';
    value0 = Blockly.Instructions.mapping_[valueBlock0.id];
  }

  var argument1 = ''; 
  var valueBlock1 = block.getInputTargetBlock('B');
  var value1;
  if (valueBlock1 == '0') {
    value1 = '0';
  } else if (valueBlock1.type == 'math_number') {
    value1 = valueBlock1.getFieldValue('NUM');
  } else if (valueBlock1.type == 'variables_get') {
    var varName = Blockly.Instructions.variableDB_.getName(valueBlock1.getFieldValue('VAR'),
      Blockly.Variables.NAME_TYPE);
    value1 = Blockly.Instructions.mapping_[varName];
  } else {
    argument1 = Blockly.Instructions.valueToCode(block, 'B', order) + '\n';
    value1 = Blockly.Instructions.mapping_[valueBlock1.id];
  }


  var code;
  // Power in Instructions requires a special case since it has no operator.
  if (!operator) {
    Blockly.Instructions.definitions_['import_Instructions_math'] =
        'import \'Instructions:math\' as Math;';
    code = 'Math.pow(' + argument0 + ', ' + argument1 + ')';
    return [code, Blockly.Instructions.ORDER_UNARY_POSTFIX];
  }

  var id = block.id;
  Blockly.Instructions.mapping_[id] = 'r' + Blockly.Instructions.unusedRegister;
  Blockly.Instructions.unusedRegister++;
  var destination = Blockly.Instructions.mapping_[id];

  //code = argument0 + operator + argument1;
  code = argument0 + argument1 + operator + destination + ' ' + value0 + ' ' + value1;
  return [code, order];
};

Blockly.Instructions['math_single'] = function(block) {
  // Math operators with single operand.
  var operator = block.getFieldValue('OP');
  var code;
  var arg;
  if (operator == 'NEG') {
    // Negation is a special case given its different operator precedence.
    arg = Blockly.Instructions.valueToCode(block, 'NUM',
        Blockly.Instructions.ORDER_UNARY_PREFIX) || '0';
    if (arg[0] == '-') {
      // --3 is not legal in Instructions.
      arg = ' ' + arg;
    }
    code = '-' + arg;
    return [code, Blockly.Instructions.ORDER_UNARY_PREFIX];
  }
  Blockly.Instructions.definitions_['import_Instructions_math'] =
      'import \'Instructions:math\' as Math;';
  if (operator == 'ABS' || operator.substring(0, 5) == 'ROUND') {
    arg = Blockly.Instructions.valueToCode(block, 'NUM',
        Blockly.Instructions.ORDER_UNARY_POSTFIX) || '0';
  } else if (operator == 'SIN' || operator == 'COS' || operator == 'TAN') {
    arg = Blockly.Instructions.valueToCode(block, 'NUM',
        Blockly.Instructions.ORDER_MULTIPLICATIVE) || '0';
  } else {
    arg = Blockly.Instructions.valueToCode(block, 'NUM',
        Blockly.Instructions.ORDER_NONE) || '0';
  }
  // First, handle cases which generate values that don't need parentheses
  // wrapping the code.
  switch (operator) {
    case 'ABS':
      code = arg + '.abs()';
      break;
    case 'ROOT':
      code = 'Math.sqrt(' + arg + ')';
      break;
    case 'LN':
      code = 'Math.log(' + arg + ')';
      break;
    case 'EXP':
      code = 'Math.exp(' + arg + ')';
      break;
    case 'POW10':
      code = 'Math.pow(10,' + arg + ')';
      break;
    case 'ROUND':
      code = arg + '.round()';
      break;
    case 'ROUNDUP':
      code = arg + '.ceil()';
      break;
    case 'ROUNDDOWN':
      code = arg + '.floor()';
      break;
    case 'SIN':
      code = 'Math.sin(' + arg + ' / 180 * Math.PI)';
      break;
    case 'COS':
      code = 'Math.cos(' + arg + ' / 180 * Math.PI)';
      break;
    case 'TAN':
      code = 'Math.tan(' + arg + ' / 180 * Math.PI)';
      break;
  }
  if (code) {
    return [code, Blockly.Instructions.ORDER_UNARY_POSTFIX];
  }
  // Second, handle cases which generate values that may need parentheses
  // wrapping the code.
  switch (operator) {
    case 'LOG10':
      code = 'Math.log(' + arg + ') / Math.log(10)';
      break;
    case 'ASIN':
      code = 'Math.asin(' + arg + ') / Math.PI * 180';
      break;
    case 'ACOS':
      code = 'Math.acos(' + arg + ') / Math.PI * 180';
      break;
    case 'ATAN':
      code = 'Math.atan(' + arg + ') / Math.PI * 180';
      break;
    default:
      throw 'Unknown math operator: ' + operator;
  }
  return [code, Blockly.Instructions.ORDER_MULTIPLICATIVE];
};

Blockly.Instructions['math_constant'] = function(block) {
  // Constants: PI, E, the Golden Ratio, sqrt(2), 1/sqrt(2), INFINITY.
  var CONSTANTS = {
    'PI': ['Math.PI', Blockly.Instructions.ORDER_UNARY_POSTFIX],
    'E': ['Math.E', Blockly.Instructions.ORDER_UNARY_POSTFIX],
    'GOLDEN_RATIO':
        ['(1 + Math.sqrt(5)) / 2', Blockly.Instructions.ORDER_MULTIPLICATIVE],
    'SQRT2': ['Math.SQRT2', Blockly.Instructions.ORDER_UNARY_POSTFIX],
    'SQRT1_2': ['Math.SQRT1_2', Blockly.Instructions.ORDER_UNARY_POSTFIX],
    'INFINITY': ['double.INFINITY', Blockly.Instructions.ORDER_ATOMIC]
  };
  var constant = block.getFieldValue('CONSTANT');
  if (constant != 'INFINITY') {
    Blockly.Instructions.definitions_['import_Instructions_math'] =
        'import \'Instructions:math\' as Math;';
  }
  return CONSTANTS[constant];
};

Blockly.Instructions['math_number_property'] = function(block) {
  // Check if a number is even, odd, prime, whole, positive, or negative
  // or if it is divisible by certain number. Returns true or false.
  var number_to_check = Blockly.Instructions.valueToCode(block, 'NUMBER_TO_CHECK',
      Blockly.Instructions.ORDER_MULTIPLICATIVE);
  if (!number_to_check) {
    return ['false', Blockly.Python.ORDER_ATOMIC];
  }
  var dropdown_property = block.getFieldValue('PROPERTY');
  var code;
  if (dropdown_property == 'PRIME') {
    // Prime is a special case as it is not a one-liner test.
    Blockly.Instructions.definitions_['import_Instructions_math'] =
        'import \'Instructions:math\' as Math;';
    var functionName = Blockly.Instructions.provideFunction_(
        'math_isPrime',
        [ 'bool ' + Blockly.Instructions.FUNCTION_NAME_PLACEHOLDER_ + '(n) {',
          '  // https://en.wikipedia.org/wiki/Primality_test#Naive_methods',
          '  if (n == 2 || n == 3) {',
          '    return true;',
          '  }',
          '  // False if n is null, negative, is 1, or not whole.',
          '  // And false if n is divisible by 2 or 3.',
          '  if (n == null || n <= 1 || n % 1 != 0 || n % 2 == 0 ||' +
            ' n % 3 == 0) {',
          '    return false;',
          '  }',
          '  // Check all the numbers of form 6k +/- 1, up to sqrt(n).',
          '  for (var x = 6; x <= Math.sqrt(n) + 1; x += 6) {',
          '    if (n % (x - 1) == 0 || n % (x + 1) == 0) {',
          '      return false;',
          '    }',
          '  }',
          '  return true;',
          '}']);
    code = functionName + '(' + number_to_check + ')';
    return [code, Blockly.Instructions.ORDER_UNARY_POSTFIX];
  }
  switch (dropdown_property) {
    case 'EVEN':
      code = number_to_check + ' % 2 == 0';
      break;
    case 'ODD':
      code = number_to_check + ' % 2 == 1';
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
      var divisor = Blockly.Instructions.valueToCode(block, 'DIVISOR',
          Blockly.Instructions.ORDER_MULTIPLICATIVE);
      if (!divisor) {
        return ['false', Blockly.Python.ORDER_ATOMIC];
      }
      code = number_to_check + ' % ' + divisor + ' == 0';
      break;
  }
  return [code, Blockly.Instructions.ORDER_EQUALITY];
};

Blockly.Instructions['math_change'] = function(block) {
  // Add to a variable in place.
  var argument0 = Blockly.Instructions.valueToCode(block, 'DELTA',
      Blockly.Instructions.ORDER_ADDITIVE) || '0';
  var varName = Blockly.Instructions.variableDB_.getName(block.getFieldValue('VAR'),
      Blockly.Variables.NAME_TYPE);
  return varName + ' = (' + varName + ' is num ? ' + varName + ' : 0) + ' +
      argument0 + ';\n';
};

// Rounding functions have a single operand.
Blockly.Instructions['math_round'] = Blockly.Instructions['math_single'];
// Trigonometry functions have a single operand.
Blockly.Instructions['math_trig'] = Blockly.Instructions['math_single'];

Blockly.Instructions['math_on_list'] = function(block) {
  // Math functions for lists.
  var func = block.getFieldValue('OP');
  var list = Blockly.Instructions.valueToCode(block, 'LIST',
      Blockly.Instructions.ORDER_NONE) || '[]';
  var code;
  switch (func) {
    case 'SUM':
      var functionName = Blockly.Instructions.provideFunction_(
          'math_sum',
          [ 'num ' + Blockly.Instructions.FUNCTION_NAME_PLACEHOLDER_ +
              '(List myList) {',
            '  num sumVal = 0;',
            '  myList.forEach((num entry) {sumVal += entry;});',
            '  return sumVal;',
            '}']);
      code = functionName + '(' + list + ')';
      break;
    case 'MIN':
      Blockly.Instructions.definitions_['import_Instructions_math'] =
          'import \'Instructions:math\' as Math;';
      var functionName = Blockly.Instructions.provideFunction_(
          'math_min',
          [ 'num ' + Blockly.Instructions.FUNCTION_NAME_PLACEHOLDER_ +
              '(List myList) {',
            '  if (myList.isEmpty) return null;',
            '  num minVal = myList[0];',
            '  myList.forEach((num entry) ' +
              '{minVal = Math.min(minVal, entry);});',
            '  return minVal;',
            '}']);
      code = functionName + '(' + list + ')';
      break;
    case 'MAX':
      Blockly.Instructions.definitions_['import_Instructions_math'] =
          'import \'Instructions:math\' as Math;';
      var functionName = Blockly.Instructions.provideFunction_(
          'math_max',
          [ 'num ' + Blockly.Instructions.FUNCTION_NAME_PLACEHOLDER_ +
              '(List myList) {',
            '  if (myList.isEmpty) return null;',
            '  num maxVal = myList[0];',
            '  myList.forEach((num entry) ' +
                  '{maxVal = Math.max(maxVal, entry);});',
            '  return maxVal;',
            '}']);
      code = functionName + '(' + list + ')';
      break;
    case 'AVERAGE':
      // This operation exclude null and values that are not int or float:
      //   math_mean([null,null,"aString",1,9]) == 5.0.
      var functionName = Blockly.Instructions.provideFunction_(
          'math_average',
          [ 'num ' + Blockly.Instructions.FUNCTION_NAME_PLACEHOLDER_ +
              '(List myList) {',
            '  // First filter list for numbers only.',
            '  List localList = new List.from(myList);',
            '  localList.removeMatching((a) => a is! num);',
            '  if (localList.isEmpty) return null;',
            '  num sumVal = 0;',
            '  localList.forEach((num entry) {sumVal += entry;});',
            '  return sumVal / localList.length;',
            '}']);
      code = functionName + '(' + list + ')';
      break;
    case 'MEDIAN':
      var functionName = Blockly.Instructions.provideFunction_(
          'math_median',
          [ 'num ' + Blockly.Instructions.FUNCTION_NAME_PLACEHOLDER_ +
              '(List myList) {',
            '  // First filter list for numbers only, then sort, ' +
              'then return middle value',
            '  // or the average of two middle values if list has an ' +
              'even number of elements.',
            '  List localList = new List.from(myList);',
            '  localList.removeMatching((a) => a is! num);',
            '  if (localList.isEmpty) return null;',
            '  localList.sort((a, b) => (a - b));',
            '  int index = localList.length ~/ 2;',
            '  if (localList.length % 2 == 1) {',
            '    return localList[index];',
            '  } else {',
            '    return (localList[index - 1] + localList[index]) / 2;',
            '  }',
            '}']);
      code = functionName + '(' + list + ')';
      break;
    case 'MODE':
      Blockly.Instructions.definitions_['import_Instructions_math'] =
          'import \'Instructions:math\' as Math;';
      // As a list of numbers can contain more than one mode,
      // the returned result is provided as an array.
      // Mode of [3, 'x', 'x', 1, 1, 2, '3'] -> ['x', 1].
      var functionName = Blockly.Instructions.provideFunction_(
          'math_modes',
          [ 'List ' + Blockly.Instructions.FUNCTION_NAME_PLACEHOLDER_ +
              '(List values) {',
            '  List modes = [];',
            '  List counts = [];',
            '  int maxCount = 0;',
            '  for (int i = 0; i < values.length; i++) {',
            '    var value = values[i];',
            '    bool found = false;',
            '    int thisCount;',
            '    for (int j = 0; j < counts.length; j++) {',
            '      if (counts[j][0] == value) {',
            '        thisCount = ++counts[j][1];',
            '        found = true;',
            '        break;',
            '      }',
            '    }',
            '    if (!found) {',
            '      counts.add([value, 1]);',
            '      thisCount = 1;',
            '    }',
            '    maxCount = Math.max(thisCount, maxCount);',
            '  }',
            '  for (int j = 0; j < counts.length; j++) {',
            '    if (counts[j][1] == maxCount) {',
            '        modes.add(counts[j][0]);',
            '    }',
            '  }',
            '  return modes;',
            '}']);
      code = functionName + '(' + list + ')';
      break;
    case 'STD_DEV':
      Blockly.Instructions.definitions_['import_Instructions_math'] =
          'import \'Instructions:math\' as Math;';
      var functionName = Blockly.Instructions.provideFunction_(
          'math_standard_deviation',
          [ 'num ' + Blockly.Instructions.FUNCTION_NAME_PLACEHOLDER_ +
              '(List myList) {',
            '  // First filter list for numbers only.',
            '  List numbers = new List.from(myList);',
            '  numbers.removeMatching((a) => a is! num);',
            '  if (numbers.isEmpty) return null;',
            '  num n = numbers.length;',
            '  num sum = 0;',
            '  numbers.forEach((x) => sum += x);',
            '  num mean = sum / n;',
            '  num sumSquare = 0;',
            '  numbers.forEach((x) => sumSquare += ' +
                  'Math.pow(x - mean, 2));',
            '  return Math.sqrt(sumSquare / n);',
            '}']);
      code = functionName + '(' + list + ')';
      break;
    case 'RANDOM':
      Blockly.Instructions.definitions_['import_Instructions_math'] =
          'import \'Instructions:math\' as Math;';
      var functionName = Blockly.Instructions.provideFunction_(
          'math_random_item',
          [ 'dynamic ' + Blockly.Instructions.FUNCTION_NAME_PLACEHOLDER_ +
              '(List myList) {',
            '  int x = new Math.Random().nextInt(myList.length);',
            '  return myList[x];',
            '}']);
      code = functionName + '(' + list + ')';
      break;
    default:
      throw 'Unknown operator: ' + func;
  }
  return [code, Blockly.Instructions.ORDER_UNARY_POSTFIX];
};

Blockly.Instructions['math_modulo'] = function(block) {
  // Remainder computation.
  var argument0 = Blockly.Instructions.valueToCode(block, 'DIVIDEND',
      Blockly.Instructions.ORDER_MULTIPLICATIVE) || '0';
  var argument1 = Blockly.Instructions.valueToCode(block, 'DIVISOR',
      Blockly.Instructions.ORDER_MULTIPLICATIVE) || '0';
  var code = argument0 + ' % ' + argument1;
  return [code, Blockly.Instructions.ORDER_MULTIPLICATIVE];
};

Blockly.Instructions['math_constrain'] = function(block) {
  // Constrain a number between two limits.
  Blockly.Instructions.definitions_['import_Instructions_math'] =
      'import \'Instructions:math\' as Math;';
  var argument0 = Blockly.Instructions.valueToCode(block, 'VALUE',
      Blockly.Instructions.ORDER_NONE) || '0';
  var argument1 = Blockly.Instructions.valueToCode(block, 'LOW',
      Blockly.Instructions.ORDER_NONE) || '0';
  var argument2 = Blockly.Instructions.valueToCode(block, 'HIGH',
      Blockly.Instructions.ORDER_NONE) || 'double.INFINITY';
  var code = 'Math.min(Math.max(' + argument0 + ', ' + argument1 + '), ' +
      argument2 + ')';
  return [code, Blockly.Instructions.ORDER_UNARY_POSTFIX];
};

Blockly.Instructions['math_random_int'] = function(block) {
  // Random integer between [X] and [Y].
  Blockly.Instructions.definitions_['import_Instructions_math'] =
      'import \'Instructions:math\' as Math;';
  var argument0 = Blockly.Instructions.valueToCode(block, 'FROM',
      Blockly.Instructions.ORDER_NONE) || '0';
  var argument1 = Blockly.Instructions.valueToCode(block, 'TO',
      Blockly.Instructions.ORDER_NONE) || '0';
  var functionName = Blockly.Instructions.provideFunction_(
      'math_random_int',
      [ 'int ' + Blockly.Instructions.FUNCTION_NAME_PLACEHOLDER_ + '(num a, num b) {',
        '  if (a > b) {',
        '    // Swap a and b to ensure a is smaller.',
        '    num c = a;',
        '    a = b;',
        '    b = c;',
        '  }',
        '  return new Math.Random().nextInt(b - a + 1) + a;',
        '}']);
  var code = functionName + '(' + argument0 + ', ' + argument1 + ')';
  return [code, Blockly.Instructions.ORDER_UNARY_POSTFIX];
};

Blockly.Instructions['math_random_float'] = function(block) {
  // Random fraction between 0 and 1.
  Blockly.Instructions.definitions_['import_Instructions_math'] =
      'import \'Instructions:math\' as Math;';
  return ['new Math.Random().nextDouble()', Blockly.Instructions.ORDER_UNARY_POSTFIX];
};
