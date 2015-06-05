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
 * @fileoverview Generating PHP for list blocks.
 * @author daarond@gmail.com (Daaron Dwyer)
 */
'use strict';

goog.provide('Blockly.PHP.lists');

goog.require('Blockly.PHP');


Blockly.PHP['lists_create_empty'] = function(block) {
  // Create an empty list.
  return ['array()', Blockly.PHP.ORDER_ATOMIC];
};

Blockly.PHP['lists_create_with'] = function(block) {
  // Create a list with any number of elements of any type.
  var code = new Array(block.itemCount_);
  for (var n = 0; n < block.itemCount_; n++) {
    code[n] = Blockly.PHP.valueToCode(block, 'ADD' + n,
        Blockly.PHP.ORDER_COMMA) || 'null';
  }
  code = 'array(' + code.join(', ') + ')';
  return [code, Blockly.PHP.ORDER_ATOMIC];
};

Blockly.PHP['lists_repeat'] = function(block) {
  // Create a list with one element repeated.
  var functionName = Blockly.PHP.provideFunction_(
      'lists_repeat',
      [ 'function ' + Blockly.PHP.FUNCTION_NAME_PLACEHOLDER_ +
          '($value, $count) {',
        '  $array = array();',
        '  for ($index = 0; $index < $count; $index++) {',
        '    $array[] = $value;',
        '  }',
        '  return $array;',
        '}']);
  var argument0 = Blockly.PHP.valueToCode(block, 'ITEM',
      Blockly.PHP.ORDER_COMMA) || 'null';
  var argument1 = Blockly.PHP.valueToCode(block, 'NUM',
      Blockly.PHP.ORDER_COMMA) || '0';
  var code = functionName + '(' + argument0 + ', ' + argument1 + ')';
  return [code, Blockly.PHP.ORDER_FUNCTION_CALL];
};

Blockly.PHP['lists_length'] = function(block) {
  // List length.
  var argument0 = Blockly.PHP.valueToCode(block, 'VALUE',
      Blockly.PHP.ORDER_FUNCTION_CALL) || 'array()';
  return ['count(' + argument0 + ')', Blockly.PHP.ORDER_FUNCTION_CALL];
};

Blockly.PHP['lists_isEmpty'] = function(block) {
  // Is the list empty?
  var argument0 = Blockly.PHP.valueToCode(block, 'VALUE',
      Blockly.PHP.ORDER_FUNCTION_CALL) || 'array()';
  return ['empty(' + argument0 + ')', Blockly.PHP.ORDER_FUNCTION_CALL];
};

Blockly.PHP['lists_indexOf'] = function(block) {
  // Find an item in the list.
  var operator = block.getFieldValue('END') == 'FIRST' ?
      'indexOf' : 'lastIndexOf';
  var argument0 = Blockly.PHP.valueToCode(block, 'FIND',
      Blockly.PHP.ORDER_NONE) || '\'\'';
  var argument1 = Blockly.PHP.valueToCode(block, 'VALUE',
      Blockly.PHP.ORDER_MEMBER) || '[]';
  var functionName;
  if (block.getFieldValue('END') == 'FIRST'){
    // indexOf
    functionName = Blockly.PHP.provideFunction_(
        'indexOf',
        [ 'function ' + Blockly.PHP.FUNCTION_NAME_PLACEHOLDER_ +
        '($haystack, $needle) {',
          '  for ($index = 0; $index < count($haystack); $index++) {',
          '    if ($haystack[$index] == $needle) return $index+1;',
          '  }',
          '  return 0;',
          '}']);
  } else {
    // lastIndexOf
    functionName = Blockly.PHP.provideFunction_(
        'lastIndexOf',
        [ 'function ' + Blockly.PHP.FUNCTION_NAME_PLACEHOLDER_ +
        '($haystack, $needle) {',
          '  $last = 0;',
          '  for ($index = 0; $index < count($haystack); $index++) {',
          '    if ($haystack[$index] == $needle) $last = $index+1;',
          '  }',
          '  return $last;',
          '}']);
  }

  var code = functionName + '(' + argument1 + ', ' + argument0 + ')';
  return [code, Blockly.PHP.ORDER_FUNCTION_CALL];
};

