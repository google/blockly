/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: Apache-2.0
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
