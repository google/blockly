/**
 * @license
 * Visual Blocks Language
 *
 * Copyright 2012 Google Inc.
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
 * @fileoverview Generating Java for math blocks.
 * @author q.neutron@gmail.com (Quynh Neutron)
 */
'use strict';

goog.provide('Blockly.Java.math');

goog.require('Blockly.Java');


// If any new block imports any library, add that library name here.
Blockly.Java.addReservedWords('math,random');

Blockly.Java['math_number'] = function(block) {
  // Numeric value.
  var code = ''+parseFloat(block.getFieldValue('NUM'));
  if (Blockly.Java.getTargetType() === 'Double') {
    if (code.indexOf('.') < 0) {
      code += '.0';
    }
  }
  var order = code < 0 ? Blockly.Java.ORDER_UNARY_SIGN :
              Blockly.Java.ORDER_ATOMIC;
  return [code, order];
};

Blockly.Java['math_arithmetic'] = function(block) {
  // Basic arithmetic operators, and power.
  var OPERATORS = {
    'ADD': [' + ', Blockly.Java.ORDER_ADDITIVE],
    'MINUS': [' - ', Blockly.Java.ORDER_ADDITIVE],
    'MULTIPLY': [' * ', Blockly.Java.ORDER_MULTIPLICATIVE],
    'DIVIDE': [' / ', Blockly.Java.ORDER_MULTIPLICATIVE],
    'POWER': [' ** ', Blockly.Java.ORDER_EXPONENTIATION]
  };
  var tuple = OPERATORS[block.getFieldValue('OP')];
  var operator = tuple[0];
  var order = tuple[1];
  var argument0 = Blockly.Java.valueToCode(block, 'A', order) || '0';
  var argument1 = Blockly.Java.valueToCode(block, 'B', order) || '0';
  var code = '';
  if (operator === ' ** ') {
    Blockly.Java.addImport('java.lang.Math');
    code = 'Math.pow(' + argument0 + ', ' + argument1 + ')';
  } else {
    code = argument0 + operator + argument1;
  }
  return [code, order];
  // In case of 'DIVIDE', division between integers returns different results
  // in Java 2 and 3. However, is not an issue since Blockly does not
  // guarantee identical results in all languages.  To do otherwise would
  // require every operator to be wrapped in a function call.  This would kill
  // legibility of the generated code.
};

