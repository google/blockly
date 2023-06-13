/**
 * @license
 * Copyright 2014 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Generating Dart for text blocks.
 */

import * as goog from '../../closure/goog/goog.js';
goog.declareModuleId('Blockly.Dart.texts');

import {NameType} from '../../core/names.js';
import {dartGenerator, Order} from '../dart.js';


dartGenerator.addReservedWords('Html,Math');

dartGenerator.forBlock['text'] = function(block) {
  // Text value.
  const code = dartGenerator.quote_(block.getFieldValue('TEXT'));
  return [code, Order.ATOMIC];
};

dartGenerator.forBlock['text_multiline'] = function(block) {
  // Text value.
  const code = dartGenerator.multiline_quote_(block.getFieldValue('TEXT'));
  const order =
      code.indexOf('+') !== -1 ? Order.ADDITIVE : Order.ATOMIC;
  return [code, order];
};

dartGenerator.forBlock['text_join'] = function(block) {
  // Create a string made up of any number of elements of any type.
  switch (block.itemCount_) {
    case 0:
      return ["''", Order.ATOMIC];
    case 1: {
      const element =
          dartGenerator.valueToCode(block, 'ADD0', Order.UNARY_POSTFIX) || "''";
      const code = element + '.toString()';
      return [code, Order.UNARY_POSTFIX];
    }
    default: {
      const elements = new Array(block.itemCount_);
      for (let i = 0; i < block.itemCount_; i++) {
        elements[i] =
            dartGenerator.valueToCode(block, 'ADD' + i, Order.NONE) || "''";
      }
      const code = '[' + elements.join(',') + '].join()';
      return [code, Order.UNARY_POSTFIX];
    }
  }
};

dartGenerator.forBlock['text_append'] = function(block) {
  // Append to a variable in place.
  const varName =
      dartGenerator.nameDB_.getName(
        block.getFieldValue('VAR'), NameType.VARIABLE);
  const value = dartGenerator.valueToCode(block, 'TEXT', Order.NONE) || "''";
  return varName + ' = [' + varName + ', ' + value + '].join();\n';
};

dartGenerator.forBlock['text_length'] = function(block) {
  // String or array length.
  const text =
      dartGenerator.valueToCode(block, 'VALUE', Order.UNARY_POSTFIX) || "''";
  return [text + '.length', Order.UNARY_POSTFIX];
};

dartGenerator.forBlock['text_isEmpty'] = function(block) {
  // Is the string null or array empty?
  const text =
      dartGenerator.valueToCode(block, 'VALUE', Order.UNARY_POSTFIX) || "''";
  return [text + '.isEmpty', Order.UNARY_POSTFIX];
};

dartGenerator.forBlock['text_indexOf'] = function(block) {
  // Search the text for a substring.
  const operator =
      block.getFieldValue('END') === 'FIRST' ? 'indexOf' : 'lastIndexOf';
  const substring =
      dartGenerator.valueToCode(block, 'FIND', Order.NONE) || "''";
  const text =
      dartGenerator.valueToCode(block, 'VALUE', Order.UNARY_POSTFIX) || "''";
  const code = text + '.' + operator + '(' + substring + ')';
  if (block.workspace.options.oneBasedIndex) {
    return [code + ' + 1', Order.ADDITIVE];
  }
  return [code, Order.UNARY_POSTFIX];
};

dartGenerator.forBlock['text_charAt'] = function(block) {
  // Get letter at index.
  // Note: Until January 2013 this block did not have the WHERE input.
  const where = block.getFieldValue('WHERE') || 'FROM_START';
  const textOrder = (where === 'FIRST' || where === 'FROM_START') ?
      Order.UNARY_POSTFIX :
      Order.NONE;
  const text = dartGenerator.valueToCode(block, 'VALUE', textOrder) || "''";
  let at;
  switch (where) {
    case 'FIRST': {
      const code = text + '[0]';
      return [code, Order.UNARY_POSTFIX];
    }
    case 'FROM_START': {
      at = dartGenerator.getAdjusted(block, 'AT');
      const code = text + '[' + at + ']';
      return [code, Order.UNARY_POSTFIX];
    }
    case 'LAST':
      at = 1;
      // Fall through.
    case 'FROM_END': {
      at = dartGenerator.getAdjusted(block, 'AT', 1);
      const functionName = dartGenerator.provideFunction_('text_get_from_end', `
String ${dartGenerator.FUNCTION_NAME_PLACEHOLDER_}(String text, num x) {
  return text[text.length - x];
}
`);
      const code = functionName + '(' + text + ', ' + at + ')';
      return [code, Order.UNARY_POSTFIX];
    }
    case 'RANDOM': {
      dartGenerator.definitions_['import_dart_math'] =
          'import \'dart:math\' as Math;';
      const functionName =
          dartGenerator.provideFunction_('text_random_letter', `
String ${dartGenerator.FUNCTION_NAME_PLACEHOLDER_}(String text) {
  int x = new Math.Random().nextInt(text.length);
  return text[x];
}
`);
      const code = functionName + '(' + text + ')';
      return [code, Order.UNARY_POSTFIX];
    }
  }
  throw Error('Unhandled option (text_charAt).');
};

