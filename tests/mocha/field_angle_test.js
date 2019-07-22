/**
 * @license
 * Visual Blocks Editor
 *
 * Copyright 2019 Google Inc.
 * https://developers.google.com/blockly/
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

suite ('Angle Fields', function() {
  function assertValue(angleField, expectedValue, opt_expectedText) {
    var actualValue = angleField.getValue();
    var actualText = angleField.getText();
    opt_expectedText = opt_expectedText || String(expectedValue);
    assertEquals(String(actualValue), String(expectedValue));
    assertEquals(parseFloat(actualValue), expectedValue);
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
    test('Null', function() {
      var angleField = new Blockly.FieldAngle(null);
      assertValueDefault(angleField);
    });
    test('Undefined', function() {
      var angleField = new Blockly.FieldAngle(undefined);
      assertValueDefault(angleField);
    });
    test('Non-Parsable String', function() {
      var angleField = new Blockly.FieldAngle('bad');
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
    test('Null', function() {
      var angleField = Blockly.FieldAngle.fromJson({ angle:null });
      assertValueDefault(angleField);
    });
    test('Undefined', function() {
      var angleField = Blockly.FieldAngle.fromJson({ angle:undefined });
      assertValueDefault(angleField);
    });
    test('Non-Parsable String', function() {
      var angleField = Blockly.FieldAngle.fromJson({ angle:'bad' });
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
    });
  });
  suite('Validators', function() {
    setup(function() {
      this.angleField = new Blockly.FieldAngle(1);
      this.angleField.htmlInput_ = Object.create(null);
      this.angleField.htmlInput_.oldValue_ = '1';
      this.angleField.htmlInput_.untypedDefaultValue_ = 1;
    });
    teardown(function() {
      this.angleField.setValidator(null);
      this.angleField.htmlInput_ = null;
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
});
