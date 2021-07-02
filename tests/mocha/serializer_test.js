/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */


//import {TestSuite, TestCase, runTestSuites} from '@blockly/dev-tools';

// TODO: Move this into samples as part of the dev-tools package.
/**
 * Constructs a serializer test.
 * @param {string} title The title of this testcase.
 * @param {string} xml The XML to use for the round-trip test.
 * @constructor
 */
function SerializerTestCase(title, xml) {
  this.title = title;
  this.xml = xml;
}
SerializerTestCase.prototype = new testHelpers.TestCase();

/**
 * The XML we want to ensure round-trips through the serializer.
 */
SerializerTestCase.prototype.xml = '';


/**
 * Constructs a serializer test suite.
 * @param {string} title The title of this test suite.
 */
function SerializerTestSuite(title) {
  this.title = title;
}
SerializerTestSuite.prototype = new testHelpers.TestSuite();

var Serializer = new SerializerTestSuite('Serializer');

Serializer.Empty = new SerializerTestCase('Empty',
    '<xml xmlns="https://developers.google.com/blockly/xml"></xml>'
);
Serializer.testCases = [Serializer.Empty];

Serializer.Attributes = new SerializerTestSuite('Attributes');
Serializer.Attributes.Basic = new SerializerTestCase('Basic',
    '<xml xmlns="https://developers.google.com/blockly/xml">' +
    '<block type="logic_negate" id="id" x="42" y="42"></block>' +
    '</xml>');
Serializer.Attributes.IdChars = new SerializerTestCase('IdChars',
    '<xml xmlns="https://developers.google.com/blockly/xml">' +
    '<block type="logic_negate" id="!#$%()*+,-./:;=?@[]^_" x="42" y="42"></block>' +
    '<block type="logic_negate" id="`{|}~ABCDEFGHIJKLMNO" x="42" y="42"></block>' +
    '<block type="logic_negate" id="OPQRSTUVWXYZabcdefgh" x="42" y="42"></block>' +
    '<block type="logic_negate" id="ijklmnopqrstuvwxyz01" x="42" y="42"></block>' +
    '<block type="logic_negate" id="23456789!#$%()*+,-./" x="42" y="42"></block>' +
    '</xml>');
Serializer.Attributes.Collapsed = new SerializerTestCase('Collapsed',
    '<xml xmlns="https://developers.google.com/blockly/xml">' +
    '<block type="logic_negate" id="id" collapsed="true" x="42" y="42"></block>' +
    '</xml>');
Serializer.Attributes.Disabled = new SerializerTestCase('Disabled',
    '<xml xmlns="https://developers.google.com/blockly/xml">' +
    '<block type="logic_negate" id="id" disabled="true" x="42" y="42"></block>' +
    '</xml>');
Serializer.Attributes.Deletable = new SerializerTestCase('Deletable',
    '<xml xmlns="https://developers.google.com/blockly/xml">' +
    '<block type="logic_negate" id="id" deletable="false" x="42" y="42"></block>' +
    '</xml>');
Serializer.Attributes.Movable = new SerializerTestCase('Movable',
    '<xml xmlns="https://developers.google.com/blockly/xml">' +
    '<block type="logic_negate" id="id" movable="false" x="42" y="42"></block>' +
    '</xml>');
Serializer.Attributes.Editable = new SerializerTestCase('Editable',
    '<xml xmlns="https://developers.google.com/blockly/xml">' +
    '<block type="logic_negate" id="id" editable="false" x="42" y="42"></block>' +
    '</xml>');


Serializer.Attributes.Inline = new SerializerTestSuite('Inline');
Serializer.Attributes.Inline.True = new SerializerTestCase('True',
    '<xml xmlns="https://developers.google.com/blockly/xml">' +
    '<block type="logic_negate" id="id" inline="true" x="42" y="42"></block>' +
    '</xml>');
Serializer.Attributes.Inline.False = new SerializerTestCase('False',
    '<xml xmlns="https://developers.google.com/blockly/xml">' +
    '<block type="logic_negate" id="id" inline="false" x="42" y="42"></block>' +
    '</xml>');
Serializer.Attributes.Inline.testCases = [
  Serializer.Attributes.Inline.True,
  Serializer.Attributes.Inline.False,
];

Serializer.Attributes.Coordinates = new SerializerTestSuite('Coordinates');
Serializer.Attributes.Coordinates.Simple = new SerializerTestCase('Simple',
    '<xml xmlns="https://developers.google.com/blockly/xml">' +
    '<block type="logic_negate" id="id" x="42" y="42"></block>' +
    '</xml>');
Serializer.Attributes.Coordinates.Negative = new SerializerTestCase('Negative',
    '<xml xmlns="https://developers.google.com/blockly/xml">' +
    '<block type="logic_negate" id="id" x="-42" y="-42"></block>' +
    '</xml>');
Serializer.Attributes.Coordinates.Zero = new SerializerTestCase('Zero',
    '<xml xmlns="https://developers.google.com/blockly/xml">' +
    '<block type="logic_negate" id="id" x="0" y="0"></block>' +
    '</xml>');
Serializer.Attributes.Coordinates.testCases = [
  Serializer.Attributes.Coordinates.Simple,
  Serializer.Attributes.Coordinates.Negative,
  Serializer.Attributes.Coordinates.Zero,
];

Serializer.Attributes.testCases = [
  Serializer.Attributes.Basic,
  Serializer.Attributes.IdChars,
  Serializer.Attributes.Collapsed,
  Serializer.Attributes.Disabled,
  Serializer.Attributes.Deletable,
  Serializer.Attributes.Movable,
  Serializer.Attributes.Editable,
];
Serializer.Attributes.testSuites = [
  Serializer.Attributes.Inline,
  Serializer.Attributes.Coordinates,
];

Serializer.Fields = new SerializerTestSuite('Fields');

Serializer.Fields.Angle = new SerializerTestSuite('Angle');
Serializer.Fields.Angle.Simple = new SerializerTestCase('Simple',
    '<xml xmlns="https://developers.google.com/blockly/xml">' +
    '<block type="test_fields_angle" id="id" x="42" y="42">' +
    '<field name="FIELDNAME">90</field>' +
    '</block>' +
    '</xml>');
Serializer.Fields.Angle.Negative = new SerializerTestCase(
    'Negative',
    '<xml xmlns="https://developers.google.com/blockly/xml">' +
    '<block type="test_angles_wrap" id="id" x="42" y="42">' +
    '<field name="FIELDNAME">-90</field>' +
    '</block>' +
    '</xml>');
