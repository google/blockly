/**
 * @license
 * Copyright 2014 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Generating Dart for math blocks.
 */
'use strict';

goog.module('Blockly.Dart.math');

const Dart = goog.require('Blockly.Dart');
const {NameType} = goog.require('Blockly.Names');


Dart.addReservedWords('Math');

Dart['math_number'] = function(block) {
  // Numeric value.
  let code = Number(block.getFieldValue('NUM'));
  let order;
  if (code === Infinity) {
    code = 'double.infinity';
    order = Dart.ORDER_UNARY_POSTFIX;
  } else if (code === -Infinity) {
    code = '-double.infinity';
    order = Dart.ORDER_UNARY_PREFIX;
  } else {
    // -4.abs() returns -4 in Dart due to strange order of operation choices.
    // -4 is actually an operator and a number.  Reflect this in the order.
    order = code < 0 ? Dart.ORDER_UNARY_PREFIX : Dart.ORDER_ATOMIC;
  }
  return [code, order];
};

Dart['math_arithmetic'] = function(block) {
  // Basic arithmetic operators, and power.
  const OPERATORS = {
    'ADD': [' + ', Dart.ORDER_ADDITIVE],
    'MINUS': [' - ', Dart.ORDER_ADDITIVE],
    'MULTIPLY': [' * ', Dart.ORDER_MULTIPLICATIVE],
    'DIVIDE': [' / ', Dart.ORDER_MULTIPLICATIVE],
    'POWER': [null, Dart.ORDER_NONE],  // Handle power separately.
  };
  const tuple = OPERATORS[block.getFieldValue('OP')];
  const operator = tuple[0];
  const order = tuple[1];
  const argument0 = Dart.valueToCode(block, 'A', order) || '0';
  const argument1 = Dart.valueToCode(block, 'B', order) || '0';
  let code;
  // Power in Dart requires a special case since it has no operator.
  if (!operator) {
    Dart.definitions_['import_dart_math'] = 'import \'dart:math\' as Math;';
    code = 'Math.pow(' + argument0 + ', ' + argument1 + ')';
    return [code, Dart.ORDER_UNARY_POSTFIX];
  }
  code = argument0 + operator + argument1;
  return [code, order];
};

Dart['math_single'] = function(block) {
  // Math operators with single operand.
  const operator = block.getFieldValue('OP');
  let code;
  let arg;
  if (operator === 'NEG') {
    // Negation is a special case given its different operator precedence.
    arg = Dart.valueToCode(block, 'NUM', Dart.ORDER_UNARY_PREFIX) || '0';
    if (arg[0] === '-') {
      // --3 is not legal in Dart.
      arg = ' ' + arg;
    }
    code = '-' + arg;
    return [code, Dart.ORDER_UNARY_PREFIX];
  }
  Dart.definitions_['import_dart_math'] = 'import \'dart:math\' as Math;';
  if (operator === 'ABS' || operator.substring(0, 5) === 'ROUND') {
    arg = Dart.valueToCode(block, 'NUM', Dart.ORDER_UNARY_POSTFIX) || '0';
  } else if (operator === 'SIN' || operator === 'COS' || operator === 'TAN') {
    arg = Dart.valueToCode(block, 'NUM', Dart.ORDER_MULTIPLICATIVE) || '0';
  } else {
    arg = Dart.valueToCode(block, 'NUM', Dart.ORDER_NONE) || '0';
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
      code = 'Math.sin(' + arg + ' / 180 * Math.pi)';
      break;
    case 'COS':
      code = 'Math.cos(' + arg + ' / 180 * Math.pi)';
      break;
    case 'TAN':
      code = 'Math.tan(' + arg + ' / 180 * Math.pi)';
      break;
  }
  if (code) {
    return [code, Dart.ORDER_UNARY_POSTFIX];
  }
  // Second, handle cases which generate values that may need parentheses
  // wrapping the code.
  switch (operator) {
    case 'LOG10':
      code = 'Math.log(' + arg + ') / Math.log(10)';
      break;
    case 'ASIN':
      code = 'Math.asin(' + arg + ') / Math.pi * 180';
      break;
    case 'ACOS':
      code = 'Math.acos(' + arg + ') / Math.pi * 180';
      break;
    case 'ATAN':
      code = 'Math.atan(' + arg + ') / Math.pi * 180';
      break;
    default:
      throw Error('Unknown math operator: ' + operator);
  }
  return [code, Dart.ORDER_MULTIPLICATIVE];
};

