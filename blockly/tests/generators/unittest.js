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
 * @fileoverview Unit test blocks for Blockly.
 * @author fraser@google.com (Neil Fraser)
 */
'use strict';

Blockly.Blocks['unittest_main'] = {
  // Container for unit tests.
  init: function() {
    this.setColour(65);
    this.appendDummyInput()
        .appendField('run tests');
    this.appendStatementInput('DO');
    this.setTooltip('Executes the enclosed unit tests,\n' +
                    'then prints a summary.');
  },
  getVars: function() {
    return ['unittestResults'];
  }
};

Blockly.Blocks['unittest_assertequals'] = {
  // Asserts that a value equals another value.
  init: function() {
    this.setColour(65);
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.appendDummyInput()
        .appendField(new Blockly.FieldTextInput('test name'), 'MESSAGE');
    this.appendValueInput('ACTUAL', null)
        .appendField('actual');
    this.appendValueInput('EXPECTED', null)
        .appendField('expected');
    this.setTooltip('Tests that "actual == expected".');
  },
  getVars: function() {
    return ['unittestResults'];
  }
};

Blockly.Blocks['unittest_assertvalue'] = {
  // Asserts that a value is true, false, or null.
  init: function() {
    this.setColour(65);
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.appendDummyInput()
        .appendField(new Blockly.FieldTextInput('test name'), 'MESSAGE');
    this.appendValueInput('ACTUAL', Boolean)
        .appendField('assert')
        .appendField(new Blockly.FieldDropdown(
        [['true', 'TRUE'], ['false', 'FALSE'], ['null', 'NULL']]), 'EXPECTED');
    this.setTooltip('Tests that the value is true, false, or null.');
  },
  getVars: function() {
    return ['unittestResults'];
  }
};

Blockly.Blocks['unittest_fail'] = {
  // Always assert an error.
  init: function() {
    this.setColour(65);
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.appendDummyInput()
        .appendField(new Blockly.FieldTextInput('test name'), 'MESSAGE')
        .appendField('fail');
    this.setTooltip('Records an error.');
  },
  getVars: function() {
    return ['unittestResults'];
  }
};