Serializer.Fields.Angle.Decimals = new SerializerTestCase('Decimals',
    '<xml xmlns="https://developers.google.com/blockly/xml">' +
    '<block type="test_fields_angle" id="id" x="42" y="42">' +
    '<field name="FIELDNAME">1.5</field>' +
    '</block>' +
    '</xml>');
Serializer.Fields.Angle.MaxPrecision = new SerializerTestCase(
    'MaxPrecision',
    '<xml xmlns="https://developers.google.com/blockly/xml">' +
    '<block type="test_fields_angle" id="id" x="42" y="42">' +
    '<field name="FIELDNAME">1.000000000000001</field>' +
    '</block>' +
    '</xml>');
Serializer.Fields.Angle.SmallestNumber = new SerializerTestCase(
    'SmallestNumber',
    '<xml xmlns="https://developers.google.com/blockly/xml">' +
    '<block type="test_fields_angle" id="id" x="42" y="42">' +
    '<field name="FIELDNAME">5e-324</field>' +
    '</block>' +
    '</xml>');
Serializer.Fields.Angle.testCases = [
  Serializer.Fields.Angle.Simple,
  Serializer.Fields.Angle.Negative,
  Serializer.Fields.Angle.Decimals,
  Serializer.Fields.Angle.MaxPrecision,
  Serializer.Fields.Angle.SmallestNumber,
];

Serializer.Fields.Checkbox = new SerializerTestSuite('Checkbox');
Serializer.Fields.Checkbox.True = new SerializerTestCase('True',
    '<xml xmlns="https://developers.google.com/blockly/xml">' +
    '<block type="test_fields_checkbox" id="id" x="42" y="42">' +
    '<field name="CHECKBOX">TRUE</field>' +
    '</block>' +
    '</xml>');
Serializer.Fields.Checkbox.False = new SerializerTestCase('False',
    '<xml xmlns="https://developers.google.com/blockly/xml">' +
    '<block type="test_fields_checkbox" id="id" x="42" y="42">' +
    '<field name="CHECKBOX">FALSE</field>' +
    '</block>' +
    '</xml>');
Serializer.Fields.Checkbox.testCases = [
  Serializer.Fields.Checkbox.True,
  Serializer.Fields.Checkbox.False,
];

Serializer.Fields.Colour = new SerializerTestSuite('Colour');
Serializer.Fields.Colour.ThreeChar = new SerializerTestCase('ThreeChar',
    '<xml xmlns="https://developers.google.com/blockly/xml">' +
    '<block type="test_fields_colour" id="id" x="42" y="42">' +
    '<field name="COLOUR">#ffcc00</field>' +  // Could use a 3 char code.
    '</block>' +
    '</xml>');
Serializer.Fields.Colour.SixChar = new SerializerTestCase('SixChar',
    '<xml xmlns="https://developers.google.com/blockly/xml">' +
    '<block type="test_fields_colour" id="id" x="42" y="42">' +
    '<field name="COLOUR">#f1c101</field>' +
    '</block>' +
    '</xml>');
Serializer.Fields.Colour.Black = new SerializerTestCase('Black',
    '<xml xmlns="https://developers.google.com/blockly/xml">' +
    '<block type="test_fields_colour" id="id" x="42" y="42">' +
    '<field name="COLOUR">#000000</field>' +
    '</block>' +
    '</xml>');
Serializer.Fields.Colour.testCases = [
  Serializer.Fields.Colour.ThreeChar,
  Serializer.Fields.Colour.SixChar,
  Serializer.Fields.Colour.Black,
];

Serializer.Fields.LabelSerializable = new SerializerTestSuite(
    'LabelSerializable');
Serializer.Fields.LabelSerializable.Simple = new SerializerTestCase('Simple',
    '<xml xmlns="https://developers.google.com/blockly/xml">' +
    '<block type="test_fields_label_serializable" id="id" x="42" y="42">' +
    '<field name="LABEL">test</field>' +
    '</block>' +
    '</xml>');
Serializer.Fields.LabelSerializable.Symbols = new SerializerTestCase('Symbols',
    '<xml xmlns="https://developers.google.com/blockly/xml">' +
    '<block type="test_fields_label_serializable" id="id" x="42" y="42">' +
    '<field name="LABEL">~`!@#$%^*()_+-={[}]|\\:;,.?/</field>' +
    '</block>' +
    '</xml>');
Serializer.Fields.LabelSerializable.EscapedSymbols = new SerializerTestCase(
    'EscapedSymbols',
    '<xml xmlns="https://developers.google.com/blockly/xml">' +
    '<block type="test_fields_label_serializable" id="id" x="42" y="42">' +
    '<field name="LABEL">&amp;&lt;&gt;</field>' +
    '</block>' +
    '</xml>');
Serializer.Fields.LabelSerializable.SingleQuotes = new SerializerTestCase(
    'SingleQuotes',
    '<xml xmlns="https://developers.google.com/blockly/xml">' +
    '<block type="test_fields_label_serializable" id="id" x="42" y="42">' +
    '<field name="LABEL">\'test\'</field>' +
    '</block>' +
    '</xml>');
Serializer.Fields.LabelSerializable.DoubleQuotes = new SerializerTestCase(
    'DoubleQuotes',
    '<xml xmlns="https://developers.google.com/blockly/xml">' +
    '<block type="test_fields_label_serializable" id="id" x="42" y="42">' +
    '<field name="LABEL">"test"</field>' +
    '</block>' +
    '</xml>');
Serializer.Fields.LabelSerializable.Numbers = new SerializerTestCase(
    'Numbers',
    '<xml xmlns="https://developers.google.com/blockly/xml">' +
    '<block type="test_fields_label_serializable" id="id" x="42" y="42">' +
    '<field name="LABEL">1234567890a123a123a</field>' +
    '</block>' +
    '</xml>');
Serializer.Fields.LabelSerializable.Emoji = new SerializerTestCase(
    'Emoji',
    '<xml xmlns="https://developers.google.com/blockly/xml">' +
    '<block type="test_fields_label_serializable" id="id" x="42" y="42">' +
    '<field name="LABEL">😀👋🏿👋🏾👋🏽👋🏼👋🏻😀❤❤❤</field>' +
    '</block>' +
    '</xml>');