Dart['math_constant'] = function(block) {
  // Constants: PI, E, the Golden Ratio, sqrt(2), 1/sqrt(2), INFINITY.
  const CONSTANTS = {
    'PI': ['Math.pi', Dart.ORDER_UNARY_POSTFIX],
    'E': ['Math.e', Dart.ORDER_UNARY_POSTFIX],
    'GOLDEN_RATIO': ['(1 + Math.sqrt(5)) / 2', Dart.ORDER_MULTIPLICATIVE],
    'SQRT2': ['Math.sqrt2', Dart.ORDER_UNARY_POSTFIX],
    'SQRT1_2': ['Math.sqrt1_2', Dart.ORDER_UNARY_POSTFIX],
    'INFINITY': ['double.infinity', Dart.ORDER_ATOMIC],
  };
  const constant = block.getFieldValue('CONSTANT');
  if (constant !== 'INFINITY') {
    Dart.definitions_['import_dart_math'] = 'import \'dart:math\' as Math;';
  }
  return CONSTANTS[constant];
};

Dart['math_number_property'] = function(block) {
  // Check if a number is even, odd, prime, whole, positive, or negative
  // or if it is divisible by certain number. Returns true or false.
  const PROPERTIES = {
    'EVEN': [' % 2 == 0', Dart.ORDER_MULTIPLICATIVE, Dart.ORDER_EQUALITY],
    'ODD': [' % 2 == 1', Dart.ORDER_MULTIPLICATIVE, Dart.ORDER_EQUALITY],
    'WHOLE': [' % 1 == 0', Dart.ORDER_MULTIPLICATIVE, Dart.ORDER_EQUALITY],
    'POSITIVE': [' > 0', Dart.ORDER_RELATIONAL, Dart.ORDER_RELATIONAL],
    'NEGATIVE': [' < 0', Dart.ORDER_RELATIONAL, Dart.ORDER_RELATIONAL],
    'DIVISIBLE_BY': [null, Dart.ORDER_MULTIPLICATIVE, Dart.ORDER_EQUALITY],
    'PRIME': [null, Dart.ORDER_NONE, Dart.ORDER_UNARY_POSTFIX],
  };
  const dropdownProperty = block.getFieldValue('PROPERTY');
  const [suffix, inputOrder, outputOrder] = PROPERTIES[dropdownProperty];
  const numberToCheck = Dart.valueToCode(block, 'NUMBER_TO_CHECK',
      inputOrder) || '0';
  let code;
  if (dropdownProperty === 'PRIME') {
    // Prime is a special case as it is not a one-liner test.
    Dart.definitions_['import_dart_math'] =
        'import \'dart:math\' as Math;';
    const functionName = Dart.provideFunction_('math_isPrime', `
bool ${Dart.FUNCTION_NAME_PLACEHOLDER_}(n) {
  // https://en.wikipedia.org/wiki/Primality_test#Naive_methods
  if (n == 2 || n == 3) {
    return true;
  }
  // False if n is null, negative, is 1, or not whole.
  // And false if n is divisible by 2 or 3.
  if (n == null || n <= 1 || n % 1 != 0 || n % 2 == 0 || n % 3 == 0) {
    return false;
  }
  // Check all the numbers of form 6k +/- 1, up to sqrt(n).
  for (var x = 6; x <= Math.sqrt(n) + 1; x += 6) {
    if (n % (x - 1) == 0 || n % (x + 1) == 0) {
      return false;
    }
  }
  return true;
}
`);
    code = functionName + '(' + numberToCheck + ')';
  } else if (dropdownProperty === 'DIVISIBLE_BY') {
    const divisor = Dart.valueToCode(block, 'DIVISOR',
        Dart.ORDER_MULTIPLICATIVE) || '0';
    if (divisor === '0') {
      return ['false', Dart.ORDER_ATOMIC];
    }
    code = numberToCheck + ' % ' + divisor + ' == 0';
  } else {
    code = numberToCheck + suffix;
  }
  return [code, outputOrder];
};

Dart['math_change'] = function(block) {
  // Add to a variable in place.
  const argument0 =
      Dart.valueToCode(block, 'DELTA', Dart.ORDER_ADDITIVE) || '0';
  const varName =
      Dart.nameDB_.getName(block.getFieldValue('VAR'), NameType.VARIABLE);
  return varName + ' = (' + varName + ' is num ? ' + varName + ' : 0) + ' +
      argument0 + ';\n';
};

