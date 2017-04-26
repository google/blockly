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
Blockly.Msg.DELETE_VARIABLE = '%1';
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
function checkVariableValues(name, type, id) {
  assertNotUndefined(variable = workspace.getVariable(name));
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
  var blockA, blockB;
  try {
    blockA = workspace.newBlock('');
    assertEquals('One block workspace (1).', 1, workspace.getTopBlocks(true).length);
    assertEquals('One block workspace (2).', 1, workspace.getTopBlocks(false).length);
    assertEquals('One block workspace (3).', 1, workspace.getAllBlocks().length);
    blockB = workspace.newBlock('');
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
    blockB && blockB.dispose();
    blockA && blockA.dispose();
    workspaceTest_tearDown();
  }
}

function test_maxBlocksWorkspace() {
  workspaceTest_setUp();
  var blockA = workspace.newBlock('');
  var blockB = workspace.newBlock('');
  try {
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
    blockB.dispose();
    blockA.dispose();
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
  var blockA = workspace.newBlock('');
  var blockB = workspace.newBlock('');
  try {
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
    blockB.dispose();
    blockA.dispose();
  }
  workspaceTest_tearDown();
}

function test_getVariable_Trivial() {
  workspaceTest_setUp();
  var var_1 = new Blockly.VariableModel('name1', 'type1', 'id1');
  var var_2 = new Blockly.VariableModel('name2', 'type1', 'id2');
  var var_3 = new Blockly.VariableModel('name3', 'type2', 'id3');
  workspace.variableMap['type1'] = [var_1, var_2];
  workspace.variableMap['type2'] = [var_3];

  assertEquals(var_1, workspace.getVariable('name1'));
  assertEquals(var_2, workspace.getVariable('name2'));
  assertEquals(var_3, workspace.getVariable('name3'));
  workspaceTest_tearDown();
}

function test_getVariable_NotFound() {
  workspaceTest_setUp();
  assertNull(workspace.getVariable('name1'));
  workspaceTest_tearDown();
}

function test_getVariableById_Trivial() {
  workspaceTest_setUp();
  var var_1 = new Blockly.VariableModel('name1', null, 'id1');
  var var_2 = new Blockly.VariableModel('name2', null, 'id2');
  var var_3 = new Blockly.VariableModel('name3', null, 'id3');
  workspace.variableMap['type1'] = [var_1, var_2];
  workspace.variableMap['type2'] = [var_3];

  assertEquals(var_1, workspace.getVariableById('id1'));
  assertEquals(var_2, workspace.getVariableById('id2'));
  assertEquals(var_3, workspace.getVariableById('id3'));
  workspaceTest_tearDown();
}

function test_getVariableById_NotFound() {
  workspaceTest_setUp();
  assertNull(workspace.getVariableById('id1'));
  workspaceTest_tearDown();
}

function test_createVariable_Trivial() {
  workspaceTest_setUp();
  workspace.createVariable('name1', 'type1', 'id1');
  checkVariableValues('name1', 'type1', 'id1')
  workspaceTest_tearDown();
}

function test_createVariable_AlreadyExists() {
  // Expect that when the variable already exists, the variableMap is unchanged.
  workspaceTest_setUp();
  var var_1 = new Blockly.VariableModel('name1', 'type1', 'id1');
  workspace.variableMap['type1'] = [var_1];
  // Assert there is only one variable in the workspace.
  var keys = Object.keys(workspace.variableMap);
  assertEquals(1, keys.length);
  assertEquals(1, workspace.variableMap[keys[0]].length);

  workspace.createVariable('name1');
  checkVariableValues('name1', 'type1', 'id1');
  // Check that the size of the variableMap did not change.
  assertEquals(1, keys.length);
  assertEquals(1, workspace.variableMap[keys[0]].length);
  workspaceTest_tearDown();
}

function test_createVariable_NullAndUndefinedType() {
  workspaceTest_setUp();
  workspace.createVariable('name1', null, 'id1');
  workspace.createVariable('name2', undefined, 'id2');

  checkVariableValues('name1', '', 'id1');
  checkVariableValues('name2', '', 'id2');
  workspaceTest_tearDown();
}

function test_createVariable_NullId() {
  workspaceTest_setUp();
  var mockGenUid = setUpMockMethod(Blockly.utils, 'genUid', null, '1');
  try {
    workspace.createVariable('name1', 'type1', null);
    mockGenUid.$verify();
    checkVariableValues('name1', 'type1', '1');
  }
  finally {
    workspaceTest_tearDown();
  }
}

function test_createVariable_UndefinedId() {
  workspaceTest_setUp();
  var mockGenUid = setUpMockMethod(Blockly.utils, 'genUid', null, '1');
  try {
    workspace.createVariable('name1', 'type1', undefined);
    mockGenUid.$verify();
    checkVariableValues('name1', 'type1', '1');
  }
  finally {
    workspaceTest_tearDown();
  }
}

function test_createVariable_IdAlreadyExists() {
  workspaceTest_setUp();
  workspace.createVariable('name1', 'type1', 'id1');
  try {
    workspace.createVariable('name2', 'type2', 'id1');
    fail();
  } catch (e) {
    // expected
  }
  workspaceTest_tearDown();
}

function test_createVariable_TwoSameTypes() {
  workspaceTest_setUp();
  workspace.createVariable('name1', 'type1', 'id1');
  workspace.createVariable('name2', 'type1', 'id2');

  checkVariableValues('name1', 'type1', 'id1');
  checkVariableValues('name2', 'type1', 'id2');
  workspaceTest_tearDown();
}

function test_deleteVariable_InternalTrivial() {
  workspaceTest_setUp();
  workspace.createVariable('name1', 'type1', 'id1');
  workspace.createVariable('name2', 'type2', 'id2');
  createMockBlock('name1');
  createMockBlock('name1');
  createMockBlock('name2');

  workspace.deleteVariableInternal_('name1');
  assertNull(workspace.getVariable('name1'));
  checkVariableValues('name2', 'type2', 'id2');
  assertEquals('name2', workspace.topBlocks_[0].getVars()[0]);
  workspaceTest_tearDown();
}

// TODO(marisaleung): Test the alert for deleting a variable that is a procedure.

function test_updateVariableMap_TrivialNoClear() {
  workspaceTest_setUp();
  workspace.createVariable('name1', 'type1', 'id1');
  workspace.createVariable('name2', 'type2', 'id2');
  var mockAllUsedVariables = setUpMockMethod(Blockly.Variables,
      'allUsedVariables', workspace, ['name1', 'name2']);

  try {
    workspace.updateVariableMap();
    mockAllUsedVariables.$verify();
    checkVariableValues('name1', 'type1', 'id1');
    checkVariableValues('name2', 'type2', 'id2');
  }
  finally {
    workspaceTest_tearDown();
  }
}

function test_updateVariableMap_NameNotInVariableMapNoClear() {
  workspaceTest_setUp();
  setUpMockMethod(Blockly.Variables, 'allUsedVariables', workspace, ['name1']);
  setUpMockMethod(Blockly.utils, 'genUid', null, '1');

  try {
    workspace.updateVariableMap();
    mockControl_.$verifyAll();
    checkVariableValues('name1', '', '1');
  }
  finally {
    workspaceTest_tearDown();
  }
}

function test_updateVariableMap_ClearAndAllInUse() {
  workspaceTest_setUp();
  workspace.createVariable('name1', 'type1', 'id1');
  workspace.createVariable('name2', 'type2', 'id2');
  var mockAllUsedVariables = setUpMockMethod(Blockly.Variables,
    'allUsedVariables', workspace, ['name1', 'name2']);

  try {
    workspace.updateVariableMap(true);
    mockAllUsedVariables.$verify();
    checkVariableValues('name1', 'type1', 'id1');
    checkVariableValues('name2', 'type2', 'id2');
  }
  finally {
    workspaceTest_tearDown();
  }
}

function test_updateVariableMap_ClearAndOneInUse() {
  workspaceTest_setUp();
  workspace.createVariable('name1', 'type1', 'id1');
  workspace.createVariable('name2', 'type2', 'id2');
  var mockAllUsedVariables = setUpMockMethod(Blockly.Variables,
    'allUsedVariables', workspace, ['name1']);

  try {
    workspace.updateVariableMap(true);
    mockAllUsedVariables.$verify();
    checkVariableValues('name1', 'type1', 'id1');
    assertNull(workspace.getVariable('name2'));
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
  setUpMockMethod(Blockly.Variables, 'allUsedVariables', block, ['name1']);
  setUpMockMethod(Blockly.utils, 'genUid', null, '1');

  try {
    workspace.addTopBlock(block);
    mockControl_.$verifyAll();
    checkVariableValues('name1', '', '1');
  }
  finally {
    workspaceTest_tearDown();
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
    assertEquals(0, workspace.topBlocks_.length);
    assertEquals(0, Object.keys(workspace.variableMap).length);
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
    assertEquals(0, workspace.topBlocks_.length);
    assertEquals(0, Object.keys(workspace.variableMap).length);
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
    checkVariableValues('name2', '', '1');
    assertNull(workspace.getVariable(oldName));
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
  console.log(workspace.variableMap);
  checkVariableValues(name, 'type1', 'id1');
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
  checkVariableValues(newName, 'type1', 'id1');
  assertNull(workspace.getVariable(oldName));
  assertEquals(newName, workspace.topBlocks_[0].getVars()[0]);
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
  checkVariableValues(newName, 'type1', 'id2');
  assertNull(workspace.getVariable(oldName));
  assertEquals(newName, workspace.topBlocks_[0].getVars()[0]);
  assertEquals(newName, workspace.topBlocks_[1].getVars()[0]);
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
  checkVariableValues(oldName, 'type1', 'id1');
  checkVariableValues(newName, 'type2', 'id2');
  assertEquals(oldName, workspace.topBlocks_[0].getVars()[0]);
  assertEquals(newName, workspace.topBlocks_[1].getVars()[0]);
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
  checkVariableValues(newName, 'type1', 'id1');
  assertNotEquals(oldCase, workspace.getVariable(oldCase).name);
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

  checkVariableValues(newName, 'type1', 'id2');
  assertNull(workspace.getVariable(oldName));
  assertNotEquals(oldCase, workspace.getVariable(oldCase).name);
  assertEquals(newName, workspace.topBlocks_[0].getVars()[0]);
  assertEquals(newName, workspace.topBlocks_[1].getVars()[0]);
  workspaceTest_tearDown();
}

function test_renameVariable_OldNameDoesNotExist() {
  // Expect triggered error because of different types
  workspaceTest_setUp();
  var oldName = 'name1';
  var oldCase = 'Name2';
  var newName = 'name2';
  workspace.createVariable(oldCase, 'type1', 'id2');
  createMockBlock(oldCase);
  workspace.renameVariable(oldName, newName);

  checkVariableValues(newName, 'type1', 'id2');
  assertNull(workspace.getVariable(oldName));
  assertNotEquals(oldCase, workspace.getVariable(oldCase).name);
  assertEquals(newName, workspace.topBlocks_[0].getVars()[0]);
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
  checkVariableValues(newName, 'type1', 'id2');
  assertNull(workspace.getVariable(oldName));
  assertEquals(newName, workspace.topBlocks_[0].getVars()[0]);
  assertEquals(newName, workspace.topBlocks_[1].getVars()[0]);
  workspaceTest_tearDown();
}

function test_deleteVariable_Trivial() {
  workspaceTest_setUp();
  workspace.createVariable('name1', 'type1', 'id1');
  workspace.createVariable('name2', 'type1', 'id2');
  createMockBlock('name1');
  createMockBlock('name2');

  workspace.deleteVariable('name1');
  checkVariableValues('name2', 'type1', 'id2');
  assertNull(workspace.getVariable('name1'));
  assertEquals('name2', workspace.topBlocks_[0].getVars()[0]);
  workspaceTest_tearDown();
}

function test_deleteVariableById_Trivial() {
  workspaceTest_setUp();
  workspace.createVariable('name1', 'type1', 'id1');
  workspace.createVariable('name2', 'type1', 'id2');
  createMockBlock('name1');
  createMockBlock('name2');

  workspace.deleteVariableById('id1');
  checkVariableValues('name2', 'type1', 'id2');
  assertNull(workspace.getVariable('name1'));
  assertEquals('name2', workspace.topBlocks_[0].getVars()[0]);
  workspaceTest_tearDown();
}

function test_getVariablesOfType_Trivial() {
  workspaceTest_setUp();
  workspace.createVariable('name1', 'type1', 'id1');
  workspace.createVariable('name2', 'type1', 'id2');
  workspace.createVariable('name3', 'type2', 'id3');
  workspace.createVariable('name4', 'type3', 'id4');
  this.isEqualArrays(['name1', 'name2'], workspace.getVariablesOfType('type1'));
  this.isEqualArrays([], workspace.getVariablesOfType('type5'));
  workspaceTest_tearDown();
}

function test_getVariablesOfType_Null() {
  workspaceTest_setUp();
  workspace.createVariable('name1', 'type1', 'id1');
  workspace.createVariable('name2', 'type1', 'id2');
  workspace.createVariable('name3', 'type2', 'id3');
  workspace.createVariable('name4', 'type3', 'id4');
  this.isEqualArrays(['name1', 'name2', 'name3', 'name4'],
                     workspace.getVariablesOfType(null));
  workspaceTest_tearDown();
}

function test_getVariablesOfType_EmptyString() {
  workspaceTest_setUp();
  workspace.createVariable('name1', null, 'id1');
  workspace.createVariable('name2', null, 'id2');
  this.isEqualArrays(['name1', 'name2'], workspace.getVariablesOfType(''));
  workspaceTest_tearDown();
}

function test_getVariablesOfType_Deleted() {
  workspaceTest_setUp();
  workspace.createVariable('name1', null, 'id1');
  workspace.deleteVariable('name1');
  this.isEqualArrays([], workspace.getVariablesOfType(''));
  workspaceTest_tearDown();
}

function test_getVariablesOfType_DoesNotExist() {
  workspaceTest_setUp();
  this.isEqualArrays([], workspace.getVariablesOfType('type1'));
  workspaceTest_tearDown();
}

function test_getVariableTypes_Trivial() {
  workspaceTest_setUp();
  workspace.createVariable('name1', 'type1', 'id1');
  workspace.createVariable('name2', 'type1', 'id2');
  workspace.createVariable('name3', 'type2', 'id3');
  workspace.createVariable('name4', 'type3', 'id4');
  this.isEqualArrays(['type1', 'type2', 'type3'], workspace.getVariableTypes());
  workspaceTest_tearDown();
}

function test_getVariableTypes_None() {
  workspaceTest_setUp();
  this.isEqualArrays([], workspace.getVariableTypes());
  workspaceTest_tearDown();
}

function test_getAllVariables_Trivial() {
  workspaceTest_setUp();
  workspace.createVariable('name1', 'type1', 'id1');
  workspace.createVariable('name2', 'type1', 'id2');
  workspace.createVariable('name3', 'type2', 'id3');
  workspace.createVariable('name4', 'type3', 'id4');
  this.isEqualArrays(['name1', 'name2', 'name3', 'name4'],
      workspace.getAllVariables());
  workspaceTest_tearDown();
}

function test_getAllVariables_None() {
  workspaceTest_setUp();
  this.isEqualArrays([], workspace.getAllVariables());
  workspaceTest_tearDown();
}