Blockly.PHP['lists_getIndex'] = function(block) {
  // Get element at index.
  var mode = block.getFieldValue('MODE') || 'GET';
  var where = block.getFieldValue('WHERE') || 'FROM_START';
  var at = Blockly.PHP.valueToCode(block, 'AT',
      Blockly.PHP.ORDER_UNARY_NEGATION) || '1';
  var list = Blockly.PHP.valueToCode(block, 'VALUE',
      Blockly.PHP.ORDER_FUNCTION_CALL) || 'array()';

  if (where == 'FIRST') {
    if (mode == 'GET') {
      var code = list + '[0]';
      return [code, Blockly.PHP.ORDER_FUNCTION_CALL];
    } else if (mode == 'GET_REMOVE') {
      var code = 'array_shift(' + list + ')';
      return [code, Blockly.PHP.ORDER_FUNCTION_CALL];
    } else if (mode == 'REMOVE') {
      return 'array_shift(' + list + ');\n';
    }
  } else if (where == 'LAST') {
    if (mode == 'GET') {
      var code = 'end(' + list + ')';
      return [code, Blockly.PHP.ORDER_FUNCTION_CALL];
    } else if (mode == 'GET_REMOVE') {
      var code = 'array_pop(' + list + ')';
      return [code, Blockly.PHP.ORDER_FUNCTION_CALL];
    } else if (mode == 'REMOVE') {
      return 'array_pop(' + list + ');\n';
    }
  } else if (where == 'FROM_START') {
    // Blockly uses one-based indicies.
    if (Blockly.isNumber(at)) {
      // If the index is a naked number, decrement it right now.
      at = parseFloat(at) - 1;
    } else {
      // If the index is dynamic, decrement it in code.
      at += ' - 1';
    }
    if (mode == 'GET') {
      var code = list + '[' + at + ']';
      return [code, Blockly.PHP.ORDER_FUNCTION_CALL];
    } else if (mode == 'GET_REMOVE') {
      var code = 'array_splice(' + list + ', ' + at + ', 1)[0]';
      return [code, Blockly.PHP.ORDER_FUNCTION_CALL];
    } else if (mode == 'REMOVE') {
      return 'array_splice(' + list + ', ' + at + ', 1);\n';
    }
  } else if (where == 'FROM_END') {
    if (mode == 'GET') {
      var code = 'array_slice(' + list + ', -' + at + ', 1)[0]';
      return [code, Blockly.PHP.ORDER_FUNCTION_CALL];
    } else if (mode == 'GET_REMOVE' || mode == 'REMOVE') {
      code = 'array_splice(' + list + ', count(' + list + ') - ' + at + ', 1)[0]';
      if (mode == 'GET_REMOVE') {
        return [code, Blockly.PHP.ORDER_FUNCTION_CALL];
      } else if (mode == 'REMOVE') {
        return code + ';\n';
      }
    }
  } else if (where == 'RANDOM') {
    if (mode == 'GET'){
      var functionName = Blockly.PHP.provideFunction_(
          'lists_get_random_item',
          [ 'function ' + Blockly.PHP.FUNCTION_NAME_PLACEHOLDER_ +
          '($list) {',
              '  return $list[rand(0,count($list)-1)];',
              '}']);
      code = functionName + '(' + list + ')';
      return [code, Blockly.PHP.ORDER_FUNCTION_CALL];
    } else if (mode == 'GET_REMOVE'){
      var functionName = Blockly.PHP.provideFunction_(
          'lists_get_remove_random_item',
          [ 'function ' + Blockly.PHP.FUNCTION_NAME_PLACEHOLDER_ +
          '(&$list) {',
            '  $x = rand(0,count($list)-1);',
            '  unset($list[$x]);',
            '  return array_values($list);',
            '}']);
      code = functionName + '(' + list + ')';
      return [code, Blockly.PHP.ORDER_FUNCTION_CALL];
    } else if (mode == 'REMOVE') {
      var functionName = Blockly.PHP.provideFunction_(
          'lists_remove_random_item',
          [ 'function ' + Blockly.PHP.FUNCTION_NAME_PLACEHOLDER_ +
          '(&$list) {',
              '  unset($list[rand(0,count($list)-1)]);',
              '}']);
      return functionName + '(' + list + ');\n';
    }
  }
  throw 'Unhandled combination (lists_getIndex).';
};

