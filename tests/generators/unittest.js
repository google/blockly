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
        .appendField('run test suite')
        .appendField(new Blockly.FieldTextInput(''), 'SUITE_NAME');
    this.appendStatementInput('DO');
    this.setTooltip('Executes the enclosed unit tests,\n' +
                    'then prints a summary.');
  },
  getDeveloperVars: function() {
    return ['unittestResults'];
  }
};

Blockly.Blocks['unittest_assertequals'] = {
  // Asserts that a value equals another value.
  init: function() {
    this.setColour(65);
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.appendValueInput('MESSAGE')
        .appendField('name')
        .setCheck('String');
    this.appendValueInput('ACTUAL')
        .appendField('actual');
    this.appendValueInput('EXPECTED')
        .appendField('expected');
    this.setTooltip('Tests that "actual == expected".');
  },
  getDeveloperVars: function() {
    return ['unittestResults'];
  }
};

Blockly.Blocks['unittest_assertvalue'] = {
  // Asserts that a value is true, false, or null.
  init: function() {
    this.setColour(65);
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.appendValueInput('MESSAGE', 'test name')
        .appendField('name')
        .setCheck('String');
    this.appendValueInput('ACTUAL')
        .appendField('assert')
        .appendField(new Blockly.FieldDropdown(
        [['true', 'TRUE'], ['false', 'FALSE'], ['null', 'NULL']]), 'EXPECTED');
    this.setTooltip('Tests that the value is true, false, or null.');
  },
  getDeveloperVars: function() {
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
  getDeveloperVars: function() {
    return ['unittestResults'];
  }
};

Blockly.Blocks['unittest_adjustindex'] = {
  // Adjusts the indexing based on current setting.
  init: function() {
    this.jsonInit({
      "message0": "adjusted %1",
      "args0": [
        {
          "type": "input_value",
          "name": "INDEX",
          "check": "Number"
        }
      ],
      "inputsInline": true,
      "output": "Number",
      "colour": 65,
      "tooltip": "Adjusts the value based on whether generated code is using " +
          "zero or one based indexing."
    });
  }
};
