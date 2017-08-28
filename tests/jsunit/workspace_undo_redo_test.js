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

 /**
 * @fileoverview Tests for Blockly.Workspace.undo.
 * @author marisaleung@google.com (Marisa Leung)
 */
'use strict';

goog.require('goog.events.EventHandler');
goog.require('goog.testing');
goog.require('goog.testing.events');
goog.require('goog.testing.MockControl');


var workspace;
var mockControl_;
var savedFireFunc = Blockly.Events.fire;
Blockly.defineBlocksWithJsonArray([{
  "type": "get_var_block",
  "message0": "%1",
  "args0": [
    {
      "type": "field_variable",
      "name": "VAR",
    }
  ]
}]);

function temporary_fireEvent(event) {
  if (!Blockly.Events.isEnabled()) {
    return;
  }
  Blockly.Events.FIRE_QUEUE_.push(event);
  Blockly.Events.fireNow_();
}

function undoRedoTest_setUp() {
  workspace = new Blockly.Workspace();
  mockControl_ = new goog.testing.MockControl();
  Blockly.Events.fire = temporary_fireEvent;
}

function undoRedoTest_tearDown() {
  mockControl_.$tearDown();
  workspace.dispose();
  Blockly.Events.fire = savedFireFunc;
}

/**
 * Create a test get_var_block.
 * @param {string} variableName The string to put into the variable field.
 * @return {!Blockly.Block} The created block.
 */
function createMockBlock(variableName) {
  var block = new Blockly.Block(workspace, 'get_var_block');
  block.inputList[0].fieldRow[0].setValue(variableName);
  return block;
}

/**
 * Check that the top block with the given index contains a variable with
 *     the given name.
 * @param {number} blockIndex The index of the top block.
 * @param {string} name The expected name of the variable in the block.
 */
function undoRedoTest_checkBlockVariableName(blockIndex, name) {
  var blockVarName = workspace.topBlocks_[blockIndex].getVars()[0];
  assertEquals(name, blockVarName);
}

function createTwoVarsEmptyType() {
  workspace.createVariable('name1', '', 'id1');
  workspace.createVariable('name2', '', 'id2');
}

function test_undoCreateVariable_Trivial() {
  undoRedoTest_setUp();
  workspace.createVariable('name1', 'type1', 'id1');
  workspace.createVariable('name2', 'type2', 'id2');

  workspace.undo();
  checkVariableValues(workspace, 'name1', 'type1', 'id1');
  assertNull(workspace.getVariableById('id2'));
  workspace.undo();
  assertNull(workspace.getVariableById('id1'));
  assertNull(workspace.getVariableById('id2'));
  undoRedoTest_tearDown();
}

function test_redoAndUndoCreateVariable_Trivial() {
  undoRedoTest_setUp();
  workspace.createVariable('name1', 'type1', 'id1');
  workspace.createVariable('name2', 'type2', 'id2');

  workspace.undo();
  workspace.undo(true);

  // Expect that variable 'id2' is recreated
  checkVariableValues(workspace, 'name1', 'type1', 'id1');
  checkVariableValues(workspace, 'name2', 'type2', 'id2');

  workspace.undo();
  workspace.undo();
  workspace.undo(true);

  // Expect that variable 'id1' is recreated
  checkVariableValues(workspace, 'name1', 'type1', 'id1');
  assertNull(workspace.getVariableById('id2'));
  undoRedoTest_tearDown();
}

function test_undoDeleteVariable_NoBlocks() {
  undoRedoTest_setUp();
  workspace.createVariable('name1', 'type1', 'id1');
  workspace.createVariable('name2', 'type2', 'id2');
  workspace.deleteVariableById('id1');
  workspace.deleteVariableById('id2');

  workspace.undo();
  assertNull(workspace.getVariableById('id1'));
  checkVariableValues(workspace, 'name2', 'type2', 'id2');

  workspace.undo();
  checkVariableValues(workspace, 'name1', 'type1', 'id1');
  checkVariableValues(workspace, 'name2', 'type2', 'id2');
  undoRedoTest_tearDown();
}

function test_undoDeleteVariable_WithBlocks() {
  undoRedoTest_setUp();
  workspace.createVariable('name1', 'type1', 'id1');
  workspace.createVariable('name2', 'type2', 'id2');
  createMockBlock('name1');
  createMockBlock('name2');
  workspace.deleteVariableById('id1');
  workspace.deleteVariableById('id2');

  workspace.undo();
  undoRedoTest_checkBlockVariableName(0, 'name2');
  assertNull(workspace.getVariableById('id1'));
  checkVariableValues(workspace, 'name2', 'type2', 'id2');

  workspace.undo();
  undoRedoTest_checkBlockVariableName(0, 'name2');
  undoRedoTest_checkBlockVariableName(1, 'name1');
  checkVariableValues(workspace, 'name1', 'type1', 'id1');
  checkVariableValues(workspace, 'name2', 'type2', 'id2');
  undoRedoTest_tearDown();
}

