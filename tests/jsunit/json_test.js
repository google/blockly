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

    var options = dropdown.getOptions();
    assertEquals(LABEL0, options[0][0]);
    assertEquals(VALUE0, options[0][1]);
    assertEquals(LABEL1, options[1][0]);
    assertEquals(VALUE1, options[1][1]);
  } finally {
    block && block.dispose();  // Disposes of dropdown, too.
    workspace.dispose();
    delete Blockly.Blocks[BLOCK_TYPE];
  }
}

function test_json_dropdown_image() {
  var BLOCK_TYPE = 'test_json_dropdown';
  var FIELD_NAME = 'FIELD_NAME';
  var IMAGE1_ALT_TEXT = 'Localized message.';
  Blockly.Msg['ALT_TEXT'] = IMAGE1_ALT_TEXT;
  var IMAGE0 = {
    'width': 12,
    'height': 34,
    'src': 'http://image0.src',
    'alt': 'IMAGE0 alt text'
  };
  var VALUE0 = 'VALUE0';
  var IMAGE1 = {
    'width': 56,
    'height': 78,
    'src': 'http://image1.src',
    'alt': '%{BKY_ALT_TEXT}'
  };
  var VALUE1 = 'VALUE1';
  var IMAGE2 = {
    'width': 90,
    'height': 123,
    'src': 'http://image2.src'
  };
  var VALUE2 = 'VALUE2';

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
            [IMAGE0, VALUE0],
            [IMAGE1, VALUE1],
            [IMAGE2, VALUE2]
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

    var options = dropdown.getOptions();
    var image0 = options[0][0];
    assertEquals(IMAGE0.width, image0.width);
    assertEquals(IMAGE0.height, image0.height);
    assertEquals(IMAGE0.src, image0.src);
    assertEquals(IMAGE0.alt, image0.alt);
    assertEquals(VALUE0, options[0][1]);

    var image1 = options[1][0];
    assertEquals(IMAGE1.width, image1.width);
    assertEquals(IMAGE1.height, image1.height);
    assertEquals(IMAGE1.src, image1.src);
    assertEquals(IMAGE1.alt, IMAGE1_ALT_TEXT);  // Via Msg reference
    assertEquals(VALUE1, options[1][1]);

    var image2 = options[2][0];
    assertEquals(IMAGE2.width, image2.width);
    assertEquals(IMAGE2.height, image2.height);
    assertEquals(IMAGE2.src, image2.src);
    assert(image2.alt == null);  // No alt specified.
    assertEquals(VALUE2, options[2][1]);
  } finally {
    block && block.dispose();  // Disposes of dropdown, too.
    workspace.dispose();
    delete Blockly.Blocks[BLOCK_TYPE];
    delete Blockly.Msg['ALTTEXT'];
  }
}
