
suite('Variable Fields', function() {
  function getMockBlock(workspace) {
    return {
      'workspace': workspace,
      'isShadow': function() {
        return false;
      }
    };
  }
  function fieldVariable_createAndInitField(workspace) {
    var fieldVariable = new Blockly.FieldVariable('name1');
    var mockBlock = getMockBlock(workspace);
    fieldVariable.setSourceBlock(mockBlock);
    // No view to initialize, but still need to init the model.
    fieldVariable.initModel();
    return fieldVariable;
  }

  setup(function() {
    this.workspace = new Blockly.Workspace();
  });
  teardown(function() {
    this.workspace.dispose();
  });

  test('Constructor', function() {
    var fieldVariable = new Blockly.FieldVariable('name1');
    // The field does not have a variable until after init() is called.
    assertEquals('', fieldVariable.getText());
    assertNull(fieldVariable.getValue());
  });

  test('Set value by ID', function() {
    this.workspace.createVariable('name2', null, 'id2');

    var fieldVariable = fieldVariable_createAndInitField(this.workspace);
    var oldId = fieldVariable.getValue();

    fieldVariable.setValue('id2');
    // Setting value by ID gives us the right text as well.
    assertEquals('name2', fieldVariable.getText());
    assertEquals('id2', fieldVariable.getValue());
    chai.assert.notEqual(oldId, fieldVariable.getValue());
  });

  test('Set value: variable does not exist', function() {
    var fieldVariable = fieldVariable_createAndInitField(this.workspace);
    chai.assert.throws(function() {
      fieldVariable.setValue('id1');
    });
  });

  test('Dropdown contains variables', function() {
    // Expect that the dropdown options will contain the variables that exist
    this.workspace.createVariable('name1', '', 'id1');
    this.workspace.createVariable('name2', '', 'id2');
    var fieldVariable = fieldVariable_createAndInitField(this.workspace);

    // Expect that variables created after field creation will show up too.
    this.workspace.createVariable('name3', '', 'id3');

    var result_options = Blockly.FieldVariable.dropdownCreate.call(
        fieldVariable);

    // Expect three variable options and a rename option.
    assertEquals(result_options.length, 4);
    isEqualArrays(result_options[0], ['name1', 'id1']);
    isEqualArrays(result_options[1], ['name2', 'id2']);
    isEqualArrays(result_options[2], ['name3', 'id3']);

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
});