// Rounding functions have a single operand.
Dart['math_round'] = Dart['math_single'];
// Trigonometry functions have a single operand.
Dart['math_trig'] = Dart['math_single'];

Dart['math_on_list'] = function(block) {
  // Math functions for lists.
  const func = block.getFieldValue('OP');
  const list = Dart.valueToCode(block, 'LIST', Dart.ORDER_NONE) || '[]';
  let code;
  switch (func) {
    case 'SUM': {
      const functionName = Dart.provideFunction_('math_sum', `
num ${Dart.FUNCTION_NAME_PLACEHOLDER_}(List<num> myList) {
  num sumVal = 0;
  myList.forEach((num entry) {sumVal += entry;});
  return sumVal;
}
`);
      code = functionName + '(' + list + ')';
      break;
    }
    case 'MIN': {
      Dart.definitions_['import_dart_math'] = 'import \'dart:math\' as Math;';
      const functionName = Dart.provideFunction_('math_min', `
num ${Dart.FUNCTION_NAME_PLACEHOLDER_}(List<num> myList) {
  if (myList.isEmpty) return null;
  num minVal = myList[0];
  myList.forEach((num entry) {minVal = Math.min(minVal, entry);});
  return minVal;
}
`);
      code = functionName + '(' + list + ')';
      break;
    }
    case 'MAX': {
      Dart.definitions_['import_dart_math'] = 'import \'dart:math\' as Math;';
      const functionName = Dart.provideFunction_('math_max', `
num ${Dart.FUNCTION_NAME_PLACEHOLDER_}(List<num> myList) {
  if (myList.isEmpty) return null;
  num maxVal = myList[0];
  myList.forEach((num entry) {maxVal = Math.max(maxVal, entry);});
  return maxVal;
}
`);
      code = functionName + '(' + list + ')';
      break;
    }
    case 'AVERAGE': {
      // This operation exclude null and values that are not int or float:
      //   math_mean([null,null,"aString",1,9]) -> 5.0
      const functionName = Dart.provideFunction_('math_mean', `
num ${Dart.FUNCTION_NAME_PLACEHOLDER_}(List myList) {
  // First filter list for numbers only.
  List localList = new List.from(myList);
  localList.removeWhere((a) => a is! num);
  if (localList.isEmpty) return null;
  num sumVal = 0;
  localList.forEach((var entry) {sumVal += entry;});
  return sumVal / localList.length;
}
`);
      code = functionName + '(' + list + ')';
      break;
    }
    case 'MEDIAN': {
      const functionName = Dart.provideFunction_('math_median', `
num ${Dart.FUNCTION_NAME_PLACEHOLDER_}(List myList) {
  // First filter list for numbers only, then sort, then return middle value
  // or the average of two middle values if list has an even number of elements.
  List localList = new List.from(myList);
  localList.removeWhere((a) => a is! num);
  if (localList.isEmpty) return null;
  localList.sort((a, b) => (a - b));
  int index = localList.length ~/ 2;
  if (localList.length % 2 == 1) {
    return localList[index];
  } else {
    return (localList[index - 1] + localList[index]) / 2;
  }
}
`);
      code = functionName + '(' + list + ')';
      break;
    }
    case 'MODE': {
      Dart.definitions_['import_dart_math'] = 'import \'dart:math\' as Math;';
      // As a list of numbers can contain more than one mode,
      // the returned result is provided as an array.
      // Mode of [3, 'x', 'x', 1, 1, 2, '3'] -> ['x', 1]
      const functionName = Dart.provideFunction_('math_modes', `
List ${Dart.FUNCTION_NAME_PLACEHOLDER_}(List values) {
  List modes = [];
  List counts = [];
  int maxCount = 0;
  for (int i = 0; i < values.length; i++) {
    var value = values[i];
    bool found = false;
    int thisCount;
    for (int j = 0; j < counts.length; j++) {
      if (counts[j][0] == value) {
        thisCount = ++counts[j][1];
        found = true;
        break;
      }
    }
    if (!found) {
      counts.add([value, 1]);
      thisCount = 1;
    }
    maxCount = Math.max(thisCount, maxCount);
  }
  for (int j = 0; j < counts.length; j++) {
    if (counts[j][1] == maxCount) {
        modes.add(counts[j][0]);
    }
  }
  return modes;
}
`);
      code = functionName + '(' + list + ')';
      break;
    }
    case 'STD_DEV': {
      Dart.definitions_['import_dart_math'] = 'import \'dart:math\' as Math;';
      const functionName = Dart.provideFunction_('math_standard_deviation', `
num ${Dart.FUNCTION_NAME_PLACEHOLDER_}(List myList) {
  // First filter list for numbers only.
  List numbers = new List.from(myList);
  numbers.removeWhere((a) => a is! num);
  if (numbers.isEmpty) return null;
  num n = numbers.length;
  num sum = 0;
  numbers.forEach((x) => sum += x);
  num mean = sum / n;
  num sumSquare = 0;
  numbers.forEach((x) => sumSquare += Math.pow(x - mean, 2));
  return Math.sqrt(sumSquare / n);
}
`);
      code = functionName + '(' + list + ')';
      break;
    }
    case 'RANDOM': {
      Dart.definitions_['import_dart_math'] = 'import \'dart:math\' as Math;';
      const functionName = Dart.provideFunction_('math_random_item', `
dynamic ${Dart.FUNCTION_NAME_PLACEHOLDER_}(List myList) {
  int x = new Math.Random().nextInt(myList.length);
  return myList[x];
}
`);
      code = functionName + '(' + list + ')';
      break;
    }
    default:
      throw Error('Unknown operator: ' + func);
  }
  return [code, Dart.ORDER_UNARY_POSTFIX];
};