dartGenerator.forBlock['text_getSubstring'] = function(block) {
  // Get substring.
  const where1 = block.getFieldValue('WHERE1');
  const where2 = block.getFieldValue('WHERE2');
  const requiresLengthCall = (where1 !== 'FROM_END' && where2 === 'FROM_START');
  const textOrder =
      requiresLengthCall ? Order.UNARY_POSTFIX : Order.NONE;
  const text = dartGenerator.valueToCode(block, 'STRING', textOrder) || "''";
  let code;
  if (where1 === 'FIRST' && where2 === 'LAST') {
    code = text;
    return [code, Order.NONE];
  } else if (text.match(/^'?\w+'?$/) || requiresLengthCall) {
    // If the text is a variable or literal or doesn't require a call for
    // length, don't generate a helper function.
    let at1;
    switch (where1) {
      case 'FROM_START':
        at1 = dartGenerator.getAdjusted(block, 'AT1');
        break;
      case 'FROM_END':
        at1 = dartGenerator.getAdjusted(block, 'AT1', 1, false, Order.ADDITIVE);
        at1 = text + '.length - ' + at1;
        break;
      case 'FIRST':
        at1 = '0';
        break;
      default:
        throw Error('Unhandled option (text_getSubstring).');
    }
    let at2;
    switch (where2) {
      case 'FROM_START':
        at2 = dartGenerator.getAdjusted(block, 'AT2', 1);
        break;
      case 'FROM_END':
        at2 = dartGenerator.getAdjusted(block, 'AT2', 0, false, Order.ADDITIVE);
        at2 = text + '.length - ' + at2;
        break;
      case 'LAST':
        break;
      default:
        throw Error('Unhandled option (text_getSubstring).');
    }

    if (where2 === 'LAST') {
      code = text + '.substring(' + at1 + ')';
    } else {
      code = text + '.substring(' + at1 + ', ' + at2 + ')';
    }
  } else {
    const at1 = dartGenerator.getAdjusted(block, 'AT1');
    const at2 = dartGenerator.getAdjusted(block, 'AT2');
    const functionName =
        dartGenerator.provideFunction_('text_get_substring', `
String ${dartGenerator.FUNCTION_NAME_PLACEHOLDER_}(String text, String where1, num at1, String where2, num at2) {
  int getAt(String where, num at) {
    if (where == 'FROM_END') {
      at = text.length - 1 - at;
    } else if (where == 'FIRST') {
      at = 0;
    } else if (where == 'LAST') {
      at = text.length - 1;
    } else if (where != 'FROM_START') {
      throw 'Unhandled option (text_getSubstring).';
    }
    return at;
  }
  at1 = getAt(where1, at1);
  at2 = getAt(where2, at2) + 1;
  return text.substring(at1, at2);
}
`);
    code = functionName + '(' + text + ', \'' + where1 + '\', ' + at1 + ', \'' +
        where2 + '\', ' + at2 + ')';
  }
  return [code, Order.UNARY_POSTFIX];
};

