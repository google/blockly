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

suite ('Colour Fields', function() {
  function assertValue(colourField, expectedValue, expectedText) {
    var actualValue = colourField.getValue();
    var actualText = colourField.getText();
    assertEquals(actualValue, expectedValue);
    assertEquals(actualText, expectedText);
  }
  function assertValueDefault(colourField) {
    var expectedValue = Blockly.FieldColour.COLOURS[0];
    var expectedText = expectedValue;
    var m = expectedValue.match(/^#(.)\1(.)\2(.)\3$/);
    if (m) {
      expectedText = '#' + m[1] + m[2] + m[3];
    }
    assertValue(colourField, expectedValue, expectedText);
  }

  setup(function() {
    this.previousColours = Blockly.FieldColour.COLOURS;
    Blockly.FieldColour.Colours = [
      '#ffffff', '#ff0000', '#00ff00', '#0000ff', '#ffffff'
    ];
  });
  teardown(function() {
    Blockly.FieldColour.Colours = this.previousColours;
  });
  suite('Constructor', function() {
    test('Empty', function() {
      var colourField = new Blockly.FieldColour();
      assertValueDefault(colourField);
    });
    test('Null', function() {
      var colourField = new Blockly.FieldColour(null);
      assertValueDefault(colourField);
    });
    test('Undefined', function() {
      var colourField = new Blockly.FieldColour(undefined);
      assertValueDefault(colourField);
    });
    test('Non-Parsable String', function() {
      var colourField = new Blockly.FieldColour('not_a_colour');
      assertValueDefault(colourField);
    });
    test('#AAAAAA', function() {
      var colourField = new Blockly.FieldColour('#AAAAAA');
      assertValue(colourField, '#aaaaaa', '#aaa');
    });
    test('#aaaaaa', function() {
      var colourField = new Blockly.FieldColour('#aaaaaa');
      assertValue(colourField, '#aaaaaa', '#aaa');
    });
    test('#AAAA00', function() {
      var colourField = new Blockly.FieldColour('#AAAA00');
      assertValue(colourField, '#aaaa00', '#aa0');
    });
    test('#aaaa00', function() {
      var colourField = new Blockly.FieldColour('#aaaa00');
      assertValue(colourField, '#aaaa00', '#aa0');
    });
    test('#BCBCBC', function() {
      var colourField = new Blockly.FieldColour('#BCBCBC');
      assertValue(colourField, '#bcbcbc', '#bcbcbc');
    });
    test('#bcbcbc', function() {
      var colourField = new Blockly.FieldColour('#bcbcbc');
      assertValue(colourField, '#bcbcbc', '#bcbcbc');
    });
    test('#AA0', function() {
      var colourField = new Blockly.FieldColour('#AA0');
      assertValue(colourField, '#aaaa00', '#aa0');
    });
    test('#aa0', function() {
      var colourField = new Blockly.FieldColour('#aa0');
      assertValue(colourField, '#aaaa00', '#aa0');
    });
    test('rgb(170, 170, 0)', function() {
      var colourField = new Blockly.FieldColour('rgb(170, 170, 0)');
      assertValue(colourField, '#aaaa00', '#aa0');
    });
    test('red', function() {
      var colourField = new Blockly.FieldColour('red');
      assertValue(colourField, '#ff0000', '#f00');
    });
  });
  suite('fromJson', function() {
    test('Empty', function() {
      var colourField = new Blockly.FieldColour.fromJson({});
      assertValueDefault(colourField);
    });
    test('Null', function() {
      var colourField = new Blockly.FieldColour.fromJson({ colour:null });
      assertValueDefault(colourField);
    });
    test('Undefined', function() {
      var colourField = new Blockly.FieldColour.fromJson({ colour:undefined });
      assertValueDefault(colourField);
    });
    test('Non-Parsable String', function() {
      var colourField = new Blockly.FieldColour.fromJson(
          { colour:'not_a_colour' });
      assertValueDefault(colourField);
    });
    test('#AAAAAA', function() {
      var colourField = Blockly.FieldColour.fromJson({ colour: '#AAAAAA' });
      assertValue(colourField, '#aaaaaa', '#aaa');
    });
    test('#aaaaaa', function() {
      var colourField = Blockly.FieldColour.fromJson({ colour: '#aaaaaa' });
      assertValue(colourField, '#aaaaaa', '#aaa');
    });
    test('#AAAA00', function() {
      var colourField = Blockly.FieldColour.fromJson({ colour: '#AAAA00' });
      assertValue(colourField, '#aaaa00', '#aa0');
    });
    test('#aaaa00', function() {
      var colourField = Blockly.FieldColour.fromJson({ colour: '#aaaa00' });
      assertValue(colourField, '#aaaa00', '#aa0');
    });
    test('#BCBCBC', function() {
      var colourField = Blockly.FieldColour.fromJson({ colour: '#BCBCBC' });
      assertValue(colourField, '#bcbcbc', '#bcbcbc');
    });
    test('#bcbcbc', function() {
      var colourField = Blockly.FieldColour.fromJson({ colour: '#bcbcbc' });
      assertValue(colourField, '#bcbcbc', '#bcbcbc');
    });
    test('#AA0', function() {
      var colourField = Blockly.FieldColour.fromJson({ colour: '#AA0' });
      assertValue(colourField, '#aaaa00', '#aa0');
    });
    test('#aa0', function() {
      var colourField = Blockly.FieldColour.fromJson({ colour: '#aa0' });
      assertValue(colourField, '#aaaa00', '#aa0');
    });
    test('rgb(170, 170, 0)', function() {
      var colourField = Blockly.FieldColour.fromJson(
          { colour: 'rgb(170, 170, 0)' });
      assertValue(colourField, '#aaaa00', '#aa0');
    });
    test('red', function() {
      var colourField = Blockly.FieldColour.fromJson({ colour: 'red' });
      assertValue(colourField, '#ff0000', '#f00');
    });
  });
  suite('setValue', function() {
    suite('Empty -> New Value', function() {
      setup(function() {
        this.colourField = new Blockly.FieldColour();
      });
      test('Null', function() {
        this.colourField.setValue(null);
        assertValueDefault(this.colourField);
      });
      test('Undefined', function() {
        this.colourField.setValue(undefined);
        assertValueDefault(this.colourField);
      });
      test('Non-Parsable String', function() {
        this.colourField.setValue('not_a_colour');
        assertValueDefault(this.colourField);
      });
      test('#000000', function() {
        this.colourField.setValue('#000000');
        assertValue(this.colourField, '#000000', '#000');
      });
      test('#bcbcbc', function() {
        this.colourField.setValue('#bcbcbc');
        assertValue(this.colourField, '#bcbcbc', '#bcbcbc');
      });
      test('#aa0', function() {
        this.colourField.setValue('#aa0');
        assertValue(this.colourField, '#aaaa00', '#aa0');
      });
      test('rgb(170, 170, 0)', function() {
        this.colourField.setValue('rgb(170, 170, 0)');
        assertValue(this.colourField, '#aaaa00', '#aa0');
      });
      test('red', function() {
        this.colourField.setValue('red');
        assertValue(this.colourField, '#ff0000', '#f00');
      });
    });
    suite('Value -> New Value', function() {
      setup(function() {
        this.colourField = new Blockly.FieldColour('#aaaaaa');
      });
      test('Null', function() {
        this.colourField.setValue(null);
        assertValue(this.colourField, '#aaaaaa', '#aaa');
      });
      test('Undefined', function() {
        this.colourField.setValue(undefined);
        assertValue(this.colourField, '#aaaaaa', '#aaa');
      });
      test('Non-Parsable String', function() {
        this.colourField.setValue('not_a_colour');
        assertValue(this.colourField, '#aaaaaa', '#aaa');
      });
      test('#000000', function() {
        this.colourField.setValue('#000000');
        assertValue(this.colourField, '#000000', '#000');
      });
      test('#bcbcbc', function() {
        this.colourField.setValue('#bcbcbc');
        assertValue(this.colourField, '#bcbcbc', '#bcbcbc');
      });
      test('#aa0', function() {
        this.colourField.setValue('#aa0');
        assertValue(this.colourField, '#aaaa00', '#aa0');
      });
      test('rgb(170, 170, 0)', function() {
        this.colourField.setValue('rgb(170, 170, 0)');
        assertValue(this.colourField, '#aaaa00', '#aa0');
      });
      test('red', function() {
        this.colourField.setValue('red');
        assertValue(this.colourField, '#ff0000', '#f00');
      });
    });
  });
  suite('Validators', function() {
    setup(function() {
      this.colourField = new Blockly.FieldColour('#aaaaaa');
    });
    teardown(function() {
      this.colourField.setValidator(null);
    });
    suite('Null Validator', function() {
      setup(function() {
        this.colourField.setValidator(function() {
          return null;
        });
      });
      test('New Value', function() {
        this.colourField.setValue('#000000');
        assertValue(this.colourField, '#aaaaaa', '#aaa');
      });
    });
    suite('Force Full Red Validator', function() {
      setup(function() {
        this.colourField.setValidator(function(newValue) {
          return '#ff' + newValue.substr(3, 4);
        });
      });
      test('New Value', function() {
        this.colourField.setValue('#000000');
        assertValue(this.colourField, '#ff0000', '#f00');
      });
    });
    suite('Returns Undefined Validator', function() {
      setup(function() {
        this.colourField.setValidator(function() {});
      });
      test('New Value', function() {
        this.colourField.setValue('#000000');
        assertValue(this.colourField, '#000000', '#000');
      });
    });
  });
});
