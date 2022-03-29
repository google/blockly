/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

goog.module('Blockly.test.variableModel');

const {sharedTestSetup, sharedTestTeardown} = goog.require('Blockly.test.helpers.setupTeardown');


suite('Variable Model', function() {
  setup(function() {
    sharedTestSetup.call(this);
    this.workspace = new Blockly.Workspace();
  });

  teardown(function() {
    sharedTestTeardown.call(this);
  });

  test('Trivial', function() {
    const variable = new Blockly.VariableModel(
        this.workspace, 'test', 'test_type', 'test_id');
    chai.assert.equal(variable.name, 'test');
    chai.assert.equal(variable.type, 'test_type');
    chai.assert.equal(variable.id_, 'test_id');
  });

  test('Null type', function() {
    const variable = new Blockly.VariableModel(
        this.workspace, 'test', null, 'test_id');
    chai.assert.equal(variable.type, '');
  });

  test('Undefined type', function() {
    const variable = new Blockly.VariableModel(
        this.workspace, 'test', undefined, 'test_id');
    chai.assert.equal(variable.type, '');
  });

  test('Null id', function() {
    const variable = new Blockly.VariableModel(
        this.workspace, 'test', 'test_type', null);
    chai.assert.equal(variable.name, 'test');
    chai.assert.equal(variable.type, 'test_type');
    chai.assert.exists(variable.id_);
  });

  test('Undefined id', function() {
    const variable = new Blockly.VariableModel(
        this.workspace, 'test', 'test_type', undefined);
    chai.assert.equal(variable.name, 'test');
    chai.assert.equal(variable.type, 'test_type');
    chai.assert.exists(variable.id_);
  });

  test('Only name provided', function() {
    const variable = new Blockly.VariableModel(this.workspace, 'test');
    chai.assert.equal(variable.name, 'test');
    chai.assert.equal(variable.type, '');
    chai.assert.exists(variable.id_);
  });
});
