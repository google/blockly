/**
 * @license
 * Copyright 2017 Google LLC
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
 * @fileoverview Tests for variable map.
 * @author marisaleung@google.com (Marisa Leung)
 */
'use strict';

var variable_map;
var mockControl_;
var workspace;

function variableMapTest_setUp() {
  workspace = new Blockly.Workspace();
  variable_map = new Blockly.VariableMap(workspace);
}

function variableMapTest_tearDown() {
  workspace.dispose();
  if (mockControl_) {
    mockControl_.restore();
  }
  variable_map = null;
}

function test_getVariable_ByNameAndType() {
  variableMapTest_setUp();
  var var_1 = variable_map.createVariable('name1', 'type1', 'id1');
  var var_2 = variable_map.createVariable('name2', 'type1', 'id2');
  var var_3 = variable_map.createVariable('name3', 'type2', 'id3');
  var result_1 = variable_map.getVariable('name1', 'type1');
  var result_2 = variable_map.getVariable('name2', 'type1');
  var result_3 = variable_map.getVariable('name3', 'type2');

  // Searching by name + type is correct.
  assertEquals(var_1, result_1);
  assertEquals(var_2, result_2);
  assertEquals(var_3, result_3);

  // Searching only by name defaults to the '' type.
  assertNull(variable_map.getVariable('name1'));
  assertNull(variable_map.getVariable('name2'));
  assertNull(variable_map.getVariable('name3'));
  variableMapTest_tearDown();
}

function test_getVariable_NotFound() {
  variableMapTest_setUp();
  var result = variable_map.getVariable('name1');
  assertNull(result);
  variableMapTest_tearDown();
}

function test_getVariableById_Trivial() {
  variableMapTest_setUp();
  var var_1 = variable_map.createVariable('name1', 'type1', 'id1');
  var var_2 = variable_map.createVariable('name2', 'type1', 'id2');
  var var_3 = variable_map.createVariable('name3', 'type2', 'id3');
  var result_1 = variable_map.getVariableById('id1');
  var result_2 = variable_map.getVariableById('id2');
  var result_3 = variable_map.getVariableById('id3');

  assertEquals(var_1, result_1);
  assertEquals(var_2, result_2);
  assertEquals(var_3, result_3);
  variableMapTest_tearDown();
}

function test_getVariableById_NotFound() {
  variableMapTest_setUp();
  var result = variable_map.getVariableById('id1');
  assertNull(result);
  variableMapTest_tearDown();
}

function test_createVariableTrivial() {
  variableMapTest_setUp();
  variable_map.createVariable('name1', 'type1', 'id1');
  checkVariableValues(variable_map, 'name1', 'type1', 'id1');
  variableMapTest_tearDown();
}

function test_createVariableAlreadyExists() {
  // Expect that when the variable already exists, the variableMap_ is unchanged.
  variableMapTest_setUp();
  variable_map.createVariable('name1', 'type1', 'id1');

  // Assert there is only one variable in the variable_map.
  var keys = Object.keys(variable_map.variableMap_);
  assertEquals(1, keys.length);
  var varMapLength = variable_map.variableMap_[keys[0]].length;
  assertEquals(1, varMapLength);

  variable_map.createVariable('name1', 'type1');
  checkVariableValues(variable_map, 'name1', 'type1', 'id1');
  // Check that the size of the variableMap_ did not change.
  keys = Object.keys(variable_map.variableMap_);
  assertEquals(1, keys.length);
  varMapLength = variable_map.variableMap_[keys[0]].length;
  assertEquals(1, varMapLength);
  variableMapTest_tearDown();
}

function test_createVariableNameAlreadyExists() {
  // Expect that when a variable with the same name but a different type already
  // exists, the new variable is created.
  variableMapTest_setUp();
  variable_map.createVariable('name1', 'type1', 'id1');

  // Assert there is only one variable in the variable_map.
  var keys = Object.keys(variable_map.variableMap_);
  assertEquals(1, keys.length);
  var varMapLength = variable_map.variableMap_[keys[0]].length;
  assertEquals(1, varMapLength);

  variable_map.createVariable('name1', 'type2', 'id2');
  checkVariableValues(variable_map, 'name1', 'type1', 'id1');
  checkVariableValues(variable_map, 'name1', 'type2', 'id2');
  // Check that the size of the variableMap_ did change.
  keys = Object.keys(variable_map.variableMap_);
  assertEquals(2, keys.length);
  variableMapTest_tearDown();
}
function test_createVariableNullAndUndefinedType() {
  variableMapTest_setUp();
  variable_map.createVariable('name1', null, 'id1');
  variable_map.createVariable('name2', undefined, 'id2');

  checkVariableValues(variable_map, 'name1', '', 'id1');
  checkVariableValues(variable_map, 'name2', '', 'id2');
  variableMapTest_tearDown();
}

function test_createVariableNullId() {
  variableMapTest_setUp();
  mockControl_ = setUpMockMethod(Blockly.utils, 'genUid', null, ['1', '2']);
  try {
    variable_map.createVariable('name1', 'type1', null);
    checkVariableValues(variable_map, 'name1', 'type1', '1');
  } finally {
    variableMapTest_tearDown();
  }
}