Serializer.Fields.LabelSerializable.Russian = new SerializerTestCase(
    'Russian',
    '<xml xmlns="https://developers.google.com/blockly/xml">' +
    '<block type="test_fields_label_serializable" id="id" x="42" y="42">' +
    '<field name="LABEL">ты любопытный кот</field>' +
    '</block>' +
    '</xml>');
Serializer.Fields.LabelSerializable.Japanese = new SerializerTestCase(
    'Japanese',
    '<xml xmlns="https://developers.google.com/blockly/xml">' +
    '<block type="test_fields_label_serializable" id="id" x="42" y="42">' +
    '<field name="LABEL">あなたは好奇心旺盛な猫です</field>' +
    '</block>' +
    '</xml>');
Serializer.Fields.LabelSerializable.Zalgo = new SerializerTestCase(
    'Zalgo',
    '<xml xmlns="https://developers.google.com/blockly/xml">' +
    '<block type="test_fields_label_serializable" id="id" x="42" y="42">' +
    '<field name="LABEL">z̴̪͈̲̜͕̽̈̀͒͂̓̋̉̍a̸̧̧̜̻̘̤̫̱̲͎̞̻͆̋ļ̸̛̖̜̳͚̖͔̟̈́͂̉̀͑̑͑̎ǵ̸̫̳̽̐̃̑̚̕o̶͇̫͔̮̼̭͕̹̘̬͋̀͆̂̇̋͊̒̽</field>' +
    '</block>' +
    '</xml>');
Serializer.Fields.LabelSerializable.ControlChars = new SerializerTestCase(
    'ControlChars',
    '<xml xmlns="https://developers.google.com/blockly/xml">' +
    '<block type="test_fields_label_serializable" id="id" x="42" y="42">' +
    '<field name="LABEL">&#x01;&#xa1;</field>' +
    '</block>' +
    '</xml>');
Serializer.Fields.LabelSerializable.testCases = [
  Serializer.Fields.LabelSerializable.Simple,
  Serializer.Fields.LabelSerializable.Symbols,
  Serializer.Fields.LabelSerializable.EscapedSymbols,
  Serializer.Fields.LabelSerializable.SingleQuotes,
  Serializer.Fields.LabelSerializable.DoubleQuotes,
  Serializer.Fields.LabelSerializable.Numbers,
  Serializer.Fields.LabelSerializable.Emoji,
  Serializer.Fields.LabelSerializable.Russian,
  Serializer.Fields.LabelSerializable.Japanese,
  Serializer.Fields.LabelSerializable.Zalgo,
  // TODO: Uncoment once #4945 is merged.
  // Serializer.Fields.LabelSerializable.ControlChars,
];

Serializer.Fields.MultilineInput = new SerializerTestSuite('MultilineInput');
Serializer.Fields.MultilineInput.SingleLine = new SerializerTestCase(
    'SingleLine',
    '<xml xmlns="https://developers.google.com/blockly/xml">' +
    '<block type="test_fields_multilinetext" id="id" x="42" y="42">' +
    '<field name="CODE">test</field>' +
    '</block>' +
    '</xml>');
Serializer.Fields.MultilineInput.MultipleLines = new SerializerTestCase(
    'MultipleLines',
    '<xml xmlns="https://developers.google.com/blockly/xml">' +
    '<block type="test_fields_multilinetext" id="id" x="42" y="42">' +
    '<field name="CODE">line1&amp;#10;line2&amp;#10;line3</field>' +
    '</block>' +
    '</xml>');
Serializer.Fields.MultilineInput.Indentation = new SerializerTestCase(
    'Indentation',
    '<xml xmlns="https://developers.google.com/blockly/xml">' +
    '<block type="test_fields_multilinetext" id="id" x="42" y="42">' +
    '<field name="CODE">line1&amp;#10;  line2&amp;#10;  line3</field>' +
    '</block>' +
    '</xml>');
Serializer.Fields.MultilineInput.Tabs = new SerializerTestCase(
    'Tabs',
    '<xml xmlns="https://developers.google.com/blockly/xml">' +
    '<block type="test_fields_multilinetext" id="id" x="42" y="42">' +
    '<field name="CODE">' +
    'line1&amp;#10;	line2&amp;#10;	line3' +
    '</field>' +
    '</block>' +
    '</xml>');
Serializer.Fields.MultilineInput.Symbols = new SerializerTestCase('Symbols',
    '<xml xmlns="https://developers.google.com/blockly/xml">' +
    '<block type="test_fields_multilinetext" id="id" x="42" y="42">' +
    '<field name="CODE">~`!@#$%^*()_+-={[}]|\\:;,.?/</field>' +
    '</block>' +
    '</xml>');
Serializer.Fields.MultilineInput.EscapedSymbols = new SerializerTestCase(
    'EscapedSymbols',
    '<xml xmlns="https://developers.google.com/blockly/xml">' +
    '<block type="test_fields_multilinetext" id="id" x="42" y="42">' +
    '<field name="CODE">&amp;&lt;&gt;</field>' +
    '</block>' +
    '</xml>');
Serializer.Fields.MultilineInput.SingleQuotes = new SerializerTestCase(
    'SingleQuotes',
    '<xml xmlns="https://developers.google.com/blockly/xml">' +
    '<block type="test_fields_multilinetext" id="id" x="42" y="42">' +
    '<field name="CODE">\'test\'</field>' +
    '</block>' +
    '</xml>');
Serializer.Fields.MultilineInput.DoubleQuotes = new SerializerTestCase(
    'DoubleQuotes',
    '<xml xmlns="https://developers.google.com/blockly/xml">' +
    '<block type="test_fields_multilinetext" id="id" x="42" y="42">' +
    '<field name="CODE">"test"</field>' +
    '</block>' +
    '</xml>');
Serializer.Fields.MultilineInput.Numbers = new SerializerTestCase(
    'Numbers',
    '<xml xmlns="https://developers.google.com/blockly/xml">' +
    '<block type="test_fields_multilinetext" id="id" x="42" y="42">' +
    '<field name="CODE">1234567890a123a123a</field>' +
    '</block>' +
    '</xml>');
Serializer.Fields.MultilineInput.Emoji = new SerializerTestCase(
    'Emoji',
    '<xml xmlns="https://developers.google.com/blockly/xml">' +
    '<block type="test_fields_multilinetext" id="id" x="42" y="42">' +
    '<field name="CODE">😀👋🏿👋🏾👋🏽👋🏼👋🏻😀❤❤❤</field>' +
    '</block>' +
    '</xml>');
