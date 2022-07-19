/**
 * @license
 * Copyright 2015 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Generating PHP for list blocks.
 */

/**
 * Lists in PHP are known to break when non-variables are passed into blocks
 * that require a list. PHP, unlike other languages, passes arrays as reference
 * value instead of value so we are unable to support it to the extent we can
 * for the other languages.
 * For example, a ternary operator with two arrays will return the array by
 * value and that cannot be passed into any of the built-in array functions for
 * PHP (because only variables can be passed by reference).
 * ex:  end(true ? list1 : list2)
 */
'use strict';

goog.module('Blockly.PHP.lists');

const PHP = goog.require('Blockly.PHP');
const stringUtils = goog.require('Blockly.utils.string');
const {NameType} = goog.require('Blockly.Names');


PHP['lists_create_empty'] = function(block) {
  // Create an empty list.
  return ['array()', PHP.ORDER_FUNCTION_CALL];
};

PHP['lists_create_with'] = function(block) {
  // Create a list with any number of elements of any type.
  let code = new Array(block.itemCount_);
  for (let i = 0; i < block.itemCount_; i++) {
    code[i] = PHP.valueToCode(block, 'ADD' + i, PHP.ORDER_NONE) || 'null';
  }
  code = 'array(' + code.join(', ') + ')';
  return [code, PHP.ORDER_FUNCTION_CALL];
};

PHP['lists_repeat'] = function(block) {
  // Create a list with one element repeated.
  const functionName = PHP.provideFunction_('lists_repeat', `
function ${PHP.FUNCTION_NAME_PLACEHOLDER_}($value, $count) {
  $array = array();
  for ($index = 0; $index < $count; $index++) {
    $array[] = $value;
  }
  return $array;
}
`);
  const element = PHP.valueToCode(block, 'ITEM', PHP.ORDER_NONE) || 'null';
  const repeatCount = PHP.valueToCode(block, 'NUM', PHP.ORDER_NONE) || '0';
  const code = functionName + '(' + element + ', ' + repeatCount + ')';
  return [code, PHP.ORDER_FUNCTION_CALL];
};

PHP['lists_length'] = function(block) {
  // String or array length.
  const functionName = PHP.provideFunction_('length', `
function ${PHP.FUNCTION_NAME_PLACEHOLDER_}($value) {
  if (is_string($value)) {
    return strlen($value);
  } else {
    return count($value);
  }
}
`);
  const list = PHP.valueToCode(block, 'VALUE', PHP.ORDER_NONE) || "''";
  return [functionName + '(' + list + ')', PHP.ORDER_FUNCTION_CALL];
};

PHP['lists_isEmpty'] = function(block) {
  // Is the string null or array empty?
  const argument0 =
      PHP.valueToCode(block, 'VALUE', PHP.ORDER_FUNCTION_CALL) || 'array()';
  return ['empty(' + argument0 + ')', PHP.ORDER_FUNCTION_CALL];
};

PHP['lists_indexOf'] = function(block) {
  // Find an item in the list.
  const argument0 = PHP.valueToCode(block, 'FIND', PHP.ORDER_NONE) || "''";
  const argument1 = PHP.valueToCode(block, 'VALUE', PHP.ORDER_MEMBER) || '[]';
  let errorIndex = ' -1';
  let indexAdjustment = '';
  if (block.workspace.options.oneBasedIndex) {
    errorIndex = ' 0';
    indexAdjustment = ' + 1';
  }
  let functionName;
  if (block.getFieldValue('END') === 'FIRST') {
    // indexOf
    functionName = PHP.provideFunction_('indexOf', `
function ${PHP.FUNCTION_NAME_PLACEHOLDER_}($haystack, $needle) {
  for ($index = 0; $index < count($haystack); $index++) {
    if ($haystack[$index] == $needle) return $index${indexAdjustment};
  }
  return ${errorIndex};
}
`);
  } else {
    // lastIndexOf
    functionName = PHP.provideFunction_('lastIndexOf', `
function ${PHP.FUNCTION_NAME_PLACEHOLDER_}($haystack, $needle) {
  $last = ${errorIndex};
  for ($index = 0; $index < count($haystack); $index++) {
    if ($haystack[$index] == $needle) $last = $index${indexAdjustment};
  }
  return $last;
}
`);
  }

  const code = functionName + '(' + argument1 + ', ' + argument0 + ')';
  return [code, PHP.ORDER_FUNCTION_CALL];
};

