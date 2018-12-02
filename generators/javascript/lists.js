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
 * @fileoverview Generating JavaScript for list blocks.
 * @author fraser@google.com (Neil Fraser)
 */
'use strict';

goog.provide('Blockly.JavaScript.lists');

goog.require('Blockly.JavaScript');



Blockly.JavaScript['lists_length'] = function(block) {
  // String or array length.
  var list = Blockly.JavaScript.valueToCode(block, 'VALUE',
      Blockly.JavaScript.ORDER_MEMBER) || '[]';
  return [list + '.length', Blockly.JavaScript.ORDER_MEMBER];
};

Blockly.JavaScript['lists_isEmpty'] = function(block) {
  // Is the string null or array empty?
  var list = Blockly.JavaScript.valueToCode(block, 'VALUE',
      Blockly.JavaScript.ORDER_MEMBER) || '[]';
  return ['!' + list + '.length', Blockly.JavaScript.ORDER_LOGICAL_NOT];
};

Blockly.JavaScript['lists_split'] = function(block) {
    // Block for splitting text into a list, or joining a list into text.
    var input = Blockly.JavaScript.valueToCode(block, 'INPUT',
        Blockly.JavaScript.ORDER_MEMBER);
    var delimiter = Blockly.JavaScript.valueToCode(block, 'DELIM',
            Blockly.JavaScript.ORDER_NONE) || '\'\'';
    var mode = block.getFieldValue('MODE');
    if (mode == 'SPLIT') {
        if (!input) {
            input = '\'\'';
        }
        var functionName = 'split';
    } else if (mode == 'JOIN') {
        if (!input) {
            input = '[]';
        }
        var functionName = 'join';
    } else {
        throw Error('Unknown mode: ' + mode);
    }
    var code = input + '.' + functionName + '(' + delimiter + ')';
    return [code, Blockly.JavaScript.ORDER_FUNCTION_CALL];
};




