/**
 * @license
 * Visual Blocks Editor
 *
 * Copyright 2018 Google Inc.
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
 * @fileoverview Tests for Blockly.Block
 * @author fenichel@google.com (Rachel Fenichel)
 */
'use strict';

var workspace;

function defineTestBlocks() {
  Blockly.defineBlocksWithJsonArray([{
    "type": "stack_block",
    "message0": "",
    "previousStatement": null,
    "nextStatement": null
  },
  {
    "type": "row_block",
    "message0": "%1",
    "args0": [
      {
        "type": "input_value",
        "name": "INPUT"
      }
    ],
    "output": null
  }]);
}

function undefineTestBlocks() {
  delete Blockly.Blocks['stack_block'];
  delete Blockly.Blocks['row_block'];
}

function blockTest_setUp() {
  defineTestBlocks();
  workspace = new Blockly.Workspace();
}

function blockTest_tearDown() {
  undefineTestBlocks();
  workspace.dispose();
}

function test_block_stack_unplug_noheal() {
  blockTest_setUp();
  try {
    var blockA = workspace.newBlock('stack_block');
    var blockB = workspace.newBlock('stack_block');
    var blockC = workspace.newBlock('stack_block');

    blockA.nextConnection.connect(blockB.previousConnection);
    blockB.nextConnection.connect(blockC.previousConnection);

    assertEquals(blockB, blockC.getParent());

    blockB.unplug();

    // A has nothing connected to it.
    assertEquals(0, blockA.getChildren().length);
    // B and C are still connected.
    assertEquals(blockB, blockC.getParent());
    // B is the top of its stack.
    assertNull(blockB.getParent());
  } finally {
    blockTest_tearDown();
  }
}

function test_block_stack_unplug_heal() {
  blockTest_setUp();
  try {
    var blockA = workspace.newBlock('stack_block');
    var blockB = workspace.newBlock('stack_block');
    var blockC = workspace.newBlock('stack_block');

    blockA.nextConnection.connect(blockB.previousConnection);
    blockB.nextConnection.connect(blockC.previousConnection);

    assertEquals(blockB, blockC.getParent());

    blockB.unplug(true);

    // A and C are connected.
    assertEquals(1, blockA.getChildren().length);
    assertEquals(blockA, blockC.getParent());
    // B has nothing connected to it.
    assertEquals(0, blockB.getChildren().length);
    // B is the top of its stack.
    assertNull(blockB.getParent());
  } finally {
    blockTest_tearDown();
  }
}

function test_block_row_unplug_noheal() {
  blockTest_setUp();
  try {
    var blockA = workspace.newBlock('row_block');
    var blockB = workspace.newBlock('row_block');
    var blockC = workspace.newBlock('row_block');

    blockA.inputList[0].connection.connect(blockB.outputConnection);
    blockB.inputList[0].connection.connect(blockC.outputConnection);

    assertEquals(blockB, blockC.getParent());

    blockB.unplug(false);

    // A has nothing connected to it.
    assertEquals(0, blockA.getChildren().length);
    // B and C are still connected.
    assertEquals(blockB, blockC.getParent());
    // B is the top of its stack.
    assertNull(blockB.getParent());
  } finally {
    blockTest_tearDown();
  }
}

function test_block_row_unplug_heal() {
  blockTest_setUp();
  try {
    var blockA = workspace.newBlock('row_block');
    var blockB = workspace.newBlock('row_block');
    var blockC = workspace.newBlock('row_block');

    blockA.inputList[0].connection.connect(blockB.outputConnection);
    blockB.inputList[0].connection.connect(blockC.outputConnection);

    assertEquals(blockB, blockC.getParent());

    blockB.unplug(true);

    // Unplugging in a row doesn't heal the stack, regardless of the value of
    // the healStack argument.  These are the same asserts as
    // test_block_row_unplug_noheal.

    // A has nothing connected to it.
    assertEquals(0, blockA.getChildren().length);
    // B and C are still connected.
    assertEquals(blockB, blockC.getParent());
    // B is the top of its stack.
    assertNull(blockB.getParent());
  } finally {
    blockTest_tearDown();
  }
}