PHP['lists_getIndex'] = function(block) {
  // Get element at index.
  const mode = block.getFieldValue('MODE') || 'GET';
  const where = block.getFieldValue('WHERE') || 'FROM_START';
  switch (where) {
    case 'FIRST':
      if (mode === 'GET') {
        const list =
            PHP.valueToCode(block, 'VALUE', PHP.ORDER_MEMBER) || 'array()';
        const code = list + '[0]';
        return [code, PHP.ORDER_MEMBER];
      } else if (mode === 'GET_REMOVE') {
        const list =
            PHP.valueToCode(block, 'VALUE', PHP.ORDER_NONE) || 'array()';
        const code = 'array_shift(' + list + ')';
        return [code, PHP.ORDER_FUNCTION_CALL];
      } else if (mode === 'REMOVE') {
        const list =
            PHP.valueToCode(block, 'VALUE', PHP.ORDER_NONE) || 'array()';
        return 'array_shift(' + list + ');\n';
      }
      break;
    case 'LAST':
      if (mode === 'GET') {
        const list =
            PHP.valueToCode(block, 'VALUE', PHP.ORDER_NONE) || 'array()';
        const code = 'end(' + list + ')';
        return [code, PHP.ORDER_FUNCTION_CALL];
      } else if (mode === 'GET_REMOVE') {
        const list =
            PHP.valueToCode(block, 'VALUE', PHP.ORDER_NONE) || 'array()';
        const code = 'array_pop(' + list + ')';
        return [code, PHP.ORDER_FUNCTION_CALL];
      } else if (mode === 'REMOVE') {
        const list =
            PHP.valueToCode(block, 'VALUE', PHP.ORDER_NONE) || 'array()';
        return 'array_pop(' + list + ');\n';
      }
      break;
    case 'FROM_START': {
      const at = PHP.getAdjusted(block, 'AT');
      if (mode === 'GET') {
        const list =
            PHP.valueToCode(block, 'VALUE', PHP.ORDER_MEMBER) || 'array()';
        const code = list + '[' + at + ']';
        return [code, PHP.ORDER_MEMBER];
      } else if (mode === 'GET_REMOVE') {
        const list =
            PHP.valueToCode(block, 'VALUE', PHP.ORDER_NONE) || 'array()';
        const code = 'array_splice(' + list + ', ' + at + ', 1)[0]';
        return [code, PHP.ORDER_FUNCTION_CALL];
      } else if (mode === 'REMOVE') {
        const list =
            PHP.valueToCode(block, 'VALUE', PHP.ORDER_NONE) || 'array()';
        return 'array_splice(' + list + ', ' + at + ', 1);\n';
      }
      break;
    }
    case 'FROM_END':
      if (mode === 'GET') {
        const list =
            PHP.valueToCode(block, 'VALUE', PHP.ORDER_NONE) || 'array()';
        const at = PHP.getAdjusted(block, 'AT', 1, true);
        const code = 'array_slice(' + list + ', ' + at + ', 1)[0]';
        return [code, PHP.ORDER_FUNCTION_CALL];
      } else if (mode === 'GET_REMOVE' || mode === 'REMOVE') {
        const list =
            PHP.valueToCode(block, 'VALUE', PHP.ORDER_NONE) || 'array()';
        const at =
            PHP.getAdjusted(block, 'AT', 1, false, PHP.ORDER_SUBTRACTION);
        const code = 'array_splice(' + list + ', count(' + list + ') - ' + at +
            ', 1)[0]';
        if (mode === 'GET_REMOVE') {
          return [code, PHP.ORDER_FUNCTION_CALL];
        } else if (mode === 'REMOVE') {
          return code + ';\n';
        }
      }
      break;
    case 'RANDOM': {
      const list = PHP.valueToCode(block, 'VALUE', PHP.ORDER_NONE) || 'array()';
      if (mode === 'GET') {
        const functionName = PHP.provideFunction_('lists_get_random_item', `
function ${PHP.FUNCTION_NAME_PLACEHOLDER_}($list) {
  return $list[rand(0,count($list)-1)];
}
`);
        const code = functionName + '(' + list + ')';
        return [code, PHP.ORDER_FUNCTION_CALL];
      } else if (mode === 'GET_REMOVE') {
        const functionName =
            PHP.provideFunction_('lists_get_remove_random_item', `
function ${PHP.FUNCTION_NAME_PLACEHOLDER_}(&$list) {
  $x = rand(0,count($list)-1);
  unset($list[$x]);
  return array_values($list);
}
`);
        const code = functionName + '(' + list + ')';
        return [code, PHP.ORDER_FUNCTION_CALL];
      } else if (mode === 'REMOVE') {
        const functionName = PHP.provideFunction_('lists_remove_random_item', `
function ${PHP.FUNCTION_NAME_PLACEHOLDER_}(&$list) {
  unset($list[rand(0,count($list)-1)]);
}
`);
        return functionName + '(' + list + ');\n';
      }
      break;
    }
  }
  throw Error('Unhandled combination (lists_getIndex).');
};

