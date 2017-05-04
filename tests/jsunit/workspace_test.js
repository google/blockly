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
var saved_msg = Blockly.Msg.DELETE_VARIABLE;
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

function workspaceTest_setUpWithMockBlocks() {
  workspaceTest_setUp();
  // Need to define this because field_variable's dropdownCreate() calls replace
  // on undefined value, Blockly.Msg.DELETE_VARIABLE. To fix this, define
  // Blockly.Msg.DELETE_VARIABLE as %1 so the replace function finds the %1 it
  // expects.
  Blockly.Msg.DELETE_VARIABLE = '%1';
}

function workspaceTest_tearDown() {
  mockControl_.$tearDown();
  workspace.dispose();
}

function workspaceTest_tearDownWithMockBlocks() {
  workspaceTest_tearDown();
  Blockly.Msg.DELETE_VARIABLE = saved_msg;
}

/**
 * Create a test get_var_block.
 * @param {?string} variable The string to put into the variable field.
 * @return {!Blockly.Block} The created block.
 */
function createMockBlock(variable) {
  var block = new Blockly.Block(workspace, 'get_var_block');
  block.inputList[0].fieldRow[0].setValue(variable);
  return block;
}

/**
 * Check that two arrays have the same content.
 * @param {!Array.<string>} array1 The first array.
 * @param {!Array.<string>} array2 The second array.
 */
function isEqualArrays(array1, array2) {
  assertEquals(array1.length, array2.length);
  for (var i = 0; i < array1.length; i++) {
    assertEquals(array1[i], array2[i]);
  }
}

/**
 * Check if a variable with the given values exists.
 * @param {!string} name The expected name of the variable.
 * @param {!string} type The expected type of the variable.
 * @param {!string} id The expected id of the variable.
 */
function workspaceTest_checkVariableValues(name, type, id) {
  var variable = workspace.getVariable(name);
  assertNotUndefined(variable);
  assertEquals(name, variable.name);
  assertEquals(type, variable.type);
  assertEquals(id, variable.getId());
}

/**
 * Creates a controlled MethodMock. Set the expected return values. Set the
 * method to replay.
 * @param {!Object} scope The scope of the method to be mocked out.
 * @param {!string} funcName The name of the function we're going to mock.
 * @param {Object} parameters The parameters to call the mock with.
 * @param {!Object} return_value The value to return when called.
 * @return {!goog.testing.MockInterface} The mocked method.
 */
function setUpMockMethod(scope, funcName, parameters, return_value) {
  var mockMethod = mockControl_.createMethodMock(scope, funcName);
  if (parameters) {
    mockMethod(parameters).$returns(return_value);
  }
  else {
    mockMethod().$returns(return_value);
  }
  mockMethod.$replay();
  return mockMethod;
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
  workspaceTest_setUpWithMockBlocks()
  var var_1 = workspace.createVariable('name1', 'type1', 'id1');
  workspace.createVariable('name2', 'type2', 'id2');
  createMockBlock('name1');
  createMockBlock('name1');
  createMockBlock('name2');

  workspace.deleteVariableInternal_(var_1);
  var variable = workspace.getVariable('name1');
  var block_var_name = workspace.topBlocks_[0].getVars()[0];
  assertNull(variable);
  workspaceTest_checkVariableValues('name2', 'type2', 'id2');
  assertEquals('name2', block_var_name);
  workspaceTest_tearDownWithMockBlocks();
}

// TODO(marisaleung): Test the alert for deleting a variable that is a procedure.

function test_updateVariableStore_TrivialNoClear() {
  workspaceTest_setUp();
  workspace.createVariable('name1', 'type1', 'id1');
  workspace.createVariable('name2', 'type2', 'id2');
  var mockAllUsedVariables = setUpMockMethod(Blockly.Variables,
      'allUsedVariables', workspace, ['name1', 'name2']);

  try {
    workspace.updateVariableStore();
    mockAllUsedVariables.$verify();
    workspaceTest_checkVariableValues('name1', 'type1', 'id1');
    workspaceTest_checkVariableValues('name2', 'type2', 'id2');
  }
  finally {
    workspaceTest_tearDown();
  }
}

function test_updateVariableStore_NameNotInvariableMap_NoClear() {
  workspaceTest_setUp();
  setUpMockMethod(Blockly.Variables, 'allUsedVariables', workspace, ['name1']);
  setUpMockMethod(Blockly.utils, 'genUid', null, '1');

  try {
    workspace.updateVariableStore();
    mockControl_.$verifyAll();
    workspaceTest_checkVariableValues('name1', '', '1');
  }
  finally {
    workspaceTest_tearDown();
  }
}

