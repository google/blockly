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
 * @fileoverview Tests for Blockly.FieldVariable
 * @author marisaleung@google.com (Marisa Leung)
 */
'use strict';

goog.require('goog.testing');
goog.require('goog.testing.MockControl');

var workspace;
var mockControl_;

function fieldVariableTestWithMocks_setUp() {
  workspace = new Blockly.Workspace();
  mockControl_ = new goog.testing.MockControl();
}

function fieldVariableTestWithMocks_tearDown() {
  mockControl_.$tearDown();
  workspace.dispose();
}

function fieldVariable_mockBlock(workspace) {
  return {'workspace': workspace, 'isShadow': function(){return false;}};
}

function test_fieldVariable_Constructor() {
  workspace = new Blockly.Workspace();
  var fieldVariable = new Blockly.FieldVariable('name1');
  assertEquals('name1', fieldVariable.getText());
  workspace.dispose();
}

function test_fieldVariable_setValueMatchId() {
 // Expect the fieldVariable value to be set to variable name
  fieldVariableTestWithMocks_setUp();
  workspace.createVariable('name2', null, 'id2');
  var fieldVariable = new Blockly.FieldVariable('name1');
  var mockBlock = fieldVariable_mockBlock(workspace);
  fieldVariable.setSourceBlock(mockBlock);
  var event = new Blockly.Events.BlockChange(
        mockBlock, 'field', undefined, 'name1', 'id2');
  setUpMockMethod(mockControl_, Blockly.Events, 'fire', [event], null);

  fieldVariable.setValue('id2');
  assertEquals('name2', fieldVariable.getText());
  assertEquals('id2', fieldVariable.value_);
  fieldVariableTestWithMocks_tearDown();
}

function test_fieldVariable_setValueMatchName() {
  // Expect the fieldVariable value to be set to variable name
  fieldVariableTestWithMocks_setUp();
  workspace.createVariable('name2', null, 'id2');
  var fieldVariable = new Blockly.FieldVariable('name1');
  var mockBlock = fieldVariable_mockBlock(workspace);
  fieldVariable.setSourceBlock(mockBlock);
  var event = new Blockly.Events.BlockChange(
        mockBlock, 'field', undefined, 'name1', 'id2');
  setUpMockMethod(mockControl_, Blockly.Events, 'fire', [event], null);

  fieldVariable.setValue('name2');
  assertEquals('name2', fieldVariable.getText());
  assertEquals('id2', fieldVariable.value_);
  fieldVariableTestWithMocks_tearDown();
}

function test_fieldVariable_setValueNoVariable() {
  // Expect the fieldVariable value to be set to the passed in string. No error
  // should be thrown.
  fieldVariableTestWithMocks_setUp();
  var fieldVariable = new Blockly.FieldVariable('name1');
  var mockBlock = {'workspace': workspace,
    'isShadow': function(){return false;}};
  fieldVariable.setSourceBlock(mockBlock);
  var event = new Blockly.Events.BlockChange(
        mockBlock, 'field', undefined, 'name1', 'id1');
  setUpMockMethod(mockControl_, Blockly.Events, 'fire', [event], null);

  fieldVariable.setValue('id1');
  assertEquals('id1', fieldVariable.getText());
  assertEquals('id1', fieldVariable.value_);
  fieldVariableTestWithMocks_tearDown();
}

function test_fieldVariable_dropdownCreateVariablesExist() {
  // Expect that the dropdown options will contain the variables that exist.
  workspace = new Blockly.Workspace();
  workspace.createVariable('name1', '', 'id1');
  workspace.createVariable('name2', '', 'id2');
  var result_options = Blockly.FieldVariable.dropdownCreate.call(
    {
      'sourceBlock_': {'workspace': workspace},
      'getText': function(){return 'name1';},
      'getVariableTypes_': function(){return [''];}
    });
  assertEquals(result_options.length, 3);
  isEqualArrays(result_options[0], ['name1', 'id1']);
  isEqualArrays(result_options[1], ['name2', 'id2']);

  workspace.dispose();
}

function test_fieldVariable_dropdownCreateVariablesExist() {
  // Expect that the dropdown options will contain the variables that exist.
  workspace = new Blockly.Workspace();
  workspace.createVariable('name1', '', 'id1');
  workspace.createVariable('name2', '', 'id2');
  var result_options = Blockly.FieldVariable.dropdownCreate.call(
    {
      'sourceBlock_': {'workspace': workspace},
      'getText': function(){return 'name1';},
      'getVariableTypes_': function(){return [''];}
    });
  assertEquals(result_options.length, 3);
  isEqualArrays(result_options[0], ['name1', 'id1']);
  isEqualArrays(result_options[1], ['name2', 'id2']);

  workspace.dispose();
}

