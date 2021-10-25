/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

goog.module('Blockly.test.variableMap');

const {assertVariableValues, createGenUidStubWithReturns, sharedTestSetup, sharedTestTeardown} = goog.require('Blockly.test.helpers');


suite('Variable Map', function() {
  setup(function() {
    sharedTestSetup.call(this);
    this.workspace = new Blockly.Workspace();
    this.variableMap = new Blockly.VariableMap(this.workspace);
  });

  teardown(function() {
    sharedTestTeardown.call(this);
  });

  suite('createVariable', function() {
    test('Trivial', function() {
      this.variableMap.createVariable('name1', 'type1', 'id1');
      assertVariableValues(this.variableMap, 'name1', 'type1', 'id1');
    });

    test('Already exists', function() {
      // Expect that when the variable already exists, the variableMap_ is unchanged.
      this.variableMap.createVariable('name1', 'type1', 'id1');

      // Assert there is only one variable in the this.variableMap.
      let keys = Object.keys(this.variableMap.variableMap_);
      chai.assert.equal(keys.length, 1);
      let varMapLength = this.variableMap.variableMap_[keys[0]].length;
      chai.assert.equal(varMapLength, 1);

      this.variableMap.createVariable('name1', 'type1');
      assertVariableValues(this.variableMap, 'name1', 'type1', 'id1');
      // Check that the size of the variableMap_ did not change.
      keys = Object.keys(this.variableMap.variableMap_);
      chai.assert.equal(keys.length, 1);
      varMapLength = this.variableMap.variableMap_[keys[0]].length;
      chai.assert.equal(varMapLength, 1);
    });

    test('Name already exists', function() {
      // Expect that when a variable with the same name but a different type already
      // exists, the new variable is created.
      this.variableMap.createVariable('name1', 'type1', 'id1');

      // Assert there is only one variable in the this.variableMap.
      let keys = Object.keys(this.variableMap.variableMap_);
      chai.assert.equal(keys.length, 1);
      let varMapLength = this.variableMap.variableMap_[keys[0]].length;
      chai.assert.equal(varMapLength, 1);

      this.variableMap.createVariable('name1', 'type2', 'id2');
      assertVariableValues(this.variableMap, 'name1', 'type1', 'id1');
      assertVariableValues(this.variableMap, 'name1', 'type2', 'id2');
      // Check that the size of the variableMap_ did change.
      keys = Object.keys(this.variableMap.variableMap_);
      chai.assert.equal(keys.length, 2);
    });

    test('Null type', function() {
      this.variableMap.createVariable('name1', null, 'id1');
      assertVariableValues(this.variableMap, 'name1', '', 'id1');
    });

    test('Undefined type', function() {
      this.variableMap.createVariable('name2', undefined, 'id2');
      assertVariableValues(this.variableMap, 'name2', '', 'id2');
    });

    test('Null id', function() {
      createGenUidStubWithReturns('1');
      this.variableMap.createVariable('name1', 'type1', null);
      assertVariableValues(this.variableMap, 'name1', 'type1', '1');
    });

    test('Undefined id', function() {
      createGenUidStubWithReturns('1');
      this.variableMap.createVariable('name1', 'type1', undefined);
      assertVariableValues(this.variableMap, 'name1', 'type1', '1');
    });

    test('Two variables same type', function() {
      this.variableMap.createVariable('name1', 'type1', 'id1');
      this.variableMap.createVariable('name2', 'type1', 'id2');

      assertVariableValues(this.variableMap, 'name1', 'type1', 'id1');
      assertVariableValues(this.variableMap, 'name2', 'type1', 'id2');
    });

    test('Two variables same name', function() {
      this.variableMap.createVariable('name1', 'type1', 'id1');
      this.variableMap.createVariable('name1', 'type2', 'id2');

      assertVariableValues(this.variableMap, 'name1', 'type1', 'id1');
      assertVariableValues(this.variableMap, 'name1', 'type2', 'id2');
    });

    suite('Error cases', function() {
      test('Id already exists', function() {
        this.variableMap.createVariable('name1', 'type1', 'id1');
        let variableMap = this.variableMap;
        chai.assert.throws(function() {
          variableMap.createVariable('name2', 'type2', 'id1');
        }, /"id1".*in use/);
        assertVariableValues(this.variableMap, 'name1', 'type1', 'id1');
      });

      test('Mismatched id', function() {
        this.variableMap.createVariable('name1', 'type1', 'id1');
        let variableMap = this.variableMap;
        chai.assert.throws(function() {
          variableMap.createVariable('name1', 'type1', 'id2');
        }, /"name1".*in use/);
        assertVariableValues(this.variableMap, 'name1', 'type1', 'id1');
      });

      test('Mismatched type', function() {
        this.variableMap.createVariable('name1', 'type1', 'id1');
        let variableMap = this.variableMap;
        chai.assert.throws(function() {
          variableMap.createVariable('name1', 'type2', 'id1');
        });
        assertVariableValues(this.variableMap, 'name1', 'type1', 'id1');
        chai.assert.isNull(this.variableMap.getVariableById('id2'));
      });
    });
  });

  suite('getVariable', function() {
    test('By name and type', function() {
      let var1 = this.variableMap.createVariable('name1', 'type1', 'id1');
      let var2 = this.variableMap.createVariable('name2', 'type1', 'id2');
      let var3 = this.variableMap.createVariable('name3', 'type2', 'id3');
      let result1 = this.variableMap.getVariable('name1', 'type1');
      let result2 = this.variableMap.getVariable('name2', 'type1');
      let result3 = this.variableMap.getVariable('name3', 'type2');

      // Searching by name + type is correct.
      chai.assert.equal(result1, var1);
      chai.assert.equal(result2, var2);
      chai.assert.equal(result3, var3);

      // Searching only by name defaults to the '' type.
      chai.assert.isNull(this.variableMap.getVariable('name1'));
      chai.assert.isNull(this.variableMap.getVariable('name2'));
      chai.assert.isNull(this.variableMap.getVariable('name3'));
    });

    test('Not found', function() {
      let result = this.variableMap.getVariable('name1');
      chai.assert.isNull(result);
    });
  });

  suite('getVariableById', function() {
    test('Trivial', function() {
      let var1 = this.variableMap.createVariable('name1', 'type1', 'id1');
      let var2 = this.variableMap.createVariable('name2', 'type1', 'id2');
      let var3 = this.variableMap.createVariable('name3', 'type2', 'id3');
      let result1 = this.variableMap.getVariableById('id1');
      let result2 = this.variableMap.getVariableById('id2');
      let result3 = this.variableMap.getVariableById('id3');

      chai.assert.equal(result1, var1);
      chai.assert.equal(result2, var2);
      chai.assert.equal(result3, var3);
    });

    test('Not found', function() {
      let result = this.variableMap.getVariableById('id1');
      chai.assert.isNull(result);
    });
  });

  suite('getVariableTypes', function() {
    test('Trivial', function() {
      this.variableMap.createVariable('name1', 'type1', 'id1');
      this.variableMap.createVariable('name2', 'type1', 'id2');
      this.variableMap.createVariable('name3', 'type2', 'id3');
      this.variableMap.createVariable('name4', 'type3', 'id4');
      let resultArray = this.variableMap.getVariableTypes();
      // The empty string is always an option.
      chai.assert.deepEqual(resultArray, ['type1', 'type2', 'type3', '']);
    });

    test('None', function() {
      // The empty string is always an option.
      let resultArray = this.variableMap.getVariableTypes();
      chai.assert.deepEqual(resultArray, ['']);
    });
  });

  suite('getVariablesOfType', function() {
    test('Trivial', function() {
      let var1 = this.variableMap.createVariable('name1', 'type1', 'id1');
      let var2 = this.variableMap.createVariable('name2', 'type1', 'id2');
      this.variableMap.createVariable('name3', 'type2', 'id3');
      this.variableMap.createVariable('name4', 'type3', 'id4');
      let resultArray1 = this.variableMap.getVariablesOfType('type1');
      let resultArray2 = this.variableMap.getVariablesOfType('type5');
      chai.assert.deepEqual(resultArray1, [var1, var2]);
      chai.assert.deepEqual(resultArray2, []);
    });

    test('Null', function() {
      let var1 = this.variableMap.createVariable('name1', '', 'id1');
      let var2 = this.variableMap.createVariable('name2', '', 'id2');
      let var3 = this.variableMap.createVariable('name3', '', 'id3');
      this.variableMap.createVariable('name4', 'type1', 'id4');
      let resultArray = this.variableMap.getVariablesOfType(null);
      chai.assert.deepEqual(resultArray, [var1, var2, var3]);
    });

    test('Empty string', function() {
      let var1 = this.variableMap.createVariable('name1', null, 'id1');
      let var2 = this.variableMap.createVariable('name2', null, 'id2');
      let resultArray = this.variableMap.getVariablesOfType('');
      chai.assert.deepEqual(resultArray, [var1, var2]);
    });

    test('Deleted', function() {
      let variable = this.variableMap.createVariable('name1', null, 'id1');
      this.variableMap.deleteVariable(variable);
      let resultArray = this.variableMap.getVariablesOfType('');
      chai.assert.deepEqual(resultArray, []);
    });

    test('Does not exist', function() {
      let resultArray = this.variableMap.getVariablesOfType('type1');
      chai.assert.deepEqual(resultArray, []);
    });
  });

  suite('getAllVariables', function() {
    test('Trivial', function() {
      let var1 = this.variableMap.createVariable('name1', 'type1', 'id1');
      let var2 = this.variableMap.createVariable('name2', 'type1', 'id2');
      let var3 = this.variableMap.createVariable('name3', 'type2', 'id3');
      let resultArray = this.variableMap.getAllVariables();
      chai.assert.deepEqual(resultArray, [var1, var2, var3]);
    });

    test('None', function() {
      let resultArray = this.variableMap.getAllVariables();
      chai.assert.deepEqual(resultArray, []);
    });
  });
});
