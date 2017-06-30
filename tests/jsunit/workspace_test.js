/**
 * @license
 * Blockly Tests
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
'use strict';

goog.require('goog.testing');
goog.require('goog.testing.MockControl');

var workspace;
var mockControl_;
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

function workspaceTest_setUp() {
  workspace = new Blockly.Workspace();
  mockControl_ = new goog.testing.MockControl();
}

function workspaceTest_tearDown() {
  mockControl_.$tearDown();
  workspace.dispose();
}

/**
 * Create a test get_var_block.
 * @param {?string} variable_name The string to put into the variable field.
 * @return {!Blockly.Block} The created block.
 */
function createMockBlock(variable_name) {
  var block = new Blockly.Block(workspace, 'get_var_block');
  block.inputList[0].fieldRow[0].setValue(variable_name);
  return block;
}

function test_emptyWorkspace() {
  workspaceTest_setUp();
  try {
    assertEquals('Empty workspace (1).', 0, workspace.getTopBlocks(true).length);
    assertEquals('Empty workspace (2).', 0, workspace.getTopBlocks(false).length);
    assertEquals('Empty workspace (3).', 0, workspace.getAllBlocks().length);
    workspace.clear();
    assertEquals('Empty workspace (4).', 0, workspace.getTopBlocks(true).length);
    assertEquals('Empty workspace (5).', 0, workspace.getTopBlocks(false).length);
    assertEquals('Empty workspace (6).', 0, workspace.getAllBlocks().length);
  }
  finally {
    workspaceTest_tearDown();
  }
}

function test_flatWorkspace() {
  workspaceTest_setUp();
  try {
    var blockA = workspace.newBlock('');
    assertEquals('One block workspace (1).', 1, workspace.getTopBlocks(true).length);
    assertEquals('One block workspace (2).', 1, workspace.getTopBlocks(false).length);
    assertEquals('One block workspace (3).', 1, workspace.getAllBlocks().length);
    var blockB = workspace.newBlock('');
    assertEquals('Two block workspace (1).', 2, workspace.getTopBlocks(true).length);
    assertEquals('Two block workspace (2).', 2, workspace.getTopBlocks(false).length);
    assertEquals('Two block workspace (3).', 2, workspace.getAllBlocks().length);
    blockA.dispose();
    assertEquals('One block workspace (4).', 1, workspace.getTopBlocks(true).length);
    assertEquals('One block workspace (5).', 1, workspace.getTopBlocks(false).length);
    assertEquals('One block workspace (6).', 1, workspace.getAllBlocks().length);
    workspace.clear();
    assertEquals('Cleared workspace (1).', 0, workspace.getTopBlocks(true).length);
    assertEquals('Cleared workspace (2).', 0, workspace.getTopBlocks(false).length);
    assertEquals('Cleared workspace (3).', 0, workspace.getAllBlocks().length);
  } finally {
    workspaceTest_tearDown();
  }
}

function test_maxBlocksWorkspace() {
  workspaceTest_setUp();
  try {
    var blockA = workspace.newBlock('');
    var blockB = workspace.newBlock('');
    assertEquals('Infinite capacity.', Infinity, workspace.remainingCapacity());
    workspace.options.maxBlocks = 3;
    assertEquals('Three capacity.', 1, workspace.remainingCapacity());
    workspace.options.maxBlocks = 2;
    assertEquals('Two capacity.', 0, workspace.remainingCapacity());
    workspace.options.maxBlocks = 1;
    assertEquals('One capacity.', -1, workspace.remainingCapacity());
    workspace.options.maxBlocks = 0;
    assertEquals('Zero capacity.', -2, workspace.remainingCapacity());
    workspace.clear();
    assertEquals('Cleared capacity.', 0, workspace.remainingCapacity());
  } finally {
    workspaceTest_tearDown();
  }
}

function test_getWorkspaceById() {
  var workspaceA = new Blockly.Workspace();
  var workspaceB = new Blockly.Workspace();
  try {
    assertEquals('Find workspaceA.', workspaceA,
        Blockly.Workspace.getById(workspaceA.id));
    assertEquals('Find workspaceB.', workspaceB,
        Blockly.Workspace.getById(workspaceB.id));
    assertEquals('No workspace found.', null,
        Blockly.Workspace.getById('I do not exist.'));
    workspaceA.dispose();
    assertEquals('Can\'t find workspaceA.', null,
        Blockly.Workspace.getById(workspaceA.id));
    assertEquals('WorkspaceB exists.', workspaceB,
        Blockly.Workspace.getById(workspaceB.id));
  } finally {
    workspaceB.dispose();
    workspaceA.dispose();
  }
}