Serializer.Fields.MultilineInput.Russian = new SerializerTestCase(
    'Russian',
    '<xml xmlns="https://developers.google.com/blockly/xml">' +
    '<block type="test_fields_multilinetext" id="id" x="42" y="42">' +
    '<field name="CODE">ты любопытный кот</field>' +
    '</block>' +
    '</xml>');
Serializer.Fields.MultilineInput.Japanese = new SerializerTestCase(
    'Japanese',
    '<xml xmlns="https://developers.google.com/blockly/xml">' +
    '<block type="test_fields_multilinetext" id="id" x="42" y="42">' +
    '<field name="CODE">あなたは好奇心旺盛な猫です</field>' +
    '</block>' +
    '</xml>');
Serializer.Fields.MultilineInput.Zalgo = new SerializerTestCase(
    'Zalgo',
    '<xml xmlns="https://developers.google.com/blockly/xml">' +
    '<block type="test_fields_multilinetext" id="id" x="42" y="42">' +
    '<field name="CODE">z̴̪͈̲̜͕̽̈̀͒͂̓̋̉̍a̸̧̧̜̻̘̤̫̱̲͎̞̻͆̋ļ̸̛̖̜̳͚̖͔̟̈́͂̉̀͑̑͑̎ǵ̸̫̳̽̐̃̑̚̕o̶͇̫͔̮̼̭͕̹̘̬͋̀͆̂̇̋͊̒̽</field>' +
    '</block>' +
    '</xml>');
Serializer.Fields.MultilineInput.ControlChars = new SerializerTestCase(
    'ControlChars',
    '<xml xmlns="https://developers.google.com/blockly/xml">' +
    '<block type="test_fields_multilinetext" id="id" x="42" y="42">' +
    '<field name="CODE">&#x01;&#xa1;</field>' +
    '</block>' +
    '</xml>');
Serializer.Fields.MultilineInput.testCases = [
  Serializer.Fields.MultilineInput.SingleLine,
  Serializer.Fields.MultilineInput.MultipleLines,
  Serializer.Fields.MultilineInput.Indentation,
  Serializer.Fields.MultilineInput.Tabs,
  Serializer.Fields.MultilineInput.Symbols,
  Serializer.Fields.MultilineInput.EscapedSymbols,
  Serializer.Fields.MultilineInput.SingleQuotes,
  Serializer.Fields.MultilineInput.DoubleQuotes,
  Serializer.Fields.MultilineInput.Numbers,
  Serializer.Fields.MultilineInput.Emoji,
  Serializer.Fields.MultilineInput.Russian,
  Serializer.Fields.MultilineInput.Japanese,
  Serializer.Fields.MultilineInput.Zalgo,
  // TODO: Uncoment once #4945 is merged.
  // Serializer.Fields.MultilineInput.ControlChars,
];

Serializer.Fields.Number = new SerializerTestSuite('Number');
Serializer.Fields.Number.Simple = new SerializerTestCase('Simple',
    '<xml xmlns="https://developers.google.com/blockly/xml">' +
    '<block type="test_numbers_float" id="id" x="42" y="42">' +
    '<field name="NUM">123</field>' +
    '</block>' +
    '</xml>');
Serializer.Fields.Number.Negative = new SerializerTestCase('Negative',
    '<xml xmlns="https://developers.google.com/blockly/xml">' +
    '<block type="test_numbers_float" id="id" x="42" y="42">' +
    '<field name="NUM">-123</field>' +
    '</block>' +
    '</xml>');
Serializer.Fields.Number.PosInfinity = new SerializerTestCase('PosInfinity',
    '<xml xmlns="https://developers.google.com/blockly/xml">' +
    '<block type="test_numbers_float" id="id" x="42" y="42">' +
    '<field name="NUM">Infinity</field>' +
    '</block>' +
    '</xml>');
Serializer.Fields.Number.NegInfinity = new SerializerTestCase('NegInfinity',
    '<xml xmlns="https://developers.google.com/blockly/xml">' +
    '<block type="test_numbers_float" id="id" x="42" y="42">' +
    '<field name="NUM">-Infinity</field>' +
    '</block>' +
    '</xml>');
Serializer.Fields.Number.Decimals = new SerializerTestCase('Decimals',
    '<xml xmlns="https://developers.google.com/blockly/xml">' +
    '<block type="test_numbers_float" id="id" x="42" y="42">' +
    '<field name="NUM">1.5</field>' +
    '</block>' +
    '</xml>');
Serializer.Fields.Number.Smallest = new SerializerTestCase('Smallest',
    '<xml xmlns="https://developers.google.com/blockly/xml">' +
    '<block type="test_numbers_float" id="id" x="42" y="42">' +
    '<field name="NUM">5e-324</field>' +
    '</block>' +
    '</xml>');
Serializer.Fields.Number.Largest = new SerializerTestCase('Largest',
    '<xml xmlns="https://developers.google.com/blockly/xml">' +
    '<block type="test_numbers_float" id="id" x="42" y="42">' +
    '<field name="NUM">1.7976931348623157e+308</field>' +
    '</block>' +
    '</xml>');
Serializer.Fields.Number.MaxPrecisionSmall = new SerializerTestCase(
    'MaxPrecisionSmall',
    '<xml xmlns="https://developers.google.com/blockly/xml">' +
    '<block type="test_numbers_float" id="id" x="42" y="42">' +
    '<field name="NUM">1.000000000000001</field>' +
    '</block>' +
    '</xml>');
Serializer.Fields.Number.MaxPrecisionLarge = new SerializerTestCase(
    'MaxPrecisionLarge',
    '<xml xmlns="https://developers.google.com/blockly/xml">' +
    '<block type="test_numbers_float" id="id" x="42" y="42">' +
    '<field name="NUM">1000000000000001</field>' +
    '</block>' +
    '</xml>');
Serializer.Fields.Number.testCases = [
  Serializer.Fields.Number.Simple,
  Serializer.Fields.Number.Negative,
  Serializer.Fields.Number.PosInfinity,
  Serializer.Fields.Number.NegInfinity,
  Serializer.Fields.Number.Decimals,
  Serializer.Fields.Number.Smallest,
  Serializer.Fields.Number.Largest,
  Serializer.Fields.Number.MaxPrecisionSmall,
  Serializer.Fields.Number.MaxPrecisionLarge,
];

