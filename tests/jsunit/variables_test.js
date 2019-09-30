/**
 * @license
 * Copyright 2018 Google LLC
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
 * @fileoverview Tests for variable utility functions in Blockly
 * @author fenichel@google.com (Rachel Fenichel)
 */
'use strict';

function variablesTest_setUp() {
  defineGetVarBlock();
  var workspace = new Blockly.Workspace();
  workspace.createVariable('foo', 'type1', '1');
  workspace.createVariable('bar', 'type1', '2');
  workspace.createVariable('baz', 'type1', '3');
  return workspace;
}

function variablesTest_tearDown(workspace) {
  undefineGetVarBlock();
  workspace.dispose();
}

function buildVariablesTest(testImpl) {
  return function() {
    var workspace = variablesTest_setUp();
    try {
      testImpl(workspace);
    } finally {
      variablesTest_tearDown(workspace);
    }
  };
}

var test_allUsedVarModels = buildVariablesTest(
    function(workspace) {
      createMockVarBlock(workspace, '1');
      createMockVarBlock(workspace, '2');
      createMockVarBlock(workspace, '3');

      var result = Blockly.Variables.allUsedVarModels(workspace);
      assertEquals('Expected three variables in the list of used variables',
          3, result.length);
    }
);

var test_allUsedVarModels_someUnused = buildVariablesTest(
    function(workspace) {
      createMockVarBlock(workspace, '2');

      var result = Blockly.Variables.allUsedVarModels(workspace);
      assertEquals('Expected one variable in the list of used variables',
          1, result.length);
      assertEquals('Expected variable with ID 2 in the list of used variables',
          '2', result[0].getId());
    }
);

var test_allUsedVarModels_varUsedTwice = buildVariablesTest(
    function(workspace) {
      createMockVarBlock(workspace, '2');
      createMockVarBlock(workspace, '2');

      var result = Blockly.Variables.allUsedVarModels(workspace);
      // Using the same variable multiple times should not change the number of
      // elements in the list.
      assertEquals('Expected one variable in the list of used variables',
          1, result.length);
      assertEquals('Expected variable with ID 2 in the list of used variables',
          '2', result[0].getId());
    }
);

var test_allUsedVarModels_allUnused = buildVariablesTest(
    function(workspace) {
      var result = Blockly.Variables.allUsedVarModels(workspace);
      assertEquals('Expected no variables in the list of used variables',
          0, result.length);
    }
);

var test_getVariable_byId = buildVariablesTest(
    function(workspace) {
      var var_1 = workspace.createVariable('name1', 'type1', 'id1');
      var var_2 = workspace.createVariable('name2', 'type1', 'id2');
      var var_3 = workspace.createVariable('name3', 'type2', 'id3');
      var result_1 = Blockly.Variables.getVariable(workspace, 'id1');
      var result_2 = Blockly.Variables.getVariable(workspace, 'id2');
      var result_3 = Blockly.Variables.getVariable(workspace, 'id3');

      assertEquals(var_1, result_1);
      assertEquals(var_2, result_2);
      assertEquals(var_3, result_3);
    }
);

var test_getVariable_byNameAndType = buildVariablesTest(
    function(workspace) {
      var var_1 = workspace.createVariable('name1', 'type1', 'id1');
      var var_2 = workspace.createVariable('name2', 'type1', 'id2');
      var var_3 = workspace.createVariable('name3', 'type2', 'id3');
      var result_1 =
          Blockly.Variables.getVariable(workspace, null, 'name1', 'type1');
      var result_2 =
          Blockly.Variables.getVariable(workspace, null, 'name2', 'type1');
      var result_3 =
          Blockly.Variables.getVariable(workspace, null, 'name3', 'type2');

      // Searching by name + type is correct.
      assertEquals(var_1, result_1);
      assertEquals(var_2, result_2);
      assertEquals(var_3, result_3);
    }
);

var test_getVariable_byIdThenName = buildVariablesTest(
    function(workspace) {
      var var_1 = workspace.createVariable('name1', 'type1', 'id1');
      var var_2 = workspace.createVariable('name2', 'type1', 'id2');
      var var_3 = workspace.createVariable('name3', 'type2', 'id3');
      var result_1 =
          Blockly.Variables.getVariable(workspace, 'badId', 'name1', 'type1');
      var result_2 =
          Blockly.Variables.getVariable(workspace, 'badId', 'name2', 'type1');
      var result_3 =
          Blockly.Variables.getVariable(workspace, 'badId', 'name3', 'type2');

      // Searching by ID failed, but falling back onto name + type is correct.
      assertEquals(var_1, result_1);
      assertEquals(var_2, result_2);
      assertEquals(var_3, result_3);
    }
);