function test_updateVariableStore_ClearAndAllInUse() {
  workspaceTest_setUp();
  workspace.createVariable('name1', 'type1', 'id1');
  workspace.createVariable('name2', 'type2', 'id2');
  var mockAllUsedVariables = setUpMockMethod(Blockly.Variables,
    'allUsedVariables', workspace, ['name1', 'name2']);

  try {
    workspace.updateVariableStore(true);
    mockAllUsedVariables.$verify();
    workspaceTest_checkVariableValues('name1', 'type1', 'id1');
    workspaceTest_checkVariableValues('name2', 'type2', 'id2');
  }
  finally {
    workspaceTest_tearDown();
  }
}

function test_updateVariableStore_ClearAndOneInUse() {
  workspaceTest_setUp();
  workspace.createVariable('name1', 'type1', 'id1');
  workspace.createVariable('name2', 'type2', 'id2');
  var mockAllUsedVariables = setUpMockMethod(Blockly.Variables,
    'allUsedVariables', workspace, ['name1']);

  try {
    workspace.updateVariableStore(true);
    mockAllUsedVariables.$verify();
    workspaceTest_checkVariableValues('name1', 'type1', 'id1');
    var variabe = workspace.getVariable('name2');
    assertNull(variable);
  }
  finally {
    workspaceTest_tearDown();
  }
}

function test_addTopBlock_TrivialFlyoutIsTrue() {
  workspaceTest_setUpWithMockBlocks()
  workspace.isFlyout = true;
  var block = createMockBlock();
  workspace.removeTopBlock(block);
  setUpMockMethod(Blockly.Variables, 'allUsedVariables', block, ['name1']);
  setUpMockMethod(Blockly.utils, 'genUid', null, '1');

  try {
    workspace.addTopBlock(block);
    mockControl_.$verifyAll();
    workspaceTest_checkVariableValues('name1', '', '1');
  }
  finally {
    workspaceTest_tearDownWithMockBlocks();
  }
}