function test_getBlockById() {
  workspaceTest_setUp();
  try {
    var blockA = workspace.newBlock('');
    var blockB = workspace.newBlock('');
    assertEquals('Find blockA.', blockA, workspace.getBlockById(blockA.id));
    assertEquals('Find blockB.', blockB, workspace.getBlockById(blockB.id));
    assertEquals('No block found.', null,
        workspace.getBlockById('I do not exist.'));
    blockA.dispose();
    assertEquals('Can\'t find blockA.', null, workspace.getBlockById(blockA.id));
    assertEquals('BlockB exists.', blockB, workspace.getBlockById(blockB.id));
    workspace.clear();
    assertEquals('Can\'t find blockB.', null, workspace.getBlockById(blockB.id));
  } finally {
    workspaceTest_tearDown();
  }
}

function test_deleteVariable_InternalTrivial() {
  workspaceTest_setUp();
  var var_1 = workspace.createVariable('name1', 'type1', 'id1');
  workspace.createVariable('name2', 'type2', 'id2');
  createMockBlock('name1');
  createMockBlock('name1');
  createMockBlock('name2');

  workspace.deleteVariableInternal_(var_1);
  var variable = workspace.getVariable('name1');
  var block_var_name = workspace.topBlocks_[0].getVars()[0];
  assertNull(variable);
  checkVariableValues(workspace, 'name2', 'type2', 'id2');
  assertEquals('name2', block_var_name);
  workspaceTest_tearDown();
}

// TODO(marisaleung): Test the alert for deleting a variable that is a procedure.

function test_updateVariableStore_TrivialNoClear() {
  workspaceTest_setUp();
  workspace.createVariable('name1', 'type1', 'id1');
  workspace.createVariable('name2', 'type2', 'id2');
  setUpMockMethod(mockControl_, Blockly.Variables, 'allUsedVariables',
    [workspace], [['name1', 'name2']]);

  try {
    workspace.updateVariableStore();
    checkVariableValues(workspace, 'name1', 'type1', 'id1');
    checkVariableValues(workspace, 'name2', 'type2', 'id2');
  }
  finally {
    workspaceTest_tearDown();
  }
}

function test_updateVariableStore_NameNotInvariableMap_NoClear() {
  workspaceTest_setUp();
  setUpMockMethod(mockControl_, Blockly.Variables, 'allUsedVariables',
    [workspace], [['name1']]);
  setUpMockMethod(mockControl_, Blockly.utils, 'genUid', null, ['1']);

  try {
    workspace.updateVariableStore();
    checkVariableValues(workspace, 'name1', '', '1');
  }
  finally {
    workspaceTest_tearDown();
  }
}

function test_updateVariableStore_ClearAndAllInUse() {
  workspaceTest_setUp();
  workspace.createVariable('name1', 'type1', 'id1');
  workspace.createVariable('name2', 'type2', 'id2');
  setUpMockMethod(mockControl_, Blockly.Variables, 'allUsedVariables',
    [workspace], [['name1', 'name2']]);

  try {
    workspace.updateVariableStore(true);
    checkVariableValues(workspace, 'name1', 'type1', 'id1');
    checkVariableValues(workspace, 'name2', 'type2', 'id2');
  }
  finally {
    workspaceTest_tearDown();
  }
}

function test_updateVariableStore_ClearAndOneInUse() {
  workspaceTest_setUp();
  workspace.createVariable('name1', 'type1', 'id1');
  workspace.createVariable('name2', 'type2', 'id2');
  setUpMockMethod(mockControl_, Blockly.Variables, 'allUsedVariables',
    [workspace], [['name1']]);

  try {
    workspace.updateVariableStore(true);
    checkVariableValues(workspace, 'name1', 'type1', 'id1');
    var variabe = workspace.getVariable('name2');
    assertNull(variable);
  }
  finally {
    workspaceTest_tearDown();
  }
}