Serializer.Fields.TextInput = new SerializerTestSuite('TextInput');
Serializer.Fields.TextInput.Simple = new SerializerTestCase('Simple',
    '<xml xmlns="https://developers.google.com/blockly/xml">' +
    '<block type="test_fields_text_input" id="id" x="42" y="42">' +
    '<field name="TEXT_INPUT">test</field>' +
    '</block>' +
    '</xml>');
Serializer.Fields.TextInput.Tabs = new SerializerTestCase('Tabs',
    '<xml xmlns="https://developers.google.com/blockly/xml">' +
    '<block type="test_fields_text_input" id="id" x="42" y="42">' +
    '<field name="TEXT_INPUT">line1	line2	line3</field>' +
    '</block>' +
    '</xml>');
Serializer.Fields.TextInput.Tabs = new SerializerTestCase('Tabs',
    '<xml xmlns="https://developers.google.com/blockly/xml">' +
    '<block type="test_fields_text_input" id="id" x="42" y="42">' +
    '<field name="TEXT_INPUT">line1	line2	line3</field>' +
    '</block>' +
    '</xml>');
Serializer.Fields.TextInput.Symbols = new SerializerTestCase('Symbols',
    '<xml xmlns="https://developers.google.com/blockly/xml">' +
    '<block type="test_fields_text_input" id="id" x="42" y="42">' +
    '<field name="TEXT_INPUT">~`!@#$%^*()_+-={[}]|\\:;,.?/</field>' +
    '</block>' +
    '</xml>');
Serializer.Fields.TextInput.EscapedSymbols = new SerializerTestCase(
    'EscapedSymbols',
    '<xml xmlns="https://developers.google.com/blockly/xml">' +
    '<block type="test_fields_text_input" id="id" x="42" y="42">' +
    '<field name="TEXT_INPUT">&amp;&lt;&gt;</field>' +
    '</block>' +
    '</xml>');
Serializer.Fields.TextInput.SingleQuotes = new SerializerTestCase(
    'SingleQuotes',
    '<xml xmlns="https://developers.google.com/blockly/xml">' +
    '<block type="test_fields_text_input" id="id" x="42" y="42">' +
    '<field name="TEXT_INPUT">\'test\'</field>' +
    '</block>' +
    '</xml>');
Serializer.Fields.TextInput.DoubleQuotes = new SerializerTestCase(
    'DoubleQuotes',
    '<xml xmlns="https://developers.google.com/blockly/xml">' +
    '<block type="test_fields_text_input" id="id" x="42" y="42">' +
    '<field name="TEXT_INPUT">"test"</field>' +
    '</block>' +
    '</xml>');
Serializer.Fields.TextInput.Numbers = new SerializerTestCase(
    'Numbers',
    '<xml xmlns="https://developers.google.com/blockly/xml">' +
    '<block type="test_fields_text_input" id="id" x="42" y="42">' +
    '<field name="TEXT_INPUT">1234567890a123a123a</field>' +
    '</block>' +
    '</xml>');
Serializer.Fields.TextInput.Emoji = new SerializerTestCase(
    'Emoji',
    '<xml xmlns="https://developers.google.com/blockly/xml">' +
    '<block type="test_fields_text_input" id="id" x="42" y="42">' +
    '<field name="TEXT_INPUT">😀👋🏿👋🏾👋🏽👋🏼👋🏻😀❤❤❤</field>' +
    '</block>' +
    '</xml>');
Serializer.Fields.TextInput.Russian = new SerializerTestCase(
    'Russian',
    '<xml xmlns="https://developers.google.com/blockly/xml">' +
    '<block type="test_fields_text_input" id="id" x="42" y="42">' +
    '<field name="TEXT_INPUT">ты любопытный кот</field>' +
    '</block>' +
    '</xml>');
Serializer.Fields.TextInput.Japanese = new SerializerTestCase(
    'Japanese',
    '<xml xmlns="https://developers.google.com/blockly/xml">' +
    '<block type="test_fields_text_input" id="id" x="42" y="42">' +
    '<field name="TEXT_INPUT">あなたは好奇心旺盛な猫です</field>' +
    '</block>' +
    '</xml>');
Serializer.Fields.TextInput.Zalgo = new SerializerTestCase(
    'Zalgo',
    '<xml xmlns="https://developers.google.com/blockly/xml">' +
    '<block type="test_fields_text_input" id="id" x="42" y="42">' +
    '<field name="TEXT_INPUT">z̴̪͈̲̜͕̽̈̀͒͂̓̋̉̍a̸̧̧̜̻̘̤̫̱̲͎̞̻͆̋ļ̸̛̖̜̳͚̖͔̟̈́͂̉̀͑̑͑̎ǵ̸̫̳̽̐̃̑̚̕o̶͇̫͔̮̼̭͕̹̘̬͋̀͆̂̇̋͊̒̽</field>' +
    '</block>' +
    '</xml>');
Serializer.Fields.TextInput.ControlChars = new SerializerTestCase(
    'ControlChars',
    '<xml xmlns="https://developers.google.com/blockly/xml">' +
    '<block type="test_fields_text_input" id="id" x="42" y="42">' +
    '<field name="TEXT_INPUT">&#x01;&#xa1;</field>' +
    '</block>' +
    '</xml>');
Serializer.Fields.TextInput.testCases = [
  Serializer.Fields.TextInput.Simple,
  Serializer.Fields.TextInput.Tabs,
  Serializer.Fields.TextInput.Symbols,
  Serializer.Fields.TextInput.EscapedSymbols,
  Serializer.Fields.TextInput.SingleQuotes,
  Serializer.Fields.TextInput.DoubleQuotes,
  Serializer.Fields.TextInput.Numbers,
  Serializer.Fields.TextInput.Emoji,
  Serializer.Fields.TextInput.Russian,
  Serializer.Fields.TextInput.Japanese,
  Serializer.Fields.TextInput.Zalgo,
  // TODO: Uncoment once #4945 is merged.
  // Serializer.Fields.TextInput.ControlChars,
];

Serializer.Fields.testSuites = [
  Serializer.Fields.Angle,
  Serializer.Fields.Checkbox,
  Serializer.Fields.Colour,
  Serializer.Fields.LabelSerializable,
  Serializer.Fields.MultilineInput,
  Serializer.Fields.Number,
  Serializer.Fields.TextInput,
];

Serializer.Icons = new SerializerTestSuite('Icons');