dartGenerator.forBlock['text_changeCase'] = function(block) {
  // Change capitalization.
  const OPERATORS = {
    'UPPERCASE': '.toUpperCase()',
    'LOWERCASE': '.toLowerCase()',
    'TITLECASE': null
  };
  const operator = OPERATORS[block.getFieldValue('CASE')];
  const textOrder = operator ? Order.UNARY_POSTFIX : Order.NONE;
  const text = dartGenerator.valueToCode(block, 'TEXT', textOrder) || "''";
  let code;
  if (operator) {
    // Upper and lower case are functions built into dartGenerator.
    code = text + operator;
  } else {
    // Title case is not a native dartGenerator function.  Define one.
    const functionName = dartGenerator.provideFunction_('text_toTitleCase', `
String ${dartGenerator.FUNCTION_NAME_PLACEHOLDER_}(String str) {
  RegExp exp = new RegExp(r'\\b');
  List<String> list = str.split(exp);
  final title = new StringBuffer();
  for (String part in list) {
    if (part.length > 0) {
      title.write(part[0].toUpperCase());
      if (part.length > 0) {
        title.write(part.substring(1).toLowerCase());
      }
    }
  }
  return title.toString();
}
`);
    code = functionName + '(' + text + ')';
  }
  return [code, Order.UNARY_POSTFIX];
};

dartGenerator.forBlock['text_trim'] = function(block) {
  // Trim spaces.
  const OPERATORS = {
    'LEFT': '.replaceFirst(new RegExp(r\'^\\s+\'), \'\')',
    'RIGHT': '.replaceFirst(new RegExp(r\'\\s+$\'), \'\')',
    'BOTH': '.trim()'
  };
  const operator = OPERATORS[block.getFieldValue('MODE')];
  const text =
      dartGenerator.valueToCode(block, 'TEXT', Order.UNARY_POSTFIX) || "''";
  return [text + operator, Order.UNARY_POSTFIX];
};

dartGenerator.forBlock['text_print'] = function(block) {
  // Print statement.
  const msg = dartGenerator.valueToCode(block, 'TEXT', Order.NONE) || "''";
  return 'print(' + msg + ');\n';
};

dartGenerator.forBlock['text_prompt_ext'] = function(block) {
  // Prompt function.
  dartGenerator.definitions_['import_dart_html'] =
      'import \'dart:html\' as Html;';
  let msg;
  if (block.getField('TEXT')) {
    // Internal message.
    msg = dartGenerator.quote_(block.getFieldValue('TEXT'));
  } else {
    // External message.
    msg = dartGenerator.valueToCode(block, 'TEXT', Order.NONE) || "''";
  }
  let code = 'Html.window.prompt(' + msg + ', \'\')';
  const toNumber = block.getFieldValue('TYPE') === 'NUMBER';
  if (toNumber) {
    dartGenerator.definitions_['import_dart_math'] =
        'import \'dart:math\' as Math;';
    code = 'Math.parseDouble(' + code + ')';
  }
  return [code, Order.UNARY_POSTFIX];
};

dartGenerator.forBlock['text_prompt'] =
    dartGenerator.forBlock['text_prompt_ext'];

dartGenerator.forBlock['text_count'] = function(block) {
  const text = dartGenerator.valueToCode(block, 'TEXT', Order.NONE) || "''";
  const sub = dartGenerator.valueToCode(block, 'SUB', Order.NONE) || "''";
  // Substring count is not a native dartGenerator function.  Define one.
  const functionName = dartGenerator.provideFunction_('text_count', `
int ${dartGenerator.FUNCTION_NAME_PLACEHOLDER_}(String haystack, String needle) {
  if (needle.length == 0) {
    return haystack.length + 1;
  }
  int index = 0;
  int count = 0;
  while (index != -1) {
    index = haystack.indexOf(needle, index);
    if (index != -1) {
      count++;
     index += needle.length;
    }
  }
  return count;
}
`);
  const code = functionName + '(' + text + ', ' + sub + ')';
  return [code, Order.UNARY_POSTFIX];
};

dartGenerator.forBlock['text_replace'] = function(block) {
  const text =
      dartGenerator.valueToCode(block, 'TEXT', Order.UNARY_POSTFIX) || "''";
  const from = dartGenerator.valueToCode(block, 'FROM', Order.NONE) || "''";
  const to = dartGenerator.valueToCode(block, 'TO', Order.NONE) || "''";
  const code = text + '.replaceAll(' + from + ', ' + to + ')';
  return [code, Order.UNARY_POSTFIX];
};

dartGenerator.forBlock['text_reverse'] = function(block) {
  // There isn't a sensible way to do this in dartGenerator. See:
  // http://stackoverflow.com/a/21613700/3529104
  // Implementing something is possibly better than not implementing anything?
  const text =
      dartGenerator.valueToCode(block, 'TEXT', Order.UNARY_POSTFIX) || "''";
  const code = 'new String.fromCharCodes(' + text + '.runes.toList().reversed)';
  return [code, Order.UNARY_PREFIX];
};