function test_clear_Trivial() {
  workspaceTest_setUp();
  workspace.createVariable('name1', 'type1', 'id1');
  workspace.createVariable('name2', 'type2', 'id2');
  var mockSetGroup = mockControl_.createMethodMock(Blockly.Events, 'setGroup');
  mockSetGroup(true);
  mockSetGroup(false);
  mockSetGroup.$replay();

  try {
    workspace.clear();
    mockControl_.$verifyAll();
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
  var mockSetGroup = mockControl_.createMethodMock(Blockly.Events, 'setGroup');
  mockSetGroup(true);
  mockSetGroup(false);
  mockSetGroup.$replay();

  try {
    workspace.clear();
    mockSetGroup.$verify();
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
  var mockSetGroup = mockControl_.createMethodMock(Blockly.Events, 'setGroup');
  var mockGenUid = mockControl_.createMethodMock(Blockly.utils, 'genUid');
  // Mocked setGroup to ensure only one call to the mocked genUid.
  mockSetGroup(true);
  mockSetGroup(false);
  mockGenUid().$returns('1');
  mockControl_.$replayAll();

  try {
    workspace.renameVariable(oldName, newName);
    mockControl_.$verifyAll();
    workspaceTest_checkVariableValues('name2', '', '1');
    var variable = workspace.getVariable(oldName);
    assertNull(variable);
  }
  finally {
    workspaceTest_tearDown();
  }
}

function test_renameVariable_SameNameNoBlocks() {
  // Expect 'renameVariable' to create new variable with newName.
  workspaceTest_setUpWithMockBlocks()
  var name = 'name1';
  workspace.createVariable(name, 'type1', 'id1');

  workspace.renameVariable(name, name);
  workspaceTest_checkVariableValues(name, 'type1', 'id1');
  workspaceTest_tearDownWithMockBlocks();
}

function test_renameVariable_OnlyOldNameBlockExists() {
  // Expect 'renameVariable' to change oldName variable name to newName.
  workspaceTest_setUpWithMockBlocks()
  var oldName = 'name1';
  var newName = 'name2';
  workspace.createVariable(oldName, 'type1', 'id1');
  createMockBlock(oldName);

  workspace.renameVariable(oldName, newName);
  workspaceTest_checkVariableValues(newName, 'type1', 'id1');
  var variable = workspace.getVariable(oldName);
  var block_var_name = workspace.topBlocks_[0].getVars()[0];
  assertNull(variable);
  assertEquals(newName, block_var_name);
  workspaceTest_tearDownWithMockBlocks();
}

function test_renameVariable_TwoVariablesSameType() {
  // Expect 'renameVariable' to change oldName variable name to newName.
  // Expect oldName block name to change to newName
  workspaceTest_setUpWithMockBlocks()
  var oldName = 'name1';
  var newName = 'name2';
  workspace.createVariable(oldName, 'type1', 'id1');
  workspace.createVariable(newName, 'type1', 'id2');
  createMockBlock(oldName);
  createMockBlock(newName);

  workspace.renameVariable(oldName, newName);
  workspaceTest_checkVariableValues(newName, 'type1', 'id2');
  var variable = workspace.getVariable(oldName);
  var block_var_name_1 = workspace.topBlocks_[0].getVars()[0];
  var block_var_name_2 = workspace.topBlocks_[1].getVars()[0];
  assertNull(variable);
  assertEquals(newName, block_var_name_1);
  assertEquals(newName, block_var_name_2);
  workspaceTest_tearDownWithMockBlocks();
}

function test_renameVariable_TwoVariablesDifferentType() {
  // Expect triggered error because of different types
  workspaceTest_setUpWithMockBlocks()
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
  workspaceTest_checkVariableValues(oldName, 'type1', 'id1');
  workspaceTest_checkVariableValues(newName, 'type2', 'id2');
  var block_var_name_1 = workspace.topBlocks_[0].getVars()[0];
  var block_var_name_2 = workspace.topBlocks_[1].getVars()[0];
  assertEquals(oldName, block_var_name_1);
  assertEquals(newName, block_var_name_2);
  workspaceTest_tearDownWithMockBlocks();
}

function test_renameVariable_OldCase() {
  // Expect triggered error because of different types
  workspaceTest_setUpWithMockBlocks();
  var oldCase = 'Name1';
  var newName = 'name1';
  workspace.createVariable(oldCase, 'type1', 'id1');
  createMockBlock(oldCase);

  workspace.renameVariable(oldCase, newName);
  workspaceTest_checkVariableValues(newName, 'type1', 'id1');
  var result_oldCase = workspace.getVariable(oldCase).name
  assertNotEquals(oldCase, result_oldCase);
  workspaceTest_tearDownWithMockBlocks();
}

function test_renameVariable_TwoVariablesAndOldCase() {
  // Expect triggered error because of different types
  workspaceTest_setUpWithMockBlocks()
  var oldName = 'name1';
  var oldCase = 'Name2';
  var newName = 'name2';
  workspace.createVariable(oldName, 'type1', 'id1');
  workspace.createVariable(oldCase, 'type1', 'id2');
  createMockBlock(oldName);
  createMockBlock(oldCase);

  workspace.renameVariable(oldName, newName);

  workspaceTest_checkVariableValues(newName, 'type1', 'id2');
  var variable = workspace.getVariable(oldName);
  var result_oldCase = workspace.getVariable(oldCase).name;
  var block_var_name_1 = workspace.topBlocks_[0].getVars()[0];
  var block_var_name_2 = workspace.topBlocks_[1].getVars()[0];
  assertNull(variable);
  assertNotEquals(oldCase, result_oldCase);
  assertEquals(newName, block_var_name_1);
  assertEquals(newName, block_var_name_2);
  workspaceTest_tearDownWithMockBlocks();
}

// Extra testing not required for renameVariableById. It calls renameVariable
// and that has extensive testing.
function test_renameVariableById_TwoVariablesSameType() {
  // Expect 'renameVariableById' to change oldName variable name to newName.
  // Expect oldName block name to change to newName
  workspaceTest_setUpWithMockBlocks()
  var oldName = 'name1';
  var newName = 'name2';
  workspace.createVariable(oldName, 'type1', 'id1');
  workspace.createVariable(newName, 'type1', 'id2');
  createMockBlock(oldName);
  createMockBlock(newName);

  workspace.renameVariableById('id1', newName);
  workspaceTest_checkVariableValues(newName, 'type1', 'id2');
  var variable = workspace.getVariable(oldName)
  var block_var_name_1 = workspace.topBlocks_[0].getVars()[0];
  var block_var_name_2 = workspace.topBlocks_[1].getVars()[0];
  assertNull(variable);
  assertEquals(newName, block_var_name_1);
  assertEquals(newName, block_var_name_2);
  workspaceTest_tearDownWithMockBlocks();
}

function test_deleteVariable_Trivial() {
  workspaceTest_setUpWithMockBlocks()
  workspace.createVariable('name1', 'type1', 'id1');
  workspace.createVariable('name2', 'type1', 'id2');
  createMockBlock('name1');
  createMockBlock('name2');

  workspace.deleteVariable('name1');
  workspaceTest_checkVariableValues('name2', 'type1', 'id2');
  var variable = workspace.getVariable('name1');
  var block_var_name = workspace.topBlocks_[0].getVars()[0];
  assertNull(variable);
  assertEquals('name2', block_var_name);
  workspaceTest_tearDownWithMockBlocks();
}

function test_deleteVariableById_Trivial() {
  workspaceTest_setUpWithMockBlocks()
  workspace.createVariable('name1', 'type1', 'id1');
  workspace.createVariable('name2', 'type1', 'id2');
  createMockBlock('name1');
  createMockBlock('name2');

  workspace.deleteVariableById('id1');
  workspaceTest_checkVariableValues('name2', 'type1', 'id2');
  var variable = workspace.getVariable('name1');
  var block_var_name = workspace.topBlocks_[0].getVars()[0];
  assertNull(variable);
  assertEquals('name2', block_var_name);
  workspaceTest_tearDownWithMockBlocks();
}
