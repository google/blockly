/**
 * @license
 * Copyright 2012 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Generating JavaScript for math blocks.
 * @suppress {missingRequire}
 */

import * as goog from '../../closure/goog/goog.js';
goog.declareModuleId('Blockly.JavaScript.math');

import {NameType} from '../../core/names.js';
import {Order, javascriptGenerator} from '../javascript.js';


javascriptGenerator.forBlock['math_number'] = function(block, generator) {
  // Numeric value.
  const code = Number(block.getFieldValue('NUM'));
  const order = code >= 0 ? Order.ATOMIC :
              Order.UNARY_NEGATION;
  return [code, order];
};

javascriptGenerator.forBlock['math_arithmetic'] = function(block, generator) {
  // Basic arithmetic operators, and power.
  const OPERATORS = {
    'ADD': [' + ', Order.ADDITION],
    'MINUS': [' - ', Order.SUBTRACTION],
    'MULTIPLY': [' * ', Order.MULTIPLICATION],
    'DIVIDE': [' / ', Order.DIVISION],
    'POWER': [null, Order.NONE],  // Handle power separately.
  };
  const tuple = OPERATORS[block.getFieldValue('OP')];
  const operator = tuple[0];
  const order = tuple[1];
  const argument0 = javascriptGenerator.valueToCode(block, 'A', order) || '0';
  const argument1 = javascriptGenerator.valueToCode(block, 'B', order) || '0';
  let code;
  // Power in JavaScript requires a special case since it has no operator.
  if (!operator) {
    code = 'Math.pow(' + argument0 + ', ' + argument1 + ')';
    return [code, Order.FUNCTION_CALL];
  }
  code = argument0 + operator + argument1;
  return [code, order];
};

javascriptGenerator.forBlock['math_single'] = function(block, generator) {
  // Math operators with single operand.
  const operator = block.getFieldValue('OP');
  let code;
  let arg;
  if (operator === 'NEG') {
    // Negation is a special case given its different operator precedence.
    arg = javascriptGenerator.valueToCode(block, 'NUM',
        Order.UNARY_NEGATION) || '0';
    if (arg[0] === '-') {
      // --3 is not legal in JS.
      arg = ' ' + arg;
    }
    code = '-' + arg;
    return [code, Order.UNARY_NEGATION];
  }
  if (operator === 'SIN' || operator === 'COS' || operator === 'TAN') {
    arg = javascriptGenerator.valueToCode(block, 'NUM',
        Order.DIVISION) || '0';
  } else {
    arg = javascriptGenerator.valueToCode(block, 'NUM',
        Order.NONE) || '0';
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
    return [code, Order.FUNCTION_CALL];
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
      throw Error('Unknown math operator: ' + operator);
  }
  return [code, Order.DIVISION];
};

javascriptGenerator.forBlock['math_constant'] = function(block, generator) {
  // Constants: PI, E, the Golden Ratio, sqrt(2), 1/sqrt(2), INFINITY.
  const CONSTANTS = {
    'PI': ['Math.PI', Order.MEMBER],
    'E': ['Math.E', Order.MEMBER],
    'GOLDEN_RATIO': ['(1 + Math.sqrt(5)) / 2', Order.DIVISION],
    'SQRT2': ['Math.SQRT2', Order.MEMBER],
    'SQRT1_2': ['Math.SQRT1_2', Order.MEMBER],
    'INFINITY': ['Infinity', Order.ATOMIC],
  };
  return CONSTANTS[block.getFieldValue('CONSTANT')];
};

