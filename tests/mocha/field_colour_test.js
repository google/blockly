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

suite('Colour Fields', function() {
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
    test('Undefined', function() {
      var colourField = new Blockly.FieldColour(undefined);
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
    test('Undefined', function() {
      var colourField = new Blockly.FieldColour.fromJson({ colour:undefined });
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
  suite('Customizations', function() {
    suite('Colours and Titles', function() {
      function assertColoursAndTitles(field, colours, titles) {
        var editor = field.dropdownCreate_();
        var index = 0;
        var node = editor.firstChild.firstChild;
        while (node) {
          chai.assert.equal(node.getAttribute('title'), titles[index]);
          chai.assert.equal(
              Blockly.utils.colour.parse(
                  node.style.backgroundColor),
              colours[index]);

          var nextNode = node.nextSibling;
          if (!nextNode) {
            nextNode = node.parentElement.nextSibling;
            if (!nextNode) {
              break;
            }
            nextNode = nextNode.firstChild;
          }
          node = nextNode;

          index++;
        }
      }
      test('Constants', function() {
        var colours = Blockly.FieldColour.COLOURS;
        var titles = Blockly.FieldColour.TITLES;
        // Note: Developers shouldn't actually do this. IMO they should
        // change the file and then recompile. But this is fine for testing.
        Blockly.FieldColour.COLOURS = ['#aaaaaa'];
        Blockly.FieldColour.TITLES = ['grey'];
        var field = new Blockly.FieldColour();

        assertColoursAndTitles(field, ['#aaaaaa'], ['grey']);

        Blockly.FieldColour.COLOURS = colours;
        Blockly.FieldColour.TITLES = titles;
      });
      test('JS Constructor', function() {
        var field = new Blockly.FieldColour('#aaaaaa', null, {
          colourOptions: ['#aaaaaa'],
          colourTitles: ['grey']
        });
        assertColoursAndTitles(field, ['#aaaaaa'], ['grey']);
      });
      test('JSON Definition', function() {
        var field = Blockly.FieldColour.fromJson({
          colour: '#aaaaaa',
          colourOptions: ['#aaaaaa'],
          colourTitles: ['grey']
        });
        assertColoursAndTitles(field, ['#aaaaaa'], ['grey']);
      });
      test('setColours', function() {
        var field = new Blockly.FieldColour();
        field.setColours(['#aaaaaa'], ['grey']);
        assertColoursAndTitles(field, ['#aaaaaa'], ['grey']);
      });
      test('Titles Undefined', function() {
        var field = new Blockly.FieldColour();
        field.setColours(['#aaaaaa']);
        assertColoursAndTitles(field, ['#aaaaaa'], ['#aaaaaa']);
      });
      test('Some Titles Undefined', function() {
        var field = new Blockly.FieldColour();
        field.setColours(['#aaaaaa', '#ff0000'], ['grey']);
        assertColoursAndTitles(field,
            ['#aaaaaa', '#ff0000'], ['grey', '#ff0000']);
      });
      // This is kinda derpy behavior, but I wanted to document it.
      test('Overwriting Colours While Leaving Titles', function() {
        var field = new Blockly.FieldColour();
        field.setColours(['#aaaaaa'], ['grey']);
        field.setColours(['#ff0000']);
        assertColoursAndTitles(field, ['#ff0000'], ['grey']);
      });
    });
    suite('Columns', function() {
      function assertColumns(field, columns) {
        var editor = field.dropdownCreate_();
        chai.assert.equal(editor.firstChild.children.length, columns);
      }
      test('Constants', function() {
        var columns = Blockly.FieldColour.COLUMNS;
        // Note: Developers shouldn't actually do this. IMO they should edit
        // the file and tehn recompile. But this is fine for testing.
        Blockly.FieldColour.COLUMNS = 3;
        var field = new Blockly.FieldColour();

        assertColumns(field, 3);

        Blockly.FieldColour.COLUMNS = columns;
      });
      test('JS Constructor', function() {
        var field = new Blockly.FieldColour('#ffffff', null, {
          columns: 3
        });
        assertColumns(field, 3);
      });
      test('JSON Definition', function() {
        var field = Blockly.FieldColour.fromJson({
          'colour': '#ffffff',
          'columns': 3
        });
        assertColumns(field, 3);
      });
      test('setColumns', function() {
        var field = new Blockly.FieldColour();
        field.setColumns(3);
        assertColumns(field, 3);
      });
    });
  });
});
