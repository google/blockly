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

function fieldVariable_createAndInitField(workspace) {
  var fieldVariable = new Blockly.FieldVariable('name1');
  var mockBlock = fieldVariable_mockBlock(workspace);
  fieldVariable.setSourceBlock(mockBlock);
  // No view to initialize, but the model still needs work.
  fieldVariable.initModel();
  return fieldVariable;
}

function test_fieldVariable_Constructor() {
  workspace = new Blockly.Workspace();
  var fieldVariable = new Blockly.FieldVariable('name1');
  // The field does not have a variable until after init() is called.
  assertEquals('', fieldVariable.getText());
  workspace.dispose();
}

function test_fieldVariable_setValueMatchId() {
 // Expect the fieldVariable value to be set to variable name
  fieldVariableTestWithMocks_setUp();
  workspace.createVariable('name2', null, 'id2');

  var fieldVariable = fieldVariable_createAndInitField(workspace);

  var oldId = fieldVariable.getValue();
  var event = new Blockly.Events.BlockChange(
        fieldVariable.sourceBlock_, 'field', undefined, oldId, 'id2');
  setUpMockMethod(mockControl_, Blockly.Events, 'fire', [event], null);

  fieldVariable.setValue('id2');
  assertEquals('name2', fieldVariable.getText());
  assertEquals('id2', fieldVariable.getValue());
  fieldVariableTestWithMocks_tearDown();
}

function test_fieldVariable_setValueNoVariable() {
  fieldVariableTestWithMocks_setUp();

  var fieldVariable = fieldVariable_createAndInitField(workspace);
  var mockBlock = fieldVariable.sourceBlock_;
  mockBlock.isShadow = function() {
    return false;
  };

  try {
    fieldVariable.setValue('id1');
    // Calling setValue with a variable that doesn't exist throws an error.
    fail();
  } catch (e) {
    // expected
  } finally {
    fieldVariableTestWithMocks_tearDown();
  }
}

function test_fieldVariable_dropdownCreateVariablesExist() {
  // Expect that the dropdown options will contain the variables that exist.
  workspace = new Blockly.Workspace();
  workspace.createVariable('name1', '', 'id1');
  workspace.createVariable('name2', '', 'id2');

  var fieldVariable = fieldVariable_createAndInitField(workspace);

  var result_options = Blockly.FieldVariable.dropdownCreate.call(
      fieldVariable);

  assertEquals(result_options.length, 3);
  isEqualArrays(result_options[0], ['name1', 'id1']);
  isEqualArrays(result_options[1], ['name2', 'id2']);

  workspace.dispose();
}

function test_fieldVariable_setValueNull() {
  // This should no longer create a variable for the selected option.
  fieldVariableTestWithMocks_setUp();
  setUpMockMethod(mockControl_, Blockly.utils, 'genUid', null, ['id1', null]);

  var fieldVariable = fieldVariable_createAndInitField(workspace);
  try {
    fieldVariable.setValue(null);
    fail();
  } catch (e) {
    // expected
  } finally {
    fieldVariableTestWithMocks_tearDown();
  }

}

function test_fieldVariable_getVariableTypes_undefinedVariableTypes() {
  // Expect that since variableTypes is undefined, only type empty string
  // will be returned (regardless of what types are available on the workspace).
  workspace = new Blockly.Workspace();
  workspace.createVariable('name1', 'type1');
  workspace.createVariable('name2', 'type2');

  var fieldVariable = new Blockly.FieldVariable('name1');
  var resultTypes = fieldVariable.getVariableTypes_();
  isEqualArrays(resultTypes, ['']);
  workspace.dispose();
}

function test_fieldVariable_getVariableTypes_givenVariableTypes() {
  // Expect that since variableTypes is defined, it will be the return value,
  // regardless of what types are available on the workspace.
  workspace = new Blockly.Workspace();
  workspace.createVariable('name1', 'type1');
  workspace.createVariable('name2', 'type2');

  var fieldVariable = new Blockly.FieldVariable(
      'name1', null, ['type1', 'type2']);
  var resultTypes = fieldVariable.getVariableTypes_();
  isEqualArrays(resultTypes, ['type1', 'type2']);
  workspace.dispose();
}

function test_fieldVariable_getVariableTypes_nullVariableTypes() {
  // Expect all variable types to be returned.
  // The variable does not need to be initialized to do this--it just needs a
  // pointer to the workspace.
  workspace = new Blockly.Workspace();
  workspace.createVariable('name1', 'type1');
  workspace.createVariable('name2', 'type2');

  var fieldVariable = new Blockly.FieldVariable('name1');
  var mockBlock = fieldVariable_mockBlock(workspace);
  fieldVariable.setSourceBlock(mockBlock);
  fieldVariable.variableTypes = null;

  var resultTypes = fieldVariable.getVariableTypes_();
  // The empty string is always one of the options.
  isEqualArrays(resultTypes, ['type1', 'type2', '']);
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
    fail();
  } catch (e) {
    //expected
  } finally {
    workspace.dispose();
  }
}