Dart['math_modulo'] = function(block) {
  // Remainder computation.
  const argument0 =
      Dart.valueToCode(block, 'DIVIDEND', Dart.ORDER_MULTIPLICATIVE) || '0';
  const argument1 =
      Dart.valueToCode(block, 'DIVISOR', Dart.ORDER_MULTIPLICATIVE) || '0';
  const code = argument0 + ' % ' + argument1;
  return [code, Dart.ORDER_MULTIPLICATIVE];
};

Dart['math_constrain'] = function(block) {
  // Constrain a number between two limits.
  Dart.definitions_['import_dart_math'] = 'import \'dart:math\' as Math;';
  const argument0 = Dart.valueToCode(block, 'VALUE', Dart.ORDER_NONE) || '0';
  const argument1 = Dart.valueToCode(block, 'LOW', Dart.ORDER_NONE) || '0';
  const argument2 =
      Dart.valueToCode(block, 'HIGH', Dart.ORDER_NONE) || 'double.infinity';
  const code = 'Math.min(Math.max(' + argument0 + ', ' + argument1 + '), ' +
      argument2 + ')';
  return [code, Dart.ORDER_UNARY_POSTFIX];
};

Dart['math_random_int'] = function(block) {
  // Random integer between [X] and [Y].
  Dart.definitions_['import_dart_math'] = 'import \'dart:math\' as Math;';
  const argument0 = Dart.valueToCode(block, 'FROM', Dart.ORDER_NONE) || '0';
  const argument1 = Dart.valueToCode(block, 'TO', Dart.ORDER_NONE) || '0';
  const functionName = Dart.provideFunction_('math_random_int', `
int ${Dart.FUNCTION_NAME_PLACEHOLDER_}(num a, num b) {
  if (a > b) {
    // Swap a and b to ensure a is smaller.
    num c = a;
    a = b;
    b = c;
  }
  return new Math.Random().nextInt(b - a + 1) + a;
}
`);
  const code = functionName + '(' + argument0 + ', ' + argument1 + ')';
  return [code, Dart.ORDER_UNARY_POSTFIX];
};

Dart['math_random_float'] = function(block) {
  // Random fraction between 0 and 1.
  Dart.definitions_['import_dart_math'] = 'import \'dart:math\' as Math;';
  return ['new Math.Random().nextDouble()', Dart.ORDER_UNARY_POSTFIX];
};

Dart['math_atan2'] = function(block) {
  // Arctangent of point (X, Y) in degrees from -180 to 180.
  Dart.definitions_['import_dart_math'] = 'import \'dart:math\' as Math;';
  const argument0 = Dart.valueToCode(block, 'X', Dart.ORDER_NONE) || '0';
  const argument1 = Dart.valueToCode(block, 'Y', Dart.ORDER_NONE) || '0';
  return [
    'Math.atan2(' + argument1 + ', ' + argument0 + ') / Math.pi * 180',
    Dart.ORDER_MULTIPLICATIVE
  ];
};
