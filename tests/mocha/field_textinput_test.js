/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

suite('Text Input Fields', function() {
  function assertValue(textInputField, expectedValue, opt_expectedText) {
    var actualValue = textInputField.getValue();
    var actualText = textInputField.getText();
    opt_expectedText = opt_expectedText || expectedValue;
    assertEquals(actualValue, expectedValue);
    assertEquals(actualText, opt_expectedText);
  }
  function assertValueDefault(textInputField) {
    assertValue(textInputField, '');
  }
  suite('Constructor', function() {
    test('Empty', function() {
      var textInputField = new Blockly.FieldTextInput();
      assertValueDefault(textInputField);
    });
    test('Undefined', function() {
      var textInputField = new Blockly.FieldTextInput(undefined);
      assertValueDefault(textInputField);
    });
    test('String', function() {
      var textInputField = new Blockly.FieldTextInput('value');
      assertValue(textInputField, 'value');
    });
    test('Number (Truthy)', function() {
      var textInputField = new Blockly.FieldTextInput(1);
      assertValue(textInputField, '1');
    });
    test('Number (Falsy)', function() {
      var textInputField = new Blockly.FieldTextInput(0);
      assertValue(textInputField, '0');
    });
    test('Boolean True', function() {
      var textInputField = new Blockly.FieldTextInput(true);
      assertValue(textInputField, 'true');
    });
    test('Boolean False', function() {
      var textInputField = new Blockly.FieldTextInput(false);
      assertValue(textInputField, 'false');
    });
  });
  suite('fromJson', function() {
    test('Empty', function() {
      var textInputField = new Blockly.FieldTextInput.fromJson({});
      assertValueDefault(textInputField);
    });
    test('Undefined', function() {
      var textInputField = new Blockly.FieldTextInput
          .fromJson({ text: undefined});
      assertValueDefault(textInputField);
    });
    test('String', function() {
      var textInputField = Blockly.FieldTextInput.fromJson({ text:'value' });
      assertValue(textInputField, 'value');
    });
    test('Number (Truthy)', function() {
      var textInputField = Blockly.FieldTextInput.fromJson({ text:1 });
      assertValue(textInputField, '1');
    });
    test('Number (Falsy)', function() {
      var textInputField = Blockly.FieldTextInput.fromJson({ text:0 });
      assertValue(textInputField, '0');
    });
    test('Boolean True', function() {
      var textInputField = Blockly.FieldTextInput.fromJson({ text:true });
      assertValue(textInputField, 'true');
    });
    test('Boolean False', function() {
      var textInputField = Blockly.FieldTextInput.fromJson({ text:false });
      assertValue(textInputField, 'false');
    });
  });
  suite('setValue', function() {
    suite('Empty -> New Value', function() {
      setup(function() {
        this.textInputField = new Blockly.FieldTextInput();
      });
      test('Null', function() {
        this.textInputField.setValue(null);
        assertValueDefault(this.textInputField);
      });
      test('Undefined', function() {
        this.textInputField.setValue(undefined);
        assertValueDefault(this.textInputField);
      });
      test('New String', function() {
        this.textInputField.setValue('newValue');
        assertValue(this.textInputField, 'newValue');
      });
      test('Number (Truthy)', function() {
        this.textInputField.setValue(1);
        assertValue(this.textInputField, '1');
      });
      test('Number (Falsy)', function() {
        this.textInputField.setValue(0);
        assertValue(this.textInputField, '0');
      });
      test('Boolean True', function() {
        this.textInputField.setValue(true);
        assertValue(this.textInputField, 'true');
      });
      test('Boolean False', function() {
        this.textInputField.setValue(false);
        assertValue(this.textInputField, 'false');
      });
    });
    suite('Value -> New Value', function() {
      setup(function() {
        this.textInputField = new Blockly.FieldTextInput('value');
      });
      test('Null', function() {
        this.textInputField.setValue(null);
        assertValue(this.textInputField, 'value');
      });
      test('Undefined', function() {
        this.textInputField.setValue(undefined);
        assertValue(this.textInputField, 'value');
      });
      test('New String', function() {
        this.textInputField.setValue('newValue');
        assertValue(this.textInputField, 'newValue');
      });
      test('Number (Truthy)', function() {
        this.textInputField.setValue(1);
        assertValue(this.textInputField, '1');
      });
      test('Number (Falsy)', function() {
        this.textInputField.setValue(0);
        assertValue(this.textInputField, '0');
      });
      test('Boolean True', function() {
        this.textInputField.setValue(true);
        assertValue(this.textInputField, 'true');
      });
      test('Boolean False', function() {
        this.textInputField.setValue(false);
        assertValue(this.textInputField, 'false');
      });
    });
  });
  suite('Validators', function() {
    setup(function() {
      this.textInputField = new Blockly.FieldTextInput('value');
      this.textInputField.htmlInput_ = Object.create(null);
      this.textInputField.htmlInput_.oldValue_ = 'value';
      this.textInputField.htmlInput_.untypedDefaultValue_ = 'value';
      this.stub = sinon.stub(this.textInputField, 'resizeEditor_');
    });
    teardown(function() {
      this.textInputField.setValidator(null);
      Blockly.FieldTextInput.htmlInput_ = null;
      if (this.stub) {
        this.stub.restore();
      }
    });
    suite('Null Validator', function() {
      setup(function() {
        this.textInputField.setValidator(function() {
          return null;
        });
      });
      test('When Editing', function() {
        this.textInputField.isBeingEdited_ = true;
        this.textInputField.htmlInput_.value = 'newValue';
        this.textInputField.onHtmlInputChange_(null);
        assertValue(this.textInputField, 'value', 'newValue');
        this.textInputField.isBeingEdited_ = false;
      });
      test('When Not Editing', function() {
        this.textInputField.setValue('newValue');
        assertValue(this.textInputField, 'value');
      });
    });
    suite('Remove \'a\' Validator', function() {
      setup(function() {
        this.textInputField.setValidator(function(newValue) {
          return newValue.replace(/a/g, '');
        });
      });
      test('When Editing', function() {
        this.textInputField.isBeingEdited_ = true;
        this.textInputField.htmlInput_.value = 'bbbaaa';
        this.textInputField.onHtmlInputChange_(null);
        assertValue(this.textInputField, 'bbb', 'bbbaaa');
        this.textInputField.isBeingEdited_ = false;
      });
      test('When Not Editing', function() {
        this.textInputField.setValue('bbbaaa');
        assertValue(this.textInputField, 'bbb');
      });
    });
    suite('Returns Undefined Validator', function() {
      setup(function() {
        this.textInputField.setValidator(function() {});
      });
      test('When Editing', function() {
        this.textInputField.isBeingEdited_ = true;
        this.textInputField.htmlInput_.value = 'newValue';
        this.textInputField.onHtmlInputChange_(null);
        assertValue(this.textInputField, 'newValue');
        this.textInputField.isBeingEdited_ = false;
      });
      test('When Not Editing', function() {
        this.textInputField.setValue('newValue');
        assertValue(this.textInputField, 'newValue');
      });
    });
  });
  suite('Customization', function() {
    suite('Spellcheck', function() {
      setup(function() {
        this.prepField = function(field) {
          var workspace = {
            getScale: function() {
              return 1;
            },
            getRenderer: function() { return {
              getClassName: function() { return ''; }
            }; },
            getTheme: function() { return {
              getClassName: function() { return ''; }
            }; },
            markFocused: function() {}
          };
          field.sourceBlock_ = {
            workspace: workspace
          };
          field.constants_ = {
            FIELD_TEXT_FONTSIZE: 11,
            FIELD_TEXT_FONTWEIGHT: 'normal',
            FIELD_TEXT_FONTFAMILY: 'sans-serif'
          };
          field.clickTarget_ = document.createElement('div');
          Blockly.mainWorkspace = workspace;
          Blockly.WidgetDiv.DIV = document.createElement('div');
          this.stub = sinon.stub(field, 'resizeEditor_');
        };

        this.assertSpellcheck = function(field, value) {
          this.prepField(field);
          field.showEditor_();
          chai.assert.equal(field.htmlInput_.getAttribute('spellcheck'),
              value.toString());
        };
      });
      teardown(function() {
        if (this.stub) {
          this.stub.restore();
        }
      });
      test('Default', function() {
        var field = new Blockly.FieldTextInput('test');
        this.assertSpellcheck(field, true);
      });
      test('JS Constructor', function() {
        var field = new Blockly.FieldTextInput('test', null, {
          spellcheck: false
        });
        this.assertSpellcheck(field, false);
      });
      test('JSON Definition', function() {
        var field = Blockly.FieldTextInput.fromJson({
          text: 'test',
          spellcheck: false
        });
        this.assertSpellcheck(field, false);
      });
      test('setSpellcheck Editor Hidden', function() {
        var field = new Blockly.FieldTextInput('test');
        field.setSpellcheck(false);
        this.assertSpellcheck(field, false);
      });
      test('setSpellcheck Editor Shown', function() {
        var field = new Blockly.FieldTextInput('test');
        this.prepField(field);
        field.showEditor_();
        field.setSpellcheck(false);
        chai.assert.equal(field.htmlInput_.getAttribute('spellcheck'), 'false');
      });
    });
  });
});