PHP['lists_setIndex'] = function(block) {
  // Set element at index.
  // Note: Until February 2013 this block did not have MODE or WHERE inputs.
  const mode = block.getFieldValue('MODE') || 'GET';
  const where = block.getFieldValue('WHERE') || 'FROM_START';
  const value = PHP.valueToCode(block, 'TO', PHP.ORDER_ASSIGNMENT) || 'null';
  // Cache non-trivial values to variables to prevent repeated look-ups.
  // Closure, which accesses and modifies 'list'.
  let cachedList;
  function cacheList() {
    if (cachedList.match(/^\$\w+$/)) {
      return '';
    }
    const listVar = PHP.nameDB_.getDistinctName('tmp_list', NameType.VARIABLE);
    const code = listVar + ' = &' + cachedList + ';\n';
    cachedList = listVar;
    return code;
  }
  switch (where) {
    case 'FIRST':
      if (mode === 'SET') {
        const list =
            PHP.valueToCode(block, 'LIST', PHP.ORDER_MEMBER) || 'array()';
        return list + '[0] = ' + value + ';\n';
      } else if (mode === 'INSERT') {
        const list =
            PHP.valueToCode(block, 'LIST', PHP.ORDER_NONE) || 'array()';
        return 'array_unshift(' + list + ', ' + value + ');\n';
      }
      break;
    case 'LAST': {
      const list = PHP.valueToCode(block, 'LIST', PHP.ORDER_NONE) || 'array()';
      if (mode === 'SET') {
        const functionName = PHP.provideFunction_('lists_set_last_item', `
function ${PHP.FUNCTION_NAME_PLACEHOLDER_}(&$list, $value) {
  $list[count($list) - 1] = $value;
}
`);
        return functionName + '(' + list + ', ' + value + ');\n';
      } else if (mode === 'INSERT') {
        return 'array_push(' + list + ', ' + value + ');\n';
      }
      break;
    }
    case 'FROM_START': {
      const at = PHP.getAdjusted(block, 'AT');
      if (mode === 'SET') {
        const list =
            PHP.valueToCode(block, 'LIST', PHP.ORDER_MEMBER) || 'array()';
        return list + '[' + at + '] = ' + value + ';\n';
      } else if (mode === 'INSERT') {
        const list =
            PHP.valueToCode(block, 'LIST', PHP.ORDER_NONE) || 'array()';
        return 'array_splice(' + list + ', ' + at + ', 0, ' + value + ');\n';
      }
      break;
    }
    case 'FROM_END': {
      const list = PHP.valueToCode(block, 'LIST', PHP.ORDER_NONE) || 'array()';
      const at = PHP.getAdjusted(block, 'AT', 1);
      if (mode === 'SET') {
        const functionName = PHP.provideFunction_('lists_set_from_end', `
function ${PHP.FUNCTION_NAME_PLACEHOLDER_}(&$list, $at, $value) {
  $list[count($list) - $at] = $value;
}
`);
        return functionName + '(' + list + ', ' + at + ', ' + value + ');\n';
      } else if (mode === 'INSERT') {
        const functionName = PHP.provideFunction_('lists_insert_from_end', `
function ${PHP.FUNCTION_NAME_PLACEHOLDER_}(&$list, $at, $value) {
  return array_splice($list, count($list) - $at, 0, $value);
}
`);
        return functionName + '(' + list + ', ' + at + ', ' + value + ');\n';
      }
      break;
    }
    case 'RANDOM':
      cachedList =
          PHP.valueToCode(block, 'LIST', PHP.ORDER_REFERENCE) || 'array()';
      let code = cacheList();
      const list = cachedList;
      const xVar = PHP.nameDB_.getDistinctName('tmp_x', NameType.VARIABLE);
      code += xVar + ' = rand(0, count(' + list + ')-1);\n';
      if (mode === 'SET') {
        code += list + '[' + xVar + '] = ' + value + ';\n';
        return code;
      } else if (mode === 'INSERT') {
        code += 'array_splice(' + list + ', ' + xVar + ', 0, ' + value + ');\n';
        return code;
      }
      break;
  }
  throw Error('Unhandled combination (lists_setIndex).');
};

