/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
'use strict';

function test_logic_ternary_structure() {
  var workspace = new Blockly.Workspace();
  try {
    var block = workspace.newBlock('logic_ternary');
    assertEquals(3, block.inputList && block.inputList.length);
    assertEquals(1, block.getInput('IF').connection.check_.length);
    assertEquals('Boolean', block.getInput('IF').connection.check_[0]);
    assertTrue(!!block.onchangeWrapper_); // Has onchange handler
  } finally {
    workspace.dispose();
  }
}

function test_logic_ternary_attachSameTypeCheckInThenAndElseWithoutParent() {
  var workspace = new Blockly.Workspace();
  try {
    var block = workspace.newBlock('logic_ternary');

    var string1 = workspace.newBlock('text');
    var string2 = workspace.newBlock('text_charAt');

    block.getInput('THEN').connection.connect(string1.outputConnection);
    Blockly.Events.fireNow_();  // Force synchronous onchange() call.
    assertEquals(block, string1.getRootBlock());
    block.getInput('ELSE').connection.connect(string2.outputConnection);
    Blockly.Events.fireNow_();  // Force synchronous onchange() call.
    assertEquals(block, string1.getRootBlock());  // Still connected.
    assertEquals(block, string2.getRootBlock());
  } finally {
    workspace.dispose();
  }
}

function test_logic_ternary_attachDifferectTypeChecksInThenAndElseWithoutParent() {
  var workspace = new Blockly.Workspace();
  try {
    var block = workspace.newBlock('logic_ternary');

    var string = workspace.newBlock('text');
    var number = workspace.newBlock('math_number');

    block.getInput('THEN').connection.connect(string.outputConnection);
    Blockly.Events.fireNow_();  // Force synchronous onchange() call.
    assertEquals(block, string.getRootBlock());
    block.getInput('ELSE').connection.connect(number.outputConnection);
    Blockly.Events.fireNow_();  // Force synchronous onchange() call.
    assertEquals(block, string.getRootBlock());  // Input THEN still connected.
    assertEquals(block, number.getRootBlock());
  } finally {
    workspace.dispose();
  }
}

function test_logic_ternary_attachSameTypeCheckInThenAndElseWithMatchingParent() {
  var workspace = new Blockly.Workspace();
  try {
    var block = workspace.newBlock('logic_ternary');
    var parent = workspace.newBlock('text_trim');

    parent.getInput('TEXT').connection.connect(block.outputConnection);
    assertEquals(parent, block.getRootBlock());

    var string1 = workspace.newBlock('text');
    var string2 = workspace.newBlock('text_charAt');

    block.getInput('THEN').connection.connect(string1.outputConnection);
    Blockly.Events.fireNow_();  // Force synchronous onchange() call.
    assertEquals(parent, block.getRootBlock());  // Still connected to parent.
    assertEquals(parent, string1.getRootBlock());
    block.getInput('ELSE').connection.connect(string2.outputConnection);
    Blockly.Events.fireNow_();  // Force synchronous onchange() call.
    assertEquals(parent, block.getRootBlock());  // Still connected to parent.
    assertEquals(parent, string1.getRootBlock());  // Input THEN still connected.
    assertEquals(parent, string2.getRootBlock());
  } finally {
    workspace.dispose();
  }
}

function test_logic_ternary_attachDifferectTypeChecksInThenAndElseWithUncheckedParent() {
  var workspace = new Blockly.Workspace();
  try {
    var block = workspace.newBlock('logic_ternary');
    var parent = workspace.newBlock('text_print');

    parent.getInput('TEXT').connection.connect(block.outputConnection);
    assertEquals(parent, block.parentBlock_);

    var string = workspace.newBlock('text');
    var number = workspace.newBlock('math_number');

    block.getInput('THEN').connection.connect(string.outputConnection);
    Blockly.Events.fireNow_();  // Force synchronous onchange() call.
    assertEquals(parent, block.getRootBlock());  // Still connected to parent.
    assertEquals(parent, string.getRootBlock());
    block.getInput('ELSE').connection.connect(number.outputConnection);
    Blockly.Events.fireNow_();  // Force synchronous onchange() call.
    assertEquals(parent, block.getRootBlock());  // Still connected to parent.
    assertEquals(parent, string.getRootBlock());  // Input THEN still connected.
    assertEquals(parent, number.getRootBlock());
  } finally {
    workspace.dispose();
  }
}

