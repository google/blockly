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

  var previousColours;
  setup(function() {
    previousColours = Blockly.FieldColour.COLOURS;
    Blockly.FieldColour.Colours = [
      '#ffffff', '#ff0000', '#00ff00', '#0000ff', '#ffffff'
    ];
  });
  teardown(function() {
    Blockly.FieldColour.Colours = previousColours;
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
    test.skip('Non-Parsable String', function() {
      var colourField = new Blockly.FieldColour('bad');
      assertValueDefault(colourField);
    });
    test.skip('#AAAAAA', function() {
      var colourField = new Blockly.FieldColour('#AAAAAA');
      assertValue(colourField, '#aaaaaa', '#aaa');
    });
    test('#aaaaaa', function() {
      var colourField = new Blockly.FieldColour('#aaaaaa');
      assertValue(colourField, '#aaaaaa', '#aaa');
    });
    test.skip('#AAAA00', function() {
      var colourField = new Blockly.FieldColour('#AAAA00');
      assertValue(colourField, '#aaaa00', '#aa0');
    });
    test('#aaaa00', function() {
      var colourField = new Blockly.FieldColour('#aaaa00');
      assertValue(colourField, '#aaaa00', '#aa0');
    });
    test.skip('#BCBCBC', function() {
      var colourField = new Blockly.FieldColour('#BCBCBC');
      assertValue(colourField, '#bcbcbc', '#bcbcbc');
    });
    test('#bcbcbc', function() {
      var colourField = new Blockly.FieldColour('#bcbcbc');
      assertValue(colourField, '#bcbcbc', '#bcbcbc');
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
    test.skip('Non-Parsable String', function() {
      var colourField = new Blockly.FieldColour.fromJson({ colour:'bad' });
      assertValueDefault(colourField);
    });
    test.skip('#AAAAAA', function() {
      var colourField = Blockly.FieldColour.fromJson({ colour: '#AAAAAA' });
      assertValue(colourField, '#aaaaaa', '#aaa');
    });
    test('#aaaaaa', function() {
      var colourField = Blockly.FieldColour.fromJson({ colour: '#aaaaaa' });
      assertValue(colourField, '#aaaaaa', '#aaa');
    });
    test.skip('#AAAA00', function() {
      var colourField = Blockly.FieldColour.fromJson({ colour: '#AAAA00' });
      assertValue(colourField, '#aaaa00', '#aa0');
    });
    test('#aaaa00', function() {
      var colourField = Blockly.FieldColour.fromJson({ colour: '#aaaa00' });
      assertValue(colourField, '#aaaa00', '#aa0');
    });
    test.skip('#BCBCBC', function() {
      var colourField = Blockly.FieldColour.fromJson({ colour: '#BCBCBC' });
      assertValue(colourField, '#bcbcbc', '#bcbcbc');
    });
    test('#bcbcbc', function() {
      var colourField = Blockly.FieldColour.fromJson({ colour: '#bcbcbc' });
      assertValue(colourField, '#bcbcbc', '#bcbcbc');
    });
  });
  suite('setValue', function() {
    var colourField;
    setup(function() {
      colourField = new Blockly.FieldColour('#aaaaaa');
    });
    test.skip('#aaaaaa -> Null', function() {
      colourField.setValue(null);
      assertValue(colourField, '#aaaaaa', '#aaa');
    });
    test.skip('#aaaaaa -> Undefined', function() {
      colourField.setValue(undefined);
      assertValue(colourField, '#aaaaaa', '#aaa');
    });
    test.skip('#aaaaaa -> Non-Parsable String', function() {
      colourField.setValue('bad');
      assertValue(colourField, '#aaaaaa', '#aaa');
    });
    test('#aaaaaa -> #000000', function() {
      colourField.setValue('#000000');
      assertValue(colourField, '#000000', '#000');
    });
    test('#aaaaaa -> #bcbcbc', function() {
      colourField.setValue('#bcbcbc');
      assertValue(colourField, '#bcbcbc', '#bcbcbc');
    });
  });
  suite.skip('Validators', function() {
    var colourField;
    setup(function() {
      colourField = new Blockly.FieldColour('#aaaaaa');
    });
    suite('Null Validator', function() {
      setup(function() {
        colourField.setValidator(function() {
          return null;
        });
      });
      test('New Value', function() {
        colourField.setValue('#000000');
        assertValue(colourField, '#aaaaaa', '#aaa');
      });
    });
    suite('Force Full Red Validator', function() {
      setup(function() {
        colourField.setValidator(function(newValue) {
          return '#ff' + newValue.substr(3, 4);
        });
      });
      test('New Value', function() {
        colourField.setValue('#000000');
        assertValue(colourField, '#ff0000', '#f00');
      });
    });
  });
});
