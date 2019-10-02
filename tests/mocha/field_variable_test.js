/**
 * @license
 * Copyright 2019 Google LLC
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

suite('Variable Fields', function() {
  var FAKE_VARIABLE_NAME = 'yertle';
  var FAKE_ID = 'turtle';

  function getMockBlock(workspace) {
    return {
      'workspace': workspace,
      'isShadow': function() {
        return false;
      },
      'renameVarById': Blockly.Block.prototype.renameVarById,
      'updateVarName': Blockly.Block.prototype.updateVarName,
    };
  }
  function initField(fieldVariable, workspace) {
    var mockBlock = getMockBlock(workspace);
    fieldVariable.setSourceBlock(mockBlock);
    // No view to initialize, but still need to init the model.
    fieldVariable.initModel();
    return fieldVariable;
  }
  function createAndInitFieldConstructor(workspace, variableName) {
    return initField(new Blockly.FieldVariable(variableName), workspace);
  }
  function createAndInitFieldJson(workspace, variableName) {
    return initField(Blockly.FieldVariable.fromJson(
        { variable:variableName }), workspace);
  }
  function assertValue(variableField, expectedName, opt_expectedId) {
    var actualName = variableField.getText();
    var actualId = variableField.getValue();
    opt_expectedId = opt_expectedId || FAKE_ID;
    assertEquals(actualName, expectedName);
    assertEquals(actualId, opt_expectedId);
  }
  function assertValueDefault(variableField) {
    assertValue(variableField, FAKE_VARIABLE_NAME, FAKE_ID);
  }

  setup(function() {
    this.workspace = new Blockly.Workspace();

    sinon.stub(Blockly.utils, 'genUid')
        .returns(FAKE_ID);
    sinon.stub(Blockly.Variables, 'generateUniqueName')
        .returns(FAKE_VARIABLE_NAME);
  });
  teardown(function() {
    this.workspace.dispose();
    sinon.restore();
  });

  test('Dropdown contains variables', function() {
    // Expect that the dropdown options will contain the variables that exist
    this.workspace.createVariable('name1', '', 'id1');
    this.workspace.createVariable('name2', '', 'id2');
    var fieldVariable = createAndInitFieldConstructor(this.workspace, 'name1');

    // Expect that variables created after field creation will show up too.
    this.workspace.createVariable('name3', '', 'id3');

    var result_options = Blockly.FieldVariable.dropdownCreate.call(
        fieldVariable);

    // Expect three variable options, a rename option, and a delete option.
    assertEquals(result_options.length, 5);
    isEqualArrays(result_options[0], ['name1', 'id1']);
    isEqualArrays(result_options[1], ['name2', 'id2']);
    isEqualArrays(result_options[2], ['name3', 'id3']);
  });
  suite('Constructor', function() {
    test('Null', function() {
      var variableField = createAndInitFieldConstructor(this.workspace, null);
      assertValueDefault(variableField);
    });
    test('Undefined', function() {
      var variableField = createAndInitFieldConstructor(
          this.workspace, undefined);
      assertValueDefault(variableField);
    });
    test('No Value Before InitModel', function() {
      var fieldVariable = new Blockly.FieldVariable('name1');
      assertEquals('', fieldVariable.getText());
      assertNull(fieldVariable.getValue());
    });
    test('Given Variable Name', function() {
      var fieldVariable = createAndInitFieldConstructor(
          this.workspace, 'name1');
      assertValue(fieldVariable, 'name1');
    });
  });
  suite('fromJson', function() {
    test('Null', function() {
      var variableField = createAndInitFieldJson(this.workspace, null);
      assertValueDefault(variableField);
    });
    test('Undefined', function() {
      var variableField = createAndInitFieldJson(this.workspace, undefined);
      assertValueDefault(variableField);
    });
    test('No Value Before InitModel', function() {
      var variableField = new Blockly.FieldVariable('name1');
      assertEquals('', variableField.getText());
      assertNull(variableField.getValue());
    });
    test('Given Variable Name', function() {
      var variableField = createAndInitFieldJson(this.workspace, 'name1');
      assertValue(variableField, 'name1');
    });
  });
  suite('setValue', function() {
    test('Null', function() {
      var variableField = createAndInitFieldConstructor(
          this.workspace, 'name1');
      variableField.setValue(null);
      assertValue(variableField, 'name1');
    });
    test('Undefined', function() {
      var variableField = createAndInitFieldConstructor(
          this.workspace, 'name1');
      var stub = sinon.stub(console, 'warn');
      variableField.setValue(undefined);
      assertValue(variableField, 'name1');
      chai.assert(stub.calledOnce);
      stub.restore();
    });
    test('New Variable ID', function() {
      this.workspace.createVariable('name2', null, 'id2');

      var variableField = createAndInitFieldConstructor(
          this.workspace, 'name1');
      var oldId = variableField.getValue();

      variableField.setValue('id2');
      // Setting value by ID gives us the right text as well.
      assertEquals('name2', variableField.getText());
      assertEquals('id2', variableField.getValue());
      chai.assert.notEqual(oldId, variableField.getValue());
    });
    test('Variable Does not Exist', function() {
      var variableField = createAndInitFieldConstructor(
          this.workspace, 'name1');
      var stub = sinon.stub(console, 'warn');
      variableField.setValue('id1');
      assertValue(variableField, 'name1');
      chai.assert(stub.calledOnce);
      stub.restore();
    });
  });
  suite('Validators', function() {
    setup(function() {
      this.workspace.createVariable('name1', null, 'id1');
      this.workspace.createVariable('name2', null, 'id2');
      this.workspace.createVariable('name3', null, 'id3');
      this.variableField = createAndInitFieldConstructor(this.workspace, 'name1');
    });
    teardown(function() {
      this.variableField.setValidator(null);
    });
    suite('Null Validator', function() {
      setup(function() {
        this.variableField.setValidator(function() {
          return null;
        });
      });
      test('New Value', function() {
        this.variableField.setValue('id2');
        assertValue(this.variableField, 'name1', 'id1');
      });
    });
    suite('Force \'id\' ID Validator', function() {
      setup(function() {
        this.variableField.setValidator(function(newValue) {
          return 'id' + newValue.charAt(newValue.length - 1);
        });
      });
      test('New Value', function() {
        // Must create the var so that the field doesn't throw an error.
        this.workspace.createVariable('thing2', null, 'other2');
        this.variableField.setValue('other2');
        assertValue(this.variableField, 'name2', 'id2');
      });
    });
    suite('Returns Undefined Validator', function() {
      setup(function() {
        this.variableField.setValidator(function() {});
      });
      test('New Value', function() {
        this.variableField.setValue('id2');
        assertValue(this.variableField, 'name2', 'id2');
      });
    });
  });
  suite('Customizations', function() {
    suite('Types and Default Types', function() {
      test('JS Constructor', function() {
        var field = new Blockly.FieldVariable(
            'test', undefined, ['Type1'], 'Type1');
        chai.assert.deepEqual(field.variableTypes, ['Type1']);
        chai.assert.equal(field.defaultType_, 'Type1');
      });
      test('JSON Definition', function() {
        var field = Blockly.FieldVariable.fromJson({
          variable: 'test',
          variableTypes: ['Type1'],
          defaultType: 'Type1'
        });
        chai.assert.deepEqual(field.variableTypes, ['Type1']);
        chai.assert.equal(field.defaultType_, 'Type1');
      });
      test('JS Configuration - Simple', function() {
        var field = new Blockly.FieldVariable(
            'test', undefined, undefined, undefined, {
              variableTypes: ['Type1'],
              defaultType: 'Type1'
            });
        chai.assert.deepEqual(field.variableTypes, ['Type1']);
        chai.assert.equal(field.defaultType_, 'Type1');
      });
      test('JS Configuration - Ignore', function() {
        var field = new Blockly.FieldVariable(
            'test', undefined, ['Type2'], 'Type2', {
              variableTypes: ['Type1'],
              defaultType: 'Type1'
            });
        chai.assert.deepEqual(field.variableTypes, ['Type1']);
        chai.assert.equal(field.defaultType_, 'Type1');
      });
    });
  });
  suite('Get variable types', function() {
    setup(function() {
      this.workspace.createVariable('name1', 'type1');
      this.workspace.createVariable('name2', 'type2');
    });
    test('variableTypes is undefined', function() {
      // Expect that since variableTypes is undefined, only type empty string
      // will be returned (regardless of what types are available on the workspace).
      var fieldVariable = new Blockly.FieldVariable('name1');
      var resultTypes = fieldVariable.getVariableTypes_();
      isEqualArrays(resultTypes, ['']);
    });
    test('variableTypes is explicit', function() {
      // Expect that since variableTypes is defined, it will be the return
      // value, regardless of what types are available on the workspace.
      var fieldVariable = new Blockly.FieldVariable(
          'name1', null, ['type1', 'type2'], 'type1');
      var resultTypes = fieldVariable.getVariableTypes_();
      isEqualArrays(resultTypes, ['type1', 'type2']);
      assertEquals('Default type was wrong', 'type1',
          fieldVariable.defaultType_);
    });
    test('variableTypes is null', function() {
      // Expect all variable types to be returned.
      // The field does not need to be initialized to do this--it just needs
      // a pointer to the workspace.
      var fieldVariable = new Blockly.FieldVariable('name1');
      var mockBlock = getMockBlock(this.workspace);
      fieldVariable.setSourceBlock(mockBlock);
      fieldVariable.variableTypes = null;

      var resultTypes = fieldVariable.getVariableTypes_();
      // The empty string is always one of the options.
      isEqualArrays(resultTypes, ['type1', 'type2', '']);
    });
    test('variableTypes is the empty list', function() {
      var fieldVariable = new Blockly.FieldVariable('name1');
      var mockBlock = getMockBlock(this.workspace);
      fieldVariable.setSourceBlock(mockBlock);
      fieldVariable.variableTypes = [];

      chai.assert.throws(function() {
        fieldVariable.getVariableTypes_();
      });
    });
  });
  suite('Default types', function() {
    test('Default type exists', function() {
      var fieldVariable = new Blockly.FieldVariable(null, null, ['b'], 'b');
      assertEquals('The variable field\'s default type should be "b"',
          'b', fieldVariable.defaultType_);
    });
    test('No default type', function() {
      var fieldVariable = new Blockly.FieldVariable(null);
      assertEquals('The variable field\'s default type should be the empty string',
          '', fieldVariable.defaultType_);
      assertNull('The variable field\'s allowed types should be null',
          fieldVariable.variableTypes);
    });
    test('Default type mismatch', function() {
      // Invalid default type when creating a variable field.
      chai.assert.throws(function() {
        var _fieldVariable = new Blockly.FieldVariable(null, null, ['a'], 'b');
      });
    });
    test('Default type mismatch with empty array', function() {
      // Invalid default type when creating a variable field.
      chai.assert.throws(function() {
        var _fieldVariable = new Blockly.FieldVariable(null, null, ['a']);
      });
    });
  });
  suite('Renaming Variables', function() {
    setup(function() {
      this.workspace.createVariable('name1', null, 'id1');
      Blockly.defineBlocksWithJsonArray([{
        "type": "field_variable_test_block",
        "message0": "%1",
        "args0": [
          {
            "type": "field_variable",
            "name": "VAR",
            "variable": "name1"
          }
        ],
      }]);
      this.variableBlock = new Blockly.Block(this.workspace,
          'field_variable_test_block');
      this.variableField = this.variableBlock.getField('VAR');
    });
    teardown(function() {
      this.variableBlock.dispose();
      this.variableBlock = null;
      this.variableField = null;
      delete Blockly.Blocks['field_variable_test_block'];
    });
    test('Rename & Keep Old ID', function() {
      this.workspace.renameVariableById('id1', 'name2');
      chai.assert.equal(this.variableField.getText(), 'name2');
      chai.assert.equal(this.variableField.getValue(), 'id1');
    });
    test('Rename & Get New ID', function() {
      this.workspace.createVariable('name2', null, 'id2');
      this.workspace.renameVariableById('id1', 'name2');
      chai.assert.equal(this.variableField.getText(), 'name2');
      chai.assert.equal(this.variableField.getValue(), 'id2');
    });
  });
});