Blockly.Java['math_single'] = function(block) {
  // Math operators with single operand.
  var operator = block.getFieldValue('OP');
  var code;
  var arg;
  if (operator == 'NEG') {
    // Negation is a special case given its different operator precedence.
    var code = Blockly.Java.valueToCode(block, 'NUM',
        Blockly.Java.ORDER_UNARY_SIGN) || '0';
    return ['-' + code, Blockly.Java.ORDER_UNARY_SIGN];
  }
  Blockly.Java.addImport('java.lang.Math');

  if (operator == 'SIN' || operator == 'COS' || operator == 'TAN') {
    arg = Blockly.Java.valueToCode(block, 'NUM',
        Blockly.Java.ORDER_MULTIPLICATIVE) || '0';
  } else {
    arg = Blockly.Java.valueToCode(block, 'NUM',
        Blockly.Java.ORDER_NONE) || '0';
  }
  // First, handle cases which generate values that don't need parentheses
  // wrapping the code.
  switch (operator) {
    case 'ABS':
      code = 'Math.abs(' + arg + ')';
      break;
    case 'ROOT':
      code = 'Math.sqrt(' + arg + ')';
      break;
    case 'LN':
      code = 'Math.log(' + arg + ')';
      break;
    case 'LOG10':
      code = 'Math.log10(' + arg + ')';
      break;
    case 'EXP':
      code = 'Math.exp(' + arg + ')';
      break;
    case 'POW10':
      code = 'Math.pow(10,' + arg + ')';
      break;
    case 'ROUND':
      code = 'Math.round(' + arg + ')';
      break;
    case 'ROUNDUP':
      code = 'Math.ceil(' + arg + ')';
      break;
    case 'ROUNDDOWN':
      code = 'Math.floor(' + arg + ')';
      break;
    case 'SIN':
      code = 'Math.sin(' + arg + ' / 180.0 * Math.PI)';
      break;
    case 'COS':
      code = 'Math.cos(' + arg + ' / 180.0 * Math.PI)';
      break;
    case 'TAN':
      code = 'Math.tan(' + arg + ' / 180.0 * Math.PI)';
      break;
  }
  if (code) {
    return [code, Blockly.Java.ORDER_FUNCTION_CALL];
  }
  // Second, handle cases which generate values that may need parentheses
  // wrapping the code.
  switch (operator) {
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
  return [code, Blockly.Java.ORDER_MULTIPLICATIVE];
};

Blockly.Java['math_constant'] = function(block) {
  // Constants: PI, E, the Golden Ratio, sqrt(2), 1/sqrt(2), INFINITY.
  var CONSTANTS = {
    'PI': ['Math.PI', Blockly.Java.ORDER_MEMBER],
    'E': ['Math.E', Blockly.Java.ORDER_MEMBER],
    'GOLDEN_RATIO': ['(1 + Math.sqrt(5)) / 2',
                     Blockly.Java.ORDER_MULTIPLICATIVE],
    'SQRT2': ['Math.sqrt(2)', Blockly.Java.ORDER_MEMBER],
    'SQRT1_2': ['Math.sqrt(1.0 / 2)', Blockly.Java.ORDER_MEMBER],
    'INFINITY': ['Double.POSITIVE_INFINITY', Blockly.Java.ORDER_ATOMIC]
  };
  var constant = block.getFieldValue('CONSTANT');
  if (constant != 'INFINITY') {
    Blockly.Java.addImport('java.lang.Math');
  }
  return CONSTANTS[constant];
};

Blockly.Java['math_number_property'] = function(block) {
  // Check if a number is even, odd, prime, whole, positive, or negative
  // or if it is divisible by certain number. Returns true or false.
  var number_to_check = Blockly.Java.valueToCode(block, 'NUMBER_TO_CHECK',
      Blockly.Java.ORDER_MULTIPLICATIVE) || '0';
  var dropdown_property = block.getFieldValue('PROPERTY');
  var code;
  if (dropdown_property == 'PRIME') {
    Blockly.Java.addImport('java.lang.Math');

    var functionName = Blockly.Java.provideFunction_(
        'math_isPrime',
        ['public static boolean ' + Blockly.Java.FUNCTION_NAME_PLACEHOLDER_ +
            '(Object d) {',
         '  // https://en.wikipedia.org/wiki/Primality_test#Naive_methods',
         '  // If n is not a number but a string, try parsing it.',
         '  double n;',
         '  if (d instanceof Double) {',
         '    n = (Double)d;',
         '  } else if (d instanceof Integer) {',
         '    n = (Integer)d;',
         '  } else {',
         '    return false;',
         '  }',
         '  if (n == 2 || n == 3) {',
         '    return true;',
         '  }',
         '  // False if n is negative, is 1, or not whole,' +
             ' or if n is divisible by 2 or 3.',
         '  if ((n <= 1) || (n % 1 != 0) || (n % 2 == 0) || (n % 3 == 0)) {',
         '    return false;',
         '  }',
         '  // Check all the numbers of form 6k +/- 1, up to sqrt(n).',
         '  for (int x = 6; x <= Math.sqrt(n) + 1; x += 6) {',
         '    if (n % (x - 1) == 0 || n % (x + 1) == 0) {',
         '      return false;',
         '    }',
         '  }',
         '  return true;',
         '}']);
    code = functionName + '(' + number_to_check + ')';
    return [code, Blockly.Java.ORDER_FUNCTION_CALL];
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
      var divisor = Blockly.Java.valueToCode(block, 'DIVISOR',
          Blockly.Java.ORDER_MULTIPLICATIVE);
      // If 'divisor' is some code that evals to 0, Java will raise an error.
      if (!divisor || divisor == '0') {
        return ['False', Blockly.Java.ORDER_ATOMIC];
      }
      code = number_to_check + ' % ' + divisor + ' == 0';
      break;
  }
  return [code, Blockly.Java.ORDER_RELATIONAL];
};

Blockly.Java['math_change'] = function(block) {
  // Add to a variable in place.
  var argument0 = Blockly.Java.valueToCode(block, 'DELTA',
      Blockly.Java.ORDER_ADDITIVE) || '0';
  var varName = Blockly.Java.variableDB_.getName(block.getFieldValue('VAR'),
      Blockly.Variables.NAME_TYPE);
  return varName + ' = ' + varName + ' + ' + argument0 + ';\n';
};

// Rounding functions have a single operand.
Blockly.Java['math_round'] = Blockly.Java['math_single'];
// Trigonometry functions have a single operand.
Blockly.Java['math_trig'] = Blockly.Java['math_single'];

Blockly.Java['math_on_list'] = function(block) {
  // Math functions for lists.
  var func = block.getFieldValue('OP');
  var list = Blockly.Java.valueToCode(block, 'LIST',
      Blockly.Java.ORDER_NONE) || '[]';
  var code;
  switch (func) {
    case 'SUM':
      Blockly.Java.provideVarClass();
      var functionName = Blockly.Java.provideFunction_(
          'math_sum',
          // This operation excludes null and values that aren't int or float:',
          // math_mean([null, null, "aString", 1, 9]) == 5.0.',
          ['public static double ' + Blockly.Java.FUNCTION_NAME_PLACEHOLDER_ +
           '(List myList) {',
           '  return Var.math_sum(Var.valueOf(myList));',
           '}']);
      code = functionName + '(' + list + ')';
      break;
    case 'MIN':
      Blockly.Java.provideVarClass();
      var functionName = Blockly.Java.provideFunction_(
          'math_min',
          // This operation excludes null and values that aren't int or float:',
          // math_mean([null, null, "aString", 1, 9]) == 5.0.',
          ['public static double ' + Blockly.Java.FUNCTION_NAME_PLACEHOLDER_ +
           '(List myList) {',
           '  return Var.math_min(Var.valueOf(myList));',
           '}']);
      code = functionName + '(' + list + ')';
      break;
    case 'MAX':
      Blockly.Java.provideVarClass();
      var functionName = Blockly.Java.provideFunction_(
          'math_max',
          // This operation excludes null and values that aren't int or float:',
          // math_mean([null, null, "aString", 1, 9]) == 5.0.',
          ['public static double ' + Blockly.Java.FUNCTION_NAME_PLACEHOLDER_ +
            '(List myList) {',
           '  return Var.math_max(Var.valueOf(myList));',
           '}']);
      code = functionName + '(' + list + ')';
      break;
    case 'AVERAGE':
      Blockly.Java.provideVarClass();
      var functionName = Blockly.Java.provideFunction_(
          'math_mean',
          // This operation excludes null and values that aren't int or float:',
          // math_mean([null, null, "aString", 1, 9]) == 5.0.',
          ['public static double ' + Blockly.Java.FUNCTION_NAME_PLACEHOLDER_ +
            '(List myList) {',
           '  return Var.math_mean(Var.valueOf(myList));',
           '}']);
      code = functionName + '(' + list + ')';
      break;
    case 'MEDIAN':
      Blockly.Java.provideVarClass();
      var functionName = Blockly.Java.provideFunction_(
          'math_median',
          // This operation excludes null values:
          // math_median([null, null, 1, 3]) == 2.0.
          ['public static double ' + Blockly.Java.FUNCTION_NAME_PLACEHOLDER_ +
            '(List myList) {',
           '  return Var.math_median(Var.valueOf(myList));',
           '}']);
      code = functionName + '(' + list + ')';
      break;
    case 'MODE':
      Blockly.Java.provideVarClass();
      Blockly.Java.addImport('java.util.LinkedList');
      var functionName = Blockly.Java.provideFunction_(
          'math_modes',
          // As a list of numbers can contain more than one mode,
          // the returned result is provided as an array.
          // Mode of [3, 'x', 'x', 1, 1, 2, '3'] -> ['x', 1].
          ['public static LinkedList ' + Blockly.Java.FUNCTION_NAME_PLACEHOLDER_ +
            '(List myList) {',
           '  return Var.math_modes(Var.valueOf(myList)).getObjectAsList();',
           '}']);
      code = functionName + '(' + list + ')';
      break;
    case 'STD_DEV':
      Blockly.Java.provideVarClass();
      var functionName = Blockly.Java.provideFunction_(
          'math_standard_deviation',
          ['public static double ' + Blockly.Java.FUNCTION_NAME_PLACEHOLDER_ +
            '(List myList) {',
           '  return Var.math_standard_deviation(Var.valueOf(myList));',
           '}']);
      code = functionName + '(' + list + ')';
      break;
    case 'RANDOM':
      Blockly.Java.provideVarClass();
      var functionName = Blockly.Java.provideFunction_(
          'math_random_list',
          [ 'public static Object ' + Blockly.Java.FUNCTION_NAME_PLACEHOLDER_ +
              '(List list) {',
            '  int x = (int)(Math.floor(Math.random() * list.size()));',
            '  return list.get(x);',
            '}']);
      list = Blockly.Java.valueToCode(block, 'LIST',
          Blockly.Java.ORDER_NONE) || '[]';
      code = functionName + '(' + list + ')';
      break;
    default:
      throw 'Unknown operator: ' + func;
  }
  return [code, Blockly.Java.ORDER_FUNCTION_CALL];
};

Blockly.Java['math_modulo'] = function(block) {
  // Remainder computation.
  var argument0 = Blockly.Java.valueToCode(block, 'DIVIDEND',
      Blockly.Java.ORDER_MULTIPLICATIVE) || '0';
  var argument1 = Blockly.Java.valueToCode(block, 'DIVISOR',
      Blockly.Java.ORDER_MULTIPLICATIVE) || '0';
  var code = argument0 + ' % ' + argument1;
  return [code, Blockly.Java.ORDER_MULTIPLICATIVE];
};


Blockly.Java['math_format_as_decimal'] = function(block) {
  // Remainder computation.
  var argument0 = Blockly.Java.valueToCode(block, 'NUM',
      Blockly.Java.ORDER_MULTIPLICATIVE) || '0';
  var argument1 = Blockly.Java.valueToCode(block, 'PLACES',
      Blockly.Java.ORDER_MULTIPLICATIVE) || '0';
  var leng = Array(++argument1).join('0');
  var code = 'new DecimalFormat("#.'+leng+'").format('+argument0+')';
  return [code, Blockly.Java.ORDER_MULTIPLICATIVE];
};

Blockly.Java['math_constrain'] = function(block) {
  Blockly.Java.addImport('java.lang.Math');
  // Constrain a number between two limits.
  var argument0 = Blockly.Java.valueToCode(block, 'VALUE',
      Blockly.Java.ORDER_NONE) || '0';
  var argument1 = Blockly.Java.valueToCode(block, 'LOW',
      Blockly.Java.ORDER_NONE) || '0';
  var argument2 = Blockly.Java.valueToCode(block, 'HIGH',
      Blockly.Java.ORDER_NONE) || 'float(\'inf\')';
  var code = 'Math.min(Math.max(' + argument0 + ', ' + argument1 + '), ' +
      argument2 + ')';
  return [code, Blockly.Java.ORDER_FUNCTION_CALL];
};

Blockly.Java['math_random_int'] = function(block) {
  // Random integer between [X] and [Y].
  Blockly.Java.addImport('java.lang.Math');
  var argument0 = Blockly.Java.valueToCode(block, 'FROM',
      Blockly.Java.ORDER_NONE) || '0';
  var argument1 = Blockly.Java.valueToCode(block, 'TO',
      Blockly.Java.ORDER_NONE) || '0';
  var functionName = Blockly.Java.provideFunction_(
      'math_random_int',
      [ 'public static int ' + Blockly.Java.FUNCTION_NAME_PLACEHOLDER_ +
          '(int a, int b) {',
        '  if (a > b) {',
        '    // Swap a and b to ensure a is smaller.',
        '    int c = a;',
        '    a = b;',
        '    b = c;',
        '  }',
        '  return (int)Math.floor(Math.random() * (b - a + 1) + a);',
        '}']);
  var code = functionName + '(' + argument0 + ', ' + argument1 + ')';
  return [code, Blockly.Java.ORDER_FUNCTION_CALL];
};

Blockly.Java['math_random_float'] = function(block) {
  // Random fraction between 0 and 1.
  Blockly.Java.addImport('java.lang.Math');
  return ['Math.random()', Blockly.Java.ORDER_FUNCTION_CALL];
};