javascriptGenerator.forBlock['math_number_property'] = function(block, generator) {
  // Check if a number is even, odd, prime, whole, positive, or negative
  // or if it is divisible by certain number. Returns true or false.
  const PROPERTIES = {
    'EVEN': [' % 2 === 0', Order.MODULUS, Order.EQUALITY],
    'ODD': [' % 2 === 1', Order.MODULUS, Order.EQUALITY],
    'WHOLE': [' % 1 === 0', Order.MODULUS,
        Order.EQUALITY],
    'POSITIVE': [' > 0', Order.RELATIONAL,
        Order.RELATIONAL],
    'NEGATIVE': [' < 0', Order.RELATIONAL,
        Order.RELATIONAL],
    'DIVISIBLE_BY': [null, Order.MODULUS, Order.EQUALITY],
    'PRIME': [null, Order.NONE, Order.FUNCTION_CALL],
  };
  const dropdownProperty = block.getFieldValue('PROPERTY');
  const [suffix, inputOrder, outputOrder] = PROPERTIES[dropdownProperty];
  const numberToCheck =
      javascriptGenerator.valueToCode(block, 'NUMBER_TO_CHECK', inputOrder) ||
      '0';
  let code;
  if (dropdownProperty === 'PRIME') {
    // Prime is a special case as it is not a one-liner test.
    const functionName = javascriptGenerator.provideFunction_('mathIsPrime', `
function ${javascriptGenerator.FUNCTION_NAME_PLACEHOLDER_}(n) {
  // https://en.wikipedia.org/wiki/Primality_test#Naive_methods
  if (n == 2 || n == 3) {
    return true;
  }
  // False if n is NaN, negative, is 1, or not whole.
  // And false if n is divisible by 2 or 3.
  if (isNaN(n) || n <= 1 || n % 1 !== 0 || n % 2 === 0 || n % 3 === 0) {
    return false;
  }
  // Check all the numbers of form 6k +/- 1, up to sqrt(n).
  for (var x = 6; x <= Math.sqrt(n) + 1; x += 6) {
    if (n % (x - 1) === 0 || n % (x + 1) === 0) {
      return false;
    }
  }
  return true;
}
`);
    code = functionName + '(' + numberToCheck + ')';
  } else if (dropdownProperty === 'DIVISIBLE_BY') {
    const divisor = javascriptGenerator.valueToCode(block, 'DIVISOR',
        Order.MODULUS) || '0';
    code = numberToCheck + ' % ' + divisor + ' === 0';
  } else {
    code = numberToCheck + suffix;
  }
  return [code, outputOrder];
};

javascriptGenerator.forBlock['math_change'] = function(block, generator) {
  // Add to a variable in place.
  const argument0 = javascriptGenerator.valueToCode(block, 'DELTA',
      Order.ADDITION) || '0';
  const varName = javascriptGenerator.nameDB_.getName(
      block.getFieldValue('VAR'), NameType.VARIABLE);
  return varName + ' = (typeof ' + varName + ' === \'number\' ? ' + varName +
      ' : 0) + ' + argument0 + ';\n';
};

// Rounding functions have a single operand.
javascriptGenerator.forBlock['math_round'] =
    javascriptGenerator.forBlock['math_single'];
// Trigonometry functions have a single operand.
javascriptGenerator.forBlock['math_trig'] =
    javascriptGenerator.forBlock['math_single'];

javascriptGenerator.forBlock['math_on_list'] = function(block, generator) {
  // Math functions for lists.
  const func = block.getFieldValue('OP');
  let list;
  let code;
  switch (func) {
    case 'SUM':
      list = javascriptGenerator.valueToCode(block, 'LIST',
          Order.MEMBER) || '[]';
      code = list + '.reduce(function(x, y) {return x + y;}, 0)';
      break;
    case 'MIN':
      list = javascriptGenerator.valueToCode(block, 'LIST',
          Order.NONE) || '[]';
      code = 'Math.min.apply(null, ' + list + ')';
      break;
    case 'MAX':
      list = javascriptGenerator.valueToCode(block, 'LIST',
          Order.NONE) || '[]';
      code = 'Math.max.apply(null, ' + list + ')';
      break;
    case 'AVERAGE': {
      // mathMean([null,null,1,3]) === 2.0.
      const functionName = javascriptGenerator.provideFunction_('mathMean', `
function ${javascriptGenerator.FUNCTION_NAME_PLACEHOLDER_}(myList) {
  return myList.reduce(function(x, y) {return x + y;}, 0) / myList.length;
}
`);
      list = javascriptGenerator.valueToCode(block, 'LIST',
          Order.NONE) || '[]';
      code = functionName + '(' + list + ')';
      break;
    }
    case 'MEDIAN': {
      // mathMedian([null,null,1,3]) === 2.0.
      const functionName = javascriptGenerator.provideFunction_('mathMedian', `
function ${javascriptGenerator.FUNCTION_NAME_PLACEHOLDER_}(myList) {
  var localList = myList.filter(function (x) {return typeof x === 'number';});
  if (!localList.length) return null;
  localList.sort(function(a, b) {return b - a;});
  if (localList.length % 2 === 0) {
    return (localList[localList.length / 2 - 1] + localList[localList.length / 2]) / 2;
  } else {
    return localList[(localList.length - 1) / 2];
  }
}
`);
      list = javascriptGenerator.valueToCode(block, 'LIST',
          Order.NONE) || '[]';
      code = functionName + '(' + list + ')';
      break;
    }
    case 'MODE': {
      // As a list of numbers can contain more than one mode,
      // the returned result is provided as an array.
      // Mode of [3, 'x', 'x', 1, 1, 2, '3'] -> ['x', 1].
      const functionName = javascriptGenerator.provideFunction_('mathModes', `
function ${javascriptGenerator.FUNCTION_NAME_PLACEHOLDER_}(values) {
  var modes = [];
  var counts = [];
  var maxCount = 0;
  for (var i = 0; i < values.length; i++) {
    var value = values[i];
    var found = false;
    var thisCount;
    for (var j = 0; j < counts.length; j++) {
      if (counts[j][0] === value) {
        thisCount = ++counts[j][1];
        found = true;
        break;
      }
    }
    if (!found) {
      counts.push([value, 1]);
      thisCount = 1;
    }
    maxCount = Math.max(thisCount, maxCount);
  }
  for (var j = 0; j < counts.length; j++) {
    if (counts[j][1] === maxCount) {
        modes.push(counts[j][0]);
    }
  }
  return modes;
}
`);
      list = javascriptGenerator.valueToCode(block, 'LIST',
          Order.NONE) || '[]';
      code = functionName + '(' + list + ')';
      break;
    }
    case 'STD_DEV': {
      const functionName =
          javascriptGenerator.provideFunction_('mathStandardDeviation', `
function ${javascriptGenerator.FUNCTION_NAME_PLACEHOLDER_}(numbers) {
  var n = numbers.length;
  if (!n) return null;
  var mean = numbers.reduce(function(x, y) {return x + y;}) / n;
  var variance = 0;
  for (var j = 0; j < n; j++) {
    variance += Math.pow(numbers[j] - mean, 2);
  }
  variance = variance / n;
  return Math.sqrt(variance);
}
`);
      list = javascriptGenerator.valueToCode(block, 'LIST',
          Order.NONE) || '[]';
      code = functionName + '(' + list + ')';
      break;
    }
    case 'RANDOM': {
      const functionName =
          javascriptGenerator.provideFunction_('mathRandomList', `
function ${javascriptGenerator.FUNCTION_NAME_PLACEHOLDER_}(list) {
  var x = Math.floor(Math.random() * list.length);
  return list[x];
}
`);
      list = javascriptGenerator.valueToCode(block, 'LIST',
          Order.NONE) || '[]';
      code = functionName + '(' + list + ')';
      break;
    }
    default:
      throw Error('Unknown operator: ' + func);
  }
  return [code, Order.FUNCTION_CALL];
};