function test_redoAndUndoDeleteVariable_NoBlocks() {
  undoRedoTest_setUp();
  workspace.createVariable('name1', 'type1', 'id1');
  workspace.createVariable('name2', 'type2', 'id2');
  workspace.deleteVariableById('id1');
  workspace.deleteVariableById('id2');

  workspace.undo();
  workspace.undo(true);
  // Expect that both variables are deleted
  assertNull(workspace.getVariableById('id1'));
  assertNull(workspace.getVariableById('id2'));

  workspace.undo();
  workspace.undo();
  workspace.undo(true);
  // Expect that variable 'id2' is recreated
  assertNull(workspace.getVariableById('id1'));
  checkVariableValues(workspace, 'name2', 'type2', 'id2');
  undoRedoTest_tearDown();
}

function test_redoAndUndoDeleteVariable_WithBlocks() {
  undoRedoTest_setUp();
  workspace.createVariable('name1', 'type1', 'id1');
  workspace.createVariable('name2', 'type2', 'id2');
  createMockBlock('name1');
  createMockBlock('name2');
  workspace.deleteVariableById('id1');
  workspace.deleteVariableById('id2');

  workspace.undo();
  workspace.undo(true);
  // Expect that both variables are deleted
  assertEquals(0, workspace.topBlocks_.length);
  assertNull(workspace.getVariableById('id1'));
  assertNull(workspace.getVariableById('id2'));

  workspace.undo();
  workspace.undo();
  workspace.undo(true);
  // Expect that variable 'id2' is recreated
  undoRedoTest_checkBlockVariableName(0, 'name2');
  assertNull(workspace.getVariableById('id1'));
  checkVariableValues(workspace, 'name2', 'type2', 'id2');
  undoRedoTest_tearDown();
}

function test_redoAndUndoDeleteVariableTwice_NoBlocks() {
  undoRedoTest_setUp();
  workspace.createVariable('name1', 'type1', 'id1');
  workspace.deleteVariableById('id1');
  workspace.deleteVariableById('id1');

  // Check the undoStack only recorded one delete event.
  var undoStack = workspace.undoStack_;
  assertEquals('var_delete', undoStack[undoStack.length-1].type);
  assertNotEquals('var_delete', undoStack[undoStack.length-2].type);

  // undo delete
  workspace.undo();
  checkVariableValues(workspace, 'name1', 'type1', 'id1');

  // redo delete
  workspace.undo(true);
  assertNull(workspace.getVariableById('id1'));

  // redo delete, nothing should happen
  workspace.undo(true);
  assertNull(workspace.getVariableById('id1'));
  undoRedoTest_tearDown();
}

function test_redoAndUndoDeleteVariableTwice_WithBlocks() {
  undoRedoTest_setUp();
  workspace.createVariable('name1', 'type1', 'id1');
  createMockBlock('name1');
  workspace.deleteVariableById('id1');
  workspace.deleteVariableById('id1');

  // Check the undoStack only recorded one delete event.
  var undoStack = workspace.undoStack_;
  assertEquals('var_delete', undoStack[undoStack.length-1].type);
  assertEquals('delete', undoStack[undoStack.length-2].type);
  assertNotEquals('var_delete', undoStack[undoStack.length-3].type);

  // undo delete
  workspace.undo();
  undoRedoTest_checkBlockVariableName(0, 'name1');
  checkVariableValues(workspace, 'name1', 'type1', 'id1');

  // redo delete
  workspace.undo(true);
  assertEquals(0, workspace.topBlocks_.length);
  assertNull(workspace.getVariableById('id1'));

  // redo delete, nothing should happen
  workspace.undo(true);
  assertEquals(0, workspace.topBlocks_.length);
  assertNull(workspace.getVariableById('id1'));
  undoRedoTest_tearDown();
}

function test_undoRedoRenameVariable_NeitherVariableExists() {
  // Expect that a variable with the name, 'name2', and the generated UUID,
  // 'id2', to be created when rename is called. Undo removes this variable
  // and redo recreates it.
  undoRedoTest_setUp();
  setUpMockMethod(mockControl_, Blockly.utils, 'genUid', null,
    ['rename_group', 'id2', 'delete_group']);
  workspace.renameVariable('name1', 'name2');

  workspace.undo();
  assertNull(workspace.getVariableById('id2'));

  workspace.undo(true);
  checkVariableValues(workspace, 'name2', '', 'id2');
  undoRedoTest_tearDown();
}