function test_createVariableUndefinedId() {
  variableMapTest_setUp();
  mockControl_ = setUpMockMethod(Blockly.utils, 'genUid', null, ['1', '2']);
  try {
    variable_map.createVariable('name1', 'type1', undefined);
    checkVariableValues(variable_map, 'name1', 'type1', '1');
  } finally {
    variableMapTest_tearDown();
  }
}

function test_createVariableIdAlreadyExists() {
  variableMapTest_setUp();
  variable_map.createVariable('name1', 'type1', 'id1');
  try {
    variable_map.createVariable('name2', 'type2', 'id1');
    fail();
  } catch (e) {
    // expected
  }
  variableMapTest_tearDown();
}

function test_createVariableMismatchedIdAndType() {
  variableMapTest_setUp();
  variable_map.createVariable('name1', 'type1', 'id1');
  try {
    variable_map.createVariable('name1', 'type2', 'id1');
    fail();
  } catch (e) {
    // expected
  }
  try {
    variable_map.createVariable('name1', 'type1', 'id2');
    fail();
  } catch (e) {
    // expected
  }
  variableMapTest_tearDown();
}

function test_createVariableTwoSameTypes() {
  variableMapTest_setUp();
  variable_map.createVariable('name1', 'type1', 'id1');
  variable_map.createVariable('name2', 'type1', 'id2');

  checkVariableValues(variable_map, 'name1', 'type1', 'id1');
  checkVariableValues(variable_map, 'name2', 'type1', 'id2');
  variableMapTest_tearDown();
}

function test_getVariablesOfType_Trivial() {
  variableMapTest_setUp();
  var var_1 = variable_map.createVariable('name1', 'type1', 'id1');
  var var_2 = variable_map.createVariable('name2', 'type1', 'id2');
  variable_map.createVariable('name3', 'type2', 'id3');
  variable_map.createVariable('name4', 'type3', 'id4');
  var result_array_1 = variable_map.getVariablesOfType('type1');
  var result_array_2 = variable_map.getVariablesOfType('type5');
  isEqualArrays([var_1, var_2], result_array_1);
  isEqualArrays([], result_array_2);
  variableMapTest_tearDown();
}

function test_getVariablesOfType_Null() {
  variableMapTest_setUp();
  var var_1 = variable_map.createVariable('name1', '', 'id1');
  var var_2 = variable_map.createVariable('name2', '', 'id2');
  var var_3 = variable_map.createVariable('name3', '', 'id3');
  variable_map.createVariable('name4', 'type1', 'id4');
  var result_array = variable_map.getVariablesOfType(null);
  isEqualArrays([var_1, var_2, var_3], result_array);
  variableMapTest_tearDown();
}

function test_getVariablesOfType_EmptyString() {
  variableMapTest_setUp();
  var var_1 = variable_map.createVariable('name1', null, 'id1');
  var var_2 = variable_map.createVariable('name2', null, 'id2');
  var result_array = variable_map.getVariablesOfType('');
  isEqualArrays([var_1, var_2], result_array);
  variableMapTest_tearDown();
}

function test_getVariablesOfType_Deleted() {
  variableMapTest_setUp();
  var variable = variable_map.createVariable('name1', null, 'id1');
  variable_map.deleteVariable(variable);
  var result_array = variable_map.getVariablesOfType('');
  isEqualArrays([], result_array);
  variableMapTest_tearDown();
}

function test_getVariablesOfType_DoesNotExist() {
  variableMapTest_setUp();
  var result_array = variable_map.getVariablesOfType('type1');
  isEqualArrays([], result_array);
  variableMapTest_tearDown();
}

function test_getVariableTypes_Trivial() {
  variableMapTest_setUp();
  variable_map.createVariable('name1', 'type1', 'id1');
  variable_map.createVariable('name2', 'type1', 'id2');
  variable_map.createVariable('name3', 'type2', 'id3');
  variable_map.createVariable('name4', 'type3', 'id4');
  var result_array = variable_map.getVariableTypes();
  // The empty string is always an option.
  isEqualArrays(['type1', 'type2', 'type3', ''], result_array);
  variableMapTest_tearDown();
}

function test_getVariableTypes_None() {
  variableMapTest_setUp();
  // The empty string is always an option.
  var result_array = variable_map.getVariableTypes();
  isEqualArrays([''], result_array);
  variableMapTest_tearDown();
}

function test_getAllVariables_Trivial() {
  variableMapTest_setUp();
  var var_1 = variable_map.createVariable('name1', 'type1', 'id1');
  var var_2 = variable_map.createVariable('name2', 'type1', 'id2');
  var var_3 = variable_map.createVariable('name3', 'type2', 'id3');
  var result_array = variable_map.getAllVariables();
  isEqualArrays([var_1, var_2, var_3], result_array);
  variableMapTest_tearDown();
}

function test_getAllVariables_None() {
  variableMapTest_setUp();
  var result_array = variable_map.getAllVariables();
  isEqualArrays([], result_array);
  variableMapTest_tearDown();
}