Serializer.Icons.Comment = new SerializerTestSuite('Comment');
Serializer.Icons.Comment.Basic = new SerializerTestCase('Basic',
    '<xml xmlns="https://developers.google.com/blockly/xml">' +
    '<block type="logic_negate" id="id" x="42" y="42">' +
    '<comment pinned="false" h="80" w="160">test</comment>' +
    '</block>' +
    '</xml>');

Serializer.Icons.Comment.Size = new SerializerTestSuite('Size');
Serializer.Icons.Comment.Size.Different = new SerializerTestCase('Different',
    '<xml xmlns="https://developers.google.com/blockly/xml">' +
    '<block type="logic_negate" id="id" x="42" y="42">' +
    '<comment pinned="false" h="160" w="80">test</comment>' +
    '</block>' +
    '</xml>');
Serializer.Icons.Comment.Size.Large = new SerializerTestCase('Large',
    '<xml xmlns="https://developers.google.com/blockly/xml">' +
    '<block type="logic_negate" id="id" x="42" y="42">' +
    '<comment pinned="false" h="10000" w="10000">test</comment>' +
    '</block>' +
    '</xml>');
Serializer.Icons.Comment.Size.testCases = [
  Serializer.Icons.Comment.Size.Different,
  Serializer.Icons.Comment.Size.Large,
];

Serializer.Icons.Comment.Pinned = new SerializerTestSuite('Pinned');
Serializer.Icons.Comment.Pinned.True = new SerializerTestCase('True',
    '<xml xmlns="https://developers.google.com/blockly/xml">' +
    '<block type="logic_negate" id="id" x="42" y="42">' +
    '<comment pinned="true" h="80" w="160">test</comment>' +
    '</block>' +
    '</xml>');
Serializer.Icons.Comment.Pinned.False = new SerializerTestCase('False',
    '<xml xmlns="https://developers.google.com/blockly/xml">' +
    '<block type="logic_negate" id="id" x="42" y="42">' +
    '<comment pinned="false" h="80" w="160">test</comment>' +
    '</block>' +
    '</xml>');
Serializer.Icons.Comment.Pinned.testCases = [
  Serializer.Icons.Comment.Pinned.True,
  Serializer.Icons.Comment.Pinned.False,
];

Serializer.Icons.Comment.Text = new SerializerTestSuite('Text');
Serializer.Icons.Comment.Text.Symbols = new SerializerTestCase('Symbols',
    '<xml xmlns="https://developers.google.com/blockly/xml">' +
    '<block type="logic_negate" id="id" x="42" y="42">' +
    '<comment pinned="false" h="80" w="160">~`!@#$%^*()_+-={[}]|\\:;,.?/</comment>' +
    '</block>' +
    '</xml>');
Serializer.Icons.Comment.Text.EscapedSymbols = new SerializerTestCase(
    'EscapedSymbols',
    '<xml xmlns="https://developers.google.com/blockly/xml">' +
    '<block type="logic_negate" id="id" x="42" y="42">' +
    '<comment pinned="false" h="80" w="160">&amp;&lt;&gt;</comment>' +
    '</block>' +
    '</xml>');
Serializer.Icons.Comment.Text.SingleQuotes = new SerializerTestCase(
    'SingleQuotes',
    '<xml xmlns="https://developers.google.com/blockly/xml">' +
    '<block type="logic_negate" id="id" x="42" y="42">' +
    '<comment pinned="false" h="80" w="160">\'test\'</comment>' +
    '</block>' +
    '</xml>');
Serializer.Icons.Comment.Text.DoubleQuotes = new SerializerTestCase(
    'DoubleQuotes',
    '<xml xmlns="https://developers.google.com/blockly/xml">' +
    '<block type="logic_negate" id="id" x="42" y="42">' +
    '<comment pinned="false" h="80" w="160">"test"</comment>' +
    '</block>' +
    '</xml>');
Serializer.Icons.Comment.Text.Numbers = new SerializerTestCase(
    'Numbers',
    '<xml xmlns="https://developers.google.com/blockly/xml">' +
    '<block type="logic_negate" id="id" x="42" y="42">' +
    '<comment pinned="false" h="80" w="160">1234567890a123a123a</comment>' +
    '</block>' +
    '</xml>');
Serializer.Icons.Comment.Text.Emoji = new SerializerTestCase(
    'Emoji',
    '<xml xmlns="https://developers.google.com/blockly/xml">' +
    '<block type="logic_negate" id="id" x="42" y="42">' +
    '<comment pinned="false" h="80" w="160">😀👋🏿👋🏾👋🏽👋🏼👋🏻😀❤❤❤</comment>' +
    '</block>' +
    '</xml>');
Serializer.Icons.Comment.Text.Russian = new SerializerTestCase(
    'Russian',
    '<xml xmlns="https://developers.google.com/blockly/xml">' +
    '<block type="logic_negate" id="id" x="42" y="42">' +
    '<comment pinned="false" h="80" w="160">ты любопытный кот</comment>' +
    '</block>' +
    '</xml>');
Serializer.Icons.Comment.Text.Japanese = new SerializerTestCase(
    'Japanese',
    '<xml xmlns="https://developers.google.com/blockly/xml">' +
    '<block type="logic_negate" id="id" x="42" y="42">' +
    '<comment pinned="false" h="80" w="160">あなたは好奇心旺盛な猫です</comment>' +
    '</block>' +
    '</xml>');
Serializer.Icons.Comment.Text.Zalgo = new SerializerTestCase(
    'Zalgo',
    '<xml xmlns="https://developers.google.com/blockly/xml">' +
    '<block type="logic_negate" id="id" x="42" y="42">' +
    '<comment pinned="false" h="80" w="160">z̴̪͈̲̜͕̽̈̀͒͂̓̋̉̍a̸̧̧̜̻̘̤̫̱̲͎̞̻͆̋ļ̸̛̖̜̳͚̖͔̟̈́͂̉̀͑̑͑̎ǵ̸̫̳̽̐̃̑̚̕o̶͇̫͔̮̼̭͕̹̘̬͋̀͆̂̇̋͊̒̽</comment>' +
    '</block>' +
    '</xml>');
Serializer.Icons.Comment.Text.ControlChars = new SerializerTestCase(
    'ControlChars',
    '<xml xmlns="https://developers.google.com/blockly/xml">' +
    '<block type="logic_negate" id="id" x="42" y="42">' +
    '<comment pinned="false" h="80" w="160">&#x01;&#xa1;</comment>' +
    '</block>' +
    '</xml>');
