/**
 * @license
 * Copyright 2018 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

 /**
 * @fileoverview Tests for Blockly.Block
 * @author fenichel@google.com (Rachel Fenichel)
 */

'use strict';

var workspace;
var mockControl_;

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
  if (mockControl_) {
    mockControl_.restore();
  }
}

function assertUnpluggedNoheal(blocks) {
  // A has nothing connected to it.
  assertEquals(0, blocks.A.getChildren().length);
  // B and C are still connected.
  assertEquals(blocks.B, blocks.C.getParent());
  // B is the top of its stack.
  assertNull(blocks.B.getParent());
}

function assertUnpluggedHealed(blocks) {
  // A and C are connected.
  assertEquals(1, blocks.A.getChildren().length);
  assertEquals(blocks.A, blocks.C.getParent());
  // B has nothing connected to it.
  assertEquals(0, blocks.B.getChildren().length);
  // B is the top of its stack.
  assertNull(blocks.B.getParent());
}

function assertUnpluggedHealFailed(blocks) {
  // A has nothing connected to it.
  assertEquals(0, blocks.A.getChildren().length);
  // B has nothing connected to it.
  assertEquals(0, blocks.B.getChildren().length);
  // B is the top of its stack.
  assertNull(blocks.B.getParent());
  // C is the top of its stack.
  assertNull(blocks.C.getParent());
}

function setUpRowBlocks() {
  var blockA = workspace.newBlock('row_block');
  var blockB = workspace.newBlock('row_block');
  var blockC = workspace.newBlock('row_block');

  blockA.inputList[0].connection.connect(blockB.outputConnection);
  blockB.inputList[0].connection.connect(blockC.outputConnection);

  assertEquals(blockB, blockC.getParent());

  return {
    A: blockA,
    B: blockB,
    C: blockC
  };
}

function setUpStackBlocks() {
  var blockA = workspace.newBlock('stack_block');
  var blockB = workspace.newBlock('stack_block');
  var blockC = workspace.newBlock('stack_block');

  blockA.nextConnection.connect(blockB.previousConnection);
  blockB.nextConnection.connect(blockC.previousConnection);

  assertEquals(blockB, blockC.getParent());

  return {
    A: blockA,
    B: blockB,
    C: blockC
  };
}


function test_block_stack_unplug_noheal() {
  blockTest_setUp();
  try {
    var blocks = setUpStackBlocks();
    blocks.B.unplug();
    assertUnpluggedNoheal(blocks);
  } finally {
    blockTest_tearDown();
  }
}

function test_block_stack_unplug_heal() {
  blockTest_setUp();
  try {
    var blocks = setUpStackBlocks();
    blocks.B.unplug(true);
    assertUnpluggedHealed(blocks);
  } finally {
    blockTest_tearDown();
  }
}

function test_block_stack_unplug_heal_bad_checks() {
  blockTest_setUp();
  try {
    var blocks = setUpStackBlocks();

    // A and C can't connect, but both can connect to B.
    blocks.A.nextConnection.setCheck('type1');
    blocks.C.previousConnection.setCheck('type2');

    // The types don't work.
    blocks.B.unplug(true);

    assertUnpluggedHealFailed(blocks);
  } finally {
    blockTest_tearDown();
  }
}

function test_block_row_unplug_noheal() {
  blockTest_setUp();
  try {
    var blocks = setUpRowBlocks();
    blocks.B.unplug(false);
    assertUnpluggedNoheal(blocks);
  } finally {
    blockTest_tearDown();
  }
}

function test_block_row_unplug_heal() {
  blockTest_setUp();
  try {
    var blocks = setUpRowBlocks();
    // Each block has only one input, and the types work.
    blocks.B.unplug(true);
    assertUnpluggedHealed(blocks);
  } finally {
    blockTest_tearDown();
  }
}

function test_block_row_unplug_heal_bad_checks() {
  blockTest_setUp();
  try {
    var blocks = setUpRowBlocks();

    // A and C can't connect, but both can connect to B.
    blocks.A.inputList[0].connection.setCheck('type1');
    blocks.C.outputConnection.setCheck('type2');

    // Each block has only one input, but the types don't work.
    blocks.B.unplug(true);
    assertUnpluggedHealFailed(blocks);
  } finally {
    blockTest_tearDown();
  }
}

function test_block_row_unplug_multi_inputs_parent() {
  blockTest_setUp();
  try {
    var blocks = setUpRowBlocks();
    // Add extra input to parent
    blocks.A.appendValueInput('INPUT').setCheck(null);

    // Parent block has multiple inputs.
    blocks.B.unplug(true);
    assertUnpluggedHealed(blocks);
  } finally {
    blockTest_tearDown();
  }
}

function test_block_row_unplug_multi_inputs_middle() {
  blockTest_setUp();
  try {
    var blocks = setUpRowBlocks();
    // Add extra input to middle block
    blocks.B.appendValueInput('INPUT').setCheck(null);

    // Middle block has multiple inputs.
    blocks.B.unplug(true);
    assertUnpluggedHealed(blocks);
  } finally {
    blockTest_tearDown();
  }
}

function test_block_row_unplug_multi_inputs_child() {
  blockTest_setUp();
  try {
    var blocks = setUpRowBlocks();
    // Add extra input to child block
    blocks.C.appendValueInput('INPUT').setCheck(null);

    // Child block input count doesn't matter.
    blocks.B.unplug(true);
    assertUnpluggedHealed(blocks);
  } finally {
    blockTest_tearDown();
  }
}