javascriptGenerator.forBlock['math_modulo'] = function(block, generator) {
  // Remainder computation.
  const argument0 = javascriptGenerator.valueToCode(block, 'DIVIDEND',
      Order.MODULUS) || '0';
  const argument1 = javascriptGenerator.valueToCode(block, 'DIVISOR',
      Order.MODULUS) || '0';
  const code = argument0 + ' % ' + argument1;
  return [code, Order.MODULUS];
};

javascriptGenerator.forBlock['math_constrain'] = function(block, generator) {
  // Constrain a number between two limits.
  const argument0 = javascriptGenerator.valueToCode(block, 'VALUE',
      Order.NONE) || '0';
  const argument1 = javascriptGenerator.valueToCode(block, 'LOW',
      Order.NONE) || '0';
  const argument2 = javascriptGenerator.valueToCode(block, 'HIGH',
      Order.NONE) || 'Infinity';
  const code = 'Math.min(Math.max(' + argument0 + ', ' + argument1 + '), ' +
      argument2 + ')';
  return [code, Order.FUNCTION_CALL];
};

javascriptGenerator.forBlock['math_random_int'] = function(block, generator) {
  // Random integer between [X] and [Y].
  const argument0 = javascriptGenerator.valueToCode(block, 'FROM',
      Order.NONE) || '0';
  const argument1 = javascriptGenerator.valueToCode(block, 'TO',
      Order.NONE) || '0';
  const functionName = javascriptGenerator.provideFunction_('mathRandomInt', `
function ${javascriptGenerator.FUNCTION_NAME_PLACEHOLDER_}(a, b) {
  if (a > b) {
    // Swap a and b to ensure a is smaller.
    var c = a;
    a = b;
    b = c;
  }
  return Math.floor(Math.random() * (b - a + 1) + a);
}
`);
  const code = functionName + '(' + argument0 + ', ' + argument1 + ')';
  return [code, Order.FUNCTION_CALL];
};

javascriptGenerator.forBlock['math_random_float'] = function(block, generator) {
  // Random fraction between 0 and 1.
  return ['Math.random()', Order.FUNCTION_CALL];
};

javascriptGenerator.forBlock['math_atan2'] = function(block, generator) {
  // Arctangent of point (X, Y) in degrees from -180 to 180.
  const argument0 = javascriptGenerator.valueToCode(block, 'X',
      Order.NONE) || '0';
  const argument1 = javascriptGenerator.valueToCode(block, 'Y',
      Order.NONE) || '0';
  return ['Math.atan2(' + argument1 + ', ' + argument0 + ') / Math.PI * 180',
      Order.DIVISION];
};