function test_addTopBlock_TrivialFlyoutIsTrue() {
  workspaceTest_setUp();
  workspace.isFlyout = true;
  var block = createMockBlock();
  workspace.removeTopBlock(block);
  setUpMockMethod(mockControl_, Blockly.Variables, 'allUsedVariables', [block],
    [['name1']]);
  setUpMockMethod(mockControl_, Blockly.utils, 'genUid', null, ['1']);

  try {
    workspace.addTopBlock(block);
    checkVariableValues(workspace, 'name1', '', '1');
  }
  finally {
    workspaceTest_tearDown();
  }
}

function test_clear_Trivial() {
  workspaceTest_setUp();
  workspace.createVariable('name1', 'type1', 'id1');
  workspace.createVariable('name2', 'type2', 'id2');
  setUpMockMethod(mockControl_, Blockly.Events, 'setGroup', [true, false],
    null);

  try {
    workspace.clear();
    var topBlocks_length = workspace.topBlocks_.length;
    var varMapLength = Object.keys(workspace.variableMap_.variableMap_).length;
    assertEquals(0, topBlocks_length);
    assertEquals(0, varMapLength);
  }
  finally {
    workspaceTest_tearDown();
  }
}

function test_clear_NoVariables() {
  workspaceTest_setUp();
  setUpMockMethod(mockControl_, Blockly.Events, 'setGroup', [true, false],
    null);

  try {
    workspace.clear();
    var topBlocks_length = workspace.topBlocks_.length;
    var varMapLength = Object.keys(workspace.variableMap_.variableMap_).length;
    assertEquals(0, topBlocks_length);
    assertEquals(0, varMapLength);
  }
  finally {
    workspaceTest_tearDown();
  }
}

function test_renameVariable_NoBlocks() {
  // Expect 'renameVariable' to create new variable with newName.
  workspaceTest_setUp();
  var oldName = 'name1';
  var newName = 'name2';
    // Mocked setGroup to ensure only one call to the mocked genUid.
  setUpMockMethod(mockControl_, Blockly.Events, 'setGroup', [true, false],
    null);
  setUpMockMethod(mockControl_, Blockly.utils, 'genUid', null, ['1']);

  try {
    workspace.renameVariable(oldName, newName);
    checkVariableValues(workspace, 'name2', '', '1');
    var variable = workspace.getVariable(oldName);
    assertNull(variable);
  }
  finally {
    workspaceTest_tearDown();
  }
}

function test_renameVariable_SameNameNoBlocks() {
  // Expect 'renameVariable' to create new variable with newName.
  workspaceTest_setUp();
  var name = 'name1';
  workspace.createVariable(name, 'type1', 'id1');

  workspace.renameVariable(name, name);
  checkVariableValues(workspace, name, 'type1', 'id1');
  workspaceTest_tearDown();
}

function test_renameVariable_OnlyOldNameBlockExists() {
  // Expect 'renameVariable' to change oldName variable name to newName.
  workspaceTest_setUp();
  var oldName = 'name1';
  var newName = 'name2';
  workspace.createVariable(oldName, 'type1', 'id1');
  createMockBlock(oldName);

  workspace.renameVariable(oldName, newName);
  checkVariableValues(workspace, newName, 'type1', 'id1');
  var variable = workspace.getVariable(oldName);
  var block_var_name = workspace.topBlocks_[0].getVars()[0];
  assertNull(variable);
  assertEquals(newName, block_var_name);
  workspaceTest_tearDown();
}

function test_renameVariable_TwoVariablesSameType() {
  // Expect 'renameVariable' to change oldName variable name to newName.
  // Expect oldName block name to change to newName
  workspaceTest_setUp();
  var oldName = 'name1';
  var newName = 'name2';
  workspace.createVariable(oldName, 'type1', 'id1');
  workspace.createVariable(newName, 'type1', 'id2');
  createMockBlock(oldName);
  createMockBlock(newName);

  workspace.renameVariable(oldName, newName);
  checkVariableValues(workspace, newName, 'type1', 'id2');
  var variable = workspace.getVariable(oldName);
  var block_var_name_1 = workspace.topBlocks_[0].getVars()[0];
  var block_var_name_2 = workspace.topBlocks_[1].getVars()[0];
  assertNull(variable);
  assertEquals(newName, block_var_name_1);
  assertEquals(newName, block_var_name_2);
  workspaceTest_tearDown();
}