PHP['lists_getSublist'] = function(block) {
  // Get sublist.
  const list = PHP.valueToCode(block, 'LIST', PHP.ORDER_NONE) || 'array()';
  const where1 = block.getFieldValue('WHERE1');
  const where2 = block.getFieldValue('WHERE2');
  let code;
  if (where1 === 'FIRST' && where2 === 'LAST') {
    code = list;
  } else if (
      list.match(/^\$\w+$/) ||
      (where1 !== 'FROM_END' && where2 === 'FROM_START')) {
    // If the list is a simple value or doesn't require a call for length, don't
    // generate a helper function.
    let at1;
    switch (where1) {
      case 'FROM_START':
        at1 = PHP.getAdjusted(block, 'AT1');
        break;
      case 'FROM_END':
        at1 = PHP.getAdjusted(block, 'AT1', 1, false, PHP.ORDER_SUBTRACTION);
        at1 = 'count(' + list + ') - ' + at1;
        break;
      case 'FIRST':
        at1 = '0';
        break;
      default:
        throw Error('Unhandled option (lists_getSublist).');
    }
    let at2;
    let length;
    switch (where2) {
      case 'FROM_START':
        at2 = PHP.getAdjusted(block, 'AT2', 0, false, PHP.ORDER_SUBTRACTION);
        length = at2 + ' - ';
        if (stringUtils.isNumber(String(at1)) ||
            String(at1).match(/^\(.+\)$/)) {
          length += at1;
        } else {
          length += '(' + at1 + ')';
        }
        length += ' + 1';
        break;
      case 'FROM_END':
        at2 = PHP.getAdjusted(block, 'AT2', 0, false, PHP.ORDER_SUBTRACTION);
        length = 'count(' + list + ') - ' + at2 + ' - ';
        if (stringUtils.isNumber(String(at1)) ||
            String(at1).match(/^\(.+\)$/)) {
          length += at1;
        } else {
          length += '(' + at1 + ')';
        }
        break;
      case 'LAST':
        length = 'count(' + list + ') - ';
        if (stringUtils.isNumber(String(at1)) ||
            String(at1).match(/^\(.+\)$/)) {
          length += at1;
        } else {
          length += '(' + at1 + ')';
        }
        break;
      default:
        throw Error('Unhandled option (lists_getSublist).');
    }
    code = 'array_slice(' + list + ', ' + at1 + ', ' + length + ')';
  } else {
    const at1 = PHP.getAdjusted(block, 'AT1');
    const at2 = PHP.getAdjusted(block, 'AT2');
    const functionName = PHP.provideFunction_('lists_get_sublist', `
function ${PHP.FUNCTION_NAME_PLACEHOLDER_}($list, $where1, $at1, $where2, $at2) {
  if ($where1 == 'FROM_END') {
    $at1 = count($list) - 1 - $at1;
  } else if ($where1 == 'FIRST') {
    $at1 = 0;
  } else if ($where1 != 'FROM_START') {
    throw new Exception('Unhandled option (lists_get_sublist).');
  }
  $length = 0;
  if ($where2 == 'FROM_START') {
    $length = $at2 - $at1 + 1;
  } else if ($where2 == 'FROM_END') {
    $length = count($list) - $at1 - $at2;
  } else if ($where2 == 'LAST') {
    $length = count($list) - $at1;
  } else {
    throw new Exception('Unhandled option (lists_get_sublist).');
  }
  return array_slice($list, $at1, $length);
}
`);
    code = functionName + '(' + list + ', \'' + where1 + '\', ' + at1 + ', \'' +
        where2 + '\', ' + at2 + ')';
  }
  return [code, PHP.ORDER_FUNCTION_CALL];
};

