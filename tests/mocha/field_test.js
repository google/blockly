/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

suite('Abstract Fields', function() {
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
      chai.assert(stub.calledOnce);
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
    function addSpies(field) {
      if (!this.isSpying) {
        sinon.spy(field, 'doValueInvalid_');
        sinon.spy(field, 'doValueUpdate_');
        sinon.spy(field, 'forceRerender');
        this.isSpying = true;
      }
    }
    function removeSpies(field) {
      if (this.isSpying) {
        field.doValueInvalid_.restore();
        field.doValueUpdate_.restore();
        field.forceRerender.restore();
        this.isSpying = false;
      }
    }
    setup(function() {
      this.field = new Blockly.Field();
      this.field.isDirty_ = false;
      this.cachedDoClassValidation = this.field.doClassValidation_;
      this.cachedDoValueUpdate = this.field.doValueUpdate_;
      this.cachedDoValueInvalid = this.field.doValueInvalid_;
    });
    teardown(function() {
      removeSpies(this.field);
      this.field.doClassValidation_ = this.cachedDoClassValidation;
      this.field.doValueUpdate_ = this.cachedDoValueUpdate;
      this.field.doValueInvalid_ = this.cachedDoValueInvalid;
      this.field.setValidator(null);
    });
    test('Null', function() {
      addSpies(this.field);
      this.field.setValue(null);
      chai.assert(this.field.doValueInvalid_.notCalled);
      chai.assert(this.field.doValueUpdate_.notCalled);
      chai.assert(this.field.forceRerender.notCalled);
    });
    test('No Validators, Dirty (Default)', function() {
      addSpies(this.field);
      this.field.setValue('value');
      chai.assert(this.field.doValueInvalid_.notCalled);
      chai.assert(this.field.doValueUpdate_.calledOnce);
      chai.assert(this.field.forceRerender.calledOnce);
    });
    test('No Validators, Not Dirty', function() {
      this.field.doValueUpdate_ = function(newValue) {
        this.value_ = newValue;
        this.isDirty_ = false;
      };
      addSpies(this.field);
      this.field.setValue('value');
      chai.assert(this.field.doValueInvalid_.notCalled);
      chai.assert(this.field.doValueUpdate_.calledOnce);
      chai.assert(this.field.forceRerender.notCalled);
    });
    test('Class Validator Returns Invalid, Not Dirty (Default)', function() {
      this.field.doClassValidation_ = function() {
        return null;
      };
      addSpies(this.field);
      this.field.setValue('value');
      chai.assert(this.field.doValueInvalid_.calledOnce);
      chai.assert(this.field.doValueUpdate_.notCalled);
      chai.assert(this.field.forceRerender.notCalled);
    });
    test('Class Validator Returns Invalid, Dirty', function() {
      this.field.doClassValidation_ = function() {
        return null;
      };
      this.field.doValueInvalid_ = function() {
        this.isDirty_ = true;
      };
      addSpies(this.field);
      this.field.setValue('value');
      chai.assert(this.field.doValueInvalid_.calledOnce);
      chai.assert(this.field.doValueUpdate_.notCalled);
      chai.assert(this.field.forceRerender.calledOnce);
    });
    test('Class Validator Returns Valid, Not Dirty', function() {
      this.field.doClassValidation_ = function(newValue) {
        return newValue;
      };
      this.field.doValueUpdate_ = function() {
        this.isDirty_ = false;
      };
      addSpies(this.field);
      this.field.setValue('value');
      chai.assert(this.field.doValueInvalid_.notCalled);
      chai.assert(this.field.doValueUpdate_.calledOnce);
      chai.assert(this.field.forceRerender.notCalled);
    });
    test('Class Validator Returns Valid, Dirty (Default)', function() {
      this.field.doClassValidation_ = function(newValue) {
        return newValue;
      };
      addSpies(this.field);
      this.field.setValue('value');
      chai.assert(this.field.doValueInvalid_.notCalled);
      chai.assert(this.field.doValueUpdate_.calledOnce);
      chai.assert(this.field.forceRerender.calledOnce);
    });
    test('Local Validator Returns Invalid, Not Dirty (Default)', function() {
      this.field.setValidator(function() {
        return null;
      });
      addSpies(this.field);
      this.field.setValue('value');
      chai.assert(this.field.doValueInvalid_.calledOnce);
      chai.assert(this.field.doValueUpdate_.notCalled);
      chai.assert(this.field.forceRerender.notCalled);
    });
    test('Local Validator Returns Invalid, Dirty', function() {
      this.field.setValidator(function() {
        return null;
      });
      this.field.doValueInvalid_ = function() {
        this.isDirty_ = true;
      };
      addSpies(this.field);
      this.field.setValue('value');
      chai.assert(this.field.doValueInvalid_.calledOnce);
      chai.assert(this.field.doValueUpdate_.notCalled);
      chai.assert(this.field.forceRerender.calledOnce);
    });
    test('Local Validator Returns Valid, Not Dirty', function() {
      this.field.setValidator(function(newValue) {
        return newValue;
      });
      this.field.doValueUpdate_ = function() {
        this.isDirty_ = false;
      };
      addSpies(this.field);
      this.field.setValue('value');
      chai.assert(this.field.doValueInvalid_.notCalled);
      chai.assert(this.field.doValueUpdate_.calledOnce);
      chai.assert(this.field.forceRerender.notCalled);
    });
    test('Local Validator Returns Valid, Dirty (Default)', function() {
      this.field.setValidator(function(newValue) {
        return newValue;
      });
      addSpies(this.field);
      this.field.setValue('value');
      chai.assert(this.field.doValueInvalid_.notCalled);
      chai.assert(this.field.doValueUpdate_.calledOnce);
      chai.assert(this.field.forceRerender.calledOnce);
    });
    test('New Value Matches Old Value', function() {
      this.field.setValue('value');
      addSpies(this.field);
      this.field.setValue('value');
      chai.assert(this.field.doValueInvalid_.notCalled);
      chai.assert(this.field.doValueUpdate_.notCalled);
      chai.assert(this.field.forceRerender.notCalled);
    });
    test('New Value (Class)Validates to Old Value', function() {
      this.field.setValue('value');
      this.field.doClassValidation_ = function() {
        return 'value';
      };
      addSpies(this.field);
      this.field.setValue('notValue');
      chai.assert(this.field.doValueInvalid_.notCalled);
      chai.assert(this.field.doValueUpdate_.notCalled);
      chai.assert(this.field.forceRerender.notCalled);
    });
    test('New Value (Local)Validates to Old Value', function() {
      this.field.setValue('value');
      this.field.setValidator(function() {
        return 'value';
      });
      addSpies(this.field);
      this.field.setValue('notValue');
      chai.assert(this.field.doValueInvalid_.notCalled);
      chai.assert(this.field.doValueUpdate_.notCalled);
      chai.assert(this.field.forceRerender.notCalled);
    });
    test('New Value (Class)Validates to not Old Value', function() {
      this.field.setValue('value');
      this.field.doClassValidation_ = function() {
        return 'notValue';
      };
      addSpies(this.field);
      this.field.setValue('value');
      chai.assert(this.field.doValueInvalid_.notCalled);
      chai.assert(this.field.doValueUpdate_.calledOnce);
    });
    test('New Value (Local)Validates to not Old Value', function() {
      this.field.setValue('value');
      this.field.setValidator(function() {
        return 'notValue';
      });
      addSpies(this.field);
      this.field.setValue('value');
      chai.assert(this.field.doValueInvalid_.notCalled);
      chai.assert(this.field.doValueUpdate_.calledOnce);
    });
    test('Class Validator Returns Null', function() {
      this.field.doClassValidation_ = function() {
        return null;
      };
      addSpies(this.field);
      this.field.setValue('value');
      chai.assert(this.field.doValueInvalid_.calledOnce);
      chai.assert(this.field.doValueUpdate_.notCalled);
    });
    test('Class Validator Returns Same', function() {
      this.field.doClassValidation_ = function(newValue) {
        return newValue;
      };
      addSpies(this.field);
      this.field.setValue('value');
      chai.assert(this.field.doValueInvalid_.notCalled);
      chai.assert(this.field.doValueUpdate_.calledOnce);
    });
    test('Class Validator Returns Different', function() {
      this.field.doClassValidation_ = function() {
        return 'differentValue';
      };
      addSpies(this.field);
      this.field.setValue('value');
      chai.assert(this.field.doValueInvalid_.notCalled);
      chai.assert(this.field.doValueUpdate_.calledOnce);
    });
    test('Class Validator Returns Undefined', function() {
      this.field.doClassValidation_ = function() {};
      addSpies(this.field);
      this.field.setValue('value');
      chai.assert.equal(this.field.getValue(), 'value');
      chai.assert(this.field.doValueInvalid_.notCalled);
      chai.assert(this.field.doValueUpdate_.calledOnce);
    });
    test('Local Validator Returns Null', function() {
      this.field.setValidator(function() {
        return null;
      });
      addSpies(this.field);
      this.field.setValue('value');
      chai.assert(this.field.doValueInvalid_.calledOnce);
      chai.assert(this.field.doValueUpdate_.notCalled);
    });
    test('Local Validator Returns Same', function() {
      this.field.setValidator(function(newValue) {
        return newValue;
      });
      addSpies(this.field);
      this.field.setValue('value');
      chai.assert(this.field.doValueInvalid_.notCalled);
      chai.assert(this.field.doValueUpdate_.calledOnce);
    });
    test('Local Validator Returns Different', function() {
      this.field.setValidator(function() {
        return 'differentValue';
      });
      addSpies(this.field);
      this.field.setValue('value');
      chai.assert(this.field.doValueInvalid_.notCalled);
      chai.assert(this.field.doValueUpdate_.calledOnce);
    });
    test('Local Validator Returns Undefined', function() {
      this.field.setValidator(function() {});
      addSpies(this.field);
      this.field.setValue('value');
      chai.assert.equal(this.field.getValue(), 'value');
      chai.assert(this.field.doValueInvalid_.notCalled);
      chai.assert(this.field.doValueUpdate_.calledOnce);
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
          Blockly.Msg['TOOLTIP'] = 'test tooltip';
        });
        teardown(function() {
          delete Blockly.Msg['TOOLTIP'];
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
          this.workspace = new Blockly.WorkspaceSvg({});
          this.workspace.createDom();
        });
        teardown(function() {
          this.workspace = null;
        });
        test('Before Append', function() {
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
          delete Blockly.Blocks['tooltip'];
        });
        test('After Append', function() {
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
          delete Blockly.Blocks['tooltip'];
        });
        test('After Block Creation', function() {
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
          delete Blockly.Blocks['tooltip'];
        });
        test('Dynamic Function', function() {
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
          delete Blockly.Blocks['tooltip'];
        });
        test('Element', function() {
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
          delete Blockly.Blocks['tooltip'];
        });
        test('Null', function() {
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
          delete Blockly.Blocks['tooltip'];
        });
        test('Undefined', function() {
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
          delete Blockly.Blocks['tooltip'];
        });
      });
    });
  });
});
