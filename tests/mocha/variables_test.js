/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

suite('Variables', function() {
  setup(function() {
    this.workspace = new Blockly.Workspace();
    Blockly.defineBlocksWithJsonArray([{
      "type": "get_var_block",
      "message0": "%1",
      "args0": [
        {
          "type": "field_variable",
          "name": "VAR",
          "variableTypes": ["", "type1", "type2"]
        }
      ]
    }]);
    this.workspace.createVariable('foo', 'type1', '1');
    this.workspace.createVariable('bar', 'type1', '2');
    this.workspace.createVariable('baz', 'type1', '3');
  });

  teardown(function() {
    delete Blockly.Blocks['get_var_block'];
    this.workspace.dispose();

    // Clear Blockly.Event state.
    Blockly.Events.setGroup(false);
    Blockly.Events.disabled_ = 0;
    sinon.restore();
  });

  /**
   * Create a test get_var_block.
   * Will fail if get_var_block isn't defined.
   * @param {!Blockly.Workspace} workspace The workspace on which to create the
   *     block.
   * @param {!string} variable_id The id of the variable to reference.
   * @return {!Blockly.Block} The created block.
   */
  function createTestVarBlock(workspace, variable_id) {
    // Turn off events to avoid testing XML at the same time.
    Blockly.Events.disable();
    var block = new Blockly.Block(workspace, 'get_var_block');
    block.inputList[0].fieldRow[0].setValue(variable_id);
    Blockly.Events.enable();
    return block;
  }

  suite('allUsedVarModels', function() {
    test('All used', function() {
      createTestVarBlock(this.workspace, '1');
      createTestVarBlock(this.workspace, '2');
      createTestVarBlock(this.workspace, '3');

      var result = Blockly.Variables.allUsedVarModels(this.workspace);
      chai.assert.equal(result.length, 3,
          'Expected three variables in the list of used variables');
    });

    test('Some unused', function() {
      createTestVarBlock(this.workspace, '2');

      var result = Blockly.Variables.allUsedVarModels(this.workspace);
      chai.assert.equal(result.length, 1,
          'Expected one variable in the list of used variables');
      chai.assert.equal(result[0].getId(), '2',
          'Expected variable with ID 2 in the list of used variables');
    });

    test('Var used twice', function() {
      createTestVarBlock(this.workspace, '2');
      createTestVarBlock(this.workspace, '2');

      var result = Blockly.Variables.allUsedVarModels(this.workspace);
      // Using the same variable multiple times should not change the number of
      // elements in the list.
      chai.assert.equal(result.length, 1,
          'Expected one variable in the list of used variables');
      chai.assert.equal(result[0].getId(), '2',
          'Expected variable with ID 2 in the list of used variables');
    });

    test('All unused', function() {
      var result = Blockly.Variables.allUsedVarModels(this.workspace);
      chai.assert.equal(result.length, 0,
          'Expected no variables in the list of used variables');
    });
  });

  suite('getVariable', function() {
    test('By id', function() {
      var var1 = this.workspace.createVariable('name1', 'type1', 'id1');
      var var2 = this.workspace.createVariable('name2', 'type1', 'id2');
      var var3 = this.workspace.createVariable('name3', 'type2', 'id3');
      var result1 = Blockly.Variables.getVariable(this.workspace, 'id1');
      var result2 = Blockly.Variables.getVariable(this.workspace, 'id2');
      var result3 = Blockly.Variables.getVariable(this.workspace, 'id3');

      chai.assert.equal(var1, result1);
      chai.assert.equal(var2, result2);
      chai.assert.equal(var3, result3);
    });

    test('By name and type', function() {
      var var1 = this.workspace.createVariable('name1', 'type1', 'id1');
      var var2 = this.workspace.createVariable('name2', 'type1', 'id2');
      var var3 = this.workspace.createVariable('name3', 'type2', 'id3');
      var result1 =
          Blockly.Variables.getVariable(this.workspace, null, 'name1', 'type1');
      var result2 =
          Blockly.Variables.getVariable(this.workspace, null, 'name2', 'type1');
      var result3 =
          Blockly.Variables.getVariable(this.workspace, null, 'name3', 'type2');

      // Searching by name + type is correct.
      chai.assert.equal(var1, result1);
      chai.assert.equal(var2, result2);
      chai.assert.equal(var3, result3);
    });

    test('Bad id with name and type fallback', function() {
      var var1 = this.workspace.createVariable('name1', 'type1', 'id1');
      var var2 = this.workspace.createVariable('name2', 'type1', 'id2');
      var var3 = this.workspace.createVariable('name3', 'type2', 'id3');
      var result1 =
          Blockly.Variables.getVariable(this.workspace, 'badId', 'name1', 'type1');
      var result2 =
          Blockly.Variables.getVariable(this.workspace, 'badId', 'name2', 'type1');
      var result3 =
          Blockly.Variables.getVariable(this.workspace, 'badId', 'name3', 'type2');

      // Searching by ID failed, but falling back onto name + type is correct.
      chai.assert.equal(var1, result1);
      chai.assert.equal(var2, result2);
      chai.assert.equal(var3, result3);
    });
  });
});