Blockly.PHP['lists_setIndex'] = function(block) {
  // Set element at index.
  // Note: Until February 2013 this block did not have MODE or WHERE inputs.
  var list = Blockly.PHP.valueToCode(block, 'LIST',
      Blockly.PHP.ORDER_MEMBER) || 'array()';
  var mode = block.getFieldValue('MODE') || 'GET';
  var where = block.getFieldValue('WHERE') || 'FROM_START';
  var at = Blockly.PHP.valueToCode(block, 'AT',
      Blockly.PHP.ORDER_NONE) || '1';
  var value = Blockly.PHP.valueToCode(block, 'TO',
      Blockly.PHP.ORDER_ASSIGNMENT) || 'null';
  // Cache non-trivial values to variables to prevent repeated look-ups.
  // Closure, which accesses and modifies 'list'.
  function cacheList() {
    if (list.match(/^\w+$/)) {
      return '';
    }
    var listVar = Blockly.PHP.variableDB_.getDistinctName(
        'tmp_list', Blockly.Variables.NAME_TYPE);
    var code = listVar + ' = &' + list + ';\n';
    list = listVar;
    return code;
  }
  if (where == 'FIRST') {
    if (mode == 'SET') {
      return list + '[0] = ' + value + ';\n';
    } else if (mode == 'INSERT') {
      return 'array_unshift(' + list + ', ' + value + ');\n';
    }
  } else if (where == 'LAST') {
    if (mode == 'SET') {
      var functionName = Blockly.PHP.provideFunction_(
          'lists_set_last_item',
          [ 'function ' + Blockly.PHP.FUNCTION_NAME_PLACEHOLDER_ +
          '(&$list, $value) {',
              '  $list[count($list) - 1] = $value;',
              '}']);
      return functionName + '(' + list + ', ' + value + ');\n';
    } else if (mode == 'INSERT') {
      return 'array_push(' + list + ', ' + value + ');\n';
    }
  } else if (where == 'FROM_START') {
    // Blockly uses one-based indicies.
    if (Blockly.isNumber(at)) {
      // If the index is a naked number, decrement it right now.
      at = parseFloat(at) - 1;
    } else {
      // If the index is dynamic, decrement it in code.
      at += ' - 1';
    }
    if (mode == 'SET') {
      return list + '[' + at + '] = ' + value + ';\n';
    } else if (mode == 'INSERT') {
      return 'array_splice(' + list + ', ' + at + ', 0, ' + value + ');\n';
    }
  } else if (where == 'FROM_END') {
    if (mode == 'SET') {
      var functionName = Blockly.PHP.provideFunction_(
          'lists_set_from_end',
          [ 'function ' + Blockly.PHP.FUNCTION_NAME_PLACEHOLDER_ +
          '(&$list, $at, $value) {',
              '  $list[count($list) - $at] = $value;',
              '}']);
      return functionName + '(' + list + ', ' + at + ', ' + value + ');\n';
    } else if (mode == 'INSERT') {
      var functionName = Blockly.PHP.provideFunction_(
          'lists_insert_from_end',
          [ 'function ' + Blockly.PHP.FUNCTION_NAME_PLACEHOLDER_ +
          '(&$list, $at, $value) {',
              '  return array_splice($list, count($list) - $at, 0, $value);',
              '}']);
      return functionName + '(' + list + ', ' + at + ', ' + value + ');\n';
    }
  } else if (where == 'RANDOM') {
    var code = cacheList();
    var xVar = Blockly.PHP.variableDB_.getDistinctName(
        'tmp_x', Blockly.Variables.NAME_TYPE);
    code += xVar + ' = rand(0, count(' + list + ')-1);\n';
    if (mode == 'SET') {
      code += list + '[' + xVar + '] = ' + value + ';\n';
      return code;
    } else if (mode == 'INSERT') {
      code += 'array_splice(' + list + ', ' + xVar + ', 0, ' + value + ');\n';
      return code;
    }
  }
  throw 'Unhandled combination (lists_setIndex).';
};