function test_fieldVariable_dropdownVariableAndTypeDoesNotExist() {
  // Expect a variable will be created for the selected option. Expect the
  // workspace variable map to contain the new variable once.
  fieldVariableTestWithMocks_setUp();
  setUpMockMethod(mockControl_, Blockly.utils, 'genUid', null, ['id1', null]);

  var result_options = Blockly.FieldVariable.dropdownCreate.call(
    {
      'sourceBlock_': {'workspace': workspace},
      'getText': function(){return 'name1';},
      'getVariableTypes_': function(){return [''];}
    });

  // Check the options.
  assertEquals(2, result_options.length);
  isEqualArrays(result_options[0], ['name1', 'id1']);
  // Check the variable map.
  assertEquals(1, workspace.getAllVariables().length);
  checkVariableValues(workspace, 'name1', '', 'id1');

  fieldVariableTestWithMocks_tearDown();
}

function test_fieldVariable_dropdownVariableDoesNotExistTypeDoes() {
  // Expect a variable will be created for the selected option. Expect the
  // workspace variable map to contain the new variable once.
  fieldVariableTestWithMocks_setUp();
  workspace.createVariable('name1', '', 'id1');
  setUpMockMethod(mockControl_, Blockly.utils, 'genUid', null, ['id2', null]);

  var result_options = Blockly.FieldVariable.dropdownCreate.call(
    {
      'sourceBlock_': {'workspace': workspace},
      'getText': function(){return 'name2';},
      'getVariableTypes_': function(){return [''];}
    });

  assertEquals(3, result_options.length);
  isEqualArrays(result_options[0], ['name1', 'id1']);
  isEqualArrays(result_options[1], ['name2', 'id2']);
  assertEquals(2, workspace.variableMap_.getAllVariables().length);
  checkVariableValues(workspace, 'name1', '', 'id1');
  checkVariableValues(workspace, 'name2', '', 'id2');

  fieldVariableTestWithMocks_tearDown();
}

function test_fieldVariable_getVariableTypes_undefinedVariableTypes() {
  // Expect that since variableTypes is undefined, only type empty string
  // will be returned.
  workspace = new Blockly.Workspace();
  workspace.createVariable('name1', 'type1');
  workspace.createVariable('name2', 'type2');
  var fieldVariable = new Blockly.FieldVariable('name1');
  var resultTypes = fieldVariable.getVariableTypes_();
  isEqualArrays(resultTypes, ['']);
  workspace.dispose();
}

function test_fieldVariable_getVariableTypes_givenVariableTypes() {
  // Expect that since variableTypes is undefined, only type empty string
  // will be returned.
  workspace = new Blockly.Workspace();
  workspace.createVariable('name1', 'type1');
  workspace.createVariable('name2', 'type2');
  var fieldVariable = new Blockly.FieldVariable('name1', null, ['type1', 'type2']);
  var resultTypes = fieldVariable.getVariableTypes_();
  isEqualArrays(resultTypes, ['type1', 'type2']);
  workspace.dispose();
}

function test_fieldVariable_getVariableTypes_nullVariableTypes() {
  // Expect all variable types to be returned.
  workspace = new Blockly.Workspace();
  workspace.createVariable('name1', 'type1');
  workspace.createVariable('name2', 'type2');
  var fieldVariable = new Blockly.FieldVariable('name1');
  var mockBlock = fieldVariable_mockBlock(workspace);
  fieldVariable.setSourceBlock(mockBlock);
  fieldVariable.variableTypes = null;
  var resultTypes = fieldVariable.getVariableTypes_();
  isEqualArrays(resultTypes, ['type1', 'type2']);
  workspace.dispose();
}

function test_fieldVariable_getVariableTypes_emptyListVariableTypes() {
  // Expect an error to be thrown.
  workspace = new Blockly.Workspace();
  workspace.createVariable('name1', 'type1');
  workspace.createVariable('name2', 'type2');
  var fieldVariable = new Blockly.FieldVariable('name1');
  var mockBlock = fieldVariable_mockBlock(workspace);
  fieldVariable.setSourceBlock(mockBlock);
  fieldVariable.variableTypes = [];
  try {
    fieldVariable.getVariableTypes_();
  } catch (e) {
    //expected
  } finally {
    workspace.dispose();
  }
}
