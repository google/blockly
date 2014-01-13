/**
 * Visual Blocks Language
 *
 * Copyright 2012 Google Inc.
 * http://blockly.googlecode.com/
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
 * @fileoverview Generating Dart for math blocks.
 * @author q.neutron@gmail.com (Quynh Neutron)
 */
'use strict';

goog.provide('Blockly.Dart.math');

goog.require('Blockly.Dart');

Blockly.Dart.addReservedWords('Math');

Blockly.Dart.math_number = function() {
  // Numeric value.
  var code = window.parseFloat(this.getTitleValue('NUM'));
  // -4.abs() returns -4 in Dart due to strange order of operation choices.
  // -4 is actually an operator and a number.  Reflect this in the order.
  var order = code < 0 ?
      Blockly.Dart.ORDER_UNARY_PREFIX : Blockly.Dart.ORDER_ATOMIC;
  return [code, order];
};

Blockly.Dart.math_arithmetic = function() {
  // Basic arithmetic operators, and power.
  var mode = this.getTitleValue('OP');
  var tuple = Blockly.Dart.math_arithmetic.OPERATORS[mode];
  var operator = tuple[0];
  var order = tuple[1];
  var argument0 = Blockly.Dart.valueToCode(this, 'A', order) || '0';
  var argument1 = Blockly.Dart.valueToCode(this, 'B', order) || '0';
  var code;
  // Power in Dart requires a special case since it has no operator.
  if (!operator) {
    Blockly.Dart.definitions_['import_dart_math'] =
        'import \'dart:math\' as Math;';
    code = 'Math.pow(' + argument0 + ', ' + argument1 + ')';
    return [code, Blockly.Dart.ORDER_UNARY_POSTFIX];
  }
  code = argument0 + operator + argument1;
  return [code, order];
};

Blockly.Dart.math_arithmetic.OPERATORS = {
  ADD: [' + ', Blockly.Dart.ORDER_ADDITIVE],
  MINUS: [' - ', Blockly.Dart.ORDER_ADDITIVE],
  MULTIPLY: [' * ', Blockly.Dart.ORDER_MULTIPLICATIVE],
  DIVIDE: [' / ', Blockly.Dart.ORDER_MULTIPLICATIVE],
  POWER: [null, Blockly.Dart.ORDER_NONE]  // Handle power separately.
};

Blockly.Dart.math_single = function() {
  // Math operators with single operand.
  var operator = this.getTitleValue('OP');
  var code;
  var arg;
  if (operator == 'NEG') {
    // Negation is a special case given its different operator precedence.
    arg = Blockly.Dart.valueToCode(this, 'NUM',
        Blockly.Dart.ORDER_UNARY_PREFIX) || '0';
    if (arg[0] == '-') {
      // --3 is not legal in Dart.
      arg = ' ' + arg;
    }
    code = '-' + arg;
    return [code, Blockly.Dart.ORDER_UNARY_PREFIX];
  }
  Blockly.Dart.definitions_['import_dart_math'] =
      'import \'dart:math\' as Math;';
  if (operator == 'ABS' || operator.substring(0, 5) == 'ROUND') {
    arg = Blockly.Dart.valueToCode(this, 'NUM',
        Blockly.Dart.ORDER_UNARY_POSTFIX) || '0';
  } else if (operator == 'SIN' || operator == 'COS' || operator == 'TAN') {
    arg = Blockly.Dart.valueToCode(this, 'NUM',
        Blockly.Dart.ORDER_MULTIPLICATIVE) || '0';
  } else {
    arg = Blockly.Dart.valueToCode(this, 'NUM',
        Blockly.Dart.ORDER_NONE) || '0';
  }
  // First, handle cases which generate values that don't need parentheses.
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
    return [code, Blockly.Dart.ORDER_UNARY_POSTFIX];
  }
  // Second, handle cases which generate values that may need parentheses.
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
  return [code, Blockly.Dart.ORDER_MULTIPLICATIVE];
};