function test_undoRedoRenameVariable_OneExists_NoBlocks() {
  undoRedoTest_setUp();
  workspace.createVariable('name1', '', 'id1');
  workspace.renameVariable('name1', 'name2');

  workspace.undo();
  checkVariableValues(workspace, 'name1', '', 'id1');
  assertNull(workspace.getVariable('name2'));

  workspace.undo(true);
  checkVariableValues(workspace, 'name2', '', 'id1');
  undoRedoTest_tearDown();
}

function test_undoRedoRenameVariable_OneExists_WithBlocks() {
  undoRedoTest_setUp();
  workspace.createVariable('name1', '', 'id1');
  createMockBlock('name1');
  workspace.renameVariable('name1', 'name2');

  workspace.undo();
  undoRedoTest_checkBlockVariableName(0, 'name1');
  checkVariableValues(workspace, 'name1', '', 'id1');
  assertNull(workspace.getVariable('name2'));

  workspace.undo(true);
  checkVariableValues(workspace, 'name2', '', 'id1');
  undoRedoTest_checkBlockVariableName(0, 'name2');
  undoRedoTest_tearDown();
}

function test_undoRedoRenameVariable_BothExist_NoBlocks() {
  undoRedoTest_setUp();
  createTwoVarsEmptyType();
  workspace.renameVariable('name1', 'name2');

  workspace.undo();
  checkVariableValues(workspace, 'name1', '', 'id1');
  checkVariableValues(workspace, 'name2', '', 'id2');

  workspace.undo(true);
  checkVariableValues(workspace, 'name2', '', 'id2');
  assertNull(workspace.getVariable('name1'));
  undoRedoTest_tearDown();
}

function test_undoRedoRenameVariable_BothExist_WithBlocks() {
  undoRedoTest_setUp();
  createTwoVarsEmptyType();
  createMockBlock('name1');
  createMockBlock('name2');
  workspace.renameVariable('name1', 'name2');

  workspace.undo();
  undoRedoTest_checkBlockVariableName(0, 'name1');
  undoRedoTest_checkBlockVariableName(1, 'name2');
  checkVariableValues(workspace, 'name1', '', 'id1');
  checkVariableValues(workspace, 'name2', '', 'id2');

  workspace.undo(true);
  undoRedoTest_checkBlockVariableName(0, 'name2');
  undoRedoTest_checkBlockVariableName(1, 'name2');
  undoRedoTest_tearDown();
}

function test_undoRedoRenameVariable_BothExistCaseChange_NoBlocks() {
  undoRedoTest_setUp();
  createTwoVarsEmptyType();
  workspace.renameVariable('name1', 'Name2');

  workspace.undo();
  checkVariableValues(workspace, 'name1', '', 'id1');
  checkVariableValues(workspace, 'name2', '', 'id2');

  workspace.undo(true);
  checkVariableValues(workspace, 'Name2', '', 'id2');
  assertNull(workspace.getVariable('name1'));
  undoRedoTest_tearDown();
}

function test_undoRedoRenameVariable_BothExistCaseChange_WithBlocks() {
  undoRedoTest_setUp();
  createTwoVarsEmptyType();
  createMockBlock('name1');
  createMockBlock('name2');
  workspace.renameVariable('name1', 'Name2');

  workspace.undo();
  undoRedoTest_checkBlockVariableName(0, 'name1');
  undoRedoTest_checkBlockVariableName(1, 'name2');
  checkVariableValues(workspace, 'name1', '', 'id1');
  checkVariableValues(workspace, 'name2', '', 'id2');

  workspace.undo(true);
  checkVariableValues(workspace, 'Name2', '', 'id2');
  assertNull(workspace.getVariable('name1'));
  undoRedoTest_checkBlockVariableName(0, 'Name2');
  undoRedoTest_checkBlockVariableName(1, 'Name2');
  undoRedoTest_tearDown();
}

function test_undoRedoRenameVariable_OnlyCaseChange_NoBlocks() {
  undoRedoTest_setUp();
  workspace.createVariable('name1', '', 'id1');
  workspace.renameVariable('name1', 'Name1');

  workspace.undo();
  checkVariableValues(workspace, 'name1', '', 'id1');

  workspace.undo(true);
  checkVariableValues(workspace, 'Name1', '', 'id1');
  undoRedoTest_tearDown();
}

function test_undoRedoRenameVariable_OnlyCaseChange_WithBlocks() {
  undoRedoTest_setUp();
  workspace.createVariable('name1', '', 'id1');
  createMockBlock('name1');
  workspace.renameVariable('name1', 'Name1');

  workspace.undo();
  undoRedoTest_checkBlockVariableName(0, 'name1');
  checkVariableValues(workspace, 'name1', '', 'id1');

  workspace.undo(true);
  checkVariableValues(workspace, 'Name1', '', 'id1');
  undoRedoTest_checkBlockVariableName(0, 'Name1');
  undoRedoTest_tearDown();
}
