/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

suite('Variable Model', function() {
  setup(function() {
    this.workspace = new Blockly.Workspace();
  });

  teardown(function() {
    this.workspace.dispose();
  });

  test('Trivial', function() {
    var variable = new Blockly.VariableModel(
        this.workspace, 'test', 'test_type', 'test_id');
    assertEquals('test', variable.name);
    assertEquals('test_type', variable.type);
    assertEquals('test_id', variable.id_);
  });

  test('Null type', function() {
    var variable = new Blockly.VariableModel(
        this.workspace, 'test', null, 'test_id');
    assertEquals('', variable.type);
  });

  test('Undefined type', function() {
    var variable = new Blockly.VariableModel(
        this.workspace, 'test', undefined, 'test_id');
    assertEquals('', variable.type);
  });

  test('Null id', function() {
    var variable = new Blockly.VariableModel(
        this.workspace, 'test', 'test_type', null);
    assertEquals('test', variable.name);
    assertEquals('test_type', variable.type);
    assertNotNull(variable.id_);
  });

  test('Undefined id', function() {
    var variable = new Blockly.VariableModel(
        this.workspace, 'test', 'test_type', undefined);
    assertEquals('test', variable.name);
    assertEquals('test_type', variable.type);
    assertNotNull(variable.id_);
  });

  test('Only name provided', function() {
    var variable = new Blockly.VariableModel(this.workspace, 'test');
    assertEquals('test', variable.name);
    assertEquals('', variable.type);
    assertNotNull(variable.id_);
  });
});