Blockly.Dart.math_constant = function() {
  // Constants: PI, E, the Golden Ratio, sqrt(2), 1/sqrt(2), INFINITY.
  var constant = this.getTitleValue('CONSTANT');
  if (constant != 'INFINITY') {
    Blockly.Dart.definitions_['import_dart_math'] =
        'import \'dart:math\' as Math;';
  }
  return Blockly.Dart.math_constant.CONSTANTS[constant];
};

Blockly.Dart.math_constant.CONSTANTS = {
  PI: ['Math.PI', Blockly.Dart.ORDER_UNARY_POSTFIX],
  E: ['Math.E', Blockly.Dart.ORDER_UNARY_POSTFIX],
  GOLDEN_RATIO: ['(1 + Math.sqrt(5)) / 2', Blockly.Dart.ORDER_MULTIPLICATIVE],
  SQRT2: ['Math.SQRT2', Blockly.Dart.ORDER_UNARY_POSTFIX],
  SQRT1_2: ['Math.SQRT1_2', Blockly.Dart.ORDER_UNARY_POSTFIX],
  INFINITY: ['double.INFINITY', Blockly.Dart.ORDER_ATOMIC]
};

Blockly.Dart.math_number_property = function() {
  // Check if a number is even, odd, prime, whole, positive, or negative
  // or if it is divisible by certain number. Returns true or false.
  var number_to_check = Blockly.Dart.valueToCode(this, 'NUMBER_TO_CHECK',
      Blockly.Dart.ORDER_MULTIPLICATIVE);
  if (!number_to_check) {
    return ['false', Blockly.Python.ORDER_ATOMIC];
  }
  var dropdown_property = this.getTitleValue('PROPERTY');
  var code;
  if (dropdown_property == 'PRIME') {
    // Prime is a special case as it is not a one-liner test.
    if (!Blockly.Dart.definitions_['isPrime']) {
      Blockly.Dart.definitions_['import_dart_math'] =
          'import \'dart:math\' as Math;';
      var functionName = Blockly.Dart.variableDB_.getDistinctName(
          'isPrime', Blockly.Generator.NAME_TYPE);
      Blockly.Dart.logic_prime= functionName;
      var func = [];
      func.push('bool ' + functionName + '(n) {');
      func.push('  // http://en.wikipedia.org/wiki/Primality_test#Naive_methods');
      func.push('  if (n == 2 || n == 3) {');
      func.push('    return true;');
      func.push('  }');
      func.push('  // False if n is null, negative, is 1, or not whole.');
      func.push('  // And false if n is divisible by 2 or 3.');
      func.push('  if (n == null || n <= 1 || n % 1 != 0 || n % 2 == 0 ||' +
                ' n % 3 == 0) {');
      func.push('    return false;');
      func.push('  }');
      func.push('  // Check all the numbers of form 6k +/- 1, up to sqrt(n).');
      func.push('  for (var x = 6; x <= Math.sqrt(n) + 1; x += 6) {');
      func.push('    if (n % (x - 1) == 0 || n % (x + 1) == 0) {');
      func.push('      return false;');
      func.push('    }');
      func.push('  }');
      func.push('  return true;');
      func.push('}');
      Blockly.Dart.definitions_['isPrime'] = func.join('\n');
    }
    code = Blockly.Dart.logic_prime + '(' + number_to_check + ')';
    return [code, Blockly.Dart.ORDER_UNARY_POSTFIX];
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
      var divisor = Blockly.Dart.valueToCode(this, 'DIVISOR',
          Blockly.Dart.ORDER_MULTIPLICATIVE);
      if (!divisor) {
        return ['false', Blockly.Python.ORDER_ATOMIC];
      }
      code = number_to_check + ' % ' + divisor + ' == 0';
      break;
  }
  return [code, Blockly.Dart.ORDER_EQUALITY];
};

Blockly.Dart.math_change = function() {
  // Add to a variable in place.
  var argument0 = Blockly.Dart.valueToCode(this, 'DELTA',
      Blockly.Dart.ORDER_ADDITIVE) || '0';
  var varName = Blockly.Dart.variableDB_.getName(this.getTitleValue('VAR'),
      Blockly.Variables.NAME_TYPE);
  return varName + ' = (' + varName + ' is num ? ' + varName + ' : 0) + ' +
      argument0 + ';\n';
};

