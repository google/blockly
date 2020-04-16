/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

suite('Variable Map', function() {
  setup(function() {
    this.workspace = new Blockly.Workspace();
    this.variableMap = new Blockly.VariableMap(this.workspace);
  });

  teardown(function() {
    this.workspace.dispose();
    sinon.restore();
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
      var keys = Object.keys(this.variableMap.variableMap_);
      assertEquals(1, keys.length);
      var varMapLength = this.variableMap.variableMap_[keys[0]].length;
      assertEquals(1, varMapLength);

      this.variableMap.createVariable('name1', 'type1');
      assertVariableValues(this.variableMap, 'name1', 'type1', 'id1');
      // Check that the size of the variableMap_ did not change.
      keys = Object.keys(this.variableMap.variableMap_);
      assertEquals(1, keys.length);
      varMapLength = this.variableMap.variableMap_[keys[0]].length;
      assertEquals(1, varMapLength);
    });

    test('Name already exists', function() {
      // Expect that when a variable with the same name but a different type already
      // exists, the new variable is created.
      this.variableMap.createVariable('name1', 'type1', 'id1');

      // Assert there is only one variable in the this.variableMap.
      var keys = Object.keys(this.variableMap.variableMap_);
      assertEquals(1, keys.length);
      var varMapLength = this.variableMap.variableMap_[keys[0]].length;
      assertEquals(1, varMapLength);

      this.variableMap.createVariable('name1', 'type2', 'id2');
      assertVariableValues(this.variableMap, 'name1', 'type1', 'id1');
      assertVariableValues(this.variableMap, 'name1', 'type2', 'id2');
      // Check that the size of the variableMap_ did change.
      keys = Object.keys(this.variableMap.variableMap_);
      assertEquals(2, keys.length);
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
      sinon.stub(Blockly.utils, "genUid").returns('1');
      this.variableMap.createVariable('name1', 'type1', null);
      assertVariableValues(this.variableMap, 'name1', 'type1', '1');
    });

    test('Undefined id', function() {
      sinon.stub(Blockly.utils, "genUid").returns('1');
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
      // TODO(kozbial) shouldn't this fail?
      this.variableMap.createVariable('name1', 'type1', 'id1');
      this.variableMap.createVariable('name1', 'type2', 'id2');

      assertVariableValues(this.variableMap, 'name1', 'type1', 'id1');
      assertVariableValues(this.variableMap, 'name1', 'type2', 'id2');
    });

    suite('Error cases', function() {
      test('Id already exists', function() {
        this.variableMap.createVariable('name1', 'type1', 'id1');
        var variableMap = this.variableMap;
        chai.assert.throws(function() {
          variableMap.createVariable('name2', 'type2', 'id1');
        }, /"id1".*in use/);
        assertVariableValues(this.variableMap, 'name1', 'type1', 'id1');
      });

      test('Mismatched id', function() {
        this.variableMap.createVariable('name1', 'type1', 'id1');
        var variableMap = this.variableMap;
        chai.assert.throws(function() {
          variableMap.createVariable('name1', 'type1', 'id2');
        }, /"name1".*in use/);
        assertVariableValues(this.variableMap, 'name1', 'type1', 'id1');
      });

      test('Mismatched type', function() {
        this.variableMap.createVariable('name1', 'type1', 'id1');
        var variableMap = this.variableMap;
        chai.assert.throws(function() {
          variableMap.createVariable('name1', 'type2', 'id1');
        });
        assertVariableValues(this.variableMap, 'name1', 'type1', 'id1');
        assertNull(this.variableMap.getVariableById('id2'));
      });
    });
  });

  suite('getVariable', function() {
    test('By name and type', function() {
      var var1 = this.variableMap.createVariable('name1', 'type1', 'id1');
      var var2 = this.variableMap.createVariable('name2', 'type1', 'id2');
      var var3 = this.variableMap.createVariable('name3', 'type2', 'id3');
      var result1 = this.variableMap.getVariable('name1', 'type1');
      var result2 = this.variableMap.getVariable('name2', 'type1');
      var result3 = this.variableMap.getVariable('name3', 'type2');

      // Searching by name + type is correct.
      assertEquals(var1, result1);
      assertEquals(var2, result2);
      assertEquals(var3, result3);

      // Searching only by name defaults to the '' type.
      assertNull(this.variableMap.getVariable('name1'));
      assertNull(this.variableMap.getVariable('name2'));
      assertNull(this.variableMap.getVariable('name3'));
    });

    test('Not found', function() {
      var result = this.variableMap.getVariable('name1');
      assertNull(result);
    });
  });

  suite('getVariableById', function() {
    test('Trivial', function() {
      var var1 = this.variableMap.createVariable('name1', 'type1', 'id1');
      var var2 = this.variableMap.createVariable('name2', 'type1', 'id2');
      var var3 = this.variableMap.createVariable('name3', 'type2', 'id3');
      var result1 = this.variableMap.getVariableById('id1');
      var result2 = this.variableMap.getVariableById('id2');
      var result3 = this.variableMap.getVariableById('id3');

      assertEquals(var1, result1);
      assertEquals(var2, result2);
      assertEquals(var3, result3);
    });

    test('Not found', function() {
      var result = this.variableMap.getVariableById('id1');
      assertNull(result);
    });
  });

  suite('getVariableTypes', function() {
    test('Trivial', function() {
      this.variableMap.createVariable('name1', 'type1', 'id1');
      this.variableMap.createVariable('name2', 'type1', 'id2');
      this.variableMap.createVariable('name3', 'type2', 'id3');
      this.variableMap.createVariable('name4', 'type3', 'id4');
      var resultArray = this.variableMap.getVariableTypes();
      // The empty string is always an option.
      isEqualArrays(['type1', 'type2', 'type3', ''], resultArray);
    });

    test('None', function() {
      // The empty string is always an option.
      var resultArray = this.variableMap.getVariableTypes();
      isEqualArrays([''], resultArray);
    });
  });

  suite('getVariablesOfType', function() {
    test('Trivial', function() {
      var var1 = this.variableMap.createVariable('name1', 'type1', 'id1');
      var var2 = this.variableMap.createVariable('name2', 'type1', 'id2');
      this.variableMap.createVariable('name3', 'type2', 'id3');
      this.variableMap.createVariable('name4', 'type3', 'id4');
      var resultArray1 = this.variableMap.getVariablesOfType('type1');
      var resultArray2 = this.variableMap.getVariablesOfType('type5');
      isEqualArrays([var1, var2], resultArray1);
      isEqualArrays([], resultArray2);
    });

    test('Null', function() {
      var var1 = this.variableMap.createVariable('name1', '', 'id1');
      var var2 = this.variableMap.createVariable('name2', '', 'id2');
      var var3 = this.variableMap.createVariable('name3', '', 'id3');
      this.variableMap.createVariable('name4', 'type1', 'id4');
      var resultArray = this.variableMap.getVariablesOfType(null);
      isEqualArrays([var1, var2, var3], resultArray);
    });

    test('Empty string', function() {
      var var1 = this.variableMap.createVariable('name1', null, 'id1');
      var var2 = this.variableMap.createVariable('name2', null, 'id2');
      var resultArray = this.variableMap.getVariablesOfType('');
      isEqualArrays([var1, var2], resultArray);
    });

    test('Deleted', function() {
      var variable = this.variableMap.createVariable('name1', null, 'id1');
      this.variableMap.deleteVariable(variable);
      var resultArray = this.variableMap.getVariablesOfType('');
      isEqualArrays([], resultArray);
    });

    test('Does not exist', function() {
      var resultArray = this.variableMap.getVariablesOfType('type1');
      isEqualArrays([], resultArray);
    });
  });

  suite('getAllVariables', function() {
    test('Trivial', function() {
      var var1 = this.variableMap.createVariable('name1', 'type1', 'id1');
      var var2 = this.variableMap.createVariable('name2', 'type1', 'id2');
      var var3 = this.variableMap.createVariable('name3', 'type2', 'id3');
      var resultArray = this.variableMap.getAllVariables();
      isEqualArrays([var1, var2, var3], resultArray);
    });

    test('None', function() {
      var resultArray = this.variableMap.getAllVariables();
      isEqualArrays([], resultArray);
    });
  });
});
