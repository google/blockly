/**
 * @license
 * Visual Blocks Editor
 *
 * Copyright 2017 Google Inc.
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
'use strict';

/**  Ensure a block can be instantiated from a JSON definition.  */
function test_json_minimal() {
  var BLOCK_TYPE = 'test_json_minimal';

  var workspace = new Blockly.Workspace();
  var block;
  try {
    Blockly.defineBlocksWithJsonArray([{
      "type": BLOCK_TYPE
    }]);

    block = new Blockly.Block(workspace, BLOCK_TYPE);
    assertEquals(BLOCK_TYPE, block.type);
    // TODO: asserts
  } finally {
    block.dispose();
    workspace.dispose();
    delete Blockly.Blocks[BLOCK_TYPE];
  }
}

/**  Ensure message0 creates an input.  */
function test_json_message0() {
  var BLOCK_TYPE = 'test_json_message0';
  var MESSAGE0 = 'message0';

  var workspace = new Blockly.Workspace();
  var block;
  try {
    Blockly.defineBlocksWithJsonArray([{
      "type": BLOCK_TYPE,
      "message0": MESSAGE0
    }]);

    block = new Blockly.Block(workspace, BLOCK_TYPE);
    assertEquals(1, block.inputList.length);
    assertEquals(1, block.inputList[0].fieldRow.length);
    var textField = block.inputList[0].fieldRow[0];
    assertEquals(Blockly.FieldLabel, textField.constructor);
    assertEquals(MESSAGE0, textField.getText());
  } finally {
    block && block.dispose();
    workspace.dispose();
    delete Blockly.Blocks[BLOCK_TYPE];
  }
}

/**  Ensure message1 creates a new input.  */
function test_json_message1() {
  var BLOCK_TYPE = 'test_json_message1';
  var MESSAGE0 = 'message0';
  var MESSAGE1 = 'message1';

  var workspace = new Blockly.Workspace();
  var block;
  try {
    Blockly.defineBlocksWithJsonArray([{
      "type": BLOCK_TYPE,
      "message0": MESSAGE0,
      "message1": MESSAGE1
    }]);

    block = new Blockly.Block(workspace, BLOCK_TYPE);
    assertEquals(2, block.inputList.length);

    assertEquals(1, block.inputList[0].fieldRow.length);
    var textField = block.inputList[0].fieldRow[0];
    assertEquals(Blockly.FieldLabel, textField.constructor);
    assertEquals(MESSAGE0, textField.getText());

    assertEquals(1, block.inputList[1].fieldRow.length);
    var textField = block.inputList[1].fieldRow[0];
    assertEquals(Blockly.FieldLabel, textField.constructor);
    assertEquals(MESSAGE1, textField.getText());
  } finally {
    block && block.dispose();
    workspace.dispose();
    delete Blockly.Blocks[BLOCK_TYPE];
  }
}

/**  Ensure message string is dereferenced.  */
function test_json_message0_i18n() {
  var BLOCK_TYPE = 'test_json_message0_i18n';
  var MESSAGE0 = '%{BKY_MESSAGE}';
  var MESSAGE = 'message';

  Blockly.Msg['MESSAGE'] = MESSAGE;

  var workspace = new Blockly.Workspace();
  var block;
  try {
    Blockly.defineBlocksWithJsonArray([{
      "type": BLOCK_TYPE,
      "message0": MESSAGE0
    }]);

    block = new Blockly.Block(workspace, BLOCK_TYPE);
    assertEquals(1, block.inputList.length);
    assertEquals(1, block.inputList[0].fieldRow.length);
    var textField = block.inputList[0].fieldRow[0];
    assertEquals(Blockly.FieldLabel, textField.constructor);
    assertEquals(MESSAGE, textField.getText());
  } finally {
    block && block.dispose(); // Disposes of textField, too.
    workspace.dispose();
    delete Blockly.Blocks[BLOCK_TYPE];
    delete Blockly.Msg['MESSAGE'];
  }
}

function test_json_dropdown() {
  var BLOCK_TYPE = 'test_json_dropdown';
  var FIELD_NAME = 'FIELD_NAME';
  var LABEL0 = 'LABEL0';
  var VALUE0 = 'VALUE0';
  var LABEL1 = 'LABEL1';
  var VALUE1 = 'VALUE1';

  var workspace = new Blockly.Workspace();
  var block;
  try {
    Blockly.defineBlocksWithJsonArray([{
      "type": BLOCK_TYPE,
      "message0": "%1",
      "args0": [
        {
          "type": "field_dropdown",
          "name": FIELD_NAME,
          "options": [
            [LABEL0, VALUE0],
            [LABEL1, VALUE1]
          ]
        }
      ]
    }]);

    block = new Blockly.Block(workspace, BLOCK_TYPE);
    assertEquals(1, block.inputList.length);
    assertEquals(1, block.inputList[0].fieldRow.length);
    var dropdown = block.inputList[0].fieldRow[0];
    assertEquals(dropdown, block.getField(FIELD_NAME));
    assertEquals(Blockly.FieldDropdown, dropdown.constructor);
    assertEquals(VALUE0, dropdown.getValue());
  } finally {
    block && block.dispose();  // Disposes of dropdown, too.
    workspace.dispose();
    delete Blockly.Blocks[BLOCK_TYPE];
  }
}