// Rounding functions have a single operand.
Blockly.Dart.math_round = Blockly.Dart.math_single;
// Trigonometry functions have a single operand.
Blockly.Dart.math_trig = Blockly.Dart.math_single;

Blockly.Dart.math_on_list = function() {
  // Math functions for lists.
  var func = this.getTitleValue('OP');
  var list = Blockly.Dart.valueToCode(this, 'LIST',
      Blockly.Dart.ORDER_NONE) || '[]';
  var code;
  switch (func) {
    case 'SUM':
      if (!Blockly.Dart.definitions_['math_sum']) {
        var functionName = Blockly.Dart.variableDB_.getDistinctName(
            'math_sum', Blockly.Generator.NAME_TYPE);
        Blockly.Dart.math_on_list.math_sum = functionName;
        var func = [];
        func.push('num ' + functionName + '(List myList) {');
        func.push('  num sumVal = 0;');
        func.push('  myList.forEach((num entry) {sumVal += entry;});');
        func.push('  return sumVal;');
        func.push('}');
        Blockly.Dart.definitions_['math_sum'] = func.join('\n');
      }
      code = Blockly.Dart.math_on_list.math_sum + '(' + list + ')';
      break;
    case 'MIN':
      if (!Blockly.Dart.definitions_['math_min']) {
        Blockly.Dart.definitions_['import_dart_math'] =
            'import \'dart:math\' as Math;';
        var functionName = Blockly.Dart.variableDB_.getDistinctName(
            'math_min', Blockly.Generator.NAME_TYPE);
        Blockly.Dart.math_on_list.math_min = functionName;
        var func = [];
        func.push('num ' + functionName + '(List myList) {');
        func.push('  if (myList.isEmpty) return null;');
        func.push('  num minVal = myList[0];');
        func.push('  myList.forEach((num entry) ' +
                  '{minVal = Math.min(minVal, entry);});');
        func.push('  return minVal;');
        func.push('}');
        Blockly.Dart.definitions_['math_min'] = func.join('\n');
      }
      code = Blockly.Dart.math_on_list.math_min + '(' + list + ')';
      break;
    case 'MAX':
      if (!Blockly.Dart.definitions_['math_max']) {
        Blockly.Dart.definitions_['import_dart_math'] =
            'import \'dart:math\' as Math;';
        var functionName = Blockly.Dart.variableDB_.getDistinctName(
            'math_max', Blockly.Generator.NAME_TYPE);
        Blockly.Dart.math_on_list.math_max = functionName;
        var func = [];
        func.push('num ' + functionName + '(List myList) {');
        func.push('  if (myList.isEmpty) return null;');
        func.push('  num maxVal = myList[0];');
        func.push('  myList.forEach((num entry) ' +
                  '{maxVal = Math.max(maxVal, entry);});');
        func.push('  return maxVal;');
        func.push('}');
        Blockly.Dart.definitions_['math_max'] = func.join('\n');
        Blockly.Dart.definitions_['import_dart_math'] =
            'import \'dart:math\' as Math;';
      }
      code = Blockly.Dart.math_on_list.math_max + '(' + list + ')';
      break;
    case 'AVERAGE':
      // This operation exclude null and values that are not int or float:
      //   math_mean([null,null,"aString",1,9]) == 5.0.
      if (!Blockly.Dart.definitions_['math_average']) {
        var functionName = Blockly.Dart.variableDB_.getDistinctName(
            'math_average', Blockly.Generator.NAME_TYPE);
        Blockly.Dart.math_on_list.math_average = functionName;
        var func = [];
        func.push('num ' + functionName + '(List myList) {');
        func.push('  // First filter list for numbers only.');
        func.push('  List localList = new List.from(myList);');
        func.push('  localList.removeMatching((a) => a is! num);');
        func.push('  if (localList.isEmpty) return null;');
        func.push('  num sumVal = 0;');
        func.push('  localList.forEach((num entry) {sumVal += entry;});');
        func.push('  return sumVal / localList.length;');
        func.push('}');
        Blockly.Dart.definitions_['math_average'] = func.join('\n');
      }
      code = Blockly.Dart.math_on_list.math_average + '(' + list + ')';
      break;
    case 'MEDIAN':
      if (!Blockly.Dart.definitions_['math_median']) {
        var functionName = Blockly.Dart.variableDB_.getDistinctName(
            'math_median', Blockly.Generator.NAME_TYPE);
        Blockly.Dart.math_on_list.math_median = functionName;
        var func = [];
        func.push('num ' + functionName + '(List myList) {');
        func.push('  // First filter list for numbers only, then sort, ' +
                  'then return middle value');
        func.push('  // or the average of two middle values if list has an ' +
                  'even number of elements.');
        func.push('  List localList = new List.from(myList);');
        func.push('  localList.removeMatching((a) => a is! num);');
        func.push('  if (localList.isEmpty) return null;');
        func.push('  localList.sort((a, b) => (a - b));');
        func.push('  int index = localList.length ~/ 2;');
        func.push('  if (localList.length % 2 == 1) {');
        func.push('    return localList[index];');
        func.push('  } else {');
        func.push('    return (localList[index - 1] + localList[index]) / 2;');
        func.push('  }');
        func.push('}');
        Blockly.Dart.definitions_['math_median'] = func.join('\n');
      }
      code = Blockly.Dart.math_on_list.math_median + '(' + list + ')';
      break;
    case 'MODE':
      if (!Blockly.Dart.definitions_['math_modes']) {
        Blockly.Dart.definitions_['import_dart_math'] =
            'import \'dart:math\' as Math;';
        var functionName = Blockly.Dart.variableDB_.getDistinctName(
            'math_modes', Blockly.Generator.NAME_TYPE);
        Blockly.Dart.math_on_list.math_modes = functionName;
        // As a list of numbers can contain more than one mode,
        // the returned result is provided as an array.
        // Mode of [3, 'x', 'x', 1, 1, 2, '3'] -> ['x', 1].
        var func = [];
        func.push('List ' + functionName + '(values) {');
        func.push('  List modes = [];');
        func.push('  List counts = [];');
        func.push('  int maxCount = 0;');
        func.push('  for (int i = 0; i < values.length; i++) {');
        func.push('    var value = values[i];');
        func.push('    bool found = false;');
        func.push('    int thisCount;');
        func.push('    for (int j = 0; j < counts.length; j++) {');
        func.push('      if (counts[j][0] == value) {');
        func.push('        thisCount = ++counts[j][1];');
        func.push('        found = true;');
        func.push('        break;');
        func.push('      }');
        func.push('    }');
        func.push('    if (!found) {');
        func.push('      counts.add([value, 1]);');
        func.push('      thisCount = 1;');
        func.push('    }');
        func.push('    maxCount = Math.max(thisCount, maxCount);');
        func.push('  }');
        func.push('  for (int j = 0; j < counts.length; j++) {');
        func.push('    if (counts[j][1] == maxCount) {');
        func.push('        modes.add(counts[j][0]);');
        func.push('    }');
        func.push('  }');
        func.push('  return modes;');
        func.push('}');
        Blockly.Dart.definitions_['math_modes'] = func.join('\n');
      }
      code = Blockly.Dart.math_on_list.math_modes + '(' + list + ')';
      break;
    case 'STD_DEV':
      if (!Blockly.Dart.definitions_['math_standard_deviation']) {
        Blockly.Dart.definitions_['import_dart_math'] =
            'import \'dart:math\' as Math;';
        var functionName = Blockly.Dart.variableDB_.getDistinctName(
            'math_standard_deviation', Blockly.Generator.NAME_TYPE);
        Blockly.Dart.math_on_list.math_standard_deviation = functionName;
        var func = [];
        func.push('num ' + functionName + '(List myList) {');
        func.push('  // First filter list for numbers only.');
        func.push('  List numbers = new List.from(myList);');
        func.push('  numbers.removeMatching((a) => a is! num);');
        func.push('  if (numbers.isEmpty) return null;');
        func.push('  num n = numbers.length;');
        func.push('  num sum = 0;');
        func.push('  numbers.forEach((x) => sum += x);');
        func.push('  num mean = sum / n;');
        func.push('  num sumSquare = 0;');
        func.push('  numbers.forEach((x) => sumSquare += ' +
                  'Math.pow(x - mean, 2));');
        func.push('  return Math.sqrt(sumSquare / n);');
        func.push('}');
        Blockly.Dart.definitions_['math_standard_deviation'] = func.join('\n');
      }
      code = Blockly.Dart.math_on_list.math_standard_deviation +
          '(' + list + ')';
      break;
    case 'RANDOM':
      if (!Blockly.Dart.definitions_['math_random_item']) {
        Blockly.Dart.definitions_['import_dart_math'] =
            'import \'dart:math\' as Math;';
        var functionName = Blockly.Dart.variableDB_.getDistinctName(
            'math_random_item', Blockly.Generator.NAME_TYPE);
        Blockly.Dart.math_on_list.math_random_item = functionName;
        var func = [];
        func.push('dynamic ' + functionName + '(List myList) {');
        func.push('  int x = new Math.Random().nextInt(myList.length);');
        func.push('  return myList[x];');
        func.push('}');
        Blockly.Dart.definitions_['math_random_item'] = func.join('\n');
      }
      code = Blockly.Dart.math_on_list.math_random_item + '(' + list + ')';
      break;
    default:
      throw 'Unknown operator: ' + func;
  }
  return [code, Blockly.Dart.ORDER_UNARY_POSTFIX];
};