Blockly.PHP['lists_getSublist'] = function(block) {
  // Get sublist.
  var list = Blockly.PHP.valueToCode(block, 'LIST',
      Blockly.PHP.ORDER_MEMBER) || 'array()';
  var where1 = block.getFieldValue('WHERE1');
  var where2 = block.getFieldValue('WHERE2');
  var at1 = Blockly.PHP.valueToCode(block, 'AT1',
      Blockly.PHP.ORDER_NONE) || '1';
  var at2 = Blockly.PHP.valueToCode(block, 'AT2',
      Blockly.PHP.ORDER_NONE) || '1';
  if (where1 == 'FIRST' && where2 == 'LAST') {
    var code = list;
  } else {
    var functionName = Blockly.PHP.provideFunction_(
        'lists_get_sublist',
        [ 'function ' + Blockly.PHP.FUNCTION_NAME_PLACEHOLDER_ +
            '($list, $where1, $at1, $where2, $at2) {',
            '  if ($where2 == \'FROM_START\') {',
            '    $at2--;',
            '  } else if ($where2 == \'FROM_END\') {',
            '    $at2 = $at2 - $at1;',
            '  } else if ($where2 == \'FIRST\') {',
            '    $at2 = 0;',
            '  } else if ($where2 == \'LAST\') {',
            '    $at2 = count($list);',
            '  } else {',
            '    throw \'Unhandled option (lists_getSublist).\';',
            '  }',
            '  if ($where1 == \'FROM_START\') {',
            '    $at1--;',
            '  } else if ($where1 == \'FROM_END\') {',
            '    $at1 = count($list) - $at1;',
            '  } else if ($where1 == \'FIRST\') {',
            '    $at1 = 0;',
            '  } else if ($where1 == \'LAST\') {',
            '    $at1 = count($list) - 1;',
            '  } else {',
            '    throw \'Unhandled option (lists_getSublist).\';',
            '  }',
            '  return array_slice($list, $at1, $at2);',
          '}']);
    var code = functionName + '(' + list + ', \'' +
        where1 + '\', ' + at1 + ', \'' + where2 + '\', ' + at2 + ')';
  }
  return [code, Blockly.PHP.ORDER_FUNCTION_CALL];
};

Blockly.PHP['lists_split'] = function(block) {
  // Block for splitting text into a list, or joining a list into text.
  var value_input = Blockly.PHP.valueToCode(block, 'INPUT',
      Blockly.PHP.ORDER_MEMBER);
  var value_delim = Blockly.PHP.valueToCode(block, 'DELIM',
      Blockly.PHP.ORDER_NONE) || '\'\'';
  var mode = block.getFieldValue('MODE');
  if (mode == 'SPLIT') {
    if (!value_input) {
      value_input = '\'\'';
    }
    var functionName = 'explode';
  } else if (mode == 'JOIN') {
    if (!value_input) {
      value_input = 'array()';
    }
    var functionName = 'implode';
  } else {
    throw 'Unknown mode: ' + mode;
  }
  var code = functionName + '('+ value_delim + ', ' + value_input + ')';
  return [code, Blockly.PHP.ORDER_FUNCTION_CALL];
};
