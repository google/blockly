/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

suite('Colour Fields', function() {
  /**
   * Configuration for field tests with invalid values.
   * @type {!Array<!FieldCreationTestCase>}
   */
  var invalidValueTestCases = [
    {title: 'Undefined', value: undefined},
    {title: 'Null', value: null},
    {title: 'NaN', value: NaN},
    {title: 'Non-Parsable String', value: 'bad-string'},
    {title: 'Integer', value: 1},
    {title: 'Float', value: 1.5},
    {title: 'Infinity', value: Infinity, expectedValue: Infinity},
    {title: 'Negative Infinity', value: -Infinity, expectedValue: -Infinity},
  ];
  /**
   * Configuration for field tests with valid values.
   * @type {!Array<!FieldCreationTestCase>}
   */

  var validValueTestCases = [
    {title: '#AAAAAA', value: '#AAAAAA', expectedValue: '#aaaaaa',
      expectedText: '#aaa'},
    {title: '#aaaaaa', value: '#aaaaaa', expectedValue: '#aaaaaa',
      expectedText: '#aaa'},
    {title: '#AAAA00', value: '#AAAA00', expectedValue: '#aaaa00',
      expectedText: '#aa0'},
    {title: '#aaaA00', value: '#aaaA00', expectedValue: '#aaaa00',
      expectedText: '#aa0'},
    {title: '#BCBCBC', value: '#BCBCBC', expectedValue: '#bcbcbc',
      expectedText: '#bcbcbc'},
    {title: '#bcbcbc', value: '#bcbcbc', expectedValue: '#bcbcbc',
      expectedText: '#bcbcbc'},
    {title: '#AA0', value: '#AA0', expectedValue: '#aaaa00',
      expectedText: '#aa0'},
    {title: '#aa0', value: '#aa0', expectedValue: '#aaaa00',
      expectedText: '#aa0'},
    {title: 'rgb(170, 170, 0)', value: 'rgb(170, 170, 0)',
      expectedValue: '#aaaa00', expectedText: '#aa0'},
    {title: 'red', value: 'red', expectedValue: '#ff0000',
      expectedText: '#f00'},
  ];
  var addArgsAndJson = function(testCase) {
    testCase.args = [testCase.value];
    testCase.json = {'colour': testCase.value};
  };
  invalidValueTestCases.forEach(addArgsAndJson);
  validValueTestCases.forEach(addArgsAndJson);

  /**
   * The expected default value for the field being tested.
   * @type {*}
   */
  var defaultFieldValue = Blockly.FieldColour.COLOURS[0];
  /**
   * The expected default text for the field being tested.
   * @type {*}
   */
  var defaultTextValue = (
    function() {
      var expectedText = defaultFieldValue;
      var m = defaultFieldValue.match(/^#(.)\1(.)\2(.)\3$/);
      if (m) {
        expectedText = '#' + m[1] + m[2] + m[3];
      }
      return expectedText;
    })();
  /**
   * Asserts that the field property values are set to default.
   * @param {FieldTemplate} field The field to check.
   */
  var assertFieldDefault = function(field) {
    testHelpers.assertFieldValue(field, defaultFieldValue, defaultTextValue);
  };
  /**
   * Asserts that the field properties are correct based on the test case.
   * @param {!Blockly.FieldAngle} field The field to check.
   * @param {!FieldValueTestCase} testCase The test case.
   */
  var validTestCaseAssertField = function(field, testCase) {
    testHelpers.assertFieldValue(
        field, testCase.expectedValue, testCase.expectedText);
  };

  testHelpers.runConstructorSuiteTests(
      Blockly.FieldColour, validValueTestCases, invalidValueTestCases,
      validTestCaseAssertField, assertFieldDefault);

  testHelpers.runFromJsonSuiteTests(
      Blockly.FieldColour, validValueTestCases,invalidValueTestCases,
      validTestCaseAssertField, assertFieldDefault);
  
  suite('setValue', function() {
    suite('Empty -> New Value', function() {
      setup(function() {
        this.colourField = new Blockly.FieldColour();
      });
      test('Null', function() {
        this.colourField.setValue(null);
        assertFieldDefault(this.colourField);
      });
      test('Undefined', function() {
        this.colourField.setValue(undefined);
        assertFieldDefault(this.colourField);
      });
      test('Non-Parsable String', function() {
        this.colourField.setValue('not_a_colour');
        assertFieldDefault(this.colourField);
      });
      test('#000000', function() {
        this.colourField.setValue('#000000');
        testHelpers.assertFieldValue(this.colourField, '#000000', '#000');
      });
      test('#bcbcbc', function() {
        this.colourField.setValue('#bcbcbc');
        testHelpers.assertFieldValue(this.colourField, '#bcbcbc', '#bcbcbc');
      });
      test('#aa0', function() {
        this.colourField.setValue('#aa0');
        testHelpers.assertFieldValue(this.colourField, '#aaaa00', '#aa0');
      });
      test('rgb(170, 170, 0)', function() {
        this.colourField.setValue('rgb(170, 170, 0)');
        testHelpers.assertFieldValue(this.colourField, '#aaaa00', '#aa0');
      });
      test('red', function() {
        this.colourField.setValue('red');
        testHelpers.assertFieldValue(this.colourField, '#ff0000', '#f00');
      });
      test('With source block', function() {
        this.colourField.setSourceBlock(createTestBlock());
        this.colourField.setValue('#bcbcbc');
        testHelpers.assertFieldValue(this.colourField, '#bcbcbc', '#bcbcbc');
      });
    });
    suite('Value -> New Value', function() {
      setup(function() {
        this.colourField = new Blockly.FieldColour('#aaaaaa');
      });
      test('Null', function() {
        this.colourField.setValue(null);
        testHelpers.assertFieldValue(this.colourField, '#aaaaaa', '#aaa');
      });
      test('Undefined', function() {
        this.colourField.setValue(undefined);
        testHelpers.assertFieldValue(this.colourField, '#aaaaaa', '#aaa');
      });
      test('Non-Parsable String', function() {
        this.colourField.setValue('not_a_colour');
        testHelpers.assertFieldValue(this.colourField, '#aaaaaa', '#aaa');
      });
      test('#000000', function() {
        this.colourField.setValue('#000000');
        testHelpers.assertFieldValue(this.colourField, '#000000', '#000');
      });
      test('#bcbcbc', function() {
        this.colourField.setValue('#bcbcbc');
        testHelpers.assertFieldValue(this.colourField, '#bcbcbc', '#bcbcbc');
      });
      test('#aa0', function() {
        this.colourField.setValue('#aa0');
        testHelpers.assertFieldValue(this.colourField, '#aaaa00', '#aa0');
      });
      test('rgb(170, 170, 0)', function() {
        this.colourField.setValue('rgb(170, 170, 0)');
        testHelpers.assertFieldValue(this.colourField, '#aaaa00', '#aa0');
      });
      test('red', function() {
        this.colourField.setValue('red');
        testHelpers.assertFieldValue(this.colourField, '#ff0000', '#f00');
      });
    });
  });
  suite('Validators', function() {
    setup(function() {
      this.field = new Blockly.FieldColour('#aaaaaa');
    });
    var testSuites = [
      {title: 'Null Validator',
        validator:
            function() {
              return null;
            },
        value: '#000000', expectedValue: '#aaaaaa', expectedText: '#aaa'},
      {title: 'Force Full Red Validator',
        validator:
            function(newValue) {
              return '#ff' + newValue.substr(3, 4);
            },
        value: '#000000', expectedValue: '#ff0000', expectedText: '#f00'},
      {title: 'Returns Undefined Validator', validator: function() {},
        value: '#000000', expectedValue: '#000000', expectedText: '#000'},
    ];
    testSuites.forEach(function(suiteInfo) {
      suite(suiteInfo.title, function() {
        setup(function() {
          this.field.setValidator(suiteInfo.validator);
        });
        test('New Value', function() {
          this.field.setValue(suiteInfo.value);
          testHelpers.assertFieldValue(
              this.field, suiteInfo.expectedValue, suiteInfo.expectedText);
        });
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
