/**
 * @license
 * Blockly Tests
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
 * @fileoverview Tests for variable model.
 * @author marisaleung@google.com (Marisa Leung)
 */
'use strict';

var variable;
var workspace;

function variableModelTest_setUp() {
  workspace = new Blockly.Workspace();
}

function variableModelTest_tearDown() {
  workspace.dispose();
  variable = null;
}

/**
 * These tests check the constructor of the variable model.
 */
function testInit_Trivial() {
  variableModelTest_setUp();
  variable = new Blockly.VariableModel(workspace, 'test', 'test_type',
    'test_id');
  assertEquals('test', variable.name);
  assertEquals('test_type', variable.type);
  assertEquals('test_id', variable.id_);
  variableModelTest_tearDown();
}

function testInit_NullType() {
  variableModelTest_setUp();
  variable = new Blockly.VariableModel(workspace, 'test', null, 'test_id');
  assertEquals('', variable.type);
  variableModelTest_tearDown();
}

function testInit_UndefinedType() {
  variableModelTest_setUp();
  variable = new Blockly.VariableModel(workspace, 'test', undefined, 'test_id');
  assertEquals('', variable.type);
  variableModelTest_tearDown();
}

function testInit_NullId() {
  variableModelTest_setUp();
  variable = new Blockly.VariableModel(workspace, 'test', 'test_type', null);
  assertEquals('test', variable.name);
  assertEquals('test_type', variable.type);
  assertNotNull(variable.id_);
  variableModelTest_tearDown();
}

function testInit_UndefinedId() {
  variableModelTest_setUp();
  variable = new Blockly.VariableModel(workspace, 'test', 'test_type', undefined);
  assertEquals('test', variable.name);
  assertEquals('test_type', variable.type);
  assertNotNull(variable.id_);
  variableModelTest_tearDown();
}

function testInit_OnlyNameProvided() {
  variableModelTest_setUp();
  variable = new Blockly.VariableModel(workspace, 'test');
  assertEquals('test', variable.name);
  assertEquals('', variable.type);
  assertNotNull(variable.id_);
  variableModelTest_tearDown();
}