function test_logic_ternary_attachDifferectTypeChecksInThenAndElseWithPermissiveParent() {
  var workspace = new Blockly.Workspace();
  try {
    var block = workspace.newBlock('logic_ternary');
    var parent = workspace.newBlock('text_length');  // Allows String or Array

    parent.getInput('VALUE').connection.connect(block.outputConnection);
    assertEquals(parent, block.parentBlock_);

    var string = workspace.newBlock('text');
    var array = workspace.newBlock('lists_create_empty');

    block.getInput('THEN').connection.connect(string.outputConnection);
    Blockly.Events.fireNow_();  // Force synchronous onchange() call.
    assertEquals(parent, block.getRootBlock());  // Still connected to parent.
    assertEquals(parent, string.getRootBlock());
    block.getInput('ELSE').connection.connect(array.outputConnection);
    Blockly.Events.fireNow_();  // Force synchronous onchange() call.
    assertEquals(parent, block.getRootBlock());  // Still connected to parent.
    assertEquals(parent, string.getRootBlock());  // Input THEN still connected.
    assertEquals(parent, array.getRootBlock());
  } finally {
    workspace.dispose();
  }
}

function test_logic_ternary_attachMismatchTypeToThen_breakWithParent() {
  var workspace = new Blockly.Workspace();
  try {
    var block = workspace.newBlock('logic_ternary');
    var parent = workspace.newBlock('text_length');  // Allows String or Array

    parent.getInput('VALUE').connection.connect(block.outputConnection);
    Blockly.Events.fireNow_();  // Force synchronous onchange() call.
    assertEquals(parent, block.parentBlock_);

    var string = workspace.newBlock('text');
    var number = workspace.newBlock('math_number');

    block.getInput('ELSE').connection.connect(string.outputConnection);
    Blockly.Events.fireNow_();  // Force synchronous onchange() call.
    assertEquals(parent, block.getRootBlock());  // Still connected to parent.
    assertEquals(parent, string.getRootBlock());

    // Adding mismatching number.
    block.getInput('THEN').connection.connect(number.outputConnection);
    Blockly.Events.fireNow_();  // Force synchronous onchange() call.
    assertEquals(block, block.getRootBlock());  // Disconnected from parent.
    assertEquals(block, number.getRootBlock());
    assertEquals(block, string.getRootBlock());  // ELSE string still connected.
  } finally {
    workspace.dispose();
  }
}

function test_logic_ternary_attachMismatchTypeToElse_breakWithParent() {
  var workspace = new Blockly.Workspace();
  try {
    var block = workspace.newBlock('logic_ternary');
    var parent = workspace.newBlock('text_length');  // Allows String or Array

    parent.getInput('VALUE').connection.connect(block.outputConnection);
    Blockly.Events.fireNow_();  // Force synchronous onchange() call.
    assertEquals(parent, block.parentBlock_);

    var string = workspace.newBlock('text');
    var number = workspace.newBlock('math_number');

    block.getInput('THEN').connection.connect(string.outputConnection);
    Blockly.Events.fireNow_();  // Force synchronous onchange() call.
    assertEquals(parent, block.getRootBlock());  // Still connected to parent.
    assertEquals(parent, string.getRootBlock());

    // Adding mismatching number.
    block.getInput('ELSE').connection.connect(number.outputConnection);
    Blockly.Events.fireNow_();  // Force synchronous onchange() call.
    assertEquals(block, block.getRootBlock());  // Disconnected from parent.
    assertEquals(block, number.getRootBlock());
    assertEquals(block, string.getRootBlock());  // THEN string still connected.
  } finally {
    workspace.dispose();
  }
}