Blockly.Dart.math_modulo = function() {
  // Remainder computation.
  var argument0 = Blockly.Dart.valueToCode(this, 'DIVIDEND',
      Blockly.Dart.ORDER_MULTIPLICATIVE) || '0';
  var argument1 = Blockly.Dart.valueToCode(this, 'DIVISOR',
      Blockly.Dart.ORDER_MULTIPLICATIVE) || '0';
  var code = argument0 + ' % ' + argument1;
  return [code, Blockly.Dart.ORDER_MULTIPLICATIVE];
};

Blockly.Dart.math_constrain = function() {
  // Constrain a number between two limits.
  var argument0 = Blockly.Dart.valueToCode(this, 'VALUE',
      Blockly.Dart.ORDER_NONE) || '0';
  var argument1 = Blockly.Dart.valueToCode(this, 'LOW',
      Blockly.Dart.ORDER_NONE) || '0';
  var argument2 = Blockly.Dart.valueToCode(this, 'HIGH',
      Blockly.Dart.ORDER_NONE) || 'double.INFINITY';
  var code = 'Math.min(Math.max(' + argument0 + ', ' + argument1 + '), ' +
      argument2 + ')';
  return [code, Blockly.Dart.ORDER_UNARY_POSTFIX];
};

Blockly.Dart.math_random_int = function() {
  // Random integer between [X] and [Y].
  var argument0 = Blockly.Dart.valueToCode(this, 'FROM',
      Blockly.Dart.ORDER_NONE) || '0';
  var argument1 = Blockly.Dart.valueToCode(this, 'TO',
      Blockly.Dart.ORDER_NONE) || '0';
  if (!Blockly.Dart.definitions_['math_random_int']) {
    var functionName = Blockly.Dart.variableDB_.getDistinctName(
        'math_random_int', Blockly.Generator.NAME_TYPE);
    Blockly.Dart.math_random_int.random_function = functionName;
    var func = [];
    func.push('int ' + functionName + '(num a, num b) {');
    func.push('  if (a > b) {');
    func.push('    // Swap a and b to ensure a is smaller.');
    func.push('    num c = a;');
    func.push('    a = b;');
    func.push('    b = c;');
    func.push('  }');
    func.push('  return new Math.Random().nextInt(b - a + 1) + a;');
    func.push('}');
    Blockly.Dart.definitions_['math_random_int'] = func.join('\n');
  }
  var code = Blockly.Dart.math_random_int.random_function +
      '(' + argument0 + ', ' + argument1 + ')';
  return [code, Blockly.Dart.ORDER_UNARY_POSTFIX];
};

Blockly.Dart.math_random_float = function() {
  // Random fraction between 0 and 1.
  return ['new Math.Random().nextDouble()', Blockly.Dart.ORDER_UNARY_POSTFIX];
};