Serializer.Icons.Comment.Text.testCases = [
  Serializer.Icons.Comment.Text.Symbols,
  Serializer.Icons.Comment.Text.EscapedSymbols,
  Serializer.Icons.Comment.Text.SingleQuotes,
  Serializer.Icons.Comment.Text.DoubleQuotes,
  Serializer.Icons.Comment.Text.Numbers,
  Serializer.Icons.Comment.Text.Emoji,
  Serializer.Icons.Comment.Text.Russian,
  Serializer.Icons.Comment.Text.Japanese,
  Serializer.Icons.Comment.Text.Zalgo,
  // TODO: Uncoment once #4945 is merged.
  // Serializer.Icons.Comment.Text.ControlChars,
];

Serializer.Icons.Comment.testSuites = [
  Serializer.Icons.Comment.Size,
  Serializer.Icons.Comment.Pinned,
  Serializer.Icons.Comment.Text,
];

Serializer.Icons.Comment.testCases = [
  Serializer.Icons.Comment.Basic,
];

Serializer.Icons.testSuites = [Serializer.Icons.Comment];

Serializer.Connections = new SerializerTestSuite('Connections');

Serializer.Connections.Child = new SerializerTestSuite('Child');
Serializer.Connections.Child.Value = new SerializerTestCase('Value',
    '<xml xmlns="https://developers.google.com/blockly/xml">' +
    '<block type="logic_negate" id="id" x="42" y="42">' +
    '<value name="BOOL">' +
    '<block type="logic_boolean" id="id2">' +
    '<field name="BOOL">TRUE</field>' +
    '</block>' +
    '</value>' +
    '</block>' +
    '</xml>');
Serializer.Connections.Child.Statement = new SerializerTestCase('Statement',
    '<xml xmlns="https://developers.google.com/blockly/xml">' +
    '<block type="controls_repeat_ext" id="id" x="42" y="42">' +
    '<statement name="DO">' +
    '<block type="text_print" id="id2"></block>' +
    '</statement>' +
    '</block>' +
    '</xml>');
Serializer.Connections.Child.Next = new SerializerTestCase('Next',
    '<xml xmlns="https://developers.google.com/blockly/xml">' +
    '<block type="text_print" id="id" x="42" y="42">' +
    '<next>' +
    '<block type="text_print" id="id2"></block>' +
    '</next>' +
    '</block>' +
    '</xml>');
Serializer.Connections.Child.Row = new SerializerTestCase('Row',
    '<xml xmlns="https://developers.google.com/blockly/xml">' +
    '<block type="logic_negate" id="id" x="42" y="42">' +
    '<value name="BOOL">' +
    '<block type="logic_negate" id="id2">' +
    '<value name="BOOL">' +
    '<block type="logic_boolean" id="id3">' +
    '<field name="BOOL">TRUE</field>' +
    '</block>' +
    '</value>' +
    '</block>' +
    '</value>' +
    '</block>' +
    '</xml>');
Serializer.Connections.Child.Nested = new SerializerTestCase('Nested',
    '<xml xmlns="https://developers.google.com/blockly/xml">' +
    '<block type="controls_repeat_ext" id="id" x="42" y="42">' +
    '<statement name="DO">' +
    '<block type="controls_repeat_ext" id="id2">' +
    '<statement name="DO">' +
    '<block type="text_print" id="id3"></block>' +
    '</statement>' +
    '</block>' +
    '</statement>' +
    '</block>' +
    '</xml>');
Serializer.Connections.Child.Stack = new SerializerTestCase('Stack',
    '<xml xmlns="https://developers.google.com/blockly/xml">' +
    '<block type="text_print" id="id" x="42" y="42">' +
    '<next>' +
    '<block type="text_print" id="id2">' +
    '<next>' +
    '<block type="text_print" id="id3"></block>' +
    '</next>' +
    '</block>' +
    '</next>' +
    '</block>' +
    '</xml>');
Serializer.Connections.Child.testCases = [
  Serializer.Connections.Child.Value,
  Serializer.Connections.Child.Statement,
  Serializer.Connections.Child.Next,
  Serializer.Connections.Child.Row,
  Serializer.Connections.Child.Nested,
  Serializer.Connections.Child.Stack,
];

Serializer.Connections.Shadow = new SerializerTestSuite('Shadow');
Serializer.Connections.Shadow.Value = new SerializerTestCase('Value',
    '<xml xmlns="https://developers.google.com/blockly/xml">' +
    '<block type="logic_negate" id="id" x="42" y="42">' +
    '<value name="BOOL">' +
    '<shadow type="logic_boolean" id="id2">' +
    '<field name="BOOL">TRUE</field>' +
    '</shadow>' +
    '</value>' +
    '</block>' +
    '</xml>');
Serializer.Connections.Shadow.Statement = new SerializerTestCase('Statement',
    '<xml xmlns="https://developers.google.com/blockly/xml">' +
    '<block type="controls_repeat_ext" id="id" x="42" y="42">' +
    '<statement name="DO">' +
    '<shadow type="text_print" id="id2"></shadow>' +
    '</statement>' +
    '</block>' +
    '</xml>');
Serializer.Connections.Shadow.Next = new SerializerTestCase('Next',
    '<xml xmlns="https://developers.google.com/blockly/xml">' +
    '<block type="text_print" id="id" x="42" y="42">' +
    '<next>' +
    '<shadow type="text_print" id="id2"></shadow>' +
    '</next>' +
    '</block>' +
    '</xml>');
Serializer.Connections.Shadow.Row = new SerializerTestCase('Row',
    '<xml xmlns="https://developers.google.com/blockly/xml">' +
    '<block type="logic_negate" id="id" x="42" y="42">' +
    '<value name="BOOL">' +
    '<shadow type="logic_negate" id="id2">' +
    '<value name="BOOL">' +
    '<shadow type="logic_boolean" id="id3">' +
    '<field name="BOOL">TRUE</field>' +
    '</shadow>' +
    '</value>' +
    '</shadow>' +
    '</value>' +
    '</block>' +
    '</xml>');
Serializer.Connections.Shadow.Nested = new SerializerTestCase('Nested',
    '<xml xmlns="https://developers.google.com/blockly/xml">' +
    '<block type="controls_repeat_ext" id="id" x="42" y="42">' +
    '<statement name="DO">' +
    '<shadow type="controls_repeat_ext" id="id2">' +
    '<statement name="DO">' +
    '<shadow type="text_print" id="id3"></shadow>' +
    '</statement>' +
    '</shadow>' +
    '</statement>' +
    '</block>' +
    '</xml>');
