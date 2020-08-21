/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

suite('Abstract Fields', function() {
  setup(function() {
    sharedTestSetup.call(this);
    // TODO(#4197): Remove stubbing of deprecation warning after fixing.
    // field.setValue calls trigger a deprecation warning, capture to prevent
    // console logs.
    createDeprecationWarningStub();
  });
  teardown(function() {
    sharedTestTeardown.call(this);
  });
  suite('Is Serializable', function() {
    // Both EDITABLE and SERIALIZABLE are default.
    function FieldDefault() {
      this.name = 'NAME';
    }
    FieldDefault.prototype = Object.create(Blockly.Field.prototype);
    // EDITABLE is false and SERIALIZABLE is default.
    function FieldFalseDefault() {
      this.name = 'NAME';
    }
    FieldFalseDefault.prototype = Object.create(Blockly.Field.prototype);
    FieldFalseDefault.prototype.EDITABLE = false;
    // EDITABLE is default and SERIALIZABLE is true.
    function FieldDefaultTrue() {
      this.name = 'NAME';
    }
    FieldDefaultTrue.prototype = Object.create(Blockly.Field.prototype);
    FieldDefaultTrue.prototype.SERIALIZABLE = true;
    // EDITABLE is false and SERIALIZABLE is true.
    function FieldFalseTrue() {
      this.name = 'NAME';
    }
    FieldFalseTrue.prototype = Object.create(Blockly.Field.prototype);
    FieldFalseTrue.prototype.EDITABLE = false;
    FieldFalseTrue.prototype.SERIALIZABLE = true;

    /* Test Backwards Compatibility */
    test('Editable Default(true), Serializable Default(false)', function() {
      // An old default field should be serialized.
      var field = new FieldDefault();
      var stub = sinon.stub(console, 'warn');
      chai.assert.isTrue(field.isSerializable());
      sinon.assert.calledOnce(stub);
      stub.restore();
    });
    test('Editable False, Serializable Default(false)', function() {
      // An old non-editable field should not be serialized.
      var field = new FieldFalseDefault();
      chai.assert.isFalse(field.isSerializable());
    });
    /* Test Other Cases */
    test('Editable Default(true), Serializable True', function() {
      // A field that is both editable and serializable should be serialized.
      var field = new FieldDefaultTrue();
      chai.assert.isTrue(field.isSerializable());
    });
    test('Editable False, Serializable True', function() {
      // A field that is not editable, but overrides serializable to true
      // should be serialized (e.g. field_label_serializable)
      var field = new FieldFalseTrue();
      chai.assert.isTrue(field.isSerializable());
    });
  });
  suite('setValue', function() {
    function addSpies(field, excludeSpies = []) {
      if (!excludeSpies.includes('doValueInvalid_')) {
        sinon.spy(field, 'doValueInvalid_');
      }
      if (!excludeSpies.includes('doValueUpdate_')) {
        sinon.spy(field, 'doValueUpdate_');
      }
      if (!excludeSpies.includes('forceRerender')) {
        sinon.spy(field, 'forceRerender');
      }
    }
    function stubDoValueInvalid(field, isDirty) {
      sinon.stub(field, 'doValueInvalid_').callsFake(function(newValue) {
        this.isDirty_ = isDirty;
      });
    }
    function stubDoValueUpdate(field, isDirty) {
      sinon.stub(field, 'doValueUpdate_').callsFake(function(newValue) {
        this.isDirty_ = isDirty;
      });
    }
    function setLocalValidatorWithReturn(field, value) {
      field.setValidator(function() {
        return value;
      });
    }
    function setLocalValidator(field, isValid) {
      if (isValid) {
        field.setValidator(function(newValue) {
          return newValue;
        });
      } else {
        setLocalValidatorWithReturn(field, null);
      }
    }
    function stubClassValidatorWithReturn(field, value) {
      sinon.stub(field, 'doClassValidation_').returns(value);
    }
    function stubClassValidator(field, isValid) {
      if (isValid) {
        sinon.stub(field, 'doClassValidation_').callsFake(function(newValue) {
          return newValue;
        });
      } else {
        stubClassValidatorWithReturn(field, null);
      }
    }
    setup(function() {
      this.field = new Blockly.Field();
      this.field.isDirty_ = false;
    });
    test('Null', function() {
      addSpies(this.field);
      this.field.setValue(null);
      sinon.assert.notCalled(this.field.doValueInvalid_);
      sinon.assert.notCalled(this.field.doValueUpdate_);
      sinon.assert.notCalled(this.field.forceRerender);
    });
    test('No Validators, Dirty (Default)', function() {
      addSpies(this.field);
      this.field.setValue('value');
      sinon.assert.notCalled(this.field.doValueInvalid_);
      sinon.assert.calledOnce(this.field.doValueUpdate_);
      sinon.assert.calledOnce(this.field.forceRerender);
    });
    test('No Validators, Not Dirty', function() {
      stubDoValueUpdate(this.field, false);
      addSpies(this.field, ['doValueUpdate_']);
      this.field.setValue('value');
      sinon.assert.notCalled(this.field.doValueInvalid_);
      sinon.assert.calledOnce(this.field.doValueUpdate_);
      sinon.assert.notCalled(this.field.forceRerender);
    });
    test('Class Validator Returns Invalid, Not Dirty (Default)', function() {
      stubClassValidator(this.field, false);
      addSpies(this.field);
      this.field.setValue('value');
      sinon.assert.calledOnce(this.field.doValueInvalid_);
      sinon.assert.notCalled(this.field.doValueUpdate_);
      sinon.assert.notCalled(this.field.forceRerender);
    });
    test('Class Validator Returns Invalid, Dirty', function() {
      stubClassValidator(this.field, false);
      stubDoValueInvalid(this.field, true);
      addSpies(this.field, ['doValueInvalid_']);
      this.field.setValue('value');
      sinon.assert.calledOnce(this.field.doValueInvalid_);
      sinon.assert.notCalled(this.field.doValueUpdate_);
      sinon.assert.calledOnce(this.field.forceRerender);
    });
    test('Class Validator Returns Valid, Not Dirty', function() {
      stubClassValidator(this.field, true);
      stubDoValueUpdate(this.field, false);
      addSpies(this.field, ['doValueUpdate_']);
      this.field.setValue('value');
      sinon.assert.notCalled(this.field.doValueInvalid_);
      sinon.assert.calledOnce(this.field.doValueUpdate_);
      sinon.assert.notCalled(this.field.forceRerender);
    });
    test('Class Validator Returns Valid, Dirty (Default)', function() {
      stubClassValidator(this.field, true);
      addSpies(this.field);
      this.field.setValue('value');
      sinon.assert.notCalled(this.field.doValueInvalid_);
      sinon.assert.calledOnce(this.field.doValueUpdate_);
      sinon.assert.calledOnce(this.field.forceRerender);
    });
    test('Local Validator Returns Invalid, Not Dirty (Default)', function() {
      setLocalValidator(this.field, false);
      addSpies(this.field);
      this.field.setValue('value');
      sinon.assert.calledOnce(this.field.doValueInvalid_);
      sinon.assert.notCalled(this.field.doValueUpdate_);
      sinon.assert.notCalled(this.field.forceRerender);
    });
    test('Local Validator Returns Invalid, Dirty', function() {
      stubDoValueInvalid(this.field, true);
      setLocalValidator(this.field, false);
      addSpies(this.field, ['doValueInvalid_']);
      this.field.setValue('value');
      sinon.assert.calledOnce(this.field.doValueInvalid_);
      sinon.assert.notCalled(this.field.doValueUpdate_);
      sinon.assert.calledOnce(this.field.forceRerender);
    });
    test('Local Validator Returns Valid, Not Dirty', function() {
      stubDoValueUpdate(this.field, false);
      setLocalValidator(this.field, true);
      addSpies(this.field, ['doValueUpdate_']);
      this.field.setValue('value');
      sinon.assert.notCalled(this.field.doValueInvalid_);
      sinon.assert.calledOnce(this.field.doValueUpdate_);
      sinon.assert.notCalled(this.field.forceRerender);
    });
    test('Local Validator Returns Valid, Dirty (Default)', function() {
      setLocalValidator(this.field, true);
      addSpies(this.field);
      this.field.setValue('value');
      sinon.assert.notCalled(this.field.doValueInvalid_);
      sinon.assert.calledOnce(this.field.doValueUpdate_);
      sinon.assert.calledOnce(this.field.forceRerender);
    });
    test('New Value Matches Old Value', function() {
      this.field.setValue('value');
      addSpies(this.field);
      this.field.setValue('value');
      sinon.assert.notCalled(this.field.doValueInvalid_);
      sinon.assert.notCalled(this.field.doValueUpdate_);
      sinon.assert.notCalled(this.field.forceRerender);
    });
    test('New Value (Class)Validates to Old Value', function() {
      this.field.setValue('value');
      stubClassValidatorWithReturn(this.field, 'value');
      addSpies(this.field);
      this.field.setValue('notValue');
      sinon.assert.notCalled(this.field.doValueInvalid_);
      sinon.assert.notCalled(this.field.doValueUpdate_);
      sinon.assert.notCalled(this.field.forceRerender);
    });
    test('New Value (Local)Validates to Old Value', function() {
      this.field.setValue('value');
      setLocalValidatorWithReturn(this.field, 'value');
      addSpies(this.field);
      this.field.setValue('notValue');
      sinon.assert.notCalled(this.field.doValueInvalid_);
      sinon.assert.notCalled(this.field.doValueUpdate_);
      sinon.assert.notCalled(this.field.forceRerender);
    });
    test('New Value (Class)Validates to not Old Value', function() {
      this.field.setValue('value');
      stubClassValidatorWithReturn(this.field, 'notValue');
      addSpies(this.field);
      this.field.setValue('value');
      sinon.assert.notCalled(this.field.doValueInvalid_);
      sinon.assert.calledOnce(this.field.doValueUpdate_);
    });
    test('New Value (Local)Validates to not Old Value', function() {
      this.field.setValue('value');
      setLocalValidatorWithReturn(this.field, 'notValue');
      addSpies(this.field);
      this.field.setValue('value');
      sinon.assert.notCalled(this.field.doValueInvalid_);
      sinon.assert.calledOnce(this.field.doValueUpdate_);
    });
    test('Class Validator Returns Null', function() {
      stubClassValidatorWithReturn(this.field, null);
      addSpies(this.field);
      this.field.setValue('value');
      sinon.assert.calledOnce(this.field.doValueInvalid_);
      sinon.assert.notCalled(this.field.doValueUpdate_);
    });
    test('Class Validator Returns Same', function() {
      sinon.stub(this.field, 'doClassValidation_').callsFake(
          function(newValue) {
            return newValue;
          });
      addSpies(this.field);
      this.field.setValue('value');
      sinon.assert.notCalled(this.field.doValueInvalid_);
      sinon.assert.calledOnce(this.field.doValueUpdate_);
    });
    test('Class Validator Returns Different', function() {
      stubClassValidatorWithReturn(this.field, 'differentValue');
      addSpies(this.field);
      this.field.setValue('value');
      sinon.assert.notCalled(this.field.doValueInvalid_);
      sinon.assert.calledOnce(this.field.doValueUpdate_);
    });
    test('Class Validator Returns Undefined', function() {
      stubClassValidatorWithReturn(this.field, undefined);
      addSpies(this.field);
      this.field.setValue('value');
      chai.assert.equal(this.field.getValue(), 'value');
      sinon.assert.notCalled(this.field.doValueInvalid_);
      sinon.assert.calledOnce(this.field.doValueUpdate_);
    });
    test('Local Validator Returns Null', function() {
      setLocalValidatorWithReturn(this.field, null);
      addSpies(this.field);
      this.field.setValue('value');
      sinon.assert.calledOnce(this.field.doValueInvalid_);
      sinon.assert.notCalled(this.field.doValueUpdate_);
    });
    test('Local Validator Returns Same', function() {
      this.field.setValidator(function(newValue) {
        return newValue;
      });
      addSpies(this.field);
      this.field.setValue('value');
      sinon.assert.notCalled(this.field.doValueInvalid_);
      sinon.assert.calledOnce(this.field.doValueUpdate_);
    });
    test('Local Validator Returns Different', function() {
      setLocalValidatorWithReturn(this.field, 'differentValue');
      addSpies(this.field);
      this.field.setValue('value');
      sinon.assert.notCalled(this.field.doValueInvalid_);
      sinon.assert.calledOnce(this.field.doValueUpdate_);
    });
    test('Local Validator Returns Undefined', function() {
      setLocalValidatorWithReturn(this.field, undefined);
      addSpies(this.field);
      this.field.setValue('value');
      chai.assert.equal(this.field.getValue(), 'value');
      sinon.assert.notCalled(this.field.doValueInvalid_);
      sinon.assert.calledOnce(this.field.doValueUpdate_);
    });
  });
  suite('Customization', function() {
    // All this field does is wrap the abstract field.
    function CustomField(opt_config) {
      CustomField.superClass_.constructor.call(
          this, 'value', null, opt_config);
    }
    Blockly.utils.object.inherits(CustomField, Blockly.Field);
    CustomField.fromJson = function(options) {
      return new CustomField(options);
    };

    suite('Tooltip', function() {
      test('JS Constructor', function() {
        var field = new Blockly.Field('value', null, {
          tooltip: 'test tooltip',
        });
        chai.assert.equal(field.tooltip_, 'test tooltip');
      });
      test('JS Constructor - Dynamic', function() {
        var returnTooltip = function() {
          return 'dynamic tooltip text';
        };
        var field = new Blockly.Field('value', null, {
          tooltip: returnTooltip
        });
        chai.assert.equal(field.tooltip_, returnTooltip);
      });
      test('JSON Definition', function() {
        var field = CustomField.fromJson({
          tooltip: "test tooltip"
        });
        chai.assert.equal(field.tooltip_, 'test tooltip');
      });
      suite('W/ Msg References', function() {
        setup(function() {
          addMessageToCleanup(this.sharedCleanup, 'TOOLTIP');
          Blockly.Msg['TOOLTIP'] = 'test tooltip';
        });
        test('JS Constructor', function() {
          var field = new Blockly.Field('value', null, {
            tooltip: '%{BKY_TOOLTIP}',
          });
          chai.assert.equal(field.tooltip_, 'test tooltip');
        });
        test('JSON Definition', function() {
          var field = CustomField.fromJson({
            tooltip: "%{BKY_TOOLTIP}"
          });
          chai.assert.equal(field.tooltip_, 'test tooltip');
        });
      });
      suite('setTooltip', function() {
        setup(function() {
          this.workspace = new Blockly.WorkspaceSvg(new Blockly.Options({}));
          this.workspace.createDom();
        });
        teardown(function() {
          workspaceTeardown.call(this, this.workspace);
        });
        test('Before Append', function() {
          addBlockTypeToCleanup(this.sharedCleanup, 'tooltip');
          Blockly.Blocks['tooltip'] = {
            init: function() {
              var field = new Blockly.FieldTextInput('default');
              field.setTooltip('tooltip');
              this.appendDummyInput()
                  .appendField(field, 'TOOLTIP');
            },
          };
          var block = Blockly.Xml.domToBlock(Blockly.Xml.textToDom(
              '<xml xmlns="https://developers.google.com/blockly/xml">' +
              '  <block type="tooltip"></block>' +
              '</xml>'
          ).children[0], this.workspace);
          var field = block.getField('TOOLTIP');
          chai.assert.equal(field.getClickTarget_().tooltip, 'tooltip');
        });
        test('After Append', function() {
          addBlockTypeToCleanup(this.sharedCleanup, 'tooltip');
          Blockly.Blocks['tooltip'] = {
            init: function() {
              var field = new Blockly.FieldTextInput('default');
              this.appendDummyInput()
                  .appendField(field, 'TOOLTIP');
              field.setTooltip('tooltip');
            },
          };
          var block = Blockly.Xml.domToBlock(Blockly.Xml.textToDom(
              '<xml xmlns="https://developers.google.com/blockly/xml">' +
              '  <block type="tooltip"></block>' +
              '</xml>'
          ).children[0], this.workspace);
          var field = block.getField('TOOLTIP');
          chai.assert.equal(field.getClickTarget_().tooltip, 'tooltip');
        });
        test('After Block Creation', function() {
          addBlockTypeToCleanup(this.sharedCleanup, 'tooltip');
          Blockly.Blocks['tooltip'] = {
            init: function() {
              var field = new Blockly.FieldTextInput('default');
              this.appendDummyInput()
                  .appendField(field, 'TOOLTIP');
            },
          };
          var block = Blockly.Xml.domToBlock(Blockly.Xml.textToDom(
              '<xml xmlns="https://developers.google.com/blockly/xml">' +
              '  <block type="tooltip"></block>' +
              '</xml>'
          ).children[0], this.workspace);
          var field = block.getField('TOOLTIP');
          field.setTooltip('tooltip');
          chai.assert.equal(field.getClickTarget_().tooltip, 'tooltip');
        });
        test('Dynamic Function', function() {
          addBlockTypeToCleanup(this.sharedCleanup, 'tooltip');
          Blockly.Blocks['tooltip'] = {
            init: function() {
              var field = new Blockly.FieldTextInput('default');
              field.setTooltip(this.tooltipFunc);
              this.appendDummyInput()
                  .appendField(field, 'TOOLTIP');
            },

            tooltipFunc: function() {
              return this.getFieldValue('TOOLTIP');
            }
          };
          var block = Blockly.Xml.domToBlock(Blockly.Xml.textToDom(
              '<xml xmlns="https://developers.google.com/blockly/xml">' +
              '  <block type="tooltip"></block>' +
              '</xml>'
          ).children[0], this.workspace);
          var field = block.getField('TOOLTIP');
          chai.assert.equal(field.getClickTarget_().tooltip, block.tooltipFunc);
        });
        test('Element', function() {
          addBlockTypeToCleanup(this.sharedCleanup, 'tooltip');
          Blockly.Blocks['tooltip'] = {
            init: function() {
              var field = new Blockly.FieldTextInput('default');
              field.setTooltip(this.element);
              this.appendDummyInput()
                  .appendField(field, 'TOOLTIP');
            },
            element: {
              tooltip: 'tooltip'
            }
          };
          var block = Blockly.Xml.domToBlock(Blockly.Xml.textToDom(
              '<xml xmlns="https://developers.google.com/blockly/xml">' +
              '  <block type="tooltip"></block>' +
              '</xml>'
          ).children[0], this.workspace);
          var field = block.getField('TOOLTIP');
          chai.assert.equal(field.getClickTarget_().tooltip, block.element);
        });
        test('Null', function() {
          addBlockTypeToCleanup(this.sharedCleanup, 'tooltip');
          Blockly.Blocks['tooltip'] = {
            init: function() {
              var field = new Blockly.FieldTextInput('default');
              field.setTooltip(null);
              this.appendDummyInput()
                  .appendField(field, 'TOOLTIP');
            },
          };
          var block = Blockly.Xml.domToBlock(Blockly.Xml.textToDom(
              '<xml xmlns="https://developers.google.com/blockly/xml">' +
              '  <block type="tooltip"></block>' +
              '</xml>'
          ).children[0], this.workspace);
          var field = block.getField('TOOLTIP');
          chai.assert.equal(field.getClickTarget_().tooltip, block);
        });
        test('Undefined', function() {
          addBlockTypeToCleanup(this.sharedCleanup, 'tooltip');
          Blockly.Blocks['tooltip'] = {
            init: function() {
              var field = new Blockly.FieldTextInput('default');
              this.appendDummyInput()
                  .appendField(field, 'TOOLTIP');
            },
          };
          var block = Blockly.Xml.domToBlock(Blockly.Xml.textToDom(
              '<xml xmlns="https://developers.google.com/blockly/xml">' +
              '  <block type="tooltip"></block>' +
              '</xml>'
          ).children[0], this.workspace);
          var field = block.getField('TOOLTIP');
          chai.assert.equal(field.getClickTarget_().tooltip, block);
        });
      });
    });
  });
});
