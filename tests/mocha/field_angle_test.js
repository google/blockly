/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

suite('Angle Fields', function() {
  function assertValue(angleField, expectedValue, opt_expectedText) {
    var actualValue = angleField.getValue();
    var actualText = angleField.getText();
    opt_expectedText = opt_expectedText || String(expectedValue);
    assertEquals(String(actualValue), String(expectedValue));
    assertEquals(Number(actualValue), expectedValue);
    assertEquals(actualText, opt_expectedText);
  }
  function assertValueDefault(angleField) {
    assertValue(angleField, 0);
  }
  suite('Constructor', function() {
    test('Empty', function() {
      var angleField = new Blockly.FieldAngle();
      assertValueDefault(angleField);
    });
    test('Undefined', function() {
      var angleField = new Blockly.FieldAngle(undefined);
      assertValueDefault(angleField);
    });
    test('NaN', function() {
      var angleField = new Blockly.FieldAngle(NaN);
      assertValueDefault(angleField);
    });
    test('Integer', function() {
      var angleField = new Blockly.FieldAngle(1);
      assertValue(angleField, 1);
    });
    test('Float', function() {
      var angleField = new Blockly.FieldAngle(1.5);
      assertValue(angleField, 1.5);
    });
    test('Integer String', function() {
      var angleField = new Blockly.FieldAngle('1');
      assertValue(angleField, 1);
    });
    test('Float String', function() {
      var angleField = new Blockly.FieldAngle('1.5');
      assertValue(angleField, 1.5);
    });
    test('> 360°', function() {
      var angleField = new Blockly.FieldAngle(362);
      assertValue(angleField, 2);
    });
  });
  suite('fromJson', function() {
    test('Empty', function() {
      var angleField = Blockly.FieldAngle.fromJson({});
      assertValueDefault(angleField);
    });
    test('Undefined', function() {
      var angleField = Blockly.FieldAngle.fromJson({ angle:undefined });
      assertValueDefault(angleField);
    });
    test('NaN', function() {
      var angleField = Blockly.FieldAngle.fromJson({ angle:NaN });
      assertValueDefault(angleField);
    });
    test('Integer', function() {
      var angleField = Blockly.FieldAngle.fromJson({ angle:1 });
      assertValue(angleField, 1);
    });
    test('Float', function() {
      var angleField = Blockly.FieldAngle.fromJson({ angle:1.5 });
      assertValue(angleField, 1.5);
    });
    test('Integer String', function() {
      var angleField = Blockly.FieldAngle.fromJson({ angle:'1' });
      assertValue(angleField, 1);
    });
    test('Float String', function() {
      var angleField = Blockly.FieldAngle.fromJson({ angle:'1.5' });
      assertValue(angleField, 1.5);
    });
    test('> 360°', function() {
      var angleField = Blockly.FieldAngle.fromJson({ angle:362 });
      assertValue(angleField, 2);
    });
  });
  suite('setValue', function() {
    suite('Empty -> New Value', function() {
      setup(function() {
        this.angleField = new Blockly.FieldAngle();
      });
      test('Null', function() {
        this.angleField.setValue(null);
        assertValueDefault(this.angleField);
      });
      test('Undefined', function() {
        this.angleField.setValue(undefined);
        assertValueDefault(this.angleField);
      });
      test('Non-Parsable String', function() {
        this.angleField.setValue('bad');
        assertValueDefault(this.angleField);
      });
      test('NaN', function() {
        this.angleField.setValue(NaN);
        assertValueDefault(this.angleField);
      });
      test('Integer', function() {
        this.angleField.setValue(2);
        assertValue(this.angleField, 2);
      });
      test('Float', function() {
        this.angleField.setValue(2.5);
        assertValue(this.angleField, 2.5);
      });
      test('Integer String', function() {
        this.angleField.setValue('2');
        assertValue(this.angleField, 2);
      });
      test('Float', function() {
        this.angleField.setValue('2.5');
        assertValue(this.angleField, 2.5);
      });
      test('>360°', function() {
        this.angleField.setValue(362);
        assertValue(this.angleField, 2);
      });
      test('Infinity', function() {
        this.angleField.setValue(Infinity);
        assertValueDefault(this.angleField);
      });
      test('Negative Infinity String', function() {
        this.angleField.setValue('-Infinity');
        assertValueDefault(this.angleField);
      });
    });
    suite('Value -> New Value', function() {
      setup(function() {
        this.angleField = new Blockly.FieldAngle(1);
      });
      test('Null', function() {
        this.angleField.setValue(null);
        assertValue(this.angleField, 1);
      });
      test('Undefined', function() {
        this.angleField.setValue(undefined);
        assertValue(this.angleField, 1);
      });
      test('Non-Parsable String', function() {
        this.angleField.setValue('bad');
        assertValue(this.angleField, 1);
      });
      test('NaN', function() {
        this.angleField.setValue(NaN);
        assertValue(this.angleField, 1);
      });
      test('Integer', function() {
        this.angleField.setValue(2);
        assertValue(this.angleField, 2);
      });
      test('Float', function() {
        this.angleField.setValue(2.5);
        assertValue(this.angleField, 2.5);
      });
      test('Integer String', function() {
        this.angleField.setValue('2');
        assertValue(this.angleField, 2);
      });
      test('Float', function() {
        this.angleField.setValue('2.5');
        assertValue(this.angleField, 2.5);
      });
      test('>360°', function() {
        this.angleField.setValue(362);
        assertValue(this.angleField, 2);
      });
      test('Infinity', function() {
        this.angleField.setValue(Infinity);
        assertValue(this.angleField, 1);
      });
      test('Negative Infinity String', function() {
        this.angleField.setValue('-Infinity');
        assertValue(this.angleField, 1);
      });
    });
  });
  suite('Validators', function() {
    setup(function() {
      this.angleField = new Blockly.FieldAngle(1);
      this.angleField.htmlInput_ = Object.create(null);
      this.angleField.htmlInput_.oldValue_ = '1';
      this.angleField.htmlInput_.untypedDefaultValue_ = 1;
      this.stub = sinon.stub(this.angleField, 'resizeEditor_');
    });
    teardown(function() {
      this.angleField.setValidator(null);
      this.angleField.htmlInput_ = null;
      if (this.stub) {
        this.stub.restore();
      }
    });
    suite('Null Validator', function() {
      setup(function() {
        this.angleField.setValidator(function() {
          return null;
        });
      });
      test('When Editing', function() {
        this.angleField.isBeingEdited_ = true;
        this.angleField.htmlInput_.value = '2';
        this.angleField.onHtmlInputChange_(null);
        assertValue(this.angleField, 1, '2');
        this.angleField.isBeingEdited_ = false;
      });
      test('When Not Editing', function() {
        this.angleField.setValue(2);
        assertValue(this.angleField, 1);
      });
    });
    suite('Force Mult of 30 Validator', function() {
      setup(function() {
        this.angleField.setValidator(function(newValue) {
          return Math.round(newValue / 30) * 30;
        });
      });
      test('When Editing', function() {
        this.angleField.isBeingEdited_ = true;
        this.angleField.htmlInput_.value = '25';
        this.angleField.onHtmlInputChange_(null);
        assertValue(this.angleField, 30, '25');
        this.angleField.isBeingEdited_ = false;
      });
      test('When Not Editing', function() {
        this.angleField.setValue(25);
        assertValue(this.angleField, 30);
      });
    });
    suite('Returns Undefined Validator', function() {
      setup(function() {
        this.angleField.setValidator(function() {});
      });
      test('When Editing', function() {
        this.angleField.isBeingEdited_ = true;
        this.angleField.htmlInput_.value = '2';
        this.angleField.onHtmlInputChange_(null);
        assertValue(this.angleField, 2);
        this.angleField.isBeingEdited_ = false;
      });
      test('When Not Editing', function() {
        this.angleField.setValue(2);
        assertValue(this.angleField, 2);
      });
    });
  });
  suite('Customizations', function() {
    suite('Clockwise', function() {
      test('JS Configuration', function() {
        var field = new Blockly.FieldAngle(0, null, {
          clockwise: true
        });
        chai.assert.isTrue(field.clockwise_);
      });
      test('JSON Definition', function() {
        var field = Blockly.FieldAngle.fromJson({
          value: 0,
          clockwise: true
        });
        chai.assert.isTrue(field.clockwise_);
      });
      test('Constant', function() {
        // Note: Generally constants should be set at compile time, not
        // runtime (since they are constants) but for testing purposes we
        // can do this.
        Blockly.FieldAngle.CLOCKWISE = true;
        var field = new Blockly.FieldAngle();
        chai.assert.isTrue(field.clockwise_);
      });
    });
    suite('Offset', function() {
      test('JS Configuration', function() {
        var field = new Blockly.FieldAngle(0, null, {
          offset: 90
        });
        chai.assert.equal(field.offset_, 90);
      });
      test('JSON Definition', function() {
        var field = Blockly.FieldAngle.fromJson({
          value: 0,
          offset: 90
        });
        chai.assert.equal(field.offset_, 90);
      });
      test('Constant', function() {
        // Note: Generally constants should be set at compile time, not
        // runtime (since they are constants) but for testing purposes we
        // can do this.
        Blockly.FieldAngle.OFFSET = 90;
        var field = new Blockly.FieldAngle();
        chai.assert.equal(field.offset_, 90);
      });
      test('Null', function() {
        // Note: Generally constants should be set at compile time, not
        // runtime (since they are constants) but for testing purposes we
        // can do this.
        Blockly.FieldAngle.OFFSET = 90;
        var field = Blockly.FieldAngle.fromJson({
          value: 0,
          offset: null
        });
        chai.assert.equal(field.offset_, 90);
      });
    });
    suite('Wrap', function() {
      test('JS Configuration', function() {
        var field = new Blockly.FieldAngle(0, null, {
          wrap: 180
        });
        chai.assert.equal(field.wrap_, 180);
      });
      test('JSON Definition', function() {
        var field = Blockly.FieldAngle.fromJson({
          value: 0,
          wrap: 180
        });
        chai.assert.equal(field.wrap_, 180);
      });
      test('Constant', function() {
        // Note: Generally constants should be set at compile time, not
        // runtime (since they are constants) but for testing purposes we
        // can do this.
        Blockly.FieldAngle.WRAP = 180;
        var field = new Blockly.FieldAngle();
        chai.assert.equal(field.wrap_, 180);
      });
      test('Null', function() {
        // Note: Generally constants should be set at compile time, not
        // runtime (since they are constants) but for testing purposes we
        // can do this.
        Blockly.FieldAngle.WRAP = 180;
        var field = Blockly.FieldAngle.fromJson({
          value: 0,
          wrap: null
        });
        chai.assert.equal(field.wrap_, 180);
      });
    });
    suite('Round', function() {
      test('JS Configuration', function() {
        var field = new Blockly.FieldAngle(0, null, {
          round: 30
        });
        chai.assert.equal(field.round_, 30);
      });
      test('JSON Definition', function() {
        var field = Blockly.FieldAngle.fromJson({
          value: 0,
          round: 30
        });
        chai.assert.equal(field.round_, 30);
      });
      test('Constant', function() {
        // Note: Generally constants should be set at compile time, not
        // runtime (since they are constants) but for testing purposes we
        // can do this.
        Blockly.FieldAngle.ROUND = 30;
        var field = new Blockly.FieldAngle();
        chai.assert.equal(field.round_, 30);
      });
      test('Null', function() {
        // Note: Generally constants should be set at compile time, not
        // runtime (since they are constants) but for testing purposes we
        // can do this.
        Blockly.FieldAngle.ROUND = 30;
        var field = Blockly.FieldAngle.fromJson({
          value: 0,
          round: null
        });
        chai.assert.equal(field.round_, 30);
      });
    });
    suite('Mode', function() {
      suite('Compass', function() {
        test('JS Configuration', function() {
          var field = new Blockly.FieldAngle(0, null, {
            mode: 'compass'
          });
          chai.assert.equal(field.offset_, 90);
          chai.assert.isTrue(field.clockwise_);
        });
        test('JS Configuration', function() {
          var field = Blockly.FieldAngle.fromJson({
            value: 0,
            mode: 'compass'
          });
          chai.assert.equal(field.offset_, 90);
          chai.assert.isTrue(field.clockwise_);
        });
      });
      suite('Protractor', function() {
        test('JS Configuration', function() {
          var field = new Blockly.FieldAngle(0, null, {
            mode: 'protractor'
          });
          chai.assert.equal(field.offset_, 0);
          chai.assert.isFalse(field.clockwise_);
        });
        test('JS Configuration', function() {
          var field = Blockly.FieldAngle.fromJson({
            value: 0,
            mode: 'protractor'
          });
          chai.assert.equal(field.offset_, 0);
          chai.assert.isFalse(field.clockwise_);
        });
      });
    });
  });
});