Serializer.Connections.Shadow.Stack = new SerializerTestCase('Stack',
    '<xml xmlns="https://developers.google.com/blockly/xml">' +
    '<block type="text_print" id="id" x="42" y="42">' +
    '<next>' +
    '<shadow type="text_print" id="id2">' +
    '<next>' +
    '<shadow type="text_print" id="id3"></shadow>' +
    '</next>' +
    '</shadow>' +
    '</next>' +
    '</block>' +
    '</xml>');
Serializer.Connections.Shadow.testCases = [
  Serializer.Connections.Shadow.Value,
  Serializer.Connections.Shadow.Statement,
  Serializer.Connections.Shadow.Next,
  Serializer.Connections.Shadow.Row,
  Serializer.Connections.Shadow.Nested,
  Serializer.Connections.Shadow.Stack,
];

Serializer.Connections.OverwrittenShadow =
    new SerializerTestSuite('OverwrittenShadow');
Serializer.Connections.OverwrittenShadow.Value = new SerializerTestCase(
    'Value',
    '<xml xmlns="https://developers.google.com/blockly/xml">' +
    '<block type="logic_negate" id="id" x="42" y="42">' +
    '<value name="BOOL">' +
    '<shadow type="logic_boolean" id="id2">' +
    '<field name="BOOL">TRUE</field>' +
    '</shadow>' +
    '<block type="logic_boolean" id="id2">' +
    '<field name="BOOL">TRUE</field>' +
    '</block>' +
    '</value>' +
    '</block>' +
    '</xml>');
Serializer.Connections.OverwrittenShadow.Statement = new SerializerTestCase(
    'Statement',
    '<xml xmlns="https://developers.google.com/blockly/xml">' +
    '<block type="controls_repeat_ext" id="id" x="42" y="42">' +
    '<statement name="DO">' +
    '<shadow type="text_print" id="id2"></shadow>' +
    '<block type="text_print" id="id2"></block>' +
    '</statement>' +
    '</block>' +
    '</xml>');
Serializer.Connections.OverwrittenShadow.Next = new SerializerTestCase('Next',
    '<xml xmlns="https://developers.google.com/blockly/xml">' +
    '<block type="text_print" id="id" x="42" y="42">' +
    '<next>' +
    '<block type="text_print" id="id2"></block>' +
    '<shadow type="text_print" id="id2"></shadow>' +
    '</next>' +
    '</block>' +
    '</xml>');
Serializer.Connections.OverwrittenShadow.Row = new SerializerTestCase('Row',
    '<xml xmlns="https://developers.google.com/blockly/xml">' +
    '<block type="logic_negate" id="id" x="42" y="42">' +
    '<value name="BOOL">' +
    '<shadow type="logic_negate" id="id2">' +
    '<value name="BOOL">' +
    '<shadow type="logic_boolean" id="id3">' +
    '<field name="BOOL">TRUE</field>' +
    '</shadow>' +
    '</value>' +
    '</shadow>' +
    '<block type="logic_boolean" id="id3">' +
    '<field name="BOOL">TRUE</field>' +
    '</block>' +
    '</value>' +
    '</block>' +
    '</xml>');
Serializer.Connections.OverwrittenShadow.Nested = new SerializerTestCase(
    'Nested',
    '<xml xmlns="https://developers.google.com/blockly/xml">' +
    '<block type="controls_repeat_ext" id="id" x="42" y="42">' +
    '<statement name="DO">' +
    '<shadow type="controls_repeat_ext" id="id2">' +
    '<statement name="DO">' +
    '<shadow type="text_print" id="id3"></shadow>' +
    '</statement>' +
    '</shadow>' +
    '<block type="text_print" id="id3"></block>' +
    '</statement>' +
    '</block>' +
    '</xml>');
Serializer.Connections.OverwrittenShadow.Stack = new SerializerTestCase('Stack',
    '<xml xmlns="https://developers.google.com/blockly/xml">' +
    '<block type="text_print" id="id" x="42" y="42">' +
    '<next>' +
    '<block type="text_print" id="id3"></block>' +
    '<shadow type="text_print" id="id2">' +
    '<next>' +
    '<shadow type="text_print" id="id3"></shadow>' +
    '</next>' +
    '</shadow>' +
    '</next>' +
    '</block>' +
    '</xml>');
Serializer.Connections.OverwrittenShadow.testCases = [
  Serializer.Connections.OverwrittenShadow.Value,
  Serializer.Connections.OverwrittenShadow.Statement,
  Serializer.Connections.OverwrittenShadow.Next,
  Serializer.Connections.OverwrittenShadow.Row,
  Serializer.Connections.OverwrittenShadow.Nested,
  Serializer.Connections.OverwrittenShadow.Stack,
];

Serializer

Serializer.Connections.testSuites = [
  Serializer.Connections.Child,
  Serializer.Connections.Shadow,
  Serializer.Connections.OverwrittenShadow,
];

Serializer.testSuites = [
  Serializer.Attributes,
  Serializer.Fields,
  Serializer.Icons,
  Serializer.Connections,
];

var runSerializerTestSuite = (serializer, deserializer, testSuite) => {

  const createTestFunction = function(test) {
    return function() {
      Blockly.Xml.domToWorkspace(
          Blockly.Xml.textToDom(test.xml), this.workspace);
      if (serializer && deserializer) {
        // do custom serialization and deserialization.
      }
      var newXml = Blockly.Xml.workspaceToDom(this.workspace);
      chai.assert.equal(Blockly.Xml.domToText(newXml), test.xml);
    };
  };

  const createSuiteOrTestFunction = function(suiteOrTest) {
    if (suiteOrTest instanceof testHelpers.TestSuite) {
      return createSuiteOrTestFunction;
    }
    return createTestFunction(suiteOrTest);
  };

  // TODO: Fix after this method is being exported.
  // testHelpers.runTestSuites([testSuite], createTestFunction);
  var runTests = function(suite) {
    if (suite.testSuites && suite.testSuites.length) {
      suite.testSuites.forEach(runTests);
    }
    if (suite.testCases && suite.testCases.length) {
      testHelpers.runTestCases(suite.testCases, createTestFunction);
    }
  };

  suite(testSuite.title, function() {
    setup(function() {
      this.workspace = new Blockly.Workspace();
    });

    teardown(function() {
      this.workspace.dispose();
    });

    runTests(testSuite);
  });
};

runSerializerTestSuite(null, null, Serializer);