PHP['lists_sort'] = function(block) {
  // Block for sorting a list.
  const listCode = PHP.valueToCode(block, 'LIST', PHP.ORDER_NONE) || 'array()';
  const direction = block.getFieldValue('DIRECTION') === '1' ? 1 : -1;
  const type = block.getFieldValue('TYPE');
  const functionName = PHP.provideFunction_('lists_sort', `
function ${PHP.FUNCTION_NAME_PLACEHOLDER_}($list, $type, $direction) {
  $sortCmpFuncs = array(
    'NUMERIC' => 'strnatcasecmp',
    'TEXT' => 'strcmp',
    'IGNORE_CASE' => 'strcasecmp'
  );
  $sortCmp = $sortCmpFuncs[$type];
  $list2 = $list;
  usort($list2, $sortCmp);
  if ($direction == -1) {
    $list2 = array_reverse($list2);
  }
  return $list2;
}
`);
  const sortCode =
      functionName + '(' + listCode + ', "' + type + '", ' + direction + ')';
  return [sortCode, PHP.ORDER_FUNCTION_CALL];
};

PHP['lists_split'] = function(block) {
  // Block for splitting text into a list, or joining a list into text.
  let value_input = PHP.valueToCode(block, 'INPUT', PHP.ORDER_NONE);
  const value_delim = PHP.valueToCode(block, 'DELIM', PHP.ORDER_NONE) || "''";
  const mode = block.getFieldValue('MODE');
  let functionName;
  if (mode === 'SPLIT') {
    if (!value_input) {
      value_input = "''";
    }
    functionName = 'explode';
  } else if (mode === 'JOIN') {
    if (!value_input) {
      value_input = 'array()';
    }
    functionName = 'implode';
  } else {
    throw Error('Unknown mode: ' + mode);
  }
  const code = functionName + '(' + value_delim + ', ' + value_input + ')';
  return [code, PHP.ORDER_FUNCTION_CALL];
};

PHP['lists_reverse'] = function(block) {
  // Block for reversing a list.
  const list = PHP.valueToCode(block, 'LIST', PHP.ORDER_NONE) || '[]';
  const code = 'array_reverse(' + list + ')';
  return [code, PHP.ORDER_FUNCTION_CALL];
};
