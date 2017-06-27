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

function fieldVariableTest_setUp() {
  workspace = new Blockly.Workspace();
  mockControl_ = new goog.testing.MockControl();
}

function fieldVariableTest_tearDown() {
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
  fieldVariableTest_setUp();
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
  fieldVariableTest_tearDown();
}

function test_fieldVariable_setValueMatchName() {
  // Expect the fieldVariable value to be set to variable name
  fieldVariableTest_setUp();
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
  fieldVariableTest_tearDown();
}

function test_fieldVariable_setValueNoVariable() {
  // Expect the fieldVariable value to be set to the passed in string. No error
  // should be thrown.
  fieldVariableTest_setUp();
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
  fieldVariableTest_tearDown();
}