function test_renameVariable_TwoVariablesDifferentType() {
  // Expect triggered error because of different types
  workspaceTest_setUp();
  var oldName = 'name1';
  var newName = 'name2';
  workspace.createVariable(oldName, 'type1', 'id1');
  workspace.createVariable(newName, 'type2', 'id2');
  createMockBlock(oldName);
  createMockBlock(newName);

  try {
    workspace.renameVariable(oldName, newName);
    fail();
  } catch (e) {
    // expected
  }
  checkVariableValues(workspace, oldName, 'type1', 'id1');
  checkVariableValues(workspace, newName, 'type2', 'id2');
  var block_var_name_1 = workspace.topBlocks_[0].getVars()[0];
  var block_var_name_2 = workspace.topBlocks_[1].getVars()[0];
  assertEquals(oldName, block_var_name_1);
  assertEquals(newName, block_var_name_2);
  workspaceTest_tearDown();
}

function test_renameVariable_OldCase() {
  // Expect triggered error because of different types
  workspaceTest_setUp();
  var oldCase = 'Name1';
  var newName = 'name1';
  workspace.createVariable(oldCase, 'type1', 'id1');
  createMockBlock(oldCase);

  workspace.renameVariable(oldCase, newName);
  checkVariableValues(workspace, newName, 'type1', 'id1');
  var result_oldCase = workspace.getVariable(oldCase).name;
  assertNotEquals(oldCase, result_oldCase);
  workspaceTest_tearDown();
}

function test_renameVariable_TwoVariablesAndOldCase() {
  // Expect triggered error because of different types
  workspaceTest_setUp();
  var oldName = 'name1';
  var oldCase = 'Name2';
  var newName = 'name2';
  workspace.createVariable(oldName, 'type1', 'id1');
  workspace.createVariable(oldCase, 'type1', 'id2');
  createMockBlock(oldName);
  createMockBlock(oldCase);

  workspace.renameVariable(oldName, newName);

  checkVariableValues(workspace, newName, 'type1', 'id2');
  var variable = workspace.getVariable(oldName);
  var result_oldCase = workspace.getVariable(oldCase).name;
  var block_var_name_1 = workspace.topBlocks_[0].getVars()[0];
  var block_var_name_2 = workspace.topBlocks_[1].getVars()[0];
  assertNull(variable);
  assertNotEquals(oldCase, result_oldCase);
  assertEquals(newName, block_var_name_1);
  assertEquals(newName, block_var_name_2);
  workspaceTest_tearDown();
}

// Extra testing not required for renameVariableById. It calls renameVariable
// and that has extensive testing.
function test_renameVariableById_TwoVariablesSameType() {
  // Expect 'renameVariableById' to change oldName variable name to newName.
  // Expect oldName block name to change to newName
  workspaceTest_setUp();
  var oldName = 'name1';
  var newName = 'name2';
  workspace.createVariable(oldName, 'type1', 'id1');
  workspace.createVariable(newName, 'type1', 'id2');
  createMockBlock(oldName);
  createMockBlock(newName);

  workspace.renameVariableById('id1', newName);
  checkVariableValues(workspace, newName, 'type1', 'id2');
  var variable = workspace.getVariable(oldName);
  var block_var_name_1 = workspace.topBlocks_[0].getVars()[0];
  var block_var_name_2 = workspace.topBlocks_[1].getVars()[0];
  assertNull(variable);
  assertEquals(newName, block_var_name_1);
  assertEquals(newName, block_var_name_2);
  workspaceTest_tearDown();
}

function test_deleteVariable_Trivial() {
  workspaceTest_setUp();
  workspace.createVariable('name1', 'type1', 'id1');
  workspace.createVariable('name2', 'type1', 'id2');
  createMockBlock('name1');
  createMockBlock('name2');

  workspace.deleteVariable('name1');
  checkVariableValues(workspace, 'name2', 'type1', 'id2');
  var variable = workspace.getVariable('name1');
  var block_var_name = workspace.topBlocks_[0].getVars()[0];
  assertNull(variable);
  assertEquals('name2', block_var_name);
  workspaceTest_tearDown();
}

function test_deleteVariableById_Trivial() {
  workspaceTest_setUp();
  workspace.createVariable('name1', 'type1', 'id1');
  workspace.createVariable('name2', 'type1', 'id2');
  createMockBlock('name1');
  createMockBlock('name2');

  workspace.deleteVariableById('id1');
  checkVariableValues(workspace, 'name2', 'type1', 'id2');
  var variable = workspace.getVariable('name1');
  var block_var_name = workspace.topBlocks_[0].getVars()[0];
  assertNull(variable);
  assertEquals('name2', block_var_name);
  workspaceTest_tearDown();
}