function test_logic_ternary_attachToUncheckedParentWithDifferentTypes() {
  var workspace = new Blockly.Workspace();
  try {
    var block = workspace.newBlock('logic_ternary');
    var string = workspace.newBlock('text');
    var number = workspace.newBlock('math_number');

    block.getInput('THEN').connection.connect(string.outputConnection);
    Blockly.Events.fireNow_();  // Force synchronous onchange() call.
    assertEquals(block, string.getRootBlock());
    block.getInput('ELSE').connection.connect(number.outputConnection);
    Blockly.Events.fireNow_();  // Force synchronous onchange() call.
    assertEquals(block, string.getRootBlock());  // Input THEN still connected.
    assertEquals(block, number.getRootBlock());

    // Attaching to parent.
    var parent = workspace.newBlock('text_print');
    parent.getInput('TEXT').connection.connect(block.outputConnection);
    assertEquals(parent, block.getRootBlock());
    assertEquals(parent, string.getRootBlock());  // Input THEN still connected.
    assertEquals(parent, number.getRootBlock());  // Input ELSE still connected.
  } finally {
    workspace.dispose();
  }
}

function test_logic_ternary_attachToPermissiveParentWithDifferentTypes() {
  var workspace = new Blockly.Workspace();
  try {
    var block = workspace.newBlock('logic_ternary');
    var string = workspace.newBlock('text');
    var array = workspace.newBlock('lists_create_empty');

    block.getInput('THEN').connection.connect(string.outputConnection);
    Blockly.Events.fireNow_();  // Force synchronous onchange() call.
    assertEquals(block, string.getRootBlock());
    block.getInput('ELSE').connection.connect(array.outputConnection);
    Blockly.Events.fireNow_();  // Force synchronous onchange() call.
    assertEquals(block, string.getRootBlock());  // Input THEN still connected.
    assertEquals(block, array.getRootBlock());

    // Attaching to parent.
    var parent = workspace.newBlock('text_print');
    parent.getInput('TEXT').connection.connect(block.outputConnection);
    Blockly.Events.fireNow_();  // Force synchronous onchange() call.
    assertEquals(parent, block.getRootBlock());
    assertEquals(parent, string.getRootBlock());  // Input THEN still connected.
    assertEquals(parent, array.getRootBlock());  // Input ELSE still connected.
  } finally {
    workspace.dispose();
  }
}

function test_logic_ternary_attachToParentWithMismatchingThen_disconnectThen() {
  var workspace = new Blockly.Workspace();
  try {
    var block = workspace.newBlock('logic_ternary');
    var number = workspace.newBlock('math_number');
    var string = workspace.newBlock('text');

    block.getInput('THEN').connection.connect(number.outputConnection);
    Blockly.Events.fireNow_();  // Force synchronous onchange() call.
    assertEquals(block, number.getRootBlock());
    block.getInput('ELSE').connection.connect(string.outputConnection);
    Blockly.Events.fireNow_();  // Force synchronous onchange() call.
    assertEquals(block, number.getRootBlock());  // Input THEN still connected.
    assertEquals(block, string.getRootBlock());

    // Attaching to parent.
    var parent = workspace.newBlock('text_trim');
    parent.getInput('TEXT').connection.connect(block.outputConnection);
    Blockly.Events.fireNow_();  // Force synchronous onchange() call.
    assertEquals(parent, block.getRootBlock());  // Successful connection to parent.
    assertEquals(parent, string.getRootBlock());  // Input ELSE still connected.
    assertEquals(number, number.getRootBlock());  // Input THEN disconnected.
  } finally {
    workspace.dispose();
  }
}

function test_logic_ternary_attachToParentWithMismatchingElse_disconnectElse() {
  var workspace = new Blockly.Workspace();
  try {
    var block = workspace.newBlock('logic_ternary');
    var string = workspace.newBlock('text');
    var number = workspace.newBlock('math_number');

    block.getInput('THEN').connection.connect(string.outputConnection);
    Blockly.Events.fireNow_();  // Force synchronous onchange() call.
    assertEquals(block, string.getRootBlock());
    block.getInput('ELSE').connection.connect(number.outputConnection);
    Blockly.Events.fireNow_();  // Force synchronous onchange() call.
    assertEquals(block, string.getRootBlock());  // Input THEN still connected.
    assertEquals(block, number.getRootBlock());

    // Attaching to parent.
    var parent = workspace.newBlock('text_trim');
    parent.getInput('TEXT').connection.connect(block.outputConnection);
    Blockly.Events.fireNow_();  // Force synchronous onchange() call.
    assertEquals(parent, block.getRootBlock());  // Successful connection to parent.
    assertEquals(parent, string.getRootBlock());  // Input THEN still connected.
    assertEquals(number, number.getRootBlock());  // Input ELSE disconnected.
  } finally {
    workspace.dispose();
  }
}
